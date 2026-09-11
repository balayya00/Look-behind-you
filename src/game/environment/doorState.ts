import type { DoorDefinition } from '../../types/level';
import type { ProgressStage } from '../../types/game';
import { isStageAtLeast } from '../systems/progression';

const derivedOpenStage: Partial<Record<DoorDefinition['id'], ProgressStage>> = {
  records: 'records-read',
  'security-gate': 'ward-open',
  'room-217': 'patient-note-read',
  exit: 'exit-open',
};

export const isDoorOpen = (
  door: DoorDefinition,
  stage: ProgressStage,
  explicitlyOpen: readonly string[],
): boolean => {
  if (door.initiallyOpen || explicitlyOpen.includes(door.id)) return true;
  const derivedStage = derivedOpenStage[door.id];
  return derivedStage ? isStageAtLeast(stage, derivedStage) : false;
};
