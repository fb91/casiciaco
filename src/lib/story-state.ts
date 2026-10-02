"use client";
import { useSyncExternalStore } from "react";

/** Small client store shared by the story widgets: start, choice, sound and the silence gate. */
type State = {
  /** The visitor tapped «Tocá para empezar» (or arrived through a deep link). */
  started: boolean;
  choice: number | null;
  /** The visitor wants sound (on by default). */
  sound: boolean;
  /** The browser is actually playing it (needs a first tap or key press). */
  audible: boolean;
  silenced: boolean;
};
const startKey = "casiciaco-inicio";
const silenceKey = "casiciaco-silencio";
const choiceKey = "casiciaco-eleccion";
const soundKey = "casiciaco-sonido";
let state: State = {
  started: false,
  choice: null,
  sound: true,
  audible: false,
  silenced: false,
};
let hydrated = false;
const listeners = new Set<() => void>();
/** Per-frame values that must not re-render React (read by the scroll runtime). */
export const live = { hold: 0 };

function read(key: string) {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function readLocal(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    // Storage may be blocked; the story still works for this visit.
  }
}
function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  const choice = Number(read(choiceKey));
  const html = document.documentElement.dataset;
  state = {
    ...state,
    started: read(startKey) === "1" || html.started !== undefined,
    choice:
      read(choiceKey) !== null && choice >= 0 && choice < 3 ? choice : null,
    sound: readLocal(soundKey) !== "0",
    silenced: read(silenceKey) === "1" || html.silence === "open",
  };
}
function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}
export const storyState = {
  get: () => {
    hydrate();
    return state;
  },
  /** Unlocks the page: until then only «Tocá para empezar» moves the story. */
  start() {
    hydrate();
    write(startKey, "1");
    document.documentElement.dataset.started = "";
    // The page was kept at the top until now; from here a reload returns to the same spot.
    history.scrollRestoration = "auto";
    if (!state.started) set({ started: true });
  },
  setChoice(choice: number | null) {
    write(choiceKey, choice === null ? null : String(choice));
    set({ choice });
  },
  setSound(sound: boolean) {
    // Remembered across visits: whoever turns it off keeps it off.
    try {
      localStorage.setItem(soundKey, sound ? "1" : "0");
    } catch {
      // Blocked storage: the choice lasts for this visit.
    }
    set({ sound });
  },
  setAudible(audible: boolean) {
    if (audible !== state.audible) set({ audible });
  },
  openSilence() {
    this.start();
    write(silenceKey, "1");
    document.documentElement.dataset.silence = "open";
    set({ silenced: true });
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
const serverState: State = {
  started: false,
  choice: null,
  sound: true,
  audible: false,
  silenced: false,
};
export function useStory<T>(select: (state: State) => T): T {
  return useSyncExternalStore(
    storyState.subscribe,
    () => select(storyState.get()),
    () => select(serverState),
  );
}
