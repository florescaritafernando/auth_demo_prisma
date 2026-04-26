"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Package, Clock, CheckCircle, XCircle, MapPin, CreditCard, Phone, FileText, PlayCircle, ChevronDown, ChevronUp } from "lucide-react"

const ESTADO_CONFIG: Record<string, { label: string; color: string; colorTexto: string; icon: any }> = {
    metraje_en_proceso: { label: "Metraje en proceso", color: "bg-yellow-100", colorTexto: "text-yellow-800", icon: Clock },
    metraje_confirmado: { label: "Metraje confirmado", color: "bg-green-100", colorTexto: "text-green-800", icon: CheckCircle },
    pendiente: { label: "Pendiente", color: "bg-blue-100", colorTexto: "text-blue-800", icon: Package },
    confirmado: { label: "Confirmado", color: "bg-blue-200", colorTexto: "text-blue-900", icon: CheckCircle },
    rechazado: { label: "Rechazado", color: "bg-red-100", colorTexto: "text-red-800", icon: XCircle },
    completado: { label: "Completado", color: "bg-green-100", colorTexto: "text-green-800", icon: CheckCircle },
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

function PedidoCard({ pedido, userRole }: { pedido: PedidoItem; userRole: string }) {
    const [expanded, setExpanded] = useState(false)
    const config = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG.metraje_en_proceso
    const IconComponent = config.icon
    const agenciaLabel = pedido.agencia ? (AGENCIA_LABELS[pedido.agencia] || pedido.agenciaOtro) : null
    const deliveryLabel = pedido.delivery ? (DELIVERY_LABELS[pedido.delivery] || pedido.deliveryOtro) : null
    
    const ocultarPrecio = pedido.estado === "metraje_en_proceso"
    const mostrarContinuar = pedido.estado === "metraje_confirmado"
    const ocultarPago = ocultarPrecio || pedido.estado === "metraje_confirmado"

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
                        
                        {mostrarContinuar && (
                            <Link href={`/dashboard/checkout?pedido=${pedido.id}`}>
                                <Button className="bg-green-600 hover:bg-green-700 text-sm">
                                    <PlayCircle className="h-4 w-4 mr-1" />
                                    Continuar
                                </Button>
                            </Link>
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
                            {pedido.pedidoDetalle?.map((detalle, idx) => (
                                <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded border border-slate-200">
                                    <div className="text-slate-800">
                                        <p className="font-medium">{detalle.producto?.nombre || `Producto ${idx + 1}`}</p>
                                        <p className="text-xs text-slate-500">
                                            {detalle.metraje 
                                                ? `${detalle.metraje}m × S/ ${Number(detalle.precio).toFixed(2)}/m`
                                                : `${detalle.cantidad} ${detalle.tipo === "pieza" ? "pieza(s)" : "m"} × S/ ${Number(detalle.precio).toFixed(2)}/m`
                                            }
                                        </p>
                                    </div>
                                    <span className="text-slate-800 font-medium">
                                        S/ {(detalle.metraje ? detalle.metraje * detalle.precio : detalle.cantidad * detalle.precio).toFixed(2)}
                                    </span>
                                </div>
                            ))}
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
                                    {pedido.tiendaId && pedido.tienda && (
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
        </div>
    )
}

export default function PedidosList({ pedidos, userRole }: PedidosListProps) {
    return (
        <div className="space-y-4">
            {pedidos.map((pedido: any) => (
                <PedidoCard key={pedido.id} pedido={pedido} userRole={userRole} />
            ))}
        </div>
    )
}