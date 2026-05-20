"use client"

import { useState } from "react"
import { AlertTriangle, Package, Clock, CheckCircle, ChevronDown, ChevronUp, MessageSquare } from "lucide-react"

interface Reclamo {
    id: string
    tipo: string
    descripcion: string
    detalle_pedido?: string | null
    estado: string
    respuesta?: string | null
    atendidoPor?: { name: string | null } | null
    createdAt: string
    updatedAt?: string
    pedido?: {
        numeroOrden: string
        estado: string
        total: number
    } | null
}

const TIPO_LABELS: Record<string, string> = {
    queja: "Queja",
    reclamo: "Reclamo"
}

const TIPO_COLORS: Record<string, string> = {
    queja: "bg-red-100 text-red-700 border-red-200",
    reclamo: "bg-orange-100 text-orange-700 border-orange-200"
}

const ESTADO_LABELS: Record<string, string> = {
    pendiente: "Pendiente",
    atendido: "Atendido",
    resuelto: "Resuelto"
}

const ESTADO_COLORS: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-700 border-yellow-200",
    atendido: "bg-blue-100 text-blue-700 border-blue-200",
    resuelto: "bg-green-100 text-green-700 border-green-200"
}

const ESTADO_ICONS: Record<string, any> = {
    pendiente: Clock,
    atendido: MessageSquare,
    resuelto: CheckCircle
}

interface ReclamosClienteProps {
    reclamos: Reclamo[]
}

function ReclamoCard({ reclamo }: { reclamo: Reclamo }) {
    const [expanded, setExpanded] = useState(false)
    const IconEstado = ESTADO_ICONS[reclamo.estado] || Clock

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div
                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${TIPO_COLORS[reclamo.tipo]}`}>
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${TIPO_COLORS[reclamo.tipo]}`}>
                                    {TIPO_LABELS[reclamo.tipo] || reclamo.tipo}
                                </span>
                                {reclamo.pedido && (
                                    <span className="text-sm font-medium text-slate-900">
                                        Pedido: {reclamo.pedido.numeroOrden}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 mt-0.5">
                                {new Date(reclamo.createdAt).toLocaleDateString("es-PE", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1 ${ESTADO_COLORS[reclamo.estado]}`}>
                            <IconEstado className="h-3 w-3" />
                            {ESTADO_LABELS[reclamo.estado] || reclamo.estado}
                        </span>
                        {expanded ? (
                            <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                            <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                    </div>
                </div>

                <p className="text-sm text-slate-600 mt-3 line-clamp-2">
                    {reclamo.descripcion}
                </p>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 p-4 bg-slate-50">
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-1">Descripción completa</p>
                            <p className="text-sm text-slate-700">{reclamo.descripcion}</p>
                        </div>

                        {reclamo.detalle_pedido && (
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Detalle del pedido</p>
                                <p className="text-sm text-slate-700">{reclamo.detalle_pedido}</p>
                            </div>
                        )}

                        {reclamo.respuesta && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-xs font-medium text-green-700 uppercase mb-1">Respuesta de Manchester Collection</p>
                                <p className="text-sm text-green-800">{reclamo.respuesta}</p>
                                <p className="text-xs text-green-600 mt-1">
                                    - {reclamo.atendidoPor?.name || "Equipo Manchester Collection Perú"}
                                </p>
                            </div>
                        )}

                        {reclamo.pedido && (
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-slate-600">
                                    <Package className="h-4 w-4" />
                                    <span>Estado: {reclamo.pedido.estado}</span>
                                </div>
                                <div className="text-slate-600">
                                    Total: S/. {reclamo.pedido.total?.toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export function ReclamosCliente({ reclamos }: ReclamosClienteProps) {
    const [filtroEstado, setFiltroEstado] = useState("")

    const filteredReclamos = filtroEstado
        ? reclamos.filter(r => r.estado === filtroEstado)
        : reclamos

    const stats = {
        total: reclamos.length,
        pendiente: reclamos.filter(r => r.estado === "pendiente").length,
        atendido: reclamos.filter(r => r.estado === "atendido").length,
        resuelto: reclamos.filter(r => r.estado === "resuelto").length,
    }

    if (reclamos.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <AlertTriangle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-slate-700 mb-2">No tienes reclamos</h2>
                <p className="text-slate-500">No has realizado ninguna queja o reclamo aún.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Total</p>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendiente}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Atendidos</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.atendido}</p>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                    <p className="text-sm text-slate-500">Resueltos</p>
                    <p className="text-2xl font-bold text-green-600">{stats.resuelto}</p>
                </div>
            </div>

            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFiltroEstado("")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        filtroEstado === ""
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    }`}
                >
                    Todos ({stats.total})
                </button>
                <button
                    onClick={() => setFiltroEstado("pendiente")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        filtroEstado === "pendiente"
                            ? "bg-yellow-600 text-white border-yellow-600"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    }`}
                >
                    Pendientes ({stats.pendiente})
                </button>
                <button
                    onClick={() => setFiltroEstado("atendido")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        filtroEstado === "atendido"
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    }`}
                >
                    Atendidos ({stats.atendido})
                </button>
                <button
                    onClick={() => setFiltroEstado("resuelto")}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                        filtroEstado === "resuelto"
                            ? "bg-green-600 text-white border-green-600"
                            : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                    }`}
                >
                    Resueltos ({stats.resuelto})
                </button>
            </div>

            <div className="space-y-4">
                {filteredReclamos.map(reclamo => (
                    <ReclamoCard key={reclamo.id} reclamo={reclamo} />
                ))}
            </div>
        </div>
    )
}