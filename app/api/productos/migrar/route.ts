import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import cloudinary from "@/lib/cloudinary"
import { readFile } from "fs/promises"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        imagen: {
          startsWith: "/images/"
        }
      }
    })

    const resultados = {
      exitosos: 0,
      fallidos: 0,
      detalles: [] as string[]
    }

    for (const producto of productos) {
      try {
        const localPath = join(process.cwd(), "public", producto.imagen.replace(/^\//, ""))
        
        const buffer = await readFile(localPath)
        
        const ext = producto.imagen.split('.').pop()?.toLowerCase()
        const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg'

        const result = await cloudinary.uploader.upload(
          `data:${mimeType};base64,${buffer.toString('base64')}`,
          {
            folder: 'productos',
            public_id: producto.nombre.replace(/[^a-zA-Z0-9]/g, '_'),
            resource_type: 'image',
            transformation: [
              { quality: 'auto:good', fetch_format: 'auto' }
            ]
          }
        )

        await prisma.producto.update({
          where: { id: producto.id },
          data: { imagen: result.secure_url }
        })

        resultados.exitosos++
        resultados.detalles.push(`✓ ${producto.nombre}`)
        
      } catch (error) {
        resultados.fallidos++
        resultados.detalles.push(`✗ ${producto.nombre}: ${error}`)
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Migración completada: ${resultados.exitosos} exitosos, ${resultados.fallidos} fallidos`,
      detalles: resultados.detalles
    })

  } catch (error) {
    console.error("Error en migración:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Error durante la migración" 
    }, { status: 500 })
  }
}