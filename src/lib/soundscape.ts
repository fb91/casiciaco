"use client";

/**
 * Procedural, opt-in soundscape (no audio files): city-like noise that fades into a calm pad.
 * Created on the first user gesture so browsers allow playback.
 */
type Engine = {
  context: AudioContext;
  master: GainNode;
  noise: GainNode;
  calm: GainNode;
};
let engine: Engine | null = null;
let mix = { noise: 0, calm: 0 };
let on = false;

function build(): Engine | null {
  const Context =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Context) return null;
  const context = new Context();
  const master = context.createGain();
  master.gain.value = 0;
  master.connect(context.destination);

  // Brown noise through a wandering band-pass: a busy, restless room.
  const length = context.sampleRate * 4;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  const band = context.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = 700;
  band.Q.value = 0.7;
  const wander = context.createOscillator();
  const wanderDepth = context.createGain();
  wander.frequency.value = 0.23;
  wanderDepth.gain.value = 380;
  wander.connect(wanderDepth).connect(band.frequency);
  const noise = context.createGain();
  noise.gain.value = 0;
  source.connect(band).connect(noise).connect(master);
  source.start();
  wander.start();

  // A warm A-major pad that breathes slowly.
  const calm = context.createGain();
  calm.gain.value = 0;
  const low = context.createBiquadFilter();
  low.type = "lowpass";
  low.frequency.value = 900;
  low.connect(calm).connect(master);
  [110, 164.81, 220, 277.18, 329.63].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const voice = context.createGain();
    oscillator.type = index % 2 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    oscillator.detune.value = (index - 2) * 4;
    voice.gain.value = 0.09 / (index + 1);
    const breath = context.createOscillator();
    const breathDepth = context.createGain();
    breath.frequency.value = 0.07 + index * 0.013;
    breathDepth.gain.value = voice.gain.value * 0.6;
    breath.connect(breathDepth).connect(voice.gain);
    oscillator.connect(voice).connect(low);
    oscillator.start();
    breath.start();
  });
  return { context, master, noise, calm };
}

function envelope(
  frequency: number,
  peak: number,
  duration: number,
  type: OscillatorType = "sine",
  delay = 0,
) {
  if (!engine) return;
  const { context, master } = engine;
  const at = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, at);
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(peak, at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(gain).connect(master);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.05);
}

export const soundscape = {
  enable() {
    engine ||= build();
    if (!engine) return false;
    on = true;
    void engine.context.resume();
    engine.master.gain.setTargetAtTime(0.9, engine.context.currentTime, 0.4);
    this.setMix(mix.noise, mix.calm);
    return true;
  },
  disable() {
    on = false;
    if (!engine) return;
    engine.master.gain.setTargetAtTime(0, engine.context.currentTime, 0.15);
    const context = engine.context;
    setTimeout(() => {
      if (!on) void context.suspend();
    }, 900);
  },
  get active() {
    return on && !!engine;
  },
  /** 0..1 levels for the restless noise and the calm pad. */
  setMix(noise: number, calm: number) {
    mix = { noise, calm };
    if (!engine) return;
    const now = engine.context.currentTime;
    engine.noise.gain.setTargetAtTime(noise * 0.55, now, 0.25);
    engine.calm.gain.setTargetAtTime(calm * 0.8, now, 0.8);
  },
  /** A notification blip. */
  ping() {
    if (!this.active) return;
    const base = 1200 + Math.random() * 500;
    envelope(base, 0.05, 0.14);
    envelope(base * 1.5, 0.04, 0.18, "sine", 0.07);
  },
  /** A soft heartbeat thump. */
  beat(strength = 1) {
    if (!this.active) return;
    envelope(62, 0.22 * strength, 0.22);
    envelope(55, 0.14 * strength, 0.24, "sine", 0.17);
  },
  /** A bright chime when the silence opens. */
  chime() {
    if (!this.active) return;
    [659.25, 880, 1108.73].forEach((frequency, index) =>
      envelope(frequency, 0.06, 2.4, "sine", index * 0.12),
    );
  },
};
