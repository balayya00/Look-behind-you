import { useEffect, useState } from 'react';
import { useGameStore } from '../stores/gameStore';
import { audioEngine } from '../game/audio/AudioEngine';

export const EndingSequence = (): React.JSX.Element => {
  const [beat, setBeat] = useState(0);
  const looks = useGameStore((state) => state.lookBehindCount);
  const complete = useGameStore((state) => state.completeGame);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setBeat(1), 900),
      window.setTimeout(() => setBeat(2), 3000),
      window.setTimeout(() => {
        setBeat(3);
        audioEngine.playImpact({ x: 0, y: 1, z: -37 }, 0.45);
      }, 5000),
      window.setTimeout(() => {
        setBeat(4);
        audioEngine.playBreathing({ x: 0, y: 1.6, z: -35.5 });
      }, 7200),
      window.setTimeout(complete, 10_500),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [complete]);

  return (
    <section className={`ending-sequence beat-${beat}`}>
      {beat === 1 && <p className="ending-line">YOU MADE IT OUT.</p>}
      {beat === 2 && <p className="ending-line correction">NO. THAT IS NOT WHAT THE CAMERA SAW.</p>}
      {beat === 3 && (
        <div className="camera-feed">
          <header>
            <span>CAM 04 · NORTH HALL</span>
            <b>● REC</b>
          </header>
          <div className="feed-image">
            <i className="feed-door" />
            <i className="feed-person" />
            <div className="scanlines" />
          </div>
          <footer>
            <span>03:17:42</span>
            <span>SUBJECT STATUS: STILL INSIDE</span>
          </footer>
        </div>
      )}
      {beat >= 4 && (
        <div className="ending-final">
          <p>THE CAMERA COUNTED</p>
          <strong>{looks}</strong>
          <p>{looks === 1 ? 'TIME YOU LOOKED BEHIND YOU.' : 'TIMES YOU LOOKED BEHIND YOU.'}</p>
          <small>It was never standing where you looked.</small>
        </div>
      )}
    </section>
  );
};
