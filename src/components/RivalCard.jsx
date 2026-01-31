import React from 'react';
import { motion } from 'framer-motion';
import { Skull, Shield, Coins, Zap } from 'lucide-react';

const RivalCard = ({ rival }) => {
  if (!rival) return (
    <div className="h-full flex items-center justify-center text-stone-600 italic border-2 border-dashed border-stone-800 rounded-xl p-8">
        No active rival... for now.
    </div>
  );

  return (
    <div className="relative bg-[#201c18] border-2 border-red-900/30 rounded-xl overflow-hidden shadow-2xl w-full max-w-sm mx-auto">
        {/* Header / Banner */}
        <div className="bg-red-950/80 p-3 text-center border-b border-red-900/50">
            <h3 className="text-red-200 font-bold uppercase tracking-widest text-sm">City Rival</h3>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
            
            {/* Avatar Frame */}
            <div className="relative w-32 h-32 mb-4">
                <div className="absolute inset-0 bg-red-500/10 rounded-full blur-xl animate-pulse" />
                <img 
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${rival.avatarSeed}&backgroundColor=transparent`}
                    alt="Rival"
                    className="relative w-full h-full object-contain drop-shadow-lg grayscale-[20%] contrast-125"
                />
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 bg-red-900 text-red-100 font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-[#201c18] shadow-lg">
                    {rival.level}
                </div>
            </div>

            {/* Name & Title */}
            <h2 className="text-xl font-bold text-stone-200 text-center">{rival.name}</h2>
            <p className="text-xs text-red-400 uppercase tracking-widest font-bold mb-6">{rival.archetype.name}</p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 w-full mb-6">
                <div className="bg-black/30 p-2 rounded border border-white/5 flex flex-col items-center">
                    <span className="text-[10px] text-stone-500 uppercase">Influence</span>
                    <span className="text-amber-400 font-mono font-bold">{(rival.marketShare * 100).toFixed(0)}%</span>
                </div>
                <div className="bg-black/30 p-2 rounded border border-white/5 flex flex-col items-center">
                    <span className="text-[10px] text-stone-500 uppercase">Defense</span>
                    <span className="text-stone-300 font-mono font-bold">{(rival.defense * 100).toFixed(0)}%</span>
                </div>
            </div>

            {/* Quirk / Trait */}
            <div className="w-full bg-red-900/10 border border-red-900/30 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                    <Zap size={14} className="text-red-400" />
                    <span className="text-xs font-bold text-red-200 uppercase">{rival.quirk.name}</span>
                </div>
                <p className="text-[10px] text-red-400/80 leading-tight">
                    {rival.quirk.desc}
                </p>
            </div>
        </div>

        {/* Footer Status */}
        <div className="bg-black/40 p-3 text-center text-[10px] text-stone-500 border-t border-white/5">
            KNOWN WEAKNESS: <span className="text-stone-300 font-bold">{rival.archetype.weakness}</span>
        </div>
    </div>
  );
};

export default RivalCard;