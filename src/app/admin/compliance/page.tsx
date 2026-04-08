"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck, Download, FileJson, FileSpreadsheet,
  Users, BookOpen, GraduationCap, Shield, Search,
} from "lucide-react";

interface EmployeeData {
  id: string;
  user: { name: string; email: string; department: string; role: string; joinDate: string };
  modulesCompleted: { name: string; completionDate: string | null; progress: number }[];
  quizResults: { name: string; score: number; passed: boolean; date: string }[];
  phishingResults: { totalSimulations: number; clicked: number; reported: number; campaigns: string[] };
  certificates: { moduleName: string; score: number | null; issuedAt: string }[];
  complianceScore: number;
  moduleCompletionRate: number;
  quizPassRate: number;
  avgQuizScore: number;
}

interface ComplianceData {
  exportDate: string;
  summary: {
    totalEmployees: number;
    compliantEmployees: number;
    complianceRate: number;
    avgComplianceScore: number;
    avgQuizScore: number;
    avgModuleCompletionRate: number;
  };
  employees: EmployeeData[];
}

export default function CompliancePage() {
  const { isLoading: authLoading } = useAuth();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");

  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const qs = params.toString();

  const { data, loading, error, refetch } = useFetch<ComplianceData>(
    `/api/compliance/export${qs ? `?${qs}` : ""}`
  );

  if (authLoading || loading) return <PageLoading />;

  const downloadJSON = (userId?: string) => {
    const url = `/api/compliance/export${userId ? `?userId=${userId}` : ""}${qs ? `${userId ? "&" : "?"}${qs}` : ""}`;
    window.open(url, "_blank");
  };

  const downloadCSV = (userId?: string) => {
    const url = `/api/compliance/export/csv${userId ? `?userId=${userId}` : ""}${qs ? `${userId ? "&" : "?"}${qs}` : ""}`;
    window.open(url, "_blank");
  };

  const summary = data?.summary;
  const employees = (data?.employees || []).filter((e) =>
    !search || e.user.name.toLowerCase().includes(search.toLowerCase()) ||
    e.user.email.toLowerCase().includes(search.toLowerCase()) ||
    e.user.department.toLowerCase().includes(search.toLowerCase())
  );

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="success">{score}%</Badge>;
    if (score >= 60) return <Badge variant="warning">{score}%</Badge>;
    return <Badge variant="danger">{score}%</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compliance & Evidence"
        description="SOC 2 / ISO 27001 audit evidence and employee compliance tracking"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadJSON()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-xl transition-colors text-sm"
            >
              <FileJson className="w-4 h-4" /> Export JSON
            </button>
            <button
              onClick={() => downloadCSV()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-medium rounded-xl transition-colors text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export CSV
            </button>
          </div>
        }
      />

      {/* Date Range Filter */}
      <div className="sa-card rounded-2xl p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-medium sa-text-muted mb-1">From Date</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="sa-input rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium sa-text-muted mb-1">To Date</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="sa-input rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-accent-blue/10 text-accent-blue rounded-lg text-sm font-medium hover:bg-accent-blue/20 transition-colors"
          >
            Apply Filter
          </button>
          {(from || to) && (
            <button
              onClick={() => { setFrom(""); setTo(""); setTimeout(refetch, 50); }}
              className="px-4 py-2 sa-text-muted text-sm hover:sa-text-primary transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sa-stat-card bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span className="sa-text-muted text-sm">Compliant Employees</span>
            </div>
            <div className="text-2xl font-bold sa-text-primary">
              {summary.complianceRate}%
              <span className="text-sm sa-text-muted ml-2">
                ({summary.compliantEmployees}/{summary.totalEmployees})
              </span>
            </div>
          </div>
          <div className="sa-stat-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-green-400" />
              <span className="sa-text-muted text-sm">Avg Quiz Score</span>
            </div>
            <div className="text-2xl font-bold sa-text-primary">{summary.avgQuizScore}%</div>
          </div>
          <div className="sa-stat-card bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-purple-400" />
              <span className="sa-text-muted text-sm">Module Completion</span>
            </div>
            <div className="text-2xl font-bold sa-text-primary">{summary.avgModuleCompletionRate}%</div>
          </div>
          <div className="sa-stat-card bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span className="sa-text-muted text-sm">Avg Compliance Score</span>
            </div>
            <div className="text-2xl font-bold sa-text-primary">{summary.avgComplianceScore}%</div>
          </div>
        </div>
      )}

      {/* Employee Table */}
      <div className="sa-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold sa-text-primary">Employee Compliance</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 sa-text-muted" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sa-input rounded-lg pl-9 pr-3 py-2 text-sm w-64"
            />
          </div>
        </div>
        {employees.length === 0 ? (
          <p className="sa-text-muted text-sm text-center py-8">No employees found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="sa-table-header">
                  <th className="text-left text-sm font-medium py-3 px-4">Employee</th>
                  <th className="text-left text-sm font-medium py-3 px-4">Department</th>
                  <th className="text-center text-sm font-medium py-3 px-4">Modules</th>
                  <th className="text-center text-sm font-medium py-3 px-4">Quiz Avg</th>
                  <th className="text-center text-sm font-medium py-3 px-4">Phishing</th>
                  <th className="text-center text-sm font-medium py-3 px-4">Certs</th>
                  <th className="text-center text-sm font-medium py-3 px-4">Score</th>
                  <th className="text-center text-sm font-medium py-3 px-4">Export</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e, i) => (
                  <tr key={i} className="sa-table-row transition-colors">
                    <td className="py-3 px-4">
                      <div className="sa-text-primary text-sm font-medium">{e.user.name}</div>
                      <div className="sa-text-muted text-xs">{e.user.email}</div>
                    </td>
                    <td className="py-3 px-4 sa-text-secondary text-sm">{e.user.department}</td>
                    <td className="py-3 px-4 text-center sa-text-secondary text-sm">
                      {e.modulesCompleted.length}
                      <span className="sa-text-muted text-xs ml-1">({e.moduleCompletionRate}%)</span>
                    </td>
                    <td className="py-3 px-4 text-center sa-text-secondary text-sm">{e.avgQuizScore}%</td>
                    <td className="py-3 px-4 text-center text-sm">
                      {e.phishingResults.totalSimulations > 0 ? (
                        <span className={e.phishingResults.clicked > 0 ? "text-red-400" : "text-green-400"}>
                          {e.phishingResults.clicked}/{e.phishingResults.totalSimulations} clicked
                        </span>
                      ) : (
                        <span className="sa-text-muted">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center sa-text-secondary text-sm">{e.certificates.length}</td>
                    <td className="py-3 px-4 text-center">{getScoreBadge(e.complianceScore)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => downloadJSON(e.id)}
                        className="p-1.5 rounded-lg hover:bg-accent-blue/10 text-accent-blue transition-colors"
                        title="Export JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
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