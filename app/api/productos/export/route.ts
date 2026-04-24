import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const format = searchParams.get("format") || "csv"

    try {
        const productos = await prisma.producto.findMany({
            orderBy: { nombre: "asc" },
            include: {
                stocks: {
                    include: { almacen: true }
                }
            }
        })

        const almacenes = await prisma.almacen.findMany({
            orderBy: { nombre: "asc" }
        })

        if (format === "csv") {
            const headers = ["nombre", "categoria", "descripcion", "precio", "activo", ...almacenes.map(a => `stock_${a.nombre}`)]
            const rows = productos.map(p => {
                const stockMap: Record<string, number> = {}
                p.stocks.forEach(s => {
                    stockMap[s.almacen.nombre] = s.stock
                })
                return [
                    `"${p.nombre}"`,
                    `"${p.categoria}"`,
                    `"${p.descripcion || ""}"`,
                    p.precio.toFixed(2),
                    p.activo ? "SI" : "NO",
                    ...almacenes.map(a => stockMap[a.nombre] || 0)
                ].join(",")
            })

            const csv = [headers.join(","), ...rows].join("\n")

            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="productos_${new Date().toISOString().split("T")[0]}.csv"`
                }
            })
        }

        if (format === "pdf") {
            const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Catalogo de Productos</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #1e293b; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f8fafc; }
        .precio { text-align: right; }
        .activo { color: green; }
        .inactivo { color: red; }
    </style>
</head>
<body>
    <h1>Catalogo de Productos - Manchester Collection Peru</h1>
    <p>Fecha: ${new Date().toLocaleDateString("es-PE")}</p>
    <table>
        <thead>
            <tr>
                <th>Articulo</th>
                <th>Categoria</th>
                <th>Precio</th>
                <th>Estado</th>
                ${almacenes.map(a => `<th>${a.nombre}</th>`).join("")}
            </tr>
        </thead>
        <tbody>
            ${productos.map(p => {
                const stockMap: Record<string, number> = {}
                p.stocks.forEach(s => {
                    stockMap[s.almacen.nombre] = s.stock
                })
                return `
            <tr>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td class="precio">S/ ${p.precio.toFixed(2)}</td>
                <td class="${p.activo ? "activo" : "inactivo"}">${p.activo ? "Activo" : "Inactivo"}</td>
                ${almacenes.map(a => `<td>${stockMap[a.nombre] || 0}</td>`).join("")}
            </tr>
                `.trim()
            }).join("")}
        </tbody>
    </table>
</body>
</html>`
            return new NextResponse(html, {
                headers: {
                    "Content-Type": "text/html",
                    "Content-Disposition": `attachment; filename="productos_${new Date().toISOString().split("T")[0]}.html"`
                }
            })
        }

        return NextResponse.json({ success: false, error: "Formato no soportado" }, { status: 400 })
    } catch (error) {
        console.error("Error exporting:", error)
        return NextResponse.json({ success: false, error: "Error al exportar" }, { status: 500 })
    }
}