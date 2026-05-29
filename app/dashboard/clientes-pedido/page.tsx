import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { ClientesPedidoClient } from "@/components/clientes-pedido-client"

export const dynamic = "force-dynamic"

async function getClientes() {
    try {
        const clientes = await prisma.clientePedido.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { pedidos: true }
                },
                cartera: {
                    select: { saldo: true }
                }
            }
        })
        return clientes
    } catch {
        return []
    }
}

export default async function ClientesPedidoPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/login")

    const role = (session.user as any)?.role || "cliente"
    if (role !== "admin" && role !== "empleado") redirect("/dashboard")

    const clientes = await getClientes()

    return <ClientesPedidoClient initialClientes={clientes as any} userRole={role} />
}
