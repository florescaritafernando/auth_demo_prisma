import { auth } from "@/lib/auth"
import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AlertTriangle } from "lucide-react"
import { ReclamosCliente } from "./reclamos-cliente"
import { ReclamosAdmin } from "./reclamos-admin"

async function getReclamos() {
    try {
        const cookieStore = await cookies()
        const allCookies = cookieStore.toString()

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/reclamos`, {
            headers: { Cookie: allCookies || "" }
        })

        if (!res.ok) return []

        const json = await res.json()
        return json.reclamos || []
    } catch (e) {
        console.error("getReclamos error:", e)
        return []
    }
}

const TIPO_LABELS: Record<string, string> = {
    queja: "Queja",
    reclamo: "Reclamo"
}

const TIPO_COLORS: Record<string, string> = {
    queja: "bg-red-100 text-red-700",
    reclamo: "bg-orange-100 text-orange-700"
}

const ESTADO_LABELS: Record<string, string> = {
    pendiente: "Pendiente",
    atendido: "Atendido",
    resuelto: "Resuelto"
}

const ESTADO_COLORS: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-700",
    atendido: "bg-blue-100 text-blue-700",
    resuelto: "bg-green-100 text-green-700"
}

export default async function ReclamosPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/login")

    const role = (session.user as any)?.role || "cliente"
    const isCliente = role === "cliente"

    if (!isCliente && !["admin", "empleado"].includes(role)) {
        redirect("/dashboard")
    }

    const reclamos = await getReclamos()

    const stats = {
        total: reclamos.length,
        pendiente: reclamos.filter((r: any) => r.estado === "pendiente").length,
        atendido: reclamos.filter((r: any) => r.estado === "atendido").length,
        resuelto: reclamos.filter((r: any) => r.estado === "resuelto").length,
    }

    return (
        <div className="p-4 md:p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-8">
                    <div>
                        <h1 className="text-xl md:text-3xl font-extrabold text-slate-900">
                            {isCliente ? "Mis Reclamos" : "Gestión de Reclamos"}
                        </h1>
                        <p className="text-sm md:text-base text-slate-500 mt-1">
                            {isCliente ? "Historial de tus quejas y reclamos" : "Administra los reclamos de clientes"}
                        </p>
                    </div>
                </div>

                {isCliente ? (
                    <ReclamosCliente reclamos={reclamos} />
                ) : (
                    <ReclamosAdmin reclamos={reclamos as any} />
                )}
            </div>
        </div>
    )
}