"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPedidoActions } from "./actions"

interface DetalleItem {
    id: string
    cantidad: number
    tipo: string
    metraje: number | null
    producto: { id: string; nombre: string; categoria: string }
    precio: number
    etiquetas?: { id: string; valor: number }[]
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
    agencia: string | null
    agenciaOtro: string | null
    dniRecibe: string | null
    nombreRecibe: string | null
    celularRecibe: string | null
    numeroOperacion: string | null
    createdAt: Date
    user: { id: string; name: string | null; email: string | null } | null
    pedidoDetalle: DetalleItem[]
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; colorTexto: string }> = {
    metraje_en_proceso: { label: "Metraje en proceso", color: "bg-yellow-100", colorTexto: "text-yellow-800" },
    metraje_confirmado: { label: "Metraje confirmado", color: "bg-green-100", colorTexto: "text-green-800" },
    pendiente: { label: "Pendiente", color: "bg-blue-100", colorTexto: "text-blue-800" },
    confirmado: { label: "Confirmado", color: "bg-blue-200", colorTexto: "text-blue-900" },
    rechazado: { label: "Rechazado", color: "bg-red-100", colorTexto: "text-red-800" },
    completado: { label: "Completado", color: "bg-green-100", colorTexto: "text-green-800" },
}

const AGENCIA_LABELS: Record<string, string> = {
    shalom: "SHALOM",
    flores: "FLORES",
    marvisur: "MARVISUR",
    otros: "OTROS"
}

interface Props {
    pedidos: Pedido[]
}

export function PedidoAccordion({ pedidos }: Props) {
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    const totalPages = Math.ceil(pedidos.length / itemsPerPage)
    const paginatedPedidos = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return pedidos.slice(start, start + itemsPerPage)
    }, [pedidos, currentPage, itemsPerPage])

    const toggleExpand = (id: string) => {
        setExpandedId(prev => prev === id ? null : id)
    }

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value)
        setCurrentPage(1)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-slate-600">
                    Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, pedidos.length)} - {Math.min(currentPage * itemsPerPage, pedidos.length)} de {pedidos.length} pedidos
                </p>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">Mostrar:</span>
                    <select
                        value={itemsPerPage}
                        onChange={e => handleItemsPerPageChange(Number(e.target.value))}
                        className="border border-slate-300 rounded px-2 py-1 text-sm"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {paginatedPedidos.map((pedido) => {
                    const config = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG.pendiente
                    const agenciaLabel = pedido.agencia ? (AGENCIA_LABELS[pedido.agencia] || pedido.agenciaOtro) : null
                    const tienePiezas = pedido.pedidoDetalle.some(d => d.tipo === "pieza")
                    const ocultarPrecio = pedido.estado === "metraje_en_proceso"
                    const isExpanded = expandedId === pedido.id

                    return (
                        <div key={pedido.id} className="border-b border-slate-100 last:border-b-0">
                            <button
                                onClick={() => toggleExpand(pedido.id)}
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                        <FileText className="h-5 w-5 text-slate-600" />
                                    </div>
                                    <div className="text-left min-w-0 flex-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <p className="font-bold text-slate-900">{pedido.numeroOrden}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color} ${config.colorTexto}`}>
                                                {config.label}
                                            </span>
                                            {tienePiezas && (
                                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                                                    Piezas
                                                </span>
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
                            </button>

                            {isExpanded && (
                                <div className="p-4 bg-slate-50 border-t border-slate-200">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="space-y-4">
                                            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                                                Productos
                                            </h3>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {pedido.pedidoDetalle.map((detalle) => {
                                                    const tieneEtiquetas = detalle.etiquetas && detalle.etiquetas.length > 0
                                                    const metrajeTotal = tieneEtiquetas 
                                                        ? detalle.etiquetas.reduce((sum, e) => sum + e.valor, 0)
                                                        : (detalle.metraje || 0)
                                                    const precioTotal = detalle.tipo === "pieza" 
                                                        ? Number(detalle.precio) * metrajeTotal
                                                        : Number(detalle.precio) * detalle.cantidad
                                                    
                                                    return (
                                                        <div key={detalle.id} className="flex justify-between items-center text-sm bg-white rounded-lg p-2">
                                                            <div>
                                                                <p className="font-medium text-slate-800">{detalle.producto.nombre}</p>
                                                                <p className="text-xs text-slate-500">
                                                                    {detalle.tipo === "pieza" 
                                                                        ? `${detalle.cantidad} pieza(s) (~${metrajeTotal || "?"}m)`
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
                                                    <span className="text-slate-600">Nro. Operación:</span>
                                                    <span className={`font-bold ${pedido.numeroOperacion === "012345678" ? "text-yellow-700" : "text-slate-900"}`}>
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
                                                        {pedido.metodoEnvio === "retiro" ? "Retiro en persona" :
                                                         pedido.metodoEnvio === "agencia" ? `Agencia: ${agenciaLabel || pedido.agenciaOtro}` :
                                                         "Recoge otra persona"}
                                                    </span>
                                                </div>
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
                                        <AdminPedidoActions pedido={pedido} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 rounded text-sm font-medium ${
                                    currentPage === page
                                        ? "bg-slate-900 text-white"
                                        : "bg-white text-slate-600 hover:bg-slate-100"
                                } border border-slate-300`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        Siguiente
                    </Button>
                </div>
            )}
        </div>
    )
}