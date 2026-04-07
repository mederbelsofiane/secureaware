"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch, apiPost, apiPut, apiDelete } from "@/hooks/use-fetch";
import { PageLoading, TableSkeleton } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatDateTime, getInitials, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  Edit3,
  ShieldCheck,
  ShieldOff,
  Users,
  UserPlus,
  Trash2,
  X,
  Loader2,
  Globe,
  Mail,
  Calendar,
  Hash,
  Crown,
  Layers,
  StickyNote,
  Eye,
  EyeOff,
} from "lucide-react";

interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  maxUsers: number;
  domain: string | null;
  billingEmail: string | null;
  notes: string | null;
  subscriptionStartDate: string | null;
  subscriptionEndDate: string | null;
  createdAt: string;
  updatedAt: string;
  users: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    department?: { name: string } | null;
    lastLoginAt: string | null;
    createdAt: string;
  }[];
  departments: { id: string; name: string }[];
  _count: { users: number; departments: number };
}

interface Admin {
  id: string;
  name: string;
  email: string;
  status: string;
  jobTitle: string | null;
  lastLoginAt: string | null;
  createdAt: string;
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

const roleBadgeVariant: Record<string, "default" | "info" | "purple" | "warning" | "success"> = {
  SUPER_ADMIN: "purple",
  ADMIN: "warning",
  EMPLOYEE: "info",
};

type Tab = "overview" | "admins" | "users";

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deletingAdminId, setDeletingAdminId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    data: org,
    loading: orgLoading,
    error: orgError,
    refetch: refetchOrg,
  } = useFetch<OrgDetail>(`/api/super-admin/organizations/${orgId}`);

  const {
    data: admins,
    loading: adminsLoading,
    refetch: refetchAdmins,
  } = useFetch<Admin[]>(`/api/super-admin/organizations/${orgId}/admins`);

  // Edit org form
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    plan: "FREE",
    maxUsers: 10,
    domain: "",
    billingEmail: "",
    status: "ACTIVE",
    notes: "",
  });

  // Create admin form
  const [createAdminForm, setCreateAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    jobTitle: "",
  });

  // Edit admin form
  const [editAdminForm, setEditAdminForm] = useState({
    name: "",
    email: "",
    password: "",
    status: "ACTIVE",
    jobTitle: "",
  });

  const openEditModal = () => {
    if (!org) return;
    setEditForm({
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      maxUsers: org.maxUsers,
      domain: org.domain || "",
      billingEmail: org.billingEmail || "",
      status: org.status,
      notes: org.notes || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiPut(`/api/super-admin/organizations/${orgId}`, {
        name: editForm.name.trim(),
        slug: editForm.slug.trim(),
        plan: editForm.plan,
        maxUsers: Number(editForm.maxUsers),
        domain: editForm.domain.trim() || null,
        billingEmail: editForm.billingEmail.trim() || null,
        status: editForm.status,
        notes: editForm.notes.trim() || null,
      });
      toast.success("Organization updated successfully");
      setShowEditModal(false);
      refetchOrg();
    } catch (err: any) {
      toast.error(err.message || "Failed to update organization");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!org) return;
    const newStatus = org.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setToggling(true);
    try {
      await apiPut(`/api/super-admin/organizations/${orgId}`, {
        status: newStatus,
      });
      toast.success(
        `Organization ${newStatus === "ACTIVE" ? "activated" : "suspended"} successfully`
      );
      refetchOrg();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setToggling(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createAdminForm.name.trim() || !createAdminForm.email.trim() || !createAdminForm.password) {
      toast.error("Name, email, and password are required");
      return;
    }
    setSaving(true);
    try {
      await apiPost(`/api/super-admin/organizations/${orgId}/admins`, {
        name: createAdminForm.name.trim(),
        email: createAdminForm.email.trim(),
        password: createAdminForm.password,
        ...(createAdminForm.jobTitle && { jobTitle: createAdminForm.jobTitle.trim() }),
      });
      toast.success("Admin created successfully");
      setShowCreateAdminModal(false);
      setCreateAdminForm({ name: "", email: "", password: "", jobTitle: "" });
      refetchAdmins();
      refetchOrg();
    } catch (err: any) {
      toast.error(err.message || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  };

  const openEditAdminModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setEditAdminForm({
      name: admin.name,
      email: admin.email,
      password: "",
      status: admin.status,
      jobTitle: admin.jobTitle || "",
    });
    setShowEditAdminModal(true);
  };

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setSaving(true);
    try {
      await apiPut(
        `/api/super-admin/organizations/${orgId}/admins/${editingAdmin.id}`,
        {
          name: editAdminForm.name.trim(),
          email: editAdminForm.email.trim(),
          ...(editAdminForm.password && { password: editAdminForm.password }),
          status: editAdminForm.status,
          ...(editAdminForm.jobTitle && { jobTitle: editAdminForm.jobTitle.trim() }),
        }
      );
      toast.success("Admin updated successfully");
      setShowEditAdminModal(false);
      setEditingAdmin(null);
      refetchAdmins();
    } catch (err: any) {
      toast.error(err.message || "Failed to update admin");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (!confirm(`Are you sure you want to delete admin "${adminName}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingAdminId(adminId);
    try {
      await apiDelete(`/api/super-admin/organizations/${orgId}/admins/${adminId}`);
      toast.success("Admin deleted successfully");
      refetchAdmins();
      refetchOrg();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete admin");
    } finally {
      setDeletingAdminId(null);
    }
  };

  if (orgLoading) return <PageLoading />;

  if (orgError) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 text-center">
          <p className="text-red-400 mb-4">{orgError}</p>
          <button onClick={refetchOrg} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (!org) return <PageLoading />;

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "admins", label: "Admins", count: admins?.length },
    { key: "users", label: "Users", count: org._count.users },
  ];

  return (
    <div className="page-container">
      {/* Back button */}
      <Link
        href="/super-admin/organizations"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-purple-400 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Organizations
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="section-title mb-0">{org.name}</h1>
              <Badge variant={statusBadgeVariant[org.status] || "default"} size="md">
                {org.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{org.slug}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openEditModal}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white bg-dark-700/50 hover:bg-dark-600/50 border border-gray-700/50 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleToggleStatus}
            disabled={toggling}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
              org.status === "ACTIVE"
                ? "text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30"
                : "text-green-400 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30"
            )}
          >
            {toggling ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : org.status === "ACTIVE" ? (
              <ShieldOff className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {org.status === "ACTIVE" ? "Suspend" : "Activate"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "px-4 py-3 text-sm font-medium transition-colors relative",
              activeTab === tab.key
                ? "text-purple-400"
                : "text-gray-400 hover:text-gray-200"
            )}
          >
            <span className="flex items-center gap-2">
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-full",
                    activeTab === tab.key
                      ? "bg-purple-500/20 text-purple-400"
                      : "bg-dark-700 text-gray-500"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeOrgTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Info Grid */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Organization Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Name</p>
                  <p className="text-sm text-gray-200 font-medium">{org.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Hash className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Slug</p>
                  <p className="text-sm text-gray-300 font-mono">{org.slug}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Globe className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Domain</p>
                  <p className="text-sm text-gray-200">{org.domain || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Plan</p>
                  <Badge variant={planBadgeVariant[org.plan] || "default"} size="sm">
                    {org.plan}
                  </Badge>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <Badge variant={statusBadgeVariant[org.status] || "default"} size="sm">
                    {org.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Users</p>
                  <p className="text-sm text-gray-200">
                    {org._count.users} <span className="text-gray-500">/ {org.maxUsers} max</span>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Billing Email</p>
                  <p className="text-sm text-gray-200">{org.billingEmail || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Created</p>
                  <p className="text-sm text-gray-200">{formatDateTime(org.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Updated</p>
                  <p className="text-sm text-gray-200">{formatDateTime(org.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Notes</h3>
            </div>
            {org.notes ? (
              <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                {org.notes}
              </p>
            ) : (
              <p className="text-sm text-gray-500 italic">No notes added yet.</p>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === "admins" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Organization Admins</h3>
            <button
              onClick={() => {
                setCreateAdminForm({ name: "", email: "", password: "", jobTitle: "" });
                setShowPassword(false);
                setShowCreateAdminModal(true);
              }}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              Create Admin
            </button>
          </div>

          {adminsLoading ? (
            <TableSkeleton rows={4} />
          ) : !admins || admins.length === 0 ? (
            <div className="glass-card">
              <EmptyState
                icon={Crown}
                title="No Admins"
                description="Create an admin to manage this organization."
                action={{ label: "Create Admin", onClick: () => setShowCreateAdminModal(true) }}
              />
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700/50 bg-dark-800/50">
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                              <span className="text-xs font-medium text-purple-400">
                                {getInitials(admin.name)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-200">{admin.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-400">{admin.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusBadgeVariant[admin.status] || "default"} size="sm">
                            {admin.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-400">{admin.jobTitle || "—"}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : "Never"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditAdminModal(admin)}
                              className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                              title="Edit Admin"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(admin.id, admin.name)}
                              disabled={deletingAdminId === admin.id}
                              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              title="Delete Admin"
                            >
                              {deletingAdminId === admin.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "users" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">All Users</h3>
            <p className="text-sm text-gray-500">Read-only view of all users in this organization.</p>
          </div>

          {!org.users || org.users.length === 0 ? (
            <div className="glass-card">
              <EmptyState
                icon={Users}
                title="No Users"
                description="This organization has no users yet."
              />
            </div>
          ) : (
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-gray-700/50 bg-dark-800/50">
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/30">
                    {org.users.map((user) => (
                      <tr key={user.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-400">
                                {getInitials(user.name)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-gray-200">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-400">{user.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={roleBadgeVariant[user.role] || "default"} size="sm">
                            {user.role}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusBadgeVariant[user.status] || "default"} size="sm">
                            {user.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-400">
                            {user.department?.name || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500">
                            {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Edit Organization Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-lg glass-card p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Edit Organization</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="label-text">Name *</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="label-text">Slug *</label>
                <input
                  type="text"
                  value={editForm.slug}
                  onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                  className="input-field w-full font-mono"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-text">Plan</label>
                  <select
                    value={editForm.plan}
                    onChange={(e) => setEditForm((p) => ({ ...p, plan: e.target.value }))}
                    className="input-field w-full"
                  >
                    <option value="FREE">Free</option>
                    <option value="STARTER">Starter</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="ENTERPRISE">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Max Users</label>
                  <input
                    type="number"
                    value={editForm.maxUsers}
                    onChange={(e) => setEditForm((p) => ({ ...p, maxUsers: parseInt(e.target.value) || 0 }))}
                    className="input-field w-full"
                    min={1}
                  />
                </div>
              </div>
              <div>
                <label className="label-text">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="label-text">Domain</label>
                <input
                  type="text"
                  value={editForm.domain}
                  onChange={(e) => setEditForm((p) => ({ ...p, domain: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="label-text">Billing Email</label>
                <input
                  type="email"
                  value={editForm.billingEmail}
                  onChange={(e) => setEditForm((p) => ({ ...p, billingEmail: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
              <div>
                <label className="label-text">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                  className="input-field w-full min-h-[80px] resize-y"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateAdminModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Create Admin</h2>
              <button
                onClick={() => setShowCreateAdminModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="label-text">Full Name *</label>
                <input
                  type="text"
                  value={createAdminForm.name}
                  onChange={(e) => setCreateAdminForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field w-full"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="label-text">Email *</label>
                <input
                  type="email"
                  value={createAdminForm.email}
                  onChange={(e) => setCreateAdminForm((p) => ({ ...p, email: e.target.value }))}
                  className="input-field w-full"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="label-text">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={createAdminForm.password}
                    onChange={(e) => setCreateAdminForm((p) => ({ ...p, password: e.target.value }))}
                    className="input-field w-full pr-10"
                    placeholder="Min 8 characters"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label-text">Job Title</label>
                <input
                  type="text"
                  value={createAdminForm.jobTitle}
                  onChange={(e) => setCreateAdminForm((p) => ({ ...p, jobTitle: e.target.value }))}
                  className="input-field w-full"
                  placeholder="IT Administrator"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditAdminModal && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => { setShowEditAdminModal(false); setEditingAdmin(null); }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Edit Admin</h2>
              <button
                onClick={() => { setShowEditAdminModal(false); setEditingAdmin(null); }}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAdmin} className="space-y-4">
              <div>
                <label className="label-text">Full Name *</label>
                <input
                  type="text"
                  value={editAdminForm.name}
                  onChange={(e) => setEditAdminForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="label-text">Email *</label>
                <input
                  type="email"
                  value={editAdminForm.email}
                  onChange={(e) => setEditAdminForm((p) => ({ ...p, email: e.target.value }))}
                  className="input-field w-full"
                  required
                />
              </div>
              <div>
                <label className="label-text">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={editAdminForm.password}
                    onChange={(e) => setEditAdminForm((p) => ({ ...p, password: e.target.value }))}
                    className="input-field w-full pr-10"
                    placeholder="Leave blank to keep current"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label-text">Status</label>
                <select
                  value={editAdminForm.status}
                  onChange={(e) => setEditAdminForm((p) => ({ ...p, status: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="label-text">Job Title</label>
                <input
                  type="text"
                  value={editAdminForm.jobTitle}
                  onChange={(e) => setEditAdminForm((p) => ({ ...p, jobTitle: e.target.value }))}
                  className="input-field w-full"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditAdminModal(false); setEditingAdmin(null); }}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-dark-700/50 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
