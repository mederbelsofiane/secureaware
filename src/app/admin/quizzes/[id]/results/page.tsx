"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { DataTable, type Column } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime, getInitials } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BarChart3,
  ArrowLeft,
  AlertTriangle,
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface QuizResultItem {
  id: string;
  score: number;
  passed: boolean;
  timeTaken: number | null;
  attemptNum: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface QuizResultsData {
  quiz: {
    id: string;
    title: string;
    passingScore: number;
    timeLimitMins: number | null;
  };
  results: QuizResultItem[];
}

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 border border-gray-700/50 !bg-slate-900/95">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      {payload.map((entry: any, idx: number) => (
        <p key={idx} className="text-sm font-medium" style={{ color: entry.color || entry.fill }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export default function QuizResultsPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoading: authLoading } = useAuth();
  const { data, loading, error, refetch } = useFetch<QuizResultsData>(`/api/quizzes/${id}/results`);

  if (authLoading || loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Results</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={refetch} className="btn-primary">Retry</button>
            <Link href={`/admin/quizzes/${id}`} className="btn-secondary">Back to Quiz</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <PageLoading />;

  const { quiz, results } = data;
  const totalSubmissions = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = totalSubmissions - passedCount;
  const passRate = totalSubmissions > 0 ? Math.round((passedCount / totalSubmissions) * 100) : 0;
  const avgScore = totalSubmissions > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalSubmissions)
    : 0;
  const avgTime = totalSubmissions > 0
    ? Math.round(
        results.filter((r) => r.timeTaken).reduce((sum, r) => sum + (r.timeTaken || 0), 0) /
          results.filter((r) => r.timeTaken).length || 0
      )
    : 0;

  // Score distribution for bar chart
  const scoreBuckets = [
    { range: "0-20", count: 0 },
    { range: "21-40", count: 0 },
    { range: "41-60", count: 0 },
    { range: "61-80", count: 0 },
    { range: "81-100", count: 0 },
  ];
  results.forEach((r) => {
    const s = Math.round(r.score);
    if (s <= 20) scoreBuckets[0].count++;
    else if (s <= 40) scoreBuckets[1].count++;
    else if (s <= 60) scoreBuckets[2].count++;
    else if (s <= 80) scoreBuckets[3].count++;
    else scoreBuckets[4].count++;
  });

  const passFailData = [
    { name: "Passed", value: passedCount },
    { name: "Failed", value: failedCount },
  ];

  const columns: Column<QuizResultItem>[] = [
    {
      key: "user",
      label: "User",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-xs font-bold">
            {getInitials(r.user.name)}
          </div>
          <div>
            <Link href={`/admin/users/${r.user.id}`} className="text-sm font-medium text-white hover:text-accent-blue">
              {r.user.name}
            </Link>
            <p className="text-xs text-gray-500">{r.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "score",
      label: "Score",
      sortable: true,
      render: (r) => (
        <span className={`text-sm font-bold ${r.passed ? "text-emerald-400" : "text-red-400"}`}>
          {Math.round(r.score)}%
        </span>
      ),
    },
    {
      key: "passed",
      label: "Result",
      render: (r) => (
        <Badge variant={r.passed ? "success" : "danger"}>
          {r.passed ? "Passed" : "Failed"}
        </Badge>
      ),
    },
    {
      key: "attemptNum",
      label: "Attempt",
      render: (r) => <span className="text-sm text-gray-400">#{r.attemptNum}</span>,
    },
    {
      key: "timeTaken",
      label: "Time",
      render: (r) => (
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          {r.timeTaken ? `${Math.floor(r.timeTaken / 60)}m ${r.timeTaken % 60}s` : "—"}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Date",
      sortable: true,
      render: (r) => <span className="text-sm text-gray-500">{formatDateTime(r.createdAt)}</span>,
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title={`Results: ${quiz.title}`}
        description={`Passing score: ${quiz.passingScore}%`}
        icon={BarChart3}
        action={
          <div className="flex items-center gap-2">
            <Link href={`/admin/quizzes/${id}`} className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Quiz
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <StatCard title="Total Submissions" value={totalSubmissions} icon={Users} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <StatCard title="Pass Rate" value={`${passRate}%`} icon={Target} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <StatCard title="Avg Score" value={`${avgScore}%`} icon={Trophy} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <StatCard title="Avg Time" value={avgTime > 0 ? `${Math.floor(avgTime / 60)}m` : "—"} icon={Clock} />
        </motion.div>
      </div>

      {/* Charts */}
      {totalSubmissions > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#06b6d4" name="Submissions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Pass / Fail Ratio</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {passFailData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value) => <span className="text-gray-400 text-sm">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {/* Results Table */}
      {totalSubmissions > 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 className="text-lg font-semibold text-white mb-4">All Submissions</h3>
          <DataTable columns={columns} data={results} keyField="id" />
        </motion.div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="No Submissions Yet"
          description="No one has taken this quiz yet. Results will appear here once users submit their answers."
        />
      )}
    </div>
  );
}