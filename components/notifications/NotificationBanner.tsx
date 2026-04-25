"use client"

import { useState, useEffect } from "react"
import { Bell, X, AlertTriangle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Notificacion {
    id: string
    tipo: string
    titulo: string
    mensaje: string
    leida: boolean
    pedidoId: string | null
}

interface Props {
    pedidoId?: string
}

export function NotificationBanner({ pedidoId }: Props) {
    const router = useRouter()
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
    const [dismissed, setDismissed] = useState<string[]>([])

    useEffect(() => {
        fetchNotificaciones()
    }, [])

    const fetchNotificaciones = async () => {
        try {
            const res = await fetch("/api/notificaciones", { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                setNotificaciones(json.notificaciones)
            }
        } catch (e) {
            console.error("Error fetching notificaciones:", e)
        }
    }

    const marcarLeida = async (id: string) => {
        try {
            await fetch("/api/notificaciones", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
                credentials: "include"
            })
            setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n))
        } catch (e) {
            console.error("Error marking as read:", e)
        }
    }

    const sinLeer = notificaciones.filter(n => !n.leida && n.tipo === "metraje_confirmado")
    const relevantes = pedidoId 
        ? sinLeer.filter(n => n.pedidoId === pedidoId)
        : sinLeer

    if (relevantes.length === 0) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-transparent">
            <div className="max-w-4xl mx-auto">
                {relevantes.map((notif) => (
                    <div 
                        key={notif.id}
                        className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-2xl p-6 text-white animate-pulse-slow"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    ¡{notif.titulo}!
                                </h3>
                                <p className="text-white/90 text-lg mb-3">
                                    {notif.mensaje}
                                </p>
                                <div className="flex items-center gap-3">
                                    <Button
                                        onClick={() => {
                                            marcarLeida(notif.id)
                                            router.push("/dashboard/pedidos")
                                        }}
                                        className="bg-white text-green-700 hover:bg-green-50 font-bold"
                                    >
                                        <ArrowRight className="h-4 w-4 mr-2" />
                                        Continuar con el Pago
                                    </Button>
                                    <button
                                        onClick={() => setDismissed(prev => [...prev, notif.id])}
                                        className="text-white/70 hover:text-white text-sm flex items-center gap-1"
                                    >
                                        <X className="h-4 w-4" />
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function NotificationBadge() {
    const [count, setCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)

    useEffect(() => {
        fetchCount()
        const interval = setInterval(fetchCount, 30000)
        return () => clearInterval(interval)
    }, [])

    const fetchCount = async () => {
        try {
            const res = await fetch("/api/notificaciones", { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                setCount(json.sinLeer)
            }
        } catch (e) {
            console.error("Error fetching count:", e)
        }
    }

    if (count === 0) return null

    return (
        <Link href="/dashboard/notificaciones">
            <div className="relative">
                <Bell className="h-6 w-6 text-slate-600 hover:text-slate-900 cursor-pointer" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                </span>
            </div>
        </Link>
    )
}