"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, Pencil, Save, RotateCcw, Plus, Trash2, Edit3, X, Tag, UserPlus, RefreshCw } from "lucide-react"
import { RechazarPedidoModal } from "@/components/pedidos/RechazarPedidoModal"
import { ConfirmarMetrajeModal } from "@/components/pedidos/ConfirmarMetrajeModal"

const ESTADOS_DISPONIBLES = [
    { value: "metraje_en_proceso", label: "Metraje en proceso", color: "bg-yellow-100 text-yellow-800" },
    { value: "metraje_confirmado", label: "Metraje confirmado", color: "bg-green-100 text-green-800" },
    { value: "pendiente", label: "Pago en revisión", color: "bg-blue-100 text-blue-800" },
    { value: "confirmado", label: "Pago confirmado", color: "bg-blue-200 text-blue-900" },
    { value: "pedido_enviado", label: "Pedido enviado", color: "bg-yellow-100 text-yellow-800" },
    { value: "rechazado", label: "Rechazar pedido", color: "bg-red-100 text-red-800" },
    { value: "completado", label: "Pedido completado", color: "bg-green-100 text-green-800" },
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
    costoEnvio: number
    metodoEnvio: string | null
    total: number
    pedidoDetalle: DetalleItem[]
    delegados: { id: string; userId: string; user: { id: string; name: string | null; email: string | null } }[]
}

interface Props {
    pedido: Pedido
    role: string
    userId: string
}

interface MetrajeRegistro {
    id: string
    value: number
    isNew?: boolean
}

export function AdminPedidoActions({ pedido, role, userId }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showRechazarModal, setShowRechazarModal] = useState(false)
    const [showConfirmarMetrajeModal, setShowConfirmarMetrajeModal] = useState(false)
    const [articulosFaltantes, setArticulosFaltantes] = useState<{nombre: string, solicitado: number, registrado: number}[]>([])
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
    const [costoEnvioManual, setCostoEnvioManual] = useState<string>(String(pedido.costoEnvio || 0))
    const [guardandoCosto, setGuardandoCosto] = useState(false)

    const estaAsignado = pedido.delegados?.some(d => d.userId === userId)
    const puedeEditar = role === "admin" || (role === "empleado" && estaAsignado && pedido.estado !== "metraje_confirmado")

    const piezaDetails = pedido.pedidoDetalle.filter(d => d.tipo === "pieza")
    const tienePiezas = piezaDetails.length > 0
    const totalEtiquetas = piezaDetails.reduce((sum, d) => sum + (d.etiquetas?.length || 0), 0)
    const hayMetrajRegistrado = totalEtiquetas > 0
    const tienePiezasCompletas = tienePiezas && piezaDetails.every(d => {
        const etiquetasCount = d.etiquetas?.length || 0
        return etiquetasCount === Number(d.cantidad)
    })

    const cambiarEstado = async (nuevoEstado: string) => {
        if (nuevoEstado === "rechazado") {
            setShowRechazarModal(true)
            return
        }

        if (nuevoEstado === "metraje_confirmado") {
            const faltantes = piezaDetails
                .filter(d => {
                    const etiquetasCount = d.etiquetas?.length || 0
                    return etiquetasCount < Number(d.cantidad)
                })
                .map(d => ({
                    nombre: d.producto.nombre,
                    solicitado: Number(d.cantidad),
                    registrado: d.etiquetas?.length || 0
                }))
            
            if (faltantes.length > 0) {
                setArticulosFaltantes(faltantes)
                setShowConfirmarMetrajeModal(true)
                return
            }
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

    const cambiarEstadoDirecto = async (estado: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/pedidos/${pedido.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado }),
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

    const guardarCostoEnvio = async () => {
        const costoValue = costoEnvioManual === "" ? 0 : parseFloat(costoEnvioManual)
        setGuardandoCosto(true)
        try {
            const res = await fetch(`/api/pedidos/${pedido.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ costoEnvio: isNaN(costoValue) ? 0 : costoValue }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                router.refresh()
            } else {
                alert(json.error || "Error al guardar costo de envío")
            }
        } catch (e) {
            alert("Error de conexión")
        } finally {
            setGuardandoCosto(false)
        }
    }

    const recalcularPedido = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/pedidos/${pedido.id}/recalcular`, {
                method: "POST",
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                router.refresh()
            } else {
                alert(json.error || "Error al recalcular")
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
        // Validar que las etiquetas no excedan la cantidad de piezas
        for (const detalle of piezaDetails) {
            const etiquetasActuales = detalle.etiquetas?.length || 0
            const nuevosRegistros = (metrajeData[detalle.id] || []).filter(r => r.isNew === true && r.value > 0).length
            const totalEtiquetas = etiquetasActuales + nuevosRegistros
            if (totalEtiquetas > Number(detalle.cantidad)) {
                alert(`No puedes agregar más metrajes que piezas solicitadas. Has solicitado ${detalle.cantidad} pieza(s).`)
                return
            }
        }

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
                // Recalcular el pedido después de guardar el metraje
                try {
                    await fetch(`/api/pedidos/${pedido.id}/recalcular`, {
                        method: "POST",
                        credentials: "include"
                    })
                } catch (e) {
                    console.error("Error al recalcular:", e)
                }
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
        if (!deleteConfirm) return;

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
            {(role === "admin" || (role === "empleado" && pedido.estado !== "pedido_enviado" && pedido.estado !== "completado")) && (
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Cambiar estado:</span>
                <div className="flex flex-wrap gap-2">
{ESTADOS_DISPONIBLES.filter(e => {
                        const estaAsignado = pedido.delegados?.some(d => d.userId === userId)
                        
                        // Si es empleado y NO está asignado, no mostrar ningún botón
                        if (role === "empleado" && !estaAsignado) return false
                        
                        // Si es empleado asignado: solo mostrar "metraje_confirmado" y "rechazado" y "pedido_enviado" (si estado confirmado)
                        if (role === "empleado" && estaAsignado) {
                            if (e.value === "rechazado") {
                                if (pedido.estado === "confirmado" || pedido.estado === "completado" || pedido.estado === "pedido_enviado") return false
                                return true
                            }
                            if (e.value === "metraje_confirmado" && pedido.estado === "confirmado") {
                                return false
                            }
                            if (e.value === "metraje_confirmado") {
                                return true
                            }
                            if (e.value === "pedido_enviado" && pedido.estado === "confirmado") {
                                return true
                            }
                            return false
                        }
                        
                        // Para admin: lógica original
                        if (e.value === pedido.estado) return false
                        if (e.value === "metraje_confirmado" && !tienePiezasCompletas && tienePiezas) return false
                        if (e.value === "rechazado" && (pedido.estado === "confirmado" || pedido.estado === "completado" || pedido.estado === "pedido_enviado")) return false
                        if (e.value === "pedido_enviado" && pedido.estado !== "confirmado") return false
                        return true
                    }).map(estado => (
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
            )}

            {(role === "admin" || (role === "empleado" && pedido.estado !== "pedido_enviado" && pedido.estado !== "completado" && pedido.estado !== "confirmado")) && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex-1">
                            {role === "empleado" && (() => {
                                const yaAsignado = pedido.delegados?.some(d => d.userId === userId)
                                return (
                                    <Button
                                        size="sm"
                                        disabled={yaAsignado}
                                        onClick={async () => {
                                            if (yaAsignado) return
                                            try {
                                                const res = await fetch(`/api/pedidos/${pedido.id}/delegar`, {
                                                    method: "POST",
                                                    credentials: "include"
                                                })
                                                const json = await res.json()
                                                if (json.success) {
                                                    window.location.reload()
                                                } else {
                                                    alert(json.error || "Error al tomar pedido")
                                                }
                                            } catch (e) {
                                                console.error(e)
                                                alert("Error al tomar pedido")
                                            }
                                        }}
                                        className={`mb-2 ${yaAsignado 
                                            ? "bg-green-500 text-white cursor-not-allowed" 
                                            : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                                    >
                                        <UserPlus className="h-4 w-4 mr-1" />
                                        {yaAsignado ? "Asignado" : "Tomar Pedido"}
                                    </Button>
                                )
                            })()}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium text-slate-700">Costo de envío:</span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={recalcularPedido}
                                disabled={loading}
                                className="border-purple-300 text-purple-700 hover:bg-purple-50"
                            >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Recalcular
                            </Button>
                            <input
                                type="number"
                                value={costoEnvioManual}
                                onChange={(e) => setCostoEnvioManual(e.target.value)}
                                className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-right font-medium text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                min="0"
                                step="0.01"
                            />
                            <Button
                                size="sm"
                                onClick={guardarCostoEnvio}
                                disabled={guardandoCosto || parseFloat(costoEnvioManual || "0") === pedido.costoEnvio}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {guardandoCosto ? "Guardando..." : "Guardar"}
                            </Button>
                        </div>
                    </div>
                    {pedido.total < 500 && (
                        <p className="text-xs text-orange-600 mt-2">
                            * El costo mínimo automático para pedidos menores a S/500 es S/10
                        </p>
                    )}
                </div>
            )}

            {tienePiezas && pedido.estado !== "confirmado" && pedido.estado !== "completado" && pedido.estado !== "pedido_enviado" && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-yellow-900 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Metraje de Piezas
                            {!puedeEditar && <span className="text-xs text-slate-500 ml-2">(Solo lectura)</span>}
                        </h4>
                        {puedeEditar && (
                            <Button
                                size="sm"
                                onClick={guardarMetraje}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 text-lg px-6 py-2"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                            </Button>
                        )}
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
                                            {detalle.etiquetas && detalle.etiquetas.length > 0 && (
                                                <p className="text-sm font-bold text-slate-600 mt-1">
                                                    {detalle.etiquetas.length} de {Number(detalle.cantidad)} piezas con metraje
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-slate-700">
                                                Cliente pidió: <span className="text-yellow-700">{detalle.cantidad} pieza(s)</span>
                                            </p>
                                            {(() => {
                                                const cantidadPiezas = Number(detalle.cantidad) || 0
                                                const etiquetasCount = detalle.etiquetas?.length || 0
                                                const faltantes = cantidadPiezas - etiquetasCount
                                                return (
                                                    <>
                                                        {faltantes > 0 ? (
                                                            <p className="text-sm font-bold text-orange-600">Faltan {faltantes}</p>
                                                        ) : (
                                                            <p className="text-sm font-bold text-green-600">✓ Completo</p>
                                                        )}
                                                    </>
                                                )
                                            })()}
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
                                                                {puedeEditar && (
                                                                    <button
                                                                        onClick={() => eliminarMetraje(detalle.id, reg.id, !reg.isNew)}
                                                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-2 border-t border-yellow-100">
                                        <div className="flex gap-2">
                                            {puedeEditar && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => agregarMetraje(detalle.id)}
                                                    className="text-yellow-700 border-yellow-400 hover:bg-yellow-100"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Añadir metraje
                                                </Button>
                                            )}
                                            {puedeEditar && registros.length > 0 && (
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
                                        {puedeEditar && (
                                            <Button
                                                size="sm"
                                                onClick={guardarMetraje}
                                                disabled={loading || registros.length === 0}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Save className="h-3 w-3 mr-1" />
                                                Guardar
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {pedido.estado !== "completado" && pedido.estado !== "pedido_enviado" && pedido.estado !== "confirmado" && (
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

            {showRechazarModal && (
                <RechazarPedidoModal
                    pedidoId={pedido.id}
                    numeroOrden={pedido.numeroOrden}
                    onClose={() => setShowRechazarModal(false)}
                    onReject={rechazarPedido}
                />
            )}

            {showConfirmarMetrajeModal && (
                <ConfirmarMetrajeModal
                    articulosFaltantes={articulosFaltantes}
                    onConfirm={() => {
                        setShowConfirmarMetrajeModal(false)
                        cambiarEstadoDirecto("metraje_confirmado")
                    }}
                    onCancel={() => setShowConfirmarMetrajeModal(false)}
                />
            )}
        </div>
    )
}