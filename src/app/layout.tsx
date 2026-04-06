import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { isMaintenanceMode } from "@/lib/maintenance";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SecureAware - Security Awareness Training Platform",
  description: "Enterprise security awareness training platform to protect your organization against phishing, social engineering, and human-risk security threats.",
};

// Routes always accessible during maintenance (so admin can log back in)
const MAINTENANCE_BYPASS = ["/login", "/register", "/maintenance"];

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [maintenance, session, headersList] = await Promise.all([
    isMaintenanceMode(),
    getServerSession(authOptions),
    headers(),
  ]);

  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  // Read pathname set by middleware
  const pathname = headersList.get("x-pathname") || "/";

  // Bypass maintenance for login/register so admins can log back in
  const isBypassPath = MAINTENANCE_BYPASS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Show maintenance ONLY if enabled AND not admin AND not on bypass path
  const showMaintenance = maintenance && !isAdmin && !isBypassPath;

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {showMaintenance ? (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
              <div className="max-w-lg w-full text-center space-y-6">
                <div className="text-6xl">🛠️</div>
                <h1 className="text-3xl font-bold text-white">Under Maintenance</h1>
                <p className="text-gray-400 text-lg">
                  We are currently performing scheduled maintenance to improve your experience.
                  Please check back shortly.
                </p>
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-center gap-2 text-cyan-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-medium">Maintenance in progress...</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-500 text-sm">
                    🛡️ SecureAware - Security Awareness Training Platform
                  </p>
                  <a href="/login" className="text-cyan-400 hover:text-cyan-300 text-sm underline">
                    Admin Login
                  </a>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </Providers>
      </body>
    </html>
  );
}
