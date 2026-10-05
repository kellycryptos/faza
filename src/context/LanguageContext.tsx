"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Language = "en" | "zh";

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  isZh: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "faza_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = params.get("lang")?.toLowerCase();
      if (urlLang === "zh" || urlLang === "cn") {
        setLangState("zh");
      } else if (urlLang === "en") {
        setLangState("en");
      } else {
        const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
        if (saved === "zh" || saved === "en") {
          setLangState(saved);
        } else {
          setLangState("en");
        }
      }
    } catch {
      setLangState("en");
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((nextLang: Language) => {
    setLangState(nextLang);
    try {
      localStorage.setItem(STORAGE_KEY, nextLang);
      const url = new URL(window.location.href);
      if (nextLang === "zh") {
        url.searchParams.set("lang", "zh");
      } else {
        url.searchParams.delete("lang");
      }
      window.history.replaceState(null, "", url.toString());
    } catch {
      // Ignored
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "zh" : "en");
  }, [lang, setLang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        toggleLang,
        isZh: lang === "zh",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: "en" as Language,
      setLang: () => {},
      toggleLang: () => {},
      isZh: false,
    };
  }
  return ctx;
}
