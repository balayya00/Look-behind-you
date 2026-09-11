export type PointerLockRequestResult = 'locked' | 'pending' | 'unsupported' | 'failed';

interface PointerLockOptions {
  readonly unadjustedMovement?: boolean;
}

type LockableElement = HTMLElement & {
  requestPointerLock(options?: PointerLockOptions): Promise<void> | void;
};

export const requestGamePointerLock = async (): Promise<PointerLockRequestResult> => {
  const canvas = document.querySelector('canvas');
  if (!(canvas instanceof HTMLElement) || !('requestPointerLock' in canvas)) return 'unsupported';
  if (document.pointerLockElement === canvas) return 'locked';
  const element = canvas as LockableElement;

  try {
    const result = element.requestPointerLock({ unadjustedMovement: true });
    if (result instanceof Promise) await result;
    return document.pointerLockElement === canvas ? 'locked' : 'pending';
  } catch (error) {
    if (error instanceof DOMException && error.name === 'NotSupportedError') {
      try {
        const fallback = element.requestPointerLock();
        if (fallback instanceof Promise) await fallback;
        return document.pointerLockElement === canvas ? 'locked' : 'pending';
      } catch {
        return 'failed';
      }
    }
    return 'failed';
  }
};
