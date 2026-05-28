import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const cliente = await prisma.clientePedido.findUnique({
        where: { id },
        select: { id: true, nombre: true, tipoDoc: true, numeroDoc: true, telefono: true, direccion: true }
    })

    if (!cliente) {
        return NextResponse.json({ success: false, error: "Cliente no encontrado" }, { status: 404 })
    }

    const cartera = await prisma.cartera.findUnique({
        where: { clientePedidoId: id },
        include: {
            movimientos: {
                orderBy: { createdAt: "desc" }
            }
        }
    })

    return NextResponse.json({
        success: true,
        cliente,
        cartera: cartera || { id: null, saldo: 0, movimientos: [] }
    })
}
