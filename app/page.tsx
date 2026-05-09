"use client";

import Image from "next/image";
import * as React from "react";
import { useState, useEffect, useRef } from "react";

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
import { Award, CircleDollarSign, Scissors, ArrowRight, Search, Menu, X, ImageOff, ZoomIn, ZoomOut, MessageCircle } from "lucide-react"

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

function ProductCard({ prod, onClick, priority }: { prod: any, onClick?: () => void, priority?: boolean }) {
  return (
    <div 
      className="group relative bg-white border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all duration-300 cursor-pointer h-full flex flex-col rounded-lg overflow-hidden"
      onClick={onClick}
    >
      <div className="relative w-full aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
        {prod.imagen ? (
          <Image
            src={prod.imagen}
            alt={prod.nombre}
            fill
            priority={priority}
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
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
  const [productosRandom, setProductosRandom] = useState<any[]>([]);

  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (categoriaSeleccionada === "todas" && searchTerm === "" && !colorSeleccionado && productos.length > 0) {
      setProductosRandom(shuffleArray(productos).slice(0, 20));
    }
  }, [productos, categoriaSeleccionada, searchTerm, colorSeleccionado]);

  const COLORES = [
    { nombre: "negro", codigos: ["999", "900", "901", "902", "903", "904"], hex: "#1a1a1a" },
    { nombre: "azul", codigos: ["100", "101", "102", "200", "201", "300", "301"], hex: "#1e40af" },
    { nombre: "blanco", codigos: ["001", "002", "003", "004", "005"], hex: "#f5f5f5" },
    { nombre: "rojo", codigos: ["500", "501", "502", "503", "600"], hex: "#dc2626" },
    { nombre: "rosa", codigos: ["310", "311", "312", "313", "314", "315", "316"], hex: "#ec4899" },
    { nombre: "celeste", codigos: ["400", "401", "402", "410"], hex: "#0ea5e9" },
    { nombre: "verde olivo", codigos: ["700", "701", "702", "710"], hex: "#65a30d" },
    { nombre: "marron", codigos: ["800", "801", "802", "810", "820"], hex: "#78350f" },
  ];

  const getColorFromNombre = (nombre: string): string | null => {
    const parts = nombre.split("-");
    const codigo = parts[parts.length - 1]?.trim();
    if (!codigo) return null;
    
    for (const color of COLORES) {
      if (color.codigos.includes(codigo)) {
        return color.nombre;
      }
    }
    return null;
  };

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
        const colorProducto = getColorFromNombre(p.nombre);
        if (colorProducto !== colorSeleccionado) return false;
      }
      return true;
    })
    .filter(p =>
      searchTerm === "" ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.categoria && p.categoria.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const ordenA = getOrdenCategoria(a.categoria || "");
      const ordenB = getOrdenCategoria(b.categoria || "");
      if (ordenA !== ordenB) return ordenA - ordenB;
      return (a.nombre || "").localeCompare(b.nombre || "");
    });

  const productosCarrusel = categoriaSeleccionada === "todas" && searchTerm === "" && !colorSeleccionado
    ? productosRandom
    : productosOrdenados;

  const categoriasOrdenadas = ["todas", ...new Set(productos.map(p => p.categoria).filter(Boolean))]
    .sort((a, b) => {
      if (a === "todas") return -1;
      if (b === "todas") return 1;
      return getOrdenCategoria(a) - getOrdenCategoria(b);
    });

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

              {/* Barra de busqueda Responsiva */}
              <div className="relative w-full lg:w-[350px] xl:w-[400px] flex items-center mt-4 lg:mt-0">
                <Search className="absolute left-4 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar telas, códigos, categorías..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 lg:py-2.5 rounded-full border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-sm placeholder:text-slate-400 shadow-sm"
                />
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
                <a href="/login" className="w-full lg:w-auto px-4 py-2.5 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium text-left lg:text-center transition-colors">
                  Login
                </a>
                <a href="/signup" className="mt-2 lg:mt-0 w-full lg:w-auto inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-6 py-2 text-sm font-medium transition-colors hover:bg-slate-800 text-white shadow-sm">
                  Registrarme
                </a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Catálogo de Productos */}
      <section id="catalogo" className="w-full pt-6 pb-16 px-3 md:px-10 bg-slate-50 min-h-screen">
        {/* Barra de búsqueda móvil - arriba de todo en móvil */}
        <div className="mb-4 px-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar telas, códigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm"
            />
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
            {colorSeleccionado && (
              <button
                onClick={() => setColorSeleccionado(null)}
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
                  : "No hay productos que coincidan con tu búsqueda."}
              </p>
              <Button
                variant="outline"
                className="border-slate-300 text-slate-700"
                onClick={() => { 
                  setSearchTerm(""); 
                  setCategoriaSeleccionada("todas"); 
                  setColorSeleccionado(null);
                }}
              >
                Ver todo el catálogo
              </Button>
            </div>
          </div>
        ) : searchTerm.trim() === "" && !colorSeleccionado ? (
          <>
            {/* Grid para móvil - 2x2 pero mostrando todos los productos del carrusel (20 max) */}
            <div className="grid grid-cols-2 gap-2 px-2 md:hidden">
              {productosCarrusel.slice(0, 20).map((prod, idx) => (
                <ProductCard key={prod.id || prod.nombre} prod={prod} onClick={() => setProductoSeleccionado(prod)} priority={idx < 6} />
              ))}
            </div>
            {/* Carrusel para desktop */}
            <Carousel
              className="w-full max-w-[90rem] mx-auto p-4 md:py-10 hidden md:block h-[calc(100vh-200px)]"
              opts={{
                loop: true,
                duration: 60,
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
          </>
        ) : (
          <>
            {/* Grid para móvil - mostrar todos los resultados de la búsqueda/filtro */}
            <div className="grid grid-cols-2 gap-2 px-2 md:hidden">
              {productosOrdenados.map((prod, idx) => (
                <ProductCard key={prod.id || prod.nombre} prod={prod} onClick={() => setProductoSeleccionado(prod)} priority={idx < 6} />
              ))}
            </div>
            {/* Grid para desktop */}
            <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-4 md:px-10 h-full">
              {productosOrdenados.map((prod, idx) => (
                <ProductCard key={prod.id || prod.nombre} prod={prod} onClick={() => setProductoSeleccionado(prod)} priority={idx < 6} />
              ))}
            </div>
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
      <footer id="contacto" className="bg-slate-950 text-slate-300 py-16 px-4 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-6 text-white tracking-tight">Manchester Collection</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Tu proveedor de confianza para telas de alta calidad.
              Especialistas en tejidos para trajes formales y eventos en Perú.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Enlaces Rápidos</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#catalogo" className="hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" /> Catálogo</a></li>
              <li><a href="#nosotros" className="hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" /> Nosotros</a></li>
              <li><a href="#resenas" className="hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" /> Reseñas</a></li>
              <li><a href="/login" className="hover:text-white transition-colors flex items-center"><ArrowRight className="h-3 w-3 mr-2" /> Ingresar</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Contáctanos</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start">
                <span className="text-white mr-2">WhatsApp:</span>
                <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-white transition-colors">+51 981 404 062</a>
              </li>
              <li className="flex items-start">
                <span className="text-white mr-2">Email:</span>
                <a href="mailto:manchestercollectionperu@gmail.com" className="hover:text-white transition-colors">manchestercollectionperu@gmail.com</a>
              </li>
              <li className="flex items-start">
                <span className="text-white mr-2">Ubicación:</span>
                La Victoria, Lima, Perú
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-6 uppercase tracking-wider text-sm">Horario de Atención</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex justify-between border-b border-slate-800 pb-2"><span>Lunes a Sábado</span> <span className="text-white">9am - 7pm</span></li>
              <li className="flex justify-between"><span>Domingo</span> <span className="text-slate-500">Cerrado</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Manchester Collection Peru. Todos los derechos reservados.</p>
          <div className="mt-4 md:mt-0 space-x-4">
            <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
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
            className="bg-white rounded-lg max-w-lg w-full overflow-hidden shadow-xl border border-slate-200"
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
