import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  UserProfile, 
  AstrologyMap, 
  NumerologyCycle, 
  DreamEntry, 
  DreamInterpretation, 
  CompatibilityResult, 
  ProsperityMap, 
  DailyRadar, 
  DailyMission, 
  DayTrend, 
  ChatMessage, 
  DailyOracleResponse, 
  TarotDrawResult 
} from './types';
import AstrologyView from './components/AstrologyView';
import NumerologyView from './components/NumerologyView';
import CompatibilityView from './components/CompatibilityView';
import TransitMap from './components/TransitMap';
import TransitHistory from './components/TransitHistory';
import MoonTipCard from './components/MoonTipCard';
import AstroNotifications from './components/AstroNotifications';
import TarotSystem from './components/TarotSystem';
import LunarNodes from './components/LunarNodes';
import LunarCycle from './components/LunarCycle';
import BiorhythmView from './components/BiorhythmView';
import UserDashboardPortal from './components/UserDashboardPortal';
import AdminPanel from './components/AdminPanel';
import { 
  Compass, 
  Orbit, 
  Globe, 
  Sparkles, 
  Moon, 
  Sun, 
  User, 
  Star, 
  Settings, 
  Activity, 
  HelpCircle, 
  Calendar, 
  DollarSign, 
  Award, 
  Search, 
  Send, 
  Plus, 
  Trash2, 
  Menu, 
  X, 
  Mail,
  Bell,
  ChevronDown, 
  Check, 
  LogOut, 
  MessageSquare, 
  Share2, 
  Smartphone, 
  RefreshCw, 
  BookOpen, 
  Heart, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Hash,
  Users,
  Home,
  Eye,
  Sliders,
  Camera
} from 'lucide-react';

// Helper functions for user profile metadata
function getZodiacSign(dateStr: string): string {
  if (!dateStr) return "Aquário";
  const date = new Date(dateStr + "T00:00:00");
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquário";
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return "Peixes";
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Áries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Touro";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gêmeos";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Câncer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leão";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgem";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Escorpião";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagitário";
  return "Capricórnio";
}

function getRisingSign(dateStr: string, timeStr: string): string {
  if (!dateStr) return "Sagitário";
  const date = new Date(dateStr + "T00:00:00");
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  let hour = 12;
  let minute = 0;
  if (timeStr && timeStr.includes(':')) {
    const parts = timeStr.split(':');
    hour = parseInt(parts[0], 10) || 12;
    minute = parseInt(parts[1], 10) || 0;
  }
  
  const daysSinceMarch21 = (month * 30 + day - 80 + 360) % 360;
  const raSun = (daysSinceMarch21 / 360) * 24;
  
  const timeSinceNoon = hour + (minute / 60) - 12;
  const lst = (raSun + timeSinceNoon + 24) % 24;
  
  const signs = [
    "Áries", "Touro", "Gêmeos", "Câncer", "Leão", "Virgem", 
    "Libra", "Escorpião", "Sagitário", "Capricórnio", "Aquário", "Peixes"
  ];
  
  const index = Math.floor((lst + 16.5) % 24 / 2) % 12;
  return signs[index];
}

function getLifePathNumber(dateStr: string): number {
  if (!dateStr) return 8;
  const digits = dateStr.replace(/[^0-9]/g, '');
  let sum = digits.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum.toString().split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  return sum;
}

function getLifePathInterpret(num: number): string {
  switch(num) {
    case 1: return "Liderança nata, pioneirismo fecundo e forte iniciativa realizadora original.";
    case 2: return "Diplomacia empática, sensibilidade aguçada e acolhimento pacífico.";
    case 3: return "Expressão criativa fervorosa, comunicação estelar e magnetismo social genuíno.";
    case 4: return "Trabalho virtuoso, estabilidade prática, método, paciência e estrutura robusta.";
    case 5: return "Busca incansável pela liberdade, expedições intelectuais e incrível adaptabilidade.";
    case 6: return "Instintos profundos de afeto, harmonia do lar e responsabilidade restauradora.";
    case 7: return "Análise espiritual, sabedoria oculta, introspecção mística e intuição refinada.";
    case 8: return "Poder pessoal materializador, autoridade executiva sábia e ressonância de justiça.";
    case 9: return "Humanitarismo iluminado, generosidade incondicional e encerramento de ciclos.";
    case 11: return "Idealismo clarividente, inspiração superior e canalização de ideais originais.";
    case 22: return "O grande arquiteto de projetos duradouros que impactam a sociedade coletiva.";
    case 33: return "O guia espiritual supremo voltado ao amor incondicional no plano físico.";
    default: return "Luz estelar orientando seus aprendizados fundamentais na Escola Terrestre.";
  }
}

// Obter informações do dispositivo/navegador reais em tempo real
function getDeviceDescription(): string {
  if (typeof window === 'undefined' || !navigator) return "Acessando o Portal";
  const ua = navigator.userAgent;
  let deviceName = "Computador (Desktop)";
  if (/Android/i.test(ua)) deviceName = "Dispositivo Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) deviceName = "Dispositivo iOS";
  else if (/Windows Phone/i.test(ua)) deviceName = "Dispositivo Windows Phone";
  else if (/Mobile/i.test(ua) || /Tablet/i.test(ua)) deviceName = "Dispositivo Móvel";

  let browserName = "Navegador Web";
  if (ua.indexOf("Firefox") > -1) browserName = "Firefox";
  else if (ua.indexOf("SamsungBrowser") > -1) browserName = "Samsung Browser";
  else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browserName = "Opera";
  else if (ua.indexOf("Edge") > -1 || ua.indexOf("Edg") > -1) browserName = "Microsoft Edge";
  else if (ua.indexOf("Chrome") > -1 && ua.indexOf("Safari") > -1) browserName = "Google Chrome";
  else if (ua.indexOf("Safari") > -1) browserName = "Safari";

  return `${deviceName} (${browserName})`;
}

// Obter aproximação real do local com base no TimeZone do dispositivo
function getRealTimeZoneLocation(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return "Localização Geral";
    const parts = tz.split('/');
    const city = parts[parts.length - 1];
    if (!city) return "Localização Geral";
    
    // Tratando termos comuns de cidades de fuso horário brasileiro de forma limpa e em português
    const cleanCity = city.replace(/_/g, ' ');
    if (cleanCity === "Sao Paulo") return "São Paulo, SP";
    if (cleanCity === "Rio de Janeiro") return "Rio de Janeiro, RJ";
    if (cleanCity === "Fortaleza") return "Fortaleza, CE";
    if (cleanCity === "Recife") return "Recife, PE";
    if (cleanCity === "Salvador") return "Salvador, BA";
    if (cleanCity === "Porto Alegre") return "Porto Alegre, RS";
    if (cleanCity === "Manaus") return "Manaus, AM";
    if (cleanCity === "Cuiaba") return "Cuiabá, MT";
    if (cleanCity === "Belem") return "Belém, PA";
    if (cleanCity === "Fernando de Noronha") return "Fernando de Noronha, PE";
    if (cleanCity === "Araguaina") return "Araguaína, TO";
    if (cleanCity === "Bahia") return "Salvador, BA";
    if (cleanCity === "Maceio") return "Maceió, AL";
    
    return cleanCity;
  } catch {
    return "Sua Região";
  }
}

// Carrega as contas cadastradas do localStorage
function getRegisteredAccounts(): any[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem("orbi_registered_accounts");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Salva a lista de contas no localStorage
function saveRegisteredAccounts(accounts: any[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem("orbi_registered_accounts", JSON.stringify(accounts));
  }
}

export default function App() {
  // Session / Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem("orbi_logged_email");
  });

  const [loggedEmail, setLoggedEmail] = useState<string>(() => {
    if (typeof window === 'undefined') return "";
    return localStorage.getItem("orbi_logged_email") || "";
  });

  const [user, setUser] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      const activeEmail = localStorage.getItem("orbi_logged_email");
      if (activeEmail) {
        const accounts = getRegisteredAccounts();
        const match = accounts.find((acc: any) => acc.email.toLowerCase() === activeEmail.toLowerCase());
        if (match && match.user) {
          return match.user;
        }
      }
    }
    return {
      name: "",
      birthDate: "",
      birthTime: "",
      birthCity: "",
      isUnknownTime: false,
      isPremium: true,
      hasCreatedMap: false
    };
  });

  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const activeEmail = localStorage.getItem("orbi_logged_email");
      if (activeEmail) {
        const accounts = getRegisteredAccounts();
        const match = accounts.find((acc: any) => acc.email.toLowerCase() === activeEmail.toLowerCase());
        if (match && match.user && match.user.hasCreatedMap) return false;
      }
    }
    return true;
  });


  // UI Navigation states
  // 'mapa' | 'constelacoes' | 'planetas' | 'tarot' | 'configuracoes' as specified by the bottom-bar prompt!
  const [activeTab, setActiveTab] = useState<'mapa' | 'constelacoes' | 'planetas' | 'tarot' | 'configuracoes'>('mapa');

  // User navigation journey sub-tabs under the Map tab:
  // 'area_usuario' | 'meu_mapa' | 'criar_meu_mapa' | 'mapas_extras'
  const [mapSubTab, setMapSubTab] = useState<'area_usuario' | 'meu_mapa' | 'criar_meu_mapa' | 'mapas_extras'>('area_usuario');

  // Sub-tab selection inside the "Área do Usuário" itself:
  // 'radar' | 'missao' | 'calendario' | 'cores' | 'amuletos' | 'mensagem' | 'painel_mes' | 'prosperidade' | 'amor' | 'relacionamentos' | 'desenvolvimento' | 'sonhos' | 'oportunidades_hoje' | 'energia_casa' | 'universo_mostrando'
  const [areaSubTab, setAreaSubTab] = useState<'radar' | 'missao' | 'calendario' | 'cores' | 'amuletos' | 'mensagem' | 'painel_mes' | 'prosperidade' | 'amor' | 'relacionamentos' | 'desenvolvimento' | 'sonhos' | 'oportunidades_hoje' | 'energia_casa' | 'universo_mostrando'>('universo_mostrando'); // Start with the premium "O que o universo quer te mostrar" tab active!

  // Active day selection for the smart 30-day calendar map
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(9); // Defaults to June 9th (today!)

  // State to manage extra maps (up to 2 maximum)
  const [extraMaps, setExtraMaps] = useState<any[]>(() => {
    const saved = localStorage.getItem("orbi_extra_maps");
    return saved ? JSON.parse(saved) : [];
  });

  // State to hold extra map astrological/numerological analysis when active
  const [activeExtraMapData, setActiveExtraMapData] = useState<AstrologyMap | null>(null);
  const [activeExtraMapNumerology, setActiveExtraMapNumerology] = useState<any | null>(null);
  const [activeExtraMapName, setActiveExtraMapName] = useState<string>('');
  const [isLoadingExtraMap, setIsLoadingExtraMap] = useState<boolean>(false);

  // Sync extraMaps with localStorage
  useEffect(() => {
    localStorage.setItem("orbi_extra_maps", JSON.stringify(extraMaps));
  }, [extraMaps]);

  // Authentication states
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Submit handlers for account creation / login
  const handleRegisterAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      triggerGlobalNotification("Erro de Cadastro", "Por favor, preencha o E-mail e a Senha de acesso.", "alert");
      return;
    }
    const accounts = getRegisteredAccounts();
    const mailLower = authEmail.trim().toLowerCase();
    const exists = accounts.find((a: any) => a.email.toLowerCase() === mailLower);
    if (exists) {
      triggerGlobalNotification("Conta Existente", "Este e-mail já está cadastrado no Portal Órbita.", "alert");
      return;
    }

    const hasProvidedData = !!createMainName && !!createMainDate;

    const newUserProfile: UserProfile = {
      name: createMainName || "Viajante Estelar",
      birthDate: createMainDate || "",
      birthTime: createMainTime || "",
      birthCity: createMainCity || "",
      isUnknownTime: false,
      isPremium: true,
      hasCreatedMap: hasProvidedData,
      email: mailLower
    };

    const newAccount = {
      email: mailLower,
      password: authPassword,
      user: newUserProfile,
      mapData: null,
      numerology: null,
      extraMaps: []
    };

    accounts.push(newAccount);
    saveRegisteredAccounts(accounts);

    localStorage.setItem("orbi_logged_email", mailLower);
    setLoggedEmail(mailLower);
    setUser(newUserProfile);
    setMapData(null);
    setNumerology(null);
    setExtraMaps([]);
    setIsLoggedIn(true);

    if (hasProvidedData) {
      triggerGenerateMainMap(newUserProfile);
      triggerGlobalNotification("Portal Órbita", "Conta criada e coordenadas astrológicas sintonizadas!", "success");
    } else {
      triggerGlobalNotification("Portal Órbita", "Sua conta foi criada! Complete os dados celestes na área pessoal.", "success");
    }
  };

  const handleLoginAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      triggerGlobalNotification("Erro de Login", "Por favor, digite seu E-mail e Senha de acesso.", "alert");
      return;
    }
    const accounts = getRegisteredAccounts();
    const mailLower = authEmail.trim().toLowerCase();
    const match = accounts.find((a: any) => a.email.toLowerCase() === mailLower && a.password === authPassword);

    if (!match) {
      triggerGlobalNotification("Erro de Acesso", "E-mail ou senha incorretos. Tente novamente.", "alert");
      return;
    }

    localStorage.setItem("orbi_logged_email", mailLower);
    setLoggedEmail(mailLower);
    setUser(match.user);
    setMapData(match.mapData || null);
    setNumerology(match.numerology || null);
    setExtraMaps(match.extraMaps || []);
    setIsLoggedIn(true);

    triggerGlobalNotification("Bem-vindo de Volta", `Olá, ${match.user.name || "novamente ao Portal"}! Sincronização estelar ativa.`, "success");
  };

  // Form states for Create My Map and Extra Maps
  const [createMainName, setCreateMainName] = useState(user.hasCreatedMap ? user.name : "");
  const [createMainDate, setCreateMainDate] = useState(user.hasCreatedMap ? user.birthDate : "");
  const [createMainTime, setCreateMainTime] = useState(user.hasCreatedMap ? (user.birthTime || "") : "");
  const [createMainCity, setCreateMainCity] = useState(user.hasCreatedMap ? (user.birthCity || "") : "");

  useEffect(() => {
    setCreateMainName(user.hasCreatedMap ? user.name : "");
    setCreateMainDate(user.hasCreatedMap ? user.birthDate : "");
    setCreateMainTime(user.hasCreatedMap ? (user.birthTime || "") : "");
    setCreateMainCity(user.hasCreatedMap ? (user.birthCity || "") : "");
  }, [user]);

  const [extraName, setExtraName] = useState('');
  const [extraDate, setExtraDate] = useState('');
  const [extraTime, setExtraTime] = useState('');
  const [extraCity, setExtraCity] = useState('');

  // Handle viewing an extra map by fetching its report
  const triggerGenerateExtraMap = async (extraDetails: any) => {
    setIsLoadingExtraMap(true);
    try {
      const response = await fetch("/api/astrology/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: extraDetails.name,
          birthDate: extraDetails.birthDate,
          birthTime: extraDetails.birthTime || "12:00",
          birthCity: extraDetails.birthCity || "Desconhecida",
          isUnknownTime: false
        })
      });
      const data = await response.json();
      if (data.map) {
        setActiveExtraMapData(data.map);
      }
      if (data.numerology) {
        setActiveExtraMapNumerology(data.numerology);
      }
      setActiveExtraMapName(extraDetails.name);
    } catch (err) {
      console.error("Extra map calculation error:", err);
    } finally {
      setIsLoadingExtraMap(false);
    }
  };

  // Interactive Content states
  const [mapData, setMapData] = useState<AstrologyMap | null>(() => {
    try {
      const saved = localStorage.getItem("orbi_map_data");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [numerology, setNumerology] = useState<NumerologyCycle | null>(() => {
    try {
      const saved = localStorage.getItem("orbi_numerology_data");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (mapData) {
      localStorage.setItem("orbi_map_data", JSON.stringify(mapData));
    }
  }, [mapData]);

  useEffect(() => {
    if (numerology) {
      localStorage.setItem("orbi_numerology_data", JSON.stringify(numerology));
    }
  }, [numerology]);

  useEffect(() => {
    if (isLoggedIn && loggedEmail) {
      localStorage.setItem("orbi_user_profile", JSON.stringify(user));
      const accounts = getRegisteredAccounts();
      const index = accounts.findIndex((a: any) => a.email.toLowerCase() === loggedEmail.toLowerCase());
      if (index !== -1) {
        accounts[index].user = user;
        accounts[index].mapData = mapData;
        accounts[index].numerology = numerology;
        accounts[index].extraMaps = extraMaps;
        saveRegisteredAccounts(accounts);
      }
    }
  }, [user, mapData, numerology, extraMaps, isLoggedIn, loggedEmail]);

  const [isLoadingMain, setIsLoadingMain] = useState<boolean>(false);

  // Sign profiles state for Landing page & Constelações
  const [selectedZodiacSign, setSelectedZodiacSign] = useState<string>("Aquário");

  // Bottom-left bubble notifications list (Simulated dynamic social proof notifications matching PDF "+21.608.314 mapas criados")
  const [bubbleNotification, setBubbleNotification] = useState<string>(
    "Carolina (Rio de Janeiro) acabou de gerar seu Mapa Astral Completo Premium!"
  );

  // Oráculo State
  const [oracleQuestion, setOracleQuestion] = useState<string>('');
  const [oracleResponse, setOracleResponse] = useState<DailyOracleResponse | null>(null);
  const [isQueryingOracle, setIsQueryingOracle] = useState<boolean>(false);
  const [hasQueriedOracleToday, setHasQueriedOracleToday] = useState<boolean>(false);

  // Dream Center / Cofre dos Sonhos State
  const [dreamsHistory, setDreamsHistory] = useState<DreamEntry[]>([
    {
      id: "dream123",
      date: "2026-06-08",
      title: "Voo sobre Montanhas Nevadas",
      description: "Eu estava voando alto sobre picos de montanhas com neve brilhante e sentindo um vento frio no rosto, mas sem medo. Havia uma águia dourada voando ao meu lado me guiando de longe.",
      emotions: ["Paz", "Eufóric"],
      tags: ["vôo", "montanhas", "águia"],
      interpretation: {
        summary: "Seu sonho de voar sobre picos gelados denota um forte desejo de superação intelectual e racionalização de sentimentos difíceis. A presença da águia é um reflexo do seu arquétipo de visão original elevada.",
        mainMeanings: [
          "Desejo de alcançar novas perspectivas profissionais elevados.",
          "Superação de limites mentais anteriormente restritivos.",
          "Seu conselheiro inconsciente impulsionando decisões livres de culpas históricas."
        ],
        symbols: [
          "Vôo livre: Libertação de amarras burocráticas cotidianas.",
          "Neve reluzente: Clareza de pensamento puro e necessidade de isolamento meditativo temporário.",
          "Águia dourada: Autonomia, foco preciso de destino e forte idealismo espiritual."
        ],
        emotionalAspects: "A efervescência de paz sob o voo expõe que sua mente clama por processos originais sem controles alheios.",
        reflections: [
          "Como você pode agir com maior visão empreendedora nos próximos dias?",
          "Quais detalhes da rotina estão roubando sua paz e sua clareza de foco espiritual?"
        ],
        positivePoints: [
          "Ausência completa de sentimentos de pânico ao voar.",
          "Sua capacidade nativa de enxergar soluções inovadoras sob um ângulo abrangente."
        ],
        attentionPoints: [
          "Tendência ao isolamento idealista em excesso.",
          "O perigo de ignorar detalhes práticos por se concentrar apenas na visão macro."
        ],
        advice: "Aproveite esta semana para planejar estratégias para o segundo semestre de 2026. Escreva suas metas e busque autonomia, confiando na sua autoridade mental.",
        finalMessage: "Seus sonhos atestam que sua alma é soberana e clama por voar acima do rebanho comum."
      }
    }
  ]);
  const [newDreamTitle, setNewDreamTitle] = useState<string>('');
  const [newDreamDesc, setNewDreamDesc] = useState<string>('');
  const [newDreamEmotions, setNewDreamEmotions] = useState<string>('Paz, Inspiração');
  const [newDreamTags, setNewDreamTags] = useState<string>('água, vôo');
  const [isInterpretingDream, setIsInterpretingDream] = useState<boolean>(false);
  const [selectedDreamDisplay, setSelectedDreamDisplay] = useState<DreamEntry | null>(null);
  const [dreamSearchKey, setDreamSearchKey] = useState<string>('');

  // AI Counselor (Orbia Chat) State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcomeMsg",
      sender: "assistant",
      text: "Saudações, Fabricio. Eu sou Orbia, sua Conselheira Astrológica e Terapeuta Pessoal de Inteligência Celestial. Nascido com o Sol em Aquário e Ascendente em Sagitário, você traz em sua essência um idealismo ardente e uma reverência inata pela liberdade. Como posso te orientar em seu caminho em 2026?",
      timestamp: "02:37"
    }
  ]);
  const [currentChatInput, setCurrentChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Tarot state
  const [tarotRecord, setTarotRecord] = useState<TarotDrawResult | null>(null);
  const [isDrawingTarot, setIsDrawingTarot] = useState<boolean>(false);
  const [tarotDrawnToday, setTarotDrawnToday] = useState<boolean>(false);

  // Daily Radar and missions (gamified) state
  const [dailyRadar, setDailyRadar] = useState<DailyRadar>({
    date: new Date().toISOString().split('T')[0],
    energyOfDay: "Intuição Harmoniosa & Foco Singular",
    dispositionLevel: 88,
    bestTimeProductivity: "10:00 - 12:30",
    bestTimeRelationships: "18:00 - 20:30",
    bestTimeStudies: "14:15 - 16:45",
    bestTimeOrganization: "08:30 - 09:45"
  });

  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([
    { id: "m1", title: "Meditação Diária de Clareza", description: "Sente-se em silêncio por 5 minutos contemplando a energia inovadora de Vênus em Aquário.", isCompleted: false, points: 50 },
    { id: "m2", title: "Registrar Padrão de Sonho", description: "Guarde seu sonho vivido de hoje no Cofre dos Sonhos.", isCompleted: true, points: 40 },
    { id: "m3", title: "Agradecer uma Amizade Próxima", description: "Fortaleça seu vínculo de amizade enviando uma mensagem genuína sem cobranças.", isCompleted: false, points: 30 }
  ]);

  const [weeklyMissions, setWeeklyMissions] = useState<DailyMission[]>([
    { id: "w1", title: "Esta semana tente resolver uma pendência antiga", description: "Identifique um compromisso pendente há muito tempo e dê o primeiro passo para resolvê-lo, liberando fluxo de Saturno.", isCompleted: false, points: 120 },
    { id: "w2", title: "Esta semana fortaleça um relacionamento importante", description: "Envie uma mensagem sincera de gratidão ou faça um convite de conversa leve a quem você quer bem.", isCompleted: false, points: 150 },
    { id: "w3", title: "Esta semana dedique tempo ao aprendizado", description: "Reserve um tempo concentrado para estudar símbolos astrológicos ou técnicas de clareza mental e meditação.", isCompleted: false, points: 100 }
  ]);
  
  const [scorePoints, setScorePoints] = useState<number>(140);
  
  // Blog / FAQ / Landing views helper
  const [activeLandingSection, setActiveLandingSection] = useState<'home' | 'blog' | 'tarot' | 'faq'>('home');
  const [readingBlogPost, setReadingBlogPost] = useState<number | null>(null);

  // Language settings state
  const [lang, setLang] = useState<'pt' | 'en' | 'es'>('pt');

  // Notifications toggles
  const [notifyDaily, setNotifyDaily] = useState<boolean>(true);
  const [notifyTransit, setNotifyTransit] = useState<boolean>(true);

  // Live premium system notifications toast state
  const [activeToast, setActiveToast] = useState<{ title: string; message: string; type: string } | null>(null);
  
  const triggerGlobalNotification = (title: string, message: string, type: string) => {
    setActiveToast({ title, message, type });
    console.log(`[TOAST] Nova notificação ativa de tipo ${type}: ${title} - ${message}`);
    setTimeout(() => {
      setActiveToast((current) => {
        if (current && current.title === title) return null;
        return current;
      });
    }, 6000);
  };

  const renderLockedSection = (title: string, desc: string) => {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-4 space-y-6 text-center animate-in fade-in duration-300 font-sans select-none">
        <div className="mx-auto w-16 h-16 rounded-full bg-slate-900 border border-amber-500/15 flex items-center justify-center text-xl shadow-lg">
          🔒
        </div>
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-black text-slate-100 uppercase tracking-tight">{title}</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">{desc}</p>
        </div>
        <button
          onClick={() => {
            setMapSubTab('criar_meu_mapa');
            setActiveTab('mapa');
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 rounded-xl text-xs font-black uppercase text-slate-950 shadow-md hover:opacity-100 opacity-90 transition active:scale-95 cursor-pointer"
        >
          Criar Meu Mapa Astral
        </button>
      </div>
    );
  };

  // Fetch / Generate core maps matching user details
  const triggerGenerateMainMap = async (details: any) => {
    setIsLoadingMain(true);
    try {
      const response = await fetch("/api/astrology/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name || user.name,
          birthDate: details.birthDate,
          birthTime: details.birthTime,
          birthCity: details.birthCity,
          isUnknownTime: details.isUnknownTime
        })
      });
      const data = await response.json();
      if (data.map) {
        setMapData(data.map);
      }
      if (data.numerology) {
        setNumerology(data.numerology);
      }
    } catch (err) {
      console.error("Astrology calculation error:", err);
    } finally {
      setIsLoadingMain(false);
    }
  };

  // Run on mount to fetch default map data for Fabricio Souza Santos
  useEffect(() => {
    if (user.hasCreatedMap) {
      triggerGenerateMainMap({
        name: user.name,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthCity: user.birthCity,
        isUnknownTime: user.isUnknownTime
      });
    }

    // Simulate real-time client notifications carousel
    const notificationPhrases = [
      "Carolina (Rio de Janeiro) acabou de recalcular seu Mapa Astral - Placidus!",
      "João Victor (São Paulo) tirou 'A Imperatriz' no Tarô da Semana Premium!",
      "Eduardo (Belo Horizonte) salvou uma afinidade amorosa no Detector de Sinastrias!",
      "Bárbara (Curitiba) interpretou um sonho com água no Cofre de Sonhos com a ajuda da Orbia!",
      "Anônimo acabou de cadastrar seu Mapa Astral Completo. +21.608.318 criado",
      "Larissa acaba de sincronizar as energias diárias no Radar do Dia."
    ];
    let counter = 0;
    const interval = setInterval(() => {
      counter = (counter + 1) % notificationPhrases.length;
      setBubbleNotification(notificationPhrases[counter]);
    }, 11000);

    return () => clearInterval(interval);
  }, []);

  // Update user profile and recalculate everything
  const handleUpdateUserProfile = (updatedDetails: Partial<UserProfile>) => {
    const nextUser = { ...user, ...updatedDetails, hasCreatedMap: true };
    setUser(nextUser);
    triggerGenerateMainMap(nextUser);
  };

  // Submit Dream Handler call to server
  const handleRecordAndInterpretDream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDreamDesc) return;
    setIsInterpretingDream(true);
    
    try {
      const response = await fetch("/api/dreams/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newDreamTitle || "Sonho Sem Título",
          description: newDreamDesc,
          emotions: newDreamEmotions.split(',').map(s => s.trim()),
          tags: newDreamTags.split(',').map(s => s.trim())
        })
      });
      const data = await response.json();
      const nextId = `dream_${Date.now()}`;
      const newEntry: DreamEntry = {
        id: nextId,
        date: new Date().toISOString().split('T')[0],
        title: newDreamTitle || "Sonho Analisado " + new Date().toLocaleDateString(),
        description: newDreamDesc,
        emotions: newDreamEmotions.split(',').map(e => e.trim()),
        tags: newDreamTags.split(',').map(t => t.trim()),
        interpretation: data.interpretation
      };

      setDreamsHistory([newEntry, ...dreamsHistory]);
      setSelectedDreamDisplay(newEntry);
      
      // Clear inputs
      setNewDreamTitle('');
      setNewDreamDesc('');
      
      // Reward points!
      setScorePoints(prev => prev + 40);

    } catch (err) {
      console.error(err);
    } finally {
      setIsInterpretingDream(false);
    }
  };

  // AI Chat counselor handler
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `chat_${Date.now()}`,
      sender: "user",
      text: currentChatInput,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    const messageToSend = currentChatInput;
    setCurrentChatInput('');
    setIsSendingChat(true);

    try {
      const response = await fetch("/api/conselheira/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMessage],
          userProfile: user,
          requestTopic: "geral"
        })
      });
      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        id: `chat_resp_${Date.now()}`,
        sender: "assistant",
        text: data.response,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingChat(false);
    }
  };

  // Oracle hander 1 daily use limit
  const handleAskOracle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oracleQuestion.trim()) return;
    setIsQueryingOracle(true);

    try {
      const response = await fetch("/api/oraculo/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: oracleQuestion })
      });
      const data = await response.json();
      setOracleResponse(data);
      setHasQueriedOracleToday(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsQueryingOracle(false);
    }
  };

  // Tarot drawer
  const handleDrawTarotCard = async () => {
    setIsDrawingTarot(true);
    try {
      const response = await fetch("/api/tarot/draw", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.draw) {
        setTarotRecord(data.draw);
        setTarotDrawnToday(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDrawingTarot(false);
    }
  };

  // complete a user daily goal
  const handleToggleMission = (id: string) => {
    setDailyMissions(prev => 
      prev.map(m => {
        if (m.id === id) {
          const nextCompleted = !m.isCompleted;
          if (nextCompleted) {
            setScorePoints(sc => sc + m.points);
          } else {
            setScorePoints(sc => Math.max(0, sc - m.points));
          }
          return { ...m, isCompleted: nextCompleted };
        }
        return m;
      })
    );
  };

  // Complete a user weekly goal
  const handleToggleWeeklyMission = (id: string) => {
    setWeeklyMissions(prev => 
      prev.map(m => {
        if (m.id === id) {
          const nextCompleted = !m.isCompleted;
          if (nextCompleted) {
            setScorePoints(sc => sc + m.points);
          } else {
            setScorePoints(sc => Math.max(0, sc - m.points));
          }
          return { ...m, isCompleted: nextCompleted };
        }
        return m;
      })
    );
  };

  // Signs profiles list & dynamic horoscope data
  const signsZodiacList = [
    { name: "Áries", symbol: "♈", element: "Fogo", regente: "Marte", traits: "Iniciativa, pioneirismo, vigor, impaciência.", horoscopo: "Hoje é um dia promissor para assumir novos compromissos, porém tenha paciência com respostas burocráticas retardadas." },
    { name: "Touro", symbol: "♉", element: "Terra", regente: "Vênus", traits: "Estabilidade, persistência, sensualidade, teimosia.", horoscopo: "A quadratura lunar sugere revisar gastos apressados. Foque em estabilizar seu solo financeiro." },
    { name: "Gêmeos", symbol: "♊", element: "Ar", regente: "Mercúrio", traits: "Comunicação, versatilidade, curiosidade, dispersão.", horoscopo: "Trocar ideias e debater trará excelentes alianças hoje. Cuidado para não dispersar de suas obrigações primordiais." },
    { name: "Câncer", symbol: "♋", element: "Água", regente: "Lua", traits: "Acolhimento, sensibilidade, memória, melindre.", horoscopo: "Momento propício para resgatar sua nutrição familiar emocional e meditar e registrar seus sonhos." },
    { name: "Leão", symbol: "♌", element: "Fogo", regente: "Sol", traits: "Criatividade, magnetismo, generosidade, orgulho.", horoscopo: "Seu poder pessoal de liderança brilha. Use de empatia nos círculos de negócios para somar forças." },
    { name: "Virgem", symbol: "♍", element: "Terra", regente: "Mercúrio", traits: "Método, aperfeiçoamento, lógica, autocrítica excessiva.", horoscopo: "Organize seus arquivos e cuide de sua rotina de bem estar. Seu corpo pede repouso ativo hoje." },
    { name: "Libra", symbol: "♎", element: "Ar", regente: "Vênus", traits: "Equilíbrio, conciliação, estética, indecisão.", horoscopo: "Uma decisão importante na vida afetiva demanda equilíbrio sincero e transparência de palavras." },
    { name: "Escorpião", symbol: "♏", element: "Água", regente: "Plutão", traits: "Profundidade, transformação, garra, controle.", horoscopo: "Energia investigativa poderosa. Suas visões desmascaram mentiras de imediato. Siga sua clarividência." },
    { name: "Sagitário", symbol: "♐", element: "Fogo", regente: "Júpiter", traits: "Aventura, expansão, sabedoria, autoindulgência.", horoscopo: "Novas possibilidades de viagem ou novos saberes de retórica surgem para inspirar sua mente ávida." },
    { name: "Capricórnio", symbol: "♑", element: "Terra", regente: "Saturno", traits: "Estrutura, dever, resiliência, rigidez.", horoscopo: "Foque em planos pragmáticos de longo prazo. A estabilidade decorre de sua dedicação sistemática." },
    { name: "Aquário", symbol: "♒", element: "Ar", regente: "Urano", traits: "Independência, originalidade, visão social, temperamentalismo.", horoscopo: "Sua audácia vanguardista flui forte em 2026. Recuse dogmas limitadores e busque criar sua própria órbita." },
    { name: "Peixes", symbol: "♓", element: "Água", regente: "Netuno", traits: "Intuição, sensibilidade poética, compaixão, escapismo.", horoscopo: "Seus sonhos estão extraordinariamente falantes hoje. Mantenha papel e caneta ao lado da cama." }
  ];

  // Blog articles content lists
  const blogArticlesList = [
    {
      id: 1,
      title: "O que a Astrologia REALMENTE pode e não pode fazer",
      author: "Orbia Astróloga",
      date: "08 Junho 2026",
      summary: "Descubra como os planetas apenas indicam disposições latentes sem suprimir seu livre-arbítrio espiritual e sua soberania racional.",
      content: "A grande ilusão do determinismo astrológico é supor que você está preso a carimbos celestes intransponíveis. Na verdade, as configurações energéticas mapeadas na hora de seu nascimento servem como correntes eletromagnéticas subliminares. Comandá-las ou ser comandado por elas é onde reside sua dinâmica de autoconhecimento. O Sol em Aquário abre potencialidades originais, mas é a sua consciência racional ativa que pavimenta as escolhas materiais diárias."
    },
    {
      id: 2,
      title: "Como planejar a rotina usando as 4 Fases da Lua",
      author: "Orbia Astróloga",
      date: "05 Junho 2026",
      summary: "Lua Balsâmica, Nova, Crescente, Minguante. Aprenda os melhores períodos na agricultura doméstica, rotina de beleza e lançamentos comerciais.",
      content: "A Lua dita o movimento das marés e o fluxo da seiva das plantas. Em nossa consciência, rege as reações imediatas e a disposição íntima. Lançar projetos audaciosos sob a Lua Nova traz inícios pujantes; revisar e desapegar sob a Lua Balsâmica ou Minguante impede que você acumule tarefas infrutíferas. Alinhar suas missões a esses biorritmos lunares otimiza drasticamente seus resultados diários."
    },
    {
      id: 3,
      title: "Mercúrio Retrógrado em 2026: Datas de Cuidado Puro",
      author: "Orbia Astróloga",
      date: "28 Maio 2026",
      summary: "Guia definitivo das semanas críticas onde eletrônicos, assinaturas contratuais e mal-entendidos de diálogo exigem cautela metódica.",
      content: "O aparente retrocesso de Mercúrio traz à superfície todas as fendas ocultas no sistema de comunicação humana. backups desatualizados apagam-se misteriosamente, e-mails de teor sensível são interpretados com melindre e acordos verbais decaem rapidamente. A recomendação de nossa IA conselheira é ler atenciosamente todas as entrelinhas e evitar assinar transações sem a devida vistoria jurídica detalhada."
    }
  ];

  // FAQ contents
  const faqList = [
    { q: "O que é o sistema Placidus usado para gerar o Mapa?", a: "O sistema Placidus é o método de divisão matemática de casas astrológicas mais testado e difundido na astrologia ocidental desde o século XVII. Ele leva em conta a latitude exata de nascimento para projetar as 12 cúspides no firmamento celeste no instante de seu sopro vital primário." },
    { q: "Quantas consultas ao Oráculo do Dia posso submeter?", a: "Para conservar sua reverência mística e valor terapêutico percebido, o aplicativo limita as respostas profundas do Oráculo do Dia a exatamente uma consulta por dia por usuário." },
    { q: "Meus sonhos analisados no 'Cofre dos Sonhos' são confidenciais?", a: "Sim, absolutamente garantido de forma premium. Todos os seus registros oníricos e interpretações automatizadas por IA ficam criptografados internamente protegendo sua integridade íntima." },
    { q: "Posso criar e calcular o mapa de outras pessoas importantes?", a: "Perfeitamente. Na aba 'Mapa Estelar' sob a categoria 'Mapas Extras', você poderá salvar e consultar o mapa de até 2 outras pessoas queridas com facilidade sem desfigurar seus dados originais de nascimento." }
  ];

  // Biorritmo Calculations
  const calculateBiorhythm = (birthDateStr: string, targetDateStr: string) => {
    try {
      const birth = new Date(birthDateStr);
      const target = new Date(targetDateStr);
      if (isNaN(birth.getTime()) || isNaN(target.getTime())) return { fisico: 50, emocional: 50, intelectual: 50 };
      
      const diffTime = Math.abs(target.getTime() - birth.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Physical: 23 days cycle
      const fisico = Math.round((Math.sin((2 * Math.PI * diffDays) / 23) + 1) * 50);
      // Emotional: 28 days cycle
      const emocional = Math.round((Math.sin((2 * Math.PI * diffDays) / 28) + 1) * 50);
      // Intellectual: 33 days cycle
      const intelectual = Math.round((Math.sin((2 * Math.PI * diffDays) / 33) + 1) * 50);
      
      return { fisico, emocional, intelectual };
    } catch {
      return { fisico: 75, emocional: 62, intelectual: 89 };
    }
  };

  const biorhythmToday = calculateBiorhythm(user.birthDate, new Date().toISOString().split('T')[0]);

  return (
    <div id="star-map-application" className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/20 antialiased relative">
      {/* Floating Global Operations Notification Toast */}
      {activeToast && (
        <div className="fixed top-14 right-6 z-[100] max-w-sm w-full bg-[#0a1124]/95 border border-amber-500/30 p-4 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-md animate-in slide-in-from-right duration-300 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-100/5 border border-slate-800 mt-0.5">
            {activeToast.type === 'push' && <Smartphone className="w-5 h-5 text-[#E5C158]" />}
            {activeToast.type === 'email' && <Mail className="w-5 h-5 text-[#E5C158]" />}
            {activeToast.type === 'alert' && <Bell className="w-5 h-5 text-[#E5C158]" />}
            {activeToast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-[9px] font-bold text-[#E5C158] font-mono leading-none uppercase tracking-wider">
              {activeToast.type === 'email' ? '📬 E-mail Simulado' : activeToast.type === 'push' ? '📲 Push Notification' : '🔔 Alerta de Órbita'}
            </h5>
            <h4 className="text-xs font-sans font-bold text-white mt-1.5 leading-snug">{activeToast.title}</h4>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">{activeToast.message}</p>
          </div>
          <button onClick={() => setActiveToast(null)} className="text-slate-400 hover:text-white shrink-0 p-0.5 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Cosmic Backing Particle Light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[10%] left-[20%] w-[450px] h-[450px] rounded-full bg-blue-900/10 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[15%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-950/10 blur-[150px]" />
        <div className="absolute top-[50%] right-[30%] w-[300px] h-[300px] rounded-full bg-purple-950/10 blur-[110px]" />
      </div>

      {/* Global Iframe Notice Guard */}
      <div className="bg-amber-500/10 border-b border-amber-500/15 py-1.5 text-center text-[10px] font-mono text-amber-500 tracking-wide sticky top-0 z-50 backdrop-blur-sm">
        🛡️ Star Map Premium Portal · Versão Ativa v4.1.5 · Antigravity Core
      </div>

      {/* ========================================= */}
      {/* 1. PUBLIC LANDING VIEW (User Not Logged In) */}
      {/* ========================================= */}
      {!isLoggedIn ? (
        <div id="landing-page" className="relative z-10 space-y-16 pb-24">
          
          {/* Header Bar */}
          <nav className="w-full max-w-7xl mx-auto px-4 py-5 flex items-center justify-between border-b border-slate-900/80">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span className="text-sm font-black font-sans tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500">
                STAR MAP
              </span>
            </div>
            
            <div className="hidden md:flex gap-6 text-xs font-medium text-slate-400">
              <button onClick={() => setActiveLandingSection('home')} className="hover:text-amber-400 transition">Meu Mapa Astral</button>
              <button href="#signs-selection" className="hover:text-amber-400 transition" onClick={() => {
                document.getElementById('signs-selection')?.scrollIntoView({ behavior: 'smooth' });
              }}>12 Signos</button>
              <button href="#tarot-preview" className="hover:text-amber-400 transition" onClick={() => {
                document.getElementById('tarot-preview')?.scrollIntoView({ behavior: 'smooth' });
              }}>Experimentar Tarô</button>
              <button href="#blog-section" className="hover:text-amber-400 transition" onClick={() => {
                document.getElementById('blog-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>Artigos</button>
              <button href="#faq-section" className="hover:text-amber-400 transition" onClick={() => {
                document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
              }}>Perguntas Frequentes</button>
            </div>

            <button 
              onClick={() => setIsLoggedIn(true)}
              className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition duration-300"
            >
              Entrar no Portal Premium
            </button>
          </nav>

          {/* Core Hero Block & Calculator Form */}
          <div className="w-full max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 pt-6">
            
            {/* Slogan and Social Proof */}
            <div className="lg:col-span-6 space-y-6 flex flex-col justify-center">
              <span className="px-3.5 py-1 rounded-full text-[10px] uppercase font-mono font-semibold tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 self-start">
                Constelações, Sinastria & Oráculo Completo
              </span>
              <h1 className="text-3xl md:text-5xl font-sans font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-slate-50 via-slate-100 to-slate-300 leading-tight">
                SEU MAPA PODE REVELAR MAIS DO QUE VOCÊ IMAGINA
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                Descubra os padrões ocultos da sua vida. Desde segredos oníricos e biorritmos matemáticos até sinastria de relacionamentos profundos no maior portal de astrologia científica com tecnologia Gemini.
              </p>

              {/* Created charts real-time statistics counter */}
              <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-850 flex items-center gap-4 max-w-md">
                <div className="p-2.5 rounded-full bg-amber-500/10 text-amber-500">
                  <Globe className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <div className="text-lg font-mono font-black text-amber-400">+21.608.314</div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest leading-none mt-1">Mapas calculados em tempo real</div>
                </div>
              </div>

              {/* Mockup Frame showing Application store details */}
              <div id="downloads-badges" className="flex flex-wrap gap-3 items-center pt-2">
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 cursor-pointer transition">
                  <Smartphone className="w-4 h-4 text-amber-500" />
                  <div className="text-left font-sans text-[10px] leading-tight">
                    <span className="text-slate-500 block text-[8px] uppercase">Baixar no</span>
                    <strong>Google Play Store</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:border-slate-700 cursor-pointer transition">
                  <Smartphone className="w-4 h-4 text-rose-400" />
                  <div className="text-left font-sans text-[10px] leading-tight">
                    <span className="text-slate-500 block text-[8px] uppercase">Disponível na</span>
                    <strong>Apple App Store</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Centered High conversion registration card */}
            <div id="auth-card" className="lg:col-span-6 bg-slate-900/40 p-6 sm:p-8 rounded-[36px] border border-amber-500/15 backdrop-blur-md shadow-2xl space-y-6 relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[90px] pointer-events-none" />
              
              <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    // Reset fields for fresh registration
                    setAuthEmail('');
                    setAuthPassword('');
                    setCreateMainName('');
                    setCreateMainDate('');
                    setCreateMainTime('');
                    setCreateMainCity('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition duration-300 cursor-pointer ${
                    authTab === 'register' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Cadastrar Conta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setAuthEmail('');
                    setAuthPassword('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition duration-300 cursor-pointer ${
                    authTab === 'login' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Entrar (Já tenho Conta)
                </button>
              </div>

              {authTab === 'register' ? (
                <>
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2.5">
                      <Star className="w-5 h-5 text-amber-500 animate-pulse fill-amber-500/20" />
                      Crie sua Conta & Mapa Astral
                    </h3>
                    <p className="text-xs text-slate-400">Cadastre-se para salvar os seus dados celestes de forma segura.</p>
                  </div>

                  <form onSubmit={handleRegisterAccountSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1.5">Seu E-mail</label>
                        <input 
                          type="email" 
                          required 
                          placeholder="e.g. maria@provedor.com"
                          value={authEmail}
                          onChange={(e) => setAuthEmail(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-850 font-sans text-xs text-slate-200 focus:outline-hidden focus:border-amber-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1.5">Senha de Acesso</label>
                        <input 
                          type="password" 
                          required 
                          placeholder="Defina uma senha"
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-850 font-sans text-xs text-slate-200 focus:outline-hidden focus:border-amber-500/50"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-850 my-2 pt-4">
                      <div className="text-[10px] uppercase font-mono tracking-widest text-slate-450 mb-3 block">Dados Celestes de Nascimento</div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Nome Completo</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Seu nome completo"
                            value={createMainName}
                            onChange={(e) => setCreateMainName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-850 font-sans text-xs text-slate-200 focus:outline-hidden focus:border-amber-500/50"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Data de Nascimento</label>
                            <input 
                              type="date" 
                              required
                              value={createMainDate}
                              onChange={(e) => setCreateMainDate(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-850 font-sans text-xs text-slate-200 focus:outline-hidden"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest">Horário</label>
                            </div>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. 15:30"
                              value={createMainTime}
                              onChange={(e) => setCreateMainTime(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-850 font-sans text-xs text-slate-200 focus:outline-hidden focus:border-amber-500/50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">Cidade e Estado de Nascimento</label>
                          <input 
                            type="text" 
                            required
                            placeholder="e.g. São Paulo, SP"
                            value={createMainCity}
                            onChange={(e) => setCreateMainCity(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-850 font-sans text-xs text-slate-200 focus:outline-hidden focus:border-amber-500/50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button 
                        type="submit"
                        className="w-full py-3.5 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-98 shadow-xl shadow-amber-500/10 cursor-pointer"
                      >
                        Cadastrar e Sintonizar Agora
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2.5">
                      <Star className="w-5 h-5 text-amber-500 animate-pulse fill-amber-500/20" />
                      Acesse sua Conta
                    </h3>
                    <p className="text-xs text-slate-400">Insira seu e-mail e senha cadastrados para entrar no portal.</p>
                  </div>

                  <form onSubmit={handleLoginAccountSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1.5">Seu E-mail</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="e.g. maria@provedor.com"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-850 font-sans text-xs text-slate-200 focus:outline-hidden focus:border-amber-500/50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-mono text-amber-400 uppercase tracking-widest mb-1.5">Senha de Acesso</label>
                      <input 
                        type="password" 
                        required 
                        placeholder="Digite sua senha"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-850 font-sans text-xs text-slate-200 focus:outline-hidden focus:border-amber-500/50"
                      />
                    </div>

                    <div className="pt-2">
                       <button 
                        type="submit"
                        className="w-full py-3.5 rounded-2xl bg-linear-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider transition-all duration-300 active:scale-98 shadow-xl shadow-amber-500/10 cursor-pointer"
                      >
                        Entrar no Portal Premium
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* Secure encrypted credentials badge */}
              <div className="space-y-3 pt-3 border-t border-slate-850">
                <div className="text-center text-[9px] font-mono text-slate-500 uppercase tracking-widest leading-normal">
                  🔒 Autenticação do Portal Criptografada localmente no seu dispositivo.
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Signs carousel / selector list */}
          <div id="signs-selection" className="w-full max-w-7xl mx-auto px-4 space-y-6 pt-8 scroll-mt-20">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold">12 Constelações Zodiacais</span>
              <h2 className="text-xl md:text-2xl font-sans font-extrabold text-slate-100">Visualize as Vibrações de Cada Signo</h2>
              <p className="text-xs text-slate-405 max-w-xl mx-auto">Explore as características essenciais, astros regentes e receba previsões gratuitas diárias.</p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2 max-w-5xl mx-auto">
              {signsZodiacList.map((sz) => (
                <button
                  key={sz.name}
                  onClick={() => setSelectedZodiacSign(sz.name)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedZodiacSign === sz.name 
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-lg' 
                      : 'bg-slate-900/60 border-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-lg block mb-0.5">{sz.symbol}</span>
                  <span className="text-[9px] font-bold font-sans block truncate">{sz.name}</span>
                </button>
              ))}
            </div>

            {/* Selected Sign Details Card */}
            {(() => {
              const currentSign = signsZodiacList.find(s => s.name === selectedZodiacSign);
              if (!currentSign) return null;
              return (
                <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-slate-900/40 border border-slate-850 flex flex-col md:flex-row gap-6 relative overflow-hidden animate-in fade-in duration-300">
                  <div className="space-y-4 md:w-1/2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl text-amber-400">{currentSign.symbol}</span>
                      <div>
                        <h4 className="text-lg font-bold text-slate-100">{currentSign.name}</h4>
                        <span className="text-[10px] uppercase tracking-widest font-mono text-slate-500">{currentSign.element} · Regido por {currentSign.regente}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <strong className="text-[10px] font-mono text-slate-500 uppercase tracking-wide block">Temperamento Essencial:</strong>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentSign.traits}</p>
                    </div>

                    <div className="pt-2">
                      <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-[10px] rounded-full text-amber-500 block text-center md:inline-block">
                        Disponível no Portal Completo
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-850 md:w-1/2 flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-mono font-bold text-amber-500 tracking-wider">Horóscopo do Dia</span>
                      <p className="text-xs text-slate-400 leading-relaxed mt-2 italic font-serif">
                        "{currentSign.horoscopo}"
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono mt-4 border-t border-slate-850 pt-2 text-right">
                      Sincronizado: 2026-06-09T02:37:10Z
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Tarot Preview Section (Interactive weekly tarot) */}
          <div id="tarot-preview" className="w-full max-w-7xl mx-auto px-4 space-y-6 pt-8 scroll-mt-20">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-widest text-rose-450 font-bold">Arcanos Maiores e Conselhos</span>
              <h2 className="text-xl md:text-2xl font-sans font-extrabold text-slate-100">Leitura Semanal Recomendada</h2>
              <p className="text-xs text-slate-450 max-w-xl mx-auto">Embarque em uma leitura simulada e sinta o poder das previsões poéticas calculadas para a sua semana.</p>
            </div>

            <div className="max-w-xl mx-auto p-6 rounded-3xl bg-linear-to-r from-slate-950 to-indigo-950/30 border border-rose-500/15 text-center space-y-6">
              {!tarotRecord ? (
                <div className="space-y-4">
                  <div className="w-20 h-32 bg-slate-900 border-2 border-rose-500/30 rounded-2xl mx-auto flex items-center justify-center animate-bounce text-2xl relative shadow-2xl">
                    🔮
                    <div className="absolute inset-2 border border-rose-500/10 rounded-xl" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-200">Qual é a sua energia guia para os próximos 7 dias?</h4>
                  <button 
                    onClick={handleDrawTarotCard}
                    disabled={isDrawingTarot}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-100 font-sans font-bold text-xs uppercase tracking-wider rounded-xl transition"
                  >
                    {isDrawingTarot ? "Puxando Conselhos..." : "Sorteie Sua Carta Semanal"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 text-left animate-in fade-in duration-300">
                  <div className="flex gap-4 flex-wrap md:flex-nowrap">
                    <img 
                      src={tarotRecord.imageUrl} 
                      alt={tarotRecord.cardName} 
                      className="w-24 h-36 object-cover rounded-xl border border-rose-500/40 shadow-md mx-auto"
                    />
                    <div className="space-y-2 flex-1">
                      <span className="text-[9px] uppercase font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                        Carta Sorteada
                      </span>
                      <h4 className="text-base font-black text-slate-105">{tarotRecord.cardName}</h4>
                      <p className="text-[11px] text-slate-350 italic">"{tarotRecord.uprightMeaning}"</p>
                      
                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-850 text-[10px] text-slate-400 leading-relaxed">
                        <strong>Conselho da Semana:</strong> {tarotRecord.advice}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-850">
                    <button 
                      onClick={() => setTarotRecord(null)}
                      className="text-[10px] font-mono text-rose-400 hover:text-rose-350 uppercase"
                    >
                      ← Sortear Outra Carta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* O que é o mapa astral explanation */}
          <div className="w-full max-w-4xl mx-auto px-4 py-8 bg-slate-900/20 rounded-3xl border border-slate-850 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="p-6 text-center text-4xl bg-gradient-to-tr from-amber-500/5 to-amber-500/15 rounded-3xl border border-amber-500/10">
              🌌
              <div className="text-sm font-bold text-amber-500 font-mono mt-3">PROJETO COSMIC PLACIDUS</div>
              <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">Coordenadas celestes, horas e latitudes precisas de nascimento determinam ressonâncias autênticas.</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-slate-100">O que é um Mapa Astral?</h3>
              <p className="text-xs text-slate-400 leading-relaxed leading-[1.7]">
                Seu Mapa Astral funciona como uma representação estática exata do firmamento planetário vistos na terra no instante de seu primeiro fôlego de ar terrestre. Ele aponta como Sol, Lua e os outros planetas se espelham em signos e determinam os eixos de vivências das suas doze casas terrenas fundamentais.
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>· Sol denota seu ego básico e energia central vibrante.</li>
                <li>· Lua dita o subconsciente íntimo e a assimilativa reativa.</li>
                <li>· Ascendente expõe a casca física social de entrada no mundo.</li>
              </ul>
            </div>
          </div>

          {/* Blog posts articles carousel */}
          <div id="blog-section" className="w-full max-w-7xl mx-auto px-4 space-y-6 pt-4 scroll-mt-20">
            <div className="text-center space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">Conteúdos Notáveis</span>
              <h2 className="text-xl md:text-2xl font-sans font-extrabold text-slate-100">Biblioteca da Consciência Completa</h2>
              <p className="text-xs text-slate-400 max-w-xl mx-auto">Leia guias produzidos por astrólogos licenciados abordando transições de energia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {blogArticlesList.map((art) => (
                <div key={art.id} className="p-5 bg-slate-900/40 rounded-3xl border border-slate-850 flex flex-col justify-between space-y-4 hover:border-slate-800 transition">
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-slate-505 block uppercase">{art.author} · {art.date}</span>
                    <h4 className="text-sm font-bold text-slate-200">{art.title}</h4>
                    <p className="text-xs text-slate-450 leading-relaxed line-clamp-3">{art.summary}</p>
                  </div>

                  <button
                    onClick={() => setReadingBlogPost(art.id)}
                    className="text-xs text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Ler Artigo Completo <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Blog reader drawer popup */}
          {readingBlogPost !== null && (() => {
            const art = blogArticlesList.find(a => a.id === readingBlogPost);
            if (!art) return null;
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-2xl max-h-[80vh] overflow-y-auto space-y-4 relative">
                  <button 
                    onClick={() => setReadingBlogPost(null)}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <span className="text-[9px] font-mono text-amber-500 uppercase">{art.author} · {art.date}</span>
                  <h3 className="text-lg font-bold text-slate-100 pr-8">{art.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed leading-[1.8] font-sans whitespace-pre-line bg-slate-950 p-4 rounded-xl border border-slate-850">
                    {art.content}
                  </p>

                  <div className="flex justify-end pt-2">
                    <button 
                      onClick={() => setReadingBlogPost(null)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl"
                    >
                      Fechar Leitor
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Interactive FAQs Accordion */}
          <div id="faq-section" className="w-full max-w-3xl mx-auto px-4 space-y-6 pt-4 scroll-mt-20">
            <h3 className="text-center text-sm font-bold font-mono uppercase text-slate-500 tracking-widest">Perguntas Frequentes</h3>
            
            <div className="space-y-4">
              {faqList.map((faq, index) => (
                <div key={index} className="p-4 rounded-2xl bg-slate-900/30 border border-slate-850">
                  <h4 className="text-xs font-bold text-slate-250 mb-1 flex items-center gap-1.5">
                    <span className="text-amber-500 font-mono">Q.</span>
                    {faq.q}
                  </h4>
                  <p className="text-[11px] text-slate-455 leading-relaxed pl-4 border-l border-amber-500/20">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Footer */}
          <footer className="w-full border-t border-slate-900 pt-12 pb-16">
            <div className="w-full max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span>✨</span>
                  <span className="text-sm font-black tracking-widest text-[#F59E0B]">STAR MAP</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  © 2011-2026 Star Map S.A. Todos os direitos reservados. Projeto computado usando o sistema Placidus. Criptografia ativa.
                </p>
              </div>

              <div>
                <h4 className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-3">Privacidade & Termos</h4>
                <ul className="text-[11px] text-slate-500 space-y-2">
                  <li><a className="hover:text-slate-350 cursor-pointer">Termos de Uso</a></li>
                  <li><a className="hover:text-slate-350 cursor-pointer">Políticas de Cookies</a></li>
                  <li><a className="hover:text-slate-350 cursor-pointer">Exclusão de Dados</a></li>
                  <li><a className="hover:text-slate-350 cursor-pointer">Segurança de Dados Oníricos</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-3">Recursos Oferecidos</h4>
                <ul className="text-[11px] text-slate-500 space-y-2 font-sans">
                  <li><a className="hover:text-amber-400 cursor-pointer">Contate o Suporte</a></li>
                  <li><a className="hover:text-slate-350 cursor-pointer">Planos de Assinatura</a></li>
                  <li><a className="hover:text-slate-350 cursor-pointer">Exemplo de Relatório PDF</a></li>
                  <li><a className="hover:text-slate-350 cursor-pointer">Acesso de Desenvolvedores</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-[10px] font-mono uppercase text-slate-400 tracking-wider mb-3 font-semibold">Idioma do Portal</h4>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-[10px] text-slate-400 focus:outline-hidden"
                >
                  <option value="pt">Português (Brasil)</option>
                  <option value="en">English (United States)</option>
                  <option value="es">Español (Castellano)</option>
                </select>
              </div>
            </div>
          </footer>

          {/* Simulated bubble notification slide popup */}
          <div className="fixed bottom-6 left-6 z-40 max-w-sm p-4 bg-slate-900 border border-amber-500/20 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <span className="p-2 h-9 w-9 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-sm">🔔</span>
            <div className="space-y-0.5">
              <span className="text-[8px] font-mono uppercase text-amber-500 block leading-none">Ressonância Ativa</span>
              <p className="text-[10.5px] text-slate-300 font-sans leading-snug">{bubbleNotification}</p>
            </div>
          </div>

        </div>
      ) : (
        // =========================================
        // 2. LOGGED-IN PORTAL DASHBOARD (isLoggedIn = TRUE)
        // =========================================
        <div id="premium-dashboard" className="relative z-10 pb-28">
          
          {/* TELA DE BOAS-VINDAS ONBOARDING OVERLAY */}
          {showWelcome && !user.hasCreatedMap && (
            <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[150] flex items-center justify-center p-4">
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20 max-w-lg w-full rounded-3xl p-6 md:p-8 space-y-6 text-center shadow-[0_0_50px_rgba(245,158,11,0.15)] relative overflow-hidden animate-in zoom-in-95 duration-300">
                
                {/* Absolute decorative star lights */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/[0.04] rounded-full blur-3xl pointer-events-none" />
                
                <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shadow-lg relative border border-amber-400/20">
                  <Orbit className="w-8 h-8 text-slate-950 animate-spin" style={{ animationDuration: '30s' }} />
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-extrabold block">Coordenadas Primordiais</span>
                  <h2 className="text-2xl font-sans font-extrabold text-slate-50 tracking-tight">Bem-vindo ao Star Map</h2>
                  <p className="text-xs text-slate-350 leading-relaxed font-sans max-w-sm mx-auto">
                    Crie seu mapa astral e descubra informações exclusivas sobre sua personalidade, relacionamentos, prosperidade, ciclos e tendências futuras de forma 100% personalizada.
                  </p>
                </div>

                {/* Benefit small cards badge style */}
                <div className="grid grid-cols-2 gap-2 text-[10px] text-left">
                  <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-xl flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">✨</span>
                    <div>
                      <span className="font-bold text-slate-205 block font-sans">DNA Cósmico</span>
                      <span className="text-slate-400 text-[9px] font-sans">Placidus completo</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-955/60 border border-slate-850 rounded-xl flex items-start gap-2">
                    <span className="text-rose-455 mt-0.5">💖</span>
                    <div>
                      <span className="font-bold text-slate-205 block font-sans">Sinergia Social</span>
                      <span className="text-slate-400 text-[9px] font-sans">Compatibilidade real</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowWelcome(false);
                      setMapSubTab('criar_meu_mapa');
                      setActiveTab('mapa');
                    }}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:opacity-100 opacity-90 text-slate-950 font-black text-xs font-sans uppercase tracking-wider rounded-xl transition shadow-lg active:scale-95 cursor-pointer"
                  >
                    CRIAR MEU MAPA
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowWelcome(false);
                      setMapSubTab('area_usuario');
                      setActiveTab('mapa');
                    }}
                    className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 font-bold text-xs font-sans uppercase tracking-wider rounded-xl border border-slate-850 transition cursor-pointer"
                  >
                    CONHECER A PLATAFORMA
                  </button>
                </div>

              </div>
            </div>
          )}
          
          {/* Floating Moon Tip Dashboard Card */}
          <MoonTipCard 
            userName={user?.name} 
            birthDate={user?.birthDate} 
            onRewardPoints={(amount) => setScorePoints(prev => prev + amount)}
          />
          
          {/* Top User Status Header */}
          <header className="w-full bg-slate-900/60 border-b border-slate-850 px-4 py-4 sticky top-0 z-40 backdrop-blur-md">
            <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
              
              <div className="flex items-center gap-3">
                {/* Custom User avatar & profile metadata list */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-500 to-rose-600 text-slate-950 flex items-center justify-center font-bold text-sm">
                    {user.hasCreatedMap ? user.name.slice(0, 2).toUpperCase() : "✨"}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" title="Ativo" />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs font-bold text-slate-205">{user.hasCreatedMap ? user.name : "Visitante"}</h3>
                    <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded-sm text-[8px] uppercase font-mono tracking-wider text-amber-400 font-black">
                      {user.hasCreatedMap ? "Premium Ativo" : "Novo Explorador"}
                    </span>
                  </div>
                  <p className="text-[9px] font-mono text-slate-500 leading-none mt-1">
                    {user.hasCreatedMap ? (
                      `Sol em ${mapData?.astros?.find(a => a.name === "Sol")?.sign || getZodiacSign(user.birthDate)} · Asc ${mapData?.astros?.find(a => a.name === "Ascendente")?.sign || getRisingSign(user.birthDate, user.birthTime)} · ${user.birthCity}`
                    ) : (
                      `${getDeviceDescription()} · Fuso Horário: ${getRealTimeZoneLocation()}`
                    )}
                  </p>
                </div>
              </div>

              {/* Score / Balance stats widget */}
              <div className="flex items-center gap-4">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-right hidden sm:block">
                  <span className="text-[8px] font-mono text-slate-500 uppercase block">Pontos Estelares</span>
                  <span className="text-xs font-bold font-mono text-amber-400">{scorePoints} pts</span>
                </div>

                <AstroNotifications 
                  userName={user?.name} 
                  birthDate={user?.birthDate} 
                  onRewardPoints={(amount) => setScorePoints(prev => prev + amount)} 
                />

                <button 
                  onClick={() => {
                    localStorage.removeItem("orbi_logged_email");
                    setLoggedEmail("");
                    setUser({
                      name: "",
                      birthDate: "",
                      birthTime: "",
                      birthCity: "",
                      isUnknownTime: false,
                      isPremium: true,
                      hasCreatedMap: false
                    });
                    setMapData(null);
                    setNumerology(null);
                    setExtraMaps([]);
                    setIsLoggedIn(false);
                    triggerGlobalNotification("Portal Sair", "Sessão encerrada com sucesso.", "alert");
                  }}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-850 text-slate-500 hover:text-slate-350 transition active:scale-95"
                  title="Sair do Portal"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </header>

          {/* Dashboard Main Area Grid layout */}
          <main className="w-full max-w-7xl mx-auto px-4 py-8">
            
            {/* TAB 1: MAPA ESTELAR (Astrology, Numerology, Compatibility, Dashboard Premium) */}
            {activeTab === 'mapa' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* SUB NAVIGATION FOR MAP SECTIONS */}
                <div className="flex flex-wrap justify-center gap-1.5 md:gap-3 bg-slate-950/70 p-1.5 rounded-full border border-slate-850/80 max-w-2xl mx-auto mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setMapSubTab('area_usuario');
                      setActiveExtraMapData(null); // clear viewed extra map
                    }}
                    className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      mapSubTab === 'area_usuario'
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Área do Usuário</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMapSubTab('meu_mapa');
                      setActiveExtraMapData(null); // clear viewed extra map
                    }}
                    className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      mapSubTab === 'meu_mapa'
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Meu Mapa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMapSubTab('criar_meu_mapa');
                      setActiveExtraMapData(null); // clear viewed extra map
                    }}
                    className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      mapSubTab === 'criar_meu_mapa'
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Criar Meu Mapa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMapSubTab('mapas_extras')}
                    className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      mapSubTab === 'mapas_extras'
                        ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }`}
                  >
                    <Orbit className="w-3.5 h-3.5" />
                    <span>Mapas Extras</span>
                  </button>
                </div>

                {isLoadingMain && mapSubTab !== 'mapas_extras' ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <RefreshCw className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                    <p className="text-xs font-mono">Calculando Placidus em tempo real...</p>
                  </div>
                ) : (
                  <>
                    {/* SUB-SECTION 1: ÁREA DO USUÁRIO */}
                    {mapSubTab === 'area_usuario' && (
                      !user.hasCreatedMap ? (
                        renderLockedSection(
                          "Área do Usuário Sintonizada",
                          "Seu painel pessoal de previsões diárias, missões, trânsitos em tempo real, caminhos numerológicos, afinidades de amor e relógio cósmico depende da inicialização do seu mapa de nascimento. Sintonize suas estrelas para habilitar."
                        )
                      ) : (
                        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300 text-left">
                          {/* Premium Header Profile Bento Card */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-850 shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none" />
                          
                          {/* Profile Photo Icon Layout */}
                          <div className="md:col-span-4 flex flex-col items-center text-center space-y-4 border-r border-slate-850/60 pr-0 md:pr-6 justify-center py-2">
                            <div className="relative group">
                              <div className="absolute inset-x-0 -inset-y-0.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 rounded-full blur-sm opacity-60 group-hover:opacity-100 transition duration-1000 animate-pulse" />
                              <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-amber-400 bg-slate-950 flex items-center justify-center shadow-2xl">
                                {user.profilePhoto ? (
                                  <img 
                                    src={user.profilePhoto} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover relative z-10"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <>
                                    <div className="absolute inset-0 bg-radial-gradient from-indigo-950 via-slate-950 to-black opacity-90" />
                                    <svg className="absolute inset-0 w-full h-full opacity-35 select-none pointer-events-none" viewBox="0 0 100 100">
                                      <circle cx="50" cy="50" r="40" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1" strokeDasharray="3, 3" fill="none" />
                                      <circle cx="30" cy="20" r="0.8" fill="#fff" />
                                      <circle cx="80" cy="40" r="1.2" fill="#fff" />
                                      <circle cx="20" cy="70" r="1" fill="#fff" />
                                      <circle cx="75" cy="80" r="0.5" fill="#fff" />
                                    </svg>
                                    <div className="relative z-10 flex flex-col items-center">
                                      <span className="text-3xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-rose-300 tracking-tighter">
                                        {user.name.slice(0, 2).toUpperCase()}
                                      </span>
                                      <Sparkles className="w-4 h-4 text-amber-400/85 mt-1 animate-pulse" />
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              <label className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-gradient-to-br from-amber-500 to-rose-500 hover:from-amber-450 hover:to-rose-550 rounded-full border-2 border-slate-950 text-slate-950 cursor-pointer shadow-lg transition active:scale-95 flex items-center justify-center w-8 h-8 group-hover:scale-105 z-20 animate-pulse" title="Escolher foto do seu dispositivo">
                                <Camera className="w-4 h-4 text-slate-950" />
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setUser(prev => ({
                                          ...prev,
                                          profilePhoto: reader.result as string
                                        }));
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }} 
                                />
                              </label>
                            </div>

                            <div className="space-y-1">
                              <h2 className="text-base font-black text-slate-100 tracking-tight">{user.name}</h2>
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/15 border border-blue-500/35 rounded-full text-[9.5px] uppercase tracking-wider text-blue-400 font-extrabold shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                                Usuário Premium
                                <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-white rounded-full shrink-0" />
                              </span>
                            </div>
                          </div>

                          {/* Astro & Numerology Data Box */}
                          <div className="md:col-span-8 flex flex-col justify-center space-y-4 pt-4 md:pt-0 pl-0 md:pl-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              
                              {/* Signo Card */}
                              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-850 flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                                  <Sun className="w-4.5 h-4.5 animate-pulse" />
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">Signo Solar</span>
                                  {(() => {
                                    const solAst = mapData?.astros?.find(a => a.name === "Sol");
                                    const label = solAst ? `Sol em ${solAst.sign} ${solAst.degree}` : `Sol em ${getZodiacSign(user.birthDate)}`;
                                    return <span className="font-bold text-xs text-slate-100 block break-words whitespace-normal leading-none">{label}</span>;
                                  })()}
                                  <p className="text-[9px] text-slate-400 leading-tight">
                                    Essência, ego e sua força expressiva vital.
                                  </p>
                                </div>
                              </div>

                              {/* Ascendente Card */}
                              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-850 flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                                  <Compass className="w-4.5 h-4.5" />
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">Ascendente</span>
                                  {(() => {
                                    const ascAst = mapData?.astros?.find(a => a.name === "Ascendente");
                                    const label = ascAst ? `Ascendente em ${ascAst.sign} ${ascAst.degree}` : `Ascendente em ${getRisingSign(user.birthDate, user.birthTime)}`;
                                    return <span className="font-bold text-xs text-slate-100 block break-words whitespace-normal leading-none max-w-full">{label}</span>;
                                  })()}
                                  <p className="text-[9px] text-slate-400 leading-tight">
                                    Casca física, expressão e o foco social de entrada.
                                  </p>
                                </div>
                              </div>

                              {/* Número Principal */}
                              <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-850 flex items-start gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                                  <Hash className="w-4.5 h-4.5 font-bold" />
                                </div>
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider font-bold">Caminho Cósmico</span>
                                  {(() => {
                                    const lpVal = numerology?.caminhoDeVida || getLifePathNumber(user.birthDate);
                                    return <span className="font-bold text-xs text-amber-400 font-mono block break-words whitespace-normal leading-none">Caminho {lpVal}</span>;
                                  })()}
                                  <p className="text-[9px] text-slate-400 leading-tight">
                                    Vibração de destino e força realizadora cósmica.
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Dynamic event footer banner */}
                            <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-850 text-[10px] leading-normal text-slate-405 flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-amber-400 shrink-0 animate-pulse" />
                              <span className="truncate">
                                Sincro-mapa com <strong>{user.birthCity}</strong>, nascido em <strong>{user.birthDate}</strong> às <strong>{user.birthTime || "12:00"}</strong>.
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Interactive Área do Usuário Sub Navigation and Dashboard Portal */}
                        <UserDashboardPortal
                          user={user}
                          scorePoints={scorePoints}
                          setScorePoints={setScorePoints}
                          dailyMissions={dailyMissions}
                          setDailyMissions={setDailyMissions}
                        />

                        {/* Deactivated legacy subtabs */}
                        {false && <>
                          <div className="flex flex-wrap gap-2 pb-1 border-b border-slate-850">
                          {[
                            { id: 'radar', label: 'Radar do Dia', icon: Activity, color: 'hover:text-rose-400' },
                            { id: 'missao', label: 'Missões Diárias', icon: Award, color: 'hover:text-amber-400' },
                            { id: 'calendario', label: 'Mapa 30 Dias', icon: Calendar, color: 'hover:text-sky-400' },
                            { id: 'cores', label: 'Cores do Mês', icon: Sparkles, color: 'hover:text-purple-400' },
                            { id: 'amuletos', label: 'Símbolos & Amuletos', icon: ShieldCheck, color: 'hover:text-emerald-400' },
                            { id: 'mensagem', label: 'Mensagem Semanal', icon: BookOpen, color: 'hover:text-pink-400' }
                          ].map((sub) => {
                            const Icon = sub.icon;
                            const isSelected = areaSubTab === sub.id;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={() => setAreaSubTab(sub.id as any)}
                                className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                                  isSelected
                                    ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-xs'
                                    : `text-slate-400 border border-transparent ${sub.color}`
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{sub.label}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* SUB-TAB CONTENTS */}
                        <div className="min-h-[300px] animate-in fade-in duration-300">
                          
                          {/* 1. RADAR DO DIA */}
                          {areaSubTab === 'radar' && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* RADAR DIÁRIO METRICS (Left or Left/Center Column) */}
                                <div className="lg:col-span-7 bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                                  <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                      <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                                      Radar do dia
                                    </h3>
                                    <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-[9px] font-mono font-bold text-rose-450 rounded-lg">
                                      Atualização Diária
                                    </span>
                                  </div>

                                  <div className="space-y-4 font-sans">
                                    {/* Energy Description badge */}
                                    <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850/60">
                                      <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Frequência Dominante Celular</span>
                                      <span className="text-xs font-black text-rose-450 block tracking-wide mt-1">
                                        {dailyRadar.energyOfDay}
                                      </span>
                                    </div>

                                    {/* The 5 Required Radar Metrics */}
                                    <div className="space-y-3 pt-1">
                                      {[
                                        { label: 'Energia Vital', val: 92, grad: 'from-amber-500 to-orange-500', desc: 'Sua vitalidade celular física e impulso vital ativo.' },
                                        { label: 'Produtividade', val: 88, grad: 'from-indigo-500 to-purple-600', desc: 'Retenção intelectual e foco singular de mercúrio.' },
                                        { label: 'Relacionamentos', val: 74, grad: 'from-pink-500 to-rose-550', desc: 'Expressão de afetos, diplomacia e conexões áuricas.' },
                                        { label: 'Organização', val: 81, grad: 'from-emerald-500 to-teal-500', desc: 'Estruturação de afazeres diários sob o Caminho de Vida 8.' },
                                        { label: 'Bem-estar', val: 90, grad: 'from-sky-400 to-indigo-500', desc: 'Centramento emocional e quietude mental do respirar.' }
                                      ].map((metric, i) => (
                                        <div key={i} className="p-3 bg-slate-950/60 rounded-2xl border border-slate-850 space-y-1.5">
                                          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase font-bold">
                                            <span>{metric.label}</span>
                                            <span className="text-slate-200">{metric.val}%</span>
                                          </div>
                                          <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                                            <div className={`h-full bg-gradient-to-r ${metric.grad}`} style={{ width: `${metric.val}%` }} />
                                          </div>
                                          <p className="text-[9px] text-slate-500 leading-normal italic">{metric.desc}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* PRÓXIMOS EVENTOS + DETALHES DA LEITURAL DE HOJE (Right Column) */}
                                <div className="lg:col-span-5 space-y-6">
                                  {/* PRÓXIMOS EVENTOS */}
                                  <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                                    <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                                      <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-amber-500" />
                                        Próximos eventos
                                      </h3>
                                      <span className="text-[9px] font-mono text-slate-500">Céu Ativo 2026</span>
                                    </div>

                                    <div className="space-y-3">
                                      {[
                                        {
                                          date: "12 / JUN",
                                          title: "Mercúrio em Trígono com Vênus",
                                          desc: "Forte fluidez e romance nas declarações e discussões mentais.",
                                          highlight: true
                                        },
                                        {
                                          date: "15 / JUN",
                                          title: "Quarto Minguante Lunar",
                                          desc: "Momento propício de limpeza, resguardo mental e purificação de excessos cotidianos.",
                                          highlight: false
                                        },
                                        {
                                          date: "21 / JUN",
                                          title: "Sol entra em Câncer (Solstício)",
                                          desc: "Iluminação calorosa nos âmbitos de intimidade, conexão familiar profunda e ancestralidade.",
                                          highlight: false
                                        }
                                      ].map((ev, idx) => (
                                        <div key={idx} className={`p-3 rounded-2xl border transition duration-300 flex items-start gap-3 ${
                                          ev.highlight 
                                            ? 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30' 
                                            : 'bg-slate-950/40 border-slate-850 hover:border-slate-800'
                                        }`}>
                                          <div className={`p-2 rounded-xl text-center shrink-0 min-w-[50px] font-mono ${
                                            ev.highlight ? 'bg-amber-500/10 text-amber-400 font-bold' : 'bg-slate-900 text-slate-400'
                                          }`}>
                                            <span className="text-[10px] block leading-none">{ev.date.split('/')[0]}</span>
                                            <span className="text-[8px] uppercase block mt-1">{ev.date.split('/')[1]?.trim()}</span>
                                          </div>
                                          <div className="space-y-0.5">
                                            <h4 className="text-[11px] font-bold text-slate-200">{ev.title}</h4>
                                            <p className="text-[9.5px] text-slate-400 leading-normal">{ev.desc}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Expandable Detalhes Leitura do Radar */}
                                  <div className="p-5 bg-slate-950/80 rounded-3xl border border-slate-850 space-y-3 text-left">
                                    <div className="flex items-center gap-1.5 pb-2 border-b border-slate-900">
                                      <Sparkles className="w-4 h-4 text-amber-400" />
                                      <h4 className="text-[11px] font-bold uppercase font-mono text-amber-400">Detalhes Leitura do Dia</h4>
                                    </div>
                                    <p className="text-[11px] text-slate-350 leading-relaxed font-sans">
                                      Hoje, a harmonia magnética entre o seu Sol em Aquário e a ativação cósmica geral estimula seu mental analítico. Com a <strong>Energia em 92%</strong>, você está em perfeito ponto de ignição para se expressar e criar. 
                                    </p>
                                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                                      O <strong>Caminho de Vida 8</strong> ancora seu foco prático (<strong>Organização em 81%</strong>). Aproveite as janelas de calmaria mental para purificar seu canal respiratório de meditação e alinhar seu bem-estar profundo.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 2. MISSÃO DO DIA (Gamified Daily Mission) */}
                          {areaSubTab === 'missao' && (
                            <div className="space-y-6">
                              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-5">
                                <div className="pb-3 border-b border-slate-850 flex justify-between items-center sm:flex-nowrap flex-wrap gap-2">
                                  <div>
                                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                                      <Award className="w-4 h-4 text-amber-500" />
                                      Missão do Dia & Evolução Cósmica
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Cumpra suas tarefas transcendentais do dia para ganhar pontos de evolução da alma.</p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-mono text-amber-400 font-black">
                                      Score: {scorePoints} pts
                                    </span>
                                  </div>
                                </div>

                                {/* Custom Level Progress Bar slider */}
                                <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850/65 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                  <div className="md:col-span-4 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-linear-to-r from-amber-500 to-rose-600 flex items-center justify-center font-mono font-black text-slate-950 text-sm shadow-md">
                                      Lvl 4
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] font-mono text-slate-500 uppercase block font-bold">Nível Cósmico</span>
                                      <span className="text-xs font-bold text-slate-200 font-sans">Viajante das Estrelas</span>
                                    </div>
                                  </div>
                                  <div className="md:col-span-8 space-y-1">
                                    <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 font-bold">
                                      <span>Progresso de Evolução (XP)</span>
                                      <span>450 / 600 XP</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-850/50">
                                      <div className="h-full bg-linear-to-r from-amber-500 via-rose-500 to-indigo-500" style={{ width: '75%' }} />
                                    </div>
                                  </div>
                                </div>

                                {/* Checklist of Fleshed Out missions */}
                                <div className="space-y-3">
                                  {dailyMissions.map((task) => (
                                    <div key={task.id} className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-850/60 transition hover:border-slate-800 space-y-2">
                                      <div className="flex justify-between items-start gap-4">
                                        <div className="flex items-start gap-3">
                                          <button
                                            type="button"
                                            onClick={() => handleToggleMission(task.id)}
                                            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center text-[10px] cursor-pointer transition ${
                                              task.isCompleted 
                                                ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-black' 
                                                : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                                            }`}
                                          >
                                            {task.isCompleted && "✓"}
                                          </button>
                                          <div>
                                            <h5 className={`text-xs font-bold text-slate-200 ${task.isCompleted ? 'line-through text-slate-500' : ''}`}>
                                              {task.title}
                                            </h5>
                                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{task.description}</p>
                                          </div>
                                        </div>
                                        <span className="text-[10px] font-mono text-amber-500 font-bold uppercase shrink-0">+{task.points} XP</span>
                                      </div>

                                      {/* Detalhes leitura (Mission Astrological Details Explanation) */}
                                      <div className="pl-8 pt-1.5 border-t border-slate-900/60 text-[9.5px] text-slate-500 leading-normal font-sans italic">
                                        <strong className="text-slate-400 not-italic uppercase text-[8px] font-mono block mb-0.5">Detalhes da leitura:</strong>
                                        {task.id === 'm1' && "A ressonância de Vênus em Aquário clareia a visão de fraternidade. Meditar ativa os canais sutis de sua receptividade intelectual."}
                                        {task.id === 'm2' && "Registrando seus sonhos você cria pontes de cinza prateada rumo aos arquivos ocultos de Netuno em Peixes na sua casa astral."}
                                        {task.id === 'm3' && "O Sol e Aquário demandam conexões sinceras e libertadoras. Uma palavra amiga nutre o coração solar."}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Reivindicar Recompensa Button */}
                                <div className="pt-3 flex justify-between items-center bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
                                  <span className="text-[9.5px] font-mono text-slate-400 max-w-[250px] leading-relaxed">
                                    Complete todas as missões para harmonização áurica integral.
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      alert("Suas recompensas cósmicas espirituais foram integradas e aplicadas ao seu campo magnético pessoal!");
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 text-slate-950 text-[10px] font-bold uppercase rounded-lg tracking-wider transition hover:shadow-lg active:scale-95 cursor-pointer shrink-0"
                                  >
                                    Reivindicar Recompensa
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 3. MAPA DOS PRÓXIMOS 30 DIAS */}
                          {areaSubTab === 'calendario' && (
                            <div className="space-y-6">
                              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                                  <div>
                                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                                      <Calendar className="w-4 h-4 text-sky-400" />
                                      Calendário de Tendências (30 Dias)
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Clique nas datas de Junho de 2026 para obter análises astrológicas inteligentes e tendências cósmicas.</p>
                                  </div>
                                  <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-[9px] font-mono font-bold text-sky-455 rounded-lg shrink-0">
                                    Próximos 30 Dias
                                  </span>
                                </div>

                                {/* Intelligent Calendar Grid (30 Tiles) */}
                                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 font-mono pt-1">
                                  {Array.from({ length: 30 }, (_, index) => {
                                    const day = index + 1;
                                    const isSelected = selectedCalendarDay === day;
                                    
                                    // Astro tendency metadata based on index
                                    let symbol = "☀️";
                                    let borderColor = "border-slate-850 bg-slate-950/50";
                                    let activeRing = "ring-2 ring-sky-500";
                                    
                                    if (day % 6 === 0) { symbol = "🌙"; } // Rest/Moon 
                                    else if (day % 6 === 1) { symbol = "🎯"; } // Focus/Career
                                    else if (day % 6 === 2) { symbol = "💖"; } // Relationships
                                    else if (day % 6 === 3) { symbol = "⚡"; } // Warnings/Alerts
                                    else if (day % 6 === 4) { symbol = "💸"; } // Prosperity
                                    else { symbol = "💬"; } // Communication
                                    
                                    return (
                                      <button
                                        key={day}
                                        type="button"
                                        onClick={() => setSelectedCalendarDay(day)}
                                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-between transition cursor-pointer hover:border-slate-500 ${
                                          isSelected 
                                            ? 'bg-slate-800 border-sky-400 text-slate-100 shadow-md transform scale-102' 
                                            : 'bg-slate-950/80 border-slate-850 text-slate-400'
                                        }`}
                                      >
                                        <span className="text-[9px] font-semibold text-slate-500 font-mono block">
                                          {day.toString().padStart(2, '0')}
                                        </span>
                                        <span className="text-xs pt-1 block">{symbol}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Selected Day Detalhes Leitura */}
                                <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850 mt-3 space-y-2.5">
                                  <div className="flex justify-between items-center pb-2 border-b border-slate-900 leading-none">
                                    <div className="flex items-center gap-1.5">
                                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                                      <span className="text-[11px] font-bold uppercase font-mono text-slate-205">
                                        Análise Estelar: {selectedCalendarDay.toString().padStart(2, '0')} de Junho, 2026
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-slate-500 uppercase font-mono">
                                      {selectedCalendarDay % 6 === 0 && "Frequência: Recolhimento"}
                                      {selectedCalendarDay % 6 === 1 && "Frequência: Foco Ativo"}
                                      {selectedCalendarDay % 6 === 2 && "Frequência: União Afetiva"}
                                      {selectedCalendarDay % 6 === 3 && "Frequência: Cuidado Celestial"}
                                      {selectedCalendarDay % 6 === 4 && "Frequência: Expansão Material"}
                                      {selectedCalendarDay % 6 === 5 && "Frequência: Diálogo & Ideias"}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-slate-350 leading-relaxed font-sans space-y-2">
                                    <p>
                                      {selectedCalendarDay % 6 === 0 && "Seu dia está dominado pelo reflexo lunar profundo de introspecção. Excelente para rever planos, repousar a musculatura de estudos livres e escrever no Cofre dos Sonhos."}
                                      {selectedCalendarDay % 6 === 1 && "Foco afunilado pela quadratura de Marte ativo. Ótimo momento para iniciar novos rascunhos, limpar gavetas e focar em prazos complexos."}
                                      {selectedCalendarDay % 6 === 2 && "Vênus faz trígono harmonioso com sua lenda astrológica de nascimento. Dia excelente para socializar, conversar intimamente, escutar amigos ou resolver disputas com leveza."}
                                      {selectedCalendarDay % 6 === 3 && "Mercúrio em conjunção crítica. Alerta estelar para impulsividade verbal, falhas de sistema ou assinaturas rápidas. Aguarde o entardecer antes de formalizar transações de vulto."}
                                      {selectedCalendarDay % 6 === 4 && "Abundância sob auspício do Caminho de Vida 8 em ritmo de expansão solar. Favorável para o seu bolso, investimentos cuidadosos de longo prazo e decisões corporativas estruturadas."}
                                      {selectedCalendarDay % 6 === 5 && "Voz de Aquário energizada em alta inteligência coletiva. Excelente para palestras, reuniões de brainstorming de equipe, propostas de engajamento urbano ou estudos conceituais."}
                                    </p>

                                    <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-850 text-[10px] text-slate-400 italic">
                                      <strong className="not-italic text-slate-300 font-mono text-[9px] block mb-1">Dica prática do dia:</strong>
                                      {selectedCalendarDay % 6 === 0 && "Durma meia hora mais cedo hoje. Use pedra de Selenita ao lado do travesseiro."}
                                      {selectedCalendarDay % 6 === 1 && "Evite multitarefas. Foque em uma única atividade prioritária até sua plena conclusão."}
                                      {selectedCalendarDay % 6 === 2 && "Experimente usar roupas com tons de Quartzo Rosa ou Carmim para sintonizar a diplomacia."}
                                      {selectedCalendarDay % 6 === 3 && "Escreva no papel antes de enviar mensagens difíceis. Respire e releia 3 vezes."}
                                      {selectedCalendarDay % 6 === 4 && "Organize suas finanças mensais em planilha hoje. A abundância floresce de solo ordenado."}
                                      {selectedCalendarDay % 6 === 5 && "Escreva um e-mail de agradecimento a um mentor ou colega intelectual."}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 4. CORES FAVORÁVEIS DO MÊS */}
                          {areaSubTab === 'cores' && (
                            <div className="space-y-6">
                              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                                  <div>
                                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                                      <Sparkles className="w-4 h-4 text-purple-400" />
                                      Cores Favoráveis para o Mês de Junho
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">As frequências cromáticas sintonizadas às emanações vigentes no seu mapa astrológico principal de 2026.</p>
                                  </div>
                                  <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-[9px] font-mono font-bold text-purple-450 rounded-lg shrink-0">
                                    Atualização Mensal
                                  </span>
                                </div>

                                {/* Custom Color Swatches Bento Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 font-sans">
                                  {[
                                    { title: 'Cor Principal', name: 'Azul Cobalto', hex: '#1e3a8a', bgClass: 'bg-[#1e3a8a]', text: 'Ativa sua mente fria e original de Aquário, eliminando cansaços e sobrecargas mentais do cotidiano.' },
                                    { title: 'Cor Secundária', name: 'Violeta Estelar', hex: '#6366f1', bgClass: 'bg-[#6366f1]', text: 'Fortalece seu chakra coronário e abre antenização intuitiva para os aconselhamentos do Tarot.' },
                                    { title: 'Cor para Prosperidade', name: 'Dourado Solar', hex: '#eab308', bgClass: 'bg-[#eab308]', text: 'Amplifica o magnetismo material do seu Caminho de Vida 8. Use na carteira ou papéis financeiros.' },
                                    { title: 'Cor para Relacionamentos', name: 'Rosa Quartzo', hex: '#f43f5e', bgClass: 'bg-[#f43f5e]', text: 'Suaviza as defesas estressadas de sua mente analítica, permitindo afetos doces e empatia sutil.' },
                                    { title: 'Cor para Trabalho', name: 'Cinza Slate Profundo', hex: '#334155', bgClass: 'bg-[#334155]', text: 'Garante o rigor estrutural de Saturno, a disciplina laboriosa e o foco em prazos cruciais.' },
                                    { title: 'Cor para Encontros', name: 'Carmim Magnético', hex: '#be123c', bgClass: 'bg-[#be123c]', text: 'Traz confiança cênica, impulsiona o brilho pessoal misterioso e sedutor de Marte.' },
                                    { title: 'Uso no Dia a Dia', name: 'Off-White Pérola', hex: '#f8fafc', bgClass: 'bg-[#f8fafc]', text: 'Frequência de purificação ideal para neutralizar ruídos eletromagnéticos e limpar meridianos sutilmente.' }
                                  ].map((c, i) => (
                                    <div key={i} className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-850/70 space-y-3 hover:border-slate-800 transition">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl ${c.bgClass} border border-white/10 shrink-0 shadow-lg relative overflow-hidden`} />
                                        <div>
                                          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block leading-none">{c.title}</span>
                                          <span className="text-xs font-bold text-slate-200 mt-1 block leading-tight">{c.name}</span>
                                          <span className="text-[9px] font-mono text-slate-500 font-bold tracking-tight block mt-0.5">{c.hex.toUpperCase()}</span>
                                        </div>
                                      </div>
                                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1 font-sans italic">{c.text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 5. AMULETOS E SÍMBOLOS DE PODER (Amulets and symbols) */}
                          {areaSubTab === 'amuletos' && (
                            <div className="space-y-6">
                              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                                  <div>
                                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                                      <ShieldCheck className="w-4 h-4 text-emerald-450" />
                                      Amuletos & Símbolos de Poder Pessoais
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Escudos energéticos e frequências físicas para purificar, ancorar e focar sua aura este mês.</p>
                                  </div>
                                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-450 rounded-lg shrink-0">
                                    Baseado no Mapa Estelar
                                  </span>
                                </div>

                                {/* Amulet Properties grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-sans">
                                  
                                  {/* Element Section */}
                                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850 space-y-2">
                                    <div className="flex items-center gap-2 text-sky-400">
                                      <Globe className="w-4 h-4 shrink-0" />
                                      <h4 className="text-xs font-bold uppercase font-mono tracking-wide">Seu Elemento Ativo: Ar</h4>
                                    </div>
                                    <p className="text-[10px] text-slate-350 leading-relaxed">
                                      O Ar reina na sua matriz essencial de <strong>Aquário</strong>. Confere rapidez de raciocínio, ideais humanitários amplos e facilidade comunicativa. Alinhe-se ao elemento acendendo incensos puros de lavanda e inspirando fundo de manhã ao ar livre.
                                    </p>
                                  </div>

                                  {/* Pedras e Cristais */}
                                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850 space-y-2">
                                    <div className="flex items-center gap-2 text-rose-400">
                                      <Sparkles className="w-4 h-4 shrink-0" />
                                      <h4 className="text-xs font-bold uppercase font-mono tracking-wide">Pedras e Cristais de Filtro</h4>
                                    </div>
                                    <div className="text-[10px] text-slate-350 leading-relaxed space-y-1">
                                      <p><strong>Lápis-Lazúli:</strong> Estimula a visão transcendental, abre a clareza intelectual e protege seu canal respiratório superior.</p>
                                      <p><strong>Sodalita e Selenita:</strong> Conectam o raciocínio lógico às vibrações sutis da intuição celestial pura.</p>
                                    </div>
                                  </div>

                                  {/* Símbolos sagrados */}
                                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850 space-y-2">
                                    <div className="flex items-center gap-2 text-amber-500">
                                      <Orbit className="w-4 h-4 shrink-0" />
                                      <h4 className="text-xs font-bold uppercase font-mono tracking-wide">Símbolos Celestiais Sagrados</h4>
                                    </div>
                                    <p className="text-[10px] text-slate-350 leading-relaxed">
                                      O <strong>Portador de Água (Aquário)</strong> sintoniza sua missão solar coletiva. 
                                      A <strong>Estrela de Sete Pontas (Heptagrama)</strong> sela seu campo áurico de proteção contra interferências energéticas externas e equilibra seu Caminho de Vida 8.
                                    </p>
                                  </div>

                                  {/* Amuletos recomendados */}
                                  <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-850 space-y-2">
                                    <div className="flex items-center gap-2 text-purple-400">
                                      <Award className="w-4 h-4 shrink-0" />
                                      <h4 className="text-xs font-bold uppercase font-mono tracking-wide">Amuletos Ativos Recomendados</h4>
                                    </div>
                                    <p className="text-[10px] text-slate-350 leading-relaxed">
                                      Use o <strong>Escaravelho Azul de Proteção</strong> para promover renovações físicas e materiais favoráveis. 
                                      Sincronize com o <strong>Olho de Hórus</strong> em liga de prata para barrar a fadiga mental provocada pelo excesso de telas ou conversas mundanas.
                                    </p>
                                  </div>

                                </div>

                                {/* Custom Jewelry recommendation: Ring or necklace requested! */}
                                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850/85 text-left space-y-2.5 font-sans">
                                  <div className="flex items-center gap-1.5 pb-1 border-b border-slate-900">
                                    <Star className="w-4 h-4 text-amber-400" />
                                    <h4 className="text-[11px] font-bold uppercase font-mono text-amber-400">Recomendação Estelar de Joia de Poder</h4>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                                    <div className="sm:col-span-3 text-center p-2 bg-slate-900/60 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300 font-bold shrink-0">
                                      Colar ou Anel
                                    </div>
                                    <div className="sm:col-span-9">
                                      <p className="text-[11px] text-slate-350 leading-relaxed">
                                        Recomendamos o uso de um <strong>Colar de Lápis-Lazúli montado em Prata Pura</strong> posicionado na altura do chakra laríngeo, ou alternativamente um <strong>Anel de Prata com Pirita</strong> usado no dedo indicador correspondente ao seu poder criador e materializador. 
                                      </p>
                                      <p className="text-[10px] text-slate-500 italic mt-1 leading-normal leading-relaxed text-left">
                                        <strong>Conselho de ativação:</strong> Na noite do quarto crescente lunar, deixe a joia imersa em copo de água mineral por duas horas exposta ao luar e use-a após secar purificada.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 6. MENSAGEM DA SEMANA */}
                          {areaSubTab === 'mensagem' && (
                            <div className="space-y-6">
                              <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                                <div className="space-y-0.5 pb-2 border-b border-slate-850 flex justify-between items-center">
                                  <div>
                                    <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                                      <BookOpen className="w-4 h-4 text-pink-400" />
                                      Mensagem Inspiradora da Semana
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-0.5">Canalizações semanais personalizadas guiadas pelo trânsito ativo do Solstício de Junho de 2026.</p>
                                  </div>
                                  <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 text-[9px] font-mono font-bold text-pink-450 rounded-lg shrink-0">
                                    Atualização Semanal
                                  </span>
                                </div>

                                {/* Mystical ancient Scroll styled element */}
                                <div className="relative p-6 bg-slate-950 rounded-3xl border border-amber-500/10 shadow-[inner_0_0_20px_bg-amber-500/5] overflow-hidden text-center space-y-4">
                                  <div className="absolute top-0 right-0 w-28 h-28 bg-pink-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                                  <div className="absolute bottom-0 left-0 w-28 h-28 bg-amber-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                                  
                                  <span className="text-[9px] font-mono text-amber-500/70 block uppercase tracking-widest">Semana de 08/06 a 14/06 de 2026</span>
                                  
                                  <p className="font-serif italic text-sm text-amber-100/90 leading-relaxed max-w-xl mx-auto">
                                    "{user.name.split(' ')[0]}, o céu desta semana convida você a encontrar o silêncio lúcido em meio ao turbilhão de ideias brilhantes que seu Sol em {mapData?.astros?.find(a => a.name === "Sol")?.sign || getZodiacSign(user.birthDate)} tanto gera. A força construtora do seu Caminho de Vida {numerology?.lifePathNumber || getLifePathNumber(user.birthDate)} exige que você não apenas idealize soluções, mas permita-se o cansaço terapêutico de assentar as ideias no solo firme da realidade."
                                  </p>

                                  <p className="font-serif italic text-sm text-amber-200/90 leading-relaxed max-w-xl mx-auto pt-1">
                                    "A ressonância de Mercúrio e Vênus em harmonia reforça a doçura na sua expressão: é hora de presentear sua rotina laboriosa com pequenas pausas estéticas. Confie na sabedoria invisível do elemento Ar que circula seu campo, pois a verdadeira prosperidade espiritual não provém do excesso de passos, mas da respiração perfeitamente cadenciada."
                                  </p>

                                  <div className="pt-3 border-t border-slate-900 max-w-xs mx-auto">
                                    <Sparkles className="w-4 h-4 text-amber-450 mx-auto animate-pulse" />
                                    <span className="text-[8px] font-mono uppercase text-slate-500 tracking-wider block mt-1">Conselheira Espiritual Orbia</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                        </>}
                      </div>
                    )
                  )}

                    {/* SUB-SECTION 2: MEU MAPA */}
                    {mapSubTab === 'meu_mapa' && (
                      !user.hasCreatedMap ? (
                        renderLockedSection(
                          "Astronomia & Numerologia Pessoais",
                          "Os mapas celestes sob sistema Placidus, os graus exatos dos astros, a análise detalhada das casas astrológicas e os códigos de vida numerológicos dependem da sintonização do seu mapa de nascimento. Sintonize suas estrelas para habilitar."
                        )
                      ) : (
                        <div className="space-y-8 animate-in fade-in duration-300">
                          {/* Render standard modules but completely readOnly to avoid new registrations */}
                          {mapData && (
                            <AstrologyView 
                              mapData={mapData} 
                              user={user} 
                              onUpdateMainMap={() => {}} 
                              readOnly={true}
                            />
                          )}

                          {numerology && (
                            <NumerologyView 
                              numerology={numerology} 
                              userName={user.name} 
                            />
                          )}

                          <CompatibilityView user={user} />

                          <TransitHistory userName={user?.name} birthDate={user?.birthDate} />
                        </div>
                      )
                    )}

                    {/* SUB-SECTION 3: CRIAR MEU MAPA */}
                    {mapSubTab === 'criar_meu_mapa' && (
                      <div className="max-w-2xl mx-auto bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800 space-y-6 text-left animate-in fade-in duration-300">
                        <div className="border-b border-slate-850 pb-4">
                          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-amber-500" />
                            Calcular Novo Mapa Astral Principal
                          </h2>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            Insira os dados corretos de nascimento para recalcular as posições planetárias, casas astrológicas e os trânsitos sob o sistema Placidus.
                          </p>
                        </div>

                        {/* EXPLICIT REQUIRED WARNING IF USER HAS ACTIVE MAP */}
                        {user.hasCreatedMap && (
                          <div className="bg-amber-500/5 p-5 border border-amber-500/20 rounded-2xl text-[11px] leading-relaxed text-slate-350 font-sans flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-bold text-amber-400 text-xs">Você já possui um mapa principal.</h4>
                              <p className="mt-1">Ao criar um novo mapa, o atual será substituído.</p>
                              <p className="mt-1">Se deseja criar mapas de outras pessoas utilize a opção <span className="font-semibold text-rose-400 hover:underline cursor-pointer" onClick={() => setMapSubTab('mapas_extras')}>MAPAS EXTRAS</span>.</p>
                            </div>
                          </div>
                        )}

                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (!createMainName || !createMainDate) return;
                          handleUpdateUserProfile({
                            name: createMainName,
                            birthDate: createMainDate,
                            birthTime: createMainTime || "12:00",
                            birthCity: createMainCity
                          });
                          setMapSubTab('meu_mapa'); // switch straight to read-only view
                        }} className="space-y-4 pt-2">
                          <div>
                            <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Nome completo</label>
                            <input
                              type="text"
                              required
                              value={createMainName}
                              onChange={(e) => setCreateMainName(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-205 focus:outline-hidden"
                              placeholder="e.g. Fabricio Souza Santos"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Data de nascimento</label>
                              <input
                                type="date"
                                required
                                value={createMainDate}
                                onChange={(e) => setCreateMainDate(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300 focus:outline-hidden font-mono"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Hora (HH:MM)</label>
                              <input
                                type="text"
                                value={createMainTime}
                                onChange={(e) => setCreateMainTime(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-205 focus:outline-hidden font-mono"
                                placeholder="e.g. 15:30"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-mono text-slate-400 mb-1 uppercase font-bold">Cidade / Estado</label>
                              <input
                                type="text"
                                value={createMainCity}
                                onChange={(e) => setCreateMainCity(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-205 focus:outline-hidden"
                                placeholder="e.g. São Paulo, SP"
                              />
                            </div>
                          </div>

                          <div className="pt-4 flex justify-end">
                            <button
                              type="submit"
                              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 rounded-xl text-xs font-bold font-sans uppercase text-slate-950 transition-all cursor-pointer hover:shadow-lg opacity-90 hover:opacity-100"
                            >
                              {user.hasCreatedMap ? "Substituir e Gerar Novo Mapa Principal" : "Gerar e Salvar Meu Mapa Principal"}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* SUB-SECTION 4: MAPAS EXTRAS */}
                    {mapSubTab === 'mapas_extras' && (
                      !user.hasCreatedMap ? (
                        renderLockedSection(
                          "Portal de Relacionamentos e Mapas Extras",
                          "A comparação de sinastria social, relatórios de afinidade e registros paralelos para mapas de familiares e amigos necessitam que você primeiro crie seu próprio mapa de nascimento. Sintonize suas estrelas para habilitar."
                        )
                      ) : (
                        <div className="max-w-4xl mx-auto space-y-6 text-left animate-in fade-in duration-300">
                          
                          {/* Header back button */}
                          <div className="flex justify-between items-center flex-wrap gap-2">
                          <div>
                            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-tight flex items-center gap-2">
                              <Orbit className="w-5 h-5 text-rose-400" />
                              Mapas Extras
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Gerencie mapas extras de familiares, contatos profissionais ou parceiros. Limite de <strong>até 2 mapas</strong> adicionais.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveExtraMapData(null);
                              setMapSubTab('meu_mapa');
                            }}
                            className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 rounded-full text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1.5 transition duration-300 cursor-pointer"
                          >
                            <span>Voltar para Meu Mapa</span>
                          </button>
                        </div>

                        {/* Rendering single extra map report when active */}
                        {activeExtraMapData ? (
                          <div className="space-y-8 p-6 bg-slate-950/20 rounded-3xl border border-slate-850/60 animate-in fade-in duration-300">
                            <div className="pb-3 border-b border-slate-850 flex items-center justify-between flex-wrap gap-2 bg-slate-950/80 p-4 rounded-2xl">
                              <div>
                                <span className="text-[9px] font-mono text-rose-400 uppercase tracking-widest font-bold">Visualização Ativa</span>
                                <h3 className="text-base font-black text-slate-100">Mapa Astral Extra: {activeExtraMapName}</h3>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveExtraMapData(null);
                                  setActiveExtraMapNumerology(null);
                                  setActiveExtraMapName('');
                                }}
                                className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold uppercase transition duration-200 cursor-pointer"
                              >
                                Voltar para Lista de Mapas Extras
                              </button>
                            </div>

                            <AstrologyView 
                              mapData={activeExtraMapData} 
                              user={{
                                name: activeExtraMapName,
                                birthDate: "1990-01-01", 
                                birthTime: "12:00",
                                birthCity: "Desconhecida",
                                isUnknownTime: false,
                                isPremium: true
                              }} 
                              onUpdateMainMap={() => {}} 
                              readOnly={true}
                            />

                            {activeExtraMapNumerology && (
                              <NumerologyView 
                                numerology={activeExtraMapNumerology} 
                                userName={activeExtraMapName} 
                              />
                            )}

                            <div className="pt-2 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveExtraMapData(null);
                                  setMapSubTab('meu_mapa');
                                }}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-600 rounded-xl text-xs font-bold uppercase text-slate-950 hover:shadow-lg transition cursor-pointer"
                              >
                                Voltar para Meu Mapa
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            
                            {/* Left: Extra Map Form (visible if length < 2) */}
                            <div className="md:col-span-4 bg-slate-900/40 p-5 rounded-3xl border border-slate-850 space-y-4">
                              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wider">Novo Mapa de Terceiro</h3>
                              
                              {extraMaps.length >= 2 ? (
                                <div className="p-4 bg-rose-505/10 border border-rose-500/20 rounded-2xl text-[10.5px] text-rose-400 leading-relaxed font-sans text-left">
                                  Você atingiu o limite máximo de <strong>2 mapas extras</strong>. Exclua algum mapa anterior para cadastrar um novo.
                                </div>
                              ) : (
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!extraName || !extraDate) return;
                                  const nextExtraArr = [...extraMaps, {
                                    id: `extra_${Date.now()}`,
                                    name: extraName,
                                    birthDate: extraDate,
                                    birthTime: extraTime || "12:00",
                                    birthCity: extraCity
                                  }];
                                  setExtraMaps(nextExtraArr);
                                  
                                  // Reset inputs
                                  setExtraName('');
                                  setExtraDate('');
                                  setExtraTime('');
                                  setExtraCity('');
                                }} className="space-y-3 font-sans">
                                  <div>
                                    <label className="block text-[9px] font-mono text-slate-450 uppercase mb-1">Nome completo</label>
                                    <input
                                      type="text"
                                      required
                                      value={extraName}
                                      onChange={(e) => setExtraName(e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-202 focus:outline-hidden"
                                      placeholder="e.g. Lucas Oliveira"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-mono text-slate-455 uppercase mb-1">Data Nascimento</label>
                                    <input
                                      type="date"
                                      required
                                      value={extraDate}
                                      onChange={(e) => setExtraDate(e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-401 focus:outline-hidden font-mono"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-mono text-slate-455 uppercase mb-1">Hora (HH:MM)</label>
                                    <input
                                      type="text"
                                      value={extraTime}
                                      onChange={(e) => setExtraTime(e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-202 focus:outline-hidden"
                                      placeholder="e.g. 08:45"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[9px] font-mono text-slate-455 uppercase mb-1">Cidade</label>
                                    <input
                                      type="text"
                                      value={extraCity}
                                      onChange={(e) => setExtraCity(e.target.value)}
                                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-202 focus:outline-hidden"
                                      placeholder="e.g. Rio de Janeiro"
                                    />
                                  </div>

                                  <button
                                    type="submit"
                                    className="w-full py-2 bg-indigo-650 hover:bg-indigo-600 border border-indigo-500/20 text-slate-100 rounded-xl text-xs font-bold font-sans uppercase tracking-wide transition duration-300 cursor-pointer"
                                  >
                                    Cadastrar Mapa Extra
                                  </button>
                                </form>
                              )}
                            </div>

                            {/* Right: Extra Maps List */}
                            <div className="md:col-span-8 bg-slate-900/20 p-5 rounded-3xl border border-slate-850 space-y-4">
                              <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-divider">Lista de Mapas Extras Cadastrados ({extraMaps.length}/2)</h3>
                              
                              {isLoadingExtraMap && (
                                <div className="space-y-3 py-10 flex flex-col items-center text-slate-500 bg-slate-950/60 rounded-2xl border border-slate-855">
                                  <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
                                  <p className="text-[10px] font-mono">Processando alinhamento estelar secundário...</p>
                                </div>
                              )}

                              {!isLoadingExtraMap && extraMaps.length === 0 && (
                                <div className="p-8 text-center text-slate-600 bg-slate-950/30 rounded-2xl border border-dashed border-slate-850">
                                  <Orbit className="w-10 h-10 text-slate-800 mx-auto opacity-40 mb-2" />
                                  <p className="text-xs font-mono">Nenhum mapa extra cadastrado.</p>
                                  <p className="text-[10px] text-slate-505 max-w-xs mx-auto mt-1 leading-relaxed">
                                    Adicione até 2 perfis de amigos ou familiares para comparar as cartas astrológicas e sinastrias.
                                  </p>
                                </div>
                              )}

                              {!isLoadingExtraMap && extraMaps.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {extraMaps.map((m) => (
                                    <div key={m.id} className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all duration-300 hover:border-slate-700">
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-slate-200">{m.name}</h4>
                                        <p className="text-[10px] font-mono text-indigo-400 leading-none">
                                          Nascimento: {m.birthDate} {m.birthTime ? `às ${m.birthTime}` : ''}
                                        </p>
                                        <p className="text-[10px] text-slate-450 font-mono">
                                          Cidade: {m.birthCity || "Não informada"}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-2 pt-2 border-t border-slate-850/60">
                                        <button
                                          type="button"
                                          onClick={() => triggerGenerateExtraMap(m)}
                                          className="flex-1 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-lg text-[10px] font-bold text-indigo-455 hover:text-indigo-400 text-center uppercase tracking-wide transition duration-200 cursor-pointer"
                                        >
                                          Visualizar Mapa
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setExtraMaps(extraMaps.filter(ex => ex.id !== m.id))}
                                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-405 border border-rose-500/25 rounded-lg hover:text-rose-400 transition"
                                          title="Deletar Mapa Extra"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              <div className="pt-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => setMapSubTab('meu_mapa')}
                                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-amber-500 hover:text-amber-400 transition cursor-pointer"
                                >
                                  Voltar para Meu Mapa
                                </button>
                              </div>
                            </div>

                          </div>
                        )}

                      </div>
                    )
                  )}
                  </>
                )}
              </div>
            )}

            {/* TAB 2: CONSTECOES (Radar, Biorhythms, Lunar Cycles, Prosperity Maps) */}
            {activeTab === 'constelacoes' && (
              !user.hasCreatedMap ? (
                renderLockedSection(
                  "Portal de Constelações",
                  "O alinhamento estelar das constelações e a inclinação sideral dependem das coordenadas geográficas e data exata do seu nascimento. Sincronize seu mapa astral para desbloquear as posições estelares em tempo real."
                )
              ) : (
                <div className="space-y-8 animate-in fade-in duration-300">
                
                {/* Header Banner */}
                <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-950/40 via-slate-905 to-slate-900 border border-emerald-500/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
                  <div className="relative">
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase font-mono font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      Módulo Trânsitos e Energias Diárias
                    </span>
                    <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-slate-100 mt-2">
                      Radar Biológico & Tendências
                    </h1>
                    <p className="text-xs text-slate-400 max-w-xl mt-1">
                      Monitore biorritmos matemáticos, previsões de trânsitos celestes, e o ciclo lunar ativo para planejar suas melhores ações do dia.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Radar do Dia Subcomponent */}
                  <div className="lg:col-span-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="pb-2 border-b border-slate-850">
                      <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Radar Diário</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Influências transitórias de hoje</p>
                    </div>

                    <div className="space-y-3">
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Frequência Regente</span>
                        <div className="text-xs font-bold text-emerald-400 mt-1">{dailyRadar.energyOfDay}</div>
                      </div>

                      {/* Disposition Level widget gauge */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Nível de Disposição Física</span>
                          <span className="font-mono text-emerald-400 font-bold">{dailyRadar.dispositionLevel}%</span>
                        </div>
                        <div className="w-full h-2 rounded bg-slate-950 overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${dailyRadar.dispositionLevel}%` }} />
                        </div>
                      </div>

                      {/* Best hours timeline lists */}
                      <div className="space-y-2 pt-2 text-[11px]">
                        <strong className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Melhores Janelas Horas:</strong>
                        <div className="flex justify-between p-2 bg-slate-950/40 rounded-lg">
                          <span className="text-slate-400">Produtividade</span>
                          <span className="font-mono text-slate-200">{dailyRadar.bestTimeProductivity}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-slate-950/40 rounded-lg">
                          <span className="text-slate-400">Relacionamentos</span>
                          <span className="font-mono text-rose-400">{dailyRadar.bestTimeRelationships}</span>
                        </div>
                        <div className="flex justify-between p-2 bg-slate-950/40 rounded-lg">
                          <span className="text-slate-400">Foco / Estudos</span>
                          <span className="font-mono text-sky-400">{dailyRadar.bestTimeStudies}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informational Prompt block on Biorhythm integration */}
                  <div className="lg:col-span-8 bg-slate-900/10 p-6 rounded-3xl border border-slate-800 flex flex-col justify-center space-y-4">
                    <span className="px-3 py-1 rounded-full text-[9px] uppercase font-mono font-semibold tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 w-fit">
                      Sincronismo Quântico Ativado
                    </span>
                    <h3 className="text-base font-bold text-slate-100 uppercase tracking-tight">Sintonização do Potencial de Vida</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      O Biorritmo auxilia você a sincronizar seus picos de eficiência diários em cada uma das 7 esferas de experiência vital. Role para baixo ou navegue ao lado para analisar detalhadamente seu gráfico de 15 dias completo e o cronômetro correspondente de transições de fases física, emocional e espiritual.
                    </p>
                    <div className="flex gap-2 items-center text-[11px] font-mono text-indigo-305">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                      <span>Integração com {user?.birthDate ? `Nascimento: ${user.birthDate}` : 'suas datas astrológicas'}</span>
                    </div>
                  </div>

                </div>

                {/* THE NEW ADVANCED BIORHYTHM SYSTEM FOR FABRICIO */}
                <BiorhythmView userName={user?.name} birthDate={user?.birthDate} />

                {/* NEW COMPREHENSIVE LUNAR CYCLE MODULE */}
                <LunarCycle userName={user?.name} userSunSign="Capricórnio" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Mapa da Prosperidade Subcomponent */}
                  <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="pb-2 border-b border-slate-850">
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Mapa de Prosperidade Mensal</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-sans">Sua vibração abundante orientada para Junho 2026.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Prosperity fields */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Número do Mês</span>
                        <span className="text-xl font-bold font-mono text-amber-500 block mt-1">8</span>
                        <p className="text-[9px] text-slate-500 leading-none mt-1">Foco materializado e colheitas.</p>
                      </div>

                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-amber-500 border border-amber-400/40 shrink-0" />
                        <div>
                          <span className="text-[8px] font-mono text-slate-500 uppercase block">Cor Favorecida</span>
                          <span className="text-[11px] text-slate-300 font-bold font-mono block mt-0.5">Dourado Solar</span>
                          <span className="text-[8px] text-slate-505 font-mono">#F59E0B</span>
                        </div>
                      </div>

                      {/* Palabra chave */}
                      <div className="col-span-2 p-3 bg-slate-950 rounded-xl border border-slate-850">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Palavra-Chave Ativa</span>
                        <span className="text-xs font-bold text-slate-200 mt-1 block">"Auto-organização e Colheitas Práticas"</span>
                      </div>
                    </div>
                  </div>

                  {/* Calendário dos Próximos 30 dias */}
                  <div className="bg-slate-900/30 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="pb-2 border-b border-slate-800">
                      <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Mapa dos Próximos 30 Dias (Calendário de Trânsitos)</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Clique nos dias sinalizados para antever tendências do mês.</p>
                    </div>

                    <div className="grid grid-cols-7 gap-2 max-w-sm sm:max-w-md mx-auto">
                      {Array.from({ length: 30 }).map((_, idx) => {
                        const dayNum = idx + 1;
                        // Assign color tags to certain days
                        let dayColor = "bg-slate-900/40 border-slate-850 text-slate-500";
                        let tagText = "Tranquilo";
                        
                        if ([2, 9, 16, 23, 30].includes(dayNum)) {
                          dayColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-bold";
                          tagText = "Favorável";
                        } else if ([5, 12, 19, 26].includes(dayNum)) {
                          dayColor = "bg-rose-500/10 border-rose-500/20 text-rose-400 font-bold";
                          tagText = "Atenção";
                        } else if ([7, 14, 21, 28].includes(dayNum)) {
                          dayColor = "bg-amber-500/10 border-amber-500/20 text-amber-500 font-bold";
                          tagText = "Produtivo";
                        } else if ([4, 11, 18, 25].includes(dayNum)) {
                          dayColor = "bg-sky-500/10 border-sky-500/20 text-sky-400 font-bold";
                          tagText = "Descanso";
                        }

                        return (
                          <div 
                            key={idx} 
                            title={`Dia ${dayNum}: energia de foco ${tagText}`}
                            className={`p-1.5 rounded-lg border text-center text-xs transition cursor-help ${dayColor}`}
                          >
                            <span className="block font-mono leading-none">{dayNum}</span>
                            <span className="text-[7px] font-sans block leading-none mt-1 uppercase scale-90">{tagText.slice(0, 3)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* NODOS LUNARES - SUA EVOLUÇÃO PESSOAL */}
                <LunarNodes userName={user?.name} />

              </div>
              )
            )}

            {/* TAB 3: PLANETAS (AI Conselheira Orbia, Dreams Interpretation, Tarot, Daily Oracle) */}
            {activeTab === 'planetas' && (
              !user.hasCreatedMap ? (
                renderLockedSection(
                  "Portal de Planetas e Assistência Orbia",
                  "Seu horóscopo celestial detalhado, a interpretação de sonhos complexos e o acesso à conselheira de inteligência artificial Orbia dependem das coordenadas geométricas do seu nascimento. Sincronize seu mapa para desbloquear."
                )
              ) : (
                <div className="space-y-8 animate-in fade-in duration-300">
                
                {/* Header Banner */}
                <div className="p-6 rounded-3xl bg-linear-to-r from-rose-950/40 via-slate-905 to-slate-900 border border-rose-500/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl" />
                  <div className="relative">
                    <span className="px-3 py-1 rounded-full text-[10px] uppercase font-mono font-semibold tracking-wider text-rose-450 bg-rose-500/10 border border-rose-500/20">
                      Módulo Sistemas Ativos e Consultas
                    </span>
                    <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-slate-100 mt-2">
                      Sistemas Astros Ativos
                    </h1>
                    <p className="text-xs text-slate-400 max-w-xl mt-1">
                      Comunique-se com a Conselheira Orbia, interprete sonhos com Gemini no Cofre dos Sonhos e consulte o Oráculo diário.
                    </p>
                  </div>
                </div>

                {/* D3 Real-time Transit Map Alignment */}
                {mapData ? (
                  <TransitMap mapData={mapData} />
                ) : (
                  <div className="p-8 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-xs text-slate-500 animate-pulse">
                    Calculando trânsitos em tempo real e aspectos com seu mapa...
                  </div>
                )}

                {/* Monthly Celestial Transits History Panel */}
                <TransitHistory userName={user?.name} birthDate={user?.birthDate} />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Orbia AI Chat client */}
                  <div className="lg:col-span-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex flex-col justify-between h-[480px]">
                    <div className="space-y-1 pb-2 border-b border-slate-850 shrink-0">
                      <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-rose-450 rounded-full animate-ping" />
                        Orbia: Conselheira Pessoal Live
                      </h3>
                      <p className="text-[10px] text-slate-500">Inteligência Astrológica treinada com seu mapa.</p>
                    </div>

                    <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 max-h-[300px]">
                      {chatMessages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`flex flex-col max-w-[85%] space-y-1 ${
                            msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                          }`}
                        >
                          <div className={`p-3 rounded-2xl text-[11px] leading-relaxed font-sans ${
                            msg.sender === 'user' 
                              ? 'bg-rose-600 text-slate-100 rounded-tr-none' 
                              : 'bg-slate-950 border border-slate-850 text-slate-300 rounded-tl-none'
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[8px] font-mono text-slate-600 tracking-wider">
                            {msg.sender === 'user' ? 'Você' : 'Orbia'} · {msg.timestamp}
                          </span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-2 border-t border-slate-850 shrink-0">
                      <input 
                        type="text" 
                        required
                        placeholder="Pergunte sobre amor, emprego, mapa..."
                        value={currentChatInput}
                        onChange={(e) => setCurrentChatInput(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300 focus:outline-hidden"
                      />
                      <button 
                        type="submit"
                        disabled={isSendingChat}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-slate-100 font-bold text-xs uppercase rounded-xl transition"
                      >
                        {isSendingChat ? "..." : <Send className="w-3.5 h-3.5" />}
                      </button>
                    </form>
                  </div>

                  {/* Oráculo do Dia Component (Limit 1 consult matching PDF) */}
                  <div className="lg:col-span-6 bg-slate-900/20 p-6 rounded-3xl border border-rose-500/10 space-y-4">
                    <div className="pb-2 border-b border-slate-850 flex justify-between items-center">
                      <div>
                        <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Oráculo do Dia</h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">Limite de uma resposta profunda por dia.</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[8px] font-mono text-amber-500">
                        {hasQueriedOracleToday ? "Consumido de hoje" : "Disponível"}
                      </span>
                    </div>

                    {!oracleResponse ? (
                      <form onSubmit={handleAskOracle} className="space-y-4 pt-2">
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">
                          Sintonize sua mente. Qual dúvida crucial pesa em sua energia hoje? Faça uma pergunta livre para receber reflexão astrológica profunda.
                        </p>
                        <div>
                          <input 
                            type="text" 
                            required
                            disabled={hasQueriedOracleToday}
                            placeholder="e.g. Devo focar em mudar de carreira este Semestre?"
                            value={oracleQuestion}
                            onChange={(e) => setOracleQuestion(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-202 focus:outline-hidden"
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={isQueryingOracle || hasQueriedOracleToday}
                          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 font-sans font-bold text-xs uppercase transition border border-slate-700"
                        >
                          {isQueryingOracle ? "Consultando Sabedorias..." : "Evocar Conselho do Oráculo"}
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-3 font-sans">
                          <div className="space-y-1">
                            <span className="text-[8px] font-mono uppercase text-slate-500 block">Reflexão Metafísica</span>
                            <p className="text-xs text-slate-300 leading-relaxed italic">"{oracleResponse.reflection}"</p>
                          </div>

                          <div className="space-y-1 pt-1 border-t border-slate-900">
                            <span className="text-[8px] font-mono uppercase text-amber-500 block">Incentivo de Sintonia</span>
                            <p className="text-xs text-slate-400 leading-relaxed font-bold">{oracleResponse.inspiringMessage}</p>
                          </div>

                          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 text-[10.5px] text-slate-400">
                            <strong>Conselho Ativo:</strong> {oracleResponse.counsel}
                          </div>
                        </div>

                        <button 
                          onClick={() => setOracleResponse(null)}
                          className="text-xs text-slate-500 hover:text-slate-300 font-mono uppercase"
                        >
                          Fechar Oráculo de Hoje
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                {/* Central de Sonhos & Cofre de Sonhos Subtabs */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Register and interpret a Dream (P.1 advanced interpretation of dreams) */}
                  <div className="lg:col-span-5 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <div className="pb-2 border-b border-slate-850">
                      <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Registrar Diário / Central de Sonhos</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">Guarde e extraia os 9 pontos da inteligência onírica.</p>
                    </div>

                    <form onSubmit={handleRecordAndInterpretDream} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">TÍTULO RESUMIDO</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Encontro na Praia de Areias Escuras"
                          value={newDreamTitle}
                          onChange={(e) => setNewDreamTitle(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-200 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 mb-1">O QUE ACONTECEU NO SONHO? (DETALHADO)</label>
                        <textarea 
                          rows={4}
                          required
                          placeholder="Descreva detalhes, ambientes, pessoas e símbolos avistados no sonho..."
                          value={newDreamDesc}
                          onChange={(e) => setNewDreamDesc(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-205 focus:outline-hidden font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 mb-1">EMOÇÕES SENTIDAS</label>
                          <input 
                            type="text" 
                            title="Emocões separadas por vírgula"
                            placeholder="e.g. Confuso, Aliviado"
                            value={newDreamEmotions}
                            onChange={(e) => setNewDreamEmotions(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-xs text-slate-400 focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-505 mb-1">TAGS / SÍMBOLOS</label>
                          <input 
                            type="text" 
                            title="Tags separadas por vírgula"
                            placeholder="e.g. praia, chuva"
                            value={newDreamTags}
                            onChange={(e) => setNewDreamTags(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-xs text-slate-400 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isInterpretingDream}
                        className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-slate-100 font-sans font-bold text-xs uppercase transition duration-300 shadow-md"
                      >
                        {isInterpretingDream ? "Orbia Consultando Subconsciente..." : "Registrar & Analisar com Gemini"}
                      </button>
                    </form>
                  </div>

                  {/* Cofre de Sonhos History, patterns and statistics */}
                  <div className="lg:col-span-7 bg-slate-900/20 p-6 rounded-3xl border border-slate-800 space-y-6">
                    <div className="pb-2 border-b border-slate-800 flex justify-between items-center flex-wrap gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-slate-101 uppercase tracking-widest">Cofre de Sonhos Privado</h3>
                        <p className="text-[10px] text-slate-505 mt-0.5">Estudo estatístico e padrões identificados.</p>
                      </div>
                      
                      {/* Search keywords input */}
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Buscar símbolo..."
                          value={dreamSearchKey}
                          onChange={(e) => setDreamSearchKey(e.target.value)}
                          className="px-2.5 py-1 bg-slate-950 rounded border border-slate-850 text-[10px] text-slate-400 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    {/* Dream Patterns Identified metrics cards from PDF */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-slate-905 border border-slate-850">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Padrão Mais Recorrente</span>
                        <div className="text-xs font-bold text-rose-450 mt-1">"Vôo / Elevação"</div>
                        <span className="text-[8px] text-slate-500 font-mono mt-1 block">Detectado 12 vezes</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-905 border border-slate-850">
                        <span className="text-[8px] font-mono text-slate-505 uppercase block">Símbolo Frequente</span>
                        <div className="text-xs font-bold text-indigo-400 mt-1">"Água Abundante"</div>
                        <span className="text-[8px] text-slate-500 font-mono mt-1 block">Confirmado 8 vezes</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-905 border border-slate-850 col-span-2 md:col-span-1">
                        <span className="text-[8px] font-mono text-slate-505 uppercase block font-semibold">Terapia de Sonho</span>
                        <div className="text-xs font-bold text-emerald-400 mt-1">"Equilíbrio Estável"</div>
                        <span className="text-[8px] text-slate-530 font-mono mt-1 block">Conselhos aplicados</span>
                      </div>
                    </div>

                    {/* List of Registered Dreams */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Histórico de Relatórios Oníricos</h4>
                      
                      {dreamsHistory.filter(d => 
                        d.title.toLowerCase().includes(dreamSearchKey.toLowerCase()) ||
                        d.description.toLowerCase().includes(dreamSearchKey.toLowerCase())
                      ).length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-600 font-mono">
                          Nenhum registro correspondente no Cofre.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dreamsHistory.map((dream) => (
                            <div key={dream.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-850/80 hover:border-slate-800 transition">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-[8px] font-mono text-slate-500 block">{dream.date}</span>
                                  <h4 className="text-xs font-bold text-slate-200 mt-0.5">{dream.title}</h4>
                                </div>
                                
                                <div className="flex gap-1">
                                  {dream.tags.map(t => (
                                    <span key={t} className="px-1.5 py-0.5 bg-slate-950 text-[8px] font-mono rounded text-slate-500">
                                      #{t}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <p className="text-[10.5px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                                {dream.description}
                              </p>

                              {dream.interpretation && (
                                <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-850/60 space-y-2 font-sans text-[10px]">
                                  <div className="text-slate-350 italic">
                                    <strong>Resumo Inteligência:</strong> {dream.interpretation.summary}
                                  </div>
                                  
                                  {/* Render 9 parts collapse activator */}
                                  <button 
                                    onClick={() => {
                                      setSelectedDreamDisplay(dream);
                                    }}
                                    className="text-[9.5px] font-bold font-mono text-rose-455 hover:text-rose-350 block mt-1 uppercase"
                                  >
                                    Visualizar os 9 Pontos de Interpretação Avançada →
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* 9 Points Dream Interpretation Full View Modal Popup */}
                {selectedDreamDisplay !== null && selectedDreamDisplay.interpretation && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-[32px] max-w-3xl max-h-[85vh] overflow-y-auto space-y-6 relative font-sans">
                      <button 
                        onClick={() => setSelectedDreamDisplay(null)}
                        className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 transition"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      <div className="pb-3 border-b border-slate-850">
                        <span className="text-[9px] uppercase font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded">
                          Interpretação Avançada de Sonhos (9 Chaves)
                        </span>
                        <h3 className="text-xl font-bold text-slate-100 mt-3">Sonho: {selectedDreamDisplay.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">Extração analítica assistida por Gemini Pro.</p>
                      </div>

                      <div className="space-y-4 text-xs leading-relaxed text-slate-300">
                        {/* 1. Resumo */}
                        <div className="p-4 rounded-xl bg-slate-950 border border-slate-850">
                          <strong className="text-[10px] font-mono text-rose-400 block uppercase mb-1">1. Resumo Geral do Sonho</strong>
                          <p>{selectedDreamDisplay.interpretation.summary}</p>
                        </div>

                        {/* 2. Significados */}
                        <div>
                          <strong className="text-[10px] font-mono text-slate-500 block uppercase mb-1.5">2. Significados Principais</strong>
                          <ul className="list-disc pl-4 space-y-1">
                            {selectedDreamDisplay.interpretation.mainMeanings.map((m, i) => <li key={i}>{m}</li>)}
                          </ul>
                        </div>

                        {/* 3. Simbolismos */}
                        <div>
                          <strong className="text-[10px] font-mono text-slate-500 block uppercase mb-1.5">3. Simbolismos e Imagens</strong>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedDreamDisplay.interpretation.symbols.map((sym, i) => (
                              <div key={i} className="p-2.5 bg-slate-950 border border-slate-880 rounded-lg">
                                {sym}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 4. Aspectos emocionais */}
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-850">
                          <strong className="text-[10px] font-mono text-slate-500 block uppercase mb-1">4. Aspectos Emocionais Presentes</strong>
                          <p>{selectedDreamDisplay.interpretation.emotionalAspects}</p>
                        </div>

                        {/* 5. Possíveis reflexões */}
                        <div>
                          <strong className="text-[10px] font-mono text-slate-500 block uppercase mb-1.5">5. Possíveis Reflexões Práticas</strong>
                          <ul className="list-disc pl-4 space-y-1 text-slate-400 italic">
                            {selectedDreamDisplay.interpretation.reflections.map((r, i) => <li key={i}>"{r}"</li>)}
                          </ul>
                        </div>

                        {/* 6. Pontos positivos & 7. Pontos de atencao */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                            <strong className="text-[10px] font-mono text-emerald-400 block uppercase mb-1">6. Pontos Positivos Identificados</strong>
                            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
                              {selectedDreamDisplay.interpretation.positivePoints.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                          </div>

                          <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                            <strong className="text-[10px] font-mono text-rose-400 block uppercase mb-1">7. Pontos de Atenção/Desafios</strong>
                            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
                              {selectedDreamDisplay.interpretation.attentionPoints.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                          </div>
                        </div>

                        {/* 8. Conselhos */}
                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                          <strong className="text-[10px] font-mono text-amber-500 block uppercase mb-1">8. Conselhos Terapêuticos</strong>
                          <p className="text-[11.5px] text-slate-350">{selectedDreamDisplay.interpretation.advice}</p>
                        </div>

                        {/* 9. Mensagem final */}
                        <div className="text-center pt-2 border-t border-slate-850">
                          <strong className="text-[9px] font-mono text-slate-500 uppercase block tracking-widest">9. Mensagem de Alento</strong>
                          <p className="italic text-slate-400 font-serif text-sm mt-1">"{selectedDreamDisplay.interpretation.finalMessage}"</p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-850">
                        <button 
                          onClick={() => setSelectedDreamDisplay(null)}
                          className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-100 text-xs font-bold font-sans uppercase"
                        >
                          Fechar Interpretação
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Gamified Missions list Subcomponent */}
                <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4">
                  <div className="pb-2 border-b border-slate-850 flex justify-between items-center sm:flex-nowrap flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Missões Diárias de Evolução Astrológica</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Siga as tarefas indicadas para desbloquear pontos diários.</p>
                    </div>

                    <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-mono text-amber-500">
                      Pontos hoje: +{dailyMissions.filter(m => m.isCompleted).reduce((sum, current) => sum + current.points, 0)} pts
                    </span>
                  </div>

                  <div className="space-y-3 font-sans">
                    {dailyMissions.map((task) => (
                      <div 
                        key={task.id} 
                        onClick={() => handleToggleMission(task.id)}
                        className={`p-3 rounded-2xl border transition flex justify-between items-center gap-4 cursor-pointer hover:border-slate-600 ${
                          task.isCompleted 
                            ? 'bg-slate-900/80 border-slate-800 opacity-60' 
                            : 'bg-slate-950 border-slate-850'
                        }`}
                      >
                        <div>
                          <h5 className={`text-xs font-bold text-slate-201 ${task.isCompleted ? 'line-through text-slate-500' : ''}`}>
                            {task.title}
                          </h5>
                          <p className="text-[10px] text-slate-455 mt-0.5">{task.description}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[9px] font-mono text-amber-500 font-bold">+{task.points} pts</span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                            task.isCompleted 
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' 
                              : 'border-slate-800 bg-slate-950'
                          }`}>
                            {task.isCompleted ? "✓" : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
              )
            )}

            {/* TAB: TAROT COSIMCO */}
            {activeTab === 'tarot' && (
              !user.hasCreatedMap ? (
                renderLockedSection(
                  "Portal de Tarô Cósmico",
                  "A interpretação profunda e a leitura semanal personalizada dos arcanos maiores dependem do alinhamento geométrico cósmico de nascimento. Sincronize seu mapa astral para desbloquear as consultas oraculares gratuitas."
                )
              ) : (
                <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-350">
                  <TarotSystem userName={user.name} />
                </div>
              )
            )}

            {/* TAB 4: CONFIGURACOES (Profile custom edit, sms alerts & languages) */}
            {activeTab === 'configuracoes' && (
              <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
                
                {/* Header Banner */}
                <div className="p-6 rounded-3xl bg-linear-to-r from-slate-950 via-slate-905 to-slate-900 border border-slate-850 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-slate-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative flex justify-between items-center">
                    <div>
                      <span className="px-3 py-1 rounded-full text-[10px] uppercase font-mono font-semibold tracking-wider text-slate-500 bg-slate-800/20 border border-slate-800">
                        Painel de Controle
                      </span>
                      <h1 className="text-2xl font-sans font-bold tracking-tight text-slate-100 mt-2">
                        Configurações Gerais
                      </h1>
                      <p className="text-xs text-slate-500 mt-1">
                        Gerencie suas coordenadas, sintonizações premium e preferências.
                      </p>
                    </div>
                    <span className="text-3xl text-[#E5C158] shrink-0">⚙️</span>
                  </div>
                </div>

                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Profile Editor form */}
                  <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4 font-sans">
                    <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-850">Editar Coordenadas Celestes</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-505 mb-1">DATA DE NASCIMENTO</label>
                        <input 
                          type="date" 
                          value={user.birthDate} 
                          onChange={(e) => handleUpdateUserProfile({ birthDate: e.target.value })} 
                          className="w-full px-3 py-2 rounded-xl bg-slate-955 border border-slate-850 text-xs text-slate-200 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-505 mb-1">HORA COMPLETA</label>
                        <input 
                          type="text" 
                          value={user.birthTime} 
                          onChange={(e) => handleUpdateUserProfile({ birthTime: e.target.value })} 
                          className="w-full px-3 py-2 rounded-xl bg-slate-955 border border-slate-850 text-xs text-slate-200 focus:outline-hidden"
                          placeholder="e.g. 15:30"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-mono text-slate-505 mb-1">CIDADE CODIFICADA</label>
                        <input 
                          type="text" 
                          value={user.birthCity} 
                          onChange={(e) => handleUpdateUserProfile({ birthCity: e.target.value })} 
                          className="w-full px-3 py-2 rounded-xl bg-slate-955 border border-slate-850 text-xs text-slate-200 focus:outline-hidden"
                          placeholder="e.g. São Paulo, SP"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferences notifications switch controls */}
                  <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4">
                    <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-850">Alertas e Notificações</h3>
                    
                    <div className="space-y-4 font-sans text-xs">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <strong>Notificações Diárias Push</strong>
                          <p className="text-[10px] text-slate-500">Receber alertas de trânsitos e biorritmo de manhã no celular.</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notifyDaily}
                          onChange={(e) => setNotifyDaily(e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <strong>SMS Astro-Reminders</strong>
                          <p className="text-[10px] text-slate-550 mr-2">Alertas urgentes de trânsitos tensos (Mercúrio Retrógrado).</p>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={notifyTransit}
                          onChange={(e) => setNotifyTransit(e.target.checked)}
                          className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Language selection dropdown config */}
                  <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4 font-sans">
                    <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-850">Soberania de Idiomas</h3>
                    
                    <div className="flex justify-between items-center text-xs">
                      <div>
                        <strong>Idioma Predileto</strong>
                        <p className="text-[10px] text-slate-500">Traduções automáticas aplicadas em relatórios avançados de IA.</p>
                      </div>

                      <select 
                        value={lang} 
                        onChange={(e) => setLang(e.target.value as any)}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-200 focus:outline-hidden"
                      >
                        <option value="pt">Português (BR)</option>
                        <option value="en">English (US)</option>
                        <option value="es">Español (ES)</option>
                      </select>
                    </div>
                  </div>

                  {/* Support coordinates credits details */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 text-[10.5px] text-slate-550 leading-relaxed font-mono">
                    Sua conta de e-mail fabriciosouzasantos02@gmail.com está associada a direitos exclusivos sob a licença de teste. Em caso de dúvidas, faça contato com a equipe de suporte Star Map pelo canal oficial de auditorias de integridade celestial.
                  </div>

                  {/* Logout Button secondary */}
                  <div className="pt-2">
                    <button 
                      onClick={() => setIsLoggedIn(false)}
                      type="button"
                      className="w-full py-3 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 rounded-2xl text-xs font-bold text-red-400 font-sans uppercase tracking-wider transition active:scale-98 cursor-pointer"
                    >
                      Logout desta Sessão
                    </button>
                  </div>
                </div>

              </div>
            )}

          </main>

          {/* ========================================= */}
          {/* BOTTOM FLOATING NAV BAR - (REQUESTED NAVIGATION SYSTEM!) */}
          {/* ========================================= */}
          <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-lg bg-slate-900/90 border border-amber-500/15 p-2 rounded-full shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-md z-40 flex justify-between items-center">
            
            {/* Mapa Estelar Tab activator */}
            <button
              onClick={() => setActiveTab('mapa')}
              className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'mapa' 
                  ? 'text-amber-500 bg-amber-500/10' 
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              <Orbit className="w-5 h-5" />
              <span className="text-[8px] font-mono uppercase tracking-wide mt-1 font-bold">Mapa Estelar</span>
            </button>

            {/* Constelações Tab activator */}
            <button
              onClick={() => setActiveTab('constelacoes')}
              className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'constelacoes' 
                  ? 'text-emerald-400 bg-emerald-500/10' 
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              <Compass className="w-5 h-5" />
              <span className="text-[8px] font-mono uppercase tracking-wide mt-1 font-bold">Constelações</span>
            </button>

            {/* Planetas Tab activator */}
            <button
              onClick={() => setActiveTab('planetas')}
              className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'planetas' 
                  ? 'text-rose-450 bg-rose-500/10' 
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span className="text-[8px] font-mono uppercase tracking-wide mt-1 font-bold">Planetas</span>
            </button>

            {/* Tarot Tab activator */}
            <button
              onClick={() => setActiveTab('tarot')}
              className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'tarot' 
                  ? 'text-amber-500 bg-amber-500/10' 
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span className="text-[8px] font-mono uppercase tracking-wide mt-1 font-bold">Tarot</span>
            </button>

            {/* Configurações Tab activator */}
            <button
              onClick={() => setActiveTab('configuracoes')}
              className={`flex-1 flex flex-col items-center py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'configuracoes' 
                  ? 'text-[#F59E0B] bg-[#F59E0B]/10' 
                  : 'text-slate-450 hover:text-slate-200'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[8px] font-mono uppercase tracking-wide mt-1 font-bold">Ajustes</span>
            </button>

          </nav>

        </div>
      )}
    </div>
  );
}
