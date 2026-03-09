"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PYQRedirect() {
    const router = useRouter()
    useEffect(() => {
        router.replace("/tests?tab=pyq")
    }, [router])
    return null
}
