import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const activo = searchParams.get("activo")
    const categoria = searchParams.get("categoria")
    const search = searchParams.get("search")

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
    const { nombre, categoria, descripcion, precio, stocks } = body

    try {
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

        const uploadDir = join(process.cwd(), "public", "images", "productos")
        await mkdir(uploadDir, { recursive: true })

        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)

        const url = `/images/productos/${filename}`

        return NextResponse.json({ success: true, url })
    } catch (error) {
        console.error("Error uploading:", error)
        return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 })
    }
}