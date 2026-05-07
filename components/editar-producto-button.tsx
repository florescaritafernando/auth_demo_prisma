"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Almacen {
    id: string
    nombre: string
    ciudad: string
}

interface Producto {
    id: string
    nombre: string
    categoria: string
    descripcion: string | null
    precio: number
    imagen: string | null
    activo: boolean
    stocks: { almacenId: string; stock: number }[]
}

const CATEGORIAS = [
    "MANCHESTER SUITING",
    "LONDON FANCY SUITING",
    "MANCHESTER STRECH",
    "MANCHESTER FASHION",
]

export function BotonEditarProducto({ producto }: { producto: Producto }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [almacenes, setAlmacenes] = useState<Almacen[]>([])
    const [form, setForm] = useState({
        nombre: "",
        categoria: "",
        descripcion: "",
        precio: "",
        activo: true,
    })
    const [stocks, setStocks] = useState<Record<string, number>>({})
    const [imagenFile, setImagenFile] = useState<File | null>(null)
    const [imagenPreview, setImagenPreview] = useState<string>("")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        cargarAlmacenes()
    }, [])

    useEffect(() => {
        if (producto && open) {
            setForm({
                nombre: producto.nombre,
                categoria: producto.categoria,
                descripcion: producto.descripcion || "",
                precio: String(producto.precio),
                activo: producto.activo,
            })
            setImagenPreview(producto.imagen || "")
            
            const stockMap: Record<string, number> = {}
            producto.stocks.forEach(s => {
                stockMap[s.almacenId] = s.stock
            })
            setStocks(stockMap)
        }
    }, [producto, open])

    const cargarAlmacenes = async () => {
        try {
            const res = await fetch("/api/almacenes", { credentials: "include" })
            const data = await res.json()
            if (data.success) {
                const almData = data.almacenes.map((a: Almacen) => ({
                    id: a.id,
                    nombre: a.nombre,
                    ciudad: a.ciudad || a.nombre
                }))
                setAlmacenes(almData)
            }
        } catch (e) {
            console.error("Error cargando almacenes:", e)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            let imagenUrl = imagenPreview
            if (imagenFile) {
                imagenUrl = await handleUpload() || imagenPreview
            }

            const res = await fetch(`/api/productos/${producto.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    precio: parseFloat(form.precio),
                    imagen: imagenUrl,
                    stocks
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

    const handleStockChange = (almacenId: string, value: string) => {
        setStocks(prev => ({
            ...prev,
            [almacenId]: parseInt(value) || 0
        }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setImagenFile(file)
        setImagenPreview(URL.createObjectURL(file))
    }

    const handleUpload = async () => {
        if (!imagenFile) return imagenPreview
        
        try {
            const formData = new FormData()
            formData.append("file", imagenFile)
            
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            })
            const data = await res.json()
            if (data.url) return data.url
        } catch (e) {
            console.error("Error uploading:", e)
        }
        return imagenPreview
    }

    const totalStock = Object.values(stocks).reduce((a, b) => a + b, 0)

    if (!mounted) {
        return (
            <button className="p-2 hover:bg-slate-100 rounded-lg">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white">
                    <h2 className="text-lg font-bold text-slate-900">Editar Articulo</h2>
                    <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 text-slate-900">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Categoria</label>
                            <select
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                                value={form.categoria}
                                onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                            >
                                {CATEGORIAS.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-slate-700">Precio (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                required
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                                value={form.precio}
                                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Descripcion</label>
                        <textarea
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                            rows={2}
                            value={form.descripcion}
                            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700">Imagen del Producto</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-100 file:text-slate-700 file:font-medium file:cursor-pointer"
                        />
{imagenPreview && (
                                <div className="mt-2">
                                    <img src={imagenPreview} alt="Preview" className="w-48 h-48 object-contain rounded-lg border bg-white p-2" />
                                    <p className="text-xs text-slate-500 mt-1">Imagen actual - click para cambiar</p>
                                </div>
                            )}
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-1 text-slate-700">
                            <input
                                type="checkbox"
                                checked={form.activo}
                                onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                                className="rounded border-slate-300"
                            />
                            Producto Activo
                        </label>
                    </div>

                    <div className="border-t border-slate-200 pt-4">
                        <label className="block text-sm font-bold mb-3 text-slate-700">Stock por Almacen</label>
                        <div className="space-y-3">
                            {almacenes.map(alm => (
                                <div key={alm.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">{alm.nombre}</p>
                                        <p className="text-xs text-slate-500">{alm.ciudad}</p>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-24 px-3 py-2 border border-slate-300 rounded-lg bg-white text-right"
                                        value={stocks[alm.id] || 0}
                                        onChange={(e) => handleStockChange(alm.id, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-2 text-right text-sm font-bold text-slate-700 bg-yellow-50 p-2 rounded-lg">
                            Total Stock: {totalStock} unidades
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-slate-50">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}