import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { BotonNuevaTienda } from "@/components/nueva-tienda-button"
import { Plus, Store, Pencil, Trash2, ToggleLeft, ToggleRight, Search, X } from "lucide-react"

export const dynamic = "force-dynamic"

async function getTiendas(busqueda?: string) {
    try {
        const where: any = {}
        if (busqueda) {
            where.OR = [
                { nombre: { contains: busqueda, mode: "insensitive" } },
                { direccion: { contains: busqueda, mode: "insensitive" } },
                { referencia: { contains: busqueda, mode: "insensitive" } }
            ]
        }
        const tiendas = await prisma.tienda.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: { encargado: { select: { id: true, name: true, email: true } } }
        })
        return tiendas
    } catch {
        return []
    }
}

async function getEmpleados() {
    try {
        const usuarios = await prisma.user.findMany({
            where: { role: "empleado" },
            select: { id: true, name: true, email: true }
        })
        return usuarios
    } catch {
        return []
    }
}

export default async function TiendasPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const params = await searchParams
    const busqueda = params?.q || ""
    
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) redirect("/login")
    
    const role = (session.user as any)?.role || "cliente"
    const isAdmin = role === "admin"
    const isEmpleado = role === "empleado"
    
    if (!isAdmin && !isEmpleado) redirect("/dashboard")

    const tiendas = await getTiendas(busqueda)
    const empleados = await getEmpleados()

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-black">{isAdmin ? "Gestion de Tiendas" : "Ver Tiendas"}</h1>
                        <p className="text-black mt-1">{isAdmin ? "Administra tus tiendas para recojo en tienda" : "Visualizacion de tiendas"}</p>
                    </div>
                    {isAdmin && <BotonNuevaTienda />}
                </div>

                <form className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={busqueda}
                            placeholder="Buscar tiendas..."
                            className="w-full pl-10 pr-4 py-2 border border-black rounded-lg text-black"
                        />
                        {busqueda && (
                            <a href="/dashboard/tiendas" className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="h-4 w-4 text-black" />
                            </a>
                        )}
                        <Button type="submit" className="sr-only">Buscar</Button>
                    </div>
                </form>

                <div className="bg-white rounded-xl border border-black overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-black">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-bold text-black uppercase">Nombre</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-black uppercase">Dirección</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-black uppercase">Referencia</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-black uppercase">Encargado</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-black uppercase">Estado</th>
                                {isAdmin && <th className="text-right px-6 py-3 text-xs font-bold text-black uppercase">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black">
                            {tiendas.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="px-6 py-8 text-center text-black">
                                        <Store className="h-12 w-12 mx-auto mb-2 text-black" />
                                        <p>No hay tiendas registradas</p>
                                    </td>
                                </tr>
                            ) : (
                                tiendas.map((tienda) => (
                                    <tr key={tienda.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-black">{tienda.nombre}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-black">{tienda.direccion}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-black">{tienda.referencia || "-"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-black">{tienda.encargado.name}</p>
                                            <p className="text-xs text-black">{tienda.encargado.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${tienda.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                                {tienda.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <form action={`/api/tiendas/${tienda.id}`} method="POST">
                                                        <input type="hidden" name="_method" value="PATCH" />
                                                        <button
                                                            className={`p-2 rounded ${tienda.activo ? "text-red-600 hover:bg-red-50" : "text-green-600 hover:bg-green-50"}`}
                                                            title={tienda.activo ? "Desactivar" : "Activar"}
                                                        >
                                                            {tienda.activo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                                                        </button>
                                                    </form>
                                                    <form action={`/api/tiendas/${tienda.id}`} method="DELETE">
                                                        <button
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </form>
                                                </div>
                                            </td>
                                        )}
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