import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const cliente = await prisma.clientePedido.findUnique({
        where: { id }
    })

    if (!cliente) {
        return NextResponse.json({ success: false, error: "Cliente no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, cliente })
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

    try {
        const cliente = await prisma.clientePedido.update({
            where: { id },
            data: body
        })

        return NextResponse.json({ success: true, cliente })
    } catch (error: any) {
        console.error("Error updating cliente:", error)
        if (error.code === "P2002") {
            return NextResponse.json({ success: false, error: "Ya existe un cliente con ese nombre y numero de documento" }, { status: 400 })
        }
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
        await prisma.clientePedido.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting cliente:", error)
        return NextResponse.json({ success: false, error: "Error al eliminar" }, { status: 500 })
    }
}
