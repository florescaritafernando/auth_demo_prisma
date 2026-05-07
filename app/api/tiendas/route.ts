import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET() {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({ headers: headersList })
        
        // Anyone can see tiendas (for checkout), but must be logged in
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const tiendas = await prisma.tienda.findMany({
            orderBy: { createdAt: "desc" },
            include: { encargado: { select: { id: true, name: true, email: true } } }
        })

        return NextResponse.json({ success: true, tiendas })
    } catch (error: any) {
        console.error("GET tiendas error:", error)
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

        const userRole = (session.user as any)?.role || "cliente"
        
        if (userRole !== "admin" && userRole !== "empleado") {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }

        const body = await request.json()
        const { nombre, direccion, referencia, encargadoId } = body

        if (!nombre || !direccion || !encargadoId) {
            return NextResponse.json({ success: false, error: "Faltan datos requeridos" }, { status: 400 })
        }

        const tienda = await prisma.tienda.create({
            data: {
                nombre,
                direccion,
                referencia: referencia || null,
                encargadoId
            }
        })

        return NextResponse.json({ success: true, tienda })
    } catch (error: any) {
        console.error("POST tienda error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}