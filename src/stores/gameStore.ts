import { create } from 'zustand';
import type {
  GamePhase,
  InteractionPrompt,
  InventoryItem,
  NotificationMessage,
  PlayerSavePosition,
  ProgressStage,
  SaveGame,
  WorldMutationMap,
} from '../types/game';
import { clamp } from '../utils/math';
import { canAdvanceTo, chapterForStage, objectiveForStage } from '../game/systems/progression';

interface GameState {
  readonly phase: GamePhase;
  readonly stage: ProgressStage;
  readonly inventory: readonly InventoryItem[];
  readonly battery: number;
  readonly flashlightOn: boolean;
  readonly tension: number;
  readonly objective: string;
  readonly chapter: ReturnType<typeof chapterForStage>;
  readonly prompt: InteractionPrompt | null;
  readonly activeNoteId: string | null;
  readonly notification: NotificationMessage | null;
  readonly caption: NotificationMessage | null;
  readonly pointerLocked: boolean;
  readonly elapsedSeconds: number;
  readonly lookBehindCount: number;
  readonly triggeredEvents: readonly string[];
  readonly worldMutations: WorldMutationMap;
  readonly openDoors: readonly string[];
  readonly sessionSeed: number;
  readonly playthroughStartedAt: number | null;
  readonly restoredPosition: PlayerSavePosition | null;
  readonly fatalError: string | null;
}

interface GameActions {
  readonly finishLoading: () => void;
  readonly startNewGame: () => void;
  readonly continueGame: (save: SaveGame) => void;
  readonly returnToMenu: () => void;
  readonly enterPlaying: () => void;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly setPointerLocked: (locked: boolean) => void;
  readonly setPrompt: (prompt: InteractionPrompt | null) => void;
  readonly openNote: (id: string) => void;
  readonly closeNote: () => void;
  readonly setBattery: (battery: number) => void;
  readonly toggleFlashlight: () => void;
  readonly forceFlashlight: (on: boolean) => void;
  readonly advanceStage: (stage: ProgressStage) => boolean;
  readonly restoreStage: (stage: ProgressStage) => void;
  readonly addInventory: (item: InventoryItem) => void;
  readonly removeInventory: (item: InventoryItem) => void;
  readonly adjustTension: (amount: number) => void;
  readonly markEvent: (id: string) => boolean;
  readonly setMutation: (key: string, value: boolean | number | string) => void;
  readonly openDoor: (id: string) => void;
  readonly notify: (text: string, tone?: NotificationMessage['tone']) => void;
  readonly clearNotification: (id?: number) => void;
  readonly showCaption: (text: string) => void;
  readonly clearCaption: (id?: number) => void;
  readonly registerLookBehind: () => void;
  readonly tickElapsed: (seconds: number) => void;
  readonly beginEnding: () => void;
  readonly completeGame: () => void;
  readonly createSave: (position: PlayerSavePosition) => SaveGame;
  readonly setFatalError: (message: string) => void;
}

export type GameStore = GameState & GameActions;

const initialRuntimeState = (): GameState => ({
  phase: 'loading',
  stage: 'arrival',
  inventory: [],
  battery: 100,
  flashlightOn: true,
  tension: 4,
  objective: objectiveForStage('arrival'),
  chapter: chapterForStage('arrival'),
  prompt: null,
  activeNoteId: null,
  notification: null,
  caption: null,
  pointerLocked: false,
  elapsedSeconds: 0,
  lookBehindCount: 0,
  triggeredEvents: [],
  worldMutations: {},
  openDoors: [],
  sessionSeed: Math.floor(Math.random() * 2_147_483_647),
  playthroughStartedAt: null,
  restoredPosition: null,
  fatalError: null,
});

const mutationsFromSave = (save: SaveGame): WorldMutationMap => {
  const mutations: Record<string, boolean | number | string> = {};
  if (save.triggeredEvents.includes('middle-hall-chair')) mutations['chair-state'] = 1;
  if (save.triggeredEvents.includes('ward-crossing')) mutations['chair-state'] = 2;
  if (
    save.triggeredEvents.includes('records-release') ||
    save.triggeredEvents.includes('key-taken-dark')
  ) {
    mutations['north-lights-out'] = true;
  }
  return mutations;
};

let notificationId = 0;

export const useGameStore = create<GameStore>()((set, get) => ({
  ...initialRuntimeState(),
  finishLoading: () => set({ phase: 'menu' }),
  startNewGame: () =>
    set({
      ...initialRuntimeState(),
      phase: 'intro',
      playthroughStartedAt: performance.now(),
    }),
  continueGame: (save) =>
    set({
      ...initialRuntimeState(),
      phase: 'intro',
      stage: save.stage,
      inventory: save.inventory,
      battery: save.battery,
      elapsedSeconds: save.elapsedSeconds,
      lookBehindCount: save.lookBehindCount,
      triggeredEvents: save.triggeredEvents,
      worldMutations: mutationsFromSave(save),
      objective: objectiveForStage(save.stage),
      chapter: chapterForStage(save.stage),
      restoredPosition: save.position,
      playthroughStartedAt: performance.now(),
    }),
  returnToMenu: () => {
    document.exitPointerLock?.();
    set({ phase: 'menu', pointerLocked: false, prompt: null, activeNoteId: null });
  },
  enterPlaying: () => set({ phase: 'playing', activeNoteId: null }),
  pause: () => {
    if (get().phase === 'playing') set({ phase: 'paused', pointerLocked: false, prompt: null });
  },
  resume: () => {
    if (get().phase === 'paused') set({ phase: 'playing' });
  },
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  setPrompt: (prompt) => set({ prompt }),
  openNote: (activeNoteId) => {
    document.exitPointerLock?.();
    set({ activeNoteId, phase: 'reading', pointerLocked: false, prompt: null });
  },
  closeNote: () => set({ activeNoteId: null, phase: 'paused' }),
  setBattery: (battery) => set({ battery: clamp(battery, 0, 100) }),
  toggleFlashlight: () => {
    const state = get();
    if (state.battery > 0.5) set({ flashlightOn: !state.flashlightOn });
  },
  forceFlashlight: (flashlightOn) => set({ flashlightOn }),
  advanceStage: (stage) => {
    const current = get().stage;
    if (!canAdvanceTo(current, stage)) return false;
    set({ stage, objective: objectiveForStage(stage), chapter: chapterForStage(stage) });
    return true;
  },
  restoreStage: (stage) =>
    set({ stage, objective: objectiveForStage(stage), chapter: chapterForStage(stage) }),
  addInventory: (item) => {
    const inventory = get().inventory;
    if (!inventory.includes(item)) set({ inventory: [...inventory, item] });
  },
  removeInventory: (item) => set({ inventory: get().inventory.filter((entry) => entry !== item) }),
  adjustTension: (amount) => set({ tension: clamp(get().tension + amount, 0, 100) }),
  markEvent: (id) => {
    const events = get().triggeredEvents;
    if (events.includes(id)) return false;
    set({ triggeredEvents: [...events, id] });
    return true;
  },
  setMutation: (key, value) => set({ worldMutations: { ...get().worldMutations, [key]: value } }),
  openDoor: (id) => {
    const openDoors = get().openDoors;
    if (!openDoors.includes(id)) set({ openDoors: [...openDoors, id] });
  },
  notify: (text, tone = 'normal') => {
    notificationId += 1;
    set({ notification: { id: notificationId, text, tone } });
  },
  clearNotification: (id) => {
    if (id === undefined || get().notification?.id === id) set({ notification: null });
  },
  showCaption: (text) => {
    notificationId += 1;
    set({ caption: { id: notificationId, text, tone: 'normal' } });
  },
  clearCaption: (id) => {
    if (id === undefined || get().caption?.id === id) set({ caption: null });
  },
  registerLookBehind: () => set({ lookBehindCount: get().lookBehindCount + 1 }),
  tickElapsed: (seconds) => set({ elapsedSeconds: get().elapsedSeconds + Math.max(0, seconds) }),
  beginEnding: () => {
    document.exitPointerLock?.();
    set({ phase: 'ending', pointerLocked: false, prompt: null, flashlightOn: false });
  },
  completeGame: () => set({ phase: 'complete', stage: 'complete' }),
  createSave: (position) => {
    const state = get();
    return {
      version: 1,
      stage: state.stage,
      inventory: state.inventory,
      battery: Math.max(8, state.battery),
      elapsedSeconds: state.elapsedSeconds,
      lookBehindCount: state.lookBehindCount,
      triggeredEvents: state.triggeredEvents,
      position,
      savedAt: new Date().toISOString(),
    };
  },
  setFatalError: (fatalError) => {
    document.exitPointerLock?.();
    set({ fatalError, phase: 'menu', pointerLocked: false });
  },
}));
