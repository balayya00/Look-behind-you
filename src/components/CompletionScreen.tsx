import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useProgressStore } from '../stores/progressStore';
import { useSettingsStore } from '../stores/settingsStore';
import { audioEngine } from '../game/audio/AudioEngine';

const formatTime = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`;

export const CompletionScreen = (): React.JSX.Element => {
  const elapsed = useGameStore((state) => state.elapsedSeconds);
  const looks = useGameStore((state) => state.lookBehindCount);
  const startNew = useGameStore((state) => state.startNewGame);
  const returnToMenu = useGameStore((state) => state.returnToMenu);
  const record = useProgressStore((state) => state.recordCompletion);
  const clear = useProgressStore((state) => state.clearProgress);
  const best = useProgressStore((state) => state.bestTimeSeconds);
  const settings = useSettingsStore();

  useEffect(() => {
    record(elapsed);
    clear();
  }, [clear, elapsed, record]);

  const replay = async (): Promise<void> => {
    await audioEngine.initialize(settings);
    startNew();
  };
  return (
    <main className="completion-screen">
      <p className="eyebrow">OBSERVATION COMPLETE</p>
      <h1>
        <span>DON'T LOOK</span>
        <span>BEHIND YOU</span>
      </h1>
      <p className="completion-copy">
        {looks === 0
          ? 'You never acknowledged it. It followed anyway.'
          : 'Every time you turned, it learned where you expected it to be.'}
      </p>
      <dl>
        <div>
          <dt>TIME INSIDE</dt>
          <dd>{formatTime(elapsed)}</dd>
        </div>
        <div>
          <dt>TIMES YOU LOOKED</dt>
          <dd>{looks}</dd>
        </div>
        {best && (
          <div>
            <dt>BEST TIME</dt>
            <dd>{formatTime(best)}</dd>
          </div>
        )}
      </dl>
      <div className="completion-actions">
        <button className="menu-button primary" onClick={() => void replay()}>
          ENTER AGAIN
        </button>
        <button className="text-button" onClick={returnToMenu}>
          MAIN MENU
        </button>
      </div>
      <small>There are no monsters in the files. Only observers.</small>
    </main>
  );
};
