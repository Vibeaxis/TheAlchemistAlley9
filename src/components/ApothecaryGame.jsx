import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, BookOpen, Search, Settings,
  Shield, Crown, Coins, Skull, Ghost,
  FlaskConical, Flame, Trash2, Loader, Map as MapIcon, X, Siren, ShieldAlert, CheckCircle
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
import { generateCustomer, calculateOutcome, tagCombination, INGREDIENTS, UPGRADES_LIST, APPRENTICE_MISSIONS } from '@/lib/gameLogic';
import { initAudioContext, soundEngine } from '@/lib/SoundEngine';
import alcBg from '../assets/alc_bg.jpg';
// 1. IMPORT
import ReputationExchange from '@/components/ReputationExchange';
import WorldCalendar from '@/components/WorldCalendar';






import { generateRival, resolveRivalAction, RIVAL_ENCOUNTERS } from '@/lib/RivalSystem';
import RivalCard from '@/components/RivalCard';
import { SaveManager } from '@/lib/SaveManager';




// ==========================================
// 1. INLINE VISUAL COMPONENTS (FIXED)
// ==========================================
const THEMES = {
  // 1. DEFAULT (Legacy/Tech)
  'default': {
    id: 'default',
    label: 'Standard Issue',
    font: 'font-sans',
    bg: 'bg-slate-950',
    nav: 'bg-slate-900/90 border-slate-800',
    hud: 'bg-slate-900 border-slate-700',
    textMain: 'text-blue-400',
    textSec: 'text-slate-500',
    accent: 'border-slate-700',
    button: 'hover:bg-slate-800 text-slate-400 hover:text-white',
    overlay: 'from-slate-950 via-slate-900/50 to-transparent' // Cool Blue Tint
  },

  // 2. GRIMOIRE (The Main Vibe - Warm/Gold)
  'grimoire': {
    id: 'grimoire',
    label: 'Grand Grimoire',
    font: 'font-serif',
    bg: 'bg-[#0c0a09]', // Warm Stone Black
    nav: 'bg-[#1c1917]/95 border-amber-900/30', // Dark Wood
    hud: 'bg-[#1c1917] border-amber-900/30', 
    textMain: 'text-amber-500', // Gold
    textSec: 'text-amber-800', // Bronze
    accent: 'border-amber-900/30',
    button: 'hover:bg-amber-900/20 text-amber-700 hover:text-amber-500',
    overlay: 'from-[#1c1917] via-[#292524]/50 to-transparent' // Warm Brown Tint
  },

  // 3. VERDANT (Witch of the Woods - Green/Toxic)
  'verdant': {
    id: 'verdant',
    label: 'Swamp Witch',
    font: 'font-serif',
    bg: 'bg-[#022c22]', // Deep Emerald Black
    nav: 'bg-[#064e3b]/90 border-emerald-800/50', // Mossy Green
    hud: 'bg-[#064e3b] border-emerald-900',
    textMain: 'text-emerald-400', // Glowing Green
    textSec: 'text-emerald-800', // Dark Green
    accent: 'border-emerald-800/30',
    button: 'hover:bg-emerald-900/30 text-emerald-700 hover:text-emerald-300',
    overlay: 'from-[#022c22] via-[#064e3b]/40 to-transparent' // Toxic Green Tint
  },

  // 4. VOID (Cosmic/High Magic - Purple/Starlight)
  'void': {
    id: 'void',
    label: 'Astral Plane',
    font: 'font-sans tracking-wide',
    bg: 'bg-[#0f172a]', // Deep Space Blue
    nav: 'bg-[#1e1b4b]/90 border-indigo-500/20', // Deep Indigo
    hud: 'bg-[#1e1b4b] border-indigo-500/20',
    textMain: 'text-purple-300', // Starlight Purple
    textSec: 'text-indigo-400',
    accent: 'border-purple-500/20',
    button: 'hover:bg-indigo-900/50 text-indigo-300 hover:text-white',
    overlay: 'from-[#0f172a] via-[#1e1b4b]/50 to-transparent' // Deep Space Tint
  },

  // 5. SYNTH (Cyberpunk Alchemist - Pink/Black/Mono)
  'synth': {
    id: 'synth',
    label: 'Neon Runner',
    font: 'font-mono',
    bg: 'bg-black',
    nav: 'bg-zinc-950/95 border-pink-500/50',
    hud: 'bg-zinc-950 border-pink-500/50',
    textMain: 'text-pink-500', // Hot Pink
    textSec: 'text-zinc-500',
    accent: 'border-pink-500',
    button: 'hover:bg-pink-900/20 text-pink-700 hover:text-pink-400',
    overlay: 'from-black via-pink-900/10 to-transparent' // Subtle Neon Tint
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
// --- SAFE ICON HELPER (Add this above CustomerCard) ---
const SafeIcon = ({ icon, className, size, strokeWidth }) => {
    // 1. If it's a valid React Component (function), render it
    if (typeof icon === 'function') {
        const IconComp = icon;
        return <IconComp size={size} strokeWidth={strokeWidth} className={className} />;
    }
    // 2. If it's a React Element (already <Icon />), clone it
    if (React.isValidElement(icon)) {
        return React.cloneElement(icon, { size, strokeWidth, className });
    }
    // 3. Fallback
    return <Ghost size={size} strokeWidth={strokeWidth} className={className} />;
};
// --- UPDATED CUSTOMER CARD (Safe + Visual FX) ---
// --- UPDATED CUSTOMER CARD (Fixed Feedback Positioning) ---
const CustomerCard = ({ customer, observationHint, onMouseEnter, onMouseLeave, revealedTags, isInspecting, theme, feedbackState }) => {
  const [hasRevealed, setHasRevealed] = useState(false);
  
  useEffect(() => { if (isInspecting) setHasRevealed(true); }, [isInspecting]);
  useEffect(() => { setHasRevealed(false); }, [customer.id]);

  const t = theme || THEMES.grimoire;
  // Use safe icon renderer logic here if not passed as prop, but usually SafeIcon handles it in render
  const iconSource = customer.class.icon; 

  const districts = [ { name: 'The Dregs', color: 'text-emerald-500' }, { name: 'Market', color: 'text-amber-500' }, { name: 'Arcanum', color: 'text-purple-400' }, { name: 'Docks', color: 'text-cyan-600' }, { name: 'Cathedral', color: 'text-yellow-400' }, { name: 'Spire', color: 'text-rose-500' } ];
  const districtIndex = (customer.id.toString().charCodeAt(0) || 0) % districts.length;
  const origin = districts[districtIndex];

  // Animation Variants
  const avatarVariants = {
    idle: { y: 0, rotate: 0, scale: 1, filter: 'none' },
    cured: { 
        y: [0, -15, 0], 
        scale: [1, 1.1, 1],
        filter: 'brightness(1.2) contrast(1.1) drop-shadow(0 0 15px #fbbf24)', // Golden glow
        transition: { duration: 0.6 }
    },
    poisoned: { 
        x: [-5, 5, -5, 5, 0],
        filter: 'hue-rotate(90deg) contrast(1.2) drop-shadow(0 0 10px #84cc16)', // Greenish
        transition: { duration: 0.4 } 
    },
    exploded: { 
        x: [-10, 10, -10, 10, 0],
        scale: 0.9,
        filter: 'grayscale(100%) brightness(0.3) blur(1px)', // Soot
        transition: { duration: 0.3 }
    },
    failed: {
        rotate: [0, -5, 5, 0],
        filter: 'grayscale(80%) opacity(0.8)',
        transition: { duration: 0.5 }
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[460px] rounded-xl overflow-hidden shadow-2xl group transition-all duration-700 border-2 ${t.nav} ${hasRevealed ? 'shadow-[0_0_40px_rgba(0,0,0,0.3)] border-opacity-100 scale-[1.01]' : 'border-opacity-60'}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      
      {/* 1. Background */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-0 mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }} />
      
      {/* 2. Avatar & Feedback Container */}
      <div className="absolute top-4 left-0 right-0 h-[60%] flex items-center justify-center z-10">
         <div className="relative w-full h-full flex justify-center items-center">
            {/* Glow backing */}
            <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-40 h-40 bg-white/5 blur-3xl rounded-full pointer-events-none`} />
            
            {/* The Avatar */}
            <motion.img 
                src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${customer.id + customer.class.name}&backgroundColor=transparent`} 
                alt="Customer" 
                variants={avatarVariants}
                animate={feedbackState || 'idle'}
                className="h-[85%] w-auto object-contain drop-shadow-xl z-10"
            />

            {/* FEEDBACK OVERLAYS (Centered over head) */}
            <AnimatePresence>
                {feedbackState === 'poisoned' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="absolute top-[20%] left-1/2 -translate-x-1/2 z-20 flex gap-12 pointer-events-none"
                    >
                        <div className="text-5xl font-black text-red-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">X</div>
                        <div className="text-5xl font-black text-red-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">X</div>
                    </motion.div>
                )}
                
                {feedbackState === 'cured' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5, y: 0 }} animate={{ opacity: 1, scale: 1.2, y: -60 }} exit={{ opacity: 0 }}
                        className="absolute top-[10%] left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                    >
                        {/* Golden Sparkles */}
                        <div className="text-6xl filter drop-shadow-[0_0_10px_gold]">✨</div>
                    </motion.div>
                )}
                
                {feedbackState === 'failed' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 0, rotate: -10 }} animate={{ opacity: 1, y: -50, rotate: 10 }} exit={{ opacity: 0 }}
                        className="absolute top-[15%] left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                    >
                        {/* Grey Question Mark */}
                        <div className="text-7xl font-bold text-slate-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">?</div>
                    </motion.div>
                )}

                {feedbackState === 'exploded' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1.5 }} exit={{ opacity: 0 }}
                        className="absolute top-[25%] left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                    >
                        <div className="text-7xl">💥</div>
                    </motion.div>
                )}
            </AnimatePresence>
         </div>
      </div>

      {/* 3. Stamp */}
      <div className={`absolute top-4 right-4 flex flex-col items-end transition-all duration-1000 z-10 text-right ${hasRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className={`text-[9px] ${t.textSec} italic tracking-widest mb-0.5 bg-black/40 px-2 rounded-sm backdrop-blur-sm`}>Soul Echo</div>
        <div className={`text-sm font-bold uppercase tracking-widest drop-shadow-md ${origin.color} bg-black/60 px-2 rounded-sm backdrop-blur-md border border-white/10`}>{origin.name}</div>
      </div>

      {/* 4. Text Panel */}
      <div className={`absolute bottom-0 left-0 right-0 h-[45%] z-20 flex flex-col p-4 border-t ${t.accent} bg-gradient-to-t from-black via-black/95 to-transparent`}>
        <div className={`absolute inset-0 opacity-90 ${t.nav} -z-10`} />
        <div className={`relative z-30 flex-1 flex flex-col ${t.font}`}>
            <div className="w-full flex flex-col items-center -mt-8">
                <div className={`p-3 rounded-full border ${t.accent} ${t.nav} shadow-lg mb-2`}>
                    <SafeIcon icon={iconSource} size={24} className={t.textMain} />
                </div>
                <h2 className={`text-2xl font-bold ${t.textMain} leading-none tracking-wide drop-shadow-md`}>{customer.class.name}</h2>
                <p className={`${t.textSec} text-xs italic tracking-wider mt-1 opacity-80`}>"{customer.class.description}"</p>
            </div>
            <div className="flex-1 flex items-center justify-center py-2">
                <p className={`${t.textMain} text-base leading-relaxed italic text-center opacity-90 drop-shadow-sm`}>"{customer.symptom.text}"</p>
            </div>
            <div className="h-8 w-full flex items-end justify-center shrink-0">
                <AnimatePresence>
                {observationHint && hasRevealed && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full text-center">
                        <span className={`inline-block px-3 py-1 text-[9px] ${t.textMain} uppercase tracking-[0.2em] font-bold border-t border-b ${t.accent} bg-black/20`}>✦ {observationHint} ✦</span>
                    </motion.div>
                )}
                </AnimatePresence>
                {!hasRevealed && (
                    <div className="flex flex-col items-center gap-1 opacity-30 group-hover:opacity-60 transition-opacity">
                        <span className={`text-[8px] ${t.textSec} uppercase tracking-[0.25em]`}>Divinate Aura</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* 5. Tags */}
      {revealedTags && revealedTags.length > 0 && (
        <div className="absolute top-4 left-4 flex flex-col gap-1 items-start z-30 pointer-events-none">
          {revealedTags.map(t => (
            <span key={t} className={`text-[8px] ${t.textSec} font-bold tracking-widest border-b ${t.accent} pb-0.5 shadow-sm bg-black/60 px-2 py-0.5 rounded-sm backdrop-blur-md`}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
};
const Cauldron = ({ selectedIngredients, onBrew, onClear, whisperQueue, onProcess, isProcessing }) => {
  const [isBrewing, setIsBrewing] = useState(false);

  const handleSafeBrew = () => {
    if (isBrewing || isProcessing || selectedIngredients.length < 2) return;
    setIsBrewing(true);
    setTimeout(() => {
      onBrew();
      setIsBrewing(false);
    }, 1500);
  };

  const liquidHeight = Math.min((selectedIngredients.length / 3) * 80, 80);
  const isToxic = selectedIngredients.some(i => i.tags.includes('Toxic'));
  
  const baseColor = isToxic ? 'from-[#450a0a] via-[#7f1d1d] to-[#991b1b]' : 'from-[#0f172a] via-[#1e293b] to-[#334155]';
  const brewingColor = isToxic ? 'from-orange-700 via-red-600 to-amber-500' : 'from-emerald-800 via-teal-600 to-cyan-500';

  return (
    <div className="relative h-full flex flex-col items-center justify-end">
      {/* Clear Button */}
      <div className="w-full flex justify-end items-center mb-2 px-4 absolute top-0 left-0 z-30 h-8">
        {selectedIngredients.length > 0 && !isBrewing && !isProcessing && (
          <button onClick={onClear} className="text-[#57534e] hover:text-red-400 transition-colors p-2 hover:bg-[#292524] rounded-full">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Cauldron Body */}
      <motion.div 
        className="relative w-72 h-64 mb-6 z-10 group"
        animate={isBrewing ? { x: [-2, 2, -2, 2, 0], rotate: [0, -1, 1, 0] } : {}}
        transition={{ duration: 0.2, repeat: Infinity }}
      >
        <div className="absolute top-0 left-0 w-full h-10 bg-[#292524] border-4 border-[#44403c] rounded-[100%] z-20 shadow-2xl" />
        <div className="absolute top-5 left-2 right-2 bottom-0 bg-[#292524] border-x-4 border-b-4 border-[#44403c] rounded-b-[160px] overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/5 via-transparent to-black/40 pointer-events-none z-20" />
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-20 mix-blend-overlay" />
          
          <motion.div initial={{ height: '0%' }} animate={{ height: isBrewing ? '95%' : `${liquidHeight}%` }} className={`absolute bottom-0 w-full transition-all duration-700 opacity-90 bg-gradient-to-t ${isBrewing ? brewingColor : baseColor}`}>
             {isBrewing && <div className="absolute inset-0 w-full h-full opacity-50 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse" />}
             <div className="absolute top-0 w-full h-4 bg-white/5 blur-md transform scale-x-90" />
          </motion.div>
          
          <div className="absolute inset-0 flex flex-col-reverse items-center justify-start pb-10 gap-2 z-10">
            <AnimatePresence>
              {selectedIngredients.map((ing, i) => {
                 // --- SAFE ICON RENDERER ---
                 const renderIcon = () => {
                    if (!ing.icon) return null;
                    if (typeof ing.icon === 'string') return ing.icon;
                    if (typeof ing.icon === 'function') {
                        const IconComp = ing.icon;
                        return <IconComp size={32} />;
                    }
                    return ing.icon;
                 };

                 return (
                    <motion.div
                      key={ing.id || `${ing.name}-${i}`}
                      initial={{ y: -100, opacity: 0, scale: 0.5 }}
                      animate={isBrewing ? { y: 50, scale: 0, rotate: 360, opacity: 0 } : { y: 0, opacity: 1, scale: 1, rotate: Math.random() * 60 - 30 }}
                      exit={{ y: 50, opacity: 0, scale: 0 }}
                      transition={isBrewing ? { duration: 1 } : {}}
                      className="relative text-4xl drop-shadow-2xl filter brightness-110 cursor-pointer group"
                    >
                      {renderIcon()}
                      
                      {!ing.isProcessed && ing.processed && !isBrewing && !isProcessing && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                            <button onClick={(e) => { e.stopPropagation(); onProcess(ing.id); }} className="bg-[#292524] text-amber-100 text-[9px] font-black tracking-widest px-2 py-1 rounded border border-amber-900/50 hover:bg-amber-900 whitespace-nowrap">
                                CRUSH
                            </button>
                        </div>
                      )}
                    </motion.div>
                 );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <button onClick={handleSafeBrew} disabled={selectedIngredients.length < 2 || isBrewing || isProcessing} className={`relative z-30 w-full max-w-xs py-5 font-serif font-black text-lg uppercase tracking-[0.25em] rounded-sm border-2 shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-3 ${isBrewing || isProcessing ? 'bg-[#1c1917] border-[#44403c] text-[#57534e] cursor-wait' : 'bg-gradient-to-b from-[#78350f] to-[#451a03] border-[#92400e] text-amber-100 hover:from-[#92400e] hover:to-[#78350f] hover:border-amber-500 hover:shadow-amber-900/20'}`}>
        {isBrewing ? <><Loader size={20} className="animate-spin" /><span>Distilling...</span></> : <span className="drop-shadow-md">Ignite & Brew</span>}
      </button>
    </div>
  );
};

const Workbench = ({ selectedIngredients, onIngredientSelect, theme, inventory }) => {
  const hudStyle = theme ? theme.hud : 'bg-slate-900 border-slate-700';
  const countInCauldron = (ingName) => selectedIngredients.filter(i => i.name === ingName).length;

  return (
    <div className={`w-full h-32 relative px-4 flex items-center border-t shadow-[0_-5px_20px_rgba(0,0,0,0.3)] z-50 ${hudStyle}`}>
      {/* Texture */}
      <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-soft-light" 
           style={{ backgroundImage: 'linear-gradient(to right, #78350f 1px, transparent 1px)', backgroundSize: '40px 100%' }} 
      />
      
      <div className="flex gap-2 overflow-x-auto overflow-y-hidden w-full h-full items-center pb-2 px-2 custom-scrollbar-horizontal relative z-10">
        {INGREDIENTS.map((ing) => {
          const cauldronCount = countInCauldron(ing.name);
          // Safety check: if inventory is missing, assume infinite (basics) or 0 (finite)
          const ownedCount = inventory ? (inventory[ing.name] !== undefined ? inventory[ing.name] : (ing.finite ? 0 : 999)) : 999;
          const remainingStock = ing.finite ? ownedCount - cauldronCount : 999;
          const isDisabled = remainingStock <= 0;

          // --- ICON RENDERER ---
          // This prevents the "Illegal Constructor" crash
          const renderIcon = () => {
             if (!ing.icon) return null;
             // If it's a string (Emoji), render as text
             if (typeof ing.icon === 'string') return ing.icon;
             // If it's a Component function (Lucide), render as Element
             if (typeof ing.icon === 'function') {
                 const IconComp = ing.icon;
                 return <IconComp size={32} />;
             }
             // If it's already an Element, return it
             return ing.icon;
          };

          return (
            <motion.button
              key={ing.name}
              onClick={() => !isDisabled && onIngredientSelect(ing)}
              disabled={isDisabled}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              whileHover={!isDisabled ? { scale: 1.05, y: -2 } : {}}
              className={`
                group relative shrink-0 w-24 h-24 flex flex-col items-center justify-center p-2 rounded-lg border transition-all duration-200
                ${isDisabled 
                    ? 'bg-black/40 border-white/5 opacity-50 grayscale cursor-not-allowed' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }
                ${countInCauldron(ing.name) > 0 ? 'border-amber-500/50 bg-amber-900/20' : ''}
              `}
            >
              {/* Count Badge */}
              {ing.finite && !isDisabled && (
                  <div className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/50 text-emerald-400 border border-emerald-900/50 shadow-sm z-20">
                      {remainingStock}
                  </div>
              )}

              {/* Icon Container */}
              <div className={`text-3xl mb-2 transition-all filter drop-shadow-lg ${isDisabled ? 'blur-[1px] opacity-30' : ''}`}>
                {renderIcon()}
              </div>

              <div className={`text-[9px] uppercase font-bold tracking-wider truncate max-w-full ${isDisabled ? 'text-stone-600' : 'text-stone-400 group-hover:text-stone-200'}`}>
                {ing.name}
              </div>

              {/* Dots */}
              {!isDisabled && (
                <div className="flex gap-1 mt-1 opacity-50">
                    {ing.tags.slice(0, 2).map((tag, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${tag === 'Toxic' ? 'bg-green-500' : tag === 'Hot' ? 'bg-red-500' : 'bg-slate-400'}`} />
                    ))}
                </div>
              )}
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
  const [rival, setRival] = useState(null);
  const [activeEncounter, setActiveEncounter] = useState(null); // If this is not null, the modal shows
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
const [feedbackState, setFeedbackState] = useState(null); // Add this line
  const [heat, setHeat] = useState(0);
  const [watchFocus, setWatchFocus] = useState('market'); 
  const [activeDistrict, setActiveDistrict] = useState('dregs');
const [isProcessing, setIsProcessing] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [gameMessage, setGameMessage] = useState('');
  const [messageType, setMessageType] = useState('normal');
  const [whisperQueue, setWhisperQueue] = useState([]);
  const [observationHint, setObservationHint] = useState(null);
// NEW: Theme State (Defaulting to Grimoire)
  const [currentThemeId, setCurrentThemeId] = useState('grimoire');
  const theme = THEMES[currentThemeId];
  // Tracks the result of the night's mission to show in the morning
const [missionReport, setMissionReport] = useState(null);




// 2. STATE
const [isRepModalOpen, setIsRepModalOpen] = useState(false);
const [isCalendarOpen, setIsCalendarOpen] = useState(false);
const [activeBuffs, setActiveBuffs] = useState({}); // Stores temp buffs like 'marketing'

// 3. HELPER FOR BUFFS
const addBuff = (id, duration) => {
    setActiveBuffs(prev => ({ ...prev, [id]: duration }));
};



  // --- Effects & Handlers ---
  useEffect(() => {
    const savedVol = localStorage.getItem('alchemistAudioVolume');
    if (savedVol !== null) setAudioVolume(parseInt(savedVol));
    const savedScale = localStorage.getItem('alchemistUIScale');
    if (savedScale !== null) setUiScale(parseInt(savedScale));
    const savedGamma = localStorage.getItem('alchemistGamma');
    if (savedGamma !== null) setGamma(parseFloat(savedGamma));
  }, []);
// --- ADD THIS MISSING STATE ---
  const [inventory, setInventory] = useState(() => {
    const initial = {};
    INGREDIENTS.forEach(ing => {
      // If it's finite (Rare), start with 0. 
      // If it's basic (Salt, Sage), start with 999 (Infinite).
      if (ing.finite) {
        initial[ing.name] = 0; 
      } else {
        initial[ing.name] = 999; 
      }
    });
    // Optional: Give them a free sample of Mercury to start
    initial['Mercury'] = 1; 
    return initial;
  });
const handleAssignMission = (mission) => {
    if (gold < mission.cost) {
        soundEngine.playFail(vol);
        return;
    }
    
    soundEngine.playTransaction(vol);
    setGold(prev => prev - mission.cost);
    
    setApprentice(prev => ({
        ...prev,
        status: 'on_mission',
        currentMissionId: mission.id,
        daysRemaining: mission.duration
    }));
};
  // --- ADD THIS BUY HANDLER (Passed to TavernHub) ---
  const handleBuyReagent = (ingredient) => {
    if (gold >= ingredient.cost) {
        soundEngine.playTransaction(); // Ensure you have this sound or remove this line
        setGold(prev => prev - ingredient.cost);
        setInventory(prev => ({
            ...prev,
            [ingredient.name]: (prev[ingredient.name] || 0) + 1
        }));
    } else {
        soundEngine.playFail(); // Optional fail sound
    }
  };
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
// --- DEATH WATCHER ---
  useEffect(() => {
    // If we are playing and reputation hits 0, trigger Game Over state
    if (phase !== 'TITLE' && reputation <= 0 && gameState !== 'GAMEOVER') {
        soundEngine.playFail(vol);
        setGameState('GAMEOVER');
    }
  }, [reputation, phase, gameState, vol]);
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
// ==========================================
  //  REAL SAVE SYSTEM INTEGRATION
  // ==========================================

  // 1. GATHER STATE & SAVE
  // This grabs all your diverse state variables and bundles them for the manager.
  const handleSaveGame = () => {
    const currentState = {
      // Core Stats
      day,
      gold,
      reputation,
      heat,
      
      // Complex Objects
      inventory,
      upgrades,
      apprentice,
      rival: rival || null, // Ensure null if undefined
      
      // Progress & Settings
      discoveredIngredients,
      brewHistory,
      gameStats,
      // --- NEW: SAVE DAILY PROGRESS ---
      dailyProgress: customersServed, // Saves the "2/5" count
      activeCustomer: currentCustomer, // Saves the guy currently staring at you
      // Settings (CAREFUL: We save IDs/Numbers, not React Objects)
      themeId: theme.id, // <--- This fixes your "currentTheme" crash
      audioVolume,       // <--- Ensure this matches your state name (vol vs audioVolume)
      uiScale,
      gamma
    };

    const success = SaveManager.save(currentState);
    if (success) {
        setGameMessage("Game Saved");
        setTimeout(() => setGameMessage(''), 2000);
    }
  };

  // 2. LOAD STATE & RESTORE
  // This takes the bundle and puts it back into React State.
  const handleLoadGame = () => {
    const data = SaveManager.load();
    
    if (!data) {
        console.log("No save file found.");
        return;
    }

    try {
        console.log("Restoring Save Data...", data);
        
        // --- RESTORE CORE ---
        setDay(data.day || 1);
        setGold(data.gold ?? 100);
        setReputation(data.reputation ?? 20);
        setHeat(data.heat || 0);

        // --- RESTORE OBJECTS (With Fallbacks) ---
        setInventory(data.inventory || { Salt: 3, Sage: 2 });
        setUpgrades(data.upgrades || { reinforced: false, ventilation: false, merchant: false, mercury: false });
        setApprentice(data.apprentice || { hired: false });
        setRival(data.rival || null);
        setDiscoveredIngredients(data.discoveredIngredients || {});
        setBrewHistory(data.brewHistory || []);
        setGameStats(data.gameStats || { daysCount: 0, totalGold: 0, customersServed: 0 });
setCustomersServed(data.dailyProgress || 0); // Restore 2/5
// Restore the specific customer, or generate a new one if missing
        if (data.activeCustomer) {
            setCurrentCustomer(data.activeCustomer);
        } else {
            setCurrentCustomer(generateCustomer(data.day || 1));
        }
        // --- RESTORE SETTINGS ---
        // Theme: We saved the ID string, now we look up the Object
        if (data.themeId && THEMES[data.themeId]) {
            setTheme(THEMES[data.themeId]);
        }
        
        if (typeof data.audioVolume === 'number') setAudioVolume(data.audioVolume);
        if (data.uiScale) setUiScale(data.uiScale);
        if (data.gamma) setGamma(data.gamma);

        // --- RESET UI STATES ---
        setPhase('day');
        setCurrentCustomer(generateCustomer(data.day || 1));
        
        setGameMessage("Game Loaded");
        setTimeout(() => setGameMessage(''), 2000);

    } catch (err) {
        console.error("Error restoring state:", err);
        setGameMessage("Load Error");
    }
  };

  // 3. NUCLEAR RESET
  const handleHardReset = () => {
    SaveManager.clear();
    soundEngine.playFail(audioVolume / 100);
    window.location.reload(); // Force refresh to clear memory
  };

  // 4. AUTO-LOAD ON STARTUP
  useEffect(() => {
    if (SaveManager.hasSave()) {
        handleLoadGame();
    }
  }, []); // Empty dependency array = runs once on mount

  // 5. AUTO-SAVE ON NEW DAY
  // Add this to your `advanceDay` function manually:
  // SaveManager.save({ ... all the state ... }); 
  // OR just trigger the handler:
  useEffect(() => {
    if (day > 1) { // Don't auto-save on immediate first render
        handleSaveGame();
    }
  }, [day]);



// HELPER: Advances the game state to the next day.
// Called immediately by handleRest() if no rival appears, 
// OR called by handleEncounterResolve() after the player deals with the rival.
const advanceDay = () => {
    const nextDay = day + 1;
    
    setDay(nextDay);
    setGameStats(prev => ({ ...prev, daysCount: prev.daysCount + 1 }));
    setPhase('day');
    setCustomersServed(0);
    setHeat(h => Math.max(0, h - 10)); // Natural heat decay
    
    // Generate new customer (Respecting progression with nextDay)
    setCurrentCustomer(generateCustomer(nextDay)); 
    
    setConsultUsed(false);
    setRevealedCustomerTags([]);
    setWhisperQueue([]);
    setSelectedIngredients([]); // Clear workbench
    setGameMessage(`Day ${nextDay} Begins`);
    
    // Randomize Watch Focus for the new day
    const districts = ['dregs', 'market', 'arcanum', 'docks', 'cathedral', 'spire'];
    setWatchFocus(districts[Math.floor(Math.random() * districts.length)]);
    
    setTimeout(() => setGameMessage(''), 3000);
    // AUTO SAVE
    setTimeout(() => {
        saveGame();
    }, 100); // Small delay to ensure state updates settle (though mostly redundant with hooks, safer here)
};



const handleRest = () => {
    soundEngine.playClick(vol);
    
    // --- PART 1: RESOLVE COVERT MISSIONS (Apprentice) ---
    let report = null;
    
    // Scenario A: Apprentice is out on a mission
    if (apprentice.hired && apprentice.status === 'on_mission') {
        const mission = APPRENTICE_MISSIONS.find(m => m.id === apprentice.currentMissionId);
        
        if (mission) {
            const roll = Math.random();
            // Success Check (Roll must be higher than Risk)
            const isSuccess = roll > mission.risk;
            // Crit Check (Top 5% of rolls)
            const isCrit = roll > 0.95; 
            // Injury Check (If failed, did they fail badly? Bottom 50% of risk range)
            const isInjury = !isSuccess && roll < (mission.risk / 2);

            if (isSuccess) {
                // -- SUCCESS --
                // 1. Calculate Gold
                const baseGold = Math.floor(Math.random() * (mission.rewards.maxGold - mission.rewards.minGold + 1)) + mission.rewards.minGold;
                const finalGold = isCrit ? baseGold * 2 : baseGold;
                if (finalGold > 0) setGold(g => g + finalGold);
                
                // 2. Calculate Loot (Ingredients)
                let lootList = [];
                if (mission.rewards.ingredients > 0) {
                    const qty = isCrit ? mission.rewards.ingredients + 1 : mission.rewards.ingredients;
                    // Filter ingredients by rarity (Rare missions give Finite items)
                    const pool = INGREDIENTS.filter(i => mission.rewards.rarity === 'rare' ? i.finite : !i.finite);
                    // Fallback if pool is empty
                    const actualPool = pool.length > 0 ? pool : INGREDIENTS;
                    
                    const newInventory = { ...inventory };
                    for(let i=0; i < qty; i++) {
                        const item = actualPool[Math.floor(Math.random() * actualPool.length)];
                        newInventory[item.name] = (newInventory[item.name] || 0) + 1;
                        lootList.push(item.name);
                    }
                    setInventory(newInventory);
                }

                // 3. Generate Report
                report = {
                    title: isCrit ? 'Critical Success!' : 'Mission Accomplished',
                    description: `${apprentice.npcName} returned safely from the ${mission.name} with spoils.`,
                    rewards: [
                        finalGold > 0 ? `${finalGold} Gold` : null,
                        ...lootList
                    ].filter(Boolean),
                    type: 'success'
                };
                
                // Reset Apprentice to Idle
                setApprentice(prev => ({ ...prev, status: 'idle', currentMissionId: null }));

            } else {
                // -- FAILURE --
                if (isInjury) {
                    // Severe Failure: Injured
                    report = {
                        title: 'Mission Failed - Injured',
                        description: `${apprentice.npcName} was ambushed during the ${mission.name}. They barely escaped and need time to recover.`,
                        rewards: [],
                        type: 'danger'
                    };
                    setApprentice(prev => ({ ...prev, status: 'injured', daysRemaining: 1, currentMissionId: null }));
                } else {
                    // Standard Failure: Empty Handed
                    report = {
                        title: 'Mission Failed',
                        description: `${apprentice.npcName} returned empty handed from the ${mission.name}, but unharmed.`,
                        rewards: [],
                        type: 'warning'
                    };
                    setApprentice(prev => ({ ...prev, status: 'idle', currentMissionId: null }));
                }
            }
        }
    } 
    // Scenario B: Apprentice is recovering from injury
    else if (apprentice.status === 'injured') {
        const remaining = (apprentice.daysRemaining || 1) - 1;
        if (remaining <= 0) {
            setApprentice(prev => ({ ...prev, status: 'idle', daysRemaining: 0 }));
            report = { 
                title: 'Recovered', 
                description: `${apprentice.npcName} is fit for duty again.`, 
                type: 'success', 
                rewards: [] 
            };
        } else {
            setApprentice(prev => ({ ...prev, daysRemaining: remaining }));
        }
    }

    // Save the report to trigger the modal (This is informational, doesn't block)
    if (report) setMissionReport(report);


    // --- PART 2: RIVAL INTRUSION CHECK (New Logic) ---
    // If a Rival intrudes, we DO NOT advance the day yet. We wait for the modal.
    let encounterTriggered = false;

    // 1. Spawn First Rival (Day 3+)
    if (!rival && day >= 3) {
        const newRival = generateRival(day);
        setRival(newRival);
        // Force the Intro Encounter
        setActiveEncounter({ rival: newRival, data: RIVAL_ENCOUNTERS[0] }); 
        encounterTriggered = true;
    } 
    // 2. Random Intrusion (30% chance if Rival exists)
    else if (rival && Math.random() > 0.7) { 
        const randomEnc = RIVAL_ENCOUNTERS[Math.floor(Math.random() * RIVAL_ENCOUNTERS.length)];
        setActiveEncounter({ rival: rival, data: randomEnc });
        encounterTriggered = true;
    }

    // --- PART 3: TRANSITION ---
    // Only advance the day immediately if NO rival encounter happened.
    // If an encounter happened, advanceDay() will be called by handleEncounterResolve()
    if (!encounterTriggered) {
        advanceDay();
    }
};




















 // 1. SELECTING (Clicking the Rack)
  const handleIngredientSelect = (ingredient) => {
    // Basic interaction sound
    soundEngine.playClick(vol);
    
    // Check if we are removing an existing item (Toggle behavior)
    const existingIndex = selectedIngredients.findIndex(i => i.name === ingredient.name);

    if (existingIndex !== -1) {
      // Remove it
      const newIngredients = [...selectedIngredients];
      newIngredients.splice(existingIndex, 1);
      setSelectedIngredients(newIngredients);
    } 
    // Add it (if under limit)
    else if (selectedIngredients.length < 3) {
      const newIng = { 
          ...ingredient, 
          // Ensure ID is a string to prevent key warnings/issues
          id: `${ingredient.name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      
      // Determine if we should play a "reaction" sound
      // (Check against what's already in the pot, not the new item itself)
      const isReactive = selectedIngredients.some(i => 
          (i.tags.includes('Hot') && newIng.tags.includes('Cooling')) ||
          (i.tags.includes('Cooling') && newIng.tags.includes('Hot')) ||
          (i.tags.includes('Toxic') && newIng.tags.includes('Purifying'))
      );

      if (isReactive) soundEngine.playBubble(vol);

      setSelectedIngredients(prev => [...prev, newIng]);

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
    // 1. SPAM PREVENTION LOCK
    if (isProcessing) return;

    // 2. BASIC VALIDATION
    if (selectedIngredients.length < 2) {
      soundEngine.playFail(vol);
      setGameMessage('Mixture Unstable');
      setMessageType('poison');
      setTimeout(() => setGameMessage(''), 2000);
      return;
    }

    // 3. INVENTORY VALIDATION
    const canBrew = selectedIngredients.every(ing => {
        if (!ing.finite) return true;
        return (inventory[ing.name] || 0) > 0;
    });

    if (!canBrew) {
        soundEngine.playFail(vol);
        setGameMessage('Missing Reagents!');
        setMessageType('warning');
        setTimeout(() => setGameMessage(''), 2000);
        return;
    }

    // --- LOCK THE GAME ---
    setIsProcessing(true); // <--- LOCKS BUTTON

    // 4. DEDUCT INVENTORY
    const newInventory = { ...inventory };
    selectedIngredients.forEach(ing => {
        if (ing.finite) {
            newInventory[ing.name] = Math.max(0, newInventory[ing.name] - 1);
        }
    });
    setInventory(newInventory);

    soundEngine.playBubble(vol);

    // ... (Your Heat Logic Here) ...
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
    // ... (End Heat Logic) ...

    // Outcome Calculation
    const outcome = calculateOutcome(selectedIngredients, currentCustomer, upgrades, apprentice.hired ? apprentice : null);
    
    setGameStats(prev => ({ ...prev, totalGold: prev.totalGold + outcome.goldReward, customersServed: prev.customersServed + 1 }));
    setGold(prev => Math.max(0, prev + outcome.goldReward));
    setReputation(prev => Math.max(0, prev + outcome.reputationChange));
    setGameMessage(outcome.narrative);
// --- TRIGGER ANIMATION ---
setFeedbackState(outcome.result); // 'cured', 'poisoned', 'exploded', 'failed'
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

    // --- RESET AND UNLOCK ---
    setTimeout(() => {
      setGameMessage('');
      
      // RESET LOCK HERE
      setIsProcessing(false); // <--- UNLOCKS BUTTON for next turn
      
      if (reputation > 0) {
        if (nextCount >= 5) setPhase('night');
        else {
            setCurrentCustomer(generateCustomer());
            setConsultUsed(false);
            setRevealedCustomerTags([]);
            setSelectedIngredients([]);
            setFeedbackState(null);
        }
      }
    }, 4000);
};

// --- 1. TITLE SCREEN ---
  if (gameState === 'TITLE') {
    return (
      <div style={{ transform: `scale(${uiScale/100})`, filter: `brightness(${gamma})`, height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <TitleScreen onStart={handleStartGame} onOpenSettings={() => setSettingsOpen(true)} />
        <SettingsMenu 
            isOpen={settingsOpen} 
            onClose={() => setSettingsOpen(false)} 
           
            currentVolume={audioVolume} 
            onVolumeChange={handleVolumeChange} 
            currentScale={uiScale} 
            onScaleChange={handleScaleChange} 
            currentGamma={gamma} 
            onGammaChange={handleGammaChange}
        // Use the new functions
    onSaveGame={handleSaveGame} 
    onLoadGame={handleLoadGame}
    onReset={handleHardReset}
        />
      </div>
    );
  }

  // --- 2. GAME OVER SCREEN (Dedicated View) ---
  if (gameState === 'GAMEOVER') {
    return (
      <div style={{ transform: `scale(${uiScale/100})`, filter: `brightness(${gamma})`, height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <GameOverScreen 
            stats={gameStats} 
            // IMPORTANT: This must be handleHardReset to wipe the bad save file!
            onReturnToTitle={handleHardReset} 
        />
      </div>
    );
  }
 // --- UPDATED MAIN RENDER ---
  return (
    <div className={`min-h-screen ${theme.bg} ${theme.textMain} ${theme.font} selection:bg-amber-900 selection:text-white overflow-hidden flex flex-col`}>
      
      {/* 1. Scale Container */}
      <div className="flex-1 flex flex-col" style={{ transform: `scale(${uiScale / 100})`, transformOrigin: 'top center', filter: `brightness(${gamma})` }}>
        
      {/* 2. Top Navigation (Themed) */}
<div className={`h-16 border-b ${theme.nav} flex items-center justify-between px-8 shrink-0 z-40 relative backdrop-blur-md`}>
  <div className="flex items-center gap-6">
    
    {/* GOLD - (Visual only for now, but feels interactive) */}
    <div className={`flex items-center gap-2 ${theme.textMain} cursor-default select-none hover:scale-105 transition-transform`}>
        <Coins size={18} /> 
        <span className="text-xl font-bold font-mono">{gold}</span>
    </div>

    {/* REPUTATION - Click to Open Exchange */}
    <div 
        className={`flex items-center gap-2 ${theme.textSec} cursor-pointer select-none hover:text-blue-400 hover:scale-105 transition-all`}
        onClick={() => { soundEngine.playClick(vol); setIsRepModalOpen(true); }}
    >
        <Shield size={18} /> 
        <span className="text-xl font-bold font-mono">{reputation}</span>
    </div>

    {/* Divider */}
    <div className={`w-px h-6 bg-current opacity-20 mx-2`} />

    {/* CALENDAR - Click to Open Forecast */}
    <div 
        className={`text-sm tracking-widest uppercase opacity-60 cursor-pointer select-none hover:opacity-100 hover:text-amber-200 transition-all`}
        onClick={() => { soundEngine.playClick(vol); setIsCalendarOpen(true); }}
    >
        Day {day} • {customersServed}/5
    </div>

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
{/* 1. Base Container is pure black to prevent bleed */}
<div className="absolute inset-0 z-0 bg-[#050505]">
    
    {/* 2. The Room Image - No blending modes, just raw visibility */}
    <img 
        src={alcBg} 
        alt="Alchemist Alley" 
        className="w-full h-full object-cover opacity-50" // Adjust this up to 0.6 or 0.7 if still too dark
    />
    
    {/* 3. Theme Tint - Soft Light blending allows color without darkness */}
    <div className={`absolute inset-0 ${theme.bg} mix-blend-soft-light opacity-60`} />

    {/* 4. The Gradient Overlay - Handles the "Void" fade but leaves the center clear */}
    <div className={`absolute inset-0 bg-gradient-to-t ${theme.overlay}`} />
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
                                                feedbackState={feedbackState}
                                                isInspecting={isInspecting} 
                                                theme={theme}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* CENTER COL: The Desk */}
                            <div className="col-span-6 flex flex-col justify-end items-center relative h-full">
                               

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
                                inventory={inventory} // <--- Pass State
                            />
                        </div>

                    </motion.div>
                ) : (
                    <motion.div key="night" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full z-20 relative bg-slate-950">
                        <TavernHub gold={gold} setGold={setGold} upgrades={upgrades} setUpgrades={setUpgrades} apprentice={apprentice} setApprentice={setApprentice} day={day} onRest={handleRest} volume={vol} onBuyReagent={handleBuyReagent}
    inventory={inventory} onAssignMission={handleAssignMission} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>

      {/* Modals */}
{/* RIVAL MODAL - Place at the very bottom */}
{activeEncounter && (
    <RivalEncounter 
        rival={activeEncounter.rival} 
        encounter={activeEncounter.data} 
        onResolve={handleEncounterResolve} 
    />
)}

<ReputationExchange 
    isOpen={isRepModalOpen} 
    onClose={() => setIsRepModalOpen(false)}
    gold={gold} setGold={setGold}
    reputation={reputation} setReputation={setReputation}
    heat={heat} setHeat={setHeat}
    upgrades={upgrades} setUpgrades={setUpgrades}
    addBuff={addBuff}
/>

<WorldCalendar 
    isOpen={isCalendarOpen} 
    onClose={() => setIsCalendarOpen(false)}
    day={day}
/>

      <BlackBook isOpen={isBlackBookOpen} onClose={() => setIsBlackBookOpen(false)} discoveredIngredients={discoveredIngredients} brewHistory={brewHistory} />
      <SettingsMenu isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} onReset={handleHardReset} currentVolume={audioVolume} onVolumeChange={handleVolumeChange} currentScale={uiScale} onScaleChange={handleScaleChange} currentGamma={gamma} onGammaChange={handleGammaChange} currentThemeId={theme.id}   onSaveGame={handleSaveGame} 
    onLoadGame={handleLoadGame}    // <--- Add this
  onThemeChange={setCurrentThemeId}      // <--- Add this
  availableThemes={THEMES} />
      <AnimatePresence>
    {missionReport && (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setMissionReport(null)}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-[#1c1917] border-2 border-[#44403c] p-8 max-w-md w-full text-center rounded-xl shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#1c1917] p-3 rounded-full border-2 border-[#44403c]">
                    {missionReport.type === 'success' ? <CheckCircle className="text-emerald-500 w-8 h-8" /> : 
                     missionReport.type === 'danger' ? <Skull className="text-red-500 w-8 h-8" /> : 
                     <ShieldAlert className="text-orange-500 w-8 h-8" />}
                </div>
                
                <h2 className={`text-2xl font-bold font-serif mt-4 mb-2 ${
                    missionReport.type === 'success' ? 'text-emerald-400' : 
                    missionReport.type === 'danger' ? 'text-red-400' : 'text-orange-400'
                }`}>
                    {missionReport.title}
                </h2>
                
                <p className="text-stone-400 mb-6 leading-relaxed">
                    {missionReport.description}
                </p>
                
                {missionReport.rewards && missionReport.rewards.length > 0 && (
                    <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2">Acquired</h4>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {missionReport.rewards.map((r, i) => (
                                <span key={i} className="text-sm font-bold text-amber-300 bg-amber-900/20 px-3 py-1 rounded border border-amber-900/50">
                                    {r}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
                
                <Button 
                    className="mt-8 w-full bg-stone-800 hover:bg-stone-700 text-stone-200"
                    onClick={() => setMissionReport(null)}
                >
                    Dismiss
                </Button>
            </motion.div>
        </motion.div>
    )}
</AnimatePresence>
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