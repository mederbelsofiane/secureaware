"use client";

import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/use-fetch";
import { PageLoading, TableSkeleton } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  ScrollText,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Calendar,
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userId: string;
  metadata: any;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface AuditLogsResponse {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const actionBadgeVariant: Record<string, "default" | "success" | "warning" | "danger" | "info" | "purple"> = {
  CREATE: "success",
  UPDATE: "info",
  DELETE: "danger",
  LOGIN: "purple",
  LOGOUT: "default",
  SUSPEND: "warning",
  ACTIVATE: "success",
};

function getActionVariant(action: string): "default" | "success" | "warning" | "danger" | "info" | "purple" {
  const upperAction = action.toUpperCase();
  for (const [key, variant] of Object.entries(actionBadgeVariant)) {
    if (upperAction.includes(key)) return variant;
  }
  return "default";
}

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const limit = 20;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(actionFilter && { action: actionFilter }),
    ...(entityFilter && { entity: entityFilter }),
    ...(dateFrom && { from: dateFrom }),
    ...(dateTo && { to: dateTo }),
  }).toString();

  const {
    data: logsData,
    loading,
    error,
    refetch,
  } = useFetch<AuditLogsResponse>(`/api/super-admin/audit-logs?${queryParams}`);

  useEffect(() => {
    setPage(1);
  }, [actionFilter, entityFilter, dateFrom, dateTo]);

  return (
    <div className="page-container">
      <PageHeader
        title="Audit Logs"
        description="Track all system activities and changes across the platform."
        icon={ScrollText}
      />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-4 mb-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-400">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action Filter */}
          <div>
            <label className="label-text">Action</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="e.g. CREATE, DELETE"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Entity Filter */}
          <div>
            <label className="label-text">Entity</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="e.g. ORGANIZATION, USER"
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Date From */}
          <div>
            <label className="label-text">Date From</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          {/* Date To */}
          <div>
            <label className="label-text">Date To</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters */}
        {(actionFilter || entityFilter || dateFrom || dateTo) && (
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => {
                setActionFilter("");
                setEntityFilter("");
                setDateFrom("");
                setDateTo("");
              }}
              className="text-sm text-gray-400 hover:text-purple-400 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <TableSkeleton rows={10} />
        ) : error ? (
          <div className="glass-card p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Audit Logs</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button onClick={refetch} className="btn-primary">Retry</button>
          </div>
        ) : !logsData || logsData.items.length === 0 ? (
          <div className="glass-card">
            <EmptyState
              icon={ScrollText}
              title="No Audit Logs Found"
              description={
                actionFilter || entityFilter || dateFrom || dateTo
                  ? "Try adjusting your filters to find the logs you’re looking for."
                  : "System activity logs will appear here as actions are performed."
              }
            />
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700/50 bg-dark-800/50">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entity ID
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {logsData.items.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-dark-700/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className="text-sm text-gray-500 font-mono cursor-help"
                          title={log.id}
                        >
                          {log.id.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={getActionVariant(log.action)}
                          size="sm"
                        >
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-300 font-medium">
                          {log.entity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {log.entityId ? (
                          <span
                            className="text-sm text-gray-500 font-mono cursor-help"
                            title={log.entityId}
                          >
                            {log.entityId.slice(0, 8)}…
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <span className="text-sm text-gray-300">
                            {log.user?.name || "—"}
                          </span>
                          {log.user?.email && (
                            <p className="text-xs text-gray-500">
                              {log.user.email}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formatDateTime(log.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logsData.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-700/50">
                <p className="text-sm text-gray-500">
                  Showing{" "}
                  <span className="text-gray-300">
                    {(logsData.page - 1) * logsData.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-gray-300">
                    {Math.min(logsData.page * logsData.limit, logsData.total)}
                  </span>{" "}
                  of{" "}
                  <span className="text-gray-300">{logsData.total}</span>{" "}
                  logs
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(logsData.totalPages, 5) },
                      (_, i) => {
                        let pageNum: number;
                        if (logsData.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= logsData.totalPages - 2) {
                          pageNum = logsData.totalPages - 4 + i;
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
                                : "text-gray-400 hover:text-white hover:bg-dark-700/50"
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
                      setPage((p) => Math.min(logsData.totalPages, p + 1))
                    }
                    disabled={page >= logsData.totalPages}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
