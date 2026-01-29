import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerCard = ({ customer, observationHint, onMouseEnter, onMouseLeave, revealedTags = [] }) => {
  const CustomerIcon = customer.class.icon;

  // 1. Generate a consistent "Shadow Identity"
  // We use 'adventurer' style for that fantasy RPG look, or 'notionists' for sketchy look
  const seed = customer.id + customer.class.name; 
  const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&backgroundColor=transparent`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5 }}
      className='relative bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-600/50 rounded-xl shadow-2xl p-8 backdrop-blur-sm overflow-hidden group'
    >
      {/* --- THE SILHOUETTE AVATAR (Background Layer) --- */}
      <div className="absolute inset-0 z-0 pointer-events-none flex items-end justify-center overflow-hidden">
        <img 
            src={avatarUrl} 
            alt="Customer Silhouette"
            className="w-[120%] h-[120%] object-cover object-top opacity-20 transition-all duration-700 group-hover:scale-105 group-hover:opacity-30"
            style={{ 
                // This makes it a silhouette
                filter: 'grayscale(100%) brightness(0%) drop-shadow(0 0 10px rgba(217, 119, 6, 0.3))',
                transform: 'translateY(10%)'
            }}
        />
        {/* Gradient Fade to ensure text readability at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
      </div>

      {/* Glassmorphism overlay */}
      <div className='absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-xl pointer-events-none z-0' />
      
      {/* Content Layer (Z-10 to sit above avatar) */}
      <div className='relative z-10 space-y-6'>
        
        {/* Class Sigil (The Lucide Icon is now a "Badge" rather than the face) */}
        <div 
          className='flex justify-center relative'
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className='bg-slate-950/80 border-2 border-amber-500 rounded-full p-4 shadow-lg relative cursor-help backdrop-blur-md'>
            <CustomerIcon className='w-10 h-10 text-amber-500' strokeWidth={1.5} />
            
            {/* Inspection Tooltip */}
            <AnimatePresence>
              {observationHint && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute -top-16 left-1/2 transform -translate-x-1/2 w-56 bg-black/90 border border-amber-500/30 text-amber-100 text-sm italic p-3 rounded-lg text-center shadow-xl z-50 pointer-events-none"
                >
                  <span className="text-amber-500 font-bold mr-1">Observation:</span> 
                  "{observationHint}"
                  <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-black/90 border-r border-b border-amber-500/30 rotate-45"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Class Name */}
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-amber-400 drop-shadow-md'>{customer.class.name}</h2>
          <p className='text-amber-300/60 text-sm mt-1 font-mono tracking-widest uppercase'>{customer.class.description}</p>
        </div>

        {/* Symptom */}
        <div className='bg-slate-950/60 border border-amber-600/30 rounded-lg p-4 backdrop-blur-sm shadow-inner'>
          <p className='text-xs text-amber-500/80 mb-2 font-bold uppercase tracking-wider'>The Complaint</p>
          <p className='text-amber-100 italic leading-relaxed text-lg font-serif'>"{customer.symptom.text}"</p>
        </div>

        {/* Requirements */}
        <div className='bg-slate-950/60 border border-red-900/50 rounded-lg p-4 backdrop-blur-sm'>
          <p className='text-xs text-red-400/80 mb-2 font-bold uppercase tracking-wider text-center'>Required Properties</p>
          <div className='flex gap-2 justify-center flex-wrap'>
            {customer.symptom.requiredTags.map((tag, index) => {
              const isRevealed = revealedTags.includes(tag);
              return (
                <span 
                  key={index}
                  className={`border px-3 py-1.5 rounded-md text-xs font-bold font-mono transition-all shadow-sm ${
                    isRevealed 
                      ? 'bg-blue-950/80 border-blue-400 text-blue-300 shadow-blue-900/20' 
                      : 'bg-red-950/40 border-red-800/50 text-red-500'
                  }`}
                >
                  {isRevealed ? tag : '???'}
                </span>
              );
            })}
          </div>
        </div>

        {/* Class bonus info */}
        <div className='text-center text-[10px] text-amber-300/30 border-t border-amber-600/10 pt-4 font-mono'>
          {customer.class.id === 'noble' && '2× Gold on Success | -2× Reputation on Failure'}
          {customer.class.id === 'beggar' && 'No Gold | +3× Reputation on Success'}
          {customer.class.id === 'guard' && 'Standard Pay | 1.5× Gold & Reputation'}
          {customer.class.id === 'cultist' && 'Pays in Dark Secrets | High Risk'}
          {customer.class.id === 'bard' && 'High Risk | High Reward'}
          {customer.class.id === 'merchant' && '3x Gold | Low Reputation Impact'}
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerCard;