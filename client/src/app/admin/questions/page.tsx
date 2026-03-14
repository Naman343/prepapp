"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import api from "@/lib/axios"
import { Trash2, Plus, ChevronLeft, ChevronRight, X, Pencil, ImagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Option { id: string; text: string; isCorrect: boolean }
interface Topic { id: string; name: string; subject: { name: string } }
interface Question {
  id: string
  text: string
  imageUrl?: string
  examYear?: number | null
  difficulty: "EASY" | "MEDIUM" | "HARD"
  explanation?: string
  topic: { id: string; name: string; subject: { name: string } }
  options: Option[]
  tests: { year: number | null; title: string }[]
}

const DIFF_COLORS = {
  EASY: "text-green-600 bg-green-50 dark:bg-green-950",
  MEDIUM: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950",
  HARD: "text-red-600 bg-red-50 dark:bg-red-950",
}

const emptyOption = () => ({ text: "", isCorrect: false })

function QuestionForm({
  topics,
  initialData,
  onSuccess,
  onCancel,
}: {
  topics: Topic[]
  initialData?: Question
  onSuccess: () => void
  onCancel: () => void
}) {
  const [text, setText] = useState(initialData?.text ?? "")
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl ?? "")
  const [imgUploading, setImgUploading] = useState(false)
  const [imgError, setImgError] = useState("")
  const imgRef = useRef<HTMLInputElement>(null)
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">(initialData?.difficulty ?? "MEDIUM")
  const [examYear, setExamYear] = useState(initialData?.examYear ? String(initialData.examYear) : "")
  const [explanation, setExplanation] = useState(initialData?.explanation ?? "")
  const [topicId, setTopicId] = useState(initialData?.topic.id ?? "")
  const [options, setOptions] = useState(
    initialData?.options.map((o) => ({ text: o.text, isCorrect: o.isCorrect })) ?? [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ]
  )
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const setCorrect = (i: number) =>
    setOptions((prev) => prev.map((o, j) => ({ ...o, isCorrect: j === i })))

  const setOptionText = (i: number, val: string) =>
    setOptions((prev) => prev.map((o, j) => (j === i ? { ...o, text: val } : o)))

  const addOption = () => setOptions((prev) => [...prev, emptyOption()])
  const removeOption = (i: number) => setOptions((prev) => prev.filter((_, j) => j !== i))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgError("")
    setImgUploading(true)
    try {
      const fd = new FormData()
      fd.append("image", file)
      const r = await api.post<{ url: string }>("/admin/upload-image", fd)
      setImageUrl(r.data.url)
    } catch {
      setImgError("Image upload failed")
    } finally {
      setImgUploading(false)
      if (imgRef.current) imgRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!text.trim()) return setError("Question text is required")
    if (!topicId) return setError("Please select a topic")
    const filled = options.filter((o) => o.text.trim())
    if (filled.length < 2) return setError("At least 2 options are required")
    if (!filled.some((o) => o.isCorrect)) return setError("Mark one option as correct")
    const examYearNum = examYear.trim() ? Number(examYear.trim()) : undefined
    if (examYear.trim() && (!Number.isInteger(examYearNum) || (examYearNum ?? 0) < 1900 || (examYearNum ?? 0) > 2100)) {
      return setError("Year must be a valid number between 1900 and 2100")
    }
    setSaving(true)
    try {
      if (initialData) {
        await api.patch(`/admin/questions/${initialData.id}`, {
          text: text.trim(),
          examYear: examYearNum,
          difficulty,
          explanation: explanation.trim() || undefined,
          topicId,
          imageUrl: imageUrl || undefined,
          options: filled,
        })
      } else {
        await api.post("/admin/questions", {
          text: text.trim(),
          examYear: examYearNum,
          difficulty,
          explanation: explanation.trim() || undefined,
          topicId,
          imageUrl: imageUrl || undefined,
          options: filled,
        })
      }
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
        <h3 className="font-semibold">{initialData ? "Edit Question" : "New Question"}</h3>
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
        {/* Image upload */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={imgRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => imgRef.current?.click()}
            disabled={imgUploading}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border rounded px-2.5 py-1.5 hover:border-foreground transition-colors disabled:opacity-50"
          >
            {imgUploading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...</>
              : <><ImagePlus className="w-3.5 h-3.5" /> {imageUrl ? "Replace image" : "Attach image"}</>
            }
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Remove image
            </button>
          )}
        </div>
        {imgError && <p className="text-red-500 text-xs">{imgError}</p>}
        {imageUrl && (
          <div className="mt-2 rounded-md border border-border overflow-hidden max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:5000'}${imageUrl}`}
              alt="Question image preview"
              className="max-h-48 w-auto object-contain"
            />
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
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
          <Label>Year <span className="text-muted-foreground">(optional)</span></Label>
          <Input
            type="number"
            min={1900}
            max={2100}
            placeholder="e.g. 2021"
            value={examYear}
            onChange={(e) => setExamYear(e.target.value)}
          />
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
          className="w-full min-h-36 rounded-md border border-input bg-background px-3 py-2 text-sm resize-y"
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
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : initialData ? "Update Question" : "Save Question"}</Button>
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
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

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
      {editingQuestion && (
        <QuestionForm
          topics={topics}
          initialData={editingQuestion}
          onSuccess={() => { setEditingQuestion(null); fetchQuestions() }}
          onCancel={() => setEditingQuestion(null)}
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
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFF_COLORS[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                      {q.examYear && (
                        <div className="flex flex-wrap justify-end gap-1">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium"
                            title="Question year"
                          >
                            {q.examYear}
                          </span>
                        </div>
                      )}
                      {!q.examYear && q.tests.length > 0 && (
                        <div className="flex flex-wrap justify-end gap-1">
                          {q.tests
                            .filter((t) => t.year)
                            .map((t, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium"
                                title={t.title}
                              >
                                {t.year}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    {q.topic.subject.name} › {q.topic.name}
                  </div>

                  {q.imageUrl && (
                    <div className="rounded-md border border-border overflow-hidden max-w-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? 'http://localhost:5000'}${q.imageUrl}`}
                        alt="Question image"
                        className="max-h-52 w-auto object-contain"
                      />
                    </div>
                  )}

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
                <div className="flex flex-col gap-1 shrink-0 self-start">
                  <button
                    onClick={() => { setShowForm(false); setEditingQuestion(q) }}
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit question"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(q.id)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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
