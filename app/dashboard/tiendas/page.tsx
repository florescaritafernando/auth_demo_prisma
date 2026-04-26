import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus, Store, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react"

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

async function getUsuarios() {
    try {
        const usuarios = await prisma.user.findMany({
            where: { role: { in: ["admin", "empleado"] } },
            select: { id: true, name: true, email: true }
        })
        return usuarios
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
    if (role !== "admin" && role !== "empleado") redirect("/dashboard")

    const tiendas = await getTiendas()
    const usuarios = await getUsuarios()

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Gestión de Tiendas</h1>
                        <p className="text-slate-500 mt-1">Administra tus tiendas para recojo en tienda</p>
                    </div>
                    <form action={async () => {
                        "use server"
                        const { pathname } = require("next/headers")
                    }}>
                        <Button formAction={async () => {
                            "use server"
                        }} type="button" className="bg-green-600 hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Nueva Tienda
                        </Button>
                    </form>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nombre</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Dirección</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Referencia</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Encargado</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {tiendas.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        <Store className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                        <p>No hay tiendas registradas</p>
                                    </td>
                                </tr>
                            ) : (
                                tiendas.map((tienda) => (
                                    <tr key={tienda.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-900">{tienda.nombre}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">{tienda.direccion}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">{tienda.referencia || "-"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">{tienda.encargado.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tienda.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {tienda.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Editar"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button
                                                    className={`p-2 rounded ${tienda.activo ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}
                                                    title={tienda.activo ? "Desactivar" : "Activar"}
                                                >
                                                    {tienda.activo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
