"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useFetch, apiPut, apiDelete } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { RiskScore } from "@/components/ui/risk-score";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatDateTime, getInitials, getDifficultyColor } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  UserCircle,
  ArrowLeft,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Shield,
  Calendar,
  AlertTriangle,
  Award,
  GraduationCap,
  ClipboardList,
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  FileText,
} from "lucide-react";
import type { Department } from "@/types";

interface UserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string | null;
  phone: string | null;
  jobTitle: string | null;
  riskScore: number;
  departmentId: string | null;
  department: { id: string; name: string } | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  moduleProgress: {
    id: string;
    progress: number;
    isCompleted: boolean;
    startedAt: string;
    completedAt: string | null;
    module: { id: string; title: string; category: string; difficulty: string };
  }[];
  quizResults: {
    id: string;
    score: number;
    passed: boolean;
    timeTaken: number | null;
    createdAt: string;
    quiz: { id: string; title: string; category: string; difficulty: string };
  }[];
  badges: {
    id: string;
    earnedAt: string;
    badge: { id: string; name: string; description: string; icon: string; color: string };
  }[];
  certificates: {
    id: string;
    moduleName: string;
    quizScore: number | null;
    issuedAt: string;
  }[];
  activities: {
    id: string;
    type: string;
    target: string;
    details: string | null;
    createdAt: string;
  }[];
}

interface EditForm {
  name: string;
  email: string;
  role: string;
  status: string;
  departmentId: string;
  jobTitle: string;
  phone: string;
}

function getBadgeColorClass(color: string): string {
  const map: Record<string, string> = {
    BLUE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    GREEN: "bg-green-500/20 text-green-400 border-green-500/30",
    PURPLE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    GOLD: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    RED: "bg-red-500/20 text-red-400 border-red-500/30",
    CYAN: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  };
  return map[color] || map.BLUE;
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const { data: user, loading, error, refetch } = useFetch<UserDetail>(`/api/users/${id}`);
  const { data: departments } = useFetch<Department[]>("/api/departments?all=true");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    name: "", email: "", role: "", status: "", departmentId: "", jobTitle: "", phone: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const openEdit = () => {
    if (!user) return;
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      departmentId: user.departmentId || "",
      jobTitle: user.jobTitle || "",
      phone: user.phone || "",
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiPut(`/api/users/${id}`, {
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        status: editForm.status,
        departmentId: editForm.departmentId || null,
        jobTitle: editForm.jobTitle || null,
        phone: editForm.phone || null,
      });
      toast.success("User updated successfully");
      setShowEditModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiDelete(`/api/users/${id}`);
      toast.success("User deleted successfully");
      router.push("/admin/users");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load User</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={refetch} className="btn-primary">Retry</button>
            <Link href="/admin/users" className="btn-secondary">Back to Users</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return <PageLoading />;

  const completedModules = user.moduleProgress.filter((p) => p.isCompleted).length;
  const totalModules = user.moduleProgress.length;
  const passedQuizzes = user.quizResults.filter((r) => r.passed).length;
  const totalQuizzes = user.quizResults.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(user.quizResults.reduce((sum, r) => sum + r.score, 0) / totalQuizzes)
    : 0;

  return (
    <div className="page-container">
      <PageHeader
        title="User Detail"
        icon={UserCircle}
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/users" className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <button onClick={openEdit} className="btn-primary flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => setShowDeleteDialog(true)} className="btn-danger flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        }
      />

      {/* Profile Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-2xl font-bold">
            {getInitials(user.name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <Badge variant={user.role === "ADMIN" ? "purple" : "info"}>{user.role}</Badge>
              <Badge variant={user.status === "ACTIVE" ? "success" : user.status === "SUSPENDED" ? "danger" : "warning"}>
                {user.status}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" /> {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone className="w-4 h-4" /> {user.phone}
                </div>
              )}
              {user.department && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Building2 className="w-4 h-4" /> {user.department.name}
                </div>
              )}
              {user.jobTitle && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Briefcase className="w-4 h-4" /> {user.jobTitle}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" /> Joined {formatDate(user.createdAt)}
              </div>
              {user.lastLoginAt && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="w-4 h-4" /> Last login {formatDateTime(user.lastLoginAt)}
                </div>
              )}
            </div>
          </div>
          <RiskScore score={user.riskScore} size="lg" />
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 text-center">
          <GraduationCap className="w-6 h-6 text-cyan-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{completedModules}/{totalModules}</p>
          <p className="text-xs text-gray-500">Modules Completed</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-4 text-center">
          <ClipboardList className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{passedQuizzes}/{totalQuizzes}</p>
          <p className="text-xs text-gray-500">Quizzes Passed</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 text-center">
          <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{avgScore}%</p>
          <p className="text-xs text-gray-500">Avg Quiz Score</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-4 text-center">
          <Award className="w-6 h-6 text-purple-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-white">{user.badges.length}</p>
          <p className="text-xs text-gray-500">Badges Earned</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Training Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" /> Training Progress
          </h3>
          {user.moduleProgress.length > 0 ? (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {user.moduleProgress.map((mp) => (
                <div key={mp.id} className="p-3 rounded-lg bg-dark-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{mp.module.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${getDifficultyColor(mp.module.difficulty)}`}>
                          {mp.module.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">{mp.module.category.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                    {mp.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <span className="text-xs text-gray-500">{Math.round(mp.progress)}%</span>
                    )}
                  </div>
                  <ProgressBar value={mp.progress} color={mp.isCompleted ? "green" : "blue"} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={GraduationCap} title="No Training Started" description="This user hasn't started any training modules yet." />
          )}
        </motion.div>

        {/* Quiz Results */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-400" /> Quiz Results
          </h3>
          {user.quizResults.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {user.quizResults.map((qr) => (
                <div key={qr.id} className="p-3 rounded-lg bg-dark-700/30 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{qr.quiz.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getDifficultyColor(qr.quiz.difficulty)}`}>
                        {qr.quiz.difficulty}
                      </span>
                      <span className="text-xs text-gray-500">{formatDate(qr.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${qr.passed ? "text-emerald-400" : "text-red-400"}`}>
                      {Math.round(qr.score)}%
                    </span>
                    {qr.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={ClipboardList} title="No Quizzes Taken" description="This user hasn't completed any quizzes yet." />
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Badges */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" /> Badges
          </h3>
          {user.badges.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {user.badges.map((ub) => (
                <div key={ub.id} className={`p-3 rounded-lg border text-center ${getBadgeColorClass(ub.badge.color)}`}>
                  <Award className="w-8 h-8 mx-auto mb-1" />
                  <p className="text-xs font-semibold">{ub.badge.name}</p>
                  <p className="text-xs opacity-70 mt-0.5">{formatDate(ub.earnedAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Award} title="No Badges" description="Badges will appear as the user earns them." />
          )}
        </motion.div>

        {/* Certificates */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" /> Certificates
          </h3>
          {user.certificates.length > 0 ? (
            <div className="space-y-3">
              {user.certificates.map((cert) => (
                <div key={cert.id} className="p-3 rounded-lg bg-dark-700/30 border border-gray-700/30">
                  <p className="text-sm font-medium text-white">{cert.moduleName}</p>
                  <div className="flex items-center justify-between mt-1">
                    {cert.quizScore !== null && (
                      <span className="text-xs text-gray-400">Score: {Math.round(cert.quizScore)}%</span>
                    )}
                    <span className="text-xs text-gray-500">{formatDate(cert.issuedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={FileText} title="No Certificates" description="Certificates are issued upon module completion." />
          )}
        </motion.div>

        {/* Activity History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400" /> Recent Activity
          </h3>
          {user.activities.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {user.activities.slice(0, 20).map((act) => (
                <div key={act.id} className="p-2 rounded-lg bg-dark-700/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="default" size="sm">{act.type.replace(/_/g, " ")}</Badge>
                    <span className="text-xs text-gray-500">{formatDateTime(act.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 truncate">{act.target}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Activity} title="No Activity" description="User activity will be recorded here." />
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit User" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Name</label>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="label-text">Email</label>
              <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Role</label>
              <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} className="input-field">
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
                <option value="GUEST">Guest</option>
              </select>
            </div>
            <div>
              <label className="label-text">Status</label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="input-field">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Department</label>
              <select value={editForm.departmentId} onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })} className="input-field">
                <option value="">No Department</option>
                {(departments || []).map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
              </select>
            </div>
            <div>
              <label className="label-text">Job Title</label>
              <input type="text" value={editForm.jobTitle} onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label-text">Phone</label>
            <input type="text" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input-field" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
            <button onClick={() => setShowEditModal(false)} className="btn-secondary" disabled={saving}>Cancel</button>
            <button onClick={handleSave} className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${user.name}? This action cannot be undone.`}
        confirmLabel="Delete User"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}