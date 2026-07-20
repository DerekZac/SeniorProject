import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { logger } from '../lib/logger';

interface Props { children: ReactNode; }
interface State { error: Error | null; }

/**
 * Catches render-time exceptions anywhere in the tree and shows a branded
 * fallback instead of a blank white screen — so a bad API payload or a chart
 * error never takes down the whole app mid-demo.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }): void {
    logger.error('app', 'Uncaught render error', { message: error.message, componentStack: info.componentStack });
  }

  private reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div style={{ minHeight: 'calc(100vh - 3.5rem)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '2.5rem 2rem', width: '100%', maxWidth: '26rem', textAlign: 'center' }}>
          <AlertTriangle size={30} style={{ color: '#FF3355', margin: '0 auto 1rem' }} />
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-strong)', marginBottom: '0.5rem' }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            An unexpected error interrupted this page. Your saved data is safe — try again or head back home.
          </p>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button onClick={this.reset} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#F7931A', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7rem 1rem', fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <RotateCcw size={15} /> Try again
            </button>
            <a href={import.meta.env.BASE_URL} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.7rem 1rem', fontSize: '0.9375rem', textDecoration: 'none' }}>
              <Home size={15} /> Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
