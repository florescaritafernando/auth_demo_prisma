# Manchester Collection Peru - Design System
## Documento de Consistencia Visual

---

## 1. Filosofía de Diseño

**Objetivo:** Crear una experiencia visual coherente y profesional que transmita calidad premium en la industria textil peruana.

**Principios:**
- Minimalismo sofisticado con toques de elegancia clásica
- Jerarquía visual clara para facilitar la navegación
- Consistencia en todos los puntos de contacto del usuario
- Sensación de lujo accesible (premium sin ser intimidante)

---

## 2. Paleta de Colores

### Colores Principales

| Nombre | Token Tailwind | Hex | Uso |
|--------|---------------|-----|-----|
| **Primary** | `slate-900` | `#0f172a` | Headers, botones principales, texto headings |
| **Primary Hover** | `slate-800` | `#1e293b` | Estados hover de elementos primarios |
| **Background** | `slate-50` | `#f8fafc` | Fondo de páginas |
| **Surface** | `white` | `#ffffff` | Cards, modals, contenedores |
| **Border Default** | `slate-200` | `#e2e8f0` | Bordes de cards, inputs |
| **Border Hover** | `slate-300` | `#cbd5e1` | Estados hover de bordes |

### Colores de Acción

| Nombre | Token | Hex | Uso |
|--------|-------|-----|-----|
| **Accent Primary** | `blue-600` | `#2563eb` | Botones CTA principales, links |
| **Accent Hover** | `blue-700` | `#1d4ed8` | Hover de botones CTA |
| **Accent Light** | `blue-50` | `#eff6ff` | Fondos de badges, alertas suaves |

### Colores de Texto

| Nombre | Token | Hex | Uso |
|--------|-------|-----|-----|
| **Text Primary** | `slate-900` | `#0f172a` | Headings, títulos |
| **Text Body** | `slate-700` | `#334155` | Texto de párrafos |
| **Text Secondary** | `slate-500` | `#64748b` | Labels, descripciones |
| **Text Muted** | `slate-400` | `#94a3b8` | Placeholders, hints |

### Colores de Estado

| Estado | Token | Hex | Uso |
|--------|-------|-----|-----|
| **Success** | `green-600` | `#16a34a` | Stock disponible, confirmaciones |
| **Success Light** | `green-50` | `#f0fdf4` | Fondos de éxito |
| **Warning** | `amber-500` | `#f59e0b` | Stock bajo, alertas |
| **Error** | `red-600` | `#dc2626` | Errores, sin stock |
| **Error Light** | `red-50` | `#fef2f2` | Fondos de error |

### Colores Especiales

| Nombre | Hex | Uso |
|--------|-----|-----|
| **WhatsApp** | `#25D366` | Botón flotante de WhatsApp |
| **Sidebar Gold** | `#D4AF37` | Labels de grupos en sidebar |
| **Sidebar Text** | `#F2EBE3` | Texto de menú en sidebar |

---

## 3. Tipografía

### Familia de Fuentes

| Uso | Fuente | Fallback |
|-----|--------|----------|
| **General** | `font-sans` (Inter) | System UI stack |
| **Headings** | `font-sans` | System UI stack |

### Escala Tipográfica

| Token | Valor | Uso | Ejemplo |
|-------|-------|-----|---------|
| `text-xs` | 12px | Badges, captions | Etiquetas de stock |
| `text-sm` | 14px | Cuerpo, descripciones | Textos de cards |
| `text-base` | 16px | Texto base | Cuerpo de párrafos |
| `text-lg` | 18px | Subheadings | Títulos de secciones |
| `text-xl` | 20px | Títulos de cards | Nombres de productos |
| `text-2xl` | 24px | Títulos de sección | "Sobre Nosotros" |
| `text-3xl` | 30px | Títulos de página | Headers de secciones |
| `text-4xl` | 36px | Hero secundario | Subtítulos de banner |
| `text-6xl` | 48px | Hero principal | Título del banner |

### Pesos Tipográficos

| Token | Valor | Uso |
|-------|-------|-----|
| `font-normal` | 400 | Texto de párrafos |
| `font-medium` | 500 | Labels, navegación |
| `font-semibold` | 600 | Énfasis, precios |
| `font-bold` | 700 | Títulos, botones |
| `font-extrabold` | 800 | Hero, CTA principales |

### Estilos de Texto

| Estilo | Clases | Uso |
|--------|--------|-----|
| **Heading** | `font-bold tracking-tight` | Títulos de secciones |
| **Label** | `text-xs font-medium uppercase tracking-wider` | Etiquetas de categoría |
| **Body** | `text-sm leading-relaxed` | Texto descriptivo |
| **Caption** | `text-xs text-slate-500` | Metadatos, fechas |

---

## 4. Sistema de Espaciado

### Padding (Espaciado Interno)

| Token | Valor | Uso |
|-------|-------|-----|
| `p-2` | 8px | Espaciado mínimo |
| `p-3` | 12px | Interior de cards pequeñas |
| `p-4` | 16px | **Estándar** - cards, modals |
| `p-5` | 20px | Contenedores grandes |
| `p-6` | 24px | Secciones internas |
| `p-8` | 32px | Contenedores amplios |
| `px-4` | 16px horizontal | Padding móvil horizontal |
| `px-10` | 40px horizontal | Padding desktop |
| `py-6` | 24px vertical | Secciones compactas |
| `py-24` | 96px vertical | **Secciones de landing** |

### Gap (Espaciado Entre Elementos)

| Token | Valor | Uso |
|-------|-------|-----|
| `gap-1` | 4px | Elementos muy cercanos |
| `gap-2` | 8px | Grid móvil (2x2) |
| `gap-3` | 12px | Elementos relacionados |
| `gap-4` | 16px | **Estándar** - Grid tablet |
| `gap-6` | 24px | Grid desktop |
| `gap-8` | 32px | Separación de secciones |

---

## 5. Sistema de Border Radius

| Token | Valor | Uso | Ejemplo |
|-------|-------|-----|---------|
| `rounded` | 4px | Escaso uso | - |
| `rounded-lg` | 8px | **Predeterminado** | Botones, inputs |
| `rounded-xl` | 12px | Modals, cards grandes | Modal de producto |
| `rounded-2xl` | 16px | Cards de producto | Cards en catálogo |
| `rounded-[1.5rem]` | 24px | Cards de producto dashboard | Dashboard |
| `rounded-[2rem]` | 32px | Feature cards | Cards "Sobre Nosotros" |
| `rounded-full` | 9999px | Pills, filtros | Filtros de categoría |
| `rounded-4xl` | - | Badges | Badges de stock |

**Regla:** Usar `rounded-lg` (8px) como predeterminado para mantener consistencia.

---

## 6. Sistema de Sombras

| Token | Uso |
|-------|-----|
| `shadow-sm` | Headers, cards sin hover |
| `shadow-md` | Cards estándar |
| `shadow-lg` | Cards en hover, botones carrusel |
| `shadow-xl` | Cards con énfasis en hover |
| `shadow-2xl` | **Modals**, elementos flotantes |
| `shadow-black/30` | Banners con overlay |

**Regla:** Cards con `shadow-sm` base + `shadow-xl hover`.

---

## 7. Componentes

### 7.1 Botones

| Variante | Clases | Uso |
|----------|--------|-----|
| **Primary CTA** | `bg-blue-600 hover:bg-blue-700 text-white rounded-lg` | Acciones principales |
| **Secondary Dark** | `bg-slate-900 hover:bg-slate-800 text-white rounded-lg` | Dashboard, acciones fuertes |
| **Outline** | `border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg` | Acciones secundarias |
| **Ghost** | `text-slate-600 hover:bg-slate-100 hover:text-slate-900` | Navegación, terciarias |

#### Tamaños de Botones

| Tamaño | Altura | Token | Uso |
|--------|--------|-------|-----|
| Small | 32px | `h-8` | Default |
| Medium | 36px | `h-9` | Large variant |
| Large | 40px | `h-10` | Navegación |
| Hero | 56px | `h-14` | CTA principal landing |

#### Botón Icono

| Tamaño | Token | Uso |
|--------|-------|-----|
| Default | `h-8 w-8` | Iconos de acción |
| Modal | `h-10 w-10` | Cerrar modal |
| FAB | `h-12 w-12` | Botón flotante |

---

### 7.2 Cards

| Tipo | Clases Base | Uso |
|------|-------------|-----|
| **Estándar** | `bg-white border border-slate-200 rounded-lg p-4 shadow-sm` | General |
| **Producto Dashboard** | `bg-white border border-slate-200 rounded-[1.5rem] p-3 shadow-sm` | Grid de productos |
| **Feature Landing** | `bg-slate-50 border border-slate-100 rounded-[2rem] p-10` | Secciones de información |
| **Testimonio** | `bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm` | Reseñas de clientes |

#### Hover de Cards

| Tipo | Hover |
|------|-------|
| Estándar | `hover:shadow-xl hover:-translate-y-1 duration-300` |
| Producto | `hover:shadow-xl hover:shadow-slate-200 transition-all duration-300` |

---

### 7.3 Inputs

| Atributo | Valor |
|----------|-------|
| Altura | `h-8` (32px) |
| Border | `border border-slate-300` |
| Border-radius | `rounded-lg` |
| Padding | `px-2.5 py-1` |
| Font-size | `text-sm` |
| Focus | `focus:ring-2 focus:ring-blue-500 focus:border-blue-500` |
| Placeholder | `placeholder:text-slate-400` |

---

### 7.4 Badges

| Atributo | Valor |
|----------|-------|
| Altura | `h-5` (20px) |
| Border-radius | `rounded-4xl` (pill) |
| Font-size | `text-xs` |
| Font-weight | `font-medium` |
| Padding | `px-2 py-0.5` |

#### Variantes de Color

| Variante | Clases | Uso |
|----------|--------|-----|
| Info | `bg-blue-50 text-blue-700` | Información |
| Success | `bg-emerald-100 text-emerald-700` | Stock disponible |
| Warning | `bg-amber-100 text-amber-700` | Stock bajo |
| Error | `bg-red-100 text-red-700` | Agotado |

---

### 7.5 Modals

| Elemento | Clases |
|----------|--------|
| Overlay | `fixed inset-0 bg-black/60 backdrop-blur-sm` |
| Container | `bg-white rounded-xl shadow-2xl` |
| Header | `bg-slate-900 text-white px-6 py-4` |
| Border-radius | `rounded-xl` |
| Max-width | `max-w-sm` (400px), `max-w-lg` (500px), `max-w-2xl` (600px) |

---

### 7.6 Sidebar (Dashboard)

| Elemento | Clases/Valores |
|----------|----------------|
| Background | `bg-slate-900` |
| Border | `border-r border-slate-800` |
| Text color | `#F2EBE3` |
| Group labels | `text-[#D4AF37] font-bold tracking-widest text-xs uppercase` |
| Menu items | `text-[#F2EBE3]` |

---

## 8. Layouts

### Container Máximo

| Tipo | Clases |
|------|--------|
| Página completa | `max-w-7xl mx-auto` |
| Secciones | `max-w-6xl mx-auto` |
| Contenido centrado | `max-w-4xl mx-auto` |

### Header Pattern

```
sticky top-0 z-50
bg-white/95 backdrop-blur-md
border-b border-slate-200
shadow-sm
px-4 md:px-12
py-4
```

### Grid System

| Dispositivo | Ancho | Columnas | Gap |
|-------------|-------|----------|-----|
| Mobile | < 768px | 2 | `gap-2` |
| Tablet | 768px+ | 2-3 | `gap-4` |
| Desktop | 1024px+ | 3-4 | `gap-6` |

---

## 9. Efectos de Interacción

### Hover States

| Elemento | Hover |
|----------|-------|
| Cards | `hover:shadow-xl hover:-translate-y-1 duration-300` |
| Botones primarios | `hover:bg-blue-700` |
| Botones outline | `hover:bg-slate-50` |
| Links | `hover:text-slate-900 hover:bg-slate-100` |
| Imágenes producto | `group-hover:scale-105 transition-transform duration-300` |

### Focus States

| Elemento | Focus |
|----------|-------|
| Inputs | `focus:ring-2 focus:ring-blue-500 focus:border-blue-500` |
| Botones | `focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2` |

### Transiciones

| Tipo | Duración | Uso |
|------|----------|-----|
| Cards | `transition-all duration-300` | Hover, transform |
| Botones | `transition-colors` | Cambio de color |
| Imágenes | `transition-transform duration-300` | Scale |
| General | `transition-all` | Default |

---

## 10. Iconografía

### Tamaños de Iconos

| Tamaño | Token | Uso |
|--------|-------|-----|
| Small | `h-4 w-4` (16px) | Iconos inline, badges |
| Medium | `h-5 w-5` (20px) | Menú, inputs |
| Large | `h-6 w-6` (24px) | Features, headers |
| XL | `h-10 w-10` (40px) | Iconos de sección |
| Avatar | `h-12 w-12` (48px) | Perfiles |

### Librería
**Lucide React** - Consistente en todo el proyecto.

---

## 11. Checklist de Consistencia

Antes de crear o modificar un componente, verificar:

- [ ] ¿Usa `rounded-lg` como border-radius predeterminado?
- [ ] ¿Los colores usan la paleta definida (slate, blue)?
- [ ] ¿El espaciado sigue los tokens definidos (p-4, gap-4)?
- [ ] ¿Las sombras usan `shadow-sm` base + `shadow-xl hover`?
- [ ] ¿Los botones tienen estados hover y focus definidos?
- [ ] ¿La tipografía sigue la escala definida?
- [ ] ¿El padding interno de cards es consistente (`p-3` o `p-4`)?
- [ ] ¿Usa la librería Lucide React para iconos?

---

## 12. Archivos de Referencia

| Archivo | Propósito |
|---------|-----------|
| `app/page.tsx` | Landing page - referencia de diseño público |
| `app/dashboard/page.tsx` | Dashboard layout |
| `app/dashboard/dashboard-client.tsx` | Componentes del dashboard |
| `components/ui/button.tsx` | Componente base de botones |
| `components/ui/card.tsx` | Componente base de cards |
| `components/ui/input.tsx` | Componente base de inputs |
| `lib/utils.ts` | Función `cn()` para merging de clases |

---

## 13. Notas de Implementación

### Landing Page vs Dashboard

El landing page usa un diseño más público y accesible:
- Fondos alternados (`bg-slate-50` / `bg-white` / `bg-slate-950`)
- Cards con bordes visibles
- Secciones con mucho padding vertical (`py-24`)

El dashboard usa un diseño más funcional:
- Sidebar oscuro (`bg-slate-900`)
- Cards más compactas (`rounded-[1.5rem]`)
- Mayor densidad de información

### Consistencia Cruzada

Para mantener armonía visual:
- Usar los mismos tokens de color en ambas interfaces
- Mantener el mismo sistema de sombras
- Compartir componentes base de shadcn/ui cuando sea posible
- Los colores de estado (success, warning, error) deben ser idénticos