"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ProgressBar } from "@/components/ui/progress-bar";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  BarChart3,
  AlertTriangle,
  Download,
  Users,
  GraduationCap,
  ShieldAlert,
  TrendingUp,
  Building2,
  PieChart,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

interface DepartmentStat {
  name: string;
  employeeCount: number;
  avgScore: number;
  completionRate: number;
  highRiskCount: number;
}

interface CompletionTrend {
  month: string;
  completions: number;
  quizzes: number;
  users: number;
}

interface RiskDistribution {
  level: string;
  count: number;
}

interface ReportData {
  departmentStats: DepartmentStat[];
  completionTrend: CompletionTrend[];
  riskDistribution: RiskDistribution[];
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalModules: number;
    averageScore: number;
    completionRate: number;
    highRiskUsers: number;
  };
}

const RISK_COLORS: Record<string, string> = {
  LOW: "#10b981",
  MEDIUM: "#f59e0b",
  HIGH: "#ef4444",
  CRITICAL: "#dc2626",
};

const CHART_COLORS = ["#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: "#1e293b",
    border: "1px solid rgba(100,116,139,0.3)",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "12px",
  },
  labelStyle: { color: "#94a3b8" },
};

export default function AdminReportsPage() {
  const { isLoading: authLoading } = useAuth();
  const { data: report, loading, error, refetch } = useFetch<ReportData>("/api/reports");
  const [activeChart, setActiveChart] = useState<"trend" | "departments" | "risk">("trend");

  const exportCSV = () => {
    if (!report) return;
    try {
      const headers = ["Department", "Employees", "Avg Score", "Completion Rate", "High Risk Count"];
      const rows = report.departmentStats.map((d) =>
        [d.name, d.employeeCount, d.avgScore.toFixed(1), d.completionRate.toFixed(1) + "%", d.highRiskCount].join(",")
      );
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Report exported successfully");
    } catch {
      toast.error("Failed to export report");
    }
  };

  if (authLoading || loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Reports</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!report) return <PageLoading />;

  const overview = report.overview;
  const deptStats = report.departmentStats || [];
  const trendData = report.completionTrend || [];
  const riskData = report.riskDistribution || [];

  const deptColumns: Column<DepartmentStat>[] = [
    {
      key: "name",
      label: "Department",
      render: (d) => (
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-white">{d.name}</span>
        </div>
      ),
    },
    {
      key: "employeeCount",
      label: "Employees",
      sortable: true,
      render: (d) => <span className="text-sm text-gray-400">{d.employeeCount}</span>,
    },
    {
      key: "avgScore",
      label: "Avg Score",
      sortable: true,
      render: (d) => (
        <span className={`text-sm font-medium ${d.avgScore >= 80 ? "text-emerald-400" : d.avgScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
          {d.avgScore.toFixed(1)}%
        </span>
      ),
    },
    {
      key: "completionRate",
      label: "Completion",
      sortable: true,
      render: (d) => (
        <div className="w-32">
          <ProgressBar
            value={d.completionRate}
            color={d.completionRate >= 80 ? "green" : d.completionRate >= 50 ? "yellow" : "red"}
            size="sm"
            showLabel
          />
        </div>
      ),
    },
    {
      key: "highRiskCount",
      label: "High Risk",
      sortable: true,
      render: (d) => (
        d.highRiskCount > 0
          ? <Badge variant="danger">{d.highRiskCount}</Badge>
          : <Badge variant="success">0</Badge>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Reports & Analytics"
        description="Comprehensive security awareness metrics"
        icon={BarChart3}
        action={
          <button onClick={exportCSV} className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        }
      />

      {/* Overview Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard title="Total Users" value={overview.totalUsers} icon={Users} />
        <StatCard title="Active Users" value={overview.activeUsers} icon={Activity} />
        <StatCard title="Modules" value={overview.totalModules} icon={GraduationCap} />
        <StatCard title="Avg Score" value={`${overview.averageScore.toFixed(1)}%`} icon={TrendingUp} />
        <StatCard title="Completion" value={`${overview.completionRate.toFixed(1)}%`} icon={PieChart} />
        <StatCard title="High Risk" value={overview.highRiskUsers} icon={ShieldAlert} />
      </motion.div>

      {/* Chart Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
        <div className="flex items-center gap-2 mb-6">
          {([
            { key: "trend", label: "Completion Trends", icon: TrendingUp },
            { key: "departments", label: "Department Comparison", icon: Building2 },
            { key: "risk", label: "Risk Distribution", icon: ShieldAlert },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveChart(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeChart === tab.key
                  ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                  : "text-gray-400 hover:text-gray-300 hover:bg-dark-700/50 border border-transparent"
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="h-[350px]">
          {activeChart === "trend" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="completionsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="quizzesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "rgba(100,116,139,0.3)" }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "rgba(100,116,139,0.3)" }} />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                <Area type="monotone" dataKey="completions" stroke="#06b6d4" fill="url(#completionsGrad)" name="Completions" />
                <Area type="monotone" dataKey="quizzes" stroke="#10b981" fill="url(#quizzesGrad)" name="Quizzes" />
                <Line type="monotone" dataKey="users" stroke="#8b5cf6" name="New Users" strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeChart === "departments" && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptStats} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.15)" />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "rgba(100,116,139,0.3)" }} domain={[0, 100]} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "rgba(100,116,139,0.3)" }} width={120} />
                <Tooltip {...chartTooltipStyle} />
                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                <Bar dataKey="avgScore" fill="#06b6d4" name="Avg Score" radius={[0, 4, 4, 0]} />
                <Bar dataKey="completionRate" fill="#10b981" name="Completion %" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChart === "risk" && (
            <div className="flex items-center justify-center h-full gap-12">
              <ResponsiveContainer width="50%" height="100%">
                <RechartsPie>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="level"
                    label={({ level, count }) => `${level}: ${count}`}
                  >
                    {riskData.map((entry, idx) => (
                      <Cell key={idx} fill={RISK_COLORS[entry.level] || CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...chartTooltipStyle} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="space-y-3">
                {riskData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: RISK_COLORS[entry.level] || CHART_COLORS[idx % CHART_COLORS.length] }}
                    />
                    <span className="text-sm text-gray-400">{entry.level}</span>
                    <span className="text-sm font-semibold text-white">{entry.count} users</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Department Stats Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-400" /> Department Statistics
        </h3>
        {deptStats.length > 0 ? (
          <DataTable columns={deptColumns} data={deptStats} keyField="name" />
        ) : (
          <div className="glass-card p-8 text-center">
            <Building2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No department data available</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}