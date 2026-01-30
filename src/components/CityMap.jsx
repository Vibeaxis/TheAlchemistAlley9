import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Eye, MapPin, Siren, Coins, Lock, Crosshair, X, ArrowRight, Home, Search } from 'lucide-react';

// YOUR IMPORTED IMAGE
import mapHoloBg from '../assets/map_holo.jpg'; 
const MAP_IMAGE_URL = mapHoloBg;

// DEBUG MODE (Set to true to fix alignments)
const DEBUG_MODE = false;

// ZONES (Keep your calibrated positions)
const CITY_ZONES = [
  { 
    id: 'dregs', 
    name: 'The Dregs', 
    desc: 'Smugglers & Rats',
    lore: "A sprawling labyrinth of shanties and mud. The City Watch rarely patrols here, but the local gangs demand their own form of 'taxes'. Perfect for shady business.",
    risk: 'Low',
    multiplier: '1.0x',
    style: { top: '5%', left: '10%', width: '28%', height: '35%' } 
  },
  { 
    id: 'market', 
    name: 'Iron Market', 
    desc: 'Trade Hub',
    lore: "The beating industrial heart of the city. Loud, crowded, and full of soot. Alchemists here can sell potions faster, but the competition is fierce.",
    risk: 'Med',
    multiplier: '1.2x',
    style: { top: '45%', left: '10%', width: '30%', height: '40%' } 
  },
  { 
    id: 'arcanum', 
    name: 'The Arcanum', 
    desc: 'University District',
    lore: "Home to the sanctioned Mages Guild. They have sensors that detect unauthorised magic usage. High clientele, but very high scrutiny.",
    risk: 'High',
    multiplier: '1.5x',
    style: { top: '32%', left: '38%', width: '24%', height: '28%' } 
  },
  { 
    id: 'docks', 
    name: 'Cloud Docks', 
    desc: 'Airship Port',
    lore: "Where the sky-ships dock. Foreign ingredients are plentiful here, but Customs Officers check every crate. Smuggling is profitable but dangerous.",
    risk: 'High',
    multiplier: '1.8x',
    style: { top: '5%', left: '60%', width: '30%', height: '30%' } 
  },
  { 
    id: 'spire', 
    name: 'High Spire', 
    desc: 'Royal Palace',
    lore: "The seat of power. The Royal Guard does not accept bribes. Only the most foolish or master alchemists dare to set up shop under the King's nose.",
    risk: 'Extreme',
    multiplier: '3.0x',
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
  const [selectedDistrict, setSelectedDistrict] = useState(null); // NEW: For the Detail Modal

  const heatPercentage = Math.min(Math.max(currentHeat, 0), 100);
  const isCritical = heatPercentage >= 80;
  const bribeCost = isCritical ? 100 : 50;
  const canAfford = playerGold >= bribeCost;

  // Find the object for the currently selected district
  const detailData = CITY_ZONES.find(z => z.id === selectedDistrict);

  return (
    <div className="w-full h-full relative bg-slate-950 flex flex-col select-none font-sans">
      
      {/* --- 1. THE MAP LAYER --- */}
      {/* Added 'p-12' so highlights don't bleed off the edges */}
      <div className="relative flex-grow w-full overflow-hidden bg-[#0a0f14] flex items-center justify-center p-12">
        
        {/* The Map Container (Restrained to Aspect Ratio) */}
     <div className="relative w-full h-full flex items-center justify-center">
             
            {/* The Base Image */}
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat opacity-90 transition-all duration-500"
              style={{ 
                  backgroundImage: `url(${MAP_IMAGE_URL})`,
                  // Blur the map slightly if a detail panel is open
                  filter: selectedDistrict ? 'blur(5px) brightness(0.4)' : 'none'
              }}
            />
            
            {/* Holographic Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,11,0)_50%,rgba(0,255,255,0.02)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,6px_100%] pointer-events-none" />

            {/* --- ZONES (INTERACTIVE) --- */}
            {CITY_ZONES.map((zone) => {
              const isWatched = watchFocus === zone.id;
              const isActive = activeDistrict === zone.id;
              const isSelected = selectedDistrict === zone.id;

              return (
                <motion.div
                  key={zone.id}
                  className={`absolute cursor-pointer transition-all duration-300 rounded-xl
                    ${DEBUG_MODE ? 'border border-red-500 bg-red-500/20' : ''} 
                    ${isWatched ? 'z-30' : 'z-10 hover:z-20'}
                  `}
                  style={zone.style}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => setSelectedDistrict(zone.id)}
                >
                  
                  {/* WATCHED EFFECT */}
                  {isWatched && (
                    <div className="absolute -inset-4 border-2 border-red-500/70 shadow-[0_0_30px_rgba(220,38,38,0.6)] bg-red-900/10 animate-pulse rounded-xl flex items-center justify-center pointer-events-none">
                      <Crosshair className="text-red-500 w-12 h-12 opacity-50 animate-[spin_4s_linear_infinite]" />
                    </div>
                  )}

                  {/* ACTIVE SHOP EFFECT */}
                  {isActive && !isWatched && (
                    <div className="absolute -inset-2 border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.4)] bg-amber-500/5 rounded-xl pointer-events-none" />
                  )}

                  {/* HOVER LABEL (Only show if no modal is open) */}
                  {!selectedDistrict && (
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none">
                        <div className="flex justify-center mb-1">
                          {isWatched ? <Eye className="text-red-500 drop-shadow-lg" size={32} /> : 
                           isActive ? <MapPin className="text-amber-500 drop-shadow-lg" size={32} /> : null}
                        </div>
                        <div className={`
                          inline-block px-3 py-1 rounded backdrop-blur-md border transition-all duration-300
                          ${isWatched ? 'bg-red-950/90 border-red-500 text-red-100 scale-110' : 
                            isActive ? 'bg-amber-950/90 border-amber-500 text-amber-100' : 
                            'bg-black/60 border-cyan-900/50 text-cyan-500/70 opacity-0 group-hover:opacity-100 group-hover:scale-105'}
                        `}>
                          <div className="text-xs font-black uppercase tracking-widest">{zone.name}</div>
                        </div>
                      </div>
                  )}
                </motion.div>
              );
            })}
        </div>

        {/* --- DETAILS MODAL (OVERLAY) --- */}
        <AnimatePresence>
            {selectedDistrict && detailData && (
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="absolute right-0 top-0 h-full w-1/3 min-w-[400px] bg-slate-900/95 backdrop-blur-xl border-l border-slate-700 shadow-2xl z-50 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Image/Color */}
                    <div className={`h-32 w-full bg-gradient-to-br ${detailData.id === activeDistrict ? 'from-amber-900 to-slate-900' : 'from-cyan-900 to-slate-900'} relative p-6`}>
                        <button 
                            onClick={() => setSelectedDistrict(null)}
                            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-white/10 rounded-full text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-3xl font-black text-white mt-auto font-serif tracking-wide">{detailData.name}</h2>
                        <div className="text-xs uppercase tracking-widest opacity-70 text-white font-mono">{detailData.desc}</div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex-grow flex flex-col gap-6">
                        
                        {/* Lore */}
                        <div className="text-slate-300 leading-relaxed italic border-l-2 border-slate-600 pl-4">
                            "{detailData.lore}"
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="bg-black/40 p-4 rounded border border-slate-700">
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Heat Multiplier</div>
                                <div className={`text-xl font-mono font-bold ${detailData.id === 'spire' ? 'text-red-400' : 'text-cyan-400'}`}>
                                    {detailData.multiplier}
                                </div>
                            </div>
                            <div className="bg-black/40 p-4 rounded border border-slate-700">
                                <div className="text-[10px] uppercase text-slate-500 font-bold">Patrol Frequency</div>
                                <div className="text-xl font-mono font-bold text-slate-300">{detailData.risk}</div>
                            </div>
                        </div>

                        {/* Status Check */}
                        {detailData.id === activeDistrict ? (
                            <div className="mt-auto p-4 bg-amber-900/20 border border-amber-500/30 rounded flex items-center gap-3 text-amber-500">
                                <Home size={20} />
                                <span className="font-bold">Current Base of Operations</span>
                            </div>
                        ) : (
                            <div className="mt-auto flex flex-col gap-3">
                                <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded flex items-center justify-center gap-2 transition-all">
                                    <Search size={16} />
                                    <span className="text-xs uppercase font-bold tracking-widest">Gather Intel (25g)</span>
                                </button>
                                <button 
                                   disabled={true} 
                                   className="w-full py-4 bg-black/40 border border-slate-800 text-slate-500 rounded flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    <span className="text-xs uppercase font-bold tracking-widest">Move Shop Here (Coming Soon)</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>

      {/* --- 3. HUD LAYER (Top Bar) --- */}
      <div className="absolute top-0 left-0 w-full p-8 z-40 pointer-events-none flex justify-between">
          <div className="bg-black/80 backdrop-blur-sm p-4 border border-slate-700/50 rounded-lg shadow-xl pointer-events-auto">
            <h2 className="text-cyan-600 text-[10px] font-black tracking-[0.2em] uppercase mb-1">Threat Level</h2>
            <div className="flex items-center gap-2">
               <ShieldAlert size={20} className={isCritical ? "text-red-500 animate-pulse" : "text-cyan-500"} />
               <span className={`text-3xl font-black font-mono tracking-tight ${isCritical ? 'text-red-500 drop-shadow-[0_0_8px_red]' : 'text-cyan-100'}`}>
                 {Math.floor(heatPercentage)}%
               </span>
            </div>
          </div>
      </div>

      {/* --- 4. ACTION BAR (Bottom) --- */}
      <div className="bg-[#05080a] p-4 border-t border-slate-800 z-50 shrink-0">
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