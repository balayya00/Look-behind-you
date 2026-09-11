import { useSettingsStore } from '../stores/settingsStore';
import type { BooleanSettingKey, NumericSettingKey } from '../types/settings';
import { audioEngine } from '../game/audio/AudioEngine';

interface SettingsPanelProps {
  readonly onClose: () => void;
  readonly compact?: boolean;
}

const Slider = ({
  setting,
  label,
  minimum,
  maximum,
  step,
  format = (value) => `${Math.round(value * 100)}%`,
}: {
  readonly setting: NumericSettingKey;
  readonly label: string;
  readonly minimum: number;
  readonly maximum: number;
  readonly step: number;
  readonly format?: (value: number) => string;
}): React.JSX.Element => {
  const value = useSettingsStore((state) => state[setting]);
  const setNumeric = useSettingsStore((state) => state.setNumeric);
  return (
    <label className="setting-row slider-row">
      <span>
        {label}
        <output>{format(value)}</output>
      </span>
      <input
        type="range"
        min={minimum}
        max={maximum}
        step={step}
        value={value}
        onChange={(event) => setNumeric(setting, event.currentTarget.valueAsNumber)}
        onPointerUp={() => audioEngine.playCue('ui-hover')}
      />
    </label>
  );
};

const Toggle = ({
  setting,
  label,
  hint,
}: {
  readonly setting: BooleanSettingKey;
  readonly label: string;
  readonly hint: string;
}): React.JSX.Element => {
  const checked = useSettingsStore((state) => state[setting]);
  const setBoolean = useSettingsStore((state) => state.setBoolean);
  return (
    <label className="setting-row toggle-row">
      <span>
        {label}
        <small>{hint}</small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => setBoolean(setting, event.currentTarget.checked)}
      />
      <i aria-hidden="true" />
    </label>
  );
};

export const SettingsPanel = ({
  onClose,
  compact = false,
}: SettingsPanelProps): React.JSX.Element => {
  const quality = useSettingsStore((state) => state.graphicsQuality);
  const setQuality = useSettingsStore((state) => state.setGraphicsQuality);
  const reset = useSettingsStore((state) => state.resetSettings);
  return (
    <section
      className={`panel settings-panel ${compact ? 'compact' : ''}`}
      aria-labelledby="settings-title"
    >
      <header className="panel-header">
        <div>
          <p className="eyebrow">CONFIGURATION</p>
          <h2 id="settings-title">Settings</h2>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close settings">
          ×
        </button>
      </header>
      <div className="settings-scroll">
        <fieldset>
          <legend>AUDIO</legend>
          <Slider
            setting="masterVolume"
            label="Master volume"
            minimum={0}
            maximum={1}
            step={0.01}
          />
          <Slider
            setting="musicVolume"
            label="Adaptive ambience"
            minimum={0}
            maximum={1}
            step={0.01}
          />
          <Slider setting="sfxVolume" label="Effects volume" minimum={0} maximum={1} step={0.01} />
        </fieldset>
        <fieldset>
          <legend>CONTROLS & DISPLAY</legend>
          <Slider
            setting="mouseSensitivity"
            label="Mouse sensitivity"
            minimum={0.2}
            maximum={1.8}
            step={0.05}
            format={(value) => `${value.toFixed(2)}×`}
          />
          <Slider
            setting="brightness"
            label="Brightness / gamma"
            minimum={0.65}
            maximum={1.5}
            step={0.05}
            format={(value) => `${Math.round(value * 100)}%`}
          />
          <div className="setting-row quality-row">
            <span>Graphics quality</span>
            <div className="segmented" role="group" aria-label="Graphics quality">
              {(['low', 'medium', 'high'] as const).map((option) => (
                <button
                  key={option}
                  className={quality === option ? 'selected' : ''}
                  onClick={() => setQuality(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </fieldset>
        <fieldset>
          <legend>ACCESSIBILITY</legend>
          <Toggle
            setting="captions"
            label="Sound captions"
            hint="Describe important non-speech cues."
          />
          <Toggle
            setting="reducedMotion"
            label="Reduced motion"
            hint="Disables camera breathing and sway."
          />
          <Toggle setting="headBob" label="Head bob" hint="Controls movement camera motion." />
        </fieldset>
      </div>
      <footer className="panel-footer">
        <button className="text-button" onClick={reset}>
          RESET DEFAULTS
        </button>
        <button className="menu-button primary small" onClick={onClose}>
          DONE
        </button>
      </footer>
    </section>
  );
};
