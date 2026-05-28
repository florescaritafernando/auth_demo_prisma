"use client"

import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react"

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
    onNuevoMovimiento: () => void
}

export function CarteraTab({ cartera, onNuevoMovimiento }: Props) {
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
                <button
                    onClick={onNuevoMovimiento}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo Movimiento
                </button>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
                {cartera.movimientos.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-sm">
                        No hay movimientos registrados
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 border-b border-slate-200">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase">Fecha</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase">Tipo</th>
                                <th className="px-3 py-2 text-right text-xs font-bold text-slate-700 uppercase">Monto</th>
                                <th className="px-3 py-2 text-right text-xs font-bold text-slate-700 uppercase">Saldo</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase">Concepto</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase">Metodo</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase">Empresa</th>
                                <th className="px-3 py-2 text-left text-xs font-bold text-slate-700 uppercase">Comprobante</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {cartera.movimientos.map((mov) => (
                                <tr key={mov.id} className="hover:bg-slate-50">
                                    <td className="px-3 py-2 text-xs text-slate-600 whitespace-nowrap">
                                        {formatDate(mov.createdAt)}
                                    </td>
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
                                    <td className={`px-3 py-2 text-right font-medium whitespace-nowrap ${
                                        mov.saldoNuevo >= 0 ? "text-green-600" : "text-red-600"
                                    }`}>
                                        S/ {mov.saldoNuevo.toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2 text-slate-600 max-w-[150px] truncate">
                                        {mov.concepto || "-"}
                                    </td>
                                    <td className="px-3 py-2 text-slate-600 text-xs">
                                        {mov.metodoPago || "-"}
                                    </td>
                                    <td className="px-3 py-2 text-slate-600 text-xs">
                                        {mov.empresa || "-"}
                                    </td>
                                    <td className="px-3 py-2">
                                        {mov.comprobante ? (
                                            <a
                                                href={mov.comprobante}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-xs"
                                            >
                                                Ver
                                            </a>
                                        ) : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
