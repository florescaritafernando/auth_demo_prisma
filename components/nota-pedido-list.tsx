"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, FileText, Building2, CreditCard, User, Phone, MapPin, Truck, Package, FileCheck, ClipboardList, Search, X, Copy, Divide, Calendar, SlidersHorizontal } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"

const AGENCIA_LABELS: Record<string, string> = {
    shalom: "SHALOM",
    flores: "FLORES",
    marvisur: "MARVISUR",
    otros: "OTROS"
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; colorTexto: string }> = {
    metraje_en_proceso: { label: "Metraje en proceso", color: "bg-yellow-100", colorTexto: "text-yellow-800" },
    metraje_confirmado: { label: "Metraje confirmado", color: "bg-green-100", colorTexto: "text-green-800" },
    pendiente: { label: "Pago en revisión", color: "bg-blue-100", colorTexto: "text-blue-800" },
    confirmado: { label: "Pago confirmado", color: "bg-emerald-200", colorTexto: "text-emerald-900" },
    pedido_enviado: { label: "En tránsito", color: "bg-yellow-100", colorTexto: "text-yellow-800" },
    rechazado: { label: "Rechazado", color: "bg-red-100", colorTexto: "text-red-800" },
    completado: { label: "Completado", color: "bg-green-100", colorTexto: "text-green-800" },
}

const ESTADOS_FILTRO = [
    { value: "metraje_en_proceso", label: "Metraje en proceso" },
    { value: "metraje_confirmado", label: "Metraje confirmado" },
    { value: "pendiente", label: "Pago en revisión" },
    { value: "confirmado", label: "Pago confirmado" },
    { value: "pedido_enviado", label: "En tránsito" },
    { value: "rechazado", label: "Rechazado" },
    { value: "completado", label: "Completado" },
]

interface PedidoItem {
    id: string
    numeroOrden: string
    createdAt: string
    estado: string
    total: number
    costoEnvio: number
    metodoEnvio: string
    tipoDocumento: string
    numeroDoc: string
    nombreFactura: string
    direccion: string
    agencia: string
    agenciaOtro: string
    notas: string | null
    pedidoDetalle?: Array<{
        id: string
        cantidad: number
        metraje: number | null
        tipo: string
        precio: number
        indicacionesCorte?: string | null
        producto?: {
            nombre: string
            categoria: string
        }
        etiquetas?: Array<{ valor: number }>
    }>
    pedidoEmpleadoInfo?: {
        empresa: string | null
        metodoPago: string | null
        telefono: string | null
        guiaRemision: boolean
    } | null
    clientePedido?: {
        nombre: string
        tipoDoc: string
        numeroDoc: string
        razonSocial: string | null
        direccion: string | null
        telefono: string | null
        agencia: string | null
        agenciaOtro: string | null
        guiaRemision: boolean
        departamento: string | null
        provincia: string | null
        distrito: string | null
    } | null
    user?: {
        name: string
    }
}

interface Props {
    pedidos: PedidoItem[]
    userRole: string
}

export default function NotaPedidoList({ pedidos, userRole }: Props) {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [busquedaCliente, setBusquedaCliente] = useState("")
    const [estadoFiltro, setEstadoFiltro] = useState("")
    const [fechaInicio, setFechaInicio] = useState("")
    const [fechaFin, setFechaFin] = useState("")
    const [showFiltros, setShowFiltros] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [divisor, setDivisor] = useState<string>("")
    const [divisorPersonalizado, setDivisorPersonalizado] = useState("")
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const copiarAlPortapapeles = async (texto: string, field: string) => {
        try {
            await navigator.clipboard.writeText(texto)
            setCopiedField(field)
            setTimeout(() => setCopiedField(null), 2000)
        } catch {
            const textarea = document.createElement("textarea")
            textarea.value = texto
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand("copy")
            document.body.removeChild(textarea)
            setCopiedField(field)
            setTimeout(() => setCopiedField(null), 2000)
        }
    }

    const toggleExpanded = (id: string) => {
        if (id !== expandedId) {
            setDivisor("")
            setDivisorPersonalizado("")
            setExpandedId(id)
        } else {
            setExpandedId(null)
        }
    }

    const filteredPedidos = useMemo(() => {
        return pedidos.filter(p => {
            if (busquedaCliente) {
                const nombre = p.clientePedido?.nombre?.toLowerCase() || p.nombreFactura?.toLowerCase() || ""
                if (!nombre.includes(busquedaCliente.toLowerCase())) return false
            }

            if (estadoFiltro && p.estado !== estadoFiltro) return false

            if (fechaInicio || fechaFin) {
                const d = new Date(p.createdAt)
                const year = d.getFullYear()
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                const pedidoFecha = `${year}-${month}-${day}`

                if (fechaInicio && fechaFin) {
                    if (pedidoFecha < fechaInicio || pedidoFecha > fechaFin) return false
                } else if (fechaInicio) {
                    if (pedidoFecha < fechaInicio) return false
                } else if (fechaFin) {
                    if (pedidoFecha > fechaFin) return false
                }
            }

            return true
        })
    }, [pedidos, busquedaCliente, estadoFiltro, fechaInicio, fechaFin])

    const limpiarFiltros = () => {
        setBusquedaCliente("")
        setEstadoFiltro("")
        setFechaInicio("")
        setFechaFin("")
        setCurrentPage(1)
    }

    const tieneFiltros = estadoFiltro || fechaInicio || fechaFin
    const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage)
    const startIdx = (currentPage - 1) * itemsPerPage
    const paginatedPedidos = filteredPedidos.slice(startIdx, startIdx + itemsPerPage)

    return (
        <div className="space-y-4">
            {/* Search + Filter Toggle */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        value={busquedaCliente}
                        onChange={(e) => setBusquedaCliente(e.target.value)}
                        placeholder="N° orden o cliente..."
                        className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all"
                    />
                    {busquedaCliente && (
                        <button
                            onClick={() => setBusquedaCliente("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
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

            {/* Filter Panel */}
            {showFiltros && (
                <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <select
                            value={estadoFiltro}
                            onChange={(e) => setEstadoFiltro(e.target.value)}
                            className="h-9 px-3 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                        >
                            <option value="">Estado</option>
                            {ESTADOS_FILTRO.map(estado => (
                                <option key={estado.value} value={estado.value}>{estado.label}</option>
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

            {paginatedPedidos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Search className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-sm text-slate-500">No se encontraron pedidos con los filtros aplicados.</p>
                </div>
            ) : (<>
                {paginatedPedidos.map(pedido => {
                const config = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG.metraje_en_proceso
                const isExpanded = expandedId === pedido.id
                const subtotal = pedido.pedidoDetalle?.reduce((sum, d) => {
                    const metros = d.tipo === "pieza"
                        ? (d.etiquetas?.reduce((s, e) => s + e.valor, 0) || 0)
                        : (d.metraje || d.cantidad)
                    return sum + (d.precio * metros)
                }, 0) || 0

                return (
                    <div key={pedido.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        {/* Header */}
                        <div
                            className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => toggleExpanded(pedido.id)}
                        >
                            <div className="flex items-center justify-between flex-wrap gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                        <FileText className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{pedido.numeroOrden}</p>
                                        <p className="text-xs text-slate-500">
                                            {new Date(pedido.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}
                                            {pedido.user && ` • por ${pedido.user.name}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${config.color} ${config.colorTexto}`}>
                                        {config.label}
                                    </span>
                                    <p className="font-bold text-slate-900">S/ {Number(pedido.total).toFixed(2)}</p>
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        {isExpanded ? (
                                            <ChevronUp className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                            <div className="border-t border-slate-100">
                                <div className="p-4 space-y-4">
                                    {/* Info Empleado */}
                                    {pedido.pedidoEmpleadoInfo && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                                                <Building2 className="h-4 w-4 text-blue-500" />
                                                <p className="font-semibold text-slate-700 text-sm">Info del Pedido</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                {pedido.pedidoEmpleadoInfo.empresa && (
                                                    <div className="flex items-start gap-2">
                                                        <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-slate-500 text-xs">Empresa</p>
                                                            <p className="font-medium text-slate-800">{pedido.pedidoEmpleadoInfo.empresa}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {pedido.pedidoEmpleadoInfo.metodoPago && (
                                                    <div className="flex items-start gap-2">
                                                        <CreditCard className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-slate-500 text-xs">Método de Pago</p>
                                                            <p className="font-medium text-slate-800">{pedido.pedidoEmpleadoInfo.metodoPago}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {pedido.pedidoEmpleadoInfo.telefono && (
                                                    <div className="flex items-start gap-2">
                                                        <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-slate-500 text-xs">Teléfono</p>
                                                            <p className="font-medium text-slate-800">{pedido.pedidoEmpleadoInfo.telefono}</p>
                                                            {pedido.user?.name && (
                                                                <p className="text-xs text-slate-400">({pedido.user.name})</p>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => copiarAlPortapapeles(pedido.pedidoEmpleadoInfo?.telefono || "", "telEmpleado")}
                                                            className="p-1.5 rounded hover:bg-slate-200 transition-colors shrink-0"
                                                            title="Copiar teléfono"
                                                        >
                                                            {copiedField === "telEmpleado" ? (
                                                                <span className="text-xs text-green-600 font-medium">Copiado</span>
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                                <div className="flex items-start gap-2">
                                                    <FileCheck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Guía de remisión</p>
                                                        <p className="font-medium text-slate-800">{pedido.pedidoEmpleadoInfo.guiaRemision ? "Sí" : "No"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Datos del Cliente */}
                                    {pedido.clientePedido && (() => {
                                        const c = pedido.clientePedido!
                                        return (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                                                <User className="h-4 w-4 text-green-500" />
                                                <p className="font-semibold text-slate-700 text-sm">Datos del Cliente</p>
                                            </div>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                                                    <User className="h-4 w-4 text-slate-400 shrink-0" />
                                                    <span className="text-slate-500 text-xs w-16 shrink-0">Cliente:</span>
                                                    <span className="font-medium text-slate-800 flex-1">{c.nombre?.toUpperCase()}</span>
                                                    <button
                                                        onClick={() => copiarAlPortapapeles(c.nombre || "", "nombre")}
                                                        className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                                                        title="Copiar nombre"
                                                    >
                                                        {copiedField === "nombre" ? (
                                                            <span className="text-xs text-green-600 font-medium">Copiado</span>
                                                        ) : (
                                                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                                                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                                                    <span className="text-slate-500 text-xs w-16 shrink-0">{c.tipoDoc?.toUpperCase() || "DOC"}:</span>
                                                    <span className="font-medium text-slate-800 flex-1">{c.numeroDoc}</span>
                                                    <button
                                                        onClick={() => copiarAlPortapapeles(c.numeroDoc, "ruc")}
                                                        className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                                                        title="Copiar RUC/DNI"
                                                    >
                                                        {copiedField === "ruc" ? (
                                                            <span className="text-xs text-green-600 font-medium">Copiado</span>
                                                        ) : (
                                                            <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                        )}
                                                    </button>
                                                </div>
                                                {c.razonSocial && (
                                                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                                                        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <span className="text-slate-500 text-xs w-16 shrink-0">R. Social:</span>
                                                        <span className="font-medium text-slate-800 flex-1">{c.razonSocial}</span>
                                                        <button
                                                            onClick={() => copiarAlPortapapeles(c.razonSocial || "", "razonSocial")}
                                                            className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                                                            title="Copiar razón social"
                                                        >
                                                            {copiedField === "razonSocial" ? (
                                                                <span className="text-xs text-green-600 font-medium">Copiado</span>
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                                {c.direccion && (
                                                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                                                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <span className="text-slate-500 text-xs w-16 shrink-0">Dirección:</span>
                                                        <span className="font-medium text-slate-800 flex-1">
                                                            {c.direccion?.toUpperCase()}
                                                            {c.departamento && (
                                                                <span className="text-xs text-slate-400 ml-1">({c.departamento} / {c.provincia} / {c.distrito})</span>
                                                            )}
                                                        </span>
                                                        <button
                                                            onClick={() => copiarAlPortapapeles(c.direccion || "", "direccion")}
                                                            className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                                                            title="Copiar dirección"
                                                        >
                                                            {copiedField === "direccion" ? (
                                                                <span className="text-xs text-green-600 font-medium">Copiado</span>
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                                {c.telefono && (
                                                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                                                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <span className="text-slate-500 text-xs w-16 shrink-0">Teléfono:</span>
                                                        <span className="font-medium text-slate-800 flex-1">{c.telefono}</span>
                                                        <button
                                                            onClick={() => copiarAlPortapapeles(c.telefono || "", "telefono")}
                                                            className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                                                            title="Copiar teléfono"
                                                        >
                                                            {copiedField === "telefono" ? (
                                                                <span className="text-xs text-green-600 font-medium">Copiado</span>
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                                {c.agencia && (() => {
                                                    const textoAgencia = c.agencia === "otros" ? (c.agenciaOtro || "OTROS") : (AGENCIA_LABELS[c.agencia] || c.agencia)
                                                    return (
                                                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                                                        <Truck className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <span className="text-slate-500 text-xs w-16 shrink-0">Agencia:</span>
                                                        <span className="font-medium text-slate-800 flex-1">{textoAgencia}</span>
                                                        <button
                                                            onClick={() => copiarAlPortapapeles(textoAgencia, "agencia")}
                                                            className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                                                            title="Copiar agencia"
                                                        >
                                                            {copiedField === "agencia" ? (
                                                                <span className="text-xs text-green-600 font-medium">Copiado</span>
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    )
                                                })()}
                                            </div>
                                        </div>
                                        )
                                    })()}

                                    {/* Artículos */}
                                    {pedido.pedidoDetalle && pedido.pedidoDetalle.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                                                <Package className="h-4 w-4 text-purple-500" />
                                                <p className="font-semibold text-slate-700 text-sm">Artículos ({pedido.pedidoDetalle.length})</p>
                                            </div>
                                            <div className="space-y-2">
                                                {pedido.pedidoDetalle.map((detalle, idx) => {
                                                    const metrajeTotal = detalle.etiquetas?.reduce((s, e) => s + e.valor, 0) || detalle.metraje || detalle.cantidad
                                                    const subtotalItem = detalle.precio * Number(metrajeTotal)
                                                    const cantidadPiezas = detalle.etiquetas?.length || detalle.cantidad
                                                    return (
                                                        <div key={idx} className="flex justify-between items-start bg-slate-50 p-3 rounded-lg">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-slate-900 text-sm">{detalle.producto?.nombre || `Producto ${idx + 1}`}</p>
                                                                <p className="text-xs text-slate-400">{detalle.producto?.categoria || ""}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {detalle.tipo === "pieza" ? (
                                                                        <span className="text-xs text-slate-500">{cantidadPiezas} pieza(s) • {Number(metrajeTotal).toFixed(2)} mts</span>
                                                                    ) : (
                                                                        <span className="text-xs text-slate-500">{Number(metrajeTotal).toFixed(2)} metro(s)</span>
                                                                    )}
                                                                    <span className="text-xs text-slate-300">•</span>
                                                                    <span className="text-xs text-slate-500">S/ {detalle.precio.toFixed(2)}/m</span>
                                                                </div>
                                                                {detalle.indicacionesCorte && (
                                                                    <p className="text-xs text-amber-600 mt-1">{detalle.indicacionesCorte}</p>
                                                                )}
                                                            </div>
                                                            <p className="font-semibold text-slate-900 text-sm shrink-0 ml-3">S/ {subtotalItem.toFixed(2)}</p>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Totales */}
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Subtotal</span>
                                                <span className="font-medium text-slate-900">S/ {subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Costo envío</span>
                                                <span className="font-medium text-slate-900">S/ {Number(pedido.costoEnvio || 0).toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between pt-1 border-t border-slate-200">
                                                <span className="font-bold text-slate-900">Total</span>
                                                <span className="font-bold text-slate-900 text-lg">S/ {Number(pedido.total).toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dividir entre */}
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Divide className="h-4 w-4 text-slate-500" />
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dividir entre</p>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {["18", "20"].map((num) => (
                                                <button
                                                    key={num}
                                                    onClick={() => setDivisor(num)}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${divisor === num ? "bg-slate-800 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"}`}
                                                >
                                                    {num}
                                                </button>
                                            ))}
                                            <div className="relative flex-1 max-w-[120px]">
                                                <input
                                                    type="number"
                                                    value={divisorPersonalizado}
                                                    onChange={(e) => {
                                                        setDivisorPersonalizado(e.target.value)
                                                        setDivisor("")
                                                    }}
                                                    placeholder="Otro"
                                                    className="w-full px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                />
                                            </div>
                                        </div>
                                        {(() => {
                                            const valorDivisor = divisor || divisorPersonalizado
                                            if (!valorDivisor || Number(valorDivisor) <= 0) return null
                                            const resultado = Number(pedido.total) / Number(valorDivisor)
                                            return (
                                                <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-slate-200">
                                                    <div>
                                                        <span className="text-xs text-slate-500">S/ {Number(pedido.total).toFixed(2)} ÷ {valorDivisor} =</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 text-lg">{resultado.toFixed(2)}</span>
                                                        <span className="text-xs text-slate-400">mts</span>
                                                        <button
                                                            onClick={() => copiarAlPortapapeles(resultado.toFixed(2), `dividir_${valorDivisor}`)}
                                                            className="p-1.5 rounded hover:bg-slate-100 transition-colors"
                                                            title="Copiar resultado"
                                                        >
                                                            {copiedField === `dividir_${valorDivisor}` ? (
                                                                <span className="text-xs text-green-600 font-medium">Copiado</span>
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                        })()}
                                    </div>

                                    {/* Observaciones */}
                                    {pedido.notas && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <ClipboardList className="h-4 w-4 text-slate-400" />
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Observaciones</p>
                                            </div>
                                            <p className="text-sm text-slate-700 bg-amber-50 border border-amber-100 rounded-lg p-3">{pedido.notas}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}

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
            </>)}
        </div>
    )
}
