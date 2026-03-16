'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFetch, apiPost } from '@/hooks/use-fetch';
import { PageLoading } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDuration, getDifficultyColor, getCategoryColor } from '@/lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Clock,
  Layers,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Play,
  FileText,
  Video,
  Link2,
  HelpCircle,
  Loader2,
  GraduationCap,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import type { Module, Lesson, Quiz, ModuleProgress } from '@/types';

interface ModuleDetail extends Module {
  lessons: (Lesson & { completed?: boolean })[];
  quiz: Quiz | null;
  progress: ModuleProgress | null;
}

function getLessonIcon(type: string) {
  switch (type) {
    case 'VIDEO':
      return <Video className="w-5 h-5" />;
    case 'DOCUMENT':
      return <FileText className="w-5 h-5" />;
    case 'LINK':
      return <Link2 className="w-5 h-5" />;
    case 'INTERACTIVE':
      return <Play className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
}

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;

  const { data: trainingModule, loading, error, refetch, setData } =
    useFetch<ModuleDetail>(`/api/modules/${moduleId}`);

  const [completingLesson, setCompletingLesson] = useState<string | null>(null);

  const handleToggleLesson = async (lessonId: string, currentlyCompleted: boolean) => {
    if (currentlyCompleted || completingLesson) return;

    setCompletingLesson(lessonId);
    try {
      await apiPost(`/api/modules/${moduleId}/progress`, {
        lessonId,
        completed: true,
      });

      if (trainingModule) {
        const updatedLessons = trainingModule.lessons.map((l) =>
          l.id === lessonId ? { ...l, completed: true } : l
        );
        const completedCount = updatedLessons.filter((l) => l.completed).length;
        const totalLessons = updatedLessons.length;
        const newProgress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

        setData({
          ...trainingModule,
          lessons: updatedLessons,
          progress: {
            ...(trainingModule.progress || ({} as ModuleProgress)),
            progress: newProgress,
            isCompleted: completedCount === totalLessons,
          } as ModuleProgress,
        });
      }

      toast.success('Lesson marked as complete!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setCompletingLesson(null);
    }
  };

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Module</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <button onClick={() => router.push('/dashboard/modules')} className="btn-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Modules
            </button>
            <button onClick={refetch} className="btn-primary">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!trainingModule) return <PageLoading />;

  const completedLessons = trainingModule.lessons.filter((l) => l.completed).length;
  const totalLessons = trainingModule.lessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const allLessonsComplete = completedLessons === totalLessons && totalLessons > 0;
  const sortedLessons = [...trainingModule.lessons].sort((a, b) => a.order - b.order);

  return (
    <div className="page-container space-y-6">
      {/* Back Link */}
      <Link
        href="/dashboard/modules"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Modules
      </Link>

      {/* Module Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                  trainingModule.category
                )}`}
              >
                {trainingModule.category.replace(/_/g, ' ')}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                  trainingModule.difficulty
                )}`}
              >
                {trainingModule.difficulty}
              </span>
              {trainingModule.progress?.isCompleted && (
                <Badge variant="success" size="sm">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Completed
                </Badge>
              )}
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">{trainingModule.title}</h1>
            <p className="text-gray-400 mb-4">{trainingModule.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> {totalLessons} lessons
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {formatDuration(trainingModule.durationMins)}
              </span>
              {trainingModule.quiz && (
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4" /> Quiz included
                </span>
              )}
            </div>
          </div>

          <div className="lg:w-64 flex-shrink-0">
            <div className="glass-card p-4 bg-slate-800/50">
              <div className="text-center mb-3">
                <span className="text-3xl font-bold text-white">{progressPercent}%</span>
                <p className="text-xs text-gray-500 mt-1">
                  {completedLessons} of {totalLessons} lessons complete
                </p>
              </div>
              <ProgressBar
                value={progressPercent}
                color={allLessonsComplete ? 'green' : 'blue'}
                size="md"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lessons List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Lessons
        </h2>

        {sortedLessons.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No lessons available"
            description="This module does not have any lessons yet."
          />
        ) : (
          <div className="space-y-2">
            {sortedLessons.map((lesson, index) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/dashboard/modules/${moduleId}/lessons/${lesson.id}`}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all group ${
                    lesson.completed
                      ? 'bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500/40'
                      : 'bg-slate-800/50 border border-transparent hover:border-cyan-500/30 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-shrink-0">
                    {lesson.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <Circle className="w-6 h-6 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                    )}
                  </div>

                  <div className={`flex-shrink-0 ${lesson.completed ? 'text-emerald-400' : 'text-gray-500 group-hover:text-cyan-400'} transition-colors`}>
                    {getLessonIcon(lesson.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${lesson.completed ? 'text-gray-300' : 'text-white group-hover:text-cyan-400'} transition-colors`}>
                      {lesson.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Lesson {lesson.order} &bull; {lesson.type.replace(/_/g, ' ')} &bull; {lesson.durationMins || 10} min
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-600">
                      {index + 1}/{totalLessons}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Module Quiz Section */}
      {trainingModule.quiz && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            Module Quiz
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-800/50">
            <div>
              <p className="font-medium text-white">{trainingModule.quiz.title || 'Knowledge Check'}</p>
              <p className="text-sm text-gray-400 mt-1">
                Test your knowledge of {trainingModule.title}
              </p>
            </div>

            {allLessonsComplete ? (
              <Link
                href={`/dashboard/modules/${moduleId}/quiz`}
                className="btn-primary inline-flex items-center gap-2 flex-shrink-0"
              >
                <Play className="w-4 h-4" /> Take Quiz
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Complete all lessons to unlock</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
