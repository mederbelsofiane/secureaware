"use client";

import { use } from "react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFetch, apiPost } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, Send, Eye, MousePointerClick, Flag, Clock, Mail } from "lucide-react";

interface EventItem {
  id: string;
  user: { id: string; name: string; email: string; department?: { id: string; name: string } | null };
  template: { id: string; name: string; subject: string; difficulty: string };
  emailSentAt: string | null;
  emailOpenedAt: string | null;
  linkClickedAt: string | null;
  reportedAt: string | null;
}

interface ResultsData {
  campaign: { id: string; name: string; description: string | null; status: string; startDate: string | null; endDate: string | null };
  stats: { totalSent: number; opened: number; clicked: number; reported: number; openRate: number; clickRate: number; reportRate: number; avgTimeToClick: number };
  departments: { name: string; sent: number; opened: number; clicked: number; reported: number }[];
  events: EventItem[];
}

interface PageProps { params: Promise<{ id: string }> }

export default function CampaignResultsPage({ params }: PageProps) {
  const { id } = use(params);
  const { isLoading: authLoading } = useAuth();
  const { data, loading, refetch } = useFetch<ResultsData>(`/api/phishing/campaigns/${id}/results`);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  if (authLoading || loading) return <PageLoading />;
  if (!data) return <div className="text-white p-6">Campaign not found.</div>;

  const { campaign, stats, events } = data;

  const handleSend = async () => {
    if (!confirm("Send phishing simulation emails to all targets?")) return;
    setSending(true); setSendResult(null);
    try {
      const result = await apiPost<{ sent: number; total: number }>(`/api/phishing/campaigns/${id}/send`, {});
      setSendResult(`Successfully sent ${result.sent} of ${result.total} emails.`);
      refetch();
    } catch (err) { setSendResult(err instanceof Error ? err.message : "Failed to send emails"); } finally { setSending(false); }
  };

  const getEventStatus = (e: EventItem) => {
    if (e.reportedAt) return <Badge variant="success">Reported</Badge>;
    if (e.linkClickedAt) return <Badge variant="danger">Clicked</Badge>;
    if (e.emailOpenedAt) return <Badge variant="warning">Opened</Badge>;
    if (e.emailSentAt) return <Badge variant="info">Sent</Badge>;
    return <Badge variant="default">Pending</Badge>;
  };

  const formatSeconds = (s: number) => {
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.round(s / 60)}m`;
    return `${Math.round(s / 3600)}h ${Math.round((s % 3600) / 60)}m`;
  };

  return (
    <div className="space-y-6">
      <PageHeader title={campaign.name} description={campaign.description || "Phishing simulation campaign results"} action={
          <div className="flex items-center gap-3">
          <Link href="/admin/phishing" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          {campaign.status === "DRAFT" && (
            <button onClick={handleSend} disabled={sending} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm disabled:opacity-50">
              <Send className="w-4 h-4" /> {sending ? "Sending..." : "Send Emails"}
            </button>
          )}
        </div>
        } />

      {sendResult && (
        <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-cyan-300">{sendResult}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><Mail className="w-4 h-4 text-cyan-400" /><span className="text-gray-400 text-sm">Sent</span></div>
          <div className="text-2xl font-bold text-white">{stats.totalSent}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><Eye className="w-4 h-4 text-blue-400" /><span className="text-gray-400 text-sm">Opened</span></div>
          <div className="text-2xl font-bold text-white">{stats.opened} <span className="text-sm text-gray-400">({stats.openRate}%)</span></div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><MousePointerClick className="w-4 h-4 text-amber-400" /><span className="text-gray-400 text-sm">Clicked</span></div>
          <div className="text-2xl font-bold text-white">{stats.clicked} <span className="text-sm text-gray-400">({stats.clickRate}%)</span></div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><Flag className="w-4 h-4 text-green-400" /><span className="text-gray-400 text-sm">Reported</span></div>
          <div className="text-2xl font-bold text-white">{stats.reported} <span className="text-sm text-gray-400">({stats.reportRate}%)</span></div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-purple-400" /><span className="text-gray-400 text-sm">Avg Click Time</span></div>
          <div className="text-2xl font-bold text-white">{stats.avgTimeToClick > 0 ? formatSeconds(stats.avgTimeToClick) : "N/A"}</div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-dark-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Individual Results</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">User</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Department</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Sent</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Opened</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Clicked</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Reported</th>
                <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-gray-700/30 hover:bg-dark-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="text-white text-sm font-medium">{e.user.name}</div>
                    <div className="text-gray-500 text-xs">{e.user.email}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-sm">{e.user.department?.name || "-"}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{e.emailSentAt ? formatDateTime(e.emailSentAt) : "-"}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{e.emailOpenedAt ? formatDateTime(e.emailOpenedAt) : "-"}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{e.linkClickedAt ? formatDateTime(e.linkClickedAt) : "-"}</td>
                  <td className="py-3 px-4 text-gray-400 text-xs">{e.reportedAt ? formatDateTime(e.reportedAt) : "-"}</td>
                  <td className="py-3 px-4">{getEventStatus(e)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
