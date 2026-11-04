/**
 * Audio synthesis & Speech synthesis for digital whiteboard
 * Completely self-contained via Web Audio API & SpeechSynthesis.
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Initialized on first user interaction
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Cheerful success chime (C5 -> E5 -> G5 -> C6)
   */
  public playCorrect() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.3);
      });
    } catch {
      // Audio not permitted or failed
    }
  }

  /**
   * Gentle, encouraging "try again" wobble
   */
  public playTryAgain() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.22);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Ignore
    }
  }

  /**
   * Magical star chime
   */
  public playStarSparkle() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [784, 987, 1174, 1318, 1568]; // G5, B5, D6, E6, G6
      freqs.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.06);

        gain.gain.setValueAtTime(0.12, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.4);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Wheel ticking click
   */
  public playTick() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Ignore
    }
  }

  /**
   * Grand reward celebration fanfare
   */
  public playFanfare() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chords = [
        { freqs: [523.25, 659.25, 783.99], time: 0, dur: 0.25 }, // C Major
        { freqs: [587.33, 739.99, 880.00], time: 0.28, dur: 0.25 }, // D Major
        { freqs: [659.25, 830.61, 987.77], time: 0.56, dur: 0.25 }, // E Major
        { freqs: [783.99, 987.77, 1174.66, 1567.98], time: 0.85, dur: 0.8 }, // G Major high
      ];

      chords.forEach(chord => {
        chord.freqs.forEach(freq => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + chord.time);

          gain.gain.setValueAtTime(0.15, now + chord.time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chord.time + chord.dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + chord.time);
          osc.stop(now + chord.time + chord.dur + 0.05);
        });
      });
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundEffectsManager();

/**
 * Speech synthesis with British English (en-GB) accent as specified
 */
export function speakEnglish(text: string, rate: number = 0.9): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      // Clean text: strip emojis, asterisks, brackets
      const clean = text
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/[\/\\#+$~%*<>{}]/g, ' ')
        .trim();

      if (!clean) {
        resolve();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.lang = 'en-GB';
      utterance.rate = rate;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      // Look for en-GB voice
      const gbVoice = voices.find(v => v.lang === 'en-GB' || v.lang.startsWith('en-GB')) ||
                      voices.find(v => v.lang.includes('en') && (v.name.includes('UK') || v.name.includes('British'))) ||
                      voices.find(v => v.lang.startsWith('en'));

      if (gbVoice) {
        utterance.voice = gbVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });
}
