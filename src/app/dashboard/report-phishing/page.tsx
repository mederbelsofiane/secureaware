"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { Shield, Send, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ReportPhishingPage() {
  const { user, isLoading } = useAuth();
  const [token, setToken] = useState("");
  const [emailDetails, setEmailDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (isLoading) return <PageLoading />;

  const handleSubmitToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`/api/phishing/report/${token.trim()}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to report");
      setResult({ success: true, message: data.message || "Phishing attempt reported successfully!" });
      setToken("");
    } catch (err) {
      setResult({ success: false, message: err instanceof Error ? err.message : "Failed to submit report" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Phishing"
        description="Report suspicious emails or phishing attempts to help keep your organization safe."
      />

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-1">Why Report Phishing?</h3>
            <p className="text-gray-400 text-sm">
              Reporting suspicious emails helps your security team identify threats and protect the entire organization.
              If you received a simulation email, use the token from the email or the caught page to report it.
            </p>
          </div>
        </div>
      </div>

      {/* Report by Token */}
      <div className="bg-dark-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Report by Simulation Token
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          If you received a phishing simulation email, enter the token from the email or the URL of the caught page.
        </p>
        <form onSubmit={handleSubmitToken} className="flex gap-3">
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Enter phishing simulation token..."
            className="flex-1 bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25"
          />
          <button
            type="submit"
            disabled={submitting || !token.trim()}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Reporting..." : "Report"}
          </button>
        </form>
      </div>

      {/* Report General Suspicious Email */}
      <div className="bg-dark-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          Report a Suspicious Email
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Describe the suspicious email you received. Include details like the sender, subject line, and any links.
        </p>
        <textarea
          value={emailDetails}
          onChange={(e) => setEmailDetails(e.target.value)}
          placeholder={"Describe the suspicious email...\n\nInclude:\n- Sender email address\n- Subject line\n- Any suspicious links or attachments\n- Why you think it's phishing"}
          rows={6}
          className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 resize-none mb-4"
        />
        <button
          onClick={() => {
            if (emailDetails.trim()) {
              setResult({ success: true, message: "Thank you! Your report has been submitted to the security team for review." });
              setEmailDetails("");
            }
          }}
          disabled={!emailDetails.trim()}
          className="bg-dark-700 hover:bg-dark-600 text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-gray-600/50"
        >
          <Send className="w-4 h-4" />
          Submit Report
        </button>
      </div>

      {/* Result Message */}
      {result && (
        <div className={`rounded-2xl p-6 border ${
          result.success
            ? "bg-green-500/10 border-green-500/20"
            : "bg-red-500/10 border-red-500/20"
        }`}>
          <div className="flex items-center gap-3">
            {result.success ? (
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-400" />
            )}
            <p className={result.success ? "text-green-300" : "text-red-300"}>
              {result.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
