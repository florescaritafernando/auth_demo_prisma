import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

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

        const userRole = (session.user as any)?.role || "cliente"
        
        if (userRole !== "admin") {
            return NextResponse.json({ success: false, error: "Solo administradores" }, { status: 403 })
        }

        const { id } = await params

        const etiqueta = await prisma.metrajeEtiqueta.findUnique({
            where: { id },
            include: { detalle: { include: { pedido: true } } }
        })

        if (!etiqueta) {
            return NextResponse.json({ success: false, error: "Etiqueta no encontrada" }, { status: 404 })
        }

        await prisma.metrajeEtiqueta.delete({
            where: { id }
        })

        const detalleId = etiqueta.detalleId
        const pedidoId = etiqueta.detalle.pedidoId

        const etiquetasRestantes = await prisma.metrajeEtiqueta.findMany({
            where: { detalleId }
        })

        const metrajeTotal = etiquetasRestantes.reduce((sum, e) => sum + e.valor, 0)

        await prisma.pedidoDetalle.update({
            where: { id: detalleId },
            data: { 
                metraje: metrajeTotal > 0 ? metrajeTotal : null,
                cantidad: Math.ceil(metrajeTotal / 50)
            }
        })

        const otrosDetalles = await prisma.pedidoDetalle.findMany({
            where: { pedidoId, tipo: "metros" }
        })

        let nuevoTotal = 0
        const piezaDetalles = await prisma.pedidoDetalle.findMany({
            where: { pedidoId, tipo: "pieza" },
            include: { producto: true, etiquetas: { select: { valor: true } } }
        })

        for (const det of piezaDetalles) {
            const mTotal = det.etiquetas.reduce((sum, e) => sum + e.valor, 0)
            nuevoTotal += Number(det.producto.precio) * mTotal
        }

        for (const det of otrosDetalles) {
            nuevoTotal += Number(det.precio) * det.cantidad
        }

        const pedido = await prisma.pedido.findUnique({
            where: { id: pedidoId },
            select: { metodoEnvio: true }
        })

        const costoEnvio = metrajeTotal > 0 && pedido?.metodoEnvio && pedido.metodoEnvio !== "retiro"
            ? calculateCostoEnvio(nuevoTotal, pedido.metodoEnvio)
            : 0

        await prisma.pedido.update({
            where: { id: pedidoId },
            data: { total: nuevoTotal, costoEnvio }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("DELETE metraje-etiqueta error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

function calculateCostoEnvio(subtotal: number, metodoEnvio?: string | null): number {
    if (!metodoEnvio || metodoEnvio === "retiro") return 0
    if (metodoEnvio === "agencia") {
        if (subtotal >= 3000) return 30
        if (subtotal >= 1500) return 20
        if (subtotal >= 500) return 15
        return 10
    }
    return 10
}