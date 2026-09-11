import { useEffect } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { audioEngine } from './AudioEngine';
import { isStageAtLeast } from '../systems/progression';

export const AudioBridge = (): null => {
  const settings = useSettingsStore();
  const tension = useGameStore((state) => state.tension);
  const phase = useGameStore((state) => state.phase);
  const stage = useGameStore((state) => state.stage);

  useEffect(() => audioEngine.updateMix(settings), [settings]);
  useEffect(() => audioEngine.setTension(tension), [tension]);
  useEffect(() => audioEngine.setPaused(phase !== 'playing'), [phase]);
  useEffect(() => audioEngine.setPower(isStageAtLeast(stage, 'power-restored')), [stage]);

  return null;
};
