'use client';

import { useState, useMemo } from 'react';
import { useFetch } from '@/hooks/use-fetch';
import { PageLoading } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchFilter } from '@/components/ui/search-filter';
import { getDifficultyColor, formatDate } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  Eye,
  Flag,
  User,
  AtSign,
  FileText,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import type { PhishingExample } from '@/types';

const TYPES = [
  { label: 'Email', value: 'EMAIL' },
  { label: 'SMS', value: 'SMS' },
  { label: 'Voice', value: 'VOICE' },
  { label: 'Social Media', value: 'SOCIAL_MEDIA' },
  { label: 'Website', value: 'WEBSITE' },
];

const DIFFICULTIES = [
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
];

function getTypeIcon(type: string) {
  switch (type) {
    case 'EMAIL': return <Mail className="w-5 h-5" />;
    case 'SMS': return <MessageSquare className="w-5 h-5" />;
    case 'VOICE': return <FileText className="w-5 h-5" />;
    case 'SOCIAL_MEDIA': return <ExternalLink className="w-5 h-5" />;
    case 'WEBSITE': return <ExternalLink className="w-5 h-5" />;
    default: return <Mail className="w-5 h-5" />;
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'EMAIL': return 'text-blue-400 bg-blue-500/20';
    case 'SMS': return 'text-green-400 bg-green-500/20';
    case 'VOICE': return 'text-purple-400 bg-purple-500/20';
    case 'SOCIAL_MEDIA': return 'text-pink-400 bg-pink-500/20';
    case 'WEBSITE': return 'text-orange-400 bg-orange-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function PhishingPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data: examples, loading, error, refetch } =
    useFetch<PhishingExample[]>('/api/phishing-examples?all=true');

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!examples) return [];
    return examples.filter((ex) => {
      const matchSearch =
        !search ||
        ex.subject.toLowerCase().includes(search.toLowerCase()) ||
        ex.body?.toLowerCase().includes(search.toLowerCase()) ||
        ex.subject?.toLowerCase().includes(search.toLowerCase());
      const matchType = !typeFilter || ex.category === typeFilter;
      const matchDifficulty = !difficultyFilter || ex.difficulty === difficultyFilter;
      return matchSearch && matchType && matchDifficulty;
    });
  }, [examples, search, typeFilter, difficultyFilter]);

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Phishing Examples</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button onClick={refetch} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container space-y-6">
      <PageHeader
        title="Phishing Examples"
        description="Learn to identify phishing attempts by studying real-world examples."
        icon={Shield}
      />

      {/* Info Banner */}
      <div className="glass-card p-4 bg-cyan-500/5 border-cyan-500/20">
        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-300">
              Study these phishing examples to sharpen your detection skills.
              Click on any example to reveal the red flags and indicators.
            </p>
          </div>
        </div>
      </div>

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        placeholder="Search phishing examples..."
        filters={[
          {
            label: 'All Types',
            value: typeFilter,
            options: TYPES,
            onChange: setTypeFilter,
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
          icon={Mail}
          title="No phishing examples found"
          description={
            search || typeFilter || difficultyFilter
              ? 'Try adjusting your search or filters.'
              : 'No phishing examples are available yet.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((example, index) => {
            const isExpanded = expandedIds.has(example.id);
            const redFlags: string[] = Array.isArray(example.redFlags)
              ? example.redFlags as string[]
              : typeof example.redFlags === 'string'
              ? [example.redFlags]
              : [];
            const indicators: string[] = Array.isArray(example.redFlags)
              ? example.redFlags as string[]
              : typeof example.redFlags === 'string'
              ? [example.redFlags]
              : [];

            return (
              <motion.div
                key={example.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="glass-card overflow-hidden">
                  {/* Card Header - Always visible */}
                  <button
                    onClick={() => toggleExpand(example.id)}
                    className="w-full p-5 text-left hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`p-2.5 rounded-lg flex-shrink-0 ${getTypeColor(example.category)}`}>
                          {getTypeIcon(example.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold truncate">{example.subject}</h3>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(example.category)}`}>
                              {example.category.replace(/_/g, ' ')}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(example.difficulty)}`}>
                              {example.difficulty}
                            </span>
                            {example.category && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-gray-400 bg-gray-500/20">
                                {example.category}
                              </span>
                            )}
                          </div>
                          {example.body && (
                            <p className="text-sm text-gray-400 line-clamp-2">{example.body}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-4 border-t border-gray-800 pt-4">
                          {/* Simulated Email */}
                          {(example.senderEmail || example.subject || example.body) && (
                            <div className="rounded-lg bg-slate-900/80 border border-gray-700 overflow-hidden">
                              <div className="px-4 py-3 bg-slate-800/50 border-b border-gray-700 space-y-1">
                                {example.sender && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <User className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="text-gray-400">From:</span>
                                    <span className="text-white">{example.sender}</span>
                                    {example.senderEmail && (
                                      <span className="text-gray-500">&lt;{example.senderEmail}&gt;</span>
                                    )}
                                  </div>
                                )}
                                {example.subject && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <AtSign className="w-3.5 h-3.5 text-gray-500" />
                                    <span className="text-gray-400">Subject:</span>
                                    <span className="text-white font-medium">{example.subject}</span>
                                  </div>
                                )}
                              </div>
                              {example.body && (
                                <div className="p-4">
                                  <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {example.body}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Red Flags */}
                          {redFlags.length > 0 && (
                            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4">
                              <h4 className="text-sm font-semibold text-red-400 flex items-center gap-2 mb-3">
                                <Flag className="w-4 h-4" />
                                Red Flags
                              </h4>
                              <ul className="space-y-2">
                                {redFlags.map((flag, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                                    {flag}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Indicators */}
                          {indicators.length > 0 && (
                            <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-4">
                              <h4 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 mb-3">
                                <Eye className="w-4 h-4" />
                                Indicators to Watch For
                              </h4>
                              <ul className="space-y-2">
                                {indicators.map((indicator, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                    <Shield className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                                    {indicator}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {example.createdAt && (
                            <p className="text-xs text-gray-600">Added: {formatDate(example.createdAt)}</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
