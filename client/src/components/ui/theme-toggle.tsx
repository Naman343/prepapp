"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
    const { setTheme, theme } = useTheme()
    const isDark = theme === "dark"

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
            className={cn(
                "relative ml-4 flex items-center w-16 h-8 rounded-full border-2 transition-all duration-300 focus:outline-none",
                isDark
                    ? "bg-neutral-900 border-neutral-700"
                    : "bg-neutral-100 border-neutral-300"
            )}
        >
            {/* Track icons */}
            <Moon className="absolute left-1.5 h-4 w-4 text-neutral-400" />
            <Sun className="absolute right-1.5 h-4 w-4 text-neutral-400" />

            {/* Sliding circle */}
            <span
                className={cn(
                    "absolute top-0.5 flex items-center justify-center w-6 h-6 rounded-full shadow-md transition-all duration-300",
                    isDark
                        ? "left-0.5 bg-neutral-800"
                        : "left-[calc(100%-1.75rem)] bg-white"
                )}
            >
                {isDark
                    ? <Moon className="h-3.5 w-3.5 text-white" />
                    : <Sun className="h-3.5 w-3.5 text-neutral-800" />
                }
            </span>
        </button>
    )
}
