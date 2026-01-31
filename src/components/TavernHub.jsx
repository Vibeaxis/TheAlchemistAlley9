import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beer, Moon, UserMinus, UserPlus, Coins, ArrowRight, ShoppingBag, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundEngine } from '@/lib/SoundEngine';
import { HIREABLE_NPCS } from '@/lib/NPCData';
import { UPGRADES_LIST } from '@/lib/gameLogic';
import ReagentVendor from './ReagentVendor'; // <--- Import the new component

const TavernHub = ({
  gold,
  setGold,
  upgrades,
  setUpgrades,
  apprentice,
  setApprentice,
  day,
  onRest,
  volume = 1.0,
  // NEW PROPS FOR REAGENTS
  inventory, 
  onBuyReagent
}) => {
  const [activeTab, setActiveTab] = useState('market'); // Default to Market for quick access

  const [randomHireables] = useState(() => {
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
    soundEngine.playGold(volume);
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
      className="min-h-screen bg-[#0c0a09] text-amber-500 flex flex-col items-center overflow-hidden"
    >
      {/* 1. HEADER (Fixed Top) */}
      <div className="w-full bg-[#1c1917] border-b border-amber-900/30 p-4 flex justify-between items-center z-20 shadow-xl">
         <div className="flex items-center gap-4">
             <div className='p-3 bg-amber-900/20 rounded-lg border border-amber-900/50'>
                <Beer className='w-6 h-6 text-amber-600' />
            </div>
            <div>
                <h1 className="text-xl font-bold font-serif text-amber-100 tracking-wide">The Alchemist's Respite</h1>
                <p className="text-amber-700/60 text-xs uppercase tracking-widest">Safehouse • Night {day}</p>
            </div>
         </div>
         
         <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-amber-900/50">
                 <Coins className="text-amber-400 w-5 h-5" />
                 <span className="text-lg font-bold font-mono text-amber-100">{gold} G</span>
             </div>
             <Button
                size="lg"
                onClick={onRest}
                className="bg-amber-700 hover:bg-amber-600 text-white font-bold"
            >
                Start Day {day + 1} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
         </div>
      </div>

      {/* 2. MAIN CONTENT AREA (Flex Grow) */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex gap-6 p-6 h-[calc(100vh-80px)]">
         
         {/* SIDEBAR NAVIGATION */}
         <div className="w-64 shrink-0 flex flex-col gap-2">
            <NavButton 
                active={activeTab === 'market'} 
                onClick={() => setActiveTab('market')} 
                icon={ShoppingBag} 
                label="Black Market" 
                desc="Buy Rare Reagents"
            />
            <NavButton 
                active={activeTab === 'upgrades'} 
                onClick={() => setActiveTab('upgrades')} 
                icon={Zap} 
                label="Workshop" 
                desc="Shop Upgrades"
            />
            <NavButton 
                active={activeTab === 'hire'} 
                onClick={() => setActiveTab('hire')} 
                icon={UserPlus} 
                label="Recruit" 
                desc="Hire Apprentices"
            />
            
            {/* Active Apprentice Card (Mini) */}
            <div className="mt-auto bg-[#1c1917] p-4 rounded-xl border border-amber-900/30">
                <h4 className="text-xs font-bold uppercase text-stone-500 mb-2">Active Apprentice</h4>
                {apprentice.hired ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-900/50 rounded-full flex items-center justify-center border border-indigo-500/30">
                             {apprentice.icon ? <apprentice.icon size={20} className="text-indigo-400" /> : <Shield size={20} className="text-indigo-400" />}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-indigo-200">{apprentice.npcName}</div>
                            <div className="text-[10px] text-indigo-400/60 uppercase">{apprentice.npcClass}</div>
                        </div>
                    </div>
                ) : (
                    <div className="text-xs text-stone-600 italic">None hired.</div>
                )}
            </div>
         </div>

         {/* CONTENT PANEL */}
         <div className="flex-1 bg-[#141210] border border-[#292524] rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* TAB: BLACK MARKET (Reagents) */}
            {activeTab === 'market' && (
                <ReagentVendor 
                    inventory={inventory} 
                    onBuy={onBuyReagent} 
                    playerGold={gold} 
                />
            )}

            {/* TAB: WORKSHOP (Upgrades) */}
            {activeTab === 'upgrades' && (
                <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                    <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6 flex items-center gap-2">
                        <Zap className="text-amber-500" /> Workshop Upgrades
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {UPGRADES_LIST.map((item) => {
                            const isPurchased = upgrades[item.id];
                            const canAfford = gold >= item.cost;
                            const Icon = item.icon;
                            return (
                                <button 
                                    key={item.id}
                                    onClick={() => handlePurchaseUpgrade(item.id, item.cost)}
                                    disabled={isPurchased || !canAfford}
                                    className={`
                                        text-left p-4 rounded-xl border-2 transition-all group relative overflow-hidden
                                        ${isPurchased 
                                            ? 'bg-emerald-950/20 border-emerald-900/50 opacity-60' 
                                            : canAfford 
                                                ? 'bg-[#1c1917] border-amber-900/30 hover:border-amber-500 hover:shadow-lg' 
                                                : 'bg-[#1c1917] border-[#292524] opacity-50 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded bg-black/40 ${isPurchased ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                <Icon size={20} />
                                            </div>
                                            <h3 className={`font-bold ${isPurchased ? 'text-emerald-500' : 'text-stone-200'}`}>{item.name}</h3>
                                        </div>
                                        <div className="font-mono font-bold text-sm">
                                            {isPurchased ? <span className="text-emerald-500">OWNED</span> : <span className={canAfford ? "text-amber-400" : "text-stone-600"}>{item.cost} G</span>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-stone-500 ml-[3.25rem] leading-relaxed relative z-10">{item.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB: RECRUIT (Apprentices) */}
            {activeTab === 'hire' && (
                <div className="p-8 h-full overflow-y-auto custom-scrollbar flex flex-col">
                    <h2 className="text-2xl font-bold text-indigo-200 font-serif mb-6 flex items-center gap-2">
                        <UserPlus className="text-indigo-500" /> Recruit Help
                    </h2>

                    {apprentice.hired ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                             <div className="w-24 h-24 rounded-full bg-indigo-900/20 flex items-center justify-center mb-4">
                                <Shield size={48} className="text-indigo-500" />
                             </div>
                             <h3 className="text-xl font-bold text-indigo-200">Staff Full</h3>
                             <p className="text-sm text-indigo-400/60 mt-2 max-w-md">You already have an apprentice. Dismiss them to hire someone new.</p>
                             <Button 
                                variant="destructive" 
                                className="mt-6 bg-red-900/30 text-red-400 border border-red-900 hover:bg-red-900"
                                onClick={handleDismiss}
                            >
                                Dismiss {apprentice.npcName}
                             </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {randomHireables.map((npc) => {
                                const NpcIcon = npc.icon;
                                const canAfford = gold >= 50;
                                return (
                                    <div key={npc.id} className="bg-[#1c1917] border border-[#292524] p-4 rounded-xl flex gap-4 hover:border-indigo-500/30 transition-all group">
                                        <div className={`w-14 h-14 rounded-full bg-black/40 flex items-center justify-center border border-white/5 ${npc.color} shrink-0`}>
                                            <NpcIcon className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-stone-200 text-lg">{npc.name}</h4>
                                                    <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest">{npc.class}</span>
                                                </div>
                                                <Button 
                                                    size="sm"
                                                    disabled={!canAfford}
                                                    onClick={() => handleHire(npc)}
                                                    className={`h-8 ${canAfford ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-stone-800'}`}
                                                >
                                                    Hire (50g)
                                                </Button>
                                            </div>
                                            <p className="text-sm text-stone-500 mt-2 italic">"{npc.description}"</p>
                                            <div className="mt-3 flex gap-4 text-xs">
                                                <div className="flex items-center gap-1 text-stone-400">
                                                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                                    <b>Passive:</b> {npc.passiveAbility.description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
         </div>
      </div>
    </motion.div>
  );
};

// Helper Sub-component for Nav Buttons
const NavButton = ({ active, onClick, icon: Icon, label, desc }) => (
    <button
        onClick={onClick}
        className={`
            text-left p-4 rounded-xl transition-all flex items-center gap-4 group
            ${active 
                ? 'bg-amber-900/20 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                : 'bg-transparent border border-transparent hover:bg-white/5'
            }
        `}
    >
        <div className={`p-2 rounded-lg ${active ? 'bg-amber-500 text-black' : 'bg-stone-800 text-stone-500 group-hover:text-stone-300'}`}>
            <Icon size={20} />
        </div>
        <div>
            <div className={`font-bold ${active ? 'text-amber-100' : 'text-stone-400 group-hover:text-stone-200'}`}>{label}</div>
            <div className={`text-[10px] uppercase tracking-wider ${active ? 'text-amber-500' : 'text-stone-600'}`}>{desc}</div>
        </div>
    </button>
);

export default TavernHub;