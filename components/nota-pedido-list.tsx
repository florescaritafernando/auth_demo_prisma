"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronDown, ChevronUp, FileText, Building2, CreditCard, User, Phone, MapPin, Truck, Package, FileCheck, ClipboardList, Search, X, Copy, Divide, Calendar, SlidersHorizontal, Printer, DollarSign, CheckCircle } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
import { CobrarPedidoModal } from "@/components/cobrar-pedido-modal"

const AGENCIA_LABELS: Record<string, string> = {
    antezana: "ANTEZANA",
    shalom: "SHALOM",
    flores: "FLORES",
    marvisur: "MARVISUR",
    grael: "GRAEL",
    raza: "RAZA",
    rana_express: "RANA EXPRESS",
    carhuamayo: "CARHUAMAYO",
    otros: "OTROS"
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; colorTexto: string }> = {
    metraje_en_proceso: { label: "Metraje en proceso", color: "bg-yellow-100", colorTexto: "text-yellow-800" },
    metraje_confirmado: { label: "Metraje confirmado", color: "bg-green-100", colorTexto: "text-green-800" },
    pendiente: { label: "Pago en revisión", color: "bg-amber-100", colorTexto: "text-amber-800" },
    confirmado: { label: "Pago confirmado", color: "bg-green-200", colorTexto: "text-green-900" },
    pedido_enviado: { label: "Pedido enviado", color: "bg-yellow-100", colorTexto: "text-yellow-800" },
    rechazado: { label: "Pedido rechazado", color: "bg-red-100", colorTexto: "text-red-800" },
    completado: { label: "Pedido completado", color: "bg-blue-100", colorTexto: "text-blue-800" },
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
    departamento: string | null
    provincia: string | null
    distrito: string | null
    nombreRecibe: string | null
    dniRecibe: string | null
    celularRecibe: string | null
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
        envioComprobante: string | null
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
    const [telefonoColaborador, setTelefonoColaborador] = useState<Record<string, string>>({})
    const [showDividirPartes, setShowDividirPartes] = useState(false)
    const [partesMontos, setPartesMontos] = useState<string[]>([])
    const [nuevoMonto, setNuevoMonto] = useState("")
    const [precioPartes, setPrecioPartes] = useState("20.00")
    const [precioPersonalizado, setPrecioPersonalizado] = useState("")
    const [showModalXml, setShowModalXml] = useState<string | null>(null)
    const [xmlFile, setXmlFile] = useState<File | null>(null)
    const [formatoXml, setFormatoXml] = useState<"ticket" | "shipping_label">("ticket")
    const [convirtiendoXml, setConvirtiendoXml] = useState(false)
    const [xmlAgencia, setXmlAgencia] = useState("")
    const [xmlOtraAgencia, setXmlOtraAgencia] = useState("")
    const [xmlNotas, setXmlNotas] = useState("")
    const [xmlRecojeOtraPersona, setXmlRecojeOtraPersona] = useState(false)
    const [xmlRecojeDni, setXmlRecojeDni] = useState("")
    const [xmlRecojeNombre, setXmlRecojeNombre] = useState("")
    const [xmlRecojeDireccion, setXmlRecojeDireccion] = useState("")
    const [pedidoCobrar, setPedidoCobrar] = useState<PedidoItem | null>(null)
    const [showXmlCloseConfirm, setShowXmlCloseConfirm] = useState(false)

    const handleCloseXmlModal = () => {
        if (xmlFile) {
            setShowXmlCloseConfirm(true)
            return
        }
        setXmlFile(null)
        setShowModalXml(null)
    }

    const handleConfirmExitXml = () => {
        setXmlFile(null)
        setShowModalXml(null)
        setShowXmlCloseConfirm(false)
    }

    useEffect(() => {
        fetch("/api/empleados-telefonos", { credentials: "include" })
            .then(r => r.json())
            .then(json => {
                if (json.success) {
                    const map: Record<string, string> = {}
                    for (const emp of json.empleados) {
                        if (emp.celular) map[emp.celular] = emp.nombre
                    }
                    setTelefonoColaborador(map)
                }
            })
            .catch(() => {})
    }, [])

    useEffect(() => {
        if (xmlFile) {
            const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
            window.addEventListener("beforeunload", handler)
            return () => window.removeEventListener("beforeunload", handler)
        }
    }, [xmlFile])

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
        setShowDividirPartes(false)
        setPartesMontos([])
        setNuevoMonto("")
        setPrecioPartes("20.00")
        setPrecioPersonalizado("")
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
                                        <p className="font-bold text-slate-900">
                                            {pedido.numeroOrden}
                                            {pedido.clientePedido?.nombre && (
                                                <span className="font-normal text-slate-500 ml-2">— {pedido.clientePedido.nombre.toUpperCase()}</span>
                                            )}
                                        </p>
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
                                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="h-4 w-4 text-blue-500" />
                                                    <p className="font-semibold text-slate-700 text-sm">Info del Pedido</p>
                                                </div>
                                                {pedido.estado === "confirmado" && userRole !== "cliente" && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await fetch(`/api/pedidos/${pedido.id}`, {
                                                                    method: "PATCH",
                                                                    headers: { "Content-Type": "application/json" },
                                                                    body: JSON.stringify({ estado: "completado" }),
                                                                    credentials: "include",
                                                                })
                                                                window.location.reload()
                                                            } catch (e) {
                                                                console.error(e)
                                                            }
                                                        }}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg text-xs font-semibold text-white hover:from-slate-800 hover:to-slate-900 shadow-sm transition-all active:scale-[0.97]"
                                                    >
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                        MARCAR COMPLETADO
                                                    </button>
                                                )}
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
                                                <div className="flex items-start gap-2">
                                                    <FileCheck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Guía de remisión</p>
                                                        <p className="font-medium text-slate-800">{pedido.pedidoEmpleadoInfo.guiaRemision ? "Sí" : "No"}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <Printer className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Envío comprobante</p>
                                                        <p className="font-medium text-slate-800">{pedido.pedidoEmpleadoInfo.envioComprobante || "No imprimir"}</p>
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
                                                    <span className="font-medium text-slate-800 flex-1">{c.numeroDoc?.toUpperCase()}</span>
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
                                                {c.razonSocial && c.razonSocial !== c.nombre && (
                                                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                                                        <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <span className="text-slate-500 text-xs w-16 shrink-0">R. Social:</span>
                                                        <span className="font-medium text-slate-800 flex-1">{c.razonSocial?.toUpperCase()}</span>
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
                                                {(c.direccion || pedido.direccion) && (
                                                    <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-2.5">
                                                        <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                                                        <span className="text-slate-500 text-xs w-16 shrink-0">Dirección:</span>
                                                        <span className="font-medium text-slate-800 flex-1">
                                                            {(c.direccion || pedido.direccion)?.toUpperCase()}
                                                            {(c.departamento || pedido.departamento) && (
                                                                <span className="text-xs text-slate-400 ml-1">({(c.departamento || pedido.departamento)?.toUpperCase()} / {(c.provincia || pedido.provincia)?.toUpperCase()} / {(c.distrito || pedido.distrito)?.toUpperCase()})</span>
                                                            )}
                                                        </span>
                                                        <button
                                                            onClick={() => copiarAlPortapapeles(c.direccion || pedido.direccion || "", "direccion")}
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
                                                        <span className="font-medium text-slate-800">{c.telefono}</span>
                                                        {telefonoColaborador[c.telefono] && (
                                                            <span className="text-xs text-slate-400">({telefonoColaborador[c.telefono].toUpperCase()})</span>
                                                        )}
                                                        <div className="flex-1" />
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
                                                    const textoAgencia = (c.agencia === "otros" ? (c.agenciaOtro || "OTROS") : (AGENCIA_LABELS[c.agencia] || c.agencia)).toUpperCase()
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

                                    {/* Datos de Envío / Recepción */}
                                    {(pedido.nombreRecibe || pedido.dniRecibe || pedido.celularRecibe) && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                                                <Truck className="h-4 w-4 text-amber-500" />
                                                <p className="font-semibold text-slate-700 text-sm">Datos de Envío - Recibe otra persona</p>
                                            </div>
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
                                                {pedido.nombreRecibe && (
                                                    <div className="flex items-center gap-2 bg-white rounded-lg p-2.5">
                                                        <User className="h-4 w-4 text-amber-600 shrink-0" />
                                                        <span className="text-slate-500 text-xs w-16 shrink-0">Recibe:</span>
                                                        <span className="text-slate-900 uppercase flex-1">{pedido.nombreRecibe}</span>
                                                        <button
                                                            onClick={() => copiarAlPortapapeles(pedido.nombreRecibe || "", "nombreRecibe")}
                                                            className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                                                            title="Copiar nombre"
                                                        >
                                                            {copiedField === "nombreRecibe" ? (
                                                                <span className="text-xs text-green-600 font-medium">Copiado</span>
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                                {pedido.dniRecibe && (
                                                    <div className="flex items-center gap-2 bg-white rounded-lg p-2.5">
                                                        <FileText className="h-4 w-4 text-amber-600 shrink-0" />
                                                        <span className="text-slate-500 text-xs w-16 shrink-0">DNI:</span>
                                                        <span className="text-slate-800 flex-1">{pedido.dniRecibe}</span>
                                                        <button
                                                            onClick={() => copiarAlPortapapeles(pedido.dniRecibe || "", "dniRecibe")}
                                                            className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                                                            title="Copiar DNI"
                                                        >
                                                            {copiedField === "dniRecibe" ? (
                                                                <span className="text-xs text-green-600 font-medium">Copiado</span>
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                                {pedido.celularRecibe && (
                                                    <div className="flex items-center gap-2 bg-white rounded-lg p-2.5">
                                                        <Phone className="h-4 w-4 text-amber-600 shrink-0" />
                                                        <span className="text-slate-500 text-xs w-16 shrink-0">Celular:</span>
                                                        <span className="text-slate-800 flex-1">{pedido.celularRecibe}</span>
                                                        <button
                                                            onClick={() => copiarAlPortapapeles(pedido.celularRecibe || "", "celularRecibe")}
                                                            className="p-1.5 rounded hover:bg-slate-200 transition-colors"
                                                            title="Copiar celular"
                                                        >
                                                            {copiedField === "celularRecibe" ? (
                                                                <span className="text-xs text-green-600 font-medium">Copiado</span>
                                                            ) : (
                                                                <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

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
                                    {/* Convertir XML */}
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const agenciaKey = pedido.agencia || pedido.clientePedido?.agencia || ""
                                                setShowModalXml(pedido.id)
                                                setXmlFile(null)
                                                setFormatoXml("ticket")
                                                setXmlAgencia(AGENCIA_LABELS[agenciaKey] || "")
                                                setXmlOtraAgencia(agenciaKey === "otros" ? (pedido.agenciaOtro || pedido.clientePedido?.agenciaOtro || "") : "")
                                                setXmlNotas("")
                                                setXmlRecojeDni(pedido.dniRecibe || "")
                                                setXmlRecojeNombre(pedido.nombreRecibe || "")
                                                setXmlRecojeDireccion(pedido.direccion || "")
                                                setXmlRecojeOtraPersona(!!(pedido.dniRecibe || pedido.nombreRecibe))
                                            }}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-violet-700 to-indigo-800 rounded-lg text-sm font-semibold text-white hover:from-violet-800 hover:to-indigo-900 shadow-md shadow-violet-300 transition-all"
                                        >
                                            <Printer className="h-4 w-4" />
                                            Convertir XML a Ticket o etiqueta envios
                                        </button>
                                    </div>

                                    {!showDividirPartes && (
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Divide className="h-4 w-4 text-slate-500" />
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dividir entre</p>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {["18.00", "20.00"].map((num) => (
                                                <button
                                                    key={num}
                                                    onClick={() => {
                                                        setDivisor(num)
                                                        setDivisorPersonalizado("")
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${divisor === num ? "bg-slate-800 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"}`}
                                                >
                                                    S/ {num}
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
                                            const decimales = Number(resultado.toFixed(2)) === resultado ? 2 : 4
                                            return (
                                                <div className="flex items-center justify-between bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                                                    <div className="flex items-baseline gap-1.5">
                                                        <span className="text-sm font-semibold text-indigo-900">
                                                            S/ <span className="text-lg">{Number(pedido.total).toFixed(2)}</span>
                                                        </span>
                                                        <span className="text-indigo-400 text-lg font-light">÷</span>
                                                        <span className="text-lg font-semibold text-indigo-900">{valorDivisor}</span>
                                                        <span className="text-indigo-400 text-lg font-light">=</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-900 text-lg">{resultado.toFixed(decimales)}</span>
                                                        <span className="text-xs text-slate-400">mts</span>
                                                        <button
                                                            onClick={() => copiarAlPortapapeles(resultado.toFixed(decimales), `dividir_${valorDivisor}`)}
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
                                    )}

                                    {/* Dividir pedido en partes */}
                                    <div className="bg-slate-50 rounded-lg p-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowDividirPartes(!showDividirPartes)}
                                            className="w-full flex items-center justify-between gap-2 text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Divide className="h-4 w-4 text-slate-500" />
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dividir pedido en partes</p>
                                            </div>
                                            {showDividirPartes ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                                        </button>
                                        {showDividirPartes && (
                                            <div className="mt-3 space-y-3">
                                                <div className="flex items-center gap-2">
                                                    {["20.00", "18.00"].map((num) => (
                                                        <button
                                                            key={num}
                                                            onClick={() => {
                                                                setPrecioPartes(num)
                                                                setPrecioPersonalizado("")
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${precioPartes === num ? "bg-slate-800 text-white" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"}`}
                                                        >
                                                            S/ {num}
                                                        </button>
                                                    ))}
                                                    <div className="relative max-w-[80px]">
                                                        <input
                                                            type="number"
                                                            value={precioPersonalizado}
                                                            onChange={(e) => {
                                                                setPrecioPersonalizado(e.target.value)
                                                                setPrecioPartes("")
                                                            }}
                                                            placeholder="Otro"
                                                            className="w-full px-2 py-1 rounded text-xs border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-200">
                                                    <span className="text-sm text-slate-500">Total</span>
                                                    <span className="font-bold text-slate-900">S/ {Number(pedido.total).toFixed(2)}</span>
                                                </div>
                                                {partesMontos.length > 0 && (
                                                    <div className="space-y-1.5">
                                                        {partesMontos.map((monto, idx) => {
                                                            const precioActual = precioPersonalizado || precioPartes
                                                            const metros = Number(precioActual) > 0 ? Number(monto) / Number(precioActual) : 0
                                                            return (
                                                                <div key={idx} className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2">
                                                                    <span className="text-xs font-semibold text-slate-400 w-6">#{idx + 1}</span>
                                                                    <span className="text-sm font-medium text-slate-900 min-w-[90px]">S/ {Number(monto).toFixed(2)}</span>
                                                                    <span className="text-xs text-slate-500">→</span>
                                                                    <span className="text-sm font-semibold text-indigo-700">{metros.toFixed(Number(metros.toFixed(2)) === metros ? 2 : 4)} mts</span>
                                                                    <button
                                                                        onClick={() => copiarAlPortapapeles(metros.toFixed(Number(metros.toFixed(2)) === metros ? 2 : 4), `parte_mts_${idx}`)}
                                                                        className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                                                                        title="Copiar metros"
                                                                    >
                                                                        {copiedField === `parte_mts_${idx}` ? <span className="text-xs text-green-600 font-medium">OK</span> : <Copy className="h-3 w-3" />}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setPartesMontos(partesMontos.filter((_, i) => i !== idx))}
                                                                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                                    >
                                                                        <X className="h-3.5 w-3.5" />
                                                                    </button>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-slate-500">S/</span>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={nuevoMonto}
                                                        onChange={(e) => {
                                                            const val = e.target.value
                                                            if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                                                                setNuevoMonto(val)
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter" && nuevoMonto && !isNaN(parseFloat(nuevoMonto)) && parseFloat(nuevoMonto) > 0) {
                                                                setPartesMontos([...partesMontos, nuevoMonto])
                                                                setNuevoMonto("")
                                                            }
                                                        }}
                                                        placeholder="0.00"
                                                        className="flex-1 px-3 py-1.5 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (nuevoMonto && !isNaN(parseFloat(nuevoMonto)) && parseFloat(nuevoMonto) > 0) {
                                                                setPartesMontos([...partesMontos, nuevoMonto])
                                                                setNuevoMonto("")
                                                            }
                                                        }}
                                                        disabled={!nuevoMonto || isNaN(parseFloat(nuevoMonto)) || parseFloat(nuevoMonto) <= 0}
                                                        className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                {(() => {
                                                    const suma = partesMontos.reduce((s, m) => s + Number(m), 0)
                                                    const total = Number(pedido.total)
                                                    const falta = total - suma
                                                    const precioActual = Number(precioPersonalizado || precioPartes)
                                                    return partesMontos.length > 0 ? (
                                                        <div className={`rounded-lg p-3 border ${Math.abs(falta) < 0.01 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-slate-500">Suma parcial</span>
                                                                <span className="font-semibold text-slate-900">S/ {suma.toFixed(2)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm mt-1">
                                                                <span className="text-slate-500">Total</span>
                                                                <span className="font-semibold text-slate-900">S/ {total.toFixed(2)}</span>
                                                            </div>
                                                            <div className={`flex justify-between text-sm font-bold mt-2 pt-2 border-t ${Math.abs(falta) < 0.01 ? "border-emerald-200 text-emerald-700" : "border-amber-200 text-amber-700"}`}>
                                                                <span>{Math.abs(falta) < 0.01 ? "Monto total completado ✓" : "Falta"}</span>
                                                                <span>{Math.abs(falta) < 0.01 ? "" : `S/ ${falta.toFixed(2)}`}</span>
                                                            </div>
                                                            {Math.abs(falta) >= 0.01 && suma < total && (
                                                                <button
                                                                    onClick={() => {
                                                                        setPartesMontos([...partesMontos, falta.toFixed(2)])
                                                                    }}
                                                                    className="mt-2 w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition-colors"
                                                                >
                                                                    Completar con S/ {falta.toFixed(2)} ({precioActual > 0 ? (() => { const v = falta / precioActual; return v.toFixed(Number(v.toFixed(2)) === v ? 2 : 4) })() : "—"} mts)
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : null
                                                })()}
                                                {partesMontos.length > 0 && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                const precioActual = Number(precioPersonalizado || precioPartes)
                                                                const texto = partesMontos.map(m => { const v = Number(m) / precioActual; return `S/ ${Number(m).toFixed(2)} (${precioActual > 0 ? v.toFixed(Number(v.toFixed(2)) === v ? 2 : 4) : "—"} mts)` }).join(" + ") + ` = S/ ${Number(pedido.total).toFixed(2)}`
                                                                copiarAlPortapapeles(texto, "partes_total")
                                                            }}
                                                            className="flex-1 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                                        >
                                                            {copiedField === "partes_total" ? "✓ Copiado" : "Copiar lista"}
                                                        </button>
                                                        <button
                                                            onClick={() => { setPartesMontos([]); setNuevoMonto("") }}
                                                            className="py-1.5 px-3 bg-white border border-slate-200 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                                                        >
                                                            Limpiar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>


                                    {/* Cobrar */}
                                    {pedido.estado === "pendiente" && userRole !== "cliente" && (
                                        <button
                                            onClick={() => setPedidoCobrar(pedido)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg text-sm font-semibold text-white hover:from-emerald-700 hover:to-emerald-800 shadow-md shadow-emerald-200 transition-all active:scale-[0.98]"
                                        >
                                            <DollarSign className="h-4 w-4" />
                                            COBRAR (S/ {Number(pedido.total).toFixed(2)})
                                        </button>
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

            {/* Modal Convertir XML */}
            {showModalXml && (() => {
                const pedido = pedidos.find(p => p.id === showModalXml)
                if (!pedido) return null
                return (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleCloseXmlModal}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-5 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Convertir XML</h3>
                                    <p className="text-sm text-slate-500 mt-0.5">{pedido.numeroOrden}</p>
                                </div>
                                <button
                                    onClick={handleCloseXmlModal}
                                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-5 space-y-5">
                                {/* Cliente y Monto */}
                                <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <User className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{pedido.clientePedido?.nombre || pedido.nombreFactura || "—"}</p>
                                            <p className="text-xs text-slate-500">{pedido.numeroDoc || pedido.clientePedido?.tipoDoc ? `${(pedido.clientePedido?.tipoDoc || pedido.tipoDocumento || "").toUpperCase()}: ${pedido.clientePedido?.numeroDoc || pedido.numeroDoc || ""}` : ""}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-900">S/ {Number(pedido.total).toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">Total</p>
                                    </div>
                                </div>

                                {/* Archivo XML */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Archivo XML <span className="text-red-500">*</span>
                                    </label>
                                    <label className={`flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${xmlFile ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                                        <FileText className={`h-6 w-6 ${xmlFile ? "text-emerald-500" : "text-slate-400"}`} />
                                        <span className={`text-sm ${xmlFile ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                                            {xmlFile ? xmlFile.name : "Seleccionar archivo XML"}
                                        </span>
                                        <input
                                            type="file"
                                            accept=".xml"
                                            className="sr-only"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null
                                                setXmlFile(file)
                                            }}
                                        />
                                    </label>
                                </div>

                                {/* Formato */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Formato</label>
                                    <div className="flex gap-2">
                                        {[
                                            { value: "ticket" as const, label: "Ticket 80mm" },
                                            { value: "shipping_label" as const, label: "Etiqueta de envío 100mm×150mm" },
                                        ].map(f => (
                                            <button
                                                key={f.value}
                                                type="button"
                                                onClick={() => setFormatoXml(f.value)}
                                                className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors ${formatoXml === f.value ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Campos de Etiqueta */}
                                {formatoXml === "shipping_label" && (
                                    <>
                                        {/* Agencia */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Agencia</label>
                                            <div className="flex gap-2">
                                                <select
                                                    value={xmlAgencia}
                                                    onChange={(e) => {
                                                        setXmlAgencia(e.target.value)
                                                        if (e.target.value !== "OTROS") setXmlOtraAgencia("")
                                                    }}
                                                    className="flex-1 px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                >
                                                    <option value="">Seleccionar agencia</option>
                                                    {Object.values(AGENCIA_LABELS).map((label) => (
                                                        <option key={label} value={label}>{label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            {xmlAgencia === "OTROS" && (
                                                <input
                                                    type="text"
                                                    value={xmlOtraAgencia}
                                                    onChange={(e) => setXmlOtraAgencia(e.target.value)}
                                                    placeholder="Nombre de agencia"
                                                    className="mt-2 w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                />
                                            )}
                                        </div>

                                        {/* Notas */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas adicionales</label>
                                            <textarea
                                                value={xmlNotas}
                                                onChange={(e) => setXmlNotas(e.target.value)}
                                                rows={2}
                                                className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                                            />
                                        </div>

                                        {/* Recoje otra persona */}
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setXmlRecojeOtraPersona(!xmlRecojeOtraPersona)}
                                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${xmlRecojeOtraPersona ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${xmlRecojeOtraPersona ? "bg-indigo-600 border-indigo-600" : "border-slate-300"}`}>
                                                        {xmlRecojeOtraPersona && (
                                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="text-left">
                                                        <span className="text-sm font-medium text-slate-700">Otra persona recoge</span>
                                                        <p className="text-xs text-slate-400">Completa datos de quien recibe el pedido</p>
                                                    </div>
                                                </div>
                                                <Truck className={`h-4 w-4 ${xmlRecojeOtraPersona ? "text-indigo-500" : "text-slate-300"}`} />
                                            </button>
                                            {xmlRecojeOtraPersona && (
                                                <div className="mt-3 space-y-3">
                                                    <input
                                                        type="text"
                                                        value={xmlRecojeDni}
                                                        onChange={(e) => setXmlRecojeDni(e.target.value)}
                                                        placeholder="DNI"
                                                        className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={xmlRecojeNombre}
                                                        onChange={(e) => setXmlRecojeNombre(e.target.value)}
                                                        placeholder="Nombre completo"
                                                        className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={xmlRecojeDireccion}
                                                        onChange={(e) => setXmlRecojeDireccion(e.target.value)}
                                                        placeholder="Dirección"
                                                        className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
                                <button
                                    onClick={handleCloseXmlModal}
                                    className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={async () => {
                                        if (!xmlFile) return
                                        setConvirtiendoXml(true)
                                        try {
                                            const formData = new FormData()
                                            formData.append("xml", xmlFile)
                                            formData.append("formato", formatoXml)
                                            if (xmlAgencia) formData.append("agencia", xmlAgencia)
                                            if (xmlAgencia === "OTROS" && xmlOtraAgencia) formData.append("otraAgencia", xmlOtraAgencia)
                                            if (xmlNotas) formData.append("notas", xmlNotas)
                                            if (xmlRecojeOtraPersona) {
                                                formData.append("recojeOtraPersona", "true")
                                                if (xmlRecojeDni) formData.append("recojeDni", xmlRecojeDni)
                                                if (xmlRecojeNombre) formData.append("recojeNombre", xmlRecojeNombre)
                                                if (xmlRecojeDireccion) formData.append("recojeDireccion", xmlRecojeDireccion)
                                            }

                                            const res = await fetch("/api/convertir-xml", {
                                                method: "POST",
                                                body: formData,
                                            })

                                            if (!res.ok) {
                                                const err = await res.json()
                                                alert(err.error || "Error al convertir XML")
                                                return
                                            }

                                            const blob = await res.blob()
                                            const url = URL.createObjectURL(blob)
                                            const cd = res.headers.get("Content-Disposition") || ""
                                            const match = cd.match(/filename="?(.+?)"?$/)
                                            const filename = match?.[1] || "documento.pdf"
                                            const isMobile = window.innerWidth < 1024 || "ontouchstart" in window
                                            if (isMobile) {
                                                const a = document.createElement("a")
                                                a.href = url
                                                a.download = filename
                                                a.click()
                                            } else {
                                                window.open(url, "_blank")
                                            }
                                        } catch (err) {
                                            alert(err instanceof Error ? err.message : "Error de conexión")
                                        } finally {
                                            setConvirtiendoXml(false)
                                        }
                                    }}
                                    disabled={!xmlFile || convirtiendoXml}
                                    className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {convirtiendoXml ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Convirtiendo...
                                        </>
                                    ) : (
                                        <>
                                            <Printer className="h-4 w-4" />
                                            Convertir y previsualizar
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            })()}

            {/* Confirmación salir módulo XML */}
            {showXmlCloseConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowXmlCloseConfirm(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">¿Salir del módulo Convetir XML?</h3>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                Se perderá el XML cargado y los datos ingresados.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowXmlCloseConfirm(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmExitXml}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    Salir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {pedidoCobrar && (
                <CobrarPedidoModal
                    pedido={pedidoCobrar}
                    isOpen={!!pedidoCobrar}
                    onClose={() => setPedidoCobrar(null)}
                    estadoAlCobrar="completado"
                />
            )}
        </div>
    )
}
