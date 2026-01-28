
import React from 'react';
import { motion } from 'framer-motion';
import { INGREDIENTS } from '@/lib/gameLogic';
import { Sparkles } from 'lucide-react';

const Workbench = ({ selectedIngredients, onIngredientSelect }) => {
  const isSelected = (ingredient) => {
    return selectedIngredients.some(i => i.name === ingredient.name);
  };

  const canSelect = (ingredient) => {
    return isSelected(ingredient) || selectedIngredients.length < 3;
  };

  return (
    <div className='bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-amber-600/50 rounded-xl shadow-2xl p-6 backdrop-blur-sm'>
      <div className='flex items-center gap-2 mb-6'>
        <Sparkles className='w-6 h-6 text-amber-500' />
        <h3 className='text-2xl font-bold text-amber-400'>Ingredient Shelf</h3>
      </div>

      {/* Ingredients Grid */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
        {INGREDIENTS.map((ingredient, index) => {
          const selected = isSelected(ingredient);
          const selectable = canSelect(ingredient);

          return (
            <motion.button
              key={ingredient.name}
              whileHover={selectable ? { scale: 1.05, y: -5 } : {}}
              whileTap={selectable ? { scale: 0.95 } : {}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => selectable && onIngredientSelect(ingredient)}
              disabled={!selectable}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-300
                ${selected 
                  ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/50' 
                  : 'bg-slate-950/50 border-slate-700 hover:border-amber-600/50'
                }
                ${!selectable && !selected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {/* Selection indicator */}
              {selected && (
                <div className='absolute -top-2 -right-2 bg-amber-500 rounded-full w-6 h-6 flex items-center justify-center text-slate-950 text-xs font-bold border-2 border-slate-900'>
                  ✓
                </div>
              )}

              {/* Icon */}
              <div className='text-3xl mb-2 text-center'>{ingredient.icon}</div>

              {/* Name */}
              <div className='text-sm font-bold text-amber-300 mb-2 text-center'>
                {ingredient.name}
              </div>

              {/* Tags */}
              <div className='flex flex-wrap gap-1 justify-center'>
                {ingredient.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex}
                    className={`text-xs px-2 py-0.5 rounded ${
                      tag === 'Toxic' ? 'bg-red-950 text-red-400 border border-red-600/50' :
                      tag === 'Holy' ? 'bg-blue-950 text-blue-400 border border-blue-600/50' :
                      tag === 'Hot' ? 'bg-orange-950 text-orange-400 border border-orange-600/50' :
                      tag === 'Cooling' ? 'bg-cyan-950 text-cyan-400 border border-cyan-600/50' :
                      'bg-slate-800 text-slate-400 border border-slate-600/50'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Selected Ingredients Display */}
      {selectedIngredients.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className='border-t border-amber-600/30 pt-4'
        >
          <p className='text-sm text-amber-400 mb-2 font-semibold'>Selected Ingredients:</p>
          <div className='flex flex-wrap gap-2'>
            {selectedIngredients.map((ingredient, index) => (
              <div 
                key={index}
                className='bg-amber-500/10 border border-amber-500/50 rounded-lg px-3 py-2 flex items-center gap-2'
              >
                <span className='text-xl'>{ingredient.icon}</span>
                <span className='text-sm text-amber-300'>{ingredient.name}</span>
              </div>
            ))}
          </div>
          <p className='text-xs text-amber-300/50 mt-2'>
            {selectedIngredients.length}/3 ingredients selected
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Workbench;
