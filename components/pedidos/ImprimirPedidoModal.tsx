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
    numeroOperacion: string | null
    metodoEnvio: string | null
    tiendaId: string | null
    tienda: { id: string; nombre: string; direccion: string } | null
    agencia: string | null
    agenciaOtro: string | null
    delivery: string | null
    deliveryOtro: string | null
    tipoEnvio: string | null
    direccion: string | null
    departamento: string | null
    provincia: string | null
    distrito: string | null
    nombreRecibe: string | null
    dniRecibe: string | null
    celularRecibe: string | null
    costoEnvio: number
    total: number
    notas: string | null
    motivoRechazo: string | null
    pedidoDetalle: DetalleItem[]
    delegados: { id: string; userId: string; user: { id: string; name: string | null } }[]
    user: { id: string; name: string | null; email: string | null } | null
}

interface Props {
    pedido: Pedido
    onClose: () => void
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
            ? "(TIENDA) - RETIRO EN TIENDA"
            : pedido.metodoEnvio === "agencia"
                ? `(AGENCIA) - ${(pedido.agencia === "otros" ? (pedido.agenciaOtro || "OTROS") : (pedido.agencia || "NO ESPECIFICADA")).toUpperCase()}`
                : pedido.metodoEnvio === "delivery"
                    ? `(DELIVERY) - ${(pedido.delivery === "otros" ? (pedido.deliveryOtro || "OTROS") : (pedido.delivery || "NO ESPECIFICADO")).toUpperCase()}`
                    : pedido.metodoEnvio ? pedido.metodoEnvio.toUpperCase() : ""

        const productos = pedido.pedidoDetalle
            .map(d => {
                const metrajeTotal = d.etiquetas?.reduce((sum, e) => sum + e.valor, 0) || Number(d.metraje || 0)
                const piezasEsperadas = d.tipo === "pieza" ? Number(d.cantidad) : 0
                const piezasRegistradas = d.etiquetas?.length || 0
                const sinEtiquetasAun = piezasRegistradas === 0 && pedido.estado === "metraje_en_proceso"
                const cantidadDisplay = d.tipo === "pieza"
                    ? `${sinEtiquetasAun ? piezasEsperadas : piezasRegistradas} PZ(S)`
                    : `${d.cantidad} MTS`
                const metrajeDisplay = d.tipo === "pieza"
                    ? (pedido.estado === "metraje_en_proceso" ? "METRAJE POR CONFIRMAR" : (metrajeTotal > 0 ? `${metrajeTotal.toFixed(2)} MTS` : ""))
                    : ""
                const precioDisplay = `S/ ${Number(d.precio).toFixed(2)}`
                const totalCalculado = d.tipo === "pieza"
                    ? (sinEtiquetasAun ? 0 : metrajeTotal * Number(d.precio))
                    : Number(d.cantidad) * Number(d.precio)
                const mostrarCalculo = !(d.tipo === "pieza" && pedido.estado === "metraje_en_proceso")

                return {
                    nombre: d.producto.nombre,
                    categoria: d.producto.categoria,
                    cantidad: cantidadDisplay,
                    metraje: metrajeDisplay,
                    precio: precioDisplay,
                    precioNum: d.precio,
                    total: totalCalculado,
                    mostrarCalculo,
                    indicaciones: d.indicacionesCorte
                }
            })
            .filter(p => !(p.cantidad === "0 PZ(S)" && pedido.estado !== "metraje_en_proceso"))

        return { fecha, metodoEnvioLabel, productos, empleadoNames }
    }

    const { fecha, metodoEnvioLabel, productos, empleadoNames: colaboradores } = generarContenido()

    const handleImprimir = () => {
        const esMovil = /Mobi|Android|iPad|iPhone|iPod|Tablet/i.test(navigator.userAgent) || ('ontouchstart' in window) || window.innerWidth <= 1024

        const estilos = formato === "ticket"
            ? `
                <style>
                    @page { 
                        size: 7.2cm auto; 
                        margin: 0mm !important;
                        @top-left { content: none; }
                        @top-center { content: none; }
                        @top-right { content: none; }
                        @bottom-left { content: none; }
                        @bottom-center { content: none; }
                        @bottom-right { content: none; }
                    }
                    * {
                        box-sizing: border-box;
                        max-width: 7.2cm;
                        margin: 0;
                        padding: 0;
                    }
                    html, body {
                        margin: 0;
                        padding: 0;
                        width: 7.2cm;
                        min-width: 7.2cm;
                        max-width: 7.2cm;
                        height: auto;
                    }
                    body { 
                        font-family: Arial, Helvetica, sans-serif; 
                        font-size: 9pt; 
                        font-weight: bold;
                        width: 7.2cm; 
                        margin: 0; 
                        padding: 0;
                        min-width: 7.2cm;
                        max-width: 7.2cm;
                        text-transform: uppercase;
                        color: #000;
                        height: auto;
                        page-break-after: avoid;
                    }
                    .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6pt; margin-bottom: 6pt; }
                    .title { font-weight: bold; font-size: 14pt; }
                    .numero { font-weight: bold; font-size: 12pt; margin-top: 4pt; }
                    .estado { font-size: 10pt; margin-top: 2pt; }
                    .section { margin-bottom: 4pt; }
                    .label { font-weight: bold; font-size: 10pt; margin-bottom: 1pt; }
                    .value { word-wrap: break-word; font-size: 10pt; margin-bottom: 1pt; }
                    .productos-label { font-weight: bold; font-size: 10pt; border-bottom: 1px dashed #000; margin-bottom: 4pt; padding-bottom: 3pt; }
                    .producto { padding-left: 4pt; background: #f0f0f0; border-left: 3px solid #333; page-break-inside: avoid; margin-bottom: 4pt; padding-top: 3pt; padding-bottom: 3pt; padding-right: 4pt; }
                    .producto-nombre { font-weight: bold; font-size: 12pt; word-wrap: break-word; }
                    .producto-detalle { font-size: 12pt; margin-top: 1pt; }
                    .producto-total { font-weight: bold; font-size: 10pt; text-align: right; margin-top: 1pt; }
                    .indicaciones { white-space: pre-wrap; word-wrap: break-word; font-size: 9pt; font-style: italic; margin-top: 1pt; border-top: 1px solid #ccc; padding-top: 1pt; }
                    .totales { border-top: 1px dashed #000; padding-top: 6pt; margin-top: 4pt; }
                    .total-row { display: flex; justify-content: space-between; font-size: 10pt; margin-bottom: 2pt; }
                    .gran-total { display: flex; justify-content: space-between; font-weight: bold; font-size: 14pt; border-top: 1px dashed #000; padding-top: 4pt; margin-top: 4pt; }
                    .falta-pagar { display: flex; justify-content: space-between; font-weight: bold; font-size: 11pt; border-top: 1px dashed #000; }
                    .notas { border-top: 1px dashed #000; padding-top: 4pt; margin-top: 4pt; }
                    .rechazo { border: 1px dashed #000; padding: 6pt; margin-bottom: 4pt; }
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
                    .productos-table th { background: #333; color: white; padding: 8px 6px; text-align: left; font-size: 10px;}
                    .productos-table td { border: 1px solid #ddd; padding: 6px; font-size: 11px; word-wrap: break-word; overflow-wrap: break-word; }
                    .productos-table .col-num { width: 4%; }
                    .productos-table .col-nombre { width: 25%; }
                    .productos-table .col-cat { width: 18%; }
                    .productos-table .col-cant { width: 22%; }
                    .productos-table .col-precio { width: 13%; }
                    .productos-table .col-total { width: 18%; }
                    .productos-table .nombre { font-weight: bold; }
                    .productos-table .resaltado { background: #fff3cd; font-weight: bold; }
                    .productos-table tr { page-break-inside: avoid; }
                    .totales { border-top: 2px solid #000; padding-top: 12px; page-break-inside: avoid; }
                    .totales-row { display: flex; justify-content: space-between; padding: 4px 0; }
                    .gran-total { font-size: 20px; font-weight: bold; border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
                    .notas-box { border: 1px solid #ddd; padding: 8px; background: #f9f9f9; page-break-inside: avoid; }
                    .rechazo-box { border: 1px solid rgb(255, 255, 255); padding: 8px; background: #ffffff; page-break-inside: avoid; }
                </style>
            `

        if (formato === "ticket") {
            const ticketBodyHtml = `
                    <div class="header">
                        <div class="title">PEDIDO</div>
                        <div class="numero">${pedido.numeroOrden}</div>
                        <div class="estado">ESTADO: ${pedido.estado.toUpperCase()}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label">FECHA:</div>
                        <div class="value">${fecha}</div>
                    </div>
                    
                    <div class="section">
                        <div class="label">CLIENTE:</div>
                        <div class="value">${(pedido.nombreFactura || "").toUpperCase()}</div>
                        <div class="value">${pedido.tipoDocumento?.toUpperCase() || ""}: ${pedido.numeroDoc || ""}</div>
                        ${pedido.metodoEnvio !== "agencia" ? `<div class="value">DIR: ${pedido.direccion?.toUpperCase()|| ""}</div>` : ""}

                    </div>
                    
                    ${pedido.numeroOperacion && pedido.numeroOperacion !== "012345678" ? `
                    <div class="section">
                        <div class="label">NRO. OPERACIÓN:</div>
                        <div class="value">${pedido.numeroOperacion}</div>
                    </div>
                    ` : ""}
                    
                    <div class="section">
                        <div class="label">COLABORADOR(ES):</div>
                        <div class="value">${colaboradores}</div>
                    </div>
                    
                    ${pedido.metodoEnvio ? `
                    <div class="section">
                        <div class="label">MÉTODO DE ENVÍO:</div>
                        <div class="value">${metodoEnvioLabel}</div>
                        ${pedido.metodoEnvio === "tienda" && pedido.tienda ? `
                            <div class="value">TIENDA: ${pedido.tienda.nombre?.toUpperCase() || ""}</div>
                            <div class="value">DIR: ${pedido.tienda.direccion?.toUpperCase() || ""}</div>
                        ` : ""}
                        ${pedido.direccion ? `<div class="value">DIR: ${pedido.direccion.toUpperCase()}</div>` : ""}
                        ${(pedido.departamento || pedido.provincia || pedido.distrito) ? `<div class="value">UBI: ${[pedido.departamento, pedido.provincia, pedido.distrito].filter(Boolean).join(" - ").toUpperCase()}</div>` : ""}
                        ${pedido.nombreRecibe || pedido.celularRecibe ? `
                            <div class="value">RECIBE: ${pedido.nombreRecibe?.toUpperCase() || ""}${pedido.dniRecibe && pedido.celularRecibe ? ` (DNI: ${pedido.dniRecibe}, CEL: ${pedido.celularRecibe})` : pedido.dniRecibe ? ` (DNI: ${pedido.dniRecibe})` : pedido.celularRecibe ? ` (CEL: ${pedido.celularRecibe})` : ""}</div>
                        ` : ""}
                    </div>
                    ` : ""}
                    
                    ${pedido.motivoRechazo && pedido.estado === "rechazado" ? `
                    <div class="rechazo">
                        <div class="label">PEDIDO RECHAZADO:</div>
                        <div class="value">${pedido.motivoRechazo}</div>
                    </div>
                    ` : ""}
                    
                    <div class="section">
                        <div class="productos-label">ARTÍCULOS:</div>
                        ${productos.map(p => {
                            const cUpper = p.cantidad.toUpperCase()
                            const cMatch = cUpper.match(/^([\d.]+)\s+(.+)$/)
                            const cNum = cMatch ? cMatch[1] : cUpper
                            const cUnit = cMatch ? cMatch[2] : ''
                            const mUpper = p.metraje?.toUpperCase() || ''
                            const mMatch = mUpper.match(/^([\d.]+)\s+(.+)$/)
                            const mVal = mMatch ? mMatch[1] : ''
                            const mUnit = mMatch ? mMatch[2] : mUpper || ''
                            return `
                            <div class="producto">
                                <div class="producto-nombre">${p.nombre.toUpperCase()} <span style="font-weight: bold; font-size: 10pt;">${p.categoria ? `(${p.categoria.toUpperCase()})` : ""}</span></div>
                                <div class="producto-detalle">
                                    <span>${cNum}</span>${cUnit ? `<span style="font-size:10pt"> ${cUnit}</span>` : ''}${mVal ? `<span style="font-size:10pt"> ${mVal}</span>` : ''}${mUnit ? `<span style="font-size:10pt"> ${mUnit}</span>` : ''}<span style="font-size:10pt"> X ${p.precio.toUpperCase()}</span>
                                </div>
                                ${p.mostrarCalculo ? `<div class="producto-total">= S/ ${p.total.toFixed(2)}</div>` : ""}
                                ${p.indicaciones ? `<div class="indicaciones">"${p.indicaciones.toUpperCase()}"</div>` : ""}
                            </div>`
                        }).join("")}
                    </div>
                    
                    <div class="totales">
                        <div class="total-row">
                            <span>SUBTOTAL:</span>
                            <span>S/ ${(pedido.total - pedido.costoEnvio).toFixed(2)}</span>
                        </div>
                        ${pedido.costoEnvio > 0 ? `
                        <div class="total-row">
                            <span>ENVÍO:</span>
                            <span>S/ ${pedido.costoEnvio.toFixed(2)}</span>
                        </div>
                        ` : ""}
                        <div class="total-row gran-total">
                            <span>TOTAL:</span>
                            <span>S/ ${pedido.total.toFixed(2)}</span>
                        </div>
                        ${(() => {
                            const pagado = extraerTotalPagado(pedido.notas)
                            const falta = Number(pedido.total) - pagado
                            if (falta > 0.01) {
                                return `<div class="falta-pagar">
                                    <span>FALTA PAGAR:</span>
                                    <span>S/ ${falta.toFixed(2)}</span>
                                </div>`
                            }
                            return ""
                        })()}
                    </div>
                    
                    ${pedido.notas ? `
                    <div class="notas">
                        <div class="label">OBSERVACIONES:</div>
                        <div class="value">${pedido.notas}</div>
                    </div>
                    ` : ""}`

            const estilosFinal = esMovil
                ? (() => {
                    const measurer = document.createElement("div")
                    measurer.style.cssText = "position:fixed;left:-9999px;top:0;width:7.2cm;visibility:hidden;pointer-events:none"
                    measurer.innerHTML = `<!DOCTYPE html><html><head>${estilos}</head><body>${ticketBodyHtml}</body></html>`
                    document.body.appendChild(measurer)

                    const scrollH = measurer.scrollHeight
                    const widthPx = measurer.offsetWidth || (7.2 * 37.8)
                    const pxPerCm = widthPx / 7.2
                    const alturaCm = Math.max(Math.ceil((scrollH + 8) / pxPerCm), 5)

                    document.body.removeChild(measurer)

                    return estilos.replace(
                        "size: 7.2cm auto;",
                        `size: 7.2cm ${alturaCm}cm;`
                    )
                })()
                : estilos

            const htmlCompleto = `<!DOCTYPE html>
<html>
<head>
    <title>Pedido ${pedido.numeroOrden}</title>
    ${estilosFinal}
    </head>
<body>${ticketBodyHtml}</body>
</html>`

            if (esMovil) {
                const blob = new Blob([htmlCompleto], { type: 'text/html;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                window.open(url, '_blank')
                setTimeout(() => URL.revokeObjectURL(url), 60000)
            } else {
                const printWindow = window.open("", "_blank", "width=800,height=600")
                if (!printWindow) return
                printWindow.document.write(htmlCompleto)
                printWindow.document.close()
                printWindow.focus()
                setTimeout(() => printWindow.print(), 500)
            }
        } else {
            const htmlCompletoA4 = `<!DOCTYPE html>
<html>
<head>
    <title>Pedido ${pedido.numeroOrden}</title>
    ${estilos}
    </head>
<body>${generarContenidoA4()}</body>
</html>`

            if (esMovil) {
                const blob = new Blob([htmlCompletoA4], { type: 'text/html;charset=utf-8' })
                const url = URL.createObjectURL(blob)
                window.open(url, '_blank')
                setTimeout(() => URL.revokeObjectURL(url), 60000)
            } else {
                const printWindow = window.open("", "_blank", "width=800,height=600")
                if (!printWindow) return
                printWindow.document.write(htmlCompletoA4)
                printWindow.document.close()
                printWindow.focus()
                setTimeout(() => printWindow.print(), 500)
            }
        }
    }

    const generarContenidoA4 = () => {
        return `
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
                    <div class="info-value" style="font-size: 11px;">${pedido.tipoDocumento?.toUpperCase() || ""}: ${pedido.numeroDoc || ""}</div>
                </div>
                <div class="info-box">
                    <div class="info-label">COLABORADORES ASIGNADOS</div>
                    <div class="info-value">${colaboradores}</div>
                </div>
                ${pedido.numeroOperacion && pedido.numeroOperacion !== "012345678" ? `
                <div class="info-box">
                    <div class="info-label">NRO. OPERACIÓN</div>
                    <div class="info-value" style="font-weight: bold;">${pedido.numeroOperacion}</div>
                </div>
                ` : ""}
                <div class="info-box" style="grid-column: span 2;">
                    <div class="info-label">DATOS DE ENVÍO</div>
                    <div class="info-value">${metodoEnvioLabel}</div>
                    ${pedido.metodoEnvio === "tienda" && pedido.tienda ? `
                        <div class="info-value">TIENDA: ${pedido.tienda.nombre?.toUpperCase() || ""}</div>
                        <div class="info-value">DIRECCIÓN: ${pedido.tienda.direccion?.toUpperCase() || ""}</div>
                    ` : ""}
                    ${pedido.direccion ? `<div class="info-value">DIRECCIÓN: ${pedido.direccion.toUpperCase()}</div>` : ""}
                    ${pedido.departamento || pedido.provincia || pedido.distrito ? `<div class="info-value">UBICACIÓN: ${[pedido.departamento, pedido.provincia, pedido.distrito].filter(Boolean).join(" - ").toUpperCase()}</div>` : ""}
                    ${pedido.nombreRecibe ? `<div class="info-value">RECIBE: ${pedido.nombreRecibe.toUpperCase()} ${pedido.dniRecibe ? `(DNI: ${pedido.dniRecibe})` : ""}</div>` : ""}
                    ${pedido.celularRecibe ? `<div class="info-value">CELULAR: ${pedido.celularRecibe}</div>` : ""}
                </div>
            </div>
            
            ${pedido.motivoRechazo && pedido.estado === "rechazado" ? `
            <div class="rechazo-box" style="margin-bottom: 15px;">
                <div class="info-label" style="color: #c00;">PEDIDO RECHAZADO</div>
                <div class="info-value" style="color: #c00;">${pedido.motivoRechazo}</div>
            </div>
            ` : ""}
            
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
                            <td class="resaltado">${p.cantidad}${p.metraje ? ` (${p.metraje})` : ''}</td>
                            <td>${p.precio}</td>
                            <td>S/ ${p.total.toFixed(2)}</td>
                        </tr>
                        ${p.indicaciones ? `<tr><td colspan="6" style="font-style: italic; font-size: 10px; background: #fff8e1; padding-left: 12px; border-top: 1px solid #ddd;">L» INDICACIONES DE CORTE: ${p.indicaciones}</td></tr>` : ""}
                    `).join("")}
                </tbody>
            </table>
            
            
            <div class="totales">
                <div class="totales-row">
                    <span>Subtotal:</span>
                    <span>S/ ${(pedido.total - pedido.costoEnvio).toFixed(2)}</span>
                </div>
                ${pedido.costoEnvio > 0 ? `
                <div class="totales-row">
                    <span>Costo de envío:</span>
                    <span>S/ ${pedido.costoEnvio.toFixed(2)}</span>
                </div>
                ` : ""}
                <div class="totales-row gran-total font-size:20px">
                    <span>TOTAL A PAGAR:</span>
                    <span>S/ ${pedido.total.toFixed(2)}</span>
                </div>
                ${(() => {
                    const pagado = extraerTotalPagado(pedido.notas)
                    const falta = Number(pedido.total) - pagado
                    if (falta > 0.01) {
                        return `<div class="totales-row" style="color:#c00;font-weight:bold;border-top:1px dashed rgb(99, 5, 5);padding-top:8px;margin-top:4px;font-size:16px">
                            <span>FALTA PAGAR:</span>
                            <span>S/ ${falta.toFixed(2)}</span>
                        </div>`
                    }
                    return ""
                })()}
            </div>
            
            ${pedido.notas ? `
            <div class="notas-box" style="margin-top: 15px;">
                <div class="info-label">OBSERVACIONES</div>
                <div class="info-value">${pedido.notas}</div>
            </div>
            ` : ""}
        `
    }

    const handleDescargarPDF = async () => {
        try {
            const pedidoData = {
                numeroOrden: pedido.numeroOrden,
                estado: pedido.estado,
                createdAt: pedido.createdAt,
                nombreFactura: pedido.nombreFactura,
                tipoDocumento: pedido.tipoDocumento,
                numeroDoc: pedido.numeroDoc,
                numeroOperacion: pedido.numeroOperacion,
                metodoEnvio: pedido.metodoEnvio,
                tienda: pedido.tienda,
                agencia: pedido.agencia,
                agenciaOtro: pedido.agenciaOtro,
                delivery: pedido.delivery,
                deliveryOtro: pedido.deliveryOtro,
                direccion: pedido.direccion,
                departamento: pedido.departamento,
                provincia: pedido.provincia,
                distrito: pedido.distrito,
                nombreRecibe: pedido.nombreRecibe,
                dniRecibe: pedido.dniRecibe,
                celularRecibe: pedido.celularRecibe,
                costoEnvio: pedido.costoEnvio,
                total: pedido.total,
                notas: pedido.notas,
                motivoRechazo: pedido.motivoRechazo,
                delegados: pedido.delegados,
                pedidoDetalle: pedido.pedidoDetalle.map((d: any) => ({
                    producto: d.producto,
                    cantidad: d.cantidad,
                    tipo: d.tipo,
                    precio: d.precio,
                    metraje: d.metraje,
                    etiquetas: d.etiquetas,
                    indicacionesCorte: d.indicacionesCorte,
                })),
            }

            const response = await fetch("/api/pedido-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...pedidoData, formato }),
            })

            if (!response.ok) throw new Error("Error al generar PDF")

            const pdfBlob = await response.blob()
            const blobUrl = window.URL.createObjectURL(pdfBlob)
            const link = document.createElement("a")
            link.href = blobUrl
            link.download = `Pedido_${pedido.numeroOrden}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        } catch (error) {
            console.error("Error descargando PDF:", error)
            alert("No se pudo descargar el PDF")
        }
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
                                <span className="text-sm">Hoja A4</span>
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

                <div className="p-4 border-t flex flex-col sm:flex-row gap-2">
                    <Button onClick={onClose} className="w-full border-slate-500 border-2 sm:flex-1 bg-slate-200 hover:bg-slate-300 text-black">
                        Cancelar
                    </Button>
                    <Button onClick={handleDescargarPDF} className="w-full sm:flex-1 border-green-900 border-2 bg-green-600 hover:bg-green-700 text-white">
                        <Download className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Descargar PDF</span>
                        <span className="sm:hidden">Descargar PDF</span>
                    </Button>
                    <Button onClick={handleImprimir} className="w-full sm:flex-1 border-blue-900 border-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Printer className="h-4 w-4 sm:mr-2" />
                        Imprimir
                    </Button>
                </div>
            </div>
        </div>
    )
}