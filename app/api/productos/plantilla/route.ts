import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

const CATEGORIAS = [
    "MANCHESTER SUITING",
    "LONDON FANCY SUITING", 
    "MANCHESTER STRECH",
    "MANCHESTER FASHION"
]

export async function GET() {
    try {
        const almacenes = await prisma.almacen.findMany({
            orderBy: { nombre: "asc" },
            select: { nombre: true }
        })

        const headers = [
            "nombre",
            "categoria", 
            "descripcion",
            "precio",
            "activo",
            ...almacenes.map(a => `stock_${a.nombre.toLowerCase()}`)
        ]

        const exampleRow = [
            "PRODUCTO_EJEMPLO",
            "MANCHESTER SUITING",
            "Descripcion del producto",
            "45.90",
            "SI",
            ...almacenes.map(() => "0")
        ]

        const csv = [
            headers.join(","),
            exampleRow.join(","),
            "",
            "# CAMPOS OBLIGATORIOS",
            "# nombre: Nombre unico del producto (requerido)",
            "# categoria: Categoria del producto (requerido)",
            "# precio: Precio mayor a 0 (requerido)",
            "",
            "# CAMPOS OPCIONALES",
            "# descripcion: Descripcion del producto",
            "# activo: SI o NO (por defecto SI)",
            "",
            "# CATEGORIAS VALIDAS",
            CATEGORIAS.join(", "),
            "",
            "# STOCK POR ALMACEN",
            ...almacenes.map(a => `# stock_${a.nombre.toLowerCase()}: cantidad en almacen ${a.nombre}`)
        ].join("\n")

        return new NextResponse(csv, {
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="plantilla_productos.csv"`
            }
        })
    } catch (error) {
        console.error("Error generating template:", error)
        return NextResponse.json({ success: false, error: "Error al generar plantilla" }, { status: 500 })
    }
}