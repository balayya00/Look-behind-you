import type {
  Collider,
  DoorDefinition,
  PropDefinition,
  TriggerZone,
  Vec3Tuple,
  WallSegment,
} from '../types/level';

const wall = (
  id: string,
  position: Vec3Tuple,
  size: Vec3Tuple,
  material: WallSegment['material'] = 'paint',
): WallSegment => ({ id, position, size, material });

export const LEVEL_WALLS: readonly WallSegment[] = [
  wall('outer-west', [-11.25, 1.65, -8.5], [0.5, 3.3, 65], 'concrete'),
  wall('outer-east', [11.25, 1.65, -8.5], [0.5, 3.3, 65], 'concrete'),
  wall('outer-south', [0, 1.65, 23.75], [23, 3.3, 0.5], 'concrete'),
  wall('outer-north', [0, 1.65, -41.25], [23, 3.3, 0.5], 'concrete'),

  // Hall-facing walls. Gaps are authored doorways.
  wall('hall-east-01', [2.25, 1.65, 10.4], [0.35, 3.3, 5.2]),
  wall('hall-east-02', [2.25, 1.65, 2], [0.35, 3.3, 8.4]),
  wall('hall-east-03', [2.25, 1.65, -9.5], [0.35, 3.3, 11.4]),
  wall('hall-east-04', [2.25, 1.65, -24], [0.35, 3.3, 14.4]),
  wall('hall-east-05', [2.25, 1.65, -35.4], [0.35, 3.3, 5.2]),
  wall('hall-west-01', [-2.25, 1.65, 9.4], [0.35, 3.3, 7.2]),
  wall('hall-west-02', [-2.25, 1.65, -2], [0.35, 3.3, 12.4]),
  wall('hall-west-03', [-2.25, 1.65, -15.5], [0.35, 3.3, 11.4]),
  wall('hall-west-04', [-2.25, 1.65, -30.4], [0.35, 3.3, 15.2]),

  // Right-side room separators.
  wall('electrical-south', [6.75, 1.65, 11.7], [9, 3.3, 0.35], 'concrete'),
  wall('electrical-north', [6.75, 1.65, 2.4], [9, 3.3, 0.35], 'concrete'),
  wall('office-north', [6.75, 1.65, -7.7], [9, 3.3, 0.35]),
  wall('office-south', [6.75, 1.65, 1.4], [9, 3.3, 0.35]),
  wall('ward-south', [6.75, 1.65, -8.7], [9, 3.3, 0.35], 'tile'),
  wall('ward-north', [6.75, 1.65, -26.2], [9, 3.3, 0.35], 'tile'),
  wall('217-south', [6.75, 1.65, -27.7], [9, 3.3, 0.35], 'dark'),
  wall('217-north', [6.75, 1.65, -38.2], [9, 3.3, 0.35], 'dark'),

  // Left-side room separators.
  wall('storage-south', [-6.75, 1.65, 11.1], [9, 3.3, 0.35], 'concrete'),
  wall('storage-north', [-6.75, 1.65, -1.1], [9, 3.3, 0.35], 'concrete'),
  wall('bath-south', [-6.75, 1.65, -3.7], [9, 3.3, 0.35], 'tile'),
  wall('bath-north', [-6.75, 1.65, -14.5], [9, 3.3, 0.35], 'tile'),
  wall('records-south', [-6.75, 1.65, -16.2], [9, 3.3, 0.35], 'dark'),
  wall('records-north', [-6.75, 1.65, -28], [9, 3.3, 0.35], 'dark'),

  // Reception enclosure and broken service window.
  wall('reception-left', [-7.9, 1.65, 13.1], [0.3, 3.3, 7]),
  wall('reception-back-low', [-5, 0.65, 16.6], [5.8, 1.3, 0.3], 'dark'),
  wall('reception-back-high', [-5, 2.75, 16.6], [5.8, 1.1, 0.3], 'dark'),

  // Exit funnel.
  wall('stair-west', [-5.1, 1.65, -39.6], [5.8, 3.3, 0.3], 'concrete'),
  wall('stair-east', [5.1, 1.65, -39.6], [5.8, 3.3, 0.3], 'concrete'),
];

export const LEVEL_DOORS: readonly DoorDefinition[] = [
  {
    id: 'electrical',
    position: [2.25, 1.5, 7],
    rotationY: Math.PI / 2,
    label: 'ELECTRICAL',
    initiallyOpen: true,
  },
  {
    id: 'storage',
    position: [-2.25, 1.5, 5],
    rotationY: Math.PI / 2,
    label: 'STORAGE',
    initiallyOpen: true,
  },
  {
    id: 'office',
    position: [2.25, 1.5, -3],
    rotationY: Math.PI / 2,
    label: 'ADMIN',
    initiallyOpen: true,
  },
  {
    id: 'washroom',
    position: [-2.25, 1.5, -9],
    rotationY: Math.PI / 2,
    label: 'WASHROOM',
    initiallyOpen: true,
  },
  {
    id: 'ward',
    position: [2.25, 1.5, -16],
    rotationY: Math.PI / 2,
    label: 'OBSERVATION',
    initiallyOpen: true,
  },
  {
    id: 'records',
    position: [-2.25, 1.5, -22],
    rotationY: Math.PI / 2,
    label: 'RECORDS',
    lockedUntil: 'transcript-found',
  },
  {
    id: 'security-gate',
    position: [0, 1.5, -29],
    rotationY: 0,
    label: 'WEST WARD',
    lockedUntil: 'records-read',
  },
  {
    id: 'room-217',
    position: [2.25, 1.5, -32],
    rotationY: Math.PI / 2,
    label: '217',
    lockedUntil: 'ward-open',
  },
  {
    id: 'exit',
    position: [0, 1.5, -38],
    rotationY: 0,
    label: 'STAIR B · EXIT',
    lockedUntil: 'key-found',
  },
];

export const LEVEL_PROPS: readonly PropDefinition[] = [
  { id: 'lobby-bench-a', type: 'bench', position: [3.8, 0, 18.2], rotationY: 0.08 },
  { id: 'lobby-bench-b', type: 'bench', position: [3.8, 0, 20.4], rotationY: -0.05 },
  { id: 'reception-desk', type: 'desk', position: [-5.1, 0, 14.7], rotationY: 0 },
  { id: 'lobby-plant', type: 'plant', position: [7, 0, 14.6], scale: 0.8 },
  { id: 'lobby-clock', type: 'clock', position: [-1.4, 2.45, 13.22], rotationY: 0 },

  { id: 'electrical-locker-a', type: 'locker', position: [9.8, 0, 4], rotationY: Math.PI / 2 },
  { id: 'electrical-locker-b', type: 'locker', position: [9.8, 0, 5], rotationY: Math.PI / 2 },
  { id: 'electrical-box', type: 'box', position: [5.2, 0, 4] },
  { id: 'electrical-pipe-a', type: 'pipe', position: [10.6, 1.8, 8], rotationY: 0 },

  { id: 'storage-locker', type: 'locker', position: [-9.7, 0, 7], rotationY: -Math.PI / 2 },
  { id: 'storage-box-a', type: 'box', position: [-8.8, 0, 1.1], scale: 1.2 },
  { id: 'storage-box-b', type: 'box', position: [-7.6, 0, 1.3], rotationY: 0.3 },
  { id: 'storage-chair', type: 'chair', position: [-5.5, 0, 7.4], rotationY: 1.2 },

  { id: 'office-desk', type: 'desk', position: [7.3, 0, -5.3], rotationY: Math.PI / 2 },
  { id: 'office-chair', type: 'chair', position: [5.8, 0, -4.8], rotationY: -1.2 },
  { id: 'office-cabinet-a', type: 'cabinet', position: [10.1, 0, -1.5], rotationY: Math.PI / 2 },
  { id: 'office-clock', type: 'clock', position: [10.98, 2.35, -3.2], rotationY: -Math.PI / 2 },

  { id: 'bath-bench', type: 'bench', position: [-7.4, 0, -6], rotationY: Math.PI / 2 },
  { id: 'bath-pipe', type: 'pipe', position: [-10.7, 1.8, -11], rotationY: 0 },

  { id: 'ward-stretcher', type: 'stretcher', position: [7.7, 0, -12], rotationY: 0.12 },
  { id: 'ward-wheelchair', type: 'wheelchair', position: [6.8, 0, -22], rotationY: 2.3 },
  {
    id: 'changing-chair',
    type: 'chair',
    position: [0, 0, -20.2],
    rotationY: Math.PI,
    mutationKey: 'chair-state',
  },
  { id: 'ward-cabinet', type: 'cabinet', position: [10.3, 0, -19], rotationY: Math.PI / 2 },

  { id: 'records-cabinet-a', type: 'cabinet', position: [-9.8, 0, -19], rotationY: -Math.PI / 2 },
  { id: 'records-cabinet-b', type: 'cabinet', position: [-9.8, 0, -21], rotationY: -Math.PI / 2 },
  { id: 'records-cabinet-c', type: 'cabinet', position: [-9.8, 0, -25], rotationY: -Math.PI / 2 },
  { id: 'records-desk', type: 'desk', position: [-6.5, 0, -25.2], rotationY: 0.1 },

  { id: '217-bed', type: 'stretcher', position: [7.5, 0, -35], rotationY: Math.PI / 2 },
  { id: '217-chair', type: 'chair', position: [9.7, 0, -29.5], rotationY: -2.4 },
  { id: '217-locker', type: 'locker', position: [10.3, 0, -34.7], rotationY: Math.PI / 2 },
];

export const TRIGGER_ZONES: readonly TriggerZone[] = [
  { id: 'lobby', minX: -7.7, maxX: 7.7, minZ: 13.2, maxZ: 23.2 },
  { id: 'south-hall', minX: -2, maxX: 2, minZ: 0, maxZ: 13.2 },
  { id: 'electrical', minX: 2.4, maxX: 10.8, minZ: 2.7, maxZ: 11.4 },
  { id: 'storage', minX: -10.8, maxX: -2.4, minZ: -0.8, maxZ: 10.8 },
  { id: 'middle-hall', minX: -2, maxX: 2, minZ: -16, maxZ: 0 },
  { id: 'office', minX: 2.4, maxX: 10.8, minZ: -7.4, maxZ: 1.1 },
  { id: 'washroom', minX: -10.8, maxX: -2.4, minZ: -14.2, maxZ: -4 },
  { id: 'ward', minX: 2.4, maxX: 10.8, minZ: -25.8, maxZ: -9 },
  { id: 'north-hall', minX: -2, maxX: 2, minZ: -28.8, maxZ: -16 },
  { id: 'records', minX: -10.8, maxX: -2.4, minZ: -27.7, maxZ: -16.5 },
  { id: 'sealed-hall', minX: -2, maxX: 2, minZ: -37.8, maxZ: -29.2 },
  { id: 'room-217', minX: 2.4, maxX: 10.8, minZ: -37.8, maxZ: -28 },
  { id: 'threshold', minX: -2, maxX: 2, minZ: -41, maxZ: -38.2 },
];

const colliderFromWall = (entry: WallSegment): Collider => {
  const [x, , z] = entry.position;
  const [width, , depth] = entry.size;
  return {
    id: entry.id,
    minX: x - width / 2,
    maxX: x + width / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
  };
};

const colliderFromDoor = (door: DoorDefinition): Collider => {
  const [x, , z] = door.position;
  const alongX = Math.abs(Math.cos(door.rotationY)) > 0.5;
  const width = alongX ? 1.65 : 0.18;
  const depth = alongX ? 0.18 : 1.65;
  return {
    id: `door-${door.id}`,
    minX: x - width / 2,
    maxX: x + width / 2,
    minZ: z - depth / 2,
    maxZ: z + depth / 2,
    disabledWhen: `door:${door.id}:open`,
  };
};

export const LEVEL_COLLIDERS: readonly Collider[] = [
  ...LEVEL_WALLS.map(colliderFromWall),
  ...LEVEL_DOORS.filter((door) => !door.initiallyOpen).map(colliderFromDoor),
];

export interface SignDefinition {
  readonly id: string;
  readonly text: string;
  readonly subtext?: string;
  readonly position: Vec3Tuple;
  readonly rotationY: number;
  readonly color?: string;
}

export const LEVEL_SIGNS: readonly SignDefinition[] = [
  {
    id: 'clinic',
    text: 'HALCYON ANNEX',
    subtext: 'SLEEP & OBSERVATION',
    position: [0, 2.4, 13.28],
    rotationY: 0,
  },
  {
    id: 'rule',
    text: 'NIGHT STAFF',
    subtext: 'REPORT SOUNDS. DO NOT INVESTIGATE.',
    position: [-7.65, 1.65, 18],
    rotationY: Math.PI / 2,
  },
  { id: 'electrical-sign', text: 'ELECTRICAL', position: [2.08, 2.45, 7], rotationY: Math.PI / 2 },
  { id: 'storage-sign', text: 'STORAGE', position: [-2.08, 2.45, 5], rotationY: -Math.PI / 2 },
  { id: 'records-sign', text: 'RECORDS', position: [-2.08, 2.45, -22], rotationY: -Math.PI / 2 },
  {
    id: 'ward-sign',
    text: 'OBSERVATION 201—219',
    position: [2.08, 2.45, -16],
    rotationY: Math.PI / 2,
  },
  {
    id: 'exit-sign',
    text: 'EXIT',
    subtext: 'STAIR B',
    position: [0, 2.72, -37.84],
    rotationY: 0,
    color: '#8f2725',
  },
];
