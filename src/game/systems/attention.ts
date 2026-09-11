import { angleDistance } from '../../utils/math';

export type AttentionPhase = 'idle' | 'cue' | 'looked-behind' | 'returned' | 'expired';

export interface AttentionEpisode {
  readonly id: string;
  readonly originYaw: number;
  readonly startedAt: number;
  readonly expiresAt: number;
  readonly requiredTurn: number;
  readonly returnTolerance: number;
  phase: AttentionPhase;
  lookedAt: number | null;
}

export const createAttentionEpisode = (
  id: string,
  originYaw: number,
  now: number,
  durationSeconds = 12,
): AttentionEpisode => ({
  id,
  originYaw,
  startedAt: now,
  expiresAt: now + durationSeconds,
  requiredTurn: Math.PI * 0.62,
  returnTolerance: Math.PI * 0.22,
  phase: 'cue',
  lookedAt: null,
});

export const updateAttentionEpisode = (
  episode: AttentionEpisode,
  yaw: number,
  now: number,
): AttentionPhase => {
  if (episode.phase === 'returned' || episode.phase === 'expired') return episode.phase;
  if (now >= episode.expiresAt) {
    episode.phase = 'expired';
    return episode.phase;
  }

  const distance = angleDistance(yaw, episode.originYaw);
  if (episode.phase === 'cue' && distance >= episode.requiredTurn) {
    episode.phase = 'looked-behind';
    episode.lookedAt = now;
  } else if (episode.phase === 'looked-behind' && distance <= episode.returnTolerance) {
    episode.phase = 'returned';
  }
  return episode.phase;
};
