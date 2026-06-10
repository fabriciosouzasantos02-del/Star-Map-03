import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Moon, 
  Sparkles, 
  Calendar, 
  Clock, 
  RefreshCw, 
  ShieldAlert, 
  TrendingUp, 
  Heart, 
  Coins, 
  Activity, 
  Scissors, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  Eye,
  CheckCircle,
  Clock3,
  MoonStar
} from 'lucide-react';

interface LunarCycleProps {
  userName?: string;
  userSunSign?: string;
}

type TabType = 'HOJE' | 'FUTURO';

export default function LunarCycle({ userName = 'Fabricio', userSunSign = 'Capricórnio' }: LunarCycleProps) {
  const [activeTab, setActiveTab] = useState<TabType>('HOJE');
  
  // Prep dates and form options
  const [dateStr, setDateStr] = useState<string>('2022-01-15');
  const [timeStr, setTimeStr] = useState<string>('09:30');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [activePhaseDetail, setActivePhaseDetail] = useState<string | null>(null);

  // Simple state to simulate recalculation
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [currentMoonSign, setCurrentMoonSign] = useState<string>('Peixes');
  const [moonDegree, setMoonDegree] = useState<number>(11);
  const [moonPhaseName, setMoonPhaseName] = useState<string>('Lua Balsâmica');
  const [phaseDuration, setPhaseDuration] = useState<string>('14/01 a 21/01');

  const handleUpdate = () => {
    setIsUpdating(true);
    setTimeout(() => {
      setIsUpdating(false);
      // Depending on date, simulate some values
      if (dateStr.includes('-01-21') || dateStr.includes('-01-22')) {
        setMoonPhaseName('Lua Nova');
        setCurrentMoonSign('Aquário');
        setMoonDegree(2);
        setPhaseDuration('21/01 a 24/01');
      } else if (dateStr.includes('-01-24') || dateStr.includes('-01-25')) {
        setMoonPhaseName('Lua Crescente');
        setCurrentMoonSign('Áries');
        setMoonDegree(8);
        setPhaseDuration('24/01 a 28/01');
      } else if (dateStr.includes('-01-28') || dateStr.includes('-01-29')) {
        setMoonPhaseName('Lua Quarto Crescente');
        setCurrentMoonSign('Touro');
        setMoonDegree(15);
        setPhaseDuration('28/01 a 01/02');
      } else {
        // Fallback or restart on Peixes Lua Balsâmica
        setMoonPhaseName('Lua Balsâmica');
        setCurrentMoonSign('Peixes');
        setMoonDegree(11);
        setPhaseDuration('14/01 a 21/01');
      }
    }, 600);
  };

  // Get display name
  const displayFirstName = userName ? userName.split(' ')[0] : 'Consultando';

  return (
    <div id="lunar-cycle-system" className="space-y-6 text-left">
      
      {/* Upper Premium and Hook introduction banner */}
      <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-805 space-y-3 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold font-mono text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
              <span className="w-2 h-2 bg-indigo-400 rounded-full animate-ping shrink-0" />
              Sintonização Gravitacional Diária
            </h3>
            <h2 className="text-lg font-black font-sans uppercase tracking-tight text-white">
              Ciclo Lunar Ativo
            </h2>
          </div>
          
          <button 
            onClick={() => setIsPremium(!isPremium)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500/20 to-indigo-500/20 hover:from-amber-500/30 hover:to-indigo-500/30 border border-amber-505/30 hover:border-amber-500/50 rounded-xl text-[10.5px] font-mono text-amber-200 transition flex items-center gap-2 cursor-pointer shadow-md shadow-slate-950/40"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin-pulse" />
            {isPremium ? 'Membro Premium Ativo ✔' : 'Desbloquear Recursos Premium'}
          </button>
        </div>

        <p className="text-xs text-slate-350 leading-relaxed font-sans">
          <strong className="text-indigo-305">{displayFirstName}</strong>, o ritmo da Lua tem um papel importante em nossos ciclos de curta duração, criando uma dinâmica pessoal mensal, semanal, diária ou até mesmo horária. Seja premium para saber tudo sobre as lunações e desbloquear outros recursos exclusivos.
        </p>
      </div>

      {/* Main Grid: Info columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Calculations & Main Phase card */}
        <div className="lg:col-span-7 bg-slate-900/40 p-5 md:p-6 rounded-3xl border border-slate-805 space-y-6">
          
          {/* Tabs selector: HOJE & FUTURO */}
          <div className="flex justify-between items-center border-b border-slate-850 pb-3">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('HOJE')}
                className={`px-4 py-1.5 rounded-xl text-[11px] font-mono tracking-widest font-bold transition cursor-pointer flex items-center gap-1.5 border uppercase ${
                  activeTab === 'HOJE'
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                    : 'bg-slate-950/70 border-slate-900 text-slate-450 hover:text-slate-205'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                HOJE
              </button>
              
              <button
                onClick={() => setActiveTab('FUTURO')}
                className={`px-4 py-1.5 rounded-xl text-[11px] font-mono tracking-widest font-bold transition cursor-pointer flex items-center gap-1.5 border uppercase ${
                  activeTab === 'FUTURO'
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
                    : 'bg-slate-950/70 border-slate-900 text-slate-450 hover:text-slate-205'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                FUTURO
              </button>
            </div>

            <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" />
              Sintonizador Temporal
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'HOJE' ? (
              <motion.div
                key="hoje-tab"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                {/* Date-time update controls as requested */}
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-slate-850 space-y-3">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Configuração de Data e Hora Analisada</span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="flex bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-800 focus-within:border-slate-700 items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-550 shrink-0" />
                        <input 
                          type="date"
                          value={dateStr}
                          onChange={(e) => setDateStr(e.target.value)}
                          className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
                        />
                      </div>
                    </div>

                    <div className="flex bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-800 focus-within:border-slate-700 items-center justify-between font-mono">
                      <div className="flex items-center gap-2">
                        <Clock3 className="w-4 h-4 text-slate-550 shrink-0" />
                        <input 
                          type="time"
                          value={timeStr}
                          onChange={(e) => setTimeStr(e.target.value)}
                          className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
                        />
                      </div>
                      
                      <button 
                        onClick={handleUpdate}
                        disabled={isUpdating}
                        className="p-1 text-indigo-400 hover:text-indigo-200 hover:bg-indigo-500/10 rounded-lg transition disabled:opacity-50 cursor-pointer"
                        title="Atualizar cálculos da lua"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1.5 flex-wrap gap-2.5">
                    <span className="text-[9.5px] font-mono text-amber-500/85">
                      ★ Visualizando de forma precisa: {dateStr === '2022-01-15' ? '15 DE JANEIRO DE 2022' : dateStr.split('-').reverse().join('/')} às {timeStr}
                    </span>
                    
                    <button
                      onClick={handleUpdate}
                      disabled={isUpdating}
                      className="px-3.5 py-1.5 bg-indigo-500/15 border border-indigo-400/25 hover:bg-indigo-500/25 text-[10.5px] font-mono rounded-lg transition text-indigo-305 hover:text-white cursor-pointer flex items-center gap-1.5"
                    >
                      <RefreshCw className={`w-3 h-3 ${isUpdating ? 'animate-spin' : ''}`} />
                      Atualizar
                    </button>
                  </div>
                </div>

                {/* Primary Card: Active moon details */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/10 space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl shadow-inner shrink-0 leading-none">
                        🌘
                      </div>
                      <div className="space-y-0.5">
                        <span className="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-400 rounded">
                          FASE MÍSTICA ATIVA
                        </span>
                        <h3 className="text-base font-black font-sans text-white uppercase mt-1">
                          {moonPhaseName}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">Fração Lunar</span>
                      <span className="text-xs font-mono font-bold text-slate-350">Duração: {phaseDuration}</span>
                    </div>
                  </div>

                  {/* Dynamic description of the phase */}
                  <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950/50 p-3.5 rounded-xl border border-slate-900">
                    {moonPhaseName === 'Lua Balsâmica' ? (
                      "Esta é uma fase que sugere transformação, contemplação e clareza de objetivos. É o finalzinho do ciclo lunar, onde o terreno está sendo preparado para uma nova e fértil lunação."
                    ) : moonPhaseName === 'Lua Nova' ? (
                      "A Lua Nova é o nascimento de um novo ciclo. Período excelente para listar intenções, plantar sementes internas e iniciar projetos originais ousados de alma."
                    ) : moonPhaseName === 'Lua Crescente' ? (
                      "Fase ideal para dar tração inicial. A energia física começa a aumentar, pedindo para arregaçar as mangas e superar desconfianças."
                    ) : (
                      "Momento de testes e superação. Obstáculos tendem a surgir, requisitando resiliência e adaptação inteligente do seu plano original."
                    )}
                  </div>

                  {/* Affinity readout block */}
                  <div className="flex gap-2.5 items-start p-3 bg-slate-950/80 rounded-xl border border-slate-900 text-[11px] text-slate-350 leading-relaxed">
                    <span className="text-indigo-400 text-sm mt-0.5">✨</span>
                    <div>
                      A Lua está aos <strong className="text-indigo-300 font-mono">{moonDegree}º</strong> do signo de <strong className="text-slate-105">{currentMoonSign}</strong>. Esta Lua tem uma boa afinidade com o seu sol em <strong className="text-amber-400">{userSunSign}</strong>!
                    </div>
                  </div>
                </div>

                {/* Grid of 4 influence sectors: Finanças, Relacionamentos, Saúde, Beleza */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                    Influências da {moonPhaseName} no signo de {currentMoonSign}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    
                    {/* Finance Card */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 hover:border-slate-800 transition flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-[11.5px] font-mono font-bold text-slate-205 uppercase">$ Finanças</h5>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          A avaliação introspectiva é chave. Evite investimentos de altíssimo risco e organize seu fluxo de caixa pacientemente.
                        </p>
                      </div>
                    </div>

                    {/* Relationships Card */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 hover:border-slate-800 transition flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-[11.5px] font-mono font-bold text-slate-205 uppercase">♥ Relacionamentos</h5>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          Cultive o silêncio de alma e a retidão divina. Filtre conversas negativas e afaste-se firmemente de fofocas ao seu redor.
                        </p>
                      </div>
                    </div>

                    {/* Health & Wellbeing */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 hover:border-slate-800 transition flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-[11.5px] font-mono font-bold text-slate-205 uppercase">✚ Saúde e Bem-estar</h5>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          Dia de introspecção sagrada. Meditações curativas, descanso noturno prolongado e boa hidratação de rins funcionam bem.
                        </p>
                      </div>
                    </div>

                    {/* Beauty and Self-care */}
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 hover:border-slate-800 transition flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <Scissors className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h5 className="text-[11.5px] font-mono font-bold text-slate-205 uppercase">✦ Beleza e Autocuidado</h5>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          Ideal para hidratação facial caseira profunda, desintoxicação capilar e corte de pontas para retenção máxima de brilho.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </motion.div>
            ) : (
              <motion.div
                key="futuro-tab"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                {/* Future lunation feed as requested */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">CALENDÁRIO DE LUNAÇÕES PRÓXIMAS</span>
                  <h4 className="text-xs font-bold text-slate-300">Próximas fases e sintonizações lunares deste período:</h4>
                </div>

                <div className="space-y-3 text-xs font-sans">
                  
                  {/* Lunation 1 */}
                  <div 
                    onClick={() => { setDateStr('2022-01-21'); handleUpdate(); setActiveTab('HOJE'); }}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-850 hover:border-indigo-500/30 transition flex justify-between items-center cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center font-mono font-bold shrink-0">
                        21
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Janeiro</span>
                        <strong className="text-[11px] text-slate-205 group-hover:text-indigo-400 transition">Lua Nova em Aquário</strong>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-[10px] font-mono text-indigo-305 bg-indigo-950/20 px-2 py-0.5 rounded border border-indigo-505/10">Sementes</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-500 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {/* Lunation 2 */}
                  <div 
                    onClick={() => { setDateStr('2022-01-24'); handleUpdate(); setActiveTab('HOJE'); }}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-850 hover:border-indigo-500/30 transition flex justify-between items-center cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center font-mono font-bold shrink-0">
                        24
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Janeiro</span>
                        <strong className="text-[11px] text-slate-205 group-hover:text-indigo-400 transition">Lua Crescente em Áries</strong>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-955/20 px-2 py-0.5 rounded border border-cyan-500/10 text-[9px]">Impulso</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-500 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {/* Lunation 3 */}
                  <div 
                    onClick={() => { setDateStr('2022-01-28'); handleUpdate(); setActiveTab('HOJE'); }}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-850 hover:border-indigo-500/30 transition flex justify-between items-center cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center font-mono font-bold shrink-0">
                        28
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Janeiro</span>
                        <strong className="text-[11px] text-slate-205 group-hover:text-indigo-400 transition">Lua Quarto Crescente em Touro</strong>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-[10px] font-mono text-amber-500 bg-amber-955/20 px-2 py-0.5 rounded border border-amber-500/10 text-[9px]">Ação</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-500 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {/* Lunation 4 */}
                  <div 
                    onClick={() => { setDateStr('2022-02-01'); handleUpdate(); setActiveTab('HOJE'); }}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-850 hover:border-indigo-500/30 transition flex justify-between items-center cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center font-mono font-bold shrink-0">
                        01
                      </span>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">Fevereiro</span>
                        <strong className="text-[11px] text-slate-205 group-hover:text-indigo-400 transition">Lua Gibosa em Câncer</strong>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-[10px] font-mono text-rose-450 bg-rose-955/20 px-2 py-0.5 rounded border border-rose-500/10 text-[9px]">Gesta</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-500 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Right Side: Orgãos, Recomendações e Mais Info */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Sensitive organs Card */}
          <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-805 space-y-3.5 text-left">
            <div className="pb-1 border-b border-slate-850 flex gap-2 items-center">
              <span className="text-lg">🧘</span>
              <div>
                <h4 className="text-xs font-bold font-mono text-slate-350 uppercase tracking-widest">Órgãos mais sensíveis</h4>
                <p className="text-[9px] text-slate-505">Suscetibilidade corporal conforme a sintonização do momento</p>
              </div>
            </div>

            <div className="space-y-2 text-xs font-sans">
              
              <div className="p-3 bg-slate-955/80 rounded-xl border border-slate-900 flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-400 rounded-full shrink-0" />
                <span className="text-slate-300">Boca, língua e amígdalas</span>
              </div>

              <div className="p-3 bg-slate-955/80 rounded-xl border border-slate-900 flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-400 rounded-full shrink-0" />
                <span className="text-slate-300">Ouvido</span>
              </div>

              <div className="p-3 bg-slate-955/80 rounded-xl border border-slate-900 flex items-center gap-3">
                <span className="w-2 h-2 bg-indigo-400 rounded-full shrink-0" />
                <span className="text-slate-300">Pescoço, garganta, cordas vocais e tireóide</span>
              </div>

            </div>
          </div>

          {/* Recommendations Opportunities vs Desafios as requested */}
          <div className="bg-slate-900/50 p-5 rounded-3xl border border-slate-805 space-y-4 text-left">
            <div className="pb-1 border-b border-slate-850">
              <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-[9px] font-mono text-amber-400 rounded">
                RECOMENDAÇÕES DE ALINHAMENTO
              </span>
              <h4 className="text-xs font-bold font-mono text-slate-105 uppercase tracking-widest mt-1.5">
                Para a Lua Quarto Crescente
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 space-y-1">
                <span className="text-[9px] font-mono font-bold text-emerald-450 uppercase block">✓ Oportunidades</span>
                <p className="text-[10px] text-slate-350 leading-relaxed">
                  Momento ideal para consolidar estratégias, tomar fôlego físico e apresentar resultados concretos rápidos.
                </p>
              </div>

              <div className="p-3 bg-red-500/5 rounded-xl border border-red-500/10 space-y-1">
                <span className="text-[9px] font-mono font-bold text-red-400 uppercase block">✗ Desafios</span>
                <p className="text-[10px] text-slate-350 leading-relaxed">
                  Atenção com a teimosia crônica no ambiente de trabalho ou discussões ríspidas devido a pressões corporativas.
                </p>
              </div>

            </div>

            {/* Maxim quote section */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-850 text-[11px] text-indigo-305 italic relative font-sans leading-relaxed">
              <span className="absolute top-2 right-2.5 text-2xl font-serif text-slate-800 pointer-events-none select-none">“</span>
              Uma boa máxima a ser citada é a de que colhemos o que plantamos e devemos aceitar isso, mesmo que o resultado final não tenha sido o ideal, pois sempre restará o conselho do constante aprendizado.
            </div>

          </div>

          {/* More details about moon phases lists (collapsible) */}
          <div className="bg-slate-900/15 p-5 rounded-3xl border border-slate-805 space-y-3">
            <div className="pb-1 border-b border-slate-800">
              <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                Mais sobre as Fases da Lua
              </h4>
            </div>

            <div className="space-y-2 text-[11px]">
              
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-900 hover:border-slate-800 transition">
                <dt 
                  onClick={() => setActivePhaseDetail(activePhaseDetail === 'nova' ? null : 'nova')}
                  className="font-bold text-slate-300 flex justify-between items-center cursor-pointer select-none"
                >
                  <span>🌑 Lua Nova (A semente do ciclo)</span>
                  <span className="text-xs text-indigo-400">{activePhaseDetail === 'nova' ? '▲' : '▼'}</span>
                </dt>
                {activePhaseDetail === 'nova' && (
                  <dd className="text-slate-450 mt-1.5 leading-relaxed font-sans animate-in fade-in duration-200">
                    O início de tudo. Indicada para dar partida a novos rumos, planejar secretamente no recolhimento sagrado e plantar as bases intelectuais.
                  </dd>
                )}
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-900 hover:border-slate-800 transition">
                <dt 
                  onClick={() => setActivePhaseDetail(activePhaseDetail === 'crescente' ? null : 'crescente')}
                  className="font-bold text-slate-300 flex justify-between items-center cursor-pointer select-none"
                >
                  <span>🌒 Lua Crescente (Vencer o repouso)</span>
                  <span className="text-xs text-indigo-400">{activePhaseDetail === 'crescente' ? '▲' : '▼'}</span>
                </dt>
                {activePhaseDetail === 'crescente' && (
                  <dd className="text-slate-450 mt-1.5 leading-relaxed font-sans animate-in fade-in duration-200">
                    Fase de tomada de iniciativa ativa no plano físico. Pede esforço consciente de ação para vencer a inércia primal.
                  </dd>
                )}
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-900 hover:border-slate-800 transition">
                <dt 
                  onClick={() => setActivePhaseDetail(activePhaseDetail === 'cheia' ? null : 'cheia')}
                  className="font-bold text-slate-300 flex justify-between items-center cursor-pointer select-none"
                >
                  <span>🌕 Lua Cheia (Transbordo & Clímax)</span>
                  <span className="text-xs text-indigo-400">{activePhaseDetail === 'cheia' ? '▲' : '▼'}</span>
                </dt>
                {activePhaseDetail === 'cheia' && (
                  <dd className="text-slate-450 mt-1.5 leading-relaxed font-sans animate-in fade-in duration-200">
                    Momento de emoções à flor da pele, expansão social gigantesca e transbordo das águas sentimentais humanas.
                  </dd>
                )}
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-900 hover:border-slate-800 transition">
                <dt 
                  onClick={() => setActivePhaseDetail(activePhaseDetail === 'minguante' ? null : 'minguante')}
                  className="font-bold text-slate-300 flex justify-between items-center cursor-pointer select-none"
                >
                  <span>🌗 Lua Quarto Minguante (Recolher e depurar)</span>
                  <span className="text-xs text-indigo-400">{activePhaseDetail === 'minguante' ? '▲' : '▼'}</span>
                </dt>
                {activePhaseDetail === 'minguante' && (
                  <dd className="text-slate-450 mt-1.5 leading-relaxed font-sans animate-in fade-in duration-200">
                    Sugerem depuração consciente e recolhimento. Fase recomendada para fechamentos, limpeza profunda física e conclusão de pendências.
                  </dd>
                )}
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
