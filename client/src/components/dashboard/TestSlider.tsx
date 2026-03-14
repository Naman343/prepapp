"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"
import { Clock, FileQuestion, ArrowRight, ChevronLeft, ChevronRight, Zap, Trophy, History } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface Test {
    id: string
    title: string
    duration: number
    totalQuestions: number
    isPublished: boolean
    year: number | null
    date: string | null
    createdAt?: string
    status?: string
    lastAttemptId?: string
    score?: number
}

export function TestSlider() {
    const router = useRouter()
    const [tests, setTests] = useState<Test[]>([])
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState<string | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchTests()
    }, [])

    const fetchTests = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = token 
                ? await api.get("/tests/status")
                : await api.get("/tests")
            setTests(res.data)
        } catch (error) {
            console.error("Failed to fetch tests for slider", error)
        } finally {
            setLoading(false)
        }
    }

    const handleStartTest = async (testId: string) => {
        setStarting(testId)
        try {
            const res = await api.post("/exam/start", { testId })
            const attemptId = res.data.id
            router.push(`/exam/${attemptId}`)
        } catch (error: any) {
            console.error("Failed to start test", error)
            alert(error.response?.data?.message || "Failed to start test")
        } finally {
            setStarting(null)
        }
    }

    const scroll = (direction: "left" | "right") => {
        if (!scrollContainerRef.current) return
        const scrollAmount = 400
        scrollContainerRef.current.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth"
        })
    }

    if (loading) {
        return (
            <div className="w-full mb-12">
                <div className="flex gap-6 overflow-hidden">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="min-w-[350px] h-48 bg-muted animate-pulse rounded-4xl" />
                    ))}
                </div>
            </div>
        )
    }

    if (tests.length === 0) return null

    return (
        <div className="relative group/slider mb-12">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-foreground flex items-center justify-center text-background">
                        <Trophy className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black tracking-tight">Available Challenges</h2>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Selected mocks for you</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => scroll("left")}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => scroll("right")}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-foreground hover:text-background transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div 
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-4 scroll-smooth no-scrollbar snap-x snap-mandatory"
            >
                {tests.map((test) => (
                    <div key={test.id} className="min-w-[210px] md:min-w-[240px] snap-start">
                        <Card className="group/card relative overflow-hidden bg-white border border-border/60 hover:border-black transition-all duration-500 rounded-[2rem] h-full shadow-[0_4px_15px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] active:scale-[0.98] flex flex-col">
                            
                            <CardContent className="p-5 pb-4 flex-1 relative z-10 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center mb-5">
                                        <div className={cn(
                                            "px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.12em] border transition-all duration-300 shadow-sm",
                                            test.status === "COMPLETED"
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                : test.year 
                                                    ? "bg-red-50 text-red-600 border-red-100 group-hover/card:bg-red-600 group-hover/card:text-white group-hover/card:border-red-600" 
                                                    : "bg-zinc-100 border-zinc-200 text-zinc-600 group-hover/card:bg-black group-hover/card:text-white group-hover/card:border-black"
                                        )}>
                                            {test.status === "COMPLETED" ? "Done" : (test.year ? `UPSC ${test.year}` : "New Mock")}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-lg border border-red-100 text-red-600 group-hover/card:bg-red-600 group-hover/card:text-white group-hover/card:border-red-600 transition-all duration-300">
                                            <Clock className="w-3 h-3" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">{test.duration}M</span>
                                        </div>
                                    </div>

                                    <h3 className="text-base font-black leading-[1.3] mb-4 text-zinc-900 group-hover/card:translate-y-[-1px] transition-transform duration-300 min-h-[2.5rem] line-clamp-2">
                                        {test.title}
                                    </h3>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <div className="flex flex-col gap-0.5 p-2.5 rounded-xl bg-zinc-50/50 border border-zinc-100 group-hover/card:bg-white transition-colors">
                                            <FileQuestion className="w-3.5 h-3.5 text-zinc-400 mb-0.5" />
                                            <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest">Questions</span>
                                            <span className="text-xs font-black text-zinc-900">{test.totalQuestions}</span>
                                        </div>
                                        <div className="flex flex-col gap-0.5 p-2.5 rounded-xl bg-zinc-50/50 border border-zinc-100 group-hover/card:bg-white transition-colors">
                                            <Trophy className="w-3.5 h-3.5 text-zinc-400 mb-0.5" />
                                            <span className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest">Marks</span>
                                            <span className="text-xs font-black text-zinc-900">{test.totalQuestions * 2}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        if (test.status === "COMPLETED") {
                                            router.push(`/results/${test.lastAttemptId}`)
                                        } else {
                                            handleStartTest(test.id)
                                        }
                                    }}
                                    disabled={!!starting}
                                    className={cn(
                                        "relative overflow-hidden w-full h-11 text-white rounded-xl flex items-center justify-center gap-2 font-black text-[9px] uppercase tracking-widest transition-all duration-300 hover:shadow-lg active:scale-[0.97]",
                                        test.status === "COMPLETED"
                                            ? "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/20"
                                            : "bg-zinc-900 hover:bg-zinc-800 hover:shadow-black/10"
                                    )}
                                >
                                    {starting === test.id ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span>{test.status === "COMPLETED" ? "Analyze Result" : "Take Test"}</span>
                                            <ArrowRight className="w-3.5 h-3.5 group-hover/card:translate-x-1 transition-transform duration-300" />
                                        </>
                                    )}
                                </button>
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
            
            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    )
}
