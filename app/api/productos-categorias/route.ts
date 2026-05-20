import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const categorias = await prisma.producto.findMany({
            select: { categoria: true },
            distinct: ["categoria"],
            orderBy: { categoria: "asc" }
        })

        return NextResponse.json({
            success: true,
            categorias: categorias.map(c => c.categoria).filter(Boolean)
        })
    } catch (error: any) {
        console.error("Error fetching categorias:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}
