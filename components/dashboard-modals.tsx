"use client"

import Image from "next/image"
import { useState, useEffect, useCallback, useRef } from "react"
import { CrearPedidoModal } from "@/components/crear-pedido-modal"
import { X, File, ClipboardList, Pencil, RotateCcw, Trash2, Loader2, Search, DollarSign, Printer, Calendar, Plus, FileText, User, Truck } from "lucide-react"

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

    const [yapeEntries, setYapeEntries] = useState<{ nombre: string; monto: string }[]>([
        { nombre: "", monto: "" }
    ])
    const [nuevoYapeFecha, setNuevoYapeFecha] = useState(() => new Date().toISOString().split("T")[0])
    const [yapeFechaEditando, setYapeFechaEditando] = useState(false)
    const [agregandoYape, setAgregandoYape] = useState(false)
    const [yapeSuccessMsg, setYapeSuccessMsg] = useState("")
    const [ultimoYapeNombre, setUltimoYapeNombre] = useState("")

    const [showModalXml, setShowModalXml] = useState(false)
    const [xmlFile, setXmlFile] = useState<File | null>(null)
    const [formatoXml, setFormatoXml] = useState<"ticket" | "shipping_label">("ticket")
    const [convirtiendoXml, setConvirtiendoXml] = useState(false)
    const [xmlAgencia, setXmlAgencia] = useState("")
    const [xmlAgenciaBusqueda, setXmlAgenciaBusqueda] = useState("")
    const [mostrarDropdownXmlAgencia, setMostrarDropdownXmlAgencia] = useState(false)
    const xmlAgenciaToggleRef = useRef<HTMLButtonElement>(null)
    const [xmlOtraAgencia, setXmlOtraAgencia] = useState("")
    const [xmlNotas, setXmlNotas] = useState("")
    const [xmlRecojeOtraPersona, setXmlRecojeOtraPersona] = useState(false)
    const [xmlRecojeDni, setXmlRecojeDni] = useState("")
    const [xmlRecojeNombre, setXmlRecojeNombre] = useState("")
    const [xmlRecojeDireccion, setXmlRecojeDireccion] = useState("")
    const [showXmlCloseConfirm, setShowXmlCloseConfirm] = useState(false)
    const [xmlMetadata, setXmlMetadata] = useState<{ nombre: string; documento: string; total: number; tipo: string; numero: string } | null>(null)
    const [buscandoDocRecibe, setBuscandoDocRecibe] = useState(false)
    const AGENCIA_OPTIONS = ["ANTEZANA", "SHALOM", "FLORES", "MARVISUR", "GRAEL", "RAZA", "RANA EXPRESS", "CARHUAMAYO", "CESPEDES", "ALTIPLANO", "LIBERTADORES", "EXPRESO TRUJILLO", "ROGGERS", "CARGO SUR", "EMTRAFESA"]

    const checkYapeStatus = async (batchId: string): Promise<{ status: string; results?: { nombre: string; monto: string }[]; error?: string } | null> => {
        try {
            const res = await fetch(`/api/yapes/nuevo?batchId=${batchId}`)
            return await res.json()
        } catch {
            return null
        }
    }

    const addEntry = () => {
        setYapeEntries([...yapeEntries, { nombre: "", monto: "" }])
    }

    const removeEntry = (idx: number) => {
        setYapeEntries(yapeEntries.filter((_, i) => i !== idx))
    }

    const updateEntry = (idx: number, field: "nombre" | "monto", value: string) => {
        const updated = [...yapeEntries]
        updated[idx] = { ...updated[idx], [field]: value }
        setYapeEntries(updated)
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
        const handleClick = (e: MouseEvent) => {
            if (mostrarDropdownXmlAgencia && !(e.target as HTMLElement).closest('[data-xml-agencia-dropdown]') && !(e.target as HTMLElement).closest('[data-xml-agencia-toggle]')) {
                setMostrarDropdownXmlAgencia(false)
            }
        }
        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [mostrarDropdownXmlAgencia])

    const handleCloseXmlModal = () => {
        if (xmlFile) {
            setShowXmlCloseConfirm(true)
            return
        }
        setXmlFile(null)
        setShowModalXml(false)
        setXmlAgenciaBusqueda("")
        setXmlMetadata(null)
    }

    const handleConfirmExitXml = () => {
        setXmlFile(null)
        setShowModalXml(false)
        setShowXmlCloseConfirm(false)
        setXmlAgenciaBusqueda("")
        setXmlMetadata(null)
    }

    const buscarDocRecibe = async () => {
        if (xmlRecojeDni.length < 8) return
        setBuscandoDocRecibe(true)
        try {
            const res = await fetch("/api/buscar-documento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: "dni", numero: xmlRecojeDni })
            })
            const json = await res.json()
            if (json.success) {
                setXmlRecojeNombre(json.nombre || "")
            } else {
                alert("DNI no encontrado")
            }
        } catch {
            alert("Error al buscar DNI")
        } finally {
            setBuscandoDocRecibe(false)
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

        const handleConvertirXml = () => {
            setShowModalXml(true)
        }

        window.addEventListener("mobile-nav:crear-pedido", handleCrearPedido)
        window.addEventListener("mobile-nav:borradores", handleBorradores)
        window.addEventListener("mobile-nav:modificar-pedido", handleModificarPedido)
        window.addEventListener("mobile-nav:yapes", handleYapes)
        window.addEventListener("mobile-nav:convertir-xml", handleConvertirXml)

        return () => {
            window.removeEventListener("mobile-nav:crear-pedido", handleCrearPedido)
            window.removeEventListener("mobile-nav:borradores", handleBorradores)
            window.removeEventListener("mobile-nav:modificar-pedido", handleModificarPedido)
            window.removeEventListener("mobile-nav:yapes", handleYapes)
            window.removeEventListener("mobile-nav:convertir-xml", handleConvertirXml)
        }
    }, [cargarBorradores, cargarPedidosAsignados])

    useEffect(() => {
        if (!showModalYapes) return

        const batchEntries: { key: string; batchId: string; entries: { nombre: string; monto: string }[] }[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith("yape_batch_")) {
                try {
                    const entry = JSON.parse(localStorage.getItem(key)!)
                    if (entry.batchId) batchEntries.push({ key, batchId: entry.batchId, entries: entry.entries || [] })
                    else localStorage.removeItem(key)
                } catch { localStorage.removeItem(key) }
            }
        }

        if (batchEntries.length > 0) {
            ;(async () => {
                const results = await Promise.allSettled(
                    batchEntries.map(e => checkYapeStatus(e.batchId).then(data => ({ ...e, data })))
                )
                const grouped: Record<string, string[]> = {}
                const errors: string[] = []
                let totalConfirmed = 0
                for (const r of results) {
                    if (r.status === "fulfilled") {
                        localStorage.removeItem(r.value.key)
                        if (r.value.data?.status === "success" && r.value.data.results) {
                            for (const res of r.value.data.results) {
                                if (!grouped[res.nombre]) grouped[res.nombre] = []
                                grouped[res.nombre].push("S/ " + parseFloat(res.monto.replace(",", ".")).toFixed(2))
                                totalConfirmed++
                            }
                        } else if (r.value.data?.status === "error") {
                            errors.push(`Batch ${r.value.batchId.slice(0, 8)}: ${r.value.data.error || "Error"}`)
                        } else {
                            for (const entry of r.value.entries) {
                                if (!grouped[entry.nombre]) grouped[entry.nombre] = []
                                grouped[entry.nombre].push("S/ " + parseFloat(entry.monto.replace(",", ".")).toFixed(2))
                                totalConfirmed++
                            }
                        }
                    }
                }

                const namesText = Object.entries(grouped)
                    .map(([name, montos]) => `${name}: ${montos.join(" , ")}`)
                    .join("\n")

                if (namesText) {
                    setUltimoYapeNombre(namesText)
                    setYapeSuccessMsg(
                        totalConfirmed > 1
                            ? `${totalConfirmed} YAPEs registrados correctamente`
                            : `1 YAPE registrado correctamente`
                    )
                    setTimeout(() => setYapeSuccessMsg(""), 5000)
                }
                if (errors.length > 0) {
                    alert(`Errores:\n${errors.join("\n")}`)
                }
            })()
        }
    }, [showModalYapes])

    useEffect(() => {
        if (xmlFile) {
            const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
            window.addEventListener("beforeunload", handler)
            return () => window.removeEventListener("beforeunload", handler)
        }
    }, [xmlFile])

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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha inicio</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="date"
                                                    value={yapesFechaInicio}
                                                    onChange={(e) => setYapesFechaInicio(e.target.value)}
                                                    className="w-full min-w-0 pl-9 pr-3 py-2 rounded-lg text-sm max-sm:text-base border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
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
                                                    className="w-full min-w-0 pl-9 pr-3 py-2 rounded-lg text-sm max-sm:text-base border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
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
                                            {ultimoYapeNombre && (
                                                <div className="mt-3 space-y-1.5 animate-[yape-slide-up_0.4s_ease-out_0.5s_both]">
                                                    <div className="text-center text-sm text-purple-700 whitespace-pre-line">
                                                        <span className="font-medium text-purple-400">Yape para:</span>
                                                        <br />
                                                        <span className="font-bold text-purple-800">{ultimoYapeNombre}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div className="p-5 space-y-5">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Fecha</label>
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                {yapeFechaEditando ? (
                                                    <input
                                                        type="date"
                                                        value={nuevoYapeFecha}
                                                        onChange={(e) => {
                                                            setNuevoYapeFecha(e.target.value)
                                                            setYapeFechaEditando(false)
                                                        }}
                                                        onBlur={() => setYapeFechaEditando(false)}
                                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-purple-400 bg-white text-slate-700 text-sm max-sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-400"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <div className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-sm max-sm:text-base">
                                                        {new Date(nuevoYapeFecha + "T12:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setYapeFechaEditando(true)}
                                                className="p-2 max-sm:p-3 max-sm:h-11 max-sm:w-11 rounded-lg transition-all shrink-0 bg-slate-100 text-slate-500 hover:bg-slate-200"
                                                title="Editar fecha"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {yapeEntries.map((entry, idx) => (
                                            <div key={idx} className="flex gap-2 items-start p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Nombre</label>
                                                    <select
                                                        value={entry.nombre}
                                                        onChange={(e) => updateEntry(idx, "nombre", e.target.value)}
                                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer text-sm max-sm:text-lg max-sm:font-bold"
                                                    >
                                                        <option value="">Seleccionar</option>
                                                        <option value="Carlos" className="font-bold">Carlos</option>
                                                        <option value="Angel" className="font-bold">Angel</option>
                                                    </select>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-xs font-medium text-slate-500 mb-1">Monto</label>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">S/</span>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            value={entry.monto}
                                                            onChange={(e) => updateEntry(idx, "monto", e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm max-sm:text-lg max-sm:font-bold"
                                                        />
                                                    </div>
                                                </div>
                                                {yapeEntries.length > 1 && (
                                                    <button
                                                        onClick={() => removeEntry(idx)}
                                                        className="mt-5 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={addEntry}
                                        className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:border-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Agregar otro YAPE
                                    </button>
                                </div>

                                <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
                                    <button onClick={() => {
                                        setYapeEntries([{ nombre: "", monto: "" }])
                                        setNuevoYapeFecha(new Date().toISOString().split("T")[0])
                                        setYapeTab("resumen")
                                    }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const validEntries = yapeEntries.filter(e => {
                                                const montoNum = parseFloat(e.monto)
                                                return e.nombre.trim() && e.monto.trim() && !isNaN(montoNum) && montoNum > 0
                                            })
                                            if (validEntries.length === 0) return

                                            const fecha = nuevoYapeFecha
                                            setAgregandoYape(true)

                                            const pendings = validEntries.map(e => ({
                                                nombre: e.nombre.trim(),
                                                monto: e.monto.trim(),
                                                fecha,
                                            }))

                                            const res = await fetch("/api/yapes/nuevo", {
                                                method: "POST",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({ entries: pendings }),
                                            })

                                            const data = await res.json()

                                            if (res.status === 200 && data.status === "success") {
                                                const results = data.results || pendings
                                                const grouped: Record<string, string[]> = {}
                                                for (const r of results) {
                                                    if (!grouped[r.nombre]) grouped[r.nombre] = []
                                                    grouped[r.nombre].push("S/ " + parseFloat(r.monto.replace(",", ".")).toFixed(2))
                                                }
                                                const namesText = Object.entries(grouped)
                                                    .map(([name, montos]) => `${name}: ${montos.join(" , ")}`)
                                                    .join("\n")

                                                if (namesText) {
                                                    setUltimoYapeNombre(namesText)
                                                    setYapeSuccessMsg(
                                                        results.length > 1
                                                            ? `${results.length} YAPES registrados correctamente`
                                                            : `1 YAPE registrado correctamente`
                                                    )
                                                    setTimeout(() => setYapeSuccessMsg(""), 5000)
                                                }
                                            } else if (res.status === 202 && data.status === "pending") {
                                                const batchId = data.batchId
                                                localStorage.setItem("yape_batch_" + batchId, JSON.stringify({
                                                    batchId,
                                                    count: data.count,
                                                    entries: pendings,
                                                    timestamp: Date.now(),
                                                }))
                                                setUltimoYapeNombre(`${data.count} YAPES en proceso (se confirmarán automáticamente)`)
                                                setYapeSuccessMsg(`${data.count} en proceso`)
                                                setTimeout(() => setYapeSuccessMsg(""), 5000)
                                            } else {
                                                alert(`Error: ${data.error || "Error al registrar YAPES"}`)
                                            }

                                            setYapeEntries([{ nombre: "", monto: "" }])
                                            setNuevoYapeFecha(new Date().toISOString().split("T")[0])
                                            setAgregandoYape(false)
                                        }}
                                        disabled={!yapeEntries.every(e => {
                                            if (!e.nombre.trim() || !e.monto.trim()) return false
                                            const n = parseFloat(e.monto)
                                            return !isNaN(n) && n > 0
                                        }) || agregandoYape}
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
                                                Registrar{yapeEntries.filter(e => e.nombre.trim() && e.monto.trim() && !isNaN(parseFloat(e.monto)) && parseFloat(e.monto) > 0).length > 1 ? " YAPES" : " YAPE"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Modal Convertir XML */}
            {showModalXml && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={handleCloseXmlModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-5 border-b border-slate-100">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Convertir XML</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Ticket o etiqueta de envío</p>
                            </div>
                            <button onClick={handleCloseXmlModal} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                <X className="h-5 w-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5">
                            {/* Archivo XML */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Archivo XML <span className="text-red-500">*</span>
                                </label>
                                <label className={`flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${xmlFile ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                                    <FileText className={`h-6 w-6 ${xmlFile ? "text-emerald-500" : "text-slate-400"}`} />
                                    <span className={`text-sm ${xmlFile ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                                        {xmlFile ? xmlFile.name : "Seleccionar archivo XML"}
                                    </span>
                                    <input
                                        type="file"
                                        accept=".xml"
                                        className="sr-only"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0] || null
                                            setXmlFile(file)
                                            setXmlMetadata(null)
                                            if (file) {
                                                try {
                                                    const text = await file.text()
                                                    const parser = new DOMParser()
                                                    const doc = parser.parseFromString(text, "text/xml")
                                                    const xpathVal = (expr: string): string => {
                                                        const ns: Record<string, string> = {
                                                            cbc: "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
                                                            cac: "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
                                                        }
                                                        const resolver = (prefix: string | null) => (prefix ? ns[prefix] : null) || null
                                                        try {
                                                            const result = doc.evaluate(expr, doc, resolver, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
                                                            return (result.singleNodeValue as Element)?.textContent?.trim() || ""
                                                        } catch {
                                                            return ""
                                                        }
                                                    }
                                                    const clienteNombre = xpathVal("//cac:AccountingCustomerParty/cac:Party//cbc:RegistrationName") || xpathVal("//cac:AccountingCustomerParty/cac:Party//cbc:Name")
                                                    const clienteId = xpathVal("//cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID")
                                                    const total = parseFloat(xpathVal("//cac:LegalMonetaryTotal/cbc:PayableAmount")) || 0
                                                    const numero = xpathVal("//cbc:ID")
                                                    const tipo = numero.startsWith("F") ? "FACTURA" : "BOLETA DE VENTA"
                                                    const direccion = xpathVal("//cac:AccountingCustomerParty/cac:Party//cac:AddressLine/cbc:Line")
                                                    setXmlMetadata({ nombre: clienteNombre, documento: clienteId, total, tipo, numero })
                                                    if (direccion) setXmlRecojeDireccion(direccion)
                                                } catch {
                                                    // ignore parse errors
                                                }
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            {/* Cliente info */}
                            {xmlMetadata && (
                                <div className="flex items-center justify-between bg-indigo-50 rounded-xl px-4 py-3 border border-indigo-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center">
                                            <User className="h-4 w-4 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">{xmlMetadata.nombre || "—"}</p>
                                            <p className="text-xs text-slate-500">{xmlMetadata.documento ? `${xmlMetadata.tipo === "FACTURA" ? "RUC" : "DNI"}: ${xmlMetadata.documento}` : ""}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-900">S/ {xmlMetadata.total.toFixed(2)}</p>
                                        <p className="text-xs text-slate-500">{xmlMetadata.numero}</p>
                                    </div>
                                </div>
                            )}

                            {/* Formato */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Formato</label>
                                <div className="flex gap-2">
                                    {[
                                        { value: "ticket" as const, label: "Ticket 80mm" },
                                        { value: "shipping_label" as const, label: "Etiqueta de envío 100mm×150mm" },
                                    ].map(f => (
                                        <button
                                            key={f.value}
                                            type="button"
                                            onClick={() => setFormatoXml(f.value)}
                                            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium border transition-colors ${formatoXml === f.value ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Campos de Etiqueta */}
                            {formatoXml === "shipping_label" && (
                                <>
                                    {/* Agencia */}
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Agencia</label>
                                        <button
                                            type="button"
                                            ref={xmlAgenciaToggleRef}
                                            data-xml-agencia-toggle
                                            onClick={() => setMostrarDropdownXmlAgencia(!mostrarDropdownXmlAgencia)}
                                            className="w-full px-3 py-2 rounded-lg text-sm text-left border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                        >
                                            {xmlAgencia || "SELECCIONAR AGENCIA"}
                                        </button>
                                        {mostrarDropdownXmlAgencia && (
                                            <div
                                                data-xml-agencia-dropdown
                                                className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="p-2 border-b border-slate-100">
                                                    <input
                                                        type="text"
                                                        value={xmlAgenciaBusqueda}
                                                        onChange={(e) => setXmlAgenciaBusqueda(e.target.value)}
                                                        placeholder="Buscar agencia..."
                                                        className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="max-h-[280px] overflow-y-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() => { setXmlAgencia(""); setMostrarDropdownXmlAgencia(false); setXmlAgenciaBusqueda("") }}
                                                        className="w-full px-4 py-2 text-left hover:bg-slate-50 border-b border-slate-50 transition-colors text-sm text-slate-700"
                                                    >
                                                        SELECCIONAR AGENCIA
                                                    </button>
                                                    {AGENCIA_OPTIONS.map(v => ({ value: v, label: v })).concat({ value: "OTROS", label: "OTRA AGENCIA" }).filter(o => o.label.toLowerCase().includes(xmlAgenciaBusqueda.toLowerCase())).map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => { setXmlAgencia(opt.value); if (opt.value !== "OTROS") setXmlOtraAgencia(""); setMostrarDropdownXmlAgencia(false); setXmlAgenciaBusqueda("") }}
                                                            className={`w-full px-4 py-2 text-left hover:bg-slate-50 border-b border-slate-50 transition-colors text-sm ${xmlAgencia === opt.value ? "bg-slate-50 font-medium text-slate-900" : "text-slate-700"}`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                    {AGENCIA_OPTIONS.map(v => ({ value: v, label: v })).concat({ value: "OTROS", label: "OTRA AGENCIA" }).filter(o => o.label.toLowerCase().includes(xmlAgenciaBusqueda.toLowerCase())).length === 0 && (
                                                        <p className="px-4 py-3 text-sm text-slate-400 text-center">Sin resultados</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        {xmlAgencia === "OTROS" && (
                                            <input
                                                type="text"
                                                value={xmlOtraAgencia}
                                                onChange={e => setXmlOtraAgencia(e.target.value)}
                                                placeholder="Nombre de agencia"
                                                className="mt-2 w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                            />
                                        )}
                                    </div>

                                    {/* Notas */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="block text-sm font-medium text-slate-700">Notas adicionales</label>
                                            <button
                                                type="button"
                                                onClick={() => setXmlNotas(prev => {
                                                    const texto = "A DOMICILIO"
                                                    return prev.includes(texto) ? prev : prev ? `${prev}, ${texto}` : texto
                                                })}
                                                className="px-3 py-1 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                            >
                                                + A DOMICILIO
                                            </button>
                                        </div>
                                        <textarea
                                            value={xmlNotas}
                                            onChange={e => setXmlNotas(e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
                                        />
                                    </div>

                                    {/* Recoje otra persona */}
                                    <div>
                                        <button
                                            type="button"
                                            onClick={() => setXmlRecojeOtraPersona(!xmlRecojeOtraPersona)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${xmlRecojeOtraPersona ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${xmlRecojeOtraPersona ? "bg-indigo-600 border-indigo-600" : "border-slate-300"}`}>
                                                    {xmlRecojeOtraPersona && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="text-left">
                                                    <span className="text-sm font-medium text-slate-700">Otra persona recoge</span>
                                                    <p className="text-xs text-slate-400">Completa datos de quien recibe el pedido</p>
                                                </div>
                                            </div>
                                            <Truck className={`h-4 w-4 ${xmlRecojeOtraPersona ? "text-indigo-500" : "text-slate-300"}`} />
                                        </button>
                                        {xmlRecojeOtraPersona && (
                                            <div className="mt-3 space-y-3">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={xmlRecojeDni}
                                                        onChange={e => setXmlRecojeDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
                                                        placeholder="DNI"
                                                        maxLength={8}
                                                        className="flex-1 px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={buscarDocRecibe}
                                                        disabled={buscandoDocRecibe || xmlRecojeDni.length < 8}
                                                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                                                    >
                                                        {buscandoDocRecibe ? (
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                        ) : (
                                                            <Search className="h-3.5 w-3.5" />
                                                        )}
                                                        Buscar
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={xmlRecojeNombre}
                                                    onChange={e => setXmlRecojeNombre(e.target.value)}
                                                    placeholder="Nombre completo"
                                                    className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                />
                                                <input
                                                    type="text"
                                                    value={xmlRecojeDireccion}
                                                    onChange={e => setXmlRecojeDireccion(e.target.value)}
                                                    placeholder="Dirección"
                                                    className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
                            <button onClick={handleCloseXmlModal} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                Cancelar
                            </button>
                            <button
                                onClick={async () => {
                                    if (!xmlFile) return
                                    setConvirtiendoXml(true)
                                    try {
                                        const formData = new FormData()
                                        formData.append("xml", xmlFile)
                                        formData.append("formato", formatoXml)
                                        if (xmlAgencia) formData.append("agencia", xmlAgencia)
                                        if (xmlAgencia === "OTROS" && xmlOtraAgencia) formData.append("otraAgencia", xmlOtraAgencia)
                                        if (xmlNotas) formData.append("notas", xmlNotas)
                                        if (xmlRecojeOtraPersona) {
                                            formData.append("recojeOtraPersona", "true")
                                            if (xmlRecojeDni) formData.append("recojeDni", xmlRecojeDni)
                                            if (xmlRecojeNombre) formData.append("recojeNombre", xmlRecojeNombre)
                                            if (xmlRecojeDireccion) formData.append("recojeDireccion", xmlRecojeDireccion)
                                        }

                                        const res = await fetch("/api/convertir-xml", {
                                            method: "POST",
                                            body: formData,
                                        })

                                        if (!res.ok) {
                                            const err = await res.json()
                                            alert(err.error || "Error al convertir XML")
                                            return
                                        }

                                        const blob = await res.blob()
                                        const url = URL.createObjectURL(blob)
                                        const cd = res.headers.get("Content-Disposition") || ""
                                        const match = cd.match(/filename="?(.+?)"?$/)
                                        const filename = match?.[1] || "documento.pdf"
                                        const isMobile = window.innerWidth < 1024 || "ontouchstart" in window
                                        if (isMobile) {
                                            const a = document.createElement("a")
                                            a.href = url
                                            a.download = filename
                                            a.click()
                                        } else {
                                            window.open(url, "_blank")
                                        }
                                    } catch (err) {
                                        alert(err instanceof Error ? err.message : "Error de conexión")
                                    } finally {
                                        setConvirtiendoXml(false)
                                    }
                                }}
                                disabled={!xmlFile || convirtiendoXml}
                                className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {convirtiendoXml ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Convirtiendo...
                                    </>
                                ) : (
                                    <><Printer className="h-4 w-4" />Convertir y previsualizar</>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirmación salir módulo XML */}
                    {showXmlCloseConfirm && (
                        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowXmlCloseConfirm(false)}>
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">¿Salir del módulo Convertir XML?</h3>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                        Se perderá el XML cargado y los datos ingresados.
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowXmlCloseConfirm(false)}
                                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleConfirmExitXml}
                                            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            Salir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
