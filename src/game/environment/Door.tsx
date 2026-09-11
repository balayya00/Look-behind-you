import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import type { DoorDefinition } from '../../types/level';
import { useGameStore } from '../../stores/gameStore';
import { damp } from '../../utils/math';
import { InteractionHitbox } from '../interactions/InteractionHitbox';
import { useEnvironmentMaterials } from './EnvironmentMaterials';
import { isDoorOpen } from './doorState';

export const Door = ({
  definition,
}: {
  readonly definition: DoorDefinition;
}): React.JSX.Element => {
  const materials = useEnvironmentMaterials();
  const stage = useGameStore((state) => state.stage);
  const explicitlyOpen = useGameStore((state) => state.openDoors);
  const leaf = useRef<Group>(null);
  const open = isDoorOpen(definition, stage, explicitlyOpen);

  useFrame((_, delta) => {
    if (leaf.current) {
      leaf.current.rotation.y = damp(leaf.current.rotation.y, open ? -1.34 : 0, 5.5, delta);
    }
  });

  return (
    <group position={definition.position} rotation={[0, definition.rotationY, 0]}>
      <mesh position={[-0.82, 0, 0]} material={materials.metal}>
        <boxGeometry args={[0.08, 3.08, 0.16]} />
      </mesh>
      <mesh position={[0.82, 0, 0]} material={materials.metal}>
        <boxGeometry args={[0.08, 3.08, 0.16]} />
      </mesh>
      <mesh position={[0, 1.5, 0]} material={materials.metal}>
        <boxGeometry args={[1.72, 0.08, 0.16]} />
      </mesh>
      <group ref={leaf} position={[-0.76, 0, 0]}>
        <group position={[0.76, 0, 0]}>
          <mesh
            castShadow
            receiveShadow
            material={definition.id === 'exit' ? materials.green : materials.wood}
          >
            <boxGeometry args={[1.52, 2.92, 0.11]} />
          </mesh>
          <mesh position={[0.48, -0.05, -0.075]} material={materials.rust}>
            <sphereGeometry args={[0.065, 10, 8]} />
          </mesh>
          <mesh position={[0, 0.82, -0.067]} material={materials.dark}>
            <boxGeometry args={[0.7, 0.22, 0.025]} />
          </mesh>
          {!open && <InteractionHitbox id={`door:${definition.id}`} scale={[1.55, 2.95, 0.18]} />}
        </group>
      </group>
    </group>
  );
};
