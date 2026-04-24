"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function CheckoutButton() {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleCheckout = async () => {
        setLoading(true)
        try {
            const res = await fetch("/api/carrito", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "checkout" }),
                credentials: "include"
            })
            const data = await res.json()
            if (data.success) {
                router.push("/dashboard/pedidos")
                router.refresh()
            } else {
                alert(data.error || "Error al procesar pedido")
            }
        } catch (e) {
            alert("Error al procesar pedido")
        }
        setLoading(false)
    }

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-slate-900 text-white hover:bg-slate-800 h-12 rounded-lg font-semibold disabled:opacity-50"
        >
            {loading ? "Procesando..." : "Finalizar Compra"}
        </button>
    )
}