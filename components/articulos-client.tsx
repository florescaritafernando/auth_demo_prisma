"use client"

import { useState } from "react"
import { Search, Package } from "lucide-react"
import { Pagination } from "@/components/ui/pagination"
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
    tipocolores: string | null
    tipodiseno: string | null
    descripcion: string | null
    imagen: string | null
}

interface Props {
    initialProductos: Producto[]
}

export function ArticulosClient({ initialProductos }: Props) {
    const [search, setSearch] = useState("")
    const [filtroCategoria, setFiltroCategoria] = useState("")
    const [precioMin, setPrecioMin] = useState("")
    const [precioMax, setPrecioMax] = useState("")
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    const categorias = Array.from(new Set(initialProductos.map(p => p.categoria).filter(Boolean)))
    const precios = initialProductos.map(p => Number(p.precio))
    const precioMinGlobal = precios.length > 0 ? Math.min(...precios) : 0
    const precioMaxGlobal = precios.length > 0 ? Math.max(...precios) : 0

    const filtered = initialProductos.filter(p => {
        const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.categoria.toLowerCase().includes(search.toLowerCase())
        const matchCategoria = !filtroCategoria || p.categoria === filtroCategoria
        const precioNum = Number(p.precio)
        const matchPrecioMin = !precioMin || precioNum >= Number(precioMin)
        const matchPrecioMax = !precioMax || precioNum <= Number(precioMax)
        return matchSearch && matchCategoria && matchPrecioMin && matchPrecioMax
    })

    const totalPages = Math.ceil(filtered.length / pageSize)
    const startIdx = (currentPage - 1) * pageSize
    const paginatedData = filtered.slice(startIdx, startIdx + pageSize)

    return (
        <div className="p-4 md:p-6 lg:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Gestion de Articulos</h1>
                        <p className="text-slate-500 mt-1">Administra el catalogo de telas</p>
                    </div>
                    <BotonNuevoProducto />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                        <div className="flex-1 flex flex-col sm:flex-row gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm text-slate-800 placeholder:text-slate-400"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                />
                            </div>
                            <select
                                value={filtroCategoria}
                                onChange={(e) => {
                                    setFiltroCategoria(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="text-sm border rounded-lg px-3 py-2 bg-white text-slate-700"
                            >
                                <option value="">Todas las categorias</option>
                                {categorias.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Precio min"
                                    value={precioMin}
                                    onChange={(e) => { setPrecioMin(e.target.value); setCurrentPage(1) }}
                                    className="w-20 sm:w-24 text-sm border rounded-lg px-3 py-2 bg-white text-slate-700 placeholder:text-slate-400"
                                    min={0}
                                    step="0.01"
                                />
                                <span className="text-slate-400 text-sm">-</span>
                                <input
                                    type="number"
                                    placeholder="Precio max"
                                    value={precioMax}
                                    onChange={(e) => { setPrecioMax(e.target.value); setCurrentPage(1) }}
                                    className="w-20 sm:w-24 text-sm border rounded-lg px-3 py-2 bg-white text-slate-700 placeholder:text-slate-400"
                                    min={0}
                                    step="0.01"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-3">
                        <BotonesImportExport />
                    </div>
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Articulo</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Categoria</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Stock Total</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Stock por Almacen</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">Precio</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">Estado</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-700 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                                            {search || filtroCategoria || precioMin || precioMax
                                                ? "No se encontraron resultados."
                                                : "No hay articulos"}
                                        </td>
                                    </tr>
                                ) : paginatedData.map(prod => {
                                    const total = prod.stocks.reduce((acc, s) => acc + (s.stock || 0), 0)
                                    return (
                                        <tr key={prod.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">{prod.nombre}</td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-medium">{prod.categoria}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${total > 0 ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-400"}`}>
                                                    {total}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <BotonVerStock stocks={prod.stocks} />
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-slate-900">S/ {Number(prod.precio).toFixed(2)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${prod.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {prod.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <BotonEditarProducto producto={prod as any} />
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

                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                    {paginatedData.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-slate-200">
                            <Package className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-sm">
                                {search || filtroCategoria || precioMin || precioMax
                                    ? "No se encontraron resultados."
                                    : "No hay articulos"}
                            </p>
                        </div>
                    ) : paginatedData.map(prod => {
                        const total = prod.stocks.reduce((acc, s) => acc + (s.stock || 0), 0)
                        return (
                            <div key={prod.id} className="bg-white rounded-lg border border-slate-200 p-3">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="inline-flex px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase shrink-0">{prod.categoria}</span>
                                            <p className="font-bold text-slate-900 text-sm truncate">{prod.nombre}</p>
                                        </div>
                                    </div>
                                    <span className={`shrink-0 px-2 py-0.5 text-[10px] font-semibold rounded-full ${prod.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {prod.activo ? "Activo" : "Inactivo"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${total > 0 ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-400"}`}>{total}</span>
                                            <span className="text-[10px] text-slate-400">stock</span>
                                        </div>
                                        <BotonVerStock stocks={prod.stocks} />
                                        <span className="text-xs font-bold text-slate-900">S/ {Number(prod.precio).toFixed(2)}</span>
                                    </div>
                                    <div className="flex gap-1">
                                        <BotonEditarProducto producto={prod as any} />
                                        <BotonEliminarProducto id={prod.id} />
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    itemsPerPage={pageSize}
                    totalItems={filtered.length}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={setPageSize}
                    itemLabel="articulos"
                />
            </div>
        </div>
    )
}
