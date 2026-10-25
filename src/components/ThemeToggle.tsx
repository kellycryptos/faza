"use client";

import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { t } from "@/lib/translations";

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function ThemeToggle({ compact = false, className = "", style = {} }: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  const { lang } = useLanguage();

  const titleTooltip = isDark ? t("themeSwitchToLight", lang) : t("themeSwitchToDark", lang);

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={titleTooltip}
        title={titleTooltip}
        className={`theme-toggle-btn ${className}`}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: "var(--radius-pill)",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--ink)",
          cursor: "pointer",
          transition: "all 0.15s ease",
          padding: 0,
          flexShrink: 0,
          ...style,
        }}
      >
        {isDark ? (
          // Sun icon when in dark mode (click to switch to light)
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          // Moon icon when in light mode (click to switch to dark)
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className={`theme-segmented-toggle ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-pill)",
        padding: 2,
        gap: 2,
        height: 28,
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Light Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-pressed={!isDark}
        title={t("themeSwitchToLight", lang)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          borderRadius: "var(--radius-pill)",
          padding: "2px 8px",
          height: "100%",
          background: !isDark ? "var(--accent-dim)" : "transparent",
          color: !isDark ? "var(--accent)" : "var(--muted)",
          cursor: "pointer",
          transition: "all 0.15s ease",
          fontSize: "0.75rem",
          lineHeight: 1,
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </button>

      {/* Dark Mode Button */}
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-pressed={isDark}
        title={t("themeSwitchToDark", lang)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          border: "none",
          borderRadius: "var(--radius-pill)",
          padding: "2px 8px",
          height: "100%",
          background: isDark ? "rgba(46, 230, 166, 0.15)" : "transparent",
          color: isDark ? "var(--accent)" : "var(--muted)",
          cursor: "pointer",
          transition: "all 0.15s ease",
          fontSize: "0.75rem",
          lineHeight: 1,
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </button>
    </div>
  );
}
