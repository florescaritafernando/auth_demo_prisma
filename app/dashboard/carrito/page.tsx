"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, ArrowLeft, ArrowRight, Plus, Minus, Trash2, X, Pencil, FileText } from "lucide-react"
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
    descripcion: string | null
    stocks: Stock[]
    imagen: string | null
}

interface CarritoItem {
    id: string
    cantidad: number
    tipo: string
    producto: Producto
    cantidadMetros: number
    tipoLabel: string
    metrosPorPieza: number
    indicacionesCorte?: string | null
}

export default function CarritoPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<CarritoItem[]>([])
    const [total, setTotal] = useState(0)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [indicaciones, setIndicaciones] = useState<Record<string, string>>({})
    const [popupItem, setPopupItem] = useState<CarritoItem | null>(null)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [indicacionToDelete, setIndicacionToDelete] = useState<string | null>(null)
    const [toastMessage, setToastMessage] = useState<{ show: boolean; message: string; type: "error" | "success" }>({ show: false, message: "", type: "error" })
    const [inputValues, setInputValues] = useState<Record<string, string>>({})

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
                // Update input values to match new quantities
                const newInputValues: Record<string, string> = {}
                ;(json.items || []).forEach((item: CarritoItem) => {
                    newInputValues[item.id] = String(item.cantidad)
                })
                setInputValues(prev => ({ ...prev, ...newInputValues }))
            }
        } catch (e) {
            console.error("Error:", e)
        } finally {
            setLoading(false)
        }
    }

    const guardarIndicacion = async (itemId: string) => {
        setSavingId(itemId)
        try {
            await fetch("/api/carrito", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    action: "actualizarIndicaciones", 
                    carritoId: itemId, 
                    indicacionesCorte: indicaciones[itemId] || null 
                }),
                credentials: "include"
            })
        } catch (e) {
            console.error("Error:", e)
        } finally {
            setSavingId(null)
        }
    }

    const handleIndicacionChange = (itemId: string, value: string) => {
        const trimmed = value.slice(0, 200)
        setIndicaciones(prev => ({ ...prev, [itemId]: trimmed }))
    }

    const actualizarCantidad = async (itemId: string, nuevaCantidad: number, tipo: string) => {
        const item = items.find(i => i.id === itemId)
        if (!item) return

        // Validación según tipo de artículo
        if (tipo === "pieza") {
            // No validar stock en frontend - solo en API
        } else {
            // Validación para metros
            const MIN_METROS = 0.10
            const MAX_METROS = 50.00
            
            if (nuevaCantidad < MIN_METROS) {
                setToastMessage({ show: true, message: "La cantidad mínima es 0.10 metros", type: "error" })
                setTimeout(() => setToastMessage({ show: false, message: "", type: "error" }), 3000)
                return
            }
            if (nuevaCantidad > MAX_METROS) {
                setToastMessage({ show: true, message: "La cantidad máxima es 50 metros", type: "error" })
                setTimeout(() => setToastMessage({ show: false, message: "", type: "error" }), 3000)
                return
            }
        }

        // Validación mínimo general
        const minVal = tipo === "pieza" ? 1 : 0.10
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
                // Update input values to match new quantities
                const newInputValues: Record<string, string> = {}
                ;(json.items || []).forEach((item: CarritoItem) => {
                    newInputValues[item.id] = String(item.cantidad)
                })
                setInputValues(prev => ({ ...prev, ...newInputValues }))
            } else {
                setToastMessage({ show: true, message: json.error || "Error al actualizar", type: "error" })
                setTimeout(() => setToastMessage({ show: false, message: "", type: "error" }), 3000)
                // Reset input value to current item quantity
                setInputValues(prev => ({ ...prev, [itemId]: String(item.cantidad) }))
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
            <div className="min-h-[60vh] flex items-center justify-center">
                <p>Cargando...</p>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4 md:mb-8">
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-slate-900">Mi Carrito</h1>
                            <p className="text-sm md:text-base text-slate-600">(0 productos)</p>
                        </div>
                        <Link href="/dashboard">
                            <Button variant="outline" className="flex items-center gap-2 text-sm">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Seguir Comprando</span>
                            </Button>
                        </Link>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-8 md:p-12 text-center">
                        <ShoppingCart className="h-12 w-12 md:h-16 md:w-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-2">Tu carrito está vacío</h2>
                        <p className="text-sm text-slate-600 mb-6">Agrega productos para continuar</p>
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
            {/* Toast flotante */}
            {toastMessage.show && (
                <div className="fixed top-20 right-4 z-50 animate-slide-in">
                    <div className={`px-4 py-3 rounded-lg shadow-lg border ${
                        toastMessage.type === "error" 
                            ? "bg-red-50 border-red-200 text-red-800" 
                            : "bg-green-50 border-green-200 text-green-800"
                    }`}>
                        <p className="font-medium">{toastMessage.message}</p>
                    </div>
                </div>
            )}
            <div className="p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-4 md:mb-8">
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold text-slate-900">Mi Carrito</h1>
                            <p className="text-sm md:text-base text-slate-600">({items.length} productos)</p>
                        </div>
                        <Link href="/dashboard">
                            <Button variant="outline" className="flex items-center gap-2 text-sm">
                                <ArrowLeft className="h-4 w-4" />
                                <span className="hidden sm:inline">Seguir Comprando</span>
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-3 md:space-y-4">
                        {items.map((item) => {
                            const precioUnitario = item.producto.precio
                            const precioTotal = precioUnitario * item.cantidadMetros

                            return (
                                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-3 md:p-4">
                                    <div className="flex gap-3 md:gap-4">
                                        {item.producto.imagen ? (
                                            <img
                                                src={item.producto.imagen}
                                                alt={item.producto.nombre}
                                                className="w-16 h-16 md:w-24 md:h-24 object-cover rounded-lg shrink-0"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                                <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 text-slate-400" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900 text-sm md:text-lg truncate">{item.producto.nombre}</h3>
                                            <p className="text-xs md:text-sm text-slate-600 font-medium">{item.producto.categoria}</p>
                                            <p className="text-xs md:text-sm text-blue-700 font-medium">{item.tipoLabel}</p>
                                            <p className="text-xs md:text-sm text-slate-600 font-medium hidden sm:block">Precio del artículo por metro: S/ {precioUnitario.toFixed(2)}</p>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="font-bold text-slate-900 text-sm md:text-lg">S/ {precioTotal.toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {item.tipo === "pieza" && (
                                                    <>
                                                        <button
                                                            onClick={() => {
                                                                const nuevaCantidad = item.cantidad - 1
                                                                if (nuevaCantidad < 1) {
                                                                    setToastMessage({ show: true, message: "La cantidad mínima es 1 pieza", type: "error" })
                                                                    setTimeout(() => setToastMessage({ show: false, message: "", type: "error" }), 3000)
                                                                    return
                                                                }
                                                                actualizarCantidad(item.id, nuevaCantidad, item.tipo)
                                                            }}
                                                            disabled={item.cantidad <= 1}
                                                            className="p-2 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-50"
                                                        >
                                                            <Minus className="h-4 w-4 text-slate-700" />
                                                        </button>
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            step="1"
                                                            min="1"
                                                            value={inputValues[item.id] ?? String(item.cantidad)}
                                                            onChange={(e) => {
                                                                const val = e.target.value
                                                                setInputValues(prev => ({ ...prev, [item.id]: val }))
                                                            }}
                                                            onBlur={(e) => {
                                                                const raw = parseInt(e.target.value)
                                                                if (isNaN(raw) || raw < 1) {
                                                                    setToastMessage({ show: true, message: "La cantidad mínima es 1 pieza", type: "error" })
                                                                    setTimeout(() => setToastMessage({ show: false, message: "", type: "error" }), 3000)
                                                                    setInputValues(prev => ({ ...prev, [item.id]: String(item.cantidad) }))
                                                                    return
                                                                }
                                                                actualizarCantidad(item.id, raw, item.tipo)
                                                            }}
                                                            className="w-16 md:w-20 text-center border border-slate-300 rounded px-2 py-1 font-bold text-slate-900 text-sm"
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const nuevaCantidad = item.cantidad + 1
                                                                actualizarCantidad(item.id, nuevaCantidad, item.tipo)
                                                            }}
                                                            className="p-2 bg-slate-100 rounded hover:bg-slate-200"
                                                        >
                                                            <Plus className="h-4 w-4 text-slate-700" />
                                                        </button>
                                                    </>
                                                )}
                                                {item.tipo === "metros" && (
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        step="0.10"
                                                        min="0.10"
                                                        max="50"
                                                        value={inputValues[item.id] ?? String(item.cantidad)}
                                                        onChange={(e) => {
                                                            const val = e.target.value
                                                            setInputValues(prev => ({ ...prev, [item.id]: val }))
                                                        }}
                                                        onBlur={(e) => {
                                                            const raw = parseFloat(e.target.value)
                                                            if (isNaN(raw) || raw < 0.10) {
                                                                setToastMessage({ show: true, message: "La cantidad mínima es 0.10 metros", type: "error" })
                                                                setTimeout(() => setToastMessage({ show: false, message: "", type: "error" }), 3000)
                                                                setInputValues(prev => ({ ...prev, [item.id]: String(item.cantidad) }))
                                                                return
                                                            }
                                                            if (raw > 50) {
                                                                setToastMessage({ show: true, message: "La cantidad máxima es 50 metros", type: "error" })
                                                                setTimeout(() => setToastMessage({ show: false, message: "", type: "error" }), 3000)
                                                                setInputValues(prev => ({ ...prev, [item.id]: String(item.cantidad) }))
                                                                return
                                                            }
                                                            actualizarCantidad(item.id, raw, item.tipo)
                                                        }}
                                                        className="w-20 md:w-24 text-center border border-slate-300 rounded px-2 py-1 font-bold text-slate-900 text-sm"
                                                    />
                                                )}
                                                {item.tipo === "metros" && <span className="text-sm text-slate-500">m</span>}
                                            </div>
                                            <button
                                                onClick={() => eliminarItem(item.id, item.producto.nombre)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-2 mt-2">
                                            {indicaciones[item.id] ? (
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <button
                                                        onClick={() => setPopupItem(item)}
                                                        className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        Ver indicación
                                                    </button>
                                                    <button
                                                        onClick={() => setIndicacionToDelete(item.id)}
                                                        className="text-xs text-red-500 hover:text-red-700"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setPopupItem(item)}
                                                    className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-dashed border-blue-300"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                    Añadir indicaciones de corte
                                                </button>
                                            )}
                                        </div>
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

                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
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

            {popupItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900">Indicaciones de corte</h3>
                            <button
                                onClick={() => setPopupItem(null)}
                                className="p-2 text-slate-500 hover:text-slate-700 rounded"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-3 mb-4">
                            <div>
                                <p className="text-sm text-slate-500">Producto</p>
                                <p className="font-medium text-slate-900">{popupItem.producto.nombre}</p>
                            </div>
                            
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-sm text-slate-500">Tipo</p>
                                    <p className="font-medium text-slate-900">{popupItem.tipoLabel}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Cantidad</p>
                                    <p className="font-medium text-slate-900">{popupItem.cantidad} {popupItem.tipo === "pieza" ? "pzs" : "m"}</p>
                                </div>
                            </div>
                            
                            <div>
                                <p className="text-sm font-medium text-slate-700 mb-2">Indicaciones de corte</p>
                                <textarea
                                    value={indicaciones[popupItem.id] || ""}
                                    onChange={(e) => {
                                        const value = e.target.value.slice(0, 200)
                                        setIndicaciones(prev => ({ ...prev, [popupItem.id]: value }))
                                    }}
                                    maxLength={200}
                                    placeholder="Ej: Cortar a 2.5 metros, necesito 3 piezas de 1m cada una..."
                                    className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900"
                                    rows={4}
                                />
                                <p className="text-xs text-slate-400 mt-1">{(indicaciones[popupItem.id] || "").length}/200 caracteres</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3">
                            <Button
                                onClick={async () => {
                                    await guardarIndicacion(popupItem.id)
                                    setPopupItem(null)
                                }}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                                Guardar
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setPopupItem(null)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {indicacionToDelete && (
                <div 
                    className="fixed inset-0 flex items-center justify-center z-[100]"
                    style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
                    onClick={() => setIndicacionToDelete(null)}
                >
                    <div 
                        className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-4">
                            <FileText className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                            <p className="text-lg font-bold text-slate-900">¿Eliminar indicación de corte?</p>
                            <p className="text-slate-600 mt-2">
                                La indicación para este producto será eliminada. Esta acción no se puede deshacer.
                            </p>
                        </div>
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setIndicacionToDelete(null)}
                                className="border-slate-300 text-slate-700"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={async () => {
                                    console.log("Confirmando eliminación...")
                                    // Actualizar estado local
                                    setIndicaciones(prev => ({ ...prev, [indicacionToDelete]: "" }))
                                    // Llamar al API directamente con null para eliminar
                                    await fetch("/api/carrito", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ 
                                            action: "actualizarIndicaciones", 
                                            carritoId: indicacionToDelete, 
                                            indicacionesCorte: null 
                                        }),
                                        credentials: "include"
                                    })
                                    setIndicacionToDelete(null)
                                }}
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