"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFetch, apiDelete } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { SearchFilter } from "@/components/ui/search-filter";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Pagination } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, getDifficultyColor, getCategoryColor } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ClipboardList,
  Plus,
  Eye,
  Edit2,
  Trash2,
  BarChart3,
  AlertTriangle,
  HelpCircle,
  Clock,
} from "lucide-react";
import type { PaginatedResponse } from "@/types";

interface QuizListItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  status: string;
  passingScore: number;
  timeLimitMins: number | null;
  createdAt: string;
  _count?: { questions: number; results: number };
}

function getStatusBadgeVariant(status: string): "success" | "default" | "warning" | "info" {
  switch (status) {
    case "PUBLISHED": return "success";
    case "DRAFT": return "default";
    case "ARCHIVED": return "warning";
    default: return "info";
  }
}

export default function AdminQuizzesPage() {
  const { isLoading: authLoading } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<QuizListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    if (categoryFilter) params.set("category", categoryFilter);
    if (difficultyFilter) params.set("difficulty", difficultyFilter);
    if (statusFilter) params.set("status", statusFilter);
    return `/api/quizzes?${params.toString()}`;
  }, [page, debouncedSearch, categoryFilter, difficultyFilter, statusFilter]);

  const { data, loading, error, refetch } = useFetch<PaginatedResponse<QuizListItem>>(buildUrl());

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiDelete(`/api/quizzes/${deleteTarget.id}`);
      toast.success("Quiz deleted successfully");
      setDeleteTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete quiz");
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
          <h3 className="text-lg font-semibold text-red-400 mb-2">Failed to Load Quizzes</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  const quizzes = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const total = data?.total || 0;

  const columns: Column<QuizListItem>[] = [
    {
      key: "title",
      label: "Quiz",
      sortable: true,
      render: (quiz) => (
        <div>
          <p className="text-sm font-medium text-white">{quiz.title}</p>
          {quiz.description && (
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{quiz.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      render: (quiz) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(quiz.category)}`}>
          {quiz.category.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "difficulty",
      label: "Difficulty",
      render: (quiz) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(quiz.difficulty)}`}>
          {quiz.difficulty}
        </span>
      ),
    },
    {
      key: "questions",
      label: "Questions",
      render: (quiz) => (
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <HelpCircle className="w-3.5 h-3.5" />
          {quiz._count?.questions || 0}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (quiz) => <Badge variant={getStatusBadgeVariant(quiz.status)}>{quiz.status}</Badge>,
    },
    {
      key: "passingScore",
      label: "Pass %",
      render: (quiz) => <span className="text-sm text-gray-400">{quiz.passingScore}%</span>,
    },
    {
      key: "timeLimitMins",
      label: "Time",
      render: (quiz) => (
        <div className="flex items-center gap-1 text-sm text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          {quiz.timeLimitMins ? `${quiz.timeLimitMins}m` : "No limit"}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      className: "text-right",
      render: (quiz) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/quizzes/${quiz.id}`}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-blue-400"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/admin/quizzes/${quiz.id}/edit`}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-yellow-400"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </Link>
          <Link
            href={`/admin/quizzes/${quiz.id}/results`}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-emerald-400"
            title="Results"
          >
            <BarChart3 className="w-4 h-4" />
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(quiz); }}
            className="p-2 hover:bg-dark-600 rounded-lg transition-colors text-gray-400 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const categoryOptions = [
    "PHISHING","PASSWORDS","SOCIAL_ENGINEERING","MALWARE","BROWSING",
    "MOBILE","NETWORK","DATA_PROTECTION","COMPLIANCE","GENERAL",
  ].map((c) => ({ label: c.replace(/_/g, " "), value: c }));

  return (
    <div className="page-container">
      <PageHeader
        title="Quiz Management"
        description={`${total} total quizzes`}
        icon={ClipboardList}
        action={
          <Link href="/admin/quizzes/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Quiz
          </Link>
        }
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <SearchFilter
          searchValue={search}
          onSearchChange={setSearch}
          placeholder="Search quizzes..."
          filters={[
            {
              label: "All Categories",
              value: categoryFilter,
              options: categoryOptions,
              onChange: (v) => { setCategoryFilter(v); setPage(1); },
            },
            {
              label: "All Difficulties",
              value: difficultyFilter,
              options: [
                { label: "Beginner", value: "BEGINNER" },
                { label: "Intermediate", value: "INTERMEDIATE" },
                { label: "Advanced", value: "ADVANCED" },
              ],
              onChange: (v) => { setDifficultyFilter(v); setPage(1); },
            },
            {
              label: "All Statuses",
              value: statusFilter,
              options: [
                { label: "Published", value: "PUBLISHED" },
                { label: "Draft", value: "DRAFT" },
                { label: "Archived", value: "ARCHIVED" },
              ],
              onChange: (v) => { setStatusFilter(v); setPage(1); },
            },
          ]}
        />
      </motion.div>

      {loading ? (
        <PageLoading />
      ) : quizzes.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No Quizzes Found"
          description={debouncedSearch ? "Try adjusting your search or filters." : "Create your first quiz to get started."}
        />
      ) : (
        <>
          <DataTable columns={columns} data={quizzes} keyField="id" />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Quiz"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This will also remove all associated questions and results.`}
        confirmLabel="Delete Quiz"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}