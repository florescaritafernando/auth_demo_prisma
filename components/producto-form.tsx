"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

interface ProductoFormProps {
    onClose: () => void
    onSuccess: () => void
}

const CATEGORIAS = [
    "Telas Industriales",
    "Telas Premium",
    "Telas Exclusivas",
    "Telas Clasicas",
    "Temporada",
    "Coleccion",
]

const TIPOCOLORES = [
    "negro",
    "azul noche",
    "azul marino",
    "azul electrico",
    "azul acero",
    "azul barcelona",
    "vino",
    "rosado",
    "rojo",
    "verde olivo",
    "verde",
    "beige",
    "hueso",
    "blanco",
    "marron",
    "amarillo",
]

const TIPODISENO = [
    "mil rayas",
    "super 120",
    "entero satinado",
    "entero mate",
    "escarchado",
    "panal",
    "brocado",
    "jacket",
    "cuadros",
]

export function ProductoForm({ onClose, onSuccess }: ProductoFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [form, setForm] = useState({
        codigo: "",
        nombre: "",
        categoria: "Telas Industriales",
        descripcion: "",
        precio: "",
        stock: "",
        imagen: "",
        tipocolores: [] as string[],
        tipodiseno: "",
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const payload = {
                ...form,
                tipocolores: form.tipocolores.join(","),
            }
            const res = await fetch("/api/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include",
            })
            const data = await res.json()

            if (data.success) {
                onSuccess()
            } else {
                setError(data.error || "Error al crear producto")
            }
        } catch {
            setError("Error de conexion")
        }
        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-bold">Nuevo Articulo</h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Codigo</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded-lg"
                            value={form.codigo}
                            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                            placeholder="D-10-001"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Nombre</label>
                        <input
                            type="text"
                            required
                            className="w-full px-3 py-2 border rounded-lg"
                            value={form.nombre}
                            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Categoria</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={form.categoria}
                            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                        >
                            {CATEGORIAS.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo de Color</label>
                        <div className="grid grid-cols-4 gap-2 p-3 border rounded-lg max-h-32 overflow-y-auto">
                            {TIPOCOLORES.map((color) => (
                                <label key={color} className="flex items-center gap-1 text-xs cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.tipocolores.includes(color)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setForm({ ...form, tipocolores: [...form.tipocolores, color] })
                                            } else {
                                                setForm({ ...form, tipocolores: form.tipocolores.filter(c => c !== color) })
                                            }
                                        }}
                                        className="rounded"
                                    />
                                    <span className="truncate">{color}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo de Diseño</label>
                        <select
                            className="w-full px-3 py-2 border rounded-lg"
                            value={form.tipodiseno}
                            onChange={(e) => setForm({ ...form, tipodiseno: e.target.value })}
                        >
                            <option value="">Seleccionar...</option>
                            {TIPODISENO.map((diseno) => (
                                <option key={diseno} value={diseno}>{diseno}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Descripcion</label>
                        <textarea
                            className="w-full px-3 py-2 border rounded-lg"
                            rows={3}
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Precio (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border rounded-lg"
                                value={form.precio}
                                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Stock</label>
                            <input
                                type="number"
                                required
                                className="w-full px-3 py-2 border rounded-lg"
                                value={form.stock}
                                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">URL Imagen</label>
                        <input
                            type="url"
                            className="w-full px-3 py-2 border rounded-lg"
                            value={form.imagen}
                            onChange={(e) => setForm({ ...form, imagen: e.target.value })}
                            placeholder="/images/..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50"
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