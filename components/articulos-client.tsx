"use client"

import { useState } from "react"
import { Search } from "lucide-react"
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
                                className="w-24 text-sm border rounded-lg px-3 py-2 bg-white text-slate-700 placeholder:text-slate-400"
                                min={0}
                                step="0.01"
                            />
                            <span className="text-slate-400 text-sm">-</span>
                            <input
                                type="number"
                                placeholder="Precio max"
                                value={precioMax}
                                onChange={(e) => { setPrecioMax(e.target.value); setCurrentPage(1) }}
                                className="w-24 text-sm border rounded-lg px-3 py-2 bg-white text-slate-700 placeholder:text-slate-400"
                                min={0}
                                step="0.01"
                            />
                        </div>
                        <BotonesImportExport />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Articulo</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Categoria</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-slate-700 uppercase">Stock Total</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-slate-700 uppercase">Stock por Almacen</th>
                                    <th className="px-3 py-3 text-left text-xs font-bold text-slate-700 uppercase">Precio</th>
                                    <th className="px-3 py-3 text-center text-xs font-bold text-slate-700 uppercase">Estado</th>
                                    <th className="px-3 py-3 text-right text-xs font-bold text-slate-700 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                            {search || filtroCategoria || precioMin || precioMax
                                                ? "No se encontraron resultados."
                                                : "No hay articulos"}
                                        </td>
                                    </tr>
                                ) : paginatedData.map(prod => {
                                    const total = prod.stocks.reduce((acc, s) => acc + (s.stock || 0), 0)
                                    return (
                                        <tr key={prod.id} className="hover:bg-slate-50">
                                            <td className="px-3 py-3 text-sm font-medium text-slate-900">{prod.nombre}</td>
                                            <td className="px-3 py-3 text-sm text-slate-600">{prod.categoria}</td>
                                            <td className="px-3 py-3 text-center font-bold bg-yellow-50 text-slate-900">
                                                {total}
                                            </td>
                                            <td className="px-3 py-3 text-center">
                                                <BotonVerStock stocks={prod.stocks} />
                                            </td>
                                            <td className="px-3 py-3 text-sm font-medium text-slate-900">S/ {Number(prod.precio).toFixed(2)}</td>
                                            <td className="px-3 py-3 text-center">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${prod.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                    {prod.activo ? "Activo" : "Inactivo"}
                                                </span>
                                            </td>
                                            <td className="px-3 py-3 text-right">
                                                <div className="flex justify-end gap-2">
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