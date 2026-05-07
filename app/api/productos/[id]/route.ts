import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const producto = await prisma.producto.findUnique({
        where: { id }
    })

    if (!producto) {
        return NextResponse.json({ success: false, error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, producto })
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({
        headers: request.headers
    })
    
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const role = (session.user as any)?.role
    if (role !== "admin") {
        return NextResponse.json({ success: false, error: "Solo admins" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { stocks, ...productoData } = body

    try {
        await prisma.$transaction(async (tx) => {
            await tx.producto.update({
                where: { id },
                data: productoData
            })

            if (stocks) {
                await tx.productoStock.deleteMany({ where: { productoId: id } })
                
                const stockEntries = Object.entries(stocks)
                    .map(([almacenId, stock]) => ({
                        productoId: id,
                        almacenId,
                        stock: parseInt(String(stock)) || 0
                    }))
                    .filter(item => item.stock > 0)

                if (stockEntries.length > 0) {
                    await tx.productoStock.createMany({ data: stockEntries })
                }
            }
        })

        const producto = await prisma.producto.findUnique({
            where: { id },
            include: { stocks: true }
        })

        return NextResponse.json({ success: true, producto })
    } catch (error) {
        console.error("Error updating product:", error)
        return NextResponse.json({ success: false, error: "Error al actualizar" }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({
        headers: request.headers
    })
    
    if (!session?.user) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const role = (session.user as any)?.role
    if (role !== "admin") {
        return NextResponse.json({ success: false, error: "Solo admins" }, { status: 403 })
    }

    const { id } = await params

    try {
        await prisma.producto.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: "Error al eliminar" }, { status: 500 })
    }
}