import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({ headers: request.headers })
        
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
        }

        const templates = await prisma.datosFacturacion.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        })

        return NextResponse.json({ success: true, templates })
    } catch (error: any) {
        console.error("GET datos-facturacion error:", error)
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
        const { tipoDocumento, numeroDoc, nombreFactura, razonSocial, direccion, departamento, provincia, distrito, celular } = body

        // Generar nombre automático simple
        const existing = await prisma.datosFacturacion.findMany({
            where: { userId: session.user.id },
            select: { id: true }
        })
        const nombre = existing.length === 0 ? "Plantilla facturación" : `Plantilla facturación ${existing.length + 1}`

        const template = await prisma.datosFacturacion.create({
            data: {
                userId: session.user.id,
                nombre,
                tipoDocumento,
                numeroDoc,
                nombreFactura,
                razonSocial,
                direccion,
                departamento: departamento || null,
                provincia: provincia || null,
                distrito: distrito || null,
                celular
            }
        })

        return NextResponse.json({ success: true, template })
    } catch (error: any) {
        console.error("POST datos-facturacion error:", error)
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
        const { id, nombre, tipoDocumento, numeroDoc, nombreFactura, razonSocial, direccion, celular } = body

        const template = await prisma.datosFacturacion.update({
            where: { id, userId: session.user.id },
            data: {
                ...(nombre && { nombre }),
                ...(tipoDocumento !== undefined && { tipoDocumento }),
                ...(numeroDoc !== undefined && { numeroDoc }),
                ...(nombreFactura !== undefined && { nombreFactura }),
                ...(razonSocial !== undefined && { razonSocial }),
                ...(direccion !== undefined && { direccion }),
                ...(celular !== undefined && { celular })
            }
        })

        return NextResponse.json({ success: true, template })
    } catch (error: any) {
        console.error("PATCH datos-facturacion error:", error)
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

        await prisma.datosFacturacion.delete({
            where: { id, userId: session.user.id }
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error("DELETE datos-facturacion error:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}