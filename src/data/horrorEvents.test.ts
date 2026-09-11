import { describe, expect, it } from 'vitest';
import { HORROR_EVENTS } from './horrorEvents';

const unique = (values: readonly string[]): boolean => new Set(values).size === values.length;

describe('horror event definitions', () => {
  it('uses unique IDs and valid bounded delays', () => {
    expect(unique(HORROR_EVENTS.map((event) => event.id))).toBe(true);
    for (const event of HORROR_EVENTS) {
      expect(event.delay[0]).toBeGreaterThanOrEqual(0);
      expect(event.delay[1]).toBeGreaterThanOrEqual(event.delay[0]);
      expect(event.actions.length).toBeGreaterThan(0);
    }
  });

  it('includes attention events where uncertainty can remain harmless', () => {
    const attention = HORROR_EVENTS.flatMap((event) => event.actions).filter(
      (action) => action.type === 'attention',
    );
    expect(attention.length).toBeGreaterThanOrEqual(4);
    expect(attention.some((action) => action.type === 'attention' && !action.mutation)).toBe(true);
  });
});
