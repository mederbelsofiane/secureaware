"use client";

import { ShieldAlert, Wrench, ArrowLeft } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
              <ShieldAlert className="w-12 h-12 text-yellow-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-dark-800/60 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-3">
            Under Maintenance
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 mx-auto mb-6 rounded-full" />
          <p className="text-gray-300 text-lg mb-2">
            We&apos;ll be back soon!
          </p>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Our platform is currently undergoing scheduled maintenance to improve
            your security training experience. We apologize for the inconvenience
            and appreciate your patience.
          </p>

          {/* Status indicator */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </span>
            <span className="text-yellow-400 text-sm font-medium">Maintenance in progress</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-xs mt-6">
          &copy; {new Date().getFullYear()} SecureAware. All rights reserved.
        </p>
      </div>
    </div>
  );
}
