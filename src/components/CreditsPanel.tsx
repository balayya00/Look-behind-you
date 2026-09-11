export const CreditsPanel = ({ onClose }: { readonly onClose: () => void }): React.JSX.Element => (
  <section className="panel credits-panel" aria-labelledby="credits-title">
    <header className="panel-header">
      <div>
        <p className="eyebrow">OBSERVATION LOG</p>
        <h2 id="credits-title">Credits</h2>
      </div>
      <button className="icon-button" onClick={onClose} aria-label="Close credits">
        ×
      </button>
    </header>
    <div className="credits-copy">
      <p>
        Designed and built as an original browser experience. The clinic, props, signs, textures,
        story, and soundscape are generated from project-authored code; no copyrighted game assets
        are used.
      </p>
      <dl>
        <div>
          <dt>Rendering</dt>
          <dd>Three.js · React Three Fiber</dd>
        </div>
        <div>
          <dt>Audio</dt>
          <dd>Web Audio API procedural synthesis</dd>
        </div>
        <div>
          <dt>Interface</dt>
          <dd>React · TypeScript · CSS</dd>
        </div>
        <div>
          <dt>Type</dt>
          <dd>System typefaces, no remote font request</dd>
        </div>
      </dl>
      <p className="muted">Full resource and license details are maintained in ASSETS.md.</p>
    </div>
    <footer className="panel-footer">
      <button className="menu-button primary small" onClick={onClose}>
        CLOSE
      </button>
    </footer>
  </section>
);
