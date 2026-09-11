import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { GameErrorBoundary } from './app/GameErrorBoundary';
import { CompletionScreen } from './components/CompletionScreen';
import { EndingSequence } from './components/EndingSequence';
import { HUD } from './components/HUD';
import { IntroOverlay } from './components/IntroOverlay';
import { LoadingScreen } from './components/LoadingScreen';
import { MainMenu } from './components/MainMenu';
import { NoteOverlay } from './components/NoteOverlay';
import { PauseMenu } from './components/PauseMenu';
import { UnsupportedScreen } from './components/UnsupportedScreen';
import { useGameStore } from './stores/gameStore';
import { useSettingsStore } from './stores/settingsStore';
import { detectSupport, type SupportReport } from './utils/support';

const GameCanvas = lazy(() => import('./scenes/GameCanvas'));

export const App = (): React.JSX.Element => {
  const [support, setSupport] = useState<SupportReport | null>(null);
  const [progress, setProgress] = useState(8);
  const ready = useRef(false);
  const finishTimer = useRef<number | null>(null);
  const phase = useGameStore((state) => state.phase);
  const fatalError = useGameStore((state) => state.fatalError);
  const finishLoading = useGameStore((state) => state.finishLoading);
  const brightness = useSettingsStore((state) => state.brightness);
  const applyReducedMotion = useSettingsStore((state) => state.applyReducedMotionPreference);

  useEffect(() => {
    setProgress(22);
    const report = detectSupport();
    setSupport(report);
    setProgress(48);
    if (report.reducedMotionPreferred) applyReducedMotion();
    const frame = window.requestAnimationFrame(() => setProgress(62));
    return () => window.cancelAnimationFrame(frame);
  }, [applyReducedMotion]);

  useEffect(
    () => () => {
      if (finishTimer.current !== null) window.clearTimeout(finishTimer.current);
    },
    [],
  );

  const onSceneReady = useCallback(() => {
    if (ready.current) return;
    ready.current = true;
    setProgress(100);
    finishTimer.current = window.setTimeout(finishLoading, 520);
  }, [finishLoading]);

  const criticalUnsupported =
    support !== null &&
    (!support.webgl || !support.pointerLock || !support.webAudio || support.coarsePointer);
  if (criticalUnsupported) return <UnsupportedScreen report={support} />;

  if (fatalError) {
    return (
      <section className="fatal-screen" role="alert">
        <p className="eyebrow">SIGNAL LOST</p>
        <h1>The observation ended unexpectedly.</h1>
        <p>{fatalError}</p>
        <button className="menu-button primary" onClick={() => window.location.reload()}>
          RELOAD
        </button>
      </section>
    );
  }

  return (
    <GameErrorBoundary onError={(message) => useGameStore.getState().setFatalError(message)}>
      <div className={`app phase-${phase}`}>
        {support && (
          <div
            className="canvas-shell"
            style={{ '--game-brightness': brightness } as React.CSSProperties}
          >
            <Suspense fallback={null}>
              <GameCanvas onReady={onSceneReady} />
            </Suspense>
          </div>
        )}
        <div className="film-layer" aria-hidden="true" />
        {phase === 'loading' && <LoadingScreen progress={progress} />}
        {phase === 'menu' && <MainMenu />}
        {phase === 'intro' && <IntroOverlay />}
        {phase === 'playing' && <HUD />}
        {phase === 'paused' && <PauseMenu />}
        {phase === 'reading' && <NoteOverlay />}
        {phase === 'ending' && <EndingSequence />}
        {phase === 'complete' && <CompletionScreen />}
      </div>
    </GameErrorBoundary>
  );
};
