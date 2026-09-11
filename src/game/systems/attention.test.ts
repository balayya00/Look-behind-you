import { describe, expect, it } from 'vitest';
import { createAttentionEpisode, updateAttentionEpisode } from './attention';

describe('attention episode', () => {
  it('requires a meaningful turn and then a return', () => {
    const episode = createAttentionEpisode('behind', 0, 10);
    expect(updateAttentionEpisode(episode, 0.5, 11)).toBe('cue');
    expect(updateAttentionEpisode(episode, Math.PI * 0.75, 12)).toBe('looked-behind');
    expect(updateAttentionEpisode(episode, 0.1, 13)).toBe('returned');
  });

  it('expires without forcing a scare', () => {
    const episode = createAttentionEpisode('behind', 0, 10, 2);
    expect(updateAttentionEpisode(episode, 0, 12)).toBe('expired');
  });
});
