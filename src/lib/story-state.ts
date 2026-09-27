"use client";
import { useSyncExternalStore } from "react";

/** Small client store shared by the story widgets: choice, sound and the silence gate. */
type State = { choice: number | null; sound: boolean; silenced: boolean };
const silenceKey = "casiciaco-silencio";
const choiceKey = "casiciaco-eleccion";
let state: State = { choice: null, sound: false, silenced: false };
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
  state = {
    ...state,
    choice:
      read(choiceKey) !== null && choice >= 0 && choice < 3 ? choice : null,
    silenced:
      read(silenceKey) === "1" ||
      document.documentElement.dataset.silence === "open",
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
  setChoice(choice: number | null) {
    write(choiceKey, choice === null ? null : String(choice));
    set({ choice });
  },
  setSound(sound: boolean) {
    set({ sound });
  },
  openSilence() {
    write(silenceKey, "1");
    document.documentElement.dataset.silence = "open";
    set({ silenced: true });
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
const serverState: State = { choice: null, sound: false, silenced: false };
export function useStory<T>(select: (state: State) => T): T {
  return useSyncExternalStore(
    storyState.subscribe,
    () => select(storyState.get()),
    () => select(serverState),
  );
}
