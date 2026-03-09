"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => setMounted(true), [])

    const isDark = resolvedTheme === "dark"

    if (!mounted) {
        return <div className="w-[52px] h-7 rounded-full bg-muted animate-pulse" />
    }

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label="Toggle theme"
            role="switch"
            aria-checked={isDark}
            className={cn(
                "relative flex items-center w-[52px] h-7 rounded-full p-0.5 transition-colors duration-500 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                isDark
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600"
                    : "bg-gradient-to-r from-amber-300 to-orange-300"
            )}
        >
            {/* Sliding thumb */}
            <span
                className={cn(
                    "relative z-10 flex items-center justify-center w-6 h-6 rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.68,-0.15,0.27,1.15)]",
                    isDark
                        ? "translate-x-[22px] bg-indigo-950"
                        : "translate-x-0 bg-white"
                )}
            >
                <Sun className={cn(
                    "absolute h-3.5 w-3.5 text-amber-500 transition-all duration-300",
                    isDark ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"
                )} />
                <Moon className={cn(
                    "absolute h-3.5 w-3.5 text-indigo-200 transition-all duration-300",
                    isDark ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-0"
                )} />
            </span>

            {/* Background glow effect */}
            <span className={cn(
                "absolute inset-0 rounded-full transition-opacity duration-500",
                isDark
                    ? "bg-[radial-gradient(circle_at_75%_50%,rgba(129,140,248,0.3),transparent_70%)]"
                    : "bg-[radial-gradient(circle_at_25%_50%,rgba(251,191,36,0.4),transparent_70%)]"
            )} />
        </button>
    )
}
