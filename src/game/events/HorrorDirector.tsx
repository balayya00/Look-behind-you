import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import {
  HORROR_EVENTS,
  type HorrorAction,
  type HorrorEventDefinition,
} from '../../data/horrorEvents';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { createSeededRandom, randomBetween, type RandomSource } from '../../utils/random';
import { audioEngine } from '../audio/AudioEngine';
import {
  createAttentionEpisode,
  updateAttentionEpisode,
  type AttentionEpisode,
} from '../systems/attention';
import { playerRuntime } from '../systems/runtime';
import { stageIndex } from '../systems/progression';

interface ScheduledEvent {
  readonly definition: HorrorEventDefinition;
  readonly dueAt: number;
}

interface ActiveAttention {
  readonly episode: AttentionEpisode;
  readonly stopAudio: () => void;
  readonly mutation: Extract<HorrorAction, { readonly type: 'attention' }>['mutation'];
  readonly mutationChance: number;
  didCountLook: boolean;
}

const eligibleAtStage = (
  definition: HorrorEventDefinition,
  stage: ReturnType<typeof useGameStore.getState>['stage'],
): boolean => {
  if (definition.minimumStage && stageIndex(stage) < stageIndex(definition.minimumStage))
    return false;
  if (definition.maximumStage && stageIndex(stage) > stageIndex(definition.maximumStage))
    return false;
  return true;
};

const showCaption = (text: string, timeline: number, expiry: { value: number }): void => {
  if (!useSettingsStore.getState().captions) return;
  useGameStore.getState().showCaption(text);
  expiry.value = timeline + 3.4;
};

const playWorldSound = (action: Extract<HorrorAction, { readonly type: 'sound' }>): void => {
  const [x, y, z] = action.position;
  const position = { x, y, z };
  if (action.cue === 'creak') audioEngine.playCreak(position);
  else if (action.cue === 'impact') audioEngine.playImpact(position);
  else if (action.cue === 'whisper') audioEngine.playWhisper(position);
  else audioEngine.playBreathing(position);
};

export const HorrorDirector = (): null => {
  const sessionSeed = useGameStore((state) => state.sessionSeed);
  const random = useRef<RandomSource>(createSeededRandom(sessionSeed));
  const timeline = useRef(0);
  const previousStage = useRef(useGameStore.getState().stage);
  const previousZone = useRef<string | null>(null);
  const visits = useRef(new Map<string, number>());
  const scheduled = useRef<ScheduledEvent[]>([]);
  const scheduledIds = useRef(new Set<string>());
  const attention = useRef<ActiveAttention | null>(null);
  const captionExpiry = useRef({ value: 0 });
  const silhouetteExpiry = useRef(0);
  const nextAmbient = useRef(18);

  useEffect(() => {
    random.current = createSeededRandom(sessionSeed);
    timeline.current = 0;
    previousStage.current = useGameStore.getState().stage;
    previousZone.current = null;
    visits.current.clear();
    scheduled.current = [];
    scheduledIds.current.clear();
    attention.current?.stopAudio();
    attention.current = null;
    captionExpiry.current.value = 0;
    silhouetteExpiry.current = 0;
    nextAmbient.current = randomBetween(random.current, 14, 24);
  }, [sessionSeed]);

  const schedule = (definition: HorrorEventDefinition): void => {
    const state = useGameStore.getState();
    if (definition.once && state.triggeredEvents.includes(definition.id)) return;
    if (scheduledIds.current.has(definition.id)) return;
    scheduledIds.current.add(definition.id);
    scheduled.current.push({
      definition,
      dueAt:
        timeline.current + randomBetween(random.current, definition.delay[0], definition.delay[1]),
    });
  };

  const startAttention = (action: Extract<HorrorAction, { readonly type: 'attention' }>): void => {
    if (attention.current) return;
    const episode = createAttentionEpisode(
      `attention-${timeline.current}`,
      playerRuntime.yaw,
      timeline.current,
      13,
    );
    const sourcePosition = {
      x: playerRuntime.position.x,
      y: 1.25,
      z: playerRuntime.position.z,
    };
    const stopAudio =
      action.cue === 'footsteps'
        ? audioEngine.playFootstepsBehind(sourcePosition, playerRuntime.yaw, 6)
        : audioEngine.playBreathing({
            x: sourcePosition.x + Math.sin(playerRuntime.yaw) * 1.7,
            y: 1.55,
            z: sourcePosition.z + Math.cos(playerRuntime.yaw) * 1.7,
          });
    attention.current = {
      episode,
      stopAudio,
      mutation: action.mutation,
      mutationChance: action.mutationChance ?? 1,
      didCountLook: false,
    };
    showCaption(action.caption, timeline.current, captionExpiry.current);
  };

  const executeAction = (action: HorrorAction): void => {
    const state = useGameStore.getState();
    switch (action.type) {
      case 'sound':
        playWorldSound(action);
        showCaption(action.caption, timeline.current, captionExpiry.current);
        break;
      case 'attention':
        startAttention(action);
        break;
      case 'mutation':
        state.setMutation(action.key, action.value);
        break;
      case 'silhouette':
        state.setMutation('silhouette-location', action.location);
        state.setMutation('silhouette-visible', true);
        silhouetteExpiry.current = timeline.current + action.duration;
        break;
      case 'tension':
        state.adjustTension(action.amount);
        break;
    }
  };

  useFrame((_, rawDelta) => {
    const state = useGameStore.getState();
    if (state.phase !== 'playing' || !state.pointerLocked) return;
    const delta = Math.min(rawDelta, 0.05);
    timeline.current += delta;

    const zone = playerRuntime.currentZone;
    const enteredZone = zone !== null && zone !== previousZone.current;
    if (enteredZone) visits.current.set(zone, (visits.current.get(zone) ?? 0) + 1);
    const stageChanged = state.stage !== previousStage.current;

    for (const definition of HORROR_EVENTS) {
      if (!eligibleAtStage(definition, state.stage)) continue;
      const trigger = definition.trigger;
      let matched = false;
      if (trigger.type === 'zone-enter') matched = enteredZone && zone === trigger.zone;
      else if (trigger.type === 'stage') matched = stageChanged && state.stage === trigger.stage;
      else if (trigger.type === 'elapsed') matched = timeline.current >= trigger.seconds;
      else if (trigger.type === 'zone-revisit') {
        matched =
          enteredZone && zone === trigger.zone && (visits.current.get(zone) ?? 0) >= trigger.visits;
      }
      if (matched) schedule(definition);
    }

    previousZone.current = zone;
    previousStage.current = state.stage;

    const ready = scheduled.current.filter((event) => event.dueAt <= timeline.current);
    if (ready.length > 0) {
      scheduled.current = scheduled.current.filter((event) => event.dueAt > timeline.current);
      for (const event of ready) {
        scheduledIds.current.delete(event.definition.id);
        if (event.definition.once && !state.markEvent(event.definition.id)) continue;
        event.definition.actions.forEach(executeAction);
      }
    }

    const active = attention.current;
    if (active) {
      const previousPhase = active.episode.phase;
      const phase = updateAttentionEpisode(active.episode, playerRuntime.yaw, timeline.current);
      if (phase === 'looked-behind' && previousPhase !== 'looked-behind') {
        active.stopAudio();
        if (!active.didCountLook) {
          state.registerLookBehind();
          active.didCountLook = true;
        }
        useGameStore.getState().clearCaption();
      } else if (phase === 'returned') {
        active.stopAudio();
        if (active.mutation && random.current() <= active.mutationChance) {
          state.setMutation(active.mutation.key, active.mutation.value);
          audioEngine.playCreak(
            {
              x: playerRuntime.position.x - Math.sin(playerRuntime.yaw) * 3,
              y: 1,
              z: playerRuntime.position.z - Math.cos(playerRuntime.yaw) * 3,
            },
            0.55,
          );
        }
        attention.current = null;
      } else if (phase === 'expired') {
        active.stopAudio();
        attention.current = null;
      }
    }

    if (captionExpiry.current.value > 0 && timeline.current >= captionExpiry.current.value) {
      state.clearCaption();
      captionExpiry.current.value = 0;
    }
    if (silhouetteExpiry.current > 0 && timeline.current >= silhouetteExpiry.current) {
      state.setMutation('silhouette-visible', false);
      silhouetteExpiry.current = 0;
    }

    if (timeline.current >= nextAmbient.current && !attention.current) {
      const distance = 4 + random.current() * 6;
      const side = random.current() > 0.5 ? 1 : -1;
      const position = {
        x: playerRuntime.position.x + Math.cos(playerRuntime.yaw) * distance * side,
        y: 1 + random.current() * 1.4,
        z: playerRuntime.position.z - Math.sin(playerRuntime.yaw) * distance * side,
      };
      if (random.current() < 0.65) audioEngine.playCreak(position, 0.45 + state.tension / 180);
      else audioEngine.playWhisper(position, 0.7);
      nextAmbient.current =
        timeline.current + randomBetween(random.current, 17, 34 - state.tension * 0.1);
    }
  }, -1);

  return null;
};
