"use client"

import { useState, useEffect, useCallback } from "react"
import { CrearPedidoModal } from "@/components/crear-pedido-modal"
import { X, File, ClipboardList, Pencil, RotateCcw, Trash2, Loader2 } from "lucide-react"

interface Props {
    userName: string
    userRole: string
}

export function DashboardModals({ userName, userRole }: Props) {
    const [showCrearPedido, setShowCrearPedido] = useState(false)
    const [showBorradores, setShowBorradores] = useState(false)
    const [showModificarPedido, setShowModificarPedido] = useState(false)
    const [pedidoAEditar, setPedidoAEditar] = useState<any>(null)
    const [borradores, setBorradores] = useState<{ userName: string; data: any; fecha: string }[]>([])
    const [pedidosAsignados, setPedidosAsignados] = useState<any[]>([])
    const [cargandoPedidos, setCargandoPedidos] = useState(false)

    const esStaff = userRole === "empleado" || userRole === "admin"

    if (!esStaff) return null

    const cargarBorradores = useCallback(() => {
        const lista: { userName: string; data: any; fecha: string }[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith("pedido-borrador-")) {
                try {
                    const data = JSON.parse(localStorage.getItem(key) || "")
                    const uName = key.replace("pedido-borrador-", "")
                    lista.push({ userName: uName, data, fecha: data.fecha || "" })
                } catch (e) {
                    console.error("Error leyendo borrador:", e)
                }
            }
        }
        lista.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        setBorradores(lista)
    }, [])

    const cargarPedidosAsignados = useCallback(async () => {
        setCargandoPedidos(true)
        try {
            const res = await fetch("/api/pedidos-admin", { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                setPedidosAsignados(json.pedidos || [])
            }
        } catch (e) {
            console.error("Error cargando pedidos:", e)
        } finally {
            setCargandoPedidos(false)
        }
    }, [])

    const restaurarBorrador = (uName: string) => {
        const key = `pedido-borrador-${uName}`
        localStorage.setItem("pedido-borrador-restore", key)
        setShowBorradores(false)
        setShowCrearPedido(true)
    }

    const eliminarBorrador = (uName: string) => {
        localStorage.removeItem(`pedido-borrador-${uName}`)
        cargarBorradores()
    }

    useEffect(() => {
        const handleCrearPedido = () => {
            setPedidoAEditar(null)
            setShowCrearPedido(true)
        }
        const handleBorradores = () => {
            cargarBorradores()
            setShowBorradores(true)
        }
        const handleModificarPedido = () => {
            cargarPedidosAsignados()
            setShowModificarPedido(true)
        }

        window.addEventListener("mobile-nav:crear-pedido", handleCrearPedido)
        window.addEventListener("mobile-nav:borradores", handleBorradores)
        window.addEventListener("mobile-nav:modificar-pedido", handleModificarPedido)

        return () => {
            window.removeEventListener("mobile-nav:crear-pedido", handleCrearPedido)
            window.removeEventListener("mobile-nav:borradores", handleBorradores)
            window.removeEventListener("mobile-nav:modificar-pedido", handleModificarPedido)
        }
    }, [cargarBorradores, cargarPedidosAsignados])

    return (
        <>
            <CrearPedidoModal
                isOpen={showCrearPedido}
                onClose={() => { setShowCrearPedido(false); setPedidoAEditar(null) }}
                userName={userName}
                pedidoEditar={pedidoAEditar}
            />

            {showModificarPedido && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModificarPedido(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
                        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Modificar Pedido</h2>
                                <p className="text-xs text-slate-400">Selecciona un pedido que creaste</p>
                            </div>
                            <button onClick={() => setShowModificarPedido(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {cargandoPedidos ? (
                                <div className="flex items-center justify-center py-12 text-slate-400">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <p className="text-sm">Cargando pedidos...</p>
                                </div>
                            ) : pedidosAsignados.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <ClipboardList className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                                    <p className="text-sm">No tienes pedidos asignados pendientes</p>
                                </div>
                            ) : (
                                <div className="p-4 space-y-3">
                                    {pedidosAsignados.map((p) => {
                                        const fecha = new Date(p.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                                        const estadoLabels: Record<string, string> = {
                                            pendiente: "Pago en revisión",
                                            confirmado: "Pago confirmado",
                                            metraje_en_proceso: "Metraje en proceso",
                                            metraje_confirmado: "Metraje confirmado",
                                            pedido_enviado: "En tránsito"
                                        }
                                        return (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setPedidoAEditar(p)
                                                    setShowModificarPedido(false)
                                                    setShowCrearPedido(true)
                                                }}
                                                className="w-full border border-slate-100 rounded-xl p-4 hover:bg-slate-50 hover:border-indigo-200 transition-colors text-left"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 text-sm">{p.numeroOrden}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{fecha}</p>
                                                        <p className="text-sm text-slate-600 mt-1 truncate">{p.nombreFactura || "Sin cliente"}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                                        <span className="inline-flex px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-medium">
                                                            {estadoLabels[p.estado] || p.estado}
                                                        </span>
                                                        <span className="text-sm font-semibold text-slate-900">S/ {Number(p.total).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showBorradores && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowBorradores(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
                        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Mis Borradores</h2>
                                <p className="text-xs text-slate-400">{borradores.length} borrador(es) guardado(s)</p>
                            </div>
                            <button onClick={() => setShowBorradores(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            {borradores.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <File className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                                    <p className="text-sm">No hay borradores guardados</p>
                                </div>
                            ) : (
                                <div className="p-4 space-y-3">
                                    {borradores.map((b, idx) => {
                                        const fecha = new Date(b.fecha).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                        const items = b.data.items || []
                                        const cliente = b.data.cliente?.nombre || "Sin cliente"
                                        const total = items.reduce((sum: number, i: any) => {
                                            const metros = i.tipo === "pieza" ? 50 : 1
                                            return sum + (i.precio * i.cantidad * metros)
                                        }, 0)
                                        return (
                                            <div key={idx} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 text-sm truncate">{cliente}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{fecha}</p>
                                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                                                            <span>{items.length} artículo(s)</span>
                                                            <span className="text-slate-300">•</span>
                                                            <span className="font-medium text-slate-700">S/ {total.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-1 shrink-0">
                                                        <button
                                                            onClick={() => restaurarBorrador(b.userName)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                                                        >
                                                            <RotateCcw className="h-3 w-3" /> Restaurar
                                                        </button>
                                                        <button
                                                            onClick={() => eliminarBorrador(b.userName)}
                                                            className="flex items-center gap-1 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-medium transition-colors"
                                                        >
                                                            <Trash2 className="h-3 w-3" /> Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
