import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Book, Beaker, History, CheckCircle, AlertTriangle, Skull, Crown, Star, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INGREDIENTS } from '@/lib/gameLogic';

// --- MAIN QUEST DATA ---
const QUEST_STEPS = [
  {
    id: 'step1',
    title: 'The Alchemist\'s Initiation',
    description: 'Establish yourself in the city. Prove your worth to the common folk.',
    requirement: 'Reach 50 Reputation',
    isComplete: (stats) => stats.reputation >= 50,
    reward: 'Unlock "Market" Access (Lower Prices)'
  },
  {
    id: 'step2',
    title: 'The Shadow Bargain',
    description: 'A shadowy figure demands a show of loyalty. Brew 3 poisons without getting caught.',
    requirement: 'Brew 3 Toxic Potions',
    isComplete: (stats) => stats.toxicBrews >= 3,
    reward: 'Unlock "Nightshade" Supplier'
  },
  {
    id: 'step3',
    title: 'The Magnum Opus',
    description: 'Combine the rarest essences to create the Elixir of Life.',
    requirement: 'Discover "Moonstone" & "Bloodroot"',
    isComplete: (stats) => stats.discoveredIngredients?.Moonstone && stats.discoveredIngredients?.Bloodroot,
    reward: 'Game Victory (Eternal Life)'
  }
];

const BlackBook = ({ isOpen, onClose, discoveredIngredients, brewHistory, reputation }) => {
  const [activeTab, setActiveTab] = useState('quest');

  const variants = {
    open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '100%', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  const getResultColor = (result) => {
    switch(result) {
      case 'cured': return 'text-emerald-400 border-emerald-900/30 bg-emerald-950/20';
      case 'poisoned': return 'text-red-400 border-red-900/30 bg-red-950/20';
      case 'exploded': return 'text-orange-400 border-orange-900/30 bg-orange-950/20';
      default: return 'text-slate-400 border-slate-800 bg-slate-900/50';
    }
  };

  const getResultIcon = (result) => {
    switch(result) {
      case 'cured': return <CheckCircle className="w-4 h-4" />;
      case 'poisoned': return <Skull className="w-4 h-4" />;
      case 'exploded': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  const currentStats = {
      reputation: reputation || 0,
      toxicBrews: brewHistory.filter(b => b.result === 'poisoned').length,
      discoveredIngredients: discoveredIngredients || {}
  };

  return (
    <motion.div
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={variants}
      className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-[#1a1614] border-l-4 border-[#2c241b] shadow-2xl z-[60] overflow-hidden flex flex-col font-serif"
    >
      {/* Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }} />

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-amber-900/20 bg-[#241f1a]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-950 rounded border border-amber-900/50">
             <Book className="w-6 h-6 text-amber-500" />
          </div>
          <div>
              <h2 className="text-2xl font-bold text-amber-100/90 tracking-wide">Grimoire</h2>
              <p className="text-xs text-amber-500/60 uppercase tracking-widest">Personal Records</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-amber-950 text-amber-700 hover:text-amber-500">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-900/20 bg-[#1e1a16]">
        {[
            { id: 'quest', label: 'Great Work', icon: Crown },
            { id: 'ingredients', label: 'Compendium', icon: Beaker },
            { id: 'history', label: 'Ledger', icon: History },
        ].map(tab => (
            <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 text-xs md:text-sm font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 relative overflow-hidden
                ${activeTab === tab.id ? 'text-amber-200 bg-amber-950/30' : 'text-amber-900/60 hover:text-amber-500 hover:bg-amber-950/10'}`}
            >
                <tab.icon className="w-4 h-4" /> 
                {tab.label}
                {activeTab === tab.id && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500" />}
            </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-amber-900/20 scrollbar-track-[#1a1614]">
        
        {/* TAB 1: QUESTS */}
        {activeTab === 'quest' && (
          <div className="space-y-8">
             <div className="text-center space-y-2 mb-8">
                <h3 className="text-xl text-amber-500 font-bold uppercase tracking-widest border-b border-amber-900/30 pb-2 inline-block">The Magnum Opus</h3>
                <p className="text-amber-900/60 text-sm italic">"The path to eternal life is paved with successful brews."</p>
             </div>
             <div className="relative pl-4 border-l-2 border-amber-900/20 space-y-12">
                {QUEST_STEPS.map((step, index) => {
                    const completed = step.isComplete(currentStats);
                    const locked = index > 0 && !QUEST_STEPS[index - 1].isComplete(currentStats);
                    return (
                        <div key={step.id} className={`relative ${locked ? 'opacity-50 grayscale' : 'opacity-100'}`}>
                            <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${completed ? 'bg-amber-500 border-amber-500' : 'bg-[#1a1614] border-amber-900/40'}`} />
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-lg font-bold ${completed ? 'text-amber-200 line-through decoration-amber-900/50' : 'text-amber-100'}`}>{step.title}</h4>
                                {locked && <Lock className="w-4 h-4 text-amber-900" />}
                                {completed && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                            </div>
                            <p className="text-amber-700/80 text-sm mb-3 leading-relaxed">{step.description}</p>
                            <div className="bg-black/20 p-3 rounded border border-amber-900/20 flex flex-col gap-2">
                                <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-amber-600"><span>Goal:</span><span>{step.requirement}</span></div>
                                <div className="flex justify-between text-xs font-mono uppercase tracking-wider text-emerald-600/80"><span>Reward:</span><span>{step.reward}</span></div>
                            </div>
                        </div>
                    );
                })}
             </div>
          </div>
        )}

        {/* TAB 2: INGREDIENTS */}
        {activeTab === 'ingredients' && (
          <div className="grid grid-cols-1 gap-4">
            {INGREDIENTS.map((ing) => {
              // FIX: Auto-discover if NOT finite (Basic Ingredient) OR if discovered in logic
              const isDiscovered = !ing.finite || discoveredIngredients[ing.name];
              
              return (
                <div key={ing.name} className={`relative p-4 rounded border transition-all overflow-hidden group ${isDiscovered ? 'bg-[#241f1a] border-amber-900/30 hover:border-amber-500/30' : 'bg-[#161210] border-transparent opacity-60'}`}>
                  <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl w-12 h-12 flex items-center justify-center bg-black/20 rounded border border-white/5 ${!isDiscovered && 'filter blur-sm grayscale brightness-50'}`}>
                            {/* Emoji render is safe here */}
                            {ing.icon}
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${isDiscovered ? 'text-amber-200' : 'text-amber-900'}`}>{isDiscovered ? ing.name : 'Unknown Substance'}</h3>
                            {isDiscovered && <p className="text-xs text-amber-700 italic mt-0.5">"A potent reagent found in the depths..."</p>}
                        </div>
                      </div>
                  </div>
                  {isDiscovered ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                          {ing.tags.map((tag) => (
                            <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-black/30 text-amber-500/80 rounded border border-amber-900/20">{tag}</span>
                          ))}
                          {ing.processed && (
                            <div className="w-full mt-2 pt-2 border-t border-amber-900/10 flex items-center gap-2 text-xs text-amber-600/70">
                                <span className="uppercase font-bold text-[9px]">Processed Form:</span>
                                <span>{ing.processed.name}</span>
                            </div>
                          )}
                      </div>
                  ) : (
                      <div className="mt-4 text-xs text-amber-900/40 uppercase tracking-widest font-mono">Requires Discovery</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-3 font-mono text-sm">
            {brewHistory.length === 0 ? (
              <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4"><History className="w-12 h-12" /><p>The ledger is empty.</p></div>
            ) : (
              brewHistory.map((entry) => (
                <div key={entry.id} className={`p-3 rounded border-l-2 bg-[#1e1a16] border-amber-900/10 hover:bg-[#241f1a] transition-colors`}>
                  <div className="flex justify-between items-center mb-2 text-[10px] text-amber-900/60 uppercase tracking-widest">
                      <span>Day {entry.day}</span><span>{new Date(entry.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="flex justify-between items-start mb-2">
                      <span className="text-amber-200/90 font-bold">{entry.customerClass}</span>
                      <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${getResultColor(entry.result)}`}>{getResultIcon(entry.result)}{entry.result}</div>
                  </div>
                  <div className="flex gap-4 text-xs border-t border-white/5 pt-2 mt-2">
                      <span className={entry.goldChange > 0 ? 'text-emerald-500/80' : 'text-slate-500'}>{entry.goldChange > 0 ? '+' : ''}{entry.goldChange} Gold</span>
                      <span className={entry.repChange > 0 ? 'text-blue-400/80' : 'text-red-400/80'}>{entry.repChange > 0 ? '+' : ''}{entry.repChange} Rep</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-amber-900/20 bg-[#14100e] text-center">
        <div className="inline-flex items-center gap-2 opacity-30">
            <div className="h-px w-8 bg-amber-500" /><Star className="w-3 h-3 text-amber-500" /><div className="h-px w-8 bg-amber-500" />
        </div>
      </div>
    </motion.div>
  );
};

export default BlackBook;