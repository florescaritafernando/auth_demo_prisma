"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { ShoppingCart } from "lucide-react"

interface Particula {
    id: number
    startX: number
    startY: number
    endX: number
    endY: number
    visible: boolean
}

export function CarritoParticulas() {
    const [particulas, setParticulas] = useState<Particula[]>([])
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!mounted) return

        const handleEvento = (e: CustomEvent) => {
            const { x, y, productoId } = e.detail
            const carrito = document.querySelector('[data-carrito-badge]')
            
            if (!carrito) {
                console.log("No se encontró el carrito")
                return
            }

            const rect = carrito.getBoundingClientRect()
            const endX = rect.left + rect.width / 2 - 20
            const endY = rect.top + rect.height / 2 - 20

            console.log("Partícula iniciada:", { startX: x, startY: y, endX, endY, productoId })

            const nuevaParticula: Particula = {
                id: Date.now() + Math.random(),
                startX: x,
                startY: y,
                endX,
                endY,
                visible: true
            }

            setParticulas(prev => [...prev, nuevaParticula])
        }

        window.addEventListener("carrito-particula", handleEvento as EventListener)
        return () => window.removeEventListener("carrito-particula", handleEvento as EventListener)
    }, [mounted])

    const eliminarParticula = (id: number) => {
        setParticulas(prev => prev.filter(p => p.id !== id))
    }

    if (!mounted) return null

    return createPortal(
        <>
            {particulas.map(particula => (
                <ParticulaFly
                    key={particula.id}
                    startX={particula.startX}
                    startY={particula.startY}
                    endX={particula.endX}
                    endY={particula.endY}
                    onComplete={() => eliminarParticula(particula.id)}
                />
            ))}
        </>,
        document.body
    )
}

function ParticulaFly({ startX, startY, endX, endY, onComplete }: {
    startX: number
    startY: number
    endX: number
    endY: number
    onComplete: () => void
}) {
    const [transicion, setTransicion] = useState(false)

    useEffect(() => {
        const timer1 = setTimeout(() => setTransicion(true), 50)
        const timer2 = setTimeout(() => onComplete(), 600)

        return () => {
            clearTimeout(timer1)
            clearTimeout(timer2)
        }
    }, [onComplete])

    return (
        <div
            className="fixed z-[9999] pointer-events-none"
            style={{
                left: startX,
                top: startY,
                transform: transicion ? `translate(${endX - startX}px, ${endY - startY}px) scale(0.5)` : "translate(0, 0) scale(1)",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                opacity: transicion ? 0 : 1
            }}
        >
            <div className="flex items-center justify-center h-12 w-12 bg-blue-600 rounded-full shadow-xl">
                <ShoppingCart className="h-6 w-6 text-white" />
            </div>
        </div>
    )
}