"use client";

import { useFetch } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatDateTime } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Crown,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers,
} from "lucide-react";

interface SuperAdminStats {
  totalOrganizations: number;
  activeOrganizations: number;
  suspendedOrganizations: number;
  inactiveOrganizations: number;
  totalUsers: number;
  orgsByPlan: {
    FREE: number;
    STARTER: number;
    PROFESSIONAL: number;
    ENTERPRISE: number;
  };
  recentOrganizations: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: string;
    createdAt: string;
    _count: { users: number };
  }[];
  recentAuditLogs: {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    userId: string;
    createdAt: string;
    user?: { name: string; email: string };
  }[];
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

export default function SuperAdminDashboard() {
  const {
    data: stats,
    loading,
    error,
    refetch,
  } = useFetch<SuperAdminStats>("/api/super-admin/stats");

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">
            Failed to Load Dashboard
          </h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return <PageLoading />;

  return (
    <div className="page-container">
      <PageHeader
        title="Super Admin Dashboard"
        description="Platform-wide overview of all organizations and system activity."
        icon={Crown}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <StatCard
            title="Total Organizations"
            value={stats.totalOrganizations}
            icon={Building2}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <StatCard
            title="Active Organizations"
            value={stats.activeOrganizations}
            icon={CheckCircle2}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatCard
            title="Suspended Organizations"
            value={stats.suspendedOrganizations}
            icon={AlertTriangle}
          />
        </motion.div>
      </div>

      {/* Plan Distribution + Recent Orgs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Plan Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-6">
            <Layers className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">
              Organizations by Plan
            </h3>
          </div>
          <div className="space-y-4">
            {Object.entries(stats.orgsByPlan).map(([plan, count]) => {
              const total = stats.totalOrganizations || 1;
              const percentage = Math.round((count / total) * 100);
              const colors: Record<string, string> = {
                FREE: "bg-gray-500",
                STARTER: "bg-blue-500",
                PROFESSIONAL: "bg-purple-500",
                ENTERPRISE: "bg-yellow-500",
              };
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant={planBadgeVariant[plan] || "default"} size="sm">
                        {plan}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium text-gray-300">
                      {count}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-dark-700">
                    <div
                      className={`h-2 rounded-full ${colors[plan] || "bg-gray-500"} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Organizations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">
                Recent Organizations
              </h3>
            </div>
            <Link
              href="/super-admin/organizations"
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.recentOrganizations && stats.recentOrganizations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700/50">
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/30">
                  {stats.recentOrganizations.map((org) => (
                    <tr
                      key={org.id}
                      className="hover:bg-dark-700/30 transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <Link
                          href={`/super-admin/organizations/${org.id}`}
                          className="text-sm font-medium text-gray-200 hover:text-purple-400 transition-colors"
                        >
                          {org.name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-gray-400">
                          {org.slug}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant={planBadgeVariant[org.plan] || "default"}
                          size="sm"
                        >
                          {org.plan}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-sm text-gray-300">
                          {org._count.users}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-gray-500">
                          {formatDate(org.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Building2}
              title="No Organizations Yet"
              description="Organizations will appear here once created."
            />
          )}
        </motion.div>
      </div>

      {/* Recent Audit Logs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">
              Recent Audit Logs
            </h3>
          </div>
          <Link
            href="/super-admin/audit-logs"
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {stats.recentAuditLogs && stats.recentAuditLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-700/50">
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity
                  </th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entity ID
                  </th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="pb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {stats.recentAuditLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-dark-700/30 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <Badge variant="purple" size="sm">
                        {log.action}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm text-gray-300">
                        {log.entity}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm text-gray-500 font-mono">
                        {log.entityId ? log.entityId.slice(0, 8) + "..." : "-"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-sm text-gray-300">
                        {log.user?.name || log.user?.email || "-"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-500">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No Audit Logs"
            description="System activity logs will appear here."
          />
        )}
      </motion.div>
    </div>
  );
}
