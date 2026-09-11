import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from 'react';

interface GameErrorBoundaryProps extends PropsWithChildren {
  readonly onError?: (message: string) => void;
}

interface GameErrorBoundaryState {
  readonly error: Error | null;
}

export class GameErrorBoundary extends Component<GameErrorBoundaryProps, GameErrorBoundaryState> {
  public override state: GameErrorBoundaryState = { error: null };

  public static getDerivedStateFromError(error: Error): GameErrorBoundaryState {
    return { error };
  }

  public override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Game rendering failed', error, info.componentStack);
    this.props.onError?.(error.message);
  }

  public override render(): ReactNode {
    if (!this.state.error) return this.props.children;
    return (
      <section className="fatal-screen" role="alert">
        <p className="eyebrow">THE BUILDING WENT DARK</p>
        <h1>Rendering failed.</h1>
        <p>Your progress is stored locally. Reload to try restoring the graphics context.</p>
        <button className="menu-button primary" onClick={() => window.location.reload()}>
          RELOAD
        </button>
        <details>
          <summary>Technical detail</summary>
          <code>{this.state.error.message}</code>
        </details>
      </section>
    );
  }
}
