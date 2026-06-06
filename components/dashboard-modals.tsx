"use client"

import Image from "next/image"
import { useState, useEffect, useCallback } from "react"
import { CrearPedidoModal } from "@/components/crear-pedido-modal"
import { X, File, ClipboardList, Pencil, RotateCcw, Trash2, Loader2, Search, DollarSign, Printer, Calendar } from "lucide-react"

interface Props {
    userName: string
    userRole: string
}

interface BorradorItem {
    id: string
    userName: string
    cliente: any
    items: any[]
    fecha: string
}

export function DashboardModals({ userName, userRole }: Props) {
    const [showCrearPedido, setShowCrearPedido] = useState(false)
    const [showBorradores, setShowBorradores] = useState(false)
    const [showModificarPedido, setShowModificarPedido] = useState(false)
    const [pedidoAEditar, setPedidoAEditar] = useState<any>(null)
    const [borradorRestaurarId, setBorradorRestaurarId] = useState<string | null>(null)
    const [borradores, setBorradores] = useState<BorradorItem[]>([])
    const [pedidosAsignados, setPedidosAsignados] = useState<any[]>([])
    const [busquedaPedido, setBusquedaPedido] = useState("")
    const [cargandoPedidos, setCargandoPedidos] = useState(false)
    const [cargandoBorradorList, setCargandoBorradorList] = useState(false)

    const [showModalYapes, setShowModalYapes] = useState(false)
    const [yapeTab, setYapeTab] = useState<"resumen" | "nuevo">("nuevo")
    const [yapesFechaInicio, setYapesFechaInicio] = useState("")
    const [yapesFechaFin, setYapesFechaFin] = useState("")
    const [generandoYapes, setGenerandoYapes] = useState(false)

    const [nuevoYapeNombre, setNuevoYapeNombre] = useState("")
    const [nuevoYapeMonto, setNuevoYapeMonto] = useState("")
    const [nuevoYapeFecha, setNuevoYapeFecha] = useState(() => new Date().toISOString().split("T")[0])
    const [agregandoYape, setAgregandoYape] = useState(false)
    const [escuchando, setEscuchando] = useState<string | false>(false)
    const [yapeSuccessMsg, setYapeSuccessMsg] = useState("")
    const [ultimoYapeNombre, setUltimoYapeNombre] = useState("")
    const [ultimoYapeMonto, setUltimoYapeMonto] = useState("")

    const iniciarReconocimiento = (campo: "nombre" | "monto") => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert("Reconocimiento de voz no soportado en este navegador. Usá Chrome o Edge.")
            return
        }

        const recognition = new SpeechRecognition()
        recognition.lang = "es-PE"
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        setEscuchando(campo)

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript.trim()
            if (campo === "nombre") {
                setNuevoYapeNombre(transcript)
            } else {
                const soloNumeros = transcript.replace(/[^0-9.]/g, "")
                setNuevoYapeMonto(soloNumeros)
            }
            setEscuchando(false)
        }

        recognition.onerror = () => {
            setEscuchando(false)
        }

        recognition.onend = () => {
            setEscuchando(false)
        }

        recognition.start()
    }

    const esStaff = userRole === "empleado" || userRole === "admin"

    const abrirCrearPedido = () => {
        setShowBorradores(false)
        setShowModificarPedido(false)
        setShowCrearPedido(true)
    }

    const abrirBorradores = () => {
        setShowCrearPedido(false)
        setShowModificarPedido(false)
        setShowBorradores(true)
    }

    const abrirModificarPedido = () => {
        setShowCrearPedido(false)
        setShowBorradores(false)
        setShowModificarPedido(true)
    }

    const cargarBorradores = useCallback(async () => {
        setCargandoBorradorList(true)
        try {
            const res = await fetch("/api/borrador-pedido", { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                const lista: BorradorItem[] = (json.borradores || []).map((b: any) => ({
                    id: b.id,
                    userName: b.user?.name || "Desconocido",
                    cliente: b.cliente,
                    items: Array.isArray(b.items) ? b.items : [],
                    fecha: b.updatedAt || b.createdAt
                }))
                lista.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                setBorradores(lista)
            }
        } catch (e) {
            console.error("Error cargando borradores:", e)
        } finally {
            setCargandoBorradorList(false)
        }
    }, [])

    const cargarPedidosAsignados = useCallback(async () => {
        if (!esStaff) return
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
    }, [esStaff])

    const restaurarBorrador = (id: string) => {
        setBorradorRestaurarId(id)
        setShowBorradores(false)
        setShowCrearPedido(true)
    }

    const eliminarBorrador = async (id: string) => {
        try {
            await fetch(`/api/borrador-pedido?id=${id}`, { method: "DELETE", credentials: "include" })
            cargarBorradores()
        } catch (e) {
            console.error("Error eliminando borrador:", e)
        }
    }

    useEffect(() => {
        const handleCrearPedido = () => {
            setPedidoAEditar(null)
            abrirCrearPedido()
        }
        const handleBorradores = () => {
            cargarBorradores()
            abrirBorradores()
        }
        const handleModificarPedido = () => {
            cargarPedidosAsignados()
            abrirModificarPedido()
        }

        const handleYapes = () => {
            setShowModalYapes(true)
        }

        window.addEventListener("mobile-nav:crear-pedido", handleCrearPedido)
        window.addEventListener("mobile-nav:borradores", handleBorradores)
        window.addEventListener("mobile-nav:modificar-pedido", handleModificarPedido)
        window.addEventListener("mobile-nav:yapes", handleYapes)

        return () => {
            window.removeEventListener("mobile-nav:crear-pedido", handleCrearPedido)
            window.removeEventListener("mobile-nav:borradores", handleBorradores)
            window.removeEventListener("mobile-nav:modificar-pedido", handleModificarPedido)
            window.removeEventListener("mobile-nav:yapes", handleYapes)
        }
    }, [cargarBorradores, cargarPedidosAsignados])

    return (
        <>
            <CrearPedidoModal
                isOpen={showCrearPedido}
                onClose={() => { setShowCrearPedido(false); setPedidoAEditar(null); setBorradorRestaurarId(null) }}
                userName={userName}
                pedidoEditar={pedidoAEditar}
                borradorRestaurarId={borradorRestaurarId}
            />

            {esStaff && showModificarPedido && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModificarPedido(false)} />
                    <div className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[80vh]">
                        <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Modificar Pedido</h2>
                                <p className="text-xs text-slate-400">{userRole === "admin" ? "Selecciona un pedido" : "Selecciona un pedido que creaste"}</p>
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
                            ) : (
                                <div className="p-4 space-y-3">
                                    {/* Búsqueda */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={busquedaPedido}
                                            onChange={(e) => setBusquedaPedido(e.target.value)}
                                            placeholder="Buscar por nombre de cliente..."
                                            className="w-full pl-10 pr-10 py-2.5 border-2 border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white"
                                        />
                                        {busquedaPedido && (
                                            <button
                                                onClick={() => setBusquedaPedido("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                    {(() => {
                                        const pedidosFiltrados = pedidosAsignados.filter(p => {
                                            if (!busquedaPedido) return true
                                            const nombre = p.nombreFactura || p.clientePedido?.nombre || ""
                                            return nombre.toLowerCase().includes(busquedaPedido.toLowerCase())
                                        })
                                        if (pedidosFiltrados.length === 0) {
                                            return (
                                                <div className="text-center py-12 text-slate-400">
                                                    <Search className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                                                    <p className="text-sm">No se encontraron pedidos</p>
                                                </div>
                                            )
                                        }
                                        return pedidosFiltrados.map((p) => {
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
                                    })})()}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {esStaff && showBorradores && (
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
                            {cargandoBorradorList ? (
                                <div className="flex items-center justify-center py-12 text-slate-400">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <p className="text-sm">Cargando borradores...</p>
                                </div>
                            ) : borradores.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <File className="h-10 w-10 mx-auto mb-3 text-slate-200" />
                                    <p className="text-sm">No hay borradores guardados</p>
                                </div>
                            ) : (
                                <div className="p-4 space-y-3">
                                    {borradores.map((b) => {
                                        const fecha = new Date(b.fecha).toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                                        const items = b.items || []
                                        const cliente = b.cliente?.nombre || "Sin cliente"
                                        const total = items.reduce((sum: number, i: any) => {
                                            const precio = Number(i.precio ?? i.productoPrecio ?? 0)
                                            const cantidad = Number(i.cantidad ?? 0)
                                            const metros = i.tipo === "pieza" ? 50 : 1
                                            return sum + (precio * cantidad * metros)
                                        }, 0)
                                        return (
                                            <div key={b.id} className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors">
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
                                                            onClick={() => restaurarBorrador(b.id)}
                                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                                                        >
                                                            <RotateCcw className="h-3 w-3" /> Restaurar
                                                        </button>
                                                        <button
                                                            onClick={() => eliminarBorrador(b.id)}
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

            {/* Modal YAPES */}
            {showModalYapes && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowModalYapes(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">YAPES</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Generar PDF o registrar nuevo YAPE</p>
                            </div>
                            <button onClick={() => setShowModalYapes(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-100 px-5">
                            <button
                                onClick={() => setYapeTab("resumen")}
                                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${yapeTab === "resumen" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                            >
                                <Printer className="h-4 w-4 inline mr-1.5" />
                                Generar resumen
                            </button>
                            <button
                                onClick={() => setYapeTab("nuevo")}
                                className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${yapeTab === "nuevo" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                            >
                                <DollarSign className="h-4 w-4 inline mr-1.5" />
                                Nuevo registro
                            </button>
                        </div>

                        {/* Tab: Generar resumen */}
                        {yapeTab === "resumen" && (
                            <>
                                <div className="p-5 space-y-5">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha inicio</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="date"
                                                    value={yapesFechaInicio}
                                                    onChange={(e) => setYapesFechaInicio(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha fin</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="date"
                                                    value={yapesFechaFin}
                                                    onChange={(e) => setYapesFechaFin(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
                                    <button onClick={() => setShowModalYapes(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={async () => {
                                            setGenerandoYapes(true)
                                            try {
                                                const res = await fetch("/api/yapes-pdf", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        fechaInicio: yapesFechaInicio || undefined,
                                                        fechaFin: yapesFechaFin || undefined,
                                                    }),
                                                })
                                                if (!res.ok) {
                                                    const err = await res.json()
                                                    alert(err.error || "Error al generar PDF")
                                                    return
                                                }
                                                const blob = await res.blob()
                                                const url = URL.createObjectURL(blob)
                                                window.open(url, "_blank")
                                            } catch (err) {
                                                alert(err instanceof Error ? err.message : "Error de conexión")
                                            } finally {
                                                setGenerandoYapes(false)
                                            }
                                        }}
                                        disabled={generandoYapes}
                                        className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-emerald-200"
                                    >
                                        {generandoYapes ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Generando...
                                            </>
                                        ) : (
                                            <>
                                                <Printer className="h-4 w-4" />
                                                Generar PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Tab: Nuevo registro */}
                        {yapeTab === "nuevo" && (
                            <>
                                {yapeSuccessMsg && (
                                    <div className="absolute inset-0 z-10 flex items-start justify-center pt-16 bg-white/80 backdrop-blur-sm rounded-2xl">
                                        <style>{`
                                            @keyframes yape-logo-pop {
                                                0% { transform: scale(0) rotate(-20deg); opacity: 0; }
                                                60% { transform: scale(1.15) rotate(3deg); opacity: 1; }
                                                100% { transform: scale(1) rotate(0deg); opacity: 1; }
                                            }
                                            @keyframes yape-sparkle {
                                                0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
                                                50% { opacity: 1; transform: scale(1) rotate(180deg); }
                                            }
                                            @keyframes yape-bounce-in {
                                                0% { opacity: 0; transform: scale(0.3) translateY(20px); }
                                                50% { transform: scale(1.05) translateY(-2px); }
                                                100% { opacity: 1; transform: scale(1) translateY(0); }
                                            }
                                            @keyframes yape-slide-up {
                                                0% { opacity: 0; transform: translateY(30px); }
                                                100% { opacity: 1; transform: translateY(0); }
                                            }
                                            @keyframes yape-glow {
                                                0%, 100% { box-shadow: 0 0 5px rgba(147,51,234,0.3); }
                                                50% { box-shadow: 0 0 20px rgba(147,51,234,0.6), 0 0 40px rgba(147,51,234,0.2); }
                                            }
                                            .yape-particle {
                                                position: absolute;
                                                width: 6px;
                                                height: 6px;
                                                border-radius: 50%;
                                                animation: yape-sparkle 1.5s ease-in-out infinite;
                                            }
                                        `}</style>
                                        <div className="relative bg-gradient-to-br from-purple-50 via-white to-purple-100 border-2 border-purple-300 rounded-2xl px-8 py-7 text-center shadow-2xl shadow-purple-200/50 animate-[yape-bounce-in_0.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards] max-w-xs w-full mx-4">
                                            {/* Sparkles (purple theme) */}
                                            <div className="yape-particle bg-purple-400" style={{ top: '12%', left: '10%', animationDelay: '0.1s' }} />
                                            <div className="yape-particle bg-purple-300" style={{ top: '8%', right: '15%', animationDelay: '0.3s' }} />
                                            <div className="yape-particle bg-fuchsia-400" style={{ bottom: '20%', left: '8%', animationDelay: '0.5s' }} />
                                            <div className="yape-particle bg-purple-500" style={{ bottom: '10%', right: '10%', animationDelay: '0.7s', width: '4px', height: '4px' }} />
                                            <div className="yape-particle bg-fuchsia-300" style={{ top: '50%', left: '5%', animationDelay: '0.2s', width: '5px', height: '5px' }} />
                                            <div className="yape-particle bg-purple-400" style={{ top: '30%', right: '6%', animationDelay: '0.6s', width: '5px', height: '5px' }} />

                                            {/* Yape logo circle */}
                                            <div className="mx-auto mb-4 w-16 h-16 relative animate-[yape-logo-pop_0.6s_cubic-bezier(0.34,1.56,0.64,1)_0.15s_both]">
                                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full shadow-lg shadow-purple-300/50 animate-[yape-glow_2s_ease-in-out_infinite] overflow-hidden p-0.5">
                                                    <div className="w-full h-full relative rounded-full overflow-hidden">
                                                        <Image src="/images/yape_logo.png" alt="Yape" fill sizes="64px" className="object-cover" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Success text */}
                                            <p className="font-bold text-purple-800 text-lg animate-[yape-slide-up_0.4s_ease-out_0.4s_both]">
                                                {yapeSuccessMsg}
                                            </p>
                                            {ultimoYapeNombre && ultimoYapeMonto && (
                                                <div className="mt-3 space-y-1.5 animate-[yape-slide-up_0.4s_ease-out_0.5s_both]">
                                                    <div className="flex items-center justify-center gap-2 text-sm text-purple-700">
                                                        <span className="font-medium text-purple-400">Yape para:</span>
                                                        <span className="font-bold">{ultimoYapeNombre}</span>
                                                    </div>
                                                    <div className="flex items-center justify-center gap-2 text-sm text-purple-700">
                                                        <span className="font-medium text-purple-400">Monto:</span>
                                                        <span className="font-bold text-purple-900">S/ {parseFloat(ultimoYapeMonto).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="p-5 space-y-5">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label>
                                        <select
                                            value={nuevoYapeNombre}
                                            onChange={(e) => setNuevoYapeNombre(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer text-sm max-sm:text-lg max-sm:font-bold"
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="Carlos" className="font-bold">Carlos</option>
                                            <option value="Angel" className="font-bold">Angel</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">S/</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={nuevoYapeMonto}
                                                onChange={(e) => setNuevoYapeMonto(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full pl-8 pr-10 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm max-sm:text-lg max-sm:font-bold"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => iniciarReconocimiento("monto")}
                                                className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${escuchando === "monto" ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-slate-100 text-slate-400"}`}
                                                title="Dictar por voz"
                                            >
                                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                                    <line x1="12" y1="19" x2="12" y2="23" />
                                                    <line x1="8" y1="23" x2="16" y2="23" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                            <input
                                                type="date"
                                                value={nuevoYapeFecha}
                                                onChange={(e) => setNuevoYapeFecha(e.target.value)}
                                                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm max-sm:text-lg max-sm:font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
                                    <button onClick={() => {
                                        setNuevoYapeNombre("")
                                        setNuevoYapeMonto("")
                                        setNuevoYapeFecha(new Date().toISOString().split("T")[0])
                                        setYapeTab("resumen")
                                    }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (!nuevoYapeNombre.trim() || !nuevoYapeMonto) return
                                            setAgregandoYape(true)
                                            try {
                                                const res = await fetch("/api/yapes/nuevo", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        nombre: nuevoYapeNombre.trim(),
                                                        monto: parseFloat(nuevoYapeMonto),
                                                        fecha: nuevoYapeFecha,
                                                    }),
                                                })
                                                if (!res.ok) {
                                                    const err = await res.json()
                                                    alert(err.error || "Error al registrar YAPE")
                                                    return
                                                }
                                                setUltimoYapeNombre(nuevoYapeNombre.trim())
                                                setUltimoYapeMonto(nuevoYapeMonto)
                                                setNuevoYapeNombre("")
                                                setNuevoYapeMonto("")
                                                setNuevoYapeFecha(new Date().toISOString().split("T")[0])
                                                setYapeSuccessMsg("YAPE registrado correctamente")
                                                setTimeout(() => setYapeSuccessMsg(""), 3000)
                                            } catch (err) {
                                                alert(err instanceof Error ? err.message : "Error de conexión")
                                            } finally {
                                                setAgregandoYape(false)
                                            }
                                        }}
                                        disabled={!nuevoYapeNombre.trim() || !nuevoYapeMonto || agregandoYape}
                                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-purple-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-purple-200"
                                    >
                                        {agregandoYape ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <DollarSign className="h-4 w-4" />
                                                Registrar YAPE
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
