import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })
        
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const userRole = (session.user as any)?.role || "cliente"
        
        if (userRole !== "admin" && userRole !== "empleado") {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }

        const searchParams = request.nextUrl.searchParams
        const roleFilter = searchParams.get("role")

        const where: any = {}
        if (roleFilter) {
            where.role = roleFilter
        }

        const usuarios = await prisma.user.findMany({
            where,
            select: { id: true, name: true, email: true }
        })

        return NextResponse.json({ success: true, usuarios })
    } catch (error: any) {
        console.error("GET usuarios error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}