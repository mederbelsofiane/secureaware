"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#1e1e4a",
            color: "#e5e7eb",
            border: "1px solid rgba(99, 102, 241, 0.3)",
          },
          success: { iconTheme: { primary: "#10b981", secondary: "#1e1e4a" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#1e1e4a" } },
        }}
      />
    </SessionProvider>
  );
}
