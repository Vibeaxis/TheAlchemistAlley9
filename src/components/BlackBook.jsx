
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Book, Beaker, History, CheckCircle, AlertTriangle, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { INGREDIENTS } from '@/lib/gameLogic';

const BlackBook = ({ isOpen, onClose, discoveredIngredients, brewHistory }) => {
  const [activeTab, setActiveTab] = useState('ingredients'); // 'ingredients' | 'history'

  const variants = {
    open: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    closed: { x: '100%', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  };

  const getResultColor = (result) => {
    switch(result) {
      case 'cured': return 'text-green-400 border-green-900/50 bg-green-950/20';
      case 'poisoned': return 'text-red-400 border-red-900/50 bg-red-950/20';
      case 'exploded': return 'text-orange-400 border-orange-900/50 bg-orange-950/20';
      default: return 'text-slate-400 border-slate-800 bg-slate-900/50';
    }
  };

  const getResultIcon = (result) => {
    switch(result) {
      case 'cured': return <CheckCircle className="w-4 h-4" />;
      case 'poisoned': return <AlertTriangle className="w-4 h-4" />;
      case 'exploded': return <Skull className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial="closed"
      animate={isOpen ? 'open' : 'closed'}
      variants={variants}
      className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-slate-950/95 backdrop-blur-xl border-l border-amber-900/30 shadow-2xl z-50 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-amber-900/20">
        <div className="flex items-center gap-3">
          <Book className="w-6 h-6 text-amber-500" />
          <h2 className="text-2xl font-bold text-amber-500 font-serif tracking-wide">The Black Book</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-slate-900 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-900/20">
        <button
          onClick={() => setActiveTab('ingredients')}
          className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2
            ${activeTab === 'ingredients' ? 'bg-slate-900 text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
        >
          <Beaker className="w-4 h-4" /> Ingredients
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-2
            ${activeTab === 'history' ? 'bg-slate-900 text-amber-500 border-b-2 border-amber-500' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
        >
          <History className="w-4 h-4" /> Brew History
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-amber-900/20 scrollbar-track-transparent">
        
        {/* Ingredients Tab */}
        {activeTab === 'ingredients' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {INGREDIENTS.map((ing) => {
              const isDiscovered = discoveredIngredients[ing.name];
              return (
                <div 
                  key={ing.name}
                  className={`p-4 rounded-lg border transition-all ${isDiscovered 
                    ? 'bg-slate-900/50 border-amber-900/30 shadow-lg shadow-black/20' 
                    : 'bg-slate-950 border-slate-800 opacity-60 grayscale'}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{ing.icon}</span>
                    <h3 className={`font-bold ${isDiscovered ? 'text-amber-400' : 'text-slate-500'}`}>
                      {ing.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {ing.tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono border ${
                          isDiscovered 
                            ? 'bg-slate-950 text-slate-300 border-slate-700' 
                            : 'bg-slate-950 text-slate-700 border-slate-800'
                        }`}
                      >
                        {isDiscovered ? tag : '???'}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {brewHistory.length === 0 ? (
              <div className="text-center py-12 text-slate-600 italic">
                No brews recorded yet...
              </div>
            ) : (
              brewHistory.map((entry) => (
                <div 
                  key={entry.id}
                  className={`p-4 rounded-lg border flex flex-col gap-2 ${getResultColor(entry.result)}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-xs font-mono uppercase opacity-70">
                      <span>Day {entry.day}</span>
                      <span>•</span>
                      <span>{entry.customerClass}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
                      {getResultIcon(entry.result)}
                      {entry.result}
                    </div>
                  </div>
                  
                  <p className="text-sm italic opacity-90 line-clamp-2">
                    "{entry.symptom}"
                  </p>

                  <div className="mt-2 flex gap-2 text-xs font-mono border-t border-black/10 pt-2">
                     <span className={entry.goldChange > 0 ? 'text-amber-400' : 'text-slate-500'}>
                       {entry.goldChange > 0 ? '+' : ''}{entry.goldChange}g
                     </span>
                     <span className="opacity-30">|</span>
                     <span className={entry.repChange > 0 ? 'text-blue-400' : 'text-red-400'}>
                       {entry.repChange > 0 ? '+' : ''}{entry.repChange} Rep
                     </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer Decoration */}
      <div className="p-4 border-t border-amber-900/20 bg-slate-950">
        <p className="text-xs text-center text-amber-900/40 font-serif italic">
          "Knowledge is the most dangerous ingredient."
        </p>
      </div>
    </motion.div>
  );
};

export default BlackBook;
