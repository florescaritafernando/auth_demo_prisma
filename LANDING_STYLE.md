# LANDING_STYLE.md
## Manchester Collection Peru - Landing Page Design System

**Referencia oficial de diseño para toda la aplicación.**

---

## 1. Filosofía Visual

El diseño del landing page transmite **elegancia minimalista** con toques de **sofisticación clásica**, evocando la calidad premium de los trajes formales mientras mantiene una experiencia accesible y moderna.

### Principios Fundamentales

| Principio | Aplicación |
|-----------|------------|
| **Minimalismo Funcional** | Cada elemento tiene un propósito, sin adornos innecesarios |
| **Jerarquía Clara** | Títulos prominentes, descripciones subordinadas, acciones evidentes |
| **呼吸 Espaciado** | Ample whitespace que permite al contenido respirar |
| **Interacciones Sutiles** | Hover effects que dan feedback sin ser agresivos |
| **Armonía Neutral** | Paleta slate que permite que el contenido destaque |

---

## 2. Paleta de Colores

### 2.1 Colores Base

| Token | Hex | Uso | Ejemplo |
|-------|-----|-----|---------|
| **slate-900** | `#0f172a` | Texto headings, headers, elementos primarios | Logo, títulos de sección |
| **slate-800** | `#1e293b` | Hover states primarios | Botones hover |
| **slate-950** | `#020617` | Fondos oscuros, footer | Footer, sección socios |
| **slate-50** | `#f8fafc` | Fondo general de página | Background principal |
| **white** | `#ffffff` | Cards, superficies elevadas | Cards de productos, modals |

### 2.2 Colores de Texto

| Token | Hex | Uso |
|-------|-----|-----|
| **slate-900** | `#0f172a` | Headings, títulos de producto |
| **slate-700** | `#334155` | Cuerpo de texto descriptivo |
| **slate-600** | `#475569` | Texto secundario |
| **slate-500** | `#64748b` | Labels, categorías |
| **slate-400** | `#94a3b8` | Texto terciario, placeholders |
| **slate-300** | `#cbd5e1` | Bordes, separadores |

### 2.3 Colores de Estado

| Estado | Token | Hex | Uso |
|--------|-------|-----|-----|
| **Amber Star** | `amber-400` | `#fbbf24` | Estrellas de rating |
| **White Alpha** | `white/20`, `white/30` | - | Badges overlays |
| **Slate Overlay** | `slate-900/60` | - | Overlays de imagen |

### 2.4 Colores Especiales

| Nombre | Hex | Uso |
|--------|-----|-----|
| **WhatsApp Green** | `#25D366` | Botón flotante |
| **WhatsApp Glow** | `#25D366/40` | Shadow del botón flotante |

---

## 3. Tipografía

### 3.1 Familia
- **Font Stack:** `font-sans` (Inter como首选, system-ui como fallback)
- **Tracking:** `tracking-tight` para headings, `tracking-wider` para labels

### 3.2 Escala Tipográfica

| Token | Valor | Uso | Ejemplo en Landing |
|-------|-------|-----|-------------------|
| `text-xs` | 12px | Labels pequeños | Categoría de producto |
| `text-sm` | 14px | Cuerpo secundario | Descripciones, metadata |
| `text-base` | 16px | Texto base | No usado directamente |
| `text-lg` | 18px | Cuerpo destacado | Descripciones de cards |
| `text-xl` | 20px | Títulos de cards | Nombre de producto |
| `text-2xl` | 24px | Títulos pequeños | No usado directamente |
| `text-3xl` | 30px | Títulos de sección | "Sobre Nosotros" |
| `text-4xl` | 36px | Títulos hero | Subtítulo del banner |
| `text-6xl` | 48px | Hero principal | Título del banner |

### 3.3 Pesos Tipográficos

| Token | Uso |
|-------|-----|
| `font-light` | Logo secondary (Collection) |
| `font-medium` | Labels, navegación |
| `font-normal` | Cuerpo de texto |
| `font-semibold` | Énfasis, precios |
| `font-bold` | Títulos de cards, botones |
| `font-extrabold` | Hero, CTAs principales |

### 3.4 Estilos de Texto Comunes

| Estilo | Clases | Uso |
|--------|--------|-----|
| **Logo Principal** | `text-2xl md:text-3xl font-bold tracking-tight text-slate-900` | Header logo |
| **Logo Secondary** | `font-light text-slate-500` | "Collection" en logo |
| **Section Heading** | `text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight` | Títulos de sección |
| **Section Divider** | `h-1.5 w-24 bg-slate-900 mx-auto rounded-full` | Línea decorativa bajo títulos |
| **Card Title** | `text-xl font-medium text-slate-900` | Nombres de productos |
| **Card Body** | `text-slate-600 leading-relaxed text-lg` | Descripciones |
| **Label** | `text-xs text-slate-500 uppercase tracking-wide` | Categorías |

---

## 4. Sistema de Espaciado

### 4.1 Padding de Secciones

| Sección | Padding | Clases |
|---------|---------|--------|
| **Hero Banner** | - | `h-[60vh] min-h-[500px]` |
| **Sección General** | 96px vertical | `py-24 px-4` |
| **Footer Principal** | 64px vertical | `py-16 px-4` |
| **Footer Bottom** | 24px vertical | `py-6 px-4` |
| **Cards Internas** | 40px | `p-10` |
| **Cards Pequeñas** | 32px | `p-8` |
| **Cards Producto** | 16px | `p-4` |

### 4.2 Gaps y Gutter

| Contexto | Gap | Clases |
|----------|-----|--------|
| **Grid Productos Desktop** | 24px | `gap-6` |
| **Grid Productos Mobile** | 8px | `gap-2` |
| **Grid Reseñas** | 32px | `gap-8` |
| **Grid Features** | 40px | `gap-10` |
| **Elementos Relacionados** | 12px | `gap-3` |
| **Filtros Horizontal** | 8px | `gap-2` |

### 4.3 Margin Entre Secciones

| Contexto | Margin | Clases |
|----------|--------|--------|
| **Título a Contenido** | 64px | `mb-16` |
| **Cards entre sí** | 32px | `gap-8` |

---

## 5. Sistema de Border Radius

| Token | Valor | Uso | Ejemplo |
|-------|-------|-----|---------|
| `rounded-md` | 6px | Navegación, botones de menú | Links del nav |
| `rounded-lg` | 8px | **Predeterminado** | ProductCard, inputs, búsqueda |
| `rounded-xl` | 12px | Cards de contacto (footer) | WhatsApp, email cards |
| `rounded-2xl` | 16px | Cards de producto | Cards de contacto |
| `rounded-[2rem]` | 32px | Feature cards, testimonios | Cards "Sobre Nosotros" |
| `rounded-full` | 9999px | Pills, badges circulares | Filtros de categoría |
| `rounded-[2.5rem]` | 40px | Badges de estado | Badge "Colección Actual" |

---

## 6. Sistema de Sombras

| Token | Uso | Ejemplo |
|-------|-----|---------|
| `shadow-sm` | Headers, elementos sutiles | Header sticky |
| `shadow-lg` | Botones de carrusel | CarouselPrev/Next |
| `shadow-xl` | Cards en hover | Cards feature hover |
| `shadow-2xl` | Modals, elementos flotantes | Modal de producto |
| `shadow-black/30` | Banners con imagen | shadow en cards del footer |
| `shadow-slate-900/20` | Shadows oscuras | Icon boxes feature |

### Aplicaciones Específicas

| Elemento | Shadow |
|----------|--------|
| **Header** | `shadow-sm` |
| **Feature Cards Hover** | `hover:shadow-xl` |
| **Testimonio Cards Hover** | `hover:shadow-xl` |
| **Modal Detalle** | `shadow-xl` (overlay) |
| **Footer Cards** | `shadow-lg` |
| **Banner CTA** | `shadow-2xl` (botón) |
| **Floating WhatsApp** | `shadow-2xl` |

---

## 7. Componentes del Landing

### 7.1 Header/Navigation

```
sticky top-0 z-50
w-full
border-b border-slate-200
bg-white/95 backdrop-blur-md
shadow-sm
px-4 md:px-12
py-4
```

**Elementos:**
- Logo: `text-2xl md:text-3xl font-bold tracking-tight text-slate-900`
- Búsqueda Desktop: `rounded-full border border-slate-300 bg-white shadow-sm`
- Búsqueda Mobile: `rounded-lg border border-slate-300 bg-white`
- Nav Links: `px-4 py-2.5 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-md font-medium transition-colors`
- Botones Disabled: `opacity-50 cursor-not-allowed text-slate-400`

### 7.2 ProductCard (Catálogo)

```
group relative
bg-white
border border-slate-200
hover:border-slate-400
hover:shadow-lg
transition-all duration-300
cursor-pointer
h-full flex flex-col
rounded-lg
overflow-hidden
```

**Elementos internos:**
- Imagen Container: `relative w-full aspect-square bg-slate-100 flex items-center justify-center overflow-hidden`
- Imagen: `object-contain p-6 transition-transform duration-300 group-hover:scale-105`
- Contenido: `p-4 flex flex-col items-center text-center justify-center`
- Nombre: `text-sm font-medium text-slate-900`
- Categoría: `text-xs text-slate-500 mt-1`
- CTA: `text-xs text-slate-400 mt-3 hover:text-slate-600 transition-colors`

### 7.3 Filtro de Categorías (Pills)

```
px-4 py-1.5 text-xs font-medium rounded-full border transition-all duration-200 flex-shrink-0

// Estado activo:
bg-slate-900 text-white border-slate-900

// Estado inactivo:
bg-white text-slate-600 border-slate-300 hover:border-slate-400
```

### 7.4 Filtro de Colores

```
w-7 h-7 rounded-full border-2 flex-shrink-0 transition-all duration-200

// Estado activo:
border-blue-400 shadow-sm

// Estado inactivo:
border-slate-300 hover:border-slate-400
```

### 7.5 Feature Card (Sobre Nosotros)

```
p-10
rounded-[2rem]
bg-slate-50
border border-slate-100
transition-all hover:shadow-xl hover:-translate-y-1 duration-300
```

**Icon Box:**
```
w-20 h-20
bg-slate-900 text-white
flex items-center justify-center
rounded-2xl
mb-8
shadow-lg shadow-slate-900/20
transform -rotate-3
transition-transform hover:rotate-0
```

### 7.6 Testimonio Card

```
p-8
rounded-[2rem]
border border-slate-200
bg-white
shadow-sm
hover:shadow-xl
transition-shadow duration-300
```

**Elementos:**
- Rating: `flex gap-1.5 mb-6` + `text-amber-400 text-xl` para estrellas
- Comentario: `text-slate-700 mb-8 italic leading-relaxed text-lg`
- Divisor: `border-t border-slate-100 pt-6`
- Nombre: `font-bold text-slate-900 text-lg`
- Cargo: `text-sm font-medium text-slate-500 mt-1`
- Empresa: `text-xs text-slate-400 mt-1`

### 7.7 Modal de Producto

**Overlay:**
```
fixed inset-0
bg-slate-900/60
backdrop-blur-sm
flex items-center justify-center
z-50 p-4
```

**Container:**
```
bg-white
rounded-lg
max-w-lg w-full
overflow-hidden
shadow-xl
border border-slate-200
```

**Header Imagen:**
```
relative h-64
bg-slate-100
overflow-hidden
```

**Zoom Controls:**
```
absolute bottom-3 left-1/2 -translate-x-1/2
flex items-center gap-1
bg-white/95 rounded-full px-2 py-1
shadow-sm border border-slate-200
```

**Close Button:**
```
absolute top-3 right-3
bg-white/80 hover:bg-white
p-1.5 rounded-full
shadow-sm border border-slate-200
transition-colors
```

**Contenido:**
```
p-5
```

**Categoría Label:**
```
text-xs text-slate-500 uppercase tracking-wide mb-1
```

**Nombre:**
```
text-xl font-medium text-slate-900 mb-4
```

**Descripción:**
```
text-sm text-slate-600 leading-relaxed
```

**Botón Cotizar:**
```
w-full py-2.5
bg-slate-900 hover:bg-slate-800
text-white text-sm font-medium rounded
transition-colors
```

### 7.8 Footer Cards (Contacto)

```
bg-slate-800/80
hover:bg-slate-700/80
border border-slate-700/60
hover:border-slate-600
rounded-2xl
p-5
transition-all hover:scale-[1.01]
shadow-lg
```

**WhatsApp:**
```
w-14 h-14 bg-green-600/20 rounded-full
flex items-center justify-center
```

**Email:**
```
w-12 h-12 bg-slate-700/80 rounded-xl
flex items-center justify-center
```

**Horario:**
```
w-10 h-10 bg-slate-700/80 rounded-lg
flex items-center justify-center
```

### 7.9 Floating WhatsApp Button

```
fixed bottom-8 right-8
z-50
flex h-16 w-16
items-center justify-center
rounded-full
bg-[#25D366]
text-white
shadow-2xl
transition-all
hover:scale-110
hover:shadow-[#25D366]/40
```

**Tooltip:**
```
absolute right-20
bg-white text-slate-900 text-sm font-bold
py-2 px-4 rounded-xl shadow-lg
opacity-0 group-hover:opacity-100
transition-opacity duration-300
pointer-events-none whitespace-nowrap
```

---

## 8. Animaciones y Transiciones

### 8.1 Tiempos de Duración

| Duración | Token | Uso |
|----------|-------|-----|
| Rápida | `duration-200` | Hover de colores, borders |
| Estándar | `duration-300` | Cards hover, transforms |
| Suave | `duration-500` | Auto-scroll carrusel |

### 8.2 Easing

| Tipo | Valor | Uso |
|------|-------|-----|
| **Default** | - | Transiciones normales |
| **Cubic Bezier** | `cubic-bezier(0.25,0.1,0.25,1)` | Carrusel |

### 8.3 Efectos de Hover

| Elemento | Hover Effect |
|----------|-------------|
| **Cards** | `hover:shadow-xl hover:-translate-y-1` |
| **Imágenes** | `group-hover:scale-105` |
| **Feature Icons** | `hover:rotate-0` (desde rotate-3) |
| **Links Nav** | `hover:bg-slate-100 hover:text-slate-900` |
| **Botón Principal** | `hover:scale-105` (hero CTA) |

### 8.4 Efectos de Scroll

| Elemento | Efecto |
|----------|--------|
| **Header** | `backdrop-blur-md` con opacity |
| **Filtros Mobile** | scroll horizontal con `overflow-x-auto` |

---

## 9. Layouts y Breakpoints

### 9.1 Contenedores

| Tipo | Clases |
|------|--------|
| **Página** | `max-w-7xl mx-auto` |
| **Secciones** | `max-w-6xl mx-auto` |
| **Contenido Centrado** | `max-w-4xl mx-auto` |

### 9.2 Grid Systems

| Dispositivo | Columnas | Gap | Clases |
|-------------|----------|-----|--------|
| **Mobile** | 2 | `gap-2` | `grid-cols-2 gap-2 px-2` |
| **Tablet** | 3 | `gap-6` | `md:grid-cols-3 md:gap-6` |
| **Desktop** | 4 | `gap-6` | `lg:grid-cols-4` |

### 9.3 Header Responsive

```
Mobile: flex-col + menú hamburguesa
Desktop: flex-row + búsqueda + nav en línea
```

### 9.4 Sidebar del Mapa (Footer)

```
lg:grid-cols-5
- Mapa: lg:col-span-3
- Contacto: lg:col-span-2
```

---

## 10. Iconografía

### 10.1 Librería
**Lucide React** - Iconos consistente en todo el proyecto

### 10.2 Tamaños de Iconos

| Tamaño | Token | Uso |
|--------|-------|-----|
| **Small** | `h-4 w-4` (16px) | Iconos inline, badges |
| **Medium** | `h-5 w-5` (20px) | Inputs, menús |
| **Large** | `h-7 w-7` (28px) | Botón hamburguesa |
| **XL** | `h-10 w-10` (40px) | Feature icons |
| **2XL** | `h-12 w-12` (48px) | Botones carrusel |
| **Avatar** | `h-16 w-16` (64px) | Floating WhatsApp |

---

## 11. Z-Index Scale

| Valor | Uso |
|-------|-----|
| `z-10` | Header sticky |
| `z-40` | Sidebar |
| `z-50` | Header principal, modals |
| `z-50` | Floating WhatsApp |

---

## 12. Resumen de Tokens Clave

### Colores Más Usados
```
slate-900  → Primary oscuro (headers, botones)
slate-50   → Background principal
slate-200  → Bordes default
slate-300  → Bordes hover
white      → Cards, superficies
```

### Border Radius Más Usados
```
rounded-lg      → Predeterminado (8px)
rounded-full    → Pills (filtros)
rounded-[2rem]  → Cards grandes (32px)
```

### Shadows Más Usados
```
shadow-sm       → Default sutil
shadow-lg       → Botones carrusel
shadow-xl       → Cards hover
shadow-2xl      → Modals, floating
```

### Spacing Más Usado
```
p-4            → Cards internas
gap-6          → Grid desktop
py-24 px-4    → Secciones landing
```

---

## 13. Checklist de Implementación

Para mantener consistencia con el landing:

- [ ] Usar `bg-slate-900` para elementos primarios
- [ ] Usar `bg-slate-50` para fondos de página
- [ ] Usar `rounded-lg` como border-radius predeterminado
- [ ] Usar `shadow-sm` como shadow base para cards
- [ ] Usar `shadow-xl` en hover para cards
- [ ] Usar `py-24` para secciones de página
- [ ] Usar `text-slate-XXX` para jerarquía de texto
- [ ] Usar `duration-300` para transiciones de hover
- [ ] Usar `backdrop-blur-md` para headers sticky
- [ ] Usar Lucide React para iconos