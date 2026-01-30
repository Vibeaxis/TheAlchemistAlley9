import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, ShieldAlert, Skull, Siren, Eye } from 'lucide-react';

const DISTRICTS = [
  { id: 'slums', name: 'The Dregs', risk: 'Low', reward: 'Scraps', color: 'bg-stone-800' },
  { id: 'market', name: 'Iron Market', risk: 'Med', reward: 'Gold', color: 'bg-slate-700' },
  { id: 'palace', name: 'High Spire', risk: 'High', reward: 'Influence', color: 'bg-indigo-900' },
];

const CityMap = ({ currentHeat, maxHeat, activeDistrict, onHeatReduce }) => {
  // The "Watch" moves to a random district every 10 seconds
  const [watchFocus, setWatchFocus] = useState('market');

  return (
    <div className="w-full h-full bg-slate-950 border-r border-slate-800 p-6 flex flex-col relative overflow-hidden">
      
      {/* VIGNETTE & SCANLINES (Atmosphere) */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,11,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,6px_100%]" />

      {/* --- HEADER: THE HEAT METER --- */}
      <div className="relative z-10 mb-8">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-stone-400 text-xs font-black tracking-[0.2em] uppercase flex items-center gap-2">
            <ShieldAlert size={14} className={isCritical ? "text-red-500 animate-pulse" : "text-stone-600"} />
            City Suspicion
          </h2>
          <span className={`text-xl font-mono ${isCritical ? 'text-red-500' : 'text-stone-500'}`}>
            {currentHeat}%
          </span>
        </div>

        {/* The Bar */}
        <div className="h-4 w-full bg-slate-900 rounded-sm border border-slate-700 overflow-hidden relative">
          {/* Background Ticks */}
          <div className="absolute inset-0 flex justify-between px-1">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-px h-full bg-slate-800" />
            ))}
          </div>
          
          {/* The Fill */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${heatPercentage}%` }}
            className={`h-full shadow-[0_0_10px_currentColor] ${
              isCritical ? 'bg-red-600 shadow-red-500/50' : 
              heatPercentage > 50 ? 'bg-amber-500 shadow-amber-500/50' : 'bg-emerald-600 shadow-emerald-500/50'
            }`}
          />
        </div>

        {/* Critical Warning */}
        <AnimatePresence>
          {isCritical && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest bg-red-950/50 p-2 rounded border border-red-900/50"
            >
              <Siren size={14} className="animate-spin" />
              Raid Imminent - Bribe Required
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- THE MAP BOARD --- */}
      <div className="flex-grow relative z-10 flex flex-col gap-4">
        <h3 className="text-slate-600 text-[10px] uppercase tracking-widest mb-1">
          District Surveillance
        </h3>

        {DISTRICTS.map((district) => {
          const isWatched = watchFocus === district.id;
          const isActive = activeDistrict === district.id;

          return (
            <div 
              key={district.id}
              className={`
                relative p-4 rounded border transition-all duration-500
                ${isActive ? 'border-amber-700 bg-amber-900/10' : 'border-slate-800 bg-slate-900/50'}
                ${isWatched ? 'shadow-[inset_0_0_20px_rgba(220,38,38,0.2)] border-red-900/50' : ''}
              `}
            >
              {/* WATCH INDICATOR */}
              <AnimatePresence>
                {isWatched && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute -right-3 -top-3 bg-red-950 text-red-500 p-2 rounded-full border border-red-800 shadow-lg z-20"
                  >
                    <Eye size={16} className="animate-pulse" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`text-sm font-bold font-serif ${isActive ? 'text-amber-100' : 'text-slate-400'}`}>
                    {district.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">
                    Risk: <span className={district.risk === 'High' ? 'text-red-400' : 'text-slate-400'}>{district.risk}</span>
                  </p>
                </div>
                {district.id === 'slums' && (
                   <MapIcon size={30} className="text-slate-800 opacity-50" />
                )}
              </div>

              {/* Status Text */}
              <div className="mt-4 text-xs font-mono text-slate-500">
                {isWatched ? (
                  <span className="text-red-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    PATROL ACTIVE
                  </span>
                ) : (
                  <span className="text-emerald-700/50">SECTOR CLEAR</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- ACTIONS --- */}
      <div className="mt-auto pt-6 border-t border-slate-800 z-10">
        <button 
          onClick={onHeatReduce}
          disabled={currentHeat < 10}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 text-xs uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          <span className="group-hover:text-amber-500 transition-colors">Pay Bribe (50g)</span>
        </button>
      </div>

    </div>
  );
};

export default CityMap;