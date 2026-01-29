import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, BookOpen, Search, Settings,
  Shield, Crown, Coins, Skull, Ghost,
  FlaskConical, Flame, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Logic/Data Imports ---
import WelcomeMessage from '@/components/WelcomeMessage';
import BlackBook from '@/components/BlackBook';
import TitleScreen from '@/components/TitleScreen';
import GameOverScreen from '@/components/GameOverScreen';
import TavernHub from '@/components/TavernHub';
import SettingsMenu from '@/components/SettingsMenu';
import { generateCustomer, calculateOutcome, tagCombination, INGREDIENTS } from '@/lib/gameLogic';
import { initAudioContext, soundEngine } from '@/lib/SoundEngine';

// ==========================================
// 1. INLINE VISUAL COMPONENTS
// ==========================================

const TagBadge = ({ tag }) => {
  const colors = {
    'Toxic': 'bg-green-900/40 text-green-400 border-green-800',
    'Hot': 'bg-orange-900/40 text-orange-400 border-orange-800',
    'Cooling': 'bg-cyan-900/40 text-cyan-400 border-cyan-800',
    'Purifying': 'bg-blue-900/40 text-blue-400 border-blue-800',
    'Heavy': 'bg-slate-700/40 text-slate-300 border-slate-600',
    'Holy': 'bg-yellow-900/40 text-yellow-200 border-yellow-800',
    'Vital': 'bg-red-900/40 text-red-300 border-red-800',
    'Dark': 'bg-purple-900/40 text-purple-300 border-purple-800',
  };
  return (
    <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${colors[tag] || 'bg-slate-800 text-slate-400'}`}>
      {tag}
    </span>
  );
};

// THE PHANTOM CARD (Replaces Tarot Card)
const CustomerCard = ({ customer, observationHint, onMouseEnter, onMouseLeave, revealedTags }) => {
  const Icon = customer.class.icon || Ghost;
  
  // 1. Generate the Avatar Seed based on ID and Class
  const seed = customer.id + customer.class.name;
  // Using 'adventurer' style for that fantasy RPG look
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=transparent`;

  // Keep your existing color logic
  const accentColor =
    customer.class.id === 'noble' ? 'text-yellow-400 border-yellow-500/30' :
      customer.class.id === 'guard' ? 'text-blue-400 border-blue-500/30' :
        customer.class.id === 'cultist' ? 'text-purple-400 border-purple-500/30' :
          customer.class.id === 'merchant' ? 'text-emerald-400 border-emerald-500/30' : 
          customer.class.id === 'bard' ? 'text-pink-400 border-pink-500/30' : 'text-slate-400 border-slate-500/30';

  return (
    <div
      className={`relative h-full bg-slate-950 border-4 border-double rounded-lg p-6 flex flex-col items-center text-center shadow-2xl overflow-hidden group ${accentColor}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* --- THE SHADOW SILHOUETTE (Background Layer) --- */}
      <div className="absolute inset-0 z-0 flex items-end justify-center opacity-40 transition-all duration-700 group-hover:opacity-50 group-hover:scale-105 pointer-events-none">
         <img 
            src={avatarUrl} 
            alt="Customer Shadow"
            className="w-[140%] h-[140%] object-cover object-top mb-[-20%]"
            style={{ 
                // This turns the colorful avatar into a dark mystery figure
                filter: 'grayscale(100%) brightness(0%) drop-shadow(0 -5px 15px rgba(255,255,255,0.1))'
            }}
        />
      </div>

      {/* Gradient Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-0 pointer-events-none" />

      {/* --- CONTENT LAYER (Z-10) --- */}
      <div className="flex-1 flex flex-col justify-between items-center w-full relative z-10 h-full">
        
        {/* Header: Class Icon & Name */}
        <div className="mt-4 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-3 rounded-full bg-slate-900/80 border-2 backdrop-blur-md shadow-lg mb-3 ${accentColor}`}
            >
              <Icon size={32} strokeWidth={2} />
            </motion.div>
            
            <h2 className={`text-4xl font-serif font-bold drop-shadow-md ${accentColor.split(' ')[0]}`}>
                {customer.class.name}
            </h2>
            <p className="text-slate-400 text-sm italic font-serif tracking-wider">
                "{customer.class.description}"
            </p>
        </div>

        {/* The Symptom / Request Box */}
        <div className="w-full bg-slate-950/90 border-l-4 border-amber-700 p-6 rounded shadow-xl backdrop-blur-md mt-auto mb-12">
          <p className="text-amber-100/90 font-serif text-lg leading-relaxed italic">
            "{customer.symptom.text}"
          </p>
        </div>

        {/* Observation Hint (Bottom Overlay) */}
        <AnimatePresence>
          {observationHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 left-0 w-full text-center"
            >
              <span className="text-xs text-amber-500 uppercase tracking-widest bg-black/90 px-4 py-2 rounded-full border border-amber-900/50 shadow-lg">
                👁 Observation: {observationHint}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Revealed Tags (Top Right) */}
      {revealedTags && revealedTags.length > 0 && (
        <div className="absolute top-4 right-4 flex flex-col gap-1 items-end z-20">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-900/80 px-1 rounded">Diagnosis</span>
          {revealedTags.map(t => <TagBadge key={t} tag={t} />)}
        </div>
      )}
    </div>
  );
};
// THE CAULDRON (Refined & Vertical)
const Cauldron = ({ selectedIngredients, onBrew, onClear, whisperQueue }) => {
  // Cap liquid height visually at 85% so it doesn't overflow the rim
  const liquidHeight = Math.min((selectedIngredients.length / 3) * 85, 85);

  const isToxic = selectedIngredients.some(i => i.tags.includes('Toxic'));
  
  // Dynamic Liquid Colors based on toxicity
  const liquidColor = isToxic 
    ? 'bg-gradient-to-t from-red-950 via-red-900 to-red-800' 
    : 'bg-gradient-to-t from-emerald-950 via-emerald-900 to-emerald-800';
    
  const bubbleColor = isToxic ? 'text-red-400' : 'text-emerald-400';

  return (
    <div className="relative h-full flex flex-col items-center justify-end pb-4">
      
      {/* --- HEADER CONTROLS --- */}
      <div className="w-full flex justify-between items-center mb-4 px-4 absolute top-0 left-0 z-20">
        <h3 className="text-amber-500/50 text-xs uppercase tracking-widest flex items-center gap-2">
          <Flame size={14} className="animate-pulse" /> The Vessel
        </h3>
        {selectedIngredients.length > 0 && (
          <button onClick={onClear} className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-slate-800 rounded-full">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* --- THE POT ITSELF --- */}
      {/* Constrained width to look like a pot, not a trough */}
      <div className="relative w-64 h-64 mb-6 z-10">
        
        {/* The Rim (Top Oval) */}
        <div className="absolute top-0 left-0 w-full h-8 bg-slate-800 border-2 border-slate-600 rounded-[100%] z-20 shadow-lg" />
        
        {/* The Bowl Body */}
        <div className="absolute top-4 left-2 right-2 bottom-0 bg-slate-900 border-x-4 border-b-4 border-slate-700 rounded-b-[120px] overflow-hidden shadow-2xl">
          
          {/* LIQUID LAYER */}
          <motion.div
            initial={{ height: '0%' }}
            animate={{ height: `${liquidHeight}%` }}
            className={`absolute bottom-0 w-full transition-all duration-700 opacity-90 ${liquidColor}`}
          >
             {/* Surface Highlight */}
             <div className="absolute top-0 w-full h-4 bg-white/10 blur-md" />
          </motion.div>

          {/* FLOATING INGREDIENTS */}
          <div className="absolute inset-0 flex flex-col-reverse items-center justify-start pb-8 gap-1 z-10 pointer-events-none">
            <AnimatePresence>
              {selectedIngredients.map((ing, i) => (
                <motion.div
                  key={`${ing.name}-${i}`}
                  initial={{ y: -100, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1, rotate: Math.random() * 40 - 20 }}
                  exit={{ y: 50, opacity: 0, scale: 0 }}
                  transition={{ type: "spring", bounce: 0.4 }}
                  className="text-3xl drop-shadow-xl"
                >
                  {ing.icon}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* --- STEAM / WHISPERS --- */}
        <div className="absolute -top-16 left-0 w-full h-32 flex flex-col items-center justify-end pointer-events-none z-0">
          <AnimatePresence>
            {whisperQueue.slice(-1).map((w) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: -40, scale: 1.1 }}
                exit={{ opacity: 0, y: -80, scale: 1.5 }}
                transition={{ duration: 2 }}
                className={`text-sm font-serif italic tracking-widest drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 ${
                  w.type === 'danger' ? 'text-red-300' :
                    w.type === 'success' ? 'text-emerald-200' : 'text-slate-400'
                }`}
              >
                {w.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* --- BREW BUTTON --- */}
      <Button
        onClick={onBrew}
        disabled={selectedIngredients.length < 2}
        className="w-full max-w-xs py-4 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-700 hover:to-amber-600 text-amber-100 font-bold uppercase tracking-[0.2em] rounded border-t border-amber-500/30 shadow-lg disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
      >
        <span className="drop-shadow-md">Brew Potion</span>
      </Button>
    </div>
  );
};

// Helper for colors
const getTagColor = (tag) => {
  switch (tag) {
    case 'Toxic': return 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]';
    case 'Hot': return 'bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.6)]';
    case 'Cooling': return 'bg-cyan-500 shadow-[0_0_5px_rgba(6,182,212,0.6)]';
    case 'Holy': return 'bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.6)]';
    case 'Dark': return 'bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.6)]';
    default: return 'bg-slate-500';
  }
};
const Workbench = ({ selectedIngredients, onIngredientSelect }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 h-full">
      <h3 className="text-slate-500 text-xs uppercase tracking-widest mb-4 flex gap-2 items-center">
        <FlaskConical size={14} /> Ingredient Shelf
      </h3>

      <div className="grid grid-cols-4 gap-3">
        {INGREDIENTS.map((ing) => {
          const count = selectedIngredients.filter(i => i.name === ing.name).length;

          return (
            <button
              key={ing.name}
              onClick={() => onIngredientSelect(ing)}
              className="group relative h-32 bg-slate-950 border border-slate-800 rounded hover:border-slate-600 hover:bg-slate-900 transition-all flex flex-col items-center justify-start pt-3 gap-1"
            >
              {/* Icon */}
              <span className="text-3xl filter saturate-50 group-hover:saturate-100 transition-all mb-1">
                {ing.icon}
              </span>

              {/* Name */}
              <span className="text-[10px] font-bold text-slate-300 uppercase mb-1">
                {ing.name}
              </span>

              {/* --- TEXT BADGES (ACTUAL HINTS) --- */}
              <div className="flex flex-col gap-0.5 w-full px-2">
                {ing.tags.map(tag => (
                  <span
                    key={tag}
                    className={`
                      text-[9px] uppercase font-bold tracking-wider py-0.5 rounded w-full text-center
                      ${tag === 'Toxic' ? 'bg-green-900/60 text-green-400 border border-green-900' : ''}
                      ${tag === 'Hot' ? 'bg-orange-900/60 text-orange-400 border border-orange-900' : ''}
                      ${tag === 'Cooling' ? 'bg-cyan-900/60 text-cyan-400 border border-cyan-900' : ''}
                      ${tag === 'Purifying' ? 'bg-blue-900/60 text-blue-400 border border-blue-900' : ''}
                      ${tag === 'Heavy' ? 'bg-slate-800 text-slate-400 border border-slate-700' : ''}
                      ${tag === 'Holy' ? 'bg-yellow-900/60 text-yellow-200 border border-yellow-900' : ''}
                      ${tag === 'Vital' ? 'bg-red-900/60 text-red-300 border border-red-900' : ''}
                      ${tag === 'Dark' ? 'bg-purple-900/60 text-purple-300 border border-purple-900' : ''}
                      ${tag === 'Calming' ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-900' : ''}
                      ${tag === 'Crystalline' ? 'bg-pink-900/60 text-pink-300 border border-pink-900' : ''}
                    `}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Selection Count Badge */}
              {count > 0 && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-amber-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow z-10">
                  {count}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. MAIN COMPONENT
// ==========================================

const OBSERVATION_MAP = {
  'Purifying': ["Smells of decay...", "Skin is mottled...", "Aura is tainted..."],
  'Hot': ["Radiates cold...", "Shivers uncontrollably...", "Breath is icy..."],
  'Cooling': ["Burning from within...", "Sweat drips constantly...", "Eyes are fevered..."],
  'Holy': ["Cursed aura...", "Darkness clings...", "Unholy presence..."],
  'Heavy': ["Moves slowly...", "Weighted down...", "Gravity pulls..."],
  'Toxic': ["Green tint to skin...", "Veins are dark...", "Poison seeps..."],
  'Vital': ["Looks pale...", "Life force fading...", "Weak pulse..."],
  'Calming': ["Anxious tremors...", "Eyes dart wildly...", "Cannot sit still..."],
  'Crystalline': ["Skin feels rough...", "Joints are stiff...", "Movements rigid..."]
};

// Updated Whisper Text (Less annoying)
const WHISPERS_ADD = ["Dissolving...", "The mixture shifts...", "Absorbing...", "It swirls..."];
const WHISPERS_DANGER = ["UNSTABLE...", "IT TREMBLES...", "CAREFUL...", "TOO VOLATILE..."];
const WHISPERS_SUCCESS = ["Golden...", "Perfect balance...", "It glows...", "Pure..."];
const WHISPERS_FAIL = ["Inert...", "Murky...", "Useless..."];
// --- NEW COMPONENT: Big Cinematic Announcement (Fixed Text Wrap) ---
const CinematicAnnouncement = ({ text, type }) => {
  if (!text) return null;

  // Modular Styles based on event type
  const styles = {
    normal: "border-slate-700 text-slate-200 bg-slate-950/90",
    success: "border-emerald-500 text-emerald-100 bg-emerald-950/90 shadow-[0_0_50px_rgba(16,185,129,0.2)]",
    poison: "border-red-500 text-red-100 bg-red-950/90 shadow-[0_0_50px_rgba(239,68,68,0.2)]",
    explode: "border-orange-500 text-orange-100 bg-orange-950/90 shadow-[0_0_50px_rgba(249,115,22,0.4)]"
  };

  const activeStyle = styles[type] || styles.normal;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ duration: 0.3, ease: "backOut" }}
      className={`
        absolute top-24 left-1/2 -translate-x-1/2 z-50
        px-12 py-6 w-[90%] max-w-3xl text-center
        border-y-2 backdrop-blur-xl rounded-xl
        flex flex-col items-center justify-center
        pointer-events-none select-none shadow-2xl
        ${activeStyle}
      `}
    >
      <h2 className="text-2xl font-serif font-bold tracking-widest uppercase drop-shadow-md leading-relaxed">
        {text}
      </h2>
    </motion.div>
  );
};
const ApothecaryGame = () => {
  // --- Application State ---
  const [gameState, setGameState] = useState('TITLE');
  // eslint-disable-next-line no-unused-vars
  const [audioContext, setAudioContext] = useState(null);

  // --- Settings ---
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [audioVolume, setAudioVolume] = useState(100);
  const [uiScale, setUiScale] = useState(100);
  const [gamma, setGamma] = useState(1.0);

  // --- Game Stats ---
  const [gameStats, setGameStats] = useState({ daysCount: 0, totalGold: 0, customersServed: 0 });

  // --- Core Loop State ---
  const [phase, setPhase] = useState('day');
  const [day, setDay] = useState(1);
  const [customersServed, setCustomersServed] = useState(0);

  // --- Player Resources ---
  const [gold, setGold] = useState(100);
  const [reputation, setReputation] = useState(20);
  const [upgrades, setUpgrades] = useState({ reinforced: false, ventilation: false, merchant: false, mercury: false });

  // --- Apprentice & Knowledge ---
  const [apprentice, setApprentice] = useState({ hired: false, npcId: null, npcName: null, npcClass: null });
  const [consultUsed, setConsultUsed] = useState(false);
  const [revealedCustomerTags, setRevealedCustomerTags] = useState([]);
  const [isBlackBookOpen, setIsBlackBookOpen] = useState(false);
  const [discoveredIngredients, setDiscoveredIngredients] = useState({});
  const [brewHistory, setBrewHistory] = useState([]);

  // --- Current Interaction ---
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [gameMessage, setGameMessage] = useState('');
  const [messageType, setMessageType] = useState('normal');
  const [whisperQueue, setWhisperQueue] = useState([]);
  const [observationHint, setObservationHint] = useState(null);

  // --- Settings Loading ---
  useEffect(() => {
    const savedVol = localStorage.getItem('alchemistAudioVolume');
    if (savedVol !== null) setAudioVolume(parseInt(savedVol));
    const savedScale = localStorage.getItem('alchemistUIScale');
    if (savedScale !== null) setUiScale(parseInt(savedScale));
    const savedGamma = localStorage.getItem('alchemistGamma');
    if (savedGamma !== null) setGamma(parseFloat(savedGamma));
  }, []);

  const handleVolumeChange = (val) => { setAudioVolume(val); localStorage.setItem('alchemistAudioVolume', val); };
  const handleScaleChange = (val) => { setUiScale(val); localStorage.setItem('alchemistUIScale', val); };
  const handleGammaChange = (val) => { setGamma(val); localStorage.setItem('alchemistGamma', val); };
  const vol = audioVolume / 100;

  const handleHardReset = () => {
    localStorage.removeItem('alchemistAudioVolume');
    localStorage.removeItem('alchemistUIScale');
    localStorage.removeItem('alchemistGamma');
    setAudioVolume(100); setUiScale(100); setGamma(1.0); setSettingsOpen(false);
    setDay(1); setGold(100); setReputation(20);
    setUpgrades({ reinforced: false, ventilation: false, merchant: false, mercury: false });
    setApprentice({ hired: false, npcId: null, npcName: null, npcClass: null });
    setDiscoveredIngredients({}); setBrewHistory([]);
    setGameStats({ daysCount: 0, totalGold: 0, customersServed: 0 });
    setWhisperQueue([]); setPhase('day'); setGameState('TITLE');
  };

  // --- Game Loop Triggers ---
  useEffect(() => {
    if (gameState === 'PLAYING') startNewDay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  useEffect(() => {
    if (reputation <= 0 && gameState === 'PLAYING') {
      soundEngine.playFail(vol);
      setTimeout(() => setGameState('GAMEOVER'), 1000);
    }
  }, [reputation, gameState, vol]);

  useEffect(() => {
    if (whisperQueue.length > 0) {
      const timer = setTimeout(() => setWhisperQueue(prev => prev.slice(1)), 3000);
      return () => clearTimeout(timer);
    }
  }, [whisperQueue]);

  const addWhisper = (text, type = 'normal') => {
    setWhisperQueue(prev => [...prev, { id: Date.now() + Math.random(), text, type }]);
  };

  const generateObservations = (customer) => {
    if (!customer) return [];
    const requiredTags = customer.symptom.requiredTags;
    const hints = [];
    requiredTags.forEach(tag => {
      const tagHints = OBSERVATION_MAP[tag];
      if (tagHints) hints.push(tagHints[Math.floor(Math.random() * tagHints.length)]);
    });
    return hints.length > 0 ? [hints[Math.floor(Math.random() * hints.length)]] : ["Nothing unusual observed..."];
  };

  const handleCustomerHover = (customer) => {
    const hints = generateObservations(customer);
    setObservationHint(hints[0]);
  };

  const handleCustomerLeave = () => {
    setObservationHint(null);
  };

  const handleStartGame = () => {
    const ctx = initAudioContext();
    setAudioContext(ctx);
    soundEngine.playSuccess(vol);
    setGameState('PLAYING');
  };

  const handleReturnToTitle = () => {
    soundEngine.playClick(vol);
    setGameState('TITLE');
  };

  const startNewDay = () => {
    setCustomersServed(0);
    setPhase('day');

    // NEW: Set Cinematic Message
    setGameMessage(`Day ${day} Begins`);
    setMessageType('normal');
    setTimeout(() => setGameMessage(''), 3000);

    setCurrentCustomer(generateCustomer());
    setConsultUsed(false);
    setRevealedCustomerTags([]);
    if (day === 1) setSelectedIngredients([]);
    setWhisperQueue([]);
  };

  const handleConsultApprentice = () => {
    if (!apprentice.hired || !currentCustomer || consultUsed) return;
    soundEngine.playSuccess(vol);
    setConsultUsed(true);
    const needed = currentCustomer.symptom.requiredTags;
    const unrevealed = needed.filter(t => !revealedCustomerTags.includes(t));

    if (unrevealed.length > 0) {
      const tagToReveal = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setRevealedCustomerTags(prev => [...prev, tagToReveal]);
      setGameMessage(`${apprentice.npcName} found a clue!`);
      setMessageType('normal');
      setTimeout(() => setGameMessage(''), 2000);
    } else {
      setGameMessage(`${apprentice.npcName} is stumped.`);
      setMessageType('normal');
      setTimeout(() => setGameMessage(''), 2000);
    }
  };

  const handleRest = () => {
    soundEngine.playClick(vol);
    let passiveMessage = "";
    if (apprentice.hired) {
      if (apprentice.npcClass === "Scrounger") {
        const bonusIngredient = INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)];
        setSelectedIngredients([bonusIngredient]);
        passiveMessage = `(${apprentice.npcName} found: ${bonusIngredient.name})`;
      } else if (apprentice.npcClass === "Scholar") {
        // Logic to reveal ingredient would go here
        passiveMessage = `${apprentice.npcName} studied in the library. `;
      }
    }

    setDay(d => d + 1);
    setGameStats(prev => ({ ...prev, daysCount: prev.daysCount + 1 }));
    setPhase('day');
    setCustomersServed(0);
    setCurrentCustomer(generateCustomer());
    setConsultUsed(false);
    setRevealedCustomerTags([]);
    setWhisperQueue([]);

    // NEW: Set Cinematic Message
    setGameMessage(`Day ${day + 1} Begins`);
    setMessageType('normal');
    setTimeout(() => setGameMessage(''), 3000);
  };

  const handleIngredientSelect = (ingredient) => {
    soundEngine.playClick(vol);
    let newIngredients = [];

    if (selectedIngredients.find(i => i.name === ingredient.name)) {
      newIngredients = selectedIngredients.filter(i => i.name !== ingredient.name);
      setSelectedIngredients(newIngredients);
    } else if (selectedIngredients.length < 3) {
      newIngredients = [...selectedIngredients, ingredient];
      setSelectedIngredients(newIngredients);

      if (Math.random() > 0.7) {
        const randomText = WHISPERS_ADD[Math.floor(Math.random() * WHISPERS_ADD.length)];
        addWhisper(randomText);
      }
    } else {
      return;
    }

    if (newIngredients.length >= 2) {
      const outcome = tagCombination(newIngredients);
      if (outcome.isFatal) {
        const dangerText = WHISPERS_DANGER[Math.floor(Math.random() * WHISPERS_DANGER.length)];
        setTimeout(() => addWhisper(dangerText, 'danger'), 300);
      }
    }
  };

  const handleClearSelection = () => {
    soundEngine.playClick(vol);
    setSelectedIngredients([]);
    setGameMessage('Bench Cleared');
    setMessageType('normal');
    setTimeout(() => setGameMessage(''), 1000);
  };

  const handleBrew = () => {
    if (selectedIngredients.length < 2) {
      soundEngine.playFail(vol);
      setGameMessage('Mixture Unstable');
      setMessageType('poison');
      setTimeout(() => setGameMessage(''), 2000);
      return;
    }
    soundEngine.playBubble(vol);

    const outcome = calculateOutcome(selectedIngredients, currentCustomer, upgrades, apprentice.hired ? apprentice : null);

    setGameStats(prev => ({
      ...prev, totalGold: prev.totalGold + outcome.goldReward, customersServed: prev.customersServed + 1
    }));
    setGold(prev => Math.max(0, prev + outcome.goldReward));
    setReputation(prev => Math.max(0, prev + outcome.reputationChange));

    // NEW: Set Cinematic Message using Outcome Narrative
    setGameMessage(outcome.narrative);

    if (outcome.result === 'cured') {
      setMessageType('success');
      setTimeout(() => {
        soundEngine.playSuccess(vol);
        const successText = WHISPERS_SUCCESS[Math.floor(Math.random() * WHISPERS_SUCCESS.length)];
        addWhisper(successText, 'normal');
        if (outcome.goldReward > 0) setTimeout(() => soundEngine.playGold(vol), 400);
      }, 200);
    } else {
      setMessageType(outcome.result === 'exploded' ? 'explode' : 'poison');
      soundEngine.playFail(vol);
      const failText = outcome.result === 'exploded'
        ? WHISPERS_DANGER[Math.floor(Math.random() * WHISPERS_DANGER.length)]
        : WHISPERS_FAIL[Math.floor(Math.random() * WHISPERS_FAIL.length)];
      addWhisper(failText, 'danger');
    }

    const newDiscovered = { ...discoveredIngredients };
    selectedIngredients.forEach(ing => { newDiscovered[ing.name] = true; });
    setDiscoveredIngredients(newDiscovered);

    setBrewHistory(prev => [{
      id: Date.now(), day, customerClass: currentCustomer.class.name,
      symptom: currentCustomer.symptom.text, result: outcome.result,
      goldChange: outcome.goldReward, repChange: outcome.reputationChange
    }, ...prev]);

    const nextCount = customersServed + 1;
    setCustomersServed(nextCount);

    setTimeout(() => {
      // Clear message
      setGameMessage('');

      if (reputation > 0) {
        if (nextCount >= 5) {
          setPhase('night');
        } else {
          setCurrentCustomer(generateCustomer());
          setConsultUsed(false);
          setRevealedCustomerTags([]);
          setSelectedIngredients([]);
        }
      }
    }, 4000);
  };

  // --- RENDER ---

  if (gameState === 'TITLE') {
    return (
      <div style={{ transform: `scale(${uiScale / 100})`, filter: `brightness(${gamma})`, height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <TitleScreen onStart={handleStartGame} onOpenSettings={() => { soundEngine.playClick(vol); setSettingsOpen(true); }} />
        <SettingsMenu
          isOpen={settingsOpen} onClose={() => { soundEngine.playClick(vol); setSettingsOpen(false); }} onReset={handleHardReset}
          currentVolume={audioVolume} onVolumeChange={handleVolumeChange}
          currentScale={uiScale} onScaleChange={handleScaleChange}
          currentGamma={gamma} onGammaChange={handleGammaChange}
        />
      </div>
    );
  }

  if (gameState === 'GAMEOVER') {
    return (
      <div style={{ transform: `scale(${uiScale / 100})`, filter: `brightness(${gamma})`, height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <GameOverScreen stats={gameStats} onReturnToTitle={handleReturnToTitle} />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-950 text-amber-500 font-sans selection:bg-amber-900 selection:text-white overflow-hidden'>
      <div className="h-full flex flex-col" style={{ transform: `scale(${uiScale / 100})`, transformOrigin: 'top center', filter: `brightness(${gamma})` }}>

        {/* Navigation */}
        <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8 shrink-0 z-40 relative">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-amber-500"><Coins size={18} /> <span className="text-xl font-bold font-mono">{gold}</span></div>
            <div className="flex items-center gap-2 text-blue-400"><Shield size={18} /> <span className="text-xl font-bold font-mono">{reputation}</span></div>
            <div className="w-px h-6 bg-slate-700 mx-2" />
            <div className="text-slate-500 text-sm font-mono tracking-widest uppercase">Day {day} • {customersServed}/5</div>
          </div>

          <div className="flex gap-2">
            {apprentice.hired && apprentice.activeAbility?.type === 'consult' && (
              <Button onClick={handleConsultApprentice} disabled={consultUsed} size="sm" className={`mr-4 ${consultUsed ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                <Search className="w-4 h-4 mr-2" /> {consultUsed ? 'Consulted' : 'Ask Apprentice'}
              </Button>
            )}
            <Button onMouseEnter={() => soundEngine.playHover(vol)} onClick={() => { soundEngine.playClick(vol); setIsBlackBookOpen(true); }} variant="ghost" className="text-amber-500 hover:text-amber-200">
              <BookOpen size={20} />
            </Button>
            <Button onMouseEnter={() => soundEngine.playHover(vol)} onClick={() => { soundEngine.playClick(vol); setSettingsOpen(true); }} variant="ghost" className="text-amber-500 hover:text-amber-200">
              <Settings size={20} />
            </Button>
          </div>
        </div>

        {/* Modals */}
        <BlackBook isOpen={isBlackBookOpen} onClose={() => { soundEngine.playClick(vol); setIsBlackBookOpen(false); }} discoveredIngredients={discoveredIngredients} brewHistory={brewHistory} />
        <SettingsMenu isOpen={settingsOpen} onClose={() => { soundEngine.playClick(vol); setSettingsOpen(false); }} onReset={handleHardReset} currentVolume={audioVolume} onVolumeChange={handleVolumeChange} currentScale={uiScale} onScaleChange={handleScaleChange} currentGamma={gamma} onGammaChange={handleGammaChange} />

        {/* --- HERE IT IS: THE MISSING COMPONENT --- */}
        <AnimatePresence>
          {gameMessage && <CinematicAnnouncement text={gameMessage} type={messageType} />}
        </AnimatePresence>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode='wait'>
            {phase === 'day' && (
              <motion.div key="day-phase" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full grid grid-cols-12 gap-8 p-8">
                <div className="col-span-4 h-full relative">
                  <AnimatePresence mode='wait'>
                    {currentCustomer && (
                      <motion.div key={currentCustomer.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="h-full">
                        <CustomerCard
                          customer={currentCustomer}
                          observationHint={observationHint}
                          onMouseEnter={() => handleCustomerHover(currentCustomer)}
                          onMouseLeave={handleCustomerLeave}
                          revealedTags={revealedCustomerTags}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="col-span-8 h-full flex flex-col gap-6">
                  {/* OLD PILL DIV WAS REMOVED FROM HERE */}
                  <div className="flex-1">
                    <Cauldron selectedIngredients={selectedIngredients} onBrew={handleBrew} onClear={handleClearSelection} whisperQueue={whisperQueue} />
                  </div>
                  <div className="h-auto">
                    <Workbench selectedIngredients={selectedIngredients} onIngredientSelect={handleIngredientSelect} />
                  </div>
                </div>
              </motion.div>
            )}

            {phase === 'night' && (
              <motion.div key="night" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                <TavernHub gold={gold} setGold={setGold} upgrades={upgrades} setUpgrades={setUpgrades} apprentice={apprentice} setApprentice={setApprentice} day={day} onRest={handleRest} volume={vol} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
export default ApothecaryGame;