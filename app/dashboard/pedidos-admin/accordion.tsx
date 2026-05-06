"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronDown, ChevronUp, FileText, UserCheck, UserPlus, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/ui/pagination"
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
    ciudad: string | null
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
    motivoRechazo: string | null
    createdAt: Date
    user: { id: string; name: string | null; email: string | null } | null
    delegados: { id: string; userId: string; user: { id: string; name: string | null; email: string | null } }[]
    pedidoDetalle: DetalleItem[]
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; colorTexto: string }> = {
    metraje_en_proceso: { label: "Metraje en proceso", color: "bg-yellow-100", colorTexto: "text-yellow-800" },
    metraje_confirmado: { label: "Metraje confirmado", color: "bg-green-100", colorTexto: "text-green-800" },
    pendiente: { label: "Pago en revisión", color: "bg-blue-100", colorTexto: "text-blue-800" },
    confirmado: { label: "Pago confirmado", color: "bg-blue-200", colorTexto: "text-blue-900" },
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

interface Props {
    pedidos: Pedido[]
    role: string
    userId: string
    expandedIds?: Set<string>
    onToggleExpand?: (id: string) => void
}

export function PedidoAccordion({ pedidos, role, userId, expandedIds, onToggleExpand }: Props) {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)
    const [pedidoImprimir, setPedidoImprimir] = useState<any>(null)

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

    const totalPages = Math.ceil(pedidos.length / itemsPerPage)
    const paginatedPedidos = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return pedidos.slice(start, start + itemsPerPage)
    }, [pedidos, currentPage, itemsPerPage])

    const toggleExpand = (id: string) => {
        const isCurrentlyExpanded = expandedIds?.has(id) || expandedId === id
        if (isCurrentlyExpanded) {
            setExpandedId(null)
            onToggleExpand?.(id)
        } else {
            setExpandedId(id)
        }
    }

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value)
        setCurrentPage(1)
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {paginatedPedidos.map((pedido) => {
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
                        className={`border-b border-slate-100 last:border-b-0 transition-all duration-300 ${expandedId && expandedId !== pedido.id ? "blur-sm opacity-50 pointer-events-none" : ""}`}
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
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p className="font-bold text-slate-900">{pedido.numeroOrden}</p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setPedidoImprimir(pedido)
                                                }}
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Imprimir pedido"
                                            >
                                                <Printer className="h-4 w-4" />
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
                                        <p className="text-sm text-slate-500 truncate">
                                            {pedido.user?.name || pedido.user?.email || "Cliente"} • {pedido.nombreFactura}
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
                                            {pedido.pedidoDetalle.length} items • {new Date(pedido.createdAt).toLocaleDateString("es-PE")}
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
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                                Productos
                                            </h3>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {pedido.pedidoDetalle.map((detalle) => {
                                                    const tieneEtiquetas = detalle.etiquetas && detalle.etiquetas.length > 0;
                                                    // Cambiamos e.metraje por e.valor según lo que indica tu error de TypeScript
                                                    const metrajeTotal = detalle.etiquetas?.reduce((sum, e) => sum + (e.valor || 0), 0)
                                                        ?? (detalle.metraje || 0);

                                                    const precioTotal = detalle.tipo === "pieza"
                                                        ? Number(detalle.precio) * metrajeTotal
                                                        : Number(detalle.precio) * detalle.cantidad;

                                                    return (
                                                        <div key={detalle.id} className="flex justify-between items-center text-sm bg-white rounded-lg p-2">
                                                            <div>
                                                                <p className="font-medium text-slate-800">{detalle.producto.nombre}</p>
                                                                <p className="text-xs text-slate-500">
                                                                    {detalle.tipo === "pieza"
                                                                        ? `${detalle.cantidad} pieza(s)`
                                                                        : `${detalle.cantidad} metros`
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-bold text-slate-900">
                                                                    S/ {precioTotal.toFixed(2)}
                                                                </p>
                                                                {detalle.tipo === "pieza" && metrajeTotal > 0 && (
                                                                    <p className="text-xs text-slate-500">
                                                                        {metrajeTotal}m × S/ {detalle.precio}/m
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {(() => {
                                            const detallesConIndicaciones = pedido.pedidoDetalle.filter((d: any) => d.indicacionesCorte)
                                            if (detallesConIndicaciones.length === 0) return null
                                            return (
                                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                    <h3 className="font-bold text-amber-800 flex items-center gap-2 text-sm mb-2">
                                                        📋 Indicaciones de corte
                                                    </h3>
                                                    <div className="space-y-2">
                                                        {detallesConIndicaciones.map((detalle: any) => {
                                                            const metrajeTotal = detalle.etiquetas?.reduce((sum: number, e: any) => sum + (e.valor || 0), 0) ?? (detalle.metraje || 0)
                                                            return (
                                                                <div key={detalle.id} className="bg-white rounded p-2 text-sm">
                                                                    <p className="font-medium text-slate-800">{detalle.producto.nombre}</p>
                                                                    <p className="text-xs text-slate-500">
                                                                        {detalle.tipo === "pieza" 
                                                                            ? `${detalle.cantidad} pieza(s) • ${metrajeTotal.toFixed(2)}m`
                                                                            : `${detalle.cantidad} metros`
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs text-amber-700 mt-1 italic">"{detalle.indicacionesCorte}"</p>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })()}

                                        <div className="space-y-4">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                                Facturación y Pago
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Documento:</span>
                                                    <span className="font-bold text-slate-900">{pedido.tipoDocumento?.toUpperCase()} {pedido.numeroDoc}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Nombre:</span>
                                                    <span className="font-bold text-slate-900">{pedido.nombreFactura}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className={`font-bold ${pedido.estado === "pendiente" ? "text-yellow-700" : "text-slate-600"}`}>Nro. Operación:</span>
                                                    <span className={`font-bold ${pedido.estado === "pendiente" ? "text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded" : "text-slate-900"}`}>
                                                        {pedido.numeroOperacion || "No registrado"}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm pt-4">
                                                Envío
                                            </h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-600">Método:</span>
                                                    <span className="font-bold text-slate-900">
                                                        {pedido.metodoEnvio === "tienda" ? "Retiro en Tienda" :
                                                            pedido.metodoEnvio === "agencia" ? `Agencia: ${agenciaLabel || pedido.agenciaOtro || pedido.agencia}` :
                                                                pedido.metodoEnvio === "delivery" ? `Delivery: ${deliveryLabel || pedido.deliveryOtro || pedido.delivery}` :
                                                                    "-"}
                                                    </span>
                                                </div>
                                                {pedido.metodoEnvio === "tienda" && pedido.tienda && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Tienda:</span>
                                                        <span className="font-medium text-slate-900">{pedido.tienda.nombre}</span>
                                                    </div>
                                                )}
                                                {pedido.metodoEnvio === "tienda" && pedido.tienda && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Dirección:</span>
                                                        <span className="font-medium text-slate-900">{pedido.tienda.direccion}</span>
                                                    </div>
                                                )}
                                                {pedido.direccion && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Dirección:</span>
                                                        <span className="font-bold text-slate-900">{pedido.direccion}</span>
                                                    </div>
                                                )}
                                                {pedido.nombreRecibe && (
                                                    <div className="flex justify-between">
                                                        <span className="text-slate-600">Recibe:</span>
                                                        <span className="font-medium">{pedido.nombreRecibe} ({pedido.dniRecibe})</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                                Resumen y Contacto
                                            </h3>
                                            <div className="space-y-2 text-sm">
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
                                            </div>

                                            <div className="text-sm pt-4">
                                                <p className="text-slate-600">Email:</p>
                                                <p className="font-bold text-slate-900">{pedido.user?.email || "N/A"}</p>
                                                {pedido.celularRecibe && (
                                                    <>
                                                        <p className="text-slate-600 mt-2">Celular:</p>
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

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={pedidos.length}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                itemLabel="pedidos"
            />

            {pedidoImprimir && (
                <ImprimirPedidoModal 
                    pedido={pedidoImprimir} 
                    onClose={() => setPedidoImprimir(null)} 
                />
            )}
        </div>
    )
}