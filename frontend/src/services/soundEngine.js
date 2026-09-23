/**
 * CodeLand Procedural Audio Engine
 * Pure Web Audio API Synthesizer - 0 External Dependencies, 0 Latency
 */

const STORAGE_KEY = "codeland_audio_settings";

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.ambientGain = null;

    // Ambient sound nodes
    this.ambientOscillators = [];
    this.ambientLfo = null;
    this.ambientFilter = null;
    this.currentWorldTheme = "hub";

    // Settings state
    this.settings = this.loadSettings();

    // Bound listeners for user gesture unlocking
    this.handleFirstInteraction = this.handleFirstInteraction.bind(this);
    if (typeof window !== "undefined") {
      window.addEventListener("pointerdown", this.handleFirstInteraction, { once: true });
      window.addEventListener("keydown", this.handleFirstInteraction, { once: true });
      window.addEventListener("codeland:update", () => this.syncProfileSettings());
    }

    // Active playing sound count for visualizer
    this.activeVoices = 0;
    this.subscribers = new Set();
  }

  loadSettings() {
    const defaults = {
      sfxEnabled: true,
      ambientEnabled: false,
      sfxVolume: 0.65,
      ambientVolume: 0.35,
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaults, ...JSON.parse(stored) };
      }
    } catch {
      // Fallback
    }

    return defaults;
  }

  saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      window.dispatchEvent(new Event("codeland:audio_update"));
    } catch {
      // storage unavailable
    }
    this.notifySubscribers();
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback(this.getState());
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    const state = this.getState();
    this.subscribers.forEach((cb) => {
      try {
        cb(state);
      } catch (err) {
        console.error("Audio subscriber error:", err);
      }
    });
  }

  getState() {
    return {
      ...this.settings,
      isPlayingSound: this.activeVoices > 0,
      activeWorld: this.currentWorldTheme,
    };
  }

  syncProfileSettings() {
    try {
      const user = JSON.parse(localStorage.getItem("codeland_current_user") || "null");
      const id = user?.id || user?.email || "guest";
      const profile = JSON.parse(localStorage.getItem(`codeland_profile_${id}`) || "{}");
      if (typeof profile.soundEffects === "boolean") {
        if (this.settings.sfxEnabled !== profile.soundEffects) {
          this.settings.sfxEnabled = profile.soundEffects;
          this.updateGainNodes();
          this.saveSettings();
        }
      }
    } catch {
      // ignore
    }
  }

  initContext() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();

    // Master
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // SFX Bus
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(
      this.settings.sfxEnabled ? this.settings.sfxVolume : 0,
      this.ctx.currentTime
    );
    this.sfxGain.connect(this.masterGain);

    // Ambient Bus
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(
      this.settings.ambientEnabled ? this.settings.ambientVolume : 0,
      this.ctx.currentTime
    );
    this.ambientGain.connect(this.masterGain);

    if (this.settings.ambientEnabled) {
      this.startAmbientDrone();
    }
  }

  handleFirstInteraction() {
    this.initContext();
  }

  updateGainNodes() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.sfxGain) {
      this.sfxGain.gain.cancelScheduledValues(now);
      this.sfxGain.gain.setTargetAtTime(
        this.settings.sfxEnabled ? this.settings.sfxVolume : 0,
        now,
        0.03
      );
    }
    if (this.ambientGain) {
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setTargetAtTime(
        this.settings.ambientEnabled ? this.settings.ambientVolume : 0,
        now,
        0.05
      );
    }
  }

  setSfxEnabled(enabled) {
    this.settings.sfxEnabled = enabled;
    this.updateGainNodes();
    this.saveSettings();

    try {
      const user = JSON.parse(localStorage.getItem("codeland_current_user") || "null");
      const id = user?.id || user?.email || "guest";
      const key = `codeland_profile_${id}`;
      const profile = JSON.parse(localStorage.getItem(key) || "{}");
      profile.soundEffects = enabled;
      localStorage.setItem(key, JSON.stringify(profile));
      window.dispatchEvent(new Event("codeland:update"));
    } catch {
      // ignore
    }
  }

  setAmbientEnabled(enabled) {
    this.settings.ambientEnabled = enabled;
    this.initContext();
    if (enabled) {
      this.startAmbientDrone();
    } else {
      this.stopAmbientDrone();
    }
    this.updateGainNodes();
    this.saveSettings();
  }

  setSfxVolume(vol) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, vol));
    this.updateGainNodes();
    this.saveSettings();
  }

  setAmbientVolume(vol) {
    this.settings.ambientVolume = Math.max(0, Math.min(1, vol));
    this.updateGainNodes();
    this.saveSettings();
  }

  beginVoice() {
    this.activeVoices++;
    this.notifySubscribers();
  }

  endVoice() {
    this.activeVoices = Math.max(0, this.activeVoices - 1);
    this.notifySubscribers();
  }

  playClick(theme = "default") {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.beginVoice();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    if (theme === "cyber" || theme === "cpp") {
      osc.type = "triangle";
      filter.type = "highpass";
      filter.frequency.setValueAtTime(900, now);

      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.start(now);
      osc.stop(now + 0.05);
    } else if (theme === "tab") {
      osc.type = "sine";
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3000, now);

      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.05);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.start(now);
      osc.stop(now + 0.065);
    } else {
      osc.type = "sine";
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2200, now);

      osc.frequency.setValueAtTime(680, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.06);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      osc.start(now);
      osc.stop(now + 0.07);
    }

    setTimeout(() => this.endVoice(), 80);
  }

  playHover() {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1200, now);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  playSuccess() {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.beginVoice();
    const now = this.ctx.currentTime;
    const frequencies = [523.25, 659.25, 783.99, 987.77, 1174.66];

    frequencies.forEach((freq, i) => {
      const startTime = now + i * 0.065;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i === frequencies.length - 1 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(3200, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });

    setTimeout(() => this.endVoice(), 700);
  }

  playError() {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.beginVoice();
    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = "sine";
    osc2.type = "sine";

    osc1.frequency.setValueAtTime(330, now);
    osc1.frequency.exponentialRampToValueAtTime(260, now + 0.18);

    osc2.frequency.setValueAtTime(311, now);
    osc2.frequency.exponentialRampToValueAtTime(247, now + 0.18);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.25);
    osc2.stop(now + 0.25);

    setTimeout(() => this.endVoice(), 300);
  }

  playLevelComplete() {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.beginVoice();
    const now = this.ctx.currentTime;

    const notes = [
      { f: 392.0, t: 0 },
      { f: 523.25, t: 0.1 },
      { f: 659.25, t: 0.2 },
      { f: 783.99, t: 0.3 },
      { f: 1046.5, t: 0.42 },
      { f: 1318.51, t: 0.52 },
      { f: 1567.98, t: 0.62 },
    ];

    notes.forEach(({ f, t }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + t;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.65);
    });

    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = "sine";
    sub.frequency.setValueAtTime(130.81, now + 0.42);
    subGain.gain.setValueAtTime(0.25, now + 0.42);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    sub.connect(subGain);
    subGain.connect(this.sfxGain);
    sub.start(now + 0.42);
    sub.stop(now + 1.25);

    setTimeout(() => this.endVoice(), 1300);
  }

  playRobotChirp(mood = "happy") {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.beginVoice();
    const now = this.ctx.currentTime;

    if (mood === "greet" || mood === "happy") {
      const chirps = [
        { f1: 880, f2: 1320, start: 0, dur: 0.08 },
        { f1: 1100, f2: 1760, start: 0.09, dur: 0.09 },
        { f1: 1400, f2: 2100, start: 0.19, dur: 0.14 },
      ];

      chirps.forEach(({ f1, f2, start, dur }) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + start;

        osc.type = "sine";
        osc.frequency.setValueAtTime(f1, t);
        osc.frequency.exponentialRampToValueAtTime(f2, t + dur);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + dur + 0.01);
      });
      setTimeout(() => this.endVoice(), 400);
    } else if (mood === "curious") {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(1450, now + 0.22);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
      setTimeout(() => this.endVoice(), 280);
    } else {
      const freqs = [1046, 1318, 1567, 2093, 2637];
      freqs.forEach((f, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.05;

        osc.type = "sine";
        osc.frequency.setValueAtTime(f, t);
        osc.frequency.linearRampToValueAtTime(f * 1.1, t + 0.04);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(t);
        osc.stop(t + 0.06);
      });
      setTimeout(() => this.endVoice(), 350);
    }
  }

  playAlgoStep(index = 0, total = 8) {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.beginVoice();
    const now = this.ctx.currentTime;
    const scale = [
      261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0,
      1046.5,
    ];

    const safeIndex = Math.max(0, Math.min(total, index));
    const noteIdx = Math.floor((safeIndex / Math.max(1, total)) * (scale.length - 1));
    const freq = scale[noteIdx] || 440;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.14);

    setTimeout(() => this.endVoice(), 160);
  }

  playCppTelemetry(mode = "logic") {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.beginVoice();
    const now = this.ctx.currentTime;

    if (mode === "compile") {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(1600, now + 0.18);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(1200, now);
      filter.Q.setValueAtTime(4, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.22);
    } else if (mode === "memory") {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "square";
      osc.frequency.setValueAtTime(950, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.04);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);
    }

    setTimeout(() => this.endVoice(), 220);
  }

  playWebDevCue(track = "html") {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.beginVoice();
    const now = this.ctx.currentTime;

    if (track === "css") {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (track === "react") {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = "triangle";
      osc2.type = "sine";
      osc1.frequency.setValueAtTime(659.25, now);
      osc2.frequency.setValueAtTime(987.77, now);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.2);
      osc2.stop(now + 0.2);
    } else {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.05);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(now);
      osc.stop(now + 0.07);
    }

    setTimeout(() => this.endVoice(), 200);
  }

  playWarp() {
    if (!this.settings.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    this.beginVoice();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.2);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.4);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + 0.2);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.4);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.45);

    setTimeout(() => this.endVoice(), 480);
  }

  setWorldTheme(world) {
    if (this.currentWorldTheme === world) return;
    this.currentWorldTheme = world;
    this.notifySubscribers();

    if (this.settings.ambientEnabled && this.ambientOscillators.length > 0) {
      this.updateAmbientFrequencies();
    }
  }

  getWorldFrequencies() {
    switch (this.currentWorldTheme) {
      case "cpp":
        return [73.42, 110.0, 146.83];
      case "web":
        return [87.31, 130.81, 220.0];
      case "algorithm":
        return [98.0, 146.83, 246.94];
      default:
        return [110.0, 164.81, 277.18];
    }
  }

  startAmbientDrone() {
    if (!this.ctx) return;
    if (this.ambientOscillators.length > 0) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = this.getWorldFrequencies();

      this.ambientFilter = this.ctx.createBiquadFilter();
      this.ambientFilter.type = "lowpass";
      this.ambientFilter.frequency.setValueAtTime(380, now);
      this.ambientFilter.Q.setValueAtTime(2.5, now);

      this.ambientLfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.ambientLfo.type = "sine";
      this.ambientLfo.frequency.setValueAtTime(0.12, now);
      lfoGain.gain.setValueAtTime(90, now);

      this.ambientLfo.connect(lfoGain);
      lfoGain.connect(this.ambientFilter.frequency);
      this.ambientLfo.start(now);

      this.ambientFilter.connect(this.ambientGain);

      this.ambientOscillators = freqs.map((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = i === 0 ? "triangle" : "sine";
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12 / freqs.length, now + 1.5);

        osc.connect(gain);
        gain.connect(this.ambientFilter);
        osc.start(now);

        return { osc, gain, baseFreq: f };
      });
    } catch (e) {
      console.warn("Ambient drone start error:", e);
    }
  }

  updateAmbientFrequencies() {
    if (!this.ctx || this.ambientOscillators.length === 0) return;
    const now = this.ctx.currentTime;
    const freqs = this.getWorldFrequencies();

    this.ambientOscillators.forEach((item, i) => {
      if (freqs[i]) {
        item.osc.frequency.cancelScheduledValues(now);
        item.osc.frequency.setTargetAtTime(freqs[i], now, 1.2);
        item.baseFreq = freqs[i];
      }
    });
  }

  stopAmbientDrone() {
    if (this.ambientOscillators.length === 0) return;

    try {
      const now = this.ctx ? this.ctx.currentTime : 0;
      this.ambientOscillators.forEach(({ osc, gain }) => {
        if (gain && this.ctx) {
          gain.gain.cancelScheduledValues(now);
          gain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
        }
        if (osc) {
          try {
            osc.stop(now + 0.85);
          } catch {
            // already stopped
          }
        }
      });

      if (this.ambientLfo) {
        try {
          this.ambientLfo.stop(now + 0.85);
        } catch {
          // ignore
        }
        this.ambientLfo = null;
      }
    } catch {
      // ignore
    }

    this.ambientOscillators = [];
    this.ambientFilter = null;
  }
}

export const soundEngine = new SoundEngine();
export default soundEngine;
