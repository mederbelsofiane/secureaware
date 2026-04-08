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
import { ArrowLeft, Send, Eye, MousePointerClick, Flag, Clock, Mail, AlertTriangle, RefreshCw } from "lucide-react";

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
  const { data, loading, error: fetchError, refetch } = useFetch<ResultsData>(`/api/phishing/campaigns/${id}/results`);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  if (authLoading || loading) return <PageLoading />;

  // Error state - show meaningful error instead of blank/broken page
  if (fetchError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Campaign Results" description="Phishing simulation campaign results" action={
          <Link href="/admin/phishing" className="sa-text-secondary hover:sa-text-primary flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        } />
        <div className="sa-card rounded-2xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold sa-text-primary mb-2">Failed to Load Campaign</h2>
          <p className="sa-text-muted mb-2">Could not load the campaign results data.</p>
          <p className="text-red-400 text-sm mb-6">{fetchError}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Campaign Results" description="Phishing simulation campaign results" action={
          <Link href="/admin/phishing" className="sa-text-secondary hover:sa-text-primary flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
        } />
        <div className="sa-card rounded-2xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold sa-text-primary mb-2">Campaign Not Found</h2>
          <p className="sa-text-muted">The requested campaign does not exist or you do not have access.</p>
        </div>
      </div>
    );
  }

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
          <Link href="/admin/phishing" className="sa-text-secondary hover:sa-text-primary flex items-center gap-2 text-sm">
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
        <div className="sa-stat-card bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><Mail className="w-4 h-4 text-cyan-400" /><span className="sa-text-muted text-sm">Sent</span></div>
          <div className="text-2xl font-bold sa-text-primary">{stats.totalSent}</div>
        </div>
        <div className="sa-stat-card bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><Eye className="w-4 h-4 text-blue-400" /><span className="sa-text-muted text-sm">Opened</span></div>
          <div className="text-2xl font-bold sa-text-primary">{stats.opened} <span className="text-sm sa-text-muted">({stats.openRate}%)</span></div>
        </div>
        <div className="sa-stat-card bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><MousePointerClick className="w-4 h-4 text-amber-400" /><span className="sa-text-muted text-sm">Clicked</span></div>
          <div className="text-2xl font-bold sa-text-primary">{stats.clicked} <span className="text-sm sa-text-muted">({stats.clickRate}%)</span></div>
        </div>
        <div className="sa-stat-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><Flag className="w-4 h-4 text-green-400" /><span className="sa-text-muted text-sm">Reported</span></div>
          <div className="text-2xl font-bold sa-text-primary">{stats.reported} <span className="text-sm sa-text-muted">({stats.reportRate}%)</span></div>
        </div>
        <div className="sa-stat-card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2"><Clock className="w-4 h-4 text-purple-400" /><span className="sa-text-muted text-sm">Avg Click Time</span></div>
          <div className="text-2xl font-bold sa-text-primary">{stats.avgTimeToClick > 0 ? formatSeconds(stats.avgTimeToClick) : "N/A"}</div>
        </div>
      </div>

      {/* Events Table */}
      <div className="sa-card rounded-2xl p-6">
        <h2 className="text-lg font-semibold sa-text-primary mb-4">Individual Results</h2>
        {events.length === 0 ? (
          <p className="sa-text-muted text-sm text-center py-8">No simulation events yet. Send emails to start tracking results.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="sa-table-header">
                  <th className="text-left text-sm font-medium py-3 px-4">User</th>
                  <th className="text-left text-sm font-medium py-3 px-4">Department</th>
                  <th className="text-left text-sm font-medium py-3 px-4">Sent</th>
                  <th className="text-left text-sm font-medium py-3 px-4">Opened</th>
                  <th className="text-left text-sm font-medium py-3 px-4">Clicked</th>
                  <th className="text-left text-sm font-medium py-3 px-4">Reported</th>
                  <th className="text-left text-sm font-medium py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id} className="sa-table-row transition-colors">
                    <td className="py-3 px-4">
                      <div className="sa-text-primary text-sm font-medium">{e.user.name}</div>
                      <div className="sa-text-muted text-xs">{e.user.email}</div>
                    </td>
                    <td className="py-3 px-4 sa-text-secondary text-sm">{e.user.department?.name || "-"}</td>
                    <td className="py-3 px-4 sa-text-muted text-xs">{e.emailSentAt ? formatDateTime(e.emailSentAt) : "-"}</td>
                    <td className="py-3 px-4 sa-text-muted text-xs">{e.emailOpenedAt ? formatDateTime(e.emailOpenedAt) : "-"}</td>
                    <td className="py-3 px-4 sa-text-muted text-xs">{e.linkClickedAt ? formatDateTime(e.linkClickedAt) : "-"}</td>
                    <td className="py-3 px-4 sa-text-muted text-xs">{e.reportedAt ? formatDateTime(e.reportedAt) : "-"}</td>
                    <td className="py-3 px-4">{getEventStatus(e)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
