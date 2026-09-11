import { describe, expect, it } from 'vitest';
import type { Collider } from '../../types/level';
import { findZone, resolveMovement } from './collision';

const wall: Collider = { id: 'wall', minX: 1, maxX: 1.3, minZ: -2, maxZ: 2 };

const move = (x: number, z: number, dx: number, dz: number) =>
  resolveMovement(x, z, dx, dz, [wall], { radius: 0.3 });

describe('resolveMovement', () => {
  it('stops before a wall', () => {
    const result = move(0, 0, 2, 0);
    expect(result.x).toBeCloseTo(0.7);
    expect(result.collidedX).toBe(true);
  });

  it('slides along a wall without losing tangent movement', () => {
    const result = move(0, 0, 2, 1);
    expect(result.x).toBeCloseTo(0.7);
    expect(result.z).toBeCloseTo(1);
  });

  it('substeps fast movement instead of tunneling', () => {
    const result = move(-4, 0, 10, 0);
    expect(result.x).toBeLessThanOrEqual(0.7);
  });

  it('honors disabled dynamic colliders', () => {
    const result = resolveMovement(0, 0, 2, 0, [wall], {
      radius: 0.3,
      isDisabled: () => true,
    });
    expect(result.x).toBeCloseTo(2);
  });
});

describe('findZone', () => {
  it('returns the first containing zone and null outside', () => {
    const zones = [{ id: 'room', minX: -1, maxX: 1, minZ: -1, maxZ: 1 }];
    expect(findZone(0, 0, zones)).toBe('room');
    expect(findZone(2, 0, zones)).toBeNull();
  });
});
