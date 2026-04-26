import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params
        const body = await request.json()

        const tienda = await prisma.tienda.update({
            where: { id },
            data: body
        })

        return NextResponse.json({ success: true, tienda })
    } catch (error: any) {
        console.error("PATCH tienda error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params

        await prisma.tienda.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("DELETE tienda error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}