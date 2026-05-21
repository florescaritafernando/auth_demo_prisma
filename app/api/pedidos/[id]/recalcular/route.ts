import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

function calculateCostoEnvio(subtotal: number, metodoEnvio?: string | null): number {
    if (!metodoEnvio || metodoEnvio === "tienda" || metodoEnvio === "retiro") return 0
    if (subtotal >= 9000) return 50
    if (subtotal >= 7000) return 40
    if (subtotal >= 5000) return 35
    if (subtotal >= 3000) return 30
    if (subtotal >= 1500) return 20
    if (subtotal >= 500) return 15
    return 10
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const role = (session.user as any)?.role || "cliente"
        if (!["admin", "empleado"].includes(role)) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }

        const { id } = await params

        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: {
                pedidoDetalle: {
                    include: {
                        producto: true,
                        etiquetas: true
                    }
                }
            }
        })

        if (!pedido) {
            return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        // Calcular subtotal (suma de artículos)
        let subtotalRaw = 0

        // Calcular total basado en los detalles del pedido
        for (const detalle of pedido.pedidoDetalle) {
            if (detalle.tipo === "pieza") {
                const metrajeTotal = detalle.etiquetas.reduce((sum, e) => sum + e.valor, 0)
                const precioUnitario = Number(detalle.precio)
                subtotalRaw += precioUnitario * metrajeTotal
            } else {
                subtotalRaw += Number(detalle.precio) * detalle.cantidad
            }
        }

        const subtotal = Math.round(subtotalRaw * 100) / 100

        // Calcular costo de envío basado en el subtotal
        const costoEnvio = calculateCostoEnvio(subtotal, pedido.metodoEnvio)

        // Total = subtotal + costo de envío
        const totalRaw = subtotal + costoEnvio
        const total = Math.round(totalRaw * 100) / 100

        await prisma.pedido.update({
            where: { id },
            data: {
                total: total,
                costoEnvio: costoEnvio
            }
        })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Recalcular error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}