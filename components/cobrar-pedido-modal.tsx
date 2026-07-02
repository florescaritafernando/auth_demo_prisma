"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DollarSign, X } from "lucide-react"

const EMPRESAS = ["FLORES CARITAS", "TEXTILES MANCHESTER", "MANCHESTERTEX", "TEXTILES MEGO", "YAPE CARLOS", "YAPE ANGEL"]
const METODOS_PAGO = ["TRANSFERENCIA", "DEPOSITO", "EFECTIVO", "YAPE", "PLIN", "BBVA"]

interface PedidoProps {
    id: string
    numeroOrden: string
    estado: string
    total: number
    clientePedidoId?: string | null
    notas?: string | null
    pedidoEmpleadoInfo?: { empresa: string | null; metodoPago: string | null } | null
    cargoDeuda?: number
    [key: string]: any
}

interface Props {
    pedido: PedidoProps
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
    estadoAlCobrar?: string
}

export function CobrarPedidoModal({ pedido, isOpen, onClose, onSuccess, estadoAlCobrar = "confirmado" }: Props) {
    const [tipoPago, setTipoPago] = useState<"completo" | "dividido" | "parcial" | "">("completo")
    const [detallesPago, setDetallesPago] = useState<{ monto: string; empresa: string; metodoPago: string }[]>([
        { monto: "", empresa: "", metodoPago: "EFECTIVO" },
        { monto: "", empresa: "", metodoPago: "" }
    ])
    const [showDetallePagoModal, setShowDetallePagoModal] = useState(false)
    const [detalleEditandoIdx, setDetalleEditandoIdx] = useState<number | null>(null)
    const [pagoParcialTexto, setPagoParcialTexto] = useState("")
    const [guardandoPago, setGuardandoPago] = useState(false)
    // Cartera DESHABILITADA
    const saldoCartera = 0
    const carteraMovimientosCount = 0
    const usarSaldoCartera = false
    const carteraMontoCustom = 0
    const carteraInputText = ""
    const cargandoCartera = false
    const carteraActiva = false
    const carteraUsada = 0
    const faltaPagarEfectiva = 0
    const mostrarCarteraCheckbox = false

    const extraerTotalPagado = (notas: string | null): number => {
        if (!notas) return 0
        let totalPagado = 0
        for (const rawLine of notas.split("\n")) {
            const linea = rawLine.trim()
            if (!linea) continue
            const mCompleto = linea.match(/^PAGO: Completo - S\/\s*([\d.]+)/)
            if (mCompleto) { totalPagado += Number(mCompleto[1]); continue }
            const mDividido = linea.match(/^PAGO: Dividido.*=\s*S\/\s*([\d.]+)/)
            if (mDividido) { totalPagado += Number(mDividido[1]); continue }
            const mParcial = linea.match(/^PAGO: Parcial - S\/\s*([\d.]+)/)
            if (mParcial) totalPagado += Number(mParcial[1])
        }
        return totalPagado
    }

    const totalPagado = extraerTotalPagado(pedido.notas || null)
    const faltaPagar = Math.max(0, Number(pedido.total) - totalPagado)

    useEffect(() => {
        if (!isOpen) return
        setTipoPago("completo")
        setPagoParcialTexto("")
        const empInit = pedido.pedidoEmpleadoInfo?.empresa || ""
        const mpInit = pedido.pedidoEmpleadoInfo?.metodoPago || ""
        setDetallesPago([{ monto: "", empresa: empInit, metodoPago: (empInit || mpInit) ? mpInit : "EFECTIVO" }, { monto: "", empresa: "", metodoPago: "" }])
    }, [isOpen, pedido.id])

    const reset = () => {
        setTipoPago("completo")
        setPagoParcialTexto("")
        setDetallesPago([{ monto: "", empresa: "", metodoPago: "EFECTIVO" }, { monto: "", empresa: "", metodoPago: "" }])
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-slate-900/40" onClick={handleClose} />
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Pagar el pedido: Nro Orden Pedido: {pedido.numeroOrden}</h3>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Total: <span className="font-bold text-slate-900">S/ {Number(pedido.total).toFixed(2)}</span>
                                {totalPagado > 0 && <>, Pagado: <span className="font-bold text-green-700">S/ {totalPagado.toFixed(2)}</span></>}
                                {" | "}<span className="text-red-600 font-bold">Falta: S/ {faltaPagar.toFixed(2)}</span>
                            </p>
                        </div>
                        <button onClick={handleClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-5 overflow-y-auto flex-1 space-y-4">
                        <div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setTipoPago("completo")
                                        setPagoParcialTexto("")
                                        const emp = pedido.pedidoEmpleadoInfo?.empresa || ""
                                        const mp = pedido.pedidoEmpleadoInfo?.metodoPago || ""
                                        setDetallesPago([{ monto: "", empresa: emp, metodoPago: mp || (emp ? "" : "EFECTIVO") }])
                                    }}
                                    className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all flex-1 ${tipoPago === "completo" ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`}
                                >
                                    PAGO COMPLETO
                                </button>
                                <button
                                    onClick={() => { setTipoPago("dividido"); setPagoParcialTexto(""); setDetallesPago([{ monto: "", empresa: "", metodoPago: "" }, { monto: "", empresa: "", metodoPago: "" }]) }}
                                    className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all flex-1 ${tipoPago === "dividido" ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`}
                                >
                                    DIVIDIR PAGO
                                </button>
                                <button
                                    onClick={() => { setTipoPago("parcial"); setPagoParcialTexto("") }}
                                    className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all flex-1 ${tipoPago === "parcial" ? "bg-amber-600 border-amber-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-amber-300 hover:bg-amber-50"}`}
                                >
                                    PAGO PARCIAL
                                </button>
                            </div>
                        </div>
                        {(tipoPago === "completo" || tipoPago === "dividido" || tipoPago === "parcial") && (
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">
                                    {tipoPago === "completo" ? "Detalle del pago" : tipoPago === "parcial" ? "Monto del pago parcial" : "Montos"}
                                </p>
                                <div className="space-y-2">
                                    {(tipoPago === "completo" || tipoPago === "parcial"
                                        ? [{ monto: tipoPago === "completo" ? faltaPagar.toFixed(2) : detallesPago[0]?.monto || "", empresa: detallesPago[0]?.empresa || "", metodoPago: detallesPago[0]?.metodoPago || "" }]
                                        : detallesPago
                                    ).map((det, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-slate-500">S/</span>
                                            <input
                                                type="text" inputMode="decimal"
                                                value={det.monto}
                                                onChange={(e) => {
                                                    if (tipoPago === "dividido" || tipoPago === "parcial") {
                                                        const val = e.target.value
                                                        if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                                                            const nuevo = [...detallesPago]
                                                            nuevo[idx] = { ...nuevo[idx], monto: val }
                                                            setDetallesPago(nuevo)
                                                        }
                                                    }
                                                }}
                                                readOnly={tipoPago === "completo"}
                                                placeholder="0.00"
                                                className={`w-24 px-3 py-2 border-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white ${tipoPago === "completo" ? "border-blue-300 bg-blue-50" : tipoPago === "parcial" ? "border-amber-300" : "border-slate-200"}`}
                                            />
                                            <button
                                                onClick={() => {
                                                    if (det.empresa || det.metodoPago) {
                                                        const nuevo = [...detallesPago]
                                                        nuevo[idx] = { ...nuevo[idx], empresa: "", metodoPago: "" }
                                                        setDetallesPago(nuevo)
                                                    } else {
                                                        setDetalleEditandoIdx(idx); setShowDetallePagoModal(true)
                                                    }
                                                }}
                                                className={`px-2 py-1.5 text-xs font-bold border-2 rounded-lg transition-all uppercase ${
                                                    det.empresa || det.metodoPago
                                                        ? "bg-blue-600 border-blue-600 text-white"
                                                        : "bg-red-600 border-red-600 text-white"
                                                }`}
                                            >
                                                {det.empresa
                                                    ? `${det.empresa} / ${det.metodoPago}`
                                                    : det.metodoPago || "Seleccionar Detalle"
                                                }
                                            </button>
                                            {tipoPago === "dividido" && (
                                                <button
                                                    onClick={() => { if (detallesPago.length > 2) setDetallesPago(detallesPago.filter((_, i) => i !== idx)) }}
                                                    disabled={detallesPago.length <= 2}
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <X className="h-4 w-4 text-red-900" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {tipoPago === "dividido" && (
                                    <button
                                        onClick={() => setDetallesPago([...detallesPago, { monto: "", empresa: "", metodoPago: "" }])}
                                        className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        + Agregar
                                    </button>
                                )}
                                {(tipoPago === "completo" || tipoPago === "dividido" || tipoPago === "parcial") && (
                                    <div className="mt-3">
                                        <p className="text-sm font-medium text-slate-700 mb-1">Detalle (opcional)</p>
                                        <input
                                            type="text"
                                            value={pagoParcialTexto}
                                            onChange={(e) => setPagoParcialTexto(e.target.value)}
                                            placeholder="ej. abono de prueba"
                                            className={`w-full px-3 py-2 border-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${tipoPago === "parcial" ? "border-slate-200 focus:ring-amber-500" : "border-slate-200 focus:ring-blue-500"}`}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        {tipoPago === "dividido" && (
                            (() => {
                                const suma = detallesPago.reduce((acc, d) => acc + (Number(d.monto) || 0), 0)
                                const coincide = Math.abs(suma - faltaPagar) < 0.01
                                return (
                                    <div className={`p-3 rounded-lg border text-sm font-medium ${coincide ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span>Total: <strong>S/ {faltaPagar.toFixed(2)}</strong></span>
                                            <span>| Total ingresado: <strong>S/ {suma.toFixed(2)}</strong></span>
                                            {coincide ? (
                                                <span className="inline-flex items-center gap-1 text-blue-700">✓ Coincide con la deuda</span>
                                            ) : (
                                                suma > 0 && (
                                                    <span className="text-red-600">(Diferencia: S/ {Math.abs(faltaPagar - suma).toFixed(2)})</span>
                                                )
                                            )}
                                        </p>
                                    </div>
                                )
                            })()
                        )}
                        {tipoPago === "parcial" && (
                            (() => {
                                const montoLinea = Number(detallesPago[0]?.monto) || 0
                                const saldoPorPagar = Math.max(0, faltaPagar - montoLinea)
                                return montoLinea > 0 ? (
                                    <div className="p-3 rounded-lg border text-sm font-medium bg-amber-50 border-amber-200 text-amber-800">
                                        <p>
                                            Pago parcial: <span className="font-bold">S/ {montoLinea.toFixed(2)}</span>
                                            {" | "}Saldo por pagar: <span className="font-bold">S/ {saldoPorPagar.toFixed(2)}</span>
                                        </p>
                                    </div>
                                ) : null
                            })()
                        )}
                    </div>
                    <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 shrink-0">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <Button
                            onClick={async () => {
                                if (!tipoPago || guardandoPago) return
                                setGuardandoPago(true)
                                let textoPago = ""
                                let cambiarEstado = true
                                if (tipoPago === "completo") {
                                    textoPago = `PAGO: Completo - S/ ${faltaPagar.toFixed(2)}`
                                    const det = detallesPago[0]
                                    if (det?.empresa) {
                                        if (det.empresa === "YAPE CARLOS" || det.empresa === "YAPE ANGEL") {
                                            textoPago += ` (${det.empresa})`
                                        } else {
                                            textoPago += ` (${det.empresa} / ${det.metodoPago})`
                                        }
                                    } else if (det?.metodoPago === "EFECTIVO") {
                                        textoPago += ` (EFECTIVO)`
                                    }
                                    if (pagoParcialTexto.trim()) {
                                        textoPago += ` - Detalle: ${pagoParcialTexto.trim()}`
                                    }
                                } else if (tipoPago === "parcial") {
                                    cambiarEstado = false
                                    const monto = Number(detallesPago[0]?.monto) || 0
                                    const det = detallesPago[0]
                                    const d = new Date()
                                    const fecha = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`
                                    let detalleStr = ""
                                    if (monto > 0) {
                                        if (det?.empresa) {
                                            if (det.empresa === "YAPE CARLOS" || det.empresa === "YAPE ANGEL") {
                                                detalleStr += `${det.empresa}`
                                            } else {
                                                detalleStr += `${det.empresa} / ${det.metodoPago}`
                                            }
                                        } else if (det?.metodoPago === "EFECTIVO") {
                                            detalleStr += `EFECTIVO`
                                        }
                                    }
                                    textoPago = `PAGO: Parcial - S/ ${monto.toFixed(2)} (${detalleStr}) - ${fecha}`
                                    if (pagoParcialTexto.trim()) {
                                        textoPago += ` - Detalle: ${pagoParcialTexto.trim()}`
                                    }
                                } else {
                                    const suma = detallesPago.reduce((acc, d) => acc + (Number(d.monto) || 0), 0)
                                    if (Math.abs(suma - faltaPagar) >= 0.01) {
                                        setGuardandoPago(false)
                                        return
                                    }
                                    const detallesStr = detallesPago
                                        .filter(d => d.monto)
                                        .map(d => {
                                            let s = `S/ ${Number(d.monto).toFixed(2)}`
                                            if (d.empresa) {
                                                if (d.empresa === "YAPE CARLOS" || d.empresa === "YAPE ANGEL") {
                                                    s += ` (${d.empresa})`
                                                } else {
                                                    s += ` (${d.empresa} / ${d.metodoPago})`
                                                }
                                            } else if (d.metodoPago === "EFECTIVO") {
                                                s += ` (EFECTIVO)`
                                            }
                                            return s
                                        })
                                        .join(" + ")
                                    textoPago = `PAGO: Dividido - ${detallesStr} = S/ ${suma.toFixed(2)}`
                                    if (pagoParcialTexto.trim()) {
                                        textoPago += ` - Detalle: ${pagoParcialTexto.trim()}`
                                    }
                                }
                                const currentNotas = (pedido as any).notas || ""
                                const newNotas = currentNotas ? currentNotas + "\n" + textoPago : textoPago
                                try {
                                    await fetch(`/api/pedidos/${pedido.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(cambiarEstado ? { notas: newNotas, estado: estadoAlCobrar } : { notas: newNotas })
                                    })
                                } catch (e) {
                                    console.error("Error guardando pago:", e)
                                }
                                // Cartera DESHABILITADA
                                setGuardandoPago(false)
                                reset()
                                onClose()
                                if (onSuccess) onSuccess()
                                // Notificaciones DESHABILITADAS
                                window.location.reload()
                            }}
                            disabled={guardandoPago || !tipoPago || (tipoPago !== "completo" && tipoPago !== "dividido" && tipoPago !== "parcial") || (tipoPago === "completo" && !detallesPago[0]?.metodoPago) || (tipoPago === "parcial" && (!detallesPago[0]?.monto || (!detallesPago[0]?.metodoPago || (detallesPago[0]?.metodoPago !== "EFECTIVO" && !detallesPago[0]?.empresa)))) || (tipoPago === "dividido" && !detallesPago.every(d => {
                                if (!d.monto) return false
                                if (d.metodoPago === "EFECTIVO") return true
                                return d.empresa && d.metodoPago
                            }))}
                            className="bg-blue-600 text-white text-sm h-9 px-4 rounded-lg font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Confirmar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Sub-modal Detalle de pago */}
            {showDetallePagoModal && detalleEditandoIdx !== null && (
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40" onClick={() => setShowDetallePagoModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
                            <h3 className="text-base font-bold text-slate-900">Detalle de pago #{detalleEditandoIdx + 1}</h3>
                            <button onClick={() => setShowDetallePagoModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-5 overflow-y-auto flex-1 space-y-4">
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Empresa</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {EMPRESAS.map(emp => (
                                        <button
                                            key={emp}
                                            onClick={() => {
                                                const nuevo = [...detallesPago]
                                                const yaSeleccionada = nuevo[detalleEditandoIdx].empresa === emp
                                                const empresaFinal = yaSeleccionada ? "" : emp
                                                const metodo = (emp === "YAPE CARLOS" || emp === "YAPE ANGEL") && !yaSeleccionada ? "YAPE" : yaSeleccionada ? "" : nuevo[detalleEditandoIdx].metodoPago
                                                nuevo[detalleEditandoIdx] = { ...nuevo[detalleEditandoIdx], empresa: empresaFinal, metodoPago: metodo }
                                                setDetallesPago(nuevo)
                                            }}
                                            className={`px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all ${detallesPago[detalleEditandoIdx].empresa === emp ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`}
                                        >
                                            {emp}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Método de Pago</p>
                                <div className="flex flex-wrap gap-2">
                                    {METODOS_PAGO.map(mp => (
                                        <button
                                            key={mp}
                                            onClick={() => {
                                                const nuevo = [...detallesPago]
                                                const mpActual = nuevo[detalleEditandoIdx].metodoPago
                                                nuevo[detalleEditandoIdx] = { ...nuevo[detalleEditandoIdx], metodoPago: mpActual === mp ? "" : mp }
                                                setDetallesPago(nuevo)
                                            }}
                                            className={`px-3 py-1.5 border-2 rounded-lg text-sm font-medium transition-all ${detallesPago[detalleEditandoIdx].metodoPago === mp ? "bg-blue-600 border-blue-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"}`}
                                        >
                                            {mp}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowDetallePagoModal(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <Button
                                onClick={() => {
                                    const det = detallesPago[detalleEditandoIdx]
                                    if (!det.metodoPago || (det.metodoPago !== "EFECTIVO" && !det.empresa)) {
                                        return
                                    }
                                    setShowDetallePagoModal(false)
                                }}
                                disabled={
                                    !detallesPago[detalleEditandoIdx].metodoPago ||
                                    (detallesPago[detalleEditandoIdx].metodoPago !== "EFECTIVO" && !detallesPago[detalleEditandoIdx].empresa)
                                }
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-9 px-4 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Guardar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
