"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { CarteraTab } from "./cartera-tab"
import { NuevoMovimientoModal } from "./nuevo-movimiento-modal"

interface ClienteData {
    id: string
    nombre: string
    tipoDoc: string
    numeroDoc: string
    telefono: string | null
    direccion: string | null
}

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

const getTipoDocLabel = (tipo: string) => {
    switch (tipo) {
        case "dni": return "DNI"
        case "ruc": return "RUC"
        case "ce": return "CE"
        default: return tipo
    }
}

export function DetalleClienteModal({ clienteId, open, onClose }: Props) {
    const [tab, setTab] = useState<"datos" | "cartera">("datos")
    const [cliente, setCliente] = useState<ClienteData | null>(null)
    const [cartera, setCartera] = useState<CarteraData | null>(null)
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
                    setCliente(data.cliente)
                    setCartera(data.cartera)
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [clienteId])

    useEffect(() => {
        if (!open) return
        setTab("datos")
        fetchCartera()
    }, [open, fetchCartera, carteraRefreshKey])

    if (!open) return null

    const tabs = [
        { key: "datos" as const, label: "Datos" },
        { key: "cartera" as const, label: "Cartera" },
    ]

    return (
        <>
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-slate-200 shrink-0">
                        <h2 className="text-lg font-bold text-slate-900">Detalle del Cliente</h2>
                        <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex border-b border-slate-200 shrink-0">
                        {tabs.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                                    tab === t.key
                                        ? "text-slate-900 border-b-2 border-slate-900"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 overflow-y-auto flex-1">
                        {loading ? (
                            <div className="flex items-center justify-center h-32">
                                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                            </div>
                        ) : tab === "datos" && cliente ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Nombre</p>
                                        <p className="text-sm text-slate-900 font-medium">{cliente.nombre}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Documento</p>
                                        <p className="text-sm text-slate-900">
                                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-medium mr-1">
                                                {getTipoDocLabel(cliente.tipoDoc)}
                                            </span>
                                            {cliente.numeroDoc}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Telefono</p>
                                        <p className="text-sm text-slate-900">{cliente.telefono || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-medium">Direccion</p>
                                        <p className="text-sm text-slate-900">{cliente.direccion || "-"}</p>
                                    </div>
                                </div>
                            </div>
                        ) : tab === "cartera" ? (
                            <CarteraTab
                                cartera={cartera || { id: null, saldo: 0, movimientos: [] }}
                                onNuevoMovimiento={() => setNuevoMovimientoOpen(true)}
                            />
                        ) : null}
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
