import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import cloudinary from "@/lib/cloudinary"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const activo = searchParams.get("activo")
    const categoria = searchParams.get("categoria")
    const search = searchParams.get("search")
    const tipocolor = searchParams.get("tipocolor")
    const tipodiseno = searchParams.get("tipodiseno")

    const where: any = {}
    
    if (activo !== null) {
        where.activo = activo === "true"
    }
    if (categoria) {
        where.categoria = categoria
    }
    if (search) {
        where.OR = [
            { nombre: { contains: search, mode: "insensitive" } },
        ]
    }
    if (tipocolor) {
        where.tipocolores = { contains: tipocolor, mode: "insensitive" }
    }
    if (tipodiseno) {
        where.tipodiseno = tipodiseno
    }

    const productos = await prisma.producto.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
            stocks: {
                include: { almacen: { select: { id: true, nombre: true, ciudad: true } } }
            }
        }
    })

    return NextResponse.json({ success: true, productos })
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
    const { nombre, categoria, descripcion, precio, stocks, imagen, tipocolores, tipodiseno } = body

    try {
        const existing = await prisma.producto.findFirst({
            where: { nombre, categoria }
        })
        
        if (existing) {
            return NextResponse.json({ 
                success: false, 
                error: `Ya existe un producto "${nombre}" en la categoría "${categoria}"` 
            }, { status: 400 })
        }

        const stocksArray = Object.entries(stocks || {})
            .map(([almacenId, stock]) => ({
                almacenId,
                stock: parseInt(String(stock)) || 0
            }))
            .filter(item => item.stock > 0)

        const producto = await prisma.producto.create({
            data: {
                nombre,
                categoria,
                descripcion,
                precio: parseFloat(precio),
                activo: true,
                imagen: imagen || null,
                tipocolores: tipocolores || null,
                tipodiseno: tipodiseno || null,
                stocks: {
                    create: stocksArray
                }
            },
            include: { stocks: true }
        })

        return NextResponse.json({ success: true, producto })
    } catch (error: any) {
        console.error("Error creating product:", error)
        return NextResponse.json({ success: false, error: "Error al crear producto" }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
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
    const { imagen } = body

    if (!imagen) {
        return NextResponse.json({ success: false, error: "No hay imagen" }, { status: 400 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No hay archivo" }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const result = await cloudinary.uploader.upload(
            `data:${file.type};base64,${buffer.toString('base64')}`,
            {
                folder: 'productos',
                resource_type: 'image',
                transformation: [
                    { quality: 'auto:good', fetch_format: 'auto' }
                ]
            }
        )

        const url = result.secure_url

        return NextResponse.json({ success: true, url })
    } catch (error) {
        console.error("Error uploading:", error)
        return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 })
    }
}