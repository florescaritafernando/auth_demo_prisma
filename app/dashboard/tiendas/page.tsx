import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { TiendasClient } from "@/components/tiendas-client"

export const dynamic = "force-dynamic"

async function getTiendas() {
    try {
        const tiendas = await prisma.tienda.findMany({
            orderBy: { createdAt: "desc" },
            include: { encargado: { select: { id: true, name: true, email: true } } }
        })
        return tiendas
    } catch {
        return []
    }
}

export default async function TiendasPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/login")
    
    const role = (session.user as any)?.role || "cliente"
    const isAdmin = role === "admin"
    const isEmpleado = role === "empleado"
    
    if (!isAdmin && !isEmpleado) redirect("/dashboard")

    const tiendas = await getTiendas()

    return <TiendasClient initialTiendas={tiendas as any} isAdmin={isAdmin} />
}