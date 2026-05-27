import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"
import path from "path"
import fs from "fs"

const logoPath = path.join(process.cwd(), "public", "images", "logo_manchester.png")
let logoBase64: string | null = null
try {
    if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath)
        logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`
    }
} catch {
    // logo not available
}

const styles = StyleSheet.create({
    page: {
        padding: 38,
        fontFamily: "Helvetica",
        fontSize: 11,
    },
    header: {
        border: "2 solid #000000",
        padding: 15,
        marginBottom: 15,
        textAlign: "center",
        position: "relative",
    },
    logo: {
        position: "absolute",
        left: "5px",
        top: "80%",
        transform: "translateY(-50%)",
        height: "50px",
        width: "150px", 
    },
    title: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
    },
    orderNumber: {
        fontSize: 16,
        textAlign: "center",
        marginTop: 8,
    },
    infoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 15,
    },
    infoBox: {
        width: "48.5%",
        border: "1 solid #dddddd",
        padding: 8,
        marginBottom: 8,
    },
    infoBoxFull: {
        width: "100%",
        border: "1 solid #dddddd",
        padding: 8,
        marginBottom: 8,
    },
    infoLabel: {
        fontWeight: "bold",
        color: "#666666",
        fontSize: 8,
        marginBottom: 3,
    },
    infoValue: {
        fontSize: 10,
    },
    table: {
        width: "100%",
        marginBottom: 15,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderBottom: "2 solid #000000",
        paddingVertical: 7,
        paddingHorizontal: 6,
        fontSize: 9,
    },
    tableRow: {
        flexDirection: "row",
        borderBottom: "1 solid #dddddd",
        paddingVertical: 5,
        paddingHorizontal: 6,
        fontSize: 10,
    },
    tableRowAlt: {
        flexDirection: "row",
        borderBottom: "1 solid #dddddd",
        paddingVertical: 5,
        paddingHorizontal: 6,
        fontSize: 9,
        backgroundColor: "#ffffff",
    },
    colNum: { width: "4%" },
    colNombre: { width: "20%", fontWeight: "bold" },
    colCat: { width: "18%" },
    colCant: { width: "27%", fontWeight: "bold" },
    colPrecio: { width: "13%" },
    colTotal: { width: "18%" },
    thText: {
        color: "#000000",
        fontSize: 9,
        fontWeight: "bold",
    },
    totals: {
        borderTop: "2 solid #000000",
        paddingTop: 10,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 3,
    },
    grandTotal: {
        borderTop: "2 solid #000000",
        paddingTop: 6,
        marginTop: 6,
        fontSize: 14,
        fontWeight: "bold",
    },
    rechazoBox: {
        border: "1 solid #cc0000",
        padding: 8,
        backgroundColor: "#ffe0e0",
        marginBottom: 15,
    },
    notasBox: {
        border: "1 solid #dddddd",
        padding: 8,
        backgroundColor: "#f9f9f9",
        marginTop: 15,
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 38,
        right: 38,
        textAlign: "center",
        fontSize: 8,
        color: "#999999",
        borderTop: "1 solid #dddddd",
        paddingTop: 5,
    },
})

const AGENCIA_LABELS: Record<string, string> = {
    shalom: "SHALOM",
    flores: "FLORES",
    marvisur: "MARVISUR",
    otros: "OTROS",
}

const DELIVERY_LABELS: Record<string, string> = {
    olva: "OLVA",
    safexpress: "SAF EXPRESS",
    otros: "OTROS",
}

interface PedidoData {
    numeroOrden: string
    estado: string
    createdAt: string
    nombreFactura: string | null
    tipoDocumento: string | null
    numeroDoc: string | null
    numeroOperacion: string | null
    metodoEnvio: string | null
    tienda: { nombre: string; direccion: string } | null
    agencia: string | null
    agenciaOtro: string | null
    delivery: string | null
    deliveryOtro: string | null
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
    delegados: { user: { name: string | null } }[]
    pedidoDetalle: {
        producto: { nombre: string; categoria: string }
        cantidad: number
        tipo: string
        precio: number
        metraje: number | null
        etiquetas?: { valor: number }[]
        indicacionesCorte?: string | null
    }[]
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

export function PedidoPDF({ pedido }: { pedido: PedidoData }) {
    const fecha = new Date(pedido.createdAt).toLocaleDateString("es-PE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })

    const metodoEnvioLabel = pedido.metodoEnvio === "tienda"
        ? "(TIENDA) - RETIRO EN TIENDA"
        : pedido.metodoEnvio === "agencia"
            ? `(AGENCIA) - ${(pedido.agencia === "otros" ? (pedido.agenciaOtro || "OTROS") : (AGENCIA_LABELS[pedido.agencia || ""] || pedido.agencia || "NO ESPECIFICADA")).toUpperCase()}`
            : pedido.metodoEnvio === "delivery"
                ? `(DELIVERY) - ${(pedido.delivery === "otros" ? (pedido.deliveryOtro || "OTROS") : (DELIVERY_LABELS[pedido.delivery || ""] || pedido.delivery || "NO ESPECIFICADO")).toUpperCase()}`
                : pedido.metodoEnvio ? pedido.metodoEnvio.toUpperCase() : ""

    const colaboradores = pedido.delegados?.map(d => (d.user?.name || "Sin nombre").toUpperCase()).join(", ") || "Sin asignar"

    const productos = pedido.pedidoDetalle
        .map(d => {
            const metrajeTotal = d.etiquetas?.reduce((sum, e) => sum + e.valor, 0) || Number(d.metraje || 0)
            const piezasRegistradas = d.etiquetas?.length || 0
            const sinEtiquetasAun = piezasRegistradas === 0 && pedido.estado === "metraje_en_proceso"
            const cantidadDisplay = d.tipo === "pieza"
                ? `${sinEtiquetasAun ? d.cantidad : piezasRegistradas} PZ(S)`
                : `${d.cantidad} MTS`
            const metrajeDisplay = d.tipo === "pieza"
                ? (pedido.estado === "metraje_en_proceso" ? "METRAJE POR CONFIRMAR" : (metrajeTotal > 0 ? `${metrajeTotal.toFixed(2)} MTS` : ""))
                : ""
            const precioDisplay = `S/ ${Number(d.precio).toFixed(2)}`
            const totalCalculado = d.tipo === "pieza"
                ? (sinEtiquetasAun ? 0 : metrajeTotal * Number(d.precio))
                : Number(d.cantidad) * Number(d.precio)

            return {
                nombre: d.producto.nombre,
                categoria: d.producto.categoria,
                cantidad: cantidadDisplay,
                metraje: metrajeDisplay,
                precio: precioDisplay,
                total: totalCalculado,
                indicaciones: d.indicacionesCorte,
            }
        })
        .filter(p => !(p.cantidad === "0 PZ(S)" && pedido.estado !== "metraje_en_proceso"))

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    {logoBase64 && <Image src={logoBase64} style={styles.logo} />}
                    <Text style={styles.title}>PEDIDO</Text>
                    <Text style={styles.orderNumber}>{pedido.numeroOrden}</Text>
                </View>

                <View style={styles.infoGrid}>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>FECHA</Text>
                        <Text style={styles.infoValue}>{fecha.toUpperCase()}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>ESTADO</Text>
                        <Text style={styles.infoValue}>{pedido.estado.toUpperCase()}</Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>CLIENTE</Text>
                        <Text style={styles.infoValue}>{(pedido.nombreFactura || "").toUpperCase()}</Text>
                        <Text style={{ ...styles.infoValue, fontSize: 9, marginTop: 2 }}>
                            {(pedido.tipoDocumento || "").toUpperCase()}: {(pedido.numeroDoc || "").toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.infoBox}>
                        <Text style={styles.infoLabel}>COLABORADORES ASIGNADOS</Text>
                        <Text style={styles.infoValue}>{colaboradores}</Text>
                    </View>
                    {pedido.numeroOperacion && pedido.numeroOperacion !== "012345678" && (
                        <View style={styles.infoBox}>
                            <Text style={styles.infoLabel}>NRO. OPERACIÓN</Text>
                            <Text style={{ ...styles.infoValue, fontWeight: "bold" }}>{pedido.numeroOperacion.toUpperCase()}</Text>
                        </View>
                    )}
                    <View style={styles.infoBoxFull}>
                        <Text style={styles.infoLabel}>DATOS DE ENVÍO</Text>
                        <Text style={styles.infoValue}>{metodoEnvioLabel.toUpperCase()}</Text>
                        {pedido.metodoEnvio === "tienda" && pedido.tienda && (
                            <>
                                <Text style={styles.infoValue}>TIENDA: {(pedido.tienda.nombre || "").toUpperCase()}</Text>
                                <Text style={styles.infoValue}>DIR: {(pedido.tienda.direccion || "").toUpperCase()}</Text>
                            </>
                        )}
                        {pedido.direccion && <Text style={styles.infoValue}>DIR: {pedido.direccion.toUpperCase()}</Text>}
                        {(pedido.departamento || pedido.provincia || pedido.distrito) && (
                            <Text style={styles.infoValue}>
                                UBI: {[pedido.departamento, pedido.provincia, pedido.distrito].filter(Boolean).join(" - ").toUpperCase()}
                            </Text>
                        )}
                        {pedido.nombreRecibe && (
                            <Text style={styles.infoValue}>
                                RECIBE: {pedido.nombreRecibe.toUpperCase()} {pedido.dniRecibe ? `(DNI: ${pedido.dniRecibe})` : ""}
                            </Text>
                        )}
                        {pedido.celularRecibe && <Text style={styles.infoValue}>CELULAR: {pedido.celularRecibe}</Text>}
                    </View>
                </View>

                {pedido.motivoRechazo && pedido.estado === "rechazado" && (
                    <View style={styles.rechazoBox}>
                        <Text style={{ ...styles.infoLabel, color: "#cc0000" }}>PEDIDO RECHAZADO</Text>
                        <Text style={{ ...styles.infoValue, color: "#cc0000" }}>{pedido.motivoRechazo}</Text>
                    </View>
                )}

                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={{ ...styles.colNum, ...styles.thText }}>#</Text>
                        <Text style={{ ...styles.colNombre, ...styles.thText }}>PRODUCTO</Text>
                        <Text style={{ ...styles.colCat, ...styles.thText }}>CATEGORÍA</Text>
                        <Text style={{ ...styles.colCant, ...styles.thText }}>CANTIDAD</Text>
                        <Text style={{ ...styles.colPrecio, ...styles.thText }}>PRECIO</Text>
                        <Text style={{ ...styles.colTotal, ...styles.thText }}>TOTAL</Text>
                    </View>
                    {productos.map((p, i) => (
                        <View key={i}>
                            <View style={styles.tableRow}>
                                <Text style={styles.colNum}>{i + 1}</Text>
                                <Text style={styles.colNombre}>{p.nombre.toUpperCase()}</Text>
                                <Text style={styles.colCat}>{(p.categoria || "N/A").toUpperCase()}</Text>
                                <Text style={styles.colCant}>{p.cantidad.toUpperCase()}{p.metraje ? ` (${p.metraje.toUpperCase()})` : ""}</Text>
                                <Text style={styles.colPrecio}>{p.precio.toUpperCase()}</Text>
                                <Text style={styles.colTotal}>S/ {p.total.toFixed(2)}</Text>
                            </View>
                            {p.indicaciones && (
                                <View style={styles.tableRowAlt}>
                                    <Text style={{ width: "100%" }}>L» INDICACIONES DE CORTE: {p.indicaciones.toUpperCase()}</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text>SUBTOTAL:</Text>
                        <Text>S/ {(pedido.total - pedido.costoEnvio).toFixed(2)}</Text>
                    </View>
                    {pedido.costoEnvio > 0 && (
                        <View style={styles.totalRow}>
                            <Text>COSTO DE ENVÍO:</Text>
                            <Text>S/ {pedido.costoEnvio.toFixed(2)}</Text>
                        </View>
                    )}
                    <View style={{ ...styles.totalRow, ...styles.grandTotal }}>
                        <Text>TOTAL A PAGAR:</Text>
                        <Text>S/ {pedido.total.toFixed(2)}</Text>
                    </View>
                    {(() => {
                        const pagado = extraerTotalPagado(pedido.notas)
                        const falta = Number(pedido.total) - pagado
                        if (falta > 0.01) {
                            return (
                                <View style={{ ...styles.totalRow, borderTop: "1 dashed #cc0000", marginTop: 4, paddingTop: 4 }}>
                                    <Text style={{ color: "#cc0000", fontWeight: "bold", fontSize: 13 }}>FALTA PAGAR:</Text>
                                    <Text style={{ color: "#cc0000", fontWeight: "bold", fontSize: 13 }}>S/ {falta.toFixed(2)}</Text>
                                </View>
                            )
                        }
                        return null
                    })()}
                </View>

                {pedido.notas && (
                    <View style={styles.notasBox}>
                        <Text style={styles.infoLabel}>OBSERVACIONES</Text>
                        <Text style={styles.infoValue}>{pedido.notas.toUpperCase()}</Text>
                    </View>
                )}

                <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
                    `Pedido ${pedido.numeroOrden} — Página ${pageNumber} de ${totalPages}`
                )} fixed />
            </Page>
        </Document>
    )
}
