"use client"

import { useEffect, useState, useCallback } from "react"
import api from "@/lib/axios"
import { Trash2, Plus, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Option { id: string; text: string; isCorrect: boolean }
interface Topic { id: string; name: string; subject: { name: string } }
interface Question {
  id: string
  text: string
  difficulty: "EASY" | "MEDIUM" | "HARD"
  explanation?: string
  topic: { id: string; name: string; subject: { name: string } }
  options: Option[]
}

const DIFF_COLORS = {
  EASY: "text-green-600 bg-green-50 dark:bg-green-950",
  MEDIUM: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
  HARD: "text-red-600 bg-red-50 dark:bg-red-950",
}

const emptyOption = () => ({ text: "", isCorrect: false })

function QuestionForm({
  topics,
  onSuccess,
  onCancel,
}: {
  topics: Topic[]
  onSuccess: () => void
  onCancel: () => void
}) {
  const [text, setText] = useState("")
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM")
  const [explanation, setExplanation] = useState("")
  const [topicId, setTopicId] = useState("")
  const [options, setOptions] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ])
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const setCorrect = (i: number) =>
    setOptions((prev) => prev.map((o, j) => ({ ...o, isCorrect: j === i })))

  const setOptionText = (i: number, val: string) =>
    setOptions((prev) => prev.map((o, j) => (j === i ? { ...o, text: val } : o)))

  const addOption = () => setOptions((prev) => [...prev, emptyOption()])
  const removeOption = (i: number) => setOptions((prev) => prev.filter((_, j) => j !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!text.trim()) return setError("Question text is required")
    if (!topicId) return setError("Please select a topic")
    const filled = options.filter((o) => o.text.trim())
    if (filled.length < 2) return setError("At least 2 options are required")
    if (!filled.some((o) => o.isCorrect)) return setError("Mark one option as correct")
    setSaving(true)
    try {
      await api.post("/admin/questions", {
        text: text.trim(),
        difficulty,
        explanation: explanation.trim() || undefined,
        topicId,
        options: filled,
      })
      onSuccess()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e.response?.data?.message || "Failed to save question")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border bg-card p-5 space-y-4"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold">New Question</h3>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5">
        <Label>Question Text</Label>
        <textarea
          className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          placeholder="Enter the question..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Difficulty</Label>
          <select
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Topic</Label>
          <select
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
          >
            <option value="">Select topic...</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.subject.name} — {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Explanation <span className="text-muted-foreground">(optional)</span></Label>
        <textarea
          className="w-full min-h-16 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
          placeholder="Why is the correct answer correct?"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Options <span className="text-muted-foreground text-xs">(click radio to mark correct)</span></Label>
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              checked={opt.isCorrect}
              onChange={() => setCorrect(i)}
              className="shrink-0 accent-green-600"
            />
            <Input
              placeholder={`Option ${i + 1}`}
              value={opt.text}
              onChange={(e) => setOptionText(i, e.target.value)}
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => removeOption(i)}
                className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button
            type="button"
            onClick={addOption}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Plus className="w-3 h-3" /> Add option
          </button>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2 justify-end pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Question"}</Button>
      </div>
    </form>
  )
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [topics, setTopics] = useState<Topic[]>([])
  const [filterTopicId, setFilterTopicId] = useState("")
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const limit = 20

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit }
      if (filterTopicId) params.topicId = filterTopicId
      const r = await api.get("/admin/questions", { params })
      setQuestions(r.data.questions)
      setTotal(r.data.total)
    } finally {
      setLoading(false)
    }
  }, [page, filterTopicId])

  useEffect(() => {
    api.get("/admin/topics").then((r) => setTopics(r.data))
  }, [])

  useEffect(() => { fetchQuestions() }, [fetchQuestions])

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this question? This cannot be undone.")) return
    await api.delete(`/admin/questions/${id}`)
    fetchQuestions()
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={filterTopicId}
          onChange={(e) => { setFilterTopicId(e.target.value); setPage(1) }}
        >
          <option value="">All topics</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.subject.name} — {t.name}
            </option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground ml-auto">
          {total} question{total !== 1 ? "s" : ""}
        </span>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Question
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <QuestionForm
          topics={topics}
          onSuccess={() => { setShowForm(false); fetchQuestions() }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Question list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-5 text-muted-foreground text-sm">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="p-5 text-muted-foreground text-sm">No questions found.</div>
        ) : (
          <ul className="divide-y divide-border">
            {questions.map((q, i) => (
              <li key={q.id} className="p-4 flex gap-3">
                <span className="text-xs text-muted-foreground w-6 shrink-0 mt-0.5">
                  {(page - 1) * limit + i + 1}.
                </span>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start gap-2">
                    <p className="text-sm flex-1">{q.text}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${DIFF_COLORS[q.difficulty]}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {q.topic.subject.name} › {q.topic.name}
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {q.options.map((opt) => (
                      <div
                        key={opt.id}
                        className={`text-xs px-2 py-1 rounded ${
                          opt.isCorrect
                            ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {opt.isCorrect ? "✓ " : ""}{opt.text}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="shrink-0 p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-border px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
