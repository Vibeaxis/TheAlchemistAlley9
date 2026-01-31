import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Volume2, Monitor, Sun, RotateCcw, X, Check, Palette } from 'lucide-react';
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
  onGammaChange,
  // NEW PROPS FOR THEME
  currentThemeId,
  onThemeChange,
  availableThemes // Pass the THEMES object here
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleVolumeChangeInternal = (e) => {
    const newVal = parseInt(e.target.value);
    onVolumeChange(newVal);
    if (Math.random() > 0.8) soundEngine.playHover(newVal / 100);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3 mb-6 border-b border-amber-500/20 pb-4">
            <Settings className="w-8 h-8 text-amber-500" />
            <h2 className="text-2xl font-bold text-amber-100">Settings</h2>
          </div>

          <div className="space-y-6">
            
            {/* --- NEW: THEME TOGGLE --- */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-medium text-slate-300">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <span>Visual Theme</span>
                </div>
                <span className="text-amber-500 font-mono uppercase text-xs">{currentThemeId}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {availableThemes && Object.values(availableThemes).map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => {
                            onThemeChange(theme.id);
                            soundEngine.playClick(currentVolume / 100);
                        }}
                        className={`
                            relative px-4 py-3 rounded-lg border transition-all duration-200 flex items-center justify-center gap-2 uppercase font-bold text-xs tracking-widest
                            ${currentThemeId === theme.id 
                                ? 'bg-amber-600 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'}
                        `}
                    >
                        {/* Small preview dot of the bg color */}
                        <div className={`w-3 h-3 rounded-full border border-white/20 ${theme.id === 'default' ? 'bg-slate-900' : 'bg-[#1c1917]'}`} />
                        {theme.id}
                    </button>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-slate-800" />

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
            <div className="pt-6 border-t border-slate-700/50">
              {!showResetConfirm ? (
                <Button 
                  onClick={() => setShowResetConfirm(true)}
                  variant="outline"
                  className="w-full border-red-900/30 text-red-400 hover:bg-red-950/20 hover:text-red-300 hover:border-red-500/50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Hard Reset Game
                </Button>
              ) : (
                <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                  <p className="text-sm text-red-200 font-semibold">Delete all progress?</p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      size="sm" 
                      onClick={onReset}
                      className="bg-red-700 hover:bg-red-600 text-white"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Reset
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