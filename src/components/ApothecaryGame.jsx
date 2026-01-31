import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, BookOpen, Search, Settings,
  Shield, Crown, Coins, Skull, Ghost,
  FlaskConical, Flame, Trash2, Loader, Map as MapIcon, X, Siren
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import CityMap from '@/components/CityMap'; // Ensure this path is correct
// --- Logic/Data Imports ---
import WelcomeMessage from '@/components/WelcomeMessage';
import BlackBook from '@/components/BlackBook';
import TitleScreen from '@/components/TitleScreen';
import GameOverScreen from '@/components/GameOverScreen';
import TavernHub from '@/components/TavernHub';
import SettingsMenu from '@/components/SettingsMenu';
import { generateCustomer, calculateOutcome, tagCombination, INGREDIENTS } from '@/lib/gameLogic';
import { initAudioContext, soundEngine } from '@/lib/SoundEngine';
import alcBg from '../assets/alc_bg.jpg';

// ==========================================
// 1. INLINE VISUAL COMPONENTS (FIXED)
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

// Helper for dot colors
const getTagColor = (tag) => {
  switch (tag) {
    case 'Toxic': return 'bg-green-500';
    case 'Hot': return 'bg-orange-500';
    case 'Cooling': return 'bg-cyan-500';
    case 'Holy': return 'bg-yellow-400';
    case 'Dark': return 'bg-purple-500';
    case 'Vital': return 'bg-red-500';
    case 'Purifying': return 'bg-blue-500';
    default: return 'bg-slate-400';
  }
};

const CustomerCard = ({ customer, observationHint, onMouseEnter, onMouseLeave, revealedTags }) => {
  const Icon = customer.class.icon || Ghost;
  const seed = customer.id + customer.class.name;
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=transparent`;

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
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <img 
            src={avatarUrl} 
            alt="Customer Shadow"
            className="absolute -right-16 -bottom-10 w-[90%] h-[90%] object-contain opacity-30 transition-all duration-700 group-hover:opacity-40 group-hover:scale-105 group-hover:-translate-x-2"
            style={{ filter: 'grayscale(100%) brightness(0%) drop-shadow(0 -5px 15px rgba(255,255,255,0.1))' }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-0 pointer-events-none" />

      <div className="flex-1 flex flex-col justify-between items-center w-full relative z-10 h-full">
        <div className="mt-4 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`p-3 rounded-full bg-slate-900/80 border-2 backdrop-blur-md shadow-lg mb-3 ${accentColor}`}
            >
              <Icon size={32} strokeWidth={2} />
            </motion.div>
            <h2 className={`text-3xl font-serif font-bold drop-shadow-md ${accentColor.split(' ')[0]}`}>
                {customer.class.name}
            </h2>
            <p className="text-slate-400 text-xs italic font-serif tracking-wider">
                "{customer.class.description}"
            </p>
        </div>

        <div className="w-full bg-slate-950/90 border-l-4 border-amber-700 p-4 rounded shadow-xl backdrop-blur-md mt-auto mb-12">
          <p className="text-amber-100/90 font-serif text-md leading-relaxed italic">
            "{customer.symptom.text}"
          </p>
        </div>

        <AnimatePresence>
          {observationHint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 left-0 w-full text-center"
            >
              <span className="text-[10px] text-amber-500 uppercase tracking-widest bg-black/90 px-4 py-2 rounded-full border border-amber-900/50 shadow-lg">
                👁 Observation: {observationHint}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {revealedTags && revealedTags.length > 0 && (
        <div className="absolute top-4 right-4 flex flex-col gap-1 items-end z-20">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest bg-slate-900/80 px-1 rounded">Diagnosis</span>
          {revealedTags.map(t => <TagBadge key={t} tag={t} />)}
        </div>
      )}
    </div>
  );
};

const Cauldron = ({ selectedIngredients, onBrew, onClear, whisperQueue }) => {
  const [isBrewing, setIsBrewing] = useState(false);

  const handleSafeBrew = () => {
    if (isBrewing || selectedIngredients.length < 2) return;
    setIsBrewing(true);
    setTimeout(() => {
      onBrew();
      setIsBrewing(false);
    }, 1500);
  };

  const liquidHeight = Math.min((selectedIngredients.length / 3) * 80, 80);
  const isToxic = selectedIngredients.some(i => i.tags.includes('Toxic'));
  
  const baseColor = isToxic ? 'from-red-950 via-red-900 to-red-800' : 'from-emerald-950 via-emerald-900 to-emerald-800';
  const brewingColor = isToxic ? 'from-red-600 via-orange-500 to-yellow-400' : 'from-emerald-500 via-teal-400 to-cyan-300';

  return (
    <div className="relative h-full flex flex-col items-center justify-end">
      {/* Controls Header */}
      <div className="w-full flex justify-between items-center mb-4 px-4 absolute top-0 left-0 z-30">
        <h3 className="text-amber-500/50 text-xs uppercase tracking-widest flex items-center gap-2">
          <Flame size={14} className={isBrewing ? "animate-bounce text-orange-500" : "animate-pulse"} /> 
          {isBrewing ? "REACTION IN PROGRESS..." : "The Vessel"}
        </h3>
        {selectedIngredients.length > 0 && !isBrewing && (
          <button onClick={onClear} className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-slate-800 rounded-full">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* The Pot Animation Container */}
      <motion.div 
        className="relative w-72 h-64 mb-6 z-10 group"
        animate={isBrewing ? { x: [-2, 2, -2, 2, 0], rotate: [0, -1, 1, 0] } : {}}
        transition={{ duration: 0.2, repeat: Infinity }}
      >
        <div className="absolute top-0 left-0 w-full h-10 bg-slate-800 border-4 border-slate-600 rounded-[100%] z-20 shadow-xl" />
        <div className="absolute top-5 left-2 right-2 bottom-0 bg-slate-900 border-x-4 border-b-4 border-slate-700 rounded-b-[160px] overflow-hidden shadow-2xl">
          <motion.div
            initial={{ height: '0%' }}
            animate={{ height: isBrewing ? '95%' : `${liquidHeight}%` }}
            className={`absolute bottom-0 w-full transition-all duration-700 opacity-90 bg-gradient-to-t ${isBrewing ? brewingColor : baseColor}`}
          >
             {isBrewing && <div className="absolute inset-0 w-full h-full opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />}
             <div className="absolute top-0 w-full h-6 bg-white/10 blur-md transform scale-x-90" />
          </motion.div>
          <div className="absolute inset-0 flex flex-col-reverse items-center justify-start pb-10 gap-2 z-10 pointer-events-none">
            <AnimatePresence>
              {selectedIngredients.map((ing, i) => (
                <motion.div
                  key={`${ing.name}-${i}`}
                  initial={{ y: -100, opacity: 0, scale: 0.5 }}
                  animate={isBrewing ? { y: 50, scale: 0, rotate: 360, opacity: 0 } : { y: 0, opacity: 1, scale: 1, rotate: Math.random() * 60 - 30 }}
                  exit={{ y: 50, opacity: 0, scale: 0 }}
                  transition={isBrewing ? { duration: 1 } : {}}
                  className="text-4xl drop-shadow-2xl filter brightness-110"
                >
                  {ing.icon}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="absolute -top-24 left-0 w-full h-40 flex flex-col items-center justify-end pointer-events-none z-0">
          <AnimatePresence mode='popLayout'>
            {whisperQueue.slice(-2).map((w) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 1.1, filter: 'blur(4px)' }}
                className={`text-xs font-serif italic tracking-widest px-3 py-1 mb-1 ${w.type === 'danger' ? 'text-red-400' : w.type === 'success' ? 'text-emerald-300' : 'text-slate-400'}`}
              >
                {w.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      <button
        onClick={handleSafeBrew}
        disabled={selectedIngredients.length < 2 || isBrewing}
        className={`
            relative z-30 w-full max-w-xs py-5 
            font-black text-lg uppercase tracking-[0.25em] rounded-sm border-2 
            shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all 
            active:translate-y-1 active:shadow-none flex items-center justify-center gap-3
            ${isBrewing 
                ? 'bg-slate-800 border-slate-600 text-slate-400 cursor-wait' 
                : 'bg-gradient-to-b from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 border-amber-900 text-amber-100 disabled:opacity-40 disabled:grayscale'
            }
        `}
      >
        {isBrewing ? <><Loader size={20} className="animate-spin" /><span>Distilling...</span></> : <span className="drop-shadow-md">Ignite & Brew</span>}
      </button>
    </div>
  );
};

// --- FIX: WORKBENCH IS NOW A HORIZONTAL STRIP ---
const Workbench = ({ selectedIngredients, onIngredientSelect }) => {
  return (
    <div className="w-full h-32 relative px-4 flex items-center border-t border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #44403c 1px, transparent 1px)', backgroundSize: '60px 100%' }} />
      
      {/* Horizontal Flex Container */}
      <div className="flex gap-2 overflow-x-auto overflow-y-hidden w-full h-full items-center pb-2 px-2 custom-scrollbar-horizontal">
        {INGREDIENTS.map((ing) => {
          const count = selectedIngredients.filter(i => i.name === ing.name).length;
          const isSelected = count > 0;

          return (
            <motion.button
              key={ing.name}
              onClick={() => onIngredientSelect(ing)}
              whileTap={{ scale: 0.95 }}
              /* shrink-0 ensures they don't get crushed. Fixed width/height */
              className={`
                group relative shrink-0 w-32 h-24 flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200
                ${isSelected ? 'bg-amber-950/60 border-amber-500 shadow-lg' : 'bg-slate-900/50 border-slate-700 hover:bg-slate-800 hover:border-slate-500'}
              `}
            >
              {count > 0 && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center rounded shadow-sm">
                  {count}
                </div>
              )}
              <div className={`text-3xl mb-2 transition-transform ${isSelected ? 'scale-110 text-amber-100' : 'text-slate-400 group-hover:text-slate-200'}`}>
                {ing.icon}
              </div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 group-hover:text-white truncate max-w-full">
                {ing.name}
              </div>
              {/* Dot Tags */}
              <div className="flex gap-1 mt-1.5">
                {ing.tags.map((tag, i) => (
                   <div key={i} className={`w-1.5 h-1.5 rounded-full ${getTagColor(tag)}`} title={tag}/>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// ==========================================
// 2. MAIN LOGIC COMPONENTS
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

const WHISPERS_ADD = ["Dissolving...", "The mixture shifts...", "Absorbing...", "It swirls..."];
const WHISPERS_DANGER = ["UNSTABLE...", "IT TREMBLES...", "CAREFUL...", "TOO VOLATILE..."];
const WHISPERS_SUCCESS = ["Golden...", "Perfect balance...", "It glows...", "Pure..."];
const WHISPERS_FAIL = ["Inert...", "Murky...", "Useless..."];
const CinematicAnnouncement = ({ text, type }) => {
  if (!text) return null;

  const styles = {
    normal: "border-slate-600 bg-slate-950/90 text-slate-200 shadow-slate-900/50",
    success: "border-emerald-500 bg-emerald-950/90 text-emerald-100 shadow-emerald-900/50",
    poison: "border-red-600 bg-red-950/90 text-red-100 shadow-red-900/50",
    explode: "border-orange-500 bg-orange-950/90 text-orange-100 shadow-orange-900/50"
  };

  const activeStyle = styles[type] || styles.normal;
  const isPoison = type === 'poison' || type === 'explode';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      // CHANGED POSITIONING:
      // Fixed at top-24 (below nav), centered horizontally, but high up.
      // z-50 ensures it's above everything.
      className={`
        absolute top-24 left-1/2 -translate-x-1/2 z-50 
        w-auto max-w-2xl min-w-[300px]
        p-4 border-b-4 rounded-lg shadow-[0_10px_40px_rgba(0,0,0,0.8)] 
        backdrop-blur-md text-center pointer-events-none select-none
        flex flex-col items-center justify-center
        ${activeStyle}
      `}
    >
      <div className="flex items-center gap-2 mb-1 opacity-75">
         {isPoison ? <Skull size={16} /> : <FlaskConical size={16} />}
         <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            {type === 'normal' ? 'Update' : type.toUpperCase()}
         </span>
      </div>
      <h2 className={`font-serif font-bold leading-tight drop-shadow-md ${isPoison ? 'text-2xl' : 'text-xl'}`}>
        "{text}"
      </h2>
    </motion.div>
  );
};
const ShopAtmosphere = ({ heat, watchFocus, activeDistrict }) => {
  // Determine window color based on heat/patrols
  const isWatched = watchFocus === activeDistrict;
  const glowColor = isWatched 
    ? 'shadow-[0_0_100px_rgba(220,38,38,0.4)] bg-red-900/10' // RED ALERT
    : heat > 50 
      ? 'shadow-[0_0_80px_rgba(234,88,12,0.2)] bg-orange-900/5' // High Suspicion
      : 'shadow-[0_0_50px_rgba(30,41,59,0.5)] bg-blue-950/20'; // Calm Night

  return (
    <div className="h-full w-full flex flex-col gap-4 p-4 opacity-80 pointer-events-none select-none">
       {/* THE WINDOW */}
       <div className={`relative w-full aspect-square border-8 border-slate-900 bg-black overflow-hidden rounded-t-full transition-all duration-1000 ${glowColor}`}>
          
          {/* Rain/Atmosphere effect (Simple CSS Overlay) */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10" />
          
          {/* The Grates */}
          <div className="absolute inset-0 flex">
             <div className="flex-1 border-r-4 border-slate-900/80"></div>
             <div className="flex-1 border-r-4 border-slate-900/80"></div>
             <div className="flex-1"></div>
          </div>
          <div className="absolute inset-0 flex flex-col">
             <div className="flex-1 border-b-4 border-slate-900/80"></div>
             <div className="flex-1"></div>
          </div>

          {/* Silhouette of a Guard (Only if watched) */}
          <AnimatePresence>
            {isWatched && (
               <motion.div 
                 initial={{ opacity: 0, x: 50 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 50 }}
                 transition={{ duration: 2 }}
                 className="absolute bottom-0 right-4 w-32 h-48 bg-black blur-[2px]"
                 style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }} // Rough Head/Shoulders shape
               />
            )}
          </AnimatePresence>
       </div>
       
       {/* HEAT METER TEXT */}
       <div className="text-center">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-widest">Suspicion Level</div>
          <div className={`text-2xl font-black font-mono ${heat > 80 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}>
            {heat}%
          </div>
       </div>
    </div>
  )
}
// ==========================================
// 3. MAIN GAME COMPONENT
// ==========================================

const ApothecaryGame = () => {
  // --- State ---
  const [gameState, setGameState] = useState('TITLE');
  const [audioContext, setAudioContext] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [audioVolume, setAudioVolume] = useState(100);
  const [uiScale, setUiScale] = useState(100);
  const [gamma, setGamma] = useState(1.0);
  const [gameStats, setGameStats] = useState({ daysCount: 0, totalGold: 0, customersServed: 0 });

  const [phase, setPhase] = useState('day');
  const [day, setDay] = useState(1);
  const [customersServed, setCustomersServed] = useState(0);
  const [showMap, setShowMap] = useState(false);
  
  const [gold, setGold] = useState(100);
  const [reputation, setReputation] = useState(20);
  const [upgrades, setUpgrades] = useState({ reinforced: false, ventilation: false, merchant: false, mercury: false });

  const [apprentice, setApprentice] = useState({ hired: false, npcId: null, npcName: null, npcClass: null });
  const [consultUsed, setConsultUsed] = useState(false);
  const [revealedCustomerTags, setRevealedCustomerTags] = useState([]);
  const [isBlackBookOpen, setIsBlackBookOpen] = useState(false);
  const [discoveredIngredients, setDiscoveredIngredients] = useState({});
  const [brewHistory, setBrewHistory] = useState([]);

  const [heat, setHeat] = useState(0);
  const [watchFocus, setWatchFocus] = useState('market'); 
  const [activeDistrict, setActiveDistrict] = useState('dregs');

  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [gameMessage, setGameMessage] = useState('');
  const [messageType, setMessageType] = useState('normal');
  const [whisperQueue, setWhisperQueue] = useState([]);
  const [observationHint, setObservationHint] = useState(null);

  // --- Effects & Handlers ---
  useEffect(() => {
    const savedVol = localStorage.getItem('alchemistAudioVolume');
    if (savedVol !== null) setAudioVolume(parseInt(savedVol));
    const savedScale = localStorage.getItem('alchemistUIScale');
    if (savedScale !== null) setUiScale(parseInt(savedScale));
    const savedGamma = localStorage.getItem('alchemistGamma');
    if (savedGamma !== null) setGamma(parseFloat(savedGamma));
  }, []);

  const vol = audioVolume / 100;
  const handleVolumeChange = (val) => { setAudioVolume(val); localStorage.setItem('alchemistAudioVolume', val); };
  const handleScaleChange = (val) => { setUiScale(val); localStorage.setItem('alchemistUIScale', val); };
  const handleGammaChange = (val) => { setGamma(val); localStorage.setItem('alchemistGamma', val); };

  const handleHardReset = () => {
    localStorage.clear();
    setAudioVolume(100); setUiScale(100); setGamma(1.0); setSettingsOpen(false);
    setDay(1); setGold(100); setReputation(20);
    setUpgrades({ reinforced: false, ventilation: false, merchant: false, mercury: false });
    setApprentice({ hired: false, npcId: null, npcName: null, npcClass: null });
    setDiscoveredIngredients({}); setBrewHistory([]);
    setGameStats({ daysCount: 0, totalGold: 0, customersServed: 0 });
    setWhisperQueue([]); setPhase('day'); setGameState('TITLE');
  };

  const handleBribe = (cost) => {
    if (gold >= cost) {
      soundEngine.playCoin(vol); 
      setGold(prev => prev - cost);
      setHeat(prev => Math.max(0, prev - 25));
      setGameMessage("The guards look the other way...");
      setMessageType('success');
      setTimeout(() => setGameMessage(''), 2000);
    } else {
      soundEngine.playFail(vol);
      setGameMessage("Not enough gold for a bribe!");
      setMessageType('danger');
      setTimeout(() => setGameMessage(''), 2000);
    }
  };

  useEffect(() => {
    const districts = ['dregs', 'market', 'arcanum', 'docks', 'cathedral', 'spire'];
    const interval = setInterval(() => {
      const nextDistrict = districts[Math.floor(Math.random() * districts.length)];
      setWatchFocus(nextDistrict);
      if (nextDistrict === activeDistrict) {
         setGameMessage("WARNING: Watch Patrol in your Sector!");
         setMessageType('danger');
         setTimeout(() => setGameMessage(''), 3000);
      }
    }, 15000); 
    return () => clearInterval(interval);
  }, [activeDistrict, vol]);

  useEffect(() => {
    if (gameState === 'PLAYING') startNewDay();
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
    setObservationHint(generateObservations(customer)[0]);
  };
  const handleCustomerLeave = () => setObservationHint(null);

  const handleStartGame = () => {
    const ctx = initAudioContext();
    setAudioContext(ctx);
    soundEngine.playSuccess(vol);
    setGameState('PLAYING');
  };

  const startNewDay = () => {
    setCustomersServed(0);
    setPhase('day');
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
    } else {
      setGameMessage(`${apprentice.npcName} is stumped.`);
    }
    setTimeout(() => setGameMessage(''), 2000);
  };

  const handleRest = () => {
    soundEngine.playClick(vol);
    setDay(d => d + 1);
    setGameStats(prev => ({ ...prev, daysCount: prev.daysCount + 1 }));
    setPhase('day');
    setCustomersServed(0);
    setCurrentCustomer(generateCustomer());
    setConsultUsed(false);
    setRevealedCustomerTags([]);
    setWhisperQueue([]);
    setGameMessage(`Day ${day + 1} Begins`);
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
      if (Math.random() > 0.7) addWhisper(WHISPERS_ADD[Math.floor(Math.random() * WHISPERS_ADD.length)]);
    } else return;

    if (newIngredients.length >= 2) {
      const outcome = tagCombination(newIngredients);
      if (outcome.isFatal) {
        setTimeout(() => addWhisper(WHISPERS_DANGER[Math.floor(Math.random() * WHISPERS_DANGER.length)], 'danger'), 300);
      }
    }
  };

  const handleClearSelection = () => {
    soundEngine.playClick(vol);
    setSelectedIngredients([]);
    setGameMessage('Bench Cleared');
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

    // Heat Logic
    const isExplosive = selectedIngredients.some(i => i.tags.includes('Explosive'));
    const isToxic = selectedIngredients.some(i => i.tags.includes('Toxic'));
    const isWatched = watchFocus === activeDistrict;
    const RISK_MULTIPLIERS = {'dregs': 1.0, 'market': 1.2, 'arcanum': 1.5, 'docks': 1.8, 'cathedral': 2.5, 'spire': 3.0};
    const zoneMultiplier = RISK_MULTIPLIERS[activeDistrict] || 1.0;
    
    let baseHeat = 2 + (isExplosive ? 15 : 0) + (isToxic ? 10 : 0);
    let finalHeatSpike = Math.floor(baseHeat * zoneMultiplier * (isWatched ? 2.5 : 1));

    setHeat(prev => {
        const newHeat = Math.min(prev + finalHeatSpike, 100);
        if (newHeat >= 100) {
            setGameMessage("RAIDED BY CITY WATCH! (-50% Gold)");
            setMessageType('danger');
            soundEngine.playFail(vol);
            setGold(g => Math.floor(g / 2)); 
            return 50; 
        }
        return newHeat;
    });

    if (finalHeatSpike > 5) {
        const alertMsg = isWatched ? `PATROL ALERT! (+${finalHeatSpike} Heat)` : `Suspicion Raised (+${finalHeatSpike} Heat)`;
        setGameMessage(alertMsg);
        setMessageType(isWatched ? 'danger' : 'warning');
        setTimeout(() => setGameMessage(''), 3000);
    }

    const outcome = calculateOutcome(selectedIngredients, currentCustomer, upgrades, apprentice.hired ? apprentice : null);
    setGameStats(prev => ({ ...prev, totalGold: prev.totalGold + outcome.goldReward, customersServed: prev.customersServed + 1 }));
    setGold(prev => Math.max(0, prev + outcome.goldReward));
    setReputation(prev => Math.max(0, prev + outcome.reputationChange));
    setGameMessage(outcome.narrative);

    if (outcome.result === 'cured') {
      setMessageType('success');
      setTimeout(() => {
        soundEngine.playSuccess(vol);
        addWhisper(WHISPERS_SUCCESS[Math.floor(Math.random() * WHISPERS_SUCCESS.length)], 'normal');
        if (outcome.goldReward > 0) setTimeout(() => soundEngine.playGold(vol), 400);
      }, 200);
    } else {
      setMessageType(outcome.result === 'exploded' ? 'explode' : 'poison');
      soundEngine.playFail(vol);
      addWhisper(outcome.result === 'exploded' ? WHISPERS_DANGER[0] : WHISPERS_FAIL[0], 'danger');
    }

    const newDiscovered = { ...discoveredIngredients };
    selectedIngredients.forEach(ing => { newDiscovered[ing.name] = true; });
    setDiscoveredIngredients(newDiscovered);
    setBrewHistory(prev => [{ id: Date.now(), day, customerClass: currentCustomer.class.name, symptom: currentCustomer.symptom.text, result: outcome.result, goldChange: outcome.goldReward, repChange: outcome.reputationChange }, ...prev]);
    
    const nextCount = customersServed + 1;
    setCustomersServed(nextCount);

    setTimeout(() => {
      setGameMessage('');
      if (reputation > 0) {
        if (nextCount >= 5) setPhase('night');
        else {
            setCurrentCustomer(generateCustomer());
            setConsultUsed(false);
            setRevealedCustomerTags([]);
            setSelectedIngredients([]);
        }
      }
    }, 4000);
  };

  // --- Render Gates ---
  if (gameState === 'TITLE') return <div style={{ transform: `scale(${uiScale/100})`, filter: `brightness(${gamma})`, height: '100vh', width: '100vw', overflow: 'hidden' }}><TitleScreen onStart={handleStartGame} onOpenSettings={() => setSettingsOpen(true)} /><SettingsMenu isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onReset={handleHardReset} currentVolume={audioVolume} onVolumeChange={handleVolumeChange} currentScale={uiScale} onScaleChange={handleScaleChange} currentGamma={gamma} onGammaChange={handleGammaChange} /></div>;
  if (gameState === 'GAMEOVER') return <div style={{ transform: `scale(${uiScale/100})`, filter: `brightness(${gamma})`, height: '100vh', width: '100vw', overflow: 'hidden' }}><GameOverScreen stats={gameStats} onReturnToTitle={() => setGameState('TITLE')} /></div>;

  // --- MAIN RENDER (REFACTORED LAYOUT) ---
  return (
    <div className='min-h-screen bg-slate-950 text-amber-500 font-sans selection:bg-amber-900 selection:text-white overflow-hidden flex flex-col'>
      {/* 1. Scale Container */}
      <div className="flex-1 flex flex-col" style={{ transform: `scale(${uiScale / 100})`, transformOrigin: 'top center', filter: `brightness(${gamma})` }}>
        
        {/* 2. Top Navigation (Fixed Height) */}
        <div className="h-16 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-8 shrink-0 z-40 relative">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-amber-500"><Coins size={18} /> <span className="text-xl font-bold font-mono">{gold}</span></div>
            <div className="flex items-center gap-2 text-blue-400"><Shield size={18} /> <span className="text-xl font-bold font-mono">{reputation}</span></div>
            <div className="w-px h-6 bg-slate-700 mx-2" />
            <div className="text-slate-500 text-sm font-mono tracking-widest uppercase">Day {day} • {customersServed}/5</div>
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setShowMap(true)} className={`relative p-2 rounded-md shadow-lg flex items-center gap-2 transition-all mr-2 overflow-hidden ${watchFocus === activeDistrict ? 'bg-red-950/80 border border-red-500 text-red-200 animate-pulse' : 'bg-slate-900 border border-slate-700 hover:text-amber-500'}`}>
                {watchFocus === activeDistrict ? <Siren size={20} className="animate-spin" /> : <MapIcon size={20} />}
                <span className="text-xs uppercase font-bold tracking-widest hidden md:inline">{watchFocus === activeDistrict ? "PATROL ALERT" : "City Map"}</span>
            </button>
            {apprentice.hired && apprentice.activeAbility?.type === 'consult' && (
              <Button onClick={handleConsultApprentice} disabled={consultUsed} size="sm" className={`mr-2 ${consultUsed ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}>
                <Search className="w-4 h-4 mr-2" /> {consultUsed ? 'Consulted' : 'Ask Apprentice'}
              </Button>
            )}
            <Button onClick={() => { soundEngine.playClick(vol); setIsBlackBookOpen(true); }} variant="ghost" className="text-amber-500 hover:text-amber-200"><BookOpen size={20} /></Button>
            <Button onClick={() => { soundEngine.playClick(vol); setSettingsOpen(true); }} variant="ghost" className="text-amber-500 hover:text-amber-200"><Settings size={20} /></Button>
          </div>
        </div>

    {/* 3. Game Content Area */}
<div className="flex-1 relative overflow-hidden flex flex-col">
    
    {/* Background Image Layer */}
    <div className="absolute inset-0 z-0">
        <img src={alcBg} alt="Alchemist Alley" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
    </div>

    {/* Cinematic Toast (Positioned Absolute Top Center) */}
    <AnimatePresence>
        {gameMessage && <CinematicAnnouncement text={gameMessage} type={messageType} />}
    </AnimatePresence>

    <AnimatePresence mode='wait'>
        {phase === 'day' ? (
            <motion.div 
                key="day-phase" 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="relative z-10 flex-1 flex flex-col"
            >
                {/* A. The Stage */}
                <div className="flex-1 grid grid-cols-12 gap-4 px-8 pb-4 min-h-0">
                    
                    {/* LEFT COL: Customer (The Doorway) */}
                    <div className="col-span-3 flex flex-col justify-end z-20 pb-8">
                        <AnimatePresence mode='wait'>
                            {currentCustomer && (
                                <motion.div 
                                    key={currentCustomer.id} 
                                    // CHANGE: Slide in from left (-50), Fade out to left (-50)
                                    initial={{ x: -50, opacity: 0, filter: 'blur(10px)' }} 
                                    animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }} 
                                    exit={{ x: -50, opacity: 0, filter: 'blur(10px)' }} 
                                    transition={{ duration: 0.5, ease: "circOut" }}
                                    className="h-[500px] w-full max-w-[320px]"
                                >
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

                    {/* CENTER COL: Cauldron (Centered) */}
                    <div className="col-span-6 flex flex-col justify-end items-center pb-8 relative">
                        <div className="w-full max-w-xl">
                            <Cauldron 
                                selectedIngredients={selectedIngredients} 
                                onBrew={handleBrew} 
                                onClear={handleClearSelection} 
                                whisperQueue={whisperQueue} 
                            />
                        </div>
                    </div>

                    {/* RIGHT COL: Atmosphere / Window (Filling the void) */}
                    <div className="col-span-3 flex flex-col justify-center items-center pb-12 opacity-80">
                         <ShopAtmosphere 
                            heat={heat} 
                            watchFocus={watchFocus} 
                            activeDistrict={activeDistrict} 
                         />
                    </div>

                </div>

                {/* B. The HUD (Workbench) */}
                <div className="shrink-0 z-20">
                    <Workbench selectedIngredients={selectedIngredients} onIngredientSelect={handleIngredientSelect} />
                </div>

            </motion.div>
        ) : (
                    <motion.div key="night" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full z-20 relative bg-slate-950">
                        <TavernHub gold={gold} setGold={setGold} upgrades={upgrades} setUpgrades={setUpgrades} apprentice={apprentice} setApprentice={setApprentice} day={day} onRest={handleRest} volume={vol} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>

      {/* Modals */}
      <BlackBook isOpen={isBlackBookOpen} onClose={() => setIsBlackBookOpen(false)} discoveredIngredients={discoveredIngredients} brewHistory={brewHistory} />
      <SettingsMenu isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onReset={handleHardReset} currentVolume={audioVolume} onVolumeChange={handleVolumeChange} currentScale={uiScale} onScaleChange={handleScaleChange} currentGamma={gamma} onGammaChange={handleGammaChange} />
      
      <AnimatePresence>
        {showMap && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowMap(false)}>
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative w-full max-w-6xl aspect-video h-auto bg-[#1c1917] border border-[#44403c] shadow-2xl rounded-sm overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setShowMap(false)} className="absolute top-4 right-4 z-50 bg-slate-900 text-slate-400 hover:text-white p-2 rounded-full border border-slate-700"><X size={20} /></button>
                    <CityMap currentHeat={heat} activeDistrict={activeDistrict} watchFocus={watchFocus} onHeatReduce={handleBribe} playerGold={gold} />
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApothecaryGame;