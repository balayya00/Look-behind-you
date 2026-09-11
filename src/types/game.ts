export type GamePhase =
  'loading' | 'menu' | 'intro' | 'playing' | 'paused' | 'reading' | 'ending' | 'complete';

export type ProgressStage =
  | 'arrival'
  | 'fuse-needed'
  | 'fuse-found'
  | 'power-restored'
  | 'office-searched'
  | 'transcript-found'
  | 'records-read'
  | 'ward-open'
  | 'patient-note-read'
  | 'key-found'
  | 'exit-open'
  | 'complete';

export type Chapter =
  'ARRIVAL' | 'THE HALLWAY' | 'SOMETHING IS WRONG' | 'THE PRESENCE' | 'ESCALATION' | 'DO NOT LOOK';

export type InventoryItem = 'fuse' | 'security-key' | 'battery-a' | 'battery-b';

export interface PlayerSavePosition {
  readonly x: number;
  readonly z: number;
  readonly yaw: number;
}

export interface SaveGame {
  readonly version: 1;
  readonly stage: ProgressStage;
  readonly inventory: readonly InventoryItem[];
  readonly battery: number;
  readonly elapsedSeconds: number;
  readonly lookBehindCount: number;
  readonly triggeredEvents: readonly string[];
  readonly position: PlayerSavePosition;
  readonly savedAt: string;
}

export interface InteractionPrompt {
  readonly id: string;
  readonly label: string;
  readonly verb: string;
}

export type MutationValue = boolean | number | string;

export interface WorldMutationMap {
  readonly [key: string]: MutationValue;
}

export interface NotificationMessage {
  readonly id: number;
  readonly text: string;
  readonly tone: 'normal' | 'warning' | 'objective';
}
