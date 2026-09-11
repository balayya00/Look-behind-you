import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import type { Mesh, PointLight } from 'three';
import { Color, MeshStandardMaterial } from 'three';
import { useGameStore } from '../../stores/gameStore';
import { isStageAtLeast } from '../systems/progression';
import { useEnvironmentMaterials } from '../environment/EnvironmentMaterials';

interface FixtureProps {
  readonly position: readonly [number, number, number];
  readonly index: number;
  readonly powered: boolean;
  readonly realLight: boolean;
}

const FlickerFixture = ({
  position,
  index,
  powered,
  realLight,
}: FixtureProps): React.JSX.Element => {
  const light = useRef<PointLight>(null);
  const panel = useRef<Mesh>(null);
  const phase = useMemo(() => index * 19.17 + 2.4, [index]);
  const emissiveMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#c7ccc2',
        emissive: new Color('#b7c6b6'),
        emissiveIntensity: 0,
        roughness: 0.55,
      }),
    [],
  );

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const rareDrop = Math.sin(time * 1.7 + phase) > 0.992;
    const flutter = index === 4 && Math.sin(time * 28) > 0.72;
    const value = powered && !rareDrop && !flutter ? 1 : powered ? 0.07 : index === 0 ? 0.16 : 0;
    emissiveMaterial.emissiveIntensity = value * 1.7;
    if (light.current) light.current.intensity = value * 0.82;
  });

  return (
    <group position={position}>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[1.25, 0.08, 0.27]} />
        <meshStandardMaterial color="#353b38" roughness={0.62} metalness={0.4} />
      </mesh>
      <mesh ref={panel} position={[0, -0.025, 0]} material={emissiveMaterial}>
        <boxGeometry args={[1.08, 0.035, 0.13]} />
      </mesh>
      {realLight && (
        <pointLight ref={light} position={[0, -0.32, 0]} color="#c2d2c4" distance={8.5} decay={2} />
      )}
    </group>
  );
};

const fixturePositions: readonly (readonly [number, number, number])[] = [
  [0, 3.15, 18],
  [0, 3.15, 9],
  [0, 3.15, 0],
  [0, 3.15, -9],
  [0, 3.15, -18],
  [0, 3.15, -26],
  [0, 3.15, -34],
  [-6.5, 3.15, 5],
  [6.7, 3.15, 7],
  [-6.5, 3.15, -22],
  [7, 3.15, -17],
  [7, 3.15, -33],
];

export const PracticalLights = (): React.JSX.Element => {
  const materials = useEnvironmentMaterials();
  const stage = useGameStore((state) => state.stage);
  const forcedOut = useGameStore((state) => state.worldMutations['north-lights-out'] === true);
  const powered = isStageAtLeast(stage, 'power-restored');

  return (
    <group>
      {fixturePositions.map((position, index) => (
        <FlickerFixture
          key={`${position[0]}-${position[2]}`}
          position={position}
          index={index}
          powered={powered && !(forcedOut && index >= 4)}
          realLight={index % 2 === 0 || index >= 8}
        />
      ))}
      {[7, -7].map((x) => (
        <group key={x} position={[x, 2.35, 22.9]}>
          <mesh material={materials.glass}>
            <boxGeometry args={[3.3, 1.4, 0.08]} />
          </mesh>
          <mesh material={materials.metal}>
            <boxGeometry args={[0.06, 1.5, 0.13]} />
          </mesh>
          <mesh material={materials.metal}>
            <boxGeometry args={[3.4, 0.06, 0.13]} />
          </mesh>
        </group>
      ))}
      <pointLight
        position={[0, 2.2, -36.5]}
        color="#7b1715"
        intensity={0.5}
        distance={7}
        decay={2}
      />
      <pointLight position={[-6, 2.2, 18]} color="#182f33" intensity={3.2} distance={8} decay={2} />
    </group>
  );
};
