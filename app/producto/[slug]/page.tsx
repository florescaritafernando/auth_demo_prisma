import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import prisma from "@/lib/prisma"
import { toSlug, getImageSrc } from "@/lib/slug"

const WHATSAPP_NUMBER = "51981404062"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: { nombre: true, categoria: true, descripcion: true, imagen: true },
  })
  const producto = productos.find((p) => toSlug(p.nombre, p.categoria) === slug)
  if (!producto) return { title: "Producto no encontrado | Manchester Collection Peru" }
  return {
    title: `${producto.nombre} - ${producto.categoria} | Manchester Collection Peru`,
    description: producto.descripcion || `Tela ${producto.nombre} - ${producto.categoria}. Cotiza por WhatsApp.`,
  }
}

export default async function ProductoPage({ params }: Props) {
  const { slug } = await params
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true,
      categoria: true,
      descripcion: true,
      imagen: true,
      tipocolores: true,
      tipodiseno: true,
      updatedAt: true,
    },
  })

  const producto = productos.find((p) => toSlug(p.nombre, p.categoria) === slug)
  if (!producto) notFound()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-4">
          <Link href="/" className="text-xl md:text-2xl font-bold tracking-tight text-slate-900">
            Manchester <span className="font-light text-slate-500">Collection</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-4">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-slate-700 transition-colors">Inicio</Link>
          <span className="text-slate-300">/</span>
          <Link href="/#catalogo" className="hover:text-slate-700 transition-colors">Catálogo</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-medium truncate">{producto.nombre}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 pb-16">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-8 md:p-12 flex items-center justify-center aspect-square sticky md:top-28">
            {producto.imagen ? (
              <Image
                src={getImageSrc(producto.imagen)}
                alt={producto.nombre}
                width={600}
                height={600}
                className="object-contain w-full h-full"
                priority
              />
            ) : (
              <div className="text-slate-300 text-sm">Sin imagen</div>
            )}
          </div>

          <div className="flex flex-col justify-center md:pt-8">
            <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full mb-4 w-fit">
              {producto.categoria}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {producto.nombre}
            </h1>
            {producto.descripcion ? (
              <p className="text-slate-600 leading-relaxed mb-8 text-lg">{producto.descripcion}</p>
            ) : (
              <p className="text-slate-400 italic mb-8 text-lg">Sin descripción disponible</p>
            )}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/#catalogo"
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 px-6 py-3.5 rounded-xl font-medium transition-all w-fit"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, me interesa cotizar la tela " + producto.nombre)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-medium transition-all hover:scale-[1.02] shadow-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.198 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.189 6.974 3.181a9.9 9.9 0 012.376 6.926c0 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Cotizar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
