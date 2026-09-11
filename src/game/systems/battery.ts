import { clamp } from '../../utils/math';

export const FLASHLIGHT_DRAIN_PER_SECOND = 0.19;
export const FLASHLIGHT_MINIMUM_RECOVERY = 12;

export const drainBattery = (battery: number, seconds: number, flashlightOn: boolean): number => {
  if (!flashlightOn || seconds <= 0) return clamp(battery, 0, 100);
  return clamp(battery - FLASHLIGHT_DRAIN_PER_SECOND * seconds, 0, 100);
};

export const collectBattery = (battery: number, amount = 38): number =>
  clamp(Math.max(FLASHLIGHT_MINIMUM_RECOVERY, battery) + amount, 0, 100);

// Three.js interprets a SpotLight's intensity as luminous intensity. These values
// keep nearby geometry readable while allowing the inverse falloff to swallow distance.
export const flashlightIntensityForBattery = (battery: number): number => {
  if (battery <= 0) return 0;
  if (battery < 8) return 14 + battery * 3;
  if (battery < 20) return 38 + (battery - 8) * 2.5;
  return 72;
};
