import type { PropDefinition } from '../../types/level';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useEnvironmentMaterials } from './EnvironmentMaterials';

interface ProceduralPropProps {
  readonly definition: PropDefinition;
}

export const ProceduralProp = ({ definition }: ProceduralPropProps): React.JSX.Element | null => {
  const materials = useEnvironmentMaterials();
  const quality = useSettingsStore((state) => state.graphicsQuality);
  const mutation = useGameStore((state) =>
    definition.mutationKey ? state.worldMutations[definition.mutationKey] : undefined,
  );
  const castShadow = quality !== 'low';
  const scale = definition.scale ?? 1;
  const position: [number, number, number] = [
    definition.position[0],
    definition.position[1],
    definition.position[2],
  ];

  if (definition.mutationKey === 'chair-state') {
    if (!mutation) return null;
    if (mutation === 2) {
      position[0] = 1.15;
      position[2] = -18.8;
    }
  }

  const common = {
    castShadow,
    receiveShadow: true,
  };

  const content = (() => {
    switch (definition.type) {
      case 'chair':
        return (
          <group>
            <mesh {...common} position={[0, 0.72, 0]} material={materials.wood}>
              <boxGeometry args={[0.72, 0.1, 0.72]} />
            </mesh>
            <mesh {...common} position={[0, 1.18, 0.32]} material={materials.wood}>
              <boxGeometry args={[0.72, 0.82, 0.09]} />
            </mesh>
            {([-0.27, 0.27] as const).flatMap((x) =>
              ([-0.27, 0.27] as const).map((z) => (
                <mesh
                  key={`${x}-${z}`}
                  {...common}
                  position={[x, 0.36, z]}
                  material={materials.rust}
                >
                  <boxGeometry args={[0.07, 0.7, 0.07]} />
                </mesh>
              )),
            )}
          </group>
        );
      case 'desk':
        return (
          <group>
            <mesh {...common} position={[0, 0.86, 0]} material={materials.wood}>
              <boxGeometry args={[1.9, 0.13, 0.82]} />
            </mesh>
            <mesh {...common} position={[-0.72, 0.43, 0]} material={materials.wood}>
              <boxGeometry args={[0.43, 0.78, 0.73]} />
            </mesh>
            <mesh {...common} position={[0.78, 0.42, 0]} material={materials.rust}>
              <boxGeometry args={[0.08, 0.78, 0.68]} />
            </mesh>
            {[0.22, 0.45, 0.68].map((y) => (
              <mesh key={y} position={[-0.72, y, -0.374]} material={materials.metal}>
                <boxGeometry args={[0.16, 0.025, 0.025]} />
              </mesh>
            ))}
          </group>
        );
      case 'cabinet':
        return (
          <group>
            <mesh {...common} position={[0, 0.85, 0]} material={materials.metal}>
              <boxGeometry args={[0.9, 1.7, 0.52]} />
            </mesh>
            {[0.3, 0.72, 1.14, 1.53].map((y) => (
              <group key={y}>
                <mesh position={[0, y, -0.271]} material={materials.dark}>
                  <boxGeometry args={[0.79, 0.025, 0.025]} />
                </mesh>
                <mesh position={[0, y + 0.09, -0.292]} material={materials.rust}>
                  <boxGeometry args={[0.22, 0.035, 0.035]} />
                </mesh>
              </group>
            ))}
          </group>
        );
      case 'locker':
        return (
          <group>
            <mesh {...common} position={[0, 1, 0]} material={materials.green}>
              <boxGeometry args={[0.72, 2, 0.58]} />
            </mesh>
            {[0.32, 0.43, 1.65, 1.76].map((y) => (
              <mesh key={y} position={[0, y, -0.301]} material={materials.black}>
                <boxGeometry args={[0.34, 0.025, 0.02]} />
              </mesh>
            ))}
            <mesh position={[0.22, 1.15, -0.32]} material={materials.rust}>
              <boxGeometry args={[0.035, 0.22, 0.035]} />
            </mesh>
          </group>
        );
      case 'stretcher':
        return (
          <group>
            <mesh {...common} position={[0, 0.78, 0]} material={materials.fabric}>
              <boxGeometry args={[0.86, 0.16, 2.2]} />
            </mesh>
            <mesh {...common} position={[0, 0.62, 0]} material={materials.metal}>
              <boxGeometry args={[0.95, 0.07, 2.3]} />
            </mesh>
            {([-0.38, 0.38] as const).flatMap((x) =>
              ([-0.9, 0.9] as const).map((z) => (
                <group key={`${x}-${z}`} position={[x, 0.3, z]}>
                  <mesh material={materials.metal}>
                    <cylinderGeometry args={[0.035, 0.035, 0.6, 8]} />
                  </mesh>
                  <mesh
                    rotation={[0, 0, Math.PI / 2]}
                    position={[0, -0.28, 0]}
                    material={materials.rubber}
                  >
                    <cylinderGeometry args={[0.09, 0.09, 0.035, 10]} />
                  </mesh>
                </group>
              )),
            )}
          </group>
        );
      case 'wheelchair':
        return (
          <group>
            <mesh {...common} position={[0, 0.64, 0]} material={materials.fabric}>
              <boxGeometry args={[0.62, 0.1, 0.58]} />
            </mesh>
            <mesh {...common} position={[0, 1.05, 0.25]} material={materials.fabric}>
              <boxGeometry args={[0.62, 0.72, 0.09]} />
            </mesh>
            {([-0.38, 0.38] as const).map((x) => (
              <mesh
                key={x}
                position={[x, 0.44, 0.05]}
                rotation={[0, Math.PI / 2, 0]}
                material={materials.rust}
              >
                <torusGeometry args={[0.42, 0.035, 8, 24]} />
              </mesh>
            ))}
            <mesh position={[0, 0.34, -0.35]} material={materials.metal}>
              <boxGeometry args={[0.72, 0.05, 0.05]} />
            </mesh>
          </group>
        );
      case 'box':
        return (
          <mesh {...common} position={[0, 0.32, 0]} material={materials.wood}>
            <boxGeometry args={[0.75, 0.64, 0.75]} />
          </mesh>
        );
      case 'pipe':
        return (
          <group>
            <mesh {...common} position={[0, 0, 0]} material={materials.rust}>
              <cylinderGeometry args={[0.09, 0.09, 3.2, 10]} />
            </mesh>
            {[0.7, -0.7].map((y) => (
              <mesh key={y} position={[0, y, 0]} material={materials.metal}>
                <torusGeometry args={[0.115, 0.025, 6, 14]} />
              </mesh>
            ))}
          </group>
        );
      case 'clock':
        return (
          <group>
            <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.black}>
              <cylinderGeometry args={[0.35, 0.35, 0.08, 24]} />
            </mesh>
            <mesh position={[0, 0, -0.045]} material={materials.paper}>
              <circleGeometry args={[0.29, 24]} />
            </mesh>
            <mesh
              position={[0.045, 0.04, -0.07]}
              rotation={[0, 0, -1.26]}
              material={materials.black}
            >
              <boxGeometry args={[0.025, 0.22, 0.02]} />
            </mesh>
            <mesh
              position={[-0.055, -0.015, -0.075]}
              rotation={[0, 0, 0.88]}
              material={materials.red}
            >
              <boxGeometry args={[0.014, 0.26, 0.014]} />
            </mesh>
          </group>
        );
      case 'bench':
        return (
          <group>
            <mesh {...common} position={[0, 0.53, 0]} material={materials.wood}>
              <boxGeometry args={[1.85, 0.1, 0.56]} />
            </mesh>
            <mesh {...common} position={[0, 0.9, 0.26]} material={materials.wood}>
              <boxGeometry args={[1.85, 0.55, 0.08]} />
            </mesh>
            {([-0.65, 0.65] as const).map((x) => (
              <mesh key={x} {...common} position={[x, 0.25, 0]} material={materials.rust}>
                <boxGeometry args={[0.07, 0.5, 0.4]} />
              </mesh>
            ))}
          </group>
        );
      case 'plant':
        return (
          <group>
            <mesh {...common} position={[0, 0.3, 0]} material={materials.concrete}>
              <cylinderGeometry args={[0.34, 0.25, 0.6, 10]} />
            </mesh>
            <mesh position={[0, 0.9, 0]} material={materials.black}>
              <cylinderGeometry args={[0.025, 0.045, 1.2, 6]} />
            </mesh>
            {[-0.7, 0, 0.65].map((rotation) => (
              <mesh
                key={rotation}
                position={[Math.sin(rotation) * 0.22, 1.25, Math.cos(rotation) * 0.18]}
                rotation={[0.4, rotation, 0.4]}
                material={materials.green}
              >
                <coneGeometry args={[0.18, 0.65, 6]} />
              </mesh>
            ))}
          </group>
        );
      default:
        return null;
    }
  })();

  return (
    <group position={position} rotation={[0, definition.rotationY ?? 0, 0]} scale={scale}>
      {content}
    </group>
  );
};
