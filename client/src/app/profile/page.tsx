"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/Navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LogOut, Save, User, Pencil, X } from "lucide-react"
import api from "@/lib/axios"

type Category = "GEN" | "EWS" | "OBC" | "SC" | "ST"
type MemberTier = "FREE" | "PRO" | "MAX"

interface UserData {
    id: string;
    email: string;
    role: string;
    name?: string;
    mobileNumber?: string;
    dob?: string;
    location?: string;
    category?: Category;
    pwd?: boolean;
    memberTier?: MemberTier;
}

const TIER_STYLES: Record<MemberTier, string> = {
    FREE: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
    PRO: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    MAX: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserData | null>(null)
    const [form, setForm] = useState<Partial<UserData>>({})
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [editing, setEditing] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) { router.push("/auth/login"); return }
        api.get("/auth/me").then(res => {
            setUser(res.data)
            setForm({
                name: res.data.name ?? "",
                mobileNumber: res.data.mobileNumber ?? "",
                dob: res.data.dob ? res.data.dob.slice(0, 10) : "",
                location: res.data.location ?? "",
                category: res.data.category,
                pwd: res.data.pwd ?? false,
            })
        }).catch(() => router.push("/auth/login"))
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        router.push("/auth/login")
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await api.patch("/auth/profile", form)
            setUser(prev => ({ ...prev!, ...res.data }))
            setSaved(true)
            setEditing(false)
            setTimeout(() => setSaved(false), 2000)
        } finally {
            setSaving(false)
        }
    }

    const handleCancelEdit = () => {
        setForm({
            name: user?.name ?? "",
            mobileNumber: user?.mobileNumber ?? "",
            dob: user?.dob ? user.dob.slice(0, 10) : "",
            location: user?.location ?? "",
            category: user?.category,
            pwd: user?.pwd ?? false,
        })
        setEditing(false)
    }

    const set = (field: keyof UserData, value: string | boolean | undefined) =>
        setForm(prev => ({ ...prev, [field]: value }))

    if (!user) return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex h-[60vh] items-center justify-center text-muted-foreground">Loading...</div>
        </div>
    )

    const initials = (user.name || user.email).slice(0, 2).toUpperCase()
    const tier = user.memberTier ?? "FREE"

    return (
        <div className="min-h-screen bg-muted/20">
            <Navbar />
            <main className="container mx-auto px-6 py-10 max-w-5xl">
                <div className="mb-8">
                    <p className="text-[10px] uppercase font-bold text-blue-600 tracking-[0.3em] mb-1">ACCOUNT</p>
                    <h1 className="text-3xl font-black tracking-tight">My Account</h1>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Left â€” Profile form */}
                    <Card className="lg:col-span-2 rounded-2xl border-border/60">
                        <CardHeader className="pb-4">
                            {/* Avatar + tier badge + Edit button */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
                                        {initials}
                                    </div>
                                    <div>
                                        <p className="font-black text-lg leading-tight">{user.name || "Set your name"}</p>
                                        <p className="text-sm text-muted-foreground">{user.email}</p>
                                        <span className={`mt-1 inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${TIER_STYLES[tier]}`}>
                                            {tier}
                                        </span>
                                    </div>
                                </div>
                                <Button
                                    variant={editing ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => editing ? handleCancelEdit() : setEditing(true)}
                                    className={`rounded-xl font-black text-xs uppercase tracking-wider gap-2 ${
                                        editing
                                            ? "border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    {editing ? <><X className="w-3.5 h-3.5" /> Cancel</> : <><Pencil className="w-3.5 h-3.5" /> Edit</>}
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-5">
                            {/* Full Name */}
                            <Field label="Full Name">
                                <input
                                    type="text"
                                    value={form.name ?? ""}
                                    onChange={e => set("name", e.target.value)}
                                    placeholder="Enter your full name"
                                    readOnly={!editing}
                                    className={`${inputCls} ${!editing ? "opacity-60 cursor-not-allowed" : ""}`}
                                />
                            </Field>

                            {/* Email â€” read-only */}
                            <Field label="Email Address">
                                <input
                                    type="email"
                                    value={user.email}
                                    readOnly
                                    className={`${inputCls} opacity-60 cursor-not-allowed`}
                                />
                            </Field>

                            {/* Mobile + DOB side by side */}
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Mobile Number">
                                    <input
                                        type="tel"
                                        value={form.mobileNumber ?? ""}
                                        onChange={e => {
                                            const digits = e.target.value.replace(/\D/g, "").slice(0, 10)
                                            set("mobileNumber", digits)
                                        }}
                                        maxLength={10}
                                        pattern="[0-9]{10}"
                                        placeholder="0000000000"
                                        readOnly={!editing}
                                        className={`${inputCls} ${!editing ? "opacity-60 cursor-not-allowed" : ""}`}
                                    />
                                </Field>
                                <Field label="Date of Birth">
                                    <input
                                        type="date"
                                        value={form.dob ?? ""}
                                        onChange={e => set("dob", e.target.value)}
                                        readOnly={!editing}
                                        className={`${inputCls} ${!editing ? "opacity-60 cursor-not-allowed" : ""}`}
                                    />
                                </Field>
                            </div>

                            {/* Location */}
                            <Field label="Location">
                                <input
                                    type="text"
                                    value={form.location ?? ""}
                                    onChange={e => set("location", e.target.value)}
                                    placeholder="City, State"
                                    readOnly={!editing}
                                    className={`${inputCls} ${!editing ? "opacity-60 cursor-not-allowed" : ""}`}
                                />
                            </Field>

                            {/* Category */}
                            <Field label="Category">
                                <div className="flex gap-2 flex-wrap">
                                    {(["GEN", "EWS", "OBC", "SC", "ST"] as Category[]).map(cat => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => editing && set("category", cat)}
                                            disabled={!editing}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-black border-2 transition-all ${
                                                form.category === cat
                                                    ? "border-blue-600 bg-blue-600 text-white"
                                                    : "border-border bg-background text-muted-foreground hover:border-blue-400"
                                            } ${!editing ? "opacity-60 cursor-not-allowed" : ""}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            {/* PWD */}
                            <Field label="Person with Disability (PWD)">
                                <div className="flex gap-3">
                                    {[true, false].map(val => (
                                        <button
                                            key={String(val)}
                                            type="button"
                                            onClick={() => editing && set("pwd", val)}
                                            disabled={!editing}
                                            className={`px-6 py-1.5 rounded-lg text-xs font-black border-2 transition-all ${
                                                form.pwd === val
                                                    ? "border-blue-600 bg-blue-600 text-white"
                                                    : "border-border bg-background text-muted-foreground hover:border-blue-400"
                                            } ${!editing ? "opacity-60 cursor-not-allowed" : ""}`}
                                        >
                                            {val ? "Yes" : "No"}
                                        </button>
                                    ))}
                                </div>
                            </Field>

                            {/* Save button - only visible in edit mode */}
                            {editing && (
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full h-12 bg-foreground text-background hover:bg-foreground/90 font-black rounded-xl mt-2"
                                >
                                    {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
                                </Button>
                            )}
                            {saved && !editing && (
                                <p className="text-center text-sm font-bold text-green-600 mt-2">Saved ✓</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Right â€” Quick Actions */}
                    <div className="space-y-4">
                        <Card className="rounded-2xl border-border/60">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-black flex items-center gap-2">
                                    <User className="w-4 h-4" /> Quick Actions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60">
                                    <span className="text-sm font-semibold">Theme</span>
                                    <ThemeToggle />
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full flex items-center gap-2 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-400 transition-colors rounded-xl"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Membership card */}
                        <Card className="rounded-2xl border-border/60">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-black">Membership</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {(["FREE", "PRO", "MAX"] as MemberTier[]).map(t => (
                                    <div
                                        key={t}
                                        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border-2 transition-all ${
                                            tier === t ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20" : "border-border/40 opacity-50"
                                        }`}
                                    >
                                        <span className="text-sm font-black">{t}</span>
                                        {tier === t && <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Current</span>}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
            {children}
        </div>
    )
}

const inputCls = "w-full h-11 px-4 rounded-xl border-2 border-border bg-background text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
