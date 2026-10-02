"use client";

/**
 * Procedural soundscape (no audio files). Before the silence: the noise of a busy day that
 * grows with the notifications and fades away while the visitor holds still. After the
 * silence: a slow, quiet loop of soft chords with a few distant bells.
 */
type Engine = {
  context: AudioContext;
  master: GainNode;
  noise: GainNode;
  harsh: GainNode;
  band: BiquadFilterNode;
  /** Volume of the calm loop. */
  calm: GainNode;
  /** Soft low-pass the chords go through. */
  pad: AudioNode;
  /** Bells, with a gentle echo. */
  bells: AudioNode;
};
let engine: Engine | null = null;
let level = 0;
let on = false;
let calmOn = false;
let ducked = false;
let calmTimer = 0;
let nextChord = 0;
let chord = 0;
let listener: (running: boolean) => void = () => {};

/** Calm loop: one chord every few seconds (D major, unhurried), voiced for phone speakers. */
const chords = [
  [146.83, 220.0, 277.18, 369.99, 440.0], // Dmaj7
  [123.47, 185.0, 220.0, 293.66, 369.99], // Bm7
  [98.0, 146.83, 246.94, 293.66, 369.99], // Gmaj7
  [110.0, 164.81, 220.0, 293.66, 329.63], // Asus4
];
const bellNotes = [587.33, 659.25, 739.99, 880.0, 987.77]; // D pentatonic
const chordLength = 8;
const calmVolume = 0.6;
/** While a testimonial video plays, the background is silent. */
const duckedVolume = 0;

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

  // The calm loop: chords through a soft low-pass, bells with a short echo.
  const calm = context.createGain();
  calm.gain.value = 0;
  calm.connect(master);
  const pad = context.createBiquadFilter();
  pad.type = "lowpass";
  pad.frequency.value = 1100;
  pad.Q.value = 0.4;
  pad.connect(calm);
  const bells = context.createGain();
  const echo = context.createDelay(2);
  echo.delayTime.value = 0.45;
  const feedback = context.createGain();
  feedback.gain.value = 0.35;
  const warmth = context.createBiquadFilter();
  warmth.type = "lowpass";
  warmth.frequency.value = 2200;
  bells.connect(calm);
  bells.connect(echo).connect(warmth).connect(feedback).connect(echo);
  warmth.connect(calm);
  return { context, master, noise, harsh, band, calm, pad, bells };
}

/** One chord that swells in slowly and fades out over the next one. */
function playChord(at: number, notes: number[]) {
  if (!engine) return;
  const { context, pad } = engine;
  const end = at + chordLength + 4;
  notes.forEach((frequency, index) => {
    const gain = context.createGain();
    const peak = index === 0 ? 0.03 : 0.022;
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(peak, at + 3);
    gain.gain.setValueAtTime(peak, at + chordLength - 1);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    gain.connect(pad);
    (["sine", "triangle"] as const).forEach((type, layer) => {
      const oscillator = context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      oscillator.detune.value = layer ? 5 : -5;
      oscillator.connect(gain);
      oscillator.start(at);
      oscillator.stop(end + 0.1);
    });
  });
}
function playBell(at: number) {
  if (!engine) return;
  const { context, bells } = engine;
  const frequency = bellNotes[Math.floor(Math.random() * bellNotes.length)];
  const gain = context.createGain();
  gain.gain.setValueAtTime(0, at);
  gain.gain.linearRampToValueAtTime(0.026, at + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + 3.6);
  gain.connect(bells);
  [1, 2.01].forEach((ratio, partial) => {
    const oscillator = context.createOscillator();
    const level = context.createGain();
    oscillator.frequency.value = frequency * ratio;
    level.gain.value = partial ? 0.18 : 1;
    oscillator.connect(level).connect(gain);
    oscillator.start(at);
    oscillator.stop(at + 3.7);
  });
}
/** Keeps a couple of seconds of the loop scheduled ahead. */
function scheduleCalm() {
  if (!engine || !calmOn) return;
  const now = engine.context.currentTime;
  while (nextChord < now + 1.5) {
    playChord(nextChord, chords[chord % chords.length]);
    // One or two bells somewhere inside each chord.
    playBell(nextChord + 1.5 + Math.random() * 2.5);
    if (Math.random() < 0.6) playBell(nextChord + 4.5 + Math.random() * 2.5);
    chord++;
    nextChord += chordLength;
  }
}
function applyCalm() {
  if (!engine) return;
  const { context, calm } = engine;
  const now = context.currentTime;
  calm.gain.cancelScheduledValues(now);
  if (calmOn) {
    // A breath of real silence first, then the loop fades in.
    if (nextChord < now) nextChord = now + 2.5;
    calm.gain.setTargetAtTime(
      ducked ? duckedVolume : calmVolume,
      now + 2.5,
      2.5,
    );
    calmTimer ||= window.setInterval(scheduleCalm, 400);
    scheduleCalm();
  } else {
    calm.gain.setTargetAtTime(0, now, 0.4);
    clearInterval(calmTimer);
    calmTimer = 0;
  }
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
    if (calmOn && !calmTimer) applyCalm();
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
  /** The calm loop after the silence: on or off. */
  setCalm(value: boolean) {
    if (value === calmOn) return;
    calmOn = value;
    applyCalm();
  },
  /** Silences the calm loop while a testimonial video plays. */
  duck(value: boolean) {
    if (value === ducked) return;
    ducked = value;
    if (!engine || !calmOn) return;
    const now = engine.context.currentTime;
    // Overrides a fade-in that may still be scheduled.
    engine.calm.gain.cancelScheduledValues(now);
    engine.calm.gain.setTargetAtTime(
      value ? duckedVolume : calmVolume,
      now,
      value ? 0.15 : 0.6,
    );
  },
  /** A short, bright «done» when the silence is reached: a rising D major arpeggio. */
  success() {
    if (!on || !engine) return;
    [587.33, 880.0, 1174.66].forEach((frequency, index) => {
      envelope(frequency, 0.11, 0.9 - index * 0.15, "sine", index * 0.075);
      envelope(frequency * 2, 0.025, 0.5, "triangle", index * 0.075);
    });
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
