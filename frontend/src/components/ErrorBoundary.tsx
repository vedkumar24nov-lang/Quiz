import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  info: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, info: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary] caught render error:', error, info);
  }

  reset = () => this.setState({ error: null, info: null });

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-lg font-bold text-red-900 mb-2">Page crashed</h1>
          <p className="text-sm text-red-800 mb-4">
            The component threw an error while rendering. The full stack is below — also in the browser console.
          </p>
          <pre className="text-xs bg-white border border-red-200 rounded p-3 overflow-auto max-h-64 whitespace-pre-wrap text-red-900 font-mono">
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          {this.state.info && (
            <pre className="mt-2 text-[11px] bg-white border border-red-200 rounded p-3 overflow-auto max-h-48 whitespace-pre-wrap text-red-700 font-mono">
              {this.state.info.componentStack}
            </pre>
          )}
          <button
            onClick={this.reset}
            className="mt-4 inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700 focus-ring"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
}
