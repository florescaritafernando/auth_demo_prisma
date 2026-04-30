"use client"

import { useState } from "react"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
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

const CATEGORIAS = ["MANCHESTER SUITING", "LONDON FANCY SUITING", "MANCHESTER STRECH", "MANCHESTER FASHION"]

export function ArticulosClient({ initialProductos }: Props) {
    const [search, setSearch] = useState("")
    const [filtroCategoria, setFiltroCategoria] = useState("")
    const [pageSize, setPageSize] = useState(10)
    const [currentPage, setCurrentPage] = useState(1)

    const filtered = initialProductos.filter(p => {
        const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase()) ||
            p.categoria.toLowerCase().includes(search.toLowerCase())
        const matchCategoria = !filtroCategoria || p.categoria === filtroCategoria
        return matchSearch && matchCategoria
    })

    const totalPages = Math.ceil(filtered.length / pageSize)
    const startIdx = (currentPage - 1) * pageSize
    const paginatedData = filtered.slice(startIdx, startIdx + pageSize)

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
                            {CATEGORIAS.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
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
                                            No hay articulos
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

                <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>Mostrar</span>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                setPageSize(Number(e.target.value))
                                setCurrentPage(1)
                            }}
                            className="border rounded px-2 py-1"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>por pagina</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">
                            Pagina {currentPage} de {totalPages || 1}
                        </span>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage >= totalPages}
                                className="p-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-2 text-sm text-slate-500 text-center">
                    Mostrando {startIdx + 1}-{Math.min(startIdx + pageSize, filtered.length)} de {filtered.length} articulos
                </div>
            </div>
        </div>
    )
}