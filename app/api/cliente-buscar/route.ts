import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
    try {
        const query = request.nextUrl.searchParams.get("q") || ""
        
        if (query.length < 2) {
            return NextResponse.json({ success: true, clientes: [] })
        }

        const clientes = await prisma.clientePedido.findMany({
            where: {
                OR: [
                    { nombre: { contains: query, mode: "insensitive" } },
                    { numeroDoc: { contains: query, mode: "insensitive" } },
                ]
            },
            take: 15,
            orderBy: { updatedAt: "desc" }
        })

        const results = clientes.map(c => ({
            id: c.id,
            nombre: c.nombre,
            tipoDoc: c.tipoDoc,
            numeroDoc: c.numeroDoc,
            razonSocial: c.razonSocial || "",
            direccion: c.direccion || "",
            telefono: c.telefono || "",
            agencia: c.agencia || "",
            agenciaOtro: c.agenciaOtro || "",
            guiaRemision: c.guiaRemision,
            departamento: c.departamento || "",
            provincia: c.provincia || "",
            distrito: c.distrito || "",
            origen: "cliente_pedido" as const
        }))

        return NextResponse.json({ success: true, clientes: results })
    } catch (error: any) {
        console.error("Error buscando clientes:", error)
        return NextResponse.json({ success: false, error: "Error interno" }, { status: 500 })
    }
}
