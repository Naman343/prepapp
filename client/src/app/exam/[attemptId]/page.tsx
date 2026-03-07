"use client"

import { useEffect, useState, useCallback, use } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Timer } from "@/components/exam/Timer"
import { QuestionCard } from "@/components/exam/QuestionCard"
import { QuestionPalette } from "@/components/exam/QuestionPalette"
import { Loader2, ChevronLeft, ChevronRight, CheckCircle, User, Info, HelpCircle, LayoutGrid } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { cn } from "@/lib/utils"

interface Option {
    id: string
    text: string
}

interface Question {
    id: string
    text: string
    options: Option[]
    difficulty: "EASY" | "MEDIUM" | "HARD"
}

export default function ExamPage({ params }: { params: Promise<{ attemptId: string }> }) {
    const { attemptId } = use(params)
    const router = useRouter()

    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set())
    const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set())
    const [submitting, setSubmitting] = useState(false)
    const [testDuration] = useState(120)
    const [userName, setUserName] = useState('User')
    const [isMounted, setIsMounted] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showPalette, setShowPalette] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        if (typeof window !== 'undefined') {
            const storedName = localStorage.getItem('userName')
            if (storedName) setUserName(storedName)
        }
    }, [])

    // Fetch Questions
    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get(`/exam/${attemptId}/questions`)
                setQuestions(res.data)
                // Mark first question as visited
                if (res.data.length > 0) {
                    setVisitedQuestions(new Set([res.data[0].id]))
                }
            } catch (error) {
                console.error("Failed to load exam", error)
                alert("Failed to load exam. Please try again.")
                router.push("/tests")
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [attemptId, router])

    // Update visited questions when index changes
    useEffect(() => {
        if (questions.length > 0) {
            const currentQ = questions[currentIndex]
            setVisitedQuestions(prev => new Set(prev).add(currentQ.id))
        }
    }, [currentIndex, questions])

    const handleSelectOption = async (optionId: string, markForReview = false) => {
        const currentQuestion = questions[currentIndex]

        // Optimistic update
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }))

        if (markForReview) {
            setMarkedQuestions(prev => new Set(prev).add(currentQuestion.id))
        } else {
            setMarkedQuestions(prev => {
                const newSet = new Set(prev)
                newSet.delete(currentQuestion.id)
                return newSet
            })
        }

        // Sync with backend
        try {
            await api.post("/exam/submit-answer", {
                attemptId,
                questionId: currentQuestion.id,
                selectedOptionId: optionId,
                markedForReview: markForReview,
            })
        } catch (error) {
            console.error("Failed to save answer", error)
        }
    }

    const handleClearResponse = async () => {
        const currentQuestion = questions[currentIndex]

        setAnswers((prev) => {
            const newAnswers = { ...prev }
            delete newAnswers[currentQuestion.id]
            return newAnswers
        })
        setMarkedQuestions(prev => {
            const newSet = new Set(prev)
            newSet.delete(currentQuestion.id)
            return newSet
        })

        try {
            await api.post("/exam/clear-answer", {
                attemptId,
                questionId: currentQuestion.id,
            })
        } catch (error) {
            console.error("Failed to clear answer", error)
        }
    }

    const handleMarkForReview = async () => {
        const currentQuestion = questions[currentIndex]
        const selectedOptionId = answers[currentQuestion.id]

        if (!selectedOptionId) {
            alert("Please select an answer before marking for review")
            return
        }

        await handleSelectOption(selectedOptionId, true)
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1)
        }
    }

    const handleFinishTest = useCallback(async () => {
        if (submitting) return
        setSubmitting(true)
        try {
            await api.post("/exam/finish", { attemptId })
            router.push(`/results/${attemptId}`)
        } catch (error) {
            console.error("Failed to submit test", error)
            alert("Failed to submit test.")
            setSubmitting(false)
        }
    }, [attemptId, router, submitting])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    <span className="text-muted-foreground font-medium">Preparing your exam...</span>
                </div>
            </div>
        )
    }

    const currentQuestion = questions[currentIndex]

    return (
        <div className="flex flex-col h-screen bg-muted/20 text-foreground antialiased">
            {/* Professional Header */}
            <header className="bg-background border-b h-16 px-6 flex items-center justify-between shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex flex-col">
                        <span className="text-2xl font-black text-foreground tracking-tighter">PrepApp</span>
                    </div>
                    <div className="h-10 w-px bg-border/50 hidden md:block" />
                    <div className="hidden lg:flex flex-col">
                        <span className="text-sm font-bold text-foreground/80">UPSC Civil Services Prelims 2026</span>
                        <span className="text-[10px] text-muted-foreground font-medium">Mock Test #05 — General Studies Paper I</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 md:gap-8">
                    <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg border border-border/50">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Viewing in:</span>
                        <select className="bg-transparent text-sm font-bold outline-none cursor-pointer">
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                        </select>
                    </div>

                    <Timer durationMinutes={testDuration} onTimeUp={handleFinishTest} />

                    <button
                        className="lg:hidden p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                        onClick={() => setShowPalette(!showPalette)}
                        aria-label="Toggle question palette"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>

                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content Layout */}
            <div className="flex-1 flex overflow-hidden container-fluid max-w-400 mx-auto w-full">
                {/* Left Area: Question Area */}
                <div className="flex-1 flex flex-col relative min-w-0">
                    <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24">
                        <div className="max-w-4xl mx-auto">
                            <QuestionCard
                                question={currentQuestion}
                                questionNumber={currentIndex + 1}
                                selectedOptionId={answers[currentQuestion.id]}
                                onSelectOption={handleSelectOption}
                            />
                        </div>
                    </div>

                    {/* Fixed Action Footer */}
                    <footer className="absolute bottom-0 left-0 right-0 h-16 bg-background border-t shadow-2xl z-40 flex items-center px-3 md:px-6 border-r border-border/50">
                        <div className="max-w-4xl w-full mx-auto flex items-center justify-between gap-2 md:gap-4">
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={handleClearResponse}
                                    disabled={!answers[currentQuestion.id]}
                                    className="h-9 md:h-10 px-3 md:px-6 font-semibold border-2 hover:bg-muted active:scale-95 transition-all duration-200 text-xs md:text-sm"
                                >
                                    <span className="hidden sm:inline">Clear Response</span>
                                    <span className="sm:hidden">Clear</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={handleMarkForReview}
                                    disabled={!answers[currentQuestion.id] || markedQuestions.has(currentQuestion.id)}
                                    className="h-9 md:h-10 px-3 md:px-6 font-semibold border-2 hover:bg-muted active:scale-95 transition-all duration-200 text-xs md:text-sm"
                                >
                                    <span className="hidden sm:inline">Mark for Review & Next</span>
                                    <span className="sm:hidden">Mark</span>
                                </Button>
                            </div>

                            <div className="flex gap-2 items-center">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                                    disabled={currentIndex === 0}
                                    className="h-9 w-9 md:h-10 md:w-10 rounded-lg border-2 hover:bg-muted active:scale-75 transition-all duration-200"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>

                                <Button
                                    onClick={() => {
                                        if (currentIndex < questions.length - 1) {
                                            setCurrentIndex(currentIndex + 1)
                                        } else {
                                            setCurrentIndex(0)
                                        }
                                    }}
                                    size="lg"
                                    className={cn(
                                        "h-9 md:h-10 px-4 md:px-8 font-semibold rounded-lg text-black active:scale-95 transition-all duration-300 bg-yellow-400 hover:bg-yellow-500 shadow-lg shadow-yellow-500/20 hover:scale-105 text-xs md:text-sm"
                                    )}
                                >
                                    <span className="hidden xs:inline">SAVE & </span>NEXT
                                    <ChevronRight className="w-4 h-4 ml-1 md:ml-2" />
                                </Button>
                            </div>
                        </div>
                    </footer>
                </div>

                {/* Mobile backdrop */}
                {showPalette && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setShowPalette(false)}
                    />
                )}

                {/* Right Sidebar: Palette */}
                <div className={cn(
                    "bg-background border-l border-border/50 flex flex-col z-50 transition-transform duration-300 ease-in-out",
                    "fixed top-16 right-0 bottom-0 w-[320px]",
                    "lg:relative lg:top-auto lg:bottom-auto lg:w-95 lg:translate-x-0",
                    showPalette ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="p-6 border-b border-border/50 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-500 shadow-sm overflow-hidden">
                            <User className="w-8 h-8 text-blue-600 mt-2" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">CANDIDATE</span>
                            <span className="text-sm font-bold text-foreground tracking-tight">
                                {isMounted ? userName : 'User'}
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        <QuestionPalette
                            totalQuestions={questions.length}
                            currentQuestionIndex={currentIndex}
                            answers={answers}
                            markedQuestions={markedQuestions}
                            visitedQuestions={visitedQuestions}
                            questions={questions}
                            onSelect={setCurrentIndex}
                        />
                    </div>

                    {/* Sidebar Actions */}
                    <div className="p-6 bg-muted/30 border-t border-border/50 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" size="sm" className="bg-background font-bold text-[10px] uppercase tracking-wider py-5 border-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-200">
                                <Info className="w-4 h-4 mr-2" /> Instructions
                            </Button>
                            <Button variant="outline" size="sm" className="bg-background font-bold text-[10px] uppercase tracking-wider py-5 border-2 rounded-xl hover:bg-muted active:scale-95 transition-all duration-200">
                                <HelpCircle className="w-4 h-4 mr-2" /> Questions
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-full h-12 font-black uppercase tracking-widest border-2 transition-all duration-300 rounded-xl",
                                showConfirm 
                                    ? "bg-red-500 border-red-600 text-white hover:bg-red-600" 
                                    : "border-border hover:bg-muted hover:border-foreground/30 shadow-sm"
                            )}
                            onClick={() => {
                                if (showConfirm) {
                                    handleFinishTest()
                                } else {
                                    setShowConfirm(true)
                                    // Reset after 3 seconds if not clicked again
                                    setTimeout(() => setShowConfirm(false), 3000)
                                }
                            }}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <Loader2 className="animate-spin" />
                            ) : showConfirm ? (
                                "Confirm Submit?"
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5 mr-3" />
                                    Submit Test
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
