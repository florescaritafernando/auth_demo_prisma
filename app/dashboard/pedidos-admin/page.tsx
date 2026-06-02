import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { PedidosAdminClient } from "@/components/pedidos-admin-client"

async function getPedidos() {
    try {
        return await prisma.pedido.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                pedidoDetalle: {
                    include: {
                        producto: { select: { id: true, nombre: true, categoria: true } },
                        etiquetas: { orderBy: { createdAt: "asc" } }
                    }
                },
                tienda: { select: { id: true, nombre: true, direccion: true } },
                delegados: {
                    include: { user: { select: { id: true, name: true, email: true } } }
                },
                pedidoEmpleadoInfo: { select: { empresa: true, metodoPago: true } }
            },
            orderBy: { createdAt: "desc" }
        })
    } catch (e) {
        console.error("Error fetching pedidos:", e)
        return []
    }
}

async function getEmpleados() {
    try {
        return await prisma.user.findMany({
            where: { role: "empleado" },
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" }
        })
    } catch (e) {
        console.error("Error fetching empleados:", e)
        return []
    }
}

export default async function PedidosAdminPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/login")

    const role = (session.user as any)?.role || "cliente"
    const userId = session.user.id
    if (!["admin", "empleado"].includes(role)) redirect("/dashboard")

    const [pedidos, empleados] = await Promise.all([getPedidos(), getEmpleados()])

    const pedidoIds = pedidos.map(p => p.id)
    const movimientosCartera = await prisma.carteraMovimiento.findMany({
        where: { pedidoId: { in: pedidoIds }, tipo: "cargo" },
        select: { pedidoId: true }
    })
    const pedidosConCargo: Set<string> = new Set(movimientosCartera.map(m => m.pedidoId).filter((id): id is string => !!id))

    const stats = {
        metraje_en_proceso: pedidos.filter(p => p.estado === "metraje_en_proceso").length,
        metraje_confirmado: pedidos.filter(p => p.estado === "metraje_confirmado").length,
        pendiente: pedidos.filter(p => p.estado === "pendiente").length,
        confirmado: pedidos.filter(p => p.estado === "confirmado").length,
        enviado: pedidos.filter(p => p.estado === "pedido_enviado").length,
        completado: pedidos.filter(p => p.estado === "completado").length,
        rechazado: pedidos.filter(p => p.estado === "rechazado").length,
    }

    return (
        <div className="p-4 md:p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-8">
                    <div>
                        <h1 className="text-xl md:text-3xl font-extrabold text-slate-900">Gestión de Pedidos</h1>
                        <p className="text-sm md:text-base text-slate-500 mt-1">Administra todos los pedidos de clientes</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4 md:mb-8">
                    <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md px-2 py-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
                        <span className="text-[10px] text-gray-800 leading-tight whitespace-nowrap">Metraje en proceso</span>
                        <span className="text-xs font-bold text-gray-900">{stats.metraje_en_proceso}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 rounded-md px-2 py-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                        <span className="text-[10px] text-sky-800 leading-tight whitespace-nowrap">Metraje confirmado</span>
                        <span className="text-xs font-bold text-sky-900">{stats.metraje_confirmado}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                        <span className="text-[10px] text-amber-800 leading-tight whitespace-nowrap">Pago en revisión</span>
                        <span className="text-xs font-bold text-amber-900">{stats.pendiente}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 rounded-md px-2 py-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        <span className="text-[10px] text-emerald-800 leading-tight whitespace-nowrap">Pago confirmado</span>
                        <span className="text-xs font-bold text-emerald-900">{stats.confirmado}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-blue-50 border border-blue-300 rounded-md px-2 py-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                        <span className="text-[10px] text-blue-800 leading-tight whitespace-nowrap">Pedido enviado</span>
                        <span className="text-xs font-bold text-blue-900">{stats.enviado}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-md px-2 py-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-slate-500 shrink-0" />
                        <span className="text-[10px] text-slate-800 leading-tight whitespace-nowrap">Completado</span>
                        <span className="text-xs font-bold text-slate-900">{stats.completado}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-md px-2 py-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        <span className="text-[10px] text-red-800 leading-tight whitespace-nowrap">Rechazado</span>
                        <span className="text-xs font-bold text-red-900">{stats.rechazado}</span>
                    </div>
                </div>

                <PedidosAdminClient
                    pedidos={pedidos as any}
                    empleados={empleados as any}
                    role={role}
                    userId={userId}
                    pedidosConCargo={pedidosConCargo}
                />
            </div>
        </div>
    )
}