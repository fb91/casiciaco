"use client";

/**
 * Procedural soundscape (no audio files): the noise of a busy day that grows with the
 * notifications and disappears completely once the visitor holds for silence.
 * After the silence there is no sound at all.
 */
type Engine = {
  context: AudioContext;
  master: GainNode;
  noise: GainNode;
  harsh: GainNode;
  band: BiquadFilterNode;
};
let engine: Engine | null = null;
let level = 0;
let on = false;
let listener: (running: boolean) => void = () => {};

function build(): Engine | null {
  const Context =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Context) return null;
  // iOS: play through the speaker even with the silent switch on (Safari 16.4+).
  const session = (navigator as { audioSession?: { type: string } })
    .audioSession;
  if (session) session.type = "playback";
  const context = new Context();
  context.onstatechange = () => listener(context.state === "running");
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

  // An irritating electric buzz with a nervous tremolo: it only appears as the day piles up.
  const harsh = context.createGain();
  harsh.gain.value = 0;
  const edge = context.createBiquadFilter();
  edge.type = "bandpass";
  edge.frequency.value = 1900;
  edge.Q.value = 1.4;
  const tremolo = context.createGain();
  tremolo.gain.value = 0.5;
  const shake = context.createOscillator();
  const shakeDepth = context.createGain();
  shake.frequency.value = 9;
  shakeDepth.gain.value = 0.5;
  shake.connect(shakeDepth).connect(tremolo.gain);
  [111, 117.5, 223].forEach((frequency) => {
    const oscillator = context.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.value = frequency;
    oscillator.connect(edge);
    oscillator.start();
  });
  edge.connect(tremolo).connect(harsh).connect(master);
  shake.start();
  return { context, master, noise, harsh, band };
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
    const { context } = engine;
    // Older iOS only unlocks audio if something plays inside the gesture.
    const blank = context.createBufferSource();
    blank.buffer = context.createBuffer(1, 1, context.sampleRate);
    blank.connect(context.destination);
    blank.start();
    void context.resume();
    engine.master.gain.setTargetAtTime(0.9, context.currentTime, 0.2);
    this.setLevel(level);
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
  /** Called whenever the browser starts or stops actually playing audio. */
  listen(callback: (running: boolean) => void) {
    listener = callback;
    callback(this.running);
  },
  get running() {
    return !!engine && engine.context.state === "running";
  },
  get active() {
    return on && !!engine && level > 0;
  },
  /**
   * 0..1 intensity of the noise. Low: a murmur. High: louder, brighter and buzzing.
   * 0 is total silence; `immediate` cuts it in a fraction of a second.
   */
  setLevel(value: number, immediate = false) {
    level = value;
    if (!engine) return;
    const now = engine.context.currentTime;
    const time = immediate ? 0.03 : 0.2;
    engine.noise.gain.setTargetAtTime(value * 0.75, now, time);
    engine.harsh.gain.setTargetAtTime(
      Math.max(0, value - 0.35) ** 2 * 0.5,
      now,
      time,
    );
    engine.band.Q.setTargetAtTime(0.7 + value * 2.5, now, time);
  },
  /** A notification: chime plus a phone buzz, louder as the noise grows. */
  ping() {
    if (!this.active) return;
    const loud = 0.4 + level * 0.8;
    const base = 1200 + Math.random() * 500;
    envelope(base, 0.07 * loud, 0.16);
    envelope(base * 1.5, 0.06 * loud, 0.2, "sine", 0.08);
    envelope(170, 0.05 * loud, 0.32, "square", 0.02);
  },
};
