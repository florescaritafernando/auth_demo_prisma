"use client"

import { useState } from "react"
import { Printer, X, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Etiqueta {
    id: string
    valor: number
    createdAt: string
}

interface DetalleItem {
    id: string
    cantidad: number
    tipo: string
    metraje: number | null
    producto: { id: string; nombre: string; categoria: string }
    precio: number
    etiquetas?: Etiqueta[]
    indicacionesCorte?: string | null
}

interface Pedido {
    id: string
    numeroOrden: string
    estado: string
    createdAt: string
    nombreFactura: string | null
    tipoDocumento: string | null
    numeroDoc: string | null
    metodoEnvio: string | null
    tiendaId: string | null
    agencia: string | null
    agenciaOtro: string | null
    delivery: string | null
    deliveryOtro: string | null
    tipoEnvio: string | null
    direccion: string | null
    departamento: string | null
    provincia: string | null
    distrito: string | null
    costoEnvio: number
    total: number
    pedidoDetalle: DetalleItem[]
    delegados: { id: string; userId: string; user: { id: string; name: string | null } }[]
    user: { id: string; name: string | null; email: string | null } | null
}

interface Props {
    pedido: Pedido
    onClose: () => void
}

export function ImprimirPedidoModal({ pedido, onClose }: Props) {
    const [formato, setFormato] = useState<"ticket" | "a4">("ticket")

    const empleadoNames = pedido.delegados?.map(d => d.user?.name || "Sin nombre").join(", ") || "Sin asignar"

    const generarContenido = () => {
        const fecha = new Date(pedido.createdAt).toLocaleDateString("es-PE", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })

        const metodoEnvioLabel = pedido.metodoEnvio === "tienda"
            ? "Recoger en tienda"
            : pedido.metodoEnvio === "agencia"
                ? `Agencia: ${pedido.agencia === "otros" ? pedido.agenciaOtro : pedido.agencia}`
                : pedido.metodoEnvio === "delivery"
                    ? `Delivery: ${pedido.delivery === "otros" ? pedido.deliveryOtro : pedido.delivery}`
                    : "No especificado"

        const productos = pedido.pedidoDetalle.map(d => {
            const metrajeTotal = d.etiquetas?.reduce((sum, e) => sum + e.valor, 0) || Number(d.metraje || 0)
            const cantidadMostrar = d.tipo === "pieza"
                ? `${d.cantidad} pzs (${metrajeTotal.toFixed(2)}m)`
                : `${d.cantidad} metros`

            return {
                nombre: d.producto.nombre,
                cantidad: cantidadMostrar,
                precio: d.precio,
                total: d.tipo === "pieza" ? metrajeTotal * Number(d.precio) : Number(d.cantidad) * Number(d.precio),
                indicaciones: d.indicacionesCorte
            }
        })

        return { fecha, metodoEnvioLabel, productos, empleadoNames }
    }

    const { fecha, metodoEnvioLabel, productos, empleadoNames: empleados } = generarContenido()

    const handleImprimir = () => {
        const printWindow = window.open("", "_blank", "width=800,height=600")
        if (!printWindow) return

        const estilos = formato === "ticket"
            ? `
                <style>
                    @page { 
                        size: 8cm auto; 
                        margin: 0;
                    }
                    * {
                        box-sizing: border-box;
                        max-width: 8cm;
                    }
                    html, body {
                        margin: 0;
                        padding: 0;
                        width: 8cm;
                        min-width: 8cm;
                        max-width: 8cm;
                    }
                    body { 
                        font-family: 'Courier New', monospace; 
                        font-size: 18px; 
                        width: 8cm; 
                        margin: 0; 
                        padding: 0;
                        min-width: 8cm;
                        max-width: 8cm;
                        text-transform: uppercase;
                    }
                    .header { text-align: center; border-bottom: 1px dashed #000; padding: 2mm 0; }
                    .title { font-size: 22px; font-weight: bold; }
                    .numero { font-size: 20px; font-weight: bold; }
                    .section { margin-bottom: 4px; }
                    .label { font-weight: bold; font-size: 17px; }
                    .value { margin-bottom: 2px; font-size: 16px; word-wrap: break-word; }
                    .productos-label { font-weight: bold; font-size: 17px; border-bottom: 1px dashed #000; padding-bottom: 2px; margin-bottom: 4px; }
                    .producto { margin-bottom: 5px; padding: 2mm; background: #f0f0f0; border-left: 3px solid #333; }
                    .producto-nombre { font-weight: bold; font-size: 17px; word-wrap: break-word; }
                    .producto-detalle { font-size: 16px; margin-top: 2px; }
                    .indicaciones { font-size: 16px; margin-top: 2px; white-space: pre-wrap; word-wrap: break-word; }
                    .cantidad { font-weight: bold; font-size: 18px; color: #000; }
                    .totales { border-top: 1px dashed #000; padding-top: 3px; margin-top: 5px; }
                    .total-row { display: flex; justify-content: space-between; font-size: 16px; }
                    .gran-total { font-weight: bold; font-size: 20px; border-top: 1px dashed #000; padding-top: 2px; }
                </style>
            `
            : `
                <style>
                    @page { size: A4; margin: 20mm; }
                    body { 
                        font-family: Arial, sans-serif; 
                        font-size: 12px; 
                        max-width: 210mm; 
                        margin: 0 auto; 
                        padding: 20px;
                    }
                    .header { text-align: center; border: 2px solid #000; padding: 20px; margin-bottom: 20px; }
                    .title { font-size: 24px; font-weight: bold; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
                    .info-box { border: 1px solid #ddd; padding: 10px; }
                    .info-label { font-weight: bold; color: #666; font-size: 10px; }
                    .info-value { font-size: 14px; }
                    .productos-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .productos-table th { background: #333; color: white; padding: 10px; text-align: left; }
                    .productos-table td { border: 1px solid #ddd; padding: 8px; }
                    .productos-table .nombre { font-weight: bold; }
                    .productos-table .resaltado { background: #fff3cd; font-weight: bold; }
                    .totales { border-top: 2px solid #000; padding-top: 15px; }
                    .totales-row { display: flex; justify-content: space-between; padding: 5px 0; }
                    .gran-total { font-size: 18px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; margin-top: 10px; }
                </style>
            `

        if (formato === "ticket") {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head><title>Pedido ${pedido.numeroOrden}</title>${estilos}</head>
                <body>
                    <div class="header">
                        <div class="title">PEDIDO</div>
                        <div class="title">${pedido.numeroOrden}</div>
                        <div class="value" style="margin-top: 5px;">ESTADO: ${pedido.estado}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label">FECHA:</div>
                        <div class="value">${fecha}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label">CLIENTE:</div>
                        <div class="value">${pedido.user?.name || pedido.user?.email || "Cliente"}</div>
                        <div class="value">${pedido.nombreFactura || ""}</div>
                        <div class="value">${pedido.tipoDocumento?.toUpperCase()}: ${pedido.numeroDoc || ""}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label">ASIGNADO(S) A:</div>
                        <div class="value">${empleados}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label">ENVÍO:</div>
                        <div class="value">${metodoEnvioLabel}</div>
                    </div>
                    
                    <div class="section">
                        <div class="productos-label">ARTÍCULOS:</div>
                        ${productos.map(p => `
                            <div class="producto">
                                <div class="producto-nombre">${p.nombre}</div>
                                <div class="producto-detalle">
                                    <span class="cantidad">CANT: ${p.cantidad}</span> - S/ ${p.total.toFixed(2)}
                                </div>
                                ${p.indicaciones ? `<div class="indicaciones">INDICACIONES: ${p.indicaciones}</div>` : ""}
                            </div>
                        `).join("")}
                    </div>
                    
                    <div class="totales">
                        <div class="total-row">
                            <span>Subtotal:</span>
                            <span>S/ ${(pedido.total - pedido.costoEnvio).toFixed(2)}</span>
                        </div>
                        <div class="total-row">
                            <span>Envío:</span>
                            <span>S/ ${pedido.costoEnvio.toFixed(2)}</span>
                        </div>
                        <div class="total-row gran-total">
                            <span>TOTAL:</span>
                            <span>S/ ${pedido.total.toFixed(2)}</span>
                        </div>
                    </div>
                </body>
                </html>
            `)
        } else {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head><title>Pedido ${pedido.numeroOrden}</title>${estilos}</head>
                <body>
                    <div class="header">
                        <div class="title">PEDIDO</div>
                        <div style="font-size: 18px; margin-top: 10px;">${pedido.numeroOrden}</div>
                    </div>
                    
                    <div class="info-grid">
                        <div class="info-box">
                            <div class="info-label">FECHA</div>
                            <div class="info-value">${fecha}</div>
                        </div>
                        <div class="info-box">
                            <div class="info-label">ESTADO</div>
                            <div class="info-value">${pedido.estado.toUpperCase()}</div>
                        </div>
                        <div class="info-box">
                            <div class="info-label">CLIENTE</div>
                            <div class="info-value">${pedido.user?.name || pedido.user?.email || "Cliente"}</div>
                            <div class="info-value" style="font-size: 11px;">${pedido.nombreFactura || ""}</div>
                            <div class="info-value" style="font-size: 11px;">${pedido.tipoDocumento?.toUpperCase()}: ${pedido.numeroDoc || ""}</div>
                        </div>
                        <div class="info-box">
                            <div class="info-label">EMPLEADOS ASIGNADOS</div>
                            <div class="info-value">${empleados}</div>
                        </div>
                        <div class="info-box" style="grid-column: span 2;">
                            <div class="info-label">DATOS DE ENVÍO</div>
                            <div class="info-value">${metodoEnvioLabel}</div>
                            ${pedido.direccion ? `<div class="info-value">Dir: ${pedido.direccion}</div>` : ""}
                            ${pedido.departamento ? `<div class="info-value">${pedido.departamento} - ${pedido.provincia} - ${pedido.distrito}</div>` : ""}
                        </div>
                    </div>
                    
                    <table class="productos-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Producto</th>
                                <th>Cantidad Solicitada</th>
                                <th>Precio</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productos.map((p, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td class="nombre">${p.nombre}</td>
                                    <td class="resaltado">${p.cantidad}</td>
                                    <td>S/ ${p.precio.toFixed(2)}</td>
                                    <td>S/ ${p.total.toFixed(2)}</td>
                                </tr>
                                ${p.indicaciones ? `<tr><td colspan="5" style="font-style: italic; font-size: 10px; background: #fff3cd;">📋 Nota: ${p.indicaciones}</td></tr>` : ""}
                            `).join("")}
                        </tbody>
                    </table>
                    
                    <div class="totales">
                        <div class="totales-row">
                            <span>Subtotal:</span>
                            <span>S/ ${(pedido.total - pedido.costoEnvio).toFixed(2)}</span>
                        </div>
                        <div class="totales-row">
                            <span>Costo de envío:</span>
                            <span>S/ ${pedido.costoEnvio.toFixed(2)}</span>
                        </div>
                        <div class="totales-row gran-total">
                            <span>TOTAL A PAGAR:</span>
                            <span>S/ ${pedido.total.toFixed(2)}</span>
                        </div>
                    </div>
                </body>
                </html>
            `)
        }

        printWindow.document.close()
        printWindow.focus()

        setTimeout(() => {
            printWindow.print()
        }, 500)
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold text-black flex items-center gap-2">
                        <Printer className="h-5 w-5" />
                        Exportar a PDF
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">Seleccionar formato:</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFormato("ticket")}
                                className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 text-black ${formato === "ticket"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-slate-200"
                                    }`}
                            >
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">Ticket 80mm</span>
                            </button>
                            <button
                                onClick={() => setFormato("a4")}
                                className={`flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 text-black ${formato === "a4"
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-slate-200"
                                    }`}
                            >
                                <FileText className="h-4 w-4" />
                                <span className="text-sm">A4</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-lg text-sm">
                        <p className="font-medium text-black mb-2">Vista previa de datos:</p>
                        <div className="space-y-1 text-slate-600">
                            <p><span className="font-medium">N° Orden:</span> {pedido.numeroOrden}</p>
                            <p><span className="font-medium">Cliente:</span> {pedido.user?.name || pedido.user?.email}</p>
                            <p><span className="font-medium">Empleados:</span> {empleados}</p>
                            <p><span className="font-medium">Productos:</span> {productos.length} artículos</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t flex gap-2">
                    <Button onClick={onClose} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                        Cancelar
                    </Button>
                    <Button onClick={handleImprimir} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                        <Printer className="h-4 w-4 mr-2" />
                        Generar PDF
                    </Button>
                </div>
            </div>
        </div>
    )
}