import { create } from 'zustand';
import type {
  BooleanSettingKey,
  GameSettings,
  GraphicsQuality,
  NumericSettingKey,
} from '../types/settings';
import { clamp } from '../utils/math';
import { DEFAULT_SETTINGS, loadSettings, persistSettings } from './persistence';

interface SettingsActions {
  readonly setNumeric: (key: NumericSettingKey, value: number) => void;
  readonly setBoolean: (key: BooleanSettingKey, value: boolean) => void;
  readonly setGraphicsQuality: (quality: GraphicsQuality) => void;
  readonly resetSettings: () => void;
  readonly applyReducedMotionPreference: () => void;
}

export type SettingsState = GameSettings & SettingsActions;

const limits: Record<NumericSettingKey, readonly [number, number]> = {
  masterVolume: [0, 1],
  musicVolume: [0, 1],
  sfxVolume: [0, 1],
  mouseSensitivity: [0.2, 1.8],
  brightness: [0.65, 1.5],
};

const initialSettings = loadSettings();

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  ...initialSettings,
  setNumeric: (key, value) => {
    const [minimum, maximum] = limits[key];
    set({ [key]: clamp(value, minimum, maximum) } as Pick<GameSettings, typeof key>);
    persistSettings(get());
  },
  setBoolean: (key, value) => {
    set({ [key]: value } as Pick<GameSettings, typeof key>);
    persistSettings(get());
  },
  setGraphicsQuality: (graphicsQuality) => {
    set({ graphicsQuality });
    persistSettings(get());
  },
  resetSettings: () => {
    set(DEFAULT_SETTINGS);
    persistSettings(DEFAULT_SETTINGS);
  },
  applyReducedMotionPreference: () => {
    if (!get().reducedMotion) {
      set({ reducedMotion: true, headBob: false });
      persistSettings(get());
    }
  },
}));
