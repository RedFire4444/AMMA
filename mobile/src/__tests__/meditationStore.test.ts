import { useMeditationStore } from '../store/meditationStore';

describe('meditationStore', () => {
  beforeEach(() => {
    useMeditationStore.getState().reset();
  });

  it('has correct initial state', () => {
    const state = useMeditationStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.isPaused).toBe(false);
    expect(state.duration).toBe(300);
    expect(state.remaining).toBe(300);
    expect(state.selectedSound).toBe('silence');
    expect(state.sessionType).toBe('free');
  });

  it('setDuration updates duration and remaining', () => {
    useMeditationStore.getState().setDuration(5);
    const state = useMeditationStore.getState();
    expect(state.duration).toBe(300);
    expect(state.remaining).toBe(300);
  });

  it('setSound updates selectedSound', () => {
    useMeditationStore.getState().setSound('rain');
    expect(useMeditationStore.getState().selectedSound).toBe('rain');
  });

  it('setSessionType updates sessionType', () => {
    useMeditationStore.getState().setSessionType('guided');
    expect(useMeditationStore.getState().sessionType).toBe('guided');
  });

  it('start sets isRunning to true', () => {
    useMeditationStore.getState().start();
    expect(useMeditationStore.getState().isRunning).toBe(true);
    expect(useMeditationStore.getState().isPaused).toBe(false);
  });

  it('pause sets isPaused and clears isRunning', () => {
    useMeditationStore.getState().start();
    useMeditationStore.getState().pause();
    const state = useMeditationStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.isPaused).toBe(true);
  });

  it('resume restores isRunning after pause', () => {
    useMeditationStore.getState().start();
    useMeditationStore.getState().pause();
    useMeditationStore.getState().resume();
    const state = useMeditationStore.getState();
    expect(state.isRunning).toBe(true);
    expect(state.isPaused).toBe(false);
  });

  it('tick decrements remaining by 1', () => {
    const initial = useMeditationStore.getState().remaining;
    useMeditationStore.getState().tick();
    expect(useMeditationStore.getState().remaining).toBe(initial - 1);
  });

  it('tick does not go below 0', () => {
    useMeditationStore.setState({ remaining: 0 });
    useMeditationStore.getState().tick();
    expect(useMeditationStore.getState().remaining).toBe(0);
  });

  it('stop clears isRunning', () => {
    useMeditationStore.getState().start();
    useMeditationStore.getState().stop();
    expect(useMeditationStore.getState().isRunning).toBe(false);
  });

  it('reset restores to initial state', () => {
    useMeditationStore.getState().setDuration(20);
    useMeditationStore.getState().setSound('ocean');
    useMeditationStore.getState().start();
    useMeditationStore.getState().reset();
    const state = useMeditationStore.getState();
    expect(state.isRunning).toBe(false);
    expect(state.duration).toBe(300);
    expect(state.selectedSound).toBe('silence');
  });
});
