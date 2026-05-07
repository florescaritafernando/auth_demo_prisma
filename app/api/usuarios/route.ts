import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        
        console.log("Session user:", session?.user)
        console.log("Session user id:", session?.user?.id)
        console.log("All session:", JSON.stringify(session))

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const userRole = (session.user as any)?.role || "cliente"
        
        // Verificar si es propio perfil primero (sin importar el rol)
        const url = new URL(request.url)
        const esPropioPerfil = url.searchParams.get("propio") === "true"
        
        console.log("GET /usuarios: esPropioPerfil =", esPropioPerfil, "role =", userRole, "userId =", session.user.id)

        // Si es propio perfil (cualquier usuario), permitir
        if (esPropioPerfil) {
            console.log("Fetching propio perfil...")
            const usuario = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { 
                    id: true, 
                    name: true, 
                    email: true, 
                    image: true,
                    role: true,
                    preferencias: true,
                    celular: true
                }
            })
            return NextResponse.json({ success: true, usuario })
        }

        // De lo contrario, solo admin/empleado puede ver lista de usuarios
        if (userRole !== "admin" && userRole !== "empleado") {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
        }

        const searchParams = request.nextUrl.searchParams
        const roleFilter = searchParams.get("role")

        const where: any = {}
        if (roleFilter) {
            where.role = roleFilter
        }

        const usuarios = await prisma.user.findMany({
            where,
            select: { id: true, name: true, email: true }
        })

        return NextResponse.json({ success: true, usuarios })
    } catch (error: any) {
        console.error("GET usuarios error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { name, image, preferencias, celular } = body

        // Solo permitir actualizar propios datos
        const updateData: any = {}
        if (name !== undefined) updateData.name = name
        if (image !== undefined) updateData.image = image
        if (preferencias !== undefined) updateData.preferencias = preferencias
        if (celular !== undefined) updateData.celular = celular

        const usuario = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
            select: { 
                id: true, 
                name: true, 
                email: true, 
                image: true,
                role: true,
                preferencias: true,
                celular: true
            }
        })

        return NextResponse.json({ success: true, usuario })
    } catch (error: any) {
        console.error("PATCH usuario error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}