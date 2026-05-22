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

        const { pedidoId, tipo, descripcion, detalle_pedido } = await request.json()

        if (!tipo || !["queja", "reclamo"].includes(tipo)) {
            return NextResponse.json({ success: false, error: "Tipo inválido: debe ser 'queja' o 'reclamo'" }, { status: 400 })
        }

        if (pedidoId) {
            const existingReclamo = await prisma.reclamo.findFirst({
                where: { pedidoId, userId: session.user.id }
            })
            if (existingReclamo) {
                return NextResponse.json({ success: false, error: "Ya tienes un reclamo registrado para este pedido" }, { status: 400 })
            }
        }

        if (!descripcion || descripcion.length < 10) {
            return NextResponse.json({ success: false, error: "Descripción requerida (mín. 10 caracteres)" }, { status: 400 })
        }

        let pedido = null
        if (pedidoId) {
            pedido = await prisma.pedido.findUnique({
                where: { id: pedidoId }
            })

            if (!pedido) {
                return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
            }

            if (pedido.userId !== session.user.id) {
                return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
            }

            if (pedido.estado !== "pedido_enviado" && pedido.estado !== "completado") {
                return NextResponse.json({ success: false, error: "Solo puedes realizar quejas/reclamos de pedidos enviados o completados" }, { status: 400 })
            }
        }

        const reclamo = await prisma.reclamo.create({
            data: {
                userId: session.user.id,
                pedidoId: pedidoId || null,
                tipo,
                descripcion,
                detalle_pedido: detalle_pedido || null
            }
        })

        return NextResponse.json({ success: true, reclamo })
    } catch (error: any) {
        console.error("POST reclamo error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function GET(request: NextRequest) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const tipo = searchParams.get("tipo")
        const role = (session.user as any)?.role || "cliente"

        let whereClause: any = {}
        
        // Si es cliente, solo ve sus propios reclamos
        if (role === "cliente") {
            whereClause.userId = session.user.id
        }
        // Admin/empleado ven todos los reclamos
        
        if (tipo) {
            whereClause.tipo = tipo
        }

        const reclamos = await prisma.reclamo.findMany({
            where: whereClause,
            include: {
                pedido: { select: { numeroOrden: true, estado: true, total: true } },
                user: { select: { name: true, email: true } },
                atendidoPor: { select: { name: true } }
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ success: true, reclamos })
    } catch (error: any) {
        console.error("GET reclamos error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const role = (session.user as any)?.role || "cliente"
        if (!["admin", "empleado"].includes(role)) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }

        const { id, estado, respuesta } = await request.json()

        if (!id) {
            return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 })
        }

        const reclamo = await prisma.reclamo.findUnique({
            where: { id },
            include: { pedido: true }
        })

        if (!reclamo) {
            return NextResponse.json({ success: false, error: "Reclamo no encontrado" }, { status: 404 })
        }

        const updateData: any = {}
        
        if (estado && ["pendiente", "atendido", "resuelto"].includes(estado)) {
            updateData.estado = estado
        }
        
        if (respuesta !== undefined) {
            updateData.respuesta = respuesta
        }
        
        // Registrar quién atendió (guardar ID del usuario)
        updateData.atendidoPorId = session.user.id

        const updatedReclamo = await prisma.reclamo.update({
            where: { id },
            data: updateData
        })

        // Crear notificación al cliente si hay respuesta o se cambia a atendido/resuelto
        if ((respuesta || estado === "atendido" || estado === "resuelto") && reclamo.userId) {
            // No notificar si el pedido fue creado por un empleado/admin
            if (reclamo.pedidoId) {
                const pedidoEmpleadoInfo = await prisma.pedidoEmpleadoInfo.findUnique({ where: { pedidoId: reclamo.pedidoId } })
                if (pedidoEmpleadoInfo) {
                    return NextResponse.json({ success: true, reclamo: updatedReclamo })
                }
            }
            await prisma.notificacion.create({
                data: {
                    userId: reclamo.userId,
                    tipo: "reclamo_atendido",
                    titulo: "Tu reclamo ha sido atendido",
                    mensaje: estado === "resuelto" 
                        ? `Tu ${reclamo.tipo} ha sido resuelto. ${respuesta ? `Respuesta: ${respuesta}` : ""}`
                        : `Tu ${reclamo.tipo} ha sido atendido. ${respuesta ? `Respuesta: ${respuesta}` : ""}`,
                    leida: false,
                    pedidoId: reclamo.pedidoId || undefined
                }
            })
        }

        return NextResponse.json({ success: true, reclamo: updatedReclamo })
    } catch (error: any) {
        console.error("PATCH reclamo error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}