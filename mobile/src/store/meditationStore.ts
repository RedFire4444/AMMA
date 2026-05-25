import { create } from 'zustand';

type SoundOption = 'nature' | 'rain' | 'ocean' | 'birds' | 'bowl';
type SessionType = 'free' | 'guided' | 'breathing';

interface MeditationState {
  duration: number;
  remaining: number;
  isRunning: boolean;
  isPaused: boolean;
  selectedSound: SoundOption;
  sessionType: SessionType;
  startedAt: string | null;
  elapsedTime: number;
  isEndless: boolean;
  intervalChimeEnabled: boolean;
  setDuration: (minutes: number) => void;
  setIntervalChime: (enabled: boolean) => void;
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
  selectedSound: 'nature',
  sessionType: 'free',
  startedAt: null,
  elapsedTime: 0,
  isEndless: false,
  intervalChimeEnabled: true, // Default to true as it's a new feature

  setDuration: (minutes: number) => {
    // If minutes is 0, we treat it as endless mode.
    if (minutes === 0) {
      set({ duration: 0, remaining: 0, isEndless: true });
    } else {
      const seconds = minutes * 60;
      set({ duration: seconds, remaining: seconds, isEndless: false });
    }
  },

  setIntervalChime: (enabled: boolean) => {
    set({ intervalChimeEnabled: enabled });
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
      elapsedTime: 0,
      startedAt: null,
    });
  },

  tick: () => {
    const { remaining, isEndless, elapsedTime } = get();
    
    if (isEndless) {
      set({ elapsedTime: elapsedTime + 1 });
    } else {
      if (remaining > 0) {
        set({ remaining: remaining - 1, elapsedTime: elapsedTime + 1 });
      } else {
        set({ isRunning: false, isPaused: false });
      }
    }
  },

  reset: () => {
    set({
      duration: 300,
      remaining: 300,
      elapsedTime: 0,
      isEndless: false,
      isRunning: false,
      isPaused: false,
      selectedSound: 'nature',
      sessionType: 'free',
      startedAt: null,
    });
  },
}));
