import React, { useState, isValidElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beer, UserPlus, Coins, ArrowRight, ShoppingBag, Shield, Zap, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundEngine } from '@/lib/SoundEngine';
import { HIREABLE_NPCS } from '@/lib/NPCData';
import { UPGRADES_LIST } from '@/lib/gameLogic';
import ReagentVendor from '@/components/ReagentVendor';
import ApprenticeMissions from './ApprenticeMissions'; // Import the new file
// --- SAFE ICON RENDERER ---
const RenderIcon = ({ icon, className }) => {
    // 1. Missing?
    if (!icon) return <Shield className={className} />;

    // 2. Already an Element? (e.g. <Beer />) -> Just Clone it with new classes
    if (isValidElement(icon)) {
        return React.cloneElement(icon, { className });
    }

    // 3. String? (Emoji) -> Render as text
    if (typeof icon === 'string') {
        return <span className={`${className} flex items-center justify-center not-italic leading-none`}>{icon}</span>;
    }

    // 4. Component? (Lucide Function) -> Render as JSX
    if (typeof icon === 'function') {
        const IconComponent = icon;
        return <IconComponent className={className} />;
    }

    // Fallback
    return <Shield className={className} />;
};

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
  inventory, 
  onBuyReagent,
  onAssignMission
}) => {
  const [activeTab, setActiveTab] = useState('market');

  const [randomHireables] = useState(() => {
    const list = HIREABLE_NPCS || [];
    const shuffled = [...list].sort(() => 0.5 - Math.random());
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
    setApprentice({ hired: false, npcId: null, npcName: null, npcClass: null, icon: null });
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
      {/* HEADER */}
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
             <Button size="lg" onClick={onRest} className="bg-amber-700 hover:bg-amber-600 text-white font-bold">
                Start Day {day + 1} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
         </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex gap-6 p-6 h-[calc(100vh-80px)]">
         
         {/* SIDEBAR */}
         <div className="w-64 shrink-0 flex flex-col gap-2">
            <NavButton active={activeTab === 'market'} onClick={() => setActiveTab('market')} icon={ShoppingBag} label="Black Market" desc="Buy Rare Reagents" />
            <NavButton active={activeTab === 'upgrades'} onClick={() => setActiveTab('upgrades')} icon={Zap} label="Workshop" desc="Shop Upgrades" />
            <NavButton active={activeTab === 'hire'} onClick={() => setActiveTab('hire')} icon={UserPlus} label="Recruit" desc="Hire Apprentices" />
            <NavButton 
                active={activeTab === 'missions'} 
                onClick={() => setActiveTab('missions')} 
                icon={ShieldAlert} 
                label="Covert Ops" 
                desc="Send Apprentice" 
            />
            {/* Active Apprentice */}
            <div className="mt-auto bg-[#1c1917] p-4 rounded-xl border border-amber-900/30">
                <h4 className="text-xs font-bold uppercase text-stone-500 mb-2">Active Apprentice</h4>
                {apprentice.hired ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-900/50 rounded-full flex items-center justify-center border border-indigo-500/30 overflow-hidden">
                             <RenderIcon icon={apprentice.icon} className="w-5 h-5 text-indigo-400" />
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

         {/* PANEL */}
         <div className="flex-1 bg-[#141210] border border-[#292524] rounded-2xl shadow-2xl overflow-hidden relative">
            
            {/* 1. VENDOR */}
            {activeTab === 'market' && (
                <ReagentVendor inventory={inventory} onBuy={onBuyReagent} playerGold={gold} />
            )}
{activeTab === 'missions' && (
                <ApprenticeMissions 
                    apprentice={apprentice} 
                    onAssignMission={onAssignMission} 
                    gold={gold} 
                />
            )}
            {/* 2. UPGRADES */}
            {activeTab === 'upgrades' && (
                <div className="p-8 h-full overflow-y-auto custom-scrollbar">
                    <h2 className="text-2xl font-bold text-amber-100 font-serif mb-6 flex items-center gap-2">
                        <Zap className="text-amber-500" /> Workshop Upgrades
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {(UPGRADES_LIST || []).map((item) => {
                            const isPurchased = upgrades[item.id];
                            const canAfford = gold >= item.cost;
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
                                                <RenderIcon icon={item.icon} className="w-5 h-5" />
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

            {/* 3. RECRUIT */}
            {activeTab === 'hire' && (
                <div className="p-8 h-full overflow-y-auto custom-scrollbar flex flex-col">
                    <h2 className="text-2xl font-bold text-indigo-200 font-serif mb-6 flex items-center gap-2">
                        <UserPlus className="text-indigo-500" /> Recruit Help
                    </h2>

                    {apprentice.hired ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                             <div className="w-24 h-24 rounded-full bg-indigo-900/20 flex items-center justify-center mb-4 overflow-hidden border border-indigo-500/30">
                                <RenderIcon icon={apprentice.icon} className="w-12 h-12 text-indigo-500" />
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
                                const canAfford = gold >= 50;
                                return (
                                    <div key={npc.id} className="bg-[#1c1917] border border-[#292524] p-4 rounded-xl flex gap-4 hover:border-indigo-500/30 transition-all group">
                                        <div className={`w-14 h-14 rounded-full bg-black/40 flex items-center justify-center border border-white/5 ${npc.color} shrink-0 overflow-hidden`}>
                                            <RenderIcon icon={npc.icon} className="w-7 h-7" />
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

const NavButton = ({ active, onClick, icon, label, desc }) => (
    <button
        onClick={onClick}
        className={`
            text-left p-4 rounded-xl transition-all flex items-center gap-4 group w-full
            ${active 
                ? 'bg-amber-900/20 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                : 'bg-transparent border border-transparent hover:bg-white/5'
            }
        `}
    >
        <div className={`p-2 rounded-lg ${active ? 'bg-amber-500 text-black' : 'bg-stone-800 text-stone-500 group-hover:text-stone-300'}`}>
            <RenderIcon icon={icon} className="w-5 h-5" />
        </div>
        <div>
            <div className={`font-bold ${active ? 'text-amber-100' : 'text-stone-400 group-hover:text-stone-200'}`}>{label}</div>
            <div className={`text-[10px] uppercase tracking-wider ${active ? 'text-amber-500' : 'text-stone-600'}`}>{desc}</div>
        </div>
    </button>
);

export default TavernHub;