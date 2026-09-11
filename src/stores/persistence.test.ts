import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  loadSave,
  loadSettings,
  persistSave,
  persistSettings,
} from './persistence';

beforeEach(() => localStorage.clear());

describe('safe persistence', () => {
  it('recovers from malformed settings', () => {
    localStorage.setItem('dlby.settings.v1', '{not-json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('clamps and validates persisted settings', () => {
    persistSettings({ ...DEFAULT_SETTINGS, masterVolume: 4, mouseSensitivity: -1 });
    expect(loadSettings().masterVolume).toBe(1);
    expect(loadSettings().mouseSensitivity).toBe(0.2);
  });

  it('round-trips a valid checkpoint', () => {
    const save = {
      version: 1 as const,
      stage: 'fuse-found' as const,
      inventory: ['fuse'] as const,
      battery: 64,
      elapsedSeconds: 120,
      lookBehindCount: 2,
      triggeredEvents: ['hall-steps'],
      position: { x: -1, z: 2, yaw: 0 },
      savedAt: new Date().toISOString(),
    };
    persistSave(save);
    expect(loadSave()).toEqual(save);
  });
});
