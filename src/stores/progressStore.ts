import { create } from 'zustand';
import type { SaveGame } from '../types/game';
import { clearSave, loadBestTime, loadSave, persistBestTime, persistSave } from './persistence';

interface ProgressState {
  readonly save: SaveGame | null;
  readonly bestTimeSeconds: number | null;
  readonly writeSave: (save: SaveGame) => void;
  readonly clearProgress: () => void;
  readonly recordCompletion: (seconds: number) => void;
}

export const useProgressStore = create<ProgressState>()((set, get) => ({
  save: loadSave(),
  bestTimeSeconds: loadBestTime(),
  writeSave: (save) => {
    persistSave(save);
    set({ save });
  },
  clearProgress: () => {
    clearSave();
    set({ save: null });
  },
  recordCompletion: (seconds) => {
    const current = get().bestTimeSeconds;
    if (current === null || seconds < current) {
      persistBestTime(seconds);
      set({ bestTimeSeconds: seconds });
    }
  },
}));
