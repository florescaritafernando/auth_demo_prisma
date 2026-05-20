import Link from "next/link"
import { auth } from "@/lib/auth"
import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Package, FileText } from "lucide-react"
import dynamic from "next/dynamic"

const PedidosList = dynamic(() => import("@/components/pedidos/pedidos-list"))

async function getPedidos() {
    try {
        const cookieStore = await cookies()
        const allCookies = cookieStore.toString()

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/api/pedidos`, {

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

export default async function PedidosPage() {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session?.user) {
        redirect("/login")
    }

    const userRole = (session.user as any)?.role || "cliente"
    const pedidos = await getPedidos()

    return (
        <div className="p-4 md:p-6 lg:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="mb-4 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl md:text-3xl font-extrabold text-slate-900">Mis Pedidos</h1>
                        <p className="text-sm md:text-base text-slate-500 mt-1 md:mt-2">Historial de pedidos realizados</p>
                    </div>
                    {userRole === "admin" && (
                        <Link href="/dashboard/pedidos-admin">
                            <Button variant="outline" className="text-sm">Administrar Pedidos</Button>
                        </Link>
                    )}
                </div>

                {pedidos.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 text-center">
                        <Package className="h-12 w-12 md:h-16 md:w-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-lg md:text-xl font-semibold text-slate-700 mb-2">No tienes pedidos aún</h2>
                        <p className="text-sm text-slate-500 mb-6">Una vez que realices tu primer pedido, podrás ver el historial aquí.</p>
                        <Button asChild className="bg-slate-900 text-white text-sm">
                            <Link href="/dashboard">Ver Catálogo</Link>
                        </Button>
                    </div>
                ) : (
                    <PedidosList pedidos={pedidos} userRole={userRole} />
                )}
            </div>
        </div>
    )
}