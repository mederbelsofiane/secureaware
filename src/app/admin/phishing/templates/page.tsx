"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFetch, apiPost, apiPut, apiDelete } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Plus, Pencil, Trash2, X, Fish } from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  bodyHtml: string;
  landingPageHtml: string | null;
  difficulty: string;
  category: string;
  isActive: boolean;
  createdAt: string;
  _count: { phishingEvents: number };
}

const emptyForm = { name: "", subject: "", senderName: "", senderEmail: "", bodyHtml: "", landingPageHtml: "", difficulty: "INTERMEDIATE", category: "email" };

export default function PhishingTemplatesPage() {
  const { isLoading: authLoading } = useAuth();
  const { data: templates, loading, refetch } = useFetch<Template[]>("/api/phishing/templates");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading || loading) return <PageLoading />;

  const handleCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); setError(null); };
  const handleEdit = (t: Template) => {
    setForm({ name: t.name, subject: t.subject, senderName: t.senderName, senderEmail: t.senderEmail, bodyHtml: t.bodyHtml, landingPageHtml: t.landingPageHtml || "", difficulty: t.difficulty, category: t.category });
    setEditingId(t.id); setShowForm(true); setError(null);
  };
  const handleClose = () => { setShowForm(false); setEditingId(null); setError(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      if (editingId) {
        await apiPut(`/api/phishing/templates/${editingId}`, form);
      } else {
        await apiPost("/api/phishing/templates", form);
      }
      handleClose(); refetch();
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to save"); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    try { await apiDelete(`/api/phishing/templates/${id}`); refetch(); } catch (err) { alert(err instanceof Error ? err.message : "Failed to delete"); }
  };

  const getDiffBadge = (d: string) => {
    if (d === "BEGINNER") return <Badge variant="success">Beginner</Badge>;
    if (d === "ADVANCED") return <Badge variant="danger">Advanced</Badge>;
    return <Badge variant="warning">Intermediate</Badge>;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Phishing Templates" description="Create and manage email templates for phishing simulations." action={
          <button onClick={handleCreate} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> New Template
        </button>
        } />

      {/* Form Modal */}
      {showForm && (
        <div className="bg-dark-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{editingId ? "Edit Template" : "Create Template"}</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Template Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" placeholder="e.g., IT Password Reset" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Email Subject *</label>
                <input type="text" required value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" placeholder="e.g., Urgent: Password Reset Required" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Sender Name *</label>
                <input type="text" required value={form.senderName} onChange={(e) => setForm({...form, senderName: e.target.value})} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" placeholder="e.g., IT Support" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Sender Email *</label>
                <input type="email" required value={form.senderEmail} onChange={(e) => setForm({...form, senderEmail: e.target.value})} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" placeholder="e.g., it-support@company-security.com" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Difficulty</label>
                <select value={form.difficulty} onChange={(e) => setForm({...form, difficulty: e.target.value})} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50">
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Category</label>
                <input type="text" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50" placeholder="e.g., email, sms" />
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Email Body HTML *</label>
              <textarea required value={form.bodyHtml} onChange={(e) => setForm({...form, bodyHtml: e.target.value})} rows={8} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 font-mono text-sm resize-none" placeholder='<div>Hello {{firstName}},<br/><br/>Click <a href="{{clickUrl}}">here</a> to reset your password.</div>' />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Landing Page HTML (Optional)</label>
              <textarea value={form.landingPageHtml} onChange={(e) => setForm({...form, landingPageHtml: e.target.value})} rows={4} className="w-full bg-dark-900/50 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 font-mono text-sm resize-none" placeholder="Custom landing page HTML..." />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={handleClose} className="px-4 py-2.5 text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button type="submit" disabled={saving} className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {saving ? "Saving..." : editingId ? "Update Template" : "Create Template"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      <div className="bg-dark-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        {!templates || templates.length === 0 ? (
          <EmptyState title="No templates yet" description="Create your first phishing email template to use in campaigns." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Name</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Subject</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Difficulty</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Used</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Status</th>
                  <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-b border-gray-700/30 hover:bg-dark-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{t.name}</div>
                      <div className="text-gray-500 text-xs">{t.senderName} &lt;{t.senderEmail}&gt;</div>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">{t.subject}</td>
                    <td className="py-3 px-4">{getDiffBadge(t.difficulty)}</td>
                    <td className="py-3 px-4 text-gray-400">{t._count.phishingEvents}x</td>
                    <td className="py-3 px-4">
                      <Badge variant={t.isActive ? "success" : "default"}>{t.isActive ? "Active" : "Inactive"}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(t)} className="text-gray-400 hover:text-cyan-400 transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
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
