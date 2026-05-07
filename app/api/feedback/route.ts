import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { pedidoId, calificacion, comentario, etiquetas } = await request.json()

        if (!pedidoId) {
            return NextResponse.json({ success: false, error: "ID de pedido requerido" }, { status: 400 })
        }

        if (calificacion === undefined || calificacion === null) {
            return NextResponse.json({ success: false, error: "Calificación requerida (0-5)" }, { status: 400 })
        }

        if (calificacion < 0 || calificacion > 5) {
            return NextResponse.json({ success: false, error: "Calificación debe estar entre 0 y 5" }, { status: 400 })
        }

        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId }
        })

        if (!pedido) {
            return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        if (pedido.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }

        if (pedido.estado !== "pedido_enviado") {
            return NextResponse.json({ success: false, error: "El pedido debe estar en estado En tránsito" }, { status: 400 })
        }

        const feedback = await prisma.feedback.create({
            data: {
                pedidoId,
                userId: session.user.id,
                calificacion,
                comentario: comentario || null,
                etiquetas: etiquetas && etiquetas.length > 0 ? etiquetas.join(",") : null
            }
        })

        await prisma.pedido.update({
            where: { id: pedidoId },
            data: { estado: "completado" }
        })

        await prisma.notificacion.updateMany({
            where: {
                pedidoId,
                leida: false
            },
            data: { leida: true }
        })

        await prisma.notificacion.create({
            data: {
                userId: session.user.id,
                tipo: "pedido_estado",
                titulo: "Pedido completado",
                mensaje: `Tu pedido ${pedido.numeroOrden} ha sido completado. Gracias por tu preferencia.`,
                pedidoId
            }
        })

        return NextResponse.json({ success: true, feedback })
    } catch (error: any) {
        console.error("POST feedback error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}