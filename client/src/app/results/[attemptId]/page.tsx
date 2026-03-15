"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import api from "@/lib/axios"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, ArrowLeft, Trophy, Target, Clock, AlertCircle, ChevronRight, Zap } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { cn } from "@/lib/utils"

interface TestResult {
    test: {
        title: string;
        totalQuestions: number;
    }
    score: number;
    startTime: string;
    submitTime: string;
    responses: Array<{
        id: string;
        isCorrect: boolean;
        selectedOptionId: string;
        question: {
            text: string;
            difficulty: string;
            explanation: string;
            options: Array<{
                id: string;
                text: string;
                isCorrect: boolean;
            }>
        }
    }>
}

export default function ResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
    const { attemptId } = use(params)
    const [result, setResult] = useState<TestResult | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const res = await api.get(`/exam/result/${attemptId}`)
                setResult(res.data)
            } catch (error) {
                console.error("Failed to fetch result", error)
            } finally {
                setLoading(false)
            }
        }
        fetchResult()
    }, [attemptId])

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

    if (!result) return (
        <div className="min-h-screen bg-muted/20">
            <Navbar />
            <div className="container mx-auto p-12 text-center text-red-500 font-black uppercase tracking-widest">
                Result not found or unavailable.
            </div>
        </div>
    )

    const totalQuestions = result.test.totalQuestions
    const correctCount = result.responses.filter((r) => r.isCorrect).length
    const attemptedCount = result.responses.length
    const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col font-sans mb-20 md:mb-0">
            <Navbar />
            <div className="flex-1 container mx-auto px-6 py-12 max-w-7xl animate-in fade-in duration-500">
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 border-foreground pl-6">
                    <div>
                        <h2 className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.3em] mb-2">SCORECARD RECAP</h2>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">{result.test.title}</h1>
                    </div>
                    <Link href="/analytics">
                        <Button variant="outline" className="h-14 px-8 border-2 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-muted transition-all">
                            <ArrowLeft className="w-4 h-4 mr-3" /> Performance Explorer
                        </Button>
                    </Link>
                </header>

                {/* Main Stats Panel */}
                <div className="grid gap-8 md:grid-cols-3 mb-16">
                    <Card className="relative overflow-hidden bg-foreground border-4 border-foreground/50 rounded-[3rem] p-4 text-background shadow-2xl shadow-foreground/10">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <div className="w-12 h-12 bg-background/20 rounded-2xl flex items-center justify-center">
                                <Trophy className="h-6 w-6 text-background" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-background/60">FINAL SCALE</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-7xl font-black tracking-tighter mb-2">{result.score.toFixed(1)}</div>
                            <p className="text-xs font-bold text-background/80 uppercase tracking-widest">Calculated Score / {totalQuestions * 2}</p>
                            <div className="mt-6 flex gap-2">
                                <span className="px-3 py-1 bg-background/10 rounded-full text-[10px] font-black uppercase tracking-tighter">GS Paper I</span>
                                <span className="px-3 py-1 bg-background/10 rounded-full text-[10px] font-black uppercase tracking-tighter">v.42 Analysis</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-background border-2 border-border/50 rounded-[3rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <div className="w-12 h-12 bg-green-50 rounded-2xl border-2 border-green-100 flex items-center justify-center">
                                <Target className="h-6 w-6 text-green-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-black tracking-tighter mb-4 text-foreground">{accuracy}%</div>
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>{correctCount} Valid Hits</span>
                                    <span>{attemptedCount} Total Attempts</span>
                                </div>
                                <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${accuracy}%` }} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-background border-2 border-border/50 rounded-[3rem] p-4 shadow-sm hover:shadow-xl transition-all duration-300">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <div className="w-12 h-12 bg-muted rounded-2xl border-2 border-border flex items-center justify-center">
                                <Clock className="h-6 w-6 text-foreground" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Efficiency</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-5xl font-black tracking-tighter mb-2 text-foreground">
                                {result.submitTime ?
                                    Math.round((new Date(result.submitTime).getTime() - new Date(result.startTime).getTime()) / 60000)
                                    : 0}m
                            </div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Duration Spent</p>
                            <div className="mt-4 p-4 bg-muted/30 rounded-2xl border border-dashed flex items-center gap-3 text-muted-foreground">
                                <Zap className="w-4 h-4 text-foreground" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Fast-Pace Candidate Profile</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Analysis Section */}
                <div className="space-y-12">
                    <header className="flex items-center gap-4">
                        <div className="h-2 w-12 bg-foreground rounded-full" />
                        <h2 className="text-4xl font-black tracking-tight text-foreground">Question Intelligence</h2>
                    </header>

                    <div className="grid gap-8">
                        {result.responses.map((response, index: number) => (
                            <Card key={response.id} className={cn(
                                "group border-2 transition-all duration-300 rounded-[3rem] overflow-hidden bg-background",
                                response.isCorrect
                                    ? "border-green-100 hover:border-green-300 hover:shadow-lg hover:shadow-green-500/5"
                                    : "border-red-100 hover:border-red-300 hover:shadow-lg hover:shadow-red-500/5"
                            )}>
                                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border/50 h-full">
                                    {/* Left: Metadata */}
                                    <div className="p-8 lg:w-96 shrink-0 bg-muted/10">
                                        <div className="flex flex-col h-full justify-between items-start gap-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl",
                                                    response.isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                )}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">QUESTION</span>
                                                    <div className="flex items-center gap-2">
                                                        {response.isCorrect ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                                                        <span className={cn("text-xs font-black uppercase", response.isCorrect ? "text-green-700" : "text-red-700")}>
                                                            {response.isCorrect ? "Validated" : "Incorrect"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4 w-full">
                                                <div className="flex justify-between items-center px-4 py-2 bg-background border rounded-2xl">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Difficulty</span>
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-foreground">{response.question.difficulty}</span>
                                                </div>
                                                <div className="flex justify-between items-center px-4 py-2 bg-background border rounded-2xl">
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">Penalty Applied</span>
                                                    <span className="text-[10px] font-black uppercase tracking-tighter text-foreground">{response.isCorrect ? "0.0" : "- 0.66"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Interaction Area */}
                                    <div className="flex-1 p-8 md:p-12 space-y-10">
                                        <h3 className="text-2xl font-bold leading-[1.3] text-foreground/90 whitespace-pre-wrap">
                                            {response.question.text}
                                        </h3>

                                        <div className="grid gap-3">
                                            {response.question.options.map((opt, optIndex: number) => {
                                                const isSelected = opt.id === response.selectedOptionId;
                                                const isCorrect = opt.isCorrect;
                                                const label = String.fromCharCode(65 + optIndex);

                                                return (
                                                    <div key={opt.id} className={cn(
                                                        "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all relative overflow-hidden",
                                                        {
                                                            "border-green-500 bg-green-50/50": isCorrect,
                                                            "border-red-500 bg-red-50 text-red-900 shadow-sm": isSelected && !isCorrect,
                                                            "border-border/50 opacity-60": !isCorrect && !isSelected
                                                        }
                                                    )}>
                                                        <div className={cn(
                                                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black",
                                                            {
                                                                "border-green-600 bg-green-600 text-white": isCorrect,
                                                                "border-red-600 bg-red-600 text-white": isSelected && !isCorrect,
                                                                "border-border text-muted-foreground": !isCorrect && !isSelected
                                                            }
                                                        )}>
                                                            {label}
                                                        </div>
                                                        <span className="text-base font-bold flex-1">{opt.text}</span>

                                                        {isCorrect && (
                                                            <div className="flex items-center gap-2 ml-4">
                                                                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-green-700">Correct Answer</span>
                                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                            </div>
                                                        )}
                                                        {isSelected && !isCorrect && (
                                                            <div className="flex items-center gap-2 ml-4">
                                                                <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-red-700">Your Selection</span>
                                                                <XCircle className="w-5 h-5 text-red-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {response.question.explanation && (
                                            <div className="p-8 bg-muted/40 rounded-[2.5rem] border-2 border-dashed border-border/50 relative overflow-hidden group/exp hover:bg-muted/60 transition-colors">
                                                <div className="absolute top-0 left-0 w-2 h-full bg-foreground/20 group-hover/exp:bg-foreground/40 transition-all" />
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground mb-4 flex items-center gap-2">
                                                    <AlertCircle className="w-4 h-4" /> Comprehensive Explanation
                                                </h4>
                                                <div className="text-lg font-medium leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                                    {response.question.explanation}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Final CTA Footer */}
                <footer className="mt-20 py-20 border-t flex flex-col items-center text-center gap-8">
                    <div className="space-y-2">
                        <h3 className="text-4xl font-black tracking-tight italic text-foreground">Practice leads to mastery.</h3>
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Ready for the next paper?</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/tests">
                            <Button size="lg" className="h-16 px-12 bg-foreground text-background hover:bg-foreground/90 rounded-[2rem] font-black text-lg shadow-xl shadow-foreground/10 active:scale-95 transition-all">
                                Try Another Mock <ChevronRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </div>
                </footer>
            </div>
            <footer className="py-12 px-6 border-t mt-auto text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">© 2026 PrepApp — All Rights Reserved</p>
            </footer>
        </div>
    )
}
