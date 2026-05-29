"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, XCircle, Pencil, Save, RotateCcw, Plus, Trash2, Edit3, X, Tag, UserPlus, RefreshCw, DollarSign, Wallet, AlertTriangle } from "lucide-react"
import { RechazarPedidoModal } from "@/components/pedidos/RechazarPedidoModal"
import { ConfirmarMetrajeModal } from "@/components/pedidos/ConfirmarMetrajeModal"

const ESTADOS_DISPONIBLES = [
    { value: "metraje_en_proceso", label: "Metraje en proceso", color: "bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-600 hover:text-white hover:border-yellow-600", icon: Clock },
    { value: "metraje_confirmado", label: "Metraje confirmado", color: "bg-green-100 text-green-800 border-green-300 hover:bg-green-600 hover:text-white hover:border-green-600", icon: CheckCircle },
    { value: "pendiente", label: "Pago en revisión", color: "bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-600 hover:text-white hover:border-blue-600", icon: Clock },
    { value: "confirmado", label: "Pago confirmado", color: "bg-blue-200 text-blue-900 border-blue-400 hover:bg-blue-700 hover:text-white hover:border-blue-700", icon: CheckCircle },
    { value: "pedido_enviado", label: "Pedido enviado", color: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-600 hover:text-white hover:border-amber-600", icon: Clock },
    { value: "rechazado", label: "Rechazar pedido", color: "bg-red-100 text-red-800 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600", icon: XCircle },
    { value: "completado", label: "Pedido completado", color: "bg-green-100 text-green-800 border-green-300 hover:bg-green-600 hover:text-white hover:border-green-600", icon: CheckCircle },
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
    clientePedidoId: string | null
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
    value: string
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
                    initial[d.id] = d.etiquetas.map(e => ({ id: e.id, value: String(e.valor) }))
                }
            })
        return initial
    })
    const [nroOperacion, setNroOperacion] = useState(pedido.numeroOperacion || "")
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [costoEnvioManual, setCostoEnvioManual] = useState<string>(String(pedido.costoEnvio || 0))
    const [guardandoCosto, setGuardandoCosto] = useState(false)
    const [showPagoPedidoModal, setShowPagoPedidoModal] = useState(false)
    const [tipoPago, setTipoPago] = useState<"completo" | "dividido" | "parcial" | "">("")
    const [detallesPago, setDetallesPago] = useState<{ monto: string; empresa: string; metodoPago: string }[]>([
        { monto: "", empresa: "", metodoPago: "" },
        { monto: "", empresa: "", metodoPago: "" }
    ])
    const [showDetallePagoModal, setShowDetallePagoModal] = useState(false)
    const [detalleEditandoIdx, setDetalleEditandoIdx] = useState<number | null>(null)
    const [pagoParcialTexto, setPagoParcialTexto] = useState("")
    const [guardandoPago, setGuardandoPago] = useState(false)
    const [saldoCartera, setSaldoCartera] = useState(0)
    const [carteraMovimientosCount, setCarteraMovimientosCount] = useState(0)
    const [usarSaldoCartera, setUsarSaldoCartera] = useState(false)
    const [carteraMontoCustom, setCarteraMontoCustom] = useState(0)
    const [carteraInputText, setCarteraInputText] = useState("")
    const [cargandoCartera, setCargandoCartera] = useState(false)

    const EMPRESAS = ["FLORES CARITAS", "TEXTILES MANCHESTER", "MANCHESTERTEX", "TEXTILES MEGO", "YAPE CARLOS", "YAPE ANGEL"]
    const METODOS_PAGO = ["TRANSFERENCIA", "DEPOSITO", "EFECTIVO", "YAPE","PLIN", "BBVA"]

    const extraerTotalPagado = (notas: string | null): number => {
        if (!notas) return 0
        let totalPagado = 0
        for (const rawLine of notas.split("\n")) {
            const linea = rawLine.trim()
            if (!linea) continue
            const mCompleto = linea.match(/^PAGO: Completo - S\/\s*([\d.]+)/)
            if (mCompleto) { totalPagado += Number(mCompleto[1]); continue }
            const mDividido = linea.match(/^PAGO: Dividido.*=\s*S\/\s*([\d.]+)/)
            if (mDividido) { totalPagado += Number(mDividido[1]); continue }
            const mParcial = linea.match(/^PAGO: Parcial - S\/\s*([\d.]+)/)
            if (mParcial) totalPagado += Number(mParcial[1])
        }
        return totalPagado
    }

    const totalPagado = extraerTotalPagado((pedido as any).notas)
    const faltaPagar = Math.max(0, Number(pedido.total) - totalPagado)

    useEffect(() => {
        if (!showPagoPedidoModal || !pedido.clientePedidoId) return
        setUsarSaldoCartera(false)
        setCargandoCartera(true)
        fetch(`/api/clientes-pedido/${pedido.clientePedidoId}/cartera`, { credentials: "include" })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.cartera) {
                    setSaldoCartera(Math.round((data.cartera.saldo || 0) * 100) / 100)
                    setCarteraMovimientosCount(data.cartera.movimientos?.length || 0)
                } else {
                    setSaldoCartera(0)
                    setCarteraMovimientosCount(0)
                }
            })
            .catch(() => { setSaldoCartera(0); setCarteraMovimientosCount(0) })
            .finally(() => setCargandoCartera(false))
    }, [showPagoPedidoModal, pedido.clientePedidoId])

    const carteraActiva = usarSaldoCartera && saldoCartera > 0 && (tipoPago === "completo" || tipoPago === "dividido" || tipoPago === "parcial")
    const carteraUsada = carteraActiva ? Math.min(carteraMontoCustom, saldoCartera, faltaPagar) : 0
    const faltaPagarEfectiva = Math.max(0, faltaPagar - carteraUsada)
    const mostrarCarteraCheckbox = saldoCartera > 0 && carteraMovimientosCount > 1

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
            const nuevosRegistros = (metrajeData[detalle.id] || []).filter(r => r.isNew === true && Number(r.value) > 0).length
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
                    .filter(r => r.isNew === true && Number(r.value) > 0)
                    .map(r => ({
                        detalleId,
                        metraje: Number(r.value)
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
            [detalleId]: [...(prev[detalleId] || []), { id: `new-${Date.now()}`, value: "", isNew: true }]
        }))
    }

    const actualizarMetraje = (detalleId: string, registroId: string, value: string) => {
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
                    const res = await fetch(`/api/metraje-etiqueta/${etq.id}`, {
                        method: "DELETE",
                        credentials: "include"
                    })
                    const json = await res.json()
                    if (!json.success) {
                        alert(json.error || "Error al eliminar etiqueta")
                        setLoading(false)
                        return
                    }
                }
            } catch (e) {
                alert("Error de conexión")
                setLoading(false)
                return
            }
            setLoading(false)
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
        return regs.reduce((sum, r) => sum + (Number(r.value) || 0), 0)
    }

    return (
        <div className="space-y-4">
            {faltaPagar > 0.01 && pedido.estado !== "metraje_en_proceso" && (
                <Button
                    onClick={() => setShowPagoPedidoModal(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-10"
                >
                    <DollarSign className="h-4 w-4 mr-2" /> COBRAR (S/ {faltaPagar.toFixed(2)})
                </Button>
            )}

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
                    }).map(estado => {
                        const Icon = estado.icon
                        return (
                            <Button
                                key={estado.value}
                                size="sm"
                                onClick={() => cambiarEstado(estado.value)}
                                disabled={loading}
                                className={`text-xs font-semibold border-2 shadow-sm hover:shadow-lg active:scale-[0.95] transition-all duration-200 ${estado.color}`}
                            >
                                <Icon className="h-3.5 w-3.5 mr-1.5" />
                                {estado.label}
                            </Button>
                        )
                    })}
                </div>
            </div>
            )}

            {(role === "admin" || (role === "empleado" && pedido.estado !== "pedido_enviado" && pedido.estado !== "completado" && pedido.estado !== "confirmado")) && (
                <div className="bg-gradient-to-r from-slate-50 to-white border-2 border-slate-200 rounded-xl p-4 shadow-sm">
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
                                        className={`border-2 font-semibold transition-all duration-150 active:scale-[0.97] ${yaAsignado 
                                            ? "bg-green-500 text-white border-green-600 cursor-not-allowed" 
                                            : "bg-blue-600 hover:bg-blue-700 text-white border-blue-700 hover:shadow-lg"}`}
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
                                className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 hover:shadow-md active:scale-[0.97] transition-all duration-150 font-semibold"
                            >
                                <RefreshCw className="h-4 w-4 mr-1.5" />
                                Recalcular
                            </Button>
                            <input
                                type="number"
                                value={costoEnvioManual}
                                onChange={(e) => setCostoEnvioManual(e.target.value)}
                                className="w-24 px-3 py-2 border-2 border-slate-300 rounded-lg text-right font-semibold text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                min="0"
                                step="0.01"
                            />
                            <Button
                                size="sm"
                                onClick={guardarCostoEnvio}
                                disabled={guardandoCosto || parseFloat(costoEnvioManual || "0") === pedido.costoEnvio}
                                className="bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.97] transition-all duration-150 font-semibold border-2 border-blue-700"
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
                    </div>

                    <div className="space-y-3">
                        {piezaDetails.map((detalle) => {
                            const registros = metrajeData[detalle.id] || []
                            const metrajeTotal = getMetrajeTotal(detalle.id)
                            const precioTotal = Number(detalle.precio) * metrajeTotal
                            const cantidadPiezas = Number(detalle.cantidad) || 0
                            const etiquetasCount = detalle.etiquetas?.length || 0
                            const faltantes = cantidadPiezas - etiquetasCount

                            return (
                                <div key={detalle.id} className="bg-white rounded-xl border border-yellow-200 shadow-sm overflow-hidden">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-yellow-50 to-white px-4 py-3 border-b border-yellow-100">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-bold text-slate-900 text-base truncate">{detalle.producto.nombre}</p>
                                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-[11px] font-medium shrink-0">{detalle.producto.categoria}</span>
                                                </div>
                                                {detalle.etiquetas && detalle.etiquetas.length > 0 && (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {etiquetasCount} de {cantidadPiezas} piezas con metraje
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-xs text-slate-500">Precio</p>
                                                <p className="text-lg font-bold text-green-700 leading-tight">S/ {precioTotal.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metraje chips */}
                                    {registros.length > 0 && (
                                        <div className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                {registros.map((reg) => {
                                                    const isNew = reg.isNew === true
                                                    return (
                                                        <div key={reg.id} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 ${isNew ? 'bg-amber-50 border border-amber-300' : 'bg-yellow-50 border border-yellow-200'}`}>
                                                            <Tag className={`h-3.5 w-3.5 ${isNew ? 'text-amber-500' : 'text-yellow-600'}`} />
                                                            {isNew ? (
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    autoFocus
                                                                    value={reg.value || ""}
                                                                    onChange={e => actualizarMetraje(detalle.id, reg.id, e.target.value)}
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
                                                                    className="w-14 border-0 bg-transparent text-lg font-bold text-amber-800 focus:outline-none focus:ring-0 p-0"
                                                                    placeholder="0"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <span className="text-base font-bold text-yellow-800">{reg.value}m</span>
                                                                </>
                                                            )}
                                                            {puedeEditar && (
                                                                <button
                                                                    onClick={() => eliminarMetraje(detalle.id, reg.id, !reg.isNew)}
                                                                    className="text-red-400 hover:text-red-600 p-0.5 rounded-full hover:bg-red-50 transition-colors"
                                                                >
                                                                    <X className="h-3.5 w-3.5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Info bar */}
                                    <div className="px-4 py-2 bg-slate-50 border-t border-yellow-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-slate-600">Pedido: <strong>{cantidadPiezas}</strong> pieza(s)</span>
                                            <span className="text-slate-300">|</span>
                                            {faltantes > 0 ? (
                                                <span className="text-orange-600 font-medium">Faltan {faltantes}</span>
                                            ) : (
                                                <span className="text-green-600 font-medium">✓ Completo</span>
                                            )}
                                        </div>
                                        {metrajeTotal > 0 && (
                                            <p className="text-xs text-slate-400">
                                                Metraje total: <strong className="text-slate-600">{metrajeTotal.toFixed(2)}m</strong>
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 px-4 py-3 border-t border-yellow-100">
                                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                            {puedeEditar && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => agregarMetraje(detalle.id)}
                                                    className="border-2 border-yellow-400 text-yellow-700 hover:bg-yellow-100 hover:border-yellow-500 hover:shadow-md active:scale-[0.97] transition-all duration-150 w-full sm:w-auto font-semibold"
                                                >
                                                    <Plus className="h-4 w-4 mr-1.5" />
                                                    Añadir metraje
                                                </Button>
                                            )}
                                            {puedeEditar && registros.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setDeleteConfirm(detalle.id)}
                                                    className="border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 hover:shadow-md active:scale-[0.97] transition-all duration-150 w-full sm:w-auto font-semibold"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1.5" />
                                                    Limpiar
                                                </Button>
                                            )}
                                        </div>
                                        {puedeEditar && (
                                            <Button
                                                size="sm"
                                                onClick={guardarMetraje}
                                                disabled={loading || registros.length === 0}
                                                className="bg-green-600 hover:bg-green-700 hover:shadow-lg active:scale-[0.97] transition-all duration-150 w-full sm:w-auto font-semibold border-2 border-green-700"
                                            >
                                                <Save className="h-4 w-4 mr-1.5" />
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

            {/* Sub-modal pago */}
            {showPagoPedidoModal && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40" onClick={() => { setShowPagoPedidoModal(false); setTipoPago(""); setPagoParcialTexto(""); setDetallesPago([{ monto: "", empresa: "", metodoPago: "" }, { monto: "", empresa: "", metodoPago: "" }]);                         setUsarSaldoCartera(false); setCarteraMontoCustom(0); setCarteraInputText("") }} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Pagar el pedido: Nro Orden Pedido: {pedido.numeroOrden}</h3>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    Total: <span className="font-bold text-slate-900">S/ {Number(pedido.total).toFixed(2)}</span>
                                    {totalPagado > 0 && <>, Pagado: <span className="font-bold text-green-700">S/ {totalPagado.toFixed(2)}</span></>}
                                    {" | "}<span className="text-red-600 font-bold">Falta: S/ {faltaPagar.toFixed(2)}</span>
                                </p>
                            </div>
                            <button onClick={() => { setShowPagoPedidoModal(false); setTipoPago(""); setPagoParcialTexto(""); setDetallesPago([{ monto: "", empresa: "", metodoPago: "" }, { monto: "", empresa: "", metodoPago: "" }]); setCarteraMontoCustom(0); setCarteraInputText("") }} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            {pedido.clientePedidoId && saldoCartera > 0 && (
                                <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="h-4 w-4 text-blue-600" />
                                            <p className="text-sm font-medium text-blue-800">
                                                Saldo a favor: <span className="font-bold">S/ {saldoCartera.toFixed(2)}</span>
                                                {cargandoCartera && <span className="text-xs text-blue-500 ml-2">Cargando...</span>}
                                            </p>
                                        </div>
                                        {mostrarCarteraCheckbox && (
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input type="checkbox" checked={usarSaldoCartera} onChange={(e) => {
                                                    setUsarSaldoCartera(e.target.checked)
                                                    if (e.target.checked && tipoPago === "dividido") {
                                                        setDetallesPago([{ monto: "", empresa: "", metodoPago: "" }])
                                                    }
                                                    if (!e.target.checked) {
                                                        setCarteraMontoCustom(0)
                                                        setCarteraInputText("")
                                                        if (tipoPago === "dividido") {
                                                            setDetallesPago([
                                                                { monto: "", empresa: "", metodoPago: "" },
                                                                { monto: "", empresa: "", metodoPago: "" }
                                                            ])
                                                        }
                                                    }
                                                }} className="sr-only" />
                                                <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${usarSaldoCartera ? "bg-blue-600" : "bg-slate-300"}`}>
                                                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${usarSaldoCartera ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                                                </div>
                                                <span className="text-sm font-medium text-blue-700">Usar saldo</span>
                                            </label>
                                        )}
                                    </div>
                                    {usarSaldoCartera && tipoPago !== "completo" && (
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Saldo a usar:</span>
                                            <span className="text-sm font-medium text-slate-500">S/</span>
                                            <input
                                                type="text" inputMode="decimal"
                                                value={carteraInputText}
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                                                        setCarteraInputText(val)
                                                        setCarteraMontoCustom(val === "" ? 0 : Math.min(Number(val), saldoCartera, faltaPagar))
                                                    }
                                                }}
                                                placeholder="0.00"
                                                className="w-24 px-3 py-1.5 border-2 border-blue-300 rounded-lg text-sm text-blue-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                            />
                                            {carteraMontoCustom > 0 && (
                                                <span className="text-xs text-blue-600">
                                                    {carteraUsada >= faltaPagar ? "Cubre el total" : `Restan S/ ${faltaPagarEfectiva.toFixed(2)}`}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            <div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setTipoPago("completo"); if (usarSaldoCartera) { setCarteraMontoCustom(Math.min(saldoCartera, faltaPagar)); setCarteraInputText("") } }}
                                        className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all flex-1 ${tipoPago === "completo" ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"}`}
                                    >
                                        PAGO COMPLETO
                                    </button>
                                    <button
                                        onClick={() => { setTipoPago("dividido"); setCarteraMontoCustom(0); setDetallesPago(usarSaldoCartera ? [{ monto: "", empresa: "", metodoPago: "" }] : [{ monto: "", empresa: "", metodoPago: "" }, { monto: "", empresa: "", metodoPago: "" }]) }}
                                        className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all flex-1 ${tipoPago === "dividido" ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"}`}
                                    >
                                        DIVIDIR PAGO
                                    </button>
                                    <button
                                        onClick={() => { setTipoPago("parcial"); setPagoParcialTexto("") }}
                                        className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all flex-1 ${tipoPago === "parcial" ? "bg-amber-600 border-amber-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50"}`}
                                    >
                                        PAGO PARCIAL
                                    </button>
                                </div>
                            </div>
                            {(tipoPago === "completo" || tipoPago === "dividido" || tipoPago === "parcial") && (
                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-2">
                                        {tipoPago === "completo" ? "Detalle del pago" : tipoPago === "parcial" ? "Monto del pago parcial" : "Montos"}
                                    </p>
                                    {tipoPago === "completo" && carteraActiva && saldoCartera >= faltaPagar ? (
                                        <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-800 text-sm font-medium">
                                            <CheckCircle className="h-4 w-4 inline mr-1" /> Cubierto por saldo cartera
                                        </div>
                                    ) : tipoPago === "completo" && carteraActiva && saldoCartera < faltaPagar ? (
                                        <div className="p-3 rounded-lg border bg-amber-50 border-amber-300 text-amber-800 text-sm font-medium">
                                            <AlertTriangle className="h-4 w-4 inline mr-1" /> Saldo no cubre el pago completo, selecciona otra opción
                                        </div>
                                    ) : (
                                    <div className="space-y-2">
                                        {(tipoPago === "completo" || tipoPago === "parcial"
                                            ? [{ monto: tipoPago === "completo" ? faltaPagarEfectiva.toFixed(2) : detallesPago[0]?.monto || "", empresa: detallesPago[0]?.empresa || "", metodoPago: detallesPago[0]?.metodoPago || "" }]
                                            : detallesPago
                                        ).map((det, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-slate-500">S/</span>
                                                <input
                                                    type="text" inputMode="decimal"
                                                    value={det.monto}
                                                    onChange={(e) => {
                                                        if (tipoPago === "dividido" || tipoPago === "parcial") {
                                                            const val = e.target.value
                                                            if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                                                                const nuevo = [...detallesPago]
                                                                nuevo[idx] = { ...nuevo[idx], monto: val }
                                                                setDetallesPago(nuevo)
                                                            }
                                                        }
                                                    }}
                                                    readOnly={tipoPago === "completo"}
                                                    placeholder="0.00"
                                                    className={`w-24 px-3 py-2 border-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white ${tipoPago === "completo" ? "border-emerald-300 bg-emerald-50" : tipoPago === "parcial" ? "border-amber-300" : "border-slate-200"}`}
                                                />
                                                <button
                                                    onClick={() => {
                                                        if (det.empresa || det.metodoPago) {
                                                            const nuevo = [...detallesPago]
                                                            nuevo[idx] = { ...nuevo[idx], empresa: "", metodoPago: "" }
                                                            setDetallesPago(nuevo)
                                                        } else {
                                                            setDetalleEditandoIdx(idx); setShowDetallePagoModal(true)
                                                        }
                                                    }}
                                                    className={`px-2 py-1.5 text-xs font-bold border-2 rounded-lg transition-all uppercase ${
                                                        det.empresa || det.metodoPago
                                                            ? "bg-emerald-600 border-emerald-600 text-white"
                                                            : "bg-red-600 border-red-600 text-white"
                                                    }`}
                                                >
                                                    {det.empresa
                                                        ? `${det.empresa} / ${det.metodoPago}`
                                                        : det.metodoPago || "Seleccionar Detalle"
                                                    }
                                                </button>
                                                {tipoPago === "dividido" && (
                                                    <button
                                                        onClick={() => { if (detallesPago.length > (usarSaldoCartera ? 1 : 2)) setDetallesPago(detallesPago.filter((_, i) => i !== idx)) }}
                                                        disabled={detallesPago.length <= (usarSaldoCartera ? 1 : 2)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <X className="h-4 w-4 text-red-900" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    )}
                                    {tipoPago === "dividido" && (
                                        <button
                                            onClick={() => setDetallesPago([...detallesPago, { monto: "", empresa: "", metodoPago: "" }])}
                                            className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                                        >
                                            + Agregar
                                        </button>
                                    )}
                                    {tipoPago === "parcial" && (
                                        <div className="mt-3">
                                            <p className="text-sm font-medium text-slate-700 mb-1">Detalle (opcional)</p>
                                            <input
                                                type="text"
                                                value={pagoParcialTexto}
                                                onChange={(e) => setPagoParcialTexto(e.target.value)}
                                                placeholder="ej. abono de prueba"
                                                className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            {tipoPago === "dividido" && (
                                (() => {
                                    const suma = detallesPago.reduce((acc, d) => acc + (Number(d.monto) || 0), 0)
                                    const totalConCartera = suma + carteraUsada
                                    const coincide = Math.abs(totalConCartera - faltaPagar) < 0.01
                                    return (
                                        <div className={`p-3 rounded-lg border text-sm font-medium ${coincide ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                                            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <span>Total: <strong>S/ {faltaPagar.toFixed(2)}</strong></span>
                                                {carteraActiva && carteraUsada > 0 && (
                                                    <span>| Saldo a usar: <strong>S/ {carteraUsada.toFixed(2)}</strong></span>
                                                )}
                                                <span>| {carteraActiva ? `Restan S/ ` : `Total ingresado: S/ `}<strong>{carteraActiva ? Math.max(0, faltaPagarEfectiva - suma).toFixed(2) : suma.toFixed(2)}</strong></span>
                                                {coincide ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle className="h-4 w-4" /> Coincide con la deuda</span>
                                                ) : (
                                                    suma > 0 && (
                                                        <span className="text-red-600">(Diferencia: S/ {Math.abs(faltaPagar - totalConCartera).toFixed(2)})</span>
                                                    )
                                                )}
                                            </p>
                                        </div>
                                    )
                                })()
                            )}
                            {tipoPago === "parcial" && (
                                (() => {
                                    const montoLinea = Number(detallesPago[0]?.monto) || 0
                                    const totalPagando = montoLinea + (carteraActiva ? carteraUsada : 0)
                                    const saldoPorPagar = Math.max(0, faltaPagar - totalPagando)
                                    return totalPagando > 0 ? (
                                        <div className="p-3 rounded-lg border text-sm font-medium bg-amber-50 border-amber-200 text-amber-800">
                                            <p>
                                                Pago parcial{carteraActiva && carteraUsada > 0 ? ` (Cartera: S/ ${carteraUsada.toFixed(2)}${montoLinea > 0 ? ` + S/ ${montoLinea.toFixed(2)}` : ""})` : ""}: <span className="font-bold">S/ {totalPagando.toFixed(2)}</span>
                                                {" | "}Saldo por pagar: <span className="font-bold">S/ {saldoPorPagar.toFixed(2)}</span>
                                            </p>
                                        </div>
                                    ) : null
                                })()
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                onClick={() => { setShowPagoPedidoModal(false); setTipoPago(""); setPagoParcialTexto(""); setDetallesPago([{ monto: "", empresa: "", metodoPago: "" }, { monto: "", empresa: "", metodoPago: "" }]); setUsarSaldoCartera(false); setCarteraMontoCustom(0); setCarteraInputText("") }}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <Button
                                onClick={async () => {
                                    if (!tipoPago || guardandoPago) return
                                    setGuardandoPago(true)
                                    let textoPago = ""
                                    let cambiarEstado = true
                                    if (tipoPago === "completo") {
                                        textoPago = `PAGO: Completo - S/ ${faltaPagar.toFixed(2)}`
                                        const det = detallesPago[0]
                                        if (carteraActiva) {
                                            textoPago += ` (SALDO CARTERA)`
                                        } else if (det?.empresa) {
                                            if (det.empresa === "YAPE CARLOS" || det.empresa === "YAPE ANGEL") {
                                                textoPago += ` (${det.empresa})`
                                            } else {
                                                textoPago += ` (${det.empresa} / ${det.metodoPago})`
                                            }
                                        } else if (det?.metodoPago === "EFECTIVO") {
                                            textoPago += ` (EFECTIVO)`
                                        }
                                    } else if (tipoPago === "parcial") {
                                        cambiarEstado = false
                                        const monto = Number(detallesPago[0]?.monto) || 0
                                        const det = detallesPago[0]
                                        const totalPagado = monto + (carteraActiva ? carteraUsada : 0)
                                        const d = new Date()
                                        const fecha = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`
                                        let detalleStr = ""
                                        if (carteraActiva && carteraUsada > 0) {
                                            detalleStr = `SALDO CARTERA S/ ${carteraUsada.toFixed(2)}`
                                        }
                                        if (monto > 0) {
                                            if (detalleStr) detalleStr += ` + `
                                            if (det?.empresa) {
                                                if (det.empresa === "YAPE CARLOS" || det.empresa === "YAPE ANGEL") {
                                                    detalleStr += `${det.empresa}`
                                                } else {
                                                    detalleStr += `${det.empresa} / ${det.metodoPago}`
                                                }
                                            } else if (det?.metodoPago === "EFECTIVO") {
                                                detalleStr += `EFECTIVO`
                                            } else {
                                                detalleStr
                                            }
                                        }
                                        textoPago = `PAGO: Parcial - S/ ${totalPagado.toFixed(2)} (${detalleStr}) - ${fecha}`
                                        if (pagoParcialTexto.trim()) {
                                            textoPago += ` ${pagoParcialTexto.trim()}`
                                        }
                                    } else {
                                        const suma = detallesPago.reduce((acc, d) => acc + (Number(d.monto) || 0), 0)
                                        if (Math.abs(suma - faltaPagarEfectiva) >= 0.01) {
                                            setGuardandoPago(false)
                                            return
                                        }
                                        const detallesStr = detallesPago
                                            .filter(d => d.monto)
                                            .map(d => {
                                                let s = `S/ ${Number(d.monto).toFixed(2)}`
                                                if (d.empresa) {
                                                    if (d.empresa === "YAPE CARLOS" || d.empresa === "YAPE ANGEL") {
                                                        s += ` (${d.empresa})`
                                                    } else {
                                                        s += ` (${d.empresa} / ${d.metodoPago})`
                                                    }
                                                } else if (d.metodoPago === "EFECTIVO") {
                                                    s += ` (EFECTIVO)`
                                                }
                                                return s
                                            })
                                            .join(" + ")
                                        const totalPagado = suma + carteraUsada
                                        textoPago = carteraActiva
                                            ? `PAGO: Dividido - SALDO CARTERA S/ ${carteraUsada.toFixed(2)}${suma > 0 ? ` + ${detallesStr}` : ""} = S/ ${totalPagado.toFixed(2)}`
                                            : `PAGO: Dividido - ${detallesStr} = S/ ${suma.toFixed(2)}`
                                    }
                                    const currentNotas = (pedido as any).notas || ""
                                    const newNotas = currentNotas ? currentNotas + "\n" + textoPago : textoPago
                                    try {
                                        await fetch(`/api/pedidos/${pedido.id}`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(cambiarEstado ? { notas: newNotas, estado: "confirmado" } : { notas: newNotas })
                                        })
                                    } catch (e) {
                                        console.error("Error guardando pago:", e)
                                    }
                                    if (carteraUsada > 0 && pedido.clientePedidoId) {
                                        try {
                                            await fetch(`/api/clientes-pedido/${pedido.clientePedidoId}/cartera/movimientos`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    tipo: "cargo",
                                                    monto: carteraUsada,
                                                    concepto: `Pago aplicado a pedido ${pedido.numeroOrden}`,
                                                    referencia: pedido.numeroOrden,
                                                    pedidoId: pedido.id,
                                                }),
                                                credentials: "include",
                                            })
                                        } catch (e) {
                                            console.error("Error registrando movimiento de cartera:", e)
                                        }
                                    }
                                    if ((pedido as any).cargoDeuda > 0 && pedido.clientePedidoId) {
                                        try {
                                            await fetch(`/api/clientes-pedido/${pedido.clientePedidoId}/cartera/movimientos`, {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    tipo: "abono",
                                                    monto: (pedido as any).cargoDeuda,
                                                    concepto: `Pago de deuda incluido en pedido ${pedido.numeroOrden}`,
                                                    pedidoId: pedido.id,
                                                }),
                                                credentials: "include",
                                            })
                                        } catch (e) {
                                            console.error("Error abonando deuda en cartera:", e)
                                        }
                                    }
                                    setShowPagoPedidoModal(false)
                                    setTipoPago("")
                                    setPagoParcialTexto("")
                                    setDetallesPago([{ monto: "", empresa: "", metodoPago: "" }, { monto: "", empresa: "", metodoPago: "" }])
        setUsarSaldoCartera(false)
        setCarteraMontoCustom(0)
        setCarteraInputText("")
                                    setGuardandoPago(false)
                                    try { new BroadcastChannel("notificaciones").postMessage("refresh") } catch {}
                                    window.location.reload()
                                }}
                                disabled={guardandoPago || !tipoPago || (tipoPago !== "completo" && tipoPago !== "dividido" && tipoPago !== "parcial") || (tipoPago === "completo" && !(carteraActiva && saldoCartera >= faltaPagar) && !detallesPago[0]?.metodoPago) || (tipoPago === "parcial" && ((detallesPago[0]?.monto && (!detallesPago[0]?.metodoPago || (detallesPago[0]?.metodoPago !== "EFECTIVO" && !detallesPago[0]?.empresa))) || (!detallesPago[0]?.monto && !carteraActiva))) || (tipoPago === "dividido" && !(carteraActiva && faltaPagarEfectiva === 0) && !detallesPago.every(d => {
                                    if (!d.monto) return false
                                    if (d.metodoPago === "EFECTIVO") return true
                                    return d.empresa && d.metodoPago
                                }))}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9 px-4 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-modal Detalle de pago */}
            {showDetallePagoModal && detalleEditandoIdx !== null && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40" onClick={() => setShowDetallePagoModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                            <h3 className="text-base font-bold text-slate-900">Detalle de pago #{detalleEditandoIdx + 1}</h3>
                            <button onClick={() => setShowDetallePagoModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Empresa</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {EMPRESAS.map(emp => (
                                        <button
                                            key={emp}
                                            onClick={() => {
                                                const nuevo = [...detallesPago]
                                                const yaSeleccionada = nuevo[detalleEditandoIdx].empresa === emp
                                                const empresaFinal = yaSeleccionada ? "" : emp
                                                const metodo = (emp === "YAPE CARLOS" || emp === "YAPE ANGEL") && !yaSeleccionada ? "YAPE" : yaSeleccionada ? "" : nuevo[detalleEditandoIdx].metodoPago
                                                nuevo[detalleEditandoIdx] = { ...nuevo[detalleEditandoIdx], empresa: empresaFinal, metodoPago: metodo }
                                                setDetallesPago(nuevo)
                                            }}
                                            className={`px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all ${detallesPago[detalleEditandoIdx].empresa === emp ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"}`}
                                        >
                                            {emp}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Método de Pago</p>
                                <div className="flex flex-wrap gap-2">
                                    {METODOS_PAGO.map(mp => (
                                        <button
                                            key={mp}
                                            onClick={() => {
                                                const nuevo = [...detallesPago]
                                                const mpActual = nuevo[detalleEditandoIdx].metodoPago
                                                nuevo[detalleEditandoIdx] = { ...nuevo[detalleEditandoIdx], metodoPago: mpActual === mp ? "" : mp }
                                                setDetallesPago(nuevo)
                                            }}
                                            className={`px-3 py-1.5 border-2 rounded-lg text-sm font-medium transition-all ${detallesPago[detalleEditandoIdx].metodoPago === mp ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"}`}
                                        >
                                            {mp}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowDetallePagoModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <Button
                                onClick={() => {
                                    const det = detallesPago[detalleEditandoIdx]
                                    if (!det.metodoPago || (det.metodoPago !== "EFECTIVO" && !det.empresa)) {
                                        return
                                    }
                                    setShowDetallePagoModal(false)
                                }}
                                disabled={
                                    !detallesPago[detalleEditandoIdx].metodoPago ||
                                    (detallesPago[detalleEditandoIdx].metodoPago !== "EFECTIVO" && !detallesPago[detalleEditandoIdx].empresa)
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9 px-4 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Guardar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}