import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import cloudinary from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers
    })
    
    if (!session?.user) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const formData = await request.formData()
    const tipo = formData.get("tipo") as string // "producto" | "perfil"
    const file = formData.get("file") as File

    if (!file) {
        return NextResponse.json({ error: "No hay archivo" }, { status: 400 })
    }

    const role = (session.user as any)?.role

    // Solo admins pueden subir imágenes de productos
    if (tipo === "producto" && role !== "admin") {
        return NextResponse.json({ error: "Solo admins pueden subir imágenes de productos" }, { status: 403 })
    }

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const folder = tipo === "perfil" ? "perfiles" : "productos"

        const result = await cloudinary.uploader.upload(
            `data:${file.type};base64,${buffer.toString('base64')}`,
            {
                folder: folder,
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