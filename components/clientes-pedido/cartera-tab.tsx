"use client"

import { Plus, ArrowUpRight, ArrowDownRight, Eye, X } from "lucide-react"
import { useState } from "react"

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
}

export function CarteraTab({ cartera, clientePedidoId, onNuevoMovimiento, onRefresh }: Props) {
    const [regularizando, setRegularizando] = useState(false)
    const [detalleMov, setDetalleMov] = useState<Movimiento | null>(null)
    const [fechaDesde, setFechaDesde] = useState("")
    const [fechaHasta, setFechaHasta] = useState("")
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

    const handleRegularizar = async () => {
        if (!confirm(`¿Abonar S/ ${Math.abs(cartera.saldo).toFixed(2)} para regularizar la deuda?`)) return
        setRegularizando(true)
        try {
            const res = await fetch(`/api/clientes-pedido/${clientePedidoId}/cartera/movimientos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo: "abono",
                    monto: Math.abs(cartera.saldo),
                    concepto: "Regularización manual de deuda"
                }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-slate-500">Saldo actual</p>
                    <p className={`text-2xl font-bold ${cartera.saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatMonto(cartera.saldo)}
                    </p>
                    <p className="text-xs text-slate-400">
                        {cartera.saldo >= 0 ? "A favor del cliente" : "Cliente debe"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {cartera.saldo < 0 && (
                        <button
                            onClick={handleRegularizar}
                            disabled={regularizando}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                        >
                            {regularizando ? "..." : "Regularizar deuda"}
                        </button>
                    )}
                    <button
                        onClick={onNuevoMovimiento}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Nuevo Movimiento
                    </button>
                </div>
            </div>

            {/* Date filter */}
            <div className="flex items-center gap-2">
                <input
                    type="date"
                    value={fechaDesde}
                    onChange={e => setFechaDesde(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-700 bg-white"
                />
                <span className="text-xs text-slate-400">—</span>
                <input
                    type="date"
                    value={fechaHasta}
                    onChange={e => setFechaHasta(e.target.value)}
                    className="border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-700 bg-white"
                />
                {(fechaDesde || fechaHasta) && (
                    <button
                        onClick={() => { setFechaDesde(""); setFechaHasta("") }}
                        className="text-xs text-slate-500 hover:text-slate-700 underline"
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
                                <div key={mov.id} className="border border-slate-200 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <span>
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
                                        </span>
                                        <button
                                            onClick={() => setDetalleMov(mov)}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                            title="Ver detalles"
                                        >
                                            <Eye className="h-4 w-4 text-slate-400" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={`text-lg font-bold ${mov.tipo === "abono" ? "text-green-600" : "text-red-600"}`}>
                                            {mov.tipo === "abono" ? "+" : "-"}S/ {mov.monto.toFixed(2)}
                                        </span>
                                        <span className={`text-base font-bold ${mov.saldoNuevo >= 0 ? "text-green-700" : "text-red-700"}`}>
                                            S/ {mov.saldoNuevo.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {formatDateShort(mov.createdAt)}
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
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
