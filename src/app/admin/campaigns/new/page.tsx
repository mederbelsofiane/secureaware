"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useFetch, apiPost } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Megaphone,
  ArrowLeft,
  Save,
  AlertTriangle,
  GraduationCap,
  Building2,
  CheckSquare,
} from "lucide-react";
import type { Department } from "@/types";

interface ModuleItem {
  id: string;
  title: string;
  category: string;
  difficulty: string;
}

export default function CreateCampaignPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const { data: modules, loading: modulesLoading } = useFetch<ModuleItem[]>("/api/modules?all=true");
  const { data: departments, loading: deptsLoading } = useFetch<Department[]>("/api/departments?all=true");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("TRAINING");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleDepartment = (id: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Campaign name is required";
    if (!type) newErrors.type = "Campaign type is required";
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const result = await apiPost<{ id: string }>("/api/campaigns", {
        name,
        description: description || null,
        type,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        moduleIds: selectedModules,
        departmentIds: selectedDepartments,
      });
      toast.success("Campaign created successfully");
      router.push(`/admin/campaigns/${result.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || modulesLoading || deptsLoading) return <PageLoading />;

  return (
    <div className="page-container">
      <PageHeader
        title="Create New Campaign"
        icon={Megaphone}
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/campaigns" className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Cancel
            </Link>
            <button onClick={handleSubmit} className="btn-primary flex items-center gap-2" disabled={saving}>
              <Save className="w-4 h-4" /> {saving ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        }
      />

      {/* Basic Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Campaign Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label-text">Campaign Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`input-field ${errors.name ? "input-error" : ""}`}
              placeholder="e.g. Q1 Security Awareness Training"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div className="md:col-span-2">
            <label className="label-text">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[80px]"
              placeholder="Describe the campaign objectives..."
            />
          </div>
          <div>
            <label className="label-text">Campaign Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={`input-field ${errors.type ? "input-error" : ""}`}
            >
              <option value="TRAINING">Training</option>
              <option value="PHISHING_SIMULATION">Phishing Simulation</option>
              <option value="ASSESSMENT">Assessment</option>
              <option value="AWARENESS">Awareness</option>
            </select>
            {errors.type && <p className="text-red-400 text-xs mt-1">{errors.type}</p>}
          </div>
          <div></div>
          <div>
            <label className="label-text">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`input-field ${errors.endDate ? "input-error" : ""}`}
            />
            {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate}</p>}
          </div>
        </div>
      </motion.div>

      {/* Select Modules */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-cyan-400" /> Select Training Modules
        </h3>
        <p className="text-sm text-gray-500 mb-4">Choose modules to include in this campaign ({selectedModules.length} selected)</p>

        {modules && modules.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
            {modules.map((trainingModule) => (
              <label
                key={trainingModule.id}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedModules.includes(trainingModule.id)
                    ? "bg-accent-blue/10 border-accent-blue/30"
                    : "bg-dark-700/30 border-gray-700/30 hover:border-gray-600/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedModules.includes(trainingModule.id)}
                  onChange={() => toggleModule(trainingModule.id)}
                  className="mt-0.5 rounded border-gray-600 bg-dark-700 text-accent-blue focus:ring-accent-blue"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{trainingModule.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{trainingModule.category.replace(/_/g, " ")}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-xs text-gray-500">{trainingModule.difficulty}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <EmptyState icon={GraduationCap} title="No Modules Available" description="Create training modules first before creating a campaign." />
        )}
      </motion.div>

      {/* Select Departments */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-400" /> Select Departments
        </h3>
        <p className="text-sm text-gray-500 mb-4">Choose departments to target ({selectedDepartments.length} selected)</p>

        {departments && departments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {departments.map((dept) => (
              <label
                key={dept.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedDepartments.includes(dept.id)
                    ? "bg-purple-500/10 border-purple-500/30"
                    : "bg-dark-700/30 border-gray-700/30 hover:border-gray-600/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(dept.id)}
                  onChange={() => toggleDepartment(dept.id)}
                  className="rounded border-gray-600 bg-dark-700 text-purple-500 focus:ring-purple-500"
                />
                <div>
                  <p className="text-sm font-medium text-white">{dept.name}</p>
                  <p className="text-xs text-gray-500">{dept.employeeCount} employees</p>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <EmptyState icon={Building2} title="No Departments" description="Create departments in the system first." />
        )}
      </motion.div>

      {/* Summary & Submit */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-400" /> Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-dark-700/30">
            <p className="text-2xl font-bold text-white">{selectedModules.length}</p>
            <p className="text-xs text-gray-500">Modules</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-dark-700/30">
            <p className="text-2xl font-bold text-white">{selectedDepartments.length}</p>
            <p className="text-xs text-gray-500">Departments</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-dark-700/30">
            <p className="text-2xl font-bold text-white">{type.replace(/_/g, " ")}</p>
            <p className="text-xs text-gray-500">Type</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-dark-700/30">
            <p className="text-2xl font-bold text-white">{startDate || "TBD"}</p>
            <p className="text-xs text-gray-500">Start Date</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/campaigns" className="btn-secondary">Cancel</Link>
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2" disabled={saving}>
            <Save className="w-4 h-4" /> {saving ? "Creating..." : "Create Campaign"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}