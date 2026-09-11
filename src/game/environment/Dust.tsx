import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { BufferAttribute, BufferGeometry, PointsMaterial, type Points } from 'three';
import { useSettingsStore } from '../../stores/settingsStore';
import { createSeededRandom } from '../../utils/random';

export const Dust = (): React.JSX.Element | null => {
  const quality = useSettingsStore((state) => state.graphicsQuality);
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const points = useRef<Points>(null);
  const count = quality === 'high' ? 420 : quality === 'medium' ? 240 : 0;
  const geometry = useMemo(() => {
    const random = createSeededRandom(717);
    const values = new Float32Array(Math.max(1, count) * 3);
    for (let index = 0; index < count; index += 1) {
      values[index * 3] = -10 + random() * 20;
      values[index * 3 + 1] = 0.1 + random() * 3;
      values[index * 3 + 2] = -40 + random() * 62;
    }
    const result = new BufferGeometry();
    result.setAttribute('position', new BufferAttribute(values, 3));
    return result;
  }, [count]);
  const material = useMemo(
    () =>
      new PointsMaterial({
        color: '#b9c0b6',
        size: 0.018,
        transparent: true,
        opacity: 0.23,
        depthWrite: false,
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (points.current && !reducedMotion)
      points.current.position.y = Math.sin(clock.elapsedTime * 0.18) * 0.08;
  });

  if (count === 0) return null;
  return <points ref={points} geometry={geometry} material={material} />;
};
