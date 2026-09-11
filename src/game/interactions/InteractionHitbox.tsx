import type { ThreeElements } from '@react-three/fiber';
import type { Mesh } from 'three';

interface InteractionHitboxProps {
  readonly id: string;
  readonly position?: ThreeElements['mesh']['position'];
  readonly rotation?: ThreeElements['mesh']['rotation'];
  readonly scale?: ThreeElements['mesh']['scale'];
}

export const InteractionHitbox = ({
  id,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
}: InteractionHitboxProps): React.JSX.Element => {
  const setLayer = (mesh: Mesh | null): void => mesh?.layers.set(2);
  return (
    <mesh
      ref={setLayer}
      position={position}
      rotation={rotation}
      scale={scale}
      userData={{ interactionId: id }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial transparent opacity={0.001} depthWrite={false} colorWrite={false} />
    </mesh>
  );
};
