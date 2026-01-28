
import React from 'react';
import { motion } from 'framer-motion';
import { Skull, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GameOverScreen = ({ stats, onReturnToTitle }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="absolute inset-0 bg-gradient-radial from-red-900/20 to-transparent pointer-events-none" />
      
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="relative z-10"
      >
        <Skull className="w-32 h-32 text-red-500 mx-auto mb-6 opacity-80" strokeWidth={1} />
        
        <h1 className="text-5xl font-bold font-serif text-red-500 mb-2 tracking-widest">
          GAME OVER
        </h1>
        <p className="text-red-400/60 text-lg italic mb-10">
          Your reputation has fallen to ruin.
        </p>

        <div className="bg-slate-900/80 border border-red-900/30 p-8 rounded-xl shadow-2xl mb-10 backdrop-blur-sm max-w-md mx-auto w-full">
          <h2 className="text-amber-500/80 text-sm uppercase tracking-widest mb-6 border-b border-amber-500/10 pb-2">Final Statistics</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xl">
              <span className="text-slate-400">Days Survived</span>
              <span className="text-amber-500 font-bold">{stats.daysCount}</span>
            </div>
            <div className="flex justify-between items-center text-xl">
              <span className="text-slate-400">Total Gold Earned</span>
              <span className="text-amber-500 font-bold">{stats.totalGold}g</span>
            </div>
            <div className="flex justify-between items-center text-xl">
              <span className="text-slate-400">Customers Served</span>
              <span className="text-amber-500 font-bold">{stats.customersServed}</span>
            </div>
          </div>
        </div>

        <Button 
          onClick={onReturnToTitle}
          className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-6 text-lg rounded-lg shadow-xl hover:shadow-amber-600/20 transition-all hover:scale-105 flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          Return to Title
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default GameOverScreen;
