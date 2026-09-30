"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Faza] Root error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          background: "#07080B",
          color: "#F4F6FA",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          margin: 0,
          padding: "1rem",
        }}
      >
        <div
          style={{
            maxWidth: 480,
            textAlign: "center",
            background: "#10131A",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
          }}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2EE6A6" }}>
            Faza
          </div>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
            Application Error
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#8E9BAE", margin: 0, lineHeight: 1.5 }}>
            A critical error prevented the application from rendering. Please reload the page.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
            <button
              onClick={() => reset()}
              style={{
                background: "#2EE6A6",
                color: "#050B14",
                border: "none",
                borderRadius: 8,
                padding: "0.5rem 1.25rem",
                fontSize: "0.82rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Retry
            </button>
            <a
              href="/"
              style={{
                background: "#171C26",
                color: "#F4F6FA",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                padding: "0.5rem 1.25rem",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Go to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
