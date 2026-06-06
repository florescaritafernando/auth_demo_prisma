"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DollarSign, Wallet, CheckCircle, AlertTriangle, X } from "lucide-react"

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
    const [tipoPago, setTipoPago] = useState<"completo" | "dividido" | "parcial" | "">("")
    const [detallesPago, setDetallesPago] = useState<{ monto: string; empresa: string; metodoPago: string }[]>([
        { monto: "", empresa: "", metodoPago: "" },
        { monto: "", empresa: "", metodoPago: "" }
    ])
    const [showDetallePagoModal, setShowDetallePagoModal] = useState(false)
    const [detalleEditandoIdx, setDetalleEditandoIdx] = useState<number | null>(null)
    const [pagoParcialTexto, setPagoParcialTexto] = useState("")
    const [guardandoPago, setGuardandoPago] = useState(false)
    const [saldoCartera, setSaldoCartera] = useState(0)
    const [carteraMovimientosCount, setCarteraMovimientosCount] = useState(0)
    const [usarSaldoCartera, setUsarSaldoCartera] = useState(false)
    const [carteraMontoCustom, setCarteraMontoCustom] = useState(0)
    const [carteraInputText, setCarteraInputText] = useState("")
    const [cargandoCartera, setCargandoCartera] = useState(false)

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
        if (!isOpen || !pedido.clientePedidoId) return
        setUsarSaldoCartera(false)
        setCargandoCartera(true)
        setTipoPago("")
        setPagoParcialTexto("")
        setDetallesPago([{ monto: "", empresa: "", metodoPago: "" }, { monto: "", empresa: "", metodoPago: "" }])
        setCarteraMontoCustom(0)
        setCarteraInputText("")
        fetch(`/api/clientes-pedido/${pedido.clientePedidoId}/cartera`, { credentials: "include" })
            .then(r => r.json())
            .then(data => {
                if (data.success && data.cartera) {
                    setSaldoCartera(Math.round((data.cartera.saldo || 0) * 100) / 100)
                    setCarteraMovimientosCount(data.cartera.movimientos?.length || 0)
                } else {
                    setSaldoCartera(0)
                    setCarteraMovimientosCount(0)
                }
            })
            .catch(() => { setSaldoCartera(0); setCarteraMovimientosCount(0) })
            .finally(() => setCargandoCartera(false))
    }, [isOpen, pedido.clientePedidoId, pedido.id])

    const carteraActiva = usarSaldoCartera && saldoCartera > 0 && (tipoPago === "completo" || tipoPago === "dividido" || tipoPago === "parcial")
    const carteraUsada = carteraActiva ? Math.min(carteraMontoCustom, saldoCartera, faltaPagar) : 0
    const faltaPagarEfectiva = Math.max(0, faltaPagar - carteraUsada)
    const mostrarCarteraCheckbox = saldoCartera > 0 && carteraMovimientosCount > 1

    const reset = () => {
        setTipoPago("")
        setPagoParcialTexto("")
        setDetallesPago([{ monto: "", empresa: "", metodoPago: "" }, { monto: "", empresa: "", metodoPago: "" }])
        setUsarSaldoCartera(false)
        setCarteraMontoCustom(0)
        setCarteraInputText("")
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
                        {pedido.clientePedidoId && saldoCartera > 0 && (
                            <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Wallet className="h-4 w-4 text-blue-600" />
                                        <p className="text-sm font-medium text-blue-800">
                                            Saldo a favor: <span className="font-bold">S/ {saldoCartera.toFixed(2)}</span>
                                            {cargandoCartera && <span className="text-xs text-blue-500 ml-2">Cargando...</span>}
                                        </p>
                                    </div>
                                    {mostrarCarteraCheckbox && (
                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                            <input type="checkbox" checked={usarSaldoCartera} onChange={(e) => {
                                                setUsarSaldoCartera(e.target.checked)
                                                if (e.target.checked && tipoPago === "dividido") {
                                                    setDetallesPago([{ monto: "", empresa: "", metodoPago: "" }])
                                                }
                                                if (!e.target.checked) {
                                                    setCarteraMontoCustom(0)
                                                    setCarteraInputText("")
                                                    if (tipoPago === "dividido") {
                                                        setDetallesPago([
                                                            { monto: "", empresa: "", metodoPago: "" },
                                                            { monto: "", empresa: "", metodoPago: "" }
                                                        ])
                                                    }
                                                }
                                            }} className="sr-only" />
                                            <div className={`w-10 h-5 rounded-full transition-colors duration-200 ${usarSaldoCartera ? "bg-blue-600" : "bg-slate-300"}`}>
                                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${usarSaldoCartera ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                                            </div>
                                            <span className="text-sm font-medium text-blue-700">Usar saldo</span>
                                        </label>
                                    )}
                                </div>
                                {usarSaldoCartera && tipoPago !== "completo" && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-sm font-medium text-slate-600 whitespace-nowrap">Saldo a usar:</span>
                                        <span className="text-sm font-medium text-slate-500">S/</span>
                                        <input
                                            type="text" inputMode="decimal"
                                            value={carteraInputText}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                                                    setCarteraInputText(val)
                                                    setCarteraMontoCustom(val === "" ? 0 : Math.min(Number(val), saldoCartera, faltaPagar))
                                                }
                                            }}
                                            placeholder="0.00"
                                            className="w-24 px-3 py-1.5 border-2 border-blue-300 rounded-lg text-sm text-blue-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                        />
                                        {carteraMontoCustom > 0 && (
                                            <span className="text-xs text-blue-600">
                                                {carteraUsada >= faltaPagar ? "Cubre el total" : `Restan S/ ${faltaPagarEfectiva.toFixed(2)}`}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        <div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setTipoPago("completo")
                                        setPagoParcialTexto("")
                                        if (usarSaldoCartera) { setCarteraMontoCustom(Math.min(saldoCartera, faltaPagar)); setCarteraInputText("") }
                                        const emp = pedido.pedidoEmpleadoInfo?.empresa || ""
                                        const mp = pedido.pedidoEmpleadoInfo?.metodoPago || ""
                                        setDetallesPago([{ monto: "", empresa: emp, metodoPago: mp }])
                                    }}
                                    className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all flex-1 ${tipoPago === "completo" ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"}`}
                                >
                                    PAGO COMPLETO
                                </button>
                                <button
                                    onClick={() => { setTipoPago("dividido"); setPagoParcialTexto(""); setCarteraMontoCustom(0); setDetallesPago(usarSaldoCartera ? [{ monto: "", empresa: "", metodoPago: "" }] : [{ monto: "", empresa: "", metodoPago: "" }, { monto: "", empresa: "", metodoPago: "" }]) }}
                                    className={`px-4 py-2 border-2 rounded-lg text-sm font-medium transition-all flex-1 ${tipoPago === "dividido" ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"}`}
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
                                {tipoPago === "completo" && carteraActiva && saldoCartera >= faltaPagar ? (
                                    <div className="p-3 rounded-lg border bg-blue-50 border-blue-200 text-blue-800 text-sm font-medium">
                                        <CheckCircle className="h-4 w-4 inline mr-1" /> Cubierto por saldo cartera
                                    </div>
                                ) : tipoPago === "completo" && carteraActiva && saldoCartera < faltaPagar ? (
                                    <div className="p-3 rounded-lg border bg-amber-50 border-amber-300 text-amber-800 text-sm font-medium">
                                        <AlertTriangle className="h-4 w-4 inline mr-1" /> Saldo no cubre el pago completo, selecciona otra opción
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {(tipoPago === "completo" || tipoPago === "parcial"
                                            ? [{ monto: tipoPago === "completo" ? faltaPagarEfectiva.toFixed(2) : detallesPago[0]?.monto || "", empresa: detallesPago[0]?.empresa || "", metodoPago: detallesPago[0]?.metodoPago || "" }]
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
                                                    className={`w-24 px-3 py-2 border-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white ${tipoPago === "completo" ? "border-emerald-300 bg-emerald-50" : tipoPago === "parcial" ? "border-amber-300" : "border-slate-200"}`}
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
                                                            ? "bg-emerald-600 border-emerald-600 text-white"
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
                                                        onClick={() => { if (detallesPago.length > (usarSaldoCartera ? 1 : 2)) setDetallesPago(detallesPago.filter((_, i) => i !== idx)) }}
                                                        disabled={detallesPago.length <= (usarSaldoCartera ? 1 : 2)}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        <X className="h-4 w-4 text-red-900" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {tipoPago === "dividido" && (
                                    <button
                                        onClick={() => setDetallesPago([...detallesPago, { monto: "", empresa: "", metodoPago: "" }])}
                                        className="mt-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
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
                                            className={`w-full px-3 py-2 border-2 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white ${tipoPago === "parcial" ? "border-slate-200 focus:ring-amber-500" : "border-slate-200 focus:ring-emerald-500"}`}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        {tipoPago === "dividido" && (
                            (() => {
                                const suma = detallesPago.reduce((acc, d) => acc + (Number(d.monto) || 0), 0)
                                const totalConCartera = suma + carteraUsada
                                const coincide = Math.abs(totalConCartera - faltaPagar) < 0.01
                                return (
                                    <div className={`p-3 rounded-lg border text-sm font-medium ${coincide ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span>Total: <strong>S/ {faltaPagar.toFixed(2)}</strong></span>
                                            {carteraActiva && carteraUsada > 0 && (
                                                <span>| Saldo a usar: <strong>S/ {carteraUsada.toFixed(2)}</strong></span>
                                            )}
                                            <span>| {carteraActiva ? `Restan S/ ` : `Total ingresado: S/ `}<strong>{carteraActiva ? Math.max(0, faltaPagarEfectiva - suma).toFixed(2) : suma.toFixed(2)}</strong></span>
                                            {coincide ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle className="h-4 w-4" /> Coincide con la deuda</span>
                                            ) : (
                                                suma > 0 && (
                                                    <span className="text-red-600">(Diferencia: S/ {Math.abs(faltaPagar - totalConCartera).toFixed(2)})</span>
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
                                const totalPagando = montoLinea + (carteraActiva ? carteraUsada : 0)
                                const saldoPorPagar = Math.max(0, faltaPagar - totalPagando)
                                return totalPagando > 0 ? (
                                    <div className="p-3 rounded-lg border text-sm font-medium bg-amber-50 border-amber-200 text-amber-800">
                                        <p>
                                            Pago parcial{carteraActiva && carteraUsada > 0 ? ` (Cartera: S/ ${carteraUsada.toFixed(2)}${montoLinea > 0 ? ` + S/ ${montoLinea.toFixed(2)}` : ""})` : ""}: <span className="font-bold">S/ {totalPagando.toFixed(2)}</span>
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
                                    if (carteraActiva) {
                                        textoPago += ` (SALDO CARTERA)`
                                    } else if (det?.empresa) {
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
                                    const totalPagado = monto + (carteraActiva ? carteraUsada : 0)
                                    const d = new Date()
                                    const fecha = `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`
                                    let detalleStr = ""
                                    if (carteraActiva && carteraUsada > 0) {
                                        detalleStr = `SALDO CARTERA S/ ${carteraUsada.toFixed(2)}`
                                    }
                                    if (monto > 0) {
                                        if (detalleStr) detalleStr += ` + `
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
                                    textoPago = `PAGO: Parcial - S/ ${totalPagado.toFixed(2)} (${detalleStr}) - ${fecha}`
                                    if (pagoParcialTexto.trim()) {
                                        textoPago += ` - Detalle: ${pagoParcialTexto.trim()}`
                                    }
                                } else {
                                    const suma = detallesPago.reduce((acc, d) => acc + (Number(d.monto) || 0), 0)
                                    if (Math.abs(suma - faltaPagarEfectiva) >= 0.01) {
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
                                    const totalPagado = suma + carteraUsada
                                    textoPago = carteraActiva
                                        ? `PAGO: Dividido - SALDO CARTERA S/ ${carteraUsada.toFixed(2)}${suma > 0 ? ` + ${detallesStr}` : ""} = S/ ${totalPagado.toFixed(2)}`
                                        : `PAGO: Dividido - ${detallesStr} = S/ ${suma.toFixed(2)}`
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
                                if (carteraUsada > 0 && pedido.clientePedidoId) {
                                    try {
                                        await fetch(`/api/clientes-pedido/${pedido.clientePedidoId}/cartera/movimientos`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                tipo: "cargo",
                                                monto: carteraUsada,
                                                concepto: `Pago aplicado a pedido ${pedido.numeroOrden}`,
                                                referencia: pedido.numeroOrden,
                                                pedidoId: pedido.id,
                                            }),
                                            credentials: "include",
                                        })
                                    } catch (e) {
                                        console.error("Error registrando movimiento de cartera:", e)
                                    }
                                }
                                if ((pedido.cargoDeuda || 0) > 0 && pedido.clientePedidoId) {
                                    try {
                                        await fetch(`/api/clientes-pedido/${pedido.clientePedidoId}/cartera/movimientos`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                tipo: "abono",
                                                monto: pedido.cargoDeuda,
                                                concepto: `Pago de deuda incluido en pedido ${pedido.numeroOrden}`,
                                                pedidoId: pedido.id,
                                            }),
                                            credentials: "include",
                                        })
                                    } catch (e) {
                                        console.error("Error abonando deuda en cartera:", e)
                                    }
                                }
                                setGuardandoPago(false)
                                reset()
                                onClose()
                                if (onSuccess) onSuccess()
                                try { new BroadcastChannel("notificaciones").postMessage("refresh") } catch {}
                                window.location.reload()
                            }}
                            disabled={guardandoPago || !tipoPago || (tipoPago !== "completo" && tipoPago !== "dividido" && tipoPago !== "parcial") || (tipoPago === "completo" && !(carteraActiva && saldoCartera >= faltaPagar) && !detallesPago[0]?.metodoPago) || (tipoPago === "parcial" && ((detallesPago[0]?.monto && (!detallesPago[0]?.metodoPago || (detallesPago[0]?.metodoPago !== "EFECTIVO" && !detallesPago[0]?.empresa))) || (!detallesPago[0]?.monto && !carteraActiva))) || (tipoPago === "dividido" && !(carteraActiva && faltaPagarEfectiva === 0) && !detallesPago.every(d => {
                                if (!d.monto) return false
                                if (d.metodoPago === "EFECTIVO") return true
                                return d.empresa && d.metodoPago
                            }))}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9 px-4 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                                            className={`px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all ${detallesPago[detalleEditandoIdx].empresa === emp ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"}`}
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
                                            className={`px-3 py-1.5 border-2 rounded-lg text-sm font-medium transition-all ${detallesPago[detalleEditandoIdx].metodoPago === mp ? "bg-emerald-600 border-emerald-600 text-white shadow-sm" : "border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"}`}
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
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9 px-4 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
