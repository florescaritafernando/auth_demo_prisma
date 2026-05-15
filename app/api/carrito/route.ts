import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({
            headers: headersList
        })
        
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const items = await prisma.carrito.findMany({
            where: { userId: session.user.id },
            include: { 
                producto: {
                    include: {
                        stocks: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        const metrosPorPieza = 50
        const itemsWithTotal = items.map(item => {
            const totalStock = item.producto.stocks.reduce((sum, s) => sum + s.stock, 0)
            const metrosPorPieza = 50
            const cantidadMetros = item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad
            const precioPorMetro = Number(item.producto.precio)
            const precioUnitario = item.tipo === "pieza" ? precioPorMetro * metrosPorPieza : precioPorMetro
            const precioTotal = item.tipo === "pieza" ? item.cantidad * precioPorMetro * metrosPorPieza : item.cantidad * precioPorMetro
            const precioTotalXPieza = item.tipo === "pieza" ? item.cantidad * precioPorMetro : 0
            return {
                ...item,
                cantidadMetros,
                tipoLabel: item.tipo === "metros" ? "Por metros" : "Por piezas",
                metrosPorPieza,
                precioUnitario,
                precioTotal,
                precioTotalXPieza
            }
        })

        const total = items.reduce((sum, item) => {
            const precioPorMetro = Number(item.producto.precio)
            const itemTotal = item.tipo === "pieza" ? item.cantidad * precioPorMetro * metrosPorPieza : item.cantidad * precioPorMetro
            return sum + itemTotal
        }, 0)

        return NextResponse.json({ success: true, items: itemsWithTotal, total })
    } catch (error: any) {
        console.error("GET carrito error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    let session
    try {
        const incomingHeaders = new Headers(request.headers)
        session = await auth.api.getSession({
            headers: incomingHeaders
        })
    } catch (e: any) {
        console.error("Session error:", e.message)
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }
    
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    let body
    let action, productoId, cantidad, tipo, direccion, notas, carritoId, nuevaCantidad
    
    const contentType = request.headers.get("content-type") || ""
    
    if (contentType.includes("application/json")) {
        try {
            body = await request.json()
        } catch (e: any) {
            console.error("JSON parse error:", e.message)
            return NextResponse.json({ success: false, error: "Datos inválidos" }, { status: 400 })
        }
        ;({ action, productoId, cantidad, tipo, direccion, notas, carritoId, cantidad: nuevaCantidad } = body)
    } else {
        const formData = await request.formData()
        action = formData.get("action") as string
        productoId = formData.get("productoId") as string
        cantidad = formData.get("cantidad") ? Number(formData.get("cantidad")) : undefined
        tipo = formData.get("tipo") as string
        direccion = formData.get("direccion") as string
        notas = formData.get("notas") as string
        carritoId = formData.get("carritoId") as string
        nuevaCantidad = formData.get("cantidad") ? Number(formData.get("cantidad")) : undefined
    }
    
    console.log("Carrito POST action:", action)

    try {
        switch (action) {
            case "agregar": {
                if (!productoId) {
                    return NextResponse.json({ success: false, error: "Producto requerido" }, { status: 400 })
                }

                if (!cantidad || cantidad <= 0) {
                    return NextResponse.json({ success: false, error: "Cantidad inválida" }, { status: 400 })
                }

                const tipoRecibido = tipo || "metros"
                console.log("Agregar pedido:", { productoId, cantidad, tipo: tipoRecibido })

                // Get product info
                const producto = await prisma.producto.findUnique({
                    where: { id: productoId },
                    include: { stocks: true }
                })

                if (!producto) {
                    return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 })
                }

                // Calculate total stock (stock field = number of pieces, each piece = 50 meters)
                const metrosPorPieza = 50
                const totalStockMetros = producto.stocks.reduce((sum, s) => sum + (s.stock * metrosPorPieza), 0)
                console.log("Stock total metros:", totalStockMetros, "stocks:", producto.stocks)
                
                const esPieza = tipoRecibido === "pieza"
                
                // cantidad means pieces or meters - convert all to metros for stock check
                const cantidadEnMetros = esPieza ? cantidad * metrosPorPieza : cantidad
                
                console.log("Checking:", { cantidad, cantidadEnMetros, esPieza, totalStockMetros })

                // Get existing item in cart using the composite unique constraint
                const existente = await prisma.carrito.findUnique({
                    where: {
                        userId_productoId_tipo: {
                            userId: session.user.id,
                            productoId,
                            tipo: tipoRecibido
                        }
                    }
                })

                const currentQtyMetros = existente ? 
                    (existente.tipo === "pieza" ? existente.cantidad * metrosPorPieza : existente.cantidad) 
                    : 0
                
                const newTotalMetros = currentQtyMetros + cantidadEnMetros

                console.log("Stock check:", { currentQtyMetros, newTotalMetros, totalStockMetros })

                // Check stock
                if (newTotalMetros > totalStockMetros) {
                    return NextResponse.json({ 
                        success: false, 
                        error: "Stock insuficiente" 
                    }, { status: 400 })
                }

                const finalCantidad = cantidad
                
                if (existente) {
                    await prisma.carrito.update({
                        where: { id: existente.id },
                        data: { 
                            cantidad: existente.cantidad + finalCantidad,
                            tipo: tipo || "metros"
                        }
                    })
                } else {
                    await prisma.carrito.create({
                        data: {
                            userId: session.user.id,
                            productoId,
                            cantidad: finalCantidad,
                            tipo: tipo || "metros"
                        }
                    })
                }

                console.log("Guardando en BD - existente:", !!existente, "cantidad:", finalCantidad)
                return NextResponse.json({ success: true, debug: { existente: !!existente, cantidad: finalCantidad } })
            }

            case "eliminar": {
                if (!carritoId) {
                    return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 })
                }

                await prisma.carrito.delete({
                    where: { id: carritoId }
                })

const items = await prisma.carrito.findMany({
            where: { userId: session.user.id },
            include: { producto: { include: { stocks: true } } },
            orderBy: { createdAt: "desc" }
        })

const metrosPorPieza = 50
        const itemsWithTotal = items.map(item => {
            const precioPorMetro = Number(item.producto.precio)
            const precioUnitario = item.tipo === "pieza" ? precioPorMetro * metrosPorPieza : precioPorMetro
            const precioTotal = item.tipo === "pieza" ? item.cantidad * precioPorMetro * metrosPorPieza : item.cantidad * precioPorMetro
            const precioTotalXPieza = item.tipo === "pieza" ? item.cantidad * precioPorMetro : 0
            return {
                ...item,
                cantidadMetros: item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad,
                tipoLabel: item.tipo === "pieza" ? "Por pieza" : "Por metro",
                metrosPorPieza,
                precioUnitario,
                precioTotal,
                precioTotalXPieza
            }
        })

                const total = itemsWithTotal.reduce((sum, item) => sum + item.precioTotal, 0)

                return NextResponse.json({ success: true, items: itemsWithTotal, total })
            }

            case "actualizar": {
                if (!carritoId || nuevaCantidad === undefined) {
                    return NextResponse.json({ success: false, error: "Datos requeridos" }, { status: 400 })
                }

                if (nuevaCantidad <= 0) {
                    await prisma.carrito.delete({
                        where: { id: carritoId }
                    })
                } else {
                    await prisma.carrito.update({
                        where: { id: carritoId },
                        data: { cantidad: nuevaCantidad }
                    })
                }

                return NextResponse.json({ success: true })
            }

            case "actualizarIndicaciones": {
                const { indicacionesCorte } = body
                if (!carritoId) {
                    return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 })
                }

                await prisma.carrito.update({
                    where: { id: carritoId },
                    data: { indicacionesCorte: indicacionesCorte || null }
                })

                return NextResponse.json({ success: true })
            }

            case "checkout": {
                if (!body || typeof body !== "object") {
                    return NextResponse.json({ success: false, error: "Datos requeridos" }, { status: 400 })
                }
                
                console.log("Checkout body:", JSON.stringify(body).substring(0, 200))
                
                const items = await prisma.carrito.findMany({
                    where: { userId: session.user.id },
                    include: { producto: { include: { stocks: true } } }
                })

                if (items.length === 0) {
                    return NextResponse.json({ success: false, error: "El carrito está vacío" }, { status: 400 })
                }

                const { direccion, notas } = body

                const total = items.reduce((sum, item) => {
                    const precioUnit = item.tipo === "pieza" ? Number(item.producto.precio) * 50 : Number(item.producto.precio)
                    return sum + (precioUnit * item.cantidad)
                }, 0)

                const ultimoPedido = await prisma.pedido.findFirst({
                    orderBy: { createdAt: "desc" }
                })
                const year = new Date().getFullYear()
                const numSeq = ultimoPedido ? parseInt(ultimoPedido.numeroOrden?.split("-").pop() || "0") + 1 : 1
                const numeroOrden = `ORD-${year}-${String(numSeq).padStart(4, "0")}`

                const pedido = await prisma.pedido.create({
                    data: {
                        userId: session.user.id,
                        numeroOrden,
                        direccion: direccion || "",
                        notas: notas || "",
                        total,
                        estado: "pendiente",
                        pedidoDetalle: {
                            create: items.map(item => ({
                                productoId: item.productoId,
                                cantidad: item.cantidad,
                                tipo: item.tipo,
                                precio: Number(item.producto.precio)
                            }))
                        }
                    }
                })

                await prisma.carrito.deleteMany({
                    where: { userId: session.user.id }
                })

                const staff = await prisma.user.findMany({
                    where: { role: { in: ["admin", "empleado"] } }
                })
                await prisma.notificacion.createMany({
                    data: staff.map(user => ({
                        userId: user.id,
                        titulo: "Nueva orden",
                        mensaje: `Nueva orden ${numeroOrden} por ${session.user.name || session.user.email}`,
                        tipo: "pedido"
                    }))
                })

                return NextResponse.json({ success: true, pedidoId: pedido.id })
            }

            default:
                return NextResponse.json({ success: false, error: "Acción inválida" }, { status: 400 })
        }
    } catch (error: any) {
        console.error("Carrito POST error:", error)
        return NextResponse.json({ success: false, error: "Error interno: " + error.message }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    let session
    try {
        const incomingHeaders = new Headers(request.headers)
        session = await auth.api.getSession({ headers: incomingHeaders })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }
    
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { itemId, cantidad } = body

        if (!itemId) {
            return NextResponse.json({ success: false, error: "Item requerido" }, { status: 400 })
        }

        // Obtener el item actual para validar
        const itemActual = await prisma.carrito.findUnique({
            where: { id: itemId },
            include: { producto: { include: { stocks: true } } }
        })

        if (!itemActual) {
            return NextResponse.json({ success: false, error: "Item no encontrado" }, { status: 404 })
        }

        // Validación de stock para piezas
        if (itemActual.tipo === "pieza") {
            const stockTotal = itemActual.producto.stocks?.reduce((sum, s) => sum + (s.stock || 0), 0) || 0
            // Si no hay stock info, permitir
            if (stockTotal > 0 && cantidad > stockTotal) {
                return NextResponse.json({ success: false, error: "Stock insuficiente" }, { status: 400 })
            }
        } else {
            // Validación para metros
            const MIN_METROS = 0.10
            const MAX_METROS = 50.00
            
            if (cantidad < MIN_METROS) {
                return NextResponse.json({ success: false, error: "La cantidad mínima es 0.10 metros" }, { status: 400 })
            }
            if (cantidad > MAX_METROS) {
                return NextResponse.json({ success: false, error: "La cantidad máxima es 50 metros" }, { status: 400 })
            }
        }

        await prisma.carrito.update({
            where: { id: itemId, userId: session.user.id },
            data: { cantidad }
        })

        const items = await prisma.carrito.findMany({
            where: { userId: session.user.id },
            include: { producto: true },
            orderBy: { createdAt: "desc" }
        })

        const metrosPorPieza = 50
        const itemsWithTotal = items.map(item => {
            const precioPorMetro = Number(item.producto.precio)
            const precioUnitario = item.tipo === "pieza" ? precioPorMetro * metrosPorPieza : precioPorMetro
            const precioTotal = item.tipo === "pieza" ? item.cantidad * precioPorMetro * metrosPorPieza : item.cantidad * precioPorMetro
            return {
                ...item,
                cantidadMetros: item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad,
                tipoLabel: item.tipo === "pieza" ? "Por pieza" : "Por metro",
                metrosPorPieza,
                precioUnitario,
                precioTotal
            }
        })

        const total = itemsWithTotal.reduce((sum, item) => sum + item.precioTotal, 0)

        return NextResponse.json({ success: true, items: itemsWithTotal, total })
    } catch (error: any) {
        console.error("Carrito PATCH error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    let session
    try {
        const incomingHeaders = new Headers(request.headers)
        session = await auth.api.getSession({ headers: incomingHeaders })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }
    
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const itemId = searchParams.get("itemId")

        if (!itemId) {
            return NextResponse.json({ success: false, error: "Item requerido" }, { status: 400 })
        }

        await prisma.carrito.delete({
            where: { id: itemId, userId: session.user.id }
        })

        const items = await prisma.carrito.findMany({
            where: { userId: session.user.id },
            include: { producto: true },
            orderBy: { createdAt: "desc" }
        })

        const metrosPorPieza = 50
        const itemsWithTotal = items.map(item => {
            const precioPorMetro = Number(item.producto.precio)
            const precioUnitario = item.tipo === "pieza" ? precioPorMetro * metrosPorPieza : precioPorMetro
            const precioTotal = item.tipo === "pieza" ? item.cantidad * precioPorMetro * metrosPorPieza : item.cantidad * precioPorMetro
            const precioTotalXPieza = item.tipo === "pieza" ? item.cantidad * precioPorMetro : 0
            return {
                ...item,
                cantidadMetros: item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad,
                tipoLabel: item.tipo === "pieza" ? "Por pieza" : "Por metro",
                metrosPorPieza,
                precioUnitario,
                precioTotal,
                precioTotalXPieza
            }
        })

        const total = itemsWithTotal.reduce((sum, item) => sum + item.precioTotal, 0)

        return NextResponse.json({ success: true, items: itemsWithTotal, total })
    } catch (error: any) {
        console.error("Carrito DELETE error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}