"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { ArrowRight, BookOpen, BarChart3, TrendingUp, ShieldCheck, Zap, CheckCircle2, FileText, Calendar, ChevronRight } from "lucide-react"
import api from "@/lib/axios"
import { TestSlider } from "@/components/dashboard/TestSlider"

interface UserData {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }
    api.get("/auth/me")
      .then(res => {
        setUser(res.data)
        localStorage.setItem("user", JSON.stringify(res.data))
        if (res.data.name) {
          localStorage.setItem("userName", res.data.name)
        } else {
          localStorage.setItem("userName", res.data.email?.split('@')[0] || "User")
        }
      })
      .catch(() => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-black/10 rounded-full" />
        <div className="h-4 w-24 bg-black/10 rounded" />
      </div>
    </div>
  )

  // ── Logged-in dashboard view ─────────────────────────────────────────────────
  if (user) {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <div className="w-full px-6 py-8 animate-in fade-in duration-500">
            <header className="mb-10">
              <p className="text-[10px] uppercase font-bold text-black/40 tracking-[0.3em] mb-2">DASHBOARD</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-black">
                Welcome back, {user.name || user.email?.split('@')[0]} 👋
              </h1>
            </header>

            <TestSlider />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              {/* Take a Test */}
              <div className="group bg-white border border-black/10 rounded-3xl p-8 hover:border-black transition-all duration-300 hover:shadow-xl cursor-pointer">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-black mb-2">Take a Test</h3>
                <p className="text-sm font-bold uppercase tracking-widest text-black/40 mb-4">Full Length Mocks</p>
                <p className="text-black/60 font-medium mb-6">Standard 100 question Prelims GS Papers with UPSC marking scheme simulation.</p>
                <Link href="/tests" className="inline-flex items-center text-sm font-black uppercase tracking-widest border-b-2 border-black pb-1 group-hover:gap-2 transition-all">
                  View Tests <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Analytics */}
              <div className="group bg-white border border-black/10 rounded-3xl p-8 hover:border-black transition-all duration-300 hover:shadow-xl cursor-pointer">
                <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-black mb-2">Performance</h3>
                <p className="text-sm font-bold uppercase tracking-widest text-black/40 mb-4">Analyze Progress</p>
                <p className="text-black/60 font-medium mb-6">Track accuracy, weak topics, and compare with previous attempts.</p>
                <Link href="/analytics" className="inline-flex items-center text-sm font-black uppercase tracking-widest border-b-2 border-black pb-1 group-hover:gap-2 transition-all">
                  Analytics Explorer <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Status Card */}
              <div className="bg-black rounded-3xl p-8 flex flex-col justify-between text-white md:col-span-2 lg:col-span-1">
                <div>
                  <ShieldCheck className="w-12 h-12 mb-6 text-[#f5c842]" />
                  <h3 className="text-3xl font-black leading-tight mb-4">You&apos;re on track <br />for Success.</h3>
                  <p className="text-white/60 font-medium">Keep practicing consistently to identify and fix your weak areas.</p>
                </div>
                <div className="pt-8">
                  <Link href="/tests">
                    <span className="inline-flex items-center text-sm font-black uppercase tracking-widest border-b-2 border-white pb-1 group cursor-pointer hover:border-[#f5c842] hover:text-[#f5c842] transition-colors">
                      Resume Last Mock <ArrowRight className="ml-2 w-4 h-4" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── Public landing page ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* ── Navbar ── */}
      <Navbar />

      <main className="flex-1 flex flex-col">

        {/* ── Hero Section ── */}
        <section className="flex flex-col items-center justify-center text-center px-6 pt-12 pb-16 bg-[#F9F9F9]">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black/20 bg-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="w-3 h-3 text-black fill-black" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-black">New: GS Paper V Added</span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(3rem,10vw,7.5rem)] font-black tracking-tighter text-black leading-[0.88] max-w-4xl mx-auto mb-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Mock Prep<br />Simplified.
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-black/50 font-medium max-w-xl mx-auto mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
            Practice high-fidelity UPSC Prelims mocks with advanced analytics, peer ranking, and negative marking simulation. Built for the elite 1%.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
            <Link href="/auth/signup">
              <button className="inline-flex items-center gap-2 h-14 px-10 bg-black text-white rounded-xl font-black text-base hover:bg-black/85 active:scale-95 transition-all duration-200 shadow-lg shadow-black/20">
                Start Practising Free <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="inline-flex items-center gap-2 h-14 px-10 bg-transparent text-black rounded-xl font-black text-base border-2 border-black/20 hover:border-black hover:bg-white/50 active:scale-95 transition-all duration-200">
                Member Login
              </button>
            </Link>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="bg-black text-white py-10 px-6">
          <div className="w-full px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-2">The Aspirant Community</p>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">Join the 10,000+ Students on the Waitlist</h2>
            </div>
            <div className="flex items-center gap-12 shrink-0">
              <div className="text-center">
                <p className="text-3xl font-black text-white">5,000+</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">Early Access Signups</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-[#f5c842]">Launching</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-1">August 2026</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Section ── */}
        <section className="px-6 py-24 bg-white">
          <div className="w-full">
            {/* Section label */}
            <p className="text-center text-[10px] font-black tracking-[0.3em] text-black/40 mb-4">Why PrepApp AI?</p>
            <h2 className="text-center text-[clamp(2rem,5vw,3.5rem)] font-black tracking-tighter text-black mb-16">High-Performance Training.</h2>

            {/* Bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Card 1 — Advanced AI Analytics */}
              <div className="bg-white border border-black/10 rounded-3xl p-8 flex flex-col gap-6">
                <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-black mb-3">Advanced AI Analytics</h3>
                  <p className="text-black/50 font-medium text-sm leading-relaxed">Our proprietary algorithm analyzes your performance down to the second. Identify subject-wise weaknesses, speed bottlenecks, and guessing patterns.</p>
                </div>
                <ul className="space-y-2 mt-auto">
                  {["Trend Identification", "Rank Prediction", "Time Management", "Syllabus Heatmaps"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm font-bold text-black/70">
                      <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card 2 — PYQ Mastery (hero card — dark) */}
              <div className="bg-black text-white rounded-3xl p-8 flex flex-col gap-6 relative overflow-hidden">
                <div className="w-11 h-11 bg-[#f5c842] rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-3">PYQ Mastery</h3>
                  <p className="text-white/60 font-medium text-sm leading-relaxed">Full coverage of 10 years UPSC Preliminary papers with detailed solutions and trend analysis to help you focus on high-yield topics.</p>
                </div>
                <div className="mt-auto">
                  <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] text-[#f5c842] border border-[#f5c842]/40 rounded-full px-4 py-1.5">10 Years Coverage</span>
                </div>
              </div>

              {/* Card 3 — Simulated UI */}
              <div className="bg-white border border-black/10 rounded-3xl p-8 flex flex-col gap-6">
                <div className="w-11 h-11 bg-black rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-black mb-3">Simulated UI</h3>
                  <p className="text-black/50 font-medium text-sm leading-relaxed">The exact exam environment to keep your nerves steady on the final day. Familiarity with the interface ensures no time is wasted in the exam hall.</p>
                </div>
                <div className="mt-auto">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/30">High Fidelity</span>
                </div>
              </div>

              {/* Card 4 — Study Material */}
              <div className="bg-white border border-black/10 rounded-3xl p-8 flex flex-col gap-4">
                <div className="w-11 h-11 bg-black/5 border border-black/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-black mb-2">Study Material</h3>
                  <p className="text-black/50 font-medium text-sm leading-relaxed">Curated notes and high-yield topics from India&apos;s top educators, condensed for quick revision and maximum retention.</p>
                </div>
              </div>

              {/* Card 5 — Daily Quiz */}
              <div className="bg-white border border-black/10 rounded-3xl p-8 flex flex-col gap-4">
                <div className="w-11 h-11 bg-black/5 border border-black/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-black mb-2">Daily Quiz</h3>
                  <p className="text-black/50 font-medium text-sm leading-relaxed">Stay sharp with 10 high-quality questions every single morning covering current affairs and static portions.</p>
                </div>
              </div>

              {/* Card 6 — CTA card (dashed border) */}
              <div className="border-2 border-dashed border-black/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4 hover:border-black/40 transition-colors">
                <h3 className="text-xl font-black text-black">Ready to start?</h3>
                <p className="text-black/50 font-medium text-sm">Begin your journey today</p>
                <Link href="/curriculum">
                  <button className="inline-flex items-center gap-2 h-11 px-8 bg-black text-white rounded-xl font-black text-sm hover:bg-black/85 active:scale-95 transition-all duration-200">
                    Explore Curriculum
                  </button>
                </Link>
              </div>

            </div>
          </div>
        </section>

        {/* ── Email CTA Section ── */}
        <section className="px-6 py-24 bg-[#F9F9F9]">
          <div className="w-full max-w-2xl mx-auto text-center">
            <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-black tracking-tight text-black mb-10">
              Join the thousands who trust PrepApp AI for their success.
            </h2>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 h-14 px-5 rounded-xl border-2 border-black/15 bg-white text-black font-medium text-sm outline-none focus:border-black transition-colors placeholder:text-black/30"
              />
              <Link href="/auth/signup">
                <button className="h-14 px-8 bg-black text-white rounded-xl font-black text-sm hover:bg-black/85 active:scale-95 transition-all duration-200 whitespace-nowrap w-full sm:w-auto">
                  Get Early Access
                </button>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </div>
  )
}
