import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Eye, Map as MapIcon, Siren, Coins, X } from 'lucide-react';

const DISTRICTS = [
  { id: 'slums', name: 'The Dregs', risk: 'Low', reward: 'Scraps' },
  { id: 'market', name: 'Iron Market', risk: 'Med', reward: 'Gold' },
  { id: 'palace', name: 'High Spire', risk: 'High', reward: 'Influence' },
];

const CityMap = ({ 
  currentHeat, 
  activeDistrict, 
  watchFocus, 
  onHeatReduce, 
  playerGold 
}) => {

  const heatPercentage = Math.min(Math.max(currentHeat, 0), 100);
  const isCritical = heatPercentage >= 80;
  const bribeCost = isCritical ? 100 : 50; // Price gouging during emergencies
  const canAfford = playerGold >= bribeCost;

  return (
    <div className="w-full h-full bg-slate-950 border-r border-slate-800 flex flex-col relative overflow-hidden">
      
      {/* VIGNETTE & SCANLINES */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,11,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,6px_100%]" />

      {/* --- 1. THE HEAT METER (Top) --- */}
      <div className="p-6 pb-2 relative z-10">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-stone-400 text-xs font-black tracking-[0.2em] uppercase flex items-center gap-2">
            <ShieldAlert size={14} className={isCritical ? "text-red-500 animate-pulse" : "text-stone-600"} />
            Suspicion
          </h2>
          <span className={`text-xl font-mono ${isCritical ? 'text-red-500 animate-pulse' : 'text-stone-500'}`}>
            {Math.floor(heatPercentage)}%
          </span>
        </div>

        {/* The Bar */}
        <div className="h-4 w-full bg-slate-900 rounded-sm border border-slate-700 overflow-hidden relative">
          <div className="absolute inset-0 flex justify-between px-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-px h-full bg-slate-800" />
            ))}
          </div>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${heatPercentage}%` }}
            className={`h-full shadow-[0_0_10px_currentColor] transition-colors duration-500 ${
              isCritical ? 'bg-red-600 shadow-red-500/50' : 
              heatPercentage > 50 ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-800 shadow-emerald-500/50'
            }`}
          />
        </div>
      </div>

      {/* --- 2. THE DISTRICT LIST (Middle) --- */}
      <div className="flex-grow p-6 pt-0 relative z-10 flex flex-col gap-3 overflow-y-auto">
        <h3 className="text-slate-600 text-[10px] uppercase tracking-widest mb-1 mt-4">
          Patrol Logistics
        </h3>

        {DISTRICTS.map((district) => {
          const isWatched = watchFocus === district.id;
          const isMyShop = activeDistrict === district.id;

          return (
            <div 
              key={district.id}
              className={`
                relative p-4 rounded border transition-all duration-500
                ${isMyShop ? 'border-amber-900/50 bg-amber-950/10' : 'border-slate-800 bg-slate-900/30'}
                ${isWatched ? 'shadow-[inset_0_0_20px_rgba(220,38,38,0.1)] border-red-900/30' : ''}
              `}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`text-sm font-bold font-serif ${isMyShop ? 'text-amber-100' : 'text-slate-400'}`}>
                    {district.name}
                  </h4>
                  {isMyShop && <span className="text-[10px] text-amber-500/50 uppercase tracking-wider">(Your Shop)</span>}
                </div>
                
                {/* Watch Eye Indicator */}
                <AnimatePresence>
                  {isWatched && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="text-red-500"
                    >
                      <Eye size={20} className="animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- 3. THE ACTION BUTTON (Bottom) --- */}
      <div className="p-6 border-t border-slate-800 bg-slate-950/80 z-20">
        
        {/* Status Text */}
        <div className="flex justify-between items-center mb-3 text-xs">
          <span className="text-slate-500 uppercase tracking-wider">Current Heat:</span>
          <span className={`font-mono ${heatPercentage > 0 ? 'text-white' : 'text-slate-600'}`}>
            {Math.floor(heatPercentage)} / 100
          </span>
        </div>

        <button 
          onClick={() => onHeatReduce(bribeCost)}
          disabled={heatPercentage === 0 || !canAfford}
          className={`
            w-full py-4 text-xs uppercase tracking-[0.2em] font-bold border-2 transition-all flex items-center justify-center gap-2 group
            ${heatPercentage === 0 
              ? 'border-slate-800 text-slate-700 bg-transparent cursor-default' 
              : canAfford 
                ? 'bg-slate-900 border-slate-700 hover:border-amber-600 hover:text-amber-500 text-slate-300 shadow-lg' 
                : 'bg-red-950/20 border-red-900/30 text-red-800 cursor-not-allowed'
            }
          `}
        >
          {heatPercentage === 0 ? (
            <span>Clean Record</span>
          ) : (
            <>
              <span>{isCritical ? "Panic Bribe" : "Bribe Patrol"}</span>
              <span className={`flex items-center gap-1 ${canAfford ? 'text-amber-500' : 'text-red-500'}`}>
                <Coins size={12} />
                -{bribeCost}
              </span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};

export default CityMap;