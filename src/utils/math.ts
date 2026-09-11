export const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

export const lerp = (start: number, end: number, amount: number): number =>
  start + (end - start) * amount;

export const damp = (current: number, target: number, lambda: number, delta: number): number =>
  lerp(current, target, 1 - Math.exp(-lambda * delta));

export const normalizeAngle = (angle: number): number => {
  let result = angle % (Math.PI * 2);
  if (result > Math.PI) result -= Math.PI * 2;
  if (result < -Math.PI) result += Math.PI * 2;
  return result;
};

export const angleDistance = (first: number, second: number): number =>
  Math.abs(normalizeAngle(first - second));

export const distanceSquared2D = (
  firstX: number,
  firstZ: number,
  secondX: number,
  secondZ: number,
): number => {
  const x = firstX - secondX;
  const z = firstZ - secondZ;
  return x * x + z * z;
};
