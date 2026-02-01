import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Megaphone, Crown, Heart, X, Star, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REP_RANKS, getRank } from '@/lib/ReputationData'; // Import the logic above

const FAVORS = [
  {
    id: 'bribe',
    name: 'Bribe Watch Captain',
    cost: 20,
    minRank: 0,
    icon: Shield,
    description: 'Clear all suspicion. Resets Heat to 0 immediately.',
    action: (game) => game.setHeat(0)
  },
  {
    id: 'crier',
    name: 'Hire Town Crier',
    cost: 15,
    minRank: 1, // Requires "Citizen"
    icon: Megaphone,
    description: 'Spread rumors of your genius. +20% Gold for the rest of the day.',
    action: (game) => game.addBuff('marketing', 1)
  },
  {
    id: 'seal',
    name: 'Guild Certification',
    cost: 50,
    minRank: 2, // Requires "Merchant"
    icon: Crown,
    description: 'Official recognition. Permanent +5 Gold on every sale.',
    action: (game) => game.setUpgrades(u => ({ ...u, merchant: true }))
  }
];

const ReputationExchange = ({ isOpen, onClose, gold, setGold, reputation, setReputation, heat, setHeat, upgrades, setUpgrades, addBuff }) => {
  if (!isOpen) return null;

  const currentRank = getRank(reputation);
  const nextRank = REP_RANKS[currentRank.level + 1];
  const progress = nextRank 
    ? ((reputation - currentRank.minRep) / (nextRank.minRep - currentRank.minRep)) * 100 
    : 100;

  const handleDonate = () => {
    if (gold >= 50) {
      setGold(g => g - 50);
      setReputation(r => r + 10); // Leveling up the rep gain
    }
  };

  const handlePurchaseFavor = (favor) => {
    if (reputation >= favor.cost && currentRank.level >= favor.minRank) {
      setReputation(r => r - favor.cost);
      favor.action({ setHeat, setUpgrades, addBuff });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="bg-[#1c1917] border border-[#44403c] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* PROGRESS HEADER */}
        <div className="bg-[#292524] p-6 border-b border-[#44403c]">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-full border border-amber-500/30">
                        <Star className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold font-serif ${currentRank.color}`}>
                            {currentRank.name} Rank
                        </h2>
                        <p className="text-xs text-stone-500">Current Influence: {reputation} Rep</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-stone-500 hover:text-stone-300"><X size={24} /></button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase tracking-tighter text-stone-400 font-bold">
                    <span>{currentRank.name}</span>
                    <span>{nextRank ? `Next: ${nextRank.name}` : 'MAX RANK'}</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400"
                    />
                </div>
                <p className="text-[10px] text-amber-200/50 italic text-center">
                    Bonus: {currentRank.bonus}
                </p>
            </div>
        </div>

        <div className="p-6 space-y-6">
            {/* DONATION SECTION */}
            <div className="bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/30 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
                        <Heart size={14} /> Civic Donation
                    </h3>
                    <p className="text-[11px] text-stone-400 mt-0.5">Gain 10 reputation for 50 gold.</p>
                </div>
                <Button 
                    onClick={handleDonate} 
                    disabled={gold < 50}
                    size="sm"
                    className="bg-emerald-800/40 hover:bg-emerald-700 text-emerald-100 border border-emerald-600/50"
                >
                    Donate 50g
                </Button>
            </div>

            {/* FAVORS LIST */}
            <div>
                <h4 className="text-[10px] font-bold uppercase text-stone-500 mb-4 tracking-widest">Available Favors</h4>
                <div className="space-y-4">
                    {FAVORS.map(favor => {
                        const isLocked = currentRank.level < favor.minRank;
                        const canAfford = reputation >= favor.cost;
                        const isOwned = favor.id === 'seal' && upgrades.merchant;

                        return (
                            <div key={favor.id} className={`flex justify-between items-center ${isLocked ? 'opacity-50' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded ${isLocked ? 'bg-stone-900' : 'bg-black/40 text-amber-400'}`}>
                                        {isLocked ? <Lock size={16} /> : <favor.icon size={18} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-stone-200">{favor.name}</span>
                                            {isLocked && (
                                                <span className="text-[9px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-400 uppercase">
                                                    Req. {REP_RANKS[favor.minRank].name}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-stone-500 leading-tight">{favor.description}</p>
                                    </div>
                                </div>
                                <Button 
                                    size="sm"
                                    disabled={!canAfford || isOwned || isLocked}
                                    onClick={() => handlePurchaseFavor(favor)}
                                    className={`text-[10px] h-8 px-3 ${
                                        isOwned ? 'bg-green-900/20 text-green-500' : 
                                        isLocked ? 'bg-stone-900 text-stone-600' :
                                        canAfford ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-800 border border-blue-800' : 
                                        'bg-stone-800 text-stone-600'
                                    }`}
                                >
                                    {isOwned ? 'Active' : `${favor.cost} Rep`}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ReputationExchange;