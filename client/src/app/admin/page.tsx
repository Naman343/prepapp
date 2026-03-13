"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { HelpCircle, FileText, BookOpen, Layers, Users } from "lucide-react"

interface Stats {
  questions: number
  tests: number
  subjects: number
  topics: number
  users: number
}

const statCards = [
  { key: "questions", label: "Questions", icon: HelpCircle, color: "text-blue-500" },
  { key: "tests", label: "Tests", icon: FileText, color: "text-green-500" },
  { key: "subjects", label: "Subjects", icon: BookOpen, color: "text-purple-500" },
  { key: "topics", label: "Topics", icon: Layers, color: "text-orange-500" },
  { key: "users", label: "Users", icon: Users, color: "text-pink-500" },
] as const

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Overview of your PrepApp database</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map(({ key, label, icon: Icon, color }) => (
            <div
              key={key}
              className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <div>
                <div className="text-3xl font-bold">{stats?.[key] ?? 0}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Add Question", href: "/admin/questions" },
            { label: "Create Test", href: "/admin/tests" },
            { label: "Add Subject/Topic", href: "/admin/subjects" },
            { label: "Bulk Import JSON", href: "/admin/import" },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              className="flex items-center justify-center rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm font-medium hover:bg-muted transition-colors text-center"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
