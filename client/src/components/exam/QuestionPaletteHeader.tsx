"use client"

import { Button } from "@/components/ui/button"
import { Grid3x3, List } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuestionPaletteHeaderProps {
    viewMode: "grid" | "list"
    onViewModeChange: (mode: "grid" | "list") => void
    stats: {
        answered: number
        notAnswered: number
        marked: number
        total: number
    }
}

export function QuestionPaletteHeader({
    viewMode,
    onViewModeChange,
    stats,
}: QuestionPaletteHeaderProps) {
    return (
        <div className="space-y-4 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground/80 tracking-tight">
                    Question Palette
                </h3>
                <div className="flex gap-1 bg-muted/50 p-1 rounded-lg border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewModeChange("grid")}
                        className={cn("h-7 w-7 p-0 rounded-md transition-all", {
                            "bg-blue-500 text-white shadow-sm hover:bg-blue-600": viewMode === "grid",
                        })}
                    >
                        <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewModeChange("list")}
                        className={cn("h-7 w-7 p-0 rounded-md transition-all", {
                            "bg-blue-500 text-white shadow-sm hover:bg-blue-600": viewMode === "list",
                        })}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Legend with Dots */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] uppercase font-bold tracking-wider">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/20" />
                    Attempted
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/20" />
                    Unattempted
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/20" />
                    Marked
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full bg-muted border border-border" />
                    Unseen
                </div>
            </div>

            {/* Numerical Stats */}
            <div className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-lg border border-border/50">
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-green-600">{stats.answered}</span>
                    <span className="text-[8px] text-muted-foreground uppercase">Ans</span>
                </div>
                <div className="h-6 w-px bg-border/50" />
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-red-600">{stats.notAnswered}</span>
                    <span className="text-[8px] text-muted-foreground uppercase">Skip</span>
                </div>
                <div className="h-6 w-px bg-border/50" />
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-orange-600">{stats.marked}</span>
                    <span className="text-[8px] text-muted-foreground uppercase">Mark</span>
                </div>
                <div className="h-6 w-px bg-border/50" />
                <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-muted-foreground">{stats.total - stats.answered - stats.notAnswered}</span>
                    <span className="text-[8px] text-muted-foreground uppercase">Left</span>
                </div>
            </div>
        </div>
    )
}
