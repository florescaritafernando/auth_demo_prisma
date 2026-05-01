"use client";

import Image from "next/image";
import * as React from "react";
import { useState } from "react";

/* nav imports */
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

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
import { Award, CircleDollarSign, Scissors, ArrowRight, Search, Menu, X } from "lucide-react"

const PRODUCTOS_DESTACADOS = [
  {
    nombre: "D-10-001",
    categoria: "Telas Industriales",
    imagen: "/images/D-10-001.png",
    descripcion: "Ideal para trajes formales y eventos",
  },
  {
    nombre: "D-10-005",
    categoria: "Telas Premium",
    imagen: "/images/D-10-005.png",
    descripcion: "Calidad europea superior garantizada",
  },
  {
    nombre: "D-10-020",
    categoria: "Telas Exclusivas",
    imagen: "/images/D-10-020.png",
    descripcion: "Diseños vanguardistas",
  },
  {
    nombre: "D-27-310",
    categoria: "Telas Clásicas",
    imagen: "/images/D-27-310.png",
    descripcion: "Durabilidad excepcional",
  },
  {
    nombre: "D-27-315",
    categoria: "Telas",
    imagen: "/images/D-27-315.png",
    descripcion: "Acabado perfecto al tacto",
  },
  {
    nombre: "D-27-500",
    categoria: "Temporada",
    imagen: "/images/D-27-500.png",
    descripcion: "Tendencia de temporada",
  },
  {
    nombre: "D-27-505",
    categoria: "Colección",
    imagen: "/images/D-27-505.png",
    descripcion: "Colección especial limitada",
  },
];

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

function ProductCard({ prod }: { prod: any }) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 p-5 transition-all hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2 duration-300 h-full flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] bg-slate-100/50 mb-6 shrink-0">
        <Badge className="absolute top-4 left-4 z-10 bg-slate-900 text-white hover:bg-slate-800 border-none px-3 py-1 text-xs uppercase tracking-wider font-semibold">
          Premium
        </Badge>
        <Image
          src={prod.imagen}
          alt={prod.nombre}
          fill
          className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <div className="text-center space-y-3 px-2 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{prod.nombre}</h3>
          <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">{prod.categoria}</p>
          <p className="text-sm text-slate-600 leading-relaxed mt-2">{prod.descripcion}</p>
        </div>
        <div className="pt-4 mt-auto">
          <Button className="w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-all duration-300 h-12 text-md font-medium shadow-md hover:shadow-lg" asChild>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola%2C%20me%20interesa%20cotizar%20la%20tela%20${prod.nombre}`}>
              Cotizar <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredProducts = PRODUCTOS_DESTACADOS.filter(prod =>
    prod.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prod.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <section id="catalogo" className="w-full pt-16 pb-16 px-4 md:px-10 bg-slate-50 min-h-[60vh]">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Descubre Nuestra Colección Premium
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
            La más alta calidad en telas importadas para confección, sastrería y eventos exclusivos.
            Encuentra el tejido perfecto para tu próxima creación.
          </p>
        </div>

        {searchTerm.trim() === "" ? (
          // Carrusel original si no hay búsqueda
          <Carousel className="w-full max-w-[90rem] mx-auto p-4 md:p-10" >
            <CarouselContent className="-ml-6">
              {PRODUCTOS_DESTACADOS.map((prod) => (
                <CarouselItem key={prod.imagen} className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <ProductCard prod={prod} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-6 h-14 w-14 border-slate-200 shadow-xl bg-white text-slate-900 hover:bg-slate-50" />
            <CarouselNext className="hidden md:flex -right-6 h-14 w-14 border-slate-200 shadow-xl bg-white text-slate-900 hover:bg-slate-50" />
          </Carousel>
        ) : (
          // Cuadrícula dinámica para los resultados de búsqueda
          <div className="w-full max-w-[90rem] mx-auto p-4 md:p-10">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.imagen} prod={prod} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
                <Search className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-slate-700">No encontramos telas para "{searchTerm}"</h3>
                <p className="text-slate-500 mt-2 text-lg">Intenta buscar usando otro código o categoría.</p>
                <Button
                  variant="outline"
                  className="mt-6 border-slate-300 text-slate-700"
                  onClick={() => setSearchTerm("")}
                >
                  Ver todo el catálogo
                </Button>
              </div>
            )}
          </div>
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
        <svg>
          <Image src="/images/whatsapp-logo.svg" alt="WhatsApp" width={40} height={40} />
        </svg>
      </a>
    </div>
  );
}
