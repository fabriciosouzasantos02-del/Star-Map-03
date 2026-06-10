import React, { useState, useMemo } from 'react';
import { CompatibilityResult, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Plus, 
  AlertCircle, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  MapPin, 
  Check, 
  RotateCcw,
  Compass,
  Star,
  Eye,
  Search,
  SlidersHorizontal,
  Filter
} from 'lucide-react';

interface CompatibilityViewProps {
  user: UserProfile;
}

interface SavedContact {
  id: string;
  name: string;
  birthDate: string;
  relationType: 'love' | 'friend' | 'business';
  love: number;
  friendship: number;
  business: number;
  communication: number;
  harmony: number;
}

// Highly polished custom 8 profiles for "Curtidas recebidas" astrológicas
const LIKES_RECEIVED = [
  {
    id: "like_1",
    name: "Beatriz Castro",
    age: 24,
    sign: "Câncer",
    symbol: "♋",
    match: 96,
    location: "São Paulo, SP",
    avatarColor: "from-pink-500 to-rose-500",
    description: "Sente uma conexão magnética de almas desde o primeiro instante no mapa solar.",
    weakness: "Vulnerabilidade emocional profunda de carinho",
    strength: "Cuidado íntimo, intuição sinérgica ativa",
    bestDay: "Segundas de Lua Cheia"
  },
  {
    id: "like_2",
    name: "Mariana Lins",
    age: 27,
    sign: "Escorpião",
    symbol: "♏",
    match: 91,
    location: "Rio de Janeiro, RJ",
    avatarColor: "from-purple-600 to-indigo-700",
    description: "As posições de Vênus indicam forte atração cósmica e conversas profundas transformadoras.",
    weakness: "Excesso de mistério inicial receptivo",
    strength: "Lealdade absoluta, paixão intelectual",
    bestDay: "Terças regidas por Marte celeste"
  },
  {
    id: "like_3",
    name: "Juliana Ribeiro",
    age: 25,
    sign: "Peixes",
    symbol: "♓",
    match: 88,
    location: "Belo Horizonte, MG",
    avatarColor: "from-blue-400 to-teal-500",
    description: "Sua Lua dita um sincronismo que entra em harmonia absoluta com a sensibilidade transcendental de Peixes.",
    weakness: "Devaneios frequentes e excesso de idealização",
    strength: "Empatia universal pura, inspiração astrológica",
    bestDay: "Quintas de Júpiter"
  },
  {
    id: "like_4",
    name: "Camila Meireles",
    age: 28,
    sign: "Touro",
    symbol: "♉",
    match: 85,
    location: "Curitiba, PR",
    avatarColor: "from-emerald-500 to-green-600",
    description: "Estabilidade extraordinária de metas materiais e propósitos refinados em parcerias duradouras.",
    weakness: "Teimosia em rotinas consolidadas",
    strength: "Pé no chão de realidade, sensualidade estável e calma",
    bestDay: "Sextas de Vênus soberana"
  },
  {
    id: "like_5",
    name: "Gabriela Sol",
    age: 23,
    sign: "Leão",
    symbol: "♌",
    match: 82,
    location: "Salvador, BA",
    avatarColor: "from-amber-400 to-orange-500",
    description: "Uma explosão maravilhosa de criatividade calorosa, brilho compartilhado e risadas sinceras.",
    weakness: "Gosta de ser o centro absoluto das atenções",
    strength: "Alegria radiante solar, generosidade calorosa de espírito",
    bestDay: "Domingos de Sol central"
  },
  {
    id: "like_6",
    name: "Fernanda Werner",
    age: 26,
    sign: "Capricórnio",
    symbol: "♑",
    match: 79,
    location: "Porto Alegre, RS",
    avatarColor: "from-slate-600 to-zinc-800",
    description: "Forte magnetismo profissional e alinhamento admirável de ambições materiais concretas.",
    weakness: "Rigidez extrema ou excesso de foco no dever",
    strength: "Disciplina estrutural exemplar, sabedoria madura secular",
    bestDay: "Sábados de Saturno"
  },
  {
    id: "like_7",
    name: "Larissa Prado",
    age: 25,
    sign: "Gêmeos",
    symbol: "♊",
    match: 75,
    location: "Brasília, DF",
    avatarColor: "from-cyan-400 to-blue-500",
    description: "Estimulação magnética de mente ágil, debates intelectuais provocativos e roteiros de viagens inusitadas.",
    weakness: "Inconstância em focos mundanos de longo prazo",
    strength: "Comunicação verbal brilhante, adaptabilidade rápida",
    bestDay: "Quartas de Mercúrio veloz"
  },
  {
    id: "like_8",
    name: "Amanda Ramos",
    age: 29,
    sign: "Virgem",
    symbol: "♍",
    match: 72,
    location: "Recife, PE",
    avatarColor: "from-stone-600 to-amber-700",
    description: "Equilíbrio prático e organization precisa no cotidiano. Otimização mútua de hábitos saudáveis.",
    weakness: "Autoexigência minuciosa exagerada de padrões",
    strength: "Foco analítico refinado, prestatividade sincera cotidiana",
    bestDay: "Quartas de Mercúrio terrestre"
  }
];

// Elegant Visitors List representing Recent Visitors ("Visitantes recentes")
const VISITORS = [
  {
    id: "visitor_1",
    name: "Gabriela Silveira",
    age: 23,
    sign: "Libra",
    symbol: "♎",
    time: "Há 10 minutos",
    status: "online",
    match: 94,
    avatarColor: "from-purple-500 to-pink-500",
    location: "São Paulo, SP",
    astroAura: "Vênus exaltado em conjunção harmônica",
    purpose: "Visitou para analisar compatibilidade afetiva no elemento Ar."
  },
  {
    id: "visitor_2",
    name: "Alexandre Pontes",
    age: 28,
    sign: "Gêmeos",
    symbol: "♊",
    time: "Há 1 hora",
    status: "offline",
    match: 87,
    avatarColor: "from-blue-500 to-indigo-600",
    location: "Campinas, SP",
    astroAura: "Mercúrio em trígono perfeito solar",
    purpose: "Analisou sua afinidade intelectual e padrão de comunicação."
  },
  {
    id: "visitor_3",
    name: "Rebeca Castro",
    age: 25,
    sign: "Sagitário",
    symbol: "♐",
    time: "Há 4 horas",
    status: "offline",
    match: 83,
    avatarColor: "from-amber-555 to-red-500",
    location: "Rio de Janeiro, RJ",
    astroAura: "Júpiter em oposição estimulante",
    purpose: "Atraída pela sua assinatura de aventura e exploração filosófica."
  },
  {
    id: "visitor_4",
    name: "Mateus Alencar",
    age: 26,
    sign: "Áries",
    symbol: "♈",
    time: "Ontem",
    status: "offline",
    match: 79,
    avatarColor: "from-red-600 to-orange-500",
    location: "Belo Horizonte, MG",
    astroAura: "Marte ativando sua casa 5 amorosa",
    purpose: "Química magnética instantânea despertada em análise solar."
  },
  {
    id: "visitor_5",
    name: "Isabella Dias",
    age: 22,
    sign: "Câncer",
    symbol: "♋",
    time: "Há 2 dias",
    status: "offline",
    match: 75,
    avatarColor: "from-pink-400 to-rose-600",
    location: "Salvador, BA",
    astroAura: "Lua em conjunção com seu Ascendente",
    purpose: "Buscou conexão profunda de intuição e afeto familiar mútuo."
  },
  {
    id: "visitor_6",
    name: "Thiago Mendes",
    age: 30,
    sign: "Touro",
    symbol: "♉",
    time: "Há 3 dias",
    status: "offline",
    match: 68,
    avatarColor: "from-emerald-600 to-green-500",
    location: "Curitiba, PR",
    astroAura: "Saturno influenciando estabilidade terrestre",
    purpose: "Visitou visando avaliar sinergia profissional e objetivos de longo prazo."
  }
];

// Dynamic Database for Finding People ("Encontrar Pessoas")
const FIND_PEOPLE_DATABASE = [
  {
    id: "fp_1",
    name: "Wanderson da Silva Ferreira",
    status: "offline",
    hasPhoto: true,
    avatarColor: "from-teal-500 to-indigo-555",
    chart: {
      sol: "Touro",
      ascendente: "Virgem",
      lua: "Capricórnio",
      marte: "Peixes",
      venus: "Câncer",
      mercurio: "Touro",
      jupiter: "Áries",
      saturno: "Touro"
    },
    location: "Belo Horizonte, MG",
    age: 26,
    match: 84
  },
  {
    id: "fp_2",
    name: "CALEBE DA SILVA PEREIRA TOLEDO",
    status: "offline",
    hasPhoto: true,
    avatarColor: "from-orange-500 to-red-500",
    chart: {
      sol: "Leão",
      ascendente: "Sagitário",
      lua: "Áries",
      marte: "Leão",
      venus: "Gêmeos",
      mercurio: "Câncer",
      jupiter: "Peixes",
      saturno: "Capricórnio"
    },
    location: "São Paulo, SP",
    age: 22,
    match: 78
  },
  {
    id: "fp_3",
    name: "Eugênio Antunes Nunes Dotto",
    status: "offline",
    hasPhoto: true,
    avatarColor: "from-blue-500 to-purple-600",
    chart: {
      sol: "Aquário",
      ascendente: "Gêmeos",
      lua: "Libra",
      marte: "Libra",
      venus: "Peixes",
      mercurio: "Aquário",
      jupiter: "Touro",
      saturno: "Aquário"
    },
    location: "Porto Alegre, RS",
    age: 31,
    match: 89
  },
  {
    id: "fp_4",
    name: "Icaro Gabriel",
    status: "offline",
    hasPhoto: true,
    avatarColor: "from-indigo-500 to-cyan-500",
    chart: {
      sol: "Áries",
      ascendente: "Leão",
      lua: "Sagitário",
      marte: "Áries",
      venus: "Áries",
      mercurio: "Câncer",
      jupiter: "Leão",
      saturno: "Sagitário"
    },
    location: "Recife, PE",
    age: 24,
    match: 81
  },
  {
    id: "fp_5",
    name: "Marcus Vinicius de Lima quaresma",
    status: "offline",
    hasPhoto: true,
    avatarColor: "from-emerald-500 to-teal-700",
    chart: {
      sol: "Escorpião",
      ascendente: "Escorpião",
      lua: "Peixes",
      marte: "Escorpião",
      venus: "Escorpião",
      mercurio: "Libra",
      jupiter: "Virgem",
      saturno: "Touro"
    },
    location: "Rio de Janeiro, RJ",
    age: 28,
    match: 92
  },
  {
    id: "fp_6",
    name: "Jaqueline turco",
    status: "offline",
    hasPhoto: true,
    avatarColor: "from-pink-500 to-rose-450",
    chart: {
      sol: "Libra",
      ascendente: "Sagitário",
      lua: "Touro",
      marte: "Libra",
      venus: "Sagitário",
      mercurio: "Virgem",
      jupiter: "Libra",
      saturno: "Leão"
    },
    location: "Curitiba, PR",
    age: 27,
    match: 95
  },
  {
    id: "fp_7",
    name: "ADSON HENRIQUE",
    status: "offline",
    hasPhoto: true,
    avatarColor: "from-amber-450 to-orange-600",
    chart: {
      sol: "Sagitário",
      ascendente: "Áries",
      lua: "Gêmeos",
      marte: "Sagitário",
      venus: "Capricórnio",
      mercurio: "Sagitário",
      jupiter: "Escorpião",
      saturno: "Capricórnio"
    },
    location: "Goiânia, GO",
    age: 25,
    match: 86
  },
  {
    id: "fp_8",
    name: "Priscila Ribeiro Silva",
    status: "offline",
    hasPhoto: true,
    avatarColor: "from-purple-400 to-fuchsia-600",
    chart: {
      sol: "Câncer",
      ascendente: "Peixes",
      lua: "Escorpião",
      marte: "Câncer",
      venus: "Touro",
      mercurio: "Câncer",
      jupiter: "Câncer",
      saturno: "Câncer"
    },
    location: "Niterói, RJ",
    age: 29,
    match: 88
  },
  {
    id: "fp_9",
    name: "Adriane Santos",
    status: "offline",
    hasPhoto: true,
    avatarColor: "from-slate-400 to-slate-500",
    chart: {
      sol: "Peixes",
      ascendente: "Touro",
      lua: "Virgem",
      marte: "Aquário",
      venus: "Peixes",
      mercurio: "Peixes",
      jupiter: "Touro",
      saturno: "Peixes"
    },
    location: "Salvador, BA",
    age: 33,
    match: 73
  },
  {
    id: "fp_10",
    name: "Iasmim de Souza Alves",
    status: "offline",
    hasPhoto: true,
    avatarColor: "from-sky-450 to-blue-500",
    chart: {
      sol: "Gêmeos",
      ascendente: "Aquário",
      lua: "Gêmeos",
      marte: "Gêmeos",
      venus: "Gêmeos",
      mercurio: "Gêmeos",
      jupiter: "Áries",
      saturno: "Gêmeos"
    },
    location: "Fortaleza, CE",
    age: 23,
    match: 90
  },
  {
    id: "fp_11",
    name: "Natasha Oliveira Cavalcante",
    status: "offline",
    hasPhoto: true,
    avatarColor: "from-rose-500 to-violet-600",
    chart: {
      sol: "Virgem",
      ascendente: "Capricórnio",
      lua: "Touro",
      marte: "Virgem",
      venus: "Virgem",
      mercurio: "Virgem",
      jupiter: "Virgem",
      saturno: "Virgem"
    },
    location: "Manaus, AM",
    age: 27,
    match: 82
  }
];

export default function CompatibilityView({ user }: CompatibilityViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'detector' | 'busca'>('geral'); // Start on 'geral'
  const [relationCategory, setRelationCategory] = useState<'love' | 'business' | 'friend'>('love');
  const [subjectName, setSubjectName] = useState('Lucas');
  const [partnerName, setPartnerName] = useState('Marina');
  const [partnerDate, setPartnerDate] = useState('1998-05-20');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<CompatibilityResult | null>({
    partnerName: "Marina",
    partnerBirthDate: "1998-05-20",
    lovePercent: 78,
    friendshipPercent: 76,
    businessPercent: 72,
    communicationPercent: 80,
    emotionalAffinityPercent: 74,
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
  });

  // Interactivity for planetary aspect accordions and elements details
  const [expandedAspectIndex, setExpandedAspectIndex] = useState<number | null>(0);
  const [showElementsDetails, setShowElementsDetails] = useState<boolean>(false);
  const [showMinorAspects, setShowMinorAspects] = useState<boolean>(false);

  // Curtidas custom interactive states
  const [selectedLikeId, setSelectedLikeId] = useState<string | null>("like_1");
  const [revealedLikes, setRevealedLikes] = useState<Record<string, boolean>>({
    like_1: true, // Beatriz is pre-revealed
    like_2: true
  });
  const [likedBack, setLikedBack] = useState<Record<string, boolean>>({});

  // Visitors interactive states
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>("visitor_1");
  const [notifiedVisitors, setNotifiedVisitors] = useState<Record<string, boolean>>({});

  // FIND_PEOPLE filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyWithPhoto, setOnlyWithPhoto] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Dropdowns for advanced filter
  const [filterSol, setFilterSol] = useState('Qualquer');
  const [filterAsc, setFilterAsc] = useState('Qualquer');
  const [filterLua, setFilterLua] = useState('Qualquer');
  const [filterMarte, setFilterMarte] = useState('Qualquer');
  const [filterVenus, setFilterVenus] = useState('Qualquer');
  const [filterMercurio, setFilterMercurio] = useState('Qualquer');
  const [filterJupiter, setFilterJupiter] = useState('Qualquer');
  const [filterSaturno, setFilterSaturno] = useState('Qualquer');

  // Selected find people profile
  const [selectedFpId, setSelectedFpId] = useState<string | null>("fp_1");

  // Dynamic filter logic for Find People
  const filteredPeople = useMemo(() => {
    return FIND_PEOPLE_DATABASE.filter(person => {
      // "Escreva o nome" text input filter
      if (searchTerm && !person.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // "Apenas perfis com foto" checkbox filter
      if (onlyWithPhoto && !person.hasPhoto) {
        return false;
      }
      
      // Individual dropdown positions filters
      if (filterSol !== 'Qualquer' && person.chart.sol !== filterSol) return false;
      if (filterAsc !== 'Qualquer' && person.chart.ascendente !== filterAsc) return false;
      if (filterLua !== 'Qualquer' && person.chart.lua !== filterLua) return false;
      if (filterMarte !== 'Qualquer' && person.chart.marte !== filterMarte) return false;
      if (filterVenus !== 'Qualquer' && person.chart.venus !== filterVenus) return false;
      if (filterMercurio !== 'Qualquer' && person.chart.mercurio !== filterMercurio) return false;
      if (filterJupiter !== 'Qualquer' && person.chart.jupiter !== filterJupiter) return false;
      if (filterSaturno !== 'Qualquer' && person.chart.saturno !== filterSaturno) return false;

      return true;
    });
  }, [searchTerm, onlyWithPhoto, filterSol, filterAsc, filterLua, filterMarte, filterVenus, filterMercurio, filterJupiter, filterSaturno]);

  // Detector state
  const [savedContacts, setSavedContacts] = useState<SavedContact[]>([
    {
      id: "sc1",
      name: "Eduarda Santos",
      birthDate: "1995-10-14",
      relationType: "love",
      love: 92,
      friendship: 85,
      business: 65,
      communication: 88,
      harmony: 82
    },
    {
      id: "sc2",
      name: "João Silva (Trabalho)",
      birthDate: "1991-03-22",
      relationType: "business",
      love: 42,
      friendship: 76,
      business: 94,
      communication: 90,
      harmony: 75
    }
  ]);

  const [newContactName, setNewContactName] = useState('');
  const [newContactDate, setNewContactDate] = useState('');
  const [newContactType, setNewContactType] = useState<'love' | 'friend' | 'business'>('friend');

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName) return;
    setIsEvaluating(true);

    try {
      const response = await fetch("/api/compatibility/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: subjectName,
          birthDate: user.birthDate,
          companionName: partnerName,
          companionBirthDate: partnerDate,
        })
      });
      const data = await response.json();
      if (data.compatibility) {
        setResult(data.compatibility);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName) return;

    // Plausible values
    const hash = newContactName.length + newContactType.length;
    const loveVal = 40 + (hash * 7) % 58;
    const friendVal = 40 + (hash * 4) % 58;
    const bizVal = 40 + (hash * 9) % 58;
    const commVal = 40 + (hash * 3) % 58;
    const harmVal = Math.round((loveVal + friendVal + bizVal + commVal) / 4);

    const newContact: SavedContact = {
      id: `sc_${Date.now()}`,
      name: newContactName,
      birthDate: newContactDate || "1994-06-09",
      relationType: newContactType,
      love: loveVal,
      friendship: friendVal,
      business: bizVal,
      communication: commVal,
      harmony: harmVal
    };

    setSavedContacts([...savedContacts, newContact]);
    setNewContactName('');
    setNewContactDate('');
  };

  const handleDeleteContact = (id: string) => {
    setSavedContacts(savedContacts.filter(c => c.id !== id));
  };

  const handleToggleRevealLike = (id: string) => {
    setRevealedLikes(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleLikeBack = (id: string, name: string) => {
    if (likedBack[id]) return;
    
    setLikedBack(prev => ({ ...prev, [id]: true }));
    
    // Automatically add tosaved contacts
    const newContact: SavedContact = {
      id: `like_back_${id}`,
      name: name,
      birthDate: "1998-05-20",
      relationType: "love",
      love: 90,
      friendship: 85,
      business: 70,
      communication: 93,
      harmony: 88
    };
    setSavedContacts(prev => [...prev, newContact]);
  };

  return (
    <div id="compatibility-module" className="space-y-6">
      {/* Dynamic Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 via-slate-950 to-pink-950/40 border border-pink-500/15 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-84 h-84 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-84 h-84 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="px-3 py-1 rounded-full text-[10px] uppercase font-mono font-semibold tracking-wider text-pink-400 bg-pink-500/10 border border-pink-500/20">
            Módulo Sinastria & Interesse Premium
          </span>
          <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-white mt-2">
            Compatibilidade Astrológica
          </h1>
          <p className="text-xs text-slate-400 max-w-xl mt-1 leading-relaxed">
            Compare o seu mapa astral com as pessoas cruciais da sua vida. Descubra forças de comunicação, química amorosa, afinidade profissional e descubra quem demonstrou interesse em você.
          </p>
        </div>
      </div>

      {/* Selector Subtabs */}
      <div id="subtabs-astrosocial" className="flex gap-4 border-b border-slate-800 overflow-x-auto pb-0.5 scrollbar-thin">
        
        <button
          id="btn-subtab-geral"
          onClick={() => setActiveSubTab('geral')}
          className={`pb-2.5 text-xs font-bold font-sans tracking-wide uppercase transition-all border-b-2 shrink-0 cursor-pointer ${
            activeSubTab === 'geral' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Cruzamento Astrológico
        </button>

        {/* REQUESTED TAB: Encontrar Pessoas */}
        <button
          id="btn-subtab-busca"
          onClick={() => setActiveSubTab('busca')}
          className={`pb-2.5 text-xs font-bold font-sans tracking-wide uppercase transition-all border-b-2 shrink-0 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'busca' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className={`w-4 h-4 ${activeSubTab === 'busca' ? 'text-amber-550 spin-slow' : 'text-slate-400'}`} />
          Encontrar Pessoas
        </button>

        <button
          id="btn-subtab-detector"
          onClick={() => setActiveSubTab('detector')}
          className={`pb-2.5 text-xs font-bold font-sans tracking-wide uppercase transition-all border-b-2 shrink-0 cursor-pointer ${
            activeSubTab === 'detector' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Detector de Afinidades
        </button>

      </div>

      <AnimatePresence mode="wait">
        {false && (
          <motion.div
            key="curtidas-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            
            {/* Introductory statement / requested text */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-805 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-4">
                <div>
                  <h4 className="text-[10px] font-bold font-mono text-pink-400 uppercase tracking-widest">
                    Veja quem demonstrou interesse por você!
                  </h4>
                  <h2 className="text-base font-bold text-white mt-1 uppercase font-mono">
                    QUEM ME CURTIU
                  </h2>
                </div>
                
                <div className="px-3.5 py-2 bg-gradient-to-r from-pink-500/10 to-indigo-500/10 border border-pink-500/20 rounded-2xl">
                  <span className="text-xs font-mono font-bold text-pink-400 block sm:inline">
                     8 pessoas já curtiram o seu perfil
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-350 leading-relaxed max-w-3xl">
                Confira a lista completa de pessoas que se interessaram por você e curtiram o seu perfil. Analise as compatibilidades biológicas e os mapas astrológicos cruzados de cada um para descobrir quem compartilha o melhor ritmo de sua frequência.
              </p>
            </div>

            {/* Split screen content: 8 Cards and Selected Detailed analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: 8 Card profiles listing */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10.5px] font-mono text-slate-400 uppercase font-semibold">Candidatas Sintonizadas ({LIKES_RECEIVED.length})</span>
                  <span className="text-[9px] font-mono text-slate-600">Clique para expandir relatório astral</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {LIKES_RECEIVED.map((profile) => {
                    const isSelected = selectedLikeId === profile.id;
                    const isRevealed = revealedLikes[profile.id];
                    const hasLiked = likedBack[profile.id];

                    return (
                      <div
                        key={profile.id}
                        onClick={() => setSelectedLikeId(profile.id)}
                        className={`p-4 rounded-2xl transition-all duration-300 flex items-center justify-between gap-4 flex-wrap cursor-pointer border ${
                          isSelected 
                            ? 'bg-slate-900 border-pink-500/55 shadow-md shadow-pink-500/5' 
                            : 'bg-slate-900/50 border-slate-850 hover:bg-slate-900/80 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Profile Avatar custom graphic style representation */}
                          <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${profile.avatarColor} text-slate-950 flex shadow-inner items-center justify-center font-bold relative shrink-0`}>
                            {isRevealed ? (
                              <span className="text-sm font-sans tracking-tighter">{profile.name.split(' ')[0][0]}{profile.name.split(' ')[1]?.[0] || 'A'}</span>
                            ) : (
                              <span className="text-sm">?</span>
                            )}
                            <div className="absolute -bottom-1.5 -right-1 bg-slate-950 text-pink-400 font-mono text-[9px] w-5 h-5 rounded-full border border-slate-850 flex items-center justify-center" title="Signo">
                              {profile.symbol}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-200">
                                {isRevealed ? profile.name : "Perfil Oculto Sideral"}
                              </h4>
                              <span className="text-[10px] text-slate-405 font-medium">({profile.age} anos)</span>
                            </div>

                            <p className="text-[10px] font-mono text-slate-505 truncate mt-0.5">
                              {profile.sign} • {profile.location}
                            </p>
                          </div>
                        </div>

                        {/* Interactive match percent and custom actions */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block">Compatibilidade</span>
                            <span className="text-xs font-black font-mono text-pink-400">{profile.match}% Match</span>
                          </div>

                          {/* Action button to like back */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLikeBack(profile.id, profile.name);
                            }}
                            className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                              hasLiked 
                                ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/10' 
                                : 'bg-pink-500/10 border-pink-500/25 text-pink-400 hover:bg-pink-500/20 hover:scale-105 active:scale-95'
                            }`}
                            title={hasLiked ? "Match Conectado!" : "Curtir de volta para conversar"}
                          >
                            {hasLiked ? <Check className="w-4 h-4" /> : <Heart className="w-4 h-4 fill-pink-500/10" />}
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detailed Compatibility of Selected Profile */}
              <div className="lg:col-span-5">
                <div className="sticky top-20">
                  {selectedLikeId ? (() => {
                    const profile = LIKES_RECEIVED.find(p => p.id === selectedLikeId)!;
                    const isRevealed = revealedLikes[profile.id];
                    const hasLiked = likedBack[profile.id];

                    return (
                      <div className="bg-slate-900 border border-slate-805 rounded-3xl p-5 space-y-4 shadow-xl">
                        
                        {/* Profile header analysis panel */}
                        <div className="text-center pb-4 border-b border-slate-850 space-y-2">
                          <div className={`w-16 h-16 rounded-full bg-linear-to-tr ${profile.avatarColor} text-slate-950 flex items-center justify-center font-bold text-lg mx-auto shadow-lg relative`}>
                            {isRevealed ? (
                              <span>{profile.name.split(' ').map(n => n[0]).join('')}</span>
                            ) : (
                              <span>?</span>
                            )}
                            <span className="absolute -bottom-1 -right-1 bg-slate-950 border border-slate-800 text-pink-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                              {profile.symbol}
                            </span>
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-white">
                              {isRevealed ? profile.name : "Perfil Oculto de Luz"}
                            </h3>
                            <p className="text-[10px] font-mono text-slate-450 mt-0.5">
                              {profile.sign} • {profile.age} anos • {profile.location}
                            </p>
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 font-mono text-[10px] rounded-full font-bold">
                            <Sparkles className="w-3.5 h-3.5" />
                            {profile.match}% Afinação Sideral
                          </div>
                        </div>

                        {/* Description & Weakness / strength dynamics */}
                        <div className="space-y-3 pt-1">
                          
                          <div className="space-y-1">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block">Análise de Atração Cósmica</span>
                            <p className="text-xs text-slate-350 leading-relaxed font-sans">
                              {profile.description}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2 text-[10.5px]">
                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850/60 space-y-1">
                              <span className="text-[8px] font-mono text-emerald-400 uppercase block font-bold">Pontos Fortes</span>
                              <p className="text-slate-400 leading-normal">{profile.strength}</p>
                            </div>
                            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-850/60 space-y-1">
                              <span className="text-[8px] font-mono text-orange-400 uppercase block font-bold">Ajustes Mútuos</span>
                              <p className="text-slate-400 leading-normal">{profile.weakness}</p>
                            </div>
                          </div>

                          <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex justify-between items-center text-[10px] font-mono text-slate-350">
                            <span>Sintonia estelar favorável:</span>
                            <span className="font-bold text-indigo-400">{profile.bestDay}</span>
                          </div>

                        </div>

                        {/* Interactive operations inside report */}
                        <div className="space-y-2 pt-2">
                          <button
                            onClick={() => handleToggleRevealLike(profile.id)}
                            className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>{isRevealed ? "Ocultar Dados Pessoais" : "Revelar Dados Completos"}</span>
                          </button>
                          
                          <button
                            onClick={() => handleLikeBack(profile.id, profile.name)}
                            disabled={hasLiked}
                            className={`w-full py-2.5 rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                              hasLiked 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                : 'bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-500/10'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-emerald-450 text-emerald-400' : 'fill-white'}`} />
                            <span>{hasLiked ? "Match Ativo na Rede!" : "Curtir de Volta e Desbloquear chat"}</span>
                          </button>
                        </div>

                      </div>
                    );
                  })() : (
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-805 text-center text-slate-500 space-y-2">
                      <Heart className="w-8 h-8 text-slate-800 mx-auto animate-pulse" />
                      <p className="text-xs font-mono">Selecione algum perfil ao lado para visualizar o relatório astral completo de Sinastria do interesse recebido.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {false && (
          <motion.div
            key="visitantes-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Introductory panel with requested labels */}
            <div id="visitas-intro-card" className="bg-slate-900/40 p-6 rounded-3xl border border-slate-805 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-4">
                <div>
                  <h4 className="text-[10px] font-bold font-mono text-cyan-400 uppercase tracking-widest">
                    Veja as pessoas que visualizaram o seu perfil.
                  </h4>
                  <h2 className="text-base font-bold text-white mt-1 uppercase font-mono">
                    VISITAS RECENTES
                  </h2>
                </div>
                
                <div className="px-3.5 py-2 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-2xl">
                  <span className="text-xs font-mono font-bold text-cyan-400 block sm:inline">
                     Seu perfil já foi visualizado 6 vezes.
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-350 leading-relaxed max-w-3xl">
                Veja quem visitou seu perfil e saiba quem são as pessoas que se interessaram por você! Sintonize suas posições planetárias rítmicas e descubra o magnetismo que uniu esses acessos.
              </p>
            </div>

            {/* Visitors Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Side: 6 Visitors cards */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10.5px] font-mono text-slate-400 uppercase font-semibold">Visualizações Recentes ({VISITORS.length})</span>
                  <span className="text-[9px] font-mono text-slate-600">Explore o horário e intenção astrológica</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {VISITORS.map((visitor) => {
                    const isSelected = selectedVisitorId === visitor.id;
                    return (
                      <div
                        key={visitor.id}
                        id={`visitor-card-${visitor.id}`}
                        onClick={() => setSelectedVisitorId(visitor.id)}
                        className={`p-4 rounded-2xl transition-all duration-300 flex items-center justify-between gap-4 flex-wrap cursor-pointer border ${
                          isSelected 
                            ? 'bg-slate-900 border-cyan-500/55 shadow-md shadow-cyan-500/5' 
                            : 'bg-slate-900/50 border-slate-850 hover:bg-slate-900/80 hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          {/* Visitor Avatar representation */}
                          <div className={`w-11 h-11 rounded-full bg-gradient-to-tr ${visitor.avatarColor} text-slate-950 flex shadow-inner items-center justify-center font-bold relative shrink-0`}>
                            <span className="text-sm font-sans tracking-tighter">
                              {visitor.name.split(' ').map(n => n[0]).join('')}
                            </span>
                            <div className="absolute -bottom-1.5 -right-1 bg-slate-950 text-cyan-400 font-mono text-[9px] w-5 h-5 rounded-full border border-slate-850 flex items-center justify-center" title="Signo">
                              {visitor.symbol}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-xs font-bold text-slate-200">
                                {visitor.name}
                              </h4>
                              <span className="text-[10px] text-slate-450">({visitor.age} anos)</span>
                              <span className={`w-1.5 h-1.5 rounded-full ${visitor.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} title={visitor.status} />
                            </div>

                            <p className="text-[10px] font-mono text-slate-505 truncate mt-0.5">
                              {visitor.sign} • {visitor.location}
                            </p>
                          </div>
                        </div>

                        {/* Right side metrics */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block">{visitor.time}</span>
                            <span className="text-xs font-bold font-mono text-cyan-400">{visitor.match}% Afinidade</span>
                          </div>
                          
                          <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/10">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Side: Detailed Visitor Analysis */}
              <div className="lg:col-span-5">
                <div className="sticky top-20">
                  {selectedVisitorId ? (() => {
                    const visitor = VISITORS.find(v => v.id === selectedVisitorId)!;
                    return (
                      <div id="visitas-detalhe-panel" className="bg-slate-900 border border-slate-805 rounded-3xl p-5 space-y-4 shadow-xl text-left">
                        
                        <div className="text-center pb-4 border-b border-slate-850 space-y-2">
                          <div className={`w-16 h-16 rounded-full bg-gradient-to-tr ${visitor.avatarColor} text-slate-950 flex items-center justify-center font-bold text-lg mx-auto shadow-lg relative`}>
                            <span>{visitor.name.split(' ').map(n => n[0]).join('')}</span>
                            <span className="absolute -bottom-1 -right-1 bg-slate-950 border border-slate-800 text-cyan-400 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                              {visitor.symbol}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center justify-center gap-1.5">
                              <h3 className="text-sm font-bold text-white">{visitor.name}</h3>
                              <span className={`w-2 h-2 rounded-full ${visitor.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                            </div>
                            <p className="text-[10px] font-mono text-slate-450 mt-0.5">
                              {visitor.sign} • {visitor.age} anos • {visitor.location}
                            </p>
                          </div>

                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono text-[10px] rounded-full font-bold">
                            <Sparkles className="w-3.5 h-3.5" />
                            {visitor.match}% Alinhamento Vibracional
                          </div>
                        </div>

                        {/* Astro aura and details */}
                        <div className="space-y-3 pt-1">
                          
                          <div className="space-y-1">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Ressonância Vibracional</span>
                            <p className="text-xs text-indigo-300 font-mono font-semibold bg-indigo-500/5 p-2 rounded-xl border border-indigo-500/10">
                              ⚡ {visitor.astroAura}
                            </p>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Objetivo da Visita Sideral</span>
                            <p className="text-xs text-slate-350 leading-relaxed">
                              {visitor.purpose}
                            </p>
                          </div>

                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-850/60 flex justify-between items-center text-[10px] font-mono text-slate-400">
                            <span>Último acesso ao seu sinal:</span>
                            <span className="text-cyan-400 font-bold">{visitor.time}</span>
                          </div>

                        </div>

                        {/* Interactive operations inside report */}
                        <div className="space-y-2 pt-2">
                          <button
                            id={`btn-sinal-cosmico-${visitor.id}`}
                            onClick={() => {
                              setNotifiedVisitors(prev => ({ ...prev, [visitor.id]: true }));
                            }}
                            disabled={notifiedVisitors[visitor.id]}
                            className={`w-full py-2.5 rounded-xl font-bold font-sans text-xs uppercase tracking-wider transition duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                              notifiedVisitors[visitor.id] 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/10'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>{notifiedVisitors[visitor.id] ? "Sinal Cósmico Enviado!" : "Enviar Sinal Cósmico de Sintonia"}</span>
                          </button>
                        </div>

                      </div>
                    );
                  })() : (
                    <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-805 text-center text-slate-400 space-y-2">
                      <Eye className="w-8 h-8 text-slate-800 mx-auto animate-pulse" />
                      <p className="text-xs font-mono">Selecione algum visitante recente da lista para expandir seus relatórios de acesso planetário e intenção astrológica.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {activeSubTab === 'busca' && (
          <motion.div
            key="busca-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 text-left"
          >
            {/* Introductory statement / requested text */}
            <div id="encontrar-intro-card" className="bg-slate-900/40 p-6 rounded-3xl border border-slate-805 space-y-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-850 pb-3">
                <div>
                  <h4 className="text-[10px] font-bold font-mono text-amber-500 uppercase tracking-widest">
                    Procure por amigos ou pessoas com o perfil astrológico desejado.
                  </h4>
                  <h2 className="text-base font-bold text-white mt-1 uppercase font-mono tracking-tight">
                    Encontrar Pessoas
                  </h2>
                </div>
                
                <span className="px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-bold rounded-full">
                  Pessoas
                </span>
              </div>
              <p className="text-xs text-slate-405 leading-relaxed">
                Utilize o filtro de busca avançada para cruzar posições de Sol, Ascendente, Lua, Vênus e mais. Encontre afinidades naturais ou posições astronômicas específicas perfeitas para suas sinastrias.
              </p>
            </div>

            {/* Filter controls and Results lists */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Filter Form parameters */}
              <div className="lg:col-span-4 bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-amber-500" />
                    Parâmetros de Busca
                  </h3>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setOnlyWithPhoto(false);
                      setFilterSol('Qualquer');
                      setFilterAsc('Qualquer');
                      setFilterLua('Qualquer');
                      setFilterMarte('Qualquer');
                      setFilterVenus('Qualquer');
                      setFilterMercurio('Qualquer');
                      setFilterJupiter('Qualquer');
                      setFilterSaturno('Qualquer');
                    }}
                    className="text-[9px] font-mono text-slate-500 hover:text-amber-400 underline cursor-pointer"
                  >
                    Resetar Filtros
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="block text-[9.5px] font-mono text-slate-400 uppercase">Escreva o nome</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Pesquise por nome..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-200 focus:outline-none focus:border-amber-500/55"
                      />
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>

                  {/* Photo toggle checkbox */}
                  <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-950 rounded-xl border border-slate-850/60">
                    <input
                      type="checkbox"
                      id="only-with-photo-checkbox"
                      checked={onlyWithPhoto}
                      onChange={(e) => setOnlyWithPhoto(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="only-with-photo-checkbox" className="text-xs text-slate-350 font-medium select-none cursor-pointer">
                      Apenas perfis com foto
                    </label>
                  </div>

                  {/* Advanced settings toggle button */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 text-xs font-mono font-bold text-slate-350 rounded-xl transition cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                        + busca avançada
                      </span>
                      <span className="text-[10px] text-slate-500">{showAdvanced ? "Ocultar" : "Mostrar"}</span>
                    </button>
                  </div>

                  {/* Advanced multi dropdown selectors */}
                  {showAdvanced && (
                    <div className="grid grid-cols-2 gap-3 pt-2 text-[10px]">
                      {/* Sol */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Sol:</label>
                        <select
                          value={filterSol}
                          onChange={(e) => setFilterSol(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 focus:outline-none focus:border-amber-500/50 text-[10px]"
                        >
                          {['Qualquer', 'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Ascendente */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Ascendente:</label>
                        <select
                          value={filterAsc}
                          onChange={(e) => setFilterAsc(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 focus:outline-none focus:border-amber-500/50 text-[10px]"
                        >
                          {['Qualquer', 'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Lua */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Lua:</label>
                        <select
                          value={filterLua}
                          onChange={(e) => setFilterLua(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 focus:outline-none focus:border-amber-500/50 text-[10px]"
                        >
                          {['Qualquer', 'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Marte */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Marte:</label>
                        <select
                          value={filterMarte}
                          onChange={(e) => setFilterMarte(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 focus:outline-none focus:border-amber-500/50 text-[10px]"
                        >
                          {['Qualquer', 'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Vênus */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Vênus:</label>
                        <select
                          value={filterVenus}
                          onChange={(e) => setFilterVenus(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 focus:outline-none focus:border-amber-500/50 text-[10px]"
                        >
                          {['Qualquer', 'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Mercúrio */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Mercúrio:</label>
                        <select
                          value={filterMercurio}
                          onChange={(e) => setFilterMercurio(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 focus:outline-none focus:border-amber-500/50 text-[10px]"
                        >
                          {['Qualquer', 'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Júpiter */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Júpiter:</label>
                        <select
                          value={filterJupiter}
                          onChange={(e) => setFilterJupiter(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 focus:outline-none focus:border-amber-500/55 text-[10px]"
                        >
                          {['Qualquer', 'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      {/* Saturno */}
                      <div className="space-y-1">
                        <label className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Saturno:</label>
                        <select
                          value={filterSaturno}
                          onChange={(e) => setFilterSaturno(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-300 focus:outline-none focus:border-amber-500/55 text-[10px]"
                        >
                          {['Qualquer', 'Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                    </div>
                  )}

                </div>

              </div>

              {/* Right Column: Search results showing 11 requested profiles exactly */}
              <div className="lg:col-span-8 space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10.5px] font-mono text-slate-400 uppercase font-semibold">Pessoas Encontradas ({filteredPeople.length})</span>
                  <span className="text-[9px] font-mono text-slate-600">Mostrando perfis cadastrados no alinhamento</span>
                </div>

                {filteredPeople.length === 0 ? (
                  <div className="p-12 text-center bg-slate-900/50 border border-slate-850 rounded-3xl text-slate-500 font-mono text-xs">
                    Nenhuma pessoa de sintonia encontrada com esses filtros. Tente reduzir ou ajustar as regras de busca.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredPeople.map((person) => {
                      const isSelected = selectedFpId === person.id;
                      return (
                        <div
                          key={person.id}
                          id={`fp-card-${person.id}`}
                          onClick={() => setSelectedFpId(person.id)}
                          className={`p-4 rounded-2xl transition-all duration-300 border text-left flex flex-col justify-between gap-3 cursor-pointer ${
                            isSelected 
                              ? 'bg-slate-900 border-amber-500/55 shadow-md shadow-amber-500/5' 
                              : 'bg-slate-900/50 border-slate-850 hover:bg-slate-900/80 hover:border-slate-800'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Avatar representation explicitly stating "Avatar de ..." as required by user list */}
                            <div className="relative shrink-0">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${person.avatarColor} text-slate-950 flex shadow-inner items-center justify-center font-extrabold uppercase`} title={`Avatar de ${person.name}`}>
                                <span className="text-xs font-sans">
                                  {person.name.split(' ').filter(n => n.length > 2).slice(0, 2).map(n => n[0]).join('') || '?'}
                                </span>
                              </div>
                              <span className="absolute -bottom-1 -right-1 bg-slate-950 border border-slate-800 text-[9px] text-amber-550 px-1 rounded-full font-mono">
                                ☼
                              </span>
                            </div>

                            <div className="min-w-0 space-y-0.5">
                              <h4 className="text-xs font-bold text-slate-200 leading-snug tracking-tight">
                                {person.name}
                              </h4>
                              
                              <p className="text-[10px] text-slate-450 font-mono">
                                {person.chart.sol} • {person.location}
                              </p>

                              {/* REQUIRED LABEL: online/offline status explicitly shown! */}
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-650" />
                                <span className="text-[9px] font-mono font-semibold text-slate-500 uppercase tracking-wider">
                                  {person.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Astrological placements tags summary inside the card */}
                          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-850 text-[9.5px] font-mono text-slate-450">
                            <div>
                              <span className="text-[8px] text-slate-600 block uppercase">Sol</span>
                              <span className="text-amber-300 font-semibold">{person.chart.sol}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-600 block uppercase">Asc</span>
                              <span className="text-indigo-300 font-semibold">{person.chart.ascendente}</span>
                            </div>
                            <div>
                              <span className="text-[8px] text-slate-600 block uppercase font-mono">Lua</span>
                              <span className="text-teal-300 font-semibold">{person.chart.lua}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-1.5">
                            <span className="text-[9px] font-mono text-amber-500/90 font-bold bg-amber-500/5 px-2 py-0.5 border border-amber-500/10 rounded-lg">
                              {person.match}% Match
                            </span>
                            <span className="text-[9.5px] font-mono text-slate-550 hover:text-amber-500 flex items-center gap-1">
                              Análise completa <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* TAB SUB-VIEW: CRUZAMENTO ASTROLÓGICO (Geral Fast match) */}
      {activeSubTab === 'geral' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Comparison Form Input */}
          <div className="lg:col-span-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4 text-left self-start">
            <h3 className="text-sm font-semibold text-slate-200">Comparar Mapas</h3>
            <form onSubmit={handleEvaluate} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">NOME DO MAPA 1 (PRINCIPAL)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lucas"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-250 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">NOME DO MAPA 2 (PARCEIRO/A)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marina"
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-250 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">DATA DE NASCIMENTO (OPCIONAL)</label>
                <input
                  type="date"
                  value={partnerDate}
                  onChange={(e) => setPartnerDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-405 focus:outline-hidden font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={isEvaluating}
                className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-slate-100 font-sans font-bold text-xs uppercase transition duration-300 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isEvaluating ? 'Calculando Alinhamento...' : 'Efetuar Cruzamento de Mapas'}</span>
              </button>
            </form>
          </div>

          {/* Compatibility Results Area */}
          <div className="lg:col-span-8 bg-slate-900/20 p-6 rounded-3xl border border-slate-800/80 space-y-6">
            
            {/* INFORMATIVE EXPLANATION BANNER */}
            <div className="bg-slate-900/60 p-5 border border-pink-500/10 rounded-3xl text-[11px] leading-relaxed text-slate-350 font-sans flex items-start gap-3 text-left">
              <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5 animate-pulse" />
              <span>
                O recurso de <strong>Compatibilidade Astral (Sinastria)</strong> do Astrolink pode ser utilizado com perfis que constam em sua lista de amigos, com outros usuários do site ou com algum mapa astral cadastrado por você na área de mapas extras.
              </span>
            </div>

            {/* CATEGORIES FILTERS SEGMENT */}
            <div id="sinastria-category-filters" className="bg-slate-900/40 p-1.5 rounded-2xl border border-slate-800/80 flex flex-wrap gap-1.5">
              <button
                type="button"
                id="btn-cat-love"
                onClick={() => setRelationCategory('love')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  relationCategory === 'love'
                    ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-slate-100 shadow-md shadow-pink-500/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Heart className="w-4 h-4 shrink-0" />
                <span>Amor</span>
              </button>
              <button
                type="button"
                id="btn-cat-friend"
                onClick={() => setRelationCategory('friend')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  relationCategory === 'friend'
                    ? 'bg-gradient-to-r from-amber-600 to-indigo-600 text-slate-100 shadow-md shadow-indigo-500/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Amizade</span>
              </button>
              <button
                type="button"
                id="btn-cat-business"
                onClick={() => setRelationCategory('business')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  relationCategory === 'business'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-slate-100 shadow-md shadow-cyan-500/5'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-4 h-4 shrink-0" />
                <span>Profissional</span>
              </button>
            </div>

            {result ? (() => {
              const isLucasMarina = subjectName.toLowerCase().trim() === 'lucas' && result.partnerName.toLowerCase().trim() === 'marina';
              
              // Recalculate dynamic harmony percentage depending on selected category:
              let overallHarmonyPercentage = 76;
              if (isLucasMarina) {
                if (relationCategory === 'love') {
                  overallHarmonyPercentage = 84;
                } else if (relationCategory === 'friend') {
                  overallHarmonyPercentage = 76;
                } else {
                  overallHarmonyPercentage = 68;
                }
              } else {
                if (relationCategory === 'love') {
                  overallHarmonyPercentage = result.lovePercent;
                } else if (relationCategory === 'friend') {
                  overallHarmonyPercentage = result.friendshipPercent;
                } else {
                  overallHarmonyPercentage = result.businessPercent;
                }
              }

              const rawScorePoints = overallHarmonyPercentage * 10;
              
              let harmonyTitleText = "Sintonia Harmoniosa!";
              let harmonyDescText = "";

              if (relationCategory === 'love') {
                harmonyTitleText = overallHarmonyPercentage >= 80 ? "Harmonia de Chamas Gêmeas Ativa!" : "Química Romântica Construtiva";
                harmonyDescText = `Seus posicionamentos astrológicos de Vênus e Sol indicam ${overallHarmonyPercentage}% de afinidade romântica e conexão espiritual terna, perfeita para um convívio caloroso de amor verdadeiro.`;
              } else if (relationCategory === 'friend') {
                harmonyTitleText = overallHarmonyPercentage >= 75 ? "Lealdade Fraterna e Amizade Sólida!" : "Parceria Amigável e Descontraída";
                harmonyDescText = `Sua conexão de Amizade possui afinidade de ${overallHarmonyPercentage}%, sintonizada principalmente pelos posicionamentos de Júpiter e Urano que trazem risadas estimulantes, lealdade e suporte contínuo.`;
              } else {
                harmonyTitleText = overallHarmonyPercentage >= 80 ? "Sociedade Próspera e Sinergia Executiva!" : "Cooperação Profissional Sincronizada";
                harmonyDescText = `Trânsitos de Saturno e Mercúrio indicam ${overallHarmonyPercentage}% de confluência material técnica, perfeita para empreendimentos com excelente produtividade e alinhamento prático de metas.`;
              }

              return (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Pair Name Header and Circle score */}
                  <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-rose-950/20 p-6 rounded-3xl border border-slate-800 text-center space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/[0.02] rounded-full blur-2xl pointer-events-none" />
                    
                    <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest block font-bold">
                      Compatibilidade Astral
                    </span>
                    
                    <div className="flex items-center justify-center gap-4 py-2 border-y border-slate-850/60 max-w-sm mx-auto">
                      <span className="text-sm font-bold font-mono text-slate-100 tracking-wide uppercase">{subjectName}</span>
                      <span className="text-sm font-semibold text-rose-500">I</span>
                      <span className="text-sm font-bold font-mono text-slate-100 tracking-wide uppercase">{result.partnerName}</span>
                    </div>

                    <div className="flex flex-col items-center justify-center gap-2 pt-2">
                      <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="64"
                            cy="64"
                            r="54"
                            stroke="rgba(30, 41, 59, 1)"
                            strokeWidth="6"
                            fill="transparent"
                          />
                          <circle
                            cx="64"
                            cy="64"
                            r="54"
                            stroke="url(#roseGradientGeral)"
                            strokeWidth="6"
                            strokeDasharray={2 * Math.PI * 54}
                            strokeDashoffset={2 * Math.PI * 54 * (1 - (overallHarmonyPercentage / 100))}
                            strokeLinecap="round"
                            fill="transparent"
                          />
                          <defs>
                            <linearGradient id="roseGradientGeral" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f43f5e" />
                              <stop offset="100%" stopColor="#818cf8" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center">
                          <span className="text-2xl font-black font-mono text-slate-100 tracking-tighter">{rawScorePoints}</span>
                          <span className="text-[9px] font-mono text-slate-450 uppercase font-bold tracking-widest">Pontos</span>
                          <span className="text-[9px] font-mono text-rose-450 font-bold leading-none mt-0.5">{overallHarmonyPercentage}% Harmonia</span>
                        </div>
                      </div>

                      <div className="space-y-1 max-w-md mx-auto pt-2">
                        <h4 className="text-sm font-bold text-rose-400 tracking-wide font-sans">
                          {harmonyTitleText}
                        </h4>
                        <p className="text-xs text-slate-350 leading-relaxed font-sans">
                          {harmonyDescText}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ASPECTOS PLANETÁRIOS COMPONENT */}
                  <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4 text-left">
                    <div className="space-y-1.5 pb-3 border-b border-slate-850">
                      <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest">Aspectos planetários</h3>
                      <p className="text-[11px] text-slate-405 leading-relaxed font-sans">
                        Abaixo encontram-se os aspectos mais importantes encontrados na sinastria. É claro que todos nós gostaríamos de encontrar apenas trígonos e conjunções auspiciosas, mas os desafios são os temperos que promovem a nossa evolução rítmica.
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold font-mono text-[10px] rounded-full">
                          {isLucasMarina ? "23 Aspectos Existentes" : `${Math.round(overallHarmonyPercentage / 4 + 6)} Aspectos Existentes`}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      {[
                        {
                          title: "Harmonia de sobra",
                          aspect: "Sol em Trígono com Júpiter",
                          desc: "Sua sintonia indica facilidade extraordinária de crescimento mútuo e suporte incondicional. Um aspecto abençoado de sorte que expande ambições espirituais, trazendo alegria e otimismo constante no cotidiano à dois.",
                          type: "Harmônico",
                          badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        },
                        {
                          title: "Compreensão refletida",
                          aspect: "Mercúrio em Conjunção com Mercúrio",
                          desc: "A comunicação flui de maneira extremamente intuitiva, quase sabendo o que o parceiro vai falar antes mesmo de expressar verbalmente. Vocês compartilham os mesmos comprimentos de onda mental.",
                          type: "Fluido",
                          badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                        },
                        {
                          title: "Sentimentos confortáveis",
                          aspect: "Lua em Sextil com Vênus",
                          desc: "Há uma acolhida emocional carinhosa que traz sensação imediata de aconchego doméstico e doçura. Vocês ressoam no cuidado íntimo, sabendo confortar o outro com muita delicadeza.",
                          type: "Harmônico",
                          badgeColor: "bg-pink-500/10 text-pink-400 border-pink-500/20"
                        },
                        {
                          title: "Harmonia e consideração",
                          aspect: "Sol em Sextil com Marte",
                          desc: "Uma fantástica cooperação de iniciativas. Vocês conseguem trabalhar excepcionalmente bem em parceria impulsionando as metas mútuas sem fricções, competições ou desgastes desnecessários.",
                          type: "Fluido",
                          badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        },
                        {
                          title: "Ordem na casa!",
                          aspect: "Saturno em Sextil com Ascendente",
                          desc: "A fidelidade e o realismo sustentam essa conexão de forma madura. Este posicionamento traz a disciplina espiritual necessária para superar qualquer tempestade externa ou social com muita estabilidade.",
                          type: "Estrutural",
                          badgeColor: "bg-amber-500/10 text-amber-550 border-amber-500/20"
                        },
                        {
                          title: "Amizade e cooperação",
                          aspect: "Urano em Trígono com Sol",
                          desc: "Vocês se sentem inteiramente revigorados e livres para ser quem realmente são na presença um do outro. Estimula a curiosidade mútua, com zero possessividade ou ciúme limitador.",
                          type: "Inovador",
                          badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20"
                        },
                      ].map((item, idx) => {
                        const isExpanded = expandedAspectIndex === idx;
                        return (
                          <div key={idx} className="border border-slate-850 bg-slate-900/20 rounded-xl overflow-hidden transition-all duration-300">
                            <button
                              type="button"
                              onClick={() => setExpandedAspectIndex(isExpanded ? null : idx)}
                              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-850/40 transition cursor-pointer"
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-slate-100 font-sans">{item.title}</span>
                                  <span className={`px-2 py-0.2 text-[8px] font-mono border rounded-full font-bold ${item.badgeColor}`}>
                                    {item.type}
                                  </span>
                                </div>
                                <span className="text-[9.5px] font-mono text-indigo-400/85">{item.aspect}</span>
                              </div>
                              <span className="text-slate-500 font-mono text-xs font-bold">
                                {isExpanded ? "−" : "+"}
                              </span>
                            </button>
                            
                            {isExpanded && (
                              <div className="px-4 pb-3 pt-1 text-[11px] text-slate-350 leading-relaxed border-t border-slate-850/50 bg-slate-950/20 font-sans">
                                {item.desc}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => setShowMinorAspects(!showMinorAspects)}
                        className="w-full p-4 bg-slate-950/40 hover:bg-slate-950/80 border border-dashed border-slate-800 hover:border-indigo-500/40 rounded-xl text-center transition-all duration-300 block cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2 px-1">
                          <span className="text-[10.5px] font-mono text-slate-400 font-medium">
                            + {isLucasMarina ? "17" : `${Math.max(2, Math.round(overallHarmonyPercentage / 4))}`} outros aspectos menores computados na sinastria astrológica.
                          </span>
                          <span className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold font-mono tracking-wider flex items-center gap-1 shrink-0 uppercase">
                            {showMinorAspects ? "▲ Ocultar Aspectos" : "▼ Revelar Aspectos"}
                          </span>
                        </div>
                      </button>

                      {showMinorAspects && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2.5 p-4 bg-slate-950/80 border border-slate-850 rounded-2xl mt-1.5 text-left text-[11px] leading-relaxed max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-805"
                        >
                          <div className="flex items-center justify-between border-b border-slate-850/60 pb-2 mb-2">
                            <span className="font-bold text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                              Aspectos Adicionais & Detalhes Clássicos
                            </span>
                            <span className="text-[9px] font-mono text-slate-500">
                              Total de 17 interações secundárias
                            </span>
                          </div>
                          
                          {[
                            {
                              aspect: "Marte em Trígono com Vênus",
                              desc: "Química física e magnetismo natural exuberante. Traz facilidade para expressar atração e desejos sem bloqueios melancólicos, estabelecendo uma forte âncora sensual de harmonia imediata.",
                              harmony: "Forte Magnetismo"
                            },
                            {
                              aspect: "Júpiter em Conjunção com Ascendente",
                              desc: "Sorte e expansão em sincronia. A presença de um impulsiona o outro a vislumbrar horizontes muito mais ambiciosos no cotidiano, agindo como amuleto de boa energia e proteção mútua.",
                              harmony: "Expansão da Sorte"
                            },
                            {
                              aspect: "Mercúrio em Sextil com Vênus",
                              desc: "Conversas que acalmam e inspiram. Existe um carinho verbal nítido, facilitando as declarações românticas e diminuindo mal-entendidos cotidianos com muita sensibilidade e ternura.",
                              harmony: "Afinidade Intelectual"
                            },
                            {
                              aspect: "Plutão em Trígono com Sol",
                              desc: "Conexão transformadora profunda que regenera o ego de ambos. Apoiam-se mutuamente na superação de crises antigas e na conquista de autonomia e poder pessoal realizador.",
                              harmony: "Regeneração de Ego"
                            },
                            {
                              aspect: "Vênus em Trígono com Netuno",
                              desc: "Expressão clássica de romantismo idílico e telepatia emocional. Ambos compartilham uma visão iluminada do amor, idealizando-se positivamente e cultivando carinho espiritual sutil.",
                              harmony: "Conexão Espiritual"
                            },
                            {
                              aspect: "Marte em Trígono com Plutão",
                              desc: "Vontade inabalável de vencer desafios em conjunto. Une a coragem física com a determinação profunda, ideal para construir impérios, vencer oposições externas e manter a persistência.",
                              harmony: "Suporte Vital"
                            },
                            {
                              aspect: "Lua em Conjunção com Júpiter",
                              desc: "Instintos abundantes de generosidade e acolhimento. Há uma alegria contagiante quando compartilham momentos de lar, risos descompromissados ou simples refeições em família.",
                              harmony: "Doçura e Lar"
                            },
                            {
                              aspect: "Sol em Trígono com Meio do Céu",
                              desc: "Alinhamento perfeito com a jornada de vida pública e carreira de cada um. Os caminhos profissionais recebem combustível estelar e validação mútua incondicional.",
                              harmony: "Alinhamento Social"
                            },
                            {
                              aspect: "Urano em Sextil com Vênus",
                              desc: "Surpresas agradáveis e renovação nos afetos. Este aspecto impede a rotina de sufocar a relação, trazendo espontaneidade duradora e surpresas deliciosas e incomuns à dois.",
                              harmony: "Renovação de Afeto"
                            },
                            {
                              aspect: "Mercúrio em Sextil com Saturno",
                              desc: "Diálogo estruturado com foco em objetivos realistas. Facilita o planejamento de orçamentos, cronogramas de viagens e contratos com clareza cristalina, sem ruídos teatrais.",
                              harmony: "Foco Estrutural"
                            },
                            {
                              aspect: "Lua em Trígono com Marte",
                              desc: "Sensibilidade enérgica. O humor de um estimula a ação ativa do outro imediatamente, eliminando letargia ou desânimo e injetando vitalidade nas dinâmicas corporais diárias.",
                              harmony: "Vitalidade Mútua"
                            },
                            {
                              aspect: "Saturno em Sextil com Mercúrio",
                              desc: "Os conselhos dados são escutados com extremo respeito e maturidade tática. Promove acordos de longo prazo e estabilização de metas intelectuais sólidas.",
                              harmony: "Longo Prazo"
                            },
                            {
                              aspect: "Netuno em Sextil com Plutão",
                              desc: "Sincronização sutil e intuição psíquica de nível transgeracional. Sintoniza os maiores ideais de transformação para apoiar causas de justiça, arte ou espiritualidade de vanguarda.",
                              harmony: "Acordo Invisível"
                            },
                            {
                              aspect: "Quíron em Trígono com Sol",
                              desc: "Cura autêntica de antigas vulnerabilidades da infância ou autoimagem. A simples companhia ativa do parceiro atua como um bálsamo confortador sobre feridas ocultas.",
                              harmony: "Bálsamo de Cura"
                            },
                            {
                              aspect: "Nodo Norte em Conjunção com Vênus",
                              desc: "Conexão kármica de direcionamento de destino. Sentem que deveriam se encontrar nesta jornada terrestre para viver o refinamento mútuo e a expressão autoral do afeto.",
                              harmony: "Sabor de Destino"
                            },
                            {
                              aspect: "Lilith em Trígono com Plutão",
                              desc: "Incrível magnetismo invisível e um fascínio pelas profundezas misteriosas do outro. Desperta uma atração visceral que recusa julgamentos convencionais ou limitações restritivas.",
                              harmony: "Magnetismo Íntimo"
                            },
                            {
                              aspect: "Urano em Sextil com Lua",
                              desc: "Quebra criativa de hábitos repetitivos domésticos. O lar ou o convívio diário nunca caem no marasmo, pois sempre se motivam a reinventar seus cantos e rotinas íntimas com jovialidade.",
                              harmony: "Quebra de Marasmo"
                            }
                          ].map((minor, mIdx) => (
                            <div key={mIdx} className="p-2.5 bg-slate-900/60 rounded-xl border border-slate-850/80 hover:border-slate-800 transition duration-200">
                              <div className="flex justify-between items-center flex-wrap gap-1 mb-1">
                                <span className="font-semibold text-slate-200 font-sans text-[10.5px]">
                                  {minor.aspect}
                                </span>
                                <span className="px-1.5 py-0.2 text-[8px] font-mono rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold uppercase tracking-wide">
                                  {minor.harmony}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-405 leading-normal font-sans">
                                {minor.desc}
                              </p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* COMPARAÇÃO ENERGÉTICA */}
                  <div className="bg-slate-900/40 p-5 rounded-3xl border border-slate-800 space-y-4 text-left">
                    <div className="border-b border-slate-850 pb-3 space-y-1">
                      <h3 className="text-xs font-bold font-mono text-slate-200 uppercase tracking-widest">Comparação Energética</h3>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-medium">
                        Cada pessoa tem um conjunto energético formado a partir dos elementos, qualidades e polaridades que compõem o mapa astral...
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 border-b border-slate-850/40 pb-1.5 uppercase font-bold">
                        <span className="text-slate-300">{subjectName}</span>
                        <span className="text-indigo-400">Elementos</span>
                        <span className="text-slate-300">{result.partnerName}</span>
                      </div>

                      {[
                        {
                          name: "Fogo",
                          lucasPct: 21,
                          marinaPct: 20,
                          color: "from-amber-500 to-orange-500",
                        },
                        {
                          name: "Terra",
                          lucasPct: 24,
                          marinaPct: 23,
                          color: "from-emerald-500 to-green-600",
                        },
                        {
                          name: "Ar",
                          lucasPct: 38,
                          marinaPct: 36,
                          color: "from-cyan-400 to-blue-500",
                        },
                        {
                          name: "Água",
                          lucasPct: 16,
                          marinaPct: 22,
                          color: "from-blue-500 to-indigo-500",
                        }
                      ].map((elem, idx) => {
                        const lucasVal = isLucasMarina ? elem.lucasPct : Math.max(10, Math.round(overallHarmonyPercentage * (elem.lucasPct / 76)));
                        const marinaVal = isLucasMarina ? elem.marinaPct : Math.max(10, Math.round(overallHarmonyPercentage * (elem.marinaPct / 76) * 1.12));
                        return (
                          <div key={idx} className="space-y-1 bg-slate-950/20 p-3 rounded-2xl border border-slate-850/60 transition-all hover:bg-slate-950/45">
                            <div className="flex justify-between items-center text-[10.5px]">
                              <span className="font-mono font-bold text-slate-350">{lucasVal}%</span>
                              <span className="font-bold text-slate-200 tracking-wide font-sans">{elem.name}</span>
                              <span className="font-mono font-bold text-slate-350">{marinaVal}%</span>
                            </div>
                            
                            <div className="flex items-center gap-3 py-1">
                              <div className="w-1/2 h-2 bg-slate-950 rounded-full overflow-hidden flex justify-end">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${lucasVal}%` }}
                                  transition={{ duration: 0.8 }}
                                  className={`h-full bg-gradient-to-l ${elem.color} rounded-full`}
                                />
                              </div>
                              
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-700 shrink-0" />
                              
                              <div className="w-1/2 h-2 bg-slate-950 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${marinaVal}%` }}
                                  transition={{ duration: 0.8 }}
                                  className={`h-full bg-gradient-to-r ${elem.color} rounded-full`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <p className="text-[10.5px] text-slate-450 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-850/50 font-sans">
                      O Fogo representa ação, ímpeto e criatividade. A Terra, substância, solidez e praticidade. O Ar é o aspecto mental, o intelecto e a comunicação. A Água rege as emoções, a sensibilidade e o inconsciente.
                    </p>

                    <div className="pt-2 text-right">
                      <button
                        type="button"
                        onClick={() => setShowElementsDetails(!showElementsDetails)}
                        className="px-3.5 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 transition rounded-xl text-[10px] font-mono text-slate-450 hover:text-slate-200 uppercase tracking-wider font-bold cursor-pointer"
                      >
                        {showElementsDetails ? "▲ Ocultar Elementos" : "▼ mais sobre elementos"}
                      </button>
                    </div>

                    {showElementsDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-slate-950 border border-slate-850/80 rounded-2xl space-y-3 mt-1 text-[11px] leading-relaxed text-slate-350 font-sans"
                      >
                        <h4 className="font-bold text-slate-200 uppercase text-[9.5px] text-indigo-400">Como os Elementos se Relacionam:</h4>
                        <p>
                          🔴 <strong>Fogo + Ar:</strong> Atração intelectual ativa e estímulo mútuo das qualidades criativas. O Ar alimenta o Fogo, que por sua vez energiza as ideias do Ar com ações de forte impacto real.
                        </p>
                        <p>
                          🟢 <strong>Terra + Água:</strong> Nutrição e proteção mútua. A Água torna a Terra fértil e receptiva, enquanto a Terra fornece as bases materiais necessárias para estruturar os sentimentos.
                        </p>
                        <p>
                          🔵 <strong>Ar + Água:</strong> Desafio de comunicação e sentimentos. Pode haver momentos em que debates excessivamente lógicos do Ar colidem com a intuição e sensibilidade da Água.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              );
            })() : (
              <div className="flex flex-col items-center justify-center p-12 text-slate-600">
                <Users className="w-12 h-12 text-slate-800 animate-pulse" />
                <p className="text-xs font-mono mt-4 text-center max-w-sm leading-relaxed">
                  Preencha os dados do parceiro(a) ao lado para calcular um cruzamento computado completo de Vênus, Marte e as 12 Casas em Sinastria.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB SUB-VIEW: DETECTOR DE AFINIDADES (Contato / Rede) */}
      {activeSubTab === 'detector' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* New contact adder form */}
          <div className="lg:col-span-4 bg-slate-900/40 p-6 rounded-3xl border border-slate-800 space-y-4 text-left">
            <h3 className="text-sm font-semibold text-slate-200">Adicionar à Rede</h3>
            <form onSubmit={handleAddContact} className="space-y-3">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">CRIAR NOME DE EXIBIÇÃO</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amanda Ferreira"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-300 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">VÍNCULO PREDOMINANTE</label>
                <select
                  value={newContactType}
                  onChange={(e) => setNewContactType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-450 focus:outline-hidden"
                >
                  <option value="love">Relacionamento Amoroso</option>
                  <option value="friend">Amigo Próximo</option>
                  <option value="business">Negócios e Carreira</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 mb-1">DATA DE NASCIMENTO (OPCIONAL)</label>
                <input
                  type="date"
                  value={newContactDate}
                  onChange={(e) => setNewContactDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-850 text-xs text-slate-450 focus:outline-hidden font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-sans font-bold text-xs uppercase transition duration-300 border border-slate-700 cursor-pointer"
              >
                Salvar Afinidade de Contato
              </button>
            </form>
          </div>

          {/* List of saved contacts under affinity detector */}
          <div className="lg:col-span-8 bg-slate-900/20 p-6 rounded-3xl border border-slate-800/80 space-y-4 text-left">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Contatos Importantes Cadastrados</h3>

            {savedContacts.length === 0 ? (
              <div className="p-12 text-center text-slate-605 font-mono text-xs">
                Nenhuma pessoa de afinidade salva na sua rede premium.
              </div>
            ) : (
              <div className="space-y-4">
                {savedContacts.map((contact) => (
                  <div key={contact.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-850 flex items-center justify-between gap-4 flex-wrap hover:border-slate-800 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-200">{contact.name}</h4>
                        <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-bold font-mono uppercase ${
                          contact.relationType === 'love' ? 'bg-rose-500/10 text-rose-400' :
                          contact.relationType === 'business' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {contact.relationType === 'love' ? 'Relacionamento' : contact.relationType === 'business' ? 'Parceiro' : 'Amigo'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-550 font-mono">Nasceu em: {contact.birthDate.split('-').reverse().join('/')}</p>
                    </div>

                    {/* Small grid of metrics */}
                    <div className="flex items-center gap-4">
                      <div className="flex gap-2 text-center">
                        <div className="px-2 py-1 bg-slate-950 rounded-lg">
                          <span className="text-[8px] text-slate-500 uppercase block leading-none">AMOR</span>
                          <span className="text-[10px] font-bold text-rose-400 font-mono">{contact.love}%</span>
                        </div>
                        <div className="px-2 py-1 bg-slate-950 rounded-lg">
                          <span className="text-[8px] text-slate-500 uppercase block leading-none">AMIZ.</span>
                          <span className="text-[10px] font-bold text-emerald-400 font-mono">{contact.friendship}%</span>
                        </div>
                        <div className="px-2 py-1 bg-slate-950 rounded-lg">
                          <span className="text-[8px] text-slate-500 uppercase block leading-none">TRAB.</span>
                          <span className="text-[10px] font-bold text-amber-500 font-mono">{contact.business}%</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteContact(contact.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
