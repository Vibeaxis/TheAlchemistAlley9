import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Eye, MapPin, Siren, Coins, Lock, Crosshair, X, ArrowRight, Home, Search } from 'lucide-react';

// YOUR IMPORTED IMAGE (Ensure this points to the copper one)
import mapHoloBg from '../assets/map_holo.webp'; // Update filename if needed
const MAP_IMAGE_URL = mapHoloBg;

const DEBUG_MODE = false;

// UPDATED ZONES
// (Same coordinates, but we rely on icons now)
const CITY_ZONES = [
  { 
    id: 'dregs', 
    name: 'The Dregs', 
    desc: 'Smugglers & Rats',
    lore: "A sprawling labyrinth of shanties and mud. The City Watch rarely patrols here, but the local gangs demand their own form of 'taxes'.",
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
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const heatPercentage = Math.min(Math.max(currentHeat, 0), 100);
  const isCritical = heatPercentage >= 80;
  const bribeCost = isCritical ? 100 : 50;
  const canAfford = playerGold >= bribeCost;

  const detailData = CITY_ZONES.find(z => z.id === selectedDistrict);

  return (
    <div className="w-full h-full relative bg-[#1c1917] flex flex-col select-none font-sans overflow-hidden">
      
      {/* --- 1. THE MAP LAYER --- */}
      <div className="relative flex-grow w-full overflow-hidden flex items-center justify-center p-4 md:p-12">
        
        <div className="relative w-full h-full max-w-[1200px] max-h-[800px] shadow-2xl">
              
            {/* The Copper Map Image */}
            <div 
              className="absolute inset-0 bg-contain bg-center bg-no-repeat transition-all duration-500 rounded-sm"
              style={{ 
                  backgroundImage: `url(${MAP_IMAGE_URL})`,
                  // If detail is open, darken the map slightly
                  filter: selectedDistrict ? 'brightness(0.5) blur(2px)' : 'sepia(0.2) contrast(1.1)'
              }}
            />
            
            {/* VIGNETTE (Darkens corners to focus eyes on map) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />

            {/* --- ZONES (CLICK TARGETS + TOKENS) --- */}
            {CITY_ZONES.map((zone) => {
              const isWatched = watchFocus === zone.id;
              const isActive = activeDistrict === zone.id;
              // We check if this specific zone is hovered
              const isHovered = hoveredZone === zone.id;

              return (
                <motion.div
                  key={zone.id}
                  className={`absolute cursor-pointer rounded-full
                    ${DEBUG_MODE ? 'border border-red-500 bg-red-500/20' : ''} 
                    z-20
                  `}
                  style={zone.style}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  onClick={() => setSelectedDistrict(zone.id)}
                  // No background color unless debugging
                >
                  
                  {/* --- TOKEN LAYER --- */}
                  {/* We center these icons in the middle of the zone div */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center justify-center">
                    
                    {/* 1. WATCH TOKEN (The Enemy) */}
                    <AnimatePresence>
                      {isWatched && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          className="relative mb-2"
                        >
                           {/* Pulsing Red Aura (Subtle) */}
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-red-600/30 blur-xl rounded-full animate-pulse" />
                           
                           {/* The Eye Icon (Looks like red paint or a wax seal) */}
                           <div className="bg-[#450a0a] text-red-500 p-3 rounded-full border-2 border-red-900 shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center justify-center">
                              <Eye size={32} strokeWidth={2.5} />
                           </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 2. PLAYER TOKEN (The Shop) */}
                    <AnimatePresence>
                      {isActive && !isWatched && (
                        <motion.div 
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className="relative mb-2"
                        >
                           {/* The Pin Icon (Looks like Brass/Gold) */}
                           <div className="text-amber-400 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] filter">
                              <MapPin size={48} fill="#b45309" stroke="#fef3c7" strokeWidth={1.5} />
                           </div>
                           {/* Pin Shadow on map */}
                           <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1.5 bg-black/60 blur-[2px] rounded-full" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 3. HOVER LABEL (Paper Tag Style) */}
                    <AnimatePresence>
                      {(isHovered || isWatched || isActive) && !selectedDistrict && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className={`
                            whitespace-nowrap px-3 py-1 mt-1 rounded shadow-lg border
                            font-serif tracking-wide text-sm font-bold backdrop-blur-md
                            transition-colors duration-300
                            ${isWatched 
                                ? 'bg-[#2a0a0a]/90 border-red-900 text-red-200' 
                                : isActive 
                                  ? 'bg-[#2a1a0a]/90 border-amber-800 text-amber-100'
                                  : 'bg-[#1a1a1a]/80 border-stone-600 text-stone-200'}
                          `}
                        >
                          {zone.name}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  
                  </div>

                </motion.div>
              );
            })}
        </div>

        {/* --- DETAILS MODAL (Updated Aesthetic) --- */}
        <AnimatePresence>
            {selectedDistrict && detailData && (
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="absolute right-0 top-0 h-full w-full md:w-1/3 min-w-[350px] bg-[#1c1917]/95 backdrop-blur-xl border-l border-[#44403c] shadow-2xl z-50 flex flex-col font-serif"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header: Stone & Amber */}
                    <div className={`h-32 w-full bg-gradient-to-br ${detailData.id === activeDistrict ? 'from-amber-950 to-[#1c1917]' : 'from-stone-800 to-[#1c1917]'} relative p-6 border-b border-[#44403c]`}>
                        <button 
                            onClick={() => setSelectedDistrict(null)}
                            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-white/10 rounded-full text-stone-300 transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-3xl font-black text-stone-100 mt-auto tracking-wide">{detailData.name}</h2>
                        <div className="text-xs uppercase tracking-widest opacity-70 text-amber-500 font-mono">{detailData.desc}</div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex-grow flex flex-col gap-6 font-sans">
                        
                        {/* Lore */}
                        <div className="text-stone-400 leading-relaxed italic border-l-2 border-stone-600 pl-4">
                            "{detailData.lore}"
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="bg-black/30 p-4 rounded border border-[#44403c]">
                                <div className="text-[10px] uppercase text-stone-500 font-bold">Heat Multiplier</div>
                                <div className={`text-xl font-mono font-bold ${detailData.id === 'spire' ? 'text-red-400' : 'text-amber-200'}`}>
                                    {detailData.multiplier}
                                </div>
                            </div>
                            <div className="bg-black/30 p-4 rounded border border-[#44403c]">
                                <div className="text-[10px] uppercase text-stone-500 font-bold">Patrol Frequency</div>
                                <div className="text-xl font-mono font-bold text-stone-300">{detailData.risk}</div>
                            </div>
                        </div>

                        {/* Actions */}
                        {detailData.id === activeDistrict ? (
                            <div className="mt-auto p-4 bg-amber-900/10 border border-amber-700/30 rounded flex items-center gap-3 text-amber-600">
                                <Home size={20} />
                                <span className="font-bold">Current Base of Operations</span>
                            </div>
                        ) : (
                            <div className="mt-auto flex flex-col gap-3">
                                <button className="w-full py-4 bg-[#292524] hover:bg-[#44403c] border border-stone-600 rounded flex items-center justify-center gap-2 transition-all text-stone-200 shadow-lg">
                                    <Search size={16} />
                                    <span className="text-xs uppercase font-bold tracking-widest">Gather Intel (25g)</span>
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>

      {/* --- 3. HUD LAYER (Gauges) --- */}
      <div className="absolute top-0 left-0 w-full p-6 z-40 pointer-events-none flex justify-between">
          {/* Heat Gauge - Now looks like a brass instrument */}
          <div className="bg-[#0c0a09]/90 backdrop-blur-sm p-4 border border-[#44403c] rounded shadow-xl pointer-events-auto">
            <h2 className="text-amber-700 text-[10px] font-black tracking-[0.2em] uppercase mb-1">Threat Level</h2>
            <div className="flex items-center gap-3">
               <ShieldAlert size={24} className={isCritical ? "text-red-600 animate-pulse" : "text-stone-500"} />
               <span className={`text-3xl font-black font-mono tracking-tight ${isCritical ? 'text-red-500' : 'text-stone-200'}`}>
                 {Math.floor(heatPercentage)}%
               </span>
            </div>
          </div>
      </div>

      {/* --- 4. ACTION BAR (Industrial Style) --- */}
      <div className="bg-[#1c1917] p-4 border-t border-[#44403c] z-50 shrink-0 shadow-[0_-5px_15px_rgba(0,0,0,0.5)]">
         <button 
            onClick={() => onHeatReduce(bribeCost)}
            disabled={heatPercentage === 0 || !canAfford}
            className={`
              w-full flex items-center justify-between px-6 py-4 rounded border transition-all relative overflow-hidden group
              ${heatPercentage === 0 
                ? 'bg-transparent border-[#292524] text-stone-600 cursor-default' 
                : canAfford 
                  ? 'bg-amber-950/30 border-amber-800/50 hover:bg-amber-900/40 hover:border-amber-600 text-amber-500' 
                  : 'bg-red-950/20 border-red-900/30 text-red-800 cursor-not-allowed'
              }
            `}
         >
            <div className="flex items-center gap-3 relative z-10">
               {heatPercentage === 0 ? <Lock size={20}/> : <Siren size={20} className={isCritical ? "animate-spin" : ""}/>}
               <div className="text-left">
                  <div className="text-xs font-black uppercase tracking-[0.2em] font-serif">
                    {heatPercentage === 0 ? "Coast Clear" : "Bribe Watch Captain"}
                  </div>
                  <div className="text-[10px] opacity-60 font-mono">
                    {heatPercentage === 0 ? "No active warrants" : "Reduces Heat by 25%"}
                  </div>
               </div>
            </div>

            {heatPercentage > 0 && (
               <div className="flex items-center gap-2 font-mono text-xl font-bold relative z-10 text-amber-500">
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