"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, FileQuestion, PlayCircle, Lock, Trophy, Calendar } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { cn } from "@/lib/utils"

interface Test {
    id: string
    title: string
    duration: number
    totalQuestions: number
    isPublished: boolean
}

export default function TestsPage() {
    const router = useRouter()
    const [tests, setTests] = useState<Test[]>([])
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState<string | null>(null)

    useEffect(() => {
        fetchTests()
    }, [])

    const fetchTests = async () => {
        try {
            const res = await api.get("/tests")
            setTests(res.data)
        } catch (error) {
            console.error("Failed to fetch tests", error)
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

    if (loading) return (
        <div className="min-h-screen bg-muted/20">
            <Navbar />
            <div className="container mx-auto p-12 flex justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-3xl rotate-12 transition-all duration-700" />
                    <div className="h-6 w-48 bg-muted rounded-full" />
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
            <Navbar />
            <div className="flex-1 container mx-auto p-8 max-w-7xl px-6 md:px-12">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 border-foreground pl-6">
                    <div>
                        <h2 className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.3em] mb-2">PRACTICE REPOSITORY</h2>
                        <h1 className="text-5xl font-black tracking-tight text-foreground">Available Mock Tests</h1>
                    </div>
                    <div className="flex items-center gap-4 bg-background px-6 py-3 rounded-2xl border border-border/50 shadow-sm">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1 text-right">Next Live Test</span>
                            <span className="text-sm font-black text-foreground">12th Jan, 10:00 AM</span>
                        </div>
                        <Calendar className="w-6 h-6 text-foreground" />
                    </div>
                </header>

                {tests.length === 0 ? (
                    <div className="text-center p-24 border-4 border-dashed rounded-[3rem] bg-background/50 flex flex-col items-center gap-6">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                            <Lock className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">No Tests available</h3>
                        <p className="text-muted-foreground font-medium max-w-sm">
                            We are currently preparing high-quality papers. Check back soon for the next GS and CSAT full mocks.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                        {tests.map((test) => (
                            <Card key={test.id} className="group flex flex-col bg-background border-2 border-border/50 hover:border-foreground transition-all duration-500 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-foreground/5">
                                <CardHeader className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="h-14 w-14 bg-muted rounded-2xl border-2 border-border flex items-center justify-center group-hover:bg-foreground group-hover:border-foreground transition-all duration-500">
                                            <Trophy className="w-6 h-6 text-foreground group-hover:text-background transition-colors" />
                                        </div>
                                        <div className="px-3 py-1 bg-muted text-foreground text-[10px] font-black tracking-widest uppercase rounded-full border border-border">
                                            Free Tier
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <CardTitle className="text-2xl font-black leading-[1.1] transition-colors group-hover:text-foreground">
                                            {test.title}
                                        </CardTitle>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                <Clock className="w-4 h-4 text-foreground" /> {test.duration} mins
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                <FileQuestion className="w-4 h-4 text-foreground" /> {test.totalQuestions} Que
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="px-8 flex-1">
                                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                                        Official standards UPSC Paper. Covers Current Affairs, Geography, History, and Economy. Includes negative marking simulation.
                                    </p>
                                </CardContent>

                                <CardFooter className="p-8 pt-4">
                                    <Button
                                        className={cn(
                                            "w-full h-14 gap-3 bg-foreground hover:bg-foreground/90 text-background font-black text-sm tracking-widest uppercase transition-all duration-300 rounded-2xl shadow-lg active:scale-95",
                                            { "bg-muted text-muted-foreground cursor-not-allowed opacity-50": starting && starting !== test.id }
                                        )}
                                        onClick={() => handleStartTest(test.id)}
                                        disabled={!!starting}
                                    >
                                        {starting === test.id ? "Initializing..." : <><PlayCircle className="w-5 h-5" /> Start Simulation</>}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <footer className="py-12 px-6 border-t mt-auto text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">© 2026 PrepApp — All Rights Reserved</p>
            </footer>
        </div>
    )
}
