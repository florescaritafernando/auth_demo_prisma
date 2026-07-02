"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"

export function NotificationBadge() {
    const [count, setCount] = useState(0)
    const pathname = usePathname()

    // Notificaciones DESHABILITADAS

    const isActive = pathname === "/dashboard/notificaciones"

    return (
        <Link href="/dashboard/notificaciones" className="relative flex items-center gap-3 w-full">
            <Bell className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-600"}`} />
            <span className={isActive ? "text-white font-medium" : "text-slate-600"}>Notificaciones</span>
            {count > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                    {count > 99 ? "99+" : count}
                </span>
            )}
        </Link>
    )
}