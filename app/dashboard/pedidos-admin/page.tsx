import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { Package, Eye, Check, X, Truck } from "lucide-react";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

const PEDIDOS_EJEMPLO = [
    { id: "1", codigo: "PED-001", cliente: "Carlos Mendoza", total: 450, estado: "pendiente", fecha: "2026-04-23" },
    { id: "2", codigo: "PED-002", cliente: "Maria Elena Quispe", total: 850, estado: "confirmado", fecha: "2026-04-22" },
    { id: "3", codigo: "PED-003", cliente: "Roberto Diaz", total: 1200, estado: "enviado", fecha: "2026-04-21" },
    { id: "4", codigo: "PED-004", cliente: "Ana Lucia Torres", total: 2500, estado: "entregado", fecha: "2026-04-20" },
    { id: "5", codigo: "PED-005", cliente: "Juan Perez", total: 320, estado: "cancelado", fecha: "2026-04-19" },
]

const ESTADO_COLORS: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-700",
    confirmado: "bg-blue-100 text-blue-700",
    enviado: "bg-purple-100 text-purple-700",
    entregado: "bg-green-100 text-green-700",
    cancelado: "bg-red-100 text-red-700",
}

const ESTADO_ICONS: Record<string, any> = {
    pendiente: Package,
    confirmado: Check,
    enviado: Truck,
    entregado: Check,
    cancelado: X,
}

export default async function PedidosAdminPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) redirect("/login");
    
    const role = (session.user as any)?.role || "cliente"
    if (role !== "admin") redirect("/dashboard");

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Gestion de Pedidos</h1>
                        <p className="text-slate-500 mt-1">Administra todos los pedidos</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Pendientes</p>
                        <p className="text-2xl font-bold text-yellow-600">12</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Confirmados</p>
                        <p className="text-2xl font-bold text-blue-600">8</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Enviados</p>
                        <p className="text-2xl font-bold text-purple-600">5</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Entregados</p>
                        <p className="text-2xl font-bold text-green-600">45</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Codigo</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {PEDIDOS_EJEMPLO.map((pedido) => (
                                <tr key={pedido.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{pedido.codigo}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{pedido.cliente}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">S/ {pedido.total.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full flex items-center gap-1 w-fit ${ESTADO_COLORS[pedido.estado]}`}>
                                            {pedido.estado.charAt(0).toUpperCase() + pedido.estado.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{pedido.fecha}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Link href={`/dashboard/pedidos-admin/${pedido.id}`}>
                                            <button className="p-2 hover:bg-slate-100 rounded-lg">
                                                <Eye className="h-4 w-4 text-slate-600" />
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}