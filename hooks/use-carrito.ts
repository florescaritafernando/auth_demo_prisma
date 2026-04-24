"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function useCarrito() {
    const [items, setItems] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    const fetchCarrito = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/carrito", { 
                credentials: "include" 
            })
            const data = await res.json()
            if (data.success) {
                setItems(data.items)
                setTotal(data.total || 0)
            }
        } catch (e) {
            console.error("Error cargando carrito:", e)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchCarrito()
    }, [])

    const agregar = async (productoId: string, cantidad: number = 1) => {
        const res = await fetch("/api/carrito", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "agregar", productoId, cantidad }),
            credentials: "include"
        })
        const data = await res.json()
        if (data.success) {
            await fetchCarrito()
        }
        return data
    }

    const eliminar = async (carritoId: string) => {
        const res = await fetch("/api/carrito", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "eliminar", carritoId }),
            credentials: "include"
        })
        const data = await res.json()
        if (data.success) {
            await fetchCarrito()
        }
        return data
    }

    const actualizarCantidad = async (carritoId: string, cantidad: number) => {
        const res = await fetch("/api/carrito", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "actualizar", carritoId, cantidad }),
            credentials: "include"
        })
        const data = await res.json()
        if (data.success) {
            await fetchCarrito()
        }
        return data
    }

    return { items, loading, total, agregar, eliminar, actualizarCantidad, refresh: fetchCarrito }
}

export function SignOutButton() {
    const router = useRouter()

    const handleSignOut = async () => {
        await authClient.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full h-10 justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-bold transition-colors px-3"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" x2="9" y1="12" y2="12"/>
            </svg>
            <span>Cerrar Sesion</span>
        </button>
    )
}