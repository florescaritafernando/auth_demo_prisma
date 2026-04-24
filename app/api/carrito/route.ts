import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    const session = await auth.api.getSession()
    
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const items = await prisma.carrito.findMany({
        where: { userId: session.user.id },
        include: { producto: true },
        orderBy: { createdAt: "desc" }
    })

    const total = items.reduce((sum, item) => {
        return sum + (Number(item.producto.precio) * item.cantidad)
    }, 0)

    return NextResponse.json({ success: true, items, total })
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession()
    
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { action, productoId, cantidad, carritoId, direccion, notas } = body

    try {
        switch (action) {
            case "agregar": {
                if (!productoId) {
                    return NextResponse.json({ success: false, error: "Producto requerido" }, { status: 400 })
                }

                const existente = await prisma.carrito.findUnique({
                    where: {
                        userId_productoId: {
                            userId: session.user.id,
                            productoId
                        }
                    }
                })

                if (existente) {
                    await prisma.carrito.update({
                        where: { id: existente.id },
                        data: { cantidad: existente.cantidad + (cantidad || 1) }
                    })
                } else {
                    await prisma.carrito.create({
                        data: {
                            userId: session.user.id,
                            productoId,
                            cantidad: cantidad || 1
                        }
                    })
                }

                return NextResponse.json({ success: true })
            }

            case "eliminar": {
                if (!carritoId) {
                    return NextResponse.json({ success: false, error: "ID de carrito requerido" }, { status: 400 })
                }

                await prisma.carrito.delete({
                    where: { id: carritoId }
                })

                return NextResponse.json({ success: true })
            }

            case "actualizar": {
                if (!carritoId || cantidad === undefined) {
                    return NextResponse.json({ success: false, error: "Datos requeridos" }, { status: 400 })
                }

                if (cantidad <= 0) {
                    await prisma.carrito.delete({
                        where: { id: carritoId }
                    })
                } else {
                    await prisma.carrito.update({
                        where: { id: carritoId },
                        data: { cantidad }
                    })
                }

                return NextResponse.json({ success: true })
            }

            case "checkout": {
                const items = await prisma.carrito.findMany({
                    where: { userId: session.user.id },
                    include: { producto: true }
                })

                if (items.length === 0) {
                    return NextResponse.json({ success: false, error: "El carrito est�� vacío" }, { status: 400 })
                }

                const total = items.reduce((sum, item) => {
                    return sum + (Number(item.producto.precio) * item.cantidad)
                }, 0)

                const pedido = await prisma.pedido.create({
                    data: {
                        userId: session.user.id,
                        direccion: direccion || "",
                        notas: notas || "",
                        total,
                        pedidoDetalle: {
                            create: items.map(item => ({
                                productoId: item.productoId,
                                cantidad: item.cantidad,
                                precio: Number(item.producto.precio)
                            }))
                        }
                    }
                })

                await prisma.carrito.deleteMany({
                    where: { userId: session.user.id }
                })

                return NextResponse.json({ success: true, pedidoId: pedido.id })
            }

            default:
                return NextResponse.json({ success: false, error: "Acción inválida" }, { status: 400 })
        }
    } catch (error) {
        console.error("Error en API carrito:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}