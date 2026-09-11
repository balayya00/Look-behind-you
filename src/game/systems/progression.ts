import type { Chapter, ProgressStage } from '../../types/game';

export const STAGE_ORDER: readonly ProgressStage[] = [
  'arrival',
  'fuse-needed',
  'fuse-found',
  'power-restored',
  'office-searched',
  'transcript-found',
  'records-read',
  'ward-open',
  'patient-note-read',
  'key-found',
  'exit-open',
  'complete',
];

export const stageIndex = (stage: ProgressStage): number => STAGE_ORDER.indexOf(stage);

export const isStageAtLeast = (current: ProgressStage, required: ProgressStage): boolean =>
  stageIndex(current) >= stageIndex(required);

export const canAdvanceTo = (current: ProgressStage, next: ProgressStage): boolean =>
  stageIndex(next) === stageIndex(current) + 1;

export const objectiveForStage = (stage: ProgressStage): string => {
  const objectives: Record<ProgressStage, string> = {
    arrival: 'Find the electrical room.',
    'fuse-needed': 'Find a replacement fuse in Storage.',
    'fuse-found': 'Return to the electrical room.',
    'power-restored': 'Search Administration for the Records access code.',
    'office-searched': 'Find Tape 17-C near the washroom drain.',
    'transcript-found': 'Use code 0317 to enter Records.',
    'records-read': 'Open the west ward and find Room 217.',
    'ward-open': 'Find Patient 17’s rules in Room 217.',
    'patient-note-read': 'Find the security key hidden in Room 217.',
    'key-found': 'Take the security key to the north stairwell.',
    'exit-open': 'Leave the building.',
    complete: 'Do not turn around.',
  };
  return objectives[stage];
};

export const chapterForStage = (stage: ProgressStage): Chapter => {
  if (stageIndex(stage) <= stageIndex('fuse-needed')) return 'ARRIVAL';
  if (stage === 'fuse-found') return 'THE HALLWAY';
  if (stageIndex(stage) <= stageIndex('transcript-found')) return 'SOMETHING IS WRONG';
  if (stageIndex(stage) <= stageIndex('patient-note-read')) return 'THE PRESENCE';
  if (stage === 'key-found') return 'ESCALATION';
  return 'DO NOT LOOK';
};

export interface StageSpawn {
  readonly x: number;
  readonly z: number;
  readonly yaw: number;
}

export const spawnForStage = (stage: ProgressStage): StageSpawn => {
  if (isStageAtLeast(stage, 'key-found')) return { x: 0, z: -25, yaw: 0 };
  if (isStageAtLeast(stage, 'records-read')) return { x: 0, z: -17, yaw: 0 };
  if (isStageAtLeast(stage, 'power-restored')) return { x: 0, z: -2, yaw: 0 };
  if (isStageAtLeast(stage, 'fuse-found')) return { x: -1, z: 2, yaw: Math.PI / 2 };
  return { x: 0, z: 18, yaw: 0 };
};
