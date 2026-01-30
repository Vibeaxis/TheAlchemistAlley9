import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, BookOpen, Search, Settings,
  Shield, Crown, Coins, Skull, Ghost,
  FlaskConical, Flame, Trash2, Loader
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
  
  // 1. Generate the Avatar Seed
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
      {/* --- THE SHADOW SILHOUETTE (Peeking from Corner) --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
         <img 
            src={avatarUrl} 
            alt="Customer Shadow"
            // CHANGED: Positioned to bottom-right (-right-16), reduced size (w-[90%]), opacity lowered
            className="absolute -right-16 -bottom-10 w-[90%] h-[90%] object-contain opacity-30 transition-all duration-700 group-hover:opacity-40 group-hover:scale-105 group-hover:-translate-x-2"
            style={{ 
                // Hard silhouette filter
                filter: 'grayscale(100%) brightness(0%) drop-shadow(0 -5px 15px rgba(255,255,255,0.1))'
            }}
        />
      </div>

      {/* Gradient Overlay (Stronger at bottom to fade the feet) */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent z-0 pointer-events-none" />

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
        <div className="w-full bg-slate-950/90 border-l-4 border-amber-700 p-6 rounded shadow-xl backdrop-blur-md mt-auto mb-12 transform transition-transform group-hover:-translate-y-1">
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
// THE CAULDRON (Wider & Better Steam)
const Cauldron = ({ selectedIngredients, onBrew, onClear, whisperQueue }) => {
  // 1. STATE LOCK: Prevents double-clicking and manages animation
  const [isBrewing, setIsBrewing] = useState(false);

  // 2. SAFETY LOGIC: The "Throttled" Brew Handler
  const handleSafeBrew = () => {
    if (isBrewing || selectedIngredients.length < 2) return;

    setIsBrewing(true);

    // DELAY: Wait 1.5 seconds for animation before triggering game logic
    setTimeout(() => {
      onBrew(); // Triggers the gold/effect
      setIsBrewing(false); // Unlocks the pot for the next round
    }, 1500);
  };

  // Visuals
  const liquidHeight = Math.min((selectedIngredients.length / 3) * 80, 80);
  const isToxic = selectedIngredients.some(i => i.tags.includes('Toxic'));
  
  // Dynamic color that gets brighter/intense when brewing
  const baseColor = isToxic 
    ? 'from-red-950 via-red-900 to-red-800' 
    : 'from-emerald-950 via-emerald-900 to-emerald-800';
    
  const brewingColor = isToxic
    ? 'from-red-600 via-orange-500 to-yellow-400'
    : 'from-emerald-500 via-teal-400 to-cyan-300';

  return (
    <div className="relative h-full flex flex-col items-center justify-end pb-8">
      
      {/* HEADER CONTROLS */}
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

      {/* --- THE POT --- */}
      {/* ANIMATION: Shakes violently when brewing */}
      <motion.div 
        className="relative w-80 h-72 mb-8 z-10 group"
        animate={isBrewing ? { 
          x: [-2, 2, -2, 2, 0], 
          rotate: [0, -1, 1, 0] 
        } : {}}
        transition={{ duration: 0.2, repeat: Infinity }}
      >
        
        {/* The Rim */}
        <div className="absolute top-0 left-0 w-full h-10 bg-slate-800 border-4 border-slate-600 rounded-[100%] z-20 shadow-xl" />
        
        {/* The Bowl Body */}
        <div className="absolute top-5 left-2 right-2 bottom-0 bg-slate-900 border-x-4 border-b-4 border-slate-700 rounded-b-[160px] overflow-hidden shadow-2xl">
          
          {/* LIQUID LAYER */}
          <motion.div
            initial={{ height: '0%' }}
            // When brewing, liquid bubbles UP to 95%, then settles
            animate={{ 
              height: isBrewing ? '95%' : `${liquidHeight}%`,
            }}
            className={`absolute bottom-0 w-full transition-all duration-700 opacity-90 bg-gradient-to-t ${isBrewing ? brewingColor : baseColor}`}
          >
             {/* Boiling Bubbles (Only visible when brewing) */}
             {isBrewing && (
                <div className="absolute inset-0 w-full h-full opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />
             )}

             {/* Surface Glint */}
             <div className="absolute top-0 w-full h-6 bg-white/10 blur-md transform scale-x-90" />
          </motion.div>

          {/* FLOATING INGREDIENTS */}
          <div className="absolute inset-0 flex flex-col-reverse items-center justify-start pb-10 gap-2 z-10 pointer-events-none">
            <AnimatePresence>
              {selectedIngredients.map((ing, i) => (
                <motion.div
                  key={`${ing.name}-${i}`}
                  initial={{ y: -100, opacity: 0, scale: 0.5 }}
                  // When brewing, ingredients spin faster and shrink (dissolving)
                  animate={isBrewing 
                    ? { y: 50, scale: 0, rotate: 360, opacity: 0 } 
                    : { y: 0, opacity: 1, scale: 1, rotate: Math.random() * 60 - 30 }
                  }
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

        {/* --- STEAM / WHISPERS --- */}
        <div className="absolute -top-12 left-0 w-full h-32 flex flex-col items-center justify-end pointer-events-none z-0">
          <AnimatePresence mode='popLayout'>
            {whisperQueue.slice(-2).map((w) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 1.1, filter: 'blur(4px)' }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className={`text-xs font-serif italic tracking-widest px-3 py-1 mb-1 ${
                  w.type === 'danger' ? 'text-red-400 drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]' :
                    w.type === 'success' ? 'text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-400'
                }`}
              >
                {w.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* --- BREW BUTTON --- */}
      <button // Changed to standard HTML button for generic compatibility
        onClick={handleSafeBrew}
        disabled={selectedIngredients.length < 2 || isBrewing} // LOCKS INPUT
        className={`
            relative z-30 w-full max-w-xs py-6 
            font-black text-lg uppercase tracking-[0.25em] rounded-sm border-2 
            shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all 
            active:translate-y-1 active:shadow-none flex items-center justify-center gap-3
            ${isBrewing 
                ? 'bg-slate-800 border-slate-600 text-slate-400 cursor-wait' 
                : 'bg-gradient-to-b from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 border-amber-900 text-amber-100 disabled:opacity-40 disabled:grayscale'
            }
        `}
      >
        {isBrewing ? (
            <>
                <Loader size={20} className="animate-spin" />
                <span>Distilling...</span>
            </>
        ) : (
            <span className="drop-shadow-md">Ignite & Brew</span>
        )}
      </button>
    </div>
  );
};
// Helper for colors (Same as before, just kept for context)
const getTagColor = (tag) => {
  switch (tag) {
    case 'Toxic': return 'bg-green-900 text-green-300 border-green-700';
    case 'Hot': return 'bg-orange-900 text-orange-300 border-orange-700';
    case 'Cooling': return 'bg-cyan-900 text-cyan-300 border-cyan-700';
    case 'Holy': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
    case 'Dark': return 'bg-purple-900 text-purple-300 border-purple-700';
    case 'Vital': return 'bg-red-900 text-red-300 border-red-700';
    case 'Purifying': return 'bg-blue-900 text-blue-300 border-blue-700';
    default: return 'bg-slate-800 text-slate-400 border-slate-600';
  }
};

const Workbench = ({ selectedIngredients, onIngredientSelect }) => {
  return (
    <div className="bg-[#0c0a09] border-2 border-[#292524] rounded-xl p-4 h-full flex flex-col shadow-2xl relative overflow-hidden">
      
      {/* Background Texture (Subtle Wood Grain) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(to right, #292524 1px, transparent 1px), linear-gradient(to bottom, #292524 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-end mb-4 border-b border-stone-800 pb-2">
        <h3 className="text-stone-500 text-xs font-black uppercase tracking-[0.2em] flex gap-2 items-center">
          <FlaskConical size={14} className="text-amber-700" /> 
          Reagent Rack
        </h3>
        <span className="text-[10px] text-stone-600 font-mono">
            {selectedIngredients.length} Items on Table
        </span>
      </div>

      {/* THE GRID: 2 cols on mobile, 3 on tablet, 4 on desktop */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto pr-1 custom-scrollbar">
        {INGREDIENTS.map((ing) => {
          const count = selectedIngredients.filter(i => i.name === ing.name).length;
          const isSelected = count > 0;

          return (
            <motion.button
              key={ing.name}
              onClick={() => onIngredientSelect(ing)}
              whileTap={{ scale: 0.95 }}
              className={`
                group relative min-h-[140px] flex flex-col items-center justify-between p-3 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                    ? 'bg-amber-950/30 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                    : 'bg-[#1c1917] border-[#292524] hover:bg-[#292524] hover:border-stone-500'
                }
              `}
            >
              {/* Selection Glow Overlay */}
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
              )}

              {/* Count Badge (Floating) */}
              {count > 0 && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-amber-500 text-amber-950 font-black text-xs flex items-center justify-center rounded-full shadow-lg z-20 animate-in zoom-in duration-200">
                  {count}
                </div>
              )}

              {/* Top Section: Icon & Name */}
              <div className="flex flex-col items-center gap-2 mt-1">
                 <div className={`text-4xl transition-all duration-300 ${isSelected ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'opacity-80 grayscale-[0.3] group-hover:grayscale-0'}`}>
                    {ing.icon}
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-wider text-center ${isSelected ? 'text-amber-100' : 'text-stone-500 group-hover:text-stone-300'}`}>
                    {ing.name}
                 </span>
              </div>

              {/* Bottom Section: Tags */}
              <div className="w-full flex flex-wrap gap-1 justify-center mt-2">
                {ing.tags.map(tag => (
                  <span
                    key={tag}
                    className={`
                      text-[9px] uppercase font-bold tracking-tight px-1.5 py-0.5 rounded border
                      ${getTagColor(tag)}
                    `}
                  >
                    {tag}
                  </span>
                ))}
              </div>

            </motion.button>
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
const CinematicAnnouncement = ({ text, type }) => {
  if (!text) return null;

  const styles = {
    normal: "border-slate-600 bg-slate-950/95 text-slate-200 shadow-slate-900/50",
    success: "border-emerald-500 bg-emerald-950/95 text-emerald-100 shadow-emerald-900/50",
    poison: "border-red-600 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900 via-red-950 to-black text-red-100 shadow-red-900/50",
    explode: "border-orange-500 bg-orange-950/95 text-orange-100 shadow-orange-900/50"
  };

  const activeStyle = styles[type] || styles.normal;
  const isPoison = type === 'poison';
  
  // 1. SMART LABEL LOGIC: Don't call it "Fatal" unless it actually is.
  let headerLabel = "RESULT";
  if (type === 'success') headerLabel = "SUCCESS";
  if (type === 'explode') headerLabel = "VOLATILE REACTION";
  if (isPoison) {
      // Check the actual text to see if it's lethal or just a failure
      const lowerText = text.toLowerCase();
      if (lowerText.includes('poison') || lowerText.includes('died') || lowerText.includes('kill')) {
          headerLabel = "☠ LETHAL DOSE";
      } else {
          headerLabel = "⚠ BREW FAILURE";
      }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className={`
        /* 2. POSITIONING FIX */
        /* Mobile: Bottom pinned (Keep this) */
        absolute z-[100] bottom-8 left-4 right-4 
        
        /* Desktop: Top-Right (Moved from middle) */
        md:bottom-auto md:left-auto md:top-24 md:right-8
        md:w-96 md:max-w-md
        
        /* VISUALS */
        p-6 border-l-4 rounded-r-lg shadow-2xl backdrop-blur-xl
        flex flex-col justify-center
        pointer-events-none select-none
        ${activeStyle}
      `}
    >
      {/* Header Label */}
      <div className="mb-2 flex items-center gap-2 opacity-80">
         {isPoison ? (
            <span className="text-xs font-black uppercase tracking-widest text-red-500 animate-pulse">
                {headerLabel}
            </span>
         ) : (
            <span className={`text-[10px] font-bold uppercase tracking-widest opacity-70 ${type === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
                {headerLabel}
            </span>
         )}
      </div>

      {/* Main Text */}
      <h2 className={`font-serif font-bold leading-snug drop-shadow-md ${isPoison ? 'text-xl md:text-2xl' : 'text-lg md:text-xl'}`}>
        "{text}"
      </h2>

      {/* Narrative Footer */}
      {isPoison && (
        <div className="mt-4 pt-4 border-t border-red-800/50 text-xs text-red-400 font-mono">
            Reputation Impact: <span className="text-red-200 font-bold">-CRITICAL</span>
        </div>
      )}
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
const [showMap, setShowMap] = useState(false);
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
// Add these to your main component's state
const [heat, setHeat] = useState(0);
const [watchFocus, setWatchFocus] = useState('market'); // Where the guards are looking
const [activeDistrict, setActiveDistrict] = useState('slums'); // Where YOU are
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
  // Add this useEffect to move the guards automatically
useEffect(() => {
  const districts = ['slums', 'market', 'palace'];
  const interval = setInterval(() => {
    // Pick a random district
    const nextDistrict = districts[Math.floor(Math.random() * districts.length)];
    setWatchFocus(nextDistrict);
    
    // Optional: Play a sound if they move to YOUR district
    if (nextDistrict === activeDistrict) {
      // soundEngine.playSiren(vol); 
    }
  }, 10000); // Guards move every 10 seconds
  return () => clearInterval(interval);
}, [activeDistrict]);
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
    // --- 1. YOUR EXISTING VALIDATION (Keep this) ---
    if (selectedIngredients.length < 2) {
      soundEngine.playFail(vol);
      setGameMessage('Mixture Unstable');
      setMessageType('poison');
      setTimeout(() => setGameMessage(''), 2000);
      return;
    }

    // --- 2. YOUR EXISTING SUCCESS SOUND (Keep this) ---
    soundEngine.playBubble(vol);

    // --- 3. NEW: CALCULATE HEAT GENERATION ---
    // Check if ingredients are "loud" or "illegal"
    const isExplosive = selectedIngredients.some(i => i.tags.includes('Explosive'));
    const isToxic = selectedIngredients.some(i => i.tags.includes('Toxic'));
    
    // Check if the Guards are watching YOUR district
    const isWatched = watchFocus === activeDistrict;

    let heatSpike = 0;

    if (isWatched) {
      // HIGH RISK: If watched, everything generates heat
      heatSpike += 5; 
      if (isExplosive) heatSpike += 20; // Explosion while watched = Bad
      if (isToxic) heatSpike += 15;     // Poison while watched = Bad
    } else {
      // LOW RISK: If not watched, only big mistakes generate heat
      if (isExplosive) heatSpike += 5; // Distant boom
    }

    // Apply the Heat
    setHeat(prev => {
        const newHeat = Math.min(prev + heatSpike, 100);
        
        // --- 4. NEW: CONSEQUENCES ---
        if (newHeat >= 100) {
            // TRIGGER RAID / GAME OVER
            // setGameMessage("RAIDED BY CITY WATCH!");
            // setGold(g => Math.floor(g / 2)); // Lose half gold
            // return 50; // Reset heat to 50
        }
        
        return newHeat;
    });

    // --- 5. VISUAL FEEDBACK FOR HEAT ---
    if (heatSpike > 0) {
        setGameMessage(isWatched ? `Careful! Watch Active (+${heatSpike} Heat)` : `Noise Detected (+${heatSpike} Heat)`);
        setMessageType('danger');
    }

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
            <button 
  onClick={() => setShowMap(true)}
  className="absolute top-4 right-4 z-40 p-3 bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-500 hover:border-amber-500 rounded-md shadow-lg flex items-center gap-2 transition-all"
>
  <Map size={20} />
  <span className="text-xs uppercase font-bold tracking-widest hidden md:inline">City Map</span>
</button>
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
      {/* --- THE MAP MODAL --- */}
<AnimatePresence>
  {showMap && (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setShowMap(false)} // Click outside to close
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-4xl h-[80vh] bg-slate-950 border-2 border-slate-800 shadow-2xl rounded-lg overflow-hidden relative"
        onClick={(e) => e.stopPropagation()} // Click inside doesn't close
      >
        {/* Close Button */}
        <button 
          onClick={() => setShowMap(false)}
          className="absolute top-4 right-4 z-50 bg-slate-900 text-slate-400 hover:text-white p-2 rounded-full border border-slate-700"
        >
          <X size={20} />
        </button>

        {/* The Map Component */}
        <CityMap 
           currentHeat={heat} 
           activeDistrict={activeDistrict} 
           watchFocus={watchFocus} 
           onHeatReduce={handleBribe}
           playerGold={playerProfile.gold}
        />
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};
export default ApothecaryGame;