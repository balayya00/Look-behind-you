interface LoadingScreenProps {
  readonly progress: number;
}

const phaseLabel = (progress: number): string => {
  if (progress < 30) return 'Checking the dark';
  if (progress < 55) return 'Restoring observation records';
  if (progress < 90) return 'Generating the building';
  return 'Listening';
};

export const LoadingScreen = ({ progress }: LoadingScreenProps): React.JSX.Element => (
  <section className={`loading-screen ${progress >= 100 ? 'is-complete' : ''}`} aria-live="polite">
    <div className="loading-mark" aria-hidden="true">
      <span />
    </div>
    <div className="loading-content">
      <p className="eyebrow">A HALCYON ANNEX OBSERVATION</p>
      <h1>
        <span>DON'T LOOK</span>
        <span>BEHIND YOU</span>
      </h1>
      <div className="loading-progress" aria-label={`Loading ${Math.round(progress)} percent`}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="loading-meta">
        <span>{phaseLabel(progress)}</span>
        <span>{Math.round(progress).toString().padStart(2, '0')}%</span>
      </div>
      <blockquote>“Whatever you hear… don't turn around.”</blockquote>
    </div>
  </section>
);
