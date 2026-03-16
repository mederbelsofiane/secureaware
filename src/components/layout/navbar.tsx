"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Shield, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent-blue/20 flex items-center justify-center group-hover:bg-accent-blue/30 transition-colors">
              <Shield className="w-5 h-5 text-accent-blue" />
            </div>
            <span className="font-bold text-lg text-white">Secure<span className="text-accent-blue">Aware</span></span>
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
                    ? "text-white bg-dark-700"
                    : "text-gray-400 hover:text-white hover:bg-dark-800"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
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

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-dark-800 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800/50 bg-dark-950/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === link.href ? "text-white bg-dark-700" : "text-gray-400 hover:text-white hover:bg-dark-800"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-800 mt-3 space-y-2">
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
