"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export function BotonNuevoAlmacen() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({
        nombre: "",
        direccion: "",
        telefono: "",
        responsable: "",
        ciudad: "",
    })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/almacenes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include",
            })
            const data = await res.json()

            if (data.success) {
                setOpen(false)
                setForm({
                    nombre: "", direccion: "", telefono: "",
                    responsable: "", ciudad: "",
                })
                router.refresh()
            } else {
                setError(data.error || "Error al crear almacen")
            }
        } catch {
            setError("Error de conexion")
        }
        setLoading(false)
    }

    if (!mounted) {
        return (
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                Nuevo Almacen
            </button>
        )
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
                Nuevo Almacen
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900">Nuevo Almacen</h2>
                    <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 text-slate-900">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Nombre *</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                            placeholder="Almacen Principal"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Direccion *</label>
                        <textarea
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                            rows={2}
                            value={form.direccion}
                            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                            placeholder="Av. example 123, Lima"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Telefono</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                            value={form.telefono}
                            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                            placeholder="+51 987 654 321"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Responsable</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                            value={form.responsable}
                            onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                            placeholder="Juan Perez"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Ciudad *</label>
                        <select
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                            value={form.ciudad}
                            onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                        >
                            <option value="">Seleccionar ciudad</option>
                            <option value="Lima">Lima</option>
                            <option value="Cusco">Cusco</option>
                            <option value="Arequipa">Arequipa</option>
                            <option value="Trujillo">Trujillo</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function BotonEliminarAlmacen({ id }: { id: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Estas seguro de eliminar este almacen?")) return
        
        setLoading(true)
        try {
            const res = await fetch(`/api/almacenes/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            const data = await res.json()
            if (data.success) {
                router.refresh()
            }
        } catch {
            alert("Error al eliminar")
        }
        setLoading(false)
    }

    return (
        <button 
            onClick={handleDelete}
            disabled={loading}
            className="p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
        </button>
    )
}