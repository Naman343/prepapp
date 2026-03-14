"use client"

import { useEffect, useState, useCallback } from "react"
import api from "@/lib/axios"
import { Trash2, Plus, X, Link2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Test {
  id: string
  title: string
  duration: number
  totalQuestions: number
  year?: number
  date?: string
  isPublished: boolean
  createdAt: string
  _count: { questions: number }
}

interface Topic { id: string; name: string; subject: { name: string } }
interface Question {
  id: string
  text: string
  difficulty: string
  topic: { id: string; name: string; subject: { name: string } }
}

function AssignModal({
  test,
  onClose,
  onRefresh,
}: {
  test: Test
  onClose: () => void
  onRefresh: () => void
}) {
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [assignedIds, setAssignedIds] = useState<Set<string>>(new Set())
  const [topics, setTopics] = useState<Topic[]>([])
  const [filterTopicId, setFilterTopicId] = useState("")
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get("/admin/questions", { params: { limit: 200 } }),
      api.get(`/admin/tests/${test.id}/questions`),
      api.get("/admin/topics"),
    ]).then(([qRes, tRes, topicsRes]) => {
      setAllQuestions(qRes.data.questions)
      const ids = (tRes.data?.questions ?? []).map((q: { id: string }) => q.id)
      setAssignedIds(new Set(ids))
      setTopics(topicsRes.data)
    }).finally(() => setLoading(false))
  }, [test.id])

  const toggle = (id: string) =>
    setAssignedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.post(`/admin/tests/${test.id}/questions`, {
        questionIds: [...assignedIds],
      })
      onRefresh()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const filtered = allQuestions
    .filter((q) => !filterTopicId || q.topic.id === filterTopicId)
    .filter((q) => !search || q.text.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="font-semibold">Assign Questions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{test.title}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 border-b border-border flex gap-2">
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={filterTopicId}
            onChange={(e) => setFilterTopicId(e.target.value)}
          >
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.subject.name} — {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {loading ? (
            <div className="p-5 text-muted-foreground text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-5 text-muted-foreground text-sm">No questions found.</div>
          ) : (
            filtered.map((q) => (
              <label
                key={q.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={assignedIds.has(q.id)}
                  onChange={() => toggle(q.id)}
                  className="mt-0.5 shrink-0 accent-foreground"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{q.text}</p>
                  <span className="text-xs text-muted-foreground">
                    {q.topic.subject.name} › {q.topic.name} · {q.difficulty}
                  </span>
                </div>
              </label>
            ))
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-border">
          <span className="text-sm text-muted-foreground">
            {assignedIds.size} selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [assignTarget, setAssignTarget] = useState<Test | null>(null)

  // Create form state
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState("180")
  const [totalQuestions, setTotalQuestions] = useState("100")
  const [year, setYear] = useState("")
  const [date, setDate] = useState("")
  const [formError, setFormError] = useState("")
  const [saving, setSaving] = useState(false)

  const fetchTests = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get("/admin/tests")
      setTests(r.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTests() }, [fetchTests])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    if (!title.trim()) return setFormError("Title is required")
    setSaving(true)
    try {
      await api.post("/admin/tests", {
        title: title.trim(),
        duration: Number(duration),
        totalQuestions: Number(totalQuestions),
        year: year ? Number(year) : undefined,
        date: date || undefined,
      })
      setTitle(""); setDuration("180"); setTotalQuestions("100")
      setYear(""); setDate(""); setShowForm(false)
      fetchTests()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setFormError(e.response?.data?.message || "Failed to create test")
    } finally {
      setSaving(false)
    }
  }

  const handleTogglePublish = async (test: Test) => {
    await api.patch(`/admin/tests/${test.id}`, { isPublished: !test.isPublished })
    fetchTests()
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete test "${title}"? This cannot be undone.`)) return
    await api.delete(`/admin/tests/${id}`)
    fetchTests()
  }

  return (
    <div className="space-y-6">
      {/* Assign modal */}
      {assignTarget && (
        <AssignModal
          test={assignTarget}
          onClose={() => setAssignTarget(null)}
          onRefresh={fetchTests}
        />
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground ml-auto">
          {tests.length} test{tests.length !== 1 ? "s" : ""}
        </span>
        <Button size="sm" onClick={() => setShowForm((v) => !v)}>
          <Plus className="w-4 h-4 mr-1" /> Create Test
        </Button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">New Test</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Title</Label>
              <Input placeholder="UPSC Prelims 2024 GS-1" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Total Questions</Label>
              <Input type="number" min={1} value={totalQuestions} onChange={(e) => setTotalQuestions(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Year <span className="text-muted-foreground">(optional)</span></Label>
              <Input type="number" min={2000} placeholder="2024" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Exam Date <span className="text-muted-foreground">(optional)</span></Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          {formError && <p className="text-red-500 text-sm">{formError}</p>}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? "Creating..." : "Create Test"}</Button>
          </div>
        </form>
      )}

      {/* Tests list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="p-5 text-muted-foreground text-sm">Loading...</div>
        ) : tests.length === 0 ? (
          <div className="p-5 text-muted-foreground text-sm">No tests yet. Create one above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Year</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Questions</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Duration</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium max-w-xs truncate">{test.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{test.year ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {test._count.questions}
                    <span className="text-xs">/{test.totalQuestions}</span>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">{test.duration}m</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      test.isPublished
                        ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {test.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        title="Assign questions"
                        onClick={() => setAssignTarget(test)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Link2 className="w-4 h-4" />
                      </button>
                      <button
                        title={test.isPublished ? "Unpublish" : "Publish"}
                        onClick={() => handleTogglePublish(test)}
                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => handleDelete(test.id, test.title)}
                        className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
