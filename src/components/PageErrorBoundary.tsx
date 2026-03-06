"use client";

import React from "react";

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  logoUrl?: string;
  appName?: string;
}

interface PageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class PageErrorBoundary extends React.Component<
  PageErrorBoundaryProps,
  PageErrorBoundaryState
> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === "development";
      const appName = this.props.appName || "MuseKit";

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8 bg-background text-foreground">
          <div className="text-center max-w-lg">
            {this.props.logoUrl ? (
              <img
                src={this.props.logoUrl}
                alt={appName}
                className="h-10 mx-auto mb-6"
              />
            ) : (
              <p className="text-lg font-bold text-primary mb-6">{appName}</p>
            )}
            <h1 className="text-2xl font-bold mb-2">
              {this.props.fallbackTitle || "Something went wrong"}
            </h1>
            <p className="text-muted-foreground mb-6">
              An unexpected error occurred. Please try again.
            </p>
            {isDev && this.state.error && (
              <pre className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 p-4 rounded-lg text-xs text-left overflow-auto mb-6 whitespace-pre-wrap break-words border border-red-200 dark:border-red-800">
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
              <a
                href="/"
                className="px-6 py-2 bg-muted text-foreground border border-border rounded-md font-medium hover:bg-muted/80 transition-colors no-underline"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
