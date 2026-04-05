import { create } from 'zustand';

type SoundOption = 'nature' | 'rain' | 'ocean' | 'birds' | 'bowl' | 'silence';
type SessionType = 'free' | 'guided' | 'breathing';

interface MeditationState {
  duration: number;
  remaining: number;
  isRunning: boolean;
  isPaused: boolean;
  selectedSound: SoundOption;
  sessionType: SessionType;
  startedAt: string | null;
  setDuration: (minutes: number) => void;
  setSound: (sound: SoundOption) => void;
  setSessionType: (type: SessionType) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  tick: () => void;
  reset: () => void;
}

export const useMeditationStore = create<MeditationState>((set, get) => ({
  duration: 300,
  remaining: 300,
  isRunning: false,
  isPaused: false,
  selectedSound: 'silence',
  sessionType: 'free',
  startedAt: null,

  setDuration: (minutes: number) => {
    const seconds = minutes * 60;
    set({ duration: seconds, remaining: seconds });
  },

  setSound: (sound: SoundOption) => {
    set({ selectedSound: sound });
  },

  setSessionType: (type: SessionType) => {
    set({ sessionType: type });
  },

  start: () => {
    set({
      isRunning: true,
      isPaused: false,
      remaining: get().duration,
      startedAt: new Date().toISOString(),
    });
  },

  pause: () => {
    set({ isRunning: false, isPaused: true });
  },

  resume: () => {
    set({ isRunning: true, isPaused: false });
  },

  stop: () => {
    set({
      isRunning: false,
      isPaused: false,
      remaining: get().duration,
      startedAt: null,
    });
  },

  tick: () => {
    const { remaining } = get();
    if (remaining > 0) {
      set({ remaining: remaining - 1 });
    } else {
      set({ isRunning: false, isPaused: false });
    }
  },

  reset: () => {
    set({
      duration: 300,
      remaining: 300,
      isRunning: false,
      isPaused: false,
      selectedSound: 'silence',
      sessionType: 'free',
      startedAt: null,
    });
  },
}));
