"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, ArrowLeft, ArrowRight, Plus, Minus, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Stock {
    almacen: { id: string; nombre: string; ciudad: string }
    stock: number
}

interface Producto {
    id: string
    nombre: string
    categoria: string
    precio: number
    descripcion?: string
    stocks: Stock[]
    imagen: string
}

interface CarritoItem {
    id: string
    cantidad: number
    tipo: string
    producto: Producto
    cantidadMetros: number
    tipoLabel: string
    metrosPorPieza: number
}

export default function CarritoPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<CarritoItem[]>([])
    const [total, setTotal] = useState(0)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [editandoId, setEditandoId] = useState<string | null>(null)
    const [cantidadEdit, setCantidadEdit] = useState(1)

    useEffect(() => {
        fetchCarrito()
    }, [])

    const fetchCarrito = async () => {
        try {
            const res = await fetch("/api/carrito", { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                setItems(json.items || [])
                setTotal(json.total || 0)
            }
        } catch (e) {
            console.error("Error:", e)
        } finally {
            setLoading(false)
        }
    }

    const actualizarCantidad = async (itemId: string, nuevaCantidad: number, tipo: string) => {
        const minVal = tipo === "pieza" ? 1 : 0.01
        if (nuevaCantidad < minVal) return
        try {
            const res = await fetch("/api/carrito", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId, cantidad: nuevaCantidad }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                setItems(json.items || [])
                setTotal(json.total || 0)
            }
        } catch (e) {
            console.error("Error:", e)
        }
    }

    const eliminarItem = async (itemId: string, nombreProducto: string) => {
        setDeletingId(itemId)
    }

    const confirmarEliminar = async () => {
        if (!deletingId) return
        try {
            const res = await fetch(`/api/carrito?itemId=${deletingId}`, {
                method: "DELETE",
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                setItems(json.items || [])
                setTotal(json.total || 0)
            }
        } catch (e) {
            console.error("Error:", e)
        } finally {
            setDeletingId(null)
        }
    }

    const cancelarEliminar = () => {
        setDeletingId(null)
    }

    const tienePiezas = items.some(item => item.tipo === "pieza")

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
                <p>Cargando...</p>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Mi Carrito</h1>
                            <p className="text-slate-600">(0 productos)</p>
                        </div>
                        <Link href="/dashboard">
                            <Button variant="outline" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Seguir Comprando
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                        <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Tu carrito está vacío</h2>
                        <p className="text-slate-600 mb-6">Agrega productos para continuar</p>
                        <Link href="/dashboard">
                            <Button>Ver Productos</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Mi Carrito</h1>
                            <p className="text-slate-600">({items.length} productos)</p>
                        </div>
                        <Link href="/dashboard">
                            <Button variant="outline" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Seguir Comprando
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {items.map((item) => {
                            const precioUnitario = item.producto.precio
                            const precioTotal = precioUnitario * item.cantidadMetros

                            return (
                                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4">
                                    <div className="flex gap-4">
                                        {item.producto.imagen ? (
                                            <img
                                                src={item.producto.imagen}
                                                alt={item.producto.nombre}
                                                className="w-24 h-24 object-cover rounded-lg shrink-0"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                                <ShoppingCart className="h-8 w-8 text-slate-400" />
                                            </div>
                                        )}

                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-900 text-lg">{item.producto.nombre}</h3>
                                            <p className="text-sm text-slate-600 font-medium">{item.producto.categoria}</p>
                                            <p className="text-sm text-blue-700 font-medium">{item.tipoLabel}</p>
                                            <p className="text-sm text-slate-600 font-medium">Precio del artículo por metro: S/ {precioUnitario.toFixed(2)}</p>
                                        </div>

                                        <div className="text-right">
                                            <p className="font-bold text-slate-900 text-lg">S/ {precioTotal.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => actualizarCantidad(item.id, item.tipo === "pieza" ? item.cantidad - 1 : item.cantidad - 0.01, item.tipo)}
                                                disabled={item.tipo === "pieza" ? item.cantidad <= 1 : item.cantidad <= 0.01}
                                                className="p-2 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-50"
                                            >
                                                <Minus className="h-4 w-4 text-slate-700" />
                                            </button>
                                            <input
                                                type="number"
                                                step={item.tipo === "pieza" ? "1" : "0.01"}
                                                min={item.tipo === "pieza" ? "1" : "0.01"}
                                                value={item.cantidad}
                                                onChange={(e) => {
                                                    const raw = parseFloat(e.target.value)
                                                    const value = item.tipo === "pieza" ? Math.floor(raw) || 1 : (raw || 0.01)
                                                    const minVal = item.tipo === "pieza" ? 1 : 0.01
                                                    if (value >= minVal) actualizarCantidad(item.id, value, item.tipo)
                                                }}
                                                className="w-20 text-center border border-slate-300 rounded px-2 py-1 font-bold text-slate-900"
                                            />
                                            <button
                                                onClick={() => actualizarCantidad(item.id, item.tipo === "pieza" ? item.cantidad + 1 : item.cantidad + 0.01, item.tipo)}
                                                className="p-2 bg-slate-100 rounded hover:bg-slate-200"
                                            >
                                                <Plus className="h-4 w-4 text-slate-700" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => eliminarItem(item.id, item.producto.nombre)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        <div className="bg-white rounded-xl border border-slate-200 p-4">
                            <div className="flex justify-between">
                                <span className="text-slate-600 font-medium">Subtotal:</span>
                                <span className="font-medium text-slate-900 text-lg">S/ {total.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Link href="/dashboard" className="flex-1">
                                <Button variant="outline" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Seguir Comprando
                                </Button>
                            </Link>

                            <Link href="/dashboard/checkout" className="flex-1">
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-lg">
                                    Continuar
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {deletingId && items.find(i => i.id === deletingId) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
                        <div className="text-center mb-4">
                            <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-2" />
                            <p className="text-lg font-bold text-slate-900">¿Estás seguro de eliminar?</p>
                            <p className="text-slate-600 mt-2">
                                El artículo <span className="font-bold text-red-600">{items.find(i => i.id === deletingId)?.producto.nombre}</span> será eliminado de tu carrito.
                            </p>
                        </div>
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={cancelarEliminar}
                                className="border-slate-300 text-black"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmarEliminar}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Sí, eliminar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}