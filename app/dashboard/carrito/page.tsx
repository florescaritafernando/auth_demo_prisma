"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, ArrowLeft, ArrowRight } from "lucide-react"
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
                            <p className="text-slate-500">(0 productos)</p>
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
                        <h2 className="text-xl font-bold text-slate-700 mb-2">Tu carrito está vacío</h2>
                        <p className="text-slate-500 mb-6">Agrega productos para continuar</p>
                        <Link href="/dashboard">
                            <Button>Ver Productos</Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Mi Carrito</h1>
                        <p className="text-slate-500">({items.length} productos)</p>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Seguir Comprando
                        </Button>
                    </Link>
                </div>

                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-4">
                            <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                <ShoppingCart className="h-8 w-8 text-slate-400" />
                            </div>
                            
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-900">{item.producto.nombre}</h3>
                                <p className="text-sm text-slate-500">{item.producto.categoria}</p>
                                <p className="text-sm text-blue-600 mt-1">{item.tipoLabel}</p>
                            </div>
                            
                            <div className="text-right">
                                <p className="font-bold text-slate-900">S/ {item.cantidadMetros * (item.tipo === "pieza" ? item.producto.precio * item.metrosPorPieza : item.producto.precio).toFixed(2)}</p>
                                <p className="text-sm text-slate-500">{item.cantidad} {item.tipo === "metros" ? "metros" : "piezas"}</p>
                            </div>
                        </div>
                    ))}
                    
                    <div className="bg-white rounded-xl border border-slate-200 p-4 flex justify-between items-center">
                        <span className="font-bold text-slate-700">Total:</span>
                        <span className="font-bold text-xl text-slate-900">S/ {total.toFixed(2)}</span>
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
    )
}