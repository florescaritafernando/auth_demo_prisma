"use client"

import { useState } from "react"
import { Search, Wallet } from "lucide-react"
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
    direccion: string | null
    telefono: string | null
    agencia: string | null
    agenciaOtro: string | null
    guiaRemision: boolean
    departamento: string | null
    provincia: string | null
    distrito: string | null
    _count: { pedidos: number }
    cartera?: { saldo: number } | null
}

interface Props {
    initialClientes: ClientePedido[]
    userRole?: string
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

export function ClientesPedidoClient({ initialClientes, userRole }: Props) {
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [search, setSearch] = useState("")
    const [filtroCartera, setFiltroCartera] = useState(false)
    const [detalleClienteId, setDetalleClienteId] = useState<string | null>(null)

    const filtered = initialClientes.filter(c => {
        const matchSearch =
            c.nombre.toLowerCase().includes(search.toLowerCase()) ||
            c.numeroDoc.toLowerCase().includes(search.toLowerCase()) ||
            (c.telefono && c.telefono.toLowerCase().includes(search.toLowerCase()))
        const matchCartera = !filtroCartera || c.cartera !== null
        return matchSearch && matchCartera
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
                    <div className="flex flex-row gap-2 items-center">
                        <div className="flex-1 min-w-0 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all bg-white"
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                            />
                        </div>
                        <button
                            onClick={() => { setFiltroCartera(!filtroCartera); setCurrentPage(1) }}
                            className={`flex items-center gap-1.5 px-3 py-2.5 border-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                                filtroCartera
                                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                    : "bg-white border-slate-300 text-slate-600 hover:text-blue-600"
                            }`}
                        >
                            <Wallet className="h-4 w-4" />
                            <span className="hidden sm:inline">Filtrar por </span>Cartera
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead className="bg-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Cartera</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Nombre</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Documento</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Direccion</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Telefono</th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            {search ? "No se encontraron resultados." : "No hay clientes registrados."}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((cli) => (
                                        <tr key={cli.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-3.5 sm:py-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <VerClienteButton onClick={() => setDetalleClienteId(cli.id)} />
                                                    {cli.cartera !== null && (
                                                    <span className={`font-bold ${(cli.cartera?.saldo || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                        S/ {(cli.cartera?.saldo || 0).toFixed(2)}
                                                    </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-3 py-3.5 sm:py-3 text-sm font-medium text-slate-900 uppercase">{cli.nombre}</td>
                                            <td className="px-3 py-3.5 sm:py-3 text-sm text-slate-600 uppercase">
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-medium">{getTipoDocLabel(cli.tipoDoc)}</span>
                                                    {cli.numeroDoc}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3.5 sm:py-3 text-sm text-slate-600 uppercase">{cli.direccion || "-"}</td>
                                            <td className="px-3 py-3.5 sm:py-3 text-sm text-slate-600 uppercase">{cli.telefono || "-"}</td>
                                            <td className="px-3 py-3.5 sm:py-3 text-right">
                                                <div className="flex justify-end gap-3 sm:gap-1.5">
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
                userRole={userRole}
            />
        </div>
    )
}
