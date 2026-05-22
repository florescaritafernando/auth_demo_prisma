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

        const { searchParams } = new URL(request.url)
        const all = searchParams.get("all")
        const id = searchParams.get("id")

        if (id) {
            const borrador = await prisma.borradorPedido.findUnique({
                where: { id }
            })
            return NextResponse.json({ success: true, borrador })
        }

        if (all === "true") {
            const role = (session.user as any)?.role || "cliente"
            if (role !== "empleado" && role !== "admin") {
                return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
            }
            const borradores = await prisma.borradorPedido.findMany({
                orderBy: { updatedAt: "desc" },
                include: {
                    user: { select: { id: true, name: true } }
                }
            })
            return NextResponse.json({ success: true, borradores })
        }

        const borradores = await prisma.borradorPedido.findMany({
            where: { userId: session.user.id },
            orderBy: { updatedAt: "desc" },
            take: 10
        })

        return NextResponse.json({ success: true, borradores })
    } catch (error: any) {
        console.error("Error obteniendo borrador:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { nombre, empresa, metodoPago, cliente, agencia, agenciaOtro, guiaRemision, envioComprobante, costoEnvio, observaciones, items, step } = body

        const borrador = await prisma.borradorPedido.create({
            data: {
                userId: session.user.id,
                nombre: nombre || null,
                empresa: empresa || null,
                metodoPago: metodoPago || null,
                cliente: cliente || null,
                agencia: agencia || null,
                agenciaOtro: agenciaOtro || null,
                guiaRemision: guiaRemision || false,
                envioComprobante: envioComprobante || "No imprimir",
                costoEnvio: costoEnvio || "0",
                observaciones: observaciones || null,
                items: items || [],
                step: step || 1
            }
        })

        return NextResponse.json({ success: true, borrador })
    } catch (error: any) {
        console.error("Error guardando borrador:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        if (!id) {
            return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 })
        }

        const body = await request.json()
        const { nombre, empresa, metodoPago, cliente, agencia, agenciaOtro, guiaRemision, envioComprobante, costoEnvio, observaciones, items, step } = body

        const borrador = await prisma.borradorPedido.update({
            where: { id },
            data: {
                nombre: nombre || null,
                empresa: empresa || null,
                metodoPago: metodoPago || null,
                cliente: cliente || null,
                agencia: agencia || null,
                agenciaOtro: agenciaOtro || null,
                guiaRemision: guiaRemision || false,
                envioComprobante: envioComprobante || "No imprimir",
                costoEnvio: costoEnvio || "0",
                observaciones: observaciones || null,
                items: items || [],
                step: step || 1
            }
        })

        return NextResponse.json({ success: true, borrador })
    } catch (error: any) {
        console.error("Error actualizando borrador:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 })
        }

        const role = (session.user as any)?.role || "cliente"
        const borrador = await prisma.borradorPedido.findUnique({ where: { id } })
        if (!borrador) {
            return NextResponse.json({ success: false, error: "Borrador no encontrado" }, { status: 404 })
        }
        if (borrador.userId !== session.user.id && role !== "admin") {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }

        await prisma.borradorPedido.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("Error eliminando borrador:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}
