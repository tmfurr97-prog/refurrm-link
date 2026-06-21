import React from 'react';

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Unhandled UI error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <h1 className="text-lg font-semibold text-white">Application Error</h1>
            <p className="text-sm text-slate-400 mt-2">
              Something went wrong in the interface. Refresh and try again.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
