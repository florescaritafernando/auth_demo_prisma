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
}

export function BotonAgregarCarrito({ producto }: Props) {
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [tipoPedido, setTipoPedido] = useState<"metros" | "pieza">("metros")
    const [cantidad, setCantidad] = useState<number>(1)
    const [error, setError] = useState("")
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const handleAgregar = async () => {
        if (cantidad <= 0) {
            setError("La cantidad debe ser mayor a 0")
            return
        }

        setLoading(true)
        setError("")

        try {
            // Send cantidad directly - API handles conversion
            console.log("Fetching /api/carrito with:", { action: "agregar", productoId: producto.id, cantidad: cantidad, tipo: tipoPedido })

            const res = await fetch("/api/carrito", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    action: "agregar",
                    productoId: producto.id,
                    cantidad: cantidad,
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
                setShowModal(false)
                setCantidad(1)
                setTipoPedido("metros")
                alert("Producto agregado al carrito")
            } else {
                setError(data.error || "Error al agregar")
            }
        } catch (err: any) {
            console.error("Error adding to cart:", err)
            setError(err.message || "Error al conectar con el servidor")
        } finally {
            setLoading(false)
        }
    }

    const precioPorUnidad = tipoPedido === "pieza" ? Number(producto.precio) * 50 : Number(producto.precio)
    const precioTotal = precioPorUnidad * cantidad

    const openModal = () => {
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
                            Cantidad {tipoPedido === "pieza" && "(x pieza)"}
                        </label>
                        <input
                            type="number"
                            step={tipoPedido === "pieza" ? "1" : ""}
                            min={tipoPedido === "pieza" ? "1" : ""}
                            value={cantidad}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value)
                                if (tipoPedido === "pieza") {
                                    setCantidad(Math.max(1, Math.floor(val) || 1))
                                } else {
                                    setCantidad(Math.max(0, val || 0.1))
                                }
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-600">
                                P. Unitario:
                                {tipoPedido === "pieza" && " (aprox. 50mts x pieza)"}
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
            <button
                onClick={openModal}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
                <ShoppingCart className="h-4 w-4" />
                Agregar
            </button>

            {isMounted && createPortal(modalContent, document.body)}
        </>
    )
}