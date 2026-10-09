import React from "react";

interface FazaLogoProps {
  /** Size of the mark icon in px (defaults to 28) */
  size?: number;
  /** Whether to show the wordmark 'Faza' next to the mark (defaults to true) */
  showText?: boolean;
  /** Optional badge label like 'ARC' (defaults to undefined or can be enabled) */
  badge?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function FazaLogo({
  size = 28,
  showText = true,
  badge,
  className = "",
  style = {},
}: FazaLogoProps) {
  return (
    <div
      className={`faza-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.max(8, Math.round(size * 0.35)),
        userSelect: "none",
        ...style,
      }}
    >
      {/* Precision Vector Emblem Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: "block" }}
      >
        <defs>
          <linearGradient id="logoBg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#111724" />
            <stop offset="50%" stopColor="#080B10" />
            <stop offset="100%" stopColor="#040507" />
          </linearGradient>
          <linearGradient id="logoBorder" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2EE6A6" stopOpacity="0.8" />
            <stop offset="40%" stopColor="#2EE6A6" stopOpacity="0.25" />
            <stop offset="75%" stopColor="#182436" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#2EE6A6" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="logoTeal" x1="36" y1="28" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5BFFC6" />
            <stop offset="50%" stopColor="#2EE6A6" />
            <stop offset="100%" stopColor="#0FB37F" />
          </linearGradient>
          <linearGradient id="logoCyan" x1="56" y1="60" x2="90" y2="76" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#2EE6A6" />
          </linearGradient>
          <radialGradient id="logoAura" cx="60" cy="56" r="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2EE6A6" stopOpacity="0.28" />
            <stop offset="60%" stopColor="#00D2B4" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Squircle Container */}
        <rect
          x="5"
          y="5"
          width="118"
          height="118"
          rx="30"
          fill="url(#logoBg)"
          stroke="url(#logoBorder)"
          strokeWidth="3"
        />

        {/* Radiant Ambient Core */}
        <circle cx="60" cy="60" r="45" fill="url(#logoAura)" />

        {/* Upper Wing & Spine (Party 1 Commitment) */}
        <path
          d="M36 35
             C36 31.6863 38.6863 29 42 29
             H88
             C90.6522 29 93.0825 30.499 94.2765 32.868
             L87 47
             C86.125 48.75 84.3 50 82.25 50
             H56
             V93
             C56 95.7614 53.7614 98 51 98
             H41
             C38.2386 98 36 95.7614 36 93
             Z"
          fill="url(#logoTeal)"
        />

        {/* Middle Bar (Party 2 Bilateral Stake & Lock) */}
        <path
          d="M56 60
             H79
             C81.05 60 82.875 61.25 83.75 63
             L79 73
             C78 75 76 76.5 73.75 76.5
             H56
             Z"
          fill="url(#logoCyan)"
        />

        {/* Settlement Node (Glowing onchain payout mark) */}
        <circle cx="85" cy="67" r="2.5" fill="#5BFFC6" />
        <circle cx="85" cy="67" r="5" fill="#2EE6A6" fillOpacity="0.4" />
      </svg>

      {/* Brand Typography Wordmark */}
      {showText && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            translate="no"
            className="notranslate"
            style={{
              fontSize: `${Math.max(16, Math.round(size * 0.72))}px`,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--ink, #F4F6FA)",
              lineHeight: 1,
            }}
          >
            Faza
          </span>
          {badge && (
            <span
              style={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent, #2EE6A6)",
                background: "var(--accent-dim, rgba(46,230,166,0.12))",
                border: "1px solid rgba(46,230,166,0.25)",
                padding: "1px 5px",
                borderRadius: 4,
                lineHeight: 1.2,
              }}
            >
              {badge}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
