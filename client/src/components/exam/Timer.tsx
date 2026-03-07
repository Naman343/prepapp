"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface TimerProps {
    durationMinutes: number
    onTimeUp: () => void
    startTime?: Date
}

export function Timer({ durationMinutes, onTimeUp, startTime }: TimerProps) {
    const totalSeconds = durationMinutes * 60
    const [secondsLeft, setSecondsLeft] = useState(totalSeconds)
    const [isActive] = useState(true)

    useEffect(() => {
        if (startTime) {
            const now = new Date()
            const start = new Date(startTime)
            const elapsedSeconds = Math.floor((now.getTime() - start.getTime()) / 1000)
            const remaining = totalSeconds - elapsedSeconds
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSecondsLeft(remaining > 0 ? remaining : 0)
        }
    }, [startTime, totalSeconds])

    useEffect(() => {
        if (!isActive) return
        if (secondsLeft <= 0) {
            onTimeUp()
            return
        }

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [secondsLeft, onTimeUp, isActive])

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60
        return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
    }

    const percentage = (secondsLeft / totalSeconds) * 100
    const radius = 18
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
        <div className="flex items-center gap-3 bg-muted/30 pl-2 pr-4 py-0 rounded-full border border-border/50 shadow-sm">
            <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                    <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        className="text-muted/20"
                    />
                    <circle
                        cx="24"
                        cy="24"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="transparent"
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset }}
                        strokeLinecap="round"
                        className={cn("transition-all duration-1000", {
                            "text-blue-500": secondsLeft > 300,
                            "text-red-500": secondsLeft <= 300,
                        })}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
            </div>

            <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground leading-none">Time Remaining</span>
                <span className={cn("text-xl font-mono font-bold leading-tight", {
                    "text-red-500 animate-pulse": secondsLeft < 300,
                })}>
                    {formatTime(secondsLeft)}
                </span>
            </div>
        </div>
    )
}
