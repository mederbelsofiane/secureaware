"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  CheckCircle2,
  Trophy,
  AlertTriangle,
  Megaphone,
  Activity,
  FileText,
  Settings,
  GraduationCap,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AdminStats } from "@/types";

interface ReportData {
  departmentStats: {
    name: string;
    employeeCount: number;
    avgScore: number;
    completionRate: number;
    highRiskCount: number;
  }[];
  completionTrend: {
    month: string;
    completions: number;
    quizzes: number;
    users: number;
  }[];
}

const quickActions = [
  { label: "Manage Users", href: "/admin/users", icon: Users, color: "bg-blue-500/20 text-blue-400" },
  { label: "Quizzes", href: "/admin/quizzes", icon: ClipboardList, color: "bg-emerald-500/20 text-emerald-400" },
  { label: "Campaigns", href: "/admin/campaigns", icon: Megaphone, color: "bg-purple-500/20 text-purple-400" },
  { label: "Reports", href: "/admin/reports", icon: FileText, color: "bg-amber-500/20 text-amber-400" },
  { label: "Contacts", href: "/admin/contacts", icon: GraduationCap, color: "bg-cyan-500/20 text-cyan-400" },
  { label: "Settings", href: "/admin/settings", icon: Settings, color: "bg-gray-500/20 text-gray-400" },
];

function getActivityIcon(type: string) {
  switch (type) {
    case "MODULE_COMPLETED":
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case "QUIZ_COMPLETED":
      return <Trophy className="w-4 h-4 text-blue-400" />;
    case "QUIZ_FAILED":
      return <AlertTriangle className="w-4 h-4 text-red-400" />;
    case "BADGE_EARNED":
      return <Trophy className="w-4 h-4 text-yellow-400" />;
    case "LOGIN":
      return <UserCheck className="w-4 h-4 text-cyan-400" />;
    default:
      return <Activity className="w-4 h-4 text-gray-400" />;
  }
}

function getActivityBadgeVariant(type: string): "success" | "info" | "danger" | "warning" | "default" | "purple" {
  switch (type) {
    case "MODULE_COMPLETED":
    case "CERTIFICATE_EARNED":
      return "success";
    case "QUIZ_COMPLETED":
      return "info";
    case "QUIZ_FAILED":
      return "danger";
    case "BADGE_EARNED":
      return "warning";
    case "LOGIN":
      return "purple";
    default:
      return "default";
  }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 border border-gray-700/50 !bg-slate-900/95">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } =
    useFetch<AdminStats>("/api/stats");
  const { data: reports, loading: reportsLoading } =
    useFetch<ReportData>("/api/reports");

  if (authLoading || statsLoading) return <PageLoading />;

  if (statsError) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Dashboard</h3>
          <p className="text-gray-400 mb-4">{statsError}</p>
          <button onClick={refetchStats} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!stats) return <PageLoading />;

  const trendData = reports?.completionTrend || [];
  const deptData = reports?.departmentStats || [];

  return (
    <div className="page-container">
      <PageHeader
        title="Admin Dashboard"
        description={`Welcome back, ${user?.name || "Admin"}. Here's your platform overview.`}
        icon={LayoutDashboard}
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard title="Active Users" value={stats.activeUsers} icon={UserCheck} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard title="Completion Rate" value={`${Math.round(stats.completionRate)}%`} icon={CheckCircle2} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard title="Avg Quiz Score" value={`${Math.round(stats.averageQuizScore)}%`} icon={Trophy} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <StatCard title="High-Risk Users" value={stats.highRiskUsers} icon={AlertTriangle} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <StatCard title="Total Campaigns" value={stats.totalCampaigns} icon={Megaphone} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <StatCard title="Training Modules" value={stats.totalModules} icon={GraduationCap} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <StatCard title="Total Quizzes" value={stats.totalQuizzes} icon={ClipboardList} />
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Completion Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent-blue" />
            <h3 className="text-lg font-semibold text-white">Completion Trends</h3>
          </div>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completions"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  name="Completions"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="quizzes"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Quizzes"
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="New Users"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No trend data available
            </div>
          )}
        </motion.div>

        {/* Department Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-semibold text-white">Department Performance</h3>
          </div>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} angle={-20} textAnchor="end" height={60} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="avgScore" fill="#06b6d4" name="Avg Score" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completionRate" fill="#10b981" name="Completion %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              No department data available
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-dark-700/50 hover:bg-dark-600/50 border border-gray-700/30 hover:border-gray-600/50 transition-all group"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-400 group-hover:text-gray-300 text-center font-medium">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            <Link href="/admin/reports" className="text-sm text-accent-blue hover:text-cyan-300 flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {stats.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {stats.recentActivities.map((activity: any) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-dark-700/30 hover:bg-dark-700/50 transition-colors"
                >
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-200 truncate">
                        {activity.user?.name || "Unknown User"}
                      </span>
                      <Badge variant={getActivityBadgeVariant(activity.type)} size="sm">
                        {activity.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.target}</p>
                  </div>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {formatDateTime(activity.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Activity}
              title="No Recent Activity"
              description="Platform activity will appear here as users interact with the system."
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}