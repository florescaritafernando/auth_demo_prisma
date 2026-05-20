import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { DashboardClient } from "./dashboard-client"

export const dynamic = "force-dynamic"

async function getProductos() {
    try {
        const productos = await prisma.producto.findMany({
            where: { activo: true },
            orderBy: { createdAt: "desc" },
            include: {
                stocks: {
                    include: { almacen: { select: { id: true, nombre: true, ciudad: true } } }
                }
            },
        })
        return productos
    } catch {
        return []
    }
}

export default async function DashboardPage() {
    const headersList = await headers()
    const session = await auth.api.getSession({
        headers: headersList
    })

    if (!session) redirect("/login")

    const role = (session.user as any)?.role || "cliente"
    const esStaff = role === "empleado" || role === "admin"
    const productos = esStaff ? [] : await getProductos()

    return (
        <DashboardClient
            productos={productos as any}
            userName={session?.user?.name || "Cliente"}
            userRole={role}
        />
    )
}