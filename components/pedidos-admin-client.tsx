"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PedidoAccordion } from "@/app/dashboard/pedidos-admin/accordion"

interface User {
    id: string
    name: string | null
    email: string | null
}

interface Pedido {
    id: string
    numeroOrden: string
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
}

const ESTADOS = [
    { value: "metraje_en_proceso", label: "Metraje en proceso" },
    { value: "metraje_confirmado", label: "Metraje confirmado" },
    { value: "pendiente", label: "Pago en revisión" },
    { value: "confirmado", label: "Pago confirmado" },
    { value: "rechazado", label: "Pedido rechazado" },
    { value: "completado", label: "Pedido completado" },
]

export function PedidosAdminClient({ pedidos, empleados, role, userId }: Props) {
    const [busqueda, setBusqueda] = useState("")
    const [estadoFiltro, setEstadoFiltro] = useState("")
    const [colaboradorFiltro, setColaboradorFiltro] = useState("")
    const [fechaInicio, setFechaInicio] = useState("")
    const [fechaFin, setFechaFin] = useState("")
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

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
            // Buscador por número de pedido o cliente
            if (busqueda) {
                const searchLower = busqueda.toLowerCase()
                const numeroOrdenMatch = pedido.numeroOrden.toLowerCase().includes(searchLower)
                const clienteNameMatch = pedido.user?.name?.toLowerCase().includes(searchLower)
                const clienteEmailMatch = pedido.user?.email?.toLowerCase().includes(searchLower)
                if (!numeroOrdenMatch && !clienteNameMatch && !clienteEmailMatch) {
                    return false
                }
            }

            // Filtro por estado
            if (estadoFiltro && pedido.estado !== estadoFiltro) {
                return false
            }

            // Filtro por colaborador
            if (colaboradorFiltro) {
                const tieneColaborador = pedido.delegados?.some(d => d.userId === colaboradorFiltro)
                if (!tieneColaborador) {
                    return false
                }
            }

            // Filtro por rango de fechas
            if (fechaInicio || fechaFin) {
                // Convertir createdAt a fecha local YYYY-MM-DD
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
    }, [pedidos, busqueda, estadoFiltro, colaboradorFiltro, fechaInicio, fechaFin])

    const limpiarFiltros = () => {
        setBusqueda("")
        setEstadoFiltro("")
        setColaboradorFiltro("")
        setFechaInicio("")
        setFechaFin("")
    }

    const tieneFiltrosActivos = busqueda || estadoFiltro || colaboradorFiltro || fechaInicio || fechaFin

    return (
        <div>
            {/* Filtros */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                    {/* Buscador */}
                    <div className="relative h-10">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            placeholder="Buscar pedido o cliente..."
                            className="w-full h-full pl-10 pr-4 border border-slate-300 rounded-lg text-sm text-black"
                        />
                    </div>

                    {/* Filtro Estado */}
                    <select
                        value={estadoFiltro}
                        onChange={(e) => setEstadoFiltro(e.target.value)}
                        className="h-10 px-3 border border-slate-300 rounded-lg text-sm text-black"
                    >
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(estado => (
                            <option key={estado.value} value={estado.value}>{estado.label}</option>
                        ))}
                    </select>

                    {/* Filtro Colaborador */}
                    <select
                        value={colaboradorFiltro}
                        onChange={(e) => setColaboradorFiltro(e.target.value)}
                        className="h-10 px-3 border border-slate-300 rounded-lg text-sm text-black"
                    >
                        <option value="">Todos los colaboradores</option>
                        {empleados.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.name || emp.email}
                            </option>
                        ))}
                    </select>

                    {/* Fecha Inicio */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">Fecha inicio</label>
                        <div className="relative h-10 flex items-center" onClick={() => (document.getElementById('fecha-inicio') as HTMLInputElement)?.showPicker()}>
                            <Calendar className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                id="fecha-inicio"
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                                className="w-full h-full pl-10 pr-2 border border-slate-300 rounded-lg text-sm text-black cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Fecha Fin */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">Fecha fin</label>
                        <div className="relative h-10 flex items-center" onClick={() => (document.getElementById('fecha-fin') as HTMLInputElement)?.showPicker()}>
                            <Calendar className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                id="fecha-fin"
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                                className="w-full h-full pl-10 pr-2 border border-slate-300 rounded-lg text-sm text-black cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                {tieneFiltrosActivos && (
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-slate-500">
                            {filteredPedidos.length} resultado(s) de {pedidos.length} pedidos
                        </span>
                        <button
                            onClick={limpiarFiltros}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            <X className="h-3 w-3" />
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>

            {/* Lista de Pedidos */}
            {filteredPedidos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <p className="text-slate-500">No se encontraron pedidos con los filtros aplicados.</p>
                </div>
            ) : (
                <PedidoAccordion
                    pedidos={filteredPedidos as any}
                    role={role}
                    userId={userId}
                    expandedIds={expandedIds}
                    onToggleExpand={handleToggleExpand}
                />
            )}
        </div>
    )
}