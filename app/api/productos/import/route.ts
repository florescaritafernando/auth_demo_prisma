import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

function parseCSV(text: string) {
    const lines = text.split("\n").filter(l => l.trim())
    if (lines.length < 2) return []

    const parseRow = (row: string) => {
        const result: string[] = []
        let current = ""
        let inQuotes = false
        
        for (const char of row) {
            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === "," && !inQuotes) {
                result.push(current.trim())
                current = ""
            } else {
                current += char
            }
        }
        result.push(current.trim())
        return result
    }

    const headers = parseRow(lines[0])
    const data = lines.slice(1).map(line => {
        const values = parseRow(line)
        const obj: Record<string, string> = {}
        headers.forEach((h, i) => {
            obj[h] = values[i] || ""
        })
        return obj
    })

    return data
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

    try {
        const body = await request.json()
        const { data, mode } = body
        
        if (!data || !Array.isArray(data) || data.length === 0) {
            return NextResponse.json({ success: false, error: "No hay datos" }, { status: 400 })
        }

        const almacenes = await prisma.almacen.findMany({
            orderBy: { nombre: "asc" }
        })

        let created = 0
        let updated = 0
        let errors: string[] = []

        for (const row of data) {
            let currentRow = "unknown"
            try {
                const nombre = (row.nombre || row.Nombre || row.NOMBRE || "").trim()
                currentRow = nombre
                
                if (!nombre) {
                    errors.push("Fila sin nombre")
                    continue
                }

                const categoria = row.categoria || row.Categoria || row.CATEGORIA || ""
                const tipocolores = row.tipocolores || row.Tipocolores || row.TIPOCOLORES || ""
                const tipodiseno = row.tipodiseno || row.Tipodiseno || row.TIPODISENO || ""
                const descripcion = row.descripcion || row.Descripcion || row.DESCRIPCION || ""
                const precio = parseFloat(row.precio || row.Precio || row.PRECIO) || 0
                const activo = (row.activo || row.Activo || row.ACTIVO || "SI").toUpperCase() === "SI"

                if (!categoria) {
                    errors.push(`Categoría requerida para: ${nombre}`)
                    continue
                }

                if (!precio || precio <= 0) {
                    errors.push(`Precio inválido para: ${nombre}`)
                    continue
                }

                const stockData: { almacenId: string; stock: number }[] = []
                
                for (const almacen of almacenes) {
                    const stockKey = `stock_${almacen.nombre.toLowerCase()}`
                    const stockValue = row[stockKey] || row[`stock_${almacen.nombre}`] || 0
                    const stock = parseInt(stockValue) || 0
                    stockData.push({ almacenId: almacen.id, stock })
                }

                const existing = await prisma.producto.findFirst({
                    where: { nombre, categoria }
                })

                if (existing) {
                    // Update existing product
                    await prisma.producto.update({
                        where: { id: existing.id },
                        data: {
                            tipocolores: tipocolores || null,
                            tipodiseno: tipodiseno || null,
                            descripcion,
                            precio,
                            activo
                        }
                    })

                    // Delete old stocks and create new ones
                    await prisma.productoStock.deleteMany({
                        where: { productoId: existing.id }
                    })

                    // Create new stocks for each warehouse
                    for (const s of stockData) {
                        await prisma.productoStock.create({
                            data: {
                                productoId: existing.id,
                                almacenId: s.almacenId,
                                stock: s.stock
                            }
                        })
                    }

                    updated++
                } else {
                    // Create new product
                    await prisma.producto.create({
                        data: {
                            nombre,
                            categoria,
                            tipocolores: tipocolores || null,
                            tipodiseno: tipodiseno || null,
                            descripcion,
                            precio,
                            activo,
                            stocks: {
                                create: stockData.filter(s => s.stock > 0)
                            }
                        }
                    })
                    created++
                }
            } catch (err: any) {
                errors.push(`Error en ${currentRow}: ${err.message}`)
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Creados: ${created}, Actualizados: ${updated}`,
            created,
            updated,
            errors: errors.length > 0 ? errors : undefined
        })
    } catch (error: any) {
        console.error("Import error:", error)
        return NextResponse.json({ success: false, error: error.message || "Error" }, { status: 500 })
    }
}