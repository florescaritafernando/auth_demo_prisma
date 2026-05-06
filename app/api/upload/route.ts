import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

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

        let uploadDir: string
        let urlPrefix: string

        if (tipo === "perfil") {
            // Cualquier usuario puede subir su foto de perfil
            uploadDir = join(process.cwd(), "public", "images", "perfiles")
            urlPrefix = "/images/perfiles"
        } else {
            // Solo admins pueden subir productos
            uploadDir = join(process.cwd(), "public", "images", "productos")
            urlPrefix = "/images/productos"
        }

        await mkdir(uploadDir, { recursive: true })

        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
        const filepath = join(uploadDir, filename)
        await writeFile(filepath, buffer)

        const url = `${urlPrefix}/${filename}`

        return NextResponse.json({ success: true, url })
    } catch (error) {
        console.error("Error uploading:", error)
        return NextResponse.json({ error: "Error al subir archivo" }, { status: 500 })
    }
}