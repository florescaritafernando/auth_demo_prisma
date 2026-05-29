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
    const tipo = formData.get("tipo") as string // "producto" | "perfil" | "comprobante"
    const file = formData.get("file") as File
    const nombreProducto = formData.get("nombreProducto") as string | null
    const categoriaProducto = formData.get("categoriaProducto") as string | null

    console.log("Upload - tipo:", tipo, "nombreProducto:", nombreProducto, "file:", file?.name)

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

        let folder: string
        let resourceType: 'image' | 'raw' = 'image'

        // Determinar el tipo de recurso basado en la extensión del archivo
        const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)

        if (tipo === "comprobante") {
            folder = "comprobantes-pago-pedidos"
            resourceType = isImage ? 'image' : 'raw'
        } else {
            folder = tipo === "perfil" ? "perfiles" : "productos"
        }

        // Usar nombre del producto o nombre original del archivo como public_id
        let publicId: string
        if (nombreProducto && categoriaProducto) {
            const nameSlug = nombreProducto.replace(/[^a-zA-Z0-9_-]/g, '-')
            const catSlug = categoriaProducto.replace(/[^a-zA-Z0-9_-]/g, '-')
            publicId = `${nameSlug}-${catSlug}`
        } else if (nombreProducto) {
            publicId = nombreProducto.replace(/[^a-zA-Z0-9_-]/g, '-')
        } else {
            publicId = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, '-')
        }

        // Determinar el mime type correcto
        let mimeType = file.type
        if (!mimeType || mimeType === 'application/octet-stream') {
            const mimeMap: Record<string, string> = {
                pdf: 'application/pdf',
                jpg: 'image/jpeg', jpeg: 'image/jpeg',
                png: 'image/png', gif: 'image/gif', webp: 'image/webp',
                svg: 'image/svg+xml', bmp: 'image/bmp',
                heic: 'image/heic', heif: 'image/heif',
            }
            mimeType = mimeMap[fileExt] || 'application/octet-stream'
        }

        const uploadOptions: any = {
            folder: folder,
            public_id: publicId,
            resource_type: resourceType,
            overwrite: true,
        }

        // Solo agregar transformación para imágenes
        if (resourceType === 'image') {
            uploadOptions.transformation = [
                { quality: 'auto:good', fetch_format: 'auto' }
            ]
        }

        console.log("Subiendo a Cloudinary:", { tipo, folder, resourceType, mimeType, fileName: file.name, nombreProducto, publicId })

        const result = await cloudinary.uploader.upload(
            `data:${mimeType};base64,${buffer.toString('base64')}`,
            uploadOptions
        )

        console.log("Upload exitoso:", result.secure_url)

        const url = result.secure_url

        return NextResponse.json({ success: true, url })
    } catch (error: any) {
        console.error("Error uploading:", error)
        const errorMessage = error.message || "Error al subir archivo"
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}