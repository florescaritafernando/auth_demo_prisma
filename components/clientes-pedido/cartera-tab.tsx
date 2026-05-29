"use client"

import { Plus, ArrowUpRight, ArrowDownRight, Eye, X, Upload } from "lucide-react"
import { useState, useEffect } from "react"

interface Movimiento {
    id: string
    tipo: "abono" | "cargo"
    monto: number
    saldoAnterior: number
    saldoNuevo: number
    concepto: string | null
    referencia: string | null
    metodoPago: string | null
    empresa: string | null
    comprobante: string | null
    createdAt: string
    creadoPor?: { name: string } | null
}

interface CarteraData {
    id: string | null
    saldo: number
    movimientos: Movimiento[]
}

interface Props {
    cartera: CarteraData
    clientePedidoId: string
    onNuevoMovimiento: () => void
    onRefresh: () => void
    userRole?: string
}

const EMPRESAS = [
    "FLORES CARITAS",
    "TEXTILES MANCHESTER",
    "MANCHESTERTEX",
    "TEXTILES MEGO",
    "YAPE CARLOS",
    "YAPE ANGEL",
]

const METODOS_PAGO = [
    "TRANSFERENCIA",
    "DEPOSITO",
    "EFECTIVO",
    "YAPE",
    "PLIN",
    "BBVA",
]

export function CarteraTab({ cartera, clientePedidoId, onNuevoMovimiento, onRefresh, userRole }: Props) {
    const [regularizando, setRegularizando] = useState(false)
    const [detalleMov, setDetalleMov] = useState<Movimiento | null>(null)
    const [fechaDesde, setFechaDesde] = useState("")
    const [fechaHasta, setFechaHasta] = useState("")
    const [showRegModal, setShowRegModal] = useState(false)
    const [regMonto, setRegMonto] = useState("")
    const [regConcepto, setRegConcepto] = useState("Regularización manual de deuda")
    const [regReferencia, setRegReferencia] = useState("")
    const [regEmpresa, setRegEmpresa] = useState("")
    const [regMetodoPago, setRegMetodoPago] = useState("")
    const formatMonto = (n: number) =>
        "S/ " + n.toFixed(2)

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const formatDateShort = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        })
    }

    const movimientosFiltrados = cartera.movimientos.filter(mov => {
        const fecha = new Date(mov.createdAt)
        if (fechaDesde && fecha < new Date(fechaDesde)) return false
        if (fechaHasta) {
            const hasta = new Date(fechaHasta)
            hasta.setHours(23, 59, 59, 999)
            if (fecha > hasta) return false
        }
        return true
    })

    // Auto-set metodoPago when empresa is YAPE
    useEffect(() => {
        if (regEmpresa === "YAPE CARLOS" || regEmpresa === "YAPE ANGEL") {
            setRegMetodoPago("YAPE")
        }
    }, [regEmpresa])

    const handleRegularizar = async () => {
        setRegularizando(true)
        try {
            const res = await fetch(`/api/clientes-pedido/${clientePedidoId}/cartera/movimientos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo: "abono",
                    monto: parseFloat(regMonto),
                    concepto: regConcepto || "Regularización manual de deuda",
                    referencia: regReferencia || null,
                    metodoPago: regMetodoPago || null,
                    empresa: regEmpresa || null,
                }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                setShowRegModal(false)
                onRefresh()
            } else {
                alert(json.error || "Error al regularizar")
            }
        } catch (e) {
            console.error("Error:", e)
            alert("Error al regularizar deuda")
        } finally {
            setRegularizando(false)
        }
    }

    const openRegModal = () => {
        setRegMonto(Math.abs(cartera.saldo).toFixed(2))
        setRegConcepto("Regularización manual de deuda")
        setRegReferencia("")
        setRegEmpresa("")
        setRegMetodoPago("")
        setShowRegModal(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <p className="text-sm text-slate-500">Saldo actual</p>
                    <p className={`text-2xl font-bold ${cartera.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatMonto(cartera.saldo)}
                    </p>
                    <p className="text-xs text-slate-400">
                        {cartera.saldo >= 0 ? "A favor del cliente" : "Cliente debe"}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {cartera.saldo < 0 && (
                        <button
                            onClick={openRegModal}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                            Regularizar deuda
                        </button>
                    )}
                    <button
                        onClick={onNuevoMovimiento}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Movimiento
                    </button>
                </div>
            </div>

            {/* Date filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <input
                        type="date"
                        value={fechaDesde}
                        onChange={e => setFechaDesde(e.target.value)}
                        className="flex-1 sm:flex-none border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
                    />
                    <span className="text-xs text-slate-400">—</span>
                    <input
                        type="date"
                        value={fechaHasta}
                        onChange={e => setFechaHasta(e.target.value)}
                        className="flex-1 sm:flex-none border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white"
                    />
                </div>
                {(fechaDesde || fechaHasta) && (
                    <button
                        onClick={() => { setFechaDesde(""); setFechaHasta("") }}
                        className="text-xs text-slate-500 hover:text-slate-700 underline sm:ml-1"
                    >
                        Limpiar
                    </button>
                )}
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
                {movimientosFiltrados.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        {cartera.movimientos.length === 0 ? "No hay movimientos registrados" : "No hay movimientos en este rango"}
                    </div>
                ) : (
                    <>
                        {/* Desktop table */}
                        <div className="hidden sm:block">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 border-b border-slate-200">
                                    <tr>
                                        <th className="w-[90px] px-3 py-2.5 text-left text-xs font-bold text-slate-700 uppercase">Tipo</th>
                                        <th className="w-[110px] px-3 py-2.5 text-right text-xs font-bold text-slate-700 uppercase">Monto</th>
                                        <th className="w-[120px] px-3 py-2.5 text-right text-xs font-bold text-slate-700 uppercase bg-slate-200/60">Saldo</th>
                                        <th className="w-[90px] px-3 py-2.5 text-left text-xs font-bold text-slate-700 uppercase">Fecha</th>
                                        <th className="w-[50px] px-1 py-2.5 text-center text-xs font-bold text-slate-700 uppercase"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {movimientosFiltrados.map((mov) => (
                                        <tr key={mov.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-2">
                                                {mov.tipo === "abono" ? (
                                                    <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                                        <ArrowUpRight className="h-3 w-3" />
                                                        Abono
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">
                                                        <ArrowDownRight className="h-3 w-3" />
                                                        Cargo
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-right font-medium whitespace-nowrap">
                                                <span className={mov.tipo === "abono" ? "text-green-600" : "text-red-600"}>
                                                    {mov.tipo === "abono" ? "+" : "-"}S/ {mov.monto.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className={`px-3 py-2 text-right font-bold whitespace-nowrap bg-slate-50/80 ${
                                                mov.saldoNuevo >= 0 ? "text-green-600" : "text-red-600"
                                            }`}>

                                                S/ {mov.saldoNuevo.toFixed(2)}
                                            </td>
                                            <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap" title={formatDate(mov.createdAt)}>
                                                {formatDateShort(mov.createdAt)}
                                            </td>
                                            <td className="px-1 py-2 text-center">
                                                <button
                                                    onClick={() => setDetalleMov(mov)}
                                                    className="p-1 hover:bg-slate-100 rounded transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="h-3.5 w-3.5 text-slate-500" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile cards */}
                        <div className="sm:hidden space-y-2 p-2">
                            {movimientosFiltrados.map((mov) => (
                                <div key={mov.id} className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                                    <div className="flex items-center justify-between mb-3">
                                        {mov.tipo === "abono" ? (
                                            <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                                Abono
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                <ArrowDownRight className="h-3.5 w-3.5" />
                                                Cargo
                                            </span>
                                        )}
                                        <button
                                            onClick={() => setDetalleMov(mov)}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                            title="Ver detalles"
                                        >
                                            <Eye className="h-4 w-4 text-slate-400" />
                                        </button>
                                    </div>
                                    <div className="flex items-end justify-between mb-2">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-0.5">Monto</p>
                                            <span className={`text-xl font-bold ${mov.tipo === "abono" ? "text-green-600" : "text-red-600"}`}>
                                                {mov.tipo === "abono" ? "+" : "-"}S/ {mov.monto.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-slate-400 mb-0.5">Saldo</p>
                                            <span className={`text-base font-bold ${mov.saldoNuevo >= 0 ? "text-green-700" : "text-red-700"}`}>
                                                S/ {mov.saldoNuevo.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 pt-2 border-t border-slate-100">
                                        <span>{formatDateShort(mov.createdAt)}</span>
                                        {mov.concepto && (
                                            <>
                                                <span className="text-slate-300">·</span>
                                                <span className="truncate">{mov.concepto}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Detalles modal */}
            {detalleMov && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setDetalleMov(null)}>
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <h3 className="font-bold text-slate-900 text-sm">Detalles del movimiento</h3>
                            <button onClick={() => setDetalleMov(null)} className="p-1 hover:bg-slate-100 rounded">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>
                        <div className="p-4 space-y-3 text-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Tipo</span>
                                <span className={`font-medium ${detalleMov.tipo === "abono" ? "text-green-600" : "text-red-600"}`}>
                                    {detalleMov.tipo === "abono" ? "Abono" : "Cargo"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Monto</span>
                                <span className={`font-bold ${detalleMov.tipo === "abono" ? "text-green-600" : "text-red-600"}`}>
                                    {detalleMov.tipo === "abono" ? "+" : "-"}S/ {detalleMov.monto.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Saldo anterior</span>
                                <span className={detalleMov.saldoAnterior >= 0 ? "text-green-600" : "text-red-600"}>
                                    S/ {detalleMov.saldoAnterior.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Saldo nuevo</span>
                                <span className={`font-medium ${detalleMov.saldoNuevo >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    S/ {detalleMov.saldoNuevo.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Fecha</span>
                                <span className="text-slate-700">{formatDate(detalleMov.createdAt)}</span>
                            </div>
                            {detalleMov.concepto && (
                                <div className="pt-2 border-t border-slate-100">
                                    <p className="text-xs text-slate-500 mb-0.5">Concepto</p>
                                    <p className="text-slate-700">{detalleMov.concepto}</p>
                                </div>
                            )}
                            {detalleMov.referencia && (
                                <div>
                                    <p className="text-xs text-slate-500 mb-0.5">Referencia</p>
                                    <p className="text-slate-700">{detalleMov.referencia}</p>
                                </div>
                            )}
                            {detalleMov.metodoPago && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Método</span>
                                    <span className="text-slate-700">{detalleMov.metodoPago}</span>
                                </div>
                            )}
                            {detalleMov.empresa && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Empresa</span>
                                    <span className="text-slate-700">{detalleMov.empresa}</span>
                                </div>
                            )}
                            {detalleMov.comprobante && (
                                <div className="pt-2 border-t border-slate-100">
                                    <a
                                        href={detalleMov.comprobante}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"
                                    >
                                        Ver comprobante →
                                    </a>
                                </div>
                            )}
                            {userRole === "admin" && detalleMov.creadoPor?.name && (
                                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                    <span className="text-slate-500">Responsable</span>
                                    <span className="text-slate-700">{detalleMov.creadoPor.name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Regularizar modal */}
            {showRegModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => !regularizando && setShowRegModal(false)}>
                    <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white">
                            <h2 className="text-lg font-bold text-slate-900">Regularizar deuda</h2>
                            <button onClick={() => setShowRegModal(false)} disabled={regularizando} className="p-1 hover:bg-slate-100 rounded text-slate-600 disabled:opacity-30">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4 space-y-4 text-slate-900">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
                                <ArrowDownRight className="h-5 w-5 text-red-500 shrink-0" />
                                <div>
                                    <p className="text-xs text-red-600 font-medium">Deuda actual</p>
                                    <p className="text-lg font-bold text-red-700">{formatMonto(Math.abs(cartera.saldo))}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Monto *</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">S/</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        max={Math.abs(cartera.saldo)}
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                        value={regMonto}
                                        onChange={(e) => setRegMonto(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Concepto</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    value={regConcepto}
                                    onChange={(e) => setRegConcepto(e.target.value)}
                                    placeholder="Ej: Regularización manual de deuda"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Referencia</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    value={regReferencia}
                                    onChange={(e) => setRegReferencia(e.target.value)}
                                    placeholder="Ej: ORD-2026-XXXX o nota"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700">Empresa</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                        value={regEmpresa}
                                        onChange={(e) => setRegEmpresa(e.target.value)}
                                    >
                                        <option value="">Seleccionar</option>
                                        {EMPRESAS.map(e => (
                                            <option key={e} value={e}>{e}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-slate-700">Metodo de Pago</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                        value={regMetodoPago}
                                        onChange={(e) => setRegMetodoPago(e.target.value)}
                                    >
                                        <option value="">Seleccionar</option>
                                        {METODOS_PAGO.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setShowRegModal(false)}
                                    disabled={regularizando}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 disabled:opacity-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleRegularizar}
                                    disabled={regularizando || !regMonto || parseFloat(regMonto) <= 0 || parseFloat(regMonto) > Math.abs(cartera.saldo)}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                                >
                                    {regularizando ? "Guardando..." : "Guardar"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
