"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { apiPost } from "@/hooks/use-fetch";
import { PageLoading } from "@/components/ui/loading";
import { PageHeader } from "@/components/ui/page-header";
import { generateId } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Plus,
  ArrowLeft,
  Save,
  Trash2,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
} from "lucide-react";

interface OptionForm {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface QuestionForm {
  id: string;
  text: string;
  explanation: string;
  order: number;
  options: OptionForm[];
  isExpanded: boolean;
}

const CATEGORIES = [
  "PHISHING","PASSWORDS","SOCIAL_ENGINEERING","MALWARE","BROWSING",
  "MOBILE","NETWORK","DATA_PROTECTION","COMPLIANCE","GENERAL",
];

export default function CreateQuizPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [difficulty, setDifficulty] = useState("INTERMEDIATE");
  const [status, setStatus] = useState("DRAFT");
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimitMins, setTimeLimitMins] = useState<number | null>(15);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    const newQ: QuestionForm = {
      id: `new_${generateId()}`,
      text: "",
      explanation: "",
      order: questions.length,
      isExpanded: true,
      options: [
        { id: `new_${generateId()}`, text: "", isCorrect: true, order: 0 },
        { id: `new_${generateId()}`, text: "", isCorrect: false, order: 1 },
      ],
    };
    setQuestions([...questions, newQ]);
  };

  const removeQuestion = (qIdx: number) => {
    setQuestions(questions.filter((_, i) => i !== qIdx).map((q, i) => ({ ...q, order: i })));
  };

  const updateQuestion = (qIdx: number, field: string, value: string) => {
    setQuestions(questions.map((q, i) => i === qIdx ? { ...q, [field]: value } : q));
  };

  const toggleExpand = (qIdx: number) => {
    setQuestions(questions.map((q, i) => i === qIdx ? { ...q, isExpanded: !q.isExpanded } : q));
  };

  const addOption = (qIdx: number) => {
    setQuestions(questions.map((q, i) => {
      if (i !== qIdx) return q;
      return {
        ...q,
        options: [
          ...q.options,
          { id: `new_${generateId()}`, text: "", isCorrect: false, order: q.options.length },
        ],
      };
    }));
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    setQuestions(questions.map((q, i) => {
      if (i !== qIdx) return q;
      const newOpts = q.options.filter((_, j) => j !== oIdx).map((o, j) => ({ ...o, order: j }));
      return { ...q, options: newOpts };
    }));
  };

  const updateOption = (qIdx: number, oIdx: number, field: string, value: string | boolean) => {
    setQuestions(questions.map((q, i) => {
      if (i !== qIdx) return q;
      return {
        ...q,
        options: q.options.map((o, j) => {
          if (j !== oIdx) {
            if (field === "isCorrect" && value === true) return { ...o, isCorrect: false };
            return o;
          }
          return { ...o, [field]: value };
        }),
      };
    }));
  };

  const moveQuestion = (qIdx: number, direction: "up" | "down") => {
    const newIdx = direction === "up" ? qIdx - 1 : qIdx + 1;
    if (newIdx < 0 || newIdx >= questions.length) return;
    const newQuestions = [...questions];
    [newQuestions[qIdx], newQuestions[newIdx]] = [newQuestions[newIdx], newQuestions[qIdx]];
    setQuestions(newQuestions.map((q, i) => ({ ...q, order: i })));
  };

  const validate = (): string | null => {
    if (!title.trim()) return "Quiz title is required";
    if (questions.length === 0) return "Add at least one question";
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) return `Question ${i + 1} text is required`;
      if (q.options.length < 2) return `Question ${i + 1} needs at least 2 options`;
      const hasCorrect = q.options.some((o) => o.isCorrect);
      if (!hasCorrect) return `Question ${i + 1} needs a correct answer`;
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].text.trim()) return `Question ${i + 1}, Option ${j + 1} text is required`;
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setSaving(true);
    try {
      const result = await apiPost<{ id: string }>("/api/quizzes", {
        title,
        description: description || null,
        category,
        difficulty,
        status,
        passingScore,
        timeLimitMins,
        questions: questions.map((q, qi) => ({
          text: q.text,
          explanation: q.explanation || null,
          order: qi,
          options: q.options.map((o, oi) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            order: oi,
          })),
        })),
      });
      toast.success("Quiz created successfully");
      router.push(`/admin/quizzes/${result.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create quiz");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <PageLoading />;

  return (
    <div className="page-container">
      <PageHeader
        title="Create New Quiz"
        icon={ClipboardList}
        action={
          <div className="flex items-center gap-2">
            <Link href="/admin/quizzes" className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Cancel
            </Link>
            <button onClick={handleSubmit} className="btn-primary flex items-center gap-2" disabled={saving}>
              <Save className="w-4 h-4" /> {saving ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        }
      />

      {/* Quiz Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quiz Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label-text">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
              placeholder="Enter quiz title"
            />
          </div>
          <div className="md:col-span-2">
            <label className="label-text">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[80px]"
              placeholder="Optional description for this quiz"
            />
          </div>
          <div>
            <label className="label-text">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">Difficulty</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </div>
          <div>
            <label className="label-text">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-field">
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
          <div>
            <label className="label-text">Passing Score (%)</label>
            <input
              type="number"
              value={passingScore}
              onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
              className="input-field"
              min={0}
              max={100}
            />
          </div>
          <div>
            <label className="label-text">Time Limit (minutes)</label>
            <input
              type="number"
              value={timeLimitMins ?? ""}
              onChange={(e) => setTimeLimitMins(e.target.value ? parseInt(e.target.value) : null)}
              className="input-field"
              placeholder="Leave empty for no limit"
              min={1}
            />
          </div>
        </div>
      </motion.div>

      {/* Questions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" /> Questions ({questions.length})
          </h3>
          <button onClick={addQuestion} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Question
          </button>
        </div>

        <div className="space-y-4">
          {questions.map((question, qIdx) => (
            <div key={question.id} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveQuestion(qIdx, "up")}
                    disabled={qIdx === 0}
                    className="p-0.5 hover:bg-dark-600 rounded disabled:opacity-30"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                  <button
                    onClick={() => moveQuestion(qIdx, "down")}
                    disabled={qIdx === questions.length - 1}
                    className="p-0.5 hover:bg-dark-600 rounded disabled:opacity-30"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                  </button>
                </div>
                <span className="w-8 h-8 rounded-lg bg-accent-blue/20 text-accent-blue text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {qIdx + 1}
                </span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
                    className="input-field"
                    placeholder="Enter question text..."
                  />
                </div>
                <button
                  onClick={() => toggleExpand(qIdx)}
                  className="p-2 hover:bg-dark-600 rounded-lg text-gray-400"
                >
                  {question.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => removeQuestion(qIdx)}
                  className="p-2 hover:bg-dark-600 rounded-lg text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {question.isExpanded && (
                <div className="ml-14 space-y-3">
                  <div>
                    <label className="label-text text-xs">Explanation (shown after answer)</label>
                    <textarea
                      value={question.explanation}
                      onChange={(e) => updateQuestion(qIdx, "explanation", e.target.value)}
                      className="input-field min-h-[60px] text-sm"
                      placeholder="Explain the correct answer..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="label-text text-xs">Options (click checkmark to mark correct)</label>
                    {question.options.map((option, oIdx) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <button
                          onClick={() => updateOption(qIdx, oIdx, "isCorrect", true)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-colors ${
                            option.isCorrect
                              ? "bg-green-500/20 border-green-500/30 text-green-400"
                              : "bg-dark-700/50 border-gray-700/30 text-gray-600 hover:border-gray-600/50"
                          }`}
                          title="Mark as correct answer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-gray-500 w-5">{String.fromCharCode(65 + oIdx)}.</span>
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) => updateOption(qIdx, oIdx, "text", e.target.value)}
                          className="input-field flex-1"
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                        />
                        {question.options.length > 2 && (
                          <button
                            onClick={() => removeOption(qIdx, oIdx)}
                            className="p-2 hover:bg-dark-600 rounded-lg text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                    {question.options.length < 6 && (
                      <button
                        onClick={() => addOption(qIdx)}
                        className="text-xs text-accent-blue hover:text-cyan-300 flex items-center gap-1 mt-1"
                      >
                        <Plus className="w-3 h-3" /> Add Option
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="glass-card p-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">No questions yet. Add your first question to build the quiz.</p>
            <button onClick={addQuestion} className="btn-primary">
              <Plus className="w-4 h-4 inline mr-1" /> Add Question
            </button>
          </div>
        )}

        {/* Bottom Save Button */}
        {questions.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button onClick={handleSubmit} className="btn-primary flex items-center gap-2" disabled={saving}>
              <Save className="w-4 h-4" /> {saving ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}