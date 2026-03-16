"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Shield, Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

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

          <div className="hidden md:flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-lg transition-all duration-300 hover:scale-110",
                theme === "dark"
                  ? "bg-dark-800 text-yellow-400 hover:bg-dark-700"
                  : "bg-gray-100 text-indigo-600 hover:bg-gray-200"
              )}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {session ? (
              <Link
                href={session.user?.role === "ADMIN" ? "/admin" : "/dashboard"}
                className="btn-primary text-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost text-sm">Sign In</Link>
                <Link href="/contact" className="btn-primary text-sm">Request Demo</Link>
              </>
            )}
          </div>

          {/* Mobile buttons */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-lg transition-colors",
                theme === "dark" ? "text-yellow-400" : "text-indigo-600"
              )}
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
            <div className={cn("pt-3 border-t mt-3 space-y-2", theme === "dark" ? "border-gray-800" : "border-gray-200")}>
              {session ? (
                <Link href="/dashboard" className="btn-primary text-sm w-full text-center block" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="btn-secondary text-sm w-full text-center block" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link href="/contact" className="btn-primary text-sm w-full text-center block" onClick={() => setMobileOpen(false)}>Request Demo</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
