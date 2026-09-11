import type { GameSettings } from '../../types/settings';
import { clamp } from '../../utils/math';

export interface AudioPosition {
  readonly x: number;
  readonly y?: number;
  readonly z: number;
}

export type AudioCue = 'ui-hover' | 'ui-confirm' | 'flashlight' | 'pickup' | 'locked' | 'objective';

type Category = 'ambience' | 'sfx' | 'ui';

const safeStop = (source: AudioScheduledSourceNode): void => {
  try {
    source.stop();
  } catch {
    // A source can already have naturally stopped.
  }
};

class AudioEngine {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambience: GainNode | null = null;
  private sfx: GainNode | null = null;
  private ui: GainNode | null = null;
  private ambienceBus: GainNode | null = null;
  private tensionFilter: BiquadFilterNode | null = null;
  private humGain: GainNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private lowNoiseBuffer: AudioBuffer | null = null;
  private loopingSources: AudioScheduledSourceNode[] = [];
  private initialized = false;
  private paused = false;
  private settings: GameSettings | null = null;

  public get isReady(): boolean {
    return this.context !== null && this.context.state !== 'closed';
  }

  public get state(): AudioContextState | 'unavailable' {
    return this.context?.state ?? 'unavailable';
  }

  public async initialize(settings: GameSettings): Promise<boolean> {
    this.settings = settings;
    if (this.initialized && this.context) {
      await this.resume();
      this.updateMix(settings);
      return true;
    }

    const Context = window.AudioContext ?? window.webkitAudioContext;
    if (!Context) return false;

    try {
      const context = new Context({ latencyHint: 'interactive' });
      const master = context.createGain();
      const compressor = context.createDynamicsCompressor();
      const ambience = context.createGain();
      const sfx = context.createGain();
      const ui = context.createGain();
      const ambienceBus = context.createGain();
      const tensionFilter = context.createBiquadFilter();

      compressor.threshold.value = -18;
      compressor.knee.value = 20;
      compressor.ratio.value = 5;
      compressor.attack.value = 0.008;
      compressor.release.value = 0.3;
      tensionFilter.type = 'lowpass';
      tensionFilter.frequency.value = 480;
      tensionFilter.Q.value = 0.6;

      ambienceBus.connect(tensionFilter).connect(ambience);
      ambience.connect(compressor);
      sfx.connect(compressor);
      ui.connect(compressor);
      compressor.connect(master).connect(context.destination);

      this.context = context;
      this.master = master;
      this.ambience = ambience;
      this.sfx = sfx;
      this.ui = ui;
      this.ambienceBus = ambienceBus;
      this.tensionFilter = tensionFilter;
      this.noiseBuffer = this.createNoiseBuffer(2.5, false);
      this.lowNoiseBuffer = this.createNoiseBuffer(4, true);
      this.initialized = true;
      this.updateMix(settings);
      this.startRoomTone();
      await this.resume();
      return true;
    } catch {
      this.dispose();
      return false;
    }
  }

  public async resume(): Promise<void> {
    if (this.context?.state === 'suspended') {
      try {
        await this.context.resume();
      } catch {
        // The next explicit user gesture can retry.
      }
    }
  }

  public updateMix(settings: GameSettings): void {
    this.settings = settings;
    if (!this.context) return;
    const now = this.context.currentTime;
    this.master?.gain.setTargetAtTime(settings.masterVolume * (this.paused ? 0.2 : 1), now, 0.04);
    this.ambience?.gain.setTargetAtTime(settings.musicVolume, now, 0.04);
    this.sfx?.gain.setTargetAtTime(settings.sfxVolume, now, 0.04);
    this.ui?.gain.setTargetAtTime(settings.sfxVolume * 0.72, now, 0.04);
  }

  public setPaused(paused: boolean): void {
    this.paused = paused;
    if (this.settings) this.updateMix(this.settings);
  }

  public setTension(tension: number): void {
    if (!this.context) return;
    const normalized = clamp(tension / 100, 0, 1);
    const now = this.context.currentTime;
    this.ambienceBus?.gain.setTargetAtTime(0.65 + normalized * 0.38, now, 1.4);
    this.tensionFilter?.frequency.setTargetAtTime(420 + normalized * 780, now, 1.8);
  }

  public setPower(enabled: boolean): void {
    if (!this.context || !this.ambienceBus) return;
    const now = this.context.currentTime;
    if (!this.humGain) {
      const oscillator = this.context.createOscillator();
      const upper = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = 60;
      upper.type = 'sine';
      upper.frequency.value = 120;
      gain.gain.value = 0;
      oscillator.connect(gain);
      upper.connect(gain);
      gain.connect(this.ambienceBus);
      oscillator.start();
      upper.start();
      this.loopingSources.push(oscillator, upper);
      this.humGain = gain;
    }
    this.humGain.gain.setTargetAtTime(enabled ? 0.017 : 0, now, 0.6);
  }

  public setListener(
    position: AudioPosition,
    forward: { readonly x: number; readonly y: number; readonly z: number },
  ): void {
    const context = this.context;
    if (!context) return;
    const listener = context.listener;
    const now = context.currentTime;
    listener.positionX.setValueAtTime(position.x, now);
    listener.positionY.setValueAtTime(position.y ?? 1.65, now);
    listener.positionZ.setValueAtTime(position.z, now);
    listener.forwardX.setValueAtTime(forward.x, now);
    listener.forwardY.setValueAtTime(forward.y, now);
    listener.forwardZ.setValueAtTime(forward.z, now);
    listener.upX.setValueAtTime(0, now);
    listener.upY.setValueAtTime(1, now);
    listener.upZ.setValueAtTime(0, now);
  }

  public playCue(cue: AudioCue): void {
    if (!this.context) return;
    const definitions: Record<AudioCue, readonly [number, number, number, OscillatorType]> = {
      'ui-hover': [310, 350, 0.035, 'sine'],
      'ui-confirm': [180, 260, 0.11, 'triangle'],
      flashlight: [115, 72, 0.055, 'square'],
      pickup: [280, 520, 0.16, 'sine'],
      locked: [95, 72, 0.13, 'square'],
      objective: [130, 195, 0.22, 'sine'],
    };
    const [from, to, duration, type] = definitions[cue];
    this.oscillatorSweep(from, to, duration, 0.045, type, 'ui');
    if (cue === 'flashlight' || cue === 'locked') this.noiseBurst(0.045, 900, 0.025, 'sfx');
  }

  public playFootstep(position?: AudioPosition, weight = 1): void {
    if (!this.context) return;
    this.noiseBurst(0.095, 520, 0.09 * weight, 'sfx', position, 'lowpass');
    this.oscillatorSweep(82, 42, 0.08, 0.065 * weight, 'sine', 'sfx', position);
  }

  public playDoor(position: AudioPosition): void {
    if (!this.context) return;
    this.oscillatorSweep(188, 48, 0.85, 0.035, 'sawtooth', 'sfx', position);
    this.noiseBurst(0.7, 1250, 0.035, 'sfx', position, 'bandpass');
  }

  public playCreak(position: AudioPosition, intensity = 1): void {
    if (!this.context) return;
    this.oscillatorSweep(
      125 + Math.random() * 70,
      45,
      1.25,
      0.026 * intensity,
      'sawtooth',
      'sfx',
      position,
    );
    this.noiseBurst(0.8, 750, 0.018 * intensity, 'sfx', position, 'bandpass');
  }

  public playImpact(position: AudioPosition, intensity = 1): void {
    if (!this.context) return;
    this.oscillatorSweep(78, 24, 0.55, 0.16 * intensity, 'sine', 'sfx', position);
    this.noiseBurst(0.18, 380, 0.12 * intensity, 'sfx', position, 'lowpass');
  }

  public playWhisper(position: AudioPosition, duration = 1.5): void {
    if (!this.context) return;
    this.noiseBurst(duration, 1350 + Math.random() * 500, 0.032, 'sfx', position, 'bandpass');
    this.oscillatorSweep(190, 150, duration * 0.8, 0.01, 'sine', 'sfx', position);
  }

  public playBreathing(position: AudioPosition): () => void {
    if (!this.context || !this.noiseBuffer) return () => undefined;
    const context = this.context;
    const nodes: AudioBufferSourceNode[] = [];
    const now = context.currentTime;
    for (let index = 0; index < 4; index += 1) {
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const panner = this.createPanner(position);
      source.buffer = this.noiseBuffer;
      filter.type = 'bandpass';
      filter.frequency.value = 620;
      filter.Q.value = 1.1;
      const start = now + index * 1.15;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.04, start + 0.38);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.94);
      source
        .connect(filter)
        .connect(gain)
        .connect(panner)
        .connect(this.sfx as GainNode);
      source.start(start, 0, 1);
      source.stop(start + 1.02);
      nodes.push(source);
    }
    return () => nodes.forEach(safeStop);
  }

  public playFootstepsBehind(player: AudioPosition, yaw: number, count = 5): () => void {
    if (!this.context || !this.noiseBuffer) return () => undefined;
    const context = this.context;
    const sources: AudioScheduledSourceNode[] = [];
    const behind = {
      x: player.x + Math.sin(yaw) * 6,
      y: 0.1,
      z: player.z + Math.cos(yaw) * 6,
    };
    const now = context.currentTime + 0.12;
    for (let index = 0; index < count; index += 1) {
      const delay = index * (0.48 + (index % 2) * 0.04);
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const panner = this.createPanner({ ...behind, x: behind.x + (index % 2 ? 0.3 : -0.3) });
      source.buffer = this.noiseBuffer;
      filter.type = 'lowpass';
      filter.frequency.value = 470;
      const start = now + delay;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.115, start + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
      source
        .connect(filter)
        .connect(gain)
        .connect(panner)
        .connect(this.sfx as GainNode);
      source.start(start, 0, 0.18);
      source.stop(start + 0.2);
      sources.push(source);
    }
    return () => sources.forEach(safeStop);
  }

  public dispose(): void {
    this.loopingSources.forEach(safeStop);
    this.loopingSources = [];
    if (this.context && this.context.state !== 'closed') void this.context.close();
    this.context = null;
    this.master = null;
    this.ambience = null;
    this.sfx = null;
    this.ui = null;
    this.initialized = false;
  }

  private createNoiseBuffer(seconds: number, low: boolean): AudioBuffer {
    const context = this.context as AudioContext;
    const length = Math.floor(context.sampleRate * seconds);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const channel = buffer.getChannelData(0);
    let previous = 0;
    for (let index = 0; index < length; index += 1) {
      const white = Math.random() * 2 - 1;
      previous = previous * 0.965 + white * 0.035;
      channel[index] = low ? previous * 2.4 : white;
    }
    return buffer;
  }

  private startRoomTone(): void {
    const context = this.context;
    const destination = this.ambienceBus;
    if (!context || !destination || !this.lowNoiseBuffer) return;

    const base = context.createOscillator();
    const undertone = context.createOscillator();
    const baseGain = context.createGain();
    const wind = context.createBufferSource();
    const windFilter = context.createBiquadFilter();
    const windGain = context.createGain();

    base.type = 'sine';
    base.frequency.value = 41;
    undertone.type = 'triangle';
    undertone.frequency.value = 57.7;
    baseGain.gain.value = 0.018;
    wind.buffer = this.lowNoiseBuffer;
    wind.loop = true;
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 260;
    windGain.gain.value = 0.035;

    base.connect(baseGain);
    undertone.connect(baseGain);
    baseGain.connect(destination);
    wind.connect(windFilter).connect(windGain).connect(destination);
    base.start();
    undertone.start();
    wind.start();
    this.loopingSources.push(base, undertone, wind);
  }

  private categoryNode(category: Category): GainNode | null {
    if (category === 'ambience') return this.ambienceBus;
    if (category === 'ui') return this.ui;
    return this.sfx;
  }

  private createPanner(position: AudioPosition): PannerNode {
    const context = this.context as AudioContext;
    const panner = context.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1.3;
    panner.maxDistance = 28;
    panner.rolloffFactor = 1.25;
    panner.positionX.value = position.x;
    panner.positionY.value = position.y ?? 1;
    panner.positionZ.value = position.z;
    return panner;
  }

  private noiseBurst(
    duration: number,
    frequency: number,
    volume: number,
    category: Category,
    position?: AudioPosition,
    filterType: BiquadFilterType = 'lowpass',
  ): void {
    const context = this.context;
    const buffer = this.noiseBuffer;
    const categoryNode = this.categoryNode(category);
    if (!context || !buffer || !categoryNode) return;
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const now = context.currentTime;
    source.buffer = buffer;
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = filterType === 'bandpass' ? 1.4 : 0.6;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(
      Math.max(0.0001, volume),
      now + Math.min(0.025, duration / 3),
    );
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain);
    if (position) gain.connect(this.createPanner(position)).connect(categoryNode);
    else gain.connect(categoryNode);
    source.start(now, Math.random() * Math.max(0.01, buffer.duration - duration), duration);
    source.stop(now + duration + 0.02);
  }

  private oscillatorSweep(
    from: number,
    to: number,
    duration: number,
    volume: number,
    type: OscillatorType,
    category: Category,
    position?: AudioPosition,
  ): void {
    const context = this.context;
    const categoryNode = this.categoryNode(category);
    if (!context || !categoryNode) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(1, from), now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, to), now + duration);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    if (position) gain.connect(this.createPanner(position)).connect(categoryNode);
    else gain.connect(categoryNode);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  }
}

export const audioEngine = new AudioEngine();
