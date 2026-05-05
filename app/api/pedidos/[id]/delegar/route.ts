import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

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
        if (role !== "empleado" && role !== "admin") {
            return NextResponse.json({ success: false, error: "Solo empleados pueden tomar pedidos" }, { status: 403 })
        }

        const { id } = await params

        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: { user: { select: { name: true, email: true } } }
        })

        if (!pedido) {
            return NextResponse.json({ success: false, error: "Pedido no encontrado" }, { status: 404 })
        }

        // Verificar si ya está asignado a este empleado
        const delegacionExistente = await prisma.pedidoDelegado.findFirst({
            where: {
                pedidoId: id,
                userId: session.user.id
            }
        })

        if (delegacionExistente) {
            // Ya está asignado, devolver éxito pero indicando que ya estaba asignado
            return NextResponse.json({ 
                success: true, 
                alreadyAssigned: true,
                message: "Ya estás asignado a este pedido" 
            })
        }

        // Crear la nueva delegación
        const delegacion = await prisma.pedidoDelegado.create({
            data: {
                pedidoId: id,
                userId: session.user.id
            },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        })

        return NextResponse.json({ success: true, delegacion })

    } catch (error: any) {
        console.error("Delegar error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}