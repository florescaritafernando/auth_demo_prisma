"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { BotonNuevoAlmacen, BotonEliminarAlmacen } from "@/components/nuevo-almacen-button"
import { BotonEditarAlmacen } from "@/components/editar-almacen-button"
import { Pagination } from "@/components/ui/pagination"

interface Almacen {
    id: string
    nombre: string
    direccion: string
    telefono: string | null
    ciudad: string | null
    activo: boolean
    responsable: { name: string | null } | null
}

interface Props {
    initialAlmacenes: Almacen[]
    isAdmin: boolean
}

export function AlmacenesClient({ initialAlmacenes, isAdmin }: Props) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [search, setSearch] = useState("")
    const [filtroEstado, setFiltroEstado] = useState("")

    const filtered = initialAlmacenes.filter(alm => {
        const matchSearch =
            alm.nombre.toLowerCase().includes(search.toLowerCase()) ||
            alm.direccion.toLowerCase().includes(search.toLowerCase()) ||
            (alm.ciudad && alm.ciudad.toLowerCase().includes(search.toLowerCase())) ||
            (alm.responsable?.name && alm.responsable.name.toLowerCase().includes(search.toLowerCase()))
        const matchEstado = !filtroEstado || (filtroEstado === "activo" ? alm.activo : !alm.activo)
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
                        <h1 className="text-3xl font-extrabold text-slate-900">{isAdmin ? "Gestion de Almacenes" : "Ver Almacenes"}</h1>
                        <p className="text-slate-500 mt-1">{isAdmin ? "Administra tus almacenes" : "Visualizacion de almacenes"}</p>
                    </div>
                    {isAdmin && <BotonNuevoAlmacen />}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, direccion o ciudad..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
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
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Telefono</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Responsable</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Ciudad</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-slate-700 uppercase">Estado</th>
                                    {isAdmin && <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase">Acciones</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={isAdmin ? 7 : 6} className="px-4 py-8 text-center text-slate-500">
                                            {search || filtroEstado ? "No se encontraron resultados." : "No hay almacenes."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((alm) => (
                                        <tr key={alm.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-3 text-sm font-medium text-slate-900">{alm.nombre}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">{alm.direccion}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">{alm.telefono || "-"}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">{alm.responsable?.name || "-"}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">{alm.ciudad || "-"}</td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${alm.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {alm.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-3 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <BotonEditarAlmacen almacen={alm as any} />
                                                        <BotonEliminarAlmacen id={alm.id} />
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
                    itemLabel="almacenes"
                />
            </div>
        </div>
    )
}