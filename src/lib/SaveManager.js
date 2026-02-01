// src/lib/SaveManager.js

const SAVE_KEY = 'apothecary_save_v1';

export const SaveManager = {
  // 1. CHECK: Does a save file exist?
  hasSave: () => {
    return !!localStorage.getItem(SAVE_KEY);
  },

  // 2. SAVE: Write state to disk
  save: (gameState) => {
    try {
      // Safety: Never save a "Game Over" state
      if (gameState.reputation <= 0) {
        console.warn("Save Aborted: Player is exiled.");
        return false;
      }
      
      const serialized = JSON.stringify(gameState);
      localStorage.setItem(SAVE_KEY, serialized);
      console.log(`[SaveManager] Game Saved (Day ${gameState.day})`);
      return true;
    } catch (err) {
      console.error("[SaveManager] Save Failed:", err);
      return false;
    }
  },

  // 3. LOAD: Read state from disk
  load: () => {
    try {
      const serialized = localStorage.getItem(SAVE_KEY);
      if (!serialized) return null;
      return JSON.parse(serialized);
    } catch (err) {
      console.error("[SaveManager] Load Failed (Corrupt):", err);
      return null;
    }
  },

  // 4. WIPE: Hard reset
  clear: () => {
    localStorage.removeItem(SAVE_KEY);
    console.log("[SaveManager] Save File Deleted");
  }
};