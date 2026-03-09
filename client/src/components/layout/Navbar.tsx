"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { User, Search, X } from "lucide-react"

interface UserData {
    id: string;
    email: string;
    role: string;
    name?: string;
}

export function Navbar() {
    const [user, setUser] = useState<UserData | null>(null)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    useEffect(() => {
        if (searchOpen) {
            setTimeout(() => inputRef.current?.focus(), 50)
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
            setSearchQuery("")
        }
        return () => { document.body.style.overflow = "" }
    }, [searchOpen])

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSearchOpen(false)
        }
        window.addEventListener("keydown", handleKey)
        return () => window.removeEventListener("keydown", handleKey)
    }, [])

    return (
        <>
            {/* Search Modal */}
            {searchOpen && (
                <div
                    className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
                    onClick={() => setSearchOpen(false)}
                >
                    <div
                        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
                            <h2 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">Search</h2>
                            <button
                                onClick={() => setSearchOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="px-6 py-4">
                            <div className="flex items-center gap-3 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 focus-within:border-blue-500 transition-colors bg-zinc-50 dark:bg-zinc-800">
                                <Search className="w-5 h-5 text-zinc-400 shrink-0" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search tests, topics..."
                                    className="flex-1 bg-transparent outline-none text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium"
                                />
                            </div>
                        </div>

                        {/* Results area */}
                        <div className="px-6 pb-6 min-h-50 text-sm text-zinc-400 dark:text-zinc-500 flex items-center justify-center">
                            {searchQuery ? `Searching for "${searchQuery}"...` : "Start typing to search"}
                        </div>
                    </div>
                </div>
            )}

            <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="flex flex-col group active:scale-95 transition-transform">
                        <span className="text-2xl font-black text-foreground tracking-tighter">PrepApp</span>
                    </Link>

                    <div className="flex items-center gap-6">
                        {user && (
                            <nav className="hidden lg:flex items-center gap-8 text-[10px] uppercase font-bold tracking-[0.15em] text-muted-foreground mr-4">
                                <Link href="/pyq" className="hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600">PYQ Tests</Link>
                                <Link href="/tests" className="hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600">Mock Tests</Link>
                                <Link href="/analytics" className="hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600">My Performance</Link>
                                <button
                                    className="hover:text-blue-600 transition-colors py-2"
                                    title="Search"
                                    onClick={() => setSearchOpen(true)}
                                >
                                    <Search className="w-4 h-4" />
                                </button>
                            </nav>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4 pl-6 border-l border-border/50">
                                <Link href="/profile" className="flex items-center gap-3 group">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100 group-hover:border-blue-500 group-hover:bg-blue-100 transition-all duration-300 overflow-hidden shadow-sm">
                                        <User className="w-6 h-6 text-blue-600 mt-1" />
                                    </div>
                                    <div className="hidden sm:flex flex-col">
                                        <span className="text-xs font-black text-foreground tracking-tight leading-none mb-1">My Account</span>
                                        <span className="text-[10px] text-muted-foreground leading-none font-bold uppercase">{user.name?.split(' ')[0] || 'Aspirant'}</span>
                                    </div>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link href="/auth/login">
                                    <Button variant="ghost" className="font-bold text-sm tracking-tight px-6 h-11 rounded-xl hover:bg-muted hover:scale-105 transition-all duration-200">Login</Button>
                                </Link>
                                <Link href="/auth/signup">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-tight px-8 h-11 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Sign Up Free</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    )
}

