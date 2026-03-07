"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Flag, Star, Clock } from "lucide-react"

interface Option {
    id: string
    text: string
}

interface Question {
    id: string
    text: string
    options: Option[]
}

interface QuestionCardProps {
    question: Question
    questionNumber: number
    selectedOptionId?: string
    onSelectOption: (optionId: string) => void
}

export function QuestionCard({
    question,
    questionNumber,
    selectedOptionId,
    onSelectOption,
}: QuestionCardProps) {
    return (
        <div className="space-y-4">
            {/* Marking Scheme Header */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-foreground/90">Question {questionNumber}</span>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1 text-green-600 px-2 py-0.5 bg-green-50 rounded border border-green-200">
                            <span className="text-xs">+</span> 2.0
                        </span>
                        <span className="flex items-center gap-1 text-red-600 px-2 py-0.5 bg-red-50 rounded border border-red-200">
                            <span className="text-xs">-</span> 0.66
                        </span>
                    </div>
                </div>
                <div className="flex gap-2 text-muted-foreground">
                    <button className="p-1.5 hover:bg-muted rounded-full transition-colors"><Clock className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-muted rounded-full transition-colors"><Flag className="w-4 h-4" /></button>
                    <button className="p-1.5 hover:bg-muted rounded-full transition-colors"><Star className="w-4 h-4" /></button>
                </div>
            </div>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-4">
                    <div className="text-lg font-semibold leading-relaxed text-foreground/90 whitespace-pre-wrap mb-4">
                        {question.text}
                    </div>

                    <div className="grid gap-2">
                        {question.options.map((option, index) => {
                            const isSelected = selectedOptionId === option.id;
                            const label = String.fromCharCode(65 + index);

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => onSelectOption(option.id)}
                                    className={cn(
                                        "flex items-center gap-3 w-full p-3 rounded-xl border-2 text-left transition-all duration-300 group relative overflow-hidden active:scale-[0.98]",
                                        isSelected
                                            ? "border-yellow-600 bg-yellow-50 shadow-md scale-[1.002]"
                                            : "border-border/50 bg-background hover:border-foreground/20 hover:bg-muted"
                                    )}
                                >
                                    <div className={cn(
                                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black transition-all duration-300",
                                        isSelected
                                            ? "border-yellow-600 bg-yellow-600 text-white"
                                            : "border-border text-muted-foreground group-hover:border-foreground/50 group-hover:text-foreground"
                                    )}>
                                        {label}
                                    </div>
                                    <span className={cn(
                                        "text-base font-medium transition-colors leading-tight flex-1",
                                        isSelected ? "text-yellow-900" : "text-foreground/70 group-hover:text-foreground"
                                    )}>
                                        {option.text}
                                    </span>

                                    {isSelected && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-600 animate-pulse" />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
