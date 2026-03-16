"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { type Locale, locales } from "@/i18n";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const { locale, setLocale } = useLanguage();
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full",
          theme === "dark"
            ? "text-gray-400 hover:text-white hover:bg-dark-700/50"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        )}
        title="Change language"
      >
        <Globe className="w-5 h-5 flex-shrink-0" />
        {!collapsed && (
          <span className="flex items-center gap-2">
            <span>{locales[locale].flag}</span>
            <span>{locales[locale].nativeName}</span>
          </span>
        )}
      </button>

      {open && (
        <div className={cn(
          "absolute bottom-full mb-1 rounded-lg border shadow-xl z-50 min-w-[160px] overflow-hidden",
          collapsed ? "left-full ml-2 bottom-0 mb-0" : "left-0",
          theme === "dark"
            ? "bg-dark-800 border-gray-700"
            : "bg-white border-gray-200"
        )}>
          {(Object.keys(locales) as Locale[]).map((loc) => (
            <button
              key={loc}
              onClick={() => { setLocale(loc); setOpen(false); }}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors",
                locale === loc
                  ? "bg-accent-blue/10 text-accent-blue"
                  : theme === "dark"
                    ? "text-gray-300 hover:bg-dark-700"
                    : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <span className="text-lg">{locales[loc].flag}</span>
              <span className="font-medium">{locales[loc].nativeName}</span>
              {locale === loc && <span className="ml-auto text-accent-blue">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
