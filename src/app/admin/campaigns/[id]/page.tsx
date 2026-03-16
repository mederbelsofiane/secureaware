"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useFetch, apiPut, apiDelete } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, formatDateTime } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Megaphone,
  ArrowLeft,
  Edit2,
  Trash2,
  AlertTriangle,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Target,
  Building2,
  GraduationCap,
  Save,
} from "lucide-react";

interface CampaignDetail {
  id: string;
  name: string;
  description: string | null;
  type: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  completionRate: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  campaignModules: {
    id: string;
    module: { id: string; title: string; category: string; difficulty: string };
  }[];
  campaignDepartments: {
    id: string;
    department: { id: string; name: string; employeeCount: number };
  }[];
  campaignUsers: {
    id: string;
    isCompleted: boolean;
    user: { id: string; name: string; email: string };
  }[];
}

function getStatusVariant(status: string): "success" | "warning" | "danger" | "info" | "default" {
  switch (status) {
    case "ACTIVE": return "success";
    case "DRAFT": return "default";
    case "PAUSED": return "warning";
    case "COMPLETED": return "info";
    case "CANCELLED": return "danger";
    default: return "default";
  }
}

function getTypeVariant(type: string): "info" | "danger" | "warning" | "purple" {
  switch (type) {
    case "TRAINING": return "info";
    case "PHISHING_SIMULATION": return "danger";
    case "ASSESSMENT": return "warning";
    case "AWARENESS": return "purple";
    default: return "info";
  }
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const { data: campaign, loading, error, refetch } = useFetch<CampaignDetail>(`/api/campaigns/${id}`);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const openEdit = () => {
    if (!campaign) return;
    setEditName(campaign.name);
    setEditDescription(campaign.description || "");
    setEditType(campaign.type);
    setEditStartDate(campaign.startDate ? campaign.startDate.split("T")[0] : "");
    setEditEndDate(campaign.endDate ? campaign.endDate.split("T")[0] : "");
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editName.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      await apiPut(`/api/campaigns/${id}`, {
        name: editName,
        description: editDescription || null,
        type: editType,
        startDate: editStartDate ? new Date(editStartDate).toISOString() : null,
        endDate: editEndDate ? new Date(editEndDate).toISOString() : null,
      });
      toast.success("Campaign updated successfully");
      setShowEditModal(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update campaign");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await apiPut(`/api/campaigns/${id}`, { status: newStatus });
      toast.success(`Campaign ${newStatus.toLowerCase()} successfully`);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiDelete(`/api/campaigns/${id}`);
      toast.success("Campaign deleted successfully");
      router.push("/admin/campaigns");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete campaign");
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
          <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Campaign</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={refetch} className="btn-primary">Retry</button>
            <Link href="/admin/campaigns" className="btn-secondary">Back to Campaigns</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) return <PageLoading />;

  const completedUsers = campaign.campaignUsers.filter((u) => u.isCompleted).length;
  const totalUsers = campaign.campaignUsers.length;

  return (
    <div className="page-container">
      <PageHeader
        title={campaign.name}
        icon={Megaphone}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/admin/campaigns" className="btn-secondary flex items-center gap-2">
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

      {/* Campaign Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant={getStatusVariant(campaign.status)} size="md">{campaign.status}</Badge>
          <Badge variant={getTypeVariant(campaign.type)} size="md">{campaign.type.replace(/_/g, " ")}</Badge>
        </div>

        {campaign.description && (
          <p className="text-gray-400 mb-4">{campaign.description}</p>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Overall Completion</span>
            <span className="text-white font-medium">{Math.round(campaign.completionRate)}%</span>
          </div>
          <ProgressBar
            value={campaign.completionRate}
            color={campaign.completionRate >= 80 ? "green" : campaign.completionRate >= 50 ? "blue" : "yellow"}
            size="md"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <div>
              <p className="text-gray-500 text-xs">Start Date</p>
              <p className="text-gray-300">{campaign.startDate ? formatDate(campaign.startDate) : "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-yellow-400" />
            <div>
              <p className="text-gray-500 text-xs">End Date</p>
              <p className="text-gray-300">{campaign.endDate ? formatDate(campaign.endDate) : "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <div>
              <p className="text-gray-500 text-xs">Users</p>
              <p className="text-gray-300">{completedUsers}/{totalUsers} completed</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <div>
              <p className="text-gray-500 text-xs">Modules</p>
              <p className="text-gray-300">{campaign.campaignModules.length}</p>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center gap-2">
          <span className="text-sm text-gray-500 mr-2">Actions:</span>
          {campaign.status === "DRAFT" && (
            <button
              onClick={() => handleStatusChange("ACTIVE")}
              disabled={updatingStatus}
              className="btn-primary text-sm flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5" /> Launch
            </button>
          )}
          {campaign.status === "ACTIVE" && (
            <>
              <button
                onClick={() => handleStatusChange("PAUSED")}
                disabled={updatingStatus}
                className="btn-secondary text-sm flex items-center gap-1"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
              <button
                onClick={() => handleStatusChange("COMPLETED")}
                disabled={updatingStatus}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete
              </button>
            </>
          )}
          {campaign.status === "PAUSED" && (
            <>
              <button
                onClick={() => handleStatusChange("ACTIVE")}
                disabled={updatingStatus}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <Play className="w-3.5 h-3.5" /> Resume
              </button>
              <button
                onClick={() => handleStatusChange("CANCELLED")}
                disabled={updatingStatus}
                className="btn-danger text-sm flex items-center gap-1"
              >
                <XCircle className="w-3.5 h-3.5" /> Cancel
              </button>
            </>
          )}
          {(campaign.status === "COMPLETED" || campaign.status === "CANCELLED") && (
            <span className="text-xs text-gray-600">No further actions available</span>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-600">
          Created: {formatDateTime(campaign.createdAt)} | Updated: {formatDateTime(campaign.updatedAt)}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Modules */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-cyan-400" /> Assigned Modules ({campaign.campaignModules.length})
          </h3>
          {campaign.campaignModules.length > 0 ? (
            <div className="space-y-3">
              {campaign.campaignModules.map((cm) => (
                <div key={cm.id} className="p-3 rounded-lg bg-dark-700/30 border border-gray-700/30">
                  <p className="text-sm font-medium text-white">{cm.module.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{cm.module.category.replace(/_/g, " ")}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500">{cm.module.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={GraduationCap} title="No Modules" description="No modules assigned to this campaign." />
          )}
        </motion.div>

        {/* Departments */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-400" /> Departments ({campaign.campaignDepartments.length})
          </h3>
          {campaign.campaignDepartments.length > 0 ? (
            <div className="space-y-3">
              {campaign.campaignDepartments.map((cd) => (
                <div key={cd.id} className="p-3 rounded-lg bg-dark-700/30 border border-gray-700/30 flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{cd.department.name}</p>
                  <span className="text-xs text-gray-500">{cd.department.employeeCount} employees</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Building2} title="No Departments" description="No departments assigned to this campaign." />
          )}
        </motion.div>

        {/* Users */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Enrolled Users ({totalUsers})
          </h3>
          {campaign.campaignUsers.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {campaign.campaignUsers.map((cu) => (
                <div key={cu.id} className="p-2 rounded-lg bg-dark-700/30 flex items-center justify-between">
                  <div>
                    <Link href={`/admin/users/${cu.user.id}`} className="text-sm font-medium text-white hover:text-accent-blue">
                      {cu.user.name}
                    </Link>
                    <p className="text-xs text-gray-500">{cu.user.email}</p>
                  </div>
                  {cu.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-xs text-gray-600">In Progress</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={Users} title="No Users" description="No users enrolled in this campaign yet." />
          )}
        </motion.div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Campaign" size="lg">
        <div className="space-y-4">
          <div>
            <label className="label-text">Name *</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Description</label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="input-field min-h-[80px]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Type</label>
              <select value={editType} onChange={(e) => setEditType(e.target.value)} className="input-field">
                <option value="TRAINING">Training</option>
                <option value="PHISHING_SIMULATION">Phishing Simulation</option>
                <option value="ASSESSMENT">Assessment</option>
                <option value="AWARENESS">Awareness</option>
              </select>
            </div>
            <div>
              <label className="label-text">Start Date</label>
              <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">End Date</label>
              <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} className="input-field" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
            <button onClick={() => setShowEditModal(false)} className="btn-secondary" disabled={saving}>Cancel</button>
            <button onClick={handleSave} className="btn-primary flex items-center gap-2" disabled={saving}>
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`}
        confirmLabel="Delete Campaign"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}