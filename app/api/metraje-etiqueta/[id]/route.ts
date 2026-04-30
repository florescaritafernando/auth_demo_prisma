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

        if (userRole !== "admin" && userRole !== "empleado") {
            return NextResponse.json({ success: false, error: "Solo administradores" }, { status: 403 })
        }

        const { id } = await params

        const etiqueta = await prisma.metrajeEtiqueta.findUnique({
            where: { id },
            include: { detalle: { include: { pedido: true, producto: true } } }
        })

        if (!etiqueta) {
            return NextResponse.json({ success: false, error: "Etiqueta no encontrada" }, { status: 404 })
        }

        const detalleId = etiqueta.detalleId
        const pedidoId = etiqueta.detalle.pedidoId

        await prisma.metrajeEtiqueta.delete({
            where: { id }
        })

        const etiquetasRestantes = await prisma.metrajeEtiqueta.findMany({
            where: { detalleId }
        })

        const metrajeTotal = etiquetasRestantes.reduce((sum, e) => sum + e.valor, 0)

        await prisma.pedidoDetalle.update({
            where: { id: detalleId },
            data: {
                metraje: metrajeTotal > 0 ? metrajeTotal : 0,
                cantidad: Math.ceil(metrajeTotal / 50) || 1
            }
        })

        const todosLosDetalles = await prisma.pedidoDetalle.findMany({
            where: { pedidoId },
            include: {
                producto: true,
                etiquetas: { select: { valor: true } }
            }
        })

        let nuevoTotal = 0
        for (const det of todosLosDetalles) {
            if (det.tipo === "pieza") {
                const mTotal = det.etiquetas.reduce((sum, e) => sum + e.valor, 0)
                nuevoTotal += Number(det.producto.precio) * mTotal
            } else {
                nuevoTotal += Number(det.precio) * det.cantidad
            }
        }

        const costoEnvio = nuevoTotal > 0 && etiqueta.detalle.pedido.metodoEnvio !== "retiro"
            ? calculateCostoEnvio(nuevoTotal, etiqueta.detalle.pedido.metodoEnvio)
            : 0

        await prisma.pedido.update({
            where: { id: pedidoId },
            data: {
                total: nuevoTotal,
                costoEnvio
            }
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
        if (subtotal >= 12000) return 60
        if (subtotal >= 9000) return 50
        if (subtotal >= 6000) return 40
        if (subtotal >= 4500) return 35
        if (subtotal >= 3000) return 30
        if (subtotal >= 1500) return 20
        if (subtotal >= 500) return 15
        return 10
    }
    return 10
}