'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFetch, apiPost } from '@/hooks/use-fetch';
import { PageLoading } from '@/components/ui/loading';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { QuizResultDetail } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Trophy,
  RotateCcw,
  Home,
  Target,
  Loader2,
  ChevronLeft,
  HelpCircle,
  Award,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';

interface QuizOption {
  id: string;
  text: string;
  order: number;
}

interface QuizQuestion {
  id: string;
  text: string;
  explanation: string;
  order: number;
  options: QuizOption[];
}

interface QuizData {
  id: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: string;
  timeLimitMins: number;
  passingScore: number;
  questions: QuizQuestion[];
  module?: { title: string; id: string };
}

type QuizState = 'ready' | 'in-progress' | 'submitting' | 'results';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function TakeQuizPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const { data: quiz, loading, error, refetch } = useFetch<QuizData>(`/api/quizzes/${quizId}`);

  const [quizState, setQuizState] = useState<QuizState>('ready');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [result, setResult] = useState<QuizResultDetail | null>(null);
  const [reviewQuestion, setReviewQuestion] = useState(0);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const questions = quiz?.questions?.sort((a, b) => a.order - b.order) || [];
  const totalQuestions = questions.length;

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!quiz) return;
    stopTimer();
    setQuizState('submitting');

    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await apiPost<QuizResultDetail>(`/api/quizzes/${quiz.id}/submit`, {
        answers,
        timeTaken,
      });
      setResult(res);
      setQuizState('results');
      if (res.passed) {
        toast.success('Congratulations! You passed the quiz!');
      } else {
        toast('You did not pass this time. Review and try again.', { icon: '📝' });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit quiz');
      setQuizState('in-progress');
    }
  }, [quiz, answers, stopTimer]);

  useEffect(() => {
    if (quizState !== 'in-progress' || !quiz?.timeLimitMins) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => stopTimer();
  }, [quizState, quiz?.timeLimitMins, handleSubmit, stopTimer]);

  const startQuiz = () => {
    if (!quiz) return;
    setAnswers({});
    setCurrentQuestion(0);
    setResult(null);
    setTimeRemaining(quiz.timeLimitMins * 60);
    startTimeRef.current = Date.now();
    setQuizState('in-progress');
  };

  const selectAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const answeredCount = Object.keys(answers).length;
  const isTimeLow = timeRemaining > 0 && timeRemaining < 60;

  if (loading) return <PageLoading />;

  if (error) {
    return (
      <div className="page-container">
        <div className="glass-card p-8 border-red-500/30 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Failed to Load Quiz</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <Link href="/dashboard/quizzes" className="btn-secondary">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quizzes
            </Link>
            <button onClick={refetch} className="btn-primary">Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz) return <PageLoading />;

  // READY STATE
  if (quizState === 'ready') {
    return (
      <div className="page-container">
        <Link
          href="/dashboard/quizzes"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 max-w-2xl mx-auto text-center"
        >
          <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-6">
            <Target className="w-8 h-8 text-cyan-400" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-400 mb-2">{quiz.description}</p>
          )}
          {quiz.module && (
            <p className="text-sm text-gray-500 mb-6">
              <BookOpen className="w-4 h-4 inline mr-1" />
              Module: {quiz.module.title}
            </p>
          )}

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-4 bg-slate-800/50">
              <p className="text-2xl font-bold text-white">{totalQuestions}</p>
              <p className="text-xs text-gray-500">Questions</p>
            </div>
            <div className="glass-card p-4 bg-slate-800/50">
              <p className="text-2xl font-bold text-white">{quiz.timeLimitMins}m</p>
              <p className="text-xs text-gray-500">Time Limit</p>
            </div>
            <div className="glass-card p-4 bg-slate-800/50">
              <p className="text-2xl font-bold text-white">{quiz.passingScore}%</p>
              <p className="text-xs text-gray-500">Passing Score</p>
            </div>
          </div>

          <div className="glass-card p-4 bg-yellow-500/5 border-yellow-500/20 mb-6 text-left">
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">Before you begin:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Answer all questions within the time limit</li>
              <li>• You can navigate between questions freely</li>
              <li>• The quiz auto-submits when time runs out</li>
              <li>• You need {quiz.passingScore}% or higher to pass</li>
            </ul>
          </div>

          <button onClick={startQuiz} className="btn-primary px-8 py-3 text-lg inline-flex items-center gap-2">
            <Play className="w-5 h-5" /> Start Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  // SUBMITTING STATE
  if (quizState === 'submitting') {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Submitting Your Answers...</h2>
          <p className="text-gray-400">Please wait while we grade your quiz.</p>
        </div>
      </div>
    );
  }

  // RESULTS STATE
  if (quizState === 'results' && result) {
    const sortedQuestions = [...questions];
    const reviewQ = sortedQuestions[reviewQuestion];
    const answerDetail = result.answers.find((a) => a.questionId === reviewQ?.id);

    return (
      <div className="page-container space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
            result.passed ? 'bg-emerald-500/20' : 'bg-red-500/20'
          }`}>
            {result.passed ? (
              <Trophy className="w-10 h-10 text-emerald-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            {result.passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
          </h1>
          <p className="text-gray-400 mb-6">
            {result.passed
              ? 'Excellent work! You demonstrated strong knowledge.'
              : 'Review the material and try again when ready.'}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6">
            <div className="glass-card p-4 bg-slate-800/50">
              <p className={`text-3xl font-bold ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.score}%
              </p>
              <p className="text-xs text-gray-500">Score</p>
            </div>
            <div className="glass-card p-4 bg-slate-800/50">
              <p className="text-3xl font-bold text-white">
                {result.correctAnswers}/{result.totalQuestions}
              </p>
              <p className="text-xs text-gray-500">Correct</p>
            </div>
            <div className="glass-card p-4 bg-slate-800/50">
              <p className="text-3xl font-bold text-white">{quiz.passingScore}%</p>
              <p className="text-xs text-gray-500">Required</p>
            </div>
          </div>

          <ProgressBar
            value={result.score}
            color={result.passed ? 'green' : 'red'}
            size="lg"
            className="max-w-md mx-auto mb-6"
          />

          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/dashboard/quizzes" className="btn-secondary inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> All Quizzes
            </Link>
            {!result.passed && (
              <button onClick={startQuiz} className="btn-primary inline-flex items-center gap-2">
                <RotateCcw className="w-4 h-4" /> Retry Quiz
              </button>
            )}
            {quiz.module && (
              <Link
                href={`/dashboard/modules/${quiz.module.id}`}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" /> View Module
              </Link>
            )}
            <Link href="/dashboard" className="btn-secondary inline-flex items-center gap-2">
              <Home className="w-4 h-4" /> Dashboard
            </Link>
          </div>
        </motion.div>

        {/* Question Review */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Question Review</h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {sortedQuestions.map((q, idx) => {
              const ad = result.answers.find((a) => a.questionId === q.id);
              return (
                <button
                  key={q.id}
                  onClick={() => setReviewQuestion(idx)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
                    reviewQuestion === idx
                      ? 'ring-2 ring-cyan-400 bg-cyan-500/20 text-white'
                      : ad?.isCorrect
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {reviewQ && (
            <div>
              <p className="text-white font-medium mb-4">
                <span className="text-gray-500 mr-2">Q{reviewQuestion + 1}.</span>
                {reviewQ.text}
              </p>
              <div className="space-y-2 mb-4">
                {reviewQ.options
                  .sort((a, b) => a.order - b.order)
                  .map((option) => {
                    const isSelected = answerDetail?.selectedOptionId === option.id;
                    const isCorrect = answerDetail?.correctOptionId === option.id;
                    let cls = 'border-gray-700 bg-slate-800/50';
                    if (isCorrect) cls = 'border-emerald-500/50 bg-emerald-500/10';
                    else if (isSelected && !isCorrect) cls = 'border-red-500/50 bg-red-500/10';

                    return (
                      <div
                        key={option.id}
                        className={`p-3 rounded-lg border flex items-center gap-3 ${cls}`}
                      >
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        ) : isSelected ? (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-600 flex-shrink-0" />
                        )}
                        <span className={isCorrect ? 'text-emerald-300' : isSelected ? 'text-red-300' : 'text-gray-400'}>
                          {option.text}
                        </span>
                      </div>
                    );
                  })}
              </div>
              {reviewQ.explanation && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-blue-300">
                    <span className="font-medium">Explanation:</span> {reviewQ.explanation}
                  </p>
                </div>
              )}
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => setReviewQuestion(Math.max(0, reviewQuestion - 1))}
                  disabled={reviewQuestion === 0}
                  className="btn-secondary inline-flex items-center gap-1 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  onClick={() => setReviewQuestion(Math.min(totalQuestions - 1, reviewQuestion + 1))}
                  disabled={reviewQuestion === totalQuestions - 1}
                  className="btn-secondary inline-flex items-center gap-1 disabled:opacity-30"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // IN-PROGRESS STATE
  const currentQ = questions[currentQuestion];
  if (!currentQ) return <PageLoading />;

  return (
    <div className="page-container space-y-6">
      {/* Timer and Progress */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <div className={`flex items-center gap-2 font-mono font-bold text-lg ${
            isTimeLow ? 'text-red-400 animate-pulse' : 'text-white'
          }`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeRemaining)}
          </div>
          <span className="text-sm text-gray-400">
            {answeredCount}/{totalQuestions} answered
          </span>
        </div>
        <ProgressBar value={currentQuestion + 1} max={totalQuestions} size="sm" color="blue" />
      </div>

      {/* Question navigation dots */}
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentQuestion(idx)}
            className={`w-9 h-9 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
              currentQuestion === idx
                ? 'ring-2 ring-cyan-400 bg-cyan-500/20 text-white'
                : answers[q.id]
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800/50 text-gray-500 hover:bg-slate-700'
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="glass-card p-6"
        >
          <p className="text-lg font-medium text-white mb-6">
            <span className="text-cyan-400 mr-2">Q{currentQuestion + 1}.</span>
            {currentQ.text}
          </p>

          <div className="space-y-3">
            {currentQ.options
              .sort((a, b) => a.order - b.order)
              .map((option) => {
                const isSelected = answers[currentQ.id] === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => selectAnswer(currentQ.id, option.id)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-white'
                        : 'border-gray-700 bg-slate-800/50 text-gray-300 hover:border-gray-600 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'border-cyan-400' : 'border-gray-600'
                      }`}>
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
                      </div>
                      <span>{option.text}</span>
                    </div>
                  </button>
                );
              })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
          className="btn-secondary inline-flex items-center gap-2 disabled:opacity-30"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        <div className="flex gap-3">
          {currentQuestion < totalQuestions - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              className="btn-primary inline-flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={answeredCount < totalQuestions}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Quiz
              {answeredCount < totalQuestions && (
                <span className="text-xs opacity-70">({totalQuestions - answeredCount} unanswered)</span>
              )}
            </button>
          )}
        </div>
      </div>

      {answeredCount === totalQuestions && currentQuestion < totalQuestions - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <button onClick={handleSubmit} className="btn-primary inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Submit All Answers
          </button>
        </motion.div>
      )}
    </div>
  );
}
