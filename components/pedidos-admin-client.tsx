"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, X, Calendar, SlidersHorizontal, Wallet } from "lucide-react"
import { PedidoAccordion } from "@/app/dashboard/pedidos-admin/accordion"
import { Pagination } from "@/components/ui/pagination"

interface User {
    id: string
    name: string | null
    email: string | null
}

interface Pedido {
    id: string
    numeroOrden: string
    nombreFactura?: string | null
    estado: string
    createdAt: Date
    user: { id: string; name: string | null; email: string | null } | null
    delegados: { id: string; userId: string; user: { id: string; name: string | null; email: string | null } }[]
}

interface Props {
    pedidos: Pedido[]
    empleados: User[]
    role: string
    userId: string
    pedidosConCargo: Set<string>
}

const ESTADOS = [
    { value: "metraje_en_proceso", label: "Metraje en proceso" },
    { value: "metraje_confirmado", label: "Metraje confirmado" },
    { value: "pendiente", label: "Pago en revisión" },
    { value: "confirmado", label: "Pago confirmado" },
    { value: "rechazado", label: "Pedido rechazado" },
    { value: "completado", label: "Pedido completado" },
]

export function PedidosAdminClient({ pedidos, empleados, role, userId, pedidosConCargo }: Props) {
    const [busqueda, setBusqueda] = useState("")
    const [estadoFiltro, setEstadoFiltro] = useState("")
    const [colaboradorFiltro, setColaboradorFiltro] = useState("")
    const [fechaInicio, setFechaInicio] = useState("")
    const [fechaFin, setFechaFin] = useState("")
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
    const [showFiltros, setShowFiltros] = useState(false)
    const [filtroDeudores, setFiltroDeudores] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)

    useEffect(() => {
        const hash = window.location.hash.slice(1)
        if (hash) {
            setExpandedIds(new Set([hash]))
            window.history.replaceState({}, '', window.location.pathname)
        }
    }, [])

    const handleToggleExpand = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            }
            return next
        })
    }

    const filteredPedidos = useMemo(() => {
        return pedidos.filter(pedido => {
            if (busqueda) {
                const searchLower = busqueda.toLowerCase()
                const numeroOrdenMatch = pedido.numeroOrden.toLowerCase().includes(searchLower)
                const nombreFacturaMatch = (pedido.nombreFactura || "").toLowerCase().includes(searchLower)
                if (!numeroOrdenMatch && !nombreFacturaMatch) {
                    return false
                }
            }

            if (filtroDeudores && !pedidosConCargo.has(pedido.id)) {
                return false
            }

            if (estadoFiltro && pedido.estado !== estadoFiltro) {
                return false
            }

            if (colaboradorFiltro) {
                const tieneColaborador = pedido.delegados?.some(d => d.userId === colaboradorFiltro)
                if (!tieneColaborador) {
                    return false
                }
            }

            if (fechaInicio || fechaFin) {
                const createdAtDate = new Date(pedido.createdAt)
                const year = createdAtDate.getFullYear()
                const month = String(createdAtDate.getMonth() + 1).padStart(2, '0')
                const day = String(createdAtDate.getDate()).padStart(2, '0')
                const pedidoFechaStr = `${year}-${month}-${day}`

                if (fechaInicio && fechaFin) {
                    if (pedidoFechaStr < fechaInicio || pedidoFechaStr > fechaFin) return false
                } else if (fechaInicio) {
                    if (pedidoFechaStr < fechaInicio) return false
                } else if (fechaFin) {
                    if (pedidoFechaStr > fechaFin) return false
                }
            }

            return true
        })
    }, [pedidos, busqueda, estadoFiltro, colaboradorFiltro, fechaInicio, fechaFin, filtroDeudores])

    const limpiarFiltros = () => {
        setBusqueda("")
        setEstadoFiltro("")
        setColaboradorFiltro("")
        setFechaInicio("")
        setFechaFin("")
        setFiltroDeudores(false)
        setCurrentPage(1)
    }

    const tieneFiltros = estadoFiltro || colaboradorFiltro || fechaInicio || fechaFin || filtroDeudores

    const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage)
    const startIdx = (currentPage - 1) * itemsPerPage
    const paginatedPedidos = filteredPedidos.slice(startIdx, startIdx + itemsPerPage)

    return (
        <div>
            <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="N° orden o cliente..."
                        className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                    />
                </div>
                <button
                    onClick={() => setFiltroDeudores(!filtroDeudores)}
                    className={`h-10 px-3 border rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all shrink-0 ${
                        filtroDeudores
                            ? 'border-red-400 bg-red-50 text-red-700'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">Cobrar deudores</span>
                    {filtroDeudores && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                </button>
                <button
                    onClick={() => setShowFiltros(!showFiltros)}
                    className={`h-10 px-3 border rounded-xl flex items-center gap-1.5 text-sm font-medium transition-all shrink-0 ${
                        tieneFiltros
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Filtros</span>
                    {tieneFiltros && <span className="w-2 h-2 bg-white rounded-full" />}
                </button>
            </div>

            {showFiltros && (
                <div className="bg-white rounded-xl border border-slate-200 p-3 mb-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <select
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                            className="h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                        >
                            <option value="">Estado</option>
                            {ESTADOS.map(estado => (
                                <option key={estado.value} value={estado.value}>{estado.label}</option>
                            ))}
                        </select>

                        <select
                            value={colaboradorFiltro}
                            onChange={(e) => setColaboradorFiltro(e.target.value)}
                            className="h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                        >
                            <option value="">Colaborador</option>
                            {empleados.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.name || emp.email}
                                </option>
                            ))}
                        </select>

                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                            <input
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                placeholder="Desde"
                                className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                            />
                        </div>

                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                            <input
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                placeholder="Hasta"
                                className="w-full h-9 pl-9 pr-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-xs text-slate-400">
                            {filteredPedidos.length} de {pedidos.length} pedidos
                        </span>
                        {tieneFiltros && (
                            <button
                                onClick={limpiarFiltros}
                                className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                            >
                                <X className="h-3 w-3" />
                                Limpiar
                            </button>
                        )}
                    </div>
                </div>
            )}

            {filteredPedidos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <p className="text-slate-500">No se encontraron pedidos con los filtros aplicados.</p>
                </div>
            ) : (
                <>
                    <PedidoAccordion
                        pedidos={paginatedPedidos as any}
                        role={role}
                        userId={userId}
                        expandedIds={expandedIds}
                        onToggleExpand={handleToggleExpand}
                        pedidosConCargo={pedidosConCargo}
                    />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        totalItems={filteredPedidos.length}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(value) => {
                            setItemsPerPage(value)
                            setCurrentPage(1)
                        }}
                        itemLabel="pedidos"
                    />
                </>
            )}
        </div>
    )
}
