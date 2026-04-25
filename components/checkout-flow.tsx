"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, Check, AlertCircle, AlertTriangle, Package, MapPin, User, CreditCard, Phone, Truck, Store } from "lucide-react"
import { Button } from "@/components/ui/button"

interface CarritoItem {
    id: string
    cantidad: number
    tipo: string
    producto: {
        id: string
        nombre: string
        categoria: string
        precio: number
    }
    cantidadMetros: number
    tipoLabel: string
    metrosPorPieza: number
    precioUnitario: number
    precioTotal: number
}

interface CheckoutData {
    tipoDocumento: string
    numeroDoc: string
    nombreFactura: string
    direccion: string
    ciudad: string
    metodoEnvio: string
    agencia: string
    agenciaOtro: string
    dniRecibe: string
    nombreRecibe: string
    celularRecibe: string
    numeroOperacion: string
}

const PASOS = [
    { num: 1, titulo: "Carrito", desc: "Revisa tus productos" },
    { num: 2, titulo: "Facturación", desc: "Datos de pago" },
    { num: 3, titulo: "Envío", desc: "Método de entrega" },
    { num: 4, titulo: "Pago", desc: "Resumen y operación" }
]

export default function CheckoutPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [items, setItems] = useState<CarritoItem[]>([])
    const [data, setData] = useState<CheckoutData>({
        tipoDocumento: "",
        numeroDoc: "",
        nombreFactura: "",
        direccion: "",
        ciudad: "",
        metodoEnvio: "",
        agencia: "",
        agenciaOtro: "",
        dniRecibe: "",
        nombreRecibe: "",
        celularRecibe: "",
        numeroOperacion: ""
    })
    const [editandoItem, setEditandoItem] = useState<string | null>(null)
    const [editCantidad, setEditCantidad] = useState(1)
    const [editTipo, setEditTipo] = useState("metros")
    const [pedidoCreado, setPedidoCreado] = useState<any>(null)
    const [showMetrajePopup, setShowMetrajePopup] = useState(false)
    const [pedidoId, setPedidoId] = useState<string | null>(null)
    const [continuarPedido, setContinuarPedido] = useState<any>(null)

    const metrosPorPieza = 50

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const pedidoParam = params.get("pedido")
        if (pedidoParam) {
            setPedidoId(pedidoParam)
            fetchPedido(pedidoParam)
        } else {
            setStep(1)
            fetchCarrito()
        }
    }, [])

    const fetchPedido = async (id: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/pedidos/${id}`, { credentials: "include" })
            const json = await res.json()
            console.log("FetchPedido response:", json)
            if (json.success && json.pedido) {
                const pedido = json.pedido
                setContinuarPedido(pedido)
                console.log("Pedido data:", JSON.stringify(pedido, null, 2))
                
                setData({
                    tipoDocumento: pedido.tipoDocumento || "",
                    numeroDoc: pedido.numeroDoc || "",
                    nombreFactura: pedido.nombreFactura || "",
                    direccion: pedido.direccion || "",
                    ciudad: pedido.ciudad || "",
                    metodoEnvio: pedido.metodoEnvio || "",
                    agencia: pedido.agencia || "",
                    agenciaOtro: pedido.agenciaOtro || "",
                    dniRecibe: pedido.dniRecibe || "",
                    nombreRecibe: pedido.nombreRecibe || "",
                    celularRecibe: pedido.celularRecibe || "",
                    numeroOperacion: pedido.numeroOperacion === "012345678" ? "" : (pedido.numeroOperacion || "")
                })

                const itemsFromPedido = (pedido.pedidoDetalle || []).map((detalle: any) => ({
                    id: detalle.id,
                    cantidad: detalle.cantidad,
                    tipo: detalle.tipo,
                    producto: detalle.producto || {
                        id: detalle.productoId,
                        nombre: "Producto",
                        categoria: "",
                        precio: detalle.precio
                    },
                    cantidadMetros: detalle.tipo === "pieza" ? (detalle.metraje || 50) : detalle.cantidad,
                    tipoLabel: detalle.tipo,
                    metrosPorPieza: 50,
                    precioUnitario: detalle.tipo === "pieza" ? Number(detalle.precio) * (detalle.metraje || 50) : Number(detalle.precio),
                    precioTotal: detalle.tipo === "pieza" ? Number(detalle.precio) * (detalle.metraje || 50) * detalle.cantidad : Number(detalle.precio) * detalle.cantidad
                }))
                console.log("Items from pedido:", itemsFromPedido)
                setItems(itemsFromPedido)
                setStep(4)
            }
        } catch (e) {
            console.error("Error fetching pedido:", e)
            setError("Error al cargar el pedido")
        } finally {
            setLoading(false)
        }
    }

    const fetchCarrito = async () => {
        try {
            const res = await fetch("/api/carrito", { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                const itemsConPrecio = (json.items || []).map((item: any) => ({
                    ...item,
                    cantidadMetros: item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad,
                    precioUnitario: item.tipo === "pieza" ? Number(item.producto.precio) * metrosPorPieza : Number(item.producto.precio),
                    precioTotal: item.tipo === "pieza" ? Number(item.producto.precio) * metrosPorPieza * item.cantidad : Number(item.producto.precio) * item.cantidad
                }))
                setItems(itemsConPrecio)
            }
        } catch (e) {
            console.error("Error fetching cart:", e)
        }
    }

    const calcularSubtotal = useCallback(() => {
        return items.reduce((sum, item) => sum + item.precioTotal, 0)
    }, [items])

    const calcularCostoEnvio = useCallback(() => {
        if (data.metodoEnvio === "retiro") return 0
        const subtotal = calcularSubtotal()
        if (subtotal >= 3000) return 30
        if (subtotal >= 1500) return 20
        if (subtotal >= 500) return 15
        return 10
    }, [data.metodoEnvio, calcularSubtotal])

    const calcularTotal = useCallback(() => {
        return calcularSubtotal() + calcularCostoEnvio()
    }, [calcularSubtotal, calcularCostoEnvio])

    const eliminarItem = async (itemId: string) => {
        try {
            const res = await fetch("/api/carrito", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "eliminar", carritoId: itemId }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                setItems(items.filter(i => i.id !== itemId))
            }
        } catch (e) {
            console.error("Error deleting:", e)
        }
    }

    const guardarEdicion = async (itemId: string) => {
        try {
            const res = await fetch("/api/carrito", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: "actualizar", 
                    carritoId: itemId, 
                    cantidad: editCantidad,
                    tipo: editTipo 
                }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                setEditandoItem(null)
                fetchCarrito()
            }
        } catch (e) {
            console.error("Error updating:", e)
        }
    }

    const iniciarEdicion = (item: CarritoItem) => {
        setEditandoItem(item.id)
        setEditCantidad(item.cantidad)
        setEditTipo(item.tipo)
    }

    const handleInputChange = (field: keyof CheckoutData, value: string) => {
        setData(prev => ({ ...prev, [field]: value }))
        if (field === "metodoEnvio") {
            setData(prev => ({ ...prev, metodoEnvio: value, agencia: "", agenciaOtro: "" }))
        }
    }

    const tienePiezas = useMemo(() => {
        return items && items.length > 0 ? items.some((item: any) => item.tipo === "pieza") : false
    }, [items])

    const validarPaso = useCallback((paso: number): boolean => {
        switch (paso) {
            case 1:
                return items.length > 0
            case 2:
                return data.tipoDocumento && data.numeroDoc && data.nombreFactura && data.direccion
            case 3:
                if (!data.metodoEnvio) return false
                if (data.metodoEnvio === "agencia" && !data.agencia) return false
                if (data.metodoEnvio === "agencia" && data.agencia === "otros" && !data.agenciaOtro) return false
                if (data.metodoEnvio === "otrapersona") {
                    return data.dniRecibe && data.nombreRecibe
                }
                return true
            case 4:
                if (continuarPedido) return data.numeroOperacion && data.numeroOperacion.length > 0
                if (tienePiezas) return true
                return data.numeroOperacion && data.numeroOperacion.length > 0
            default:
                return true
        }
    }, [items, data])

    const crearPedido = async () => {
        if (tienePiezas) {
            setShowMetrajePopup(true)
            return
        }
        setLoading(true)
        setError("")
        
        try {
            const itemsParaApi = items.map(item => ({
                productoId: item.producto.id,
                cantidad: item.cantidad,
                tipo: item.tipo,
                precio: item.producto.precio
            }))

            const res = await fetch("/api/pedidos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipoDocumento: data.tipoDocumento,
                    numeroDoc: data.numeroDoc,
                    nombreFactura: data.nombreFactura,
                    direccion: data.direccion,
                    ciudad: data.ciudad,
                    metodoEnvio: data.metodoEnvio,
                    agencia: data.agencia,
                    agenciaOtro: data.agenciaOtro,
                    dniRecibe: data.dniRecibe,
                    nombreRecibe: data.nombreRecibe,
                    celularRecibe: data.celularRecibe,
                    numeroOperacion: data.numeroOperacion,
                    items: itemsParaApi
                }),
                credentials: "include"
            })

            const json = await res.json()
            
            if (json.success) {
                setPedidoCreado(json.pedido)
                setStep(5)
            } else {
                setError(json.error || "Error al crear pedido")
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const crearPedidoConMetrajeTemporal = async () => {
        setLoading(true)
        setError("")
        
        try {
            const itemsParaApi = items.map(item => ({
                productoId: item.producto.id,
                cantidad: item.cantidad,
                tipo: item.tipo,
                precio: item.producto.precio
            }))

            const res = await fetch("/api/pedidos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipoDocumento: data.tipoDocumento,
                    numeroDoc: data.numeroDoc,
                    nombreFactura: data.nombreFactura,
                    direccion: data.direccion,
                    ciudad: data.ciudad,
                    metodoEnvio: data.metodoEnvio,
                    agencia: data.agencia,
                    agenciaOtro: data.agenciaOtro,
                    dniRecibe: data.dniRecibe,
                    nombreRecibe: data.nombreRecibe,
                    celularRecibe: data.celularRecibe,
                    numeroOperacion: "012345678",
                    items: itemsParaApi
                }),
                credentials: "include"
            })

            const json = await res.json()
            
            if (json.success) {
                alert(json.mensaje || "Orden de compra creada correctamente. Pendiente de recibir metraje de piezas.")
                router.push("/dashboard/pedidos")
            } else {
                setError(json.error || "Error al crear pedido")
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    if (pedidoCreado) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    ¡Felicidades!
                </h2>
                <p className="text-slate-600 mb-4">
                    Tu orden de compra <strong>{pedidoCreado.numeroOrden}</strong> está siendo gestionada a la brevedad.
                </p>
                <Button onClick={() => router.push("/dashboard/pedidos")}>
                    Ver Mis Pedidos
                </Button>
            </div>
        )
    }

    const finalizarPedidoExistente = async () => {
        if (!continuarPedido) return
        
        if (continuarPedido.estado === "metraje_confirmado" && !data.numeroOperacion) {
            setError("Por favor ingresa tu número de operación de pago")
            return
        }
        
        setLoading(true)
        setError("")
        
        try {
            const res = await fetch(`/api/pedidos/${continuarPedido.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    estado: "confirmado",
                    numeroOperacion: data.numeroOperacion
                }),
                credentials: "include"
            })
            
            const json = await res.json()
            
            if (json.success) {
                setPedidoCreado(continuarPedido)
                setStep(5)
            } else {
                setError(json.error || "Error al finalizar pedido")
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            )}

            {step < 5 && (
                <div className="mb-8">
                    {continuarPedido && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <Check className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="font-bold text-green-800">¡Metraje Confirmado!</p>
                                <p className="text-sm text-green-700">
                                    Orden {continuarPedido.numeroOrden} - Ahora puedes completar el pago
                                </p>
                            </div>
                        </div>
                    )}
                    
                    {continuarPedido ? (
                        <div className="bg-slate-100 rounded-xl p-4 text-center">
                            <p className="font-bold text-slate-700 text-lg">Paso 4: Resumen y Pago</p>
                            <p className="text-sm text-slate-500">Revisa el resumen y completa el pago</p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between mb-2">
                            {PASOS.map((p, idx) => (
                                <div key={p.num} className="flex items-center flex-1">
                                    <div className={`flex flex-col items-center ${idx > 0 ? 'flex-1' : ''}`}>
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                                            step === p.num 
                                                ? "bg-slate-900 text-white ring-4 ring-yellow-400" 
                                                : step > p.num 
                                                    ? "bg-green-600 text-white" 
                                                    : "bg-slate-200 text-slate-500"
                                        }`}>
                                            {step > p.num ? <Check className="h-6 w-6" /> : p.num}
                                        </div>
                                        <span className={`text-xs mt-1 font-medium ${step === p.num ? 'text-slate-900' : 'text-slate-500'}`}>
                                            {p.titulo}
                                        </span>
                                    </div>
                                    {idx < PASOS.length - 1 && (
                                        <div className={`h-1 flex-1 mx-2 rounded ${step > p.num ? 'bg-green-600' : 'bg-slate-200'}`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {step === 1 && (
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Tu Carrito</h2>
                    
                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 mb-4">Tu carrito está vacío</p>
                            <Button onClick={() => router.push("/dashboard")}>
                                Ver Productos
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-4">
                                    <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                        <ShoppingCart className="h-8 w-8 text-slate-400" />
                                    </div>
                                    
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">{item.producto.nombre}</h3>
                                        <p className="text-sm text-slate-500">{item.producto.categoria}</p>
                                        
                                        {editandoItem === item.id ? (
                                            <div className="mt-2 flex gap-2 items-center">
                                                <select 
                                                    value={editTipo} 
                                                    onChange={e => setEditTipo(e.target.value)}
                                                    className="border rounded px-2 py-1 text-sm"
                                                >
                                                    <option value="metros">Metros</option>
                                                    <option value="pieza">Piezas</option>
                                                </select>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    value={editCantidad}
                                                    onChange={e => setEditCantidad(Number(e.target.value))}
                                                    className="border rounded px-2 py-1 w-16 text-sm"
                                                />
                                                <Button size="sm" onClick={() => guardarEdicion(item.id)}>
                                                    Guardar
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => setEditandoItem(null)}>
                                                    Cancelar
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="mt-1">
                                                <p className="text-sm text-blue-600">
                                                    {item.cantidad} {item.tipo === "metros" ? "metros" : `piezas (~${item.cantidadMetros}m)`}
                                                </p>
                                                <p className="font-bold text-slate-900">S/ {item.precioTotal.toFixed(2)}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col gap-2">
                                        {editandoItem !== item.id && (
                                            <>
                                                <button 
                                                    onClick={() => iniciarEdicion(item)}
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    Editar
                                                </button>
                                                <button 
                                                    onClick={() => eliminarItem(item.id)}
                                                    className="text-sm text-red-500 hover:underline flex items-center gap-1"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Eliminar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            <div className="bg-white rounded-xl border border-slate-200 p-4 flex justify-between items-center">
                                <div>
                                    <span className="font-bold text-slate-700">Subtotal</span>
                                    <p className="text-xs text-slate-500 mt-1">* Los precios de piezas se calculan por metro (1 pieza = 50 metros)</p>
                                </div>
                                <span className="font-bold text-xl text-slate-900">S/ {calcularSubtotal().toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {step === 2 && (
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Datos de Facturación</h2>
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Tipo de Documento *
                            </label>
                            <select 
                                value={data.tipoDocumento}
                                onChange={e => handleInputChange("tipoDocumento", e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            >
                                <option value="">Seleccionar</option>
                                <option value="dni">DNI</option>
                                <option value="ruc">RUC</option>
                                <option value="ce">Carnet de Extranjería</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                {data.tipoDocumento === "ruc" ? "RUC" : "DNI"} *
                            </label>
                            <input 
                                type="text"
                                value={data.numeroDoc}
                                onChange={e => handleInputChange("numeroDoc", e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Nombre o Razón Social *
                            </label>
                            <input 
                                type="text"
                                value={data.nombreFactura}
                                onChange={e => handleInputChange("nombreFactura", e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Dirección *
                            </label>
                            <input 
                                type="text"
                                value={data.direccion}
                                onChange={e => handleInputChange("direccion", e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Ciudad/Provincia/Departamento
                            </label>
                            <input 
                                type="text"
                                value={data.ciudad}
                                onChange={e => handleInputChange("ciudad", e.target.value)}
                                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            />
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Método de Envío</h2>
                    
                    <div className="space-y-4">
                        <button 
                            onClick={() => { handleInputChange("metodoEnvio", "retiro"); handleInputChange("agencia", ""); handleInputChange("agenciaOtro", "") }}
                            className={`w-full bg-white rounded-xl border-2 p-4 flex items-center gap-4 text-left ${
                                data.metodoEnvio === "retiro" ? "border-green-600 bg-green-50" : "border-slate-200"
                            }`}
                        >
                            <Store className="h-8 w-8 text-green-600" />
                            <div>
                                <p className="font-bold text-lg">Retiro en Persona</p>
                                <p className="text-sm text-slate-500">Recoger en nuestro almacén</p>
                            </div>
                            <span className="ml-auto font-bold text-green-600 text-xl">S/ 0.00</span>
                        </button>
                        
                        <button 
                            onClick={() => handleInputChange("metodoEnvio", "agencia")}
                            className={`w-full bg-white rounded-xl border-2 p-4 flex items-center gap-4 text-left ${
                                data.metodoEnvio === "agencia" ? "border-yellow-500 bg-yellow-50" : "border-slate-200"
                            }`}
                        >
                            <Truck className="h-8 w-8 text-yellow-600" />
                            <div>
                                <p className="font-bold text-lg">Agencia de Envíos / Delivery</p>
                                <p className="text-sm text-slate-500">Envío por agencia de transportes</p>
                            </div>
                            <span className="ml-auto font-bold text-yellow-600 text-xl">
                                S/ {calcularCostoEnvio().toFixed(2)}
                            </span>
                        </button>
                        
                        {data.metodoEnvio === "agencia" && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Selecciona agencia/delivery:
                                    </label>
                                    <select 
                                        value={data.agencia}
                                        onChange={e => handleInputChange("agencia", e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                                    >
                                        <option value="">Seleccionar agencia/delivery</option>
                                        <option value="shalom">SHALOM</option>
                                        <option value="flores">FLORES</option>
                                        <option value="marvisur">MARVISUR</option>
                                        <option value="otros">OTROS</option>
                                    </select>
                                </div>
                                
                                {data.agencia === "otros" && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Nombre de la agencia:
                                        </label>
                                        <input 
                                            type="text"
                                            value={data.agenciaOtro}
                                            onChange={e => handleInputChange("agenciaOtro", e.target.value)}
                                            className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <button 
                            onClick={() => { handleInputChange("metodoEnvio", "otrapersona"); handleInputChange("agencia", ""); handleInputChange("agenciaOtro", "") }}
                            className={`w-full bg-white rounded-xl border-2 p-4 flex items-center gap-4 text-left ${
                                data.metodoEnvio === "otrapersona" ? "border-blue-600 bg-blue-50" : "border-slate-200"
                            }`}
                        >
                            <User className="h-8 w-8 text-blue-600" />
                            <div>
                                <p className="font-bold text-lg">Recoge Otra Persona</p>
                                <p className="text-sm text-slate-500">Alguien más recibe el pedido</p>
                            </div>
                        </button>
                        
                        {data.metodoEnvio === "otrapersona" && (
                            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        DNI de quien recibe *
                                    </label>
                                    <input 
                                        type="text"
                                        value={data.dniRecibe}
                                        onChange={e => handleInputChange("dniRecibe", e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Nombres *
                                    </label>
                                    <input 
                                        type="text"
                                        value={data.nombreRecibe}
                                        onChange={e => handleInputChange("nombreRecibe", e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Celular (opcional)
                                    </label>
                                    <input 
                                        type="text"
                                        value={data.celularRecibe}
                                        onChange={e => handleInputChange("celularRecibe", e.target.value)}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                            </div>
)}
                    </div>
                </div>
            )}

            {step === 4 && (
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Resumen y Pago</h2>
                    
                    {continuarPedido && items.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                            <h3 className="font-bold text-slate-700 mb-3">Productos del pedido</h3>
                            <div className="space-y-2">
                                {items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                        <div>
                                            <p className="font-medium text-slate-800">{item.producto.nombre}</p>
                                            <p className="text-xs text-slate-500">
                                                {item.tipo === "pieza" 
                                                    ? `${item.cantidad} pieza(s) • ~${item.cantidadMetros}m` 
                                                    : `${item.cantidad} metros`
                                                }
                                            </p>
                                        </div>
                                        <p className="font-bold text-slate-900">S/ {item.precioTotal.toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-medium">S/ {calcularSubtotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Costo de envío</span>
                            <span className="font-medium">S/ {calcularCostoEnvio().toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                            <span className="font-bold">Total</span>
                            <span className="font-bold text-xl">S/ {calcularTotal().toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mt-4 space-y-3">
                        <p className="font-bold text-slate-800">Métodos de Pago</p>
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            <div>
                                <p><strong>BCP:</strong> 191-655123-22</p>
                                <p><strong>BBVA:</strong> 001-12345678-9</p>
                                <p><strong>Interbank:</strong> 890-123456-78</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-green-600" />
                            <p><strong>Yape/Plin:</strong> 981-404-062</p>
                        </div>
                        <p className="text-xs text-slate-400">Nombre de cuenta: MANCHESTER COLLECTION E.I.R.L.</p>
                    </div>
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <label className="font-bold text-slate-800">Número de Operación *</label>
                            {continuarPedido && (
                                <span className="text-xs text-green-600 font-medium">(Actualizado con metraje confirmado)</span>
                            )}
                        </div>
                        <input 
                            type="text"
                            value={data.numeroOperacion}
                            onChange={e => handleInputChange("numeroOperacion", e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-3 py-2"
                            placeholder="XXXXXXXXX"
                        />
                    </div>
                </div>
            )}

            {step === 4 && continuarPedido && (
                <div className="mt-8 flex gap-4">
                    <Button 
                        variant="outline"
                        onClick={() => router.push("/dashboard/pedidos")}
                        className="flex-1 border-red-500 text-red-600 hover:bg-red-50 font-bold"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={finalizarPedidoExistente}
                        disabled={loading || !validarPaso(step)}
                        className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                    >
                        {loading ? "Procesando..." : "Confirmar y Finalizar"}
                    </Button>
                </div>
            )}

            {step === 4 && !continuarPedido && (
                <div className="mt-8 flex gap-4">
                    <Button 
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="flex-1 border-red-500 text-red-600 hover:bg-red-50 font-bold"
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={crearPedido}
                        disabled={loading || !validarPaso(step)}
                        className="flex-1 bg-green-600 hover:bg-green-700 font-bold"
                    >
                        {loading ? "Procesando..." : "Finalizar Compra"}
                    </Button>
                </div>
            )}

            {!continuarPedido && showMetrajePopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">⚠️ Tu pedido incluye piezas</h2>
                                <p className="text-sm text-slate-500">El metraje exacto está siendo procesado.</p>
                            </div>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">Artículos que requieren metraje:</p>
                            <div className="bg-slate-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                {items.filter(i => i.tipo === "pieza").map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm py-1">
                                        <span className="text-slate-800">{item.producto.nombre}</span>
                                        <span className="text-slate-500">{item.cantidad} piezas</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                Te notificaremos cuando esté listo para continuar.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button 
                                variant="outline"
                                onClick={() => { setShowMetrajePopup(false); router.push("/dashboard") }}
                                className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                            >
                                Cancelar
                            </Button>
                            <Button 
                                onClick={async () => {
                                    setShowMetrajePopup(false)
                                    await crearPedidoConMetrajeTemporal()
                                }}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                            >
                                Aceptar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}