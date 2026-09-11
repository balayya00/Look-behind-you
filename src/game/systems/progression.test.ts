import { describe, expect, it } from 'vitest';
import { canAdvanceTo, chapterForStage, isStageAtLeast, objectiveForStage } from './progression';

describe('progression', () => {
  it('allows only adjacent deterministic progression', () => {
    expect(canAdvanceTo('arrival', 'fuse-needed')).toBe(true);
    expect(canAdvanceTo('arrival', 'power-restored')).toBe(false);
    expect(canAdvanceTo('key-found', 'exit-open')).toBe(true);
  });

  it('orders stages and supplies player-facing copy', () => {
    expect(isStageAtLeast('ward-open', 'power-restored')).toBe(true);
    expect(isStageAtLeast('arrival', 'fuse-needed')).toBe(false);
    expect(objectiveForStage('records-read')).toContain('west ward');
    expect(chapterForStage('key-found')).toBe('ESCALATION');
  });
});
