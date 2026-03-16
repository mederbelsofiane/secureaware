"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFetch, apiPut, apiDelete } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { SearchFilter } from "@/components/ui/search-filter";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Megaphone,
  Plus,
  Eye,
  Trash2,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle2,
  Calendar,
  Users,
  Target,
} from "lucide-react";
import type { PaginatedResponse } from "@/types";

interface CampaignListItem {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  completionRate: number;
  createdAt: string;
  _count?: {
    campaignModules: number;
    campaignUsers: number;
    campaignDepartments: number;
  };
}

function getStatusVariant(status: string): "success" | "warning" | "danger" | "info" | "default" | "purple" {
  switch (status) {
    case "ACTIVE": return "success";
    case "DRAFT": return "default";
    case "PAUSED": return "warning";
    case "COMPLETED": return "info";
    case "CANCELLED": return "danger";
    default: return "default";
  }
}

function getTypeVariant(type: string): "info" | "danger" | "warning" | "purple" {
  switch (type) {
    case "TRAINING": return "info";
    case "PHISHING_SIMULATION": return "danger";
    case "ASSESSMENT": return "warning";
    case "AWARENESS": return "purple";
    default: return "info";
  }
}

export default function AdminCampaignsPage() {
  const { isLoading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<CampaignListItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter) params.set("status", statusFilter);
    if (typeFilter) params.set("type", typeFilter);
    return `/api/campaigns?${params.toString()}`;
  }, [page, debouncedSearch, statusFilter, typeFilter]);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<CampaignListItem>>(buildUrl());

  const handleStatusChange = async (campaign: CampaignListItem, newStatus: string) => {
    setUpdatingStatus(campaign.id);
    try {
      await apiPut(`/api/campaigns/${campaign.id}`, { status: newStatus });
      toast.success(`Campaign ${newStatus.toLowerCase()} successfully`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update campaign status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/campaigns/${deleteTarget.id}`);
      toast.success("Campaign deleted successfully");
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete campaign");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Campaigns</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const campaigns = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  return (
    <div className="page-container">
      <PageHeader
        title="Campaign Management"
        description={`${total} total campaigns`}
        icon={Megaphone}
        action={
          <Link href="/admin/campaigns/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Campaign
          </Link>
        }
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search campaigns..."
          filters={[
            {
              label: "All Statuses",
              value: statusFilter,
              options: [
                { label: "Draft", value: "DRAFT" },
                { label: "Active", value: "ACTIVE" },
                { label: "Paused", value: "PAUSED" },
                { label: "Completed", value: "COMPLETED" },
                { label: "Cancelled", value: "CANCELLED" },
              ],
              onChange: (v) => { setStatusFilter(v); setPage(1); },
            },
            {
              label: "All Types",
              value: typeFilter,
              options: [
                { label: "Training", value: "TRAINING" },
                { label: "Phishing Simulation", value: "PHISHING_SIMULATION" },
                { label: "Assessment", value: "ASSESSMENT" },
                { label: "Awareness", value: "AWARENESS" },
              ],
              onChange: (v) => { setTypeFilter(v); setPage(1); },
            },
          ]}
        />
      </motion.div>

      {loading ? (
        <PageLoading />
      ) : campaigns.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No Campaigns Found"
          description={debouncedSearch ? "Try adjusting your search or filters." : "Create your first campaign to get started."}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {campaigns.map((campaign, idx) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card-hover p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/campaigns/${campaign.id}`}
                      className="text-white font-semibold hover:text-accent-blue transition-colors truncate block"
                    >
                      {campaign.name}
                    </Link>
                    {campaign.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{campaign.description}</p>
                    )}
                  </div>
                  <Badge variant={getStatusVariant(campaign.status)} size="sm">
                    {campaign.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Badge variant={getTypeVariant(campaign.type)} size="sm">
                    {campaign.type.replace(/_/g, " ")}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Completion</span>
                    <span>{Math.round(campaign.completionRate)}%</span>
                  </div>
                  <ProgressBar
                    value={campaign.completionRate}
                    color={campaign.completionRate >= 80 ? "green" : campaign.completionRate >= 50 ? "blue" : "yellow"}
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {campaign.startDate ? formatDate(campaign.startDate) : "Not set"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {campaign._count?.campaignUsers || 0} users
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {campaign._count?.campaignModules || 0} modules
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-auto pt-3 border-t border-gray-700/30">
                  <Link
                    href={`/admin/campaigns/${campaign.id}`}
                    className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-blue-400"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  {campaign.status === "DRAFT" && (
                    <button
                      onClick={() => handleStatusChange(campaign, "ACTIVE")}
                      disabled={updatingStatus === campaign.id}
                      className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-green-400"
                      title="Launch"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {campaign.status === "ACTIVE" && (
                    <button
                      onClick={() => handleStatusChange(campaign, "PAUSED")}
                      disabled={updatingStatus === campaign.id}
                      className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-yellow-400"
                      title="Pause"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  )}
                  {campaign.status === "PAUSED" && (
                    <button
                      onClick={() => handleStatusChange(campaign, "ACTIVE")}
                      disabled={updatingStatus === campaign.id}
                      className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-green-400"
                      title="Resume"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  {(campaign.status === "ACTIVE" || campaign.status === "PAUSED") && (
                    <button
                      onClick={() => handleStatusChange(campaign, "COMPLETED")}
                      disabled={updatingStatus === campaign.id}
                      className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-cyan-400"
                      title="Complete"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="flex-1" />
                  <button
                    onClick={() => setDeleteTarget(campaign)}
                    className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete Campaign"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}