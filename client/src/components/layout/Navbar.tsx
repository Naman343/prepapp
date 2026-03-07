"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { User, LogOut, Home } from "lucide-react"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function Navbar() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)

    // We need to sync user state across pages. For MVP, reading from localStorage on mount is fine.
    // Ideally use Context or Zustand. To handle updates (like logout), we might rely on window reload or event, 
    // but simpler: if this component mounts, it reads.

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        router.push("/auth/login")
    }

    return (
        <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
            <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                <Link href="/" className="flex flex-col group active:scale-95 transition-transform">
                    <span className="text-2xl font-black text-foreground tracking-tighter">PrepApp</span>
                </Link>

                <div className="flex items-center gap-6">
                    {user && (
                        <nav className="hidden lg:flex items-center gap-8 text-[10px] uppercase font-bold tracking-[0.15em] text-muted-foreground mr-4">
                            <Link href="/tests" className="hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600">Mock Tests</Link>
                            <Link href="/analytics" className="hover:text-blue-600 transition-colors py-2 border-b-2 border-transparent hover:border-blue-600">My Performance</Link>
                        </nav>
                    )}

                    <ThemeToggle />

                    {user ? (
                        <div className="flex items-center gap-6 pl-6 border-l border-border/50">
                            <Link href="/profile" className="flex items-center gap-3 group">
                                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-100 group-hover:border-blue-500 group-hover:bg-blue-100 transition-all duration-300 overflow-hidden shadow-sm">
                                    <User className="w-6 h-6 text-blue-600 mt-1" />
                                </div>
                                <div className="hidden sm:flex flex-col">
                                    <span className="text-xs font-black text-foreground tracking-tight leading-none mb-1">My Account</span>
                                    <span className="text-[10px] text-muted-foreground leading-none font-bold uppercase">{user.name?.split(' ')[0] || 'Aspirant'}</span>
                                </div>
                            </Link>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/auth/login">
                                <Button variant="ghost" className="font-bold text-sm tracking-tight px-6 h-11 rounded-xl">Login</Button>
                            </Link>
                            <Link href="/auth/signup">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm tracking-tight px-8 h-11 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all">Sign Up Free</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
