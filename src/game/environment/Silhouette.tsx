import { useGameStore } from '../../stores/gameStore';
import { useEnvironmentMaterials } from './EnvironmentMaterials';

export const Silhouette = (): React.JSX.Element | null => {
  const visible = useGameStore((state) => state.worldMutations['silhouette-visible'] === true);
  const location = useGameStore((state) => state.worldMutations['silhouette-location']);
  const materials = useEnvironmentMaterials();
  if (!visible) return null;
  const position: [number, number, number] =
    location === 'lobby' ? [1.6, 0, 12.8] : [1.4, 0, -28.1];
  return (
    <group position={position}>
      <mesh position={[0, 1.63, 0]} material={materials.black}>
        <sphereGeometry args={[0.18, 8, 6]} />
      </mesh>
      <mesh position={[0, 0.93, 0]} material={materials.black}>
        <coneGeometry args={[0.34, 1.38, 6]} />
      </mesh>
    </group>
  );
};
