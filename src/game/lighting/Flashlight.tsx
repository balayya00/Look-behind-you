import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import type { Group, Object3D, SpotLight } from 'three';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { flashlightIntensityForBattery } from '../systems/battery';

export const Flashlight = (): React.JSX.Element => {
  const flashlightOn = useGameStore((state) => state.flashlightOn);
  const battery = useGameStore((state) => state.battery);
  const quality = useSettingsStore((state) => state.graphicsQuality);
  const group = useRef<Group>(null);
  const light = useRef<SpotLight>(null);
  const target = useRef<Object3D>(null);
  const seed = useMemo(() => Math.random() * 100, []);

  useEffect(() => {
    if (light.current && target.current) light.current.target = target.current;
  }, []);

  useFrame(({ camera, clock }) => {
    if (!group.current || !light.current) return;
    group.current.position.copy(camera.position);
    group.current.quaternion.copy(camera.quaternion);
    const low = battery < 20;
    const irregular = Math.sin(clock.elapsedTime * 37 + seed) * Math.sin(clock.elapsedTime * 11.3);
    const flicker = low && irregular > 0.72 ? 0.25 : 1;
    light.current.intensity = flashlightOn ? flashlightIntensityForBattery(battery) * flicker : 0;
  });

  return (
    <group ref={group}>
      <spotLight
        ref={light}
        position={[0.08, -0.08, 0]}
        color="#d7dfcf"
        angle={0.36}
        penumbra={0.72}
        distance={quality === 'low' ? 13 : 17}
        decay={1.65}
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 1024 : 512}
        shadow-mapSize-height={quality === 'high' ? 1024 : 512}
        shadow-camera-near={0.15}
        shadow-camera-far={18}
        shadow-bias={-0.0008}
      />
      <object3D ref={target} position={[0, -0.02, -8]} />
      <pointLight
        position={[0, -0.08, -0.2]}
        color="#cad3c7"
        intensity={flashlightOn ? 4.5 : 0}
        distance={4.2}
      />
    </group>
  );
};
