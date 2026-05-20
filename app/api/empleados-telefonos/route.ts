import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const headersList = new Headers(request.headers)
        const session = await auth.api.getSession({ headers: headersList })

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const empleados = await prisma.user.findMany({
            where: {
                role: "empleado",
                celular: { not: null }
            },
            select: {
                id: true,
                name: true,
                celular: true
            },
            orderBy: { name: "asc" }
        })

        return NextResponse.json({ 
            success: true, 
            empleados: empleados.map(e => ({
                id: e.id,
                nombre: e.name,
                celular: e.celular
            }))
        })
    } catch (error: any) {
        console.error("Error obteniendo telefonos de empleados:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}
