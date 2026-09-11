import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { useEffect, useRef } from 'react';
import { ACESFilmicToneMapping, Color, PCFSoftShadowMap, SRGBColorSpace, Vector3 } from 'three';
import { useGameStore } from '../stores/gameStore';
import { useSettingsStore } from '../stores/settingsStore';
import { Building } from '../game/environment';
import { PlayerController } from '../game/player/PlayerController';
import { HorrorDirector } from '../game/events/HorrorDirector';
import { AudioBridge } from '../game/audio/AudioBridge';

interface GameCanvasProps {
  readonly onReady: () => void;
}

const SceneReady = ({ onReady }: GameCanvasProps): null => {
  const called = useRef(false);
  useFrame(() => {
    if (!called.current) {
      called.current = true;
      onReady();
    }
  });
  return null;
};

const ContextGuard = (): null => {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const onLost = (event: Event): void => {
      event.preventDefault();
      useGameStore
        .getState()
        .setFatalError('The graphics context was lost. Reload the page to return to the building.');
    };
    canvas.addEventListener('webglcontextlost', onLost);
    return () => canvas.removeEventListener('webglcontextlost', onLost);
  }, [gl]);
  return null;
};

const MenuCamera = (): null => {
  const target = useRef(new Vector3(0, 1.45, 13));
  useFrame(({ camera, clock }) => {
    const phase = useGameStore.getState().phase;
    if (phase !== 'menu' && phase !== 'loading') return;
    const time = clock.elapsedTime;
    camera.position.set(
      4.8 + Math.sin(time * 0.09) * 0.18,
      1.58,
      20.8 + Math.sin(time * 0.07) * 0.12,
    );
    target.current.set(0.2 + Math.sin(time * 0.06) * 0.25, 1.45, 13);
    camera.lookAt(target.current);
  }, -3);
  return null;
};

const AdaptivePerformance = (): React.JSX.Element => {
  const adjusted = useRef(false);
  return (
    <PerformanceMonitor
      flipflops={2}
      onDecline={() => {
        if (adjusted.current) return;
        const settings = useSettingsStore.getState();
        if (settings.graphicsQuality === 'high') settings.setGraphicsQuality('medium');
        else if (settings.graphicsQuality === 'medium') settings.setGraphicsQuality('low');
        else return;
        adjusted.current = true;
        useGameStore
          .getState()
          .notify('Graphics quality adjusted to keep movement smooth.', 'normal');
      }}
    />
  );
};

const Scene = ({ onReady }: GameCanvasProps): React.JSX.Element => (
  <>
    <color attach="background" args={['#050707']} />
    <fogExp2 attach="fog" args={['#101614', 0.038]} />
    <hemisphereLight args={['#71807a', '#11120f', 0.38]} />
    <directionalLight position={[-5, 9, 15]} color="#71858a" intensity={0.27} />
    <Building />
    <PlayerController />
    <HorrorDirector />
    <AudioBridge />
    <MenuCamera />
    <AdaptivePerformance />
    <ContextGuard />
    <SceneReady onReady={onReady} />
  </>
);

export const GameCanvas = ({ onReady }: GameCanvasProps): React.JSX.Element => {
  const quality = useSettingsStore((state) => state.graphicsQuality);
  const dpr = quality === 'low' ? 1 : quality === 'medium' ? 1.35 : 1.75;
  return (
    <Canvas
      camera={{ fov: 68, near: 0.08, far: 80, position: [0, 1.67, 18] }}
      dpr={dpr}
      shadows={quality !== 'low'}
      frameloop="always"
      gl={{
        antialias: quality !== 'low',
        powerPreference: 'high-performance',
        alpha: false,
      }}
      onCreated={({ gl, scene }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1;
        gl.shadowMap.enabled = quality !== 'low';
        gl.shadowMap.type = PCFSoftShadowMap;
        scene.background = new Color('#050707');
      }}
    >
      <Scene onReady={onReady} />
    </Canvas>
  );
};

export default GameCanvas;
