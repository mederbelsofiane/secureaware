import en from "./en.json";
import fr from "./fr.json";
import ar from "./ar.json";

export type Locale = "en" | "fr" | "ar";

export const locales: Record<Locale, { name: string; nativeName: string; dir: "ltr" | "rtl"; flag: string }> = {
  en: { name: "English", nativeName: "English", dir: "ltr", flag: "🇬🇧" },
  fr: { name: "French", nativeName: "Français", dir: "ltr", flag: "🇫🇷" },
  ar: { name: "Arabic", nativeName: "العربية", dir: "rtl", flag: "🇸🇦" },
};

const translations: Record<Locale, typeof en> = { en, fr, ar };

export type TranslationKeys = typeof en;

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations.en;
}

export { en, fr, ar };
