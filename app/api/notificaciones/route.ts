import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })
        
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const notificaciones = await prisma.notificacion.findMany({
            where: { userId: session.user.id },
            include: {
                pedido: { select: { numeroOrden: true, estado: true } }
            },
            orderBy: { createdAt: "desc" }
        })

        const sinLeer = notificaciones.filter(n => !n.leida).length

        return NextResponse.json({ success: true, notificaciones, sinLeer })
    } catch (error: any) {
        console.error("GET notificaciones error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const headersList = new Headers(request.headers)
        const session = await auth.api.getSession({ headers: headersList })
        
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { id, marcarLeida, marcarTodasLeidas } = await request.json()

        if (marcarTodasLeidas) {
            await prisma.notificacion.updateMany({
                where: { userId: session.user.id, leida: false },
                data: { leida: true }
            })
            return NextResponse.json({ success: true })
        }

        if (id) {
            const notificacion = await prisma.notificacion.update({
                where: { id, userId: session.user.id },
                data: { leida: true }
            })
            return NextResponse.json({ success: true, notificacion })
        }

        return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 })
    } catch (error: any) {
        console.error("PATCH notificaciones error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}