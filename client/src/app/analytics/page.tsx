"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, Target, BookOpen, ChevronRight, Award, Zap } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { cn } from "@/lib/utils"

function SimpleProgress({ value, className }: { value: number, className?: string }) {
    return (
        <div className={cn("h-3 w-full bg-muted rounded-full overflow-hidden border border-border/50", className)}>
            <div className="h-full bg-foreground transition-all duration-1000 ease-out" style={{ width: `${value}%` }} />
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const colors = {
        STRONG: "bg-green-50 text-green-700 border-green-200",
        MODERATE: "bg-yellow-50 text-yellow-700 border-yellow-200",
        WEAK: "bg-red-50 text-red-700 border-red-200",
    }
    return (
        <span className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border", colors[status as keyof typeof colors] || "bg-muted text-muted-foreground border-border")}>
            {status}
        </span>
    )
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get("/analytics")
                setStats(res.data)
            } catch (error) {
                console.error("Failed to load analytics", error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return (
        <div className="min-h-screen bg-muted/20">
            <Navbar />
            <div className="container mx-auto p-12 flex justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-3xl" />
                    <div className="h-6 w-64 bg-muted rounded-full" />
                </div>
            </div>
        </div>
    )

    if (!stats) return (
        <div className="min-h-screen bg-muted/20">
            <Navbar />
            <div className="container mx-auto p-12 text-center text-muted-foreground font-bold uppercase tracking-widest">
                Service Unavailable
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 container mx-auto px-6 py-12 max-w-7xl animate-in fade-in duration-500">
                <header className="mb-12 border-l-4 border-foreground pl-6">
                    <h2 className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.3em] mb-2">MY PERFORMANCE</h2>
                    <h1 className="text-5xl font-black tracking-tight flex items-center gap-4 text-foreground">
                        Insights Explorer
                        <TrendingUp className="w-10 h-10 text-foreground" />
                    </h1>
                </header>

                {/* Overview Cards */}
                <div className="grid gap-8 md:grid-cols-3 mb-12">
                    <Card className="bg-background border-2 border-border/50 rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <div className="w-12 h-12 bg-muted rounded-2xl border-2 border-border flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-foreground" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Volume</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-black tracking-tighter mb-1 text-foreground">{stats.totalTests}</div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tests Attempted</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-background border-2 border-border/50 rounded-[2.5rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <div className="w-12 h-12 bg-muted rounded-2xl border-2 border-border flex items-center justify-center">
                                <Target className="h-6 w-6 text-foreground" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Precision</span>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-end gap-2 mb-2">
                                <span className="text-5xl font-black tracking-tighter leading-none text-foreground">{stats.overallAccuracy}%</span>
                            </div>
                            <SimpleProgress value={stats.overallAccuracy} className="mb-2" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Overall Accuracy</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-foreground border-4 border-foreground/50 rounded-[2.5rem] p-4 shadow-xl shadow-foreground/10 text-background">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <div className="w-12 h-12 bg-background/20 rounded-2xl flex items-center justify-center">
                                <Award className="h-6 w-6 text-background" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-background/60">Consistency</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-black tracking-tighter mb-1 text-background">{stats.averageScore.toFixed(1)}</div>
                            <p className="text-xs font-bold text-background/80 uppercase tracking-widest">Average Mock Score</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Topic Performance */}
                <Card className="bg-background border-2 border-border/50 rounded-[3rem] p-8 shadow-sm">
                    <CardHeader className="px-0 pt-0 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 mb-8">
                        <div>
                            <CardTitle className="text-3xl font-black mb-2 flex items-center gap-3 text-foreground">
                                Topic Strength Matrix
                                <Zap className="w-5 h-5 text-foreground fill-foreground" />
                            </CardTitle>
                            <CardDescription className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                                Performance benchmarks based on UPSC standards
                            </CardDescription>
                        </div>
                        <div className="px-5 py-3 bg-muted/50 rounded-2xl border border-border flex items-center gap-3">
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[10px] font-black uppercase tracking-tighter">Strong &gt; 70%</span></div>
                            <div className="h-3 w-px bg-border" />
                            <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /><span className="text-[10px] font-black uppercase tracking-tighter">Weak &lt; 40%</span></div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0">
                        <div className="grid gap-6">
                            {stats.topicPerformance.length === 0 ? (
                                <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center -rotate-12">
                                        <TrendingUp className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-black uppercase tracking-tight text-muted-foreground">No test data captured yet</h3>
                                    <p className="text-xs text-muted-foreground/60 font-bold max-w-xs">Participate in a mock test to unlock deep topic-wise analytical insights and strength classification.</p>
                                </div>
                            ) : (
                                stats.topicPerformance.map((topic: any) => (
                                    <div key={topic.topic} className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-[2rem] hover:bg-muted/30 transition-all border-2 border-transparent hover:border-border/50">
                                        <div className="flex-1 w-full md:mr-12 mb-4 md:mb-0">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex flex-col">
                                                    <span className="text-lg font-black tracking-tight text-foreground transition-colors group-hover:text-foreground">{topic.topic}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Syllabus Component</span>
                                                </div>
                                                <span className="text-2xl font-black text-foreground tracking-tighter">{topic.accuracy}%</span>
                                            </div>
                                            <SimpleProgress value={topic.accuracy} />
                                        </div>
                                        <StatusBadge status={topic.status} />
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <footer className="py-12 px-6 border-t mt-auto text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">© 2026 PrepApp — All Rights Reserved</p>
            </footer>
        </div>
    )
}
