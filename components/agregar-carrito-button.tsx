"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { ShoppingCart, X, AlertCircle, Package, Ruler } from "lucide-react"

interface Stock {
    almacen: { id: string; nombre: string; ciudad: string }
    stock: number
}

interface Producto {
    id: string
    nombre: string
    categoria: string
    precio: number
    descripcion?: string | null
    activo: boolean
    stocks: Stock[]
    imagen: string | null
}

interface Props {
    producto: Producto
    className?: string
}

export function BotonAgregarCarrito({ producto, className = "" }: Props) {
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [tipoPedido, setTipoPedido] = useState<"metros" | "pieza">("metros")
    const [cantidad, setCantidad] = useState<number>(1)
    const [inputValue, setInputValue] = useState("1")
    const [error, setError] = useState("")
    const [isMounted, setIsMounted] = useState(false)
    const [procesando, setProcesando] = useState(false)
    const [toastMessage, setToastMessage] = useState<{ show: boolean; message: string; type: "error" | "success" }>({ show: false, message: "", type: "error" })
    const [cantidadEnCarrito, setCantidadEnCarrito] = useState(0)

    useEffect(() => {
        setInputValue(cantidad === 0 ? "" : String(cantidad))
    }, [cantidad])

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (toastMessage.show) {
            const timer = setTimeout(() => setToastMessage({ show: false, message: "", type: "error" }), 3000)
            return () => clearTimeout(timer)
        }
    }, [toastMessage.show])

    const handleAgregar = async () => {
        if (procesando) return

        const inputNum = parseFloat(inputValue.replace(",", "."))
        const stockTotal = producto.stocks?.reduce((sum: number, s: any) => sum + (s.stock || 0), 0) || 0

        if (tipoPedido === "pieza") {
            const disponible = stockTotal - cantidadEnCarrito
            if (isNaN(inputNum) || inputNum < 1) {
                setToastMessage({ show: true, message: "La cantidad mínima es 1 pieza", type: "error" })
                return
            }
            if (inputNum > disponible) {
                const maximo = disponible > 0 ? disponible : 0
                setToastMessage({ show: true, message: maximo > 0 ? `Stock insuficiente. Máximo disponible: ${maximo} piezas` : "Stock insuficiente", type: "error" })
                return
            }
            if (Math.floor(inputNum) !== cantidad) {
                setCantidad(Math.floor(inputNum))
            }
        } else {
            const disponibleMetros = (stockTotal - cantidadEnCarrito) * 50
            if (isNaN(inputNum) || inputNum < 0.10) {
                setToastMessage({ show: true, message: "La cantidad mínima es 0.10 metros", type: "error" })
                return
            }
            if (inputNum > 50) {
                setToastMessage({ show: true, message: "La cantidad máxima es 50 metros", type: "error" })
                return
            }
            if (inputNum > disponibleMetros) {
                setToastMessage({ show: true, message: `Stock insuficiente. Máximo disponible: ${disponibleMetros.toFixed(1)} metros`, type: "error" })
                return
            }
            if (inputNum !== cantidad) {
                setCantidad(inputNum)
            }
        }

        setLoading(true)
        setProcesando(true)
        setError("")

        try {
            console.log("Fetching /api/carrito with:", { action: "agregar", productoId: producto.id, cantidad: cantidad, tipo: tipoPedido })

            const res = await fetch("/api/carrito", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "agregar",
                    productoId: producto.id,
                    cantidad: tipoPedido === "pieza" ? Math.floor(inputNum) : inputNum,
                    tipo: tipoPedido
                }),
                credentials: "include",
                cache: "no-store"
            })

            const text = await res.text()
            let data
            try {
                data = JSON.parse(text)
            } catch (e) {
                console.error("JSON parse error:", text)
                throw new Error("Respuesta inválida del servidor")
            }

            if (!res.ok) {
                throw new Error(data.error || "Error del servidor")
            }

            if (data.success) {
                console.log("Producto agregado exitosamente, debug:", data.debug)
                setShowModal(false)
                setCantidad(1)
                setInputValue("1")
                setTipoPedido("metros")

                // Animación fly-to-cart desde el centro del modal
                window.dispatchEvent(new CustomEvent("carrito-particula", {
                    detail: {
                        x: window.innerWidth / 2 - 24,
                        y: window.innerHeight / 2 - 24,
                        productoId: producto.id
                    }
                }))

                // Actualizar contador inmediatamente y después de la animación
                setTimeout(() => {
                    window.dispatchEvent(new Event("carrito-actualizado"))
                }, 100)

                // Backup update después de la animación
                setTimeout(() => {
                    window.dispatchEvent(new Event("carrito-actualizado"))
                }, 1500)
            } else {
                console.error("Error al agregar:", data.error)
                alert(data.error || "Error al agregar al carrito")
                setError(data.error || "Error al agregar")
            }
        } catch (err: any) {
            console.error("Error adding to cart:", err)
            setError(err.message || "Error al conectar con el servidor")
        } finally {
            setLoading(false)
            setProcesando(false)
        }
    }

    const precioPorUnidad = tipoPedido === "pieza" ? Number(producto.precio) * 50 : Number(producto.precio)
    const precioTotal = precioPorUnidad * cantidad

    const openModal = async () => {
        setInputValue(cantidad === 0 ? "" : String(cantidad))
        
        // Obtener cantidad actual en carrito para este producto y tipo
        try {
            const res = await fetch("/api/carrito", { credentials: "include" })
            const json = await res.json()
            if (json.success && json.items) {
                const existente = json.items.find((item: any) => 
                    item.productoId === producto.id && item.tipo === tipoPedido
                )
                setCantidadEnCarrito(existente ? existente.cantidad : 0)
            }
        } catch (e) {
            console.error("Error fetching cart:", e)
            setCantidadEnCarrito(0)
        }
        
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setError("")
    }

    const modalContent = showModal ? (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            onClick={(e) => {
                if (e.target === e.currentTarget) closeModal()
            }}
        >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative bg-white w-full max-w-sm mx-4 rounded-xl shadow-2xl">
                <div className="bg-slate-800 text-white px-4 py-3 flex justify-between items-center rounded-t-xl">
                    <div>
                        <h2 className="text-base font-bold">Agregar al Carrito</h2>
                        <p className="text-xs text-slate-300 truncate max-w-[200px]">{producto.nombre}</p>
                    </div>
                    <button onClick={closeModal} className="p-1 hover:bg-slate-700 rounded">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tipo de pedido
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setTipoPedido("metros")}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-colors ${tipoPedido === "metros"
                                    ? "bg-blue-50 border-blue-500 text-blue-700"
                                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <Ruler className="h-4 w-4" />
                                <span className="text-sm font-medium">Metros</span>
                            </button>
                            <button
                                onClick={() => setTipoPedido("pieza")}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg transition-colors ${tipoPedido === "pieza"
                                    ? "bg-blue-50 border-blue-500 text-blue-700"
                                    : "border-slate-300 text-slate-600 hover:bg-slate-50"
                                    }`}
                            >
                                <Package className="h-4 w-4" />
                                <span className="text-sm font-medium">Pieza</span>
                            </button>
                        </div>
                        {tipoPedido === "pieza" && (
                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                El metraje se evaluará después
                            </p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Cantidad {tipoPedido === "pieza" && "(por pieza)"}
                        </label>
                        <input
                            type="text"
                            inputMode="decimal"
                            value={inputValue}
                            placeholder="Ingrese cantidad"
                            onChange={(e) => {
                                setInputValue(e.target.value)
                            }}
                            onBlur={(e) => {
                                const val = e.target.value.replace(",", ".")
                                const numVal = parseFloat(val)
                                const stockTotal = producto.stocks?.reduce((sum: number, s: any) => sum + (s.stock || 0), 0) || 0
                                if (tipoPedido === "pieza") {
                                    const disponible = stockTotal - cantidadEnCarrito
                                    if (isNaN(numVal) || numVal < 1) {
                                        setToastMessage({ show: true, message: "La cantidad mínima es 1 pieza", type: "error" })
                                        return
                                    }
                                    if (numVal > disponible) {
                                        setToastMessage({ show: true, message: disponible > 0 ? `Stock insuficiente. Máximo disponible: ${disponible} piezas` : "Stock insuficiente", type: "error" })
                                        return
                                    }
                                    const finalVal = Math.floor(numVal)
                                    setCantidad(finalVal)
                                    setInputValue(String(finalVal))
                                } else {
                                    const MIN_METROS = 0.10
                                    const MAX_METROS = 50.00
                                    const disponibleMetros = (stockTotal - cantidadEnCarrito) * 50
                                    if (isNaN(numVal) || numVal < MIN_METROS) {
                                        setToastMessage({ show: true, message: "La cantidad mínima es 0.10 metros", type: "error" })
                                        return
                                    }
                                    if (numVal > MAX_METROS) {
                                        setToastMessage({ show: true, message: "La cantidad máxima es 50 metros", type: "error" })
                                        return
                                    }
                                    if (numVal > disponibleMetros) {
                                        setToastMessage({ show: true, message: `Stock insuficiente. Máximo disponible: ${disponibleMetros.toFixed(1)} metros`, type: "error" })
                                        return
                                    }
                                    setCantidad(numVal)
                                    setInputValue(String(numVal))
                                }
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                                P. Unitario:
                                {tipoPedido === "pieza" && " (aprox. 50mts por pieza)"}
                            </span>
                            <span className="text-slate-800">S/ {precioPorUnidad.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold mt-1 pt-1 border-t">
                            <span className="text-slate-800">Total:</span>
                            <span className="text-blue-600">S/ {precioTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm mb-3">{error}</p>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={closeModal}
                            className="flex-1 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleAgregar}
                            disabled={loading}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading ? "Agregando..." : "Agregar"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) : null

    return (
        <>
            {toastMessage.show && (
                <div className="fixed top-20 right-4 z-[10000] animate-slide-in">
                    <div className={`px-4 py-3 rounded-lg shadow-lg border ${
                        toastMessage.type === "error" 
                            ? "bg-red-50 border-red-200 text-red-800" 
                            : "bg-green-50 border-green-200 text-green-800"
                    }`}>
                        <p className="font-medium">{toastMessage.message}</p>
                    </div>
                </div>
            )}
            <button
                onClick={openModal}
                data-producto={producto.id}
                className={`flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium w-full ${className}`}
            >
                <ShoppingCart className="h-4 w-4" />
                Agregar
            </button>

            {isMounted && createPortal(modalContent, document.body)}
        </>
    )
}