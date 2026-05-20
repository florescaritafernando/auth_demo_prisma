"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Star, X } from "lucide-react"

interface Props {
    pedidoId: string
    numeroOrden: string
    onClose: () => void
    onSubmit: (data: { calificacion: number; comentario: string; etiquetas: string[] }) => Promise<void>
}

const ETIQUETAS_DISPONIBLES = [
    "Buena atención al cliente",
    "Excelente",
    "Muy buena calidad",
    "Muy buen precio",
    "Muy buen servicio",
    "Buena comunicación"
]

export function FeedbackModal({ pedidoId, numeroOrden, onClose, onSubmit }: Props) {
    const [calificacion, setCalificacion] = useState(0)
    const [comentario, setComentario] = useState("")
    const [etiquetasSeleccionadas, setEtiquetasSeleccionadas] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const toggleEtiqueta = (etiqueta: string) => {
        setEtiquetasSeleccionadas(prev =>
            prev.includes(etiqueta)
                ? prev.filter(e => e !== etiqueta)
                : [...prev, etiqueta]
        )
    }

    const handleSubmit = async () => {
        if (calificacion === 0) {
            setError("Por favor selecciona una calificación")
            return
        }

        setLoading(true)
        setError("")

        try {
            await onSubmit({
                calificacion,
                comentario,
                etiquetas: etiquetasSeleccionadas
            })
        } catch (e: any) {
            setError(e.message || "Error al enviar feedback")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
                    <span className="font-bold text-white">Califica tu pedido</span>
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4">
                    <p className="text-sm text-slate-600 mb-4">
                        Tu pedido <span className="font-semibold">{numeroOrden}</span> ha sido completado.
                        Por favor califica tu experiencia.
                    </p>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Calificación <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((estrella) => (
                                <button
                                    key={estrella}
                                    type="button"
                                    onClick={() => setCalificacion(estrella)}
                                    className="p-1"
                                >
                                    <Star
                                        className={`h-8 w-8 ${estrella <= calificacion ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            {calificacion === 0 ? "Selecciona una calificación" :
                                calificacion === 1 ? "Muy insatisfecho" :
                                    calificacion === 2 ? "Insatisfecho" :
                                        calificacion === 3 ? "Regular" :
                                            calificacion === 4 ? "Satisfecho" : "Muy satisfecho"}
                        </p>
                    </div>

                    <div className="mb-4">
                        <label className="block color-black text-sm font-medium text-slate-700 mb-2">
                            Comentario (opcional)
                        </label>
                        <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Cuéntanos tu experiencia..."
                            className="w-full border border-slate-300 rounded-lg p-3 text-sm resize-none text-black"
                            rows={3}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Etiquetas (opcional)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ETIQUETAS_DISPONIBLES.map((etiqueta) => (
                                <button
                                    key={etiqueta}
                                    type="button"
                                    onClick={() => toggleEtiqueta(etiqueta)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${etiquetasSeleccionadas.includes(etiqueta)
                                        ? "bg-green-100 text-green-700 border border-green-300"
                                        : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                                        }`}
                                >
                                    {etiqueta}
                                </button>
                            ))}
                        </div>
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
                            className="flex-1 bg-green-600 hover:bg-green-700"
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