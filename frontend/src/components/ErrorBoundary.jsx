import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md card-glass rounded-[32px] p-8 md:p-10 text-center shadow-2xl glow-border">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-rose-500" size={28} />
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight mb-2">Application Crash</h2>
            <p className="text-sm text-[var(--text-muted)] font-medium mb-6">
              A runtime rendering error has occurred. We have isolated the crash to preserve user session security.
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/5 text-left text-xs font-mono text-rose-400 overflow-x-auto max-h-32 text-center select-all">
                {this.state.error.toString()}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover-lift"
            >
              <RefreshCw size={16} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
