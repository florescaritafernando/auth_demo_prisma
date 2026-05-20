"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
import { Search, X, Calendar, File, ExternalLink } from "lucide-react"
import { Package, Clock, CheckCircle, XCircle, Truck, Wallet, AlertCircle, MapPin, CreditCard, Phone, FileText, PlayCircle, ChevronDown, ChevronUp, Eye, Info, CircleDollarSign, PackageCheck, Printer } from "lucide-react"
import { FeedbackModal } from "./FeedbackModal"
import { QuejaModal } from "./QuejaModal"
import { ImprimirPedidoModal } from "./ImprimirPedidoModal"

const ESTADO_CONFIG: Record<string, { label: string; color: string; colorTexto: string; icon: any }> = {
    metraje_en_proceso: { label: "Metraje en proceso", color: "bg-yellow-100", colorTexto: "text-yellow-800", icon: Clock },
    metraje_confirmado: { label: "Metraje confirmado", color: "bg-green-100", colorTexto: "text-green-800", icon: CheckCircle },
    pendiente: { label: "Pago en revisión", color: "bg-blue-100", colorTexto: "text-blue-800", icon: CircleDollarSign },
    confirmado: { label: "Pago confirmado", color: "bg-blue-200", colorTexto: "text-blue-900", icon: Wallet },
    pedido_enviado: { label: "Pedido en transito", color: "bg-yellow-100", colorTexto: "text-yellow-800", icon: Truck },
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
    comprobantePago: string | null
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
        etiquetas?: Array<{ valor: number }>
        indicacionesCorte?: string | null
    }>
    tienda?: {
        id: string
        nombre: string
        direccion: string
    }
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
    const [showImprimir, setShowImprimir] = useState(false)
    const [indicacionModal, setIndicacionModal] = useState<{ nombre: string; texto: string } | null>(null)
    const config = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG.metraje_en_proceso
    const IconComponent = config.icon
    const agenciaLabel = (() => {
        const ag = pedido.agencia || pedido.clientePedido?.agencia
        const agOtro = pedido.agenciaOtro || pedido.clientePedido?.agenciaOtro
        if (!ag) return null
        if (ag === "otros") return agOtro || "Otros"
        return AGENCIA_LABELS[ag] || agOtro
    })()
    const deliveryLabel = pedido.delivery ? (DELIVERY_LABELS[pedido.delivery] || pedido.deliveryOtro) : null

    const ocultarPrecio = pedido.estado === "metraje_en_proceso" || pedido.estado === "rechazado"
    const mostrarContinuar = pedido.estado === "metraje_confirmado"
    const ocultarPago = ocultarPrecio || pedido.estado === "metraje_confirmado"
    const tieneReclamo = (pedido as any).reclamos?.length > 0

    const getEstadoArticulo = (detalle: any) => {
        if (detalle.tipo !== "pieza") return null

        const solicitados = Number(detalle.cantidad)
        const registrados = detalle.etiquetas?.length || 0

        if (registrados === 0) {
            return { estado: "sin_existencias", label: `Sin existencias 0/${solicitados} pieza(s)`, color: "bg-red-100 text-red-700", colorTexto: "text-red-700" }
        }
        if (registrados === solicitados) {
            return { estado: "completo", label: `Completo ${registrados}/${solicitados} pieza(s)`, color: "bg-green-100 text-green-700", colorTexto: "text-green-700" }
        }
        return { estado: "parcial", label: `Parcial ${registrados}/${solicitados} pieza(s)`, color: "bg-yellow-100 text-yellow-700", colorTexto: "text-yellow-700" }
    }

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
                            <Link href={`/dashboard/checkout#${pedido.id}`}>
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
                                    className="bg-blue-700 hover:bg-blue-800 text-sm text-white"
                                >
                                    <PackageCheck className="h-4 w-4 mr-1" />
                                    Recibí mi pedido
                                </Button>
                                <Button
                                    onClick={() => !tieneReclamo && setQuejaModal({ pedidoId: pedido.id, numeroOrden: pedido.numeroOrden })}
                                    disabled={tieneReclamo}
                                    className={`text-sm gap-1.5 ${tieneReclamo
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                        }`}
                                >
                                    <AlertCircle className="h-4 w-4" />
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

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setShowImprimir(true)
                            }}
                            className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Imprimir / Descargar PDF"
                        >
                            <Printer className="h-4 w-4" />
                        </button>

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
                                const estadoArticulo = getEstadoArticulo(detalle)
                                const mostrarBadge = estadoArticulo && (pedido.estado === "metraje_confirmado")
                                return (
                                    <div key={idx} className={`flex justify-between items-center text-sm bg-white p-2 rounded border ${isPiezaPendingMetraje ? "border-amber-300 bg-amber-50" : "border-slate-200"}`}>
                                        <div className="text-slate-800 flex-1">
                                            <p className="font-bold text-lg">{detalle.producto?.nombre || `Producto ${idx + 1}`}</p>
                                            {isPiezaPendingMetraje ? (
                                                <p className="text-md text-slate-500 mt-1">
                                                    {detalle.cantidad} pieza(s) {Number(detalle.metraje || 0).toFixed(2)} mts × S/ {Number(detalle.precio).toFixed(2)}/mts
                                                </p>
                                            ) : (
                                                <p className="text-md text-slate-500">
                                                    {detalle.tipo === "pieza"
                                                        ? `${(pedido.estado === "metraje_en_proceso" ? Number(detalle.cantidad) : (detalle.etiquetas?.length || Number(detalle.cantidad)))} pieza(s) ${(detalle.etiquetas?.reduce((sum: number, e: any) => sum + e.valor, 0) || 0).toFixed(2)} mts × S/ ${Number(detalle.precio).toFixed(2)}`
                                                        : detalle.metraje
                                                            ? `${detalle.metraje} mts × S/ ${Number(detalle.precio).toFixed(2)}`
                                                            : `${detalle.cantidad} mts × S/ ${Number(detalle.precio).toFixed(2)}`
                                                    }
                                                </p>
                                            )}
                                            {mostrarBadge && (
                                                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${estadoArticulo.color} ${estadoArticulo.colorTexto}`}>
                                                    {estadoArticulo.label}
                                                </span>
                                            )}
                                            {detalle.indicacionesCorte && pedido.estado !== "completado" && (
                                                <button
                                                    onClick={() => setIndicacionModal({ nombre: detalle.producto?.nombre || "", texto: detalle.indicacionesCorte || "" })}
                                                    className="mt-2 flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-700 text-white rounded hover:bg-slate-800 transition-colors "
                                                >
                                                    <span>Ver indicaciones</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {isPiezaPendingMetraje ? (
                                                <span className="text-xs text-amber-600 font-medium whitespace-nowrap">
                                                    Metraje por confirmar
                                                </span>
                                            ) : (
                                                <span className="text-slate-800 font-medium">
                                                    {detalle.tipo === "pieza" && ((detalle.etiquetas?.reduce((sum: number, e: any) => sum + e.valor, 0) || 0) === 0)
                                                        ? "-"
                                                        : `S/ ${(detalle.metraje ? detalle.metraje * detalle.precio : detalle.cantidad * detalle.precio).toFixed(2)}`
                                                    }
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
                                        {pedido.nombreFactura?.toUpperCase()} ({pedido.tipoDocumento?.toUpperCase()} {pedido.numeroDoc})
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
                                        <p className="text-slate-500">{pedido.direccion?.toUpperCase()}</p>
                                    )}
                                </div>
                            </div>

                            {!ocultarPago && (
                                <div className="flex items-start gap-2">
                                    <Wallet className="h-4 w-4 text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-slate-500">Pago:</p>
                                        <p className="font-medium text-slate-800">
                                            Nro. Operación: {pedido.numeroOperacion || "No registrado"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-2">
                                <Truck className="h-4 w-4 text-slate-400 mt-0.5" />
                                <div>
                                    <p className="text-slate-500">Costo envío:</p>
                                    <p className="font-medium text-slate-800">S/ {Number(pedido.costoEnvio || 0).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        {pedido.pedidoEmpleadoInfo && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <p className="font-semibold text-slate-700 text-sm">Info Empleado</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    {pedido.pedidoEmpleadoInfo.empresa && (
                                        <div className="flex items-start gap-2">
                                            <Package className="h-4 w-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-slate-500">Empresa:</p>
                                                <p className="font-medium text-slate-800">{pedido.pedidoEmpleadoInfo.empresa}</p>
                                            </div>
                                        </div>
                                    )}
                                    {pedido.pedidoEmpleadoInfo.metodoPago && (
                                        <div className="flex items-start gap-2">
                                            <CreditCard className="h-4 w-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-slate-500">Método de Pago:</p>
                                                <p className="font-medium text-slate-800">{pedido.pedidoEmpleadoInfo.metodoPago}</p>
                                            </div>
                                        </div>
                                    )}
                                    {pedido.pedidoEmpleadoInfo.telefono && (
                                        <div className="flex items-start gap-2">
                                            <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-slate-500">Teléfono cliente:</p>
                                                <p className="font-medium text-slate-800">{pedido.pedidoEmpleadoInfo.telefono}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-2">
                                        <File className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-slate-500">Guía de remisión:</p>
                                            <p className="font-medium text-slate-800">{pedido.pedidoEmpleadoInfo.guiaRemision ? "Sí" : "No"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {pedido.clientePedido && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-3">
                                    <Phone className="h-4 w-4 text-green-500" />
                                    <p className="font-semibold text-slate-700 text-sm">Datos del Cliente</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-start gap-2">
                                        <div className="h-4 w-4 text-slate-400 mt-0.5 flex items-center justify-center text-xs font-bold">C</div>
                                        <div>
                                            <p className="text-slate-500">Cliente:</p>
                                            <p className="font-medium text-slate-800">{pedido.clientePedido.nombre?.toUpperCase()}</p>
                                            <p className="text-xs text-slate-400">{pedido.clientePedido.tipoDoc?.toUpperCase()} {pedido.clientePedido.numeroDoc}</p>
                                            {pedido.clientePedido.razonSocial && (
                                                <p className="text-xs text-slate-400">Razón Social: {pedido.clientePedido.razonSocial}</p>
                                            )}
                                        </div>
                                    </div>
                                    {pedido.clientePedido.telefono && (
                                        <div className="flex items-start gap-2">
                                            <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-slate-500">Teléfono:</p>
                                                <p className="font-medium text-slate-800">{pedido.clientePedido.telefono}</p>
                                            </div>
                                        </div>
                                    )}
                                    {pedido.clientePedido.direccion && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-slate-500">Dirección:</p>
                                                <p className="font-medium text-slate-800">{pedido.clientePedido.direccion?.toUpperCase()}</p>
                                                {pedido.clientePedido.departamento && (
                                                    <p className="text-xs text-slate-400">{pedido.clientePedido.departamento} / {pedido.clientePedido.provincia} / {pedido.clientePedido.distrito}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    {pedido.clientePedido.agencia && (
                                        <div className="flex items-start gap-2">
                                            <Truck className="h-4 w-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <p className="text-slate-500">Agencia:</p>
                                                <p className="font-medium text-slate-800">
                                                    {pedido.clientePedido.agencia === "otros"
                                                        ? (pedido.clientePedido.agenciaOtro || "Otros")
                                                        : (AGENCIA_LABELS[pedido.clientePedido.agencia] || pedido.clientePedido.agencia)}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start gap-2">
                                        <FileText className="h-4 w-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <p className="text-slate-500">Guía de remisión:</p>
                                            <p className="font-medium text-slate-800">{pedido.clientePedido.guiaRemision ? "Sí" : "No"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
                            {/* Comprobante de pago - siempre mostrar si existe */}
                            {pedido.comprobantePago && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-sm text-green-700 font-medium mb-2">Comprobante de pago:</p>
                                    {pedido.comprobantePago.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                        <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden">
                                            <Image 
                                                src={pedido.comprobantePago} 
                                                alt="Comprobante de pago" 
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                                            <File className="h-8 w-8 text-red-500" />
                                            <span className="text-sm text-slate-700">Archivo PDF subido</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Número de operación - solo mostrar si es diferente de "012345678" */}
                            {pedido.numeroOperacion && pedido.numeroOperacion !== "012345678" && (
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-sm text-slate-500">Número de operación:</p>
                                    <p className="font-bold text-slate-800">{pedido.numeroOperacion}</p>
                                </div>
                            )}

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

            {indicacionModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setIndicacionModal(null)}>
                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-amber-700 flex items-center gap-2">
                                Indicación de corte
                            </h2>
                            <button onClick={() => setIndicacionModal(null)} className="text-slate-400 hover:text-slate-600">
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <p className="text-sm text-amber-600 font-medium mb-2">{indicacionModal.nombre}</p>
                            <p className="text-slate-700 italic">"{indicacionModal.texto}"</p>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button onClick={() => setIndicacionModal(null)} variant="outline">Cerrar</Button>
                        </div>
                    </div>
                </div>
            )}

            {showImprimir && (
                <ImprimirPedidoModal
                    pedido={pedido as any}
                    onClose={() => setShowImprimir(false)}
                />
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