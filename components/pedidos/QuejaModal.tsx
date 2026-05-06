"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

interface Props {
    pedidoId?: string
    numeroOrden?: string
    onClose: () => void
    onSubmit: (data: { tipo: string; descripcion: string; detalle_pedido: string }) => Promise<void>
}

export function QuejaModal({ pedidoId, numeroOrden, onClose, onSubmit }: Props) {
    const [tipo, setTipo] = useState<"queja" | "reclamo">("queja")
    const [descripcion, setDescripcion] = useState("")
    const [detalle_pedido, setDetallePedido] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async () => {
        if (descripcion.length < 10) {
            setError("La descripción debe tener al menos 10 caracteres")
            return
        }

        setLoading(true)
        setError("")

        try {
            await onSubmit({
                tipo,
                descripcion,
                detalle_pedido
            })
        } catch (e: any) {
            setError(e.message || "Error al enviar")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="bg-red-500 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-white" />
                        <span className="font-bold text-white">Registrar Queja/Reclamo</span>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4">
                    {numeroOrden && (
                        <p className="text-sm text-slate-600 mb-4">
                            Pedido: <span className="font-semibold">{numeroOrden}</span>
                        </p>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tipo de reporte
                        </label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setTipo("queja")}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${tipo === "queja"
                                        ? "bg-orange-100 text-orange-700 border-orange-300"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                    }`}
                            >
                                Queja
                                <span className="block text-xs font-normal text-slate-500 mt-1">
                                    Atención o servicio
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setTipo("reclamo")}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${tipo === "reclamo"
                                        ? "bg-red-100 text-red-700 border-red-300"
                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                    }`}
                            >
                                Reclamo
                                <span className="block text-xs font-normal text-slate-500 mt-1">
                                    Producto o servicio
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Descripción <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder={
                                tipo === "queja"
                                    ? "Describe el problema con la atención o servicio..."
                                    : "Describe el problema con el producto o servicio..."
                            }
                            className="w-full border border-slate-300 rounded-lg p-3 text-black text-sm resize-none"
                            rows={4}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Mínimo 10 caracteres ({descripcion.length}/10)
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Detalle adicional sobre el pedido (opcional)
                        </label>
                        <textarea
                            value={detalle_pedido}
                            onChange={(e) => setDetallePedido(e.target.value)}
                            placeholder="Agrega detalles específicos sobre el problema..."
                            className="w-full border border-slate-300 rounded-lg p-3 text-black text-sm resize-none"
                            rows={2}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 mb-3">{error}</p>
                    )}

                    <div className="flex gap-3">
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex-1 bg-red-500 hover:bg-red-600"
                            disabled={loading}
                        >
                            {loading ? "Enviando..." : "Enviar"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}