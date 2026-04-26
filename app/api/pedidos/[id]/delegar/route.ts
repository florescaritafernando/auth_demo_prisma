import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const role = (session.user as any)?.role || "cliente"
        if (role !== "empleado") {
            return NextResponse.json({ success: false, error: "Solo empleados pueden tomar pedidos" }, { status: 403 })
        }

        const { id } = await params

        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: { user: { select: { name: true, email: true } } }
        })

        if (!pedido) {
            return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        if (pedido.delegadoId && pedido.delegadoId !== session.user.id) {
            return NextResponse.json({ success: false, error: "Este pedido ya está asignado a otro empleado" }, { status: 400 })
        }

        const pedidoActualizado = await prisma.pedido.update({
            where: { id },
            data: { delegadoId: session.user.id }
        })

        return NextResponse.json({ success: true, pedido: pedidoActualizado })

    } catch (error: any) {
        console.error("Delegar error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}