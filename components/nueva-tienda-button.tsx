"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Plus, X, Store, Loader2 } from "lucide-react"

export function BotonNuevaTienda() {
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
    })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        fetchEmpleados()
    }, [])

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
            const res = await fetch("/api/tiendas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include",
            })
            const data = await res.json()

            if (data.success) {
                setOpen(false)
                setForm({
                    nombre: "",
                    direccion: "",
                    referencia: "",
                    encargadoId: "",
                })
                router.refresh()
            } else {
                setError(data.error || "Error al crear tienda")
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
            <Button
                onClick={() => setOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
            >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tienda
            </Button>

            {open && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-black">Nueva Tienda</h2>
                            <button onClick={() => setOpen(false)} className="text-black">
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
                                <label className="block text-sm font-medium text-black mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    className="w-full p-3 border border-black rounded-lg text-black"
                                    placeholder="Tienda Centro"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Dirección *</label>
                                <input
                                    type="text"
                                    required
                                    value={form.direccion}
                                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                    className="w-full p-3 border border-black rounded-lg text-black"
                                    placeholder="Jr. de la Unión 456"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Referencia</label>
                                <input
                                    type="text"
                                    value={form.referencia}
                                    onChange={(e) => setForm({ ...form, referencia: e.target.value })}
                                    className="w-full p-3 border border-black rounded-lg text-black"
                                    placeholder="Cerca de la plaza principal"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Encargado *</label>
                                <select
                                    required
                                    value={form.encargadoId}
                                    onChange={(e) => setForm({ ...form, encargadoId: e.target.value })}
                                    className="w-full p-3 border border-black rounded-lg text-black"
                                >
                                    <option value="">Seleccionar encargado...</option>
                                    {empleados.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.name} ({emp.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    onClick={() => setOpen(false)}
                                    variant="outline"
                                    className="flex-1 border-black text-black"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-green-600 text-white"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Crear Tienda"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}