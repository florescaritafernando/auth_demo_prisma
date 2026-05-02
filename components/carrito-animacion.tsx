"use client"

import { useState, useEffect } from "react"
import { ShoppingCart } from "lucide-react"
import { createPortal } from "react-dom"

interface AnimacionCarritoProps {
    productoId: string
    onComplete?: () => void
}

export function AnimacionCarrito({ productoId, onComplete }: AnimacionCarritoProps) {
    const [coords, setCoords] = useState<{ x: number; y: number } | null>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const boton = document.querySelector(`[data-producto="${productoId}"]`) as HTMLElement
        const carrito = document.querySelector('[data-carrito-badge]') as HTMLElement

        if (boton && carrito) {
            const botonRect = boton.getBoundingClientRect()
            const carritoRect = carrito.getBoundingClientRect()

            setCoords({
                x: carritoRect.left + carritoRect.width / 2 - botonRect.left - botonRect.width / 2,
                y: carritoRect.top + carritoRect.height / 2 - botonRect.top - botonRect.height / 2
            })
            setVisible(true)

            setTimeout(() => {
                setVisible(false)
                onComplete?.()
            }, 800)
        }
    }, [productoId, onComplete])

    if (!visible || !coords) return null

    return createPortal(
        <div
            className="fixed z-[9999] pointer-events-none"
            style={{
                left: 0,
                top: 0,
                transform: `translate(${coords.x}px, ${coords.y}px)`,
                transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
        >
            <div className="flex items-center justify-center h-10 w-10 bg-blue-600 rounded-full shadow-lg">
                <ShoppingCart className="h-5 w-5 text-white animate-pulse" />
            </div>
        </div>,
        document.body
    )
}

export function useAnimacionCarrito() {
    const [animacionActiva, setAnimacionActiva] = useState<string | null>(null)

    const iniciarAnimacion = (productoId: string) => {
        setAnimacionActiva(productoId)
    }

    const terminarAnimacion = () => {
        setAnimacionActiva(null)
    }

    return { animacionActiva, iniciarAnimacion, terminarAnimacion }
}