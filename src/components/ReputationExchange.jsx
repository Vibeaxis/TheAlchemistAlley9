import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Coins, Crown, Megaphone, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FAVORS = [
  {
    id: 'bribe',
    name: 'Bribe Watch Captain',
    cost: 20, // Rep Cost
    icon: Shield,
    description: 'Clear all suspicion. Resets Heat to 0 immediately.',
    action: (game) => game.setHeat(0)
  },
  {
    id: 'crier',
    name: 'Hire Town Crier',
    cost: 15,
    icon: Megaphone,
    description: 'Spread rumors of your genius. +20% Gold for the rest of the day.',
    action: (game) => game.addBuff('marketing', 1) // 1 day duration
  },
  {
    id: 'seal',
    name: 'Guild Certification',
    cost: 50,
    icon: Crown,
    description: 'Official recognition. Permanent +5 Gold on every sale.',
    action: (game) => game.setUpgrades(u => ({ ...u, merchant: true }))
  }
];

const ReputationExchange = ({ isOpen, onClose, gold, setGold, reputation, setReputation, heat, setHeat, upgrades, setUpgrades, addBuff }) => {
  if (!isOpen) return null;

  const handleDonate = () => {
    if (gold >= 50) {
      setGold(g => g - 50);
      setReputation(r => r + 5);
    }
  };

  const handlePurchaseFavor = (favor) => {
    if (reputation >= favor.cost) {
      setReputation(r => r - favor.cost);
      // Execute the favor's logic
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
        {/* Header */}
        <div className="bg-[#292524] p-6 border-b border-[#44403c] flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/20 rounded border border-blue-900/50">
                    <Shield className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-amber-100 font-serif">City Influence</h2>
                    <p className="text-xs text-stone-500 uppercase tracking-widest">Spend Reputation • Gain Favors</p>
                </div>
            </div>
            <button onClick={onClose} className="text-stone-500 hover:text-stone-300"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-8">
            {/* 1. DONATION (Gold -> Rep) */}
            <div className="bg-black/20 p-4 rounded-lg border border-white/5 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                        <Heart size={16} /> Civic Donation
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">Donate to the poor to improve your image.</p>
                </div>
                <Button 
                    onClick={handleDonate} 
                    disabled={gold < 50}
                    className="bg-emerald-900/50 hover:bg-emerald-800 border border-emerald-700/50 text-emerald-100"
                >
                    Donate 50g (+5 Rep)
                </Button>
            </div>

            <div className="h-px bg-[#44403c]" />

            {/* 2. FAVORS (Rep -> Buffs) */}
            <div>
                <h4 className="text-xs font-bold uppercase text-stone-500 mb-4 tracking-widest">Political Favors</h4>
                <div className="space-y-3">
                    {FAVORS.map(favor => {
                        const canAfford = reputation >= favor.cost;
                        const isOwned = favor.id === 'seal' && upgrades.merchant; // Check if one-time upgrade is owned

                        return (
                            <div key={favor.id} className="flex justify-between items-start group">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded bg-black/40 ${canAfford ? 'text-amber-400' : 'text-stone-600'}`}>
                                        <favor.icon size={18} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-stone-300 group-hover:text-amber-100 transition-colors">
                                            {favor.name}
                                        </div>
                                        <div className="text-[10px] text-stone-500 max-w-[200px] leading-tight mt-0.5">
                                            {favor.description}
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    size="sm"
                                    disabled={!canAfford || isOwned}
                                    onClick={() => handlePurchaseFavor(favor)}
                                    className={`text-xs ${isOwned ? 'bg-green-900/20 text-green-500 border-green-900' : canAfford ? 'bg-blue-900/30 text-blue-300 border-blue-800 hover:bg-blue-800' : 'bg-stone-800 text-stone-600 opacity-50'}`}
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