"use client";

import { useState } from "react";

interface ReportButtonProps {
  token: string;
  alreadyReported: boolean;
}

export default function ReportButton({ token, alreadyReported }: ReportButtonProps) {
  const [reported, setReported] = useState(alreadyReported);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/phishing/report/${token}`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to report");
      setReported(true);
    } catch {
      setError("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (reported) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-green-400 mb-1">Phishing Reported!</h3>
        <p className="text-gray-400 text-sm">Great job! Reporting phishing attempts helps keep your organization safe.</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <button
        onClick={handleReport}
        disabled={loading}
        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Reporting...
          </span>
        ) : (
          "🛡️ Report This Phishing Attempt"
        )}
      </button>
      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
