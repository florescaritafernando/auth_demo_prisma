"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface Props {
    pedidoId: string
    numeroOrden: string
    onClose: () => void
    onReject: (motivo: string) => Promise<void>
}

export function RechazarPedidoModal({ pedidoId, numeroOrden, onClose, onReject }: Props) {
    const [motivo, setMotivo] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleReject = async () => {
        if (motivo.length < 5) {
            setError("El motivo debe tener al menos 5 caracteres")
            return
        }
        if (motivo.length > 100) {
            setError("El motivo debe tener máximo 100 caracteres")
            return
        }

        setLoading(true)
        setError("")

        try {
            await onReject(motivo)
        } catch (e: any) {
            setError(e.message || "Error al rechazar")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-black">Rechazar Pedido</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <p className="text-sm text-slate-600 mb-2">
                    Orden: <span className="font-medium">{numeroOrden}</span>
                </p>

                <div className="mb-2">
                    <label className="block text-sm font-medium mb-1 text-black">
                        Motivo de rechazo <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        maxLength={100}
                        className="w-full px-3 py-2 border border-black rounded-lg bg-white text-black resize-none"
                        rows={3}
                        placeholder="Ingresa el motivo del rechazo..."
                    />
                    <p className="text-xs text-slate-500 text-right mt-1">
                        {motivo.length}/100 caracteres
                    </p>
                </div>

                {error && (
                    <p className="text-sm text-red-600 mb-3">{error}</p>
                )}

                <div className="flex gap-3">
                    <Button
                        onClick={onClose}
                        variant="outline"
                        className="flex-1 border-slate-300"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleReject}
                        disabled={loading || motivo.length < 5}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
                    >
                        {loading ? "Procesando..." : "Rechazar"}
                    </Button>
                </div>
            </div>
        </div>
    )
}