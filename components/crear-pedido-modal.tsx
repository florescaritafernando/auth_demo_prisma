"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { 
    X, Search, Plus, Trash2, FileText, Printer, Send, Save, 
    ArrowLeft, ArrowRight, Check, Package, Ruler, Loader2
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

    // Datos del cliente
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

    // Datos del pedido
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

    // Buscar cliente con debounce
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

    // Buscar productos
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
        setCliente(c)
        setClienteBusqueda(c.nombre)
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
        
        // Reset
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
                        agenciaOtro,
                        departamento: cliente.departamento,
                        provincia: cliente.provincia,
                        distrito: cliente.distrito
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
    }

    if (!isOpen) return null

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
                {/* Header */}
                <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold">Crear Pedido</h2>
                        <p className="text-sm text-slate-300">Paso {step} de 2</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Toast */}
                {toastMessage.show && (
                    <div className="fixed top-20 right-4 z-[10000] animate-slide-in">
                        <div className={`px-4 py-3 rounded-lg shadow-lg border ${
                            toastMessage.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"
                        }`}>
                            <p className="font-medium">{toastMessage.message}</p>
                        </div>
                    </div>
                )}

                {/* Contenido */}
                <div className="p-6">
                    {step === 1 ? (
                        <div className="space-y-6">
                            {/* Empresa */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Empresa</label>
                                <div className="flex gap-2">
                                    {EMPRESAS.map(emp => (
                                        <button
                                            key={emp}
                                            onClick={() => setEmpresa(emp)}
                                            className={`flex-1 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                                empresa === emp 
                                                    ? "bg-blue-50 border-blue-500 text-blue-700" 
                                                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {emp}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Método de pago */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Método de Pago</label>
                                <div className="flex flex-wrap gap-2">
                                    {METODOS_PAGO.map(mp => (
                                        <button
                                            key={mp}
                                            onClick={() => setMetodoPago(mp)}
                                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                                                metodoPago === mp 
                                                    ? "bg-blue-50 border-blue-500 text-blue-700" 
                                                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                                            }`}
                                        >
                                            {mp}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Buscar cliente */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Buscar Cliente</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={clienteBusqueda}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            setClienteBusqueda(val)
                                            if (val.length >= 2) {
                                                // Trigger search manually
                                            } else {
                                                setClientesEncontrados([])
                                                setMostrarDropdown(false)
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || clienteBusqueda.length >= 2) {
                                                setMostrarDropdown(true)
                                            }
                                        }}
                                        onFocus={() => {
                                            if (clientesEncontrados.length > 0 || clienteBusqueda.length >= 2) {
                                                setMostrarDropdown(true)
                                            }
                                        }}
                                        placeholder="Buscar por nombre, RUC o DNI..."
                                        className="w-full pl-10 pr-10 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                    {buscandoCliente && (
                                        <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                                    )}
                                    {clienteBusqueda && (
                                        <button
                                            onClick={() => {
                                                setClienteBusqueda("")
                                                setClientesEncontrados([])
                                                setMostrarDropdown(false)
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                    {mostrarDropdown && clientesEncontrados.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                            {clientesEncontrados.map(c => (
                                                <button
                                                    key={c.id}
                                                    type="button"
                                                    onClick={() => seleccionarCliente(c)}
                                                    className="w-full px-4 py-2 text-left hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
                                                >
                                                    <p className="font-medium text-slate-900">{c.nombre}</p>
                                                    <p className="text-sm text-slate-500">{c.numeroDoc} • {c.telefono || "Sin teléfono"}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Datos del cliente */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre / Razón Social *</label>
                                    <input
                                        type="text"
                                        value={cliente.nombre}
                                        onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-24">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                                        <select
                                            value={cliente.tipoDoc}
                                            onChange={(e) => setCliente({ ...cliente, tipoDoc: e.target.value })}
                                            className="w-full px-2 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm"
                                        >
                                            <option value="dni">DNI</option>
                                            <option value="ruc">RUC</option>
                                            <option value="ce">CE</option>
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Número *</label>
                                        <input
                                            type="text"
                                            value={cliente.numeroDoc}
                                            onChange={(e) => setCliente({ ...cliente, numeroDoc: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                                    <input
                                        type="text"
                                        value={cliente.direccion}
                                        onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono / WhatsApp</label>
                                    <input
                                        type="text"
                                        value={cliente.telefono}
                                        onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Agencia</label>
                                    <select
                                        value={agencia}
                                        onChange={(e) => setAgencia(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {AGENCIAS.map(a => (
                                            <option key={a.value} value={a.value}>{a.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {agencia === "otros" && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Otra Agencia</label>
                                        <input
                                            type="text"
                                            value={agenciaOtro}
                                            onChange={(e) => setAgenciaOtro(e.target.value)}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="guiaRemision"
                                        checked={guiaRemision}
                                        onChange={(e) => setGuiaRemision(e.target.checked)}
                                        className="h-4 w-4 text-blue-600"
                                    />
                                    <label htmlFor="guiaRemision" className="text-sm text-slate-700">Guía de remisión</label>
                                </div>
                            </div>

                            {/* Botones navegación */}
                            <div className="flex justify-between pt-4 border-t">
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        // Guardar estado actual antes de volver
                                        setStep(1)
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={() => setStep(2)}
                                    className="flex items-center gap-2"
                                >
                                    Siguiente <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Agregar producto */}
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <h3 className="font-medium text-slate-900 mb-3">Agregar Artículo</h3>
                                <div className="flex gap-2 mb-3">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            value={busquedaProducto}
                                            onChange={(e) => setBusquedaProducto(e.target.value)}
                                            onFocus={() => productosEncontrados.length > 0 && setMostrarDropdownProducto(true)}
                                            placeholder="Buscar producto..."
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
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
                                                        className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-slate-100 last:border-b-0"
                                                    >
                                                        <p className="font-medium text-slate-900 text-sm">{p.nombre}</p>
                                                        <p className="text-xs text-slate-500">S/ {Number(p.precio).toFixed(2)} • {p.categoria}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <select
                                        value={itemTipo}
                                        onChange={(e) => setItemTipo(e.target.value as "metros" | "pieza")}
                                        className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm"
                                    >
                                        <option value="metros">Metros</option>
                                        <option value="pieza">Pieza</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Cantidad</label>
                                        <input
                                            type="number"
                                            value={itemCantidad}
                                            onChange={(e) => setItemCantidad(Number(e.target.value))}
                                            min={itemTipo === "pieza" ? 1 : 0.1}
                                            step={itemTipo === "pieza" ? 1 : 0.1}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1">Precio Unit.</label>
                                        <input
                                            type="text"
                                            value={productoSeleccionado ? Number(productoSeleccionado.precio).toFixed(2) : "0.00"}
                                            disabled
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm bg-slate-100"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-xs text-slate-500 mb-1">Indicaciones de corte</label>
                                        <input
                                            type="text"
                                            value={itemIndicaciones}
                                            onChange={(e) => setItemIndicaciones(e.target.value)}
                                            placeholder="Ej: Cortar a 1.50m"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={agregarItem}
                                    disabled={!productoSeleccionado || itemCantidad <= 0}
                                    className="mt-3 flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" /> Agregar
                                </Button>
                            </div>

                            {/* Lista de items */}
                            {items.length > 0 ? (
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-slate-600">Artículo</th>
                                                <th className="px-4 py-2 text-center font-medium text-slate-600">Cant.</th>
                                                <th className="px-4 py-2 text-center font-medium text-slate-600">Tipo</th>
                                                <th className="px-4 py-2 text-right font-medium text-slate-600">P.Unit.</th>
                                                <th className="px-4 py-2 text-right font-medium text-slate-600">Subtotal</th>
                                                <th className="px-4 py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(item => {
                                                const metros = item.tipo === "pieza" ? 50 : 1
                                                const subtotal = item.productoPrecio * item.cantidad * metros
                                                return (
                                                    <tr key={item.id} className="border-t border-slate-100">
                                                        <td className="px-4 py-2">
                                                            <p className="font-medium text-slate-900">{item.productoNombre}</p>
                                                            <p className="text-xs text-blue-600">{item.productoCategoria}</p>
                                                            {item.indicacionesCorte && (
                                                                <p className="text-xs text-slate-500">{item.indicacionesCorte}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2 text-center text-slate-900">{item.cantidad}</td>
                                                        <td className="px-4 py-2 text-center text-slate-900">{item.tipo === "pieza" ? "Pieza" : "Metros"}</td>
                                                        <td className="px-4 py-2 text-right text-slate-900">S/ {item.productoPrecio.toFixed(2)}</td>
                                                        <td className="px-4 py-2 text-right font-medium text-slate-900">S/ {subtotal.toFixed(2)}</td>
                                                        <td className="px-4 py-2">
                                                            <button onClick={() => eliminarItem(item.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-500">
                                    <Package className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                                    <p>Sin artículos agregados</p>
                                </div>
                            )}

                            {/* Totales */}
                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Subtotal:</span>
                                        <span className="font-medium text-slate-900">S/ {calcularSubtotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Costo envío:</span>
                                        <input
                                            type="number"
                                            value={costoEnvio}
                                            onChange={(e) => setCostoEnvio(Number(e.target.value))}
                                            min={0}
                                            step={0.01}
                                            className="w-24 px-2 py-1 border border-slate-300 rounded text-right text-slate-900 text-sm"
                                        />
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                                        <span className="text-slate-900">Total:</span>
                                        <span className="text-blue-600">S/ {calcularTotal().toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Observaciones</label>
                                <textarea
                                    value={observaciones}
                                    onChange={(e) => setObservaciones(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    placeholder="Observaciones adicionales..."
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex justify-between items-center pt-4 border-t mt-6">
                                <Button 
                                    variant="outline" 
                                    onClick={() => setStep(1)} 
                                    className="flex items-center gap-2 text-slate-700 border-slate-300 hover:bg-slate-100"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span>Atrás</span>
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" /> PDF
                                    </Button>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Printer className="h-4 w-4" /> Imprimir
                                    </Button>
                                    <Button onClick={crearPedido} disabled={loading || items.length === 0} className="flex items-center gap-2">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                        Crear Pedido
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )

    return isMounted ? createPortal(modalContent, document.body) : null
}