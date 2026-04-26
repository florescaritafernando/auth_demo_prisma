"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

export async function obtenerCarrito() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session?.user) {
        return { success: false, error: "No autorizado" }
    }

    const items = await prisma.carrito.findMany({
        where: { userId: session.user.id },
        include: { producto: true },
        orderBy: { createdAt: "desc" }
    })

    return { success: true, items }
}

export async function agregarAlCarrito(productoId: string, cantidad: number = 1) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session?.user) {
        return { success: false, error: "No autorizado" }
    }

    try {
        const tipoPedido = "metros"
        const existente = await prisma.carrito.findUnique({
            where: {
                userId_productoId_tipo: {
                    userId: session.user.id,
                    productoId,
                    tipo: tipoPedido
                }
            }
        })

        if (existente) {
            await prisma.carrito.update({
                where: { id: existente.id },
                data: { cantidad: existente.cantidad + cantidad }
            })
        } else {
            await prisma.carrito.create({
                data: {
                    userId: session.user.id,
                    productoId,
                    cantidad,
                    tipo: tipoPedido
                }
            })
        }

        revalidatePath("/dashboard")
        revalidatePath("/dashboard/carrito")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Error al agregar al carrito" }
    }
}

export async function actualizarCantidadCarrito(carritoId: string, cantidad: number) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session?.user) {
        return { success: false, error: "No autorizado" }
    }

    try {
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

        revalidatePath("/dashboard/carrito")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Error al actualizar cantidad" }
    }
}

export async function eliminarDelCarrito(carritoId: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session?.user) {
        return { success: false, error: "No autorizado" }
    }

    try {
        await prisma.carrito.delete({
            where: { id: carritoId }
        })

        revalidatePath("/dashboard/carrito")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Error al eliminar del carrito" }
    }
}

export async function crearPedido(direccion: string, notas?: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session?.user) {
        return { success: false, error: "No autorizado" }
    }

    try {
        const items = await prisma.carrito.findMany({
            where: { userId: session.user.id },
            include: { producto: true }
        })

        if (items.length === 0) {
            return { success: false, error: "El carrito está vacío" }
        }

        const total = items.reduce((sum, item) => {
            return sum + (Number(item.producto.precio) * item.cantidad)
        }, 0)

        const pedido = await prisma.pedido.create({
            data: {
                userId: session.user.id,
                direccion,
                notas,
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

        revalidatePath("/dashboard")
        revalidatePath("/dashboard/pedidos")
        return { success: true, pedidoId: pedido.id }
    } catch (error) {
        return { success: false, error: "Error al crear el pedido" }
    }
}

export async function obtenerPedidos() {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if (!session?.user) {
        return { success: false, error: "No autorizado" }
    }

    const pedidos = await prisma.pedido.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" }
    })

    return { success: true, pedidos }
}