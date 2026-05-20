import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const userRole = (session.user as any)?.role || "cliente"

        if (userRole !== "empleado" && userRole !== "admin") {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }

        // Solo pedidos CREADOS por este empleado
        const pedidos = await prisma.pedido.findMany({
            where: { userId: session.user.id },
            include: {
                user: { select: { id: true, name: true, email: true } },
                pedidoDetalle: {
                    include: {
                        producto: { select: { id: true, nombre: true, categoria: true } },
                        etiquetas: { select: { valor: true } }
                    }
                },
                delegados: {
                    include: { user: { select: { id: true, name: true } } }
                },
                pedidoEmpleadoInfo: true,
                clientePedido: true
            },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ success: true, pedidos })
    } catch (error: any) {
        console.error("GET pedidos-admin error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}
