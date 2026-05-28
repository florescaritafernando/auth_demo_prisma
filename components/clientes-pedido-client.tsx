"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { BotonNuevoClientePedido, BotonEliminarClientePedido } from "@/components/nuevo-cliente-pedido-button"
import { BotonEditarClientePedido } from "@/components/editar-cliente-pedido-button"
import { VerClienteButton } from "@/components/clientes-pedido/ver-cliente-button"
import { DetalleClienteModal } from "@/components/clientes-pedido/detalle-cliente-modal"
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

const AGENCIAS = [
    { value: "", label: "Todas las agencias" },
    { value: "shalom", label: "Shalom" },
    { value: "flores", label: "Flores" },
    { value: "marvisur", label: "Marvisur" },
    { value: "grael", label: "Grael" },
    { value: "rana_express", label: "Rana express" },
    { value: "carhuamayo", label: "Carhuamayo" },
    { value: "otros", label: "Otros" },
]

export function ClientesPedidoClient({ initialClientes }: Props) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [search, setSearch] = useState("")
    const [filtroAgencia, setFiltroAgencia] = useState("")
    const [filtroTipoDoc, setFiltroTipoDoc] = useState("")
    const [detalleClienteId, setDetalleClienteId] = useState<string | null>(null)

    const filtered = initialClientes.filter(c => {
        const matchSearch =
            c.nombre.toLowerCase().includes(search.toLowerCase()) ||
            c.numeroDoc.toLowerCase().includes(search.toLowerCase()) ||
            (c.razonSocial && c.razonSocial.toLowerCase().includes(search.toLowerCase())) ||
            (c.telefono && c.telefono.toLowerCase().includes(search.toLowerCase()))
        const matchAgencia = !filtroAgencia || c.agencia === filtroAgencia
        const matchTipoDoc = !filtroTipoDoc || c.tipoDoc === filtroTipoDoc
        return matchSearch && matchAgencia && matchTipoDoc
    })

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
        const labels: Record<string, string> = { shalom: "Shalom", flores: "Flores", marvisur: "Marvisur", grael: "Grael", rana_express: "Rana express", carhuamayo: "Carhuamayo" }
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

                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, documento, razon social o telefono..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                            />
                        </div>
                        <select
                            value={filtroTipoDoc}
                            onChange={(e) => { setFiltroTipoDoc(e.target.value); setCurrentPage(1) }}
                            className="text-sm border rounded-lg px-3 py-2 bg-white text-slate-700"
                        >
                            <option value="">Todo tipo doc</option>
                            <option value="dni">DNI</option>
                            <option value="ruc">RUC</option>
                            <option value="ce">CE</option>
                        </select>
                        <select
                            value={filtroAgencia}
                            onChange={(e) => { setFiltroAgencia(e.target.value); setCurrentPage(1) }}
                            className="text-sm border rounded-lg px-3 py-2 bg-white text-slate-700"
                        >
                            {AGENCIAS.map(a => (
                                <option key={a.value} value={a.value}>{a.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Nombre</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Documento</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Razon Social</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Telefono</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Agencia</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Ubicacion</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-slate-700 uppercase">Pedidos</th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                                            {search || filtroAgencia || filtroTipoDoc ? "No se encontraron resultados." : "No hay clientes registrados."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((cli) => (
                                        <tr key={cli.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-3 text-sm font-medium text-slate-900">{cli.nombre}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-medium">{getTipoDocLabel(cli.tipoDoc)}</span>
                                                    {cli.numeroDoc}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-sm text-slate-600">{cli.razonSocial || "-"}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">{cli.telefono || "-"}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">{getAgenciaLabel(cli.agencia, cli.agenciaOtro)}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">
                                                {[cli.departamento, cli.provincia, cli.distrito].filter(Boolean).join(" - ") || "-"}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                                                    {cli._count.pedidos}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <VerClienteButton onClick={() => setDetalleClienteId(cli.id)} />
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

            <DetalleClienteModal
                clienteId={detalleClienteId || ""}
                open={!!detalleClienteId}
                onClose={() => setDetalleClienteId(null)}
            />
        </div>
    )
}
