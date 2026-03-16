'use client';

import { useState, useMemo } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { PageLoading } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchFilter } from '@/components/ui/search-filter';
import { formatDate, getDifficultyColor, getCategoryColor } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Target,
  Clock,
  HelpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  CalendarClock,
  Award,
  FileQuestion,
} from 'lucide-react';
import Link from 'next/link';
import type { Quiz, QuizResult } from '@/types';

interface QuizWithDetails extends Quiz {
  module?: { title: string; category: string };
  _count: { questions: number };
  results?: QuizResult[];
}

type TabFilter = 'all' | 'pending' | 'completed' | 'overdue';

function getQuizStatus(quiz: QuizWithDetails): { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; icon: React.ReactNode } {
  const hasResult = quiz.results && quiz.results.length > 0;
  const bestResult = hasResult
    ? quiz.results!.reduce((best, r) => (r.score > best.score ? r : best), quiz.results![0])
    : null;

  if (hasResult && bestResult) {
    if (bestResult.passed) {
      return { label: 'Passed', variant: 'success', icon: <CheckCircle2 className="w-4 h-4" /> };
    }
    return { label: 'Failed', variant: 'danger', icon: <XCircle className="w-4 h-4" /> };
  }

  if (quiz.dueDate && new Date(quiz.dueDate) < new Date()) {
    return { label: 'Overdue', variant: 'warning', icon: <AlertTriangle className="w-4 h-4" /> };
  }

  return { label: 'Pending', variant: 'info', icon: <Clock className="w-4 h-4" /> };
}

function getBestScore(quiz: QuizWithDetails): number | null {
  if (!quiz.results || quiz.results.length === 0) return null;
  return Math.max(...quiz.results.map((r) => r.score));
}

const tabs: { key: TabFilter; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: <Target className="w-4 h-4" /> },
  { key: 'pending', label: 'Pending', icon: <Clock className="w-4 h-4" /> },
  { key: 'completed', label: 'Completed', icon: <CheckCircle2 className="w-4 h-4" /> },
  { key: 'overdue', label: 'Overdue', icon: <AlertTriangle className="w-4 h-4" /> },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function QuizzesPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: quizzes, loading, error, refetch } = useFetch<QuizWithDetails[]>('/api/quizzes?all=true');

  const filtered = useMemo(() => {
    if (!quizzes) return [];
    return quizzes.filter((q) => {
      const matchSearch =
        !search ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.description?.toLowerCase().includes(search.toLowerCase()) ||
        q.module?.title?.toLowerCase().includes(search.toLowerCase());

      const status = getQuizStatus(q);
      let matchTab = true;
      if (activeTab === 'pending') matchTab = status.label === 'Pending';
      if (activeTab === 'completed') matchTab = status.label === 'Passed' || status.label === 'Failed';
      if (activeTab === 'overdue') matchTab = status.label === 'Overdue';

      const matchCategory = !categoryFilter || q.module?.category === categoryFilter || q.category === categoryFilter;

      return matchSearch && matchTab && matchCategory;
    });
  }, [quizzes, search, activeTab, categoryFilter]);

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Quizzes</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  const totalQuizzes = quizzes?.length || 0;
  const completedCount = quizzes?.filter((q) => {
    const s = getQuizStatus(q);
    return s.label === 'Passed' || s.label === 'Failed';
  }).length || 0;

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Quizzes"
        description={`${completedCount} of ${totalQuizzes} quizzes attempted`}
        icon={Target}
      />

      {/* Tab Filters */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'bg-slate-800/50 text-gray-400 border border-transparent hover:border-gray-700 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search quizzes..."
        filters={[
          {
            label: 'All Categories',
            value: categoryFilter,
            options: [
              { label: 'Phishing', value: 'PHISHING' },
              { label: 'Passwords', value: 'PASSWORDS' },
              { label: 'Social Engineering', value: 'SOCIAL_ENGINEERING' },
              { label: 'Malware', value: 'MALWARE' },
              { label: 'Data Protection', value: 'DATA_PROTECTION' },
              { label: 'General', value: 'GENERAL' },
            ],
            onChange: setCategoryFilter,
          },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileQuestion}
          title="No quizzes found"
          description={
            search || activeTab !== 'all' || categoryFilter
              ? 'Try adjusting your search or filters.'
              : 'No quizzes are available yet.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((quiz, index) => {
            const status = getQuizStatus(quiz);
            const bestScore = getBestScore(quiz);
            const category = quiz.module?.category || quiz.category;

            return (
              <motion.div
                key={quiz.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <Link href={`/dashboard/quizzes/${quiz.id}`}>
                  <div className="glass-card-hover p-5 h-full flex flex-col group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex flex-wrap gap-2">
                        {category && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
                            {category.replace(/_/g, ' ')}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty}
                        </span>
                      </div>
                      <Badge variant={status.variant} size="sm">
                        {status.icon}
                        <span className="ml-1">{status.label}</span>
                      </Badge>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                      {quiz.title}
                    </h3>
                    {quiz.module && (
                      <p className="text-xs text-gray-500 mb-2">Module: {quiz.module.title}</p>
                    )}
                    {quiz.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">{quiz.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        {quiz._count?.questions || 0} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {quiz.timeLimitMins} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {quiz.passingScore}% to pass
                      </span>
                    </div>

                    {quiz.dueDate && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <CalendarClock className="w-3.5 h-3.5" />
                        Due: {formatDate(quiz.dueDate)}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-800">
                      {bestScore !== null ? (
                        <span className={`text-sm font-semibold ${
                          bestScore >= (quiz.passingScore || 70) ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          Best: {bestScore}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-500">Not attempted</span>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
