import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const templates = await prisma.datosDireccionEnvios.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ success: true, templates })
    } catch (error: any) {
        console.error("GET datos-direccion error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const body = await request.json()
        const { 
            metodoEnvio, tiendaId, agencia, agenciaOtro, delivery, deliveryOtro,
            departamento, provincia, distrito, direccion,
            tipoEnvio, dniRecibe, nombreRecibe, celularRecibe
        } = body

        // Generar nombre automático simple
        const existing = await prisma.datosDireccionEnvios.findMany({
            where: { userId: session.user.id },
            select: { id: true }
        })
        const nombre = existing.length === 0 ? "Plantilla dirección de envío" : `Plantilla dirección de envío ${existing.length + 1}`

        const template = await prisma.datosDireccionEnvios.create({
            data: {
                userId: session.user.id,
                nombre,
                metodoEnvio,
                tiendaId,
                agencia,
                agenciaOtro,
                delivery,
                deliveryOtro,
                departamento,
                provincia,
                distrito,
                direccion,
                tipoEnvio,
                dniRecibe,
                nombreRecibe,
                celularRecibe
            }
        })

        return NextResponse.json({ success: true, template })
    } catch (error: any) {
        console.error("POST datos-direccion error:", error)
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
        const { id, nombre, ...data } = body

        const updateData: any = {}
        if (nombre) updateData.nombre = nombre
        
        // Agregar todos los campos que vengan en data
        const fields = ['metodoEnvio', 'tiendaId', 'agencia', 'agenciaOtro', 'delivery', 'deliveryOtro',
            'departamento', 'provincia', 'distrito', 'direccion', 'tipoEnvio', 'dniRecibe', 'nombreRecibe', 'celularRecibe']
        
        fields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = data[field]
            }
        })

        const template = await prisma.datosDireccionEnvios.update({
            where: { id, userId: session.user.id },
            data: updateData
        })

        return NextResponse.json({ success: true, template })
    } catch (error: any) {
        console.error("PATCH datos-direccion error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ success: false, error: "ID requerido" }, { status: 400 })
        }

        await prisma.datosDireccionEnvios.delete({
            where: { id, userId: session.user.id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("DELETE datos-direccion error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}