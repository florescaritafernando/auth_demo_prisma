import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })
        
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { id } = await params

        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                pedidoDetalle: {
                    include: { producto: true }
                }
            }
        })

        if (!pedido) {
            return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        const userRole = (session.user as any)?.role || "cliente"
        
        if (userRole !== "admin" && pedido.userId !== session.user.id) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }

        return NextResponse.json({ success: true, pedido })
    } catch (error: any) {
        console.error("GET pedido error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

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

        const { id } = await params

        const contentType = request.headers.get("content-type") || ""
        let body: any
        
        try {
            if (contentType.includes("application/json")) {
                body = await request.json()
            } else {
                const formData = await request.formData()
                body = Object.fromEntries(formData)
            }
        } catch (e: any) {
            return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 })
        }

        const { estado, metraje_items, numeroOperacion } = body

        const estadosValidos = ["metraje_en_proceso", "metraje_confirmado", "pendiente", "confirmado", "rechazado", "completado"]
        
        if (estado && !estadosValidos.includes(estado)) {
            return NextResponse.json({ success: false, error: "Estado inválido" }, { status: 400 })
        }

        const metrajeItemsArray = metraje_items ? (typeof metraje_items === "string" ? JSON.parse(metraje_items) : metraje_items) : null
        
        const userRole = (session.user as any)?.role || "cliente"
        
        const existingPedido = await prisma.pedido.findUnique({
            where: { id },
            select: { userId: true, estado: true }
        })
        
        if (!existingPedido) {
            return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        const isOwner = existingPedido.userId === session.user.id
        const isMetrajeConfirmadoToConfirmado = existingPedido.estado === "metraje_confirmado" && estado === "confirmado"
        
        if (userRole !== "admin" && !(isOwner && isMetrajeConfirmadoToConfirmado)) {
            if (metrajeItemsArray || (estado && estado !== existingPedido.estado)) {
                return NextResponse.json({ success: false, error: "Solo administradores" }, { status: 403 })
            }
        }
        
        const updateData: any = {}
        if (estado) updateData.estado = estado
        if (numeroOperacion) updateData.numeroOperacion = numeroOperacion
        
        const pedido = await prisma.pedido.update({
            where: { id },
            data: updateData
        })

        if (metrajeItemsArray && Array.isArray(metrajeItemsArray)) {
            for (const item of metrajeItemsArray) {
                await prisma.pedidoDetalle.update({
                    where: { id: item.detalleId },
                    data: { 
                        metraje: item.metraje,
                        cantidad: Math.ceil(item.metraje / 50)
                    }
                })
            }
            
            if (pedido.estado === "metraje_en_proceso") {
                await prisma.pedido.update({
                    where: { id },
                    data: { estado: "metraje_confirmado" }
                })
                
                await prisma.notificacion.create({
                    data: {
                        userId: pedido.userId,
                        tipo: "metraje_confirmado",
                        titulo: "¡Metraje confirmado!",
                        mensaje: `Tu pedido ${pedido.numeroOrden} tiene el metraje confirmado. Ya puedes continuar con el pago.`,
                        pedidoId: id
                    }
                })
            }
        }

        return NextResponse.json({ success: true, pedido })
    } catch (error: any) {
        console.error("PATCH pedido error:", error)
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

        const { id } = await params

        const userRole = (session.user as any)?.role || "cliente"
        
        if (userRole !== "admin") {
            return NextResponse.json({ success: false, error: "Solo administradores" }, { status: 403 })
        }

        await prisma.pedido.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("DELETE pedido error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}