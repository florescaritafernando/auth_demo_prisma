"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const AGENCIAS = [
    { value: "shalom", label: "Shalom" },
    { value: "flores", label: "Flores" },
    { value: "marvisur", label: "Marvisur" },
    { value: "otros", label: "Otros" },
]

const DEPARTAMENTOS = [
    "Lima", "Cusco", "Arequipa", "Trujillo", "Piura", "Chiclayo", "Iquitos", "Huancayo", "Tacna", "Puno", "Cajamarca", "Ayacucho", "Ica", "Junin", "Lambayeque", "La Libertad", "Loreto", "San Martin", "Ucayali", "Madre de Dios"
]

export function BotonNuevoClientePedido() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({
        nombre: "",
        tipoDoc: "dni",
        numeroDoc: "",
        razonSocial: "",
        direccion: "",
        telefono: "",
        agencia: "",
        agenciaOtro: "",
        guiaRemision: false,
        departamento: "",
        provincia: "",
        distrito: "",
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
            const res = await fetch("/api/clientes-pedido", {
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
                    tipoDoc: "dni",
                    numeroDoc: "",
                    razonSocial: "",
                    direccion: "",
                    telefono: "",
                    agencia: "",
                    agenciaOtro: "",
                    guiaRemision: false,
                    departamento: "",
                    provincia: "",
                    distrito: "",
                })
                router.refresh()
            } else {
                setError(data.error || "Error al crear cliente")
            }
        } catch {
            setError("Error de conexion")
        }
        setLoading(false)
    }

    if (!mounted) {
        return (
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                Nuevo Cliente
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
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Nuevo Cliente
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white">
                    <h2 className="text-lg font-bold text-slate-900">Nuevo Cliente</h2>
                    <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 text-slate-900">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Nombre *</label>
                            <input
                                type="text"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                placeholder="Nombre completo"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Tipo de Documento *</label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                value={form.tipoDoc}
                                onChange={(e) => setForm({ ...form, tipoDoc: e.target.value })}
                            >
                                <option value="dni">DNI</option>
                                <option value="ruc">RUC</option>
                                <option value="ce">Carnet Extranjeria</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Numero de Documento *</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                            value={form.numeroDoc}
                            onChange={(e) => setForm({ ...form, numeroDoc: e.target.value })}
                            placeholder={form.tipoDoc === "ruc" ? "20XXXXXXXXX" : "XXXXXXXX"}
                        />
                    </div>

                    {form.tipoDoc === "ruc" && (
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Razon Social</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                value={form.razonSocial}
                                onChange={(e) => setForm({ ...form, razonSocial: e.target.value })}
                                placeholder="Razon social de la empresa"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Direccion</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                            value={form.direccion}
                            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                            placeholder="Direccion del cliente"
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Agencia de Envio</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                value={form.agencia}
                                onChange={(e) => setForm({ ...form, agencia: e.target.value })}
                            >
                                <option value="">Seleccionar agencia</option>
                                {AGENCIAS.map(a => (
                                    <option key={a.value} value={a.value}>{a.label}</option>
                                ))}
                            </select>
                        </div>
                        {form.agencia === "otros" && (
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Especificar Agencia</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    value={form.agenciaOtro}
                                    onChange={(e) => setForm({ ...form, agenciaOtro: e.target.value })}
                                    placeholder="Nombre de la agencia"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.guiaRemision}
                                onChange={(e) => setForm({ ...form, guiaRemision: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            Requiere Guia de Remision
                        </label>
                    </div>

                    {form.guiaRemision && (
                        <div className="grid grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Departamento</label>
                                <select
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    value={form.departamento}
                                    onChange={(e) => setForm({ ...form, departamento: e.target.value, provincia: "", distrito: "" })}
                                >
                                    <option value="">Seleccionar</option>
                                    {DEPARTAMENTOS.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Provincia</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    value={form.provincia}
                                    onChange={(e) => setForm({ ...form, provincia: e.target.value })}
                                    placeholder="Provincia"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-700">Distrito</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    value={form.distrito}
                                    onChange={(e) => setForm({ ...form, distrito: e.target.value })}
                                    placeholder="Distrito"
                                />
                            </div>
                        </div>
                    )}

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

export function BotonEliminarClientePedido({ id }: { id: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Estas seguro de eliminar este cliente?")) return

        setLoading(true)
        try {
            const res = await fetch(`/api/clientes-pedido/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            const data = await res.json()
            if (data.success) {
                router.refresh()
            } else {
                alert(data.error || "Error al eliminar")
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
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
        </button>
    )
}
