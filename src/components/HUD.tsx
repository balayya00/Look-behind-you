import { useEffect } from 'react';
import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';

export const HUD = (): React.JSX.Element => {
  const battery = useGameStore((state) => state.battery);
  const flashlightOn = useGameStore((state) => state.flashlightOn);
  const objective = useGameStore((state) => state.objective);
  const chapter = useGameStore((state) => state.chapter);
  const prompt = useGameStore((state) => state.prompt);
  const notification = useGameStore((state) => state.notification);
  const caption = useGameStore((state) => state.caption);
  const captionsEnabled = useSettingsStore((state) => state.captions);
  const clear = useGameStore((state) => state.clearNotification);

  useEffect(() => {
    if (!notification) return;
    const timeout = window.setTimeout(
      () => clear(notification.id),
      notification.tone === 'objective' ? 5000 : 3600,
    );
    return () => window.clearTimeout(timeout);
  }, [clear, notification]);

  const segments = Math.ceil(battery / 10);
  return (
    <div className="hud" aria-live="polite">
      <div className="hud-objective">
        <span>{chapter}</span>
        <p>{objective}</p>
      </div>
      <div className={`battery-hud ${battery < 20 ? 'low' : ''} ${!flashlightOn ? 'off' : ''}`}>
        <div>
          <span>FLASHLIGHT</span>
          <output>{Math.ceil(battery)}%</output>
        </div>
        <div
          className="battery-bars"
          aria-label={`Flashlight battery ${Math.ceil(battery)} percent`}
        >
          {Array.from({ length: 10 }, (_, index) => (
            <i key={index} className={index < segments ? 'filled' : ''} />
          ))}
        </div>
        {!flashlightOn && <small>OFF · F</small>}
      </div>
      <div className="crosshair" aria-hidden="true">
        <i />
        <i />
      </div>
      {prompt && (
        <div className="interaction-prompt">
          <kbd>E</kbd>
          <span>
            <small>{prompt.verb}</small>
            {prompt.label}
          </span>
        </div>
      )}
      {notification && (
        <div className={`game-notification ${notification.tone}`} key={notification.id}>
          {notification.text}
        </div>
      )}
      {captionsEnabled && caption && (
        <div className="sound-caption" key={caption.id}>
          {caption.text}
        </div>
      )}
    </div>
  );
};
