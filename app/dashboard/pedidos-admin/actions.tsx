"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Pencil, Save, RotateCcw } from "lucide-react"

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

export function AdminPedidoActions({ pedido }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [editingMetraje, setEditingMetraje] = useState(false)
    const [metrajes, setMetrajes] = useState<Record<string, string>>(
        Object.fromEntries(
            pedido.pedidoDetalle
                .filter(d => d.tipo === "pieza")
                .map(d => [d.id, d.metraje?.toString() || ""])
        )
    )
    const [nroOperacion, setNroOperacion] = useState(pedido.numeroOperacion || "")

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
            const metrajeItemsArray = Object.entries(metrajes).map(([detalleId, metraje]) => ({
                detalleId,
                metraje: parseFloat(metraje) || 0
            }))

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
                setEditingMetraje(false)
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

            {tienePiezas && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-yellow-800 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Metraje de Piezas
                        </h4>
                        {!editingMetraje ? (
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingMetraje(true)}
                                className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                            >
                                <Pencil className="h-3 w-3 mr-1" />
                                Editar Metraje
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setEditingMetraje(false)
                                        setMetajes(Object.fromEntries(
                                            piezaDetails.map(d => [d.id, d.metraje?.toString() || ""])
                                        ))
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
                        )}
                    </div>

                    {editingMetraje ? (
                        <div className="space-y-3">
                            {piezaDetails.map(detalle => (
                                <div key={detalle.id} className="flex items-center gap-3 bg-white rounded-lg p-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-800 text-sm">{detalle.producto.nombre}</p>
                                        <p className="text-xs text-slate-500">
                                            Pieza #{piezaDetails.indexOf(detalle) + 1} • Precio: S/ {Number(detalle.precio * 50 * detalle.cantidad).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={metrajes[detalle.id] || ""}
                                            onChange={e => setMetrajes(prev => ({ ...prev, [detalle.id]: e.target.value }))}
                                            placeholder="Metros"
                                            className="w-24 border border-slate-300 rounded px-2 py-1 text-sm"
                                        />
                                        <span className="text-sm text-slate-600">metros</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {piezaDetails.map(detalle => (
                                <div key={detalle.id} className="flex justify-between items-center text-sm bg-white rounded-lg p-2">
                                    <div>
                                        <p className="font-medium text-slate-800">{detalle.producto.nombre}</p>
                                        <p className="text-xs text-slate-500">{detalle.cantidad} pieza(s)</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${detalle.metraje ? "text-green-700" : "text-yellow-600"}`}>
                                            {detalle.metraje ? `${detalle.metraje} metros` : "Sin definir"}
                                        </p>
                                        {detalle.metraje && (
                                            <p className="text-xs text-slate-500">
                                                = {detalle.cantidad} pieza(s) × {detalle.metraje}m
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-yellow-200">
                        <label className="block text-sm font-medium text-yellow-800 mb-2">
                            Número de Operación (opcional)
                        </label>
                        <input
                            type="text"
                            value={nroOperacion}
                            onChange={e => setNroOperacion(e.target.value)}
                            placeholder="Ej: 123-456-789"
                            className="w-full border border-yellow-300 rounded-lg px-3 py-2 text-sm bg-white"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}