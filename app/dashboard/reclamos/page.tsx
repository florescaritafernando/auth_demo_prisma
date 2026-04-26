import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Eye, Check, MessageSquare } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

const RECLAMOS_EJEMPLO = [
    { id: "1", tipo: "Producto Defectuoso", cliente: "Carlos Mendoza", pedido: "PED-001", descripcion: "La tela tiene una mancha que no aparece en la foto", estado: "pendiente", fecha: "2026-04-23" },
    { id: "2", tipo: "Cantidad Incorrecta", cliente: "Maria Elena Quispe", pedido: "PED-002", descripcion: "Me enviaron 5 metros menos de lo solicitado", estado: "atendido", fecha: "2026-04-22" },
    { id: "3", tipo: "Retraso en Entrega", cliente: "Roberto Diaz", pedido: "PED-003", descripcion: "El pedido tardo 5 dias mas de lo acordado", estado: "pendiente", fecha: "2026-04-21" },
    { id: "4", tipo: "Producto Incorrecto", cliente: "Ana Lucia Torres", pedido: "PED-005", descripcion: "El color no es el que pedi", estado: "pendiente", fecha: "2026-04-20" },
]

const TIPO_COLORS: Record<string, string> = {
    "Producto Defectuoso": "bg-red-100 text-red-700",
    "Cantidad Incorrecta": "bg-orange-100 text-orange-700",
    "Retraso en Entrega": "bg-yellow-100 text-yellow-700",
    "Producto Incorrecto": "bg-blue-100 text-blue-700",
}

const ESTADO_COLORS: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-700",
    atendido: "bg-blue-100 text-blue-700",
    resuelto: "bg-green-100 text-green-700",
}

export default async function ReclamosPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) redirect("/login");
    
    const role = (session.user as any)?.role || "cliente"
    if (!["admin", "empleado"].includes(role)) redirect("/dashboard");

    const isAdmin = role === "admin"

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Gestion de Reclamos</h1>
                        <p className="text-slate-500 mt-1">Administra los reclamos de clientes</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Total Reclamos</p>
                        <p className="text-2xl font-bold text-slate-900">15</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Pendientes</p>
                        <p className="text-2xl font-bold text-yellow-600">8</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Atendidos</p>
                        <p className="text-2xl font-bold text-green-600">7</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Tipo</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Pedido</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Descripcion</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {RECLAMOS_EJEMPLO.map((reclamo) => (
                                <tr key={reclamo.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${TIPO_COLORS[reclamo.tipo] || 'bg-slate-100 text-slate-600'}`}>
                                            {reclamo.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{reclamo.cliente}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{reclamo.pedido}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{reclamo.descripcion}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${ESTADO_COLORS[reclamo.estado]}`}>
                                            {reclamo.estado.charAt(0).toUpperCase() + reclamo.estado.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{reclamo.fecha}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link href={`/dashboard/reclamos/${reclamo.id}`}>
                                                <button className="p-2 hover:bg-slate-100 rounded-lg">
                                                    <Eye className="h-4 w-4 text-slate-600" />
                                                </button>
                                            </Link>
                                            <button className="p-2 hover:bg-blue-50 rounded-lg">
                                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                            </button>
                                        </div>
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