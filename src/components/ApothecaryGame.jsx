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
const THEMES = {
  // The Old Look (for reference/unlockable)
  'default': {
    id: 'default',
    font: 'font-sans',
    bg: 'bg-slate-950',
    nav: 'bg-slate-900/80 border-slate-800',
    hud: 'bg-slate-900 border-slate-700',
    textMain: 'text-amber-500',
    textSec: 'text-blue-400',
    accent: 'border-slate-700',
    button: 'hover:bg-slate-800 text-slate-400 hover:text-white'
  },
  // THE NEW LOOK (Golden/Wood/Paper)
  'grimoire': {
    id: 'grimoire',
    font: 'font-serif', // Everything becomes serif
    bg: 'bg-[#0c0a09]', // Warm Black (Stone)
    nav: 'bg-[#1c1917]/90 border-amber-900/30', // Dark Wood
    hud: 'bg-[#1c1917] border-amber-900/30', // Dark Wood HUD
    textMain: 'text-amber-500', // Gold
    textSec: 'text-amber-700', // Dark Bronze/Leather
    accent: 'border-amber-900/30',
    button: 'hover:bg-amber-900/20 text-amber-800 hover:text-amber-500'
  }
};
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
  const [hasRevealed, setHasRevealed] = React.useState(false);
  
  React.useEffect(() => {
    if (isInspecting) setHasRevealed(true);
  }, [isInspecting]);

  React.useEffect(() => {
    setHasRevealed(false);
  }, [customer.id]);

  const Icon = customer.class.icon || Ghost;
  
  // Use themed district colors (Warm/Gold/Purple instead of neon)
  const districts = [
    { name: 'The Dregs', flavor: 'Rat-Kin', color: 'text-emerald-500' },
    { name: 'Market', flavor: 'Coin-Bound', color: 'text-amber-500' },
    { name: 'Arcanum', flavor: 'Void-Touched', color: 'text-purple-400' },
    { name: 'Docks', flavor: 'Salt-Born', color: 'text-cyan-600' },
    { name: 'Cathedral', flavor: 'Light-Blinded', color: 'text-yellow-400' },
    { name: 'Spire', flavor: 'High-Blood', color: 'text-rose-500' }
  ];
  const districtIndex = (customer.id.toString().charCodeAt(0) || 0) % districts.length;
  const origin = districts[districtIndex];

  return (
    <div
      className={`
        relative w-full h-full min-h-[460px] 
        bg-[#14100e] rounded-xl overflow-hidden
        flex flex-col items-center text-center shadow-2xl group transition-all duration-700
        border-2 border-[#2c241b]
        ${hasRevealed ? 'shadow-[0_0_40px_rgba(245,158,11,0.1)] border-amber-900/50' : ''}
      `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* 1. TEXTURE: Paper Grain Overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }} 
      />

      {/* 2. BACKGROUND & AVATAR */}
      <div className="absolute inset-0 z-0">
         <img 
            src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${customer.id + customer.class.name}&backgroundColor=transparent`} 
            alt="Shadow"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] object-contain opacity-20 filter sepia brightness-50 contrast-125 pointer-events-none"
        />
         <div className="absolute inset-0 bg-gradient-to-t from-[#14100e] via-[#14100e]/80 to-transparent z-10" />
      </div>

      {/* 3. CONTENT LAYER */}
      <div className="flex-1 flex flex-col w-full relative z-20 h-full p-6 font-serif">
        
        {/* HEADER */}
        <div className="w-full relative flex flex-col items-center pt-2">
            <div className="text-amber-900/60 mb-2 drop-shadow-md">
              <Icon size={32} strokeWidth={1.5} />
            </div>
            
            <h2 className="text-3xl font-bold text-amber-100/90 leading-none drop-shadow-lg tracking-wide">
                {customer.class.name}
            </h2>
            <p className="text-amber-700/60 text-xs italic tracking-wider mt-1">
                "{customer.class.description}"
            </p>

            {/* REVEAL (Top Right) */}
            <div className={`absolute -top-2 -right-2 flex flex-col items-end transition-all duration-1000 ${hasRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="text-[9px] text-amber-800/80 italic tracking-widest mb-0.5">
                   Soul Echo
                </div>
                <div className={`text-sm font-bold uppercase tracking-widest drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] ${origin.color}`}>
                   {origin.name}
                </div>
            </div>
        </div>

        {/* BODY TEXT */}
        <div className="flex-1 flex items-center justify-center py-4">
          <p className="text-amber-100/80 text-lg leading-relaxed italic drop-shadow-md">
            "{customer.symptom.text}"
          </p>
        </div>

        {/* FOOTER */}
        <div className="h-12 w-full flex items-center justify-center shrink-0">
            <AnimatePresence>
            {observationHint && hasRevealed && (
                <motion.div
                    initial={{ opacity: 0, filter: 'blur(4px)' }} 
                    animate={{ opacity: 1, filter: 'blur(0px)' }} 
                    transition={{ duration: 1 }}
                    className="w-full text-center"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 border-t border-b border-amber-900/30">
                        <span className="text-[10px] text-amber-500 uppercase tracking-[0.2em] font-bold">
                            ✦ {observationHint} ✦
                        </span>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
            
            {!hasRevealed && (
                <div className="flex flex-col items-center gap-2 opacity-30 group-hover:opacity-60 transition-opacity">
                    <span className="text-[9px] text-amber-700 uppercase tracking-[0.25em]">
                        Divinate Aura
                    </span>
                    <div className="h-px w-8 bg-amber-800/50" />
                </div>
            )}
        </div>
      </div>

      {/* TAGS */}
      {revealedTags && revealedTags.length > 0 && (
        <div className="absolute top-6 left-6 flex flex-col gap-1 items-start z-30 pointer-events-none">
          {revealedTags.map(t => (
            <span key={t} className="text-[9px] text-amber-700/60 font-bold tracking-widest border-b border-amber-900/20">
                {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
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
  
  // DARKER / RICHER LIQUIDS
  const baseColor = isToxic 
    ? 'from-[#450a0a] via-[#7f1d1d] to-[#991b1b]' // Blood Red
    : 'from-[#0f172a] via-[#1e293b] to-[#334155]'; // Deep Ink/Water (Darker than before)

  const brewingColor = isToxic
    ? 'from-orange-700 via-red-600 to-amber-500' 
    : 'from-emerald-800 via-teal-600 to-cyan-500';

  return (
    <div className="relative h-full flex flex-col items-center justify-end">
      
      {/* HEADER: Only shows Trash icon now (No Text) */}
      <div className="w-full flex justify-end items-center mb-2 px-4 absolute top-0 left-0 z-30 h-8">
        {selectedIngredients.length > 0 && !isBrewing && (
          <button onClick={onClear} className="text-[#57534e] hover:text-red-400 transition-colors p-2 hover:bg-[#292524] rounded-full">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* THE CAULDRON BODY */}
      <motion.div 
        className="relative w-72 h-64 mb-6 z-10 group"
        animate={isBrewing ? { x: [-2, 2, -2, 2, 0], rotate: [0, -1, 1, 0] } : {}}
        transition={{ duration: 0.2, repeat: Infinity }}
      >
        {/* 1. RIM (Cast Iron) - CHANGED from slate-800 to #292524 */}
        <div className="absolute top-0 left-0 w-full h-10 bg-[#292524] border-4 border-[#44403c] rounded-[100%] z-20 shadow-2xl" />
        
        {/* 2. BODY (Dark Iron) - CHANGED from slate-900 to #1c1917 */}
        <div className="absolute top-5 left-2 right-2 bottom-0 bg-[#1c1917] border-x-4 border-b-4 border-[#292524] rounded-b-[160px] overflow-hidden shadow-2xl">
          
          {/* Iron Texture Overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-20 mix-blend-overlay" />

          {/* LIQUID LAYER */}
          <motion.div
            initial={{ height: '0%' }}
            animate={{ height: isBrewing ? '95%' : `${liquidHeight}%` }}
            className={`absolute bottom-0 w-full transition-all duration-700 opacity-90 bg-gradient-to-t ${isBrewing ? brewingColor : baseColor}`}
          >
             {isBrewing && <div className="absolute inset-0 w-full h-full opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />}
             {/* Surface Glint */}
             <div className="absolute top-0 w-full h-4 bg-white/5 blur-md transform scale-x-90" />
          </motion.div>
          
          {/* INGREDIENTS FLOATING */}
          <div className="absolute inset-0 flex flex-col-reverse items-center justify-start pb-10 gap-2 z-10">
            <AnimatePresence>
              {selectedIngredients.map((ing, i) => (
                <motion.div
                  key={ing.id || `${ing.name}-${i}`}
                  initial={{ y: -100, opacity: 0, scale: 0.5 }}
                  animate={isBrewing ? { y: 50, scale: 0, rotate: 360, opacity: 0 } : { y: 0, opacity: 1, scale: 1, rotate: Math.random() * 60 - 30 }}
                  exit={{ y: 50, opacity: 0, scale: 0 }}
                  transition={isBrewing ? { duration: 1 } : {}}
                  className="relative text-4xl drop-shadow-2xl filter brightness-110 cursor-pointer group"
                >
                  {ing.icon}
                  {/* Crush Button Logic matches previous */}
                  {!ing.isProcessed && ing.processed && !isBrewing && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        <button
                            onClick={(e) => { e.stopPropagation(); onProcess(ing.id); }}
                            className="bg-[#292524] text-amber-100 text-[9px] font-black tracking-widest px-2 py-1 rounded border border-amber-900/50 hover:bg-amber-900 whitespace-nowrap"
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
        
        {/* Whispers Container */}
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

      {/* BREW BUTTON */}
      <button
        onClick={handleSafeBrew}
        disabled={selectedIngredients.length < 2 || isBrewing}
        className={`
            relative z-30 w-full max-w-xs py-5 
            font-serif font-black text-lg uppercase tracking-[0.25em] rounded-sm border-2 
            shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all 
            active:translate-y-1 active:shadow-none flex items-center justify-center gap-3
            ${isBrewing 
                ? 'bg-[#1c1917] border-[#44403c] text-[#57534e] cursor-wait' 
                : 'bg-gradient-to-b from-[#78350f] to-[#451a03] border-[#92400e] text-amber-100 hover:from-[#92400e] hover:to-[#78350f] hover:border-amber-500 hover:shadow-amber-900/20'
            }
        `}
      >
        {isBrewing ? <><Loader size={20} className="animate-spin" /><span>Distilling...</span></> : <span className="drop-shadow-md">Ignite & Brew</span>}
      </button>
    </div>
  );
};
const Workbench = ({ selectedIngredients, onIngredientSelect, theme }) => {
  // If no theme passed, fallback to default (safety)
  const hudStyle = theme ? theme.hud : 'bg-slate-900 border-slate-700';
  const textMain = theme ? theme.textMain : 'text-slate-200';

  return (
    <div className={`w-full h-32 relative px-4 flex items-center border-t backdrop-blur-md ${hudStyle}`}>
      
      {/* Texture: Optional "Wood Grain" opacity */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" 
           style={{ backgroundImage: 'linear-gradient(to right, #451a03 1px, transparent 1px)', backgroundSize: '40px 100%' }} 
      />
      
      <div className="flex gap-2 overflow-x-auto overflow-y-hidden w-full h-full items-center pb-2 px-2 custom-scrollbar-horizontal relative z-10">
        {INGREDIENTS.map((ing) => {
          const count = selectedIngredients.filter(i => i.name === ing.name).length;
          const isSelected = count > 0;

          return (
            <motion.button
              key={ing.name}
              onClick={() => onIngredientSelect(ing)}
              whileTap={{ scale: 0.95 }}
              className={`
                group relative shrink-0 w-32 h-24 flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200
                ${isSelected 
                    ? 'bg-amber-900/60 border-amber-500 shadow-lg' 
                    : 'bg-black/40 border-amber-900/20 hover:bg-amber-900/20 hover:border-amber-700/50'
                }
              `}
            >
              {count > 0 && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center rounded shadow-sm">
                  {count}
                </div>
              )}
              <div className={`text-3xl mb-2 transition-transform ${isSelected ? 'scale-110 text-amber-100' : 'text-amber-700 group-hover:text-amber-400'}`}>
                {ing.icon}
              </div>
              <div className={`text-[10px] uppercase font-bold tracking-wider truncate max-w-full ${isSelected ? 'text-amber-100' : 'text-amber-900/60 group-hover:text-amber-500'}`}>
                {ing.name}
              </div>
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
  const isWatched = watchFocus === activeDistrict;
  
  // COLORS UPDATED:
  // Red: Deep Lantern Red (Alert)
  // Orange: Smoldering Coal (Suspicion)
  // Blue: Desaturated Moonlight (Safe) - Less "Electric Blue", more "Night Sky"
  const glowColor = isWatched 
    ? 'shadow-[0_0_100px_rgba(153,27,27,0.5)] bg-red-950/30' 
    : heat > 50 
      ? 'shadow-[0_0_80px_rgba(194,65,12,0.3)] bg-orange-950/20'
      : 'shadow-[0_0_60px_rgba(71,85,105,0.3)] bg-[#0f172a]/60';

  return (
    <div className="w-full flex flex-col gap-4 p-4 opacity-90 pointer-events-none select-none transition-all duration-1000 items-center">
       
       {/* THE WINDOW FRAME */}
       {/* Changed border from slate-900 to #292524 (Warm Iron/Stone) */}
       <div className={`relative w-full aspect-square max-w-[280px] border-8 border-[#292524] bg-black overflow-hidden rounded-t-full transition-all duration-1000 ${glowColor}`}>
          
          {/* 1. Texture Overlay (Dirty Glass) */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10 z-10 mix-blend-overlay" />
          
          {/* 2. THE GUARD (Silhouette) */}
          <AnimatePresence>
            {isWatched && (
               <motion.img 
                 src={`https://api.dicebear.com/9.x/adventurer/svg?seed=CityWatchPatrol&flip=true&backgroundColor=transparent`}
                 alt="Patrol Shadow"
                 initial={{ opacity: 0, x: 50, scale: 0.9 }}
                 animate={{ opacity: 0.8, x: 0, scale: 1.1 }}
                 exit={{ opacity: 0, x: 50, scale: 0.9 }}
                 transition={{ duration: 2, ease: "easeInOut" }}
                 className="absolute -bottom-6 -right-6 w-56 h-56 object-cover filter brightness-0 blur-[2px] grayscale z-0"
               />
            )}
          </AnimatePresence>

          {/* 3. THE BARS (Cast Iron) */}
          {/* Changed from slate-900 to #0c0a09 (Obsidian/Black Iron) */}
          <div className="absolute inset-0 flex z-20">
             <div className="flex-1 border-r-4 border-[#0c0a09]"></div>
             <div className="flex-1 border-r-4 border-[#0c0a09]"></div>
             <div className="flex-1"></div>
          </div>
          <div className="absolute inset-0 flex flex-col z-20">
             <div className="flex-1 border-b-4 border-[#0c0a09]"></div>
             <div className="flex-1"></div>
          </div>
       </div>
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
    if(onInteract) onInteract();
    setTimeout(() => setIsGrinding(false), 500);
  };

  return (
    <div 
      onClick={handleClick}
      className="relative w-32 h-24 flex items-center justify-center group cursor-pointer transition-transform active:scale-95"
    >
       {/* PESTLE (The Stick) */}
       {/* We animate this grinding in a circle */}
       <motion.div 
         animate={isGrinding ? { 
            x: [0, 15, 0, -15, 0], 
            y: [0, 5, 10, 5, 0],
            rotate: [0, 10, 0, -10, 0] 
         } : {}}
         transition={{ duration: 0.5, ease: "linear" }}
         className="absolute z-20 -top-6 right-2 origin-bottom-left pointer-events-none drop-shadow-2xl"
       >
         {/* Using a rotated bone or stick emoji acts as a decent pestle for now, 
             or we can use a CSS shape. Let's stick to a simple rod shape for realism. */}
         <div className="w-4 h-24 bg-[#57534e] border-2 border-[#292524] rounded-full shadow-xl rotate-[25deg]" />
       </motion.div>

       {/* THE BOWL (Stone Texture) */}
       <div className="absolute bottom-0 w-28 h-20 bg-[#1c1917] rounded-b-[4rem] rounded-t-[1rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b-4 border-r-4 border-[#0c0a09] overflow-hidden group-hover:brightness-110 transition-all">
          
          {/* Rim / Interior */}
          <div className="absolute top-0 left-0 w-full h-8 bg-[#0c0a09]/80 rounded-[50%] shadow-inner border-b border-[#292524]/30" />
          
          {/* Highlight on the stone */}
          <div className="absolute top-4 left-4 w-12 h-12 bg-white/5 rounded-full blur-xl" />
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
// NEW: Theme State (Defaulting to Grimoire)
  const [currentThemeId, setCurrentThemeId] = useState('grimoire');
  const theme = THEMES[currentThemeId];
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

 // --- UPDATED MAIN RENDER ---
  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textMain} ${theme.font} selection:bg-amber-900 selection:text-white overflow-hidden flex flex-col`}>
      
      {/* 1. Scale Container */}
      <div className="flex-1 flex flex-col" style={{ transform: `scale(${uiScale / 100})`, transformOrigin: 'top center', filter: `brightness(${gamma})` }}>
        
        {/* 2. Top Navigation (Themed) */}
        <div className={`h-16 border-b ${theme.nav} flex items-center justify-between px-8 shrink-0 z-40 relative backdrop-blur-md`}>
          <div className="flex items-center gap-6">
            <div className={`flex items-center gap-2 ${theme.textMain}`}><Coins size={18} /> <span className="text-xl font-bold font-mono">{gold}</span></div>
            <div className={`flex items-center gap-2 ${theme.textSec}`}><Shield size={18} /> <span className="text-xl font-bold font-mono">{reputation}</span></div>
            <div className={`w-px h-6 bg-current opacity-20 mx-2`} />
            <div className={`text-sm tracking-widest uppercase opacity-60`}>Day {day} • {customersServed}/5</div>
          </div>
          
          <div className="flex gap-2 items-center">
            {/* Map Button (Custom styling to match theme) */}
            <button onClick={() => setShowMap(true)} className={`relative p-2 rounded-md shadow-lg flex items-center gap-2 transition-all mr-2 overflow-hidden border ${watchFocus === activeDistrict ? 'bg-red-950/80 border-red-500 text-red-200 animate-pulse' : `${theme.nav} hover:text-amber-200`}`}>
                {watchFocus === activeDistrict ? <Siren size={20} className="animate-spin" /> : <MapIcon size={20} />}
                <span className="text-xs uppercase font-bold tracking-widest hidden md:inline">{watchFocus === activeDistrict ? "PATROL ALERT" : "City Map"}</span>
            </button>
            
            {apprentice.hired && apprentice.activeAbility?.type === 'consult' && (
              <Button onClick={handleConsultApprentice} disabled={consultUsed} size="sm" className={`mr-2 ${consultUsed ? 'bg-stone-800 text-stone-500' : 'bg-amber-900 hover:bg-amber-800 text-amber-100'} border border-amber-700/50`}>
                <Search className="w-4 h-4 mr-2" /> {consultUsed ? 'Consulted' : 'Ask Apprentice'}
              </Button>
            )}
            
            <Button onClick={() => { soundEngine.playClick(vol); setIsBlackBookOpen(true); }} variant="ghost" className={theme.button}><BookOpen size={20} /></Button>
            <Button onClick={() => { soundEngine.playClick(vol); setSettingsOpen(true); }} variant="ghost" className={theme.button}><Settings size={20} /></Button>
          </div>
        </div>

        {/* 3. Game Content Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
            
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0 bg-black">
                <img src={alcBg} alt="Alchemist Alley" className="w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/80" />
                <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black to-transparent" />
                <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black/80 to-transparent" />
            </div>

            <AnimatePresence mode='wait'>
                {phase === 'day' ? (
                    <motion.div 
                        key="day-phase" 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                        className="relative z-10 flex-1 flex flex-col"
                    >
                        {/* A. The Stage */}
                        <div className="flex-1 grid grid-cols-12 px-8 min-h-0 items-end">
                            
                            {/* LEFT COL: Customer */}
                            <div className="col-span-3 flex flex-col justify-center h-full pb-12 z-20 border-r border-black/40 shadow-[10px_0_20px_rgba(0,0,0,0.5)] pr-8">
                                <AnimatePresence mode='wait'>
                                    {currentCustomer && (
                                        <motion.div 
                                            key={currentCustomer.id} 
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
                                                isInspecting={isInspecting} 
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* CENTER COL: The Desk */}
                            <div className="col-span-6 flex flex-col justify-end items-center relative h-full">
                                {/* Table Edge Shadow */}
                                <div className="absolute bottom-0 left-[-20px] right-[-20px] h-16 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-0" />

                                <div className="absolute bottom-1 left-4 z-40">
                                    <Lens onInspect={setIsInspecting} isInspecting={isInspecting} />
                                </div>
                                <div className="absolute bottom-1 right-4 z-40">
                                    <Mortar onInteract={handleMortarClick} />
                                </div>
                                <div className="w-full max-w-xl z-10 mb-1">
                                    <Cauldron 
                                        selectedIngredients={selectedIngredients} 
                                        onBrew={handleBrew} 
                                        onClear={handleClearSelection} 
                                        whisperQueue={whisperQueue} 
                                        onProcess={handleProcessIngredient} 
                                    />
                                </div>
                            </div>

                            {/* RIGHT COL: Results */}
                            <div className="col-span-3 flex flex-col justify-start pt-12 h-full z-10 pl-4">
                                    <ShopAtmosphere 
                                        heat={heat} 
                                        watchFocus={watchFocus} 
                                        activeDistrict={activeDistrict} 
                                    />
                                    <div className="flex-1 flex items-start justify-center mt-8">
                                        <AnimatePresence mode='wait'>
                                            {gameMessage && <CinematicAnnouncement text={gameMessage} type={messageType} />}
                                        </AnimatePresence>
                                    </div>
                            </div>
                        </div>

                        {/* B. The HUD (Workbench) - THEMED */}
                        <div className="shrink-0 z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] relative">
                            {/* We pass the theme object to the workbench */}
                            <Workbench 
                                selectedIngredients={selectedIngredients} 
                                onIngredientSelect={handleIngredientSelect} 
                                theme={theme}
                            />
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
      <SettingsMenu isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onReset={handleHardReset} currentVolume={audioVolume} onVolumeChange={handleVolumeChange} currentScale={uiScale} onScaleChange={handleScaleChange} currentGamma={gamma} onGammaChange={handleGammaChange} currentThemeId={currentThemeId}        // <--- Add this
  onThemeChange={setCurrentThemeId}      // <--- Add this
  availableThemes={THEMES} />
      
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