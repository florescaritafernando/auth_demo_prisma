import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const almacen = await prisma.almacen.findUnique({
        where: { id },
        include: { productos: true }
    })

    if (!almacen) {
        return NextResponse.json({ success: false, error: "Almacen no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, almacen })
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
        const almacen = await prisma.almacen.update({
            where: { id },
            data: body
        })

        return NextResponse.json({ success: true, almacen })
    } catch (error) {
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
        await prisma.almacen.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: "Error al eliminar" }, { status: 500 })
    }
}