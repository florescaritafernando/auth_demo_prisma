"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { BotonNuevaTienda } from "@/components/nueva-tienda-button"
import { BotonEditarTienda } from "@/components/editar-tienda-button"
import { BotonEliminarTienda } from "@/components/eliminar-tienda-button"
import { Pagination } from "@/components/ui/pagination"

interface Encargado {
    id: string
    name: string | null
    email: string | null
}

interface Tienda {
    id: string
    nombre: string
    direccion: string
    referencia: string | null
    activo: boolean
    encargado: Encargado | null
}

interface Props {
    initialTiendas: Tienda[]
    isAdmin: boolean
}

export function TiendasClient({ initialTiendas, isAdmin }: Props) {
    const [busqueda, setBusqueda] = useState("")
    const [filtroEstado, setFiltroEstado] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    const filtered = initialTiendas.filter(t => {
        const matchSearch =
            t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
            t.direccion.toLowerCase().includes(busqueda.toLowerCase()) ||
            (t.referencia?.toLowerCase().includes(busqueda.toLowerCase()) ?? false) ||
            (t.encargado?.name?.toLowerCase().includes(busqueda.toLowerCase()) ?? false)
        const matchEstado = !filtroEstado || (filtroEstado === "activo" ? t.activo : !t.activo)
        return matchSearch && matchEstado
    })

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const startIdx = (currentPage - 1) * itemsPerPage
    const paginatedData = filtered.slice(startIdx, startIdx + itemsPerPage)

    return (
        <div className="p-4 md:p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">{isAdmin ? "Gestion de Tiendas" : "Ver Tiendas"}</h1>
                        <p className="text-slate-500 mt-1">{isAdmin ? "Administra tus tiendas para recojo en tienda" : "Visualizacion de tiendas"}</p>
                    </div>
                    {isAdmin && <BotonNuevaTienda />}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, direccion o referencia..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400"
                                value={busqueda}
                                onChange={(e) => { setBusqueda(e.target.value); setCurrentPage(1) }}
                            />
                        </div>
                        <select
                            value={filtroEstado}
                            onChange={(e) => { setFiltroEstado(e.target.value); setCurrentPage(1) }}
                            className="text-sm border rounded-lg px-3 py-2 bg-white text-slate-700"
                        >
                            <option value="">Todos los estados</option>
                            <option value="activo">Activo</option>
                            <option value="inactivo">Inactivo</option>
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead className="bg-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Nombre</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Direccion</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Referencia</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Encargado</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-slate-700 uppercase">Estado</th>
                                    {isAdmin && <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-slate-500">
                                            {busqueda || filtroEstado ? "No se encontraron resultados." : "No hay tiendas registradas."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((tienda) => (
                                        <tr key={tienda.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-3 text-sm font-medium text-slate-900">{tienda.nombre}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">{tienda.direccion}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">{tienda.referencia || "-"}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">
                                                {tienda.encargado?.name || "-"}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${tienda.activo ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                                                    {tienda.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-3 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <BotonEditarTienda tienda={tienda as any} />
                                                        <BotonEliminarTienda id={tienda.id} />
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

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={filtered.length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(value) => {
                        setItemsPerPage(value)
                        setCurrentPage(1)
                    }}
                    itemLabel="tiendas"
                />
            </div>
        </div>
    )
}
