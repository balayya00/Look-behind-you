import type { ProgressStage } from './game';

export interface Vec2 {
  readonly x: number;
  readonly z: number;
}

export type Vec3Tuple = readonly [number, number, number];

export interface Collider {
  readonly id: string;
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
  readonly disabledWhen?: string;
}

export interface WallSegment {
  readonly id: string;
  readonly position: Vec3Tuple;
  readonly size: Vec3Tuple;
  readonly material?: 'paint' | 'concrete' | 'tile' | 'dark';
}

export interface TriggerZone {
  readonly id: string;
  readonly minX: number;
  readonly maxX: number;
  readonly minZ: number;
  readonly maxZ: number;
  readonly stageAtLeast?: ProgressStage;
}

export interface DoorDefinition {
  readonly id: string;
  readonly position: Vec3Tuple;
  readonly rotationY: number;
  readonly label: string;
  readonly lockedUntil?: ProgressStage;
  readonly initiallyOpen?: boolean;
}

export interface PropDefinition {
  readonly id: string;
  readonly type:
    | 'chair'
    | 'desk'
    | 'cabinet'
    | 'locker'
    | 'stretcher'
    | 'wheelchair'
    | 'box'
    | 'pipe'
    | 'clock'
    | 'bench'
    | 'plant';
  readonly position: Vec3Tuple;
  readonly rotationY?: number;
  readonly scale?: number;
  readonly mutationKey?: string;
}
