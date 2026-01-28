
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, Monitor, Sun, RotateCcw, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { soundEngine } from '@/lib/SoundEngine';

const SettingsMenu = ({
  isOpen,
  onClose,
  onReset,
  currentVolume,
  onVolumeChange,
  currentScale,
  onScaleChange,
  currentGamma,
  onGammaChange
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleVolumeChangeInternal = (e) => {
    const newVal = parseInt(e.target.value);
    onVolumeChange(newVal);
    // Preview sound (debounced logic is better but simple instant feedback works for sliders if not spamming)
    // We'll just play a quick click occasionally or rely on the user letting go? 
    // Let's play a very short blip if needed, but standard UI usually just updates.
    // The prompt says "with real-time preview sound".
    if (Math.random() > 0.8) soundEngine.playHover(newVal / 100);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-8 border-b border-amber-500/20 pb-4">
            <Settings className="w-8 h-8 text-amber-500" />
            <h2 className="text-2xl font-bold text-amber-100">Settings</h2>
          </div>

          <div className="space-y-8">
            {/* Audio Volume */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-500" />
                  <span>Master Volume</span>
                </div>
                <span className="text-amber-500 font-mono">{currentVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={currentVolume}
                onChange={handleVolumeChangeInternal}
                onMouseUp={() => soundEngine.playClick(currentVolume / 100)}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* UI Scale */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-amber-500" />
                  <span>UI Scale</span>
                </div>
                <span className="text-amber-500 font-mono">{currentScale}%</span>
              </div>
              <input
                type="range"
                min="80"
                max="120"
                value={currentScale}
                onChange={(e) => onScaleChange(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Brightness / Gamma */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Brightness</span>
                </div>
                <span className="text-amber-500 font-mono">{currentGamma.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={currentGamma}
                onChange={(e) => onGammaChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Hard Reset */}
            <div className="pt-6 border-t border-slate-700">
              {!showResetConfirm ? (
                <Button 
                  onClick={() => setShowResetConfirm(true)}
                  variant="outline"
                  className="w-full border-red-900/50 text-red-400 hover:bg-red-950/30 hover:text-red-300 hover:border-red-500"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Hard Reset Game
                </Button>
              ) : (
                <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-4 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-sm text-red-200 font-semibold">Are you sure? This will delete all progress.</p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      size="sm" 
                      onClick={onReset}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Yes, Reset
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowResetConfirm(false)}
                      className="border-slate-600 text-slate-300 hover:bg-slate-800"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsMenu;
