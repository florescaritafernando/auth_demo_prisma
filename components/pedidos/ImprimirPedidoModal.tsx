"use client"

import { useState } from "react"
import { Printer, X, FileText, Download } from "lucide-react"
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
                ? `Agencia: ${pedido.agencia === "otros" ? (pedido.agenciaOtro || "Otros") : (pedido.agencia || "No especificada")}`
                : pedido.metodoEnvio === "delivery"
                    ? `Delivery: ${pedido.delivery === "otros" ? (pedido.deliveryOtro || "Otros") : (pedido.delivery || "No especificado")}`
                    : "No especificado"

        const productos = pedido.pedidoDetalle
            .map(d => {
                const metrajeTotal = d.etiquetas?.reduce((sum, e) => sum + e.valor, 0) || Number(d.metraje || 0)
                const piezasRegistradas = d.etiquetas?.length || 0
                const sinEtiquetasAun = piezasRegistradas === 0 && pedido.estado === "metraje_en_proceso"

                if (d.tipo === "pieza") {
                    return {
                        nombre: d.producto.nombre,
                        categoria: d.producto.categoria,
                        cantidad: sinEtiquetasAun
                            ? `${d.cantidad} pzs (por confirmar)`
                            : `${piezasRegistradas} pzs (${metrajeTotal.toFixed(2)}m)`,
                        piezasRegistradas,
                        sinEtiquetasAun,
                        precio: d.precio,
                        total: sinEtiquetasAun ? 0 : metrajeTotal * Number(d.precio),
                        indicaciones: d.indicacionesCorte
                    }
                }

                return {
                    nombre: d.producto.nombre,
                    categoria: d.producto.categoria,
                    cantidad: `${d.cantidad} metros`,
                    piezasRegistradas: null,
                    sinEtiquetasAun: false,
                    precio: d.precio,
                    total: Number(d.cantidad) * Number(d.precio),
                    indicaciones: d.indicacionesCorte
                }
            })
            .filter(p => p.piezasRegistradas === null || p.piezasRegistradas > 0 || p.sinEtiquetasAun)

        return { fecha, metodoEnvioLabel, productos, empleadoNames }
    }

    const { fecha, metodoEnvioLabel, productos, empleadoNames: colaboradores } = generarContenido()

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
                    @page { size: A4; margin: 10mm; }
                    body { 
                        font-family: Arial, sans-serif; 
                        font-size: 11px; 
                        max-width: 210mm; 
                        margin: 0 auto; 
                        padding: 10mm;
                    }
                    .header { text-align: center; border: 2px solid #000; padding: 15px; margin-bottom: 15px; position: relative; page-break-inside: avoid; }
                    .logo { position: absolute; left: 45px; top: 50%; transform: translateY(-50%); height: 50px; width: 150px; }
                    .title { font-size: 22px; font-weight: bold; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; page-break-inside: avoid; }
                    .info-box { border: 1px solid #ddd; padding: 8px; }
                    .info-label { font-weight: bold; color: #666; font-size: 9px; }
                    .info-value { font-size: 12px; }
                    .productos-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; table-layout: fixed; }
                    .productos-table th { background: #333; color: white; padding: 8px 6px; text-align: left; font-size: 10px; }
                    .productos-table td { border: 1px solid #ddd; padding: 6px; font-size: 11px; word-wrap: break-word; overflow-wrap: break-word; }
                    .productos-table .col-num { width: 4%; }
                    .productos-table .col-nombre { width: 32%; }
                    .productos-table .col-cat { width: 22%; }
                    .productos-table .col-cant { width: 14%; }
                    .productos-table .col-precio { width: 13%; }
                    .productos-table .col-total { width: 15%; }
                    .productos-table .nombre { font-weight: bold; }
                    .productos-table .resaltado { background: #fff3cd; font-weight: bold; }
                    .productos-table tr { page-break-inside: avoid; }
                    .totales { border-top: 2px solid #000; padding-top: 12px; page-break-inside: avoid; }
                    .totales-row { display: flex; justify-content: space-between; padding: 4px 0; }
                    .gran-total { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
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
                        <div class="value">${(pedido.nombreFactura || "").toUpperCase()}</div>
                        <div class="value">${pedido.tipoDocumento?.toUpperCase()}: ${pedido.numeroDoc || ""}</div>
                        ${pedido.direccion ? `<div class="value">DIR: ${pedido.direccion.toUpperCase()}</div>` : ""}
                    </div>
                    
                    <div class="section">
                        <div class="label">COLABORADOR(ES):</div>
                        <div class="value">${colaboradores}</div>
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
                        <img src="/images/logo_manchester.png" class="logo" alt="Logo" />
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
                            <div class="info-value">${(pedido.nombreFactura || "").toUpperCase()}</div>
                            <div class="info-value" style="font-size: 11px;">${pedido.tipoDocumento?.toUpperCase()}: ${pedido.numeroDoc || ""}</div>
                        </div>
                        <div class="info-box">
                            <div class="info-label">COLABORADORES ASIGNADOS</div>
                            <div class="info-value">${colaboradores}</div>
                        </div>
                        <div class="info-box" style="grid-column: span 2;">
                            <div class="info-label">DATOS DE ENVÍO</div>
                            <div class="info-value">${metodoEnvioLabel}</div>
                            ${pedido.direccion ? `<div class="info-value">Dir: ${pedido.direccion.toUpperCase()}</div>` : ""}
                            ${pedido.departamento ? `<div class="info-value">${pedido.departamento} - ${pedido.provincia} - ${pedido.distrito}</div>` : ""}
                        </div>
                    </div>
                    
                    <table class="productos-table">
                        <thead>
                            <tr>
                                <th class="col-num">#</th>
                                <th class="col-nombre">Producto</th>
                                <th class="col-cat">Categoría</th>
                                <th class="col-cant">Cantidad</th>
                                <th class="col-precio">Precio</th>
                                <th class="col-total">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productos.map((p, i) => `
                                <tr>
                                    <td class="col-num">${i + 1}</td>
                                    <td class="nombre">${p.nombre}</td>
                                    <td>${p.categoria || "N/A"}</td>
                                    <td class="resaltado">${p.cantidad}</td>
                                    <td>S/ ${p.precio.toFixed(2)}</td>
                                    <td>S/ ${p.total.toFixed(2)}</td>
                                </tr>
                                ${p.indicaciones ? `<tr><td colspan="6" style="font-style: italic; font-size: 10px; background: #fff3cd; padding-left: 12px;">📋 Nota: ${p.indicaciones}</td></tr>` : ""}
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

    const generarHTMLA4 = () => {
        const estilosA4 = `
            @page { size: A4; margin: 10mm; }
                    body { 
                        font-family: Arial, sans-serif; 
                        font-size: 11px; 
                        max-width: 210mm; 
                        margin: 0 auto; 
                        padding: 10mm;
                    }
                    .header { text-align: center; border: 2px solid #000; padding: 15px; margin-bottom: 15px; position: relative; page-break-inside: avoid; }
                    .logo { position: absolute; left: 25px; top: 50%; transform: translateY(-50%); height: 50px; width: 150px; }
                    .title { font-size: 22px; font-weight: bold; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; page-break-inside: avoid; }
                    .info-box { border: 1px solid #ddd; padding: 8px; }
                    .info-label { font-weight: bold; color: #666; font-size: 9px; }
                    .info-value { font-size: 12px; }
                    .productos-table { width: 100%; border-collapse: collapse; margin-bottom: 15px; table-layout: fixed; }
                    .productos-table th { background: #333; color: white; padding: 8px 6px; text-align: left; font-size: 10px; }
                    .productos-table td { border: 1px solid #ddd; padding: 6px; font-size: 11px; word-wrap: break-word; overflow-wrap: break-word; }
                    .productos-table .col-num { width: 4%; }
                    .productos-table .col-nombre { width: 32%; }
                    .productos-table .col-cat { width: 22%; }
                    .productos-table .col-cant { width: 14%; }
                    .productos-table .col-precio { width: 13%; }
                    .productos-table .col-total { width: 15%; }
                    .productos-table .nombre { font-weight: bold; }
                    .productos-table .resaltado { background: #fff3cd; font-weight: bold; }
                    .productos-table tr { page-break-inside: avoid; }
                    .totales { border-top: 2px solid #000; padding-top: 12px; page-break-inside: avoid; }
                    .totales-row { display: flex; justify-content: space-between; padding: 4px 0; }
                    .gran-total { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
        `

        return `
            <!DOCTYPE html>
            <html>
            <head><title>Pedido ${pedido.numeroOrden}</title>${estilosA4}</head>
            <body>
                <div class="header">
                    <img src="/images/logo_manchester.png" class="logo" alt="Logo" />
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
                        <div class="info-value">${(pedido.nombreFactura || "").toUpperCase()}</div>
                        <div class="info-value" style="font-size: 11px;">${pedido.tipoDocumento?.toUpperCase()}: ${pedido.numeroDoc || ""}</div>
                    </div>
                    <div class="info-box">
                        <div class="info-label">COLABORADORES ASIGNADOS</div>
                        <div class="info-value">${colaboradores}</div>
                    </div>
                    <div class="info-box" style="grid-column: span 2;">
                        <div class="info-label">DATOS DE ENVÍO</div>
                        <div class="info-value">${metodoEnvioLabel}</div>
                        ${pedido.direccion ? `<div class="info-value">Dir: ${pedido.direccion.toUpperCase()}</div>` : ""}
                        ${pedido.departamento ? `<div class="info-value">${pedido.departamento} - ${pedido.provincia} - ${pedido.distrito}</div>` : ""}
                    </div>
                </div>
                
                <table class="productos-table">
                    <thead>
                        <tr>
                            <th class="col-num">#</th>
                            <th class="col-nombre">Producto</th>
                            <th class="col-cat">Categoría</th>
                            <th class="col-cant">Cantidad</th>
                            <th class="col-precio">Precio</th>
                            <th class="col-total">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productos.map((p, i) => `
                            <tr>
                                <td class="col-num">${i + 1}</td>
                                <td class="nombre">${p.nombre}</td>
                                <td>${p.categoria || "N/A"}</td>
                                <td class="resaltado">${p.cantidad}</td>
                                <td>S/ ${p.precio.toFixed(2)}</td>
                                <td>S/ ${p.total.toFixed(2)}</td>
                            </tr>
                            ${p.indicaciones ? `<tr><td colspan="6" style="font-style: italic; font-size: 10px; background: #fff3cd; padding-left: 12px;">Nota: ${p.indicaciones}</td></tr>` : ""}
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
        `
    }

    const handleDescargarPDF = async () => {
        const { jsPDF } = await import("jspdf")

        const pdf = new jsPDF("p", "mm", "a4")
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        const margin = 15
        const contentWidth = pageWidth - margin * 2
        const rowHeight = 10
        const headerHeight = 38
        const footerHeight = 28
        const tableHeaderH = 10

        let logoBase64: string | null = null
        try {
            const imgResponse = await fetch("/images/logo_manchester.png")
            const imgBlob = await imgResponse.blob()
            const reader = new FileReader()
            logoBase64 = await new Promise<string>((resolve) => {
                reader.onloadend = () => resolve(reader.result as string)
                reader.readAsDataURL(imgBlob)
            })
        } catch {
            // continuar sin logo
        }

        const drawHeader = (yPos: number) => {
            if (logoBase64) {
                pdf.addImage(logoBase64, "PNG", margin + 1, yPos + 3, 50, 22)
            }
            pdf.setFont("helvetica", "bold")
            pdf.setFontSize(20)
            pdf.text("PEDIDO", pageWidth / 2, yPos + 12, { align: "center" })
            pdf.setFontSize(14)
            pdf.text(pedido.numeroOrden, pageWidth / 2, yPos + 21, { align: "center" })
            pdf.setDrawColor(0, 0, 0)
            pdf.setLineWidth(0.8)
            pdf.rect(margin, yPos, contentWidth, 28)
        }

        const drawInfoSection = (yPos: number) => {
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(7)
            pdf.setTextColor(100, 100, 100)
            pdf.text("FECHA", margin + 3, yPos + 5)
            pdf.text("ESTADO", margin + contentWidth / 2 + 3, yPos + 5)
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(10)
            pdf.text(fecha, margin + 3, yPos + 11)
            pdf.text(pedido.estado.toUpperCase(), margin + contentWidth / 2 + 3, yPos + 11)
            pdf.setDrawColor(220, 220, 220)
            pdf.setLineWidth(0.2)
            pdf.rect(margin, yPos, contentWidth / 2 - 2, 16)
            pdf.rect(margin + contentWidth / 2 + 2, yPos, contentWidth / 2 - 2, 16)

            const y2 = yPos + 20
            pdf.setFontSize(7)
            pdf.setTextColor(100, 100, 100)
            pdf.text("CLIENTE", margin + 3, y2 + 5)
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(10)
            pdf.text((pedido.nombreFactura || "N/A").toUpperCase(), margin + 3, y2 + 11)
            pdf.setFontSize(8)
            pdf.text(`${pedido.tipoDocumento?.toUpperCase() || ""}: ${pedido.numeroDoc || ""}`, margin + 3, y2 + 17)
            pdf.setDrawColor(220, 220, 220)
            pdf.rect(margin, y2, contentWidth / 2 - 2, 22)

            pdf.setFontSize(7)
            pdf.setTextColor(100, 100, 100)
            pdf.text("COLABORADORES", margin + contentWidth / 2 + 3, y2 + 5)
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(9)
            const colabShort = colaboradores.length > 40 ? colaboradores.substring(0, 40) + "..." : colaboradores
            pdf.text(colabShort, margin + contentWidth / 2 + 3, y2 + 11)
            pdf.setDrawColor(220, 220, 220)
            pdf.rect(margin + contentWidth / 2 + 2, y2, contentWidth / 2 - 2, 22)

            const y3 = y2 + 26
            pdf.setFontSize(7)
            pdf.setTextColor(100, 100, 100)
            pdf.text("DATOS DE ENVÍO", margin + 3, y3 + 5)
            pdf.setTextColor(0, 0, 0)
            pdf.setFontSize(9)
            pdf.text(metodoEnvioLabel, margin + 3, y3 + 11)
            let envioY = y3 + 17
            if (pedido.direccion) {
                pdf.setFontSize(8)
                pdf.text(`DIRECCIÓN: ${pedido.direccion.toUpperCase()}`, margin + 3, envioY)
                envioY += 5
            }
            if (pedido.departamento) {
                pdf.setFontSize(8)
                pdf.text(`${pedido.departamento} - ${pedido.provincia} - ${pedido.distrito}`, margin + 3, envioY)
                envioY += 5
            }
            const envioH = Math.max(envioY - y3 + 2, 22)
            pdf.setDrawColor(220, 220, 220)
            pdf.rect(margin, y3, contentWidth, envioH)

            return envioY + 4
        }

        const colX = {
            num: margin + contentWidth * 0.02,
            nombre: margin + contentWidth * 0.08,
            cat: margin + contentWidth * 0.38,
            cant: margin + contentWidth * 0.60,
            precio: margin + contentWidth * 0.74,
            total: margin + contentWidth * 0.87
        }

        const drawTableHeader = (yPos: number) => {
            pdf.setFillColor(240,240,240)
            pdf.rect(margin, yPos, contentWidth, tableHeaderH, "F")
            pdf.setTextColor(40, 40, 40)
            pdf.setFont("helvetica", "bold")
            pdf.setFontSize(8)
            pdf.text("#", colX.num, yPos + 6.5)
            pdf.text("Producto", colX.nombre, yPos + 6.5)
            pdf.text("Categoría", colX.cat, yPos + 6.5)
            pdf.text("Cantidad", colX.cant, yPos + 6.5)
            pdf.text("Precio", colX.precio, yPos + 6.5)
            pdf.text("Total", colX.total, yPos + 6.5)
        }

        const drawTotals = (yPos: number) => {
            pdf.setDrawColor(0, 0, 0)
            pdf.setLineWidth(0.5)
            pdf.line(margin, yPos, margin + contentWidth, yPos)
            yPos += 7
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(10)
            pdf.setTextColor(0, 0, 0)
            pdf.text("Subtotal:", margin + 3, yPos + 5)
            pdf.text(`S/ ${(pedido.total - pedido.costoEnvio).toFixed(2)}`, pageWidth - margin - 3, yPos + 5, { align: "right" })
            yPos += 7
            pdf.text("Costo de envío:", margin + 3, yPos + 5)
            pdf.text(`S/ ${pedido.costoEnvio.toFixed(2)}`, pageWidth - margin - 3, yPos + 5, { align: "right" })
            yPos += 9
            pdf.setLineWidth(0.6)
            pdf.line(margin, yPos, margin + contentWidth, yPos)
            yPos += 8
            pdf.setFont("helvetica", "bold")
            pdf.setFontSize(13)
            pdf.text("TOTAL A PAGAR:", margin + 3, yPos + 6)
            pdf.text(`S/ ${pedido.total.toFixed(2)}`, pageWidth - margin - 3, yPos + 6, { align: "right" })
        }

        const drawPageFooter = (pageNum: number, totalPages: number) => {
            const footerY = pageHeight - 10
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(8)
            pdf.setTextColor(150, 150, 150)
            pdf.text(`Pedido ${pedido.numeroOrden}`, margin, footerY)
            pdf.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, footerY, { align: "right" })
        }

        // ===== PRIMERA PÁGINA =====
        drawHeader(margin)
        const infoBottom = drawInfoSection(margin + headerHeight)

        let y = infoBottom + 5
        drawTableHeader(y)
        y += tableHeaderH

        const availableForTable = pageHeight - margin - infoBottom - 5 - footerHeight
        const maxRowsPerPage = Math.floor((availableForTable - tableHeaderH) / rowHeight)

        // Calcular páginas necesarias
        let totalPagesNeeded = 1
        let rowsOnPage = 0
        productos.forEach((p) => {
            const rowsForItem = p.indicaciones ? 2 : 1
            if (rowsOnPage + rowsForItem > maxRowsPerPage) {
                totalPagesNeeded++
                rowsOnPage = rowsForItem
            } else {
                rowsOnPage += rowsForItem
            }
        })

        // Renderizar productos con paginación
        let currentPage = 1
        let rowCount = 0

        productos.forEach((p, i) => {
            const itemRows = p.indicaciones ? 2 : 1
            const spaceNeeded = itemRows * rowHeight

            if (rowCount + itemRows > maxRowsPerPage) {
                drawPageFooter(currentPage, totalPagesNeeded)
                pdf.addPage()
                currentPage++
                drawHeader(margin)
                const nextPageInfoBottom = drawInfoSection(margin + headerHeight)
                y = nextPageInfoBottom + 5
                drawTableHeader(y)
                y += tableHeaderH
                rowCount = 0
            }

            pdf.setDrawColor(220, 220, 220)
            pdf.setLineWidth(0.15)
            pdf.line(margin, y, margin + contentWidth, y)

            pdf.setTextColor(0, 0, 0)
            pdf.setFont("helvetica", "normal")
            pdf.setFontSize(8)
            pdf.text(`${i + 1}`, colX.num, y + 6.5)

            pdf.setFont("helvetica", "bold")
            const nombreMax = 28
            pdf.text(p.nombre.substring(0, nombreMax), colX.nombre, y + 6.5)

            pdf.setFont("helvetica", "normal")
            pdf.text((p.categoria || "N/A").substring(0, 22), colX.cat, y + 6.5)

            pdf.setFont("helvetica", "bold")
            pdf.text(`${p.cantidad}`, colX.cant, y + 6.5)

            pdf.setFont("helvetica", "normal")
            pdf.text(`S/ ${p.precio.toFixed(2)}`, colX.precio, y + 6.5)
            pdf.text(`S/ ${p.total.toFixed(2)}`, colX.total, y + 6.5)

            if (p.indicaciones) {
                pdf.setFont("helvetica", "oblique")
                pdf.setFontSize(7)
                pdf.setTextColor(100, 100, 100)
                const notaText = `Nota: ${p.indicaciones}`.substring(0, 90)
                pdf.text(notaText, colX.nombre, y + 13)
                pdf.setTextColor(0, 0, 0)
                pdf.setFontSize(8)
            }

            y += rowHeight
            rowCount += itemRows
        })

        // Línea final de la tabla
        pdf.setDrawColor(180, 180, 180)
        pdf.setLineWidth(0.3)
        pdf.line(margin, y, margin + contentWidth, y)

        // Verificar si hay espacio para totales, si no, nueva página
        const spaceForTotals = 35
        if (y + spaceForTotals > pageHeight - margin) {
            drawPageFooter(currentPage, totalPagesNeeded)
            pdf.addPage()
            currentPage++
            drawHeader(margin)
            const totalsPageInfoBottom = drawInfoSection(margin + headerHeight)
            y = totalsPageInfoBottom + 5
            drawTableHeader(y)
            y += tableHeaderH
            pdf.setDrawColor(180, 180, 180)
            pdf.line(margin, y, margin + contentWidth, y)
        }

        drawTotals(y + 5)

        // Footer de última página
        drawPageFooter(currentPage, totalPagesNeeded)

        pdf.save(`Pedido_${pedido.numeroOrden}.pdf`)
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
                            <p><span className="font-medium">Cliente:</span> {pedido.nombreFactura || "N/A"}</p>
                            <p><span className="font-medium">Colaboradores:</span> {colaboradores}</p>
                            <p><span className="font-medium">Productos:</span> {productos.length} artículos</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t flex gap-2">
                    <Button onClick={onClose} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                        Cancelar
                    </Button>
                    <Button onClick={handleDescargarPDF} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar PDF
                    </Button>
                    <Button onClick={handleImprimir} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir
                    </Button>
                </div>
            </div>
        </div>
    )
}