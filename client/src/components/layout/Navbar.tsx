"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { User, Search } from "lucide-react"

interface UserData {
    id: string;
    email: string;
    role: string;
    name?: string;
}

export function Navbar() {
    const [user, setUser] = useState<UserData | null>(null)

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(JSON.parse(userData))
        }
    }, [])


    return (
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
                            <button className="hover:text-blue-600 transition-colors py-2" title="Search">
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
    )
}
