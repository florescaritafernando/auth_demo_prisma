"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BotonEliminarTienda({ id }: { id: string }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const handleDelete = async () => {
        setLoading(true)
        setError("")

        try {
            const res = await fetch(`/api/tiendas/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            const data = await res.json()

            if (data.success) {
                setOpen(false)
                router.refresh()
            } else {
                setError(data.error || "Error al eliminar tienda")
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
            >
                <Trash2 className="h-4 w-4" />
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Eliminar Tienda</h2>
                            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <p className="text-sm text-slate-600 mb-6">
                            ¿Estás seguro de que deseas eliminar esta tienda? Esta acción no se puede deshacer.
                        </p>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setOpen(false)}
                                className="flex-1"
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleDelete}
                                disabled={loading}
                                className="flex-1 bg-red-600 text-white hover:bg-red-700"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Eliminar"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
