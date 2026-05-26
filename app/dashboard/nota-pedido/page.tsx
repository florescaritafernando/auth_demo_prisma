import { auth } from "@/lib/auth"
import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, Package } from "lucide-react"
import Link from "next/link"
import dynamic from "next/dynamic"

const NotaPedidoList = dynamic(() => import("@/components/nota-pedido-list"))

async function getPedidos(userRole: string) {
    try {
        const cookieStore = await cookies()
        const allCookies = cookieStore.toString()

        const query = userRole === "empleado" ? "?todas=true" : ""
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/pedidos${query}`, {
            headers: { Cookie: allCookies || "" }
        })

        if (!res.ok) return []

        const json = await res.json()
        return json.pedidos || []
    } catch (e) {
        console.error("getPedidos error:", e)
        return []
    }
}

export default async function NotaPedidoPage() {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
        redirect("/login")
    }

    const userRole = (session.user as any)?.role || "cliente"

    if (userRole !== "admin" && userRole !== "empleado") {
        redirect("/dashboard")
    }

    const pedidos = await getPedidos(userRole)

    return (
        <div className="p-4 md:p-6 lg:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex-2 items-center gap-3">
                        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Historial de Pedidos</h1>
                        <p className="text-sm text-slate-500">Detalle completo de pedidos creados</p>
                </div>

                {pedidos.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center">
                        <FileText className="h-12 w-12 md:h-16 md:w-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-lg md:text-xl font-semibold text-slate-700 mb-2">No hay pedidos aún</h2>
                        <p className="text-sm text-slate-500 mb-6">Los pedidos que crees aparecerán aquí con todos sus detalles.</p>
                        <Link href="/dashboard">
                            <Button className="bg-slate-900 text-white text-sm">Crear Pedido</Button>
                        </Link>
                    </div>
                ) : (
                    <NotaPedidoList pedidos={pedidos} userRole={userRole} />
                )}
            </div>
        </div>
    )
}
