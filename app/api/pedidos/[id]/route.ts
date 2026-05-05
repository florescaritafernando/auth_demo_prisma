import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth, enviarEmail } from "@/lib/auth"

function calculateCostoEnvio(subtotal: number, metodoEnvio?: string | null): number {
    if (!metodoEnvio || metodoEnvio === "tienda" || metodoEnvio === "retiro") return 0
    if (subtotal >= 9000) return 50
    if (subtotal >= 7000) return 40
    if (subtotal >= 5000) return 35
    if (subtotal >= 3000) return 30
    if (subtotal >= 1500) return 20
    if (subtotal >= 500) return 15
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

        const { estado, metraje_items, numeroOperacion, motivoRechazo, costoEnvio } = body

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

        // Verificar si el empleado está asignado al pedido
        const delegacion = await prisma.pedidoDelegado.findFirst({
            where: { pedidoId: id, userId: session.user.id }
        })

        const isAdmin = userRole === "admin"
        const isEmpleado = userRole === "empleado"
        const isDelegado = isEmpleado && delegacion !== null
        const isOwner = existingPedido.userId === session.user.id

        // Validar permisos por rol
        if (isAdmin) {
            // Admin puede todo pero no puede rechazar pedidos confirmados o completados
            if (estado === "rechazado" && (existingPedido.estado === "confirmado" || existingPedido.estado === "completado")) {
                return NextResponse.json({ success: false, error: "No puedes rechazar un pedido con pago confirmado o completado" }, { status: 400 })
            }
        } else if (isEmpleado) {
            // Empleado puede rechazar pedidos o actualizar metraje sin restricción de delegación
            if (estado === "rechazado") {
                if (existingPedido.estado === "confirmado" || existingPedido.estado === "completado") {
                    return NextResponse.json({ success: false, error: "No puedes rechazar un pedido con pago confirmado o completado" }, { status: 400 })
                }
                if (!motivoRechazo || motivoRechazo.length < 5) {
                    return NextResponse.json({ success: false, error: "Motivo de rechazo requerido (mín. 5 caracteres)" }, { status: 400 })
                }
                if (motivoRechazo.length > 100) {
                    return NextResponse.json({ success: false, error: "Motivo máximo 100 caracteres" }, { status: 400 })
                }
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
        if (costoEnvio !== undefined && (isAdmin || isEmpleado)) {
            if (typeof costoEnvio === "number" && costoEnvio >= 0) {
                // Si solo se actualiza costoEnvio, recalcular total = subtotal + costoEnvio
                const pedidoActual = await prisma.pedido.findUnique({
                    where: { id },
                    include: { pedidoDetalle: { include: { etiquetas: true } } }
                })

                if (pedidoActual && !metrajeItemsArray) {
                    let subtotal = 0
                    for (const detalle of pedidoActual.pedidoDetalle) {
                        if (detalle.tipo === "pieza") {
                            const metrajeTotal = detalle.etiquetas.reduce((sum, e) => sum + e.valor, 0)
                            subtotal += Number(detalle.precio) * metrajeTotal
                        } else {
                            subtotal += Number(detalle.precio) * detalle.cantidad
                        }
                    }
                    updateData.costoEnvio = costoEnvio
                    updateData.total = subtotal + costoEnvio
                } else {
                    updateData.costoEnvio = costoEnvio
                }
            }
        }

        const pedido = await prisma.pedido.update({
            where: { id },
            data: updateData
        })

        // Notificar cuando el cliente completa el pago (estado = pendiente)
        console.log("=== NOTIFICANDO PAGO PENDIENTE ===", { estado, numeroOperacion, pedidoId: id })
        if (estado === "pendiente" && numeroOperacion) {
            // Notificar a los empleados asignados si existen
            const delegados = await prisma.pedidoDelegado.findMany({
                where: { pedidoId: id },
                select: { userId: true }
            })

            for (const deleg of delegados) {
                console.log("Notificando al empleado:", deleg.userId)
                await prisma.notificacion.create({
                    data: {
                        userId: deleg.userId,
                        tipo: "pedido_pago",
                        titulo: "Pago en revisión",
                        mensaje: `El cliente del pedido ${pedido.numeroOrden} ha completado el pago. Número de operación: ${numeroOperacion}. Por favor, verifica el pago.`,
                        pedidoId: id
                    }
                })
            }

            // Notificar a todos los administradores
            const admins = await prisma.user.findMany({
                where: { role: "admin" },
                select: { id: true }
            })
            console.log("Administradores encontrados:", admins.length)

            for (const admin of admins) {
                console.log("Notificando al admin:", admin.id)
                await prisma.notificacion.create({
                    data: {
                        userId: admin.id,
                        tipo: "pedido_pago",
                        titulo: "Pago en revisión",
                        mensaje: `El cliente del pedido ${pedido.numeroOrden} ha completado el pago. Número de operación: ${numeroOperacion}. Por favor, verifica el pago.`,
                        pedidoId: id
                    }
                })
            }
            console.log("=== FIN NOTIFICACION PAGO ===")
        }

        if (estado === "rechazado") {
            const mensajeRechazo = pedido.motivoRechazo
                ? `Tu pedido ${pedido.numeroOrden} ha sido rechazado. Motivo: ${pedido.motivoRechazo}`
                : `Tu pedido ${pedido.numeroOrden} ha sido rechazado. Por favor, contacta con nuestro equipo al WhatsApp para más información.`

            await prisma.notificacion.create({
                data: {
                    userId: pedido.userId,
                    tipo: "pedido_estado",
                    titulo: "Pedido rechazado",
                    mensaje: mensajeRechazo,
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
                            valor: item.metraje,
                            userId: session.user.id
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
                // Validar que todos los detalles tipo pieza tengan etiquetas completas
                const piezaDetalles = await prisma.pedidoDetalle.findMany({
                    where: { pedidoId: id, tipo: "pieza" },
                    include: { etiquetas: true }
                })

                const todasPiezasCompletas = piezaDetalles.every(d =>
                    d.etiquetas.length === d.cantidad
                )

                if (todasPiezasCompletas) {
                    // Calcular nuevo total y costo de envío
                    let totalProductos = 0
                    for (const det of piezaDetalles) {
                        const metrajeTotal = det.etiquetas.length > 0
                            ? det.etiquetas.reduce((sum, e) => sum + e.valor, 0)
                            : (det.metraje || 0)
                        if (metrajeTotal > 0) {
                            totalProductos += Number(det.precio) * metrajeTotal
                        }
                    }

                    // Obtener los metros
                    const metrosDetalles = await prisma.pedidoDetalle.findMany({
                        where: { pedidoId: id, tipo: "metros" }
                    })

                    for (const det of metrosDetalles) {
                        totalProductos += Number(det.precio) * det.cantidad
                    }

                    const costoEnvio = calculateCostoEnvio(totalProductos, pedido.metodoEnvio)
                    const totalConEnvio = totalProductos + costoEnvio

                    await prisma.pedido.update({
                        where: { id },
                        data: {
                            estado: "metraje_confirmado",
                            total: totalConEnvio,
                            costoEnvio: costoEnvio
                        }
                    })

                    await prisma.notificacion.create({
                        data: {
                            userId: pedido.userId,
                            tipo: "metraje_confirmado",
                            titulo: "Metraje confirmado",
                            mensaje: `Tu pedido ${pedido.numeroOrden} ha sido actualizado. El metraje ha sido confirmado. Puedes continuar con el pago.`,
                            pedidoId: id
                        }
                    })

                }
            }
        } else if (estado === "metraje_confirmado" && existingPedido.estado === "metraje_en_proceso") {
            const piezaDetalles = await prisma.pedidoDetalle.findMany({
                where: { pedidoId: id, tipo: "pieza" },
                include: { etiquetas: { select: { valor: true } } }
            })

            let subtotalPiezas = 0
            for (const pieza of piezaDetalles) {
                const metrajeTotal = pieza.etiquetas.length > 0
                    ? pieza.etiquetas.reduce((sum, e) => sum + e.valor, 0)
                    : (pieza.metraje || 0)
                if (metrajeTotal > 0) {
                    subtotalPiezas += Number(pieza.precio) * metrajeTotal
                }
            }

            const metrosDetalles = await prisma.pedidoDetalle.findMany({
                where: { pedidoId: id, tipo: "metros" }
            })

            let subtotalMetros = 0
            for (const det of metrosDetalles) {
                subtotalMetros += Number(det.precio) * det.cantidad
            }

            const subtotal = subtotalPiezas + subtotalMetros

            if (subtotal > 0) {
                const costoEnvio = calculateCostoEnvio(subtotal, pedido.metodoEnvio)
                const totalConEnvio = subtotal + costoEnvio

                await prisma.pedido.update({
                    where: { id },
                    data: {
                        estado: "metraje_confirmado",
                        total: totalConEnvio,
                        costoEnvio: costoEnvio
                    }
                })

                const pedidoActualizado = await prisma.pedido.findUnique({ where: { id } })

                await prisma.notificacion.create({
                    data: {
                        userId: pedido.userId,
                        tipo: "metraje_confirmado",
                        titulo: "Metraje confirmado",
                        mensaje: `Tu pedido ${pedido.numeroOrden} ha sido actualizado. El metraje ha sido confirmado. Puedes continuar con el pago.`,
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