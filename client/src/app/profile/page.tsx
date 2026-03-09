"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { User, Mail, Shield, LogOut } from "lucide-react"

interface UserData {
    id: string;
    email: string;
    role: string;
    name?: string;
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null)
    const router = useRouter()

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/auth/login")
    }

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUser(JSON.parse(userData))
        }
    }, [])

    if (!user) return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container mx-auto p-8 text-center text-muted-foreground">
                Please login to view your profile.
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto p-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-8">My Profile</h1>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* User Details Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <User className="w-5 h-5" /> Account Details
                            </CardTitle>
                            <CardDescription>Manage your personal information</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                                        <p className="font-semibold">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                                        <Shield className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Role</p>
                                        <p className="font-semibold capitalize">{user.role.toLowerCase()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground font-mono">
                                User ID: {user.id}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Stats or Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                                <span className="text-sm font-medium">Theme</span>
                                <ThemeToggle />
                            </div>
                            <Button
                                variant="outline"
                                className="w-full flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-colors"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Change Password functionality coming soon.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
