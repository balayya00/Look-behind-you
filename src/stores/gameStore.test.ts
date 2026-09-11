import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';

beforeEach(() => {
  useGameStore.getState().startNewGame();
});

describe('game runtime store', () => {
  it('advances only through the authored sequence', () => {
    const game = useGameStore.getState();
    expect(game.stage).toBe('arrival');
    expect(game.advanceStage('power-restored')).toBe(false);
    expect(game.advanceStage('fuse-needed')).toBe(true);
    expect(useGameStore.getState().stage).toBe('fuse-needed');
    expect(useGameStore.getState().advanceStage('fuse-found')).toBe(true);
  });

  it('creates a bounded versioned checkpoint', () => {
    useGameStore.getState().setBattery(0);
    const save = useGameStore.getState().createSave({ x: 1, z: 2, yaw: 0.5 });
    expect(save.version).toBe(1);
    expect(save.battery).toBe(8);
    expect(save.position).toEqual({ x: 1, z: 2, yaw: 0.5 });
  });
});
