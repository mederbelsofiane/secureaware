"use client";

import { useAuth } from "@/hooks/use-auth";
import { useFetch } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { Fish, Send, Eye, MousePointerClick, Flag, ArrowRight, Plus, BarChart3 } from "lucide-react";

interface DashboardData {
  stats: { totalSimulations: number; totalSent: number; openRate: number; clickRate: number; reportRate: number };
  campaigns: { id: string; name: string; status: string; createdAt: string; _count: { phishingEvents: number; campaignUsers: number } }[];
  departments: { name: string; sent: number; clicked: number; reported: number }[];
  trend: { month: string; sent: number; opened: number; clicked: number; reported: number }[];
}

export default function PhishingDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data, loading, error } = useFetch<DashboardData>("/api/phishing/dashboard");

  if (authLoading || loading) return <PageLoading />;

  const stats = data?.stats;
  const campaigns = data?.campaigns || [];
  const departments = data?.departments || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phishing Simulations"
        description="Monitor and manage phishing awareness campaigns across your organization."
       action={
          <div className="flex gap-3">
          <Link
            href="/admin/phishing/templates"
            className="bg-dark-700 hover:bg-dark-600 text-white font-medium px-4 py-2.5 rounded-xl transition-colors border border-gray-600/50 flex items-center gap-2 text-sm"
          >
            <Fish className="w-4 h-4" />
            Templates
          </Link>
          <Link
            href="/admin/phishing/campaigns/new"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </Link>
        </div>
        } />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.totalSent || 0}</div>
          <div className="text-gray-400 text-sm">Total Sent</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.openRate || 0}%</div>
          <div className="text-gray-400 text-sm">Open Rate</div>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.clickRate || 0}%</div>
          <div className="text-gray-400 text-sm">Click Rate</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Flag className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white">{stats?.reportRate || 0}%</div>
          <div className="text-gray-400 text-sm">Report Rate</div>
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-dark-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Campaigns</h2>
          <Link href="/admin/phishing/campaigns" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {campaigns.length === 0 ? (
          <EmptyState title="No campaigns yet" description="Create your first phishing simulation campaign to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Campaign</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Status</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Targets</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Created</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4"></th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr key={c.id} className="border-b border-gray-700/30 hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{c.name}</td>
                    <td className="py-3 px-4">
                      <Badge variant={c.status === "ACTIVE" ? "success" : c.status === "COMPLETED" ? "info" : "default"}>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{c._count.campaignUsers}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">{formatDateTime(c.createdAt)}</td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/phishing/campaigns/${c.id}`} className="text-cyan-400 hover:text-cyan-300 text-sm">
                        View Results
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Department Breakdown */}
      {departments.length > 0 && (
        <div className="bg-dark-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Department Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.name} className="bg-dark-900/50 border border-gray-700/30 rounded-xl p-4">
                <h3 className="text-white font-medium mb-3">{dept.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sent</span>
                    <span className="text-white">{dept.sent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Clicked</span>
                    <span className="text-amber-400">{dept.clicked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Reported</span>
                    <span className="text-green-400">{dept.reported}</span>
                  </div>
                  {dept.sent > 0 && (
                    <div className="pt-2 border-t border-gray-700/30">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Click Rate</span>
                        <span className="text-amber-400">{Math.round((dept.clicked / dept.sent) * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
