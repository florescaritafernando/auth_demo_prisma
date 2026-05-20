"use client"

import { useState } from "react"
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

    const totalPages = Math.ceil(initialAlmacenes.length / itemsPerPage)
    const startIdx = (currentPage - 1) * itemsPerPage
    const paginatedData = initialAlmacenes.slice(startIdx, startIdx + itemsPerPage)

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

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nombre</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Direccion</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Telefono</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Responsable</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Ciudad</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                {isAdmin && <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">Acciones</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={isAdmin ? 7 : 6} className="px-6 py-8 text-center text-slate-500">
                                        No hay almacenes.
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((alm) => (
                                    <tr key={alm.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{alm.nombre}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{alm.direccion}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{alm.telefono || "-"}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{alm.responsable?.name || "-"}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{alm.ciudad || "-"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${alm.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {alm.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4 text-right">
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

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={itemsPerPage}
                    totalItems={initialAlmacenes.length}
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