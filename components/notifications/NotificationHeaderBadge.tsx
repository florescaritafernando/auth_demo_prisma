"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import Link from "next/link"

export function NotificationHeaderBadge() {
    const [count, setCount] = useState(0)

    useEffect(() => {
        fetchCount()
        const interval = setInterval(fetchCount, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchCount = async () => {
        try {
            const res = await fetch("/api/notificaciones", { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                setCount(json.sinLeer)
            }
        } catch (e) {
            console.error("Error:", e)
        }
    }

    return (
        <Link href="/dashboard/notificaciones" className="relative p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5 text-slate-600" />
            {count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                </span>
            )}
        </Link>
    )
}