import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth, enviarEmail } from "@/lib/auth"

function calculateCostoEnvio(subtotal: number, metodoEnvio?: string | null): number {
    if (!metodoEnvio || metodoEnvio === "retiro") return 0
    if (metodoEnvio === "agencia") {
        if (subtotal >= 3000) return 30
        if (subtotal >= 1500) return 20
        if (subtotal >= 500) return 15
        return 10
    }
    return 10
}

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

        if (estado === "rechazado") {
            await prisma.notificacion.create({
                data: {
                    userId: pedido.userId,
                    tipo: "pedido_estado",
                    titulo: "Pedido rechazado",
                    mensaje: `Tu pedido ${pedido.numeroOrden} ha sido rechazado. Por favor, contacta con nuestro equipo al WhatsApp para más información.`,
                    pedidoId: id
                }
            })
            
            const usuario = await prisma.user.findUnique({
                where: { id: pedido.userId },
                select: { email: true, name: true }
            })
            
            console.log("Intentando enviar correo a:", usuario?.email)
            
            if (usuario?.email) {
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #dc2626;">Pedido Rechazado</h2>
                        <p>Hola ${usuario.name || "cliente"},</p>
                        <p>Lamentablemente tu pedido <strong>${pedido.numeroOrden}</strong> ha sido rechazado.</p>
                        <p>Por favor, contacta con nuestro equipo al WhatsApp para más información:</p>
                        <p style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center;">
                            <strong>WhatsApp:</strong> 981-404-062
                        </p>
                        <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">
                            Manchester Collection - Tienda en línea
                        </p>
                    </div>
                `
                try {
                    await enviarEmail(usuario.email, `Pedido ${pedido.numeroOrden} rechazado`, emailHtml)
                    console.log("Correo enviado exitosamente")
                } catch (err) {
                    console.error("Error al enviar correo:", err)
                }
            }
        }

        if (metrajeItemsArray && Array.isArray(metrajeItemsArray)) {
            let nuevoTotal = 0
            
            for (const item of metrajeItemsArray) {
                const detalleActual = await prisma.pedidoDetalle.findUnique({
                    where: { id: item.detalleId },
                    include: { producto: true }
                })
                
                if (detalleActual) {
                    const nuevoMetraje = item.metraje
                    const nuevaCantidad = Math.ceil(nuevoMetraje / 50)
                    const precioBase = Number(detalleActual.producto.precio)
                    
                    await prisma.pedidoDetalle.update({
                        where: { id: item.detalleId },
                        data: { 
                            metraje: nuevoMetraje,
                            cantidad: nuevaCantidad,
                            precio: precioBase
                        }
                    })
                    
                    nuevoTotal += precioBase * nuevoMetraje
                }
            }
            
            const otrosDetalles = await prisma.pedidoDetalle.findMany({
                where: { pedidoId: id, tipo: "metros" }
            })
            
            for (const det of otrosDetalles) {
                nuevoTotal += Number(det.precio) * det.cantidad
            }
            
            const costoEnvio = calculateCostoEnvio(nuevoTotal, pedido.metodoEnvio || "agencia")
            
            await prisma.pedido.update({
                where: { id },
                data: { 
                    total: nuevoTotal,
                    costoEnvio: costoEnvio
                }
            })
            
            if (pedido.estado === "metraje_en_proceso") {
                await prisma.pedido.update({
                    where: { id },
                    data: { estado: "metraje_confirmado" }
                })
                
                await prisma.notificacion.create({
                    data: {
                        userId: pedido.userId,
                        tipo: "metraje_confirmado",
                        titulo: "Metraje confirmado",
                        mensaje: `Tu pedido ${pedido.numeroOrden} ha sido actualizado. El metraje ha sido confirmado y el precio final es S/ ${nuevoTotal.toFixed(2)}. Puedes continuar con el pago.`,
                        pedidoId: id
                    }
                })
            }
        } else if (estado === "metraje_confirmado" && existingPedido.estado === "metraje_en_proceso") {
            const piezasDetalles = await prisma.pedidoDetalle.findMany({
                where: { pedidoId: id, tipo: "pieza" }
            })
            
            let nuevoTotal = 0
            for (const pieza of piezasDetalles) {
                if (pieza.metraje && pieza.metraje > 0) {
                    nuevoTotal += Number(pieza.precio) * pieza.metraje
                }
            }
            
            const metrosDetalles = await prisma.pedidoDetalle.findMany({
                where: { pedidoId: id, tipo: "metros" }
            })
            
            for (const det of metrosDetalles) {
                nuevoTotal += Number(det.precio) * det.cantidad
            }
            
            const costoEnvio = calculateCostoEnvio(nuevoTotal, pedido.metodoEnvio)
            
            if (nuevoTotal > 0) {
                await prisma.pedido.update({
                    where: { id },
                    data: { 
                        total: nuevoTotal,
                        costoEnvio: costoEnvio
                    }
                })
            }
            
            await prisma.notificacion.create({
                data: {
                    userId: pedido.userId,
                    tipo: "metraje_confirmado",
                    titulo: "Metraje confirmado",
                    mensaje: `Tu pedido ${pedido.numeroOrden} ha sido actualizado. El metraje ha sido confirmado y el precio final es S/ ${nuevoTotal.toFixed(2)}. Puedes continuar con el pago.`,
                    pedidoId: id
                }
            })
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