import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Eye, MapPin, Siren, Coins, Lock, Crosshair } from 'lucide-react';
// ADD THIS AT THE TOP
import mapHoloBg from '../../assets/map_holo.jpg';
// 1. PUT YOUR IMAGE IN src/assets/ AND IMPORT IT HERE:
// import mapBg from '../assets/map_holo.jpg'; 
// For now, using the uploaded URL:
// ASSIGN THE IMPORTED VARIABLE HERE
// ADD THIS BACK
const MAP_IMAGE_URL = mapHoloBg;

// 2. DEBUG MODE: Set to 'true' if you need to see the red boxes to adjust positions
const DEBUG_MODE = false;

// 3. ZONES CALIBRATED TO YOUR ISOMETRIC IMAGE
const CITY_ZONES = [
  { 
    id: 'dregs', 
    name: 'The Dregs', 
    desc: 'Smugglers & Rats',
    risk: 'Low',
    // Matches Top-Left Residential Grid
    style: { top: '5%', left: '10%', width: '28%', height: '35%' } 
  },
  { 
    id: 'market', 
    name: 'Iron Market', 
    desc: 'Trade Hub',
    risk: 'Med',
    // Matches Bottom-Left Market Stalls
    style: { top: '45%', left: '10%', width: '30%', height: '40%' } 
  },
  { 
    id: 'arcanum', 
    name: 'The Arcanum', 
    desc: 'University District',
    risk: 'Low',
    // Matches Center Monument
    style: { top: '32%', left: '38%', width: '24%', height: '28%' } 
  },
  { 
    id: 'docks', 
    name: 'Cloud Docks', 
    desc: 'Airship Port',
    risk: 'High',
    // Matches Top-Right Helipad
    style: { top: '5%', left: '60%', width: '30%', height: '30%' } 
  },
  { 
    id: 'spire', 
    name: 'High Spire', 
    desc: 'Royal Palace',
    risk: 'Extreme',
    // Matches Bottom-Right Castle
    style: { top: '45%', left: '55%', width: '35%', height: '45%' } 
  },
];

const CityMap = ({ 
  currentHeat, 
  activeDistrict = 'dregs', 
  watchFocus, 
  onHeatReduce, 
  playerGold 
}) => {
  const [hoveredZone, setHoveredZone] = useState(null);

  const heatPercentage = Math.min(Math.max(currentHeat, 0), 100);
  const isCritical = heatPercentage >= 80;
  const bribeCost = isCritical ? 100 : 50;
  const canAfford = playerGold >= bribeCost;

  return (
    <div className="w-full h-full relative bg-slate-950 overflow-hidden flex flex-col select-none font-sans">
      
      {/* --- 1. THE MAP LAYER --- */}
      <div className="relative flex-grow w-full overflow-hidden bg-[#0a0f14]">
        
        {/* The Base Image: 'bg-contain' ensures the whole map is always visible */}
        <div 
          className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-90"
          style={{ backgroundImage: `url(${MAP_IMAGE_URL})` }}
        />
        
        {/* Holographic Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,11,0)_50%,rgba(0,255,255,0.02)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,6px_100%] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />

        {/* --- 2. THE ZONES (INTERACTIVE HOTSPOTS) --- */}
        {CITY_ZONES.map((zone) => {
          const isWatched = watchFocus === zone.id;
          const isActive = activeDistrict === zone.id;
          const isHovered = hoveredZone === zone.id;

          return (
            <motion.div
              key={zone.id}
              className={`absolute cursor-pointer transition-all duration-300
                ${DEBUG_MODE ? 'border border-red-500 bg-red-500/20' : ''} 
                ${isWatched ? 'z-30' : 'z-10 hover:z-20'}
              `}
              style={zone.style}
              onMouseEnter={() => setHoveredZone(zone.id)}
              onMouseLeave={() => setHoveredZone(null)}
            >
              
              {/* TARGETING RETICLE (If Watched) */}
              {isWatched && (
                <div className="absolute inset-0 border-2 border-red-500/70 shadow-[0_0_20px_rgba(220,38,38,0.5)] bg-red-900/10 animate-pulse rounded-xl flex items-center justify-center">
                  <Crosshair className="text-red-500 w-12 h-12 opacity-50 animate-[spin_4s_linear_infinite]" />
                </div>
              )}

              {/* YOUR LOCATION INDICATOR */}
              {isActive && !isWatched && (
                <div className="absolute inset-0 border-2 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] bg-amber-500/5 rounded-xl" />
              )}

              {/* FLOATING LABEL */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none">
                
                {/* 1. Center Icon */}
                <div className="flex justify-center mb-1">
                   {isWatched ? (
                     <Eye className="text-red-500 drop-shadow-[0_0_8px_rgba(220,38,38,1)]" size={28} />
                   ) : isActive ? (
                     <MapPin className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,1)]" size={28} />
                   ) : (isHovered && (
                     <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]" />
                   ))}
                </div>

                {/* 2. Text Label */}
                <div className={`
                   inline-block px-3 py-1 rounded backdrop-blur-md border transition-all duration-300
                   ${isWatched 
                     ? 'bg-red-950/90 border-red-500 text-red-100 shadow-[0_0_15px_rgba(220,38,38,0.6)] scale-110' 
                     : isActive
                       ? 'bg-amber-950/90 border-amber-500 text-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                       : 'bg-black/60 border-cyan-900/50 text-cyan-500/70 opacity-0 group-hover:opacity-100 hover:scale-105'
                   }
                `}>
                   <div className="text-xs font-black uppercase tracking-widest whitespace-nowrap leading-none">
                     {zone.name}
                   </div>
                   {(isWatched || isHovered) && (
                     <div className="text-[9px] font-mono mt-1 opacity-80 leading-none">
                       {isWatched ? "SURVEILLANCE ACTIVE" : zone.desc}
                     </div>
                   )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* --- 3. HUD LAYER (Top Bar) --- */}
      <div className="absolute top-0 left-0 w-full p-6 z-40 pointer-events-none">
        <div className="flex justify-between items-start">
          
          {/* Heat Readout */}
          <div className="bg-black/80 backdrop-blur-sm p-4 border border-slate-700/50 rounded-lg shadow-xl">
            <h2 className="text-cyan-600 text-[10px] font-black tracking-[0.2em] uppercase mb-1">
              Threat Level
            </h2>
            <div className="flex items-center gap-2">
               <ShieldAlert size={20} className={isCritical ? "text-red-500 animate-pulse" : "text-cyan-500"} />
               <span className={`text-3xl font-black font-mono tracking-tight ${isCritical ? 'text-red-500 drop-shadow-[0_0_8px_red]' : 'text-cyan-100 drop-shadow-[0_0_5px_cyan]'}`}>
                 {Math.floor(heatPercentage)}%
               </span>
            </div>
            {/* Visual Bar */}
            <div className="w-32 h-1.5 bg-slate-800 mt-2 rounded-full overflow-hidden">
               <div 
                 className={`h-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-cyan-500'}`} 
                 style={{ width: `${heatPercentage}%` }}
               />
            </div>
          </div>
          
          {/* Active District Info */}
          <div className="bg-black/80 backdrop-blur-sm p-4 border border-amber-900/50 rounded-lg text-right shadow-xl">
             <div className="text-amber-500 font-serif text-xl font-bold">
               {CITY_ZONES.find(z => z.id === activeDistrict)?.name || 'Unknown'}
             </div>
             <div className="text-[10px] text-amber-700 uppercase tracking-widest font-bold">
               Current Shop Location
             </div>
          </div>
        </div>
      </div>

      {/* --- 4. ACTION BAR (Bottom) --- */}
      <div className="bg-[#05080a] p-4 border-t border-slate-800 z-50">
         <button 
            onClick={() => onHeatReduce(bribeCost)}
            disabled={heatPercentage === 0 || !canAfford}
            className={`
              w-full flex items-center justify-between px-6 py-4 rounded border transition-all relative overflow-hidden group
              ${heatPercentage === 0 
                ? 'bg-transparent border-slate-800 text-slate-600 cursor-default' 
                : canAfford 
                  ? 'bg-amber-950/20 border-amber-600/30 hover:bg-amber-900/40 hover:border-amber-500 text-amber-500' 
                  : 'bg-red-950/20 border-red-900/30 text-red-700 cursor-not-allowed'
              }
            `}
         >
            <div className="flex items-center gap-3 relative z-10">
               {heatPercentage === 0 ? <Lock size={20}/> : <Siren size={20} className={isCritical ? "animate-spin" : ""}/>}
               <div className="text-left">
                  <div className="text-xs font-black uppercase tracking-[0.2em]">
                    {heatPercentage === 0 ? "System Clear" : "Bribe Watch Captain"}
                  </div>
                  <div className="text-[10px] opacity-60 font-mono">
                    {heatPercentage === 0 ? "No active warrants" : "Reduces Heat by 25%"}
                  </div>
               </div>
            </div>

            {heatPercentage > 0 && (
               <div className="flex items-center gap-2 font-mono text-xl font-bold relative z-10">
                  <Coins size={18} />
                  -{bribeCost}
               </div>
            )}
         </button>
      </div>
    </div>
  );
};

export default CityMap;