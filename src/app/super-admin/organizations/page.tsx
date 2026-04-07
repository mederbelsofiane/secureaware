"use client";

import { useState, useEffect, useCallback } from "react";
import { useFetch, apiPost, apiPut } from "@/hooks/use-fetch";
import { PageLoading, TableSkeleton } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  Eye,
  Edit3,
  ShieldCheck,
  ShieldOff,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  maxUsers: number;
  domain: string | null;
  billingEmail: string | null;
  createdAt: string;
  _count: { users: number };
}

interface OrgsResponse {
  items: Organization[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const planBadgeVariant: Record<string, "default" | "info" | "purple" | "warning"> = {
  FREE: "default",
  STARTER: "info",
  PROFESSIONAL: "purple",
  ENTERPRISE: "warning",
};

const statusBadgeVariant: Record<string, "success" | "warning" | "danger"> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  INACTIVE: "danger",
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function OrganizationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const limit = 20;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(statusFilter && { status: statusFilter }),
    ...(planFilter && { plan: planFilter }),
  }).toString();

  const {
    data: orgsData,
    loading,
    error,
    refetch,
  } = useFetch<OrgsResponse>(`/api/super-admin/organizations?${queryParams}`);

  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    plan: "FREE",
    maxUsers: 10,
    domain: "",
    billingEmail: "",
    notes: "",
  });

  const handleNameChange = (name: string) => {
    setCreateForm((prev) => ({
      ...prev,
      name,
      slug: slugify(name),
    }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.slug.trim()) {
      toast.error("Name and slug are required");
      return;
    }
    setCreating(true);
    try {
      await apiPost("/api/super-admin/organizations", {
        name: createForm.name.trim(),
        slug: createForm.slug.trim(),
        plan: createForm.plan,
        maxUsers: Number(createForm.maxUsers),
        ...(createForm.domain && { domain: createForm.domain.trim() }),
        ...(createForm.billingEmail && { billingEmail: createForm.billingEmail.trim() }),
        ...(createForm.notes && { notes: createForm.notes.trim() }),
      });
      toast.success("Organization created successfully");
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        slug: "",
        plan: "FREE",
        maxUsers: 10,
        domain: "",
        billingEmail: "",
        notes: "",
      });
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to create organization");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (org: Organization) => {
    const newStatus = org.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setTogglingId(org.id);
    try {
      await apiPut(`/api/super-admin/organizations/${org.id}`, {
        status: newStatus,
      });
      toast.success(
        `Organization ${newStatus === "ACTIVE" ? "activated" : "suspended"} successfully`
      );
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update organization status");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      setPage(1);
      refetch();
    }
  };

  useEffect(() => {
    setPage(1);
  }, [statusFilter, planFilter]);

  return (
    <div className="page-container sa-page-content">
      <PageHeader
        title="Organizations"
        description="Manage all organizations on the platform."
        icon={Building2}
        action={
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Organization
          </button>
        }
      />

      {/* Filters Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-4 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              className="input-field pl-10 w-full"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field min-w-[160px]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="INACTIVE">Inactive</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="input-field min-w-[160px]"
          >
            <option value="">All Plans</option>
            <option value="FREE">Free</option>
            <option value="STARTER">Starter</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <TableSkeleton rows={8} />
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={refetch} className="btn-primary">
              Retry
            </button>
          </div>
        ) : !orgsData || orgsData.items.length === 0 ? (
          <div className="glass-card">
            <EmptyState
              icon={Building2}
              title="No Organizations Found"
              description={
                search || statusFilter || planFilter
                  ? "Try adjusting your search or filters."
                  : "Create your first organization to get started."
              }
              action={
                !search && !statusFilter && !planFilter
                  ? {
                      label: "Create Organization",
                      onClick: () => setShowCreateModal(true),
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700/50 bg-dark-800/50 sa-table-header-row">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider sa-table-header">
                      Name
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider sa-table-header">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider sa-table-header">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider sa-table-header">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider sa-table-header">
                      Users
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider sa-table-header">
                      Created
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right sa-table-header">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30 sa-table-body">
                  {orgsData.items.map((org) => (
                    <tr
                      key={org.id}
                      className="hover:bg-dark-700/30 transition-colors sa-table-row"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-200 sa-table-cell-primary">
                          {org.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-400 font-mono sa-table-cell">
                          {org.slug}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={planBadgeVariant[org.plan] || "default"}
                          size="sm"
                        >
                          {org.plan}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={statusBadgeVariant[org.status] || "default"}
                          size="sm"
                        >
                          {org.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-300 sa-table-cell">
                          {org._count.users}
                          <span className="text-gray-500">/{org.maxUsers}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 sa-text-muted">
                          {formatDate(org.createdAt)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/super-admin/organizations/${org.id}`}
                            className="p-2 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors sa-action-btn"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/super-admin/organizations/${org.id}`}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(org)}
                            disabled={togglingId === org.id}
                            className={`p-2 rounded-lg transition-colors ${
                              org.status === "ACTIVE"
                                ? "text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 sa-action-btn"
                                : "text-gray-400 hover:text-green-400 hover:bg-green-500/10 sa-action-btn"
                            } disabled:opacity-50`}
                            title={
                              org.status === "ACTIVE" ? "Suspend" : "Activate"
                            }
                          >
                            {togglingId === org.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : org.status === "ACTIVE" ? (
                              <ShieldOff className="w-4 h-4" />
                            ) : (
                              <ShieldCheck className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {orgsData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700/50 sa-divider">
                <p className="text-sm text-gray-500 sa-text-muted">
                  Showing{" "}
                  <span className="text-gray-300 sa-table-cell">
                    {(orgsData.page - 1) * orgsData.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-gray-300 sa-table-cell">
                    {Math.min(orgsData.page * orgsData.limit, orgsData.total)}
                  </span>{" "}
                  of{" "}
                  <span className="text-gray-300 sa-table-cell">{orgsData.total}</span>{" "}
                  organizations
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed sa-pagination-btn"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(orgsData.totalPages, 5) },
                      (_, i) => {
                        let pageNum: number;
                        if (orgsData.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= orgsData.totalPages - 2) {
                          pageNum = orgsData.totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              page === pageNum
                                ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                                : "text-gray-400 hover:text-white hover:bg-dark-700/50 sa-pagination-btn"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}
                  </div>
                  <button
                    onClick={() =>
                      setPage((p) => Math.min(orgsData.totalPages, p + 1))
                    }
                    disabled={page >= orgsData.totalPages}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed sa-pagination-btn"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg glass-card p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white sa-section-title">
                Create Organization
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors sa-action-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="label-text">Organization Name *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-field w-full"
                  placeholder="Acme Corporation"
                  required
                />
              </div>

              {/* Slug */}
              <div>
                <label className="label-text">Slug *</label>
                <input
                  type="text"
                  value={createForm.slug}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  className="input-field w-full font-mono"
                  placeholder="acme-corporation"
                  required
                />
                <p className="text-xs text-gray-500 mt-1 sa-text-muted">
                  Auto-generated from name. Must be unique.
                </p>
              </div>

              {/* Plan & Max Users */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Plan *</label>
                  <select
                    value={createForm.plan}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        plan: e.target.value,
                      }))
                    }
                    className="input-field w-full"
                  >
                    <option value="FREE">Free</option>
                    <option value="STARTER">Starter</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Max Users *</label>
                  <input
                    type="number"
                    value={createForm.maxUsers}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        maxUsers: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="input-field w-full"
                    min={1}
                    required
                  />
                </div>
              </div>

              {/* Domain */}
              <div>
                <label className="label-text">Domain</label>
                <input
                  type="text"
                  value={createForm.domain}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      domain: e.target.value,
                    }))
                  }
                  className="input-field w-full"
                  placeholder="acme.com"
                />
              </div>

              {/* Billing Email */}
              <div>
                <label className="label-text">Billing Email</label>
                <input
                  type="email"
                  value={createForm.billingEmail}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      billingEmail: e.target.value,
                    }))
                  }
                  className="input-field w-full"
                  placeholder="billing@acme.com"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="label-text">Notes</label>
                <textarea
                  value={createForm.notes}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  className="input-field w-full min-h-[80px] resize-y"
                  placeholder="Optional notes about this organization..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors sa-btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex items-center gap-2 disabled:opacity-50"
                >
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {creating ? "Creating..." : "Create Organization"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
