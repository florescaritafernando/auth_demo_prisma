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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        if (session.user.role !== "empleado" && session.user.role !== "admin") {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()

        const { empresa, metodoPago, cliente, agencia, guiaRemision, nombreRecibe, dniRecibe, celularRecibe, envioComprobante, costoEnvio, observaciones, items } = body

        if (!items || items.length === 0) {
            return NextResponse.json({ success: false, error: "Sin artículos" }, { status: 400 })
        }

        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: { delegados: true }
        })

        if (!pedido) {
            return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        if (pedido.userId !== session.user.id && session.user.role !== "admin") {
            return NextResponse.json({ success: false, error: "No eres el creador de este pedido" }, { status: 403 })
        }

        // Obtener detalles existentes con sus etiquetas
        const existingDetalles = await prisma.pedidoDetalle.findMany({
            where: { pedidoId: id },
            include: { etiquetas: { select: { id: true } } }
        })
        const existingMap = new Map(existingDetalles.map(d => [d.id, d]))

        // Separar items entrantes: los que tienen detalleId válido → UPDATE, los demás → CREATE
        const toUpdate: any[] = []
        const toCreate: any[] = []
        for (const item of items) {
            if (item.detalleId && existingMap.has(item.detalleId)) {
                toUpdate.push(item)
            } else {
                toCreate.push(item)
            }
        }

        const incomingIds = new Set(toUpdate.map((i: any) => i.detalleId))

        // Items a preservar (tienen etiquetas, no están en la lista entrante)
        const toPreserve = existingDetalles.filter(
            d => !incomingIds.has(d.id) && d.etiquetas.length > 0
        )
        // Items a eliminar (sin etiquetas, no están en la lista entrante)
        const toDelete = existingDetalles.filter(
            d => !incomingIds.has(d.id) && d.etiquetas.length === 0
        )

        // Calcular subtotal incluyendo items preservados + actualizados + nuevos
        let subtotalRaw = 0

        for (const item of [...toUpdate, ...toCreate]) {
            const precio = Number(item.precio) || 0
            const cantidad = Number(item.cantidad) || 0
            const metros = item.tipo === "pieza" ? 50 : 1
            subtotalRaw += precio * cantidad * metros
        }
        for (const det of toPreserve) {
            const precio = Number(det.precio) || 0
            const cantidad = Number(det.cantidad) || 0
            const metros = det.tipo === "pieza" ? 50 : 1
            subtotalRaw += precio * cantidad * metros
        }

        const subtotal = Math.round(subtotalRaw * 100) / 100
        const totalRaw = subtotal + (Number(costoEnvio) || 0)
        const total = Math.round(totalRaw * 100) / 100

        // Eliminar items que ya no están y no tienen etiquetas
        if (toDelete.length > 0) {
            await prisma.pedidoDetalle.deleteMany({
                where: { id: { in: toDelete.map(d => d.id) } }
            })
        }

        // Actualizar items existentes
        for (const item of toUpdate) {
            await prisma.pedidoDetalle.update({
                where: { id: item.detalleId },
                data: {
                    cantidad: Number(item.cantidad),
                    precio: Number(item.precio),
                    indicacionesCorte: item.indicacionesCorte || null
                }
            })
        }

        const updated = await prisma.pedido.update({
            where: { id },
            data: {
                total,
                tipoDocumento: cliente?.tipoDoc || pedido.tipoDocumento,
                numeroDoc: cliente?.numeroDoc || pedido.numeroDoc,
                nombreFactura: cliente?.nombre || pedido.nombreFactura,
                direccion: cliente?.direccion || pedido.direccion,
                departamento: cliente?.departamento || null,
                provincia: cliente?.provincia || null,
                distrito: cliente?.distrito || null,
                nombreRecibe: nombreRecibe || null,
                dniRecibe: dniRecibe || null,
                celularRecibe: celularRecibe || null,
                metodoEnvio: agencia ? "agencia" : pedido.metodoEnvio,
                agencia: agencia || null,
                agenciaOtro: agencia === "otros" ? cliente?.agenciaOtro : null,
                costoEnvio: Number(costoEnvio) || 0,
                notas: observaciones || null,
                ...(toCreate.length > 0 ? {
                    pedidoDetalle: {
                        create: toCreate.map((item: any) => ({
                            productoId: item.productoId,
                            cantidad: Number(item.cantidad),
                            tipo: item.tipo || "metros",
                            precio: Number(item.precio),
                            indicacionesCorte: item.indicacionesCorte || null
                        }))
                    }
                } : {}),
                pedidoEmpleadoInfo: {
                    upsert: {
                        create: {
                            empresa: empresa || null,
                            metodoPago: metodoPago || null,
                            telefono: cliente?.telefono || null,
                            guiaRemision: guiaRemision || false,
                            envioComprobante: envioComprobante || "No imprimir"
                        },
                        update: {
                            empresa: empresa || null,
                            metodoPago: metodoPago || null,
                            telefono: cliente?.telefono || null,
                            guiaRemision: guiaRemision || false,
                            envioComprobante: envioComprobante || "No imprimir"
                        }
                    }
                }
            },
            include: {
                pedidoDetalle: { include: { producto: true } }
            }
        })

        // Si se agregaron nuevos artículos tipo metros y el estado era "confirmado",
        // retroceder a "pendiente" para que puedan pagar la diferencia
        if (toCreate.some((item: any) => item.tipo === "metros") && pedido.estado === "confirmado") {
            await prisma.pedido.update({
                where: { id },
                data: { estado: "pendiente" }
            })
        }

        // Si se agregaron nuevos artículos tipo pieza y el estado requería metraje,
        // retroceder a "metraje_en_proceso" para que el empleado pueda registrar metraje
        if (toCreate.some((item: any) => item.tipo === "pieza") && ["metraje_confirmado", "pendiente", "confirmado"].includes(pedido.estado)) {
            await prisma.pedido.update({
                where: { id },
                data: { estado: "metraje_en_proceso" }
            })
        }

        return NextResponse.json({ success: true, pedido: updated })
    } catch (error: any) {
        console.error("Error actualizando pedido:", error)
        return NextResponse.json({ success: false, error: "Error interno: " + error.message }, { status: 500 })
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

        const { estado, metraje_items, numeroOperacion, motivoRechazo, costoEnvio, comprobantePago, notas } = body

        const estadosValidos = ["metraje_en_proceso", "metraje_confirmado", "pendiente", "confirmado", "pedido_enviado", "rechazado", "completado"]

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
            // Validar que empleado esté asignado para cambiar a pedido_enviado
            if (estado === "pedido_enviado") {
                const delegacion = await prisma.pedidoDelegado.findFirst({
                    where: { pedidoId: id, userId: session.user.id }
                })
                if (!delegacion) {
                    return NextResponse.json({ success: false, error: "No puedes cambiar el estado de un pedido al que no estás asignado" }, { status: 403 })
                }
            }

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
        if (comprobantePago !== undefined) updateData.comprobantePago = comprobantePago
        if (motivoRechazo && estado === "rechazado") updateData.motivoRechazo = motivoRechazo
        if (notas !== undefined) updateData.notas = notas
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

        // No generar notificaciones para pedidos creados por empleados/admin
        const pedidoEmpleadoInfo = await prisma.pedidoEmpleadoInfo.findUnique({ where: { pedidoId: id } })
        const esPedidoDeStaff = !!pedidoEmpleadoInfo

        if (!esPedidoDeStaff) {
        // Notificar cuando el cliente completa el pago (estado = pendiente)
        console.log("=== NOTIFICANDO PAGO PENDIENTE ===", { estado, numeroOperacion, comprobantePago, pedidoId: id })
        if (estado === "pendiente" && (numeroOperacion || comprobantePago)) {
            // Construir mensaje de notificación
            let mensajePago = ""
            if (comprobantePago) {
                mensajePago = `El cliente del pedido ${pedido.numeroOrden} ha subido un comprobante de pago. Por favor, verifica el pago.`
            } else if (numeroOperacion) {
                mensajePago = `El cliente del pedido ${pedido.numeroOrden} ha completado el pago. Número de operación: ${numeroOperacion}. Por favor, verifica el pago.`
            }

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
                        mensaje: mensajePago,
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
                        mensaje: mensajePago,
                        pedidoId: id
                    }
                })
            }
            console.log("=== FIN NOTIFICACION PAGO ===")

            // Marcar notificaciones anteriores del cliente como leídas al realizar el pago
            await prisma.notificacion.updateMany({
                where: {
                    userId: pedido.userId,
                    pedidoId: id,
                    leida: false
                },
                data: { leida: true }
            })
        }

        if (estado === "confirmado") {
            await prisma.notificacion.create({
                data: {
                    userId: pedido.userId,
                    tipo: "pedido_estado",
                    titulo: "Pago confirmado",
                    mensaje: `Tu pedido ${pedido.numeroOrden} ha sido confirmado. Estamos preparando tu pedido para el envío y te avisaremos cuando esté en camino.`,
                    pedidoId: id
                }
            })

            await prisma.notificacion.updateMany({
                where: {
                    pedidoId: id,
                    tipo: "pedido_pago",
                    leida: false
                },
                data: { leida: true }
            })

            const delegados = await prisma.pedidoDelegado.findMany({
                where: { pedidoId: id },
                select: { userId: true }
            })

            for (const deleg of delegados) {
                await prisma.notificacion.create({
                    data: {
                        userId: deleg.userId,
                        tipo: "pedido_estado",
                        titulo: "Pago confirmado",
                        mensaje: `El pedido ${pedido.numeroOrden} ha sido confirmado. El pago ha sido verificado exitosamente.`,
                        pedidoId: id
                    }
                })
            }
        }

        if (estado === "pedido_enviado") {
            await prisma.notificacion.create({
                data: {
                    userId: pedido.userId,
                    tipo: "pedido_estado",
                    titulo: "Pedido enviado",
                    mensaje: `Tu pedido ${pedido.numeroOrden} ha sido enviado. Por favor, confirma cuando lo recibas.`,
                    pedidoId: id
                }
            })
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

        }

        // Notificar a administradores cuando un pedido de empleado cambia a confirmado
        if (esPedidoDeStaff && estado === "confirmado") {
            const empleadoNombre = session.user.name || session.user.email || "Empleado"
            const admins = await prisma.user.findMany({
                where: { role: "admin" },
                select: { id: true }
            })
            for (const admin of admins) {
                await prisma.notificacion.create({
                    data: {
                        userId: admin.id,
                        tipo: "pedido_estado",
                        titulo: "Pago confirmado",
                        mensaje: `Pedido ${pedido.numeroOrden} confirmado por ${empleadoNombre}.`,
                        pedidoId: id
                    }
                })
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

            const nuevoTotalRedondeado = Math.round(nuevoTotal * 100) / 100
            const costoEnvio = calculateCostoEnvio(nuevoTotalRedondeado, pedido.metodoEnvio || "agencia")
            const totalConEnvioRaw = nuevoTotalRedondeado + costoEnvio
            const totalConEnvio = Math.round(totalConEnvioRaw * 100) / 100

            await prisma.pedido.update({
                where: { id },
                data: {
                    total: totalConEnvio,
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
                    const totalConEnvioRaw = totalProductos + costoEnvio
                    const totalConEnvio = Math.round(totalConEnvioRaw * 100) / 100

                    await prisma.pedido.update({
                        where: { id },
                        data: {
                            estado: esPedidoDeStaff ? "pendiente" : "metraje_confirmado",
                            total: totalConEnvio,
                            costoEnvio: costoEnvio
                        }
                    })

                    if (!esPedidoDeStaff) {
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
            const subtotalRedondeado = Math.round(subtotal * 100) / 100

            if (subtotalRedondeado > 0) {
                const costoEnvio = calculateCostoEnvio(subtotalRedondeado, pedido.metodoEnvio)
                const totalConEnvioRaw = subtotalRedondeado + costoEnvio
                const totalConEnvio = Math.round(totalConEnvioRaw * 100) / 100

                await prisma.pedido.update({
                    where: { id },
                    data: {
                        estado: esPedidoDeStaff ? "pendiente" : "metraje_confirmado",
                        total: totalConEnvio,
                        costoEnvio: costoEnvio
                    }
                })

                const pedidoActualizado = await prisma.pedido.findUnique({ where: { id } })

                if (!esPedidoDeStaff) {
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