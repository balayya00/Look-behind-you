import type { InventoryItem, ProgressStage, SaveGame } from '../types/game';
import type { GameSettings, GraphicsQuality } from '../types/settings';
import { clamp } from '../utils/math';

const SETTINGS_KEY = 'dlby.settings.v1';
const SAVE_KEY = 'dlby.progress.v1';
const BEST_TIME_KEY = 'dlby.best-time.v1';

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 0.8,
  musicVolume: 0.72,
  sfxVolume: 0.85,
  mouseSensitivity: 0.75,
  graphicsQuality: 'medium',
  brightness: 1,
  reducedMotion: false,
  headBob: true,
  captions: true,
};

const stages: readonly ProgressStage[] = [
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
const inventoryItems: readonly InventoryItem[] = ['fuse', 'security-key', 'battery-a', 'battery-b'];
const qualities: readonly GraphicsQuality[] = ['low', 'medium', 'high'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const finiteNumber = (value: unknown, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const safeGet = (key: string): unknown => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? null : (JSON.parse(value) as unknown);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in privacy modes; gameplay remains in memory.
  }
};

const safeRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // A denied storage write is non-fatal.
  }
};

export const loadSettings = (): GameSettings => {
  const stored = safeGet(SETTINGS_KEY);
  if (!isRecord(stored) || stored.version !== 1 || !isRecord(stored.data)) {
    return DEFAULT_SETTINGS;
  }
  const data = stored.data;
  const quality = qualities.includes(data.graphicsQuality as GraphicsQuality)
    ? (data.graphicsQuality as GraphicsQuality)
    : DEFAULT_SETTINGS.graphicsQuality;

  return {
    masterVolume: clamp(finiteNumber(data.masterVolume, DEFAULT_SETTINGS.masterVolume), 0, 1),
    musicVolume: clamp(finiteNumber(data.musicVolume, DEFAULT_SETTINGS.musicVolume), 0, 1),
    sfxVolume: clamp(finiteNumber(data.sfxVolume, DEFAULT_SETTINGS.sfxVolume), 0, 1),
    mouseSensitivity: clamp(
      finiteNumber(data.mouseSensitivity, DEFAULT_SETTINGS.mouseSensitivity),
      0.2,
      1.8,
    ),
    graphicsQuality: quality,
    brightness: clamp(finiteNumber(data.brightness, DEFAULT_SETTINGS.brightness), 0.65, 1.5),
    reducedMotion:
      typeof data.reducedMotion === 'boolean' ? data.reducedMotion : DEFAULT_SETTINGS.reducedMotion,
    headBob: typeof data.headBob === 'boolean' ? data.headBob : DEFAULT_SETTINGS.headBob,
    captions: typeof data.captions === 'boolean' ? data.captions : DEFAULT_SETTINGS.captions,
  };
};

export const persistSettings = (settings: GameSettings): void => {
  safeSet(SETTINGS_KEY, { version: 1, data: settings });
};

export const loadSave = (): SaveGame | null => {
  const stored = safeGet(SAVE_KEY);
  if (!isRecord(stored) || stored.version !== 1 || !isRecord(stored.data)) return null;
  const data = stored.data;
  if (!stages.includes(data.stage as ProgressStage) || !isRecord(data.position)) return null;

  const inventory = Array.isArray(data.inventory)
    ? data.inventory.filter((item): item is InventoryItem =>
        inventoryItems.includes(item as InventoryItem),
      )
    : [];
  const triggeredEvents = Array.isArray(data.triggeredEvents)
    ? data.triggeredEvents.filter((item): item is string => typeof item === 'string').slice(0, 100)
    : [];
  const stage = data.stage as ProgressStage;

  return {
    version: 1,
    stage,
    inventory,
    battery: clamp(finiteNumber(data.battery, 100), 8, 100),
    elapsedSeconds: clamp(finiteNumber(data.elapsedSeconds, 0), 0, 86_400),
    lookBehindCount: Math.floor(clamp(finiteNumber(data.lookBehindCount, 0), 0, 999)),
    triggeredEvents,
    position: {
      x: clamp(finiteNumber(data.position.x, 0), -20, 20),
      z: clamp(finiteNumber(data.position.z, 18), -50, 30),
      yaw: clamp(finiteNumber(data.position.yaw, 0), -Math.PI * 2, Math.PI * 2),
    },
    savedAt: typeof data.savedAt === 'string' ? data.savedAt : new Date(0).toISOString(),
  };
};

export const persistSave = (save: SaveGame): void => safeSet(SAVE_KEY, { version: 1, data: save });
export const clearSave = (): void => safeRemove(SAVE_KEY);

export const loadBestTime = (): number | null => {
  const value = safeGet(BEST_TIME_KEY);
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
};

export const persistBestTime = (seconds: number): void => safeSet(BEST_TIME_KEY, seconds);
