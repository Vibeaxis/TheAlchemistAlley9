
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Beer, Moon, UserMinus, UserPlus, Coins, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundEngine } from '@/lib/SoundEngine';
import { HIREABLE_NPCS } from '@/lib/NPCData';
import { UPGRADES_LIST } from '@/lib/gameLogic';

const TavernHub = ({
  gold,
  setGold,
  upgrades,
  setUpgrades,
  apprentice,
  setApprentice,
  day,
  onRest,
  volume = 1.0
}) => {
  const [randomHireables] = useState(() => {
    // Select 3 random unique NPCs
    const shuffled = [...HIREABLE_NPCS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  });

  const handleHire = (npc) => {
    if (gold >= 50 && !apprentice.hired) {
      soundEngine.playGold(volume);
      setGold(g => g - 50);
      setApprentice({
        hired: true,
        npcId: npc.id,
        npcName: npc.name,
        npcClass: npc.class,
        icon: npc.icon,
        passiveAbility: npc.passiveAbility,
        activeAbility: npc.activeAbility
      });
    } else {
      soundEngine.playFail(volume);
    }
  };

  const handleDismiss = () => {
    soundEngine.playGold(volume); // Sound of refund
    setGold(g => g + 25);
    setApprentice({ hired: false, npcId: null, npcName: null, npcClass: null });
  };

  const handlePurchaseUpgrade = (upgradeId, cost) => {
    if (gold >= cost && !upgrades[upgradeId]) {
      soundEngine.playGold(volume);
      setGold(prev => prev - cost);
      setUpgrades(prev => ({ ...prev, [upgradeId]: true }));
    } else {
        soundEngine.playFail(volume);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-slate-900 text-amber-500 p-8 flex flex-col items-center"
    >
      <div className="w-full max-w-7xl mx-auto space-y-12 pb-24">
        
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
            <div className='inline-block p-4 bg-slate-800 rounded-full border border-amber-900/50 shadow-2xl'>
                <Beer className='w-12 h-12 text-amber-600' />
            </div>
            <h1 className="text-5xl font-bold font-serif text-amber-500 tracking-tight">The Alchemist's Respite</h1>
            <p className="text-amber-500/60 text-xl">Rest, trade, and hire help for the trials ahead.</p>
            
            <div className="flex justify-center gap-6 mt-4">
                <div className="px-6 py-2 bg-slate-800 rounded-full border border-amber-500/30 flex items-center gap-2">
                    <Coins className="text-amber-400 w-5 h-5" />
                    <span className="text-xl font-bold text-amber-100">{gold}g</span>
                </div>
                <div className="px-6 py-2 bg-slate-800 rounded-full border border-indigo-500/30 flex items-center gap-2">
                    <Moon className="text-indigo-400 w-5 h-5" />
                    <span className="text-xl font-bold text-indigo-100">Night {day}</span>
                </div>
            </div>
        </div>

        {/* 3 Columns Layout */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* COLUMN 1: THE BAR (Upgrades) */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-400 border-b border-amber-500/30 pb-4 flex items-center gap-3">
                    <Coins className="w-6 h-6" />
                    The Bar (Black Market)
                </h2>
                <div className="space-y-4">
                    {UPGRADES_LIST.map((item) => {
                        const isPurchased = upgrades[item.id];
                        const canAfford = gold >= item.cost;
                        const Icon = item.icon;
                        
                        return (
                            <motion.div 
                                key={item.id}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    isPurchased 
                                    ? 'bg-green-950/20 border-green-600/30' 
                                    : canAfford 
                                        ? 'bg-slate-800/50 border-amber-500/20 hover:border-amber-500/60' 
                                        : 'bg-slate-900 border-slate-800 opacity-60'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold ${isPurchased ? 'text-green-400' : 'text-slate-200'}`}>{item.name}</h3>
                                    {isPurchased ? (
                                        <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">OWNED</span>
                                    ) : (
                                        <span className="text-sm font-bold text-amber-400">{item.cost}g</span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-400 mb-4">{item.description}</p>
                                <Button
                                    size="sm"
                                    onClick={() => handlePurchaseUpgrade(item.id, item.cost)}
                                    disabled={isPurchased || !canAfford}
                                    className={`w-full ${isPurchased ? 'hidden' : ''} ${canAfford ? 'bg-amber-700 hover:bg-amber-600' : 'bg-slate-700'}`}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    Buy
                                </Button>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* COLUMN 2: THE TABLE (Apprentice) */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-indigo-400 border-b border-indigo-500/30 pb-4 flex items-center gap-3">
                    <Beer className="w-6 h-6" />
                    The Apprentice Table
                </h2>
                
                <div className="min-h-[300px] bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                    {apprentice.hired ? (
                        <div className="space-y-6 w-full relative z-10">
                            <div className="w-24 h-24 bg-slate-800 rounded-full mx-auto border-4 border-indigo-500 flex items-center justify-center shadow-lg">
                                {/* Use icon from state if available, otherwise generic */}
                                {apprentice.icon ? <apprentice.icon className="w-12 h-12 text-indigo-400" /> : <Beer className="w-12 h-12 text-indigo-400" />}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-indigo-100">{apprentice.npcName}</h3>
                                <p className="text-indigo-400 font-mono text-sm uppercase tracking-widest">{apprentice.npcClass}</p>
                            </div>
                            
                            <div className="bg-slate-900/80 p-4 rounded-lg text-left text-sm space-y-2 border border-slate-700">
                                <p><span className="text-indigo-400 font-bold">Passive:</span> <span className="text-slate-300">{apprentice.passiveAbility?.description}</span></p>
                                <p><span className="text-indigo-400 font-bold">Active:</span> <span className="text-slate-300">{apprentice.activeAbility?.description}</span></p>
                            </div>

                            <Button 
                                variant="destructive" 
                                onClick={handleDismiss}
                                className="w-full bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-200"
                            >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Dismiss (Refund 25g)
                            </Button>
                        </div>
                    ) : (
                        <div className="text-slate-500 space-y-4">
                            <UserPlus className="w-16 h-16 mx-auto opacity-20" />
                            <p className="text-lg">No Apprentice Hired</p>
                            <p className="text-sm max-w-xs mx-auto">Hire an apprentice from the crowd to gain unique bonuses during your workday.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* COLUMN 3: THE CROWD (Hiring) */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-amber-400 border-b border-amber-500/30 pb-4 flex items-center gap-3">
                    <UserPlus className="w-6 h-6" />
                    The Crowd (Hire Help)
                </h2>
                
                <div className="space-y-4">
                    {randomHireables.map((npc) => {
                         const NpcIcon = npc.icon;
                         const canAfford = gold >= 50;
                         
                         return (
                            <motion.div 
                                key={npc.id}
                                className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl flex gap-4 hover:bg-slate-800 transition-colors group"
                            >
                                <div className={`w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-600 ${npc.color} shrink-0`}>
                                    <NpcIcon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-slate-200 truncate">{npc.name}</h4>
                                        <span className="text-xs font-mono text-slate-500">{npc.class}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-2 my-1">{npc.description}</p>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-sm font-bold text-amber-500">50g</span>
                                        <Button
                                            size="sm"
                                            disabled={apprentice.hired || !canAfford}
                                            onClick={() => handleHire(npc)}
                                            className="bg-indigo-600 hover:bg-indigo-500 h-7 text-xs"
                                        >
                                            Hire
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                         );
                    })}
                </div>
            </div>

        </div>

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <Button
            size="lg"
            onClick={onRest}
            onMouseEnter={() => soundEngine.playHover(volume)}
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-2xl shadow-amber-900/50 px-8 py-8 rounded-2xl text-xl font-bold transition-transform hover:scale-105"
        >
            Rest & Start Day {day + 1}
            <ArrowRight className="w-6 h-6 ml-3" />
        </Button>
      </div>

    </motion.div>
  );
};

export default TavernHub;
