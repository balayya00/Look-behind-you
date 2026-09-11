export interface RuntimePosition {
  x: number;
  y: number;
  z: number;
}

export interface RuntimeSnapshot {
  readonly position: RuntimePosition;
  yaw: number;
  pitch: number;
  speed: number;
  grounded: boolean;
  currentZone: string | null;
  previousZone: string | null;
}

export const playerRuntime: RuntimeSnapshot = {
  position: { x: 0, y: 1.68, z: 18 },
  yaw: 0,
  pitch: 0,
  speed: 0,
  grounded: true,
  currentZone: 'lobby',
  previousZone: null,
};

export const resetPlayerRuntime = (x: number, z: number, yaw: number): void => {
  playerRuntime.position.x = x;
  playerRuntime.position.y = 1.68;
  playerRuntime.position.z = z;
  playerRuntime.yaw = yaw;
  playerRuntime.pitch = 0;
  playerRuntime.speed = 0;
  playerRuntime.grounded = true;
  playerRuntime.currentZone = null;
  playerRuntime.previousZone = null;
};
