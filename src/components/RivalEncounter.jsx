import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Skull, Shield, Coins, Zap, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RivalEncounter = ({ rival, encounter, onResolve }) => {
  const [result, setResult] = useState(null);

  const handleChoose = (option) => {
    // 1. Calculate Outcome
    let outcome = option.result; // Default to the safe result
    
    if (option.type === 'risky') {
        const roll = Math.random();
        outcome = roll > option.risk ? option.success : option.fail;
    }

    // 2. Show Result State
    setResult(outcome);

    // 3. Delay then close
    setTimeout(() => {
        onResolve(outcome.effect);
    }, 2500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
    >
      {/* Cinematic Bars */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-black z-0" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-black z-0" />

      <motion.div 
        initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl bg-[#1c1917] border border-red-900/50 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.2)]"
      >
        <div className="flex flex-col md:flex-row h-[500px]">
            
            {/* LEFT: RIVAL VISUAL */}
            <div className="w-full md:w-1/2 bg-gradient-to-b from-red-950/20 to-black relative overflow-hidden flex flex-col items-center justify-end border-b md:border-b-0 md:border-r border-red-900/30">
                <div className="absolute top-4 left-4 z-20">
                    <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest bg-black/50 px-2 py-1 rounded">Rival Intrusion</h3>
                </div>
                
                {/* Avatar */}
                <img 
                    src={`https://api.dicebear.com/9.x/notionists/svg?seed=${rival.avatarSeed}&backgroundColor=transparent`}
                    alt="Rival"
                    className="h-[80%] w-auto object-contain drop-shadow-[0_0_30px_rgba(220,38,38,0.5)] z-10"
                />
                
                {/* Nameplate */}
                <div className="w-full bg-black/80 p-4 text-center z-20 border-t border-red-900/30">
                    <h2 className="text-xl font-bold text-stone-200">{rival.name}</h2>
                    <div className="flex gap-1 justify-center mt-1">
                        {[...Array(rival.health)].map((_, i) => (
                            <div key={i} className="w-2 h-2 rounded-full bg-red-500" />
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT: INTERACTION */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between relative">
                
                {/* RESULT OVERLAY (Shows after choice) */}
                {result && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/90 z-30 flex flex-col items-center justify-center p-8 text-center"
                    >
                        <h3 className="text-2xl font-bold text-amber-100 mb-4">{result.text}</h3>
                        <p className="text-stone-500 animate-pulse">Resolving...</p>
                    </motion.div>
                )}

                {/* Encounter Text */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-red-400 font-serif border-b border-red-900/30 pb-2">
                        {encounter.title}
                    </h3>
                    <p className="text-lg text-stone-300 italic leading-relaxed">
                        "{encounter.text(rival)}"
                    </p>
                </div>

                {/* Choices */}
                <div className="space-y-3 mt-8">
                    {encounter.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleChoose(opt)}
                            className="w-full p-4 rounded bg-[#292524] border border-white/5 hover:bg-[#44403c] hover:border-amber-500/50 transition-all text-left group flex items-center justify-between"
                        >
                            <div>
                                <div className="font-bold text-stone-200 group-hover:text-amber-100">{opt.label}</div>
                                <div className="text-xs text-stone-500 uppercase tracking-wider mt-1">
                                    {opt.type === 'risky' ? `Risk: ${(opt.risk * 100)}%` : 'Safe'} 
                                    {opt.cost && ` • Cost: ${opt.cost}`}
                                    {opt.req && ` • Req: ${opt.req}`}
                                </div>
                            </div>
                            {opt.type === 'risky' && <Skull size={16} className="text-red-500 opacity-50" />}
                            {opt.type === 'safe' && <Shield size={16} className="text-emerald-500 opacity-50" />}
                            {opt.type === 'aggressive' && <Zap size={16} className="text-purple-500 opacity-50" />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RivalEncounter;