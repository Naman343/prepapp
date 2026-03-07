"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BookOpen, BarChart3, TrendingUp, ShieldCheck, Zap } from "lucide-react"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 bg-muted rounded-full" />
        <div className="h-4 w-24 bg-muted rounded" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Navbar />

      <main className="flex-1 flex flex-col h-full">
        {!user ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1400px] pointer-events-none opacity-50">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 blur-[120px] rounded-full" />
              <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-yellow-400/10 blur-[120px] rounded-full" />
            </div>

            <div className="z-10 text-center space-y-8 max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Zap className="w-4 h-4 text-foreground fill-foreground" />
                <span className="text-xs font-black uppercase text-foreground tracking-widest">New: GS Paper V Added</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.9] lg:px-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                Mock Prep <br />
                <span className="text-foreground">Simplified.</span>
              </h1>

              <p className="text-xl text-muted-foreground font-medium max-w-[640px] mx-auto animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
                Practice high-fidelity UPSC Prelims mocks with advanced analytics and negative marking simulation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-16 duration-700 delay-300">
                <Link href="/auth/signup">
                  <Button size="lg" className="h-16 px-12 bg-foreground text-background hover:bg-foreground/90 rounded-2xl font-black text-lg shadow-xl shadow-foreground/10 active:scale-95 transition-all">
                    Start Practicing Free <ArrowRight className="ml-3 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="h-16 px-12 border-2 rounded-2xl font-black text-lg hover:bg-background/80 transition-all">
                    Member Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-6 py-12 max-w-7xl animate-in fade-in duration-500">
            <header className="mb-12">
              <h2 className="text-[10px] uppercase font-bold text-blue-600 tracking-[0.3em] mb-2">DASHBOARD</h2>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                Welcome back, {user.name?.split(' ')[0]}
                <span className="text-blue-500">👋</span>
              </h1>
            </header>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card className="group relative overflow-hidden bg-background border-2 border-border/50 hover:border-foreground transition-all duration-300 rounded-[2rem] p-4 shadow-sm hover:shadow-xl hover:shadow-foreground/5">
                <div className="absolute top-0 right-0 p-8 text-foreground/5 group-hover:text-foreground/10 transition-colors">
                  <BookOpen className="w-24 h-24 rotate-12" />
                </div>
                <CardHeader className="relative space-y-4">
                  <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center border-2 border-border group-hover:bg-foreground group-hover:border-foreground transition-all duration-300">
                    <Zap className="w-6 h-6 text-foreground group-hover:text-background transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black mb-1">Take a Test</CardTitle>
                    <CardDescription className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Full length mocks</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative py-4">
                  <p className="text-muted-foreground font-medium">Standard 100 question Prelims GS Papers with marking scheme simulation.</p>
                </CardContent>
                <CardFooter className="relative">
                  <Link href="/tests" className="w-full">
                    <Button className="w-full h-14 rounded-2xl bg-foreground hover:bg-foreground/90 text-background font-black text-sm tracking-widest uppercase transition-all duration-300">
                      View Tests <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card className="group relative overflow-hidden bg-background border-2 border-border/50 hover:border-foreground transition-all duration-300 rounded-[2rem] p-4 shadow-sm hover:shadow-xl hover:shadow-foreground/5">
                <div className="absolute top-0 right-0 p-8 text-foreground/5 group-hover:text-foreground/10 transition-colors">
                  <BarChart3 className="w-24 h-24 -rotate-12" />
                </div>
                <CardHeader className="relative space-y-4">
                  <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center border-2 border-border group-hover:bg-foreground group-hover:border-foreground transition-all duration-300">
                    <TrendingUp className="w-6 h-6 text-foreground group-hover:text-background transition-colors" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black mb-1">Performance</CardTitle>
                    <CardDescription className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Analyze Progress</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative py-4">
                  <p className="text-muted-foreground font-medium">Track accuracy, weak topics, and compare with previous attempts.</p>
                </CardContent>
                <CardFooter className="relative">
                  <Link href="/analytics" className="w-full">
                    <Button variant="outline" className="w-full h-14 rounded-2xl border-2 font-black text-sm tracking-widest uppercase hover:bg-muted/50 transition-all duration-300">
                      Analytics Explorer <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              {/* Status Card */}
              <div className="bg-foreground rounded-[2rem] p-10 flex flex-col justify-between text-background shadow-xl shadow-foreground/10 md:col-span-2 lg:col-span-1 border-4 border-foreground/50">
                <div>
                  <ShieldCheck className="w-12 h-12 mb-6" />
                  <h3 className="text-3xl font-black leading-tight mb-4">You're on track <br /> for Success.</h3>
                  <p className="text-background/80 font-medium">Keep practicing consistently. Last test score: 124.5 / 200</p>
                </div>
                <div className="pt-8">
                  <Link href="/tests">
                    <span className="inline-flex items-center text-sm font-black uppercase tracking-widest border-b-2 border-background pb-1 group cursor-pointer">
                      Resume Last Mock <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="py-12 px-6 border-t mt-auto">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start border-l-4 border-foreground pl-4">
            <span className="text-xl font-black text-foreground tracking-tighter">PrepApp</span>
          </div>
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">© 2026</p>
        </div>
      </footer>
    </div>
  )
}
