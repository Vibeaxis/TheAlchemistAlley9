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
const CustomerCard = ({ customer, observationHint, onMouseEnter, onMouseLeave, revealedTags, isInspecting }) => {
  // 1. STATE
  const [hasRevealed, setHasRevealed] = React.useState(false);
  
  // 2. EFFECT: Trigger reveal
  React.useEffect(() => {
    if (isInspecting) setHasRevealed(true);
  }, [isInspecting]);

  React.useEffect(() => {
    setHasRevealed(false);
  }, [customer.id]);

  const Icon = customer.class.icon || Ghost;
  
  // 3. FLAVOR DATA
  const districts = [
    { name: 'The Dregs', flavor: 'Rat-Kin', color: 'text-emerald-400' },
    { name: 'Market', flavor: 'Coin-Bound', color: 'text-amber-400' },
    { name: 'Arcanum', flavor: 'Void-Touched', color: 'text-purple-400' },
    { name: 'Docks', flavor: 'Salt-Born', color: 'text-cyan-400' },
    { name: 'Cathedral', flavor: 'Light-Blinded', color: 'text-yellow-200' },
    { name: 'Spire', flavor: 'High-Blood', color: 'text-rose-400' }
  ];
  const districtIndex = (customer.id.toString().charCodeAt(0) || 0) % districts.length;
  const origin = districts[districtIndex];

  return (
    <div
      className={`
        relative w-full h-full min-h-[460px] 
        bg-[#0b0f19] rounded-xl overflow-hidden
        flex flex-col items-center text-center shadow-2xl group transition-all duration-700
        ${hasRevealed ? 'shadow-[0_0_40px_rgba(124,58,237,0.15)]' : ''}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 1. BORDER GLOW (Only appears on reveal) */}
      <div className={`absolute inset-0 rounded-xl border-4 border-double z-20 pointer-events-none transition-colors duration-700 ${hasRevealed ? 'border-purple-500/40' : 'border-slate-800'}`} />
      
      {/* 2. BACKGROUND & AVATAR */}
      <div className="absolute inset-0 z-0">
         {/* The Avatar - Larger and clearer now */}
         <img 
            src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${customer.id + customer.class.name}&backgroundColor=transparent`} 
            alt="Shadow"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] object-contain opacity-30 filter grayscale brightness-75 contrast-125 pointer-events-none"
        />
         {/* Cinematic Gradient: Fades from transparent (top) to black (bottom) so text is readable */}
         <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19] via-[#0b0f19]/80 to-transparent z-10" />
      </div>

      {/* 3. CONTENT LAYER */}
      <div className="flex-1 flex flex-col w-full relative z-20 h-full p-6">
        
        {/* HEADER: Name & Icon */}
        <div className="w-full relative flex flex-col items-center pt-2">
            <div className="text-slate-500 mb-2 drop-shadow-md">
              <Icon size={32} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-3xl font-serif font-bold text-slate-100 leading-none drop-shadow-lg tracking-wide">
                {customer.class.name}
            </h2>
            <p className="text-slate-400 text-xs italic font-serif tracking-wider mt-1 opacity-80">
                "{customer.class.description}"
            </p>

            {/* --- INVISIBLE INK REVEAL (Top Right) --- */}
            <div className={`absolute -top-2 -right-2 flex flex-col items-end transition-all duration-1000 ${hasRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="text-[9px] text-purple-400/80 font-serif italic tracking-widest mb-0.5">
                   Soul Echo
                </div>
                <div className={`text-sm font-bold font-serif uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] ${origin.color}`}>
                   {origin.name}
                </div>
            </div>
        </div>

        {/* BODY: Symptom Text (Centered, Cinematic) */}
        {/* No box, just text floating in the void/gradient */}
        <div className="flex-1 flex items-center justify-center py-4">
          <p className="text-amber-100/90 font-serif text-lg leading-relaxed italic drop-shadow-md">
            "{customer.symptom.text}"
          </p>
        </div>

        {/* FOOTER: Inspection Status */}
        <div className="h-12 w-full flex items-center justify-center shrink-0">
            <AnimatePresence>
            {/* Case 1: Hint Revealed */}
            {observationHint && hasRevealed && (
                <motion.div
                    initial={{ opacity: 0, filter: 'blur(4px)' }} 
                    animate={{ opacity: 1, filter: 'blur(0px)' }} 
                    transition={{ duration: 1 }}
                    className="w-full text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5">
                        <span className="text-[10px] text-purple-300 uppercase tracking-[0.2em] font-bold drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">
                            ✦ {observationHint} ✦
                        </span>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
            
            {/* Case 2: Prompt to Inspect */}
            {!hasRevealed && (
                <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-70 transition-opacity">
                    <span className="text-[9px] text-indigo-200 uppercase tracking-[0.25em] font-light">
                        Use Lens to Divinate
                    </span>
                    <div className="h-px w-8 bg-indigo-500/50" />
                </div>
            )}
        </div>
      </div>

      {/* TAGS (Top Left/Right - subtle) */}
      {revealedTags && revealedTags.length > 0 && (
        <div className="absolute top-6 left-6 flex flex-col gap-1 items-start z-30 pointer-events-none">
          {revealedTags.map(t => (
            <span key={t} className="text-[9px] text-slate-400 font-serif tracking-widest border-b border-slate-700/50">
                {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
// Updated to accept 'onProcess'
const Cauldron = ({ selectedIngredients, onBrew, onClear, whisperQueue, onProcess }) => {
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
          
          {/* INGREDIENTS FLOATING */}
          <div className="absolute inset-0 flex flex-col-reverse items-center justify-start pb-10 gap-2 z-10">
            <AnimatePresence>
              {selectedIngredients.map((ing, i) => (
                <motion.div
                  // Use ID if available, otherwise index (fallback)
                  key={ing.id || `${ing.name}-${i}`}
                  initial={{ y: -100, opacity: 0, scale: 0.5 }}
                  animate={isBrewing ? { y: 50, scale: 0, rotate: 360, opacity: 0 } : { y: 0, opacity: 1, scale: 1, rotate: Math.random() * 60 - 30 }}
                  exit={{ y: 50, opacity: 0, scale: 0 }}
                  transition={isBrewing ? { duration: 1 } : {}}
                  // ADDED: 'group' class to handle hover state for the button inside
                  className="relative text-4xl drop-shadow-2xl filter brightness-110 cursor-pointer group"
                >
                  {ing.icon}
                  
                  {/* NEW: CRUSH BUTTON (Only shows on hover if item is processable) */}
                  {!ing.isProcessed && ing.processed && !isBrewing && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        <button
                            onClick={(e) => { 
                                e.stopPropagation(); // Prevent bubbling 
                                onProcess(ing.id);   // Call the crush function
                            }}
                            className="bg-stone-900/90 text-stone-200 text-[9px] font-black tracking-widest px-2 py-1 rounded border border-stone-600 hover:bg-amber-900 hover:border-amber-500 hover:text-white shadow-lg whitespace-nowrap"
                        >
                            CRUSH
                        </button>
                    </div>
                  )}

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Whispers / Steam */}
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
  
  // Visual intensity
  const glowColor = isWatched 
    ? 'shadow-[0_0_100px_rgba(220,38,38,0.5)] bg-red-950/20' // RED ALERT
    : heat > 50 
      ? 'shadow-[0_0_80px_rgba(234,88,12,0.3)] bg-orange-900/10' // High Suspicion
      : 'shadow-[0_0_50px_rgba(30,41,59,0.5)] bg-blue-950/20'; // Calm Night

  return (
    <div className="w-full flex flex-col gap-4 p-4 opacity-90 pointer-events-none select-none transition-all duration-1000">
       
       {/* THE WINDOW */}
       <div className={`relative w-full aspect-square max-w-[200px] mx-auto border-8 border-slate-900 bg-black overflow-hidden rounded-t-full transition-all duration-1000 ${glowColor}`}>
          
          {/* 1. Atmosphere Overlay (The Glass Texture) */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 z-10" />
          
          {/* 2. THE GUARD (Replaces the Polygon) */}
          {/* Placed BEFORE the grates so it looks like they are outside */}
          <AnimatePresence>
            {isWatched && (
               <motion.img 
                 // Static seed 'CityWatch' ensures it always looks like a helmeted guard
                 src={`https://api.dicebear.com/9.x/adventurer/svg?seed=CityWatchPatrol&flip=true&backgroundColor=transparent`}
                 alt="Patrol Shadow"
                 // Slide in from the right side, slowly
                 initial={{ opacity: 0, x: 50, scale: 0.9 }}
                 animate={{ opacity: 0.8, x: 0, scale: 1.1 }}
                 exit={{ opacity: 0, x: 50, scale: 0.9 }}
                 transition={{ duration: 2, ease: "easeInOut" }}
                 // CSS Magic: brightness-0 makes it a silhouette, blur makes it look like it's behind glass
                 className="absolute -bottom-6 -right-6 w-48 h-48 object-cover filter brightness-0 blur-[2px] grayscale z-0"
               />
            )}
          </AnimatePresence>

          {/* 3. The Window Bars (Grates) - z-20 to sit ON TOP of the guard */}
          <div className="absolute inset-0 flex z-20">
             <div className="flex-1 border-r-4 border-slate-900/80"></div>
             <div className="flex-1 border-r-4 border-slate-900/80"></div>
             <div className="flex-1"></div>
          </div>
          <div className="absolute inset-0 flex flex-col z-20">
             <div className="flex-1 border-b-4 border-slate-900/80"></div>
             <div className="flex-1"></div>
          </div>
       </div>

       {/* (Optional) Heat Text - Removed to keep it clean, as discussed, 
           but you can add it back here if you really want the numbers. */}
    </div>
  )
}
const Lens = ({ onInspect, isInspecting }) => {
  return (
    <motion.div
      drag
      // REMOVED: dragConstraints={...} 
      dragElastic={0.05} // Low elasticity feels heavier/better
      dragMomentum={false} // Stops it from sliding away when you let go
      whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
      onDragStart={() => onInspect(true)}
      onDragEnd={() => onInspect(false)}
      className="absolute bottom-4 left-4 z-50 cursor-grab group"
    >
      {/* The Glass Visual */}
      <div className="relative w-24 h-24 pointer-events-none"> {/* Added pointer-events-none to inner so drag works better */}
        {/* Handle */}
        <div className="absolute -bottom-6 -right-6 w-16 h-4 bg-amber-900 rounded-full rotate-45 border-2 border-amber-950 z-0" />
        
        {/* Rim */}
        <div className="absolute inset-0 rounded-full border-[6px] border-amber-600 bg-white/10 backdrop-blur-[1px] shadow-xl z-10 flex items-center justify-center overflow-hidden">
             {/* Reflection */}
             <div className="absolute top-2 left-4 w-8 h-4 bg-white/40 rounded-full rotate-[-15deg] blur-[1px]" />
        </div>
      </div>
      
      {/* Helper Text */}
      <div className="absolute -bottom-10 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-amber-500 font-mono tracking-widest pointer-events-none whitespace-nowrap">
        DRAG TO INSPECT
      </div>
    </motion.div>
  );
};
const Mortar = ({ onInteract }) => {
  const [isGrinding, setIsGrinding] = useState(false);

  const handleClick = () => {
    setIsGrinding(true);
    if(onInteract) onInteract(); // Trigger the parent logic
    setTimeout(() => setIsGrinding(false), 500);
  };

  return (
    <div 
      onClick={handleClick}
      className="relative w-32 h-32 flex items-center justify-center group cursor-pointer hover:scale-105 transition-transform"
    >
       {/* Pestle Animation */}
       <motion.div 
         animate={isGrinding ? { x: [0, 5, -5, 0], y: [0, 10, 0], rotate: [0, -15, 10, 0] } : {}}
         transition={{ duration: 0.4 }}
         className="absolute z-20 -top-8 right-4 text-6xl drop-shadow-xl origin-bottom-left pointer-events-none"
       >
         🥢 
       </motion.div>

       {/* Bowl */}
       <div className="w-24 h-20 bg-stone-800 border-b-4 border-r-4 border-stone-950 rounded-b-full shadow-2xl flex items-center justify-center relative overflow-hidden group-hover:bg-stone-700 transition-colors">
          <div className="absolute inset-0 bg-stone-900/50" />
          <div className="text-[10px] text-stone-500 font-black uppercase tracking-widest mt-4 z-10 select-none">
             {isGrinding ? "CRUSHING..." : "MORTAR"}
          </div>
       </div>
    </div>
  );
};
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
// NEW STATE: The ingredient currently being dragged by the mouse
const [draggingIngredient, setDraggingIngredient] = useState(null);
const [isInspecting, setIsInspecting] = useState(false); // For the Lens
const mortarRef = useRef(null); // To help with drop detection
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
// BULK PROCESS: Tries to crush everything in the pot
  const handleMortarClick = () => {
    soundEngine.playClick(vol); // Or a grind sound if you have it
    
    let didCrush = false;
    
    // Create a new array with processed items
    const newIngredients = selectedIngredients.map(item => {
        if (item.processed && !item.isProcessed) {
            didCrush = true;
            return {
                ...item,
                name: item.processed.name,
                tags: item.processed.tags,
                icon: item.processed.icon,
                isProcessed: true
            };
        }
        return item;
    });

    if (didCrush) {
        setSelectedIngredients(newIngredients);
        setGameMessage("Ingredients Refined");
        setMessageType("normal");
        setTimeout(() => setGameMessage(""), 1500);
    } else {
        // Feedback if nothing could be crushed
        setGameMessage("Nothing to crush...");
        setTimeout(() => setGameMessage(""), 1000);
    }
  };
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

// 1. SELECTING (Clicking the Rack)
  const handleIngredientSelect = (ingredient) => {
    soundEngine.playClick(vol);
    
    // Check if we are removing an existing item by name (Toggle behavior)
    if (selectedIngredients.find(i => i.name === ingredient.name)) {
      const newIngredients = selectedIngredients.filter(i => i.name !== ingredient.name);
      setSelectedIngredients(newIngredients);
    } 
    // Otherwise, add it (if under limit)
    else if (selectedIngredients.length < 3) {
      // IMPORTANT: Spread the ingredient and add a unique ID.
      // We need this ID so the Mortar knows exactly which item to transform.
      const newIng = { ...ingredient, id: Date.now() + Math.random() };
      
      const newIngredients = [...selectedIngredients, newIng];
      setSelectedIngredients(newIngredients);

      if (Math.random() > 0.7) addWhisper(WHISPERS_ADD[Math.floor(Math.random() * WHISPERS_ADD.length)]);
    } 
    else return;

    // Safety check for dangerous combos immediately upon adding
    // (We use a temporary array because state hasn't updated yet)
    const previewIngredients = [...selectedIngredients, ingredient]; 
    if (previewIngredients.length >= 2) {
      const outcome = tagCombination(previewIngredients);
      if (outcome.isFatal) {
        setTimeout(() => addWhisper(WHISPERS_DANGER[Math.floor(Math.random() * WHISPERS_DANGER.length)], 'danger'), 300);
      }
    }
  };

  // 2. PROCESSING (The new Mortar Logic)
  // This function is passed to the Cauldron component
  const handleProcessIngredient = (ingredientId) => {
    // Find the item in our list
    const index = selectedIngredients.findIndex(i => i.id === ingredientId);
    if (index === -1) return;

    const item = selectedIngredients[index];
    
    // If it has no 'processed' data, we can't crush it.
    if (!item.processed) return; 

    // Create the new "Crushed" version
    const crushedItem = {
        ...item, // Keep ID and other props
        name: item.processed.name,
        tags: item.processed.tags,
        icon: item.processed.icon,
        isProcessed: true // Flag to prevent double-crushing
    };

    // Update state
    const newIngredients = [...selectedIngredients];
    newIngredients[index] = crushedItem;
    setSelectedIngredients(newIngredients);
    
    // Optional: Add a sound effect here
    // soundEngine.playGrind(vol); 
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

    {/* Note: Floating Cinematic Toast REMOVED from here. It is now in the Right Column. */}

    <AnimatePresence mode='wait'>
        {phase === 'day' ? (
            <motion.div 
                key="day-phase" 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="relative z-10 flex-1 flex flex-col"
            >
                {/* A. The Stage */}
                <div className="flex-1 grid grid-cols-12 gap-4 px-8 pb-4 min-h-0 items-end">
                    
                    {/* LEFT COL: Customer (The Entrance) */}
                    <div className="col-span-3 flex flex-col justify-center h-full pb-12 z-20">
                        <AnimatePresence mode='wait'>
                            {currentCustomer && (
                                <motion.div 
                                    key={currentCustomer.id} 
                                    // Slide in from left (-60), Fade/Blur out to left
                                    initial={{ x: -60, opacity: 0, filter: 'blur(5px)' }} 
                                    animate={{ x: 0, opacity: 1, filter: 'blur(0px)' }} 
                                    exit={{ x: -60, opacity: 0, filter: 'blur(5px)' }} 
                                    transition={{ type: "spring", bounce: 0, duration: 0.6 }}
                                    className="w-full max-w-[320px]"
                                >
                                    <CustomerCard 
                                        customer={currentCustomer} 
                                        observationHint={observationHint} 
                                        onMouseEnter={() => handleCustomerHover(currentCustomer)} 
                                        onMouseLeave={handleCustomerLeave} 
                                        revealedTags={revealedCustomerTags}
                                        // NEW: Pass inspection state for the blur effect
                                        isInspecting={isInspecting} 
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* CENTER COL: Cauldron & Tools (The Desk) */}
                    <div className="col-span-6 flex flex-col justify-end items-center pb-8 relative h-full">
                        
                        {/* 1. LENS (Bottom Left of Center) */}
                        <div className="absolute bottom-4 left-0 z-40">
                            <Lens onInspect={setIsInspecting} isInspecting={isInspecting} />
                        </div>

                      {/* 2. MORTAR (Bottom Right of Center) */}
<div className="absolute bottom-4 right-0 z-40">
    <Mortar onInteract={handleMortarClick} />
</div>

                        {/* 3. CAULDRON */}
                        <div className="w-full max-w-xl">
                            <Cauldron 
                                selectedIngredients={selectedIngredients} 
                                onBrew={handleBrew} 
                                onClear={handleClearSelection} 
                                whisperQueue={whisperQueue} 
                                // NEW: Pass the crush handler
                                onProcess={handleProcessIngredient} 
                            />
                        </div>
                    </div>

                    {/* RIGHT COL: Atmosphere & Results (The Environment) */}
                    <div className="col-span-3 flex flex-col justify-start pt-12 h-full z-10">
                         
                         {/* Window (Always visible) */}
                         <ShopAtmosphere 
                            heat={heat} 
                            watchFocus={watchFocus} 
                            activeDistrict={activeDistrict} 
                         />

                         {/* Result Log (Appears below window) */}
                         <div className="h-32 flex items-start justify-center mt-4">
                             <AnimatePresence mode='wait'>
                                {gameMessage && (
                                    <CinematicAnnouncement text={gameMessage} type={messageType} />
                                )}
                             </AnimatePresence>
                         </div>
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