import type { Collider } from '../../types/level';

export interface CollisionResult {
  readonly x: number;
  readonly z: number;
  readonly collidedX: boolean;
  readonly collidedZ: boolean;
}

export interface CollisionOptions {
  readonly radius: number;
  readonly maximumStep?: number;
  readonly isDisabled?: (collider: Collider) => boolean;
}

const overlapsExpanded = (x: number, z: number, collider: Collider, radius: number): boolean =>
  x > collider.minX - radius &&
  x < collider.maxX + radius &&
  z > collider.minZ - radius &&
  z < collider.maxZ + radius;

export const resolveMovement = (
  startX: number,
  startZ: number,
  movementX: number,
  movementZ: number,
  colliders: readonly Collider[],
  options: CollisionOptions,
): CollisionResult => {
  const maximumStep = options.maximumStep ?? 0.16;
  const distance = Math.hypot(movementX, movementZ);
  const steps = Math.max(1, Math.ceil(distance / maximumStep));
  const stepX = movementX / steps;
  const stepZ = movementZ / steps;
  let x = startX;
  let z = startZ;
  let collidedX = false;
  let collidedZ = false;

  for (let step = 0; step < steps; step += 1) {
    let nextX = x + stepX;
    for (const collider of colliders) {
      if (options.isDisabled?.(collider)) continue;
      if (!overlapsExpanded(nextX, z, collider, options.radius)) continue;
      collidedX = true;
      if (stepX > 0) nextX = Math.min(nextX, collider.minX - options.radius);
      else if (stepX < 0) nextX = Math.max(nextX, collider.maxX + options.radius);
    }
    x = nextX;

    let nextZ = z + stepZ;
    for (const collider of colliders) {
      if (options.isDisabled?.(collider)) continue;
      if (!overlapsExpanded(x, nextZ, collider, options.radius)) continue;
      collidedZ = true;
      if (stepZ > 0) nextZ = Math.min(nextZ, collider.minZ - options.radius);
      else if (stepZ < 0) nextZ = Math.max(nextZ, collider.maxZ + options.radius);
    }
    z = nextZ;
  }

  return { x, z, collidedX, collidedZ };
};

export const findZone = (
  x: number,
  z: number,
  zones: readonly {
    readonly id: string;
    readonly minX: number;
    readonly maxX: number;
    readonly minZ: number;
    readonly maxZ: number;
  }[],
): string | null =>
  zones.find((zone) => x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ)?.id ??
  null;
