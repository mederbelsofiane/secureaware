"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFetch, apiPost } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Template { id: string; name: string; subject: string; difficulty: string; }
interface UserItem { id: string; name: string; email: string; department?: { name: string } | null; }
interface DeptItem { id: string; name: string; employeeCount: number; }

export default function NewPhishingCampaignPage() {
  const { isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { data: templates, loading: tLoading } = useFetch<Template[]>("/api/phishing/templates");
  const { data: usersData, loading: uLoading } = useFetch<{ items: UserItem[] } | UserItem[]>("/api/users?all=true");
  const { data: departments, loading: dLoading } = useFetch<DeptItem[]>("/api/departments");

  const [form, setForm] = useState({ name: "", description: "", templateId: "", scheduledAt: "", staggerMinutes: 5 });
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectedDepts, setSelectedDepts] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading || tLoading || uLoading || dLoading) return <PageLoading />;

  const users: UserItem[] = Array.isArray(usersData) ? usersData : (usersData as { items: UserItem[] })?.items || [];

  const toggleUser = (id: string) => {
    const next = new Set(selectedUsers);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedUsers(next);
  };
  const toggleDept = (id: string) => {
    const next = new Set(selectedDepts);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedDepts(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.templateId) { setError("Please select a template"); return; }
    if (selectedUsers.size === 0 && selectedDepts.size === 0) { setError("Please select at least one user or department"); return; }
    setSaving(true); setError(null);
    try {
      const result = await apiPost<{ campaign: { id: string } }>("/api/phishing/campaigns", {
        ...form, userIds: Array.from(selectedUsers), departmentIds: Array.from(selectedDepts),
      });
      router.push(`/admin/phishing/campaigns/${result.campaign.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to create campaign"); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Phishing Campaign" description="Set up a new phishing simulation campaign." action={
          <Link href="/admin/phishing" className="text-gray-400 hover:text-white flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        } />

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campaign Details */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Campaign Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Campaign Name *</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" placeholder="Q2 Phishing Assessment" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Template *</label>
              <select required value={form.templateId} onChange={(e) => setForm({...form, templateId: e.target.value})} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50">
                <option value="">Select a template...</option>
                {(templates || []).map((t) => (<option key={t.id} value={t.id}>{t.name} - {t.subject}</option>))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-400 text-sm mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 resize-none" placeholder="Campaign description..." />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Schedule (optional)</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({...form, scheduledAt: e.target.value})} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Stagger (minutes between batches)</label>
              <input type="number" min={0} value={form.staggerMinutes} onChange={(e) => setForm({...form, staggerMinutes: parseInt(e.target.value) || 0})} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" />
            </div>
          </div>
        </div>

        {/* Select Departments */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Select Departments</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {(departments || []).map((dept) => (
              <label key={dept.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedDepts.has(dept.id) ? "bg-cyan-500/10 border-cyan-500/30" : "bg-dark-900/30 border-gray-700/30 hover:border-gray-600/50"}`}>
                <input type="checkbox" checked={selectedDepts.has(dept.id)} onChange={() => toggleDept(dept.id)} className="rounded border-gray-600" />
                <div>
                  <div className="text-white text-sm font-medium">{dept.name}</div>
                  <div className="text-gray-500 text-xs">{dept.employeeCount} employees</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Select Individual Users */}
        <div className="bg-dark-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Select Individual Users <span className="text-gray-500 text-sm font-normal">(optional, in addition to departments)</span></h2>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {users.map((u) => (
              <label key={u.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedUsers.has(u.id) ? "bg-cyan-500/10" : "hover:bg-dark-700/30"}`}>
                <input type="checkbox" checked={selectedUsers.has(u.id)} onChange={() => toggleUser(u.id)} className="rounded border-gray-600" />
                <div>
                  <span className="text-white text-sm">{u.name}</span>
                  <span className="text-gray-500 text-xs ml-2">{u.email}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link href="/admin/phishing" className="px-6 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</Link>
          <button type="submit" disabled={saving} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-8 py-2.5 rounded-xl transition-colors disabled:opacity-50">
            {saving ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </form>
    </div>
  );
}
