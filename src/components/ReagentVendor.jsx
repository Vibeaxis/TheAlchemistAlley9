import React from 'react';
import { ShoppingBag, Coins, Package, Shield } from 'lucide-react';
import { INGREDIENTS } from '@/lib/gameLogic'; // Ensure correct path!

// Simple local safe render for the Vendor to avoid import loops
const VendorIcon = ({ icon }) => {
    if (typeof icon === 'string') return <span className="text-3xl">{icon}</span>;
    if (typeof icon === 'function') {
        const Comp = icon; 
        return <Comp className="w-8 h-8" />;
    }
    return <Shield />;
};

const ReagentVendor = ({ inventory, onBuy, playerGold }) => {
  const stock = INGREDIENTS.filter(i => i.finite);

  return (
    <div className="w-full h-full p-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-amber-900/30 pb-4">
        <div className="flex items-center gap-3">
            <div className="bg-amber-900/20 p-2 rounded-lg border border-amber-700/30">
                <ShoppingBag className="w-6 h-6 text-amber-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-amber-100 font-serif tracking-wide">The Black Market</h2>
                <p className="text-xs text-amber-700/60 uppercase tracking-widest">Rare Imports & Contraband</p>
            </div>
        </div>
        <div className="flex items-center gap-2 text-amber-300 bg-black/40 px-4 py-2 rounded-lg border border-amber-900/50 shadow-inner">
            <Coins size={16} />
            <span className="font-mono font-bold text-lg">{playerGold}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {stock.map((ing) => {
          // Safety check for inventory
          const count = inventory && inventory[ing.name] ? inventory[ing.name] : 0;
          const canAfford = playerGold >= ing.cost;
          
          return (
            <div 
              key={ing.name}
              className="group relative bg-[#1c1917] border border-[#44403c] p-4 rounded-xl shadow-lg flex flex-col gap-3 hover:border-amber-600/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300"
            >
              <div className="flex justify-between items-start z-10">
                  <div className="flex items-center gap-4">
                      {/* ICON RENDERER */}
                      <div className="w-14 h-14 bg-black/40 flex items-center justify-center rounded-lg border border-white/5 shadow-inner group-hover:scale-110 transition-transform">
                          <VendorIcon icon={ing.icon} />
                      </div>
                      
                      <div>
                          <h3 className="font-bold text-stone-200 font-serif tracking-wide group-hover:text-amber-100 transition-colors">{ing.name}</h3>
                          <div className="text-[10px] text-stone-500 uppercase tracking-wider font-bold mt-1 flex items-center gap-2">
                              <Package size={10} />
                              In Stock: <span className={count > 0 ? "text-emerald-400" : "text-stone-600"}>{count}</span>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Tags */}
              <div className="flex gap-1.5 flex-wrap my-1">
                  {ing.tags.map(t => (
                      <span key={t} className="text-[9px] px-2 py-0.5 bg-black/40 text-stone-400 rounded-sm border border-white/5 uppercase tracking-wider">
                          {t}
                      </span>
                  ))}
              </div>
              
              <p className="text-xs text-stone-600 italic leading-relaxed h-8 overflow-hidden">
                  "{ing.description}"
              </p>

              <button
                  onClick={() => onBuy(ing)}
                  disabled={!canAfford}
                  className={`
                      mt-auto w-full py-3 px-4 rounded-lg flex items-center justify-between text-xs font-bold uppercase tracking-widest transition-all
                      ${canAfford 
                          ? 'bg-gradient-to-r from-amber-900/80 to-amber-800/80 text-amber-100 border border-amber-700/50 hover:from-amber-700 hover:to-amber-600 hover:border-amber-400 shadow-md' 
                          : 'bg-stone-900 text-stone-600 border border-stone-800 cursor-not-allowed opacity-50'
                      }
                  `}
              >
                  <span>Acquire</span>
                  <span className="flex items-center gap-1">
                      {ing.cost} <span className={canAfford ? "text-amber-300" : "text-stone-600"}>G</span>
                  </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReagentVendor;