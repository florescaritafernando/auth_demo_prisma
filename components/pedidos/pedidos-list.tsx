"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Search, X, Calendar } from "lucide-react"
import { Package, Clock, CheckCircle, XCircle, MapPin, CreditCard, Phone, FileText, PlayCircle, ChevronDown, ChevronUp, Eye, Info, PackageCheck } from "lucide-react"
import { FeedbackModal } from "./FeedbackModal"
import { QuejaModal } from "./QuejaModal"

const ESTADO_CONFIG: Record<string, { label: string; color: string; colorTexto: string; icon: any }> = {
    metraje_en_proceso: { label: "Metraje en proceso", color: "bg-yellow-100", colorTexto: "text-yellow-800", icon: Clock },
    metraje_confirmado: { label: "Confirmado", color: "bg-green-100", colorTexto: "text-green-800", icon: CheckCircle },
    pendiente: { label: "Pago en revision", color: "bg-blue-100", colorTexto: "text-blue-800", icon: Package },
    confirmado: { label: "Pago confirmado", color: "bg-blue-200", colorTexto: "text-blue-900", icon: CheckCircle },
    pedido_enviado: { label: "En transito", color: "bg-yellow-100", colorTexto: "text-yellow-800", icon: Package },
    rechazado: { label: "Pedido rechazado", color: "bg-red-100", colorTexto: "text-red-800", icon: XCircle },
    completado: { label: "Pedido completado", color: "bg-green-100", colorTexto: "text-green-800", icon: CheckCircle },
}

const AGENCIA_LABELS: Record<string, string> = {
    shalom: "SHALOM",
    flores: "FLORES",
    marvisur: "MARVISUR",
    otros: "OTROS"
}

const DELIVERY_LABELS: Record<string, string> = {
    olva: "OLVA",
    safexpress: "SAF EXPRESS",
    otros: "OTROS"
}

interface PedidoItem {
    id: string
    numeroOrden: string
    createdAt: string
    estado: string
    total: number
    subtotal: number
    costoEnvio: number
    metodoEnvio: string
    tipoDocumento: string
    numeroDoc: string
    nombreFactura: string
    direccion: string
    departamento: string
    provincia: string
    distrito: string
    agencia: string
    agenciaOtro: string
    delivery: string
    deliveryOtro: string
    tipoEnvio: string
    nombreRecibe: string
    dniRecibe: string
    numeroOperacion: string
    motivoRechazo: string | null
    pedidoDetalle?: Array<{
        id: string
        cantidad: number
        metraje: number | null
        tipo: string
        precio: number
        producto?: {
            id: string
            nombre: string
        }
    }>
    tienda?: {
        id: string
        nombre: string
        direccion: string
    }
}

interface PedidosListProps {
    pedidos: PedidoItem[]
    userRole: string
}

function PedidoCard({ pedido, userRole, setFeedbackModal, setQuejaModal, isExpanded, onToggle }: { pedido: PedidoItem; userRole: string; setFeedbackModal: (modal: { pedidoId: string; numeroOrden: string } | null) => void; setQuejaModal: (modal: { pedidoId: string; numeroOrden: string } | null) => void; isExpanded?: boolean; onToggle?: () => void }) {
    const [internalExpanded, setInternalExpanded] = useState(false)
    const expanded = isExpanded !== undefined ? isExpanded : internalExpanded
    const setExpanded = isExpanded !== undefined ? onToggle! : setInternalExpanded
    const [showMotivo, setShowMotivo] = useState(false)
    const [showPagoDetails, setShowPagoDetails] = useState(false)
    const config = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG.metraje_en_proceso
    const IconComponent = config.icon
    const agenciaLabel = pedido.agencia ? (AGENCIA_LABELS[pedido.agencia] || pedido.agenciaOtro) : null
    const deliveryLabel = pedido.delivery ? (DELIVERY_LABELS[pedido.delivery] || pedido.deliveryOtro) : null

    const ocultarPrecio = pedido.estado === "metraje_en_proceso"
    const mostrarContinuar = pedido.estado === "metraje_confirmado"
    const ocultarPago = ocultarPrecio || pedido.estado === "metraje_confirmado"
    const tieneReclamo = (pedido as any).reclamos?.length > 0

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div
                className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 text-lg">{pedido.numeroOrden}</p>
                            <p className="text-sm text-slate-500">
                                {new Date(pedido.createdAt).toLocaleDateString("es-PE", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            {ocultarPrecio ? (
                                <p className="text-sm text-slate-500 font-italic">Precio en revisión</p>
                            ) : (
                                <p className="font-bold text-slate-900 text-lg">S/ {Number(pedido.total).toFixed(2)}</p>
                            )}
                            <p className="text-sm text-slate-500">
                                {pedido.pedidoDetalle?.length || 0} items
                            </p>
                        </div>

                        <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${config.color} ${config.colorTexto} flex items-center gap-1`}>
                            <IconComponent className="h-4 w-4" />
                            {config.label}
                        </span>

                        {pedido.estado === "rechazado" && pedido.motivoRechazo && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowMotivo(true)
                                }}
                                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full"
                                title="Ver motivo de rechazo"
                            >
                                <Eye className="h-4 w-4" />
                            </button>
                        )}

                        {pedido.estado === "pendiente" && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setShowPagoDetails(true)
                                }}
                                className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-full"
                                title="Ver información del pago"
                            >
                                <Info className="h-4 w-4" />
                            </button>
                        )}

                        {mostrarContinuar && (
                            <Link href={`/dashboard/checkout?pedido=${pedido.id}`}>
                                <Button className="bg-green-600 hover:bg-green-700 text-sm">
                                    <PlayCircle className="h-4 w-4 mr-1" />
                                    Continuar
                                </Button>
                            </Link>
                        )}

                        {pedido.estado === "pedido_enviado" && (
                            <>
                                <Button
                                    onClick={() => setFeedbackModal({ pedidoId: pedido.id, numeroOrden: pedido.numeroOrden })}
                                    className="bg-green-600 hover:bg-green-700 text-sm"
                                >
                                    <PackageCheck className="h-4 w-4 mr-1" />
                                    Recibí mi pedido
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => !tieneReclamo && setQuejaModal({ pedidoId: pedido.id, numeroOrden: pedido.numeroOrden })}
                                    disabled={tieneReclamo}
                                    className={`text-sm border-red-300 ${tieneReclamo ? "text-slate-400 bg-slate-50 cursor-not-allowed" : "text-red-600 hover:bg-red-50"}`}
                                >
                                    {tieneReclamo ? "Reclamo registrado" : "Queja"}
                                </Button>
                            </>
                        )}

                        {userRole === "admin" && (
                            <form action={`/api/pedidos/${pedido.id}`} method="POST">
                                <select
                                    name="estado"
                                    defaultValue={pedido.estado}
                                    onChange={(e) => e.target.form?.submit()}
                                    onClick={(e) => e.stopPropagation()}
                                    className="appearance-none bg-white border border-slate-300 rounded px-3 py-1.5 text-sm cursor-pointer hover:border-slate-400"
                                >
                                    {Object.keys(ESTADO_CONFIG).map(s => (
                                        <option key={s} value={s}>{ESTADO_CONFIG[s].label}</option>
                                    ))}
                                </select>
                            </form>
                        )}

                        <div className="w-8 h-8 flex items-center justify-center">
                            {expanded ? (
                                <ChevronUp className="h-5 w-5 text-slate-400" />
                            ) : (
                                <ChevronDown className="h-5 w-5 text-slate-400" />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100">
                    <div className="p-4 bg-slate-50">
                        <p className="font-bold text-slate-800 mb-3">Artículos:</p>
                        <div className="space-y-2 mb-4">
                            {pedido.pedidoDetalle?.map((detalle, idx) => {
                                const isPiezaPendingMetraje = pedido.estado === "metraje_en_proceso" && detalle.tipo === "pieza"
                                return (
                                    <div key={idx} className={`flex justify-between items-center text-sm bg-white p-2 rounded border ${isPiezaPendingMetraje ? "border-amber-300 bg-amber-50" : "border-slate-200"}`}>
                                        <div className="text-slate-800">
                                            <p className="font-medium">{detalle.producto?.nombre || `Producto ${idx + 1}`}</p>
                                            {isPiezaPendingMetraje ? (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {detalle.cantidad} pieza(s) × S/ {Number(detalle.precio).toFixed(2)}/m
                                                </p>
                                            ) : (
                                                <p className="text-xs text-slate-500">
                                                    {detalle.metraje
                                                        ? `${detalle.metraje}m × S/ ${Number(detalle.precio).toFixed(2)}/m`
                                                        : `${detalle.cantidad} ${detalle.tipo === "pieza" ? "pieza(s)" : "m"} × S/ ${Number(detalle.precio).toFixed(2)}/m`
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {isPiezaPendingMetraje ? (
                                                <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
                                                    Metraje por confirmar
                                                </span>
                                            ) : (
                                                <span className="text-slate-800 font-medium">
                                                    S/ {(detalle.metraje ? detalle.metraje * detalle.precio : detalle.cantidad * detalle.precio).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {!ocultarPrecio && (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Subtotal:</span>
                                    <span className="text-slate-800">S/ {Number(pedido.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Costo envío:</span>
                                    <span className="text-slate-800">S/ {Number(pedido.costoEnvio || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold">
                                    <span className="text-slate-800">Total:</span>
                                    <span className="text-slate-800">S/ {Number(pedido.total).toFixed(2)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                                <CreditCard className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-slate-500">Facturación:</p>
                                    <p className="font-medium text-slate-800">
                                        {pedido.nombreFactura} ({pedido.tipoDocumento?.toUpperCase()} {pedido.numeroDoc})
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-slate-500">Envío:</p>
                                    <p className="font-medium text-slate-800">
                                        {pedido.metodoEnvio === "tienda" ? "Retiro en Tienda" :
                                            pedido.metodoEnvio === "agencia" ? `Agencia: ${agenciaLabel || pedido.agenciaOtro || "No especificada"}` :
                                                pedido.metodoEnvio === "delivery" ? `Delivery: ${deliveryLabel || pedido.deliveryOtro || "No especificado"}` :
                                                    "-"}
                                    </p>
                                    {pedido.tienda && pedido.tienda && (
                                        <p className="text-slate-500">{pedido.tienda.nombre} - {pedido.tienda.direccion}</p>
                                    )}
                                    {pedido.tipoEnvio === "otropersona" && pedido.nombreRecibe && (
                                        <p className="text-slate-500">Recibe: {pedido.nombreRecibe} (DNI: {pedido.dniRecibe})</p>
                                    )}
                                    {pedido.direccion && pedido.metodoEnvio !== "tienda" && (
                                        <p className="text-slate-500">{pedido.direccion}</p>
                                    )}
                                </div>
                            </div>

                            {!ocultarPago && (
                                <div className="flex items-start gap-2">
                                    <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-slate-500">Pago:</p>
                                        <p className="font-medium text-slate-800">
                                            Nro. Operación: {pedido.numeroOperacion || "No registrado"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-2">
                                <Package className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-slate-500">Costo envío:</p>
                                    <p className="font-medium text-slate-800">S/ {Number(pedido.costoEnvio || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showMotivo && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowMotivo(false)}>
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-red-700">Motivo de Rechazo</h2>
                            <button onClick={() => setShowMotivo(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <p className="text-slate-700 whitespace-pre-wrap">{pedido.motivoRechazo}</p>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={() => setShowMotivo(false)} variant="outline">Cerrar</Button>
                        </div>
                    </div>
                </div>
            )}

            {showPagoDetails && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowPagoDetails(false)}>
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-blue-700">Detalles del Pago</h2>
                            <button onClick={() => setShowPagoDetails(false)} className="text-slate-400 hover:text-slate-600">
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-sm text-slate-500">Número de operación:</p>
                                <p className="font-bold text-slate-800">{pedido.numeroOperacion || "No registrado"}</p>
                            </div>

                            <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-sm text-slate-500">Estado del pago:</p>
                                <p className="font-bold text-yellow-700">En revisión</p>
                            </div>

                            <p className="text-sm text-slate-600">
                                Tu comprobante de pago está siendo verificado por nuestro equipo.
                            </p>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <Button onClick={() => setShowPagoDetails(false)} variant="outline">Cerrar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const ESTADOS = [
    { value: "metraje_confirmado", label: "Metraje confirmado" },
    { value: "pendiente", label: "Pago en revisión" },
    { value: "confirmado", label: "Pago confirmado" },
    { value: "pedido_enviado", label: "En tránsito" },
    { value: "rechazado", label: "Pedido rechazado" },
    { value: "completado", label: "Pedido completado" },
]

export default function PedidosList({ pedidos, userRole }: PedidosListProps) {
    const [busqueda, setBusqueda] = useState("")
    const [estadoFiltro, setEstadoFiltro] = useState("")
    const [fechaInicio, setFechaInicio] = useState("")
    const [fechaFin, setFechaFin] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const router = useRouter()

    const [feedbackModal, setFeedbackModal] = useState<{ pedidoId: string; numeroOrden: string } | null>(null)
    const [quejaModal, setQuejaModal] = useState<{ pedidoId: string; numeroOrden: string } | null>(null)
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

    useEffect(() => {
        const hash = window.location.hash.slice(1)
        if (hash) {
            setExpandedIds(new Set([hash]))
            window.history.replaceState({}, '', window.location.pathname)
        }
    }, [])

    const toggleExpanded = (id: string) => {
        setExpandedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 4000)
    }

    const handleFeedbackSubmit = async (data: { calificacion: number; comentario: string; etiquetas: string[] }) => {
        if (!feedbackModal) return
        try {
            const res = await fetch(`/api/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pedidoId: feedbackModal.pedidoId,
                    ...data
                }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                setFeedbackModal(null)
                router.refresh()
                showToast("Feedback enviado exitosamente", "success")
            } else {
                showToast(json.error || "Error al enviar feedback", "error")
            }
        } catch (e) {
            showToast("Error de conexión", "error")
        }
    }

    const handleQuejaSubmit = async (data: { tipo: string; descripcion: string; detalle_pedido: string }) => {
        if (!quejaModal) return
        try {
            const res = await fetch(`/api/reclamos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pedidoId: quejaModal.pedidoId,
                    ...data
                }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                setQuejaModal(null)
                showToast("Tu reporte ha sido enviado exitosamente", "success")
            } else {
                showToast(json.error || "Error al enviar", "error")
            }
        } catch (e) {
            showToast("Error de conexión", "error")
        }
    }

    const filteredPedidos = pedidos.filter((pedido: any) => {
        // Buscador por número de pedido
        if (busqueda) {
            if (!pedido.numeroOrden.toLowerCase().includes(busqueda.toLowerCase())) {
                return false
            }
        }

        // Filtro por estado
        if (estadoFiltro && pedido.estado !== estadoFiltro) {
            return false
        }

        // Filtro por rango de fechas
        if (fechaInicio || fechaFin) {
            const createdAtDate = new Date(pedido.createdAt)
            const year = createdAtDate.getFullYear()
            const month = String(createdAtDate.getMonth() + 1).padStart(2, '0')
            const day = String(createdAtDate.getDate()).padStart(2, '0')
            const pedidoFechaStr = `${year}-${month}-${day}`

            if (fechaInicio && pedidoFechaStr < fechaInicio) return false
            if (fechaFin && pedidoFechaStr > fechaFin) return false
        }

        return true
    })

    const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage)
    const startIdx = (currentPage - 1) * itemsPerPage
    const paginatedPedidos = filteredPedidos.slice(startIdx, startIdx + itemsPerPage)

    const tieneFiltrosActivos = busqueda || estadoFiltro || fechaInicio || fechaFin

    const limpiarFiltros = () => {
        setBusqueda("")
        setEstadoFiltro("")
        setFechaInicio("")
        setFechaFin("")
        setCurrentPage(1)
    }

    return (
        <div>
            {/* Filtros */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    {/* Buscador */}
                    <div className="relative h-10">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value)
                                setCurrentPage(1)
                            }}
                            placeholder="Número de pedido..."
                            className="w-full h-full pl-10 pr-4 border border-slate-300 rounded-lg text-sm text-black"
                        />
                    </div>

                    {/* Filtro Estado */}
                    <select
                        value={estadoFiltro}
                        onChange={(e) => {
                            setEstadoFiltro(e.target.value)
                            setCurrentPage(1)
                        }}
                        className="h-10 px-3 border border-slate-300 rounded-lg text-sm text-black"
                    >
                        <option value="">Todos los estados</option>
                        {ESTADOS.map(estado => (
                            <option key={estado.value} value={estado.value}>{estado.label}</option>
                        ))}
                    </select>

                    {/* Fecha Inicio */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">Fecha inicio</label>
                        <div className="relative h-10 flex items-center" onClick={() => (document.getElementById('fecha-inicio-user') as HTMLInputElement)?.showPicker()}>
                            <Calendar className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                id="fecha-inicio-user"
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => {
                                    setFechaInicio(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="w-full h-full pl-10 pr-2 border border-slate-300 rounded-lg text-sm text-black cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Fecha Fin */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-slate-500">Fecha fin</label>
                        <div className="relative h-10 flex items-center" onClick={() => (document.getElementById('fecha-fin-user') as HTMLInputElement)?.showPicker()}>
                            <Calendar className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                            <input
                                id="fecha-fin-user"
                                type="date"
                                value={fechaFin}
                                onChange={(e) => {
                                    setFechaFin(e.target.value)
                                    setCurrentPage(1)
                                }}
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
                <div className="space-y-4">
                    {paginatedPedidos.map((pedido: any) => (
                        <PedidoCard
                            key={pedido.id}
                            pedido={pedido}
                            userRole={userRole}
                            setFeedbackModal={setFeedbackModal}
                            setQuejaModal={setQuejaModal}
                            isExpanded={expandedIds.has(pedido.id)}
                            onToggle={() => toggleExpanded(pedido.id)}
                        />
                    ))}

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
                </div>
            )}

            {feedbackModal && (
                <FeedbackModal
                    pedidoId={feedbackModal.pedidoId}
                    numeroOrden={feedbackModal.numeroOrden}
                    onClose={() => setFeedbackModal(null)}
                    onSubmit={handleFeedbackSubmit}
                />
            )}

            {quejaModal && (
                <QuejaModal
                    pedidoId={quejaModal.pedidoId}
                    numeroOrden={quejaModal.numeroOrden}
                    onClose={() => setQuejaModal(null)}
                    onSubmit={handleQuejaSubmit}
                />
            )}

            {toast && (
                <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-in slide-in-from-bottom-4 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
                    <span className="text-white font-medium">{toast.message}</span>
                    <button onClick={() => setToast(null)} className="text-white/80 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}
        </div>
    )
}