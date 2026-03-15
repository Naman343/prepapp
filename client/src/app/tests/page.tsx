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
    status?: "NOT_STARTED" | "ONGOING" | "COMPLETED"
    lastAttemptId?: string
    score?: number
}

type ActiveTab = "pyq" | "mock"

export default function TestsPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [tests, setTests] = useState<Test[]>([])
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<ActiveTab>((searchParams.get("tab") as ActiveTab) ?? "pyq")
    const [selectedYear, setSelectedYear] = useState<number | null | "all">("all")

    useEffect(() => {
        const tab = searchParams.get("tab") as ActiveTab
        if (tab === "mock" || tab === "pyq") setActiveTab(tab)
    }, [searchParams])

    useEffect(() => {
        fetchTests()
    }, [])

    const fetchTests = async () => {
        try {
            const token = localStorage.getItem("token")
            const res = token 
                ? await api.get("/tests/status")
                : await api.get("/tests")
            
            const data: Test[] = res.data
            setTests(data)
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
    const visiblePyqTests = selectedYear === "all" 
        ? pyqTests 
        : (selectedYear !== null ? pyqTests.filter(t => t.year === selectedYear) : pyqTests)

    const TestRow = ({ test }: { test: Test }) => (
        <div className="flex items-center justify-between gap-4 py-5 px-6 bg-background border border-border/60 rounded-2xl hover:border-foreground/30 hover:shadow-md transition-all duration-200">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                    <p className="text-base font-black text-foreground leading-snug truncate">{test.title}</p>
                    {test.status === "COMPLETED" && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded border border-emerald-100">
                            DONE
                        </span>
                    )}
                    {test.status === "ONGOING" && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded border border-blue-100">
                            ONGOING
                        </span>
                    )}
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-bold text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <FileQuestion className="w-3.5 h-3.5" />
                        {test.totalQuestions} Questions
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black border border-current rounded px-0.5">M</span>
                        {test.totalQuestions * 2} Marks
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-red-600">
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
                onClick={() => {
                    if (test.status === "COMPLETED") {
                        router.push(`/results/${test.lastAttemptId}`)
                    } else {
                        handleStartTest(test.id)
                    }
                }}
                disabled={!!starting}
                className={cn(
                    "flex flex-col items-center gap-1 shrink-0 group cursor-pointer",
                    starting && starting !== test.id ? "opacity-40 pointer-events-none" : ""
                )}
            >
                <div className={cn(
                    "w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md",
                    starting === test.id 
                        ? "bg-muted" 
                        : test.status === "COMPLETED"
                            ? "bg-blue-600 group-hover:bg-blue-700 group-hover:-translate-y-0.5"
                            : "bg-foreground group-hover:bg-zinc-800 group-hover:-translate-y-0.5"
                )}>
                    {test.status === "COMPLETED" ? (
                        <ArrowRight className="w-5 h-5 text-white" />
                    ) : (
                        <ArrowRight className={cn("w-5 h-5", starting === test.id ? "text-muted-foreground animate-pulse" : "text-background")} />
                    )}
                </div>
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                    test.status === "COMPLETED" ? "text-blue-600" : "text-muted-foreground group-hover:text-foreground"
                )}>
                    {starting === test.id ? "..." : test.status === "COMPLETED" ? "Analyze" : "Start"}
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
                                {/* Year filter pills */}
                                <div className="flex flex-wrap gap-3 mb-6">
                                    <button
                                        onClick={() => setSelectedYear("all")}
                                        className={cn(
                                            "px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
                                            selectedYear === "all"
                                                ? "bg-red-600 text-white border-red-600"
                                                : "bg-background text-foreground border-foreground hover:bg-red-600 hover:text-white hover:border-red-600"
                                        )}
                                    >
                                        All Years
                                    </button>
                                    {pyqYears.map(year => (
                                        <button
                                            key={year}
                                            onClick={() => setSelectedYear(year)}
                                            className={cn(
                                                "px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md",
                                                selectedYear === year
                                                    ? "bg-red-600 text-white border-red-600"
                                                    : "bg-background text-foreground border-foreground hover:bg-red-600 hover:text-white hover:border-red-600"
                                            )}
                                        >
                                            {year}
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
        </div>
    )
}
