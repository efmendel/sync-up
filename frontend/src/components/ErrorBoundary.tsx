'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="max-w-md mx-auto p-8">
            <div className="card-modern p-12 text-center">
              <div className="text-6xl mb-6">🎵💔</div>
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Something went wrong
              </h2>
              <p className="text-slate-600 mb-6">
                We're sorry, but something unexpected happened. Please try refreshing the page.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 py-3 rounded-xl transition-all duration-200"
                >
                  Try Again
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-slate-500 mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-red-600 bg-red-50 p-4 rounded-lg overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;