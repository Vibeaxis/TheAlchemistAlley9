
// Web Audio API Sound Engine
// Uses procedural synthesis to avoid external asset dependencies

let audioContext = null;
let masterGainNode = null;

export const initAudioContext = () => {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
    masterGainNode = audioContext.createGain();
    masterGainNode.gain.value = 0.3; // Base Master volume
    masterGainNode.connect(audioContext.destination);
  } else if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

// ADSR Envelope Helper
const applyEnvelope = (param, now, attack, decay, sustain, release, sustainLevel = 0.5, peakLevel = 1.0) => {
  param.cancelScheduledValues(now);
  param.setValueAtTime(0, now);
  param.linearRampToValueAtTime(peakLevel, now + attack);
  param.linearRampToValueAtTime(sustainLevel * peakLevel, now + attack + decay);
  param.linearRampToValueAtTime(sustainLevel * peakLevel, now + attack + decay + sustain);
  param.exponentialRampToValueAtTime(0.01, now + attack + decay + sustain + release);
};

export const soundEngine = {
  // Master volume scaling is applied here dynamically based on the passed parameter
  playHover: (masterVolume = 1.0) => {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    
    // Quick blip - Reduced volume (50% base)
    const baseGain = 0.025;
    const scaledGain = baseGain * masterVolume;

    gain.gain.setValueAtTime(scaledGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(masterGainNode);

    osc.start(now);
    osc.stop(now + 0.05);
  },

  playClick: (masterVolume = 1.0) => {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    
    // Mechanical click envelope - Reduced volume (50% base)
    // Passing peakLevel = 0.5 * masterVolume
    const peak = 0.5 * masterVolume;
    applyEnvelope(gain.gain, now, 0.01, 0.05, 0.0, 0.04, 0.5, peak);

    osc.connect(gain);
    gain.connect(masterGainNode);

    osc.start(now);
    osc.stop(now + 0.1);
  },

  playGold: (masterVolume = 1.0) => {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05); // Shine effect

    // Metallic ring
    const baseGain = 0.1;
    const scaledGain = baseGain * masterVolume;

    gain.gain.setValueAtTime(scaledGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(masterGainNode);

    osc.start(now);
    osc.stop(now + 0.4);
  },

  playBubble: (masterVolume = 1.0) => {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sine';
    
    // Bubbling frequency modulation
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(400, now + 0.2);
    osc.frequency.linearRampToValueAtTime(200, now + 0.4);

    const baseGain = 0.1;
    const scaledGain = baseGain * masterVolume;

    gain.gain.setValueAtTime(scaledGain, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.4);

    osc.connect(gain);
    gain.connect(masterGainNode);

    osc.start(now);
    osc.stop(now + 0.4);
  },

  playSuccess: (masterVolume = 1.0) => {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const notes = [261.63, 329.63, 392.00]; // C Major arpeggio
    
    notes.forEach((freq, i) => {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const startTime = now + i * 0.1;

      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      // Reverb-like decay
      // Scale peak gain
      const peakGain = 0.1 * masterVolume;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);

      osc.connect(gain);
      gain.connect(masterGainNode);

      osc.start(startTime);
      osc.stop(startTime + 0.8);
    });
  },

  playFail: (masterVolume = 1.0) => {
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(60, now + 0.5); // Pitch drop

    // Dissonant buzz
    const baseGain = 0.1;
    const scaledGain = baseGain * masterVolume;

    gain.gain.setValueAtTime(scaledGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(masterGainNode);

    osc.start(now);
    osc.stop(now + 0.5);
  }
};
