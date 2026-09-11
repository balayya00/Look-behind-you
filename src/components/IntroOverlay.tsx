import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';
import { audioEngine } from '../game/audio/AudioEngine';
import { requestGamePointerLock } from '../game/player/pointerLock';

export const IntroOverlay = (): React.JSX.Element => {
  const [error, setError] = useState<string | null>(null);
  const chapter = useGameStore((state) => state.chapter);
  const stage = useGameStore((state) => state.stage);
  const settings = useSettingsStore();

  const enter = async (): Promise<void> => {
    setError(null);
    await audioEngine.initialize(settings);
    const result = await requestGamePointerLock();
    if (result === 'unsupported') setError('Pointer Lock is unavailable in this browser.');
    else if (result === 'failed')
      setError(
        'The browser refused mouse capture. Try opening the game directly in a desktop tab.',
      );
  };

  return (
    <section className="intro-overlay">
      <div className="intro-card">
        <p className="eyebrow">
          {stage === 'arrival' ? '14 OCTOBER 1998 · 02:51' : 'OBSERVATION RESUMED'}
        </p>
        <h2>{chapter}</h2>
        <p className="intro-copy">
          {stage === 'arrival'
            ? 'The front door closed before you touched it. Somewhere below the dead lights, an electrical relay is still clicking.'
            : 'The building is exactly where you left it. Something else may be, too.'}
        </p>
        <div className="control-grid">
          <span>
            <kbd>W A S D</kbd> MOVE
          </span>
          <span>
            <kbd>MOUSE</kbd> LOOK
          </span>
          <span>
            <kbd>SHIFT</kbd> SPRINT
          </span>
          <span>
            <kbd>CTRL / C</kbd> CROUCH
          </span>
          <span>
            <kbd>E</kbd> INTERACT
          </span>
          <span>
            <kbd>F</kbd> FLASHLIGHT
          </span>
        </div>
        <button className="enter-button" onClick={() => void enter()}>
          <span>CLICK TO ENTER</span>
          <small>ESC pauses · headphones recommended</small>
        </button>
        {error && (
          <p className="inline-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </section>
  );
};
