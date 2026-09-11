import { useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useProgressStore } from '../stores/progressStore';
import { useSettingsStore } from '../stores/settingsStore';
import { audioEngine } from '../game/audio/AudioEngine';
import { CreditsPanel } from './CreditsPanel';
import { SettingsPanel } from './SettingsPanel';

export const MainMenu = (): React.JSX.Element => {
  const [panel, setPanel] = useState<'settings' | 'credits' | null>(null);
  const save = useProgressStore((state) => state.save);
  const bestTime = useProgressStore((state) => state.bestTimeSeconds);
  const settings = useSettingsStore();
  const startNew = useGameStore((state) => state.startNewGame);
  const continueGame = useGameStore((state) => state.continueGame);
  const clearProgress = useProgressStore((state) => state.clearProgress);

  const beginNew = async (): Promise<void> => {
    clearProgress();
    await audioEngine.initialize(settings);
    audioEngine.playCue('ui-confirm');
    startNew();
  };
  const resume = async (): Promise<void> => {
    if (!save) return;
    await audioEngine.initialize(settings);
    audioEngine.playCue('ui-confirm');
    continueGame(save);
  };

  return (
    <main className="main-menu">
      <div className="menu-rule" aria-hidden="true">
        <span>OBSERVATION 17</span>
        <span>03:17</span>
      </div>
      <section className="title-block" aria-labelledby="game-title">
        <p className="eyebrow">A FIRST-PERSON PSYCHOLOGICAL HORROR EXPERIENCE</p>
        <h1 id="game-title">
          <span>DON'T LOOK</span>
          <span className="title-behind">BEHIND YOU</span>
        </h1>
        <p className="menu-tagline">The footsteps stop when you do.</p>
      </section>
      <nav className="menu-actions" aria-label="Main menu">
        <button className="menu-button primary" onClick={() => void beginNew()}>
          <span>NEW GAME</span>
          <small>ENTER THE ANNEX</small>
        </button>
        <button className="menu-button" onClick={() => void resume()} disabled={!save}>
          <span>CONTINUE</span>
          <small>
            {save
              ? `CHECKPOINT · ${save.stage.replaceAll('-', ' ').toUpperCase()}`
              : 'NO OBSERVATION ON FILE'}
          </small>
        </button>
        <div className="menu-secondary">
          <button className="text-button" onClick={() => setPanel('settings')}>
            SETTINGS
          </button>
          <button className="text-button" onClick={() => setPanel('credits')}>
            CREDITS
          </button>
        </div>
      </nav>
      <footer className="menu-footer">
        <span>DESKTOP · HEADPHONES RECOMMENDED</span>
        {bestTime && (
          <span>
            BEST OBSERVATION {Math.floor(bestTime / 60)}:
            {Math.floor(bestTime % 60)
              .toString()
              .padStart(2, '0')}
          </span>
        )}
      </footer>
      {panel && (
        <div
          className="modal-scrim"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPanel(null);
          }}
        >
          {panel === 'settings' ? (
            <SettingsPanel onClose={() => setPanel(null)} />
          ) : (
            <CreditsPanel onClose={() => setPanel(null)} />
          )}
        </div>
      )}
    </main>
  );
};
