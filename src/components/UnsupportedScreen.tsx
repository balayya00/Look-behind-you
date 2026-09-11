import type { SupportReport } from '../utils/support';

export const UnsupportedScreen = ({
  report,
}: {
  readonly report: SupportReport;
}): React.JSX.Element => (
  <main className="unsupported-screen">
    <div className="unsupported-card">
      <p className="eyebrow">DESKTOP OBSERVATION REQUIRED</p>
      <h1>This door will not open here.</h1>
      <p>
        Don't Look Behind You uses mouse capture, WebGL, and spatial audio. Open it in a current
        desktop Chrome, Edge, or Firefox browser with a keyboard and mouse.
      </p>
      <ul>
        {report.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
      <button className="menu-button" onClick={() => window.location.reload()}>
        CHECK AGAIN
      </button>
    </div>
  </main>
);
