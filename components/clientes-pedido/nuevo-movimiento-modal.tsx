"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"

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

function extraerTotalPagado(notas: string | null): number {
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

interface PedidoOption {
    id: string
    numeroOrden: string
    total: number
    notas: string | null
    restante: number
}

interface Props {
    clienteId: string
    open: boolean
    onClose: () => void
}

export function NuevoMovimientoModal({ clienteId, open, onClose }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [tipo, setTipo] = useState<"abono" | "cargo">("abono")
    const [monto, setMonto] = useState("")
    const [concepto, setConcepto] = useState("")
    const [referencia, setReferencia] = useState("")
    const [metodoPago, setMetodoPago] = useState("")
    const [empresa, setEmpresa] = useState("")
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [pedidos, setPedidos] = useState<PedidoOption[]>([])
    const [pedidoId, setPedidoId] = useState("")
    const [cargandoPedidos, setCargandoPedidos] = useState(false)

    const resetForm = () => {
        setTipo("abono")
        setMonto("")
        setConcepto("")
        setReferencia("")
        setMetodoPago("")
        setEmpresa("")
        setFile(null)
        setPedidoId("")
        setError("")
        setLoading(false)
        setUploading(false)
    }

    useEffect(() => {
        if (open) resetForm()
    }, [open])

    useEffect(() => {
        if (!open || tipo !== "cargo") {
            setPedidos([])
            setPedidoId("")
            return
        }
        setCargandoPedidos(true)
        Promise.all([
            fetch("/api/pedidos-admin", { credentials: "include" }).then(r => r.json()),
            fetch(`/api/clientes-pedido/${clienteId}/cartera`, { credentials: "include" }).then(r => r.json())
        ])
            .then(([pedidosData, carteraData]) => {
                if (!pedidosData.success) return
                const cargosPorPedido: Record<string, number> = {}
                if (carteraData.success && carteraData.cartera?.movimientos) {
                    for (const mov of carteraData.cartera.movimientos) {
                        if (mov.tipo === "cargo" && mov.pedidoId) {
                            cargosPorPedido[mov.pedidoId] = (cargosPorPedido[mov.pedidoId] || 0) + mov.monto
                        }
                    }
                }
                const filtrados = pedidosData.pedidos
                    .filter((p: any) => p.clientePedidoId === clienteId)
                    .map((p: any) => {
                        const pagado = extraerTotalPagado(p.notas)
                        const cargado = cargosPorPedido[p.id] || 0
                        const restante = Math.max(0, Number(p.total) - pagado - cargado)
                        return {
                            id: p.id,
                            numeroOrden: p.numeroOrden,
                            total: Number(p.total),
                            notas: p.notas,
                            restante,
                        }
                    })
                    .filter((p: PedidoOption) => p.restante > 0)
                setPedidos(filtrados)
            })
            .catch(() => {})
            .finally(() => setCargandoPedidos(false))
    }, [open, tipo, clienteId])

    const handlePedidoSelect = (pedidoId: string) => {
        setPedidoId(pedidoId)
        const pedido = pedidos.find(p => p.id === pedidoId)
        if (pedido) {
            setMonto(pedido.restante.toFixed(2))
            setConcepto(`Cargo por pedido ${pedido.numeroOrden}`)
        }
    }

    if (!open) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const montoNum = parseFloat(monto)
        if (!montoNum || montoNum <= 0) {
            setError("Ingrese un monto valido")
            setLoading(false)
            return
        }

        let comprobanteUrl: string | null = null
        if (file) {
            setUploading(true)
            const formData = new FormData()
            formData.append("file", file)
            formData.append("tipo", "comprobante")

            try {
                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                })
                const uploadData = await uploadRes.json()
                if (!uploadData.success) {
                    setError("Error al subir comprobante")
                    setLoading(false)
                    setUploading(false)
                    return
                }
                comprobanteUrl = uploadData.url
            } catch {
                setError("Error al subir comprobante")
                setLoading(false)
                setUploading(false)
                return
            }
            setUploading(false)
        }

        try {
            const res = await fetch(`/api/clientes-pedido/${clienteId}/cartera/movimientos`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipo,
                    monto: montoNum,
                    concepto: concepto || null,
                    referencia: referencia || null,
                    metodoPago: metodoPago || null,
                    empresa: empresa || null,
                    comprobante: comprobanteUrl,
                    pedidoId: pedidoId || null,
                }),
                credentials: "include",
            })
            const data = await res.json()
            if (data.success) {
                onClose()
                router.refresh()
            } else {
                setError(data.error || "Error al registrar")
            }
        } catch {
            setError("Error de conexion")
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white">
                    <h2 className="text-lg font-bold text-slate-900">Nuevo Movimiento</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 text-slate-900">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Tipo</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setTipo("abono")}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                    tipo === "abono"
                                        ? "bg-green-50 border-green-400 text-green-700"
                                        : "border-slate-300 text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                Abono (A favor)
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipo("cargo")}
                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                    tipo === "cargo"
                                        ? "bg-red-50 border-red-400 text-red-700"
                                        : "border-slate-300 text-slate-600 hover:bg-slate-50"
                                }`}
                            >
                                Cargo (Debe)
                            </button>
                        </div>
                    </div>

                    {tipo === "cargo" && (
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Enlazar Pedido</label>
                            {cargandoPedidos ? (
                                <p className="text-sm text-slate-500">Cargando pedidos...</p>
                            ) : pedidos.length === 0 ? (
                                <p className="text-sm text-slate-500">No hay pedidos pendientes</p>
                            ) : (
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    value={pedidoId}
                                    onChange={(e) => handlePedidoSelect(e.target.value)}
                                >
                                    <option value="">Seleccionar pedido (monto auto)</option>
                                    {pedidos.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.numeroOrden} - S/ {p.restante.toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Monto *</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">S/</span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                value={monto}
                                onChange={(e) => setMonto(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Concepto</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                            value={concepto}
                            onChange={(e) => setConcepto(e.target.value)}
                            placeholder="Ej: Separacion de articulos"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Referencia</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                            value={referencia}
                            onChange={(e) => setReferencia(e.target.value)}
                            placeholder="Ej: ORD-2026-XXXX o nota"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Empresa</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                value={empresa}
                                onChange={(e) => setEmpresa(e.target.value)}
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
                                value={metodoPago}
                                onChange={(e) => setMetodoPago(e.target.value)}
                            >
                                <option value="">Seleccionar</option>
                                {METODOS_PAGO.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Comprobante (opcional)</label>
                        <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                            <Upload className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-600">
                                {file ? file.name : "Subir archivo"}
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*,.pdf"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                            />
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                        >
                            {uploading ? "Subiendo..." : loading ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}