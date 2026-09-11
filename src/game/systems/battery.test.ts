import { describe, expect, it } from 'vitest';
import { collectBattery, drainBattery, flashlightIntensityForBattery } from './battery';

describe('flashlight battery', () => {
  it('drains only while enabled and clamps safely', () => {
    expect(drainBattery(50, 10, false)).toBe(50);
    expect(drainBattery(1, 100, true)).toBe(0);
  });

  it('makes pickups recover an almost-empty light', () => {
    expect(collectBattery(0, 30)).toBe(42);
    expect(collectBattery(90, 30)).toBe(100);
  });

  it('dims but remains useful at low charge', () => {
    expect(flashlightIntensityForBattery(7)).toBeGreaterThan(0.5);
    expect(flashlightIntensityForBattery(40)).toBeGreaterThan(flashlightIntensityForBattery(7));
  });
});
