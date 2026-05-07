import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({
            headers: headersList
        })

        console.log("Session:", session)
        
        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado", session: session ? "has session but no user" : "no session" }, { status: 401 })
        }

        const userId = session.user.id as string
        console.log("UserId:", userId)

        const favoritos = await prisma.favorito.findMany({
            where: { userId },
            select: { productoId: true }
        })

        return NextResponse.json({ favoritos: favoritos.map(f => f.productoId), userId })
    } catch (error) {
        console.error("Error getting favoritos:", error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const headersList = await headers()
        const session = await auth.api.getSession({
            headers: headersList
        })

        console.log("POST Session:", session)

        if (!session?.user) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 })
        }

        const userId = session.user.id as string
        console.log("POST UserId:", userId)

        const { productoId, action } = await request.json()
        console.log("Request:", { productoId, action })

        if (!productoId) {
            return NextResponse.json({ error: "Producto requerido" }, { status: 400 })
        }

        if (action === "agregar") {
            await prisma.favorito.upsert({
                where: {
                    userId_productoId: { userId, productoId }
                },
                create: { userId, productoId },
                update: {}
            })
            return NextResponse.json({ success: true, message: "Agregado a favoritos" })
        } else if (action === "quitar") {
            await prisma.favorito.deleteMany({
                where: { userId, productoId }
            })
            return NextResponse.json({ success: true, message: "Eliminado de favoritos" })
        }

        return NextResponse.json({ error: "Acción inválida" }, { status: 400 })
    } catch (error) {
        console.error("Error en favoritos:", error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}