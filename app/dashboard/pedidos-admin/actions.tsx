"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, Pencil, Save, RotateCcw, Plus, Trash2, Edit3, X, Tag } from "lucide-react"

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
}

interface Pedido {
    id: string
    numeroOrden: string
    estado: string
    numeroOperacion: string | null
    pedidoDetalle: DetalleItem[]
}

interface Props {
    pedido: Pedido
}

interface MetrajeRegistro {
    id: string
    value: number
}

export function AdminPedidoActions({ pedido }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [metrajeData, setMetrajeData] = useState<Record<string, MetrajeRegistro[]>>(() => {
        const initial: Record<string, MetrajeRegistro[]> = {}
        pedido.pedidoDetalle
            .filter(d => d.tipo === "pieza" && d.metraje)
            .forEach(d => {
                initial[d.id] = [{ id: crypto.randomUUID(), value: d.metraje! }]
            })
        return initial
    })
    const [nroOperacion, setNroOperacion] = useState(pedido.numeroOperacion || "")
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [editandoArticulo, setEditandoArticulo] = useState<string | null>(null)

    const piezaDetails = pedido.pedidoDetalle.filter(d => d.tipo === "pieza")
    const tienePiezas = piezaDetails.length > 0

    const cambiarEstado = async (nuevoEstado: string) => {
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

    const guardarMetraje = async () => {
        setLoading(true)
        try {
            const metrajeItemsArray = Object.entries(metrajeData).flatMap(([detalleId, registros]) =>
                registros.map(r => ({
                    detalleId,
                    metraje: r.value
                }))
            )

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
                setEditandoArticulo(null)
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
            [detalleId]: [...(prev[detalleId] || []), { id: crypto.randomUUID(), value: 0 }]
        }))
        setEditandoArticulo(detalleId)
    }

    const actualizarMetraje = (detalleId: string, registroId: string, value: number) => {
        setMetrajeData(prev => ({
            ...prev,
            [detalleId]: prev[detalleId].map(r => r.id === registroId ? { ...r, value } : r)
        }))
    }

    const eliminarMetraje = (detalleId: string, registroId: string) => {
        setMetrajeData(prev => ({
            ...prev,
            [detalleId]: prev[detalleId].filter(r => r.id !== registroId)
        }))
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
                            const isEditando = editandoArticulo === detalle.id

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
                                            {registros.map((reg) => (
                                                <div key={reg.id} className="flex items-center gap-1 bg-yellow-100 border border-yellow-300 rounded-full pl-4 pr-2 py-2">
                                                    <Tag className="h-4 w-4 text-yellow-600" />
                                                    <span className="text-lg font-bold text-yellow-800">{reg.value}m</span>
                                                    <button
                                                        onClick={() => eliminarMetraje(detalle.id, reg.id)}
                                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {isEditando && (
                                        <div className="mb-3">
                                            {registros.map((reg) => (
                                                <div key={reg.id} className="flex items-center gap-2 mb-2">
                                                    <input
                                                        type="number"
                                                        value={reg.value}
                                                        onChange={e => actualizarMetraje(detalle.id, reg.id, parseFloat(e.target.value) || 0)}
                                                        placeholder="Metros"
                                                        className="flex-1 border-2 border-slate-500 rounded px-3 py-2 text-sm font-bold text-slate-900 bg-white"
                                                    />
                                                    <span className="text-sm font-bold text-slate-600">m</span>
                                                    <button
                                                        onClick={() => eliminarMetraje(detalle.id, reg.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <XCircle className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-yellow-100">
                                        {isEditando ? (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditandoArticulo(null)
                                                        setMetrajeData(() => {
                                                            const initial: Record<string, MetrajeRegistro[]> = {}
                                                            piezaDetails.forEach(d => {
                                                                if (d.metraje) {
                                                                    initial[d.id] = [{ id: crypto.randomUUID(), value: d.metraje }]
                                                                }
                                                            })
                                                            return initial
                                                        })
                                                    }}
                                                    className="text-red-600 border-red-300"
                                                >
                                                    <RotateCcw className="h-3 w-3 mr-1" />
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={guardarMetraje}
                                                    disabled={loading}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <Save className="h-3 w-3 mr-1" />
                                                    Guardar
                                                </Button>
                                            </div>
                                        ) : (
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
                                            </div>
                                        )}
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
        </div>
    )
}