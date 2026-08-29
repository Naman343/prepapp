"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import api from "@/lib/axios"
import { Navbar } from "@/components/layout/Navbar"
import { ArrowRight, BarChart3, TrendingUp, Zap, Lock, AtSign, Eye, EyeOff, Check, Mail, Star } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await api.post("/auth/login", { email, password })
            localStorage.setItem("token", res.data.access_token)
            localStorage.setItem("user", JSON.stringify(res.data.user))
            router.push("/") // Go to dashboard
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setError(error.response?.data?.message || "Login failed")
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError("")
        
        const emailInput = window.prompt("Enter Google Email for simulation:", "aspirant.google@example.com")
        if (!emailInput) {
            setLoading(false)
            return
        }
        const nameInput = window.prompt("Enter Name for simulation:", "UPSC Aspirant") || undefined
        
        try {
            const res = await api.post("/auth/google", { email: emailInput, name: nameInput })
            localStorage.setItem("token", res.data.access_token)
            localStorage.setItem("user", JSON.stringify(res.data.user))
            router.push("/")
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } }
            setError(error.response?.data?.message || "Google Login failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center py-12 px-6">
                <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    {/* Left Column: Branding / Info */}
                    <div className="lg:col-span-6 space-y-8">
                        {/* Pill badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-black/20 bg-white">
                            <Star className="w-3 h-3 text-black fill-black" />
                            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black">
                                Trusted by UPSC Aspirants
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black tracking-tight leading-[1.05]">
                            Welcome back to your exam prep <span className="underline decoration-[#f5c842] decoration-4 underline-offset-8">command center.</span>
                        </h1>

                        {/* Description */}
                        <p className="text-black/50 font-medium text-base md:text-lg leading-relaxed max-w-lg">
                            Continue your mock tests, review analytics, and stay consistent with a focused study workflow built for serious UPSC preparation.
                        </p>

                        {/* Bento metrics row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Card 1 */}
                            <div className="bg-white border-2 border-black rounded-2xl p-5 border-l-4 border-l-[#f5c842] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-36">
                                <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center mb-4">
                                    <BarChart3 className="w-4 h-4 text-black" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-black">120+</p>
                                    <p className="text-[10px] font-bold text-black/50 leading-normal mt-1">Mock tests curated for prelims practice.</p>
                                </div>
                            </div>

                            {/* Card 2 */}
                            <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-36">
                                <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center mb-4">
                                    <TrendingUp className="w-4 h-4 text-black" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-black">Deep</p>
                                    <p className="text-[10px] font-bold text-black/50 leading-normal mt-1">Performance analytics with topic-level insights.</p>
                                </div>
                            </div>

                            {/* Card 3 */}
                            <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between min-h-36">
                                <div className="w-8 h-8 bg-black/5 rounded-lg flex items-center justify-center mb-4">
                                    <Zap className="w-4 h-4 text-black" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-black">Daily</p>
                                    <p className="text-[10px] font-bold text-black/50 leading-normal mt-1">Streak-driven motivation to stay on track.</p>
                                </div>
                            </div>
                        </div>

                        {/* Banner Block */}
                        <div className="border-2 border-black rounded-2xl p-5 flex items-center gap-4 bg-[#f8f9fa] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-black">Your progress is saved automatically</p>
                                <p className="text-[10px] font-medium text-black/50 mt-0.5">Pick up where you left off in your latest mock session.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Neobrutalist Shadow Login Form */}
                    <div className="lg:col-span-6 flex justify-center">
                        <div className="w-full max-w-lg bg-white border-2 border-black rounded-2xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-5">
                            
                            {/* Card Header */}
                            <div className="space-y-1">
                                <h2 className="text-2xl md:text-3xl font-black text-black tracking-tight">Login to your account</h2>
                                <p className="text-xs font-medium text-black/50">Enter your credentials to continue your PrepApp journey.</p>
                            </div>

                            {/* Google & OTP Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleGoogleLogin} type="button" className="h-11 border border-black/20 hover:border-black rounded-lg bg-white flex items-center justify-center gap-2 transition-colors text-xs font-bold text-black">
                                    <span className="w-4 h-4 flex items-center justify-center text-xs font-black bg-[#f5c842]/20 text-[#f5c842] rounded-full shrink-0">G</span>
                                    Google
                                </button>
                                <button type="button" className="h-11 border border-black/20 hover:border-black rounded-lg bg-white flex items-center justify-center gap-2 transition-colors text-xs font-bold text-black">
                                    <Mail className="w-4 h-4 text-black shrink-0" />
                                    Email OTP
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-black/10"></div>
                                <span className="flex-shrink mx-4 text-[9px] font-bold text-black/40 uppercase tracking-[0.2em]">or login with password</span>
                                <div className="flex-grow border-t border-black/10"></div>
                            </div>

                            {/* Error state */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs font-semibold text-red-600">
                                    {error}
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleLogin} className="space-y-4">
                                {/* Email */}
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-xs font-black text-black uppercase tracking-wider">Email address</label>
                                    <div className="relative flex items-center">
                                        <AtSign className="absolute left-3 w-4 h-4 text-black/30 pointer-events-none" />
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full h-12 pl-10 pr-4 bg-white border border-black/20 rounded-lg focus:border-black focus:outline-none transition-colors text-sm font-medium text-black placeholder:text-black/30"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label htmlFor="password" className="text-xs font-black text-black uppercase tracking-wider">Password</label>
                                        <Link href="#" className="text-xs font-bold text-[#e0a816] hover:underline">Forgot password?</Link>
                                    </div>
                                    <div className="relative flex items-center">
                                        <Lock className="absolute left-3 w-4 h-4 text-black/30 pointer-events-none" />
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full h-12 pl-10 pr-12 bg-white border border-black/20 rounded-lg focus:border-black focus:outline-none transition-colors text-sm font-medium text-black placeholder:text-black/30"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 w-8 h-8 flex items-center justify-center hover:bg-black/5 rounded-full text-black/40 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Remember me */}
                                <div className="flex items-center gap-2 pt-1">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 rounded border-black/20 text-black focus:ring-black accent-black cursor-pointer"
                                    />
                                    <label htmlFor="remember" className="text-xs font-bold text-black/60 select-none cursor-pointer">Remember me</label>
                                </div>

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-12 bg-black hover:bg-black/90 text-white rounded-lg font-black text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                                >
                                    {loading ? "Logging in..." : "Login"}
                                </button>
                            </form>

                            {/* Sign up Footer subcard */}
                            <div className="border border-black/10 rounded-lg p-4 bg-black/[0.02] text-center">
                                <p className="text-[11px] font-bold text-black/50 leading-relaxed">
                                    New here?{" "}
                                    <Link href="/auth/signup" className="text-black underline font-black hover:text-black/75">
                                        Create an account
                                    </Link>{" "}
                                    to attempt free mock tests and track your performance.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
