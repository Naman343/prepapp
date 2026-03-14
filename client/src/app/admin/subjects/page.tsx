"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Trash2, Plus, ChevronDown, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SubTopic { id: string; name: string }
interface Topic { id: string; name: string; subTopics: SubTopic[] }
interface Subject { id: string; name: string; topics: Topic[] }

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Subject form
  const [newSubject, setNewSubject] = useState("")
  const [subjectError, setSubjectError] = useState("")

  // Topic form
  const [topicName, setTopicName] = useState("")
  const [topicSubjectId, setTopicSubjectId] = useState("")
  const [topicParentId, setTopicParentId] = useState("")
  const [topicError, setTopicError] = useState("")

  const fetchSubjects = async () => {
    try {
      const r = await api.get("/admin/subjects")
      setSubjects(r.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSubjects() }, [])

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubjectError("")
    if (!newSubject.trim()) return
    try {
      await api.post("/admin/subjects", { name: newSubject.trim() })
      setNewSubject("")
      fetchSubjects()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setSubjectError(e.response?.data?.message || "Failed to create subject")
    }
  }

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Delete subject "${name}"? This will fail if it has topics.`)) return
    try {
      await api.delete(`/admin/subjects/${id}`)
      fetchSubjects()
    } catch {
      alert("Cannot delete subject with existing topics. Delete topics first.")
    }
  }

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault()
    setTopicError("")
    if (!topicName.trim() || !topicSubjectId) return
    try {
      await api.post("/admin/topics", {
        name: topicName.trim(),
        subjectId: topicSubjectId,
        parentTopicId: topicParentId || undefined,
      })
      setTopicName("")
      setTopicParentId("")
      fetchSubjects()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setTopicError(e.response?.data?.message || "Failed to create topic")
    }
  }

  const handleDeleteTopic = async (id: string, name: string) => {
    if (!confirm(`Delete topic "${name}"?`)) return
    try {
      await api.delete(`/admin/topics/${id}`)
      fetchSubjects()
    } catch {
      alert("Cannot delete topic with existing questions.")
    }
  }

  const selectedSubject = subjects.find((s) => s.id === topicSubjectId)

  return (
    <div className="space-y-8">
      {/* ── Add Subject ────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">Add Subject</h3>
        <form onSubmit={handleAddSubject} className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="subject-name">Subject Name</Label>
            <Input
              id="subject-name"
              placeholder="e.g. General Studies"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
          </div>
          <Button type="submit" className="shrink-0">
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </form>
        {subjectError && <p className="text-red-500 text-sm mt-2">{subjectError}</p>}
      </section>

      {/* ── Add Topic ──────────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-4">Add Topic</h3>
        <form onSubmit={handleAddTopic} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="space-y-1.5">
            <Label>Topic Name</Label>
            <Input
              placeholder="e.g. Modern History"
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={topicSubjectId}
              onChange={(e) => { setTopicSubjectId(e.target.value); setTopicParentId("") }}
            >
              <option value="">Select subject...</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Parent Topic <span className="text-muted-foreground">(optional)</span></Label>
            <select
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={topicParentId}
              onChange={(e) => setTopicParentId(e.target.value)}
              disabled={!topicSubjectId}
            >
              <option value="">None (top-level)</option>
              {selectedSubject?.topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={!topicName.trim() || !topicSubjectId}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </form>
        {topicError && <p className="text-red-500 text-sm mt-2">{topicError}</p>}
      </section>

      {/* ── Subject List ───────────────────────────────────────── */}
      <section className="rounded-xl border border-border bg-card">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold">Subjects & Topics</h3>
        </div>
        {loading ? (
          <div className="p-5 text-muted-foreground text-sm">Loading...</div>
        ) : subjects.length === 0 ? (
          <div className="p-5 text-muted-foreground text-sm">No subjects yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {subjects.map((subject) => (
              <li key={subject.id}>
                <div className="flex items-center gap-2 px-5 py-3">
                  <button
                    onClick={() => toggleExpand(subject.id)}
                    className="flex items-center gap-2 flex-1 text-sm font-semibold text-left"
                  >
                    {expanded.has(subject.id)
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    }
                    {subject.name}
                    <span className="text-xs font-normal text-muted-foreground">
                      ({subject.topics.length} topics)
                    </span>
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subject.id, subject.name)}
                    className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {expanded.has(subject.id) && (
                  <ul className="pl-10 pb-2 space-y-0.5">
                    {subject.topics.map((topic) => (
                      <li key={topic.id}>
                        <div className="flex items-center gap-2 py-1.5 pr-5">
                          <span className="text-sm flex-1">{topic.name}</span>
                          {topic.subTopics.length > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {topic.subTopics.length} sub-topics
                            </span>
                          )}
                          <button
                            onClick={() => handleDeleteTopic(topic.id, topic.name)}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        {topic.subTopics.map((st) => (
                          <div key={st.id} className="flex items-center gap-2 pl-4 py-1 pr-5">
                            <span className="text-xs text-muted-foreground flex-1">↳ {st.name}</span>
                            <button
                              onClick={() => handleDeleteTopic(st.id, st.name)}
                              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
