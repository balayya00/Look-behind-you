import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from '../../stores/gameStore';
import { useProgressStore } from '../../stores/progressStore';
import { performInteraction } from './interactions';

beforeEach(() => {
  localStorage.clear();
  useProgressStore.getState().clearProgress();
  useGameStore.getState().startNewGame();
});

describe('critical interaction sequence', () => {
  it('remains deterministic from arrival to the exit', () => {
    const stage = (): string => useGameStore.getState().stage;

    performInteraction('breaker');
    expect(stage()).toBe('fuse-needed');
    performInteraction('fuse');
    expect(stage()).toBe('fuse-found');
    performInteraction('breaker');
    expect(stage()).toBe('power-restored');
    performInteraction('note-office');
    expect(stage()).toBe('office-searched');
    performInteraction('note-washroom');
    expect(stage()).toBe('transcript-found');
    performInteraction('door:records');
    performInteraction('records-file');
    expect(stage()).toBe('records-read');
    performInteraction('door:security-gate');
    expect(stage()).toBe('ward-open');
    performInteraction('door:room-217');
    performInteraction('note-patient');
    expect(stage()).toBe('patient-note-read');
    performInteraction('security-key');
    expect(stage()).toBe('key-found');
    performInteraction('door:exit');
    expect(stage()).toBe('exit-open');
    expect(useProgressStore.getState().save?.stage).toBe('exit-open');
  });

  it('refuses to skip locked doors and stages', () => {
    performInteraction('door:exit');
    performInteraction('door:records');
    expect(useGameStore.getState().stage).toBe('arrival');
    expect(useGameStore.getState().openDoors).not.toContain('exit');
    expect(useGameStore.getState().openDoors).not.toContain('records');
  });
});
