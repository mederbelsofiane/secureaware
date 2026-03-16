'use client';

import { useAuth } from '@/hooks/use-auth';
import { useFetch } from '@/hooks/use-fetch';
import { PageLoading } from '@/components/ui/loading';
import { StatCard } from '@/components/ui/stat-card';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/ui/page-header';
import type { EmployeeStats } from '@/types';
import { formatDate, formatDateTime, getInitials } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Shield,
  Award,
  Trophy,
  Clock,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Mail,
  Zap,
  TrendingUp,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

function getActivityIcon(type: string) {
  switch (type) {
    case 'MODULE_COMPLETED':
      return <BookOpen className="w-4 h-4 text-cyan-400" />;
    case 'QUIZ_COMPLETED':
      return <Target className="w-4 h-4 text-emerald-400" />;
    case 'BADGE_EARNED':
      return <Award className="w-4 h-4 text-yellow-400" />;
    case 'CERTIFICATE_EARNED':
      return <Trophy className="w-4 h-4 text-purple-400" />;
    case 'PHISHING_REPORTED':
      return <Mail className="w-4 h-4 text-red-400" />;
    default:
      return <Activity className="w-4 h-4 text-gray-400" />;
  }
}

function getRiskColor(score: number): string {
  if (score <= 30) return 'text-green-400';
  if (score <= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function getRiskLabel(score: number): string {
  if (score <= 30) return 'Low Risk';
  if (score <= 60) return 'Medium Risk';
  return 'High Risk';
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: stats, loading, error, refetch } = useFetch<EmployeeStats>('/api/stats/employee');

  if (authLoading || loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Dashboard</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  if (!stats) return <PageLoading />;

  const completionRate = stats.totalModules > 0
    ? Math.round((stats.completedModules / stats.totalModules) * 100)
    : 0;
  const quizPassRate = stats.totalQuizzes > 0
    ? Math.round((stats.passedQuizzes / stats.totalQuizzes) * 100)
    : 0;
  const securityScore = Math.max(0, 100 - (stats.riskScore || 0));

  return (
    <div className="page-container space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <PageHeader
          title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}`}
          description="Track your security training progress and stay protected."
          icon={LayoutDashboard}
        />
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div custom={0} variants={fadeIn} initial="hidden" animate="visible">
          <StatCard
            title="Completed Modules"
            value={`${stats.completedModules}/${stats.totalModules}`}
            icon={BookOpen}
          />
        </motion.div>
        <motion.div custom={1} variants={fadeIn} initial="hidden" animate="visible">
          <StatCard
            title="Avg Quiz Score"
            value={Math.round(stats.averageScore)}
            icon={Target}
            suffix="%"
          />
        </motion.div>
        <motion.div custom={2} variants={fadeIn} initial="hidden" animate="visible">
          <StatCard
            title="Risk Score"
            value={Math.round(stats.riskScore)}
            icon={Shield}
          />
        </motion.div>
        <motion.div custom={3} variants={fadeIn} initial="hidden" animate="visible">
          <StatCard
            title="Badges Earned"
            value={stats.badges.length}
            icon={Award}
          />
        </motion.div>
      </div>

      {/* Progress Section */}
      <motion.div
        custom={4}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="glass-card p-6"
      >
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          Your Progress
        </h2>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Module Completion</span>
              <span className="text-sm font-medium text-white">{completionRate}%</span>
            </div>
            <ProgressBar value={completionRate} color="blue" size="md" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Quiz Pass Rate</span>
              <span className="text-sm font-medium text-white">{quizPassRate}%</span>
            </div>
            <ProgressBar value={quizPassRate} color="green" size="md" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Security Score</span>
              <span className={`text-sm font-medium ${getRiskColor(stats.riskScore)}`}>
                {securityScore}%
              </span>
            </div>
            <ProgressBar
              value={securityScore}
              color={securityScore >= 70 ? 'green' : securityScore >= 40 ? 'yellow' : 'red'}
              size="md"
            />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div custom={5} variants={fadeIn} initial="hidden" animate="visible" className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/modules" className="glass-card-hover p-4 flex flex-col items-center gap-2 text-center group">
              <BookOpen className="w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-300">Training Modules</span>
            </Link>
            <Link href="/dashboard/quizzes" className="glass-card-hover p-4 flex flex-col items-center gap-2 text-center group">
              <Target className="w-8 h-8 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-300">Quizzes</span>
            </Link>
            <Link href="/dashboard/phishing" className="glass-card-hover p-4 flex flex-col items-center gap-2 text-center group">
              <Mail className="w-8 h-8 text-red-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-300">Phishing Examples</span>
            </Link>
            <Link href="/dashboard/leaderboard" className="glass-card-hover p-4 flex flex-col items-center gap-2 text-center group">
              <Trophy className="w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-300">Leaderboard</span>
            </Link>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div custom={6} variants={fadeIn} initial="hidden" animate="visible" className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Recent Activity
          </h2>
          {stats.recentActivities.length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="Start a training module to see your activity here."
            />
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {stats.recentActivities.slice(0, 8).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300 truncate">{activity.details}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDateTime(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earned Badges */}
        <motion.div custom={7} variants={fadeIn} initial="hidden" animate="visible" className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Earned Badges
            </h2>
            <Link href="/dashboard/profile" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {stats.badges.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No badges yet"
              description="Complete modules and quizzes to earn badges."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {stats.badges.slice(0, 6).map((ub) => (
                <div
                  key={ub.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-800/50 text-center"
                >
                  <span className="text-3xl">{ub.badge.icon || '🏅'}</span>
                  <span className="text-xs font-medium text-gray-300 truncate w-full">
                    {ub.badge.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Certificates */}
        <motion.div custom={8} variants={fadeIn} initial="hidden" animate="visible" className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              Recent Certificates
            </h2>
            <Link href="/dashboard/certificates" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {stats.certificates.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No certificates yet"
              description="Complete modules with a passing quiz score to earn certificates."
            />
          ) : (
            <div className="space-y-3">
              {stats.certificates.slice(0, 4).map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{cert.moduleName}</p>
                      <p className="text-xs text-gray-500">Score: {cert.quizScore}%</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatDate(cert.issuedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
