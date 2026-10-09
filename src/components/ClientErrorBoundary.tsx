"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ClientErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Faza] ClientErrorBoundary caught translation/DOM error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div
          translate="no"
          className="notranslate"
          style={{
            margin: "2rem auto",
            maxWidth: 520,
            padding: "1.5rem",
            background: "var(--surface, #0E131B)",
            border: "1px solid var(--border, #1E2532)",
            borderRadius: "var(--radius-card, 12px)",
            textAlign: "center",
          }}
        >
          <p style={{ color: "var(--ink, #F4F6FA)", fontWeight: 600, marginBottom: "0.5rem" }}>
            A display issue occurred while rendering this view.
          </p>
          <p style={{ color: "var(--muted, #7E8B9F)", fontSize: "0.82rem", marginBottom: "1rem" }}>
            If browser auto-translation altered page elements, refreshing or resetting translation may resolve it.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              background: "var(--accent, #2EE6A6)",
              color: "#050B14",
              border: "none",
              borderRadius: "var(--radius-btn, 8px)",
              padding: "0.45rem 1.1rem",
              fontSize: "0.8rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
