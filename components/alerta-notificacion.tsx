"use client"

import { useState, useEffect } from "react"
import { Bell, X, AlertCircle, CheckCircle } from "lucide-react"

interface Notificacion {
    id: string
    tipo: string
    titulo: string
    mensaje: string
    leida: boolean
    pedido: { numeroOrden: string; total: number } | null
}

interface Props {
    onClose?: () => void
}

export function AlertaNotificacion({ onClose }: Props) {
    const [notificacion, setNotificacion] = useState<Notificacion | null>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const fetchNotif = async () => {
            try {
                const res = await fetch("/api/notificaciones?ultima=true", { credentials: "include" })
                const json = await res.json()
                if (json.success && json.notificaciones?.length > 0) {
                    const ultima = json.notificaciones[0]
                    if (ultima.tipo === "metraje_confirmado" && !ultima.leida) {
                        setNotificacion(ultima)
                        setVisible(true)
                    }
                }
            } catch (e) {
                console.error("Error fetching notificacion:", e)
            }
        }

        fetchNotif()
    }, [])

    const cerrar = async () => {
        setVisible(false)
        if (notificacion) {
            try {
                await fetch("/api/notificaciones", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: notificacion.id }),
                    credentials: "include"
                })
            } catch (e) {
                console.error("Error marking as read:", e)
            }
        }
        onClose?.()
    }

    if (!visible || !notificacion) return null

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-in slide-in-from-right duration-300">
            <div className="bg-green-50 border border-green-200 rounded-xl shadow-lg p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-green-800">{notificacion.titulo}</h3>
                            <button
                                onClick={cerrar}
                                className="text-green-600 hover:text-green-800 p-1"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                            {notificacion.mensaje}
                        </p>
                        {notificacion.pedido && (
                            <p className="text-xs text-green-600 mt-2">
                                Pedido: {notificacion.pedido.numeroOrden}
                            </p>
                        )}
                        {notificacion.pedido && (
                            <p className="text-xs text-green-600 mt-2">
                                Total: S/{notificacion.pedido.total.toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}