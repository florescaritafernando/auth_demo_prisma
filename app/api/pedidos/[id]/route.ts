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
                    include: { 
                        producto: true,
                        etiquetas: { orderBy: { createdAt: "asc" } }
                    }
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

        const { estado, metraje_items, numeroOperacion, motivoRechazo } = body

        const estadosValidos = ["metraje_en_proceso", "metraje_confirmado", "pendiente", "confirmado", "rechazado", "completado"]
        
        if (estado && !estadosValidos.includes(estado)) {
            return NextResponse.json({ success: false, error: "Estado inválido" }, { status: 400 })
        }

        const metrajeItemsArray = metraje_items ? (typeof metraje_items === "string" ? JSON.parse(metraje_items) : metraje_items) : null
        
        const userRole = (session.user as any)?.role || "cliente"
        
        const existingPedido = await prisma.pedido.findUnique({
            where: { id },
            select: { userId: true, estado: true, delegadoId: true }
        })
        
        if (!existingPedido) {
            return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
        }

const isAdmin = userRole === "admin"
        const isEmpleado = userRole === "empleado"
        const isDelegado = isEmpleado && existingPedido.delegadoId === session.user.id
        const isOwner = existingPedido.userId === session.user.id

        // Validar permisos por rol
        if (isAdmin) {
            // Admin puede todo
        } else if (isEmpleado) {
            // Empleado solo puede si está delegado
            if (!isDelegado) {
                return NextResponse.json({ success: false, error: "No tienes este pedido asignado" }, { status: 403 })
            }
            
            // Empleado: puede actualizar metraje
            if (metrajeItemsArray) {
                // OK - puede agregar metraje
            } else if (estado === "rechazado") {
                if (!motivoRechazo || motivoRechazo.length < 5) {
                    return NextResponse.json({ success: false, error: "Motivo de rechazo requerido (mín. 5 caracteres)" }, { status: 400 })
                }
                if (motivoRechazo.length > 100) {
                    return NextResponse.json({ success: false, error: "Motivo máximo 100 caracteres" }, { status: 400 })
                }
            } else if (estado && !["metraje_confirmado", "pendiente"].includes(estado)) {
                return NextResponse.json({ success: false, error: "No puedes cambiar a este estado" }, { status: 403 })
            } else if (!estado && !metrajeItemsArray) {
                return NextResponse.json({ success: false, error: "No hay cambios para realizar" }, { status: 400 })
            }
        } else if (isOwner) {
            // Cliente puede agregar numeroOperacion para finalizar compra
            if (numeroOperacion) {
                // OK - puede agregar número de operación
            } else if (estado && !["pendiente", "confirmado"].includes(estado)) {
                return NextResponse.json({ success: false, error: "No puedes cambiar a este estado" }, { status: 403 })
            } else if (!estado && !numeroOperacion) {
                return NextResponse.json({ success: false, error: "No hay cambios para realizar" }, { status: 400 })
            }
        } else {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }
            
        const updateData: any = {}
        if (estado) updateData.estado = estado
        if (numeroOperacion) updateData.numeroOperacion = numeroOperacion
        if (motivoRechazo && estado === "rechazado") updateData.motivoRechazo = motivoRechazo
        
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
            for (const item of metrajeItemsArray) {
                if (item.detalleId && item.metraje > 0) {
                    await prisma.metrajeEtiqueta.create({
                        data: {
                            detalleId: item.detalleId,
                            valor: item.metraje
                        }
                    })
                }
            }
            
            let nuevoTotal = 0
            
            const piezaDetalles = await prisma.pedidoDetalle.findMany({
                where: { pedidoId: id, tipo: "pieza" },
                include: { 
                    producto: true,
                    etiquetas: { select: { valor: true } }
                }
            })
            
            for (const detalle of piezaDetalles) {
                const metrajeTotal = detalle.etiquetas.reduce((sum, e) => sum + e.valor, 0)
                const precioBase = Number(detalle.producto.precio)
                
                await prisma.pedidoDetalle.update({
                    where: { id: detalle.id },
                    data: { 
                        metraje: metrajeTotal,
                        cantidad: Math.ceil(metrajeTotal / 50),
                        precio: precioBase
                    }
                })
                
                nuevoTotal += precioBase * metrajeTotal
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
            const piezaDetalles = await prisma.pedidoDetalle.findMany({
                where: { pedidoId: id, tipo: "pieza" },
                include: { etiquetas: { select: { valor: true } } }
            })
            
            let nuevoTotal = 0
            for (const pieza of piezaDetalles) {
                const metrajeTotal = pieza.etiquetas.length > 0 
                    ? pieza.etiquetas.reduce((sum, e) => sum + e.valor, 0)
                    : (pieza.metraje || 0)
                if (metrajeTotal > 0) {
                    nuevoTotal += Number(pieza.precio) * metrajeTotal
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