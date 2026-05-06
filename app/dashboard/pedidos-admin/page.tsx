import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Clock, CheckCircle, Package, XCircle, Truck } from "lucide-react"
import { PedidosAdminClient } from "@/components/pedidos-admin-client"

const ESTADO_CONFIG: Record<string, { label: string; color: string; colorTexto: string }> = {
    metraje_en_proceso: { label: "Metraje en proceso", color: "bg-yellow-100", colorTexto: "text-yellow-800" },
    metraje_confirmado: { label: "Metraje confirmado", color: "bg-green-100", colorTexto: "text-green-800" },
    pendiente: { label: "Pago en revisión", color: "bg-blue-100", colorTexto: "text-blue-800" },
    confirmado: { label: "Pago confirmado", color: "bg-blue-200", colorTexto: "text-blue-900" },
    rechazado: { label: "Pedido rechazado", color: "bg-red-100", colorTexto: "text-red-800" },
    completado: { label: "Pedido completado", color: "bg-green-100", colorTexto: "text-green-800" },
}

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
                }
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
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Gestión de Pedidos</h1>
                        <p className="text-slate-500 mt-1">Administra todos los pedidos de clientes</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            <p className="text-sm text-yellow-800 font-medium">Metraje en proceso</p>
                        </div>
                        <p className="text-2xl font-bold text-yellow-700 mt-2">{stats.metraje_en_proceso}</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <p className="text-sm text-green-800 font-medium">Metraje confirmado</p>
                        </div>
                        <p className="text-2xl font-bold text-green-700 mt-2">{stats.metraje_confirmado}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-blue-600" />
                            <p className="text-sm text-blue-800 font-medium">Pago en revisión</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-700 mt-2">{stats.pendiente}</p>
                    </div>
                    <div className="bg-blue-100 border border-blue-300 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-blue-700" />
                            <p className="text-sm text-blue-900 font-medium">Pago confirmado</p>
                        </div>
                        <p className="text-2xl font-bold text-blue-800 mt-2">{stats.confirmado}</p>
                    </div>
                    <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <Truck className="h-5 w-5 text-yellow-600" />
                            <p className="text-sm text-yellow-800 font-medium">Pedido Enviado</p>
                        </div>
                        <p className="text-2xl font-bold text-yellow-700 mt-2">{stats.enviado}</p>
                    </div>
                    <div className="bg-green-100 border border-green-300 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-700" />
                            <p className="text-sm text-green-900 font-medium">Pedido completado</p>
                        </div>
                        <p className="text-2xl font-bold text-green-800 mt-2">{stats.completado}</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <p className="text-sm text-red-800 font-medium">Pedido rechazado</p>
                        </div>
                        <p className="text-2xl font-bold text-red-700 mt-2">{stats.rechazado}</p>
                    </div>
                </div>

                <PedidosAdminClient
                    pedidos={pedidos as any}
                    empleados={empleados as any}
                    role={role}
                    userId={userId}
                />
            </div>
        </div>
    )
}