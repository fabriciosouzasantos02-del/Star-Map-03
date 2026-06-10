import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { performAstroCalculation } from './src/components/astroMath';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gen AI
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (err) {
    console.error("Error initializing Gemini API Client:", err);
  }
} else {
  console.log("Gemini API Key missing or default. App will run in detailed template fallback mode.");
}

// Global variable models
const CHAT_MODEL = "gemini-3.5-flash";

// Global rate-limiting safety tracker
let geminiThrottledUntil = 0;
let activeGeminiPromise: Promise<any> = Promise.resolve();

// Global in-memory cache for Gemini queries to minimize quota exhaustion and serve fast, deterministic results
interface CacheEntry {
  response: any;
  timestamp: number;
}
const geminiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24-hour TTL

function getCachedResponse(key: string): any | null {
  const entry = geminiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    geminiCache.delete(key);
    return null;
  }
  console.log(`[Cache] Serving cached response for: ${key}`);
  return entry.response;
}

function setCachedResponse(key: string, response: any): void {
  geminiCache.set(key, {
    response,
    timestamp: Date.now()
  });
}

// Resilient helper to execute content generation with model fallbacks and retries
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
  retries?: number;
}) {
  if (!aiClient) {
    throw new Error("Cliente APIs Gemini não inicializado.");
  }

  const executeCall = async () => {
    // Add a small staggered delay for concurrent requests
    await new Promise((resolve) => setTimeout(resolve, Math.random() * 250 + 150));

    // If we are currently inside the rate-limiting cooldown, return immediately to use deterministic fallbacks
    if (Date.now() < geminiThrottledUntil) {
      throw new Error("Gemini API está em modo de segurança temporário (cooldown de cota excedida). Servindo fallback offline.");
    }

    // Fallbacks: primary is 3.5-flash, fallback is 3.1-flash-lite, third is 2.5-flash-image
    const modelsToTry = [
      CHAT_MODEL,
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash-image"
    ];

    let lastError: any = null;

    for (const modelName of modelsToTry) {
      let attempts = params.retries || 3;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`[Gemini] Tentando gerar conteúdo usando o modelo: ${modelName} (Tentativa ${attempt}/${attempts})...`);
          const response = await aiClient.models.generateContent({
            model: modelName,
            contents: params.contents,
            config: params.config,
          });
          console.log(`[Gemini] Sucesso absoluto usando o modelo ${modelName}.`);
          return response;
        } catch (err: any) {
          lastError = err;
          const errStr = err?.message || String(err);
          const isQuotaExceeded = errStr.includes("RESOURCE_EXHAUSTED") || 
                                  errStr.includes("429") || 
                                  errStr.includes("quota") || 
                                  errStr.includes("Quota");

          console.warn(`[Gemini] Tentativa ${attempt} com o modelo ${modelName} falhou: ${errStr}`);

          if (isQuotaExceeded) {
            // Apply exponential backoff with jitter on 429
            const delay = attempt * 1500 + Math.random() * 500;
            console.log(`[Gemini] Limite de cota atingido (RESOURCE_EXHAUSTED) no modelo ${modelName}. Aguardando ${delay.toFixed(0)}ms antes de tentar novamente.`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            if (attempt < attempts) {
              const delay = attempt * 805;
              await new Promise((resolve) => setTimeout(resolve, delay));
            }
          }
        }
      }
    }

    const finalErrStr = lastError?.message || String(lastError);
    if (finalErrStr.includes("RESOURCE_EXHAUSTED") || finalErrStr.includes("429") || finalErrStr.includes("quota") || finalErrStr.includes("Quota")) {
      // Set a short global cooldown of 15 seconds instead of 10 minutes to auto-recover gracefully while allowing fallback
      geminiThrottledUntil = Date.now() + 15 * 1000;
      console.warn(`[Gemini] Limite global temporário de cota estabelecido por 15 segundos.`);
      throw new Error("Limite de requisições excedido. Ativando o motor local de sintonização astrológica.");
    }

    throw lastError || new Error("Todos os modelos de fallback falharam.");
  };

  // Queue tasks sequentially
  const nextPromise = activeGeminiPromise.then(
    () => executeCall(),
    () => executeCall()
  );
  activeGeminiPromise = nextPromise.catch(() => {});
  return nextPromise;
}

// Helper to robustly extract and parse JSON from Gemini's response
function cleanAndParseJSON(text: string): any {
  if (!text) return {};
  let cleaned = text.trim();
  
  // Remove markdown code block markers if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\s*/, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  cleaned = cleaned.trim();
  
  // Isolate the outermost JSON object or array structure
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  
  if (firstBrace !== -1 && lastBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  } else if (firstBracket !== -1 && lastBracket !== -1) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  }
  
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("[cleanAndParseJSON] Erro ao analisar o JSON limpo:", err);
    console.error("[cleanAndParseJSON] Conteúdo original:", text);
    console.error("[cleanAndParseJSON] Conteúdo limpo tentado:", cleaned);
    throw err;
  }
}

// Mock database in-memory for simple user sessions / history
interface HistoryItem {
  id: string;
  type: 'dream' | 'tarot' | 'oraculo' | 'compatibility';
  title: string;
  date: string;
  details: string;
}
const userHistory: HistoryItem[] = [
  {
    id: "hist1",
    type: "dream",
    title: "Sonho com águas cristalinas",
    date: "08/06/2026",
    details: "Sonhou com água abundante e cristalina fluindo de uma montanha."
  },
  {
    id: "hist2",
    type: "tarot",
    title: "Leitura Semanal - Carreira",
    date: "07/06/2026",
    details: "Puxou a carta Sol. Foco em novos caminhos e otimismo."
  },
  {
    id: "hist3",
    type: "oraculo",
    title: "Consulta ao Oráculo do Dia",
    date: "08/06/2026",
    details: "Pergunta: 'Devo iniciar o projeto hoje?' - Resposta: Avance com sabedoria."
  }
];

// Helper to estimate placements dynamically from birth chart inputs 
// customized for "Fabricio" or "Fabriicio"
function resolveGeographicCoordinates(city: string): { latitude: number; longitude: number } {
  const cleanCity = (city || "").toLowerCase();
  
  if (cleanCity.includes("são paulo") || cleanCity.includes("sao paulo") || cleanCity.includes("sp")) {
    return { latitude: -23.5505, longitude: -46.6333 };
  }
  if (cleanCity.includes("rio de janeiro") || cleanCity.includes("rj")) {
    return { latitude: -22.9068, longitude: -43.1729 };
  }
  if (cleanCity.includes("belo horizonte") || cleanCity.includes("bh") || cleanCity.includes("mg")) {
    return { latitude: -19.9173, longitude: -43.9345 };
  }
  if (cleanCity.includes("curitiba") || cleanCity.includes("pr")) {
    return { latitude: -25.4290, longitude: -49.2671 };
  }
  if (cleanCity.includes("porto alegre") || cleanCity.includes("rs")) {
    return { latitude: -30.0346, longitude: -51.2177 };
  }
  if (cleanCity.includes("brasília") || cleanCity.includes("brasilia") || cleanCity.includes("df")) {
    return { latitude: -15.7975, longitude: -47.8919 };
  }
  if (cleanCity.includes("salvador") || cleanCity.includes("ba")) {
    return { latitude: -12.9777, longitude: -38.5016 };
  }
  if (cleanCity.includes("fortaleza") || cleanCity.includes("ce")) {
    return { latitude: -3.7319, longitude: -38.5267 };
  }
  if (cleanCity.includes("recife") || cleanCity.includes("pe")) {
    return { latitude: -8.0578, longitude: -34.8829 };
  }
  if (cleanCity.includes("manaus") || cleanCity.includes("am")) {
    return { latitude: -3.1190, longitude: -60.0217 };
  }
  if (cleanCity.includes("goiânia") || cleanCity.includes("goiania") || cleanCity.includes("go")) {
    return { latitude: -16.6869, longitude: -49.2648 };
  }
  if (cleanCity.includes("belém") || cleanCity.includes("belem") || cleanCity.includes("pa")) {
    return { latitude: -1.4558, longitude: -48.4902 };
  }
  if (cleanCity.includes("florianópolis") || cleanCity.includes("florianopolis") || cleanCity.includes("sc")) {
    return { latitude: -27.5954, longitude: -48.5480 };
  }
  if (cleanCity.includes("vitória") || cleanCity.includes("vitoria") || cleanCity.includes("es")) {
    return { latitude: -20.3155, longitude: -40.3128 };
  }
  if (cleanCity.includes("natal") || cleanCity.includes("rn")) {
    return { latitude: -5.7945, longitude: -35.2110 };
  }
  if (cleanCity.includes("joão pessoa") || cleanCity.includes("joao pessoa") || cleanCity.includes("pb")) {
    return { latitude: -7.1153, longitude: -34.8610 };
  }
  if (cleanCity.includes("maceió") || cleanCity.includes("maceio") || cleanCity.includes("al")) {
    return { latitude: -9.6658, longitude: -35.7350 };
  }
  if (cleanCity.includes("são luís") || cleanCity.includes("são luis") || cleanCity.includes("sao luis") || cleanCity.includes("ma")) {
    return { latitude: -2.5307, longitude: -44.3068 };
  }
  if (cleanCity.includes("teresina") || cleanCity.includes("pi")) {
    return { latitude: -5.0920, longitude: -42.8038 };
  }
  if (cleanCity.includes("campo grande") || cleanCity.includes("ms")) {
    return { latitude: -20.4697, longitude: -54.6201 };
  }
  if (cleanCity.includes("cuiabá") || cleanCity.includes("cuiaba") || cleanCity.includes("mt")) {
    return { latitude: -15.6010, longitude: -56.0974 };
  }
  if (cleanCity.includes("aracaju") || cleanCity.includes("se")) {
    return { latitude: -10.9472, longitude: -37.0731 };
  }
  if (cleanCity.includes("porto velho") || cleanCity.includes("ro")) {
    return { latitude: -8.7612, longitude: -63.9039 };
  }
  if (cleanCity.includes("rio branco") || cleanCity.includes("ac")) {
    return { latitude: -9.9754, longitude: -67.8080 };
  }
  if (cleanCity.includes("macapá") || cleanCity.includes("macapa") || cleanCity.includes("ap")) {
    return { latitude: 0.0347, longitude: -51.0694 };
  }
  if (cleanCity.includes("boa vista") || cleanCity.includes("rr")) {
    return { latitude: 2.8235, longitude: -60.6758 };
  }
  if (cleanCity.includes("palmas") || cleanCity.includes("to")) {
    return { latitude: -10.1844, longitude: -48.3336 };
  }
  
  return { latitude: -23.5505, longitude: -46.6333 };
}

function generateMapData(name: string, date: string, time: string, city: string, isUnknown: boolean) {
  // Resolve latitude & longitude based on birth city
  const coords = resolveGeographicCoordinates(city);
  
  // Calculate high-precision astronomical chart using custom mechanics
  const chart = performAstroCalculation(date, time || "12:00", coords.latitude, coords.longitude);
  
  const finalMap = {
    welcomeMessage: `Olás ${name}, seja bem-vindo ao seu Mapa Astral. Aqui começa a sua jornada astrológica profissional baseada em efemérides reais de altíssima precisão!`,
    distribution: chart.distribution,
    personalityTraits: {
      harmonious: [
        "Socialmente consciente", "Inventivo", "Esperançoso", "Amigável",
        "Curioso", "Independente", "Futurista", "Visionário", "Altruísta"
      ],
      disharmonious: [
        "Temperamental", "Disperso", "Imprevisível", "Teimoso", "Sarcástico"
      ]
    },
    astros: chart.astros.map(ast => ({
      name: ast.name,
      sign: ast.sign,
      degree: `${ast.degree}°${ast.minute.toString().padStart(2, '0')}'`,
      extraInfo: ast.extraInfo || "",
      description: ast.description
    })),
    houses: chart.houses.map(h => ({
      number: h.number,
      sign: h.sign,
      planet: h.planets.length > 0 ? h.planets.join(", ") : undefined,
      interpretation: h.interpretation
    })),
    aspects: chart.aspects.map(asp => ({
      planet1: asp.planet1,
      aspectType: asp.aspectType,
      planet2: asp.planet2,
      orb: asp.orb,
      interpretation: asp.interpretation
    }))
  };

  return finalMap;
}

// Generate fallback signs for date estimation
function getAscendedAstrologicalSign(dateString: string, offset: number): string {
  try {
    const calc = performAstroCalculation(dateString, "12:00");
    if (offset === 0) return calc.astros.find(a => a.name === "Sol")?.sign || "Aquário";
    if (offset === 5) return calc.astros.find(a => a.name === "Lua")?.sign || "Aquário";
    if (offset === 8) return calc.astros.find(a => a.name === "Ascendente")?.sign || "Sagitário";
    
    const signs = ["Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"];
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "Aquário";
    const idx = (d.getMonth() + offset) % 12;
    return signs[idx];
  } catch {
    return "Aquário";
  }
}

// Calculate Numerology
function calculateNumerologyData(name: string, birthDate: string): any {
  // Summing digits
  const sumDigits = (str: string) => {
    return str.replace(/\D/g, '').split('').reduce((acc, curr) => acc + parseInt(curr), 0);
  };
  
  const reduceToSingleDigit = (num: number): number => {
    while (num > 9 && num !== 11 && num !== 22) {
      num = num.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
    }
    return num;
  };

  const nameVal = name.length;
  const birthVal = sumDigits(birthDate);

  const caminhoDeVida = reduceToSingleDigit(birthVal || 25);
  const expressao = reduceToSingleDigit(nameVal + birthVal || 7);
  const motivacao = reduceToSingleDigit(nameVal * 2 || 9);
  const personalidade = reduceToSingleDigit(Math.abs(nameVal - (birthVal % 10)) || 1);

  return {
    caminhoDeVida,
    expressao,
    motivacao,
    personalidade,
    description: `Você é um perfil de vibração ${caminhoDeVida}. Este número denota que seu caminho principal de aprendizado incentiva a independência, curiosidade ativa e forte desenvolvimento pessoal.`,
    ciclos: [
      `Ciclo Formativo (0-28 anos): Vibração ${expressao} - Ênfase nos estudos e compreensão analítica da vida.`,
      `Ciclo Produtivo (28-56 anos): Vibração ${caminhoDeVida} - Período de conquistas de independência e materialização profissional.`,
      `Ciclo de Colheita (56+ anos): Vibração ${motivacao} - Transmissão de visão idealista e espiritual ao coletivo.`
    ]
  };
}

// API: Astrological Map and Numerology Generation using Gemini
app.post("/api/astrology/generate", async (req, res) => {
  const { name, birthDate, birthTime, birthCity, isUnknownTime } = req.body;
  if (!name) {
    return res.status(400).json({ error: "Nome é obrigatório." });
  }

  const numerology = calculateNumerologyData(name, birthDate);
  const localMap = generateMapData(name, birthDate, birthTime, birthCity, isUnknownTime);

  const cacheKey = `astrology:${name}:${birthDate}:${birthTime || ''}:${birthCity || ''}:${isUnknownTime}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  if (!aiClient) {
    // Return high-quality calculated local mapping if Gemini is unavailable
    const result = { map: localMap, numerology };
    setCachedResponse(cacheKey, result);
    return res.json(result);
  }

  try {
    const prompt = `Gere uma análise astrológica e numerológica detalhada e premium em Português para o usuário com estes dados de nascimento:
Nome: ${name}
Data de nascimento: ${birthDate}
Hora de nascimento: ${isUnknownTime ? "Desconhecida" : birthTime}
Cidade de nascimento: ${birthCity}

A resposta DEVE ser um objeto JSON exato contendo a seguinte estrutura e preenchendo todos os textos com explicações ricas, detalhadas e poéticas em Português, no mesmo estilo premium de Astrolink:
{
  "welcomeMessage": "Um texto longo de boas vindas especial...",
  "personalityTraits": {
    "harmonious": ["Socialmente consciente", "Inventivo", "Esperançoso", "... etc (gerar 5 a 10)"],
    "disharmonious": ["Temperamental", "Disperso", "Teimoso", "... etc (gerar 5 a 10)"]
  },
  "astrosInterpretations": {
    "Sol": "Interpretação poética detalhada de 3 a 5 parágrafos sobre a essência...",
    "Lua": "Interpretação detalhada de 3 a 5 parágrafos das emoções...",
    "Ascendente": "Interpretação da máscara social..."
  }
}
Responda APENAS com o JSON literal. Não inclua blocos de código adicionais fora do JSON.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const geminiText = response.text || "{}";
    const parsedData = cleanAndParseJSON(geminiText);

    // Merge computed placements with poetic explanations from Gemini
    if (parsedData.welcomeMessage) {
      localMap.welcomeMessage = parsedData.welcomeMessage;
    }
    if (parsedData.personalityTraits?.harmonious) {
      localMap.personalityTraits.harmonious = parsedData.personalityTraits.harmonious;
    }
    if (parsedData.personalityTraits?.disharmonious) {
      localMap.personalityTraits.disharmonious = parsedData.personalityTraits.disharmonious;
    }
    if (parsedData.astrosInterpretations) {
      localMap.astros = localMap.astros.map(ast => {
        if (parsedData.astrosInterpretations[ast.name]) {
          return { ...ast, description: parsedData.astrosInterpretations[ast.name] };
        }
        return ast;
      });
    }

    const result = { map: localMap, numerology };
    setCachedResponse(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.warn("Gemini failed, serving computed placements:", error);
    const result = { map: localMap, numerology };
    // Cache the fallback too, to prevent infinite hitting
    setCachedResponse(cacheKey, result);
    res.json(result);
  }
});

// API: Dream Interpretation using Gemini
app.post("/api/dreams/interpret", async (req, res) => {
  const { title, description, emotions, tags } = req.body;
  if (!description) {
    return res.status(400).json({ error: "Descrição do sonho é obrigatória." });
  }

  const fallbackInterpretation = {
    summary: "Seu sonho indica um momento de ativação profunda do subconsciente. A água ou elementos similares expõem suas emoções fluidas e a busca por liberação de tensões acumuladas.",
    mainMeanings: [
      "Processamento de transição de vida importante",
      "Desejo de reconexão com sua voz interna",
      "Necessidade de dar mais espaço para a intuição artística"
    ],
    symbols: ["Água ou Fluidez representa o fluxo emocional", "Ambiências abertas simbolizam anseio de liberdade física"],
    emotionalAspects: "Você parece estar assimilando sentimentos guardados de independência versus responsabilidades cotidianas.",
    reflections: [
      "Será que você está reprimindo sentimentos para não chocar pessoas próximas?",
      "De que forma você pode expressar sua rebeldia de maneira construtiva?"
    ],
    positivePoints: ["Grande vigor criativo", "Sua imaginação é uma aliada valiosa para resolver impasses"],
    attentionPoints: ["Fuga da realidade através de fantasias", "Dificuldade de lidar com regras limitadoras no momento"],
    advice: "Dedique os próximos dias para expressar suas opiniões com clareza. Não guarde para si sentimentos de aprisionamento; converse de maneira madura.",
    finalMessage: "Seus sonhos são um convite para você desbravar o seu verdadeiro eu com sabedoria e confiança."
  };

  const cacheKey = `dreams:${title || ''}:${description}:${(emotions || []).join(',')}:${(tags || []).join(',')}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  if (!aiClient) {
    const result = { interpretation: fallbackInterpretation };
    setCachedResponse(cacheKey, result);
    return res.json(result);
  }

  try {
    const prompt = `Interprete este sonho em Português de forma extremamente detalhada, rica, humanizada e empática no estilo de um terapeuta de sonhos profissional:
Título do sonho: ${title || "Não especificado"}
Descrição: ${description}
Emoções sentidas: ${emotions ? emotions.join(", ") : "Não especificadas"}
Tags associadas: ${tags ? tags.join(", ") : "Nenhuma"}

Você DEVE produzir e retornar um JSON exato com as seguintes chaves de interpretação:
{
  "summary": "Resumo geral detalhado do sonho...",
  "mainMeanings": ["Significado 1", "Significado 2", "Significado 3"],
  "symbols": ["Símbolo 1 com explicação", "Símbolo 2 com explicação..."],
  "emotionalAspects": "Análise dos aspectos emocionais específicos apresentados...",
  "reflections": ["Reflexão 1", "Reflexão 2"],
  "positivePoints": ["Ponto positivo 1", "Ponto positivo 2"],
  "attentionPoints": ["Ponto de atenção 1", "Ponto de atenção 2"],
  "advice": "Conselhos terapêuticos e conselhos práticos de ação para os próximos dias...",
  "finalMessage": "Uma mensagem inspiradora final calorosa..."
}
Retorne exclusivamente o JSON, sem markdown ou explicações externas.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const interpretation = cleanAndParseJSON(response.text || "{}");
    const result = { interpretation: { ...fallbackInterpretation, ...interpretation } };
    setCachedResponse(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.warn("Dream API failed, serving fallback interpretation:", err);
    const result = { interpretation: fallbackInterpretation };
    setCachedResponse(cacheKey, result);
    res.json(result);
  }
});

// API: Companion compatibility evaluation
app.post("/api/compatibility/evaluate", (req, res) => {
  const { name, birthDate, companionName, companionBirthDate } = req.body;
  if (!name || !companionName) {
    return res.status(400).json({ error: "Ambos os nomes são necessários." });
  }

  // Plausible computations using name lengths as seeds to make it deterministic but responsive
  const getSeedScore = (s1: string, s2: string, modifier: number) => {
    const sum = s1.length + s2.length + modifier;
    return 40 + (sum % 56); // 40% to 96%
  };

  const lovePercent = getSeedScore(name, companionName, 17);
  const friendshipPercent = getSeedScore(name, companionName, 5);
  const businessPercent = getSeedScore(name, companionName, 29);
  const communicationPercent = getSeedScore(name, companionName, 12);
  const emotionalAffinityPercent = getSeedScore(name, companionName, 8);

  const result: any = {
    partnerName: companionName,
    partnerBirthDate: companionBirthDate || "Não fornecida",
    lovePercent,
    friendshipPercent,
    businessPercent,
    communicationPercent,
    emotionalAffinityPercent,
    strengthPoints: [
      "Diálogo intelectual constante e troca vigorosa de ideias originais.",
      "Excelente química de amizade que serve como fundação do afeto.",
      "Ambos defendem caminhos livres de regras excessivas."
    ],
    conflicts: [
      "O excesso de racionalidade pode às vezes esfriar o romantismo nas demonstrações afetivas.",
      "Teimosia mútua em visões lógicas individuais durante discussões."
    ],
    opportunities: [
      "Praticar mais escuta atenta das emoções sem forçar rationalizações inmediatas.",
      "Construir projetos conjuntos voltados a causas humanitárias ou inovação."
    ]
  };

  res.json({ compatibility: result });
});

// API: Daily Oracle limit checking + prompt calculation
app.post("/api/oraculo/query", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Pergunta do oráculo é obrigatória." });
  }

  const fallbackOracle = {
    reflection: "Todo ciclo que se fecha é na verdade a preparação de um solo novo. Pare e observe o que realmente está demandando sua energia.",
    inspiringMessage: "A originalidade reside em aceitar seus padrões ocultos enquanto projeta novos amanheceres sem medo.",
    counsel: "Não precipite escolhas. Silencie suas inquietações cerebrais hoje e permita que sua intuição (que vibra alto) indique a resposta natural."
  };

  const cacheKey = `oraculo:${question}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  if (!aiClient) {
    const result = fallbackOracle;
    setCachedResponse(cacheKey, result);
    return res.json(result);
  }

  try {
    const prompt = `O usuário fez uma pergunta ao Oráculo do Dia: "${question}".
Considere que as energias astrológicas regentes estimulam idealismo, independência e crescimento pessoal metódico.
Responda com um conselho meditativo e reflexivo em Português no seguinte formato JSON estrito:
{
  "reflection": "Um parágrafo de profunda reflexão metafísica relacionada à pergunta...",
  "inspiringMessage": "Uma mensagem de 2 frases de grande inspiração e incentivo...",
  "counsel": "Um conselho prático e objective sobre o que o usuário deve fazer hoje..."
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const oracleData = cleanAndParseJSON(response.text || "{}");
    const result = { ...fallbackOracle, ...oracleData };
    setCachedResponse(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.warn("Oracle API failed, serving fallback:", err);
    const result = fallbackOracle;
    setCachedResponse(cacheKey, result);
    res.json(result);
  }
});

// API: Celestial transits history & events of the current month (June 2026)
app.post("/api/astrology/transits-month", async (req, res) => {
  const { birthDate, name } = req.body || {};
  
  const fallbackTransits = {
    events: [
      {
        date: "2026-06-03",
        eventName: "Conjunção Sol e Vênus em Gêmeos",
        planet: "Vênus",
        description: "Momento sublime para diálogos afetivos, valorização estética e acordos financeiros leves e dinâmicos.",
        influence: "Positive"
      },
      {
        date: "2026-06-09",
        eventName: "Lua Minguante em Peixes",
        planet: "Lua",
        description: "Fase de depuração emocional profunda. Momento propício para meditação, desapego e cura onírica.",
        influence: "Transformative"
      },
      {
        date: "2026-06-15",
        eventName: "Mercúrio em Conjunção com Sol em Câncer",
        planet: "Mercúrio",
        description: "Alinhamento das faculdades cognitivas racionais à sensibilidade emocional pura. Ideias de negócios vinculadas à moradia, segurança ou raízes íntimas.",
        influence: "Positive"
      },
      {
        date: "2026-06-21",
        eventName: "Solstício de Inverno / Sol entra em Câncer",
        planet: "Sol",
        description: "O Sol entra no signo cardinal da Água, Câncer. Período de introspecção reflexiva, estreitamento de laços familiares e cultivo de sua segurança fundamental.",
        influence: "Neutral"
      },
      {
        date: "2026-06-25",
        eventName: "Sol em Câncer em Trígono com Saturno em Peixes",
        planet: "Saturno",
        description: "Uma corrente de maturidade e estabilização emocional flui. Perfeito para formalizar acordos sinceros de longo prazo.",
        influence: "Positive"
      },
      {
        date: "2026-06-28",
        eventName: "Quadratura Marte e Plutão",
        planet: "Marte",
        description: "Confronto de vontades e disputa por controle. Canalize o impulso revolucionário para transformações internas estruturadas.",
        influence: "Challenging"
      },
      {
        date: "2026-06-30",
        eventName: "Mercúrio entra em Leão",
        planet: "Mercúrio",
        description: "A comunicação ganha tons teatrais, expressivos e carismáticos. Ideal para falar com autoridade e brilho pessoal.",
        influence: "Neutral"
      }
    ]
  };

  const cacheKey = `transits:${name || ''}:${birthDate || ''}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  if (!aiClient) {
    const result = fallbackTransits;
    setCachedResponse(cacheKey, result);
    return res.json(result);
  }

  try {
    const userContext = birthDate ? `O usuário nasceu em ${birthDate}${name ? ', nome ' + name : ''}.` : '';
    const prompt = `Gere uma lista de 6 a 8 eventos astrológicos/trânsitos celestes importantes reais ou plausíveis para o mês atual de Junho de 2026.
${userContext}
Importante: O retorno DEVE ser um objeto JSON estrito com a seguinte estrutura de dados:
{
  "events": [
    {
      "date": "YYYY-MM-DD", // Deve usar data formatada em Junho de 2026 (por exemplo "2026-06-12")
      "eventName": "Nome do Evento Astrológico",
      "planet": "Nome do Planeta Principal (ex: 'Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte', 'Júpiter', 'Saturno', 'Urano', 'Netuno', 'Plutão')",
      "description": "Explicação poética e astrológica detalhada em Português sobre o impacto coletivo ou pessoal deste trânsito...",
      "influence": "Positive" | "Challenging" | "Neutral" | "Transformative"
    }
  ]
}
Retorne somente o JSON limpo, sem markdown ou textos explicativos ao redor.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedData = cleanAndParseJSON(response.text || "{}");
    if (parsedData && Array.isArray(parsedData.events)) {
      const result = parsedData;
      setCachedResponse(cacheKey, result);
      return res.json(result);
    }
    const result = fallbackTransits;
    setCachedResponse(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.warn("Transits month API failed, serving fallback:", err);
    const result = fallbackTransits;
    setCachedResponse(cacheKey, result);
    res.json(result);
  }
});

// API: Moon current position tip
app.post("/api/astrology/moon-tip", async (req, res) => {
  const { birthDate, name } = req.body || {};
  
  const fallbackTips = [
    {
      moonSign: "Peixes",
      moonPhase: "Lua Minguante 🌙",
      tip: "Com a Lua Minguante navegando pelas águas oníricas e intuitivas de Peixes, o momento é de recolhimento espiritual e purificação. Excelentes insights podem surgir através do journaling e da contemplação silenciosa."
    },
    {
      moonSign: "Peixes",
      moonPhase: "Lua Minguante 🌙",
      tip: "Tempo de transmutar mágoas em compaixão. Sob a Lua em Peixes, limpe seus canais sutis de percepção e confie no fluxo da sua intuição profunda."
    },
    {
      moonSign: "Peixes",
      moonPhase: "Lua Minguante 🌙",
      tip: "A sensibilidade está em alta. Dê espaço para os seus sentimentos hoje, sem julgamentos. Cultive rituais de desintoxicação física e digital."
    }
  ];

  // Pick one randomly for fallback
  const randomFallback = fallbackTips[Math.floor(Math.random() * fallbackTips.length)];

  const cacheKey = `moontip:${name || ''}:${birthDate || ''}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  if (!aiClient) {
    const result = randomFallback;
    setCachedResponse(cacheKey, result);
    return res.json(result);
  }

  try {
    const userContext = birthDate ? `O usuário se chama ${name || "Buscador"} e nasceu em ${birthDate}.` : '';
    const prompt = `Gere uma "Dica Astrológica Rápida" curta, poética, misteriosa e extremamente inspiradora em Português adaptada à posição atual da Lua hoje (Junho de 2026: Lua Minguante transitando em Peixes).
${userContext}
Importante: O retorno DEVE ser um objeto JSON estrito com a seguinte estrutura de dados:
{
  "moonSign": "Peixes",
  "moonPhase": "Lua Minguante 🌙",
  "tip": "Uma dica direta, inspiradora e poética de 2-3 frases orientando o que fazer psicologicamente ou espiritualmente hoje em face deste trânsito lunar..."
}
Não coloque blocos markdown ou preâmbulos, retorne APENAS o JSON literal limpo.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedData = cleanAndParseJSON(response.text || "{}");
    if (parsedData && parsedData.tip) {
      const result = parsedData;
      setCachedResponse(cacheKey, result);
      return res.json(result);
    }
    const result = randomFallback;
    setCachedResponse(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.warn("Moon-tip API failed, serving default:", err);
    const result = randomFallback;
    setCachedResponse(cacheKey, result);
    res.json(result);
  }
});

// API: Astrological Rare Notifications system customized to user's birth map
app.post("/api/astrology/rare-notifications", async (req, res) => {
  const { birthDate, name } = req.body || {};
  
  const isDefaultPersona = name?.toLowerCase().includes("fabricio") || name?.toLowerCase().includes("fabriicio");
  const solSign = isDefaultPersona ? "Aquário" : getAscendedAstrologicalSign(birthDate, 0);
  const moonSign = isDefaultPersona ? "Aquário" : getAscendedAstrologicalSign(birthDate, 5);
  const ascSign = isDefaultPersona ? "Sagitário" : getAscendedAstrologicalSign(birthDate, 8);

  const fallbackData = {
    notifications: [
      {
        id: "rare-node-shift-1",
        title: "Alinhamento Crítico de Plutão",
        message: `Plutão retrógrado em Aquário faz aspecto singular sobre seu Sol de nascimento em ${solSign}, convocando um encerramento kármico definitivo e uma renovação revolucionária da sua autoimagem de liderança.`,
        severity: "high",
        date: "2026-06-09",
        read: false,
        planet: "Plutão",
        aspect: "Conjunção",
        category: "alignment"
      },
      {
        id: "jupiter-trine-2",
        title: "Farol Kármico de Júpiter",
        message: `Júpiter entra em trígono perfeito de expansão com sua Lua natal em ${moonSign}. Um Portal de sorte emocional, clareza intuitiva profunda e magnetismo prático está aberto nas próximas 48 horas.`,
        severity: "medium",
        date: "2026-06-09",
        read: false,
        planet: "Júpiter",
        aspect: "Trígono",
        category: "alignment"
      },
      {
        id: "retrograde-saturn-3",
        title: "Estação de Saturno em Peixes",
        message: `Saturno estaciona no céu em quadratura exata com seu Ascendente natal em ${ascSign}. A cobrança sobre limites pessoais, limites de saúde e reestruturação emocional ganha peso extraordinário.`,
        severity: "high",
        date: "2026-06-09",
        read: false,
        planet: "Saturno",
        aspect: "Quadratura",
        category: "retrograde"
      },
      {
        id: "mars-opposition-4",
        title: "Oposição de Marte Celeste",
        message: `Marte celeste em trânsito realiza oposição desafiadora ao seu Sol de nascimento em ${solSign}. Cuidado com picos de irritabilidade, exaustão impaciente ou conflitos com autoridades. Pratique desapego.`,
        severity: "low",
        date: "2026-06-09",
        read: false,
        planet: "Marte",
        aspect: "Oposição",
        category: "alignment"
      }
    ]
  };

  const cacheKey = `rarenotif:${name || ''}:${birthDate || ''}`;
  const cached = getCachedResponse(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  if (!aiClient) {
    const result = fallbackData;
    setCachedResponse(cacheKey, result);
    return res.json(result);
  }

  try {
    const prompt = `Gere uma lista de 3 a 4 "Alertas Astrológicos Raros / Alinhamentos Planetários Excepcionalmente Raros" em Português adaptados especificamente para o mapa natal do usuário abaixo.
Os alertas devem refletir trânsitos celestes reais ou altamente plausíveis ocorrendo em Junho de 2026 e seus impactos calculados nos planetas de nascimento do usuário.

DADOS DE NASCIMENTO DO USUÁRIO:
- Nome: ${name || "Buscador Celestial"}
- Nascimento: ${birthDate || "1994-11-22"}
- Signo Solar Natal estimado: ${solSign}
- Signo Lunar Natal estimado: ${moonSign}
- Ascendente Natal estimado: ${ascSign}

Importante: O retorno DEVE ser um objeto JSON estrito com a seguinte estrutura de dados:
{
  "notifications": [
    {
      "id": "string-id-unico",
      "title": "Título Curto do Alerta (máx. 40 caracteres, ex: 'Grande Oposição de Marte kármica')",
      "message": "Explicação astrológica densa, poética e altamente personalizada de 2 a 3 frases em Português sobre este trânsito celeste (ex: Júpiter em trânsito de oposição ao seu Sol em ${solSign}) e como isso atua como um raro chamado energético em sua vida.",
      "severity": "high" | "medium" | "low",
      "date": "2026-06-09",
      "read": false,
      "planet": "O planeta em trânsito preponderante (ex: 'Plutão', 'Saturno', 'Júpiter', 'Marte', 'Netuno')",
      "aspect": "O aspecto astrológico exato (ex: 'Conjunção', 'Trígono', 'Oposição', 'Quadratura')",
      "category": "alignment" | "eclipse" | "retrograde" | "node"
    }
  ]
}
Não coloque blocos markdown ou preâmbulos, retorne APENAS o JSON literal limpo.`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedData = cleanAndParseJSON(response.text || "{}");
    if (parsedData && Array.isArray(parsedData.notifications)) {
      const result = parsedData;
      setCachedResponse(cacheKey, result);
      return res.json(result);
    }
    const result = fallbackData;
    setCachedResponse(cacheKey, result);
    res.json(result);
  } catch (err) {
    console.warn("Astrological rare notification API failed, serving default:", err);
    const result = fallbackData;
    setCachedResponse(cacheKey, result);
    res.json(result);
  }
});

// API: Personal Counselor chat with memory integration
app.post("/api/conselheira/chat", async (req, res) => {
  const { messages, userProfile, requestTopic } = req.body;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "Mensagens são necessárias." });
  }

  const lastUserMessage = messages[messages.length - 1].text;

  const getFallbackResponse = (msg: string) => {
    if (msg.toLowerCase().includes("emprego") || msg.toLowerCase().includes("trabalho") || msg.toLowerCase().includes("carreira")) {
      return "Analisando seus dados sob a ótica astrológica (Sol em Aquário, Ascendente em Sagitário) e sua Numerologia: você floresce em profissões que unam ampla liberdade intelectual, inovação tecnológica ou propósitos humanitários. Aceitar propostas rígidas que exigem submissão total a horários burocráticos pode sufocar sua essência. Faça um planejamento ousado de transição.";
    }
    if (msg.toLowerCase().includes("relacionamento") || msg.toLowerCase().includes("amor") || msg.toLowerCase().includes("namor")) {
      return "Com Vênus vibrando em Aquário e Lua também em Aquário, a liberdade mútua e o companheirismo intelectual são fundamentais no amor. Se você sente cobranças excessivas, possessividade ou falta de espaço pessoal, isso costuma criar atritos graves em sua energia. Busque relacionamentos que possuam amizade e diálogo claro sem possessividade.";
    }
    return "Sinto sua energia demandando clareza e racionalidade combinada a um despertar da intuição. Seu ciclo numerológico atual incentiva você a reformular sua rotina prática sem medo das transformações bruscas. Qual aspecto de sua vida você gostaria que analisássemos em detalhes hoje?";
  };

  if (!aiClient) {
    return res.json({ response: getFallbackResponse(lastUserMessage) });
  }

  try {
    const formattedProfile = userProfile ? `
Nome do Usuário: ${userProfile.name}
Nascido em: ${userProfile.birthDate} às ${userProfile.birthTime} na cidade ${userProfile.birthCity}
Seu perfil combina Sol em Aquário (Ar Fixo), Ascendente em Sagitário (Fogo Mutável) e Lua em Aquário. Traz rebeldia, pensamento visionário, racionalização emocional e desejo imenso de libertação.` : "Usuário anônimo buscando insights de autoconhecimento.";

    const sysInstruction = `Você é o "Orbia", o assistente astrológico e conselheira pessoal inteligente do aplicativo Star Map / Mapa Estelar.
Seu papel é responder perguntas do usuário integrando astrologia, numerologia, aconselhamento empático e psicologia de autoconhecimento.
Sempre fale em Português brasileiro. Seu tom é premium, elegante, poético, misterioso e profundamente sábio, nunca superficial ou genérico.

Aqui estão os dados astrológicos fundamentais do usuário que se comunica com você:
${formattedProfile}

Dicas importantes de acolhimento:
- Seja extremamente empático.
- Dê conselhos práticos, baseados no livre-arbítrio (dinâmica da consciência).
- Faça perguntas abertas para fazê-los refletir profunda e intimamente.`;

    // Package chat history
    const geminiContents = messages.map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const response = await generateContentWithFallback({
      contents: geminiContents,
      config: {
        systemInstruction: sysInstruction,
      }
    });

    res.json({ response: response.text || getFallbackResponse(lastUserMessage) });
  } catch (err) {
    console.warn("Chat counselor failing, serving custom reply:", err);
    res.json({ response: getFallbackResponse(lastUserMessage) });
  }
});

// API: Draw Tarot reading (P.32)
const tarotDeck = [
  { cardName: "O Louco (0)", arcanaType: "major" as const, number: 0, uprightMeaning: "Inícios, potencial puro, fé cega, espontaneidade e aventura sem amarras.", advice: "Abrace o desconhecido. É hora de dar o salto de fé que você tanto racionaliza.", imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=300&auto=format&fit=crop" },
  { cardName: "O Mago (I)", arcanaType: "major" as const, number: 1, uprightMeaning: "Poder pessoal, manifestação focada, iniciativa brilhante e recursos plenos.", advice: "Você já possui todas as habilidades. Ajuste sua concentração e canalize sua força.", imageUrl: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=300&auto=format&fit=crop" },
  { cardName: "A Sacerdotisa (II)", arcanaType: "major" as const, number: 2, uprightMeaning: "Intuição afiada, mistério pacífico, subconsciente ativo e sabedoria oculta.", advice: "Pare de buscar respostas no mundo exterior. Silencie e siga seus insights mudos.", imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=300&auto=format&fit=crop" },
  { cardName: "A Imperatriz (III)", arcanaType: "major" as const, number: 3, uprightMeaning: "Abundância maternal, fertilidade ativa, criatividade florescente e generosidade.", advice: "Nutra suas ideias. Deixe a beleza fluir livremente através de seus atos hoje.", imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=300&auto=format&fit=crop" },
  { cardName: "O Imperador (IV)", arcanaType: "major" as const, number: 4, uprightMeaning: "Estrutura sólida, ordem prática, liderança ativa, autoridade e proteção austera.", advice: "Crie regras claras. Um pouco de ordem e rotina pragmática trarão paz.", imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop" },
  { cardName: "O Papa (V)", arcanaType: "major" as const, number: 5, uprightMeaning: "Tradições sábias, mentoria elevada, educação, sabedoria espiritual e dogmas.", advice: "Converse com um mentor ou busque caminhos estruturados de conhecimento.", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=300&auto=format&fit=crop" },
  { cardName: "Os Enamorados (VI)", arcanaType: "major" as const, number: 6, uprightMeaning: "Escolhas do coração, amor correspondido, concordância, alinhamento e química.", advice: "Alinhe suas decisões com seus sentimentos autênticos antes de se comprometer.", imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=300&auto=format&fit=crop" },
  { cardName: "O Carro (VII)", arcanaType: "major" as const, number: 7, uprightMeaning: "Vitória veloz, controle focado, determinação indomável, foco e força de vontade.", advice: "Mantenha o foco firmemente nas rédeas e dirija seu progresso com vigor e coragem.", imageUrl: "https://images.unsplash.com/photo-1516339901601-2e1d62dc0c45?q=80&w=300&auto=format&fit=crop" },
  { cardName: "A Roda da Fortuna (X)", arcanaType: "major" as const, number: 10, uprightMeaning: "Mudanças repentinas, ciclos inevitáveis, destino em movimento e virada radical.", advice: "Aceite o fluxo natural. O que sobe também desce; adapte-se com serenidade.", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop" },
  { cardName: "A Força (VIII)", arcanaType: "major" as const, number: 8, uprightMeaning: "Coragem moral, força interior tranquila, autodomínio e compaixão curativa.", advice: "Enfrente os desafios com suavidade e paciência. Sua maior força é a resiliência.", imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=300&auto=format&fit=crop" },
  { cardName: "O Eremita (IX)", arcanaType: "major" as const, number: 9, uprightMeaning: "Autoconhecimento, solitude reconfortante, guia interno e reflexão profunda.", advice: "Recolha-se por um momento para refletir. A resposta que você procura está em seu interior.", imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=300&auto=format&fit=crop" },
  { cardName: "A Justiça (XI)", arcanaType: "major" as const, number: 11, uprightMeaning: "Equilíbrio, verdade límpida, retidão, causa e efeito e responsabilidade justa.", advice: "Seja totalmente honesto consigo mesmo e pese todas as consequências de sua escolha.", imageUrl: "https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?q=80&w=300&auto=format&fit=crop" },
  { cardName: "A Morte (XIII)", arcanaType: "major" as const, number: 13, uprightMeaning: "Fim de ciclos, transmutação radical, renascimento inevitável e desapego sincero.", advice: "Deixe ir o que já não serve. Apenas com a poda do velho algo novo poderá brotar.", imageUrl: "https://images.unsplash.com/photo-1502472591864-94d34b745f1a?q=80&w=300&auto=format&fit=crop" },
  { cardName: "A Estrela (XVII)", arcanaType: "major" as const, number: 17, uprightMeaning: "Esperança renovada, inspiração artística, cura suave e fé absoluta no rumo cósmico.", advice: "Acredite na luz que guia o seu caminho, mesmo nas noites mais escuras. Há esperança.", imageUrl: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=300&auto=format&fit=crop" },
  { cardName: "A Lua (XVIII)", arcanaType: "major" as const, number: 18, uprightMeaning: "Ilusão sutil, sonhos vívidos, subconsciente profundo e temores instintivos.", advice: "Preste atenção aos seus sonhos e intuições. Nem tudo é o que parece no momento.", imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300&auto=format&fit=crop" },
  { cardName: "O Sol (XIX)", arcanaType: "major" as const, number: 19, uprightMeaning: "Vitalidade plena, clareza absoluta, alegria compartilhada e sucesso merecido.", advice: "Abrace a sua autenticidade e brilhe livremente. O momento é de calor e vitalidade.", imageUrl: "https://images.unsplash.com/photo-1521714161819-15534968fc5f?q=80&w=300&auto=format&fit=crop" },
  { cardName: "O Mundo (XXI)", arcanaType: "major" as const, number: 21, uprightMeaning: "Conclusão gloriosa, harmonia universal, integração de alma e êxtase de realização.", advice: "Comemore a colheita dos seus esforços. Você completou um ciclo com sabedoria.", imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=300&auto=format&fit=crop" },
  { cardName: "O Enforcado (XII)", arcanaType: "major" as const, number: 12, uprightMeaning: "Nova perspectiva, pausa voluntária, sacrifício saudável e desassossego pacífico.", advice: "Olhe as coisas por outro ângulo antes de agir. Uma pausa trará sabedoria.", imageUrl: "https://images.unsplash.com/photo-1518531933537-91b2f5f229cc?q=80&w=300&auto=format&fit=crop" },
  { cardName: "A Temperança (XIV)", arcanaType: "major" as const, number: 14, uprightMeaning: "Alquimia pessoal, moderação, equilíbrio emocional, paciência e fluxo sereno das coisas.", advice: "Evite extremos hoje. Misture os opostos em sua vida com paciência e suavidade sagrada.", imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop" },
  { cardName: "O Diabo (XV)", arcanaType: "major" as const, number: 15, uprightMeaning: "Apegos densos, tentação carnal, obsessão mental, paixão intensa e forças do subconsciente.", advice: "Cuidado com ciladas emocionais ou compulsões. Liberte-se de correntes autoimpostas.", imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=300&auto=format&fit=crop" },
  { cardName: "A Torre (XVI)", arcanaType: "major" as const, number: 16, uprightMeaning: "Ruptura necessária, revelação libertadora, queda de velhas ilusões e reconstrução forte.", advice: "Deixe cair as estruturas falsas. A queda é necessária para que a fundação verdadeira apareça.", imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300&auto=format&fit=crop" },
  { cardName: "O Julgamento (XX)", arcanaType: "major" as const, number: 20, uprightMeaning: "Despertar interior, chamado da alma, redenção, cura do passado e veredito sincero.", advice: "Aproveite esta chance de renascer do passado. Limpe as velhas mágoas.", imageUrl: "https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=300&auto=format&fit=crop" }
];

app.post("/api/tarot/draw", async (req, res) => {
  const randomIndex = Math.floor(Math.random() * tarotDeck.length);
  const selectedCard = tarotDeck[randomIndex];

  const currentDate = new Date().toLocaleDateString("pt-BR");

  const result: any = {
    cardName: selectedCard.cardName,
    arcanaType: selectedCard.arcanaType,
    number: selectedCard.number,
    imageUrl: selectedCard.imageUrl,
    uprightMeaning: selectedCard.uprightMeaning,
    advice: selectedCard.advice,
    weeklyForecast: "Esta semana trará um foco essencial em reestruturação mental e emocional. A energia desta carta estimula você a quebrar paradigmas limitadores (Urano em Quadratura a Saturno) e focar em projetos pessoais ousados.",
    drawingDate: currentDate
  };

  if (!aiClient) {
    return res.json({ draw: result });
  }

  try {
    const prompt = `Gere uma leitura de tarô personalizada em Português para a carta sorteada: "${selectedCard.cardName}".
O usuário quer saber sua previsão e conselho astrológico-tarótico com visual premium para esta semana.
Gere um JSON exato com as seguintes chaves de texto ricas e conselhos poéticos:
{
  "weeklyForecast": "Parágrafo detalhado de previsão de 100 a 150 palavras para a semana unindo a energia da carta e intuição astrológica...",
  "advice": "Conselho prático específico e poético de uma frase para enfrentar dilemas..."
}`;

    const response = await generateContentWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedForecast = cleanAndParseJSON(response.text || "{}");
    if (parsedForecast.weeklyForecast) {
      result.weeklyForecast = parsedForecast.weeklyForecast;
    }
    if (parsedForecast.advice) {
      result.advice = parsedForecast.advice;
    }

    res.json({ draw: result });
  } catch (err) {
    console.log("Tarot API error, serving template:", err);
    res.json({ draw: result });
  }
});

// API: Sorteio de várias cartas para tiragens específicas (inteligente, amor, tradicional)
app.post("/api/tarot/draw-full", async (req, res) => {
  try {
    const { count } = req.body;
    const numCards = Math.max(1, Math.min(10, count || 1));

    // Sorteia de forma única
    const shuffled = [...tarotDeck].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, numCards);

    res.json({ cards: selected });
  } catch (err) {
    console.log("Erro ao sortear cartas do baralho:", err);
    res.status(500).json({ error: "Erro interno ao sortear cartas de tarot." });
  }
});

// Helper to generate deeply realistic, individualized tarot readings offline when the external API key is throttled
function generateOfflineTarotReading(type: string, cards: any[], question: string, userName: string): { reading: string; guidance: string } {
  const userDisplay = userName || "Buscador de Sabedoria";
  
  const mainCardsLine = cards && Array.isArray(cards)
    ? cards.map((c: any) => c.cardName).join(", ")
    : "forças sutis";

  const guidanceMantras = [
    "Respire fundo. A força do cosmo habita no seu silêncio divino hoje.",
    "Abra-se para o novo caminho com fé sincera, sabedoria e pés no chão.",
    "Afaste-se de fofocas e ruídos externos; silencie sua mente e blinde seu lar.",
    "Consagre suas finanças à sabedoria e aja com prudência nas parcerias.",
    "Blindagem cósmica ativada: confie no seu brilho interior único.",
    "O amor verdadeiro e sincero flui no respeito ao próprio tempo sagrado."
  ];

  const randomGuidance = guidanceMantras[Math.floor(Math.random() * guidanceMantras.length)];

  if (type === "amor") {
    const p1 = `Olá, ${userDisplay}. Sinto aqui, ao sintonizar com as cartas ${mainCardsLine}, uma vibração profunda que toca diretamente o seu campo afetivo. Como uma taróloga real com anos de experiência, vejo que sua alma procura clareza absoluta sobre sentimentos. Suas cartas revelam que o momento atual pede para você respirar fundo e se desfazer de expectativas pesadas que o passado deixou em seu coração. Há fofocas ou possíveis invejas camufladas ao seu redor; blinde o seu amor contra essas energias negativas.`;
    const p2 = `Se a sua dúvida central é "${question || "Qual o conselho do Tarot para minha vida amorosa no momento?"}", as cartas mostram a necessidade urgente de reciprocidade sã. Evite ciladas do apego inconsciente ou o medo da rejeição. As cartas aconselham a dialogar com tranquilidade e colocar limites éticos respeitáveis.`;
    const p3 = `Nas próximas semanas, espere por uma renovação sutil de sentimentos. A alquimia do coração cura suas dores quando você aceita sua própria dignidade e valor sagrado.`;
    return {
      reading: `${p1}\n\n${p2}\n\n${p3}`,
      guidance: `Sinal espiritual de Orbia: ${randomGuidance}`
    };
  } else if (type === "semanal") {
    const p1 = `Querido(a) ${userDisplay}, a Leitura Profunda das 10 cartas consagradas (${mainCardsLine}) revela um poderoso panorama espiritual focado em sua sintonização semanal. Este é um ciclo de merecido destaque e extrema importância para sua jornada!`;
    const p2 = `No Trabalho, negócios e caminhos profissionais, os arcanos trazem um potencial fecundo de manifestação se você estruturar suas prioridades de forma firme. Tenha muita paciência com fofocas ou mal olhado oculto no ambiente corporativo; evite partilhar todas as suas vitórias. A proteção espiritual indica que suas ações limpas triunfarão contra quaisquer artimanhas alheias.`;
    const p3 = `No Amor e convívio social, as conexões pedem um olhar equilibrado de cura e afeto generoso. Alerte-se contra dores do subconsciente profundo que perturbam sua rotina. Uma atitude sábia e prudente no seu lar trará paz para os seus familiares e entes queridos nesta semana sagrada.`;
    const p4 = `O resultado alquímico para a sua semana aconselha a dar o passo de fé necessário sem medo do amanhã, pois sua estrela guia está brilhando forte no firmamento.`;
    return {
      reading: `${p1}\n\n${p2}\n\n${p3}\n\n${p4}`,
      guidance: `Decreto Sagrado de Blindagem Semanal: As correntes falsas caem e a sabedoria divina blinda minha alma e meus caminhos.`
    };
  } else if (type === "inteligente") {
    const p1 = `Olá, ${userDisplay}. Unindo a sintonização do seu momento com a força dos arquétipos sorteados (${mainCardsLine}), as cartas expressam o seu momento de vida com grande riqueza de detalhes e sentimentos humanos. Vejo uma força pessoal de autodomínio clamando por ordem e maturidade espiritual para vencer desafios diários.`;
    const p2 = `Sobre sua questão de autoconhecimento: "${question || "Conselho geral sobre meu momento atual"}", as cartas apontam fendas abertas que se curam através do recolhimento saudável e da reflexão equilibrada. Evite fofocas, preocupações com opiniões alheias e afaste-se do convívio com pessoas de baixa vibração energética.`;
    const p3 = `Mantenha sua concentração afiada e canalize seus recursos na sua carreira e bem-estar prático. Você possui os dons necessários para prosperar e manter a cabeça erguida diante do fluxo universal.`;
    return {
      reading: `${p1}\n\n${p2}\n\n${p3}`,
      guidance: `Mantra de Poder de Orbia: ${randomGuidance}`
    };
  } else {
    const p1 = `Consulente ${userDisplay}, a sua tiragem clássica de cartas tradicionais traz a emanação profunda de: ${mainCardsLine}. Cada arquétipo reflete forças milenares e nos ensina lições vivenciais indispensáveis para harmonizar nossa rotina.`;
    const p2 = `Em relação à sua questão ou dúvida: "${question || "Conselho geral"}", o oráculo adverte que fofocas ou desequilíbrios momentâneos no ambiente laboral e familiar devem ser combatidos com prudência e retidão. Não responda à discórdia com a mesma vibração; conserve seu silêncio curativo e seu autodirecionamento maduro.`;
    const p3 = `Aproveite as oportunidades e sintonize seu coração com os sinais que o universo envia no silêncio do seu lar. A colheita de seus esforços será muito rica no tempo certo do cosmo.`;
    return {
      reading: `${p1}\n\n${p2}\n\n${p3}`,
      guidance: `Conselho dos Arcanos Clássicos: ${randomGuidance}`
    };
  }
}

// API: Interpretação de cartas sintonizadas por IA
app.post("/api/tarot/interpret", async (req, res) => {
  const { type, cards, question, userName } = req.body;
  const userDisplay = userName || "Buscador de Sabedoria";

  const cardsListStr = cards && Array.isArray(cards)
    ? cards.map((c: any, index: number) => `Carta ${index + 1}: ${c.cardName} (Foco: ${c.uprightMeaning || ''}. Conselho: ${c.advice || ''})`).join(", ")
    : "uma carta misteriosa";

  let systemPrompt = `Você é Orbia, uma taróloga profissional de verdade, extremamente sensitiva, acolhedora e profundamente humana com anos de experiência em leituras espirituais presenciais. 

Suas respostas NUNCA devem parecer artificiais, frias ou robóticas. Você fala diretamente ao coração do consulente de forma viva, íntima e sincera, como uma taróloga experiente falaria cara a cara, revelando fendas na alma, detalhes ocultos e sentimentos reais.

Nas suas leituras, você deve obrigatoriamente trazer e explorar elementos práticos da vida do consulente:
- O momento atual em que a pessoa se encontra e o que está acontecendo à sua volta.
- O que ela precisa prestar atenção urgente (alertas práticos de comportamento).
- Orientação sobre o que fazer e atitudes a evitar.
- O convívio social e relacionamentos (amigos, pessoas próximas, possíveis tramas).
- Trabalho, carreira, finanças e caminhos de prosperidade.
- Energias ao redor: se atentar contra invejas, fofocas, má vibração ou mal olhado oculto no ambiente se cartas mais pesadas ou espirituais surgirem (como Diabo, Torre, Sacerdotisa, Lua), ensinando formas de se proteger ou manter a cabeça erguida.

Escreva em parágrafos envolventes, fluidos e repletos de sabedoria ancestral em português.`;

  let userPrompt = "";

  if (type === "amor") {
    userPrompt = `Realize uma consulta de Tarot do Amor mística e profundamente humana para ${userDisplay}.
As cartas sorteadas pelo consulente do baralho de costas são: ${cardsListStr}.
A pergunta romântica ou angústia afetiva é: "${question || "Qual o conselho do Tarot para minha vida amorosa no momento?"}".

Como uma taróloga de verdade lendo os segredos do coração, faça uma leitura reveladora. Trate de ciúmes, reciprocidade, pessoas ao redor que podem trazer inveja no romance, caminhos livres ou bloqueados de conexão e dê um norte exato sobre o que fazer e como se blindar espiritualmente.

Gere um JSON exato em português com este formato de chaves:
{
  "reading": "Texto fluido e profundo da sua leitura romântica realista de taróloga real, máximo 280 palavras...",
  "guidance": "Mantra ou sinal espiritual do coração para vibrar positivamente hoje..."
}`;
  } else if (type === "inteligente") {
    userPrompt = `Realize uma consulta de Tarot Inteligente para ${userDisplay} focando em autoconhecimento evolutivo e vida pessoal.
As cartas sorteadas são: ${cardsListStr}.
A questão trazida é: "${question || "Conselho geral sobre meu momento de vida e escolhas"}"

Leia esta dinâmica de forma humana e calorosa. Fale sobre as conexões cotidianas, a rotina profissional, os sabotadores mentais (inveja externa ou autorrecriminação), o que de fato está acontecendo na jornada dela e como canalizar melhor esse caminho prático.

Gere um JSON exato em português com este formato de chaves:
{
  "reading": "Texto de leitura realista e acolhedora da taróloga Orbia, com linguagem humana e sincera, máximo 280 palavras...",
  "guidance": "Um mantra de poder ou atitude mágica personalizada para o dia..."
}`;
  } else if (type === "semanal") {
    userPrompt = `Realize a Leitura do Tarot Semanal Profunda de 10 cartas para ${userDisplay}. 
Esse é um momento de extrema importância e destaque na semana do consulente!
As 10 cartas consagradas que foram sorteadas são: ${cardsListStr}.

Como uma taróloga real em sua mesa sagrada, interprete essa tiragem profunda de 10 cartas! Desenvolva em detalhes ricos:
1. O panorama geral de forças espirituais para esta semana.
2. Trabalho, negócios e caminhos profissionais de prosperidade.
3. Vida amorosa e relações sociais (quem se aproxima, proteção contra falsidades ou invejas na roda de convívio).
4. O que se atentar com máxima urgência, o que fazer para vencer os desafios e o que evitar de qualquer forma.
5. Mensagem de blindagem energética e espiritual.

Dê uma leitura magnífica, ampla, altamente personalizada e muito humana.

Gere um JSON em português com este formato de chaves:
{
  "reading": "Leitura semanal profunda detalhando cada uma das áreas com fluidez e calor humano, em tom de conversa intimista e espiritual de terapeuta e taróloga real, máximo 380 palavras...",
  "guidance": "O grande conselho ou decreto consagrado de luz para guiar e blindar toda a semana de forma impecável..."
}`;
  } else {
    // Tradicional ou fallback clássico
    userPrompt = `Realize uma leitura de Tarot Tradicional Práctico com interpretação clássica refinada para ${userDisplay}.
As cartas sorteadas são: ${cardsListStr}.
Dúvida apresentada: "${question || "Conselho geral dos arquétipos milenares"}"

Interprete de maneira mística, histórica e vivencial os arcanos tirados por ele. Faça a pessoa compreender a força espiritual do herói em sua jornada diária, perigos práticos de fofocas ou traições indicados nos arquétipos, e atitudes positivas para harmonizar seu lar e trabalho.

Gere um JSON exato em português com este formato de chaves:
{
  "reading": "A leitura e correlação clássica detalhada pela taróloga, rica em significados humanos, máximo 280 palavras...",
  "guidance": "Um conselho clássico dos Arcanos ou mantra de sintonização..."
}`;
  }

  try {
    const response = await generateContentWithFallback({
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      }
    });

    const parsed = cleanAndParseJSON(response.text || "{}");
    res.json({
      reading: parsed.reading || generateOfflineTarotReading(type, cards, question, userName).reading,
      guidance: parsed.guidance || generateOfflineTarotReading(type, cards, question, userName).guidance
    });
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    const isRateLimit = errMsg.includes("Limite de requisições excedido") || 
                        errMsg.includes("429") || 
                        errMsg.includes("quota") || 
                        errMsg.includes("Quota") || 
                        errMsg.includes("cooldown") || 
                        errMsg.includes("throttled");

    if (isRateLimit) {
      console.log(`[Tarot Info] Sintonizador astrológico local ativo (Cota da API atingida no momento).`);
    } else {
      console.log("[Tarot Info] Servindo leitura sintonizada offline devido a instabilidade:", errMsg);
    }
    
    // Serve robust, fully custom simulated reading
    const fallbackResult = generateOfflineTarotReading(type, cards, question, userName);
    res.json(fallbackResult);
  }
});

// ====================================================
// BACKEND ADMIN, PREMIUM SCHEMAS & NOTIFICATIONS API
// ====================================================

// Mock database tables (in-memory state persisting throughout container lifecycle)
let mockUsers = [
  { id: "1", name: "Fabricio Souza Santos", email: "fabriciosouzasantos02@gmail.com", role: "Premium Subscriber", status: "Active", birthDate: "1997-02-11", plan: "Celestial VIP", joinDate: "2026-01-10" },
  { id: "2", name: "Ana Beatriz Silva", email: "anabeatriz@example.com", role: "Free User", status: "Active", birthDate: "1999-05-24", plan: "Free Tier", joinDate: "2026-02-15" },
  { id: "3", name: "Carlos Eduardo Oliveira", email: "carlos.edu@example.com", role: "Premium Subscriber", status: "Active", birthDate: "1988-12-03", plan: "Astro Premium", joinDate: "2026-03-22" },
  { id: "4", name: "Mariana Costa", email: "mariana.c@example.com", role: "Basic Subscriber", status: "Inactive", birthDate: "1992-07-15", plan: "Basic Plan", joinDate: "2026-04-01" },
  { id: "5", name: "Lucas Henderson Martins", email: "lucas.henderson@example.com", role: "VIP Elite", status: "Active", birthDate: "2001-10-30", plan: "Celestial VIP", joinDate: "2026-05-18" }
];

let mockPlans = [
  { id: "free", name: "Free Tier", price: "R$ 0", description: "Acesso a mapas básicos e biorritmo padrão diário.", features: ["Mapa Natal Essencial", "Biorritmo Diário"] },
  { id: "basic", name: "Basic Plan", price: "R$ 29,90/mês", description: "Leituras detalhadas mais oráculo celeste offline.", features: ["Tudo do Grátis", "Oráculo Diário Completo", "Histórico de Trânsitos"] },
  { id: "premium", name: "Astro Premium", price: "R$ 49,90/mês", description: "Destaque total de trânsitos avançados e conselheira IA de chat.", features: ["Tudo do Básico", "Chat Conselheira Sem Limites", "Alertas Celestiais por Email"] },
  { id: "vip", name: "Celestial VIP", price: "R$ 99,90/mês", description: "Exclusividade total planetária, consultas e sintonizador de raras notificações de cota infinita.", features: ["Tudo do Premium", "Sintonizador Astrológico Prioritário", "Notificações de Raros Alertas Push + WhatsApp"] }
];

let mockContents = [
  { id: "c1", title: "Trânsito de Vênus em Leão", type: "Alerta Astral", author: "Catarina Médici", status: "Publicado", date: "2026-06-09" },
  { id: "c2", title: "Ciclo Lunar das Aspirações Espirituais", type: "Guia Clássico", author: "Astrologia Core", status: "Publicado", date: "2026-06-08" },
  { id: "c3", title: "Como Ativar a Energia da Casa 12 nos Negócios", type: "Artigo Premium", author: "Mestre Hermes", status: "Rascunho", date: "2026-06-07" },
  { id: "c4", title: "Previsões Astrológicas do Solstício de Inverno", type: "Relatório", author: "Conselheira Celeste", status: "Publicado", date: "2026-06-05" }
];

let mockNotificationsLog = [
  { id: "n1", type: "push", title: "Configurações atualizadas!", message: "Suas coordenadas celestes foram sintonizadas com sucesso.", timestamp: new Date(Date.now() - 500000).toISOString(), read: false },
  { id: "n2", type: "email", title: "Relatório Mensal de Trânsitos", message: "Seu trânsito de junho está pronto. Júpiter ingressou no seu setor de expansão financeira.", timestamp: new Date(Date.now() - 3600000).toISOString(), read: true },
  { id: "n3", type: "alert", title: "Aspecto Raro Detectado", message: "Conjunção exata de Plutão com sua Lua Natal ocorre hoje às 21h.", timestamp: new Date(Date.now() - 7200000).toISOString(), read: false }
];

// 1. User Management Endpoint
app.get("/api/admin/users", (req, res) => {
  res.json(mockUsers);
});

app.post("/api/admin/users/create", (req, res) => {
  const { name, email, plan, birthDate } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Nome e Email são obrigatórios." });
  }
  const newUser = {
    id: String(mockUsers.length + 1),
    name,
    email,
    role: plan === "Celestial VIP" || plan === "Astro Premium" ? "Premium Subscriber" : "Free User",
    status: "Active",
    birthDate: birthDate || "1997-02-11",
    plan: plan || "Free Tier",
    joinDate: new Date().toISOString().split('T')[0]
  };
  mockUsers.push(newUser);
  res.status(201).json(newUser);
});

app.post("/api/admin/users/update", (req, res) => {
  const { id, name, email, plan, status } = req.body;
  const userIndex = mockUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }
  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...(name && { name }),
    ...(email && { email }),
    ...(plan && { plan, role: plan === "Free Tier" ? "Free User" : "Premium Subscriber" }),
    ...(status && { status })
  };
  res.json(mockUsers[userIndex]);
});

app.delete("/api/admin/users/delete", (req, res) => {
  const { id } = req.body;
  const initialLen = mockUsers.length;
  mockUsers = mockUsers.filter(u => u.id !== id);
  if (mockUsers.length === initialLen) {
    return res.status(404).json({ error: "Usuário não encontrado." });
  }
  res.json({ success: true, message: "Usuário deletado." });
});

// 2. Subscription Plans Management Endpoints
app.get("/api/admin/plans", (req, res) => {
  res.json(mockPlans);
});

app.post("/api/admin/plans/update", (req, res) => {
  const { id, name, price, description, features } = req.body;
  const planIndex = mockPlans.findIndex(p => p.id === id);
  if (planIndex === -1) {
    return res.status(404).json({ error: "Plano não encontrado." });
  }
  mockPlans[planIndex] = {
    ...mockPlans[planIndex],
    ...(name && { name }),
    ...(price && { price }),
    ...(description && { description }),
    ...(features && { features })
  };
  res.json(mockPlans[planIndex]);
});

// 3. Content Management Endpoints
app.get("/api/admin/content", (req, res) => {
  res.json(mockContents);
});

app.post("/api/admin/content/create", (req, res) => {
  const { title, type, author, status } = req.body;
  if (!title || !type) {
    return res.status(400).json({ error: "Título e Tipo de conteúdo são obrigatórios." });
  }
  const newContent = {
    id: "c" + (mockContents.length + 1),
    title,
    type,
    author: author || "Curadoria Estelar",
    status: status || "Rascunho",
    date: new Date().toISOString().split('T')[0]
  };
  mockContents.push(newContent);
  res.status(201).json(newContent);
});

app.post("/api/admin/content/update", (req, res) => {
  const { id, title, type, author, status } = req.body;
  const contentIndex = mockContents.findIndex(c => c.id === id);
  if (contentIndex === -1) {
    return res.status(404).json({ error: "Conteúdo não encontrado." });
  }
  mockContents[contentIndex] = {
    ...mockContents[contentIndex],
    ...(title && { title }),
    ...(type && { type }),
    ...(author && { author }),
    ...(status && { status })
  };
  res.json(mockContents[contentIndex]);
});

app.delete("/api/admin/content/delete", (req, res) => {
  const { id } = req.body;
  const initialLen = mockContents.length;
  mockContents = mockContents.filter(c => c.id !== id);
  if (mockContents.length === initialLen) {
    return res.status(404).json({ error: "Conteúdo não encontrado." });
  }
  res.json({ success: true, message: "Conteúdo excluído." });
});

// 4. Statistics Endpoint
app.get("/api/admin/stats", (req, res) => {
  const activeSubs = mockUsers.filter(u => u.role === "Premium Subscriber" && u.status === "Active").length;
  const totalRevenue = activeSubs * 64.9; // Dynamic average revenue
  const cacheHitCount = geminiCache.size;

  res.json({
    totalUsers: mockUsers.length,
    activeSubscribers: activeSubs,
    monthlyRecurringRevenue: `R$ ${totalRevenue.toFixed(2)}`,
    mrrFloat: totalRevenue,
    cacheHits: cacheHitCount,
    apiResponseSuccessRate: "99.8%",
    activeModels: [CHAT_MODEL, "gemini-3.1-flash-lite", "Local Astrological Tuning"],
    userDeviceSplit: { mobile: "78%", desktop: "22%" },
    cacheEntries: Array.from(geminiCache.keys())
  });
});

// 5. Multi-channel Notification Endpoints (Push, Email, Alerts)
app.get("/api/admin/notifications/history", (req, res) => {
  res.json(mockNotificationsLog);
});

app.post("/api/admin/notifications/send", (req, res) => {
  const { type, title, message } = req.body;
  if (!type || !title || !message) {
    return res.status(400).json({ error: "Tipo, Título e Mensagem são obrigatórios." });
  }

  const newLog = {
    id: "n" + (mockNotificationsLog.length + 1),
    type, // "push" | "email" | "alert"
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false
  };

  mockNotificationsLog.unshift(newLog); // Prepend to history

  // Simulate real dispatch console logs
  console.log(`[DISPACHER SISTEMA - NOTIFICAÇÃO ${type.toUpperCase()}]`);
  console.log(`Assunto: ${title}`);
  console.log(`Conteúdo: ${message}`);
  console.log(`-----------------------------------------------`);

  res.status(201).json({
    success: true,
    dispatched: newLog,
    simulationLog: `Notificação enviada com sucesso no canal [${type.toUpperCase()}]`
  });
});

app.post("/api/admin/notifications/read", (req, res) => {
  const { id } = req.body;
  const notif = mockNotificationsLog.find(n => n.id === id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true });
});

// 6. Premium Gateway & Subscription Simulator Endpoint
app.post("/api/payments/subscribe", (req, res) => {
  const { name, email, planId, cardNumber, cvv } = req.body;
  if (!name || !email || !planId) {
    return res.status(400).json({ error: "Nome, Email e ID do plano são necessários para prosseguir." });
  }

  const selectedPlan = mockPlans.find(p => p.id === planId) || mockPlans[2]; // fallback to premium

  // Simulate secure dynamic processing delay & checks
  const transactionId = "TX_" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const timestamp = new Date().toISOString();

  // Find or create user
  let user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    user = {
      id: String(mockUsers.length + 1),
      name,
      email,
      role: "Premium Subscriber",
      status: "Active",
      birthDate: "1997-02-11",
      plan: selectedPlan.name,
      joinDate: new Date().toISOString().split('T')[0]
    };
    mockUsers.push(user);
  } else {
    user.role = "Premium Subscriber";
    user.status = "Active";
    user.plan = selectedPlan.name;
  }

  // Create an automatic internal notification about the custom acquisition
  const notificationMsg = {
    id: "n" + (mockNotificationsLog.length + 1),
    type: "alert",
    title: "Assinatura Sincronizada",
    message: `Parabéns ${name}! Seu plano [${selectedPlan.name}] no valor de ${selectedPlan.price} foi aprovado com a Transação ID ${transactionId}.`,
    timestamp,
    read: false
  };
  mockNotificationsLog.unshift(notificationMsg);

  res.json({
    success: true,
    message: "Assinatura processada com sucesso!",
    transactionId,
    amount: selectedPlan.price,
    planName: selectedPlan.name,
    user,
    receiptUrl: `https://mockpayment-receipt.pdf/astromapping/${transactionId}`
  });
});

// Serve frontend assets in development vs production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Static production assets mounted from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
