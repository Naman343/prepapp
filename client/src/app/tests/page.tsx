"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import api from "@/lib/axios"
import { Clock, FileQuestion, ArrowRight, Lock, Calendar } from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { cn } from "@/lib/utils"

interface Test {
    id: string
    title: string
    duration: number
    totalQuestions: number
    isPublished: boolean
    year: number | null
    date: string | null
}

type ActiveTab = "pyq" | "mock"

export default function TestsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [tests, setTests] = useState<Test[]>([])
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<ActiveTab>((searchParams.get("tab") as ActiveTab) ?? "pyq")
    const [selectedYear, setSelectedYear] = useState<number | null>(null)

    useEffect(() => {
        const tab = searchParams.get("tab") as ActiveTab
        if (tab === "mock" || tab === "pyq") setActiveTab(tab)
    }, [searchParams])

    useEffect(() => {
        fetchTests()
    }, [])

    const fetchTests = async () => {
        try {
            const res = await api.get("/tests")
            const data: Test[] = res.data
            setTests(data)
            // Default: select the most recent PYQ year
            const pyqYears = [...new Set(data.filter(t => t.year !== null).map(t => t.year as number))].sort((a, b) => b - a)
            if (pyqYears.length > 0) setSelectedYear(pyqYears[0])
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
        } catch (error: unknown) {
            console.error("Failed to start test", error)
            const err = error as { response?: { data?: { message?: string } } }
            alert(err.response?.data?.message || "Failed to start test")
        } finally {
            setStarting(null)
        }
    }

    const pyqTests = tests.filter(t => t.year !== null)
    const mockTests = tests.filter(t => t.year === null)
    const pyqYears = [...new Set(pyqTests.map(t => t.year as number))].sort((a, b) => b - a)
    const visiblePyqTests = selectedYear !== null ? pyqTests.filter(t => t.year === selectedYear) : pyqTests

    const TestRow = ({ test }: { test: Test }) => (
        <div className="flex items-center justify-between gap-4 py-5 px-6 bg-background border border-border/60 rounded-2xl hover:border-foreground/30 hover:shadow-md transition-all duration-200">
            <div className="flex-1 min-w-0">
                <p className="text-base font-black text-foreground leading-snug mb-2">{test.title}</p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <FileQuestion className="w-3.5 h-3.5" />
                        {test.totalQuestions} Questions
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black border border-current rounded px-0.5">M</span>
                        {test.totalQuestions * 2} Marks
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {test.duration} Mins
                    </span>
                    {test.date && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(test.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                    )}
                </div>
            </div>
            <button
                onClick={() => handleStartTest(test.id)}
                disabled={!!starting}
                className={cn(
                    "flex flex-col items-center gap-1 shrink-0 group",
                    starting && starting !== test.id ? "opacity-40 pointer-events-none" : ""
                )}
            >
                <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow",
                    starting === test.id ? "bg-muted" : "bg-foreground group-hover:scale-110"
                )}>
                    <ArrowRight className={cn("w-5 h-5", starting === test.id ? "text-muted-foreground animate-pulse" : "text-background")} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {starting === test.id ? "..." : "Start"}
                </span>
            </button>
        </div>
    )

    const EmptyState = ({ label }: { label: string }) => (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-base font-bold text-foreground">{label}</p>
            <p className="text-sm text-muted-foreground max-w-xs">Check back soon, we're adding content regularly.</p>
        </div>
    )
    if (loading) return (
        <div className="min-h-screen bg-muted/20">
            <Navbar />
            <div className="container mx-auto p-12 flex justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-3xl" />
                    <div className="h-5 w-40 bg-muted rounded-full" />
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-muted/20 flex flex-col font-sans">
            <Navbar />

            <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">

                {/* Page header */}
                <div className="mb-8 border-l-4 border-foreground pl-5">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-[0.3em] mb-1">Practice Repository</p>
                    <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                        {activeTab === "pyq" ? "Previous Year Questions" : "Mock Tests"}
                    </h1>
                </div>

                {/* PYQ tab */}
                {activeTab === "pyq" && (
                    <div>
                        {pyqYears.length === 0 ? (
                            <EmptyState label="No PYQs available yet" />
                        ) : (
                            <>
                                {/* Year tabs */}
                                <div className="flex gap-0 overflow-x-auto border-b border-border mb-6 scrollbar-none">
                                    {pyqYears.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => setSelectedYear(year)}
                                            className={cn(
                                                "px-5 py-3 text-xs font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all duration-200 -mb-px",
                                                selectedYear === year
                                                    ? "border-blue-600 text-blue-600"
                                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            UPSC Prelims {year}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3">
                                    {visiblePyqTests.length === 0 ? (
                                        <EmptyState label={`No papers for ${selectedYear}`} />
                                    ) : (
                                        visiblePyqTests.map(test => <TestRow key={test.id} test={test} />)
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Mock tab */}
                {activeTab === "mock" && (
                    <div className="pt-6">
                        {mockTests.length === 0 ? (
                            <EmptyState label="No mock tests available yet" />
                        ) : (
                            <div className="flex flex-col gap-3">
                                {mockTests.map(test => <TestRow key={test.id} test={test} />)}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <footer className="py-10 px-6 border-t mt-auto text-center">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">© 2026 PrepApp — All Rights Reserved</p>
            </footer>
        </div>
    )
}
