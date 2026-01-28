
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CauldronWhisper = ({ whispers }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-20">
      <AnimatePresence>
        {whispers.map((whisper) => (
          <motion.div
            key={whisper.id}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: [0, 1, 1, 0], y: -100, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            className={`absolute text-lg font-serif italic tracking-wider font-bold drop-shadow-lg px-4 text-center whitespace-nowrap
              ${whisper.type === 'danger' ? 'text-red-500' : 'text-amber-400'}
            `}
            style={{ 
              textShadow: '0 0 10px rgba(0,0,0,0.8)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)' // Centered initially
            }}
          >
            "{whisper.text}"
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default CauldronWhisper;
