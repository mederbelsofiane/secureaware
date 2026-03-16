"use client";

import { Sidebar } from "./sidebar";
import { useLanguage } from "@/hooks/use-language";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-dark-950">
      <Sidebar />
      <main className={`min-h-screen ${isRTL ? "mr-64" : "ml-64"}`}>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
