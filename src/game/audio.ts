/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted = false;
  private masterGain: GainNode | null = null;

  // Ambient wind
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;

  // Engine
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;

  // Snow clearing scrape
  private snowScrapeGain: GainNode | null = null;
  private snowFilter: BiquadFilterNode | null = null;

  // Music loop
  private musicTimer: number | null = null;
  private currentNoteIndex = 0;
  private pentatonicNotes = [293.66, 329.63, 369.99, 440.0, 493.88, 587.33, 659.25, 739.99]; // D major pentatonic

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init(): void {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupWind();
      this.setupEngine();
      this.setupSnowScrape();
      this.startAmbientMusic();
    } catch {
      // Audio not supported or blocked
    }
  }

  private createNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  private setupWind(): void {
    if (!this.ctx || !this.masterGain) return;
    const noise = this.createNoiseBuffer();
    if (!noise) return;

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;
    noiseNode.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'lowpass';
    this.windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    noiseNode.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    noiseNode.start();
  }

  private setupEngine(): void {
    if (!this.ctx || !this.masterGain) return;

    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, this.ctx.currentTime);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

    this.engineOsc.connect(filter);
    filter.connect(this.engineGain);
    this.engineGain.connect(this.masterGain);

    this.engineOsc.start();
  }

  private setupSnowScrape(): void {
    if (!this.ctx || !this.masterGain) return;
    const noise = this.createNoiseBuffer();
    if (!noise) return;

    const noiseNode = this.ctx.createBufferSource();
    noiseNode.buffer = noise;
    noiseNode.loop = true;

    this.snowFilter = this.ctx.createBiquadFilter();
    this.snowFilter.type = 'bandpass';
    this.snowFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
    this.snowFilter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    this.snowScrapeGain = this.ctx.createGain();
    this.snowScrapeGain.gain.setValueAtTime(0, this.ctx.currentTime);

    noiseNode.connect(this.snowFilter);
    this.snowFilter.connect(this.snowScrapeGain);
    this.snowScrapeGain.connect(this.masterGain);

    noiseNode.start();
  }

  public updateEngineSound(speedRatio: number, isPloughing: boolean): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Pitch engine with speed
    if (this.engineOsc) {
      const targetFreq = 42 + Math.abs(speedRatio) * 65;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.1);
    }

    // Snow scrape volume when moving and blade lowered
    if (this.snowScrapeGain) {
      const moving = Math.abs(speedRatio) > 0.1;
      const targetGain = isPloughing && moving ? Math.min(0.22, Math.abs(speedRatio) * 0.2) : 0;
      this.snowScrapeGain.gain.setTargetAtTime(targetGain, now, 0.08);
    }
  }

  private startAmbientMusic(): void {
    if (this.musicTimer) return;

    const playNextChime = () => {
      if (!this.isMuted && this.ctx && this.masterGain && this.ctx.state === 'running') {
        const note = this.pentatonicNotes[this.currentNoteIndex % this.pentatonicNotes.length];
        this.playCelestaNote(note);

        // Advance note
        this.currentNoteIndex = (this.currentNoteIndex + 1 + Math.floor(Math.random() * 2)) % this.pentatonicNotes.length;
      }
      const nextDelay = 1800 + Math.random() * 1600;
      this.musicTimer = window.setTimeout(playNextChime, nextDelay);
    };

    this.musicTimer = window.setTimeout(playNextChime, 1500);
  }

  private playCelestaNote(freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    const oscHarmonic = this.ctx.createOscillator();
    oscHarmonic.type = 'triangle';
    oscHarmonic.frequency.setValueAtTime(freq * 2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    osc.connect(gain);
    oscHarmonic.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    oscHarmonic.start(now);
    osc.stop(now + 2.3);
    oscHarmonic.stop(now + 2.3);
  }

  public playCabinDiscovered(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Rich festive chord (D maj9 arpeggio + bell)
    const chord = [293.66, 369.99, 440.0, 554.37, 587.33];
    chord.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, now + idx * 0.09);
      gain.gain.linearRampToValueAtTime(0.09, now + idx * 0.09 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 3.0);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 3.1);
    });
  }

  public playDecorPlaced(): void {
    if (!this.ctx || !this.masterGain || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.18);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public resumeContext(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public dispose(): void {
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const audio = new AudioManager();
