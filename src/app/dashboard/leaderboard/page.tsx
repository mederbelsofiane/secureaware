'use client';

import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFetch } from '@/hooks/use-fetch';
import { PageLoading } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { getInitials } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Crown,
  Star,
  AlertTriangle,
  Shield,
  Award,
  Users,
  TrendingUp,
} from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  email: string;
  role: string;
  riskScore: number;
  _count?: {
    quizResults?: number;
    badges?: number;
    certificates?: number;
    moduleProgress?: number;
  };
  badges?: { id: string; badge: { name: string; icon: string } }[];
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1:
      return (
        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <Crown className="w-5 h-5 text-yellow-400" />
        </div>
      );
    case 2:
      return (
        <div className="w-10 h-10 rounded-full bg-gray-400/20 flex items-center justify-center">
          <Medal className="w-5 h-5 text-gray-300" />
        </div>
      );
    case 3:
      return (
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Medal className="w-5 h-5 text-orange-400" />
        </div>
      );
    default:
      return (
        <div className="w-10 h-10 rounded-full bg-slate-700/50 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-400">#{rank}</span>
        </div>
      );
  }
}

function getRankBorder(rank: number): string {
  switch (rank) {
    case 1: return 'border-yellow-500/30 bg-yellow-500/5';
    case 2: return 'border-gray-400/30 bg-gray-400/5';
    case 3: return 'border-orange-500/30 bg-orange-500/5';
    default: return 'border-transparent';
  }
}

function getSecurityScore(riskScore: number): number {
  return Math.max(0, Math.min(100, 100 - (riskScore || 0)));
}

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const { data: users, loading, error, refetch } =
    useFetch<LeaderboardUser[]>('/api/users?all=true&sortBy=riskScore&sortOrder=asc');

  const rankedUsers = useMemo(() => {
    if (!users) return [];
    // Filter to employees only, sort by security score (lower risk = higher rank)
    return [...users]
      .filter((u) => u.role === 'EMPLOYEE' || u.role === 'ADMIN')
      .sort((a, b) => {
        const scoreA = getSecurityScore(a.riskScore);
        const scoreB = getSecurityScore(b.riskScore);
        return scoreB - scoreA;
      });
  }, [users]);

  const currentUserRank = useMemo(() => {
    if (!user || !rankedUsers.length) return null;
    const idx = rankedUsers.findIndex((u) => u.id === user.id);
    return idx >= 0 ? idx + 1 : null;
  }, [user, rankedUsers]);

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Leaderboard</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Leaderboard"
        description="See how you rank against your colleagues in security awareness."
        icon={Trophy}
      />

      {/* Current User Position */}
      {currentUserRank && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-5 bg-cyan-500/5 border-cyan-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Star className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Your Current Rank</p>
                <p className="text-2xl font-bold text-white">
                  #{currentUserRank}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    of {rankedUsers.length}
                  </span>
                </p>
              </div>
            </div>
            {user && (
              <div className="text-right">
                <p className="text-sm text-gray-400">Security Score</p>
                <p className="text-2xl font-bold text-cyan-400">
                  {getSecurityScore(
                    rankedUsers.find((u) => u.id === user.id)?.riskScore || 0
                  )}%
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {rankedUsers.length >= 3 && (
        <div className="grid grid-cols-3 gap-4">
          {[1, 0, 2].map((podiumIdx) => {
            const podiumUser = rankedUsers[podiumIdx];
            if (!podiumUser) return null;
            const rank = podiumIdx + 1;
            const score = getSecurityScore(podiumUser.riskScore);
            const isCurrentUser = user?.id === podiumUser.id;

            return (
              <motion.div
                key={podiumUser.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: podiumIdx * 0.1 + 0.2 }}
                className={`glass-card p-5 text-center ${
                  rank === 1 ? 'md:-mt-4' : ''
                } ${isCurrentUser ? 'ring-2 ring-cyan-500/50' : ''}`}
              >
                <div className="flex justify-center mb-3">
                  {getRankIcon(rank)}
                </div>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-2 text-lg font-bold text-white">
                  {getInitials(podiumUser.name)}
                </div>
                <p className="font-semibold text-white text-sm truncate">{podiumUser.name}</p>
                <p className={`text-2xl font-bold mt-1 ${
                  score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {score}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Security Score</p>
                {podiumUser._count?.badges !== undefined && podiumUser._count.badges > 0 && (
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Award className="w-3 h-3 text-yellow-400" />
                    <span className="text-xs text-gray-400">{podiumUser._count.badges} badges</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Full Rankings */}
      {rankedUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No rankings available"
          description="Complete training modules and quizzes to appear on the leaderboard."
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Full Rankings
            </h2>
          </div>
          <div className="divide-y divide-gray-800/50">
            {rankedUsers.map((rankedUser, index) => {
              const rank = index + 1;
              const score = getSecurityScore(rankedUser.riskScore);
              const isCurrentUser = user?.id === rankedUser.id;

              return (
                <motion.div
                  key={rankedUser.id}
                  custom={index}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                    isCurrentUser
                      ? 'bg-cyan-500/5 border-l-2 border-l-cyan-400'
                      : 'hover:bg-slate-800/30'
                  } ${getRankBorder(rank)}`}
                >
                  <div className="flex-shrink-0 w-10">
                    {getRankIcon(rank)}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {getInitials(rankedUser.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white truncate">{rankedUser.name}</p>
                      {isCurrentUser && (
                        <Badge variant="info" size="sm">You</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{rankedUser.email}</p>
                  </div>

                  <div className="hidden sm:block w-32">
                    <ProgressBar
                      value={score}
                      size="sm"
                      color={score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red'}
                    />
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    {rankedUser._count?.badges !== undefined && rankedUser._count.badges > 0 && (
                      <div className="hidden md:flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-yellow-400" />
                        <span className="text-xs text-gray-400">{rankedUser._count.badges}</span>
                      </div>
                    )}
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {score}%
                      </p>
                      <p className="text-xs text-gray-500">Score</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
