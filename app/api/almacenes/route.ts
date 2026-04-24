import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const activo = searchParams.get("activo")

    const where: any = {}
    if (activo !== null) {
        where.activo = activo === "true"
    }

    const almacenes = await prisma.almacen.findMany({
        where,
        orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ success: true, almacenes })
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { nombre, direccion, telefono, responsable, ciudad } = body

    try {
        const almacen = await prisma.almacen.create({
            data: {
                nombre,
                direccion,
                telefono: telefono || null,
                responsable: responsable || null,
                ciudad: ciudad || null,
                activo: true,
            }
        })

        return NextResponse.json({ success: true, almacen })
    } catch (error) {
        console.error("Error creating almacen:", error)
        return NextResponse.json({ success: false, error: "Error al crear almacen" }, { status: 500 })
    }
}