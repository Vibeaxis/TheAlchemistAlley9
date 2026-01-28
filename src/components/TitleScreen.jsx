
import React from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TitleScreen = ({ onStart, onOpenSettings }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-50 bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={onOpenSettings}
          className="p-3 bg-slate-800/50 rounded-full border border-slate-700 text-slate-400 hover:text-amber-500 hover:border-amber-500/50 hover:bg-slate-800 transition-all duration-300 hover:scale-110"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8 p-6 bg-amber-500/10 rounded-full border-2 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.2)]"
      >
        <FlaskConical className="w-24 h-24 text-amber-500" strokeWidth={1.5} />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-6xl font-bold font-serif text-amber-500 mb-2 tracking-tight"
      >
        THE ALCHEMIST
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-amber-500/40 text-sm uppercase tracking-[0.3em] mb-8"
      >
        Of Alleyway 9
      </motion.p>

      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-amber-500/60 text-lg italic mb-12 max-w-md"
      >
        "Mix ingredients wisely, or face dire consequences..."
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button 
          onClick={onStart}
          className="bg-amber-600 hover:bg-amber-700 text-white px-12 py-6 text-xl font-semibold rounded-lg shadow-lg hover:shadow-amber-600/20 transition-all hover:scale-105"
        >
          Click to Start
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default TitleScreen;
