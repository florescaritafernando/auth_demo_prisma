"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { BotonNuevoProducto, BotonEliminarProducto } from "@/components/nuevo-producto-button"
import { BotonVerStock } from "@/components/stock-detail-button"
import { BotonEditarProducto } from "@/components/editar-producto-button"
import { BotonesImportExport } from "@/components/import-export-buttons"

interface Stock {
    almacen: { id: string; nombre: string; ciudad: string }
    stock: number
}

interface Producto {
    id: string
    nombre: string
    categoria: string
    precio: number
    activo: boolean
    stocks: Stock[]
}

interface Props {
    initialProductos: Producto[]
}

export function ArticulosClient({ initialProductos, onImport }: Props) {
    const [search, setSearch] = useState("")
    const [productos, setProductos] = useState(initialProductos)

    const filtered = productos.filter(p => 
        p.nombre.toLowerCase().includes(search.toLowerCase()) ||
        p.categoria.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Gestion de Articulos</h1>
                        <p className="text-slate-500 mt-1">Administra el catalogo de telas</p>
                    </div>
                    <BotonNuevoProducto />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre..." 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <BotonesImportExport />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Articulo</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Categoria</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Precio</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Stock Total</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Estado</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Stock por Almacion</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                            No hay articulos
                                        </td>
                                    </tr>
                                ) : filtered.map(prod => {
                                    const total = prod.stocks.reduce((acc, s) => acc + (s.stock || 0), 0)
                                    return (
                                        <tr key={prod.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{prod.nombre}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{prod.categoria}</td>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">S/ {Number(prod.precio).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-center font-bold bg-yellow-50 text-slate-900">
                                                {total}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${prod.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {prod.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <BotonVerStock stocks={prod.stocks} />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <BotonEditarProducto producto={prod} />
                                                    <BotonEliminarProducto id={prod.id} />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="mt-4 text-sm text-slate-500 text-center">
                    Mostrando {filtered.length} articulos
                </div>
            </div>
        </div>
    )
}