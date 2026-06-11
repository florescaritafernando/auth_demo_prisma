import type { MetadataRoute } from "next"
import prisma from "@/lib/prisma"
import { toSlug } from "@/lib/slug"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.manchestercollectionperu.com"

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/forgot-password`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.1 },
    { url: `${baseUrl}/reset-password`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.1 },
  ]

  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: { nombre: true, categoria: true, updatedAt: true },
  })

  const productPages: MetadataRoute.Sitemap = productos.map((p) => ({
    url: `${baseUrl}/producto/${toSlug(p.nombre, p.categoria)}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...staticPages, ...productPages]
}
