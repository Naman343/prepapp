"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  FileText,
  Upload,
  Link2,
  LogOut,
  ChevronRight,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/subjects", label: "Subjects & Topics", icon: BookOpen },
  { href: "/admin/questions", label: "Questions", icon: HelpCircle },
  { href: "/admin/tests", label: "Tests", icon: FileText },
  { href: "/admin/import", label: "Bulk Import", icon: Upload },
  { href: "/admin/pdf-extractor", label: "PDF Extractor UI", icon: Link2 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  const [adminName, setAdminName] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")
    if (!token || !userData) {
      router.replace("/auth/login")
      return
    }
    const user = JSON.parse(userData)
    if (user.role !== "ADMIN") {
      router.replace("/")
      return
    }
    setAdminName(user.name || user.email)
    setReady(true)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/auth/login")
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm">Checking access...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border flex flex-col">
        <div className="h-14 border-b border-border flex items-center px-4">
          <span className="font-bold text-sm tracking-wide">PrepApp Admin</span>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
                {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <div className="text-xs text-muted-foreground px-2 mb-2 truncate">{adminName}</div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border flex items-center px-6">
          <h1 className="text-sm font-semibold text-muted-foreground">
            {navItems.find((n) => n.href === pathname)?.label ?? "Admin"}
          </h1>
        </header>
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </main>
    </div>
  )
}
