import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import ReportButton from "./report-button";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function PhishingCaughtPage({ params }: PageProps) {
  const { token } = await params;
  
  const event = await prisma.phishingEvent.findUnique({
    where: { token },
    include: { template: true, campaign: true },
  });
  
  if (!event) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Warning icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">⚠️ This Was a Phishing Simulation</h1>
          <p className="text-gray-400">Don&apos;t worry - this was a test conducted by your organization&apos;s security team.</p>
        </div>

        {/* Glass card with info */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">What Happened?</h2>
          <p className="text-gray-300 mb-6">
            You clicked a link in a simulated phishing email. In a real attack, this could have
            compromised your credentials or installed malware on your device.
          </p>

          {event.template && (
            <div className="bg-dark-900/50 border border-gray-600/30 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">The simulated email was:</p>
              <p className="text-white font-medium">{event.template.subject}</p>
              <p className="text-gray-400 text-sm">From: {event.template.senderName} &lt;{event.template.senderEmail}&gt;</p>
            </div>
          )}

          <h3 className="text-lg font-semibold text-cyan-400 mb-3">🔍 Red Flags to Watch For:</h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-1">•</span>
              <span>Check the sender&apos;s email address carefully - look for misspellings or unusual domains</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-1">•</span>
              <span>Hover over links before clicking them to verify the destination URL</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-1">•</span>
              <span>Be suspicious of urgent or threatening language designed to pressure you</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-1">•</span>
              <span>Never enter credentials on unexpected or unfamiliar pages</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-red-400 mt-1">•</span>
              <span>Verify requests for sensitive information through a separate communication channel</span>
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-cyan-400 mb-3">✅ What You Should Do:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-green-400 mt-1">•</span>
              <span>Report suspicious emails to your IT security team immediately</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-green-400 mt-1">•</span>
              <span>Complete your security awareness training modules on the platform</span>
            </li>
            <li className="flex items-start gap-2 text-gray-300">
              <span className="text-green-400 mt-1">•</span>
              <span>Use the Report button below to practice reporting this phishing attempt</span>
            </li>
          </ul>
        </div>

        {/* Report button - client component */}
        <ReportButton token={token} alreadyReported={!!event.reportedAt} />

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-8">
          This simulation is part of your organization&apos;s security awareness program.
        </p>
      </div>
    </div>
  );
}
