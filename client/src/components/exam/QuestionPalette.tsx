"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { QuestionPaletteHeader } from "./QuestionPaletteHeader"
import { useState } from "react"

interface QuestionPaletteProps {
    totalQuestions: number
    currentQuestionIndex: number
    answers: Record<string, string> // map of questionId -> optionId
    markedQuestions: Set<string> // set of questionIds marked for review
    visitedQuestions: Set<string> // set of questionIds that have been seen
    questions: { id: string }[]
    onSelect: (index: number) => void
}

export function QuestionPalette({
    totalQuestions,
    currentQuestionIndex,
    answers,
    markedQuestions,
    visitedQuestions,
    questions,
    onSelect,
}: QuestionPaletteProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

    const stats = {
        answered: Object.keys(answers || {}).length,
        notAnswered: Array.from(visitedQuestions || new Set()).filter(id => !answers?.[id]).length,
        marked: markedQuestions?.size || 0,
        total: totalQuestions,
    }

    return (
        <div className="space-y-4">
            <QuestionPaletteHeader
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                stats={stats}
            />

            <div className={cn(
                viewMode === "grid" ? "grid grid-cols-5 gap-3" : "flex flex-col gap-2"
            )}>
                {questions.map((q, index) => {
                    const isAnswered = !!answers[q.id]
                    const isMarked = markedQuestions.has(q.id)
                    const isCurrent = index === currentQuestionIndex
                    const isVisited = visitedQuestions.has(q.id)

                    let colorClass = "bg-background border-border text-foreground hover:bg-muted"

                    if (isCurrent) {
                        colorClass = "bg-yellow-400 text-black hover:bg-yellow-500 border-yellow-500 ring-2 ring-yellow-400/50 ring-offset-2"
                    } else if (isMarked) {
                        colorClass = "bg-orange-500 text-white hover:bg-orange-600 border-orange-600 shadow-sm shadow-orange-500/20"
                    } else if (isAnswered) {
                        colorClass = "bg-green-500 text-white hover:bg-green-600 border-green-600 shadow-sm shadow-green-500/20"
                    } else if (isVisited) {
                        colorClass = "bg-red-500 text-white hover:bg-red-600 border-red-600 shadow-sm shadow-red-500/20"
                    }

                    return (
                        <Button
                            key={q.id}
                            variant="outline"
                            size="sm"
                            className={cn(
                                "font-mono font-bold transition-all duration-300 active:scale-90 hover:scale-110",
                                viewMode === "grid" ? "h-10 w-10 p-0 rounded-full text-xs" : "h-10 justify-start px-4 rounded-lg text-sm",
                                colorClass
                            )}
                            onClick={() => onSelect(index)}
                        >
                            {viewMode === "grid" ? (index + 1).toString().padStart(2, '0') : `Question ${index + 1}`}
                        </Button>
                    )
                })}
            </div>
        </div>
    )
}
