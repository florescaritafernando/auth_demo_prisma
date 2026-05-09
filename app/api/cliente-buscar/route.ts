import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const query = request.nextUrl.searchParams.get("q") || ""
        
        if (query.length < 2) {
            return NextResponse.json({ success: true, clientes: [] })
        }

        // Buscar en Users
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { email: { contains: query, mode: "insensitive" } },
                    { numeroDoc: { contains: query, mode: "insensitive" } },
                ]
            },
            take: 10
        })

        // Buscar en ClientePedido
        const clientesPedido = await prisma.clientePedido.findMany({
            where: {
                OR: [
                    { nombre: { contains: query, mode: "insensitive" } },
                    { numeroDoc: { contains: query, mode: "insensitive" } },
                ]
            },
            take: 10
        })

        // Unificar resultados
        const results = [
            ...users.map(u => ({
                id: u.id,
                nombre: u.name || u.email || "",
                tipoDoc: u.tipoDocumento || "dni",
                numeroDoc: u.numeroDoc || "",
                direccion: u.direccion || "",
                telefono: u.celular || "",
                origen: "user" as const
            })),
            ...clientesPedido.map(c => ({
                id: c.id,
                nombre: c.nombre,
                tipoDoc: c.tipoDoc,
                numeroDoc: c.numeroDoc,
                direccion: c.direccion || "",
                telefono: c.telefono || "",
                origen: "cliente_pedido" as const
            }))
        ]

        return NextResponse.json({ success: true, clientes: results.slice(0, 15) })
    } catch (error: any) {
        console.error("Error buscando clientes:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}