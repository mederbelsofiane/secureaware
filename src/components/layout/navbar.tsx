"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Shield, Menu, X, Sun, Moon, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useLanguage } from "@/hooks/use-language";
import { type Locale, locales } from "@/i18n";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/features", label: t.nav.features },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b",
      theme === "dark" ? "bg-dark-950/80 border-gray-800/50" : "bg-white/92 border-gray-200"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center group-hover:bg-accent-blue/30 transition-colors">
              <Shield className="w-5 h-5 text-accent-blue" />
            </div>
            <span className={cn("font-bold text-lg", theme === "dark" ? "text-white" : "text-gray-900")}>
              Secure<span className="text-accent-blue">Aware</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? theme === "dark" ? "text-white bg-dark-700" : "text-gray-900 bg-gray-100"
                    : theme === "dark" ? "text-gray-400 hover:text-white hover:bg-dark-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {/* Language switcher */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={cn(
                  "p-2 rounded-lg transition-all duration-300 hover:scale-110 flex items-center gap-1.5",
                  theme === "dark" ? "bg-dark-800 hover:bg-dark-700" : "bg-gray-100 hover:bg-gray-200"
                )}
                title={t.common.language}
              >
                <span className="text-sm">{locales[locale].flag}</span>
                <Globe className="w-4 h-4" />
              </button>
              {langOpen && (
                <div className={cn(
                  "absolute top-full mt-1 right-0 rounded-lg border shadow-xl z-50 min-w-[160px] overflow-hidden",
                  theme === "dark" ? "bg-dark-800 border-gray-700" : "bg-white border-gray-200"
                )}>
                  {(Object.keys(locales) as Locale[]).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => { setLocale(loc); setLangOpen(false); }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-sm w-full transition-colors",
                        locale === loc
                          ? "bg-accent-blue/10 text-accent-blue"
                          : theme === "dark" ? "text-gray-300 hover:bg-dark-700" : "text-gray-700 hover:bg-gray-50"
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

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-lg transition-all duration-300 hover:scale-110",
                theme === "dark" ? "bg-dark-800 text-yellow-400 hover:bg-dark-700" : "bg-gray-100 text-indigo-600 hover:bg-gray-200"
              )}
              aria-label={theme === "dark" ? t.common.lightMode : t.common.darkMode}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {session ? (
              <Link
                href={session.user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="btn-primary text-sm"
              >
                {t.nav.dashboard}
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">{t.nav.signIn}</Link>
                <Link href="/contact" className="btn-primary text-sm">{t.nav.requestDemo}</Link>
              </>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={cn("p-2 rounded-lg transition-colors", theme === "dark" ? "text-yellow-400" : "text-indigo-600")}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn("p-2 rounded-lg transition-colors", theme === "dark" ? "hover:bg-dark-800" : "hover:bg-gray-100")}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={cn(
          "md:hidden border-t backdrop-blur-xl",
          theme === "dark" ? "border-gray-800/50 bg-dark-950/95" : "border-gray-200 bg-white/97"
        )}>
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href
                    ? theme === "dark" ? "text-white bg-dark-700" : "text-gray-900 bg-gray-100"
                    : theme === "dark" ? "text-gray-400 hover:text-white hover:bg-dark-800" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                {link.label}
              </Link>
            ))}
            {/* Mobile language switcher */}
            <div className={cn("pt-2 border-t mt-2", theme === "dark" ? "border-gray-800" : "border-gray-200")}>
              <div className="flex gap-2 px-4">
                {(Object.keys(locales) as Locale[]).map((loc) => (
                  <button
                    key={loc}
                    onClick={() => { setLocale(loc); setMobileOpen(false); }}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors",
                      locale === loc ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20" :
                        theme === "dark" ? "text-gray-400 hover:bg-dark-700" : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <span>{locales[loc].flag}</span>
                    <span>{locales[loc].nativeName}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className={cn("pt-3 border-t mt-3 space-y-2", theme === "dark" ? "border-gray-800" : "border-gray-200")}>
              {session ? (
                <Link href="/dashboard" className="btn-primary text-sm w-full text-center block" onClick={() => setMobileOpen(false)}>{t.nav.dashboard}</Link>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary text-sm w-full text-center block" onClick={() => setMobileOpen(false)}>{t.nav.signIn}</Link>
                  <Link href="/contact" className="btn-primary text-sm w-full text-center block" onClick={() => setMobileOpen(false)}>{t.nav.requestDemo}</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
