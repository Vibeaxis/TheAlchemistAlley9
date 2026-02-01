import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Gavel, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RaidEvent = ({ onResolve, goldLoss, inventoryLoss }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-red-950/90 flex items-center justify-center p-4">
      {/* Flashing Lights Effect */}
      <motion.div 
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{ repeat: Infinity, duration: 1 }}
        className="absolute inset-0 bg-red-600 pointer-events-none"
      />

      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative z-10 max-w-lg w-full bg-[#1c1917] border-2 border-red-500 rounded-xl overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.5)]"
      >
        <div className="bg-red-900/80 p-6 text-center border-b border-red-500/30">
          <ShieldAlert className="w-16 h-16 text-red-100 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white uppercase tracking-widest">RAID!</h1>
          <p className="text-red-200 font-serif italic mt-2">"Open up! By order of the Magistrate!"</p>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-stone-300 text-center leading-relaxed">
            The City Watch has breached your shop. They claim your alchemy violates the Sacred Edicts.
          </p>

          <div className="bg-black/40 rounded-lg p-4 border border-red-900/30 space-y-3">
             <div className="flex justify-between items-center">
                <span className="text-stone-500 uppercase text-xs font-bold tracking-wider">Confiscated Gold</span>
                <span className="text-red-400 font-mono font-bold">-{goldLoss}g</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-stone-500 uppercase text-xs font-bold tracking-wider">Inventory Seized</span>
                <span className="text-red-400 font-mono font-bold">-{inventoryLoss} Items</span>
             </div>
             <div className="w-full h-px bg-red-900/30 my-2" />
             <div className="flex justify-between items-center">
                <span className="text-stone-500 uppercase text-xs font-bold tracking-wider">Heat Reset</span>
                <span className="text-emerald-400 font-mono font-bold">Safe (30%)</span>
             </div>
          </div>
        </div>

        <div className="p-4 bg-black/50 border-t border-red-900/30">
          <Button 
            onClick={onResolve}
            className="w-full bg-red-700 hover:bg-red-600 text-white font-bold py-6 uppercase tracking-widest"
          >
            <Gavel className="w-5 h-5 mr-2" /> Accept Judgment
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default RaidEvent;