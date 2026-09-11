import { LEVEL_DOORS } from '../../data/level';
import { audioEngine } from '../audio/AudioEngine';
import type { InteractionPrompt, ProgressStage } from '../../types/game';
import { collectBattery } from '../systems/battery';
import { playerRuntime } from '../systems/runtime';
import { isStageAtLeast } from '../systems/progression';
import { useGameStore } from '../../stores/gameStore';
import { useProgressStore } from '../../stores/progressStore';

const checkpoint = (): void => {
  const game = useGameStore.getState();
  useProgressStore.getState().writeSave(
    game.createSave({
      x: playerRuntime.position.x,
      z: playerRuntime.position.z,
      yaw: playerRuntime.yaw,
    }),
  );
};

const locked = (message = 'It will not open.'): void => {
  useGameStore.getState().notify(message, 'warning');
  audioEngine.playCue('locked');
};

const doorPrompt = (id: string): InteractionPrompt => {
  const door = LEVEL_DOORS.find((entry) => entry.id === id);
  return { id: `door:${id}`, verb: 'OPEN', label: door?.label ?? 'DOOR' };
};

export const getInteractionPrompt = (id: string): InteractionPrompt | null => {
  const state = useGameStore.getState();
  if (id.startsWith('door:')) return doorPrompt(id.slice(5));
  const prompts: Record<string, InteractionPrompt> = {
    breaker: { id, verb: 'USE', label: 'BREAKER PANEL' },
    fuse: { id, verb: 'TAKE', label: '30A CERAMIC FUSE' },
    'records-file': { id, verb: 'READ', label: 'CASE HLC-217' },
    'security-key': { id, verb: 'TAKE', label: 'SECURITY KEY' },
    'battery-a': { id, verb: 'TAKE', label: 'FLASHLIGHT BATTERY' },
    'battery-b': { id, verb: 'TAKE', label: 'FLASHLIGHT BATTERY' },
    'note-reception': { id, verb: 'READ', label: 'NIGHT PROTOCOL' },
    'note-office': { id, verb: 'READ', label: 'UNSENT LETTER' },
    'note-washroom': { id, verb: 'READ', label: 'TORN TRANSCRIPT' },
    'note-patient': { id, verb: 'READ', label: 'WRITING UNDER BED' },
  };
  if (id === 'fuse' && state.stage !== 'fuse-needed') return null;
  if (id === 'records-file' && !isStageAtLeast(state.stage, 'transcript-found')) return null;
  if (id === 'security-key' && !isStageAtLeast(state.stage, 'patient-note-read')) return null;
  if ((id === 'battery-a' || id === 'battery-b') && state.triggeredEvents.includes(id)) return null;
  return prompts[id] ?? null;
};

const handleDoor = (id: string, stage: ProgressStage): void => {
  const state = useGameStore.getState();
  if (state.openDoors.includes(id)) return;
  const door = LEVEL_DOORS.find((entry) => entry.id === id);
  if (!door) return;
  if (door.lockedUntil && !isStageAtLeast(stage, door.lockedUntil)) {
    let message = 'The magnetic lock has no power.';
    if (id === 'exit') message = 'The crash bar is chained from this side.';
    else if (id === 'records' && isStageAtLeast(stage, 'power-restored')) {
      message = 'The keypad waits for a four-digit access code.';
    }
    locked(message);
    return;
  }

  state.openDoor(id);
  audioEngine.playDoor({ x: door.position[0], y: 1.2, z: door.position[2] });
  if (id === 'security-gate' && stage === 'records-read') state.advanceStage('ward-open');
  if (id === 'exit' && stage === 'key-found') state.advanceStage('exit-open');
  state.notify(id === 'exit' ? 'Cold air moves through the doorway.' : 'The lock releases.');
  checkpoint();
};

export const performInteraction = (id: string): void => {
  const state = useGameStore.getState();
  if (id.startsWith('door:')) {
    handleDoor(id.slice(5), state.stage);
    return;
  }

  switch (id) {
    case 'breaker': {
      if (state.stage === 'arrival') {
        state.advanceStage('fuse-needed');
        state.notify('FUSE 3 is missing.', 'objective');
        audioEngine.playCue('locked');
        checkpoint();
      } else if (state.stage === 'fuse-needed') {
        state.notify('An empty ceramic fuse socket. Storage may have a spare.');
      } else if (state.stage === 'fuse-found') {
        state.removeInventory('fuse');
        state.advanceStage('power-restored');
        state.setMutation('power-restored', true);
        state.adjustTension(9);
        state.notify('Emergency circuit restored.', 'objective');
        audioEngine.playCue('objective');
        audioEngine.setPower(true);
        checkpoint();
      } else {
        state.notify('The old breakers tremble under your hand.');
      }
      break;
    }
    case 'fuse':
      if (state.stage === 'fuse-needed') {
        state.addInventory('fuse');
        state.advanceStage('fuse-found');
        state.markEvent('fuse-collected');
        state.notify('30A fuse collected.', 'objective');
        audioEngine.playCue('pickup');
        checkpoint();
      }
      break;
    case 'records-file':
      if (state.stage === 'transcript-found') {
        state.advanceStage('records-read');
        state.markEvent('records-read');
        state.openNote('records-17');
        state.adjustTension(12);
        checkpoint();
      } else {
        state.openNote('records-17');
      }
      break;
    case 'security-key':
      if (state.stage === 'patient-note-read') {
        state.addInventory('security-key');
        state.advanceStage('key-found');
        state.markEvent('security-key');
        state.notify('Security key collected.', 'objective');
        state.adjustTension(15);
        audioEngine.playCue('pickup');
        checkpoint();
      }
      break;
    case 'battery-a':
    case 'battery-b':
      if (state.markEvent(id)) {
        state.setBattery(collectBattery(state.battery));
        state.notify('Flashlight battery replaced.');
        audioEngine.playCue('pickup');
        checkpoint();
      }
      break;
    case 'note-reception':
      state.openNote('reception-memo');
      break;
    case 'note-office':
      if (state.stage === 'power-restored') {
        state.advanceStage('office-searched');
        state.markEvent('office-clue');
        state.notify('A tape label is mentioned in the washroom.', 'objective');
        checkpoint();
      }
      state.openNote('office-letter');
      break;
    case 'note-washroom':
      if (state.stage === 'office-searched') {
        state.advanceStage('transcript-found');
        state.markEvent('transcript-clue');
        state.notify('Records access code: 0317', 'objective');
        checkpoint();
      }
      state.openNote('washroom-scrap');
      break;
    case 'note-patient':
      if (state.stage === 'ward-open') {
        state.advanceStage('patient-note-read');
        state.markEvent('patient-rules');
        state.notify('Something metal is taped beneath the locker.', 'objective');
        checkpoint();
      }
      state.openNote('patient-wall');
      break;
    default:
      break;
  }
};
