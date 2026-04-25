"use client"

import { useState } from "react"
import { Package, AlertTriangle, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PopupMetrajeProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    itemsPieza: Array<{
        id: string
        nombre: string
        cantidad: number
        categoria: string
    }>
}

export function PopupMetraje({ isOpen, onClose, onConfirm, itemsPieza }: PopupMetrajeProps) {
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onConfirm()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Orden de compra requiere
                        </h2>
                        <p className="text-sm text-slate-500">
                            metraje exacto de piezas
                        </p>
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-sm text-slate-600 mb-3">
                        Los siguientes artículos requieren metraje exacto:
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                        {itemsPieza.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                                <span className="font-medium text-slate-800">{item.nombre}</span>
                                <span className="text-slate-500">{item.cantidad} piezas</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button 
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                        disabled={loading}
                    >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleConfirm}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                        disabled={loading}
                    >
                        {loading ? "Registrando..." : (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Registrar solicitud
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}