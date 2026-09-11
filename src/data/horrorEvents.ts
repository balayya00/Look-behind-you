import type { MutationValue, ProgressStage } from '../types/game';

export type HorrorTrigger =
  | { readonly type: 'zone-enter'; readonly zone: string }
  | { readonly type: 'stage'; readonly stage: ProgressStage }
  | { readonly type: 'elapsed'; readonly seconds: number }
  | { readonly type: 'zone-revisit'; readonly zone: string; readonly visits: number };

export type HorrorAction =
  | {
      readonly type: 'sound';
      readonly cue: 'creak' | 'impact' | 'whisper' | 'breathing';
      readonly position: readonly [number, number, number];
      readonly caption: string;
    }
  | {
      readonly type: 'attention';
      readonly cue: 'footsteps' | 'breathing';
      readonly caption: string;
      readonly mutation?: { readonly key: string; readonly value: MutationValue };
      readonly mutationChance?: number;
    }
  | { readonly type: 'mutation'; readonly key: string; readonly value: MutationValue }
  | { readonly type: 'silhouette'; readonly location: 'lobby' | 'north'; readonly duration: number }
  | { readonly type: 'tension'; readonly amount: number };

export interface HorrorEventDefinition {
  readonly id: string;
  readonly trigger: HorrorTrigger;
  readonly delay: readonly [number, number];
  readonly once: boolean;
  readonly minimumStage?: ProgressStage;
  readonly maximumStage?: ProgressStage;
  readonly actions: readonly HorrorAction[];
}

export const HORROR_EVENTS: readonly HorrorEventDefinition[] = [
  {
    id: 'lobby-settle',
    trigger: { type: 'elapsed', seconds: 7 },
    delay: [1, 2.5],
    once: true,
    maximumStage: 'fuse-needed',
    actions: [
      { type: 'sound', cue: 'creak', position: [-6, 2.8, 20], caption: '[wood strains above you]' },
      { type: 'tension', amount: 2 },
    ],
  },
  {
    id: 'south-hall-follow',
    trigger: { type: 'zone-enter', zone: 'south-hall' },
    delay: [2.2, 4.5],
    once: true,
    minimumStage: 'fuse-needed',
    maximumStage: 'fuse-found',
    actions: [
      {
        type: 'attention',
        cue: 'footsteps',
        caption: '[a second set of footsteps follows behind you]',
      },
      { type: 'tension', amount: 7 },
    ],
  },
  {
    id: 'storage-wall-knock',
    trigger: { type: 'zone-enter', zone: 'storage' },
    delay: [4, 7],
    once: true,
    minimumStage: 'fuse-needed',
    actions: [
      {
        type: 'sound',
        cue: 'impact',
        position: [-11, 1.2, 8.5],
        caption: '[three knocks inside the wall]',
      },
      { type: 'tension', amount: 4 },
    ],
  },
  {
    id: 'fuse-return-steps',
    trigger: { type: 'stage', stage: 'fuse-found' },
    delay: [5.5, 9],
    once: true,
    actions: [
      {
        type: 'attention',
        cue: 'footsteps',
        caption: '[steps approach, then match your pace]',
      },
    ],
  },
  {
    id: 'power-answer',
    trigger: { type: 'stage', stage: 'power-restored' },
    delay: [3, 5],
    once: true,
    actions: [
      {
        type: 'sound',
        cue: 'impact',
        position: [0, 1, -18],
        caption: '[something heavy falls in the corridor]',
      },
      { type: 'tension', amount: 6 },
    ],
  },
  {
    id: 'middle-hall-chair',
    trigger: { type: 'zone-enter', zone: 'middle-hall' },
    delay: [3, 6],
    once: true,
    minimumStage: 'power-restored',
    actions: [
      {
        type: 'attention',
        cue: 'breathing',
        caption: '[a shallow breath touches the air behind you]',
        mutation: { key: 'chair-state', value: 1 },
        mutationChance: 0.78,
      },
      { type: 'tension', amount: 9 },
    ],
  },
  {
    id: 'office-doorway',
    trigger: { type: 'zone-revisit', zone: 'office', visits: 2 },
    delay: [1, 2.2],
    once: true,
    minimumStage: 'power-restored',
    actions: [
      { type: 'silhouette', location: 'lobby', duration: 0.42 },
      {
        type: 'sound',
        cue: 'creak',
        position: [2.3, 1.4, -3],
        caption: '[a door moves somewhere behind the wall]',
      },
    ],
  },
  {
    id: 'records-release',
    trigger: { type: 'stage', stage: 'records-read' },
    delay: [2.5, 4],
    once: true,
    actions: [
      {
        type: 'attention',
        cue: 'breathing',
        caption: '[someone exhales just beyond your shoulder]',
        mutation: { key: 'north-lights-out', value: true },
        mutationChance: 1,
      },
      { type: 'tension', amount: 12 },
    ],
  },
  {
    id: 'ward-crossing',
    trigger: { type: 'zone-enter', zone: 'ward' },
    delay: [3.5, 6],
    once: true,
    minimumStage: 'ward-open',
    actions: [
      {
        type: 'sound',
        cue: 'whisper',
        position: [10, 1.5, -20],
        caption: '[a voice behind the curtain almost says your name]',
      },
      { type: 'mutation', key: 'chair-state', value: 2 },
      { type: 'tension', amount: 7 },
    ],
  },
  {
    id: 'sealed-hall-sighting',
    trigger: { type: 'zone-enter', zone: 'sealed-hall' },
    delay: [0.4, 1.1],
    once: true,
    minimumStage: 'ward-open',
    actions: [
      { type: 'silhouette', location: 'north', duration: 0.3 },
      { type: 'tension', amount: 8 },
    ],
  },
  {
    id: 'key-taken-dark',
    trigger: { type: 'stage', stage: 'key-found' },
    delay: [1.2, 2.1],
    once: true,
    actions: [
      { type: 'mutation', key: 'north-lights-out', value: true },
      {
        type: 'sound',
        cue: 'impact',
        position: [2.2, 1.3, -32],
        caption: '[the room door slams against the frame]',
      },
      {
        type: 'attention',
        cue: 'footsteps',
        caption: '[bare feet run toward you, stopping one step behind]',
      },
      { type: 'tension', amount: 15 },
    ],
  },
  {
    id: 'last-threshold',
    trigger: { type: 'zone-enter', zone: 'threshold' },
    delay: [0.2, 0.5],
    once: true,
    minimumStage: 'exit-open',
    actions: [
      {
        type: 'sound',
        cue: 'breathing',
        position: [0, 1.6, -36.8],
        caption: '[your own breath continues behind you]',
      },
      { type: 'tension', amount: 20 },
    ],
  },
];
