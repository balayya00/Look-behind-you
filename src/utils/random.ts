export type RandomSource = () => number;

export const createSeededRandom = (seed: number): RandomSource => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
};

export const randomBetween = (random: RandomSource, minimum: number, maximum: number): number =>
  minimum + random() * (maximum - minimum);

export const choose = <T>(random: RandomSource, values: readonly T[]): T => {
  if (values.length === 0) throw new Error('Cannot choose from an empty collection.');
  return values[Math.floor(random() * values.length)] as T;
};
