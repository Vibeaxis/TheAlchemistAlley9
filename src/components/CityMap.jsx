import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Eye, Map as MapIcon, Siren, Coins, Lock } from 'lucide-react';

// You can replace this URL with a local image later (import mapBg from '../assets/map.jpg')
const MAP_TEXTURE = "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop";

const DISTRICTS = [
  { 
    id: 'slums', 
    name: 'The Dregs', 
    desc: 'Smugglers & Rats',
    risk: 'Low', 
    color: 'text-stone-400' 
  },
  { 
    id: 'market', 
    name: 'Iron Market', 
    desc: 'Merchants & Thieves',
    risk: 'Med', 
    color: 'text-amber-400' 
  },
  { 
    id: 'palace', 
    name: 'High Spire', 
    desc: 'Nobles & Guards',
    risk: 'High', 
    color: 'text-indigo-300' 
  },
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
  const bribeCost = isCritical ? 100 : 50;
  const canAfford = playerGold >= bribeCost;

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-950 text-slate-200 font-sans select-none flex flex-col">
      
      {/* --- LAYER 1: THE BACKGROUND IMAGE --- */}
      <div 
        className="absolute inset-0 opacity-40 bg-cover bg-center grayscale-[30%] sepia-[20%]"
        style={{ backgroundImage: `url(${MAP_TEXTURE})` }}
      />

      {/* --- LAYER 2: ATMOSPHERE & VIGNETTE --- */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.4)_0%,rgba(0,0,0,0.95)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.8)_0%,transparent_20%,transparent_80%,rgba(15,23,42,0.9)_100%)]" />

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 flex flex-col h-full">

        {/* 1. HEADER & HEAT METER */}
        <div className="p-6 pb-2">
          <div className="flex justify-between items-end mb-3">
            <div>
               <h2 className="text-amber-500/80 text-[10px] font-black tracking-[0.3em] uppercase mb-1">
                 City Watch Level
               </h2>
               <div className="flex items-center gap-2">
                  <ShieldAlert size={18} className={isCritical ? "text-red-500 animate-pulse" : "text-slate-400"} />
                  <span className={`text-2xl font-black tracking-tighter ${isCritical ? 'text-red-500 drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'text-slate-200'}`}>
                    {Math.floor(heatPercentage)}%
                  </span>
               </div>
            </div>
          </div>

          {/* The Premium Heat Bar */}
          <div className="h-6 w-full bg-slate-950/80 rounded border border-slate-700/50 overflow-hidden relative shadow-inner">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex justify-between px-1 z-20 opacity-30">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-px h-full bg-slate-500" />
              ))}
            </div>
            
            {/* The Liquid Fill */}
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${heatPercentage}%` }}
              className={`h-full relative z-10 transition-colors duration-500 ${
                isCritical ? 'bg-gradient-to-r from-red-900 via-red-600 to-red-500' : 
                heatPercentage > 50 ? 'bg-gradient-to-r from-amber-900 via-amber-600 to-amber-500' : 
                'bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-500'
              }`}
            >
               {/* Shine effect on the bar */}
               <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30" />
               <div className="absolute bottom-0 left-0 w-full h-[1px] bg-black/30" />
            </motion.div>
          </div>
        </div>

        {/* 2. THE DISTRICTS (Map Pins) */}
        <div className="flex-grow p-6 pt-2 flex flex-col gap-3 overflow-y-auto">
          <h3 className="text-slate-500 text-[10px] uppercase tracking-widest mb-1 mt-2 border-b border-slate-800/50 pb-2">
            Surveillance Log
          </h3>

          {DISTRICTS.map((district) => {
            const isWatched = watchFocus === district.id;
            const isMyShop = activeDistrict === district.id;

            return (
              <div 
                key={district.id}
                className={`
                  group relative p-4 rounded-lg border transition-all duration-500 overflow-hidden
                  ${isMyShop 
                    ? 'bg-amber-950/40 border-amber-700/50 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)]' 
                    : 'bg-slate-900/60 border-slate-800/50 hover:bg-slate-900/80'
                  }
                  ${isWatched ? 'border-red-500/30 shadow-[0_0_15px_rgba(220,38,38,0.15)]' : ''}
                `}
              >
                {/* Active Patrol Background Flash */}
                {isWatched && (
                  <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
                )}

                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-3">
                     {/* District Icon / Marker */}
                     <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border
                        ${isWatched ? 'bg-red-950/50 border-red-500/50 text-red-500' : 'bg-slate-950/50 border-slate-700/50 text-slate-500'}
                     `}>
                        {isWatched ? <Eye size={20} className="animate-pulse" /> : <MapIcon size={18} />}
                     </div>

                     <div>
                        <h4 className={`text-sm font-bold font-serif tracking-wide ${district.color}`}>
                          {district.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500">
                           <span>{district.desc}</span>
                           {isMyShop && <span className="text-amber-500 font-bold">• Your Location</span>}
                        </div>
                     </div>
                  </div>

                  {/* Status Label */}
                  <div className="text-right">
                    {isWatched ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-400 uppercase tracking-widest animate-pulse">
                        <Siren size={10} /> Active Patrol
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-600 font-mono">CLEAR</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. FOOTER ACTIONS */}
        <div className="p-6 pt-4 border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md z-20">
          <div className="flex justify-between items-center mb-3 text-xs font-mono">
            <span className="text-slate-500">Current Suspicion</span>
            <span className={heatPercentage > 0 ? "text-amber-500" : "text-slate-600"}>
              {Math.floor(heatPercentage)}/100
            </span>
          </div>

          <button 
            onClick={() => onHeatReduce(bribeCost)}
            disabled={heatPercentage === 0 || !canAfford}
            className={`
              w-full relative overflow-hidden group py-4 px-6 rounded border transition-all duration-300
              ${heatPercentage === 0 
                ? 'bg-transparent border-slate-800 text-slate-600 cursor-default' 
                : canAfford 
                  ? 'bg-amber-950/30 border-amber-600/50 text-amber-500 hover:bg-amber-900/40 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                  : 'bg-red-950/20 border-red-900/30 text-red-800 cursor-not-allowed opacity-70'
              }
            `}
          >
            {/* Button Interior */}
            <div className="relative z-10 flex items-center justify-center gap-3">
               {heatPercentage === 0 ? (
                  <>
                    <Lock size={14} />
                    <span className="text-xs uppercase tracking-[0.2em] font-bold">Record Clean</span>
                  </>
               ) : (
                  <>
                    <div className="flex flex-col items-end leading-none">
                      <span className="text-[10px] opacity-60 uppercase tracking-wider">Pay Bribe</span>
                      <span className="text-sm font-bold tracking-widest">{isCritical ? "EMERGENCY" : "DISMISS GUARDS"}</span>
                    </div>
                    <div className="w-px h-8 bg-current opacity-20 mx-2" />
                    <div className={`flex items-center gap-1 font-mono text-lg ${canAfford ? '' : 'line-through decoration-red-500/50'}`}>
                      <Coins size={16} />
                      {bribeCost}
                    </div>
                  </>
               )}
            </div>

            {/* Shine Animation on Hover */}
            {canAfford && heatPercentage > 0 && (
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CityMap;