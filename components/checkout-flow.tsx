"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ShoppingCart, Trash2, ArrowLeft, ArrowRight, Check, Copy, AlertCircle as AlertCircleIcon, AlertCircle, AlertTriangle, Package, MapPin, User, CreditCard, Phone, Truck, Store, Plus, Minus, X, Clock, FileText, HelpCircle, Search, Loader2, Upload, File, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PackageCheck, RulerDimensionLine } from "lucide-react"
import { UBIGEO_DATA as UBIGEO, type UbigeoType } from "@/lib/ubigeo"


interface CarritoItem {
    id: string
    cantidad: number
    tipo: string
    producto: {
        id: string
        nombre: string
        categoria: string
        precio: number
        imagen?: string | null
    }
    cantidadMetros: number
    tipoLabel: string
    metrosPorPieza: number
    precioUnitario: number
    precioTotal: number
    indicacionesCorte?: string | null
}

interface CheckoutData {
    tipoDocumento: string
    numeroDoc: string
    nombreFactura: string
    direccion: string
    departamento: string
    provincia: string
    distrito: string
    metodoEnvio: string
    tiendaId: string
    tipoEnvio: string
    agencia: string
    agenciaOtro: string
    delivery: string
    deliveryOtro: string
    dniRecibe: string
    nombreRecibe: string
    celularRecibe: string
    numeroOperacion: string
}

const PASOS = [
    { num: 1, titulo: "Carrito", desc: "Revisa tus productos" },
    { num: 2, titulo: "Facturación", desc: "Datos de pago" },
    { num: 3, titulo: "Envío", desc: "Método de entrega" },
    { num: 4, titulo: "Pago", desc: "Resumen y operación" }
]

export default function CheckoutPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [items, setItems] = useState<CarritoItem[]>([])
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [indicaciones, setIndicaciones] = useState<Record<string, string>>({})
    const [popupItem, setPopupItem] = useState<CarritoItem | null>(null)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [indicacionToDelete, setIndicacionToDelete] = useState<string | null>(null)
    const [successModal, setSuccessModal] = useState<{ show: boolean; message: string; orderNumber?: string }>({ show: false, message: "" })
    const [tiendas, setTiendas] = useState<{ id: string, nombre: string, direccion: string }[]>([])
    const [buscandoDocumento, setBuscandoDocumento] = useState(false)
    const [alertDocumento, setAlertDocumento] = useState<{ show: boolean; message: string }>({ show: false, message: "" })
    const [comprobanteFile, setComprobanteFile] = useState<File | null>(null)
    const [comprobanteUrl, setComprobanteUrl] = useState<string>("")
    const [subiendoComprobante, setSubiendoComprobante] = useState(false)
    const [data, setData] = useState<CheckoutData>({
        tipoDocumento: "",
        numeroDoc: "",
        nombreFactura: "",
        direccion: "",
        departamento: "",
        provincia: "",
        distrito: "",
        metodoEnvio: "",
        tiendaId: "",
        tipoEnvio: "",
        agencia: "",
        agenciaOtro: "",
        delivery: "",
        deliveryOtro: "",
        dniRecibe: "",
        nombreRecibe: "",
        celularRecibe: "",
        numeroOperacion: ""
    })
    const [editandoItem, setEditandoItem] = useState<string | null>(null)
    const [editCantidad, setEditCantidad] = useState(1)
    const [editTipo, setEditTipo] = useState("metros")
    const [pedidoCreado, setPedidoCreado] = useState<any>(null)
    const [showMetrajePopup, setShowMetrajePopup] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showAyudaOperacion, setShowAyudaOperacion] = useState(false)
    const [pedidoId, setPedidoId] = useState<string | null>(null)
    const [continuarPedido, setContinuarPedido] = useState<any>(null)
    const [facturacionTemplates, setFacturacionTemplates] = useState<any[]>([])
    const [direccionTemplates, setDireccionTemplates] = useState<any[]>([])
    const [showFacturacionTemplates, setShowFacturacionTemplates] = useState(false)
    const [showDireccionTemplates, setShowDireccionTemplates] = useState(false)
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

    const metrosPorPieza = 50

    // Mostrar toast
    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    // Cargar plantillas al inicio
    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const [factRes, dirRes] = await Promise.all([
                    fetch("/api/datos-facturacion", { credentials: "include" }),
                    fetch("/api/datos-direccion", { credentials: "include" })
                ])
                const factJson = await factRes.json()
                const dirJson = await dirRes.json()
                if (factJson.success) setFacturacionTemplates(factJson.templates || [])
                if (dirJson.success) setDireccionTemplates(dirJson.templates || [])
            } catch (e) {
                console.error("Error loading templates:", e)
            }
        }
        loadTemplates()
    }, [])

    // Actualizar pedido cuando el cliente llegue al paso 4
    useEffect(() => {
        if (step === 4 && continuarPedido?.id) {
            fetch(`/api/pedidos/${continuarPedido.id}`, { credentials: "include" })
                .then(res => res.json())
                .then(json => {
                    if (json.success && json.pedido) {
                        setContinuarPedido(json.pedido)
                    }
                })
                .catch(console.error)
        }
    }, [step, continuarPedido?.id])

    useEffect(() => {
        const hash = window.location.hash.slice(1)
        if (hash) {
            setPedidoId(hash)
            fetchPedido(hash)
            window.history.replaceState({}, '', window.location.pathname)
        } else {
            setStep(1)
            fetchCarrito()
            fetchTiendas()
        }
    }, [])

    const fetchPedido = async (id: string) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/pedidos/${id}`, { credentials: "include" })
            const json = await res.json()
            console.log("FetchPedido response:", json)
            if (json.success && json.pedido) {
                const pedido = json.pedido
                setContinuarPedido(pedido)
                console.log("Pedido data:", JSON.stringify(pedido, null, 2))

                setData((prev) => ({
                    ...prev,
                    tipoDocumento: pedido.tipoDocumento || "",
                    numeroDoc: pedido.numeroDoc || "",
                    nombreFactura: pedido.nombreFactura || "",
                    direccion: pedido.direccion || "",
                    departamento: pedido.departamento || "",
                    provincia: pedido.provincia || "",
                    distrito: pedido.distrito || "",
                    metodoEnvio: pedido.metodoEnvio || "",
                    agencia: pedido.agencia || "",
                    agenciaOtro: pedido.agenciaOtro || "",
                    dniRecibe: pedido.dniRecibe || "",
                    nombreRecibe: pedido.nombreRecibe || "",
                    celularRecibe: pedido.celularRecibe || "",
                    numeroOperacion: pedido.numeroOperacion === "012345678" ? "" : (pedido.numeroOperacion || "")
                }))
                
                // Cargar comprobante de pago si existe
                if (pedido.comprobantePago) {
                    setComprobanteUrl(pedido.comprobantePago)
                }

                const itemsFromPedido = (pedido.pedidoDetalle || []).map((detalle: any) => ({
                    id: detalle.id,
                    cantidad: detalle.cantidad,
                    tipo: detalle.tipo,
                    producto: detalle.producto || {
                        id: detalle.productoId,
                        nombre: "Producto",
                        categoria: "",
                        precio: detalle.precio
                    },
                    cantidadMetros: detalle.tipo === "pieza" ? (detalle.metraje || 50) : detalle.cantidad,
                    tipoLabel: detalle.tipo,
                    metrosPorPieza: 50,
                    precioUnitario: Number(detalle.producto.precio),
                    precioTotal: Number(detalle.producto.precio) * (detalle.tipo === "pieza" ? (detalle.metraje || 50) : detalle.cantidad)
                }))
                console.log("Items from pedido:", itemsFromPedido)
                setItems(itemsFromPedido)
                setStep(4)
            }
        } catch (e) {
            console.error("Error fetching pedido:", e)
            setError("Error al cargar el pedido")
        } finally {
            setLoading(false)
        }
    }

    const fetchCarrito = async () => {
        try {
            const res = await fetch("/api/carrito", { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                const itemsConPrecio = (json.items || []).map((item: any) => {
                    const precioUnitario = Number(item.producto.precio)
                    const cantidadMetros = item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad
                    const precioTotal = item.tipo === "pieza"
                        ? precioUnitario * cantidadMetros
                        : precioUnitario * item.cantidad
                    const precioTotalXPieza = item.tipo === "pieza"
                        ? precioUnitario * item.cantidad
                        : 0
                    return {
                        ...item,
                        cantidadMetros,
                        precioUnitario,
                        precioTotal,
                        precioTotalXPieza
                    }
                })
                setItems(itemsConPrecio)

                // Initialize indicaciones from fetched items
                const initIndicaciones: Record<string, string> = {}
                    ; (json.items || []).forEach((item: any) => {
                        initIndicaciones[item.id] = item.indicacionesCorte || ""
                    })
                setIndicaciones(initIndicaciones)
            }
        } catch (e) {
            console.error("Error fetching cart:", e)
        }
    }

    const guardarIndicacion = async (itemId: string) => {
        setSavingId(itemId)
        try {
            await fetch("/api/carrito", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "actualizarIndicaciones",
                    carritoId: itemId,
                    indicacionesCorte: indicaciones[itemId] || null
                }),
                credentials: "include"
            })
        } catch (e) {
            console.error("Error:", e)
        } finally {
            setSavingId(null)
        }
    }

    const handleIndicacionChange = (itemId: string, value: string) => {
        const trimmed = value.slice(0, 200)
        setIndicaciones(prev => ({ ...prev, [itemId]: trimmed }))
    }

    const fetchTiendas = async () => {
        try {
            console.log("Fetching tiendas...")
            const res = await fetch("/api/tiendas", { credentials: "include" })
            const json = await res.json()
            console.log("Tiendas response:", json)
            if (json.success && json.tiendas) {
                const tiendasActivas = json.tiendas.filter((t: any) => t.activo)
                console.log("Tiendas activas:", tiendasActivas)
                setTiendas(tiendasActivas)
            }
        } catch (e) {
            console.error("Error fetching tiendas:", e)
        }
    }

    const calcularSubtotal = useCallback(() => {
        return items.reduce((sum, item) => sum + item.precioTotal, 0)
    }, [items])

    const calcularCostoEnvio = useCallback(() => {
        if (data.metodoEnvio === "tienda" || data.metodoEnvio === "retiro") return 0
        const subtotal = calcularSubtotal()
        if (subtotal >= 9000) return 50
        if (subtotal >= 7000) return 40
        if (subtotal >= 5000) return 35
        if (subtotal >= 3000) return 30
        if (subtotal >= 1500) return 20
        if (subtotal >= 500) return 15
        return 10
    }, [data.metodoEnvio, calcularSubtotal])

    const calcularTotal = useCallback(() => {
        return calcularSubtotal() + calcularCostoEnvio()
    }, [calcularSubtotal, calcularCostoEnvio])

    const actualizarCantidad = async (itemId: string, nuevaCantidad: number) => {
        if (nuevaCantidad < 1) return
        try {
            const res = await fetch("/api/carrito", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId, cantidad: nuevaCantidad }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                const itemsConPrecio = (json.items || []).map((item: any) => ({
                    ...item,
                    cantidadMetros: item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad,
                    precioUnitario: Number(item.producto.precio),
                    precioTotal: item.tipo === "pieza" ? Number(item.producto.precio) * (item.cantidad * metrosPorPieza) : Number(item.producto.precio) * item.cantidad
                }))
                setItems(itemsConPrecio)
            }
        } catch (e) {
            console.error("Error updating:", e)
        }
    }

    const eliminarItem = async (itemId: string) => {
        setDeletingId(itemId)
    }

    const confirmarEliminar = async () => {
        if (!deletingId) return
        try {
            const res = await fetch("/api/carrito", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "eliminar", carritoId: deletingId }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                const itemsConPrecio = (json.items || []).map((item: any) => ({
                    ...item,
                    cantidadMetros: item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad,
                    precioUnitario: Number(item.producto.precio),
                    precioTotal: item.tipo === "pieza" ? Number(item.producto.precio) * (item.cantidad * metrosPorPieza) : Number(item.producto.precio) * item.cantidad
                }))
                setItems(itemsConPrecio)
            }
        } catch (e) {
            console.error("Error deleting:", e)
        } finally {
            setDeletingId(null)
        }
    }

    const cancelarEliminar = () => {
        setDeletingId(null)
    }

    const guardarEdicion = async (itemId: string) => {
        try {
            const res = await fetch("/api/carrito", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "actualizar",
                    carritoId: itemId,
                    cantidad: editCantidad,
                    tipo: editTipo
                }),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                setEditandoItem(null)
                fetchCarrito()
            }
        } catch (e) {
            console.error("Error updating:", e)
        }
    }

    const iniciarEdicion = (item: CarritoItem) => {
        setEditandoItem(item.id)
        setEditCantidad(item.cantidad)
        setEditTipo(item.tipo)
    }

    const handleInputChange = (field: keyof CheckoutData, value: string) => {
        setData(prev => {
            const newData = { ...prev, [field]: value }
            if (field === "metodoEnvio" && value !== prev.metodoEnvio) {
                return {
                    ...newData,
                    metodoEnvio: value,
                    tiendaId: "",
                    tipoEnvio: "",
                    agencia: "",
                    agenciaOtro: "",
                    delivery: "",
                    deliveryOtro: "",
                    dniRecibe: "",
                    nombreRecibe: "",
                    celularRecibe: ""
                }
            }
            return newData
        })
    }

    const buscarDocumento = async () => {
        if (!data.tipoDocumento || !data.numeroDoc) return

        setBuscandoDocumento(true)
        setAlertDocumento({ show: false, message: "" })
        try {
            const res = await fetch("/api/buscar-documento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: data.tipoDocumento, numero: data.numeroDoc })
            })
            const result = await res.json()

            if (result.success) {
                const tieneDatos = data.tipoDocumento === "dni"
                    ? result.nombre && result.nombre.trim() !== ""
                    : result.razonSocial && result.razonSocial.trim() !== ""

                if (!tieneDatos) {
                    setAlertDocumento({ show: true, message: "Datos no encontrados del documento consultado" })
                } else {
                    if (data.tipoDocumento === "dni") {
                        handleInputChange("nombreFactura", result.nombre)
                    } else if (data.tipoDocumento === "ruc") {
                        handleInputChange("nombreFactura", result.razonSocial)
                        handleInputChange("direccion", result.direccion)
                        
                        // Helper to find matching key in UBIGEO
                        const findUbigeoMatch = (value: string, options: string[]) => {
                            if (!value) return ""
                            const normalized = value.trim().toUpperCase()
                            // Try exact match first
                            const exact = options.find(o => o.toUpperCase() === normalized)
                            if (exact) return exact
                            // Try partial match
                            const partial = options.find(o => o.toUpperCase().includes(normalized) || normalized.includes(o.toUpperCase()))
                            if (partial) return partial
                            return ""
                        }
                        
                        // Find matching department
                        const deptKeys = Object.keys(UBIGEO)
                        const matchedDept = findUbigeoMatch(result.departamento, deptKeys)
                        if (matchedDept) {
                            handleInputChange("departamento", matchedDept)
                            // Find matching province
                            const provKeys = Object.keys(UBIGEO[matchedDept] || {})
                            const matchedProv = findUbigeoMatch(result.provincia, provKeys)
                            if (matchedProv) {
                                handleInputChange("provincia", matchedProv)
                                // Find matching district
                                const distOptions = UBIGEO[matchedDept]?.[matchedProv] || []
                                const matchedDist = findUbigeoMatch(result.distrito, distOptions)
                                if (matchedDist) {
                                    handleInputChange("distrito", matchedDist)
                                }
                            }
                        }
                    }
                }
            } else {
                setAlertDocumento({ show: true, message: result.error || "Datos no encontrados del documento consultado" })
            }
        } catch (e) {
            console.error("Error buscando documento:", e)
            setAlertDocumento({ show: true, message: "Error al consultar documento" })
        }
        setBuscandoDocumento(false)
    }

    const handleComprobanteChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar tamaño (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert("El archivo no puede superar 5MB")
            return
        }

        setComprobanteFile(file)
        setSubiendoComprobante(true)

        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("tipo", "comprobante")

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                credentials: "include",
            })
            const data = await res.json()

            if (data.url) {
                setComprobanteUrl(data.url)
            } else if (data.error) {
                console.error("Error del servidor:", data.error)
                alert("Error al subir: " + data.error)
            }
        } catch (error) {
            console.error("Error uploading comprobante:", error)
            alert("Error al subir comprobante")
        }
        setSubiendoComprobante(false)
    }

    const tienePiezas = useMemo(() => {
        return items && items.length > 0 ? items.some((item: any) => item.tipo === "pieza") : false
    }, [items])

    const metrajeConfirmado = continuarPedido?.estado === "metraje_confirmado"
    const tienePiezasPendientes = (continuarPedido?.estado === "metraje_en_proceso") || (tienePiezas && !metrajeConfirmado)
    const mostrarResumenSolo = tienePiezasPendientes || (continuarPedido?.estado === "metraje_en_proceso")

    const validarPaso = useCallback((paso: number): boolean => {
        switch (paso) {
            case 1:
                return items.length > 0
            case 2:
                const docLen = data.numeroDoc?.length || 0
                const requiredLen = data.tipoDocumento === "ruc" ? 11 : data.tipoDocumento === "dni" ? 8 : 1
                return !!(data.tipoDocumento && docLen >= requiredLen && data.nombreFactura && data.direccion)
            case 3:
                if (!data.metodoEnvio) return false
                if (data.metodoEnvio === "tienda" && !data.tiendaId) return false
                if (data.metodoEnvio === "agencia" && !data.agencia) return false
                if (data.metodoEnvio === "agencia" && data.agencia === "otros" && !data.agenciaOtro) return false
                if (data.metodoEnvio === "delivery" && !data.delivery) return false
                if (data.metodoEnvio === "delivery" && data.delivery === "otros" && !data.deliveryOtro) return false
                if ((data.metodoEnvio === "agencia" || data.metodoEnvio === "delivery") && data.tipoEnvio === "otropersona") {
                    return !!(data.dniRecibe && data.nombreRecibe && data.celularRecibe)
                }
                return true
            case 4:
                if (continuarPedido && !metrajeConfirmado) return true
                if (continuarPedido && metrajeConfirmado) return !!(data.numeroOperacion && data.numeroOperacion.length > 0)
                if (tienePiezas) return true
                return !!(data.numeroOperacion && data.numeroOperacion.length > 0)
            default:
                return true
        }
    }, [items, data])

    const crearPedido = async () => {
        setLoading(true)
        setError("")

        try {
            const itemsParaApi = items.map(item => ({
                productoId: item.producto.id,
                cantidad: item.cantidad,
                tipo: item.tipo,
                precio: item.producto.precio
            }))

            const res = await fetch("/api/pedidos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipoDocumento: data.tipoDocumento,
                    numeroDoc: data.numeroDoc,
                    nombreFactura: data.nombreFactura,
                    direccion: data.direccion,
                    departamento: data.departamento,
                    provincia: data.provincia,
                    distrito: data.distrito,
                    metodoEnvio: data.metodoEnvio,
                    tiendaId: data.metodoEnvio === "tienda" ? data.tiendaId : null,
                    tipoEnvio: data.metodoEnvio !== "tienda" ? data.tipoEnvio : null,
                    agencia: data.metodoEnvio === "agencia" ? (data.agencia === "otros" ? data.agenciaOtro : data.agencia) : null,
                    delivery: data.metodoEnvio === "delivery" ? (data.delivery === "otros" ? data.deliveryOtro : data.delivery) : null,
                    deliveryOtro: data.metodoEnvio === "delivery" && data.delivery === "otros" ? data.deliveryOtro : null,
                    dniRecibe: data.dniRecibe || null,
                    nombreRecibe: data.nombreRecibe || null,
                    celularRecibe: data.celularRecibe || null,
                    numeroOperacion: data.numeroOperacion,
                    items: itemsParaApi
                }),
                credentials: "include"
            })

            const text = await res.text()
            if (!text) {
                setError("El servidor no respondió correctamente")
                setLoading(false)
                return
            }

            let json
            try {
                json = JSON.parse(text)
            } catch (parseError) {
                setError("Error al procesar la respuesta del servidor")
                setLoading(false)
                return
            }

            if (json.success) {
                setPedidoCreado(json.pedido)
                setStep(5)
            } else {
                setError(json.error || "Error al crear pedido")
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const copiarTexto = (texto: string, key: string) => {
        navigator.clipboard.writeText(texto)
        setCopiado({ ...copiado, [key]: true })
        setTimeout(() => setCopiado({ ...copiado, [key]: false }), 2000)
    }

    const [copiado, setCopiado] = useState({
        bcp: false,
        cci: false,
        celular: false
    })


    const crearPedidoConMetrajeTemporal = async () => {
        setLoading(true)
        setError("")

        try {
            const itemsParaApi = items.map(item => ({
                productoId: item.producto.id,
                cantidad: item.cantidad,
                tipo: item.tipo,
                precio: item.producto.precio,
                indicacionesCorte: item.indicacionesCorte || null
            }))

            const res = await fetch("/api/pedidos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tipoDocumento: data.tipoDocumento,
                    numeroDoc: data.numeroDoc,
                    nombreFactura: data.nombreFactura,
                    direccion: data.direccion,
                    departamento: data.departamento,
                    provincia: data.provincia,
                    distrito: data.distrito,
                    metodoEnvio: data.metodoEnvio,
                    tiendaId: data.metodoEnvio === "tienda" ? data.tiendaId : null,
                    tipoEnvio: data.metodoEnvio !== "tienda" ? data.tipoEnvio : null,
                    agencia: data.metodoEnvio === "agencia" ? (data.agencia === "otros" ? data.agenciaOtro : data.agencia) : null,
                    delivery: data.metodoEnvio === "delivery" ? (data.delivery === "otros" ? data.deliveryOtro : data.delivery) : null,
                    dniRecibe: data.dniRecibe || null,
                    nombreRecibe: data.nombreRecibe || null,
                    celularRecibe: data.celularRecibe || null,
                    numeroOperacion: "012345678",
                    items: itemsParaApi
                }),
                credentials: "include"
            })

            const json = await res.json()

            if (json.success) {
                setSuccessModal({
                    show: true,
                    message: json.mensaje || "Orden de compra creada correctamente. Piezas en proceso de metraje.",
                    orderNumber: json.pedido?.numeroOrden
                })
            } else {
                setError(json.error || "Error al crear pedido")
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    if (pedidoCreado) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-black mb-2">
                    ¡Felicidades!
                </h2>
                <p className="text-slate-600 mb-4">
                    Tu orden de compra <strong>{pedidoCreado.numeroOrden}</strong> está siendo gestionada a la brevedad.
                </p>
                <Button onClick={() => router.push("/dashboard/pedidos")}>
                    Ver Mis Pedidos
                </Button>
            </div>
        )
    }

    const finalizarPedidoExistente = async () => {
        if (!continuarPedido) return

        if (continuarPedido.estado === "metraje_confirmado" && !data.numeroOperacion) {
            setShowPaymentModal(true)
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch(`/api/pedidos/${continuarPedido.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    estado: "pendiente",
                    numeroOperacion: data.numeroOperacion
                }),
                credentials: "include"
            })

            const json = await res.json()

            if (json.success) {
                setPedidoCreado(continuarPedido)
                setStep(5)
            } else {
                setError(json.error || "Error al finalizar pedido")
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    const confirmarPago = async () => {
        if (!data.numeroOperacion && !comprobanteUrl) {
            setError("Por favor ingresa tu número de operación o sube un comprobante de pago")
            return
        }

        setShowPaymentModal(false)
        setLoading(true)
        setError("")

        try {
            if (continuarPedido?.id) {
                // Update existing pedido
                const res = await fetch(`/api/pedidos/${continuarPedido.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        estado: "pendiente",
                        numeroOperacion: data.numeroOperacion,
                        comprobantePago: comprobanteUrl || null
                    }),
                    credentials: "include"
                })

                const json = await res.json()

                if (json.success) {
                    setPedidoCreado(continuarPedido)
                    setStep(5)
                } else {
                    setError(json.error || "Error al confirmar pago")
                }
            } else {
                // Create new pedido for new checkout
                const itemsParaApi = items.map(item => ({
                    productoId: item.producto.id,
                    cantidad: item.cantidad,
                    tipo: item.tipo,
                    precio: item.producto.precio,
                    indicacionesCorte: item.indicacionesCorte || null
                }))

                const res = await fetch("/api/pedidos", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tipoDocumento: data.tipoDocumento,
                        numeroDoc: data.numeroDoc,
                        nombreFactura: data.nombreFactura,
                        direccion: data.direccion,
                        departamento: data.departamento,
                        provincia: data.provincia,
                        distrito: data.distrito,
                        metodoEnvio: data.metodoEnvio,
                        tiendaId: data.metodoEnvio === "tienda" ? data.tiendaId : null,
                        tipoEnvio: data.metodoEnvio !== "tienda" ? data.tipoEnvio : null,
                        agencia: data.metodoEnvio === "agencia" ? (data.agencia === "otros" ? data.agenciaOtro : data.agencia) : null,
                        delivery: data.metodoEnvio === "delivery" ? (data.delivery === "otros" ? data.deliveryOtro : data.delivery) : null,
                        deliveryOtro: data.metodoEnvio === "delivery" && data.delivery === "otros" ? data.deliveryOtro : null,
                        dniRecibe: data.dniRecibe || null,
                        nombreRecibe: data.nombreRecibe || null,
                        celularRecibe: data.celularRecibe || null,
                        numeroOperacion: data.numeroOperacion,
                        comprobantePago: comprobanteUrl || null,
                        estado: "pendiente",
                        items: itemsParaApi
                    }),
                    credentials: "include"
                })

                const json = await res.json()

                if (json.success) {
                    setPedidoCreado(json.pedido)
                    setStep(5)
                } else {
                    setError(json.error || "Error al crear pedido")
                }
            }
        } catch (e: any) {
            setError(e.message || "Error de conexión")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="max-w-4xl mx-auto">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-5 w-5" />
                        {error}
                    </div>
                )}

                {step < 5 && (
                    <div className="mb-8">
                        {continuarPedido && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <Check className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-green-800">¡Metraje Confirmado!</p>
                                    <p className="text-sm text-green-700">
                                        Orden {continuarPedido.numeroOrden} - Ahora puedes completar el pago
                                    </p>
                                </div>
                            </div>
                        )}

                        {continuarPedido ? (
                            <div className="bg-slate-100 rounded-xl p-4 text-center">
                                <p className="font-bold text-slate-700 text-lg">Paso 4: Resumen y Pago</p>
                                <p className="text-sm text-slate-500">Revisa el resumen y completa el pago</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between mb-2">
                                {PASOS.map((p, idx) => (
                                    <div key={p.num} className="flex items-center flex-1">
                                        <div className={`flex flex-col items-center ${idx > 0 ? 'flex-1' : ''}`}>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${step === p.num
                                                ? "bg-slate-900 text-white ring-4 ring-yellow-400"
                                                : step > p.num
                                                    ? "bg-green-600 text-white"
                                                    : "bg-slate-200 text-slate-500"
                                                }`}>
                                                {step > p.num ? <Check className="h-6 w-6" /> : p.num}
                                            </div>
                                            <span className="text-xs mt-1 font-medium text-black">
                                                {p.titulo}
                                            </span>
                                        </div>
                                        {idx < PASOS.length - 1 && (
                                            <div className={`h-1 flex-1 mx-2 rounded ${step > p.num ? 'bg-green-600' : 'bg-slate-200'}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    {step === 1 && (
                        <div>
                            <h2 className="text-xl font-bold text-black mb-4">Tu Carrito</h2>
                            {items.length === 0 ? (
                                <div className="text-center py-12">
                                    <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500 mb-4">Tu carrito está vacío</p>
                                    <Button onClick={() => router.push("/dashboard")}>
                                        Ver Productos
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map(item => {
                                        const precioUnitario = Number(item.producto.precio)
                                        const cantidadMetros = item.tipo === "pieza" ? item.cantidad * metrosPorPieza : item.cantidad

                                        const precioTotal = item.tipo === "pieza"
                                            ? precioUnitario * cantidadMetros
                                            : precioUnitario * item.cantidad
                                        const precioTotalXPieza = item.tipo === "pieza"
                                            ? precioUnitario * item.cantidad
                                            : 0

                                        return (
                                            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4">
                                                <div className="flex gap-4">
                                                    {item.producto.imagen ? (
                                                        <img
                                                            src={item.producto.imagen}
                                                            alt={item.producto.nombre}
                                                            className="w-24 h-24 object-cover rounded-lg shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                                            <ShoppingCart className="h-8 w-8 text-slate-400" />
                                                        </div>
                                                    )}

                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-black text-lg">{item.producto.nombre}</h3>
                                                        <p className="text-sm text-slate-600 font-medium">{item.producto.categoria}</p>
                                                        <p className="text-sm text-blue-700 font-medium">{item.tipoLabel}</p>
                                                        <p className="text-sm text-slate-600 font-medium">Precio del artículo por metro: S/ {precioUnitario.toFixed(2)}</p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-bold text-black text-lg">S/ {precioTotal.toFixed(2)}</p>
                                                        {item.tipo === "pieza" && (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                                                                <Clock className="h-3 w-3" />
                                                                Metraje en revisión
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => actualizarCantidad(item.id, item.tipo === "pieza" ? item.cantidad - 1 : item.cantidad - 0.01)}
                                                            disabled={item.tipo === "pieza" ? item.cantidad <= 1 : item.cantidad <= 0.01}
                                                            className="p-2 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-50"
                                                        >
                                                            <Minus className="h-4 w-4 text-slate-700" />
                                                        </button>
                                                        <input
                                                            type="number"
                                                            step={item.tipo === "pieza" ? "1" : "0.01"}
                                                            min={item.tipo === "pieza" ? "1" : "0.01"}
                                                            value={item.cantidad}
                                                            onChange={(e) => {
                                                                const raw = parseFloat(e.target.value)
                                                                const value = item.tipo === "pieza" ? Math.floor(raw) || 1 : (raw || 0.01)
                                                                const minVal = item.tipo === "pieza" ? 1 : 0.01
                                                                if (value >= minVal) actualizarCantidad(item.id, value)
                                                            }}
                                                            className="w-20 text-center border-2 border-black rounded px-2 py-1 font-bold text-black"
                                                        />
                                                        <button
                                                            onClick={() => actualizarCantidad(item.id, item.tipo === "pieza" ? item.cantidad + 1 : item.cantidad + 0.01)}
                                                            className="p-2 bg-slate-100 rounded hover:bg-slate-200"
                                                        >
                                                            <Plus className="h-4 w-4 text-slate-700" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => eliminarItem(item.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2 mt-2">
                                                    {indicaciones[item.id] ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => setPopupItem(item)}
                                                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded border border-blue-200"
                                                            >
                                                                <FileText className="h-4 w-4" />
                                                                Ver indicación
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    e.stopPropagation()
                                                                    console.log("Click eliminar para item:", item.id)
                                                                    setIndicacionToDelete(item.id)
                                                                }}
                                                                className="text-xs text-red-500 hover:text-red-700"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setPopupItem(item)}
                                                            className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded border border-dashed border-blue-300"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                            Añadir indicaciones de corte
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}

                                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600 font-medium">Subtotal:</span>
                                            <div className="text-right">
                                                <span className="font-medium text-black text-lg">S/ {calcularSubtotal().toFixed(2)}</span>

                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-6">
                                        <Link href="/dashboard" className="flex-1">
                                            <Button variant="outline" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
                                                <ArrowLeft className="h-4 w-4 mr-2" />
                                                Seguir Comprando
                                            </Button>
                                        </Link>

                                        <Button onClick={() => setStep(2)} className="flex-1 bg-green-600 hover:bg-green-700 text-lg">
                                            Continuar
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-black">Datos de Facturación</h2>
                                <div className="flex gap-2">
                                    {facturacionTemplates.length > 0 && (
                                        <select
                                            onChange={(e) => {
                                                const t = facturacionTemplates.find(x => x.id === e.target.value)
                                                if (t) {
                                                    setData({
                                                        ...data,
                                                        tipoDocumento: t.tipoDocumento,
                                                        numeroDoc: t.numeroDoc,
                                                        nombreFactura: t.nombreFactura,
                                                        direccion: t.direccion || "",
                                                        departamento: t.departamento || "",
                                                        provincia: t.provincia || "",
                                                        distrito: t.distrito || ""
                                                    })
                                                    showToast("Datos cargados", "success")
                                                }
                                                e.target.value = ""
                                            }}
                                            className="text-sm border border-slate-300 rounded px-2 py-1 text-black"
                                        >
                                            <option value="">📂 Cargar plantilla</option>
                                            {facturacionTemplates.map(t => (
                                                <option key={t.id} value={t.id}>{t.nombre}</option>
                                            ))}
                                        </select>
                                    )}
                                    <Button
                                        onClick={async () => {
                                            if (!data.tipoDocumento || !data.numeroDoc || !data.nombreFactura) {
                                                showToast("Complete los datos de facturación primero", "error")
                                                return
                                            }
                                            try {
                                                const res = await fetch("/api/datos-facturacion", {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        tipoDocumento: data.tipoDocumento,
                                                        numeroDoc: data.numeroDoc,
                                                        nombreFactura: data.nombreFactura,
                                                        razonSocial: data.tipoDocumento === "ruc" ? data.nombreFactura : null,
                                                        direccion: data.direccion,
                                                        departamento: data.departamento,
                                                        provincia: data.provincia,
                                                        distrito: data.distrito,
                                                        celular: null
                                                    }),
                                                    credentials: "include"
                                                })
                                                const json = await res.json()
                                                if (json.success) {
                                                    setFacturacionTemplates([json.template, ...facturacionTemplates])
                                                    showToast("Plantilla guardada", "success")
                                                } else {
                                                    showToast(json.error || "Error al guardar", "error")
                                                }
                                            } catch (e) {
                                                showToast("Error de conexión", "error")
                                            }
                                        }}
                                        variant="outline"
                                        className="text-black border-black hover:bg-slate-100"
                                    >
                                        💾 Guardar
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Tipo de Documento
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        value={data.tipoDocumento}
                                        onChange={e => handleInputChange("tipoDocumento", e.target.value)}
                                        className="w-full border-1 border-black rounded-lg px-3 py-2 text-black"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="dni">DNI</option>
                                        <option value="ruc">RUC</option>
                                        <option value="ce">Carnet de Extranjería</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        {data.tipoDocumento === "ruc" ? "Nro. de RUC *" : data.tipoDocumento === "ce" ? "Nro. de documento *" : "Nro. de documento *"}
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={data.numeroDoc}
                                            disabled={!data.tipoDocumento}
                                            onChange={e => {
                                                const maxLen = data.tipoDocumento === "ruc" ? 11 : data.tipoDocumento === "dni" ? 8 : 15
                                                const filtered = e.target.value.replace(/[^0-9]/g, "").slice(0, maxLen)
                                                handleInputChange("numeroDoc", filtered)
                                                // Auto-búsqueda al completar dígitos
                                                const isDocValido = data.tipoDocumento === "dni" || data.tipoDocumento === "ruc"
                                                if (isDocValido && filtered.length === maxLen && !buscandoDocumento) {
                                                    buscarDocumento()
                                                }
                                            }}
                                            maxLength={data.tipoDocumento === "ruc" ? 11 : data.tipoDocumento === "dni" ? 8 : 15}
                                            className={`w-full border-1 border-black rounded-lg px-3 py-2 pr-10 text-black ${!data.tipoDocumento ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                            placeholder={!data.tipoDocumento ? "Seleccione tipo primero" : data.tipoDocumento === "ruc" ? "11 dígitos" : data.tipoDocumento === "dni" ? "8 dígitos" : "15 dígitos"}
                                        />
                                        <button
                                            type="button"
                                            onClick={buscarDocumento}
                                            disabled={buscandoDocumento || !data.numeroDoc || (data.tipoDocumento !== "dni" && data.tipoDocumento !== "ruc")}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 disabled:opacity-50"
                                        >
                                            {buscandoDocumento ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        </button>
</div>
                                </div>
                                {buscandoDocumento && (
                                    <div className="mt-2 flex items-center gap-2 text-blue-600">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-sm">Buscando...</span>
                                    </div>
                                )}
                                {alertDocumento.show && (
                                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                        <AlertCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
                                        <p className="text-sm text-red-700">{alertDocumento.message}</p>
                                        <button 
                                            onClick={() => setAlertDocumento({ show: false, message: "" })}
                                            className="ml-auto text-red-400 hover:text-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                                {data.tipoDocumento !== "ruc" && (
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">
                                            Nombres y apellidos *
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nombreFactura}
                                            onChange={e => {
                                                const filtered = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, 50)
                                                handleInputChange("nombreFactura", filtered)
                                            }}
                                            maxLength={50}
                                            className="w-full border-1 border-black rounded-lg px-3 py-2 text-black"
                                            placeholder="Nombre completo"
                                        />
                                    </div>
                                )}
                                {data.tipoDocumento === "ruc" && (
                                    <div>
                                        <label className="block text-sm font-medium text-black mb-1">
                                            Razón Social *
                                            <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.nombreFactura}
                                            onChange={e => {
                                                const filtered = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]/g, "").slice(0, 80)
                                                handleInputChange("nombreFactura", filtered)
                                            }}
                                            maxLength={80}
                                            className="w-full border-1 border-black rounded-lg px-3 py-2 text-black"
                                            placeholder="Razón social"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Dirección *
                                        <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.direccion}
                                        onChange={e => {
                                            const filtered = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s0-9#\-\.]/g, "").slice(0, 80)
                                            handleInputChange("direccion", filtered)
                                        }}
                                        maxLength={80}
                                        className="w-full border-1 border-black rounded-lg px-3 py-2 text-black"
                                        placeholder="Dirección de facturación"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-black mb-1">
                                        Departamento / Provincia / Distrito
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={data.departamento}
                                            onChange={e => {
                                                handleInputChange("departamento", e.target.value)
                                                handleInputChange("provincia", "")
                                                handleInputChange("distrito", "")
                                            }}
                                            className="flex-1 border-1 border-black rounded-lg px-3 py-2 text-black"
                                        >
                                            <option value="">Seleccione</option>
                                            {Object.keys(UBIGEO).map(dep => (
                                                <option key={dep} value={dep}>{dep}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={data.provincia}
                                            onChange={e => {
                                                handleInputChange("provincia", e.target.value)
                                                handleInputChange("distrito", "")
                                            }}
                                            disabled={!data.departamento}
                                            className="flex-1 border-1 border-black rounded-lg px-3 py-2 text-black disabled:bg-slate-100"
                                        >
                                            <option value="">Seleccione</option>
                                            {data.departamento && UBIGEO[data.departamento] && Object.keys(UBIGEO[data.departamento] || {}).map(prov => (
                                                <option key={prov} value={prov}>{prov}</option>
                                            ))}
                                        </select>
                                        <select
                                            value={data.distrito}
                                            onChange={e => handleInputChange("distrito", e.target.value)}
                                            disabled={!data.provincia}
                                            className="flex-1 border-1 border-black rounded-lg px-3 py-2 text-black disabled:bg-slate-100"
                                        >
                                            <option value="">Seleccione</option>
                                            {data.departamento && data.provincia && UBIGEO[data.departamento]?.[data.provincia] && (UBIGEO[data.departamento]?.[data.provincia] || []).map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <Button onClick={() => setStep(1)} className="flex-1 bg-slate-800 text-white">Atrás</Button>
                                    <Button onClick={() => setStep(3)} disabled={!validarPaso(2)} className="flex-1 bg-green-600 text-white">Continuar</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-black">Método de Entrega</h2>
                                {(data.metodoEnvio === "agencia" || data.metodoEnvio === "delivery") && (
                                    <div className="flex gap-2">
                                        {direccionTemplates.length > 0 && (
                                            <select
                                                onChange={(e) => {
                                                    const t = direccionTemplates.find(x => x.id === e.target.value)
                                                    if (t) {
                                                        // Guardar tipoEnvio para chequear después de setData
                                                        const tipoEnvioCargado = t.tipoEnvio || "mismapersona"
                                                        setData({
                                                            ...data,
                                                            metodoEnvio: t.metodoEnvio,
                                                            tiendaId: t.tiendaId || "",
                                                            agencia: t.agencia || "",
                                                            agenciaOtro: t.agenciaOtro || "",
                                                            delivery: t.delivery || "",
                                                            deliveryOtro: t.deliveryOtro || "",
                                                            departamento: t.departamento || "",
                                                            provincia: t.provincia || "",
                                                            distrito: t.distrito || "",
                                                            direccion: t.direccion || "",
                                                            tipoEnvio: tipoEnvioCargado,
                                                            dniRecibe: t.dniRecibe || "",
                                                            nombreRecibe: t.nombreRecibe || "",
                                                            celularRecibe: t.celularRecibe || ""
                                                        })
                                                        // Forzar actualización de estado para mostrar campos de otra persona
                                                        setTimeout(() => {
                                                            setData(prev => ({
                                                                ...prev,
                                                                tipoEnvio: tipoEnvioCargado
                                                            }))
                                                        }, 50)
                                                        showToast("Dirección cargada", "success")
                                                    }
                                                    e.target.value = ""
                                                }}
                                                className="text-sm border border-slate-300 rounded px-2 py-1 text-black"
                                            >
                                                <option value="">📂 Cargar dirección</option>
                                                {direccionTemplates.map(t => (
                                                    <option key={t.id} value={t.id}>{t.nombre}</option>
                                                ))}
                                            </select>
                                        )}
                                        <Button
                                            onClick={async () => {
                                                if (!data.metodoEnvio) {
                                                    showToast("Seleccione un método de envío", "error")
                                                    return
                                                }
                                                if (data.metodoEnvio === "agencia" && !data.agencia) {
                                                    showToast("Seleccione una agencia", "error")
                                                    return
                                                }
                                                if (data.metodoEnvio === "delivery" && !data.delivery) {
                                                    showToast("Seleccione un delivery", "error")
                                                    return
                                                }
                                                try {
                                                    const res = await fetch("/api/datos-direccion", {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify({
                                                            metodoEnvio: data.metodoEnvio,
                                                            tiendaId: data.tiendaId || null,
                                                            agencia: data.agencia || null,
                                                            agenciaOtro: data.agenciaOtro || null,
                                                            delivery: data.delivery || null,
                                                            deliveryOtro: data.deliveryOtro || null,
                                                            departamento: data.departamento || null,
                                                            provincia: data.provincia || null,
                                                            distrito: data.distrito || null,
                                                            direccion: data.direccion || null,
                                                            tipoEnvio: data.tipoEnvio || null,
                                                            dniRecibe: data.dniRecibe || null,
                                                            nombreRecibe: data.nombreRecibe || null,
                                                            celularRecibe: data.celularRecibe || null
                                                        }),
                                                        credentials: "include"
                                                    })
                                                    const json = await res.json()
                                                    if (json.success) {
                                                        setDireccionTemplates([json.template, ...direccionTemplates])
                                                        showToast("Dirección guardada", "success")
                                                    } else {
                                                        showToast(json.error || "Error al guardar", "error")
                                                    }
                                                } catch (e) {
                                                    showToast("Error de conexión", "error")
                                                }
                                            }}
                                            variant="outline"
                                            className="text-black border-black hover:bg-slate-100"
                                        >
                                            💾 Guardar
                                        </Button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-4">
                                <button
                                    onClick={() => data.metodoEnvio !== "tienda" && handleInputChange("metodoEnvio", "tienda")}
                                    className={`w-full p-4 border-2 rounded-lg ${data.metodoEnvio === "tienda" ? "border-green-600 bg-green-50" : "border-slate-200"} ${data.metodoEnvio === "tienda" ? "cursor-not-allowed opacity-75" : ""}`}
                                    disabled={data.metodoEnvio === "tienda"}
                                >
                                    <p className="font-bold text-black">Recoger en Tienda</p>
                                    <p className="text-sm text-slate-500">S/ 0.00 - Retira en nuestro local</p>
                                </button>

                                {data.metodoEnvio === "tienda" && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                                        <p className="text-sm font-medium text-black mb-2">Selecciona la tienda:</p>
                                        <select
                                            value={data.tiendaId || ""}
                                            onChange={(e) => handleInputChange("tiendaId", e.target.value)}
                                            className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                                        >
                                            <option value="">Seleccionar tienda...</option>
                                            {tiendas.map((tienda) => (
                                                <option key={tienda.id} value={tienda.id}>
                                                    {tienda.nombre} - {tienda.direccion}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <button
                                    onClick={() => data.metodoEnvio !== "agencia" && handleInputChange("metodoEnvio", "agencia")}
                                    className={`w-full p-4 border-2 rounded-lg ${data.metodoEnvio === "agencia" ? "border-yellow-500 bg-yellow-50" : "border-slate-200"} ${data.metodoEnvio === "agencia" ? "cursor-not-allowed opacity-75" : ""}`}
                                    disabled={data.metodoEnvio === "agencia"}
                                >
                                    <p className="font-bold text-black">Agencia de Envíos</p>
                                    <p className="text-sm text-slate-500">S/ {calcularCostoEnvio().toFixed(2)} - Delivery a agencia</p>
                                </button>

                                {data.metodoEnvio === "agencia" && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4 border-2 border-slate-200">
                                        <div>
                                            <p className="text-sm font-medium text-black mb-2">Selecciona agencia:</p>
                                            <select
                                                value={data.agencia || ""}
                                                onChange={(e) => handleInputChange("agencia", e.target.value)}
                                                className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="">Seleccionar agencia...</option>
                                                <option value="shalom">Shalom</option>
                                                <option value="flores">Flores</option>
                                                <option value="marvisur">Marvisur</option>
                                                <option value="olva">Olva</option>
                                                <option value="safexpress">Safexpress</option>
                                                <option value="otros">Otra agencia</option>
                                            </select>
                                        </div>
                                        {data.agencia === "otros" && (
                                            <input
                                                type="text"
                                                placeholder="Nombre de la agencia"
                                                value={data.agenciaOtro || ""}
                                                onChange={(e) => handleInputChange("agenciaOtro", e.target.value)}
                                                className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
                                            />
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">
                                                Dirección de envío
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Dirección completa para entrega"
                                                value={data.direccion || ""}
                                                onChange={(e) => handleInputChange("direccion", e.target.value)}
                                                className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-black mb-2">¿Quién recibe?</p>
                                            <select
                                                value={data.tipoEnvio || "mismapersona"}
                                                onChange={(e) => handleInputChange("tipoEnvio", e.target.value)}
                                                className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="mismapersona">Yo mismo</option>
                                                <option value="otropersona">Otra persona</option>
                                            </select>
                                        </div>
                                        {data.tipoEnvio === "otropersona" && (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="DNI (8 dígitos)"
                                                    value={data.dniRecibe || ""}
                                                    onChange={(e) => handleInputChange("dniRecibe", e.target.value.replace(/\D/g, "").slice(0, 8))}
                                                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
                                                    maxLength={8}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Nombre completo"
                                                    value={data.nombreRecibe || ""}
                                                    onChange={(e) => handleInputChange("nombreRecibe", e.target.value)}
                                                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Celular"
                                                    value={data.celularRecibe || ""}
                                                    onChange={(e) => handleInputChange("celularRecibe", e.target.value.replace(/\D/g, "").slice(0, 9))}
                                                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
                                                    maxLength={9}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <button
                                    onClick={() => data.metodoEnvio !== "delivery" && handleInputChange("metodoEnvio", "delivery")}
                                    className={`w-full p-4 border-2 rounded-lg ${data.metodoEnvio === "delivery" ? "border-blue-500 bg-blue-50" : "border-slate-200"} ${data.metodoEnvio === "delivery" ? "cursor-not-allowed opacity-75" : ""}`}
                                    disabled={data.metodoEnvio === "delivery"}
                                >
                                    <p className="font-bold text-black">Delivery</p>
                                    <p className="text-sm text-slate-500">S/ {calcularCostoEnvio().toFixed(2)} - Envío a domicilio</p>
                                </button>

                                {data.metodoEnvio === "delivery" && (
                                    <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4 border-2 border-slate-200">
                                        <div>
                                            <p className="text-sm font-medium text-black mb-2">Tipo de delivery:</p>
                                            <select
                                                value={data.delivery || ""}
                                                onChange={(e) => handleInputChange("delivery", e.target.value)}
                                                className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="">Seleccionar...</option>
                                                <option value="olva">Olva</option>
                                                <option value="safexpress">Safexpress</option>
                                                <option value="otros">Otro</option>
                                            </select>
                                        </div>
                                        {data.delivery === "otros" && (
                                            <input
                                                type="text"
                                                placeholder="Nombre del delivery"
                                                value={data.deliveryOtro || ""}
                                                onChange={(e) => handleInputChange("deliveryOtro", e.target.value)}
                                                className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
                                            />
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-black mb-2">
                                                Dirección de envío
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Dirección completa para entrega"
                                                value={data.direccion || ""}
                                                onChange={(e) => handleInputChange("direccion", e.target.value)}
                                                className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
                                            />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-black mb-2">¿Quién recibe?</p>
                                            <select
                                                value={data.tipoEnvio || "mismapersona"}
                                                onChange={(e) => handleInputChange("tipoEnvio", e.target.value)}
                                                className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none"
                                            >
                                                <option value="mismapersona">Yo mismo</option>
                                                <option value="otropersona">Otra persona</option>
                                            </select>
                                        </div>
                                        {data.tipoEnvio === "otropersona" && (
                                            <div className="space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="DNI (8 dígitos)"
                                                    value={data.dniRecibe || ""}
                                                    onChange={(e) => handleInputChange("dniRecibe", e.target.value.replace(/\D/g, "").slice(0, 8))}
                                                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
                                                    maxLength={8}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Nombre completo"
                                                    value={data.nombreRecibe || ""}
                                                    onChange={(e) => handleInputChange("nombreRecibe", e.target.value)}
                                                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Celular (opcional)"
                                                    value={data.celularRecibe || ""}
                                                    onChange={(e) => handleInputChange("celularRecibe", e.target.value.replace(/\D/g, "").slice(0, 9))}
                                                    className="w-full p-3 border-2 border-slate-300 rounded-lg text-black focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
                                                    maxLength={9}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-4 mt-6">
                                    <Button onClick={() => setStep(2)} className="flex-1 bg-slate-800 text-white">Atrás</Button>
                                    <Button onClick={() => setStep(4)} disabled={!validarPaso(3)} className="flex-1 bg-green-600 text-white">Continuar</Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <h2 className="text-xl font-bold text-black mb-4">Resumen y Pago</h2>

                            {metrajeConfirmado && continuarPedido ? (
                                <div className="mb-4">
                                    <div className="border border-slate-300 bg-slate-50 p-4 rounded-lg mt-6 text-sm">
                                        <h3 className="font-bold text-black mb-3">Artículos del pedido</h3>
                                        <div className="space-y-3">
                                            {continuarPedido.pedidoDetalle?.map((detalle: any, index: number) => {
                                                const metrajeItem = detalle.tipo === "pieza"
                                                    ? (detalle.etiquetas?.reduce((s: number, e: any) => s + e.valor, 0) || 0)
                                                    : (detalle.metraje || detalle.cantidad)
                                                const subtotalporItem = metrajeItem * Number(detalle.precio)

                                                // Función para obtener estado del artículo
                                                const getEstadoArticulo = () => {
                                                    if (detalle.tipo !== "pieza") return null
                                                    const solicitados = Number(detalle.cantidad)
                                                    const registrados = detalle.etiquetas?.length || 0
                                                    if (registrados === 0) {
                                                        return { label: `Sin existencias 0/${solicitados} pieza(s)`, color: "bg-red-100 text-red-700" }
                                                    }
                                                    if (registrados === solicitados) {
                                                        return { label: `Completo ${registrados}/${solicitados} pieza(s)`, color: "bg-green-100 text-green-700" }
                                                    }
                                                    return { label: `Parcial ${registrados}/${solicitados} pieza(s)`, color: "bg-yellow-100 text-yellow-700" }
                                                }
                                                const estadoArticulo = getEstadoArticulo()

                                                return (
                                                    <div key={index} className="bg-white p-3 rounded shadow-sm">
                                                        <div className="flex justify-between text-black mb-1">
                                                            <span className="font-bold text-lg">{detalle.producto?.nombre || `Producto ${index + 1}`}</span>
                                                            <span>{metrajeItem === 0 ? "-" : `S/ ${subtotalporItem.toFixed(2)}`}</span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-md text-gray-600">
                                                            {detalle.tipo === "pieza" ? (
                                                                <>
                                                                    <PackageCheck className="h-3 w-3" />
                                                                    <span>{detalle.cantidad} pieza(s) {(() => {
                                                                        const metrajePieza = detalle.etiquetas?.reduce((s: number, e: any) => s + e.valor, 0) || 0
                                                                        return `${metrajePieza.toFixed(2)} mts`
                                                                    })()} × S/ {Number(detalle.precio).toFixed(2)}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <RulerDimensionLine className="h-3 w-3" />
                                                                    <span>{detalle.metraje || detalle.cantidad} mts × S/ {Number(detalle.precio).toFixed(2)}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        {estadoArticulo && (
                                                            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${estadoArticulo.color}`}>
                                                                {estadoArticulo.label}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>


                                    <div className="bg-slate-50 p-4 rounded-lg mt-4 text-sm">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-black">Subtotal:</span>
                                            <span className="text-black">S/ {(() => {
                                                const detalles = continuarPedido.pedidoDetalle || []
                                                return detalles.reduce((sum: number, d: any) => {
                                                    const precio = Number(d.precio) || 0
                                                    if (d.tipo === "pieza") {
                                                        const metrajePieza = d.etiquetas?.reduce((s: number, e: any) => s + e.valor, 0) || 0
                                                        return sum + (precio * metrajePieza)
                                                    }
                                                    const metraje = d.metraje || d.cantidad || 0
                                                    return sum + (precio * metraje)
                                                }, 0)
                                            })().toFixed(2)}</span>
                                        </div>
                                        {continuarPedido.metodoEnvio && continuarPedido.metodoEnvio !== "retiro" && (
                                            <div className="flex justify-between mb-1">
                                                <span className="text-black">Costo de envío:</span>
                                                <span className="text-black">S/ {Number(continuarPedido.costoEnvio || 0).toFixed(2)}</span>
                                            </div>
                                        )}
                                        {(!continuarPedido.metodoEnvio || continuarPedido.metodoEnvio === "retiro") && (
                                            <div className="flex justify-between mb-1">
                                                <span className="text-black">Recojo en tienda:</span>
                                                <span className="text-green-600 font-medium">Gratis</span>
                                            </div>
                                        )}
                                        <div className="border-t border-slate-300 mt-2 pt-2">
                                            <p className="font-bold mb-2 text-black">Total: S/ {Number(continuarPedido.total || 0).toFixed(2)}</p>
                                        </div>
                                    </div>

                                    {/* Indicador de comprobante de pago */}
                                    {comprobanteUrl && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                                            <File className="h-5 w-5 text-green-600" />
                                            <span className="text-sm text-green-700 flex-1">Comprobante de pago subido</span>
                                            <a 
                                                href={comprobanteUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                Ver
                                            </a>
                                        </div>
                                    )}

                                    <div className="flex justify-center gap-4 mt-6 pt-4">
                                        <Button
                                            onClick={() => router.push("/dashboard/pedidos")}
                                            className="w-2/5 bg-slate-700 hover:bg-slate-900 text-white font-bold py-3"
                                        >
                                            Volver a pedidos
                                        </Button>
                                        <Button
                                            onClick={() => setShowPaymentModal(true)}
                                            disabled={loading}
                                            className="w-3/5 bg-green-600 hover:bg-green-700 text-white font-bold py-3"
                                        >
                                            {loading ? "Procesando..." : "Finalizar Compra"}
                                        </Button>
                                    </div>
                                </div>
                            ) : tienePiezasPendientes ? (
                                <div className="mb-4">
                                    <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-5 mb-4 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-amber-100 p-2 rounded-full">
                                                <Clock className="h-6 w-6 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-amber-900 text-lg">Tu pedido requiere revisión de metraje</p>
                                                <p className="text-sm text-amber-700 mt-1">
                                                    Tus piezas necesitan ser medidas con precisión. Haz clic en <span className="font-semibold">"Agendar pedido"</span> para programar la revisión.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-xs text-amber-600">
                                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                            <span>Pendiente de confirmación</span>
                                        </div>
                                    </div>

                                    <div className="border-2 border-black rounded-lg p-4">
                                        <p className="font-bold text-black mb-3">Artículos:</p>
                                        <div className="space-y-2">
                                            {continuarPedido?.pedidoDetalle?.length ? (
                                                continuarPedido.pedidoDetalle.map((detalle: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between items-center text-md">
                                                        <span className="text-black">{detalle.producto?.nombre || `Producto ${idx + 1}`}</span>
                                                        <div className="flex items-center gap-2">
                                                            {detalle.tipo === "pieza" && (() => {
                                                                const solicitados = Number(detalle.cantidad)
                                                                const registrados = detalle.etiquetas?.length || 0
                                                                let badge = null
                                                                if (registrados === 0) {
                                                                    badge = { label: "Sin existencias", color: "bg-red-100 text-red-700 text-xs" }
                                                                } else if (registrados === solicitados) {
                                                                    badge = { label: "Completo", color: "bg-green-100 text-green-700 text-xs" }
                                                                } else {
                                                                    badge = { label: "Parcial", color: "bg-yellow-100 text-yellow-700 text-xs" }
                                                                }
                                                                return badge ? (
                                                                    <span className={`px-2 py-0.5 rounded ${badge.color}`}>
                                                                        {badge.label} {registrados}/{solicitados}
                                                                    </span>
                                                                ) : null
                                                            })()}
                                                            <span className="text-black font-medium">
                                                                {detalle.tipo === "pieza"
                                                                    ? `${detalle.cantidad} pieza(s) ${(() => {
                                                                        const metrajePieza = detalle.etiquetas?.reduce((s: number, e: any) => s + e.valor, 0) || 0
                                                                        return `${metrajePieza.toFixed(2)} mts`
                                                                    })()}`
                                                                    : `${detalle.metraje || detalle.cantidad} mts`
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                items.map((item: any, idx: number) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-black">{item.producto.nombre}</span>
                                                        <span className="text-black font-medium">
                                                            {item.cantidad} {item.tipo === "pieza" ? "pieza(s)" : " mts"}
                                                        </span>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-6">
                                        <Button
                                            onClick={() => setStep(3)}
                                            variant="outline"
                                            className="flex-1 border-slate-500 text-black font-bold"
                                        >
                                            Atrás
                                        </Button>
                                        <Button
                                            onClick={() => router.push("/dashboard")}
                                            variant="outline"
                                            className="flex-1 border-red-500 text-red-600 hover:bg-red-50 font-bold"
                                        >
                                            Cancelar Compra
                                        </Button>
                                        <Button onClick={crearPedidoConMetrajeTemporal} disabled={loading} className="flex-1 bg-yellow-600 text-black font-bold">
                                            {loading ? "Procesando..." : "Agendar Pedido"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="border-2 border-black rounded-lg p-4 mb-4">
                                        <p className="font-bold text-black mb-3">Artículos:</p>
                                        <div className="space-y-2">
                                            {items.map((item: any, idx: number) => {
                                                const subtotal = item.metraje ? item.metraje * item.producto.precio : item.cantidad * item.producto.precio
                                                return (
                                                    <div key={idx} className="flex justify-between text-md">
                                                        <div className="text-black">
                                                            <p className="font-medium">{item.producto.nombre}</p>
                                                            <p className="text-xs text-gray-600">
                                                                {item.metraje
                                                                    ? `${item.metraje}m × S/ ${Number(item.producto.precio).toFixed(2)}`
                                                                    : `${item.cantidad} ${item.tipo === "pieza" ? "pieza(s)" : " mts"} × S/ ${Number(item.producto.precio).toFixed(2)}`
                                                                }
                                                            </p>
                                                        </div>
                                                        <span className="text-black font-medium">S/ {subtotal.toFixed(2)}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-lg mb-4 text-sm">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-black">Subtotal:</span>
                                            <span className="text-black">S/ {calcularSubtotal().toFixed(2)}</span>
                                        </div>
                                        {data.metodoEnvio && data.metodoEnvio !== "retiro" && (
                                            <div className="flex justify-between mb-1">
                                                <span className="text-black">Costo de envío:</span>
                                                <span className="text-black">S/ {calcularCostoEnvio().toFixed(2)}</span>
                                            </div>
                                        )}
                                        {data.metodoEnvio === "retiro" && (
                                            <div className="flex justify-between mb-1">
                                                <span className="text-black">Recojo en tienda:</span>
                                                <span className="text-green-600 font-medium">Gratis</span>
                                            </div>
                                        )}
                                        <div className="border-t border-slate-300 mt-2 pt-2">
                                            <p className="font-bold mb-2 text-black">Total: S/ {calcularTotal().toFixed(2)}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-4">
                                        <Button
                                            onClick={() => setStep(3)}
                                            variant="outline"
                                            className="flex-1 border-slate-500 text-black font-bold"
                                        >
                                            Volver atrás
                                        </Button>
                                        <Button
                                            onClick={() => router.push("/dashboard")}
                                            variant="outline"
                                            className="flex-1 border-red-500 text-red-600 hover:bg-red-50 font-bold"
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            onClick={() => setShowPaymentModal(true)}
                                            disabled={loading}
                                            className="flex-1 bg-green-600 text-white font-bold"
                                        >
                                            Finalizar Compra
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {deletingId && items.find(i => i.id === deletingId) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
                        <p className="text-lg font-bold text-black mb-4">¿Eliminar {items.find(i => i.id === deletingId)?.producto.nombre}?</p>
                        <div className="flex gap-3">
                            <Button onClick={cancelarEliminar} variant="outline" className="flex-1">Cancelar</Button>
                            <Button onClick={confirmarEliminar} className="flex-1 bg-red-600">Sí, eliminar</Button>
                        </div>

                    </div>
                </div>
            )}

            {showPaymentModal && (

                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

                    <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-black mb-4">Métodos de Pago</h2>

                        <div className="bg-slate-50 p-4 rounded-lg mt-4 mb-4">
                            <p className="font-bold text-xl text-black">Total: S/ {continuarPedido?.total ? Number(continuarPedido.total).toFixed(2) : calcularTotal().toFixed(2)}</p>
                        </div>

                        <div className="space-y-3 mb-4">
                            <p className="text-black">Transferencias bancarias:</p>
                            <img src="/images/bcp_logo.png" alt="BCP" className="w-28 h-8" />
                            <div className="flex items-center justify-between">
                                <p className="text-black">Cuenta corriente: 215-2858489001</p>
                                <button onClick={() => copiarTexto("215-2858489001", "bcp")}
                                    className={`px-2 py-1 text-xs rounded ${copiado.bcp
                                        ? "bg-green-100 text-green-700"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                        }`}>
                                    {copiado.bcp ? "Copiado" : "Copiar"}
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-black">CCI: 620-3004489521</p>
                                <button onClick={() => copiarTexto("620-3004489521", "cci")}
                                    className={`px-2 py-1 text-xs rounded ${copiado.cci
                                        ? "bg-green-100 text-green-700"
                                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                        }`}>
                                    {copiado.cci ? "Copiado" : "Copiar"}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-black">Billeteras digitales: </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-3 align-center justify-center">
                                    <div className="flex flex-row gap-2 items-center justify-center">
                                        <img src="/images/yape_logo.png" alt="Yape" className="w-16 h-16 rounded-lg" />
                                        <img src="/images/plin_image.jpg" alt="Plin" className="w-16 h-16 rounded-lg" />
                                    </div>

                                    <div className="flex items-center justify-between gap-2 items-center justify-center">
                                        <p className="text-black font-medium">+51 978 543 210</p>
                                        <button
                                            onClick={() => copiarTexto("+51 978 543 210", "celular")}
                                            className={`px-3 py-1.5 text-xs rounded font-medium ${copiado.celular
                                                ? "bg-green-500 text-white"
                                                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                                                }`}
                                        >
                                            {copiado.celular ? "Copiado" : "Copiar"}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-center">
                                    <img
                                        src="/images/QR-Yape.jpg"
                                        alt="QR-Yape"
                                        className="w-40 h-40 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <p className="text-black">Empresa: <strong>Manchester Collection Perú E.I.R.L.</strong></p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1 text-black flex items-center gap-2">
                                    Número de operación:
                                    <button
                                        type="button"
                                        onClick={() => setShowAyudaOperacion(true)}
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Ver qué es el número de operación"
                                    >
                                        <HelpCircle className="h-4 w-4" />
                                    </button>
                                </label>
                                <input
                                    type="text"
                                    value={data.numeroOperacion}
                                    onChange={(e) => setData({ ...data, numeroOperacion: e.target.value })}
                                    className="w-full px-3 py-2 border border-black rounded-lg bg-white text-black"
                                    placeholder="Ingresa el número de operación"
                                />
                            </div>

                            {/* Comprobante de pago */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                    Comprobante de pago (opcional)
                                </label>
                                {comprobanteUrl ? (
                                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <File className="h-5 w-5 text-green-600" />
                                        <span className="text-sm text-green-700 flex-1">Comprobante subido</span>
                                        <a 
                                            href={comprobanteUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            Ver
                                        </a>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept=".jpg,.jpeg,.png,.pdf"
                                            onChange={handleComprobanteChange}
                                            disabled={subiendoComprobante}
                                            className="w-full px-3 py-2 border border-black rounded-lg bg-white text-black file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                                        />
                                        {subiendoComprobante && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-blue-600">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Subiendo...
                                            </div>
                                        )}
                                    </div>
                                )}
                                {comprobanteFile && !comprobanteUrl && !subiendoComprobante && (
                                    <p className="text-xs text-orange-600 mt-1">Archivo seleccionado pero no subido</p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <div className="w-full gap-3">
                                    <Button
                                        onClick={() => setShowPaymentModal(false)}
                                        className="w-2/5 bg-red-600 hover:bg-red-700 font-bold py-2.5 px-4 rounded-lg text-white"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={confirmarPago}
                                        disabled={loading || (!data.numeroOperacion && !comprobanteUrl)}
                                        className="w-3/5 bg-green-600 hover:bg-green-700 font-bold py-2.5 px-4 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Procesando..." : "Confirmar Pedido"}
                                    </Button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )
            }

            {
                showAyudaOperacion && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={() => setShowAyudaOperacion(false)}>
                        <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setShowAyudaOperacion(false)}
                                className="absolute -top-10 right-0 text-white hover:text-gray-200 font-bold text-lg flex items-center gap-1"
                            >
                                <X className="h-5 w-5" />
                                Cerrar
                            </button>
                            <img
                                src="/images/yape_info2.jpg"
                                alt="Cómo encontrar el número de operación"
                                className="w-full rounded-lg shadow-2xl"
                            />
                        </div>
                    </div>
                )
            }

            {
                !continuarPedido && showMetrajePopup && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-black">⚠️ Tu pedido incluye piezas</h2>
                                    <p className="text-sm text-slate-500">El metraje exacto está siendo procesado.</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm font-medium text-slate-700 mb-2">Artículos que requieren metraje:</p>
                                <div className="bg-slate-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                                    {items.filter(i => i.tipo === "pieza").map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm py-1">
                                            <span className="text-slate-800">{item.producto.nombre}</span>
                                            <span className="text-slate-500">{item.cantidad} piezas</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                Te notificaremos cuando esté listo para continuar.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => { setShowMetrajePopup(false); router.push("/dashboard") }}
                                className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={async () => {
                                    setShowMetrajePopup(false)
                                    await crearPedidoConMetrajeTemporal()
                                }}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                            >
                                Aceptar
                            </Button>
                        </div>
                    </div>
                )
            }


            {
                deletingId && items.find(i => i.id === deletingId) && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
                            <div className="text-center mb-4">
                                <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-2" />
                                <p className="text-lg font-bold text-black">¿Estás seguro de eliminar?</p>
                                <p className="text-slate-600 mt-2">
                                    El artículo <span className="font-bold text-red-600">{items.find(i => i.id === deletingId)?.producto.nombre}</span> será eliminado de tu carrito.
                                </p>
                            </div>
                            <div className="flex justify-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={cancelarEliminar}
                                    className="border-slate-300 text-black"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={confirmarEliminar}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Sí, eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                deletingId && items.find(i => i.id === deletingId) && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl">
                            <div className="text-center mb-4">
                                <Trash2 className="h-12 w-12 text-red-500 mx-auto mb-2" />
                                <p className="text-lg font-bold text-black">¿Estás seguro de eliminar?</p>
                                <p className="text-slate-600 mt-2">
                                    El artículo <span className="font-bold text-red-600">{items.find(i => i.id === deletingId)?.producto.nombre}</span> será eliminado de tu carrito.
                                </p>
                            </div>
                            <div className="flex justify-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={cancelarEliminar}
                                    className="border-slate-300 text-black"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={confirmarEliminar}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Sí, eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                popupItem && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-xl">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-900">Indicaciones de corte</h3>
                                <button
                                    onClick={() => setPopupItem(null)}
                                    className="p-2 text-slate-500 hover:text-slate-700 rounded"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div>
                                    <p className="text-sm text-slate-500">Producto</p>
                                    <p className="font-medium text-slate-900">{popupItem.producto.nombre}</p>
                                </div>

                                <div className="flex gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Tipo</p>
                                        <p className="font-medium text-slate-900">{popupItem.tipoLabel}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Cantidad</p>
                                        <p className="font-medium text-slate-900">{popupItem.cantidad} {popupItem.tipo === "pieza" ? "pzs" : "m"}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-slate-700 mb-2">Indicaciones de corte</p>
                                    <textarea
                                        value={indicaciones[popupItem.id] || ""}
                                        onChange={(e) => {
                                            const value = e.target.value.slice(0, 200)
                                            setIndicaciones(prev => ({ ...prev, [popupItem.id]: value }))
                                        }}
                                        maxLength={200}
                                        placeholder="Ej: Cortar a 2.5 metros, necesito 3 piezas de 1m cada una..."
                                        className="w-full border border-slate-300 rounded px-3 py-2 text-sm text-slate-900"
                                        rows={4}
                                    />
                                    <p className="text-xs text-slate-400 mt-1">{(indicaciones[popupItem.id] || "").length}/200 caracteres</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={async () => {
                                        await guardarIndicacion(popupItem.id)
                                        setPopupItem(null)
                                    }}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    Guardar
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setPopupItem(null)}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                indicacionToDelete && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-[100]"
                        style={{ backgroundColor: "rgba(0,0,0,0.8)" }}
                        onClick={() => setIndicacionToDelete(null)}
                    >
                        <div
                            className="bg-white rounded-xl p-6 max-w-sm mx-4 shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center mb-4">
                                <FileText className="h-12 w-12 text-amber-500 mx-auto mb-2" />
                                <p className="text-lg font-bold text-slate-900">¿Eliminar indicación de corte?</p>
                                <p className="text-slate-600 mt-2">
                                    La indicación para este producto será eliminada. Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <div className="flex justify-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setIndicacionToDelete(null)}
                                    className="border-slate-300 text-slate-700"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={async () => {
                                        console.log("Confirmando eliminación...")
                                        // Actualizar estado local
                                        setIndicaciones(prev => ({ ...prev, [indicacionToDelete]: "" }))
                                        // Llamar al API directamente con null para eliminar
                                        await fetch("/api/carrito", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({
                                                action: "actualizarIndicaciones",
                                                carritoId: indicacionToDelete,
                                                indicacionesCorte: null
                                            }),
                                            credentials: "include"
                                        })
                                        setIndicacionToDelete(null)
                                    }}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Sí, eliminar
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                successModal.show && (
                    <div
                        className="fixed inset-0 flex items-center justify-center z-50"
                        style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
                        onClick={() => {
                            setSuccessModal({ show: false, message: "" })
                            router.push("/dashboard/pedidos")
                        }}
                    >
                        <div
                            className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform scale-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="h-10 w-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                    ¡Pedido Agendado!
                                </h2>
                                {successModal.orderNumber && (
                                    <p className="text-sm text-slate-500 mb-4">
                                        Orden: <span className="font-semibold text-slate-700">{successModal.orderNumber}</span>
                                    </p>
                                )}
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                                    <p className="text-amber-800 text-sm">
                                        <Clock className="inline h-4 w-4 mr-1" />
                                        Piezas en proceso de metraje
                                    </p>
                                    <p className="text-amber-600 text-xs mt-1">
                                        Te contactaremos pronto para confirmar los detalles.
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSuccessModal({ show: false, message: "" })
                                        router.push("/dashboard/pedidos")
                                    }}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                                >
                                    Ver mis pedidos
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}