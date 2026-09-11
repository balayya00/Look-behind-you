import { LEVEL_DOORS, LEVEL_PROPS, LEVEL_SIGNS, LEVEL_WALLS } from '../../data/level';
import { useSettingsStore } from '../../stores/settingsStore';
import { Door } from './Door';
import { Dust } from './Dust';
import { EnvironmentMaterials, useEnvironmentMaterials } from './EnvironmentMaterials';
import { InteractiveObjects } from './InteractiveObjects';
import { ProceduralProp } from './ProceduralProp';
import { Sign } from './Sign';
import { Silhouette } from './Silhouette';
import { PracticalLights } from '../lighting/PracticalLights';

const DEBRIS_PAPERS: readonly (readonly [number, number, number])[] = [
  [-1.1, 6.4, 0.2],
  [0.7, -5.6, -0.35],
  [-0.6, -13.1, 0.65],
  [0.9, -25.5, 0.1],
  [-4.8, 19.2, -0.4],
];

const Architecture = (): React.JSX.Element => {
  const materials = useEnvironmentMaterials();
  const quality = useSettingsStore((state) => state.graphicsQuality);
  const shadows = quality !== 'low';
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, -8.5]}
        receiveShadow
        material={materials.floor}
      >
        <planeGeometry args={[22.5, 65]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 3.3, -8.5]} material={materials.ceiling}>
        <planeGeometry args={[22.5, 65]} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.008, -12]}
        receiveShadow
        material={materials.floorTile}
      >
        <planeGeometry args={[4.25, 50]} />
      </mesh>
      {LEVEL_WALLS.map((entry) => (
        <mesh
          key={entry.id}
          position={entry.position}
          castShadow={shadows}
          receiveShadow
          material={materials[entry.material ?? 'paint']}
        >
          <boxGeometry args={entry.size} />
        </mesh>
      ))}
      {LEVEL_DOORS.map((entry) => (
        <Door key={entry.id} definition={entry} />
      ))}
      {LEVEL_PROPS.map((entry) => (
        <ProceduralProp key={entry.id} definition={entry} />
      ))}
      {LEVEL_SIGNS.map((entry) => (
        <Sign key={entry.id} definition={entry} />
      ))}
      <InteractiveObjects />
      <PracticalLights />
      <Dust />
      <Silhouette />

      {/* Scattered paper/debris provides scale and a lived-in silhouette without extra assets. */}
      {DEBRIS_PAPERS.map(([x, z, rotation], index) => (
        <mesh
          key={index}
          position={[x, 0.018, z]}
          rotation={[-Math.PI / 2, 0, rotation]}
          material={materials.paper}
        >
          <planeGeometry args={[0.34 + (index % 2) * 0.12, 0.48]} />
        </mesh>
      ))}
      <mesh position={[-10.95, 1.2, -24]} rotation={[0, Math.PI / 2, 0]} material={materials.red}>
        <circleGeometry args={[0.42, 18, 0, Math.PI * 1.55]} />
      </mesh>
    </group>
  );
};

export const Building = (): React.JSX.Element => (
  <EnvironmentMaterials>
    <Architecture />
  </EnvironmentMaterials>
);
