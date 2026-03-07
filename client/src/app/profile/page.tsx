"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Shield } from "lucide-react"

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) {
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
                        <CardContent className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Change Password functionality coming soon.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
