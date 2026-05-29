import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const where: any = {}
    if (search) {
        where.OR = [
            { nombre: { contains: search, mode: "insensitive" } },
            { numeroDoc: { contains: search, mode: "insensitive" } },
            { razonSocial: { contains: search, mode: "insensitive" } },
            { telefono: { contains: search, mode: "insensitive" } },
        ]
    }

    const clientes = await prisma.clientePedido.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: { pedidos: true }
            }
        }
    })

    return NextResponse.json({ success: true, clientes })
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers
    })

    if (!session?.user) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const role = (session.user as any)?.role
    if (role !== "admin" && role !== "empleado") {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { nombre, tipoDoc, numeroDoc, razonSocial, direccion, telefono, agencia, agenciaOtro, guiaRemision, departamento, provincia, distrito } = body

    try {
        const cliente = await prisma.clientePedido.create({
            data: {
                nombre,
                tipoDoc,
                numeroDoc,
                razonSocial: razonSocial || null,
                direccion: direccion || null,
                telefono: telefono || null,
                agencia: agencia || null,
                agenciaOtro: agenciaOtro || null,
                guiaRemision: guiaRemision || false,
                departamento: departamento || null,
                provincia: provincia || null,
                distrito: distrito || null,
            }
        })

        return NextResponse.json({ success: true, cliente })
    } catch (error: any) {
        console.error("Error creating cliente:", error)
        if (error.code === "P2002") {
            return NextResponse.json({ success: false, error: "Ya existe un cliente con ese nombre y numero de documento" }, { status: 400 })
        }
        return NextResponse.json({ success: false, error: "Error al crear cliente" }, { status: 500 })
    }
}
