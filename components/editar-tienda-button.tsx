"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Pencil, X, Loader2 } from "lucide-react"

interface Tienda {
    id: string
    nombre: string
    direccion: string
    referencia: string | null
    encargado: { id: string; name: string | null; email: string | null } | null
    activo: boolean
}

export function BotonEditarTienda({ tienda }: { tienda: Tienda }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [empleados, setEmpleados] = useState<{id: string, name: string, email: string}[]>([])
    const [form, setForm] = useState({
        nombre: "",
        direccion: "",
        referencia: "",
        encargadoId: "",
        activo: true,
    })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchEmpleados()
    }, [])

    useEffect(() => {
        if (tienda && open) {
            setForm({
                nombre: tienda.nombre,
                direccion: tienda.direccion,
                referencia: tienda.referencia || "",
                encargadoId: tienda.encargado?.id || "",
                activo: tienda.activo,
            })
        }
    }, [tienda, open])

    const fetchEmpleados = async () => {
        try {
            const res = await fetch("/api/usuarios?role=empleado", { credentials: "include" })
            const data = await res.json()
            if (data.success) {
                setEmpleados(data.usuarios)
            }
        } catch (e) {
            console.error("Error fetching empleados:", e)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch(`/api/tiendas/${tienda.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: form.nombre,
                    direccion: form.direccion,
                    referencia: form.referencia || null,
                    encargadoId: form.encargadoId || null,
                    activo: form.activo,
                }),
                credentials: "include",
            })
            const data = await res.json()

            if (data.success) {
                setOpen(false)
                router.refresh()
            } else {
                setError(data.error || "Error al actualizar tienda")
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    if (!mounted) return null

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                title="Editar"
            >
                <Pencil className="h-4 w-4" />
            </button>

            {open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-slate-900">Editar Tienda</h2>
                            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                                    placeholder="Tienda Centro"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Dirección *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.direccion}
                                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                                    placeholder="Jr. de la Unión 456"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Referencia</label>
                                <input
                                    type="text"
                                    value={form.referencia}
                                    onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                                    placeholder="Cerca de la plaza principal"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Encargado</label>
                                <select
                                    value={form.encargadoId}
                                    onChange={(e) => setForm({ ...form, encargadoId: e.target.value })}
                                    className="w-full p-3 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                                >
                                    <option value="">Sin encargado</option>
                                    {empleados.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} ({emp.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="activo"
                                    checked={form.activo}
                                    onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                />
                                <label htmlFor="activo" className="text-sm text-slate-700">Activo</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-slate-900 text-white"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Cambios"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
