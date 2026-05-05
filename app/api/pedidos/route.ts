import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })
        const { searchParams } = new URL(request.url)
        const misPedidos = searchParams.get("mis") === "true"

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const userRole = (session.user as any)?.role || "cliente"
        let pedidos

        if (userRole === "admin") {
            pedidos = await prisma.pedido.findMany({
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    pedidoDetalle: {
                        include: { producto: { select: { id: true, nombre: true, categoria: true } } }
                    },
                    delegados: {
                        include: { user: { select: { id: true, name: true } } }
                    },
                    tienda: true
                },
                orderBy: { createdAt: "desc" }
            })
        } else if (userRole === "empleado" && misPedidos) {
            // Obtener los pedidos donde el empleado está asignado
            const delegaciones = await prisma.pedidoDelegado.findMany({
                where: { userId: session.user.id },
                select: { pedidoId: true }
            })
            const pedidoIds = delegaciones.map(d => d.pedidoId)

            pedidos = await prisma.pedido.findMany({
                where: { id: { in: pedidoIds } },
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    pedidoDetalle: {
                        include: { producto: { select: { id: true, nombre: true, categoria: true } } }
                    },
                    tienda: true
                },
                orderBy: { createdAt: "desc" }
            })
        } else {
            pedidos = await prisma.pedido.findMany({
                where: { userId: session.user.id },
                include: {
                    pedidoDetalle: {
                        include: { producto: { select: { id: true, nombre: true, categoria: true } } }
                    },
                    tienda: true
                },
                orderBy: { createdAt: "desc" }
            })
        }

        // Calculate subtotal from pedidoDetalle if not stored
        const pedidosWithSubtotal = pedidos.map(pedido => {
            const calculatedSubtotal = pedido.pedidoDetalle?.reduce((sum: number, detalle: any) => {
                const cantidad = detalle.metraje || detalle.cantidad
                return sum + (cantidad * detalle.precio)
            }, 0) || 0
            return {
                ...pedido,
                subtotal: calculatedSubtotal
            }
        })

        return NextResponse.json({ success: true, pedidos: pedidosWithSubtotal })
    } catch (error: any) {
        console.error("GET pedidos error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    console.log("=== INICIO POST /api/pedidos ===")

    try {
        console.log("1. Obteniendo sesion...")
        const headersList = new Headers(request.headers)
        const session = await auth.api.getSession({ headers: headersList })
        console.log("Session:", session?.user?.id || "SIN SESION")

        if (!session?.user) {
            console.log("ERROR: No autorizado")
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        // Any logged-in user can create a pedido (cliente, empleado, admin)
        const role = (session.user as any)?.role || "cliente"

        console.log("2. Parseando body...")
        const body = await request.json()
        console.log("Body keys:", Object.keys(body))

        const {
            tipoDocumento, numeroDoc, nombreFactura, direccion,
            departamento, provincia, distrito,
            metodoEnvio, tiendaId, tipoEnvio, agencia, agenciaOtro, delivery, deliveryOtro,
            dniRecibe, nombreRecibe, celularRecibe,
            numeroOperacion, items
        } = body

        if (!items || items.length === 0) {
            console.log("ERROR: Carrito vacio")
            return NextResponse.json({ success: false, error: "Carrito vacio" }, { status: 400 })
        }

        const itemsArray = typeof items === "string" ? JSON.parse(items) : items
        console.log("Items:", itemsArray.length)

        const tienePiezas = itemsArray.some((item: any) => item.tipo === "pieza")
        console.log("Tiene piezas:", tienePiezas)

        const numeroOperacionFinal = numeroOperacion || "012345678"

        const costoEnvio = calculateCostoEnvio(itemsArray, metodoEnvio)
        const total = calculateTotal(itemsArray) + costoEnvio
        console.log("Total:", total)

        const estadoInicial = tienePiezas ? "metraje_en_proceso" : "pendiente"

        const ultimoPedido = await prisma.pedido.findFirst({
            orderBy: { createdAt: "desc" }
        })

        const year = new Date().getFullYear()
        const numSeq = ultimoPedido ? parseInt(ultimoPedido.numeroOrden?.split("-").pop() || "0") + 1 : 1
        const numeroOrden = `ORD-${year}-${String(numSeq).padStart(4, "0")}`
        console.log("Numero orden:", numeroOrden)

        console.log("3. Creando pedido...")
        const pedido = await prisma.pedido.create({
            data: {
                userId: session.user.id,
                numeroOrden,
                estado: estadoInicial,
                total,
                tipoDocumento,
                numeroDoc,
                nombreFactura,
                direccion,
                departamento,
                provincia,
                distrito,
                metodoEnvio,
                tiendaId,
                tipoEnvio,
                agencia,
                agenciaOtro,
                delivery,
                deliveryOtro,
                costoEnvio,
                dniRecibe,
                nombreRecibe,
                celularRecibe,
                numeroOperacion: numeroOperacionFinal,
                pedidoDetalle: {
                    create: itemsArray.map((item: any) => ({
                        productoId: item.productoId,
                        cantidad: item.cantidad,
                        tipo: item.tipo,
                        precio: item.precio,
                        indicacionesCorte: item.indicacionesCorte || null
                    }))
                }
            },
            include: { pedidoDetalle: true }
        })
        console.log("Pedido creado:", pedido.id)

        await prisma.carrito.deleteMany({
            where: { userId: session.user.id }
        })

        if (tipoDocumento && numeroDoc) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { tipoDocumento, numeroDoc, direccion }
            })
        }

        console.log("=== PEDIDO CREADO EXITOSAMENTE ===")

        const staff = await prisma.user.findMany({
            where: { role: { in: ["admin", "empleado"] } }
        })

        await prisma.notificacion.createMany({
            data: staff.map(user => ({
                userId: user.id,
                titulo: "Nueva orden",
                mensaje: `Nueva orden ${numeroOrden} por ${session.user.name || session.user.email}`,
                tipo: "pedido",
                pedidoId: pedido.id
            }))
        })

        return NextResponse.json({
            success: true,
            pedido,
            mensaje: tienePiezas ? "Orden creada. Piezas en proceso de metraje." : null,
            tienePiezas
        })
    } catch (error: any) {
        console.error("ERROR en POST:", error.message, error.stack)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

function calculateCostoEnvio(items: any[], metodoEnvio?: string): number {
    if (metodoEnvio === "tienda" || metodoEnvio === "retiro") return 0
    const subtotal = calculateTotal(items)
    if (subtotal >= 9000) return 50
    if (subtotal >= 7000) return 40
    if (subtotal >= 5000) return 35
    if (subtotal >= 3000) return 30
    if (subtotal >= 1500) return 20
    if (subtotal >= 500) return 15
    return 10
}

function calculateTotal(items: any[]): number {
    return items.reduce((sum, item) => {
        const precio = Number(item.precio)
        const cantidad = Number(item.cantidad)
        const tipo = item.tipo
        const metrosPorPieza = 50
        if (tipo === "pieza") {
            return sum + (precio * cantidad * metrosPorPieza)
        }
        return sum + (precio * cantidad)
    }, 0)
}