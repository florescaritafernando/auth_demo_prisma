import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({
            headers: headersList
        })
        
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        // Verificar que sea empleado o admin
        if (session.user.role !== "empleado" && session.user.role !== "admin") {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }

        const body = await request.json()
        
        const {
            empresa,
            metodoPago,
            cliente,
            agencia,
            guiaRemision,
            envioComprobante,
            costoEnvio,
            observaciones,
            items,
            estado: estadoFromBody
        } = body

        if (!cliente?.nombre || !cliente?.numeroDoc) {
            return NextResponse.json({ success: false, error: "Datos de cliente requeridos" }, { status: 400 })
        }

        if (!items || items.length === 0) {
            return NextResponse.json({ success: false, error: "Sin artículos" }, { status: 400 })
        }

        // Calcular total
        const subtotalRaw = items.reduce((sum: number, item: any) => {
            const precio = Number(item.precio) || 0
            const cantidad = Number(item.cantidad) || 0
            const metros = item.tipo === "pieza" ? 50 : 1
            return sum + (precio * cantidad * metros)
        }, 0)
        const subtotal = Math.round(subtotalRaw * 100) / 100

        const totalRaw = subtotal + (Number(costoEnvio) || 0)
        const total = Math.round(totalRaw * 100) / 100

        // Determinar estado según tipo de artículos
        const tienePiezas = items.some((item: any) => item.tipo === "pieza")
        const estado = estadoFromBody || (tienePiezas ? "metraje_en_proceso" : "pendiente")

        // Upsert cliente_pedido por nombre + numeroDoc
        const clientePedido = await prisma.clientePedido.upsert({
            where: {
                nombre_numeroDoc: {
                    nombre: cliente.nombre,
                    numeroDoc: cliente.numeroDoc
                }
            },
            update: {
                tipoDoc: cliente.tipoDoc || "dni",
                razonSocial: cliente.razonSocial || null,
                direccion: cliente.direccion || null,
                telefono: cliente.telefono || null,
                agencia: agencia || null,
                agenciaOtro: agencia === "otros" ? cliente.agenciaOtro : null,
                guiaRemision: guiaRemision || false,
                departamento: cliente.departamento || null,
                provincia: cliente.provincia || null,
                distrito: cliente.distrito || null
            },
            create: {
                nombre: cliente.nombre,
                tipoDoc: cliente.tipoDoc || "dni",
                numeroDoc: cliente.numeroDoc,
                razonSocial: cliente.razonSocial || null,
                direccion: cliente.direccion || null,
                telefono: cliente.telefono || null,
                agencia: agencia || null,
                agenciaOtro: agencia === "otros" ? cliente.agenciaOtro : null,
                guiaRemision: guiaRemision || false,
                departamento: cliente.departamento || null,
                provincia: cliente.provincia || null,
                distrito: cliente.distrito || null
            }
        })

        // Obtener último número de orden
        const ultimoPedido = await prisma.pedido.findFirst({
            orderBy: { createdAt: "desc" }
        })
        
        const year = new Date().getFullYear()
        const numSeq = ultimoPedido ? parseInt(ultimoPedido.numeroOrden?.split("-").pop() || "0") + 1 : 1
        const numeroOrden = `ORD-${year}-${String(numSeq).padStart(4, "0")}`

        // Crear pedido - siempre asignar al empleado que crea
        const pedido = await prisma.pedido.create({
            data: {
                userId: session.user.id, // El empleado que crea el pedido
                numeroOrden,
                estado: estado,
                total,
                tipoDocumento: cliente.tipoDoc || "dni",
                numeroDoc: cliente.numeroDoc,
                nombreFactura: cliente.nombre,
                direccion: cliente.direccion || "",
                metodoEnvio: agencia ? "agencia" : null,
                agencia: agencia || null,
                agenciaOtro: agencia === "otros" ? cliente.agenciaOtro : null,
                costoEnvio: Number(costoEnvio) || 0,
                notas: observaciones || null,
                clientePedidoId: clientePedido.id,
                pedidoDetalle: {
                    create: items.map((item: any) => ({
                        productoId: item.productoId,
                        cantidad: Number(item.cantidad),
                        tipo: item.tipo || "metros",
                        precio: Number(item.precio),
                        indicacionesCorte: item.indicacionesCorte || null
                    }))
                },
                pedidoEmpleadoInfo: {
                    create: {
                        empresa: empresa || null,
                        metodoPago: metodoPago || null,
                        telefono: cliente.telefono || null,
                        guiaRemision: guiaRemision || false,
                        envioComprobante: envioComprobante || "No imprimir"
                    }
                }
            },
            include: {
                pedidoDetalle: {
                    include: {
                        producto: true
                    }
                },
                user: true
            }
        })

        // Notificar a staff - solo si el pedido NO fue creado por empleado/admin
        // (pedidos de clientes normales sí generan notificación)
        // Como esta ruta solo la usan empleados/admin, NO creamos notificaciones aquí
        // Las notificaciones se generan en /api/pedidos para pedidos de clientes

        // Auto-asignar empleado como delegado del pedido
        await prisma.pedidoDelegado.create({
            data: {
                pedidoId: pedido.id,
                userId: session.user.id
            }
        })

        return NextResponse.json({ 
            success: true, 
            pedido: {
                id: pedido.id,
                numeroOrden: pedido.numeroOrden,
                total: pedido.total,
                createdAt: pedido.createdAt
            }
        })
    } catch (error: any) {
        console.error("Error creando pedido de colaborador:", error)
        return NextResponse.json({ success: false, error: "Error interno: " + error.message }, { status: 500 })
    }
}