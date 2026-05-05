import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { AlmacenesClient } from "@/components/almacenes-client"

export const dynamic = "force-dynamic"

async function getAlmacenes() {
    try {
        const almacenes = await prisma.almacen.findMany({
            orderBy: { createdAt: "desc" },
            include: { 
                stocks: { select: { id: true } },
                responsable: { select: { name: true } }
            }
        })
        return almacenes
    } catch {
        return []
    }
}

export default async function AlmacenesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/login")
    
    const role = (session.user as any)?.role || "cliente"
    if (!["admin", "empleado"].includes(role)) redirect("/dashboard")

    const isAdmin = role === "admin"
    const almacenes = await getAlmacenes()

    return <AlmacenesClient initialAlmacenes={almacenes as any} isAdmin={isAdmin} />
}