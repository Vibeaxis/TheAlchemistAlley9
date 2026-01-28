
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerCard = ({ customer, observationHint, onMouseEnter, onMouseLeave, revealedTags = [] }) => {
  const CustomerIcon = customer.class.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.5 }}
      className='relative bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-600/50 rounded-xl shadow-2xl p-8 backdrop-blur-sm'
    >
      {/* Glassmorphism overlay */}
      <div className='absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent rounded-xl pointer-events-none' />
      
      <div className='relative space-y-6'>
        {/* Icon & Inspection Area */}
        <div 
          className='flex justify-center relative'
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className='bg-slate-950 border-2 border-amber-500 rounded-full p-6 shadow-lg relative cursor-help'>
            <CustomerIcon className='w-16 h-16 text-amber-500' strokeWidth={1.5} />
            
            {/* Inspection Tooltip */}
            <AnimatePresence>
              {observationHint && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-48 bg-black/80 border border-amber-500/30 text-amber-400 text-sm italic p-2 rounded-lg text-center backdrop-blur-sm z-20 pointer-events-none"
                >
                  "{observationHint}"
                  <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-black/80 border-r border-b border-amber-500/30 rotate-45"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Class Name */}
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-amber-400'>{customer.class.name}</h2>
          <p className='text-amber-300/60 text-sm mt-1'>{customer.class.description}</p>
        </div>

        {/* Symptom */}
        <div className='bg-slate-950/50 border border-amber-600/30 rounded-lg p-4'>
          <p className='text-sm text-amber-200/80 mb-2 font-semibold'>Ailment:</p>
          <p className='text-amber-100 italic leading-relaxed'>"{customer.symptom.text}"</p>
        </div>

        {/* Requirements */}
        <div className='bg-slate-950/50 border border-red-600/30 rounded-lg p-4'>
          <p className='text-sm text-red-400/80 mb-2 font-semibold'>Required Remedy:</p>
          <div className='flex gap-2 justify-center'>
            {customer.symptom.requiredTags.map((tag, index) => {
              const isRevealed = revealedTags.includes(tag);
              return (
                <span 
                  key={index}
                  className={`border px-3 py-1 rounded-md text-xs font-mono transition-all ${
                    isRevealed 
                      ? 'bg-blue-950/50 border-blue-400 text-blue-300' 
                      : 'bg-red-950/50 border-red-600/50 text-red-400'
                  }`}
                >
                  {isRevealed ? tag : '???'}
                </span>
              );
            })}
          </div>
          <p className='text-xs text-red-300/50 text-center mt-2'>Hover over icon to inspect symptoms</p>
        </div>

        {/* Class bonus info */}
        <div className='text-center text-xs text-amber-300/40 border-t border-amber-600/20 pt-4'>
          {customer.class.id === 'noble' && '2× Gold on Success | -2× Reputation on Failure'}
          {customer.class.id === 'beggar' && 'No Gold | +2× Reputation on Success'}
          {customer.class.id === 'guard' && 'Standard Pay | 1× Gold & Reputation'}
          {customer.class.id === 'cultist' && 'Pays in Dark Secrets | +1 Reputation'}
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerCard;
