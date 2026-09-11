import { useGameStore } from '../../stores/gameStore';
import { isStageAtLeast } from '../systems/progression';
import { InteractionHitbox } from '../interactions/InteractionHitbox';
import { useEnvironmentMaterials } from './EnvironmentMaterials';

const Paper = ({
  id,
  position,
  rotation = [0, 0, 0],
}: {
  readonly id: string;
  readonly position: readonly [number, number, number];
  readonly rotation?: readonly [number, number, number];
}): React.JSX.Element => {
  const materials = useEnvironmentMaterials();
  return (
    <group position={position} rotation={rotation}>
      <mesh material={materials.paper} castShadow>
        <boxGeometry args={[0.38, 0.008, 0.5]} />
      </mesh>
      <mesh position={[0, 0.009, -0.05]} material={materials.black}>
        <boxGeometry args={[0.25, 0.003, 0.015]} />
      </mesh>
      <InteractionHitbox id={id} position={[0, 0.05, 0]} scale={[0.55, 0.2, 0.65]} />
    </group>
  );
};

const Battery = ({
  id,
  position,
}: {
  readonly id: string;
  readonly position: readonly [number, number, number];
}): React.JSX.Element | null => {
  const materials = useEnvironmentMaterials();
  const collected = useGameStore((state) => state.triggeredEvents.includes(id));
  if (collected) return null;
  return (
    <group position={position}>
      <mesh material={materials.red} castShadow>
        <cylinderGeometry args={[0.105, 0.105, 0.42, 12]} />
      </mesh>
      <mesh position={[0, 0.22, 0]} material={materials.metal}>
        <cylinderGeometry args={[0.055, 0.055, 0.025, 10]} />
      </mesh>
      <InteractionHitbox id={id} scale={[0.4, 0.65, 0.4]} />
    </group>
  );
};

export const InteractiveObjects = (): React.JSX.Element => {
  const materials = useEnvironmentMaterials();
  const stage = useGameStore((state) => state.stage);
  const fuseCollected = useGameStore((state) => state.triggeredEvents.includes('fuse-collected'));
  const keyCollected = useGameStore((state) => state.triggeredEvents.includes('security-key'));

  return (
    <group>
      <group position={[10.94, 1.55, 7]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh material={materials.metal} castShadow>
          <boxGeometry args={[0.86, 1.25, 0.13]} />
        </mesh>
        {[0.25, 0, -0.25].map((x, index) => (
          <mesh
            key={x}
            position={[x, 0.18, -0.09]}
            material={index === 2 && stage === 'arrival' ? materials.black : materials.rust}
          >
            <boxGeometry args={[0.13, 0.42, 0.08]} />
          </mesh>
        ))}
        <InteractionHitbox id="breaker" position={[0, 0, -0.1]} scale={[1, 1.4, 0.4]} />
      </group>

      {stage === 'fuse-needed' && !fuseCollected && (
        <group position={[-8.3, 0.88, 7.8]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={materials.paper} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.32, 12]} />
          </mesh>
          <mesh position={[0, 0.17, 0]} material={materials.metal}>
            <cylinderGeometry args={[0.085, 0.085, 0.035, 12]} />
          </mesh>
          <mesh position={[0, -0.17, 0]} material={materials.metal}>
            <cylinderGeometry args={[0.085, 0.085, 0.035, 12]} />
          </mesh>
          <InteractionHitbox id="fuse" scale={[0.5, 0.5, 0.5]} />
        </group>
      )}

      {isStageAtLeast(stage, 'power-restored') && (
        <group position={[-6.5, 0.94, -25.2]} rotation={[0, 0.1, 0]}>
          <mesh material={materials.red} castShadow>
            <boxGeometry args={[0.54, 0.08, 0.72]} />
          </mesh>
          <mesh position={[0, 0.05, 0]} material={materials.paper}>
            <boxGeometry args={[0.38, 0.02, 0.2]} />
          </mesh>
          <InteractionHitbox id="records-file" position={[0, 0.1, 0]} scale={[0.8, 0.35, 0.95]} />
        </group>
      )}

      {isStageAtLeast(stage, 'patient-note-read') && !keyCollected && (
        <group position={[9.7, 0.88, -34.8]} rotation={[0, 0, Math.PI / 2]}>
          <mesh material={materials.rust} castShadow>
            <torusGeometry args={[0.11, 0.025, 8, 16]} />
          </mesh>
          <mesh position={[0, -0.17, 0]} material={materials.rust}>
            <boxGeometry args={[0.045, 0.25, 0.035]} />
          </mesh>
          <InteractionHitbox id="security-key" scale={[0.55, 0.7, 0.45]} />
        </group>
      )}

      <Battery id="battery-a" position={[-8.8, 0.78, 1.1]} />
      <Battery id="battery-b" position={[-9.7, 1.35, -11.8]} />
      <Paper id="note-reception" position={[-5.25, 0.94, 14.6]} rotation={[0, -0.25, 0]} />
      <Paper id="note-office" position={[7.25, 0.95, -5.3]} rotation={[0, 0.8, 0]} />
      <Paper id="note-washroom" position={[-10.95, 1.2, -10.2]} rotation={[0, 0, Math.PI / 2]} />
      <Paper id="note-patient" position={[7.55, 0.18, -35.1]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  );
};
