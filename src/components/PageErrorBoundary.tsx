"use client";

import React from "react";

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
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

      return (
        <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ textAlign: "center", maxWidth: "480px" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              An unexpected error occurred. Please try again.
            </p>
            {isDev && this.state.error && (
              <pre style={{
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "1rem",
                borderRadius: "0.5rem",
                fontSize: "0.8rem",
                textAlign: "left",
                overflow: "auto",
                marginBottom: "1.5rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}>
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            )}
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: "0.5rem 1.5rem",
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  borderRadius: "0.375rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Try Again
              </button>
              <a
                href="/"
                style={{
                  padding: "0.5rem 1.5rem",
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  fontWeight: 500,
                }}
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
