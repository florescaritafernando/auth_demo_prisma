import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const headersList = await headers()
        console.log("API pedidos headers:", headersList.toString().substring(0, 100))
        
        const session = await auth.api.getSession({ headers: headersList })
        
        if (!session?.user) {
            console.log("No session in API")
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        console.log("Session user:", session.user.id, session.user.email)

        const userRole = (session.user as any)?.role || "cliente"
        let pedidos

        if (userRole === "admin") {
            pedidos = await prisma.pedido.findMany({
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    pedidoDetalle: {
                        include: { producto: { select: { id: true, nombre: true, categoria: true } } }
                    }
                },
                orderBy: { createdAt: "desc" }
            })
        } else {
            pedidos = await prisma.pedido.findMany({
                where: { userId: session.user.id },
                include: {
                    pedidoDetalle: {
                        include: { producto: { select: { id: true, nombre: true, categoria: true } } }
                    }
                },
                orderBy: { createdAt: "desc" }
            })
        }

        return NextResponse.json({ success: true, pedidos })
    } catch (error: any) {
        console.error("GET pedidos error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    let session
    try {
        const headersList = new Headers(request.headers)
        session = await auth.api.getSession({ headers: headersList })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }
    
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

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

    const { 
        tipoDocumento, numeroDoc, nombreFactura, direccion, ciudad,
        metodoEnvio, agencia, agenciaOtro, dniRecibe, nombreRecibe, celularRecibe,
        numeroOperacion, items 
    } = body

    if (!items || items.length === 0) {
        return NextResponse.json({ success: false, error: "Carrito vacío" }, { status: 400 })
    }

    const itemsArray = typeof items === "string" ? JSON.parse(items) : items

    // Check if there are items with tipo="pieza"
    const tienePiezas = itemsArray.some((item: any) => item.tipo === "pieza")
    
    // Default nro operación for pending meterage
    const numeroOperacionFinal = numeroOperacion || "012345678"
    
    // Calculate total - for pieza we use 50 metros per piece for estimation
    const costoEnvio = calculateCostoEnvio(itemsArray, metodoEnvio)
    const total = calculateTotal(itemsArray) + costoEnvio

    // Determine estado based on meterage
    const estadoInicial = tienePiezas ? "metraje_en_proceso" : "pendiente"

    const ultimoPedido = await prisma.pedido.findFirst({
        orderBy: { createdAt: "desc" }
    })

    const year = new Date().getFullYear()
    const numSeq = ultimoPedido ? parseInt(ultimoPedido.numeroOrden?.split("-").pop() || "0") + 1 : 1
    const numeroOrden = `ORD-${year}-${String(numSeq).padStart(4, "0")}`

    try {
        const mensaje = tienePiezas 
            ? "Orden pendiente de pago creada: Metraje de piezas por actualizar. Estaremos trabajando para continuar con su pedido, gracias."
            : null

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
                ciudad,
                metodoEnvio,
                agencia,
                agenciaOtro,
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
                        precio: item.precio
                    }))
                }
            },
            include: {
                pedidoDetalle: true
            }
        })

        await prisma.carrito.deleteMany({
            where: { userId: session.user.id }
        })

        if (tipoDocumento && numeroDoc) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    tipoDocumento,
                    numeroDoc,
                    direccion,
                    ciudad
                }
            })
        }

        return NextResponse.json({ 
            success: true, 
            pedido,
            mensaje: mensaje,
            tienePiezas: tienePiezas
        })
    } catch (error: any) {
        console.error("Create pedido error:", error)
        return NextResponse.json({ success: false, error: "Error al crear pedido" }, { status: 500 })
    }
}

function calculateCostoEnvio(items: any[], metodoEnvio?: string): number {
    if (metodoEnvio === "retiro") return 0
    
    const subtotal = calculateTotal(items)
    
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