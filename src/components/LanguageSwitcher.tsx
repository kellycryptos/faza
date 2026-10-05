"use client";

import { useLanguage } from "@/context/LanguageContext";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, toggleLang, isZh } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selection"
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
      }}
    >
      <button
        type="button"
        onClick={() => setLang("en")}
        title="Switch to English"
        style={{
          border: "none",
          borderRadius: "var(--radius-pill)",
          padding: compact ? "2px 7px" : "2px 9px",
          fontSize: "0.68rem",
          fontWeight: !isZh ? 800 : 500,
          background: !isZh ? "rgba(46, 230, 166, 0.15)" : "transparent",
          color: !isZh ? "var(--accent)" : "var(--muted)",
          cursor: "pointer",
          transition: "all 0.15s ease",
          lineHeight: 1.4,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang("zh")}
        title="切换至简体中文"
        style={{
          border: "none",
          borderRadius: "var(--radius-pill)",
          padding: compact ? "2px 7px" : "2px 9px",
          fontSize: "0.68rem",
          fontWeight: isZh ? 800 : 500,
          background: isZh ? "rgba(46, 230, 166, 0.15)" : "transparent",
          color: isZh ? "var(--accent)" : "var(--muted)",
          cursor: "pointer",
          transition: "all 0.15s ease",
          lineHeight: 1.4,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        中文
      </button>
    </div>
  );
}
