import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Euler, Raycaster, Vector2, Vector3 } from 'three';
import { LEVEL_COLLIDERS, LEVEL_DOORS, TRIGGER_ZONES } from '../../data/level';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { damp, clamp } from '../../utils/math';
import { audioEngine } from '../audio/AudioEngine';
import { isDoorOpen } from '../environment/doorState';
import { getInteractionPrompt, performInteraction } from '../interactions/interactions';
import { Flashlight } from '../lighting/Flashlight';
import { drainBattery } from '../systems/battery';
import { findZone, resolveMovement } from '../systems/collision';
import { playerRuntime, resetPlayerRuntime } from '../systems/runtime';
import { isStageAtLeast, spawnForStage } from '../systems/progression';

const PLAYER_RADIUS = 0.31;
const WALK_SPEED = 2.15;
const SPRINT_SPEED = 3.55;
const CROUCH_SPEED = 1.35;
const STANDING_EYE = 1.67;
const CROUCH_EYE = 1.14;

const movementKeys = new Set([
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ShiftLeft',
  'ShiftRight',
  'ControlLeft',
  'ControlRight',
  'KeyC',
]);

export const PlayerController = (): React.JSX.Element => {
  const { camera, gl, scene } = useThree();
  const sessionSeed = useGameStore((state) => state.sessionSeed);
  const keys = useRef(new Set<string>());
  const velocity = useRef(new Vector3());
  const footstepDistance = useRef(0);
  const bobPhase = useRef(0);
  const eyeHeight = useRef(STANDING_EYE);
  const feetHeight = useRef(0);
  const verticalVelocity = useRef(0);
  const raycaster = useMemo(() => {
    const value = new Raycaster();
    value.far = 2.35;
    value.layers.set(2);
    return value;
  }, []);
  const screenCenter = useMemo(() => new Vector2(0, 0), []);
  const forwardVector = useMemo(() => new Vector3(), []);
  const focusedId = useRef<string | null>(null);
  const interactionClock = useRef(0);
  const elapsedClock = useRef(0);
  const batteryClock = useRef(0);
  const batteryValue = useRef(100);
  const cameraEuler = useMemo(() => new Euler(0, 0, 0, 'YXZ'), []);

  useEffect(() => {
    const game = useGameStore.getState();
    const fallback = spawnForStage(game.stage);
    const spawn = game.restoredPosition ?? fallback;
    resetPlayerRuntime(spawn.x, spawn.z, spawn.yaw);
    velocity.current.set(0, 0, 0);
    feetHeight.current = 0;
    verticalVelocity.current = 0;
    eyeHeight.current = STANDING_EYE;
    footstepDistance.current = 0;
    batteryValue.current = useGameStore.getState().battery;
    camera.position.set(spawn.x, STANDING_EYE, spawn.z);
    cameraEuler.set(0, spawn.yaw, 0);
    camera.rotation.copy(cameraEuler);
  }, [camera, cameraEuler, sessionSeed]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseMove = (event: MouseEvent): void => {
      const state = useGameStore.getState();
      if (document.pointerLockElement !== canvas || state.phase !== 'playing') return;
      const sensitivity = useSettingsStore.getState().mouseSensitivity;
      playerRuntime.yaw -= event.movementX * 0.00165 * sensitivity;
      playerRuntime.pitch = clamp(
        playerRuntime.pitch - event.movementY * 0.00165 * sensitivity,
        -Math.PI * 0.48,
        Math.PI * 0.48,
      );
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (movementKeys.has(event.code)) {
        event.preventDefault();
        keys.current.add(event.code);
      }
      if (event.repeat) return;
      const state = useGameStore.getState();
      if (state.phase !== 'playing' || !state.pointerLocked) return;
      if (event.code === 'KeyF') {
        event.preventDefault();
        if (state.battery > 0.5) {
          state.toggleFlashlight();
          audioEngine.playCue('flashlight');
        } else {
          state.notify('The flashlight battery is empty.', 'warning');
          audioEngine.playCue('locked');
        }
      } else if (event.code === 'KeyE' && focusedId.current) {
        event.preventDefault();
        performInteraction(focusedId.current);
      }
    };

    const onKeyUp = (event: KeyboardEvent): void => {
      keys.current.delete(event.code);
    };

    const onPointerLockChange = (): void => {
      const locked = document.pointerLockElement === canvas;
      const state = useGameStore.getState();
      state.setPointerLocked(locked);
      keys.current.clear();
      if (locked) {
        if (state.phase === 'intro' || state.phase === 'paused' || state.phase === 'reading') {
          state.enterPlaying();
        }
        void audioEngine.resume();
      } else if (state.phase === 'playing') {
        state.pause();
      }
    };

    const onPointerLockError = (): void => {
      const state = useGameStore.getState();
      state.setPointerLocked(false);
      if (state.phase === 'playing') state.pause();
      state.notify('Mouse capture failed. Click Resume to try again.', 'warning');
    };

    const onBlur = (): void => keys.current.clear();
    const onVisibility = (): void => {
      if (document.hidden && useGameStore.getState().phase === 'playing')
        document.exitPointerLock?.();
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', onPointerLockError);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      document.removeEventListener('pointerlockerror', onPointerLockError);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
    };
  }, [gl.domElement]);

  useFrame((_, rawDelta) => {
    const state = useGameStore.getState();
    if (state.phase !== 'playing' || !state.pointerLocked) return;
    const delta = Math.min(rawDelta, 0.05);
    const pressed = keys.current;
    const forwardInput = Number(pressed.has('KeyW')) - Number(pressed.has('KeyS'));
    const rightInput = Number(pressed.has('KeyD')) - Number(pressed.has('KeyA'));
    const inputLength = Math.hypot(forwardInput, rightInput);
    const crouching =
      pressed.has('ControlLeft') || pressed.has('ControlRight') || pressed.has('KeyC');
    const sprinting =
      !crouching && (pressed.has('ShiftLeft') || pressed.has('ShiftRight')) && forwardInput > 0;
    const speedLimit = crouching ? CROUCH_SPEED : sprinting ? SPRINT_SPEED : WALK_SPEED;
    const normalizedForward = inputLength > 0 ? forwardInput / inputLength : 0;
    const normalizedRight = inputLength > 0 ? rightInput / inputLength : 0;
    const sin = Math.sin(playerRuntime.yaw);
    const cos = Math.cos(playerRuntime.yaw);
    const targetX = (-sin * normalizedForward + cos * normalizedRight) * speedLimit;
    const targetZ = (-cos * normalizedForward - sin * normalizedRight) * speedLimit;
    velocity.current.x = damp(velocity.current.x, targetX, inputLength > 0 ? 11 : 15, delta);
    velocity.current.z = damp(velocity.current.z, targetZ, inputLength > 0 ? 11 : 15, delta);

    const game = useGameStore.getState();
    const result = resolveMovement(
      playerRuntime.position.x,
      playerRuntime.position.z,
      velocity.current.x * delta,
      velocity.current.z * delta,
      LEVEL_COLLIDERS,
      {
        radius: PLAYER_RADIUS,
        isDisabled: (collider) => {
          if (!collider.disabledWhen) return false;
          const doorId = collider.disabledWhen.slice('door:'.length, -':open'.length);
          const door = LEVEL_DOORS.find((entry) => entry.id === doorId);
          return door ? isDoorOpen(door, game.stage, game.openDoors) : false;
        },
      },
    );
    if (result.collidedX) velocity.current.x = 0;
    if (result.collidedZ) velocity.current.z = 0;
    playerRuntime.position.x = result.x;
    playerRuntime.position.z = result.z;

    verticalVelocity.current -= 9.81 * delta;
    feetHeight.current += verticalVelocity.current * delta;
    if (feetHeight.current <= 0) {
      feetHeight.current = 0;
      verticalVelocity.current = 0;
      playerRuntime.grounded = true;
    } else {
      playerRuntime.grounded = false;
    }

    eyeHeight.current = damp(eyeHeight.current, crouching ? CROUCH_EYE : STANDING_EYE, 10, delta);
    const actualSpeed = Math.hypot(velocity.current.x, velocity.current.z);
    playerRuntime.speed = actualSpeed;
    const settings = useSettingsStore.getState();
    const motionEnabled = !settings.reducedMotion;
    const bobEnabled = motionEnabled && settings.headBob && actualSpeed > 0.12;
    if (bobEnabled) bobPhase.current += actualSpeed * delta * 4.9;
    const bobAmount = bobEnabled ? Math.min(actualSpeed / SPRINT_SPEED, 1) : 0;
    const bobY = Math.sin(bobPhase.current * 2) * 0.018 * bobAmount;
    const bobX = Math.sin(bobPhase.current) * 0.012 * bobAmount;
    const breathing = motionEnabled ? Math.sin(performance.now() * 0.00125) * 0.004 : 0;
    const roll = bobEnabled ? Math.sin(bobPhase.current) * 0.0045 : 0;

    camera.position.set(
      playerRuntime.position.x + Math.cos(playerRuntime.yaw) * bobX,
      feetHeight.current + eyeHeight.current + bobY + breathing,
      playerRuntime.position.z - Math.sin(playerRuntime.yaw) * bobX,
    );
    cameraEuler.set(playerRuntime.pitch + breathing * 0.16, playerRuntime.yaw, roll);
    camera.rotation.copy(cameraEuler);
    playerRuntime.position.y = feetHeight.current + eyeHeight.current;
    camera.getWorldDirection(forwardVector);
    audioEngine.setListener(camera.position, forwardVector);

    if (actualSpeed > 0.25 && playerRuntime.grounded) {
      footstepDistance.current += actualSpeed * delta;
      const stride = crouching ? 1.35 : sprinting ? 1.62 : 1.48;
      if (footstepDistance.current >= stride) {
        footstepDistance.current %= stride;
        audioEngine.playFootstep(
          { x: playerRuntime.position.x, y: 0.06, z: playerRuntime.position.z },
          crouching ? 0.45 : sprinting ? 1.12 : 0.78,
        );
      }
    }

    if (game.battery > batteryValue.current + 1) batteryValue.current = game.battery;
    batteryValue.current = drainBattery(batteryValue.current, delta, game.flashlightOn);
    batteryClock.current += delta;
    if (batteryClock.current >= 0.25) {
      batteryClock.current = 0;
      game.setBattery(batteryValue.current);
      if (batteryValue.current < 18 && !game.triggeredEvents.includes('battery-low')) {
        game.markEvent('battery-low');
        game.notify('FLASHLIGHT BATTERY LOW', 'warning');
        audioEngine.playCue('locked');
      }
      if (batteryValue.current <= 0.01 && game.flashlightOn) {
        game.forceFlashlight(false);
        game.notify('The flashlight dies.', 'warning');
      }
    }

    interactionClock.current += delta;
    if (interactionClock.current >= 0.08) {
      interactionClock.current = 0;
      raycaster.setFromCamera(screenCenter, camera);
      const hit = raycaster.intersectObjects(scene.children, true)[0];
      const id =
        typeof hit?.object.userData.interactionId === 'string'
          ? hit.object.userData.interactionId
          : null;
      const prompt = id ? getInteractionPrompt(id) : null;
      if (prompt?.id !== focusedId.current) {
        focusedId.current = prompt?.id ?? null;
        game.setPrompt(prompt);
      }
    }

    const zone = findZone(playerRuntime.position.x, playerRuntime.position.z, TRIGGER_ZONES);
    if (zone !== playerRuntime.currentZone) {
      playerRuntime.previousZone = playerRuntime.currentZone;
      playerRuntime.currentZone = zone;
    }
    if (
      zone === 'threshold' &&
      isStageAtLeast(game.stage, 'exit-open') &&
      playerRuntime.position.z < -40.2
    ) {
      game.beginEnding();
    }

    elapsedClock.current += delta;
    if (elapsedClock.current >= 1) {
      game.tickElapsed(elapsedClock.current);
      elapsedClock.current = 0;
    }
  }, -2);

  return <Flashlight />;
};
