"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, Mail, MapPin, Instagram, Twitter, Linkedin, Facebook } from "lucide-react"

export function Footer() {
    const pathname = usePathname()
    
    // Do not show footer during exams or on admin pages
    if (pathname?.startsWith('/exam') || pathname?.startsWith('/admin')) return null
    
    return (
        <footer className="bg-zinc-950 text-zinc-400 py-16 px-6 border-t border-zinc-900 mt-auto">
            <div className="container mx-auto max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand & Contact Column */}
                    <div className="space-y-6">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-white tracking-tighter">PrepApp</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mt-1">UPSC Preparation Platform</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-white/60 shrink-0 mt-0.5" />
                                <span className="text-sm font-medium leading-relaxed">
                                    159, Sector 39, Gurugram,<br /> Haryana
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-white/60 shrink-0" />
                                <span className="text-sm font-medium">+91 89557 97624</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-white/60 shrink-0" />
                                <span className="text-sm font-medium">contact@prepapp.in</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links / Company Column */}
                    <div>
                        <h3 className="text-white text-sm font-black uppercase tracking-widest mb-6">Company</h3>
                        <ul className="space-y-4">
                            <li><Link href="/about" className="text-sm font-bold hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/careers" className="text-sm font-bold hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="/privacy" className="text-sm font-bold hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm font-bold hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    {/* Products Column */}
                    <div>
                        <h3 className="text-white text-sm font-black uppercase tracking-widest mb-6">Products</h3>
                        <ul className="space-y-4">
                            <li><Link href="/tests?tab=pyq" className="text-sm font-bold hover:text-white transition-colors">PYQ Tests</Link></li>
                            <li><Link href="/tests?tab=mock" className="text-sm font-bold hover:text-white transition-colors">Mock Tests</Link></li>
                            <li><Link href="/analytics" className="text-sm font-bold hover:text-white transition-colors">Personalised Learning</Link></li>
                            <li><Link href="/notes" className="text-sm font-bold hover:text-white transition-colors">Study Material</Link></li>
                        </ul>
                    </div>

                    {/* Socials Column */}
                    <div>
                        <h3 className="text-white text-sm font-black uppercase tracking-widest mb-6">Follow Us</h3>
                        <p className="text-xs font-bold leading-relaxed mb-6">Join our community of over 50,000+ UPSC aspirants.</p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center hover:bg-white hover:text-black transition-all">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest">© 2026 PREPAPP INC PVT LTD</p>
                    <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
                        <span>Made with ❤️ for Aspirants</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}
