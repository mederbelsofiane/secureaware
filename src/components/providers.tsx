"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, useTheme } from "@/hooks/use-theme";
import { LanguageProvider } from "@/hooks/use-language";

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: theme === "dark" ? {
          background: "#1e1e4a",
          color: "#e5e7eb",
          border: "1px solid rgba(99, 102, 241, 0.3)",
        } : {
          background: "#ffffff",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        },
        success: { iconTheme: { primary: "#10b981", secondary: theme === "dark" ? "#1e1e4a" : "#ffffff" } },
        error: { iconTheme: { primary: "#ef4444", secondary: theme === "dark" ? "#1e1e4a" : "#ffffff" } },
      }}
    />
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <LanguageProvider>
          {children}
          <ThemedToaster />
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
