"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FazaLogo } from "@/components/FazaLogo";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Faza] App error:", error);
  }, [error]);

  return (
    <div
      style={{
        maxWidth: 540,
        margin: "0 auto",
        padding: "4rem 1.5rem",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.25rem",
      }}
    >
      <FazaLogo size={36} showText={true} />

      <div
        style={{
          background: "rgba(255, 73, 74, 0.08)",
          border: "1px solid rgba(255, 73, 74, 0.25)",
          borderRadius: "var(--radius-card)",
          padding: "1.75rem 1.5rem",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 800,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--danger)",
          }}
        >
          Something went wrong
        </span>

        <h2
          className="display"
          style={{
            fontSize: "1.3rem",
            fontWeight: 700,
            color: "var(--ink)",
            margin: 0,
          }}
        >
          Unable to load this page
        </h2>

        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--muted)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          An unexpected error occurred while rendering this route. Please try refreshing or return to the main feed.
        </p>

        {error?.digest && (
          <p
            className="mono"
            style={{
              fontSize: "0.7rem",
              color: "var(--subtle)",
              margin: 0,
            }}
          >
            Error reference: {error.digest}
          </p>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            marginTop: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => reset()}
            style={{
              background: "var(--accent)",
              color: "#050B14",
              border: "none",
              borderRadius: "var(--radius-btn)",
              padding: "0.5rem 1.25rem",
              fontSize: "0.82rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            style={{
              background: "var(--surface)",
              color: "var(--ink)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-btn)",
              padding: "0.5rem 1.25rem",
              fontSize: "0.82rem",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
