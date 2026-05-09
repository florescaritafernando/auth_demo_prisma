"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Pagination } from "@/components/ui/pagination"
import { CarritoBadge } from "@/components/carrito-badge"
import { CarritoParticulas } from "@/components/carrito-particulas"
import { CrearPedidoModal } from "@/components/crear-pedido-modal"
import { ShoppingCart, Heart, X, MapPin, Package, Filter, SlidersHorizontal, XCircle, Search, FilePlus } from "lucide-react"
import { BotonAgregarCarrito } from "@/components/agregar-carrito-button"
import { cn } from "@/lib/utils"

interface Stock {
    almacen: { id: string; nombre: string; ciudad: string }
    stock: number
}

interface Producto {
    id: string
    nombre: string
    categoria: string
    precio: number
    descripcion?: string | null
    activo: boolean
    stocks: Stock[]
    imagen: string | null
}

interface Props {
    productos: Producto[]
    userName: string
    userRole: string
}

interface Filtros {
    categoria: string
    precioMin: number | null
    precioMax: number | null
    stock: string
    soloFavoritos: boolean
    busqueda: string
    color: string | null
}

function ProductoCard({ producto, esFavorito, onToggleFavorito }: { producto: Producto; esFavorito: boolean; onToggleFavorito: (id: string) => void }) {
    const [showModal, setShowModal] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const totalStock = producto.stocks.reduce((sum, s) => sum + s.stock, 0)

    const getStockBadge = () => {
        if (totalStock === 0) {
            return <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0.5">Agotado</Badge>
        } else if (totalStock <= 5) {
            return <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">Pocas unidades</Badge>
        } else {
            return <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0.5">Disponible</Badge>
        }
    }

    const modalContent = showModal ? (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) setShowModal(false)
            }}
        >
            <div className="absolute inset-0 bg-black/60" />
            <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
                <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 z-10 h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-slate-600 hover:bg-white transition-all"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="relative aspect-[4/3] w-full bg-slate-100">
                    <Image
                        src={producto.imagen || "/images/D-10-001.png"}
                        alt={producto.nombre}
                        fill
                        className="object-contain p-8"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full">
                            {producto.categoria}
                        </span>
                        {getStockBadge()}
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{producto.nombre}</h2>

                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-3xl font-extrabold text-slate-900">
                            S/ {Number(producto.precio).toFixed(2)}
                        </span>
                        <span className="text-base text-slate-500">/ metro lineal</span>
                    </div>

                    {producto.descripcion && (
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-2">Descripción</h3>
                            <p className="text-slate-600 leading-relaxed">{producto.descripcion}</p>
                        </div>
                    )}

                    <div className="flex mt-6 pt-6 border-t">
                        <div className="w-4/5">
                            <BotonAgregarCarrito producto={producto as any} className="w-full" />
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="w-1/5 ml-3 px-3 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ) : null

    return (
        <>
            <div className="group relative rounded-[1.5rem] bg-white border border-slate-200 p-3 transition-all hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-1 duration-300 flex flex-col h-full overflow-hidden">
                <div className="relative aspect-[4/3] w-full rounded-[1rem] bg-slate-100/50 mb-2 shrink-0 overflow-hidden group">
                    <div className="w-full h-full flex items-center justify-center group-hover:bg-slate-100 transition-colors">

                        {/* Botón de Favoritos */}
                        <div className="absolute top-1 left-2 z-5">
                            <button
                                onClick={(e) => {
                                    e.preventDefault(); // Evita navegación si está dentro de un Link
                                    e.stopPropagation();
                                    onToggleFavorito(producto.id);
                                }}
                                aria-label={esFavorito ? "Quitar de favoritos" : "Añadir a favoritos"}
                                className={`h-8 w-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-md transition-all active:scale-90 hover:scale-110 ${esFavorito ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                                    }`}
                            >
                                <Heart
                                    className={`h-5 w-5 transition-colors ${esFavorito ? 'fill-current' : ''}`}
                                    strokeWidth={esFavorito ? 0 : 2}
                                />
                            </button>
                        </div>

                        {/* Imagen con optimización */}
                        <Image
                            src={producto.imagen || "/images/D-10-001.png"}
                            alt={producto.nombre}
                            fill
                            priority={false} // Solo usa true si es el primer producto de la página
                            className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-110"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1 block">
                        {producto.categoria}
                    </span>
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight line-clamp-1" title={producto.nombre}>
                            {producto.nombre}
                        </h3>
                        {getStockBadge()}
                    </div>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-lg font-extrabold text-slate-900">
                            S/ {Number(producto.precio).toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-500">/ metro lineal</span>
                    </div>
                </div>
                <div className="pt-2 mt-auto flex gap-2">
                    <div className="w-1/2">
                        <BotonAgregarCarrito producto={producto as any} className="w-full" />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-1/2 px-2 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-xs"
                    >
                        Ver detalle
                    </button>
                </div>
            </div>

            {isMounted && createPortal(modalContent, document.body)
            }
        </>
    )
}

function PanelFiltros({
    filtros,
    setFiltros,
    categorias,
    precioMin: precioMinGlobal,
    precioMax: precioMaxGlobal,
    onClose
}: {
    filtros: Filtros
    setFiltros: (f: Filtros) => void
    categorias: string[]
    precioMin: number
    precioMax: number
    onClose: () => void
}) {
    const [precioMaxSel, setPrecioMaxSel] = useState(filtros.precioMax ?? precioMaxGlobal)

    useEffect(() => {
        setPrecioMaxSel(filtros.precioMax ?? precioMaxGlobal)
    }, [filtros.precioMax, precioMaxGlobal])

    const aplicarFiltros = () => {
        setFiltros({
            ...filtros,
            precioMin: precioMinGlobal,
            precioMax: precioMaxSel === precioMaxGlobal ? null : precioMaxSel
        })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[9998]">
            <div className="absolute inset-0 bg-black/20" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-black flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        Filtros
                    </h2>
                    <button onClick={onClose} className="text-black hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Categoría</label>
                        <select
                            value={filtros.categoria}
                            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-2">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { nombre: "negro", codigos: ["999", "900", "901", "902", "903", "904"], hex: "#1a1a1a" },
                                { nombre: "azul", codigos: ["100", "101", "102", "200", "201", "300", "301"], hex: "#1e40af" },
                                { nombre: "blanco", codigos: ["001", "002", "003", "004", "005"], hex: "#f5f5f5" },
                                { nombre: "rojo", codigos: ["500", "501", "502", "503", "600"], hex: "#dc2626" },
                                { nombre: "rosa", codigos: ["310", "311", "312", "313", "314", "315", "316"], hex: "#ec4899" },
                                { nombre: "celeste", codigos: ["400", "401", "402", "410"], hex: "#0ea5e9" },
                                { nombre: "verde olivo", codigos: ["700", "701", "702", "710"], hex: "#65a30d" },
                                { nombre: "marron", codigos: ["800", "801", "802", "810", "820"], hex: "#78350f" },
                            ].map((color) => (
                                <button
                                    key={color.nombre}
                                    onClick={() => setFiltros({ ...filtros, color: filtros.color === color.nombre ? null : color.nombre })}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${filtros.color === color.nombre ? "border-slate-900 scale-110 shadow-md" : "border-slate-300 hover:border-slate-400"}`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.nombre.charAt(0).toUpperCase() + color.nombre.slice(1)}
                                />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-black mb-4">
                            Precio hasta S/ {precioMaxSel.toFixed(0)}
                        </label>
                        <Slider
                            value={[precioMaxSel]}
                            min={precioMinGlobal}
                            max={precioMaxGlobal}
                            step={1}
                            onValueChange={(value) => setPrecioMaxSel(value[0])}
                            className="py-2"
                        />
                        <div className="flex justify-between mt-2 text-xs text-black">
                            <span>S/ {precioMinGlobal.toFixed(0)}</span>
                            <span>S/ {precioMaxGlobal.toFixed(0)}</span>
                        </div>
                    </div>

                    <div>
                        <button
                            onClick={() => {
                                setFiltros({ categoria: "", precioMin: null, precioMax: null, stock: "", soloFavoritos: false, busqueda: "", color: null })
                                setPrecioMaxSel(precioMaxGlobal)
                            }}
                            className="w-full py-2 text-sm text-black hover:text-gray-800 flex items-center justify-center gap-2"
                        >
                            <XCircle className="h-4 w-4" />
                            Limpiar filtros
                        </button>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                    <Button onClick={aplicarFiltros} className="w-full bg-slate-900 text-white">
                        Aplicar filtros
                    </Button>
                </div>
            </div>
        </div>
    )
}

export function DashboardClient({ productos, userName, userRole }: Props) {
    const [favoritos, setFavoritos] = useState<Set<string>>(new Set())
    const [loadingFavoritos, setLoadingFavoritos] = useState(true)
    const [showFiltros, setShowFiltros] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [carritoCount, setCarritoCount] = useState(0)
    const [showCrearPedido, setShowCrearPedido] = useState(false)
    const headerRef = useRef<HTMLDivElement>(null)

    const [filtros, setFiltros] = useState<Filtros>({
        categoria: "",
        precioMin: null,
        precioMax: null,
        stock: "",
        soloFavoritos: false,
        busqueda: "",
        color: null
    })
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(12)

    useEffect(() => {
        const handleScroll = () => {
            if (headerRef.current) {
                const headerRect = headerRef.current.getBoundingClientRect()
                setIsScrolled(headerRect.bottom < 0)
            }
        }

        window.addEventListener("scroll", handleScroll)
        handleScroll()

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    useEffect(() => {
        const fetchCarritoCount = async () => {
            try {
                const res = await fetch("/api/carrito", { credentials: "include" })
                const data = await res.json()
                if (data.success && data.items) {
                    setCarritoCount(data.items.length)
                }
            } catch (e) {
                console.error("Error:", e)
            }
        }
        fetchCarritoCount()

        const handleCarritoUpdate = () => {
            fetchCarritoCount()
        }

        window.addEventListener("carrito-actualizado", handleCarritoUpdate)
        return () => window.removeEventListener("carrito-actualizado", handleCarritoUpdate)
    }, [])

    useEffect(() => {
        async function fetchFavoritos() {
            try {
                const res = await fetch("/api/favoritos", { credentials: "include" })
                const data = await res.json()
                if (data.favoritos) {
                    setFavoritos(new Set(data.favoritos))
                }
            } catch (error) {
                console.error("Error cargando favoritos:", error)
            } finally {
                setLoadingFavoritos(false)
            }
        }
        fetchFavoritos()
    }, [])

    const toggleFavorito = async (id: string) => {
        const esFavorito = favoritos.has(id)
        const favoritosAnteriores = new Set(favoritos)
        const nuevos = new Set(favoritos)

        if (esFavorito) {
            nuevos.delete(id)
        } else {
            nuevos.add(id)
        }
        setFavoritos(nuevos)

        try {
            const res = await fetch("/api/favoritos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productoId: id,
                    action: esFavorito ? "quitar" : "agregar"
                }),
                credentials: "include"
            })

            if (!res.ok) {
                throw new Error("Error en la respuesta")
            }
        } catch (error) {
            console.error("Error toggling favorito:", error)
            setFavoritos(favoritosAnteriores)
        }
    }

    const categorias = Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)))
    const precios = productos.map(p => Number(p.precio))
    const precioMin = precios.length > 0 ? Math.min(...precios) : 0
    const precioMax = precios.length > 0 ? Math.max(...precios) : 1000

    const COLORES = [
        { nombre: "negro", codigos: ["999", "900", "901", "902", "903", "904"], hex: "#1a1a1a" },
        { nombre: "azul", codigos: ["100", "101", "102", "200", "201", "300", "301"], hex: "#1e40af" },
        { nombre: "blanco", codigos: ["001", "002", "003", "004", "005"], hex: "#f5f5f5" },
        { nombre: "rojo", codigos: ["500", "501", "502", "503", "600"], hex: "#dc2626" },
        { nombre: "rosa", codigos: ["310", "311", "312", "313", "314", "315", "316"], hex: "#ec4899" },
        { nombre: "celeste", codigos: ["400", "401", "402", "410"], hex: "#0ea5e9" },
        { nombre: "verde olivo", codigos: ["700", "701", "702", "710"], hex: "#65a30d" },
        { nombre: "marron", codigos: ["800", "801", "802", "810", "820"], hex: "#78350f" },
    ]

    const getColorFromNombre = (nombre: string): string | null => {
        const parts = nombre.split("-")
        const codigo = parts[parts.length - 1]?.trim()
        if (!codigo) return null
        
        for (const color of COLORES) {
            if (color.codigos.includes(codigo)) {
                return color.nombre
            }
        }
        return null
    }

    const productosFiltrados = productos.filter(prod => {
        if (filtros.categoria && prod.categoria !== filtros.categoria) return false

        if (filtros.precioMin !== null && Number(prod.precio) < filtros.precioMin) return false
        if (filtros.precioMax !== null && Number(prod.precio) > filtros.precioMax) return false

        if (filtros.soloFavoritos && !favoritos.has(prod.id)) return false

        if (filtros.busqueda && !prod.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())) return false

        if (filtros.color) {
            const colorProducto = getColorFromNombre(prod.nombre)
            if (colorProducto !== filtros.color) return false
        }

        return true
    })

    const tieneFiltrosActivos = filtros.categoria || filtros.precioMin !== null || filtros.precioMax !== null || filtros.soloFavoritos || filtros.busqueda || filtros.color

    return (
        <div className="p-6 md:p-10 font-sans">
            {/* Tarjetas para empleados */}
            {userRole === "empleado" && (
                <div className="max-w-7xl mx-auto mb-8">
                    <h2 className="text-lg font-semibold text-slate-700 mb-4">Acciones Rápidas</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => setShowCrearPedido(true)}
                            className="flex items-center gap-4 p-4 bg-white border-2 border-blue-500 rounded-xl hover:bg-blue-50 transition-colors text-left group"
                        >
                            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <FilePlus className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900">Crear Pedido</p>
                                <p className="text-sm text-slate-500">Nuevo pedido para cliente</p>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            <div ref={headerRef} className="mb-6 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div className="w-full md:w-auto">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Mi Catalogo Exclusivo
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Bienvenido(a), <span className="font-semibold text-slate-700">{userName}</span>.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre..."
                            value={filtros.busqueda}
                            onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                        />
                    </div>
                    <button
                        onClick={() => setFiltros({ ...filtros, soloFavoritos: !filtros.soloFavoritos })}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-semibold transition-colors ${filtros.soloFavoritos ? 'border-red-500 text-red-600 bg-red-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Heart className={`h-4 w-4 ${filtros.soloFavoritos ? 'fill-current text-red-500' : ''}`} />
                        Favoritos
                    </button>
                    <button
                        onClick={() => setShowFiltros(true)}
                        className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-semibold transition-colors ${tieneFiltrosActivos ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Filter className="h-4 w-4" />
                        Filtrar {tieneFiltrosActivos && `(${productosFiltrados.length})`}
                    </button>
                    <CarritoBadge />
                </div>
            </div>

            {tieneFiltrosActivos && (
                <div className="max-w-7xl mx-auto mb-4">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm text-slate-500">Filtros activos:</span>
                        {filtros.busqueda && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                "{filtros.busqueda}"
                                <button onClick={() => setFiltros({ ...filtros, busqueda: "" })}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        {filtros.categoria && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {filtros.categoria}
                                <button onClick={() => setFiltros({ ...filtros, categoria: "" })}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        {(filtros.precioMin !== null || filtros.precioMax !== null) && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                S/ {filtros.precioMin || "0"} - S/ {filtros.precioMax || "∞"}
                                <button onClick={() => setFiltros({ ...filtros, precioMin: null, precioMax: null })}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        {filtros.stock && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                {filtros.stock === "disponible" ? "Disponible" : filtros.stock === "pocas" ? "Pocas unidades" : "Agotado"}
                                <button onClick={() => setFiltros({ ...filtros, stock: "" })}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        {filtros.soloFavoritos && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                                <Heart className="h-3 w-3 fill-current" /> Favoritos
                                <button onClick={() => setFiltros({ ...filtros, soloFavoritos: false })}><X className="h-3 w-3" /></button>
                            </span>
                        )}
                        <button
                            onClick={() => setFiltros({ categoria: "", precioMin: null, precioMax: null, stock: "", soloFavoritos: false, busqueda: "", color: null })}
                            className="text-xs text-slate-500 hover:text-slate-700 underline"
                        >
                            Limpiar todo
                        </button>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {productosFiltrados.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <p className="text-slate-500 mb-4">No hay productos que coincidan con los filtros.</p>
                        <Button onClick={() => setFiltros({ categoria: "", precioMin: null, precioMax: null, stock: "", soloFavoritos: false, busqueda: "", color: null })}>
                            Limpiar filtros
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {productosFiltrados
                                .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                .map((prod) => (
                                    <ProductoCard
                                        key={prod.id}
                                        producto={prod}
                                        esFavorito={favoritos.has(prod.id)}
                                        onToggleFavorito={toggleFavorito}
                                    />
                                ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(productosFiltrados.length / itemsPerPage)}
                            itemsPerPage={itemsPerPage}
                            totalItems={productosFiltrados.length}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(value) => {
                                setItemsPerPage(value)
                                setCurrentPage(1)
                            }}
                            itemLabel="productos"
                        />
                    </>
                )}
            </div>

            {showFiltros && (
                <PanelFiltros
                    filtros={filtros}
                    setFiltros={setFiltros}
                    categorias={categorias}
                    precioMin={precioMin}
                    precioMax={precioMax}
                    onClose={() => setShowFiltros(false)}
                />
            )}

            <CrearPedidoModal 
                isOpen={showCrearPedido} 
                onClose={() => setShowCrearPedido(false)}
                userName={userName}
            />

            <CarritoParticulas showFloatingCart={isScrolled} />

            {isScrolled && (
                <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Link href="/dashboard/carrito">
                        <button data-carrito-badge-floating className="flex items-center justify-center h-12 w-12 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                            <div className="relative">
                                <ShoppingCart className={`h-5 w-5 ${carritoCount > 0 ? "animate-bounce" : ""}`} />
                                {carritoCount > 0 && (
                                    <span className="absolute -top-4 -right-4 min-w-[1.25rem] h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                                        {carritoCount}
                                    </span>
                                )}
                            </div>
                        </button>
                    </Link>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="flex items-center justify-center h-12 w-12 bg-slate-800 text-white rounded-full shadow-xl hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    )
}