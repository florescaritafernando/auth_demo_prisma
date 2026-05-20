"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, FileText, Building2, CreditCard, User, Phone, MapPin, Truck, Package, FileCheck, ClipboardList } from "lucide-react"

const AGENCIA_LABELS: Record<string, string> = {
    shalom: "SHALOM",
    flores: "FLORES",
    marvisur: "MARVISUR",
    olva: "OLVA",
    safexpress: "SAF EXPRESS",
    otros: "OTROS"
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; colorTexto: string }> = {
    metraje_en_proceso: { label: "Metraje en proceso", color: "bg-yellow-100", colorTexto: "text-yellow-800" },
    metraje_confirmado: { label: "Metraje confirmado", color: "bg-green-100", colorTexto: "text-green-800" },
    pendiente: { label: "Pago en revisión", color: "bg-blue-100", colorTexto: "text-blue-800" },
    confirmado: { label: "Pago confirmado", color: "bg-blue-200", colorTexto: "text-blue-900" },
    pedido_enviado: { label: "En tránsito", color: "bg-yellow-100", colorTexto: "text-yellow-800" },
    rechazado: { label: "Rechazado", color: "bg-red-100", colorTexto: "text-red-800" },
    completado: { label: "Completado", color: "bg-green-100", colorTexto: "text-green-800" },
}

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
        tipo: string
        precio: number
        indicacionesCorte?: string | null
        producto?: {
            nombre: string
            categoria: string
        }
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
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

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

    return (
        <div className="space-y-4">
            {pedidos.map(pedido => {
                const config = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG.metraje_en_proceso
                const isExpanded = expandedIds.has(pedido.id)
                const subtotal = pedido.pedidoDetalle?.reduce((sum, d) => {
                    const metros = d.tipo === "pieza" ? 50 : 1
                    return sum + (d.precio * d.cantidad * metros)
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
                                            </div>
                                        </div>
                                    )}

                                    {/* Datos del Cliente */}
                                    {pedido.clientePedido && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                                                <User className="h-4 w-4 text-green-500" />
                                                <p className="font-semibold text-slate-700 text-sm">Datos del Cliente</p>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                <div className="flex items-start gap-2">
                                                    <User className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-slate-500 text-xs">Cliente</p>
                                                        <p className="font-medium text-slate-800">{pedido.clientePedido.nombre}</p>
                                                        <p className="text-xs text-slate-400">{pedido.clientePedido.tipoDoc?.toUpperCase()} {pedido.clientePedido.numeroDoc}</p>
                                                        {pedido.clientePedido.razonSocial && (
                                                            <p className="text-xs text-slate-400">{pedido.clientePedido.razonSocial}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                {pedido.clientePedido.telefono && (
                                                    <div className="flex items-start gap-2">
                                                        <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-slate-500 text-xs">Teléfono</p>
                                                            <p className="font-medium text-slate-800">{pedido.clientePedido.telefono}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {pedido.clientePedido.direccion && (
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-slate-500 text-xs">Dirección</p>
                                                            <p className="font-medium text-slate-800">{pedido.clientePedido.direccion}</p>
                                                            {pedido.clientePedido.departamento && (
                                                                <p className="text-xs text-slate-400">{pedido.clientePedido.departamento} / {pedido.clientePedido.provincia} / {pedido.clientePedido.distrito}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                {pedido.clientePedido.agencia && (
                                                    <div className="flex items-start gap-2">
                                                        <Truck className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                                        <div>
                                                            <p className="text-slate-500 text-xs">Agencia</p>
                                                            <p className="font-medium text-slate-800">{AGENCIA_LABELS[pedido.clientePedido.agencia] || pedido.clientePedido.agenciaOtro || pedido.clientePedido.agencia}</p>
                                                        </div>
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
                                                    const metros = detalle.tipo === "pieza" ? 50 : 1
                                                    const subtotalItem = detalle.precio * detalle.cantidad * metros
                                                    return (
                                                        <div key={idx} className="flex justify-between items-start bg-slate-50 p-3 rounded-lg">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-slate-900 text-sm">{detalle.producto?.nombre || `Producto ${idx + 1}`}</p>
                                                                <p className="text-xs text-slate-400">{detalle.producto?.categoria || ""}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-slate-500">{detalle.cantidad} {detalle.tipo === "pieza" ? "pieza(s)" : "metro(s)"}</span>
                                                                    <span className="text-xs text-slate-300">•</span>
                                                                    <span className="text-xs text-slate-500">S/ {detalle.precio.toFixed(2)}/m</span>
                                                                    {detalle.tipo === "pieza" && (
                                                                        <>
                                                                            <span className="text-xs text-slate-300">•</span>
                                                                            <span className="text-xs text-purple-600">{detalle.cantidad * metros}m total</span>
                                                                        </>
                                                                    )}
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
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
