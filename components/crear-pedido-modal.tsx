"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { 
    X, Search, Plus, Trash2, FileText, Printer, Send, Save, 
    ArrowLeft, ArrowRight, Check, Package, Ruler, Loader2,
    Building2, CreditCard, User, MapPin, Phone, Truck, FileCheck, ClipboardList
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Cliente {
    id?: string
    nombre: string
    tipoDoc: string
    numeroDoc: string
    razonSocial?: string
    direccion: string
    telefono: string
    agencia?: string
    agenciaOtro?: string
    guiaRemision?: boolean
    departamento?: string
    provincia?: string
    distrito?: string
    origen?: string
}

interface ItemPedido {
    id: string
    productoId: string
    productoNombre: string
    productoCategoria: string
    productoPrecio: number
    cantidad: number
    tipo: string
    indicacionesCorte: string
}

interface Producto {
    id: string
    nombre: string
    precio: number
    categoria: string
    stocks: { stock: number }[]
}

interface Props {
    isOpen: boolean
    onClose: () => void
    userName: string
}

const EMPRESAS = ["Empresa 1", "Empresa 2", "Empresa 3", "Empresa 4"]
const METODOS_PAGO = ["Transferencia", "Depósito", "Efectivo", "Yape", "BBVA"]
const AGENCIAS = [
    { value: "shalom", label: "Shalom" },
    { value: "flores", label: "Flores" },
    { value: "marvisur", label: "Marvisur" },
    { value: "olva", label: "Olva" },
    { value: "safexpress", label: "Safexpress" },
    { value: "otros", label: "Otros" }
]

export function CrearPedidoModal({ isOpen, onClose, userName }: Props) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [toastMessage, setToastMessage] = useState<{ show: boolean; message: string; type: "error" | "success" }>({ show: false, message: "", type: "error" })

    const [empresa, setEmpresa] = useState("")
    const [metodoPago, setMetodoPago] = useState("")
    const [clienteBusqueda, setClienteBusqueda] = useState("")
    const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([])
    const [mostrarDropdown, setMostrarDropdown] = useState(false)
    const [buscandoCliente, setBuscandoCliente] = useState(false)
    const [cliente, setCliente] = useState<Cliente>({
        nombre: "",
        tipoDoc: "dni",
        numeroDoc: "",
        direccion: "",
        telefono: ""
    })
    const [agencia, setAgencia] = useState("")
    const [agenciaOtro, setAgenciaOtro] = useState("")
    const [guiaRemision, setGuiaRemision] = useState(false)

    const [empleadosTelefonos, setEmpleadosTelefonos] = useState<{ id: string; nombre: string; celular: string }[]>([])
    const [mostrarDropdownEmpleados, setMostrarDropdownEmpleados] = useState(false)
    const [cargandoEmpleados, setCargandoEmpleados] = useState(false)
    const [buscandoDoc, setBuscandoDoc] = useState(false)
    const [mostrarUbicacion, setMostrarUbicacion] = useState(false)

    const [items, setItems] = useState<ItemPedido[]>([])
    const [busquedaProducto, setBusquedaProducto] = useState("")
    const [productosEncontrados, setProductosEncontrados] = useState<Producto[]>([])
    const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false)
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
    const [itemCantidad, setItemCantidad] = useState(1)
    const [itemTipo, setItemTipo] = useState<"metros" | "pieza">("metros")
    const [itemIndicaciones, setItemIndicaciones] = useState("")
    const [costoEnvio, setCostoEnvio] = useState(0)
    const [observaciones, setObservaciones] = useState("")

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (toastMessage.show) {
            const timer = setTimeout(() => setToastMessage({ show: false, message: "", type: "error" }), 3000)
            return () => clearTimeout(timer)
        }
    }, [toastMessage.show])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (mostrarDropdownEmpleados && !(e.target as HTMLElement).closest('[data-empleados-dropdown]') && !(e.target as HTMLElement).closest('[data-empleados-toggle]')) {
                setMostrarDropdownEmpleados(false)
            }
        }
        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [mostrarDropdownEmpleados])

    const cargarTelefonosEmpleados = async () => {
        if (empleadosTelefonos.length > 0) return
        setCargandoEmpleados(true)
        try {
            const res = await fetch("/api/empleados-telefonos", { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                setEmpleadosTelefonos(json.empleados)
            }
        } catch (e) {
            console.error("Error cargando telefonos:", e)
        } finally {
            setCargandoEmpleados(false)
        }
    }

    const buscarPorDocumento = async () => {
        if (!cliente.numeroDoc || cliente.numeroDoc.length < 2) return
        setBuscandoDoc(true)
        try {
            const res = await fetch("/api/buscar-documento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: cliente.tipoDoc, numero: cliente.numeroDoc })
            })
            const json = await res.json()
            if (json.success) {
                if (cliente.tipoDoc === "ruc") {
                    setCliente({
                        ...cliente,
                        nombre: json.razonSocial || "",
                        direccion: json.direccion || "",
                        departamento: json.departamento || "",
                        provincia: json.provincia || "",
                        distrito: json.distrito || ""
                    })
                    if (json.departamento) setMostrarUbicacion(true)
                } else {
                    setCliente({
                        ...cliente,
                        nombre: json.nombre || ""
                    })
                }
            } else {
                setToastMessage({ show: true, message: "Documento no encontrado", type: "error" })
            }
        } catch (e) {
            console.error("Error buscando documento:", e)
            setToastMessage({ show: true, message: "Error al buscar documento", type: "error" })
        } finally {
            setBuscandoDoc(false)
        }
    }

    useEffect(() => {
        if (clienteBusqueda.length < 2) {
            setClientesEncontrados([])
            setMostrarDropdown(false)
            return
        }

        const timer = setTimeout(async () => {
            setBuscandoCliente(true)
            try {
                const res = await fetch(`/api/cliente-buscar?q=${encodeURIComponent(clienteBusqueda)}`, { credentials: "include" })
                const json = await res.json()
                if (json.success) {
                    setClientesEncontrados(json.clientes || [])
                    if ((json.clientes || []).length > 0) {
                        setMostrarDropdown(true)
                    }
                }
            } catch (e) {
                console.error("Error buscando cliente:", e)
            } finally {
                setBuscandoCliente(false)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [clienteBusqueda])

    const buscarProductos = useCallback(async (query: string) => {
        if (query.length < 2) {
            setProductosEncontrados([])
            return
        }

        try {
            const res = await fetch(`/api/productos?search=${encodeURIComponent(query)}`, { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                setProductosEncontrados(json.productos || [])
                if ((json.productos || []).length > 0) {
                    setMostrarDropdownProducto(true)
                }
            }
        } catch (e) {
            console.error("Error buscando productos:", e)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => buscarProductos(busquedaProducto), 300)
        return () => clearTimeout(timer)
    }, [busquedaProducto, buscarProductos])

    const seleccionarCliente = (c: Cliente) => {
        setCliente({
            nombre: c.nombre,
            tipoDoc: c.tipoDoc || "dni",
            numeroDoc: c.numeroDoc,
            razonSocial: c.razonSocial || "",
            direccion: c.direccion || "",
            telefono: c.telefono || "",
            departamento: c.departamento || "",
            provincia: c.provincia || "",
            distrito: c.distrito || ""
        })
        setClienteBusqueda(c.nombre)
        setAgencia(c.agencia || "")
        setAgenciaOtro(c.agenciaOtro || "")
        setGuiaRemision(c.guiaRemision || false)
        if (c.departamento) setMostrarUbicacion(true)
        setMostrarDropdown(false)
    }

    const agregarItem = () => {
        if (!productoSeleccionado) return

        const nuevoItem: ItemPedido = {
            id: Date.now().toString(),
            productoId: productoSeleccionado.id,
            productoNombre: productoSeleccionado.nombre,
            productoCategoria: productoSeleccionado.categoria,
            productoPrecio: Number(productoSeleccionado.precio),
            cantidad: itemCantidad,
            tipo: itemTipo,
            indicacionesCorte: itemIndicaciones
        }

        setItems([...items, nuevoItem])
        
        setProductoSeleccionado(null)
        setBusquedaProducto("")
        setItemCantidad(1)
        setItemTipo("metros")
        setItemIndicaciones("")
        setMostrarDropdownProducto(false)
    }

    const eliminarItem = (id: string) => {
        setItems(items.filter(i => i.id !== id))
    }

    const calcularSubtotal = () => {
        return items.reduce((sum, item) => {
            const metros = item.tipo === "pieza" ? 50 : 1
            return sum + (item.productoPrecio * item.cantidad * metros)
        }, 0)
    }

    const calcularTotal = () => {
        return calcularSubtotal() + costoEnvio
    }

    const crearPedido = async () => {
        if (!empresa || !metodoPago || !cliente.nombre || !cliente.numeroDoc || items.length === 0) {
            setToastMessage({ show: true, message: "Complete todos los campos requeridos", type: "error" })
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/pedido-empleado", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    empresa,
                    metodoPago,
                    cliente: {
                        nombre: cliente.nombre,
                        tipoDoc: cliente.tipoDoc,
                        numeroDoc: cliente.numeroDoc,
                        razonSocial: cliente.razonSocial,
                        direccion: cliente.direccion,
                        telefono: cliente.telefono,
                        agenciaOtro
                    },
                    agencia,
                    guiaRemision,
                    costoEnvio,
                    observaciones,
                    items: items.map(i => ({
                        productoId: i.productoId,
                        cantidad: i.cantidad,
                        tipo: i.tipo,
                        precio: i.productoPrecio,
                        indicacionesCorte: i.indicacionesCorte
                    }))
                }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                setToastMessage({ show: true, message: `Pedido ${json.pedido.numeroOrden} creado`, type: "success" })
                setTimeout(() => {
                    onClose()
                    resetForm()
                }, 1500)
            } else {
                setToastMessage({ show: true, message: json.error || "Error al crear pedido", type: "error" })
            }
        } catch (e) {
            console.error("Error:", e)
            setToastMessage({ show: true, message: "Error al crear pedido", type: "error" })
        } finally {
            setLoading(false)
        }
    }

    const resetForm = () => {
        setStep(1)
        setEmpresa("")
        setMetodoPago("")
        setClienteBusqueda("")
        setCliente({ nombre: "", tipoDoc: "dni", numeroDoc: "", direccion: "", telefono: "" })
        setAgencia("")
        setAgenciaOtro("")
        setGuiaRemision(false)
        setItems([])
        setCostoEnvio(0)
        setObservaciones("")
        setMostrarUbicacion(false)
    }

    if (!isOpen) return null

    const inputBase = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white"
    const labelBase = "flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-4xl h-screen sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 1 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>1</div>
                            <div className="w-8 h-px bg-slate-200" />
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 2 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>2</div>
                        </div>
                        <div className="hidden sm:block">
                            <h2 className="text-sm font-semibold text-slate-900">Crear Pedido</h2>
                            <p className="text-xs text-slate-400">{step === 1 ? "Datos del cliente" : "Artículos y total"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="h-4 w-4 text-slate-400" />
                    </button>
                </div>

                {/* Toast */}
                {toastMessage.show && (
                    <div className="fixed top-4 right-4 z-[10000]">
                        <div className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
                            toastMessage.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"
                        }`}>
                            {toastMessage.message}
                        </div>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6">
                        {step === 1 ? (
                            <div className="space-y-5">
                                {/* Empresa */}
                                <div>
                                    <p className={labelBase}><Building2 className="h-3.5 w-3.5" /> Empresa</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {EMPRESAS.map(emp => (
                                            <button
                                                key={emp}
                                                onClick={() => setEmpresa(emp)}
                                                className={`px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                                                    empresa === emp 
                                                        ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                                                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                }`}
                                            >
                                                {emp}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Método de pago */}
                                <div>
                                    <p className={labelBase}><CreditCard className="h-3.5 w-3.5" /> Método de Pago</p>
                                    <div className="flex flex-wrap gap-2">
                                        {METODOS_PAGO.map(mp => (
                                            <button
                                                key={mp}
                                                onClick={() => setMetodoPago(mp)}
                                                className={`px-3 py-1.5 border rounded-lg text-sm font-medium transition-all ${
                                                    metodoPago === mp 
                                                        ? "bg-slate-900 border-slate-900 text-white shadow-sm" 
                                                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                                }`}
                                            >
                                                {mp}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-slate-100" />

                                {/* Buscar cliente */}
                                <div>
                                    <p className={labelBase}><User className="h-3.5 w-3.5" /> Buscar Cliente</p>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={clienteBusqueda}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                setClienteBusqueda(val)
                                                if (val.length < 2) {
                                                    setClientesEncontrados([])
                                                    setMostrarDropdown(false)
                                                }
                                            }}
                                            onFocus={() => {
                                                if (clientesEncontrados.length > 0 || clienteBusqueda.length >= 2) {
                                                    setMostrarDropdown(true)
                                                }
                                            }}
                                            placeholder="Nombre, RUC o DNI..."
                                            className={`${inputBase} pl-10 pr-10`}
                                        />
                                        {buscandoCliente && (
                                            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                                        )}
                                        {clienteBusqueda && !buscandoCliente && (
                                            <button
                                                onClick={() => {
                                                    setClienteBusqueda("")
                                                    setClientesEncontrados([])
                                                    setMostrarDropdown(false)
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        {mostrarDropdown && clientesEncontrados.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                                {clientesEncontrados.map(c => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => seleccionarCliente(c)}
                                                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors"
                                                    >
                                                        <p className="font-medium text-slate-900 text-sm">{c.nombre}</p>
                                                        <p className="text-xs text-slate-400">{c.numeroDoc}{c.telefono ? ` • ${c.telefono}` : ""}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Datos del cliente */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelBase}>Nombre / Razón Social</label>
                                        <input
                                            type="text"
                                            value={cliente.nombre}
                                            onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                                            className={inputBase}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-20 shrink-0">
                                            <label className={labelBase}>Tipo</label>
                                            <select
                                                value={cliente.tipoDoc}
                                                onChange={(e) => setCliente({ ...cliente, tipoDoc: e.target.value })}
                                                className={inputBase}
                                            >
                                                <option value="dni">DNI</option>
                                                <option value="ruc">RUC</option>
                                                <option value="ce">CE</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className={labelBase}>Número</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={cliente.numeroDoc}
                                                    onChange={(e) => setCliente({ ...cliente, numeroDoc: e.target.value })}
                                                    className={`${inputBase} flex-1`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={buscarPorDocumento}
                                                    disabled={buscandoDoc || !cliente.numeroDoc}
                                                    className="h-full px-3 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 shrink-0"
                                                >
                                                    {buscandoDoc ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Search className="h-3.5 w-3.5" />
                                                    )}
                                                    Buscar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelBase}>Dirección</label>
                                        <input
                                            type="text"
                                            value={cliente.direccion}
                                            onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                                            className={inputBase}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelBase}>Teléfono</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={cliente.telefono}
                                                onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                                                className={`${inputBase} flex-1`}
                                            />
                                            <div className="relative shrink-0">
                                                <button
                                                    type="button"
                                                    data-empleados-toggle
                                                    onClick={() => {
                                                        if (!mostrarDropdownEmpleados) cargarTelefonosEmpleados()
                                                        setMostrarDropdownEmpleados(!mostrarDropdownEmpleados)
                                                    }}
                                                    className="h-full px-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200 transition-colors whitespace-nowrap"
                                                >
                                                    Asignar nro de colaborador
                                                </button>
                                                {mostrarDropdownEmpleados && (
                                                    <div data-empleados-dropdown className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg min-w-[220px] max-h-48 overflow-y-auto z-50">
                                                        {cargandoEmpleados ? (
                                                            <div className="px-4 py-3 text-sm text-slate-400">Cargando...</div>
                                                        ) : empleadosTelefonos.length === 0 ? (
                                                            <div className="px-4 py-3 text-sm text-slate-400">Sin teléfonos registrados</div>
                                                        ) : (
                                                            empleadosTelefonos.map(emp => (
                                                                <button
                                                                    key={emp.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setCliente({ ...cliente, telefono: emp.celular || "" })
                                                                        setMostrarDropdownEmpleados(false)
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors"
                                                                >
                                                                    <p className="font-medium text-slate-900 text-sm">{emp.nombre}</p>
                                                                    <p className="text-xs text-slate-400">{emp.celular}</p>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelBase}>Agencia</label>
                                        <select
                                            value={agencia}
                                            onChange={(e) => setAgencia(e.target.value)}
                                            className={inputBase}
                                        >
                                            <option value="">Seleccionar...</option>
                                            {AGENCIAS.map(a => (
                                                <option key={a.value} value={a.value}>{a.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {agencia === "otros" && (
                                        <div>
                                            <label className={labelBase}>Nombre de la agencia</label>
                                            <input
                                                type="text"
                                                value={agenciaOtro}
                                                onChange={(e) => setAgenciaOtro(e.target.value)}
                                                className={inputBase}
                                            />
                                        </div>
                                    )}
                                    {mostrarUbicacion && (
                                        <>
                                            <div>
                                                <label className={labelBase}>Departamento</label>
                                                <input
                                                    type="text"
                                                    value={cliente.departamento || ""}
                                                    onChange={(e) => setCliente({ ...cliente, departamento: e.target.value })}
                                                    className={inputBase}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelBase}>Provincia</label>
                                                <input
                                                    type="text"
                                                    value={cliente.provincia || ""}
                                                    onChange={(e) => setCliente({ ...cliente, provincia: e.target.value })}
                                                    className={inputBase}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelBase}>Distrito</label>
                                                <input
                                                    type="text"
                                                    value={cliente.distrito || ""}
                                                    onChange={(e) => setCliente({ ...cliente, distrito: e.target.value })}
                                                    className={inputBase}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div className="flex items-center gap-2 sm:col-span-2">
                                        <button
                                            type="button"
                                            onClick={() => setGuiaRemision(!guiaRemision)}
                                            className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${guiaRemision ? "bg-slate-900" : "bg-slate-200"}`}
                                        >
                                            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${guiaRemision ? "translate-x-4" : "translate-x-0.5"}`} />
                                        </button>
                                        <span className="text-sm text-slate-600">Requiere guía de remisión</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5">
                                {/* Agregar producto */}
                                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                                    <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                        <Plus className="h-4 w-4" /> Agregar Artículo
                                    </p>
                                    <div className="space-y-3">
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <div className="flex-1 relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="text"
                                                    value={busquedaProducto}
                                                    onChange={(e) => setBusquedaProducto(e.target.value)}
                                                    onFocus={() => productosEncontrados.length > 0 && setMostrarDropdownProducto(true)}
                                                    placeholder="Buscar producto..."
                                                    className={`${inputBase} pl-10`}
                                                />
                                                {mostrarDropdownProducto && productosEncontrados.length > 0 && (
                                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                                        {productosEncontrados.map(p => (
                                                            <button
                                                                key={p.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setProductoSeleccionado(p)
                                                                    setBusquedaProducto(p.nombre)
                                                                    setMostrarDropdownProducto(false)
                                                                }}
                                                                className="w-full px-3 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors"
                                                            >
                                                                <p className="font-medium text-slate-900 text-sm">{p.nombre}</p>
                                                                <p className="text-xs text-slate-400">S/ {Number(p.precio).toFixed(2)} • {p.categoria}</p>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    value={itemTipo}
                                                    onChange={(e) => setItemTipo(e.target.value as "metros" | "pieza")}
                                                    className={`${inputBase} w-24`}
                                                >
                                                    <option value="metros">Metros</option>
                                                    <option value="pieza">Pieza</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            <div>
                                                <label className={labelBase}>Cantidad</label>
                                                <input
                                                    type="number"
                                                    value={itemCantidad}
                                                    onChange={(e) => setItemCantidad(Number(e.target.value))}
                                                    min={itemTipo === "pieza" ? 1 : 0.1}
                                                    step={itemTipo === "pieza" ? 1 : 0.1}
                                                    className={inputBase}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelBase}>Precio Unit.</label>
                                                <input
                                                    type="text"
                                                    value={productoSeleccionado ? `S/ ${Number(productoSeleccionado.precio).toFixed(2)}` : "—"}
                                                    disabled
                                                    className="w-full px-3 py-2.5 border border-slate-100 rounded-lg text-sm text-slate-500 bg-slate-100/50"
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className={labelBase}>Indicaciones de corte</label>
                                                <input
                                                    type="text"
                                                    value={itemIndicaciones}
                                                    onChange={(e) => setItemIndicaciones(e.target.value)}
                                                    placeholder="Ej: Cortar a 1.50m"
                                                    className={inputBase}
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            onClick={agregarItem}
                                            disabled={!productoSeleccionado || itemCantidad <= 0}
                                            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="h-4 w-4 mr-1" /> Agregar artículo
                                        </Button>
                                    </div>
                                </div>

                                {/* Lista de items */}
                                {items.length > 0 ? (
                                    <div>
                                        <p className={labelBase}><ClipboardList className="h-3.5 w-3.5" /> Artículos ({items.length})</p>
                                        {/* Desktop table */}
                                        <div className="hidden sm:block border border-slate-100 rounded-xl overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50/80">
                                                    <tr>
                                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Artículo</th>
                                                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Cant.</th>
                                                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                                                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">P.Unit.</th>
                                                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>
                                                        <th className="px-4 py-2.5 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map((item, idx) => {
                                                        const metros = item.tipo === "pieza" ? 50 : 1
                                                        const subtotal = item.productoPrecio * item.cantidad * metros
                                                        return (
                                                            <tr key={item.id} className={`border-t border-slate-50 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                                                                <td className="px-4 py-3">
                                                                    <p className="font-medium text-slate-900 text-sm">{item.productoNombre}</p>
                                                                    <p className="text-xs text-slate-400">{item.productoCategoria}</p>
                                                                    {item.indicacionesCorte && (
                                                                        <p className="text-xs text-amber-600 mt-0.5 truncate max-w-[200px]" title={item.indicacionesCorte}>{item.indicacionesCorte}</p>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-center text-slate-900 font-medium">{item.cantidad}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${item.tipo === "pieza" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                                                                        {item.tipo === "pieza" ? "Pieza" : "Metros"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right text-slate-600">S/ {item.productoPrecio.toFixed(2)}</td>
                                                                <td className="px-4 py-3 text-right font-semibold text-slate-900">S/ {subtotal.toFixed(2)}</td>
                                                                <td className="px-4 py-3">
                                                                    <button onClick={() => eliminarItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Mobile cards */}
                                        <div className="sm:hidden space-y-2">
                                            {items.map(item => {
                                                const metros = item.tipo === "pieza" ? 50 : 1
                                                const subtotal = item.productoPrecio * item.cantidad * metros
                                                return (
                                                    <div key={item.id} className="bg-white border border-slate-100 rounded-lg p-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-slate-900 text-sm">{item.productoNombre}</p>
                                                                <p className="text-xs text-slate-400">{item.productoCategoria}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs text-slate-500">{item.cantidad} {item.tipo === "pieza" ? "pieza(s)" : "metro(s)"}</span>
                                                                    <span className="text-xs text-slate-300">•</span>
                                                                    <span className="text-xs text-slate-500">S/ {item.productoPrecio.toFixed(2)}/u</span>
                                                                </div>
                                                                {item.indicacionesCorte && (
                                                                    <p className="text-xs text-amber-600 mt-1 truncate">{item.indicacionesCorte}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <p className="font-semibold text-slate-900 text-sm">S/ {subtotal.toFixed(2)}</p>
                                                                <button onClick={() => eliminarItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded">
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-slate-400">
                                        <Package className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                                        <p className="text-sm">Sin artículos agregados</p>
                                    </div>
                                )}

                                {/* Totales */}
                                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Subtotal</span>
                                            <span className="font-medium text-slate-900">S/ {calcularSubtotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-500">Costo envío</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-slate-400">S/</span>
                                                <input
                                                    type="number"
                                                    value={costoEnvio || ""}
                                                    onChange={(e) => setCostoEnvio(Number(e.target.value))}
                                                    min={0}
                                                    step={0.01}
                                                    placeholder="0.00"
                                                    className="w-20 px-2 py-1.5 border border-slate-200 rounded text-right text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                            <span className="text-base font-bold text-slate-900">Total</span>
                                            <span className="text-xl font-bold text-slate-900">S/ {calcularTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Observaciones */}
                                <div>
                                    <p className={labelBase}><FileText className="h-3.5 w-3.5" /> Observaciones</p>
                                    <textarea
                                        value={observaciones}
                                        onChange={(e) => setObservaciones(e.target.value)}
                                        rows={2}
                                        className={`${inputBase} resize-none`}
                                        placeholder="Notas adicionales..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="border-t border-slate-100 bg-white px-4 sm:px-6 py-3 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => step === 1 ? onClose() : setStep(1)} 
                            className="text-slate-600 border-slate-200 hover:bg-slate-50 text-sm h-9 px-3"
                        >
                            {step === 1 ? (
                                "Cancelar"
                            ) : (
                                <><ArrowLeft className="h-4 w-4 mr-1" /> Atrás</>
                            )}
                        </Button>
                        {step === 2 && (
                            <div className="flex items-center gap-2">
                                <Button variant="outline" className="hidden sm:flex items-center gap-1.5 text-slate-600 border-slate-200 hover:bg-slate-50 text-sm h-9">
                                    <Printer className="h-4 w-4" />
                                </Button>
                                <Button 
                                    onClick={crearPedido} 
                                    disabled={loading || items.length === 0} 
                                    className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <><Check className="h-4 w-4 mr-1" /> Crear Pedido</>
                                    )}
                                </Button>
                            </div>
                        )}
                        {step === 1 && (
                            <Button
                                onClick={() => setStep(2)}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 font-medium transition-all"
                            >
                                Siguiente <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )

    return isMounted ? createPortal(modalContent, document.body) : null
}
