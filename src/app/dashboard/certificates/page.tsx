'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFetch } from '@/hooks/use-fetch';
import { PageLoading } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, getInitials } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Award,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Shield,
  Calendar,
  Star,
  Download,
  GraduationCap,
} from 'lucide-react';
import type { Certificate, SafeUser, UserBadge, Badge as BadgeType } from '@/types';

interface CurrentUserData extends SafeUser {
  certificates?: Certificate[];
  badges?: (UserBadge & { badge: BadgeType })[];
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 80) return 'text-cyan-400';
  if (score >= 70) return 'text-yellow-400';
  return 'text-orange-400';
}

function getScoreLabel(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Great';
  if (score >= 70) return 'Good';
  return 'Passed';
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

export default function CertificatesPage() {
  const { user } = useAuth();
  const { data: currentUser, loading, error, refetch } =
    useFetch<CurrentUserData>('/api/users/current');

  const sortedCertificates = useMemo(
    () => [...(currentUser?.certificates || [])].sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()),
    [currentUser?.certificates]
  );

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Certificates</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="My Certificates"
        description={`${sortedCertificates.length} certificate${sortedCertificates.length !== 1 ? 's' : ''} earned`}
        icon={Award}
      />

      {/* Summary Card */}
      {sortedCertificates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 border-emerald-500/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-semibold text-white">
                  {sortedCertificates.length} Certificate{sortedCertificates.length !== 1 ? 's' : ''} Earned
                </p>
                <p className="text-sm text-gray-400">
                  Average Score:{' '}
                  <span className="text-emerald-400 font-semibold">
                    {Math.round(
                      sortedCertificates.reduce((sum, c) => sum + (c.quizScore || 0), 0) /
                        sortedCertificates.length
                    )}%
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">
                Latest: {formatDate(sortedCertificates[0].issuedAt)}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Certificates Grid */}
      {sortedCertificates.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No certificates yet"
          description="Complete training modules and pass quizzes to earn certificates. Your achievements will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedCertificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="glass-card overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                {/* Certificate Header - Decorative */}
                <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500" />

                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                          Certificate of Completion
                        </p>
                        <h3 className="text-lg font-bold text-white mt-0.5">
                          {cert.moduleName}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Certificate Body */}
                <div className="px-6 py-4 space-y-4">
                  <div className="flex items-center justify-center py-3">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-1">Awarded to</p>
                      <p className="text-lg font-semibold text-white">{user?.name || currentUser?.name || 'User'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-3 bg-slate-800/50 text-center">
                      <p className={`text-2xl font-bold ${getScoreColor(cert.quizScore ?? 0)}`}>
                        {cert.quizScore ?? 0}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getScoreLabel(cert.quizScore ?? 0)}
                      </p>
                    </div>
                    <div className="glass-card p-3 bg-slate-800/50 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-white mt-1">
                        {formatDate(cert.issuedAt)}
                      </p>
                      <p className="text-xs text-gray-500">Issued</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                    <Badge variant="success" size="sm">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                    <span className="text-xs text-gray-600 font-mono">
                      ID: {cert.id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
