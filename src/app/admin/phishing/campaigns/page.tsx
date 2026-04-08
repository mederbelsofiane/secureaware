"use client";

import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Plus, Eye, MousePointerClick, Flag, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  targets: number;
  sent: number;
  openRate: number;
  clickRate: number;
  reportRate: number;
}

interface CampaignsData {
  campaigns: Campaign[];
  total: number;
  page: number;
  limit: number;
}

export default function CampaignsListPage() {
  const { isLoading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const url = `/api/phishing/campaigns?page=${page}&limit=20${statusFilter ? `&status=${statusFilter}` : ""}`;
  const { data, loading } = useFetch<CampaignsData>(url);

  if (authLoading || loading) return <PageLoading />;

  const campaigns = data?.campaigns || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const statusColors: Record<string, string> = {
    DRAFT: "default",
    ACTIVE: "success",
    COMPLETED: "info",
    PAUSED: "warning",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phishing Campaigns"
        description={`${total} campaign${total !== 1 ? "s" : ""} total`}
        action={
          <div className="flex gap-3">
            <Link
              href="/admin/phishing"
              className="sa-btn-secondary flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/phishing/campaigns/new"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              New Campaign
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-2">
        {["", "DRAFT", "ACTIVE", "COMPLETED", "PAUSED"].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "sa-bg-secondary sa-text-secondary border border-transparent hover:border-gray-600/50"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {/* Campaigns Table */}
      {campaigns.length === 0 ? (
        <EmptyState
          title="No campaigns found"
          description={statusFilter ? "No campaigns match the selected filter." : "Create your first phishing simulation campaign."}
        />
      ) : (
        <div className="sa-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="sa-table-header">
                  <th className="text-left sa-text-secondary text-sm font-medium py-3 px-4">Campaign</th>
                  <th className="text-left sa-text-secondary text-sm font-medium py-3 px-4">Status</th>
                  <th className="text-center sa-text-secondary text-sm font-medium py-3 px-4">Targets</th>
                  <th className="text-center sa-text-secondary text-sm font-medium py-3 px-4">
                    <div className="flex items-center justify-center gap-1"><Eye className="w-3.5 h-3.5" /> Open</div>
                  </th>
                  <th className="text-center sa-text-secondary text-sm font-medium py-3 px-4">
                    <div className="flex items-center justify-center gap-1"><MousePointerClick className="w-3.5 h-3.5" /> Click</div>
                  </th>
                  <th className="text-center sa-text-secondary text-sm font-medium py-3 px-4">
                    <div className="flex items-center justify-center gap-1"><Flag className="w-3.5 h-3.5" /> Report</div>
                  </th>
                  <th className="text-left sa-text-secondary text-sm font-medium py-3 px-4">Created</th>
                  <th className="text-left sa-text-secondary text-sm font-medium py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="sa-table-row">
                    <td className="py-3 px-4">
                      <div className="sa-text-primary font-medium">{c.name}</div>
                      {c.description && <div className="sa-text-secondary text-xs mt-0.5 truncate max-w-xs">{c.description}</div>}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={(statusColors[c.status] || "default") as any}>{c.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center sa-text-primary">{c.targets}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-blue-400 font-medium">{c.openRate}%</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-amber-400 font-medium">{c.clickRate}%</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-green-400 font-medium">{c.reportRate}%</span>
                    </td>
                    <td className="py-3 px-4 sa-text-secondary text-sm">{formatDateTime(c.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/phishing/campaigns/${c.id}`}
                        className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
                      >
                        View Results
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t sa-border">
              <div className="sa-text-secondary text-sm">
                Page {page} of {totalPages} ({total} total)
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="sa-btn-secondary px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="sa-btn-secondary px-3 py-1.5 rounded-lg text-sm disabled:opacity-50 flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
