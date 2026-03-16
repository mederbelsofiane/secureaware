"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useFetch, apiPost } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Video,
  Play,
  Layers,
  AlertTriangle,
  Loader2,
  ChevronRight,
  GraduationCap,
} from "lucide-react";

interface LessonDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  content: string | null;
  durationMins: number;
  order: number;
  moduleId: string;
  moduleTitle: string;
  totalLessons: number;
  isCompleted: boolean;
  prevLesson: { id: string; title: string; order: number } | null;
  nextLesson: { id: string; title: string; order: number } | null;
  allLessons: { id: string; title: string; order: number }[];
}

function getLessonIcon(type: string) {
  switch (type) {
    case "VIDEO": return <Video className="w-5 h-5" />;
    case "INTERACTIVE": return <Play className="w-5 h-5" />;
    case "SIMULATION": return <Layers className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
}

function formatContent(content: string) {
  const lines = content.split("\n");
  const elements: JSX.Element[] = [];
  let listItems: string[] = [];
  let listType: "ol" | "ul" | null = null;

  function flushList() {
    if (listItems.length > 0 && listType) {
      const Tag = listType;
      elements.push(
        <Tag key={`list-${elements.length}`} className={`${listType === "ol" ? "list-decimal" : "list-disc"} pl-6 space-y-2 my-4 text-gray-300`}>
          {listItems.map((item, i) => <li key={i} className="leading-relaxed">{item}</li>)}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      flushList();
      continue;
    }

    // Numbered list item
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      if (listType === "ul") flushList();
      listType = "ol";
      listItems.push(numberedMatch[2]);
      continue;
    }

    // Bullet list item
    if (line.startsWith("- ") || line.startsWith("• ")) {
      if (listType === "ol") flushList();
      listType = "ul";
      listItems.push(line.slice(2));
      continue;
    }

    flushList();

    // Section header (line ending with colon or ALL CAPS short line)
    if ((line.endsWith(":") && line.length < 80) || (line === line.toUpperCase() && line.length < 60 && line.length > 3)) {
      elements.push(
        <h3 key={`h-${i}`} className="text-lg font-semibold text-cyan-400 mt-8 mb-3 flex items-center gap-2">
          <ChevronRight className="w-4 h-4" />
          {line.replace(/:$/, "")}
        </h3>
      );
      continue;
    }

    // Bold pattern: "Something - description"
    const boldMatch = line.match(/^(.+?)\s[-–]\s(.+)/);
    if (boldMatch && boldMatch[1].length < 60) {
      elements.push(
        <p key={`p-${i}`} className="text-gray-300 leading-relaxed my-3">
          <span className="font-semibold text-white">{boldMatch[1]}</span>
          <span className="text-gray-400"> — </span>
          {boldMatch[2]}
        </p>
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="text-gray-300 leading-relaxed my-3">{line}</p>
    );
  }

  flushList();
  return elements;
}

export default function LessonViewerPage() {
  const params = useParams();
  const router = useRouter();
  const moduleId = params.id as string;
  const lessonId = params.lessonId as string;

  const { data: lesson, loading, error, refetch } = useFetch<LessonDetail>(`/api/lessons/${lessonId}`);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (lesson) setCompleted(lesson.isCompleted);
  }, [lesson]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleComplete = async () => {
    if (completed || completing) return;
    setCompleting(true);
    try {
      await apiPost(`/api/modules/${moduleId}/progress`, { lessonId, completed: true });
      setCompleted(true);
      toast.success("Lesson completed!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to mark complete");
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <PageLoading />;
  if (error || !lesson) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Lesson</h2>
          <p className="text-gray-400 mb-4">{error || "Lesson not found"}</p>
          <button onClick={() => router.push(`/dashboard/modules/${moduleId}`)} className="btn-secondary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Module
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Reading progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500"
          style={{ width: `${scrollProgress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <div className="page-container max-w-4xl mx-auto space-y-6 pt-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
          <Link href="/dashboard/modules" className="hover:text-cyan-400 transition-colors">Modules</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/dashboard/modules/${moduleId}`} className="hover:text-cyan-400 transition-colors truncate max-w-[200px]">{lesson.moduleTitle}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-300 truncate">{lesson.title}</span>
        </nav>

        {/* Lesson Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 flex-shrink-0">
              {getLessonIcon(lesson.type)}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-500 bg-slate-800 px-2 py-1 rounded">
                  Lesson {lesson.order} of {lesson.totalLessons}
                </span>
                <span className="text-xs font-medium text-gray-500 bg-slate-800 px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {lesson.durationMins} min
                </span>
                <span className="text-xs font-medium text-gray-500 bg-slate-800 px-2 py-1 rounded">
                  {lesson.type.replace(/_/g, " ")}
                </span>
                {completed && (
                  <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{lesson.title}</h1>
              {lesson.description && <p className="text-gray-400">{lesson.description}</p>}
            </div>
          </div>
        </motion.div>

        {/* Lesson Sidebar - Table of Contents */}
        <div className="flex gap-6">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-8 flex-1 min-w-0"
          >
            {lesson.content ? (
              <div className="prose prose-invert max-w-none">
                {formatContent(lesson.content)}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">No content available for this lesson yet.</p>
              </div>
            )}

            {/* Complete Button */}
            <div className="mt-10 pt-6 border-t border-slate-700/50">
              {completed ? (
                <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="font-medium text-emerald-400">Lesson Completed</span>
                </div>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={completing}
                  className="w-full btn-primary py-4 text-lg font-semibold flex items-center justify-center gap-3"
                >
                  {completing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Marking Complete...</>
                  ) : (
                    <><CheckCircle2 className="w-5 h-5" /> Mark Lesson as Complete</>
                  )}
                </button>
              )}
            </div>
          </motion.div>

          {/* Table of Contents Sidebar (desktop) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <div className="glass-card p-4 sticky top-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Lessons</h3>
              <div className="space-y-1">
                {lesson.allLessons.map((l) => (
                  <Link
                    key={l.id}
                    href={`/dashboard/modules/${moduleId}/lessons/${l.id}`}
                    className={`block px-3 py-2 rounded-lg text-sm transition-colors ${l.id === lesson.id ? "bg-cyan-500/10 text-cyan-400 font-medium" : "text-gray-400 hover:text-white hover:bg-slate-800/50"}`}
                  >
                    <span className="text-xs text-gray-600 mr-2">{l.order}.</span>
                    {l.title}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between gap-4"
        >
          {lesson.prevLesson ? (
            <Link
              href={`/dashboard/modules/${moduleId}/lessons/${lesson.prevLesson.id}`}
              className="glass-card p-4 flex items-center gap-3 hover:border-cyan-500/30 transition-colors group flex-1"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Previous Lesson</p>
                <p className="text-sm font-medium text-gray-300 group-hover:text-white truncate">{lesson.prevLesson.title}</p>
              </div>
            </Link>
          ) : <div className="flex-1" />}

          <Link
            href={`/dashboard/modules/${moduleId}`}
            className="flex-shrink-0 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/30 transition-colors"
            title="Back to module"
          >
            <Layers className="w-5 h-5 text-gray-400" />
          </Link>

          {lesson.nextLesson ? (
            <Link
              href={`/dashboard/modules/${moduleId}/lessons/${lesson.nextLesson.id}`}
              className="glass-card p-4 flex items-center gap-3 hover:border-cyan-500/30 transition-colors group flex-1 text-right"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">Next Lesson</p>
                <p className="text-sm font-medium text-gray-300 group-hover:text-white truncate">{lesson.nextLesson.title}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
            </Link>
          ) : completed ? (
            <Link
              href={`/dashboard/modules/${moduleId}`}
              className="glass-card p-4 flex items-center gap-3 hover:border-emerald-500/30 transition-colors group flex-1 text-right"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500">All Done!</p>
                <p className="text-sm font-medium text-emerald-400">Back to Module</p>
              </div>
              <GraduationCap className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            </Link>
          ) : <div className="flex-1" />}
        </motion.div>
      </div>
    </div>
  );
}
