
import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Trash2, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tagCombination } from '@/lib/gameLogic';
import CauldronWhisper from '@/components/CauldronWhisper';

const Cauldron = ({ selectedIngredients, onBrew, onClear, whisperQueue = [] }) => {
  const hasTwoOrMore = selectedIngredients.length >= 2;

  // Calculate current combination
  const combination = selectedIngredients.length >= 2 ? tagCombination(selectedIngredients) : null;

  return (
    <div className='bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-600/50 rounded-xl shadow-2xl p-6 backdrop-blur-sm relative'>
      <div className='flex items-center gap-2 mb-6'>
        <FlaskConical className='w-6 h-6 text-amber-500' />
        <h3 className='text-2xl font-bold text-amber-400'>Cauldron</h3>
      </div>

      {/* Cauldron Visual */}
      <div className='relative mb-6'>
        <div className='bg-slate-950 border-4 border-slate-700 rounded-b-full h-48 flex items-center justify-center relative overflow-hidden'>
          
          {/* Whisper Overlay */}
          <CauldronWhisper whispers={whisperQueue} />

          {/* Fire effect when brewing */}
          {hasTwoOrMore && (
            <motion.div
              animate={{
                y: [0, -10, 0],
                opacity: [0.6, 0.8, 0.6]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className='absolute bottom-0 left-1/2 transform -translate-x-1/2'
            >
              <Flame className='w-24 h-24 text-orange-500' />
            </motion.div>
          )}

          {/* Liquid level */}
          {selectedIngredients.length > 0 && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${(selectedIngredients.length / 3) * 60}%` }}
              className={`absolute bottom-0 w-full ${combination?.isFatal
                  ? 'bg-gradient-to-t from-red-900 to-red-600'
                  : 'bg-gradient-to-t from-green-900 to-green-600'
                } opacity-60 transition-all duration-500`}
            />
          )}

          {/* Empty state */}
          {selectedIngredients.length === 0 && (
            <p className='text-slate-600 text-sm italic'>Empty cauldron</p>
          )}
        </div>
      </div>

      {/* Current Ingredients in Cauldron */}
      {selectedIngredients.length > 0 && (
        <div className='bg-slate-950/50 border border-amber-600/30 rounded-lg p-4 mb-4'>
          <p className='text-sm text-amber-400 mb-2 font-semibold'>In Cauldron:</p>
          <div className='space-y-1'>
            {selectedIngredients.map((ingredient, index) => (
              <div key={index} className='flex items-center gap-2'>
                <span className='text-lg'>{ingredient.icon}</span>
                <span className='text-amber-200 text-sm'>{ingredient.name}</span>
                <span className='text-xs text-slate-500'>
                  [{ingredient.tags.join(', ')}]
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tag Combination Preview */}
      {combination && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 rounded-lg p-4 mb-4 ${combination.isFatal
              ? 'bg-red-950/30 border-red-600'
              : 'bg-green-950/30 border-green-600'
            }`}
        >
          <p className={`text-sm font-semibold mb-2 ${combination.isFatal ? "text-red-400" : "text-green-400"}`}>
            {combination.isFatal ? '⚠️ WARNING: VOLATILE MIXTURE!' : 'Combined Tags:'}
          </p>
          <div className='flex flex-wrap gap-1'>
            {combination.tags.map((tag, index) => (
              <span
                key={index}
                className={`text-xs px-2 py-1 rounded ${tag === 'Toxic' ? 'bg-red-900 text-red-300 border border-red-600' :
                    'bg-slate-800 text-slate-300 border border-slate-600'
                  }`}
              >
                {tag}
              </span>
            ))}
          </div>
          {combination.isFatal && (
            <p className='text-xs text-red-300 mt-2'>
              Multiple toxic ingredients detected! Cauldron will explode!
            </p>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className='flex gap-3'>
        <Button
          onClick={onBrew}
          disabled={!hasTwoOrMore}
          className={`flex-1 ${hasTwoOrMore
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            } font-bold py-6 text-lg transition-all duration-300 shadow-lg`}
        >
          <FlaskConical className='w-5 h-5 mr-2' />
          BREW & SERVE
        </Button>

        <Button
          onClick={onClear}
          disabled={selectedIngredients.length === 0}
          variant='outline'
          className='bg-slate-800 border-2 border-slate-600 hover:bg-slate-700 hover:border-red-600 text-slate-300 hover:text-red-400 py-6 transition-all duration-300'
        >
          <Trash2 className='w-5 h-5' />
        </Button>
      </div>

      {!hasTwoOrMore && selectedIngredients.length > 0 && (
        <p className='text-xs text-amber-300/50 mt-2 text-center'>
          Add at least one more ingredient to brew
        </p>
      )}
    </div>
  );
};

export default Cauldron;
