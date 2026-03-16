"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useFetch, apiPost, apiDelete } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatDate, getDifficultyColor, getCategoryColor } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ClipboardList,
  ArrowLeft,
  Edit2,
  Trash2,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  HelpCircle,
  Users,
  Building2,
  Send,
} from "lucide-react";
import type { Department } from "@/types";

interface QuizDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  status: string;
  passingScore: number;
  timeLimitMins: number | null;
  isCustom: boolean;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  module?: { id: string; title: string } | null;
  questions: {
    id: string;
    text: string;
    explanation: string | null;
    order: number;
    options: {
      id: string;
      text: string;
      isCorrect: boolean;
      order: number;
    }[];
  }[];
  _count?: { results: number };
}

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const { data: quiz, loading, error, refetch } = useFetch<QuizDetail>(`/api/quizzes/${id}`);
  const { data: departments } = useFetch<Department[]>("/api/departments?all=true");

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [assignType, setAssignType] = useState<"users" | "departments">("departments");
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleAssign = async () => {
    setAssigning(true);
    try {
      await apiPost(`/api/quizzes/${id}/assign`, {
        departmentIds: assignType === "departments" ? selectedDepartments : [],
      });
      toast.success("Quiz assigned successfully");
      setShowAssignModal(false);
      setSelectedDepartments([]);
    } catch (err: any) {
      toast.error(err.message || "Failed to assign quiz");
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await apiDelete(`/api/quizzes/${id}`);
      toast.success("Quiz deleted successfully");
      router.push("/admin/quizzes");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete quiz");
    } finally {
      setDeleting(false);
    }
  };

  const toggleDepartment = (deptId: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(deptId) ? prev.filter((d) => d !== deptId) : [...prev, deptId]
    );
  };

  if (authLoading || loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 bg-red-500/5 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Quiz</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={refetch} className="btn-primary">Retry</button>
            <Link href="/admin/quizzes" className="btn-secondary">Back to Quizzes</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) return <PageLoading />;

  return (
    <div className="page-container">
      <PageHeader
        title={quiz.title}
        icon={ClipboardList}
        action={
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/admin/quizzes" className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
            <button onClick={() => setShowAssignModal(true)} className="btn-primary flex items-center gap-2">
              <Send className="w-4 h-4" /> Assign
            </button>
            <Link href={`/admin/quizzes/${id}/edit`} className="btn-primary flex items-center gap-2">
              <Edit2 className="w-4 h-4" /> Edit
            </Link>
            <Link href={`/admin/quizzes/${id}/results`} className="btn-secondary flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Results
            </Link>
            <button onClick={() => setShowDeleteDialog(true)} className="btn-danger flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        }
      />

      {/* Quiz Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Badge variant={quiz.status === "PUBLISHED" ? "success" : quiz.status === "DRAFT" ? "default" : "warning"}>
            {quiz.status}
          </Badge>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(quiz.category)}`}>
            {quiz.category.replace(/_/g, " ")}
          </span>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(quiz.difficulty)}`}>
            {quiz.difficulty}
          </span>
          {quiz.isCustom && <Badge variant="purple">Custom</Badge>}
        </div>

        {quiz.description && (
          <p className="text-gray-400 mb-4">{quiz.description}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="text-gray-400">{quiz.questions.length} Questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400">Pass: {quiz.passingScore}%</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-400">
              {quiz.timeLimitMins ? `${quiz.timeLimitMins} min` : "No time limit"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400">{quiz._count?.results || 0} Submissions</span>
          </div>
        </div>

        {quiz.module && (
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-sm text-gray-500">Linked Module: <span className="text-accent-blue">{quiz.module.title}</span></p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center gap-4 text-xs text-gray-600">
          <span>Created: {formatDate(quiz.createdAt)}</span>
          <span>Updated: {formatDate(quiz.updatedAt)}</span>
          {quiz.dueDate && <span>Due: {formatDate(quiz.dueDate)}</span>}
        </div>
      </motion.div>

      {/* Questions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-400" /> Questions ({quiz.questions.length})
        </h3>

        {quiz.questions.length > 0 ? (
          <div className="space-y-4">
            {quiz.questions
              .sort((a, b) => a.order - b.order)
              .map((question, qIdx) => (
                <div key={question.id} className="glass-card p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="w-8 h-8 rounded-lg bg-accent-blue/20 text-accent-blue text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {qIdx + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-white font-medium">{question.text}</p>
                      {question.explanation && (
                        <p className="text-xs text-gray-500 mt-1 italic">Explanation: {question.explanation}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-11">
                    {question.options
                      .sort((a, b) => a.order - b.order)
                      .map((option, oIdx) => (
                        <div
                          key={option.id}
                          className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                            option.isCorrect
                              ? "bg-green-500/10 border-green-500/30 text-green-400"
                              : "bg-dark-700/30 border-gray-700/30 text-gray-400"
                          }`}
                        >
                          {option.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-gray-600 flex-shrink-0" />
                          )}
                          <span className="text-sm">
                            {String.fromCharCode(65 + oIdx)}. {option.text}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <EmptyState
            icon={HelpCircle}
            title="No Questions"
            description="This quiz has no questions yet. Add questions by editing the quiz."
          />
        )}
      </motion.div>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Quiz"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="label-text">Assign to</label>
            <div className="flex gap-2">
              <button
                onClick={() => setAssignType("departments")}
                className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                  assignType === "departments"
                    ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                    : "bg-dark-700/50 text-gray-400 border border-gray-700/30 hover:border-gray-600/50"
                }`}
              >
                <Building2 className="w-4 h-4 inline mr-1" /> Departments
              </button>
              <button
                onClick={() => setAssignType("users")}
                className={`flex-1 p-2 rounded-lg text-sm font-medium transition-colors ${
                  assignType === "users"
                    ? "bg-accent-blue/20 text-accent-blue border border-accent-blue/30"
                    : "bg-dark-700/50 text-gray-400 border border-gray-700/30 hover:border-gray-600/50"
                }`}
              >
                <Users className="w-4 h-4 inline mr-1" /> Users
              </button>
            </div>
          </div>

          {assignType === "departments" && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(departments || []).map((dept) => (
                <label
                  key={dept.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedDepartments.includes(dept.id)
                      ? "bg-accent-blue/10 border-accent-blue/30"
                      : "bg-dark-700/30 border-gray-700/30 hover:border-gray-600/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDepartments.includes(dept.id)}
                    onChange={() => toggleDepartment(dept.id)}
                    className="rounded border-gray-600 bg-dark-700 text-accent-blue focus:ring-accent-blue"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">{dept.name}</p>
                    <p className="text-xs text-gray-500">{dept.employeeCount} employees</p>
                  </div>
                </label>
              ))}
              {(!departments || departments.length === 0) && (
                <p className="text-gray-500 text-sm text-center py-4">No departments available</p>
              )}
            </div>
          )}

          {assignType === "users" && (
            <p className="text-gray-400 text-sm p-4 bg-dark-700/30 rounded-lg">
              Individual user assignment can be done from the user detail page.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700/50">
            <button onClick={() => setShowAssignModal(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={handleAssign}
              className="btn-primary"
              disabled={assigning || (assignType === "departments" && selectedDepartments.length === 0)}
            >
              {assigning ? "Assigning..." : "Assign Quiz"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${quiz.title}"? This will remove all questions and results permanently.`}
        confirmLabel="Delete Quiz"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}