"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
    pedidoId: string
    delegadoName: string | null
    onTomar: () => Promise<void>
}

export function TomarPedidoButton({ pedidoId, delegadoName, onTomar }: Props) {
    const [loading, setLoading] = useState(false)

    if (delegadoName) {
        return (
            <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                Asignado: {delegadoName}
            </div>
        )
    }

    const handleTomar = async () => {
        setLoading(true)
        try {
            await onTomar()
        } catch (e) {
            console.error("Error:", e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleTomar}
            disabled={loading}
            size="sm"
            variant="outline"
            className="text-xs h-8 border-blue-500 text-blue-600 hover:bg-blue-50"
        >
            <UserPlus className="h-3 w-3 mr-1" />
            {loading ? "Tomando..." : "Tomar pedido"}
        </Button>
    )
}