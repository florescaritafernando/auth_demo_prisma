"use client"

import { usePathname } from "next/navigation"
import { MobileNav } from "@/components/mobile-nav"

interface Props {
    userName: string
    userRole: string
}

export function MobileNavWrapper({ userName, userRole }: Props) {
    const pathname = usePathname()

    if (pathname === "/dashboard") return null

    return (
        <MobileNav
            userName={userName}
            userRole={userRole}
        />
    )
}
