'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useFetch, apiPut } from '@/hooks/use-fetch';
import { PageLoading } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { ProgressBar } from '@/components/ui/progress-bar';
import { formatDate, formatDateTime, getInitials } from '@/lib/utils';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  User,
  AlertTriangle,
  Mail,
  Shield,
  Award,
  FileText,
  Calendar,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Clock,
  Activity,
  BookOpen,
  Target,
  Loader2,
  Building,
} from 'lucide-react';
import type {
  SafeUser,
  Certificate,
  UserBadge,
  Badge as BadgeType,
  Activity as ActivityType,
  Department,
} from '@/types';

interface ProfileData extends SafeUser {
  certificates?: Certificate[];
  badges?: (UserBadge & { badge: BadgeType })[];
  activities?: ActivityType[];
  department?: Department | null;
  _count?: {
    quizResults?: number;
    moduleProgress?: number;
    certificates?: number;
    badges?: number;
  };
}

function getActivityIcon(type: string) {
  switch (type) {
    case 'MODULE_COMPLETED':
      return <BookOpen className="w-4 h-4 text-cyan-400" />;
    case 'QUIZ_COMPLETED':
      return <Target className="w-4 h-4 text-emerald-400" />;
    case 'BADGE_EARNED':
      return <Award className="w-4 h-4 text-yellow-400" />;
    case 'CERTIFICATE_EARNED':
      return <FileText className="w-4 h-4 text-purple-400" />;
    default:
      return <Activity className="w-4 h-4 text-gray-400" />;
  }
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { data: profile, loading, error, refetch, setData } =
    useFetch<ProfileData>('/api/users/current');

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const startEditing = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditEmail(profile.email);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName('');
    setEditEmail('');
  };

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!editEmail.trim() || !editEmail.includes('@')) {
      toast.error('Valid email is required');
      return;
    }

    setSaving(true);
    try {
      await apiPut('/api/profile', {
        name: editName.trim(),
        email: editEmail.trim(),
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Profile</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  if (!profile) return <PageLoading />;

  const certificates = profile.certificates || [];
  const badges = profile.badges || [];
  const activities = profile.activities || [];
  const securityScore = Math.max(0, 100 - (profile.riskScore || 0));

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your account and view your achievements."
        icon={User}
      />

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 border-2 border-cyan-500/30 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {getInitials(profile.name)}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="label-text">Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="input-field"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="label-text">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="input-field"
                    placeholder="Your email"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={cancelEditing}
                    disabled={saving}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4" /> {profile.email}
                      </span>
                      <Badge variant={profile.role === 'ADMIN' ? 'danger' : 'info'} size="sm">
                        <Shield className="w-3 h-3 mr-1" /> {profile.role}
                      </Badge>
                    </div>
                    {profile.department && (
                      <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <Building className="w-4 h-4" /> {profile.department.name}
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-xs text-gray-600 mt-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Member since {formatDate(profile.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={startEditing}
                    className="btn-secondary inline-flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Security Score */}
          <div className="flex-shrink-0">
            <div className="glass-card p-5 bg-slate-800/50 text-center min-w-[140px]">
              <p className={`text-3xl font-bold ${
                securityScore >= 80 ? 'text-emerald-400' : securityScore >= 60 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {securityScore}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Security Score</p>
              <ProgressBar
                value={securityScore}
                size="sm"
                color={securityScore >= 80 ? 'green' : securityScore >= 60 ? 'yellow' : 'red'}
                className="mt-2"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Modules',
            value: profile._count?.moduleProgress || 0,
            icon: BookOpen,
            color: 'text-cyan-400 bg-cyan-500/20',
          },
          {
            label: 'Quizzes',
            value: profile._count?.quizResults || 0,
            icon: Target,
            color: 'text-emerald-400 bg-emerald-500/20',
          },
          {
            label: 'Badges',
            value: badges.length,
            icon: Award,
            color: 'text-yellow-400 bg-yellow-500/20',
          },
          {
            label: 'Certificates',
            value: certificates.length,
            icon: FileText,
            color: 'text-purple-400 bg-purple-500/20',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
            className="glass-card p-4 text-center"
          >
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Badges Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Badges
          </h3>
          {badges.length === 0 ? (
            <EmptyState
              icon={Award}
              title="No badges earned yet"
              description="Complete training to earn your first badge."
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map((ub) => (
                <div
                  key={ub.id}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors text-center"
                >
                  <span className="text-3xl">{ub.badge.icon || '🏅'}</span>
                  <span className="text-xs font-medium text-gray-300 truncate w-full">
                    {ub.badge.name}
                  </span>
                  {ub.badge.description && (
                    <span className="text-xs text-gray-600 line-clamp-1">
                      {ub.badge.description}
                    </span>
                  )}
                  {ub.earnedAt && (
                    <span className="text-xs text-gray-600">
                      {formatDate(ub.earnedAt)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Certificates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            Certificates
          </h3>
          {certificates.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No certificates yet"
              description="Pass module quizzes to earn certificates."
            />
          ) : (
            <div className="space-y-3">
              {certificates
                .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime())
                .map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {cert.moduleName}
                        </p>
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

      {/* Activity History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" />
          Activity History
        </h3>
        {activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Your training activity will appear here as you progress."
          />
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {activities
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 20)
              .map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                >
                  <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-300">{activity.details}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatDateTime(activity.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
