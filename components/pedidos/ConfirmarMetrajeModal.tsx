"use client"

import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

interface ArticuloFaltante {
    nombre: string
    solicitado: number
    registrado: number
}

interface Props {
    articulosFaltantes: ArticuloFaltante[]
    onConfirm: () => void
    onCancel: () => void
}

export function ConfirmarMetrajeModal({ articulosFaltantes, onConfirm, onCancel }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
                <div className="bg-yellow-500 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-white" />
                        <span className="font-bold text-white">Confirmar metraje</span>
                    </div>
                    <button onClick={onCancel} className="text-white/80 hover:text-white">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-4">
                    <p className="text-sm text-slate-600 mb-4">
                        El cliente solicitó más piezas de las que has registrado. ¿Quieres confirmar el metraje igualmente?
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-left text-slate-500 border-b">
                                    <th className="pb-2">Artículo</th>
                                    <th className="pb-2 text-center">Solicitado</th>
                                    <th className="pb-2 text-center">Registrado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {articulosFaltantes.map((articulo, idx) => (
                                    <tr key={idx} className="border-b border-slate-100">
                                        <td className="py-2 font-medium">{articulo.nombre}</td>
                                        <td className="py-2 text-center text-red-600">{articulo.solicitado}</td>
                                        <td className="py-2 text-center text-green-600">{articulo.registrado}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex gap-3">
                        <Button onClick={onCancel} variant="outline" className="flex-1">Cancelar</Button>
                        <Button onClick={onConfirm} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white">Sí, continuar</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}