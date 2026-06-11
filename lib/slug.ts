export function toSlug(nombre: string, categoria: string): string {
  const namePart = nombre.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  const catPart = categoria.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  return `${namePart}-${catPart}`
}

export function getImageSrc(url: string | null): string {
  if (!url) return ""
  const parts = url.split("/upload/")
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_900,h_700,c_fit/${parts[1]}`
  }
  return url
}
