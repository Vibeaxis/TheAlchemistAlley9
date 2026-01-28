
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Award, AlertTriangle, CheckCircle, Skull } from 'lucide-react';

const StatsDisplay = ({ gold, reputation, message, messageType }) => {
  const getMessageStyle = () => {
    switch (messageType) {
      case 'success':
        return 'bg-green-950/50 border-green-600 text-green-400';
      case 'poison':
        return 'bg-red-950/50 border-red-600 text-red-400';
      case 'explode':
        return 'bg-red-950/80 border-red-500 text-red-300';
      default:
        return 'bg-slate-900/50 border-amber-600/30 text-amber-300';
    }
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle className='w-5 h-5' />;
      case 'poison':
        return <AlertTriangle className='w-5 h-5' />;
      case 'explode':
        return <Skull className='w-5 h-5' />;
      default:
        return null;
    }
  };

  return (
    <div className='space-y-4'>
      {/* Stats Row */}
      <div className='grid md:grid-cols-2 gap-4'>
        {/* Gold */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className='bg-gradient-to-br from-amber-950/50 to-slate-900 border-2 border-amber-600/50 rounded-xl shadow-lg p-6 backdrop-blur-sm'
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-amber-400/70 mb-1'>Gold</p>
              <motion.p 
                key={gold}
                initial={{ scale: 1.2, color: '#f59e0b' }}
                animate={{ scale: 1, color: '#fbbf24' }}
                className='text-4xl font-bold text-amber-500'
              >
                {gold}
              </motion.p>
            </div>
            <Coins className='w-12 h-12 text-amber-500/50' />
          </div>
        </motion.div>

        {/* Reputation */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className='bg-gradient-to-br from-blue-950/50 to-slate-900 border-2 border-blue-600/50 rounded-xl shadow-lg p-6 backdrop-blur-sm'
        >
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-blue-400/70 mb-1'>Reputation</p>
              <motion.p 
                key={reputation}
                initial={{ scale: 1.2, color: '#3b82f6' }}
                animate={{ scale: 1, color: '#60a5fa' }}
                className='text-4xl font-bold text-blue-500'
              >
                {reputation}
              </motion.p>
            </div>
            <Award className='w-12 h-12 text-blue-500/50' />
          </div>
        </motion.div>
      </div>

      {/* Message Display */}
      <AnimatePresence mode='wait'>
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className={`border-2 rounded-xl shadow-lg p-6 backdrop-blur-sm ${getMessageStyle()}`}
          >
            <div className='flex items-start gap-3'>
              {getMessageIcon()}
              <div className='flex-1'>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className='text-base leading-relaxed'
                >
                  {message}
                </motion.p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StatsDisplay;
