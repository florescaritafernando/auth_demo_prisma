"use client";

import Image from "next/image";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { Map, MapControls, MapMarker, MarkerContent } from "@/components/ui/map";
import { Card } from "@/components/ui/card";

const WHATSAPP_NUMBER = "51981404062"
const WHATSAPP_MESSAGE = "Hola%20Manchester%20Collection%20Per%C3%BA,%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20sus%20productos"

/* carousel imports */
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

/* Iconos de Lucide */
import { Award, CircleDollarSign, Scissors, ArrowRight, Search, Menu, X, ImageOff, ZoomIn, ZoomOut, MessageCircle, ChevronDown } from "lucide-react"

const RESENAS_CLIENTES = [
  {
    nombre: "Carlos Mendoza",
    cargo: "Sastre Profesional",
    empresa: "Taller de Confección Mendoza",
    comentario: "Excelente calidad de telas, los trajes hechos con tela Manchester duran años. Mis clientes siempre quedan satisfechos.",
    valoracion: 5,
  },
  {
    nombre: "Maria Elena Quispe",
    cargo: "Diseñadora de Modas",
    empresa: "Atelier Elegancia",
    comentario: "El mejor catálogo de telas para eventos en Lima. La variedad de colores y texturas es incomparable.",
    valoracion: 5,
  },
  {
    nombre: "Roberto Diaz",
    cargo: "Gerente Comercial",
    empresa: "Tienda de Trajes Elegantes",
    comentario: "Encontré el balance perfecto entre calidad y precio. Mis ventas aumentaron un 40% desde que trabajo con Manchester Collection.",
    valoracion: 5,
  },
  {
    nombre: "Ana Lucia Torres",
    cargo: "Novia",
    comentario: "Mi vestido de matrimonio fue único gracias a la tela que seleccioné. Todos elogiaron la calidad del tejido.",
    valoracion: 5,
  },
];

const SOCIOS_CLAVES = [
  {
    nombre: "COLORTEX PERU S.A.",
    descripcion: "Proveedor líder de tejidos y telas importadas de alta calidad",
    logo: "/images/colortexperu.png",
  },
  {
    nombre: "COLORTEX PERU S.A.",
    descripcion: "Distribuidor autorizado de hilaturas premium",
    logo: "/images/colortexperu.png",
  },
  {
    nombre: "COLORTEX PERU S.A.",
    descripcion: "Socio estratégico nacional",
    logo: "/images/colortexperu.png",
  },
];

function getImageSrc(url: string | null): string {
  if (!url) return ''
  const parts = url.split('/upload/')
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_900,h_700,c_fit/${parts[1]}`
  }
  return url
}

function ProductCard({ prod, onClick, priority }: { prod: any, onClick?: () => void, priority?: boolean }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      className="group relative bg-white border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col rounded-lg overflow-hidden"
      onClick={onClick}
    >
      <div className="relative w-full aspect-[6/6] bg-slate-100 flex items-center justify-center overflow-hidden">
        {prod.imagen ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-slate-200 animate-pulse z-10" />
            )}
            <Image
              src={getImageSrc(prod.imagen)}
              alt={prod.nombre}
              fill
              priority={priority}
              loading="eager"
              className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onLoad={() => setImageLoaded(true)}
              style={{ opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.3s ease-in-out' }}
            />
          </>
        ) : (
          <ImageOff className="w-12 h-12 text-slate-400" />
        )}
      </div>
      <div className="p-4 flex flex-col items-center text-center justify-center">
        <h3 className="text-sm font-medium text-slate-900">{prod.nombre}</h3>
        <p className="text-xs text-slate-500 mt-1">{prod.categoria}</p>
        <span className="text-xs text-slate-400 mt-3 hover:text-slate-600 transition-colors">
          Ver detalles →
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [carouselApi, setCarouselApi] = useState<any>(null);
  const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(null);
  const [tipoDisenoSeleccionado, setTipoDisenoSeleccionado] = useState<string>("todos");
  const [productosRandom, setProductosRandom] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(20);
  const LOAD_MORE = 20;

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (categoriaSeleccionada === "todas" && searchTerm === "" && !colorSeleccionado && tipoDisenoSeleccionado === "todos" && productos.length > 0) {
      setProductosRandom(shuffleArray(productos).slice(0, 20));
    }
  }, [productos, categoriaSeleccionada, searchTerm, colorSeleccionado, tipoDisenoSeleccionado]);

  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm, categoriaSeleccionada, colorSeleccionado, tipoDisenoSeleccionado]);

  const ORDEN_CATEGORIAS = [
    "MANCHESTER SUITING",
    "MANCHESTER STRECH",
    "MANCHESTER FASHION",
    "LONDON FANCY SUITING"
  ];

  const getOrdenCategoria = (categoria: string) => {
    const idx = ORDEN_CATEGORIAS.indexOf(categoria.toUpperCase());
    return idx >= 0 ? idx : 100 + ORDEN_CATEGORIAS.filter(c => categoria.toUpperCase().includes(c.split(" ")[1] || "")).length;
  };

  useEffect(() => {
    fetch('/api/productos?activo=true')
      .then(res => res.json())
      .then(data => {
        setProductos(data.productos || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, []);

  useEffect(() => {
    if (!carouselApi || searchTerm !== "" || categoriaSeleccionada !== "todas") return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselApi, searchTerm, categoriaSeleccionada]);

  const productosOrdenados = [...productos]
    .filter(p => categoriaSeleccionada === "todas" || p.categoria === categoriaSeleccionada)
    .filter(p => {
      if (colorSeleccionado) {
        if (!p.tipocolores || p.tipocolores.toLowerCase() !== colorSeleccionado) return false;
      }
      return true;
    })
    .filter(p => {
      if (tipoDisenoSeleccionado !== "todos") {
        if (p.tipodiseno !== tipoDisenoSeleccionado) return false;
      }
      return true;
    })
    .filter(p =>
      searchTerm === "" ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const productosCarrusel = categoriaSeleccionada === "todas" && searchTerm === "" && !colorSeleccionado && tipoDisenoSeleccionado === "todos"
    ? productosRandom
    : productosOrdenados;

  const categoriasOrdenadas = ["todas", ...new Set(productos.map(p => p.categoria).filter(Boolean))]
    .sort((a, b) => {
      if (a === "todas") return -1;
      if (b === "todas") return 1;
      return getOrdenCategoria(a) - getOrdenCategoria(b);
    });

  const tiposDisenoUnicos = ["todos", ...[...new Set(productos.map(p => p.tipodiseno).filter(Boolean))].sort()];

  const coloresUnicos = [...new Set(productos.map(p => p.tipocolores).filter(Boolean))] as string[];

  const COLOR_HEX: Record<string, string> = {
    "negro": "#1a1a1a",
    "azul noche": "#090e1c",
    "azul barcelona": "#2c104b",
    "azul electrico": "#2b1ea4",
    "azul acero": "#2b3486",
    "celeste": "#478eae",
    "vino": "#4f1919ff",
    "rosado": "#ec4899",
    "lila": "#d29bfd",
    "rojo": "#dc2626",
    "verde olivo": "#80bb99ff",
    "verde": "#2e5a3f",
    "beige": "#d4c9a9",
    "hueso": "#c9c4b1",
    "blanco": "#f5f5f5",
    "marron": "#452a1b",
    "amarillo": "#fcd34d",
    "plomo oscuro": "#363535ff",
    "plomo plata": "#b4b3b3ff",
  };

  const COLORES = coloresUnicos.map(color => ({
    nombre: color.toLowerCase(),
    hex: COLOR_HEX[color.toLowerCase()] || "#ffffffff",
  }));

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-12 py-4">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-8">
            <div className="flex justify-between items-center w-full lg:w-auto">
              {/* Logo (Redirige al inicio) */}
              <a href="/" className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 whitespace-nowrap">
                Manchester <span className="font-light text-slate-500">Collection</span>
              </a>

              {/* Menú Hamburguesa para Móviles */}
              <button
                className="lg:hidden p-2 text-slate-600 focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Alternar menú"
              >
                {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
              </button>
            </div>

            {/* Contenedor Colapsable (Móvil) / Fila (Desktop) */}
            <div className={`w-full lg:flex lg:items-center lg:justify-end gap-6 transition-all duration-300 ${isMobileMenuOpen ? 'block' : 'hidden lg:flex'}`}>

              {/* Barra de busqueda + Filtro por diseño (Desktop) */}
              <div className="flex w-full lg:w-[450px] xl:w-[520px] items-center mt-4 lg:mt-0 gap-2">
                <form onSubmit={(e) => e.preventDefault()} className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar por código"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 lg:py-2.5 rounded-full border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm placeholder:text-slate-400 shadow-sm"
                  />
                </form>
                <div className="relative flex-1">
                  <select
                    value={tipoDisenoSeleccionado}
                    onChange={(e) => setTipoDisenoSeleccionado(e.target.value)}
                    className="w-full py-3 lg:py-2.5 pl-3 pr-8 rounded-full border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm shadow-sm cursor-pointer font-medium appearance-none"
                  >
                    {tiposDisenoUnicos.map(td => (
                      <option key={td} value={td}>
                        {td === "todos" ? "Buscar por diseño" : td}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Navegación responsiva */}
              <nav className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-1 mt-6 lg:mt-0 w-full lg:w-auto">
                <a href="/" onClick={() => setIsMobileMenuOpen(false)} className="w-full lg:w-auto px-4 py-2.5 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-left lg:text-center transition-colors">
                  Inicio
                </a>
                <a href="#catalogo" onClick={() => setIsMobileMenuOpen(false)} className="w-full lg:w-auto px-4 py-2.5 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-left lg:text-center transition-colors">
                  Catálogo
                </a>
                <a href="#nosotros" onClick={() => setIsMobileMenuOpen(false)} className="w-full lg:w-auto px-4 py-2.5 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-left lg:text-center transition-colors">
                  Nosotros
                </a>
                <a href="#contacto" onClick={() => setIsMobileMenuOpen(false)} className="w-full lg:w-auto px-4 py-2.5 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-left lg:text-center transition-colors">
                  Contacto
                </a>
                {/*
                <span className="w-full lg:w-auto px-4 py-2.5 text-slate-400 cursor-not-allowed opacity-50" title="Próximamente">
                  Login
                </span>
                <span className="mt-2 lg:mt-0 w-full lg:w-auto inline-flex h-10 items-center justify-center rounded-md bg-slate-300 px-6 py-2 text-sm font-medium text-slate-500 opacity-50" title="Próximamente">
                  Registrarme
                </span>
                 */}
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Catálogo de Productos */}
      <section id="catalogo" className="w-full pt-6 pb-16 px-3 md:px-10 bg-slate-50 min-h-screen">
        {/* Barra de búsqueda móvil + filtro diseño - 50/50 */}
        <div className="mb-4 px-2 md:hidden">
          <div className="grid grid-cols-2 gap-2">
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por código"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm"
              />
            </form>
            <div className="relative">
              <select
                value={tipoDisenoSeleccionado}
                onChange={(e) => setTipoDisenoSeleccionado(e.target.value)}
                className="w-full py-2 pl-2 pr-6 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm cursor-pointer font-medium appearance-none"
              >
                {tiposDisenoUnicos.map(td => (
                  <option key={td} value={td}>
                    {td === "todos" ? "Buscar por diseño" : td}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Filtro de categorías - scroll horizontal */}
        <div className="mb-3 px-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide whitespace-nowrap justify-start md:justify-center">
            {loading ? (
              <div className="flex gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-20 h-8 bg-slate-200 rounded-full animate-pulse flex-shrink-0" />
                ))}
              </div>
            ) : (
              categoriasOrdenadas.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoriaSeleccionada(cat);
                    setSearchTerm("");
                    setColorSeleccionado(null);
                    setTipoDisenoSeleccionado("todos");
                  }}
                  className={`px-4 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 flex-shrink-0 ${categoriaSeleccionada === cat
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                    }`}
                >
                  {cat === "todas" ? "Todos" : cat}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Filtro de colores - scroll horizontal */}
        <div className="mb-3 px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide justify-start md:justify-center">
            {COLORES.map(color => (
              <button
                key={color.nombre}
                onClick={() => setColorSeleccionado(colorSeleccionado === color.nombre ? null : color.nombre)}
                className={`w-7 h-7 rounded-full border-2 flex-shrink-0 transition-all duration-200 ${colorSeleccionado === color.nombre
                  ? "border-blue-400 shadow-sm"
                  : "border-slate-300 hover:border-slate-400"
                  }`}
                style={{ backgroundColor: color.hex }}
                title={color.nombre.charAt(0).toUpperCase() + color.nombre.slice(1)}
              />
            ))}
            {(colorSeleccionado || tipoDisenoSeleccionado !== "todos") && (
              <button
                onClick={() => { setColorSeleccionado(null); setTipoDisenoSeleccionado("todos"); }}
                className="px-3 py-1 text-xs text-slate-500 hover:text-slate-700 underline flex-shrink-0 self-center"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
          </div>
        ) : productosOrdenados.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
              <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-700 mb-2">No encontramos telas</h3>
              <p className="text-slate-500 mb-6">
                {colorSeleccionado
                  ? `No hay productos con color ${colorSeleccionado}. Prueba con otro color.`
                  : tipoDisenoSeleccionado !== "todos"
                    ? `No hay productos con diseño ${tipoDisenoSeleccionado}. Prueba con otro diseño.`
                    : "No hay productos que coincidan con tu búsqueda."}
              </p>
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700"
                onClick={() => {
                  setSearchTerm("");
                  setCategoriaSeleccionada("todas");
                  setColorSeleccionado(null);
                  setTipoDisenoSeleccionado("todos");
                }}
              >
                Ver todo el catálogo
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Carrusel para desktop - solo cuando no hay filtros activos */}
            {searchTerm.trim() === "" && !colorSeleccionado && tipoDisenoSeleccionado === "todos" && categoriaSeleccionada === "todas" && (
              <Carousel
                className="w-full max-w-[90rem] mx-auto p-4 md:py-10 hidden md:block h-[calc(100vh-200px)]"
                opts={{
                  loop: true,
                  duration: 120,
                }}
                setApi={setCarouselApi}
                onMouseEnter={() => { }}
                onMouseLeave={() => { }}
              >
                <CarouselContent className="-ml-6 items-stretch [transition-timing-function:cubic-bezier(0.25,0.1,0.25,1)]">
                  {productosCarrusel.map((prod, idx) => (
                    <CarouselItem key={prod.id || prod.nombre} className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 h-full">
                      <ProductCard prod={prod} onClick={() => setProductoSeleccionado(prod)} priority={idx < 6} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="hidden md:flex -left-6 h-12 w-12 border-slate-200 shadow-lg bg-white text-slate-900 hover:bg-slate-50" />
                <CarouselNext className="hidden md:flex -right-6 h-12 w-12 border-slate-200 shadow-lg bg-white text-slate-900 hover:bg-slate-50" />
              </Carousel>
            )}
            {/* Grid para móvil - resultados paginados */}
            <div className="grid grid-cols-2 gap-2 px-2 md:hidden">
              {productosOrdenados.slice(0, visibleCount).map((prod, idx) => (
                <ProductCard key={prod.id || prod.nombre} prod={prod} onClick={() => setProductoSeleccionado(prod)} priority={idx < 6} />
              ))}
            </div>
            {/* Grid para desktop */}
            <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-10">
              {productosOrdenados.slice(0, visibleCount).map((prod, idx) => (
                <ProductCard key={prod.id || prod.nombre} prod={prod} onClick={() => setProductoSeleccionado(prod)} priority={idx < 6} />
              ))}
            </div>
            {visibleCount < productosOrdenados.length && (
              <div className="flex flex-col items-center mt-8 px-4">
                <p className="text-sm text-slate-500 mb-3">
                  Mostrando {Math.min(visibleCount, productosOrdenados.length)} de {productosOrdenados.length} resultados
                </p>
                <Button
                  onClick={() => setVisibleCount(prev => prev + LOAD_MORE)}
                  className="border-slate-300 border-2 text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  Ver más ({productosOrdenados.length - visibleCount} restantes)
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Banner Descarga Catálogo */}
      <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <Image
          src="/images/banner1.jpeg"
          alt="Banner Catalogo"
          fill
          sizes="100vw"
          className="object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white max-w-4xl px-6">
            <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30 border-none px-4 py-1 text-sm uppercase tracking-wider">Colección Actual</Badge>
            <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight tracking-tight">
              Descarga Nuestro Catálogo Oficial
            </h2>
            <p className="text-lg md:text-2xl mb-10 text-slate-200 font-light max-w-2xl mx-auto leading-relaxed">
              Conoce toda nuestra colección de telas Manchester para trajes formales. Envíos garantizados a todo el Perú.
            </p>
            <Button size="lg" asChild className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-lg px-10 h-14 rounded-full shadow-2xl transition-transform hover:scale-105">
              <a href="https://drive.google.com/file/d/1DRzRC4OVJJmlofBoovIy4mHXgfTsWo7p/view" target="_blank" rel="noopener noreferrer">
                Descargar Catálogo PDF
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Nosotros Section */}
      <section id="nosotros" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Sobre Manchester Collection</h2>
            <div className="h-1.5 w-24 bg-slate-900 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="mx-auto w-20 h-20 bg-slate-900 text-white flex items-center justify-center rounded-2xl mb-8 shadow-lg shadow-slate-900/20 transform -rotate-3 transition-transform hover:rotate-0">
                <Award className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Calidad Premium</h3>
              <p className="text-slate-600 leading-relaxed text-lg">Telas importadas ideales para trajes formales y eventos especiales en Perú. Acabados de primer nivel.</p>
            </div>
            <div className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="mx-auto w-20 h-20 bg-slate-900 text-white flex items-center justify-center rounded-2xl mb-8 shadow-lg shadow-slate-900/20 transform rotate-3 transition-transform hover:rotate-0">
                <CircleDollarSign className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Mejor Precio</h3>
              <p className="text-slate-600 leading-relaxed text-lg">El mejor balance costo-calidad del mercado peruano. Distribución directa y envíos a nivel nacional.</p>
            </div>
            <div className="p-10 rounded-[2rem] bg-slate-50 border border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 duration-300">
              <div className="mx-auto w-20 h-20 bg-slate-900 text-white flex items-center justify-center rounded-2xl mb-8 shadow-lg shadow-slate-900/20 transform -rotate-3 transition-transform hover:rotate-0">
                <Scissors className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Atención Experta</h3>
              <p className="text-slate-600 leading-relaxed text-lg">Asesoría especializada para profesionales de la sastrería, casas de novias, confeccionistas y particulares.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reseñas */}
      <section id="resenas" className="py-24 px-4 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Clientes Satisfechos</h2>
            <div className="h-1.5 w-24 bg-slate-900 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {RESENAS_CLIENTES.map((resena, idx) => (
              <div key={idx} className="p-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-shadow duration-300">
                <div className="flex gap-1.5 mb-6">
                  {[...Array(resena.valoracion)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-xl">★</span>
                  ))}
                </div>
                <p className="text-slate-700 mb-8 italic leading-relaxed text-lg">"{resena.comentario}"</p>
                <div className="border-t border-slate-100 pt-6">
                  <p className="font-bold text-slate-900 text-lg">{resena.nombre}</p>
                  {resena.cargo && <p className="text-sm font-medium text-slate-500 mt-1">{resena.cargo}</p>}
                  {resena.empresa && <p className="text-xs text-slate-400 mt-1">{resena.empresa}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Socios Estrategicos */}
      <section className="py-24 px-4 bg-slate-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">Nuestros Socios Estratégicos</h2>
            <div className="h-1.5 w-24 bg-slate-800 mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {SOCIOS_CLAVES.map((socio, idx) => (
              <div key={idx} className="p-8 rounded-[2rem] bg-slate-900 border border-slate-800 text-center transition-all hover:bg-slate-800/80">
                <div className="h-24 flex items-center justify-center mb-6 bg-white rounded-xl p-4">
                  <Image
                    src={socio.logo}
                    alt={socio.nombre}
                    width={200}
                    height={80}
                    className="object-contain"
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
                <h3 className="font-bold text-xl mb-3">{socio.nombre}</h3>
                <p className="text-slate-400 leading-relaxed">{socio.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-slate-950 text-slate-300">
        {/* Banner principal del footer */}
        <div className="relative py-16 px-4 overflow-hidden">
          {/* Fondo con gradiente sutil */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950"></div>

          <div className="relative max-w-7xl mx-auto">
            {/* Título */}
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Visítanos en Nuestro Local</h2>
              <p className="text-slate-400 text-lg">Jr. Gamarra 675 Int. 102, La Victoria, Lima</p>
            </div>

            {/* Grid principal: Mapa + Info contacto */}
            <div className="grid lg:grid-cols-5 gap-8 items-start">
              {/* Mapa - ocupa 3 columnas */}
              <div className="lg:col-span-3">
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-slate-800">
                  <Card className="h-72 md:h-80 w-full overflow-hidden rounded-2xl border-0">
                    <Map center={[-77.01343742086584, -12.064771234082475]} zoom={17} className="h-full w-full">
                      <MapMarker longitude={-77.01343742086584} latitude={-12.064771234082475}>
                        <MarkerContent>
                          <div className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 shadow-xl">
                            <p className="text-white text-xs font-semibold whitespace-nowrap">Manchester Collection</p>
                          </div>
                        </MarkerContent>
                      </MapMarker>
                      <MapControls />
                    </Map>
                  </Card>
                </div>
                {/* Mini info bajo el mapa */}
                <div className="mt-4 flex flex-wrap gap-4 justify-center md:justify-start">
                  <a
                    href="https://maps.app.goo.gl/PMzKVMS8cMJcQLU59"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Abrir en Google Maps
                  </a>
                </div>
              </div>

              {/* Info de contacto - ocupa 2 columnas */}
              <div className="lg:col-span-2 space-y-6">
                {/* WhatsApp destacado */}
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 rounded-2xl p-5 transition-all hover:scale-[1.01] shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-600/20 rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.198 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.189 6.974 3.181a9.9 9.9 0 012.376 6.926c0 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-300 text-sm">WhatsApp</p>
                      <p className="text-white font-medium">+51 981 404 062</p>
                    </div>
                    <svg className="w-5 h-5 text-slate-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:manchestercollectionperu@gmail.com"
                  className="block bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 hover:border-slate-600 rounded-2xl p-4 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-700/80 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Correo electrónico</p>
                      <p className="text-white font-medium">manchestercollectionperu@gmail.com</p>
                    </div>
                  </div>
                </a>

                {/* Horario */}
                <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-700/80 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-white font-semibold">Horario de Atención</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lunes a Sábados</span>
                      <span className="text-white font-medium">9:00 AM - 8:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="border-t border-slate-800 py-6 px-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-1">Manchester Collection</h3>
              <p className="text-slate-500 text-sm">Tu proveedor de confianza para telas de alta calidad en Perú</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
              <a href="#catalogo" className="hover:text-white transition-colors">Catálogo</a>
              <a href="#nosotros" className="hover:text-white transition-colors">Nosotros</a>
              <a href="#resenas" className="hover:text-white transition-colors">Reseñas</a>
              <span className="opacity-50 cursor-not-allowed">Ingresar (Próximamente)</span>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-6 pt-6 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>© {new Date().getFullYear()} Manchester Collection Peru. Todos los derechos reservados.</p>
            <div className="mt-2 md:mt-0 space-x-4">
              <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Detalle del Producto */}
      {productoSeleccionado && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => { setProductoSeleccionado(null); setZoomLevel(1); }}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header con imagen y controles */}
            <div className="relative h-64 bg-slate-100 overflow-hidden">
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.3s ease' }}
              >
                {productoSeleccionado.imagen ? (
                  <Image
                    src={productoSeleccionado.imagen}
                    alt={productoSeleccionado.nombre}
                    width={250}
                    height={250}
                    className="object-contain max-w-full max-h-full"
                    style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' }}
                  />
                ) : (
                  <ImageOff className="w-16 h-16 text-slate-400" />
                )}
              </div>

              {/* Controles de zoom */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/95 rounded-full px-2 py-1 shadow-sm border border-slate-200">
                <button
                  onClick={(e) => { e.stopPropagation(); setZoomLevel(Math.max(0.5, zoomLevel - 0.25)); }}
                  className="p-1.5 hover:bg-slate-100 rounded-full"
                >
                  <ZoomOut className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-xs font-medium text-slate-600 w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setZoomLevel(Math.min(3, zoomLevel + 0.25)); }}
                  className="p-1.5 hover:bg-slate-100 rounded-full"
                >
                  <ZoomIn className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={() => { setProductoSeleccionado(null); setZoomLevel(1); }}
                className="absolute top-3 right-3 bg-white/80 hover:bg-white p-1.5 rounded-full shadow-sm border border-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-5">
              {/* Categoría */}
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {productoSeleccionado.categoria || "Sin categoría"}
              </p>

              {/* Nombre */}
              <h2 className="text-xl font-medium text-slate-900 mb-4">
                {productoSeleccionado.nombre}
              </h2>

              {/* Descripción */}
              <div className="mb-5">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {productoSeleccionado.descripcion || "Sin descripción disponible"}
                </p>
              </div>

              {/* Botón de cotización */}
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%2C%20me%20interesa%20cotizar%20la%20tela%20${productoSeleccionado.nombre}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Cotizar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-all hover:scale-110 hover:shadow-[#25D366]/40 group"
        aria-label="Contactar por WhatsApp"
      >
        <span className="absolute right-20 bg-white text-slate-900 text-sm font-bold py-2 px-4 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          ¡Hola! ¿En qué te ayudamos?
        </span>
        <Image src="/images/whatsapp-logo.svg" alt="WhatsApp" width={40} height={40} />
      </a>
    </div>
  );
}
