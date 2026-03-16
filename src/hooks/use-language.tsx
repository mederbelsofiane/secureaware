"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { type Locale, type TranslationKeys, locales, getTranslations } from "@/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: getTranslations("en"),
  dir: "ltr",
  isRTL: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && locales[saved]) {
      setLocaleState(saved);
      applyLocale(saved);
    }
  }, []);

  const applyLocale = (loc: Locale) => {
    const { dir } = locales[loc];
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", loc);
  };

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("locale", newLocale);
    applyLocale(newLocale);
  }, []);

  const t = getTranslations(locale);
  const dir = locales[locale]?.dir || "ltr";
  const isRTL = dir === "rtl";

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, dir, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
