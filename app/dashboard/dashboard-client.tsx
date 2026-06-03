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
import { MobileNav } from "@/components/mobile-nav"
import { ShoppingCart, Heart, X, MapPin, Package, Filter, SlidersHorizontal, XCircle, Search, FilePlus, ClipboardList, FileText, Users, File, Pencil, DollarSign, Printer, Calendar } from "lucide-react"
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
    const [zoomLevel, setZoomLevel] = useState(1)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const totalStock = producto.stocks.reduce((sum, s) => sum + s.stock, 0)

    const getStockBadge = () => {
        if (totalStock === 0) {
            return <Badge className="bg-red-100 text-red-700 text-[10px] px-1.5 py-0.5 rounded-full">Agotado</Badge>
        } else if (totalStock <= 5) {
            return <Badge className="bg-amber-100 text-amber-700 text-[10px] px-1.5 py-0.5 rounded-full">Pocas unidades</Badge>
        } else {
            return <Badge className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full">Disponible</Badge>
        }
    }

    const modalContent = showModal ? (
        <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) { setShowModal(false); setZoomLevel(1); }
            }}
        >
            <div
                className="bg-white rounded-lg max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="relative h-64 bg-slate-100 overflow-hidden">
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s ease' }}
                    >
                        {producto.imagen ? (
                            <Image
                                src={producto.imagen}
                                alt={producto.nombre}
                                width={250}
                                height={250}
                                className="object-contain max-w-full max-h-full"
                                style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
                            />
                        ) : (
                            <div className="text-slate-400">Sin imagen</div>
                        )}
                    </div>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 rounded-full px-2 py-1 shadow-sm border border-slate-200">
                        <button
                            onClick={(e) => { e.stopPropagation(); setZoomLevel(Math.max(0.5, zoomLevel - 0.25)); }}
                            className="p-1.5 hover:bg-slate-100 rounded-full"
                        >
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        </button>
                        <span className="text-xs font-medium text-slate-600 w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); setZoomLevel(Math.min(3, zoomLevel + 0.25)); }}
                            className="p-1.5 hover:bg-slate-100 rounded-full"
                        >
                            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    <button
                        onClick={() => { setShowModal(false); setZoomLevel(1); }}
                        className="absolute top-3 right-3 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-sm border border-slate-200 transition-colors"
                    >
                        <X className="w-4 h-4 text-slate-600" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                            {producto.categoria || "Sin categoría"}
                        </p>
                        {getStockBadge()}
                    </div>

                    <h2 className="text-xl font-medium text-slate-900 mb-4">
                        {producto.nombre}
                    </h2>

                    <div className="flex items-baseline gap-2 mb-5">
                        <span className="text-2xl font-semibold text-slate-900">
                            S/ {Number(producto.precio).toFixed(2)}
                        </span>
                        <span className="text-sm text-slate-500">/ metro lineal</span>
                    </div>

                    {producto.descripcion && (
                        <div className="mb-5">
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {producto.descripcion}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                        <div className="flex-1">
                            <BotonAgregarCarrito producto={producto as any} className="w-full" />
                        </div>
                        <button
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium"
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
            <div
                className="group relative bg-white border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all duration-300 h-full flex flex-col rounded-lg overflow-hidden"
            >
                <div className="relative w-full aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">

                    {/* Botón de Favoritos */}
                    <div className="absolute top-1 left-2 z-5">
                        <button
                            onClick={(e) => {
                                e.preventDefault();
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
                        priority={false}
                        className="object-contain p-6 transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        onClick={() => { setShowModal(true); setZoomLevel(1); }}
                    />
                </div>
                <div className="p-4 flex flex-col items-center text-center justify-center min-w-0">
                    <span className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                        {producto.categoria}
                    </span>
                    <div className="flex items-center justify-between w-full mb-1">
                        <h3 className="text-sm font-medium text-slate-900 line-clamp-1" title={producto.nombre}>
                            {producto.nombre}
                        </h3>
                        {getStockBadge()}
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-lg font-semibold text-slate-900">
                            S/ {Number(producto.precio).toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-500">/ metro lineal</span>
                    </div>
                </div>
                <div className="mt-auto flex rounded-b-lg overflow-hidden border-t border-slate-200">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowModal(true); setZoomLevel(1); }}
                        className="flex-1 py-3 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors border-r border-slate-200"
                    >
                        Ver
                    </button>
                    <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                        <BotonAgregarCarrito producto={producto as any} className="w-full h-full rounded-none" />
                    </div>
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
            <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
            <div className="absolute right-0 top-0 h-full w-full max-w-80 bg-white shadow-2xl p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <SlidersHorizontal className="h-5 w-5" />
                        Filtros
                    </h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
                        <select
                            value={filtros.categoria}
                            onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-700 text-sm"
                        >
                            <option value="">Todas las categorías</option>
                            {categorias.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Color</label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { nombre: "negro", codigos: ["999"], hex: "#1a1a1a" },
                                { nombre: "azul", codigos: ["520", "530", "555", "560", "575"], hex: "#1e40af" },
                                { nombre: "blanco", codigos: ["001"], hex: "#f5f5f5" },
                                { nombre: "hueso", codigos: ["005"], hex: "#efebdd" },
                                { nombre: "rojo", codigos: ["412"], hex: "#bb2626" },
                                { nombre: "vinotinto", codigos: ["430", "440"], hex: "#591b1b" },
                                { nombre: "rosa", codigos: ["310", "315"], hex: "#ec4899" },
                                { nombre: "celeste", codigos: ["540"], hex: "#8ac7e3" },
                                { nombre: "verde olivo", codigos: ["676"], hex: "#65a30d" },
                                { nombre: "marron", codigos: ["720", "740"], hex: "#78350f" },
                                { nombre: "beige", codigos: ["030", "040", "045", "D-75-745"], hex: "#bab68f" },
                                { nombre: "plomo", codigos: ["820", "825", "840", "845"], hex: "#827f7f" },
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
                        <label className="block text-sm font-semibold text-slate-700 mb-4">
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
                        <div className="flex justify-between mt-2 text-xs text-slate-600">
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
                            className="w-full py-2 text-sm text-slate-600 hover:text-slate-800 flex items-center justify-center gap-2"
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
    const [showModalYapes, setShowModalYapes] = useState(false)
    const [yapeTab, setYapeTab] = useState<"resumen" | "nuevo">("nuevo")
    const [yapesFechaInicio, setYapesFechaInicio] = useState("")
    const [yapesFechaFin, setYapesFechaFin] = useState("")
    const [generandoYapes, setGenerandoYapes] = useState(false)

    const [nuevoYapeNombre, setNuevoYapeNombre] = useState("")
    const [nuevoYapeMonto, setNuevoYapeMonto] = useState("")
    const [nuevoYapeFecha, setNuevoYapeFecha] = useState(() => new Date().toISOString().split("T")[0])
    const [agregandoYape, setAgregandoYape] = useState(false)
    const [escuchando, setEscuchando] = useState<string | false>(false)
    const [yapeSuccessMsg, setYapeSuccessMsg] = useState("")

    const iniciarReconocimiento = (campo: "nombre" | "monto") => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert("Reconocimiento de voz no soportado en este navegador. Usá Chrome o Edge.")
            return
        }

        const recognition = new SpeechRecognition()
        recognition.lang = "es-PE"
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        setEscuchando(campo)

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript.trim()
            if (campo === "nombre") {
                setNuevoYapeNombre(transcript)
            } else {
                const soloNumeros = transcript.replace(/[^0-9.]/g, "")
                setNuevoYapeMonto(soloNumeros)
            }
            setEscuchando(false)
        }

        recognition.onerror = () => {
            setEscuchando(false)
        }

        recognition.onend = () => {
            setEscuchando(false)
        }

        recognition.start()
    }

    const esStaff = userRole === "empleado" || userRole === "admin"

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
        if (esStaff) return
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
    }, [esStaff])

    useEffect(() => {
        if (esStaff) return
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
    }, [esStaff])

    useEffect(() => {
        if (!esStaff) return
        const handleYapes = () => setShowModalYapes(true)
        window.addEventListener("mobile-nav:yapes", handleYapes)
        return () => window.removeEventListener("mobile-nav:yapes", handleYapes)
    }, [esStaff])

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
        { nombre: "negro", codigos: ["999"], hex: "#1a1a1a" },
        { nombre: "azul", codigos: ["520", "530", "555", "560", "575"], hex: "#1e40af" },
        { nombre: "blanco", codigos: ["001"], hex: "#f5f5f5" },
        { nombre: "hueso", codigos: ["005"], hex: "#efebdd" },
        { nombre: "rojo", codigos: ["412"], hex: "#bb2626" },
        { nombre: "vinotinto", codigos: ["430", "440"], hex: "#591b1b" },
        { nombre: "rosa", codigos: ["310", "315"], hex: "#ec4899" },
        { nombre: "celeste", codigos: ["540"], hex: "#8ac7e3" },
        { nombre: "verde olivo", codigos: ["676"], hex: "#65a30d" },
        { nombre: "marron", codigos: ["720", "740"], hex: "#78350f" },
        { nombre: "beige", codigos: ["030", "040", "045", "D-75-745"], hex: "#bab68f" },
        { nombre: "plomo", codigos: ["820", "825", "840", "845"], hex: "#827f7f" },
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

    if (esStaff) {
        return (
            <div className="p-4 md:p-6 lg:p-10 font-sans pb-20 md:pb-10">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Bienvenido(a), {userName}</h1>
                        <p className="text-slate-500 mt-1">¿Qué deseas hacer hoy?</p>
                    </div>

                    <h2 className="text-lg font-semibold text-slate-700 mb-4 hidden sm:block">Acciones Rápidas</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("mobile-nav:crear-pedido"))}
                            className="group relative overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-5 text-left hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-slate-200/50"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-300/30 rounded-full -translate-y-6 translate-x-6 group-hover:scale-150 transition-transform duration-500" />
                            <div className="relative">
                                <div className="w-11 h-11 bg-slate-900/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-slate-900/20 transition-colors">
                                    <FilePlus className="h-5 w-5 text-slate-700" />
                                </div>
                                <p className="font-semibold text-slate-800 text-sm">Crear Pedido</p>
                                <p className="text-xs text-slate-500 mt-0.5">Nuevo pedido para cliente</p>
                            </div>
                        </button>

                        <Link
                            href="/dashboard/pedidos-admin"
                            className="group relative overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-5 text-left hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-blue-200/50"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-300/30 rounded-full -translate-y-6 translate-x-6 group-hover:scale-150 transition-transform duration-500" />
                            <div className="relative">
                                <div className="w-11 h-11 bg-blue-900/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-900/20 transition-colors">
                                    <ClipboardList className="h-5 w-5 text-blue-700" />
                                </div>
                                <p className="font-semibold text-blue-800 text-sm">Atender Pedidos</p>
                                <p className="text-xs text-blue-600/70 mt-0.5">Gestionar pedidos pendientes</p>
                            </div>
                        </Link>

                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("mobile-nav:modificar-pedido"))}
                            className="group relative overflow-hidden bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl p-5 text-left hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-indigo-200/50"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-300/30 rounded-full -translate-y-6 translate-x-6 group-hover:scale-150 transition-transform duration-500" />
                            <div className="relative">
                                <div className="w-11 h-11 bg-indigo-900/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-900/20 transition-colors">
                                    <Pencil className="h-5 w-5 text-indigo-700" />
                                </div>
                                <p className="font-semibold text-indigo-800 text-sm">Modificar Pedido</p>
                                <p className="text-xs text-indigo-600/70 mt-0.5">Editar pedidos que creaste</p>
                            </div>
                        </button>

                        <Link
                            href="/dashboard/nota-pedido"
                            className="group relative overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl p-5 text-left hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-emerald-200/50"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-300/30 rounded-full -translate-y-6 translate-x-6 group-hover:scale-150 transition-transform duration-500" />
                            <div className="relative">
                                <div className="w-11 h-11 bg-emerald-900/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-900/20 transition-colors">
                                    <FileText className="h-5 w-5 text-emerald-700" />
                                </div>
                                <p className="font-semibold text-emerald-800 text-sm">Ver Pedidos</p>
                                <p className="text-xs text-emerald-600/70 mt-0.5">Detalle completo de pedidos</p>
                            </div>
                        </Link>

                        <button
                            onClick={() => setShowModalYapes(true)}
                            className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-5 text-left hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-purple-400/30"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-300/20 rounded-full -translate-y-6 translate-x-6 group-hover:scale-150 transition-transform duration-500" />
                            <div className="relative">
                                <div className="w-11 h-11 bg-white/20 rounded-xl mb-3 group-hover:bg-white/30 transition-colors relative overflow-hidden">
                                    <Image
                                        src="/images/yape_logo.png"
                                        alt="Yape"
                                        fill
                                        sizes="44px"
                                        className="object-cover"
                                    />
                                </div>
                                <p className="font-semibold text-white text-sm">YAPES</p>
                                <p className="text-xs text-purple-200 mt-0.5 truncate">Generar PDF de YAPES recibidos</p>
                            </div>
                        </button>

                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("mobile-nav:borradores"))}
                            className="group relative overflow-hidden bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl p-5 text-left hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-amber-200/50"
                        >
                            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-300/30 rounded-full -translate-y-6 translate-x-6 group-hover:scale-150 transition-transform duration-500" />
                            <div className="relative">
                                <div className="w-11 h-11 bg-amber-900/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-900/20 transition-colors">
                                    <File className="h-5 w-5 text-amber-700" />
                                </div>
                                <p className="font-semibold text-amber-800 text-sm">Mis Borradores</p>
                                <p className="text-xs text-amber-600/70 mt-0.5">Continuar pedidos guardados</p>
                            </div>
                        </button>

                        {(userRole === "admin" || userRole === "empleado") && (
                            <>
                            <Link
                                href="/dashboard/clientes-pedido"
                                className="group relative overflow-hidden bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-5 text-left hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 border border-purple-200/50"
                            >
                                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-300/30 rounded-full -translate-y-6 translate-x-6 group-hover:scale-150 transition-transform duration-500" />
                                <div className="relative">
                                    <div className="w-11 h-11 bg-purple-900/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-900/20 transition-colors">
                                        <Users className="h-5 w-5 text-purple-700" />
                                    </div>
                                    <p className="font-semibold text-purple-800 text-sm">Gestion Clientes</p>
                                    <p className="text-xs text-purple-600/70 mt-0.5">Administrar clientes</p>
                                </div>
                            </Link>
                            </>
                        )}
                    </div>
                </div>

                <MobileNav
                    userName={userName}
                    userRole={userRole}
                />

                {/* Modal YAPES */}
                {showModalYapes && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowModalYapes(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-5 border-b border-slate-100">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">YAPES</h3>
                                    <p className="text-sm text-slate-500 mt-0.5">Generar PDF o registrar nuevo YAPE</p>
                                </div>
                                <button onClick={() => setShowModalYapes(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                                    <X className="h-5 w-5 text-slate-400" />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-slate-100 px-5">
                                <button
                                    onClick={() => setYapeTab("resumen")}
                                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${yapeTab === "resumen" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                                >
                                    <Printer className="h-4 w-4 inline mr-1.5" />
                                    Generar resumen
                                </button>
                                <button
                                    onClick={() => setYapeTab("nuevo")}
                                    className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${yapeTab === "nuevo" ? "border-purple-600 text-purple-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
                                >
                                    <DollarSign className="h-4 w-4 inline mr-1.5" />
                                    Nuevo registro
                                </button>
                            </div>

                            {/* Tab: Generar resumen */}
                            {yapeTab === "resumen" && (
                                <>
                                    <div className="p-5 space-y-5">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha inicio</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                    <input
                                                        type="date"
                                                        value={yapesFechaInicio}
                                                        onChange={(e) => setYapesFechaInicio(e.target.value)}
                                                        className="w-full pl-10 pr-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha fin</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                    <input
                                                        type="date"
                                                        value={yapesFechaFin}
                                                        onChange={(e) => setYapesFechaFin(e.target.value)}
                                                        className="w-full pl-10 pr-3 py-2 rounded-lg text-sm border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
                                        <button onClick={() => setShowModalYapes(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                            Cerrar
                                        </button>
                                        <button
                                            onClick={async () => {
                                                setGenerandoYapes(true)
                                                try {
                                                    const res = await fetch("/api/yapes-pdf", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            fechaInicio: yapesFechaInicio || undefined,
                                                            fechaFin: yapesFechaFin || undefined,
                                                        }),
                                                    })
                                                    if (!res.ok) {
                                                        const err = await res.json()
                                                        alert(err.error || "Error al generar PDF")
                                                        return
                                                    }
                                                    const blob = await res.blob()
                                                    const url = URL.createObjectURL(blob)
                                                    window.open(url, "_blank")
                                                } catch (err) {
                                                    alert(err instanceof Error ? err.message : "Error de conexión")
                                                } finally {
                                                    setGenerandoYapes(false)
                                                }
                                            }}
                                            disabled={generandoYapes}
                                            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-sm font-semibold hover:from-emerald-600 hover:to-teal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-emerald-200"
                                        >
                                            {generandoYapes ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Generando...
                                                </>
                                            ) : (
                                                <>
                                                    <Printer className="h-4 w-4" />
                                                    Generar PDF
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Tab: Nuevo registro */}
                            {yapeTab === "nuevo" && (
                                <>
                                    {yapeSuccessMsg && (
                                        <div className="mx-5 mt-5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                                <polyline points="22 4 12 14.01 9 11.01" />
                                            </svg>
                                            <span>{yapeSuccessMsg}</span>
                                        </div>
                                    )}
                                    <div className="p-5 space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nombre</label>
                                            <select
                                                value={nuevoYapeNombre}
                                                onChange={(e) => setNuevoYapeNombre(e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer text-sm max-sm:text-lg max-sm:font-bold"
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="Carlos" className="font-bold">Carlos</option>
                                                <option value="Angel" className="font-bold">Angel</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Monto</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">S/</span>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={nuevoYapeMonto}
                                                    onChange={(e) => setNuevoYapeMonto(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full pl-8 pr-10 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm max-sm:text-lg max-sm:font-bold"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => iniciarReconocimiento("monto")}
                                                    className={`absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${escuchando === "monto" ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-slate-100 text-slate-400"}`}
                                                    title="Dictar por voz"
                                                >
                                                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                                        <line x1="12" y1="19" x2="12" y2="23" />
                                                        <line x1="8" y1="23" x2="16" y2="23" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                                <input
                                                    type="date"
                                                    value={nuevoYapeFecha}
                                                    onChange={(e) => setNuevoYapeFecha(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm max-sm:text-lg max-sm:font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
                                        <button onClick={() => {
                                            setNuevoYapeNombre("")
                                            setNuevoYapeMonto("")
                                            setNuevoYapeFecha(new Date().toISOString().split("T")[0])
                                            setYapeTab("resumen")
                                        }} className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!nuevoYapeNombre.trim() || !nuevoYapeMonto) return
                                                setAgregandoYape(true)
                                                try {
                                                    const res = await fetch("/api/yapes/nuevo", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            nombre: nuevoYapeNombre.trim(),
                                                            monto: parseFloat(nuevoYapeMonto),
                                                            fecha: nuevoYapeFecha,
                                                        }),
                                                    })
                                                    if (!res.ok) {
                                                        const err = await res.json()
                                                        alert(err.error || "Error al registrar YAPE")
                                                        return
                                                    }
                                                    setNuevoYapeNombre("")
                                                    setNuevoYapeMonto("")
                                                    setNuevoYapeFecha(new Date().toISOString().split("T")[0])
                                                    setYapeSuccessMsg("YAPE registrado correctamente")
                                                    setTimeout(() => setYapeSuccessMsg(""), 3000)
                                                } catch (err) {
                                                    alert(err instanceof Error ? err.message : "Error de conexión")
                                                } finally {
                                                    setAgregandoYape(false)
                                                }
                                            }}
                                            disabled={!nuevoYapeNombre.trim() || !nuevoYapeMonto || agregandoYape}
                                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-purple-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-purple-200"
                                        >
                                            {agregandoYape ? (
                                                <>
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Guardando...
                                                </>
                                            ) : (
                                                <>
                                                    <DollarSign className="h-4 w-4" />
                                                    Registrar YAPE
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="p-4 md:p-6 lg:p-10 font-sans">
            <div ref={headerRef} className="mb-4 md:mb-6 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-3 md:gap-4">
                <div className="w-full md:w-auto">
                    <p className="text-slate-500 text-sm md:text-base lg:text-xl">
                        Bienvenido(a), <span className="font-semibold text-slate-700">{userName}</span>.
                    </p>
                </div>
                <div className="flex flex-row flex-nowrap items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:flex-none md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar artículo..."
                            value={filtros.busqueda}
                            onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                            className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 w-full text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setFiltros({ ...filtros, soloFavoritos: !filtros.soloFavoritos })}
                        className={`flex items-center justify-center gap-1.5 px-2 md:px-3 py-2 border rounded-lg font-medium text-sm transition-colors shrink-0 ${filtros.soloFavoritos ? 'border-red-500 text-red-600 bg-red-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Heart className={`h-4 w-4 ${filtros.soloFavoritos ? 'fill-current text-red-500' : ''}`} />
                        <span className="hidden sm:inline">Favoritos</span>
                    </button>
                    <button
                        onClick={() => setShowFiltros(true)}
                        className={`flex items-center justify-center gap-1.5 px-2 md:px-3 py-2 border rounded-lg font-medium text-sm transition-colors shrink-0 ${tieneFiltrosActivos ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}
                    >
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filtrar {tieneFiltrosActivos && `(${productosFiltrados.length})`}</span>
                        <span className="sm:hidden">{tieneFiltrosActivos && `(${productosFiltrados.length})`}</span>
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
            <CarritoParticulas showFloatingCart={isScrolled} />

            {isScrolled && (
                <div className="fixed bottom-20 md:bottom-24 right-4 z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <Link href="/dashboard/carrito">
                        <button data-carrito-badge-floating className="flex items-center justify-center h-11 w-11 md:h-12 md:w-12 bg-slate-900 text-white rounded-full shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
                            <div className="relative">
                                <ShoppingCart className={`h-5 w-5 ${carritoCount > 0 ? "animate-bounce" : ""}`} />
                                {carritoCount > 0 && (
                                    <span className="absolute -top-3 -right-3 min-w-[1.1rem] h-4 md:h-5 flex items-center justify-center bg-red-500 text-white text-[10px] md:text-xs font-bold rounded-full px-1">
                                        {carritoCount}
                                    </span>
                                )}
                            </div>
                        </button>
                    </Link>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="flex items-center justify-center h-11 w-11 md:h-12 md:w-12 bg-slate-800 text-white rounded-full shadow-xl hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    </div>
                )}

                <MobileNav userName={userName} userRole={userRole} />
            </div>
        )
    }