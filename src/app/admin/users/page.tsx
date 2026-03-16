"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFetch, apiPost, apiPut, apiDelete } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { SearchFilter } from "@/components/ui/search-filter";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { RiskScore } from "@/components/ui/risk-score";
import { formatDate, getInitials } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  UserPlus,
  Shield,
  Mail,
  Building2,
  Briefcase,
} from "lucide-react";
import type { PaginatedResponse, SafeUser, Department } from "@/types";

type UserWithDept = SafeUser & { department?: { id: string; name: string } | null };

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: string;
  departmentId: string;
  jobTitle: string;
}

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "EMPLOYEE",
  departmentId: "",
  jobTitle: "",
};

function getRoleBadgeVariant(role: string): "info" | "purple" | "default" {
  switch (role) {
    case "ADMIN": return "purple";
    case "EMPLOYEE": return "info";
    default: return "default";
  }
}

function getStatusBadgeVariant(status: string): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "ACTIVE": return "success";
    case "INACTIVE": return "warning";
    case "SUSPENDED": return "danger";
    default: return "default";
  }
}

export default function AdminUsersPage() {
  const { isLoading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (deptFilter) params.set("departmentId", deptFilter);
    return `/api/users?${params.toString()}`;
  }, [page, debouncedSearch, roleFilter, statusFilter, deptFilter]);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<UserWithDept>>(buildUrl());
  const { data: departments } = useFetch<Department[]>("/api/departments?all=true");

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithDept | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserWithDept | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UserForm, string>> = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (!form.email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Invalid email format";
    if (!editingUser && !form.password) errors.password = "Password is required";
    else if (!editingUser && form.password.length < 8) errors.password = "Min 8 characters";
    if (!form.role) errors.role = "Role is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openCreate = () => {
    setForm(emptyForm);
    setFormErrors({});
    setEditingUser(null);
    setShowCreateModal(true);
  };

  const openEdit = (user: UserWithDept) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      departmentId: user.departmentId || "",
      jobTitle: user.jobTitle || "",
    });
    setFormErrors({});
    setEditingUser(user);
    setShowCreateModal(true);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (editingUser) {
        const body: any = {
          name: form.name,
          email: form.email,
          role: form.role,
          departmentId: form.departmentId || null,
          jobTitle: form.jobTitle || null,
        };
        if (form.password) body.password = form.password;
        await apiPut(`/api/users/${editingUser.id}`, body);
        toast.success("User updated successfully");
      } else {
        await apiPost("/api/users", {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          departmentId: form.departmentId || null,
          jobTitle: form.jobTitle || null,
        });
        toast.success("User created successfully");
      }
      setShowCreateModal(false);
      setEditingUser(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/users/${deleteTarget.id}`);
      toast.success("User deleted successfully");
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Users</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const users = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const columns: Column<UserWithDept>[] = [
    {
      key: "name",
      label: "User",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue text-sm font-bold">
            {getInitials(user.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (user) => <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>,
    },
    {
      key: "department",
      label: "Department",
      render: (user) => (
        <span className="text-sm text-gray-400">{user.department?.name || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (user) => <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>,
    },
    {
      key: "riskScore",
      label: "Risk",
      sortable: true,
      render: (user) => <RiskScore score={user.riskScore} size="sm" showLabel={false} />,
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/users/${user.id}`}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-blue-400"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(user); }}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-yellow-400"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(user); }}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="User Management"
        description={`${total} total users`}
        icon={Users}
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add User
          </button>
        }
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search users by name or email..."
          filters={[
            {
              label: "All Roles",
              value: roleFilter,
              options: [
                { label: "Admin", value: "ADMIN" },
                { label: "Employee", value: "EMPLOYEE" },
                { label: "Guest", value: "GUEST" },
              ],
              onChange: (v) => { setRoleFilter(v); setPage(1); },
            },
            {
              label: "All Statuses",
              value: statusFilter,
              options: [
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
                { label: "Suspended", value: "SUSPENDED" },
              ],
              onChange: (v) => { setStatusFilter(v); setPage(1); },
            },
            {
              label: "All Departments",
              value: deptFilter,
              options: (departments || []).map((d) => ({ label: d.name, value: d.id })),
              onChange: (v) => { setDeptFilter(v); setPage(1); },
            },
          ]}
        />
      </motion.div>

      {loading ? (
        <PageLoading />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Users Found"
          description={debouncedSearch ? "Try adjusting your search or filters." : "Get started by adding your first user."}
          action={!debouncedSearch ? { label: "Add User", onClick: openCreate } : undefined}
        />
      ) : (
        <>
          <DataTable columns={columns} data={users} keyField="id" />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditingUser(null); }}
        title={editingUser ? "Edit User" : "Create New User"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text flex items-center gap-1"><UserPlus className="w-3.5 h-3.5" /> Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`input-field ${formErrors.name ? "input-error" : ""}`}
                placeholder="Full name"
              />
              {formErrors.name && <p className="text-red-400 text-xs mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <label className="label-text flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`input-field ${formErrors.email ? "input-error" : ""}`}
                placeholder="user@company.com"
              />
              {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Password {editingUser && "(leave blank to keep)"}</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`input-field ${formErrors.password ? "input-error" : ""}`}
                placeholder={editingUser ? "••••••••" : "Min 8 characters"}
              />
              {formErrors.password && <p className="text-red-400 text-xs mt-1">{formErrors.password}</p>}
            </div>
            <div>
              <label className="label-text flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={`input-field ${formErrors.role ? "input-error" : ""}`}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="ADMIN">Admin</option>
                <option value="GUEST">Guest</option>
              </select>
              {formErrors.role && <p className="text-red-400 text-xs mt-1">{formErrors.role}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Department</label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className="input-field"
              >
                <option value="">No Department</option>
                {(departments || []).map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" /> Job Title</label>
              <input
                type="text"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                className="input-field"
                placeholder="e.g. Security Analyst"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
            <button
              onClick={() => { setShowCreateModal(false); setEditingUser(null); }}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button onClick={handleSubmit} className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : editingUser ? "Update User" : "Create User"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action cannot be undone and will remove all associated data.`}
        confirmLabel="Delete User"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}