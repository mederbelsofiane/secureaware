'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFetch } from '@/hooks/use-fetch';
import { PageLoading } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchFilter } from '@/components/ui/search-filter';
import { formatDuration, getDifficultyColor, getCategoryColor } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';
import type { Module, Lesson, ModuleProgress } from '@/types';

interface ModuleWithDetails extends Module {
  lessons: Lesson[];
  progress: { progress: number; isCompleted: boolean } | null;
  _count: { lessons: number };
}

const CATEGORIES = [
  { label: 'Phishing', value: 'PHISHING' },
  { label: 'Passwords', value: 'PASSWORDS' },
  { label: 'Social Engineering', value: 'SOCIAL_ENGINEERING' },
  { label: 'Malware', value: 'MALWARE' },
  { label: 'Browsing', value: 'BROWSING' },
  { label: 'Mobile', value: 'MOBILE' },
  { label: 'Network', value: 'NETWORK' },
  { label: 'Data Protection', value: 'DATA_PROTECTION' },
  { label: 'Compliance', value: 'COMPLIANCE' },
  { label: 'General', value: 'GENERAL' },
];

const DIFFICULTIES = [
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function ModulesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  const { data: modules, loading, error, refetch } = useFetch<ModuleWithDetails[]>('/api/modules?all=true');

  const filtered = useMemo(() => {
    if (!modules) return [];
    return modules.filter((m) => {
      const matchSearch =
        !search ||
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = !categoryFilter || m.category === categoryFilter;
      const matchDifficulty = !difficultyFilter || m.difficulty === difficultyFilter;
      return matchSearch && matchCategory && matchDifficulty;
    });
  }, [modules, search, categoryFilter, difficultyFilter]);

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Modules</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  const totalModules = modules?.length || 0;
  const completedCount = modules?.filter((m) => m.progress?.isCompleted).length || 0;

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Training Modules"
        description={`${completedCount} of ${totalModules} modules completed`}
        icon={BookOpen}
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search modules..."
        filters={[
          {
            label: 'All Categories',
            value: categoryFilter,
            options: CATEGORIES,
            onChange: setCategoryFilter,
          },
          {
            label: 'All Difficulties',
            value: difficultyFilter,
            options: DIFFICULTIES,
            onChange: setDifficultyFilter,
          },
        ]}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No modules found"
          description={
            search || categoryFilter || difficultyFilter
              ? 'Try adjusting your search or filters.'
              : 'No training modules are available yet.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((trainingModule, index) => (
            <motion.div
              key={trainingModule.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Link href={`/dashboard/modules/${trainingModule.id}`}>
                <div className="glass-card-hover p-5 h-full flex flex-col group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex flex-wrap gap-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(trainingModule.category)}`}>
                        {trainingModule.category.replace(/_/g, ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(trainingModule.difficulty)}`}>
                        {trainingModule.difficulty}
                      </span>
                    </div>
                    {trainingModule.progress?.isCompleted && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-cyan-400 transition-colors">
                    {trainingModule.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                    {trainingModule.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {trainingModule._count?.lessons || trainingModule.lessons?.length || 0} lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(trainingModule.durationMins)}
                    </span>
                  </div>

                  <div className="mt-auto">
                    <ProgressBar
                      value={trainingModule.progress?.progress || 0}
                      size="sm"
                      color={trainingModule.progress?.isCompleted ? 'green' : 'blue'}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {Math.round(trainingModule.progress?.progress || 0)}% complete
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
