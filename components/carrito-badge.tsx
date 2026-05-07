"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

export function CarritoBadge() {
    const [cantidad, setCantidad] = useState(0)
    const [animacion, setAnimacion] = useState(false)

    const fetchCarrito = useCallback(async () => {
        try {
            const res = await fetch("/api/carrito", { credentials: "include" })
            const data = await res.json()
            console.log("Carrito response:", data)
            if (data.success && data.items) {
                const uniqueItems = data.items.length
                console.log("Items únicos en carrito:", uniqueItems)
                setCantidad(uniqueItems)
            }
        } catch (e) {
            console.error("Error:", e)
        }
    }, [])

    useEffect(() => {
        fetchCarrito()
        const interval = setInterval(fetchCarrito, 30000)
        return () => clearInterval(interval)
    }, [fetchCarrito])

    useEffect(() => {
        const handleEvento = () => {
            console.log("Evento carrito-actualizado recibido")
            setAnimacion(true)

            setTimeout(() => {
                fetchCarrito()
                console.log("Carrito actualizado después del evento")
            }, 1000)

            setTimeout(() => setAnimacion(false), 1000)
        }

        window.addEventListener("carrito-actualizado", handleEvento)
        return () => window.removeEventListener("carrito-actualizado", handleEvento)
    }, [fetchCarrito])

    return (
        <div className="relative" data-carrito-badge>
            <Link href="/dashboard/carrito" className="relative inline-flex">
                <div className={cn(
                    "flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold shadow-md transition-all",
                    animacion && "scale-110"
                )}>
                    <ShoppingCart className={cn("h-4 w-4 transition-transform", animacion && "animate-bounce")} />
                    <span>Ver Mi Carrito</span>
                </div>
                {cantidad > 0 && (
                    <span className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center bg-red-500 text-white text-md font-bold rounded-full">
                        {cantidad}
                    </span>
                )}
            </Link>
        </div>
    )
}

export function ParticulaFly({ x, y, onComplete }: { x: number; y: number; onComplete: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onComplete, 600)
        return () => clearTimeout(timer)
    }, [onComplete])

    return (
        <div
            className="fixed z-[9999] pointer-events-none"
            style={{
                left: x,
                top: y,
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
        >
            <div className="flex items-center justify-center h-8 w-8 bg-blue-600 rounded-full shadow-lg">
                <ShoppingCart className="h-4 w-4 text-white" />
            </div>
        </div>
    )
}