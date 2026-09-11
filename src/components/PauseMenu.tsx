import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useProgressStore } from '../stores/progressStore';
import { playerRuntime } from '../game/systems/runtime';
import { requestGamePointerLock } from '../game/player/pointerLock';
import { audioEngine } from '../game/audio/AudioEngine';
import { SettingsPanel } from './SettingsPanel';

export const PauseMenu = (): React.JSX.Element => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const createSave = useGameStore((state) => state.createSave);
  const returnToMenu = useGameStore((state) => state.returnToMenu);
  const writeSave = useProgressStore((state) => state.writeSave);

  useEffect(() => {
    writeSave(
      createSave({
        x: playerRuntime.position.x,
        z: playerRuntime.position.z,
        yaw: playerRuntime.yaw,
      }),
    );
  }, [createSave, writeSave]);

  const resume = async (): Promise<void> => {
    audioEngine.playCue('ui-confirm');
    const result = await requestGamePointerLock();
    if (result === 'failed' || result === 'unsupported') {
      useGameStore
        .getState()
        .notify('Mouse capture failed. Try clicking the game again.', 'warning');
    }
  };

  if (settingsOpen)
    return (
      <div className="pause-overlay">
        <SettingsPanel compact onClose={() => setSettingsOpen(false)} />
      </div>
    );
  return (
    <section className="pause-overlay">
      <div className="pause-card">
        <p className="eyebrow">OBSERVATION INTERRUPTED</p>
        <h2>PAUSED</h2>
        <p>The building will wait.</p>
        <button className="menu-button primary" onClick={() => void resume()}>
          RESUME
        </button>
        <button className="menu-button" onClick={() => setSettingsOpen(true)}>
          SETTINGS
        </button>
        <button className="text-button danger" onClick={returnToMenu}>
          RETURN TO MENU
        </button>
        <small>Progress saved locally at this checkpoint.</small>
      </div>
    </section>
  );
};
