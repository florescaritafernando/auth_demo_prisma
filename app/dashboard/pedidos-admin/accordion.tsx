"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, FileText, UserCheck, ExternalLink, UserPlus, Printer, X, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPedidoActions } from "./actions"
import { ImprimirPedidoModal } from "@/components/pedidos/ImprimirPedidoModal"

interface DetalleItem {
    id: string
    cantidad: number
    tipo: string
    metraje: number | null
    producto: { id: string; nombre: string; categoria: string }
    precio: number
    etiquetas?: { id: string; valor: number }[]
    indicacionesCorte?: string | null
}

interface Pedido {
    id: string
    numeroOrden: string
    estado: string
    total: number
    costoEnvio: number
    tipoDocumento: string | null
    numeroDoc: string | null
    nombreFactura: string
    direccion: string | null
    departamento: string | null
    provincia: string | null
    distrito: string | null
    metodoEnvio: string | null
    tiendaId: string | null
    tienda: { id: string; nombre: string; direccion: string } | null
    agencia: string | null
    agenciaOtro: string | null
    delivery: string | null
    deliveryOtro: string | null
    dniRecibe: string | null
    nombreRecibe: string | null
    celularRecibe: string | null
    numeroOperacion: string | null
    notas: string | null
    comprobantePago: string | null
    motivoRechazo: string | null
    createdAt: Date
    user: { id: string; name: string | null; email: string | null } | null
    delegados: { id: string; userId: string; user: { id: string; name: string | null; email: string | null } }[]
    pedidoDetalle: DetalleItem[]
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; colorTexto: string }> = {
    metraje_en_proceso: { label: "Metraje en proceso", color: "bg-yellow-100", colorTexto: "text-yellow-800" },
    metraje_confirmado: { label: "Metraje confirmado", color: "bg-green-100", colorTexto: "text-green-800" },
    pendiente: { label: "Pago en revisión", color: "bg-amber-100", colorTexto: "text-amber-800" },
    confirmado: { label: "Pago confirmado", color: "bg-green-200", colorTexto: "text-green-900" },
    pedido_enviado: { label: "Pedido enviado", color: "bg-yellow-100", colorTexto: "text-yellow-800" },
    rechazado: { label: "Pedido rechazado", color: "bg-red-100", colorTexto: "text-red-800" },
    completado: { label: "Pedido completado", color: "bg-green-100", colorTexto: "text-green-800" },
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

const extraerTotalPagado = (notas: string | null): number => {
    if (!notas) return 0
    let totalPagado = 0
    for (const linea of notas.split("\n")) {
        const mCompleto = linea.match(/^PAGO: Completo - S\/\s*([\d.]+)/)
        if (mCompleto) { totalPagado += Number(mCompleto[1]); continue }
        const mDividido = linea.match(/^PAGO: Dividido.*=\s*S\/\s*([\d.]+)/)
        if (mDividido) totalPagado += Number(mDividido[1])
    }
    return totalPagado
}

interface Props {
    pedidos: Pedido[]
    role: string
    userId: string
    expandedIds?: Set<string>
    onToggleExpand?: (id: string) => void
}

export function PedidoAccordion({ pedidos, role, userId, expandedIds, onToggleExpand }: Props) {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [pedidoImprimir, setPedidoImprimir] = useState<any>(null)
    const [comprobantePreview, setComprobantePreview] = useState<string | null>(null)

    const isExpandedCheck = (id: string) => {
        const result = expandedIds?.has(id) || expandedId === id
        return result
    }

    const tomarPedido = async (pedidoId: string) => {
        try {
            const res = await fetch(`/api/pedidos/${pedidoId}/delegar`, {
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
    }

    const toggleExpand = (id: string) => {
        const isCurrentlyExpanded = expandedIds?.has(id) || expandedId === id
        if (isCurrentlyExpanded) {
            setExpandedId(null)
            onToggleExpand?.(id)
        } else {
            setExpandedId(id)
        }
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {pedidos.map((pedido) => {
                    const tienePiezas = pedido.pedidoDetalle.some(d => d.tipo === "pieza")
                    const tienePiezasFaltantes = tienePiezas && pedido.pedidoDetalle.some(d => {
                        if (d.tipo !== "pieza") return false
                        const etiquetasCount = d.etiquetas?.length || 0
                        return etiquetasCount !== Number(d.cantidad)
                    })
                    const tienePiezasCompletas = tienePiezas && pedido.pedidoDetalle.every(d => {
                        if (d.tipo !== "pieza") return true
                        const etiquetasCount = d.etiquetas?.length || 0
                        return etiquetasCount === Number(d.cantidad)
                    })
                    // Mostrar siempre el estado real del pedido
                    const estadoReal = pedido.estado
                    const config = ESTADO_CONFIG[estadoReal] || ESTADO_CONFIG.pendiente
                    const agenciaLabel = pedido.agencia ? (AGENCIA_LABELS[pedido.agencia] || pedido.agenciaOtro) : null
                    const deliveryLabel = pedido.delivery ? (DELIVERY_LABELS[pedido.delivery] || pedido.deliveryOtro) : null
                    const ocultarPrecio = pedido.estado === "metraje_en_proceso"
                    const isExpanded = isExpandedCheck(pedido.id)

                    return (
                        <div
                            key={pedido.id}
                            className="border-b border-slate-100 last:border-b-0"
                        >
                            <div
                                onClick={() => toggleExpand(pedido.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                        <FileText className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div className="text-left min-w-0 flex-1">
                                        <p className="text-sm font-medium text-slate-700 break-words leading-tight">
                                            {pedido.nombreFactura?.toUpperCase()}
                                        </p>
                                        <div className="flex items-center gap-2 flex-wrap mt-1">
                                            <p className="font-bold text-slate-900 text-sm">{pedido.numeroOrden}</p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setPedidoImprimir(pedido)
                                                }}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Imprimir pedido"
                                            >
                                                <Printer className="h-3.5 w-3.5" />
                                            </button>
                                            {pedido.estado === "completado" ? (
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.colorTexto}`}>
                                                    {config.label}
                                                </span>
                                            ) : (
                                                <>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.colorTexto}`}>
                                                        {config.label}
                                                    </span>
                                                    {tienePiezas && pedido.estado !== "confirmado" && pedido.estado !== "pedido_enviado" && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                                            Piezas
                                                        </span>
                                                    )}
                                                    {tienePiezasCompletas && pedido.estado !== "confirmado" && pedido.estado !== "pedido_enviado" && (
                                                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
                                                            Metraje completado
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                            {pedido.delegados && pedido.delegados.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {pedido.delegados.map((d) => (
                                                        <span key={d.id} className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                                                            <UserCheck className="h-3 w-3" />
                                                            {d.user.name || d.user.email}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                (role === "admin" || (role === "empleado" && pedido.estado !== "completado" && pedido.estado !== "pedido_enviado")) && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="text-xs h-6 bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            tomarPedido(pedido.id)
                                                        }}
                                                    >
                                                        <UserPlus className="h-3 w-3 mr-1" />
                                                        Tomar Pedido
                                                    </Button>
                                                )
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 sm:hidden mt-0.5">
                                            {new Date(pedido.createdAt).toLocaleDateString("es-PE", { day: "2-digit", month: "2-digit", year: "2-digit" })} {new Date(pedido.createdAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 shrink-0">
                                    <div className="text-right hidden sm:block">
                                        {ocultarPrecio ? (
                                            <p className="text-sm text-slate-500 italic">Precio en revisión</p>
                                        ) : (
                                            <p className="font-bold text-slate-900">S/ {Number(pedido.total).toFixed(2)}</p>
                                        )}
                                        <p className="text-xs text-slate-500">
                                            {pedido.pedidoDetalle.length} items • {new Date(pedido.createdAt).toLocaleDateString("es-PE")} {new Date(pedido.createdAt).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                    </div>
                                    {isExpanded ? (
                                        <ChevronUp className="h-5 w-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="h-5 w-5 text-slate-400" />
                                    )}
                                </div>
                            </div>

                            {isExpanded && (
                                <div className="p-4 bg-slate-50 border-t border-slate-200">
                                    {pedido.motivoRechazo && pedido.estado === "rechazado" && (
                                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                                            <X className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-red-800 text-sm">Pedido Rechazado</p>
                                                <p className="text-sm text-red-700 mt-1">{pedido.motivoRechazo}</p>
                                            </div>
                                        </div>
                                    )}

                                    {pedido.notas && (
                                        <div className="mb-4 bg-slate-100 border border-slate-200 rounded-lg p-3">
                                            <p className="font-bold text-slate-700 text-sm mb-1">Observaciones</p>
                                            <p className="text-sm text-slate-600 whitespace-pre-wrap">{pedido.notas}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                                Productos
                                            </h3>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {pedido.pedidoDetalle
                                                    .filter(detalle => {
                                                        if (detalle.tipo === "pieza" && pedido.estado !== "metraje_en_proceso") {
                                                            const etiquetasCount = detalle.etiquetas?.length || 0
                                                            if (etiquetasCount === 0) return false
                                                        }
                                                        return true
                                                    })
                                                    .map((detalle) => {
                                                    const metrajeTotal = Number((detalle.etiquetas?.reduce((sum, e) => sum + (e.valor || 0), 0) ?? Number(detalle.metraje || 0)).toFixed(2));

                                                    const precioTotal = detalle.tipo === "pieza"
                                                        ? Number(detalle.precio) * metrajeTotal
                                                        : Number(detalle.precio) * detalle.cantidad;

                                                    return (
                                                        <div key={detalle.id} className="flex flex-col text-sm bg-white rounded-lg p-2">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-bold text-slate-900">{detalle.producto.nombre}</p>
                                                                <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600 shrink-0">{detalle.producto.categoria}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    {detalle.tipo === "pieza" ? (
                                                                        <>
                                                                            <span className="text-sm text-slate-500">
                                                                                            {(detalle.etiquetas?.length || Number(detalle.cantidad))} PZ(S)
                                                                            </span>
                                                                            {pedido.estado === "metraje_en_proceso" ? (
                                                                                <span className="text-sm text-slate-500 font-medium">(METRAJE POR CONFIRMAR)</span>
                                                                            ) : metrajeTotal > 0 && (
                                                                                <span className="text-sm text-slate-400">
                                                                                    ({metrajeTotal.toFixed(2)} MTS)
                                                                                </span>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-sm text-slate-500">
                                                                            {detalle.cantidad} MTS
                                                                        </span>
                                                                    )}
                                                                    <span className="text-sm text-slate-500">
                                                                        S/ {Number(detalle.precio).toFixed(2)}
                                                                    </span>
                                                                </div>
                                                                <span className="text-sm font-bold text-slate-900">S/ {precioTotal.toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            {(() => {
                                                const detallesConIndicaciones = pedido.pedidoDetalle.filter((d: any) => {
                                                    if (!d.indicacionesCorte) return false
                                                    if (d.tipo === "pieza" && pedido.estado !== "metraje_en_proceso") {
                                                        const etiquetasCount = d.etiquetas?.length || 0
                                                        if (etiquetasCount === 0) return false
                                                    }
                                                    return true
                                                })
                                                if (detallesConIndicaciones.length === 0) return null
                                                return (
                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                        <h3 className="font-bold text-amber-800 flex items-center gap-2 text-sm mb-2">
                                                            Indicaciones de corte
                                                        </h3>
                                                        <div className="space-y-2">
                                                            {detallesConIndicaciones.map((detalle: any) => {
                                                                const metrajeTotal = Number((detalle.etiquetas?.reduce((sum: number, e: any) => sum + (e.valor || 0), 0) ?? Number(detalle.metraje || 0)).toFixed(2))
                                                                const precioTotal = detalle.tipo === "pieza"
                                                                    ? Number(detalle.precio) * metrajeTotal
                                                                    : Number(detalle.precio) * detalle.cantidad
                                                                return (
                                                                    <div key={detalle.id} className="flex flex-col text-sm bg-white rounded p-2">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <p className="font-bold text-slate-900">{detalle.producto.nombre}</p>
                                                                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600 shrink-0">{detalle.producto.categoria}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                {detalle.tipo === "pieza" ? (
                                                                                    <>
                                                                                        <span className="text-sm text-slate-500">
                                                                            {(detalle.etiquetas?.length || Number(detalle.cantidad))} PZ(S)
                                                                                        </span>
                                                                                        {pedido.estado === "metraje_en_proceso" ? (
                                                                                            <span className="text-sm text-slate-500 font-medium">(METRAJE POR CONFIRMAR)</span>
                                                                                        ) : metrajeTotal > 0 && (
                                                                                            <span className="text-sm text-slate-400">
                                                                                                ({metrajeTotal.toFixed(2)} MTS)
                                                                                            </span>
                                                                                        )}
                                                                                    </>
                                                                                ) : (
                                                                                    <span className="text-sm text-slate-500">
                                                                                        {detalle.cantidad} MTS
                                                                                    </span>
                                                                                )}
                                                                                <span className="text-sm text-slate-500">
                                                                                    S/ {Number(detalle.precio).toFixed(2)}
                                                                                </span>
                                                                            </div>
                                                                            <span className="text-sm font-bold text-slate-900">S/ {precioTotal.toFixed(2)}</span>
                                                                        </div>
                                                                        {detalle.indicacionesCorte && (
                                                                            <p className="text-xs text-amber-700 mt-1.5 italic break-words whitespace-normal leading-relaxed border-t border-amber-100 pt-1.5">
                                                                                "{detalle.indicacionesCorte}"
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                )
                                            })()}
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                                Facturación y Pago
                                            </h3>
                                            <div className="space-y-2 text-sm bg-white rounded-lg p-3">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Documento:</span>
                                                    <span className="font-bold text-slate-900">{pedido.tipoDocumento?.toUpperCase()} {pedido.numeroDoc}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Nombre:</span>
                                                    <span className="font-bold text-slate-900 text-right">{pedido.nombreFactura?.toUpperCase()}</span>
                                                </div>
                                                {pedido.numeroOperacion && pedido.numeroOperacion !== "012345678" && (
                                                <div className="flex justify-between">
                                                    <span className={`font-bold ${pedido.estado === "pendiente" ? "text-yellow-700" : "text-slate-600"}`}>Nro. Operación:</span>
                                                    <span className={`font-bold ${pedido.estado === "pendiente" ? "text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded" : "text-slate-900"}`}>
                                                        {pedido.numeroOperacion}
                                                    </span>
                                                </div>
                                                )}
                                                {pedido.comprobantePago && (
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className="text-slate-600">Comprobante:</span>
                                                        <button 
                                                            onClick={() => setComprobantePreview(pedido.comprobantePago)}
                                                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                        >
                                                            <File className="h-3 w-3" />
                                                            Ver comprobante
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                                Envío
                                            </h3>
                                            <div className="space-y-2 text-sm bg-white rounded-lg p-3">
                                                {pedido.metodoEnvio && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Método:</span>
                                                        <span className="font-bold text-slate-900 text-right">
                                                            {pedido.metodoEnvio === "tienda" ? "(TIENDA) - RETIRO EN TIENDA" :
                                                                pedido.metodoEnvio === "agencia" ? `(AGENCIA) - ${((pedido.agencia === "otros" ? (pedido.agenciaOtro || "OTROS") : (agenciaLabel ?? pedido.agencia)) ?? "").toUpperCase()}` :
                                                                    pedido.metodoEnvio === "delivery" ? `(DELIVERY) - ${((pedido.delivery === "otros" ? (pedido.deliveryOtro || "OTROS") : (deliveryLabel ?? pedido.delivery)) ?? "").toUpperCase()}` :
                                                                        (pedido.metodoEnvio ?? "").toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                {pedido.metodoEnvio === "tienda" && pedido.tienda && (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-600">Tienda:</span>
                                                            <span className="font-medium text-slate-900 text-right">{pedido.tienda.nombre?.toUpperCase()}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-slate-600">Dirección:</span>
                                                            <span className="font-medium text-slate-900 text-right">{pedido.tienda.direccion?.toUpperCase()}</span>
                                                        </div>
                                                    </>
                                                )}
                                                {pedido.direccion && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Dirección:</span>
                                                        <span className="font-bold text-slate-900 text-right">{pedido.direccion?.toUpperCase()}</span>
                                                    </div>
                                                )}
                                                {(pedido.departamento || pedido.provincia || pedido.distrito) && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Ubicación:</span>
                                                        <span className="font-medium text-slate-900 text-right">
                                                            {[pedido.departamento, pedido.provincia, pedido.distrito].filter(Boolean).join(" - ").toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                {(pedido.nombreRecibe || pedido.dniRecibe || pedido.celularRecibe) && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Recibe:</span>
                                                        <span className="font-bold text-slate-900 text-right">
                                                            {[pedido.nombreRecibe, pedido.dniRecibe && `DNI: ${pedido.dniRecibe}`, pedido.celularRecibe && `CEL: ${pedido.celularRecibe}`].filter(Boolean).join(" - ").toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                                Resumen y Contacto
                                            </h3>
                                            <div className="space-y-2 text-sm bg-white rounded-lg p-3">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Subtotal:</span>
                                                    <span className="font-bold text-slate-900">S/ {Number(pedido.total - pedido.costoEnvio).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Costo envío:</span>
                                                    <span className="font-bold text-slate-900">S/ {Number(pedido.costoEnvio || 0).toFixed(2)}</span>
                                                </div>
                                                <div className="flex justify-between border-t pt-2">
                                                    <span className="font-bold text-slate-900">Total:</span>
                                                    <span className="font-bold text-green-700 text-lg">S/ {Number(pedido.total).toFixed(2)}</span>
                                                </div>
                                                {(() => {
                                                    const pagado = extraerTotalPagado((pedido as any).notas)
                                                    const falta = Number(pedido.total) - pagado
                                                    if (falta > 0.01) {
                                                        return (
                                                            <div className="flex justify-between pt-1">
                                                                <span className="text-sm text-red-600 font-semibold">Falta pagar:</span>
                                                                <span className="text-sm font-bold text-red-600">S/ {falta.toFixed(2)}</span>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                })()}
                                            </div>

                                            <div className="text-sm bg-white rounded-lg p-3">
                                                <p className="text-slate-600">Creado por:</p>
                                                <p className="font-bold text-slate-900">{pedido.user?.name || pedido.user?.email || "N/A"}</p>
                                                <p className="text-xs text-slate-500">{pedido.user?.email}</p>
                                                {pedido.celularRecibe && (
                                                    <>
                                                        <p className="text-slate-600 mt-3">Celular:</p>
                                                        <p className="font-bold text-slate-900">{pedido.celularRecibe}</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-slate-200">
                                        <AdminPedidoActions pedido={pedido as any} role={role} userId={userId} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {pedidoImprimir && (
                <ImprimirPedidoModal
                    pedido={pedidoImprimir}
                    onClose={() => setPedidoImprimir(null)}
                />
            )}

            {/* Modal de previsualización del comprobante */}
            {comprobantePreview && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setComprobantePreview(null)}>
                    <div className="bg-white rounded-xl w-full max-w-2xl p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">Comprobante de Pago</h2>
                            <button onClick={() => setComprobantePreview(null)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="relative w-full h-[500px] bg-slate-100 rounded-lg overflow-hidden">
                            {comprobantePreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <Image 
                                    src={comprobantePreview} 
                                    alt="Comprobante de pago" 
                                    fill
                                    className="object-contain"
                                />
                            ) : (
                                <iframe 
                                    src={comprobantePreview}
                                    className="w-full h-full"
                                    title="Comprobante de pago PDF"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}