"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { CarteraTab } from "./cartera-tab"
import { NuevoMovimientoModal } from "./nuevo-movimiento-modal"

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
    clienteId: string
    open: boolean
    onClose: () => void
}

export function DetalleClienteModal({ clienteId, open, onClose }: Props) {
    const [cartera, setCartera] = useState<CarteraData | null>(null)
    const [clienteNombre, setClienteNombre] = useState("")
    const [loading, setLoading] = useState(false)
    const [nuevoMovimientoOpen, setNuevoMovimientoOpen] = useState(false)
    const [carteraRefreshKey, setCarteraRefreshKey] = useState(0)

    const fetchCartera = useCallback(() => {
        if (!clienteId) return
        setLoading(true)
        fetch(`/api/clientes-pedido/${clienteId}/cartera`, {
            credentials: "include",
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.success) {
                    setCartera(data.cartera)
                    setClienteNombre(data.cliente?.nombre || "")
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [clienteId])

    useEffect(() => {
        if (!open) return
        fetchCartera()
    }, [open, fetchCartera, carteraRefreshKey])

    if (!open) return null

    return (
        <>
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-slate-200 shrink-0">
                        <h2 className="text-lg font-bold text-slate-900">
                            Cartera de cliente
                            {clienteNombre && <span className="ml-2 font-normal text-slate-500">— {clienteNombre}</span>}
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <CarteraTab
                                cartera={cartera || { id: null, saldo: 0, movimientos: [] }}
                                clientePedidoId={clienteId}
                                onNuevoMovimiento={() => setNuevoMovimientoOpen(true)}
                                onRefresh={() => setCarteraRefreshKey(k => k + 1)}
                            />
                        )}
                    </div>
                </div>
            </div>

            <NuevoMovimientoModal
                clienteId={clienteId}
                open={nuevoMovimientoOpen}
                onClose={() => {
                    setNuevoMovimientoOpen(false)
                    setCarteraRefreshKey(k => k + 1)
                }}
            />
        </>
    )
}
