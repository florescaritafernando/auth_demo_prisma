"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, Pencil, Save, RotateCcw, Plus, Trash2, Edit3, X, Tag, UserPlus } from "lucide-react"
import { RechazarPedidoModal } from "@/components/pedidos/RechazarPedidoModal"

const ESTADOS_DISPONIBLES = [
    { value: "metraje_en_proceso", label: "Metraje en proceso", color: "bg-yellow-100 text-yellow-800" },
    { value: "metraje_confirmado", label: "Metraje confirmado", color: "bg-green-100 text-green-800" },
    { value: "pendiente", label: "Pendiente", color: "bg-blue-100 text-blue-800" },
    { value: "confirmado", label: "Confirmado", color: "bg-blue-200 text-blue-900" },
    { value: "rechazado", label: "Rechazado", color: "bg-red-100 text-red-800" },
    { value: "completado", label: "Completado", color: "bg-green-100 text-green-800" },
]

interface DetalleItem {
    id: string
    cantidad: number
    tipo: string
    metraje: number | null
    producto: { id: string; nombre: string; categoria: string }
    precio: number
    etiquetas?: { id: string; valor: number; createdAt: string }[]
}

interface Pedido {
    id: string
    numeroOrden: string
    estado: string
    numeroOperacion: string | null
    motivoRechazo: string | null
    pedidoDetalle: DetalleItem[]
    delegado: { id: string; name: string | null } | null
}

interface Props {
    pedido: Pedido
}

interface MetrajeRegistro {
    id: string
    value: number
    isNew?: boolean
}

export function AdminPedidoActions({ pedido }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showRechazarModal, setShowRechazarModal] = useState(false)
    const [metrajeData, setMetrajeData] = useState<Record<string, MetrajeRegistro[]>>(() => {
        const initial: Record<string, MetrajeRegistro[]> = {}
        pedido.pedidoDetalle
            .filter(d => d.tipo === "pieza")
            .forEach(d => {
                if (d.etiquetas && d.etiquetas.length > 0) {
                    initial[d.id] = d.etiquetas.map(e => ({ id: e.id, value: e.valor }))
                }
            })
        return initial
    })
    const [nroOperacion, setNroOperacion] = useState(pedido.numeroOperacion || "")
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

    const piezaDetails = pedido.pedidoDetalle.filter(d => d.tipo === "pieza")
    const tienePiezas = piezaDetails.length > 0

    const cambiarEstado = async (nuevoEstado: string) => {
        if (nuevoEstado === "rechazado") {
            setShowRechazarModal(true)
            return
        }
        
        setLoading(true)
        try {
            const res = await fetch(`/api/pedidos/${pedido.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: nuevoEstado }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                router.refresh()
            } else {
                alert(json.error || "Error al actualizar estado")
            }
        } catch (e) {
            alert("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const rechazarPedido = async (motivo: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/pedidos/${pedido.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: "rechazado", motivoRechazo: motivo }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                setShowRechazarModal(false)
                router.refresh()
            } else {
                throw new Error(json.error || "Error al rechazar")
            }
        } catch (e: any) {
            throw e
        } finally {
            setLoading(false)
        }
    }

    const guardarMetraje = async () => {
        setLoading(true)
        try {
            const metrajeItemsArray = Object.entries(metrajeData).flatMap(([detalleId, registros]) =>
                registros
                    .filter(r => r.isNew === true && r.value > 0)
                    .map(r => ({
                        detalleId,
                        metraje: r.value
                    }))
            )

            if (metrajeItemsArray.length === 0) {
                alert("No hay nuevas etiquetas para guardar")
                setLoading(false)
                return
            }

            const res = await fetch(`/api/pedidos/${pedido.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    metraje_items: metrajeItemsArray,
                    numeroOperacion: nroOperacion || undefined
                }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                router.refresh()
            } else {
                alert(json.error || "Error al guardar metraje")
            }
        } catch (e) {
            alert("Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const agregarMetraje = (detalleId: string) => {
        setMetrajeData(prev => ({
            ...prev,
            [detalleId]: [...(prev[detalleId] || []), { id: `new-${Date.now()}`, value: 0, isNew: true }]
        }))
    }

    const actualizarMetraje = (detalleId: string, registroId: string, value: number) => {
        setMetrajeData(prev => ({
            ...prev,
            [detalleId]: prev[detalleId].map(r => r.id === registroId ? { ...r, value } : r)
        }))
    }

    const eliminarMetraje = async (detalleId: string, registroId: string, isFromDb: boolean = false) => {
        if (isFromDb) {
            setLoading(true)
            try {
                const res = await fetch(`/api/metraje-etiqueta/${registroId}`, {
                    method: "DELETE",
                    credentials: "include"
                })
                const json = await res.json()
                if (json.success) {
                    setMetrajeData(prev => ({
                        ...prev,
                        [detalleId]: prev[detalleId].filter(r => r.id !== registroId)
                    }))
                    router.refresh()
                } else {
                    alert(json.error || "Error al eliminar etiqueta")
                }
            } catch (e) {
                alert("Error de conexión")
            } finally {
                setLoading(false)
            }
        } else {
            setMetrajeData(prev => ({
                ...prev,
                [detalleId]: prev[detalleId].filter(r => r.id !== registroId)
            }))
        }
    }

    const limpiarTodasEtiquetas = async () => {
        const etiquetas = metrajeData[deleteConfirm] || []
        const conBD = etiquetas.filter(e => !e.isNew)
        
        if (conBD.length > 0) {
            setLoading(true)
            try {
                for (const etq of conBD) {
                    await fetch(`/api/metraje-etiqueta/${etq.id}`, {
                        method: "DELETE",
                        credentials: "include"
                    })
                }
            } catch (e) {
                alert("Error de conexión")
            } finally {
                setLoading(false)
            }
        }
        
        setMetrajeData(prev => ({
            ...prev,
            [deleteConfirm]: []
        }))
        setDeleteConfirm(null)
        router.refresh()
    }

    const getMetrajeTotal = (detalleId: string) => {
        const regs = metrajeData[detalleId] || []
        return regs.reduce((sum, r) => sum + r.value, 0)
    }

    const calcularTotal = () => {
        return piezaDetails.reduce((sum, d) => {
            const total = getMetrajeTotal(d.id)
            return sum + (Number(d.precio) * total)
        }, 0)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Cambiar estado:</span>
                <div className="flex flex-wrap gap-2">
                    {ESTADOS_DISPONIBLES.filter(e => e.value !== pedido.estado).map(estado => (
                        <Button
                            key={estado.value}
                            size="sm"
                            variant="outline"
                            onClick={() => cambiarEstado(estado.value)}
                            disabled={loading}
                            className={`text-xs ${estado.color}`}
                        >
                            {estado.value === "metraje_confirmado" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {estado.value === "metraje_en_proceso" && <Clock className="h-3 w-3 mr-1" />}
                            {estado.value === "rechazado" && <XCircle className="h-3 w-3 mr-1" />}
                            {estado.label}
                        </Button>
                    ))}
                </div>
            </div>

{tienePiezas && pedido.estado !== "confirmado" && pedido.estado !== "completado" && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-yellow-900 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Metraje de Piezas
                        </h4>
                        <Button
                            size="sm"
                            onClick={guardarMetraje}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-lg px-6 py-2"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Guardar
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {piezaDetails.map((detalle) => {
                            const registros = metrajeData[detalle.id] || []
                            const metrajeTotal = getMetrajeTotal(detalle.id)
                            const precioTotal = Number(detalle.precio) * metrajeTotal

                            return (
                                <div key={detalle.id} className="bg-white rounded-lg p-3 border border-yellow-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 text-lg">{detalle.producto.nombre}</p>
                                            {metrajeTotal > 0 && (
                                                <p className="text-2xl font-bold text-green-700 mt-1">{metrajeTotal}m</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-yellow-700">{detalle.cantidad} pieza(s)</p>
                                            <p className="text-xl font-bold text-green-700">S/ {precioTotal.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {registros.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {registros.map((reg) => {
                                                const isNew = reg.isNew === true
                                                return (
                                                    <div key={reg.id} className="flex items-center gap-1 bg-yellow-100 border border-yellow-300 rounded-full pl-2 pr-1 py-1">
                                                        <Tag className="h-4 w-4 text-yellow-600 ml-1" />
                                                        {isNew ? (
                                                            <input
                                                                type="number"
                                                                autoFocus
                                                                value={reg.value || ""}
                                                                onChange={e => actualizarMetraje(detalle.id, reg.id, parseFloat(e.target.value) || 0)}
                                                                onKeyDown={e => {
                                                                    if (e.key === "Enter") {
                                                                        const newRegs = metrajeData[detalle.id].map(r => 
                                                                            r.id === reg.id ? { ...r, isNew: false } : r
                                                                        )
                                                                        setMetrajeData(prev => ({
                                                                            ...prev,
                                                                            [detalle.id]: newRegs
                                                                        }))
                                                                    }
                                                                }}
                                                                className="w-16 border border-yellow-400 rounded px-2 py-1 text-lg font-bold text-yellow-800 bg-white"
                                                                placeholder="0"
                                                            />
                                                        ) : (
                                                            <>
                                                                <span className="text-lg font-bold text-yellow-800">{reg.value}m</span>
                                                                <button
                                                                    onClick={() => eliminarMetraje(detalle.id, reg.id, !reg.isNew)}
                                                                    className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-yellow-100">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => agregarMetraje(detalle.id)}
                                                className="text-yellow-700 border-yellow-400 hover:bg-yellow-100"
                                            >
                                                <Plus className="h-3 w-3 mr-1" />
                                                Añadir metraje
                                            </Button>
                                            {registros.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setDeleteConfirm(detalle.id)}
                                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Limpiar
                                                </Button>
                                            )}
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={guardarMetraje}
                                            disabled={loading || registros.length === 0}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Save className="h-3 w-3 mr-1" />
                                            Guardar
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {pedido.estado !== "completado" && (
                <div className="mt-4 pt-3 border-t border-yellow-300">
                    <label className="block text-sm font-bold text-yellow-900 mb-2">
                        Número de Operación (opcional)
                    </label>
                    <input
                        type="text"
                        value={nroOperacion}
                        onChange={e => setNroOperacion(e.target.value)}
                        placeholder="Ej: 123-456-789"
                        className="w-full border-2 border-slate-500 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 bg-white"
                    />
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">
                                ¿Limpiar etiquetas?
                            </h3>
                            <p className="text-slate-600 mb-6">
                                ¿Estás seguro de que deseas eliminar todas las etiquetas de este artículo? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={limpiarTodasEtiquetas}
                                    disabled={loading}
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                >
                                    Eliminar todas
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
    
    {showRechazarModal && (
        <RechazarPedidoModal
            pedidoId={pedido.id}
            numeroOrden={pedido.numeroOrden}
            onClose={() => setShowRechazarModal(false)}
            onReject={rechazarPedido}
        />
    )}
}