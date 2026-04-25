"use client"

import { useState, useEffect } from "react"
import { Bell, Check, CheckCheck, Package, AlertTriangle, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface Notificacion {
    id: string
    tipo: string
    titulo: string
    mensaje: string
    leida: boolean
    createdAt: string
    pedido: { numeroOrden: string; estado: string } | null
}

const TIPO_ICONS: Record<string, any> = {
    metraje_confirmado: AlertTriangle,
    pedido_estado: Package,
    sistema: Bell
}

const TIPO_COLORS: Record<string, string> = {
    metraje_confirmado: "bg-green-100 text-green-700",
    pedido_estado: "bg-blue-100 text-blue-700",
    sistema: "bg-slate-100 text-slate-700"
}

export default function NotificacionesPage() {
    const router = useRouter()
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
    const [loading, setLoading] = useState(true)
    const [markingAll, setMarkingAll] = useState(false)

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
        } finally {
            setLoading(false)
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

    const marcarTodasLeidas = async () => {
        setMarkingAll(true)
        try {
            await fetch("/api/notificaciones", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ marcarTodasLeidas: true }),
                credentials: "include"
            })
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })))
        } catch (e) {
            console.error("Error marking all as read:", e)
        } finally {
            setMarkingAll(false)
        }
    }

    const sinLeer = notificaciones.filter(n => !n.leida).length

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(hours / 24)
        
        if (hours < 1) return "Hace unos minutos"
        if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`
        if (days < 7) return `Hace ${days} día${days > 1 ? "s" : ""}`
        return date.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })
    }

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Mis Notificaciones</h1>
                        <p className="text-slate-500 mt-1">Historial de alertas del sistema</p>
                    </div>
                    {sinLeer > 0 && (
                        <Button
                            variant="outline"
                            onClick={marcarTodasLeidas}
                            disabled={markingAll}
                            className="text-slate-600"
                        >
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Marcar todas leídas ({sinLeer})
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <Clock className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
                        <p className="text-slate-500">Cargando notificaciones...</p>
                    </div>
                ) : notificaciones.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">Sin notificaciones</h2>
                        <p className="text-slate-500">Te avisaremos cuando haya novedades en tus pedidos.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notificaciones.map((notif) => {
                            const Icon = TIPO_ICONS[notif.tipo] || Bell
                            const colorClass = TIPO_COLORS[notif.tipo] || TIPO_COLORS.sistema
                            
                            return (
                                <div 
                                    key={notif.id}
                                    className={`bg-white rounded-xl border ${notif.leida ? "border-slate-200" : "border-yellow-300 ring-1 ring-yellow-100"} p-4 transition-all`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className={`font-bold text-slate-900 ${notif.leida ? "" : "text-lg"}`}>
                                                    {notif.titulo}
                                                </h3>
                                                {!notif.leida && (
                                                    <span className="w-2 h-2 bg-yellow-500 rounded-full shrink-0" />
                                                )}
                                            </div>
                                            
                                            <p className="text-sm text-slate-600 mt-1">
                                                {notif.mensaje}
                                            </p>
                                            
                                            {notif.pedido && (
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="text-xs text-slate-500">
                                                        Pedido: {notif.pedido.numeroOrden}
                                                    </span>
                                                </div>
                                            )}
                                            
                                            <div className="mt-2 flex items-center justify-between">
                                                <span className="text-xs text-slate-400">
                                                    {formatDate(notif.createdAt)}
                                                </span>
                                                
                                                <div className="flex items-center gap-2">
                                                    {notif.pedido && notif.tipo === "metraje_confirmado" && !notif.leida && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => router.push("/dashboard/pedidos")}
                                                            className="bg-green-600 hover:bg-green-700 text-xs"
                                                        >
                                                            Ir a Pedidos
                                                            <ArrowRight className="h-3 w-3 ml-1" />
                                                        </Button>
                                                    )}
                                                    {!notif.leida && (
                                                        <button
                                                            onClick={() => marcarLeida(notif.id)}
                                                            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
                                                        >
                                                            <Check className="h-3 w-3" />
                                                            Marcar leída
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}