"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { 
    X, Search, Plus, Trash2, FileText, Printer, Send, Save, 
    ArrowLeft, ArrowRight, Check, Package, Ruler, Loader2,
    Building2, CreditCard, User, MapPin, Phone, Truck, FileCheck, ClipboardList, Pencil
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

const EMPRESAS = ["Flores Caritas", "Textiles Manchester", "ManchesterTex", "Textiles Mego"]
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
    const [errorDoc, setErrorDoc] = useState("")
    const [errorTel, setErrorTel] = useState("")

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
    const [mostrarDropdownAgencia, setMostrarDropdownAgencia] = useState(false)
    const [agenciaDropdownPos, setAgenciaDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null)
    const agenciaToggleRef = useRef<HTMLButtonElement>(null)
    const [guiaRemision, setGuiaRemision] = useState(false)

    const [empleadosTelefonos, setEmpleadosTelefonos] = useState<{ id: string; nombre: string; celular: string }[]>([])
    const [mostrarDropdownEmpleados, setMostrarDropdownEmpleados] = useState(false)
    const [cargandoEmpleados, setCargandoEmpleados] = useState(false)
    const [buscandoDoc, setBuscandoDoc] = useState(false)
    const [mostrarUbicacion, setMostrarUbicacion] = useState(false)
    const clienteSeleccionadoRef = useRef(false)
    const productoSeleccionadoRef = useRef(false)

    const [items, setItems] = useState<ItemPedido[]>([])
    const [editingItemId, setEditingItemId] = useState<string | null>(null)
    const [editCantidad, setEditCantidad] = useState("")
    const [busquedaProducto, setBusquedaProducto] = useState("")
    const [productosEncontrados, setProductosEncontrados] = useState<Producto[]>([])
    const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false)
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
    const [itemCantidad, setItemCantidad] = useState("1")
    const [itemTipo, setItemTipo] = useState<"metros" | "pieza">("metros")
    const [itemIndicaciones, setItemIndicaciones] = useState("")
    const [costoEnvio, setCostoEnvio] = useState("0")
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

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (mostrarDropdown && !(e.target as HTMLElement).closest('[data-cliente-dropdown]') && !(e.target as HTMLElement).closest('[data-cliente-input]')) {
                setMostrarDropdown(false)
            }
        }
        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [mostrarDropdown])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (mostrarDropdownAgencia && !(e.target as HTMLElement).closest('[data-agencia-dropdown]') && !(e.target as HTMLElement).closest('[data-agencia-toggle]')) {
                setMostrarDropdownAgencia(false)
            }
        }
        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [mostrarDropdownAgencia])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (mostrarDropdownProducto && !(e.target as HTMLElement).closest('[data-producto-dropdown]') && !(e.target as HTMLElement).closest('[data-producto-input]')) {
                setMostrarDropdownProducto(false)
            }
        }
        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [mostrarDropdownProducto])

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
            if (clienteSeleccionadoRef.current) {
                clienteSeleccionadoRef.current = false
                return
            }
            setBuscandoCliente(true)
            try {
                const res = await fetch(`/api/cliente-buscar?q=${encodeURIComponent(clienteBusqueda)}`, { credentials: "include" })
                const json = await res.json()
                if (json.success) {
                    setClientesEncontrados(json.clientes || [])
                    setMostrarDropdown(true)
                }
            } catch (e) {
                console.error("Error buscando cliente:", e)
            } finally {
                setBuscandoCliente(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [clienteBusqueda])

    const buscarProductos = useCallback(async (query: string) => {
        if (query.length < 2) {
            setProductosEncontrados([])
            setMostrarDropdownProducto(false)
            return
        }

        if (productoSeleccionadoRef.current) {
            productoSeleccionadoRef.current = false
            return
        }

        try {
            const res = await fetch(`/api/productos?search=${encodeURIComponent(query)}`, { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                setProductosEncontrados(json.productos || [])
                setMostrarDropdownProducto(true)
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
        clienteSeleccionadoRef.current = true
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
        setErrorDoc("")
        setErrorTel("")
        setClienteBusqueda("")
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
            cantidad: Number(itemCantidad) || 0,
            tipo: itemTipo,
            indicacionesCorte: itemIndicaciones
        }

        setItems([...items, nuevoItem])
        
        setProductoSeleccionado(null)
        setBusquedaProducto("")
        setItemCantidad("1")
        setItemTipo("metros")
        setItemIndicaciones("")
        setMostrarDropdownProducto(false)
    }

    const eliminarItem = (id: string) => {
        setItems(items.filter(i => i.id !== id))
    }

    const startEditItem = (item: ItemPedido) => {
        setEditingItemId(item.id)
        setEditCantidad(item.cantidad.toString())
    }

    const saveEditItem = () => {
        if (!editingItemId) return
        const cantidad = Number(editCantidad) || 0
        if (cantidad <= 0) return
        setItems(items.map(i => i.id === editingItemId ? { ...i, cantidad } : i))
        setEditingItemId(null)
    }

    const cancelEditItem = () => {
        setEditingItemId(null)
    }

    const calcularSubtotal = () => {
        return items.reduce((sum, item) => {
            const metros = item.tipo === "pieza" ? 50 : 1
            return sum + (item.productoPrecio * item.cantidad * metros)
        }, 0)
    }

    const calcularTotal = () => {
        return calcularSubtotal() + (Number(costoEnvio) || 0)
    }

    const validarDocumento = (): string | null => {
        const doc = cliente.numeroDoc
        if (!doc) { setErrorDoc("Número de documento requerido"); return "Número de documento requerido" }
        if (!/^\d+$/.test(doc)) { setErrorDoc("El documento solo puede contener números"); return "El documento solo puede contener números" }
        if (cliente.tipoDoc === "dni" && doc.length !== 8) { setErrorDoc("DNI debe tener exactamente 8 dígitos"); return "DNI debe tener exactamente 8 dígitos" }
        if (cliente.tipoDoc === "ruc" && doc.length !== 11) { setErrorDoc("RUC debe tener exactamente 11 dígitos"); return "RUC debe tener exactamente 11 dígitos" }
        if (cliente.tipoDoc === "ce" && doc.length < 4) { setErrorDoc("CE debe tener al menos 4 dígitos"); return "CE debe tener al menos 4 dígitos" }
        setErrorDoc("")
        return null
    }

    const validarTelefono = (): string | null => {
        const tel = cliente.telefono
        if (!tel) { setErrorTel(""); return null }
        if (!/^\d+$/.test(tel)) { setErrorTel("El teléfono solo puede contener números"); return "El teléfono solo puede contener números" }
        if (tel.length !== 9) { setErrorTel("Teléfono debe tener exactamente 9 dígitos"); return "Teléfono debe tener exactamente 9 dígitos" }
        setErrorTel("")
        return null
    }

    const crearPedido = async () => {
        if (!empresa || !metodoPago || !cliente.nombre || !cliente.numeroDoc || items.length === 0) {
            setToastMessage({ show: true, message: "Complete todos los campos requeridos", type: "error" })
            return
        }

        const errorDoc = validarDocumento()
        if (errorDoc) {
            setToastMessage({ show: true, message: errorDoc, type: "error" })
            return
        }

        const errorTel = validarTelefono()
        if (errorTel) {
            setToastMessage({ show: true, message: errorTel, type: "error" })
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
                        departamento: cliente.departamento || null,
                        provincia: cliente.provincia || null,
                        distrito: cliente.distrito || null,
                        agenciaOtro
                    },
                    agencia,
                    guiaRemision,
                    costoEnvio: Number(costoEnvio) || 0,
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
        setErrorDoc("")
        setErrorTel("")
        setAgencia("")
        setAgenciaOtro("")
        setGuiaRemision(false)
        setItems([])
        setCostoEnvio("0")
        setObservaciones("")
        setMostrarUbicacion(false)
    }

    if (!isOpen) return null

    const inputBase = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
    const inputStep1 = "w-full px-3 py-2.5 border-2 border-blue-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
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
                        <div>
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
                                                className={`px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all ${
                                                    empresa === emp 
                                                        ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                                                        : "border-blue-300 text-slate-600 hover:border-blue-400 hover:bg-blue-50"
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
                                                className={`px-3 py-1.5 border-2 rounded-lg text-sm font-medium transition-all ${
                                                    metodoPago === mp 
                                                        ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                                                        : "border-blue-300 text-slate-600 hover:border-blue-400 hover:bg-blue-50"
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
                                            data-cliente-input
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
                                            className={`${inputStep1} pl-10 pr-10`}
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
                                        {mostrarDropdown && (
                                            <div data-cliente-dropdown className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                                {clientesEncontrados.length > 0 ? (
                                                    clientesEncontrados.map(c => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => seleccionarCliente(c)}
                                                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors"
                                                        >
                                                            <p className="font-medium text-slate-900 text-sm">{c.nombre}</p>
                                                            <p className="text-xs text-slate-400">{c.numeroDoc}{c.telefono ? ` • ${c.telefono}` : ""}</p>
                                                        </button>
                                                    ))
                                                ) : !buscandoCliente && clienteBusqueda.length >= 2 ? (
                                                    <div className="px-4 py-3 text-sm text-slate-400 text-center">
                                                        No se encontraron clientes
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                    {(clienteBusqueda || cliente.nombre || cliente.numeroDoc) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setClienteBusqueda("")
                                                setClientesEncontrados([])
                                                setMostrarDropdown(false)
                                                setCliente({ nombre: "", tipoDoc: "dni", numeroDoc: "", direccion: "", telefono: "", departamento: "", provincia: "", distrito: "" })
                                                setErrorDoc("")
                                                setErrorTel("")
                                                setAgencia("")
                                                setAgenciaOtro("")
                                                setGuiaRemision(false)
                                                setMostrarUbicacion(false)
                                            }}
                                            className="mt-2 text-xs text-slate-500 hover:text-slate-700 underline flex items-center gap-1"
                                        >
                                            Limpiar todo
                                        </button>
                                    )}
                                </div>

                                {/* Datos del cliente */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelBase}>Nombre / Razón Social</label>
                                        <input
                                            type="text"
                                            value={cliente.nombre}
                                            onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                                            className={inputStep1}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-20 shrink-0">
                                            <label className={labelBase}>Tipo</label>
                                            <select
                                                value={cliente.tipoDoc}
                                                onChange={(e) => {
                                                    setCliente({ ...cliente, tipoDoc: e.target.value, numeroDoc: "" })
                                                    setErrorDoc("")
                                                }}
                                                className={inputStep1}
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
                                                    inputMode="numeric"
                                                    value={cliente.numeroDoc}
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    if (val === "" || /^\d+$/.test(val)) {
                                                        setCliente({ ...cliente, numeroDoc: val })
                                                        setErrorDoc("")
                                                    }
                                                }}
                                                    maxLength={cliente.tipoDoc === "dni" ? 8 : cliente.tipoDoc === "ruc" ? 11 : 20}
                                                    className={`${inputStep1} flex-1`}
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
                                            className={inputStep1}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelBase}>Teléfono</label>
                                        <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={cliente.telefono}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        if (val === "" || /^\d+$/.test(val)) {
                                                            setCliente({ ...cliente, telefono: val })
                                                            setErrorTel("")
                                                        }
                                                    }}
                                                    maxLength={9}
                                                    className={`${inputStep1} flex-1`}
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
                                        {errorTel && <p className="text-xs text-red-500 mt-1">{errorTel}</p>}
                                    </div>
                                    <div>
                                        <label className={labelBase}>Agencia</label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                ref={agenciaToggleRef}
                                                data-agencia-toggle
                                                onClick={() => {
                                                    if (!mostrarDropdownAgencia && agenciaToggleRef.current) {
                                                        const rect = agenciaToggleRef.current.getBoundingClientRect()
                                                        setAgenciaDropdownPos({ top: rect.top - 4, left: rect.left, width: rect.width })
                                                    }
                                                    setMostrarDropdownAgencia(!mostrarDropdownAgencia)
                                                }}
                                                className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm text-left transition-all bg-white ${agencia ? "text-slate-900 border-blue-300" : "text-slate-400 border-blue-300"}`}
                                            >
                                                {agencia ? AGENCIAS.find(a => a.value === agencia)?.label : "Seleccionar..."}
                                            </button>
                                        </div>
                                    </div>
                                    {agencia === "otros" && (
                                        <div>
                                            <label className={labelBase}>Nombre de la agencia</label>
                                            <input
                                                type="text"
                                                value={agenciaOtro}
                                                onChange={(e) => setAgenciaOtro(e.target.value)}
                                                className={inputStep1}
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
                                                    className={inputStep1}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelBase}>Provincia</label>
                                                <input
                                                    type="text"
                                                    value={cliente.provincia || ""}
                                                    onChange={(e) => setCliente({ ...cliente, provincia: e.target.value })}
                                                    className={inputStep1}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelBase}>Distrito</label>
                                                <input
                                                    type="text"
                                                    value={cliente.distrito || ""}
                                                    onChange={(e) => setCliente({ ...cliente, distrito: e.target.value })}
                                                    className={inputStep1}
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
                                            {errorDoc && <p className="text-xs text-red-500 mt-1">{errorDoc}</p>}
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
                                                    data-producto-input
                                                    value={busquedaProducto}
                                                    onChange={(e) => {
                                                        setBusquedaProducto(e.target.value)
                                                    }}
                                                    onFocus={() => {
                                                        if (productosEncontrados.length > 0 || busquedaProducto.length >= 2) {
                                                            setMostrarDropdownProducto(true)
                                                        }
                                                    }}
                                                    placeholder="Buscar producto..."
                                                    className={`${inputBase} pl-10 pr-10`}
                                                />
                                                {mostrarDropdownProducto && (
                                                    <div data-producto-dropdown className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                                                        {productosEncontrados.length > 0 ? (
                                                            productosEncontrados.map(p => (
                                                                <button
                                                                    key={p.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        productoSeleccionadoRef.current = true
                                                                        setProductoSeleccionado(p)
                                                                        setBusquedaProducto(p.nombre)
                                                                        setMostrarDropdownProducto(false)
                                                                    }}
                                                                    className="w-full px-3 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="inline-flex px-1.5 py-0.5 bg-slate-600 text-white rounded text-[10px] font-bold shrink-0">{p.categoria}</span>
                                                                        <p className="font-medium text-slate-900 text-sm truncate">{p.nombre}</p>
                                                                    </div>
                                                                    <p className="text-xs text-slate-400">S/ {Number(p.precio).toFixed(2)}</p>
                                                                </button>
                                                            ))
                                                        ) : busquedaProducto.length >= 2 ? (
                                                            <div className="px-3 py-3 text-sm text-slate-400 text-center">
                                                                No se encontraron productos
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                )}
                                                {busquedaProducto && (
                                                    <button
                                                        onClick={() => {
                                                            setBusquedaProducto("")
                                                            setProductosEncontrados([])
                                                            setMostrarDropdownProducto(false)
                                                            setProductoSeleccionado(null)
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                                    >
                                                        <X className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <select
                                                    value={itemTipo}
                                                    onChange={(e) => {
                                                        const nuevoTipo = e.target.value as "metros" | "pieza"
                                                        setItemTipo(nuevoTipo)
                                                        if (nuevoTipo === "pieza" && itemCantidad.includes(".")) {
                                                            setItemCantidad(Math.ceil(Number(itemCantidad) || 1).toString())
                                                        }
                                                    }}
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
                                                    type="text"
                                                    inputMode={itemTipo === "pieza" ? "numeric" : "decimal"}
                                                    value={itemCantidad}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        const regex = itemTipo === "pieza" ? /^\d+$/ : /^\d*\.?\d*$/
                                                        if (val === "" || regex.test(val)) {
                                                            setItemCantidad(val)
                                                        }
                                                    }}
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
                                        <div className="flex flex-col sm:flex-row gap-2 items-start">
                                            <Button
                                                onClick={agregarItem}
                                                disabled={!productoSeleccionado || Number(itemCantidad) <= 0}
                                                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <Plus className="h-4 w-4 mr-1" /> Agregar artículo
                                            </Button>
                                            {(busquedaProducto || productoSeleccionado || itemIndicaciones) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setBusquedaProducto("")
                                                        setProductosEncontrados([])
                                                        setMostrarDropdownProducto(false)
                                                        setProductoSeleccionado(null)
        setItemCantidad("1")
                                                        setItemTipo("metros")
                                                        setItemIndicaciones("")
                                                    }}
                                                    className="text-xs text-slate-500 hover:text-slate-700 underline flex items-center gap-1 self-center"
                                                >
                                                    Limpiar todo
                                                </button>
                                            )}
                                        </div>
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
                                                        const isEditing = editingItemId === item.id
                                                        return (
                                                            <tr key={item.id} className={`border-t border-slate-50 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="inline-flex px-1.5 py-0.5 bg-slate-600 text-white rounded text-[10px] font-bold shrink-0">{item.productoCategoria}</span>
                                                                        <p className="font-bold text-slate-900 text-sm truncate">{item.productoNombre}</p>
                                                                    </div>
                                                                    {item.indicacionesCorte && (
                                                                        <p className="text-xs text-amber-600 mt-0.5 truncate max-w-[200px]" title={item.indicacionesCorte}>{item.indicacionesCorte}</p>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    {isEditing ? (
                                                                        <input
                                                                            type="text"
                                                                            inputMode={item.tipo === "pieza" ? "numeric" : "decimal"}
                                                                            value={editCantidad}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value
                                                                                const regex = item.tipo === "pieza" ? /^\d+$/ : /^\d*\.?\d*$/
                                                                                if (val === "" || regex.test(val)) {
                                                                                    setEditCantidad(val)
                                                                                }
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter") saveEditItem()
                                                                                if (e.key === "Escape") cancelEditItem()
                                                                            }}
                                                                            autoFocus
                                                                            className="w-20 px-2 py-1 border border-slate-300 rounded text-center text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-lg font-bold text-slate-900">{item.cantidad}</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${item.tipo === "pieza" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                                                                        {item.tipo === "pieza" ? "Pieza" : "Metros"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <span className="text-lg font-bold text-slate-900">S/ {item.productoPrecio.toFixed(2)} /mts</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-semibold text-slate-900">S/ {subtotal.toFixed(2)}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        {isEditing ? (
                                                                            <>
                                                                                <button onClick={saveEditItem} className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors">
                                                                                    <Check className="h-4 w-4" />
                                                                                </button>
                                                                                <button onClick={cancelEditItem} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                                    <X className="h-4 w-4" />
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <button onClick={() => startEditItem(item)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                                                                    <Pencil className="h-4 w-4" />
                                                                                </button>
                                                                                <button onClick={() => eliminarItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                                                    <Trash2 className="h-4 w-4" />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
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
                                                const isEditing = editingItemId === item.id
                                                return (
                                                    <div key={item.id} className="bg-white border border-slate-100 rounded-lg p-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="inline-flex px-1.5 py-0.5 bg-slate-600 text-white rounded text-[10px] font-bold shrink-0">{item.productoCategoria}</span>
                                                                    <p className="font-bold text-slate-900 text-sm truncate">{item.productoNombre}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {isEditing ? (
                                                                        <input
                                                                            type="text"
                                                                            inputMode={item.tipo === "pieza" ? "numeric" : "decimal"}
                                                                            value={editCantidad}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value
                                                                                const regex = item.tipo === "pieza" ? /^\d+$/ : /^\d*\.?\d*$/
                                                                                if (val === "" || regex.test(val)) {
                                                                                    setEditCantidad(val)
                                                                                }
                                                                            }}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === "Enter") saveEditItem()
                                                                                if (e.key === "Escape") cancelEditItem()
                                                                            }}
                                                                            autoFocus
                                                                            className="w-20 px-2 py-1 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-sm font-bold text-slate-900">{item.cantidad} {item.tipo === "pieza" ? "pieza(s)" : "metro(s)"}</span>
                                                                    )}
                                                                    <span className="text-xs text-slate-300">•</span>
                                                                    <span className="text-sm font-bold text-slate-900">S/ {item.productoPrecio.toFixed(2)} /mts</span>
                                                                </div>
                                                                {item.indicacionesCorte && (
                                                                    <p className="text-xs text-amber-600 mt-1 truncate">{item.indicacionesCorte}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <p className="font-semibold text-slate-900 text-sm">S/ {subtotal.toFixed(2)}</p>
                                                                <div className="flex gap-1">
                                                                    {isEditing ? (
                                                                        <>
                                                                            <button onClick={saveEditItem} className="p-1.5 text-slate-400 hover:text-green-500 rounded">
                                                                                <Check className="h-4 w-4" />
                                                                            </button>
                                                                            <button onClick={cancelEditItem} className="p-1.5 text-slate-400 hover:text-red-500 rounded">
                                                                                <X className="h-4 w-4" />
                                                                            </button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <button onClick={() => startEditItem(item)} className="p-1.5 text-slate-400 hover:text-blue-500 rounded">
                                                                                <Pencil className="h-4 w-4" />
                                                                            </button>
                                                                            <button onClick={() => eliminarItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded">
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
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
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={costoEnvio}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                                            setCostoEnvio(val)
                                                        }
                                                    }}
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

            {mostrarDropdownAgencia && agenciaDropdownPos && (
                <div
                    data-agencia-dropdown
                    className="bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-[10001] min-w-[200px]"
                    style={{ position: "fixed", top: agenciaDropdownPos.top, left: agenciaDropdownPos.left, width: agenciaDropdownPos.width, transform: "translateY(-100%)" }}
                >
                    <button
                        type="button"
                        onClick={() => { setAgencia(""); setMostrarDropdownAgencia(false) }}
                        className="w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors text-sm text-slate-400"
                    >
                        Seleccionar...
                    </button>
                    {AGENCIAS.map(a => (
                        <button
                            key={a.value}
                            type="button"
                            onClick={() => { setAgencia(a.value); setMostrarDropdownAgencia(false) }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors text-sm ${agencia === a.value ? "bg-slate-50 font-medium text-slate-900" : "text-slate-700"}`}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )

    return isMounted ? createPortal(modalContent, document.body) : null
}
