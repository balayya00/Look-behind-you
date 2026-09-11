import { describe, expect, it } from 'vitest';
import {
  LEVEL_COLLIDERS,
  LEVEL_DOORS,
  LEVEL_PROPS,
  LEVEL_SIGNS,
  LEVEL_WALLS,
  TRIGGER_ZONES,
} from './level';
import { spawnForStage } from '../game/systems/progression';

const hasUniqueIds = (entries: readonly { readonly id: string }[]): boolean =>
  new Set(entries.map((entry) => entry.id)).size === entries.length;

describe('level data', () => {
  it('keeps identifiers unique in every registry', () => {
    expect(hasUniqueIds(LEVEL_WALLS)).toBe(true);
    expect(hasUniqueIds(LEVEL_DOORS)).toBe(true);
    expect(hasUniqueIds(LEVEL_PROPS)).toBe(true);
    expect(hasUniqueIds(LEVEL_SIGNS)).toBe(true);
    expect(hasUniqueIds(TRIGGER_ZONES)).toBe(true);
    expect(hasUniqueIds(LEVEL_COLLIDERS)).toBe(true);
  });

  it('does not place deterministic checkpoint spawns inside wall colliders', () => {
    for (const stage of [
      'arrival',
      'fuse-found',
      'power-restored',
      'records-read',
      'key-found',
    ] as const) {
      const spawn = spawnForStage(stage);
      const containing = LEVEL_COLLIDERS.filter(
        (collider) =>
          !collider.disabledWhen &&
          spawn.x >= collider.minX &&
          spawn.x <= collider.maxX &&
          spawn.z >= collider.minZ &&
          spawn.z <= collider.maxZ,
      );
      expect(containing, stage).toEqual([]);
    }
  });

  it('has dynamic blockers for every critical progression door', () => {
    for (const id of ['records', 'security-gate', 'room-217', 'exit']) {
      expect(LEVEL_COLLIDERS.some((collider) => collider.id === `door-${id}`)).toBe(true);
    }
  });
});
