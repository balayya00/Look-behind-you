export interface SupportReport {
  readonly webgl: boolean;
  readonly pointerLock: boolean;
  readonly webAudio: boolean;
  readonly coarsePointer: boolean;
  readonly reducedMotionPreferred: boolean;
  readonly reasons: readonly string[];
}

const canCreateWebGLContext = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
};

export const detectSupport = (): SupportReport => {
  const webgl = canCreateWebGLContext();
  const pointerLock =
    'pointerLockElement' in document && 'requestPointerLock' in HTMLElement.prototype;
  const webAudio = 'AudioContext' in window || 'webkitAudioContext' in window;
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const reducedMotionPreferred =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const reasons: string[] = [];

  if (!webgl) reasons.push('WebGL is unavailable or disabled.');
  if (!pointerLock) reasons.push('Pointer Lock is unavailable.');
  if (!webAudio) reasons.push('Web Audio is unavailable; the experience would be silent.');
  if (coarsePointer) reasons.push('A desktop mouse and keyboard are required.');

  return { webgl, pointerLock, webAudio, coarsePointer, reducedMotionPreferred, reasons };
};

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
