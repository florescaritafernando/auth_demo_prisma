"use client"

import { useState } from "react"
import { BotonNuevoClientePedido, BotonEliminarClientePedido } from "@/components/nuevo-cliente-pedido-button"
import { BotonEditarClientePedido } from "@/components/editar-cliente-pedido-button"
import { Pagination } from "@/components/ui/pagination"

interface ClientePedido {
    id: string
    nombre: string
    tipoDoc: string
    numeroDoc: string
    razonSocial: string | null
    direccion: string | null
    telefono: string | null
    agencia: string | null
    agenciaOtro: string | null
    guiaRemision: boolean
    departamento: string | null
    provincia: string | null
    distrito: string | null
    _count: { pedidos: number }
}

interface Props {
    initialClientes: ClientePedido[]
}

export function ClientesPedidoClient({ initialClientes }: Props) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [search, setSearch] = useState("")

    const filtered = initialClientes.filter(c =>
        c.nombre.toLowerCase().includes(search.toLowerCase()) ||
        c.numeroDoc.toLowerCase().includes(search.toLowerCase()) ||
        (c.razonSocial && c.razonSocial.toLowerCase().includes(search.toLowerCase())) ||
        (c.telefono && c.telefono.toLowerCase().includes(search.toLowerCase()))
    )

    const totalPages = Math.ceil(filtered.length / itemsPerPage)
    const startIdx = (currentPage - 1) * itemsPerPage
    const paginatedData = filtered.slice(startIdx, startIdx + itemsPerPage)

    const getTipoDocLabel = (tipo: string) => {
        switch (tipo) {
            case "dni": return "DNI"
            case "ruc": return "RUC"
            case "ce": return "CE"
            default: return tipo
        }
    }

    const getAgenciaLabel = (agencia: string | null, otro: string | null) => {
        if (!agencia) return "-"
        if (agencia === "otros") return otro || "Otros"
        const labels: Record<string, string> = { shalom: "Shalom", flores: "Flores", marvisur: "Marvisur" }
        return labels[agencia] || agencia
    }

    return (
        <div className="p-4 md:p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Gestion de Clientes</h1>
                        <p className="text-slate-500 mt-1">Administra los clientes para pedidos de empleados</p>
                    </div>
                    <BotonNuevoClientePedido />
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, documento, razon social o telefono..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                        className="w-full md:w-96 px-4 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
                    />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nombre</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Documento</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Razon Social</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Telefono</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Agencia</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Ubicacion</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Pedidos</th>
                                <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                                        {search ? "No se encontraron resultados." : "No hay clientes registrados."}
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((cli) => (
                                    <tr key={cli.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{cli.nombre}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            <span className="inline-flex items-center gap-1">
                                                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-medium">{getTipoDocLabel(cli.tipoDoc)}</span>
                                                {cli.numeroDoc}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{cli.razonSocial || "-"}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{cli.telefono || "-"}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{getAgenciaLabel(cli.agencia, cli.agenciaOtro)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {[cli.departamento, cli.provincia, cli.distrito].filter(Boolean).join(", ") || "-"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                {cli._count.pedidos}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <BotonEditarClientePedido cliente={cli as any} />
                                                <BotonEliminarClientePedido id={cli.id} />
                                            </div>
                                        </td>
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
                    totalItems={filtered.length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(value) => {
                        setItemsPerPage(value)
                        setCurrentPage(1)
                    }}
                    itemLabel="clientes"
                />
            </div>
        </div>
    )
}
