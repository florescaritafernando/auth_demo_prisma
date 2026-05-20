"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Almacen {
    id: string
    nombre: string
    direccion: string
    telefono: string | null
    responsable: { name: string | null } | string | null
    ciudad: string
    activo: boolean
}

const CIUDADES = ["Lima", "Cusco", "Arequipa", "Trujillo"]

export function BotonEditarAlmacen({ almacen }: { almacen: Almacen }) {
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
        activo: true,
    })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (almacen && open) {
            setForm({
                nombre: almacen.nombre,
                direccion: almacen.direccion,
                telefono: almacen.telefono || "",
                responsable: typeof almacen.responsable === "object" ? almacen.responsable?.name || "" : (almacen.responsable || ""),
                ciudad: almacen.ciudad || "",
                activo: almacen.activo,
            })
        }
    }, [almacen, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch(`/api/almacenes/${almacen.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: form.nombre,
                    direccion: form.direccion,
                    telefono: form.telefono || null,
                    responsable: form.responsable || null,
                    ciudad: form.ciudad,
                    activo: form.activo,
                }),
                credentials: "include",
            })
            const data = await res.json()

            if (data.success) {
                setOpen(false)
                router.refresh()
            } else {
                setError(data.error || "Error al actualizar")
            }
        } catch {
            setError("Error de conexion")
        }
        setLoading(false)
    }

    if (!mounted) {
        return (
            <button className="p-2 hover:bg-slate-100 rounded-lg">
                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
        )
    }

    if (!open) {
        return (
            <button onClick={() => setOpen(true)} className="p-2 hover:bg-slate-100 rounded-lg">
                <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white">
                    <h2 className="text-lg font-bold text-slate-900">Editar Almacen</h2>
                    <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                        <label className="block text-sm font-medium mb-1 text-slate-700">Nombre</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Direccion</label>
                        <textarea
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                            rows={2}
                            value={form.direccion}
                            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Ciudad</label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                                value={form.ciudad}
                                onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
                            >
                                <option value="">Seleccionar</option>
                                {CIUDADES.map(ciu => (
                                    <option key={ciu} value={ciu}>{ciu}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Telefono</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                                value={form.telefono}
                                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Responsable</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                            value={form.responsable}
                            onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.activo}
                                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            Almacen Activo
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}