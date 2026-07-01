"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"
import { 
    X, Search, Plus, Trash2, FileText, Printer, Send, Save, 
    ArrowLeft, ArrowRight, Check, Package, Ruler, Loader2,
    Building2, CreditCard, User, MapPin, Phone, Truck, FileCheck, ClipboardList, Pencil, Filter, AlertTriangle, Ban, Copy, DollarSign, Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DEPARTAMENTOS } from "@/lib/ubigeo"

interface Cliente {
    id?: string
    nombre: string
    tipoDoc: string
    numeroDoc: string
    razonSocial?: string
    direccion: string
    telefono: string
    agencia?: string
    agenciaOtro?: string
    guiaRemision?: boolean
    departamento?: string
    provincia?: string
    distrito?: string
    origen?: string
}

interface ItemPedido {
    id: string
    productoId: string
    productoNombre: string
    productoCategoria: string
    productoPrecio: number
    cantidad: number
    tipo: string
    indicacionesCorte: string
}

interface Producto {
    id: string
    nombre: string
    precio: number
    categoria: string
    stocks: { stock: number }[]
}

interface Props {
    isOpen: boolean
    onClose: () => void
    userName: string
    pedidoEditar?: any
    borradorRestaurarId?: string | null
}

const EMPRESAS = ["FLORES CARITAS", "TEXTILES MANCHESTER", "MANCHESTERTEX", "TEXTILES MEGO", "YAPE CARLOS", "YAPE ANGEL"]
const METODOS_PAGO = ["TRANSFERENCIA", "DEPOSITO", "EFECTIVO", "YAPE","PLIN", "BBVA"]
const AGENCIAS = [
    { value: "antezana", label: "ANTEZANA" },
    { value: "shalom", label: "SHALOM" },
    { value: "flores", label: "FLORES" },
    { value: "marvisur", label: "MARVISUR" },
    { value: "grael", label: "GRAEL" },
    { value: "raza", label: "RAZA" },
    { value: "rana_express", label: "RANA EXPRESS" },
    { value: "carhuamayo", label: "CARHUAMAYO" },
    { value: "cespedes", label: "CESPEDES" },
    { value: "altiplano", label: "ALTIPLANO" },
    { value: "libertadores", label: "LIBERTADORES" },
    { value: "expreso_trujillo", label: "EXPRESO TRUJILLO" },
    { value: "roggers", label: "ROGGERS" },
    { value: "cargosur", label: "CARGO SUR" },
    { value: "emtrafesa", label: "EMTRAFESA" },
    { value: "otros", label: "OTRA AGENCIA" }
]

export function CrearPedidoModal({ isOpen, onClose, userName, pedidoEditar, borradorRestaurarId }: Props) {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [toastMessage, setToastMessage] = useState<{ show: boolean; message: string; type: "error" | "success" }>({ show: false, message: "", type: "error" })
    const [errorDoc, setErrorDoc] = useState("")
    const [errorTel, setErrorTel] = useState("")
    const [showConfirmClose, setShowConfirmClose] = useState(false)
    const [borradorGuardado, setBorradorGuardado] = useState(false)
    const [categoriaFiltro, setCategoriaFiltro] = useState("")
    const [mostrarDropdownCategoria, setMostrarDropdownCategoria] = useState(false)
    const categoriaToggleRef = useRef<HTMLButtonElement>(null)

    const [empresa, setEmpresa] = useState("")
    const [metodoPago, setMetodoPago] = useState("")
    const [clienteBusqueda, setClienteBusqueda] = useState("")
    const [clientesEncontrados, setClientesEncontrados] = useState<Cliente[]>([])
    const [mostrarDropdown, setMostrarDropdown] = useState(false)
    const [buscandoCliente, setBuscandoCliente] = useState(false)
    const [cliente, setCliente] = useState<Cliente>({
        nombre: "",
        tipoDoc: "dni",
        numeroDoc: "",
        direccion: "",
        telefono: "",
        departamento: "",
        provincia: "",
        distrito: "",
    })
    const [agencia, setAgencia] = useState("")
    const [agenciaOtro, setAgenciaOtro] = useState("")
    const [mostrarDropdownAgencia, setMostrarDropdownAgencia] = useState(false)
    const [agenciaDropdownPos, setAgenciaDropdownPos] = useState<{ top: number; left: number; width: number } | null>(null)
    const [agenciaBusqueda, setAgenciaBusqueda] = useState("")
    const agenciaToggleRef = useRef<HTMLButtonElement>(null)
    const [guiaRemision, setGuiaRemision] = useState(false)
    const [mostrarRecibe, setMostrarRecibe] = useState(false)
    const [nombreRecibe, setNombreRecibe] = useState("")
    const [dniRecibe, setDniRecibe] = useState("")
    const [celularRecibe, setCelularRecibe] = useState("")
    const [envioComprobante, setEnvioComprobante] = useState("Imprimir")

    const [empleadosTelefonos, setEmpleadosTelefonos] = useState<{ id: string; nombre: string; celular: string }[]>([])
    const [mostrarDropdownEmpleados, setMostrarDropdownEmpleados] = useState(false)
    const [cargandoEmpleados, setCargandoEmpleados] = useState(false)
    const [buscandoDoc, setBuscandoDoc] = useState(false)
    const [buscandoDocRecibe, setBuscandoDocRecibe] = useState(false)
    const clienteSeleccionadoRef = useRef(false)
    const productoSeleccionadoRef = useRef(false)
    const [clientePedidoId, setClientePedidoId] = useState("")
    const [saldoCartera, setSaldoCartera] = useState<number | null>(null)
    const [adjuntarDeuda, setAdjuntarDeuda] = useState(false)

    const [items, setItems] = useState<ItemPedido[]>([])
    const [editandoArticuloId, setEditandoArticuloId] = useState<string | null>(null)
    const [busquedaProducto, setBusquedaProducto] = useState("")
    const [productosEncontrados, setProductosEncontrados] = useState<Producto[]>([])
    const [categoriasDisponibles, setCategoriasDisponibles] = useState<string[]>([])
    const [mostrarDropdownProducto, setMostrarDropdownProducto] = useState(false)
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
    const [itemCantidad, setItemCantidad] = useState("1")
    const [itemTipo, setItemTipo] = useState<"metros" | "pieza">("metros")
    const [itemIndicaciones, setItemIndicaciones] = useState("")
    const [costoEnvio, setCostoEnvio] = useState("0")
    const [observaciones, setObservaciones] = useState("")
    const [showMontoModal, setShowMontoModal] = useState(false)
    const [montoValue, setMontoValue] = useState("")
    const [showAgregarArticulo, setShowAgregarArticulo] = useState(false)
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
    const [tipoPago, setTipoPago] = useState<"completo" | "dividido" | "parcial" | "">("")
    const [detallesPago, setDetallesPago] = useState<{ monto: string; empresa: string; metodoPago: string }[]>([
        { monto: "", empresa: "", metodoPago: "" },
        { monto: "", empresa: "", metodoPago: "" }
    ])
    const [showDetallePagoModal, setShowDetallePagoModal] = useState(false)
    const [detalleEditandoIdx, setDetalleEditandoIdx] = useState<number | null>(null)
    const [pagoConfirmado, setPagoConfirmado] = useState(false)
    const [pagoParcialTexto, setPagoParcialTexto] = useState("")
    const [guardandoPago, setGuardandoPago] = useState(false)
    const [successOverlay, setSuccessOverlay] = useState<{ show: boolean; numeroOrden: string; action: "creado" | "actualizado" }>({ show: false, numeroOrden: "", action: "creado" })
    const isSubmittingRef = useRef(false)

    useEffect(() => {
        setIsMounted(true)
        const cargarCategorias = async () => {
            try {
                const res = await fetch("/api/productos-categorias")
                const json = await res.json()
                if (json.success) {
                    setCategoriasDisponibles(json.categorias || [])
                }
            } catch (e) {
                console.error("Error cargando categorias:", e)
            }
        }
        cargarCategorias()
    }, [])

    useEffect(() => {
        if (isOpen) {
            const cargarBorradorInicial = async () => {
                try {
                    const res = await fetch("/api/borrador-pedido", { credentials: "include" })
                    const json = await res.json()
                    if (json.success && json.borradores?.length > 0) {
                        const b = json.borradores[0]
                        const fechaBorrador = new Date(b.updatedAt || b.createdAt).toLocaleDateString("es-PE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                        setToastMessage({
                            show: true,
                            message: `Borrador del ${fechaBorrador} disponible. Haz clic en "Guardar borrador" para restaurarlo.`,
                            type: "success"
                        })
                    }
                } catch (e) {
                    console.error("Error cargando borrador:", e)
                }
            }
            cargarBorradorInicial()
        }
    }, [isOpen, userName])

    useEffect(() => {
        if (isOpen && pedidoEditar) {
            const p = pedidoEditar
            setEmpresa(p.pedidoEmpleadoInfo?.empresa || "")
            setMetodoPago(p.pedidoEmpleadoInfo?.metodoPago || "")
            setCliente({
                nombre: p.nombreFactura || "",
                tipoDoc: p.tipoDocumento || "dni",
                numeroDoc: p.numeroDoc || "",
                direccion: p.direccion || "",
                telefono: p.pedidoEmpleadoInfo?.telefono || "",
                departamento: p.departamento || "",
                provincia: p.provincia || "",
                distrito: p.distrito || ""
            })
            setAgencia(p.agencia || "")
            setAgenciaOtro(p.agenciaOtro || "")
            setGuiaRemision(p.pedidoEmpleadoInfo?.guiaRemision || false)
            setNombreRecibe(p.nombreRecibe || "")
            setDniRecibe(p.dniRecibe || "")
            setCelularRecibe(p.celularRecibe || "")
            setMostrarRecibe(!!(p.nombreRecibe || p.dniRecibe || p.celularRecibe))
            setEnvioComprobante(p.pedidoEmpleadoInfo?.envioComprobante || "Imprimir")
            setCostoEnvio(String(p.costoEnvio || 0))
            setObservaciones(p.notas || "")
            const itemsEdit = (p.pedidoDetalle || []).map((d: any) => ({
                id: d.id || Date.now().toString() + Math.random(),
                productoId: d.productoId,
                productoNombre: d.producto?.nombre || "Producto",
                productoCategoria: d.producto?.categoria || "",
                productoPrecio: Number(d.precio) || 0,
                cantidad: Number(d.cantidad) || 0,
                tipo: d.tipo || "metros",
                indicacionesCorte: d.indicacionesCorte || ""
            }))
            setItems(itemsEdit)
            setStep(2)
            setBorradorGuardado(false)
        }
    }, [isOpen, pedidoEditar])

    useEffect(() => {
        if (isOpen && borradorRestaurarId) {
            const cargarBorradorPorId = async () => {
                try {
                    const res = await fetch(`/api/borrador-pedido?id=${borradorRestaurarId}`, { credentials: "include" })
                    const json = await res.json()
                    if (json.success && json.borrador) {
                        const b = json.borrador
                        setCurrentDraftId(b.id)
                        setEmpresa(b.empresa || "")
                        setMetodoPago(b.metodoPago || "")
                        setCliente(b.cliente || { nombre: "", tipoDoc: "dni", numeroDoc: "", direccion: "", telefono: "" })
                        setAgencia(b.agencia || "")
                        setAgenciaOtro(b.agenciaOtro || "")
                        setGuiaRemision(b.guiaRemision || false)
                        setEnvioComprobante(b.envioComprobante || "No imprimir")
                        setCostoEnvio(b.costoEnvio || "0")
                        setObservaciones(b.observaciones || "")
                        setItems(b.items || [])
                        setStep(b.step || 1)
                    }
                } catch (e) {
                    console.error("Error cargando borrador por id:", e)
                }
            }
            cargarBorradorPorId()
        }
    }, [isOpen, borradorRestaurarId])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (mostrarDropdownCategoria && !(e.target as HTMLElement).closest('[data-categoria-dropdown]') && !(e.target as HTMLElement).closest('[data-categoria-toggle]')) {
                setMostrarDropdownCategoria(false)
            }
        }
        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [mostrarDropdownCategoria])

    useEffect(() => {
        if (toastMessage.show) {
            const timer = setTimeout(() => setToastMessage({ show: false, message: "", type: "error" }), 3000)
            return () => clearTimeout(timer)
        }
    }, [toastMessage.show])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (mostrarDropdownEmpleados && !(e.target as HTMLElement).closest('[data-empleados-dropdown]') && !(e.target as HTMLElement).closest('[data-empleados-toggle]')) {
                setMostrarDropdownEmpleados(false)
            }
        }
        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [mostrarDropdownEmpleados])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (mostrarDropdown && !(e.target as HTMLElement).closest('[data-cliente-dropdown]') && !(e.target as HTMLElement).closest('[data-cliente-input]')) {
                setMostrarDropdown(false)
            }
        }
        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [mostrarDropdown])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (mostrarDropdownAgencia && !(e.target as HTMLElement).closest('[data-agencia-dropdown]') && !(e.target as HTMLElement).closest('[data-agencia-toggle]')) {
                setMostrarDropdownAgencia(false)
            }
        }
        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [mostrarDropdownAgencia])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (mostrarDropdownProducto && !(e.target as HTMLElement).closest('[data-producto-dropdown]') && !(e.target as HTMLElement).closest('[data-producto-input]')) {
                setMostrarDropdownProducto(false)
            }
        }
        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [mostrarDropdownProducto])

    const cargarTelefonosEmpleados = async () => {
        if (empleadosTelefonos.length > 0) return
        setCargandoEmpleados(true)
        try {
            const res = await fetch("/api/empleados-telefonos", { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                setEmpleadosTelefonos(json.empleados)
            }
        } catch (e) {
            console.error("Error cargando telefonos:", e)
        } finally {
            setCargandoEmpleados(false)
        }
    }

    const buscarPorDocumento = async () => {
        if (!cliente.numeroDoc || cliente.numeroDoc.length < 2) return
        setBuscandoDoc(true)
        try {
            const res = await fetch("/api/buscar-documento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: cliente.tipoDoc, numero: cliente.numeroDoc })
            })
            const json = await res.json()
            if (json.success) {
                    const dept = DEPARTAMENTOS.find(d => d.nombre.toLowerCase() === (json.departamento || "").toLowerCase())
                    const prov = dept?.provincias.find(p => p.nombre.toLowerCase() === (json.provincia || "").toLowerCase())
                    const distNormalized = prov?.distritos.find(d => d.toLowerCase() === (json.distrito || "").toLowerCase())
                if (cliente.tipoDoc === "ruc") {
                    setCliente({
                        ...cliente,
                        nombre: json.razonSocial || "",
                        direccion: json.direccion || "",
                        departamento: dept?.nombre || json.departamento || "",
                        provincia: prov?.nombre || json.provincia || "",
                        distrito: distNormalized || json.distrito || ""
                    })
                } else {
                    setCliente({
                        ...cliente,
                        nombre: json.nombre || "",
                        direccion: json.direccion || "",
                        departamento: dept?.nombre || json.departamento || "",
                        provincia: prov?.nombre || json.provincia || "",
                        distrito: distNormalized || json.distrito || ""
                    })
                }
            } else {
                setToastMessage({ show: true, message: "Documento no encontrado", type: "error" })
            }
        } catch (e) {
            console.error("Error buscando documento:", e)
            setToastMessage({ show: true, message: "Error al buscar documento", type: "error" })
        } finally {
            setBuscandoDoc(false)
        }
    }

    const buscarDocRecibe = async () => {
        if (!dniRecibe || dniRecibe.length < 8) return
        setBuscandoDocRecibe(true)
        try {
            const res = await fetch("/api/buscar-documento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: "dni", numero: dniRecibe })
            })
            const json = await res.json()
            if (json.success) {
                setNombreRecibe(json.nombre || "")
            } else {
                setToastMessage({ show: true, message: "DNI no encontrado", type: "error" })
            }
        } catch (e) {
            console.error("Error buscando DNI recibe:", e)
            setToastMessage({ show: true, message: "Error al buscar DNI", type: "error" })
        } finally {
            setBuscandoDocRecibe(false)
        }
    }

    useEffect(() => {
        if (clienteBusqueda.length < 2) {
            setClientesEncontrados([])
            setMostrarDropdown(false)
            return
        }

        const timer = setTimeout(async () => {
            if (clienteSeleccionadoRef.current) {
                clienteSeleccionadoRef.current = false
                return
            }
            setBuscandoCliente(true)
            try {
                const res = await fetch(`/api/cliente-buscar?q=${encodeURIComponent(clienteBusqueda)}`, { credentials: "include" })
                const json = await res.json()
                if (json.success) {
                    setClientesEncontrados(json.clientes || [])
                    setMostrarDropdown(true)
                }
            } catch (e) {
                console.error("Error buscando cliente:", e)
            } finally {
                setBuscandoCliente(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [clienteBusqueda])

    const buscarProductos = useCallback(async (query: string) => {
        if (query.length < 2) {
            setProductosEncontrados([])
            setMostrarDropdownProducto(false)
            return
        }

        if (productoSeleccionadoRef.current) {
            productoSeleccionadoRef.current = false
            return
        }

        try {
            const params = new URLSearchParams({ search: query })
            if (categoriaFiltro) {
                params.set("categoria", categoriaFiltro)
            }
            const res = await fetch(`/api/productos?${params.toString()}`, { credentials: "include" })
            const json = await res.json()
            if (json.success) {
                setProductosEncontrados(json.productos || [])
                setMostrarDropdownProducto(true)
            }
        } catch (e) {
            console.error("Error buscando productos:", e)
        }
    }, [categoriaFiltro])

    useEffect(() => {
        const timer = setTimeout(() => buscarProductos(busquedaProducto), 300)
        return () => clearTimeout(timer)
    }, [busquedaProducto, buscarProductos])

    const seleccionarCliente = (c: Cliente) => {
        clienteSeleccionadoRef.current = true
        setCliente({
            nombre: c.nombre,
            tipoDoc: c.tipoDoc || "dni",
            numeroDoc: c.numeroDoc,
            razonSocial: c.razonSocial || "",
            direccion: c.direccion || "",
            telefono: c.telefono || "",
            departamento: c.departamento || "",
            provincia: c.provincia || "",
            distrito: c.distrito || ""
        })
        setErrorDoc("")
        setErrorTel("")
        setClienteBusqueda("")
        setAgencia(c.agencia || "")
        setAgenciaOtro(c.agenciaOtro || "")
        setGuiaRemision(c.guiaRemision || false)
        setMostrarDropdown(false)
        if (c.id) {
            setClientePedidoId(c.id)
            fetch(`/api/clientes-pedido/${c.id}/cartera`, { credentials: "include" })
                .then(r => r.json())
                .then(data => {
                    const saldo = Math.round((data.cartera?.saldo || 0) * 100) / 100
                    setSaldoCartera(saldo)
                })
                .catch(() => setSaldoCartera(null))
        } else {
            setClientePedidoId("")
            setSaldoCartera(null)
        }
    }

    const resetArticuloForm = () => {
        setProductoSeleccionado(null)
        setBusquedaProducto("")
        setItemCantidad("1")
        setItemTipo("metros")
        setItemIndicaciones("")
        setMostrarDropdownProducto(false)
        setEditandoArticuloId(null)
        setShowAgregarArticulo(false)
    }

    const agregarItem = () => {
        if (!productoSeleccionado) return

        if (editandoArticuloId) {
            setItems(items.map(i => i.id === editandoArticuloId ? {
                ...i,
                productoId: productoSeleccionado.id,
                productoNombre: productoSeleccionado.nombre,
                productoCategoria: productoSeleccionado.categoria,
                productoPrecio: Number(productoSeleccionado.precio) || 0,
                cantidad: Number(itemCantidad) || 0,
                tipo: itemTipo,
                indicacionesCorte: itemIndicaciones
            } : i))
        } else {
            const nuevoItem: ItemPedido = {
                id: Date.now().toString(),
                productoId: productoSeleccionado.id,
                productoNombre: productoSeleccionado.nombre,
                productoCategoria: productoSeleccionado.categoria,
                productoPrecio: Number(productoSeleccionado.precio) || 0,
                cantidad: Number(itemCantidad) || 0,
                tipo: itemTipo,
                indicacionesCorte: itemIndicaciones
            }
            setItems([...items, nuevoItem])
        }

        resetArticuloForm()
    }

    const duplicarItem = (item: ItemPedido) => {
        setItems([...items, { ...item, id: Date.now().toString() }])
    }

    const eliminarItem = (id: string) => {
        setItems(items.filter(i => i.id !== id))
    }

    const agregarPorMonto = async () => {
        const monto = parseFloat(montoValue)
        if (isNaN(monto) || monto <= 0) return
        try {
            const res = await fetch("/api/productos?search=D-10-001", { credentials: "include" })
            const json = await res.json()
            if (!json.success || json.productos.length === 0) {
                setToastMessage({ show: true, message: "Producto D-10-001 no encontrado", type: "error" })
                return
            }
            const producto = json.productos.find((p: any) => p.categoria === "MANCHESTER SUITING") || json.productos[0]
            const precio = 20.00
            const cantidad = Math.round((monto / precio) * 1000000) / 1000000
            setItems([...items, {
                id: Date.now().toString(),
                productoId: producto.id,
                productoNombre: "D-10-001",
                productoCategoria: producto.categoria,
                productoPrecio: precio,
                cantidad,
                tipo: "metros" as const,
                indicacionesCorte: ""
            }])
            setShowMontoModal(false)
            setMontoValue("")
        } catch (e) {
            console.error("Error buscando D-10-001:", e)
            setToastMessage({ show: true, message: "Error al buscar producto", type: "error" })
        }
    }

    const editarArticulo = (item: ItemPedido) => {
        setEditandoArticuloId(item.id)
        setProductoSeleccionado({
            id: item.productoId,
            nombre: item.productoNombre,
            categoria: item.productoCategoria,
            precio: item.productoPrecio,
            stocks: []
        })
        setItemCantidad(item.cantidad.toString())
        setItemTipo(item.tipo as "metros" | "pieza")
        setItemIndicaciones(item.indicacionesCorte || "")
        setShowAgregarArticulo(true)
    }

    const calcularSubtotal = () => {
        const raw = items.reduce((sum, item) => {
            const precio = Number(item.productoPrecio) || 0
            const cantidad = Number(item.cantidad) || 0
            const metros = item.tipo === "pieza" ? 50 : 1
            return sum + (precio * cantidad * metros)
        }, 0)
        return Math.round(raw * 100) / 100
    }

    const calcularTotal = () => {
        const raw = calcularSubtotal() + (Number(costoEnvio) || 0)
        return Math.round(raw * 100) / 100
    }

    const validarDocumento = (): string | null => {
        const doc = cliente.numeroDoc
        if (!doc) { setErrorDoc("Número de documento requerido"); return "Número de documento requerido" }
        if (!/^\d+$/.test(doc)) { setErrorDoc("El documento solo puede contener números"); return "El documento solo puede contener números" }
        if (cliente.tipoDoc === "dni" && doc.length !== 8) { setErrorDoc("DNI debe tener exactamente 8 dígitos"); return "DNI debe tener exactamente 8 dígitos" }
        if (cliente.tipoDoc === "ruc" && doc.length !== 11) { setErrorDoc("RUC debe tener exactamente 11 dígitos"); return "RUC debe tener exactamente 11 dígitos" }
        if (cliente.tipoDoc === "ce" && doc.length < 4) { setErrorDoc("CE debe tener al menos 4 dígitos"); return "CE debe tener al menos 4 dígitos" }
        setErrorDoc("")
        return null
    }

    const validarTelefono = (): string | null => {
        const tel = cliente.telefono
        if (!tel) { setErrorTel(""); return null }
        if (!/^\d+$/.test(tel)) { setErrorTel("El teléfono solo puede contener números"); return "El teléfono solo puede contener números" }
        if (tel.length !== 9) { setErrorTel("Teléfono debe tener exactamente 9 dígitos"); return "Teléfono debe tener exactamente 9 dígitos" }
        setErrorTel("")
        return null
    }

    const crearPedido = async () => {
        if (isSubmittingRef.current) return
        if (!cliente.nombre || !cliente.numeroDoc || items.length === 0) {
            setToastMessage({ show: true, message: "Complete todos los campos requeridos", type: "error" })
            return
        }

        const errorDoc = validarDocumento()
        if (errorDoc) {
            setToastMessage({ show: true, message: errorDoc, type: "error" })
            return
        }

        const errorTel = validarTelefono()
        if (errorTel) {
            setToastMessage({ show: true, message: errorTel, type: "error" })
            return
        }

        isSubmittingRef.current = true
        setLoading(true)
        try {
            if (pedidoEditar) {
                const bodyData: any = {
                    empresa,
                    metodoPago,
                    cliente: {
                        nombre: cliente.nombre,
                        tipoDoc: cliente.tipoDoc,
                        numeroDoc: cliente.numeroDoc,
                        razonSocial: cliente.razonSocial,
                        direccion: cliente.direccion,
                        telefono: cliente.telefono,
                        departamento: cliente.departamento || null,
                        provincia: cliente.provincia || null,
                        distrito: cliente.distrito || null,
                        agenciaOtro
                    },
                    agencia,
                    guiaRemision,
                    nombreRecibe,
                    dniRecibe,
                    celularRecibe,
                    envioComprobante,
                    costoEnvio: Number(costoEnvio) || 0,
                    observaciones,
                    items: items.map(i => ({
                        detalleId: i.id,
                        productoId: i.productoId,
                        cantidad: i.cantidad,
                        tipo: i.tipo,
                        precio: i.productoPrecio,
                        indicacionesCorte: i.indicacionesCorte
                    }))
                }
                if (pagoConfirmado) bodyData.estado = "confirmado"
                const res = await fetch(`/api/pedidos/${pedidoEditar.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bodyData),
                    credentials: "include"
                })
                const json = await res.json()
                if (json.success) {
                    setSuccessOverlay({ show: true, numeroOrden: pedidoEditar.numeroOrden, action: "actualizado" })
                } else {
                    setToastMessage({ show: true, message: json.error || "Error al actualizar pedido", type: "error" })
                }
            } else {
                const bodyData: any = {
                    empresa,
                    metodoPago,
                    cliente: {
                        nombre: cliente.nombre,
                        tipoDoc: cliente.tipoDoc,
                        numeroDoc: cliente.numeroDoc,
                        razonSocial: cliente.razonSocial,
                        direccion: cliente.direccion,
                        telefono: cliente.telefono,
                        departamento: cliente.departamento || null,
                        provincia: cliente.provincia || null,
                        distrito: cliente.distrito || null,
                        agenciaOtro
                    },
                    agencia,
                    guiaRemision,
                    nombreRecibe,
                    dniRecibe,
                    celularRecibe,
                    envioComprobante,
                    costoEnvio: Number(costoEnvio) || 0,
                    observaciones,
                    items: items.map(i => ({
                        productoId: i.productoId,
                        cantidad: i.cantidad,
                        tipo: i.tipo,
                        precio: i.productoPrecio,
                        indicacionesCorte: i.indicacionesCorte
                    }))
                }
                if (adjuntarDeuda && saldoCartera !== null && saldoCartera < 0) {
                    bodyData.cargoDeuda = Math.abs(saldoCartera)
                    bodyData.observaciones = (bodyData.observaciones || "") + `\n[Cargo por deuda: S/ ${Math.abs(saldoCartera).toFixed(2)}]`
                }
                if (pagoConfirmado) bodyData.estado = "confirmado"
                const res = await fetch("/api/pedido-empleado", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bodyData),
                credentials: "include"
            })
            const json = await res.json()
            if (json.success) {
                await limpiarBorrador()
                setSuccessOverlay({ show: true, numeroOrden: json.pedido.numeroOrden, action: "creado" })
            } else {
                setToastMessage({ show: true, message: json.error || "Error al crear pedido", type: "error" })
            }
            }
        } catch (e) {
            console.error("Error:", e)
            setToastMessage({ show: true, message: "Error al crear pedido", type: "error" })
        } finally {
            isSubmittingRef.current = false
            setLoading(false)
        }
    }

    const resetForm = () => {
        setStep(1)
        setEmpresa("")
        setMetodoPago("")
        setClienteBusqueda("")
        setCliente({ nombre: "", tipoDoc: "dni", numeroDoc: "", direccion: "", telefono: "" })
        setErrorDoc("")
        setErrorTel("")
        setAgencia("")
        setAgenciaOtro("")
        setAgenciaBusqueda("")
        setGuiaRemision(false)
        setMostrarRecibe(false)
        setNombreRecibe("")
        setDniRecibe("")
        setCelularRecibe("")
        setItems([])
        setCostoEnvio("0")
        setObservaciones("")
        setBorradorGuardado(false)
        setCategoriaFiltro("")
        setShowAgregarArticulo(false)
        setShowMontoModal(false)
        setMontoValue("")
        setCurrentDraftId(null)
    }

    const guardarBorrador = async () => {
        try {
            const method = currentDraftId ? "PUT" : "POST"
            const url = currentDraftId ? `/api/borrador-pedido?id=${currentDraftId}` : "/api/borrador-pedido"
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    nombre: cliente.nombre || "Sin nombre",
                    empresa, metodoPago, cliente, agencia, agenciaOtro,
                    guiaRemision, envioComprobante, costoEnvio, observaciones, items, step
                })
            })
            const json = await res.json()
            if (json.success) {
                setCurrentDraftId(json.borrador.id)
                setBorradorGuardado(true)
                setToastMessage({ show: true, message: "Borrador guardado", type: "success" })
            }
        } catch (e) {
            console.error("Error guardando borrador:", e)
            setToastMessage({ show: true, message: "Error al guardar borrador", type: "error" })
        }
    }

    const cargarBorrador = async () => {
        try {
            const res = await fetch("/api/borrador-pedido", { credentials: "include" })
            const json = await res.json()
            if (json.success && json.borradores?.length > 0) {
                const b = json.borradores[0]
                setCurrentDraftId(b.id)
                setEmpresa(b.empresa || "")
                setMetodoPago(b.metodoPago || "")
                setCliente(b.cliente || { nombre: "", tipoDoc: "dni", numeroDoc: "", direccion: "", telefono: "" })
                setAgencia(b.agencia || "")
                setAgenciaOtro(b.agenciaOtro || "")
                setGuiaRemision(b.guiaRemision || false)
                setEnvioComprobante(b.envioComprobante || "No imprimir")
                setCostoEnvio(b.costoEnvio || "0")
                setObservaciones(b.observaciones || "")
                setItems(b.items || [])
                setStep(b.step || 1)
                setBorradorGuardado(true)
            }
        } catch (e) {
            console.error("Error cargando borrador:", e)
        }
    }

    const limpiarBorrador = async () => {
        try {
            if (currentDraftId) {
                await fetch(`/api/borrador-pedido?id=${currentDraftId}`, { method: "DELETE", credentials: "include" })
                setCurrentDraftId(null)
            }
            setBorradorGuardado(false)
        } catch (e) {
            console.error("Error eliminando borrador:", e)
        }
    }

    const isFormDirty = () => {
        return !!(empresa || metodoPago || cliente.nombre || cliente.numeroDoc ||
            cliente.direccion || cliente.telefono || agencia || items.length > 0 || observaciones || envioComprobante !== "No imprimir")
    }

    const handleClose = () => {
        if (isFormDirty()) {
            setShowConfirmClose(true)
        } else {
            onClose()
        }
    }

    if (!isOpen) return null

    const inputBase = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
    const inputStep1 = "w-full px-3 py-2.5 border-2 border-blue-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
    const labelBase = "flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5"

    const provincias = DEPARTAMENTOS.find(d => d.nombre === cliente.departamento)?.provincias || []
    const distritos = provincias.find(p => p.nombre === cliente.provincia)?.distritos || []

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-0 sm:p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={handleClose} />
            <div className="relative bg-white w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="bg-slate-700 border-b border-slate-600 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 1 ? "bg-slate-900 text-white" : "bg-slate-600 text-slate-200"}`}>1</div>
                            <div className="w-8 h-px bg-slate-500" />
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 2 ? "bg-slate-900 text-white" : "bg-slate-600 text-slate-200"}`}>2</div>
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-white">{pedidoEditar ? "Editar Pedido" : "Crear Pedido"}</h2>
                            <p className="text-xs text-slate-300">{pedidoEditar ? (pedidoEditar.numeroOrden || "") : step === 1 ? "Datos del cliente" : "Artículos y total"}</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="flex items-center gap-1.5 px-3 py-1.5 border-2 border-red-600 bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">
                        <X className="h-5 w-5 text-amber-400" strokeWidth={3} />
                        <span className="text-sm font-bold text-amber-400">Cerrar</span>
                    </button>
                </div>

                {/* Toast */}
                {toastMessage.show && (
                    <div className="fixed top-4 right-4 z-[10000]">
                        <div className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
                            toastMessage.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"
                        }`}>
                            {toastMessage.message}
                        </div>
                    </div>
                )}

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-4 sm:p-6">
                        {step === 1 ? (
                            <div className="space-y-5">
                                {/* Empresa */}
                                <div>
                                    <p className={labelBase}><Building2 className="h-3.5 w-3.5" /> Empresa</p>
                                    <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
                                        {EMPRESAS.map(emp => (
                                            <button
                                                key={emp}
                                                onClick={() => {
                                                    setEmpresa(emp);
                                                    if (emp === "YAPE CARLOS" || emp === "YAPE ANGEL") {
                                                        setMetodoPago("YAPE");
                                                    }
                                                }}
                                                className={`px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all whitespace-normal ${
                                                    empresa === emp 
                                                        ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                                                        : "border-blue-300 text-slate-600 hover:border-blue-400 hover:bg-blue-50"
                                                }`}
                                            >
                                                {emp.split(" ").map((w, wi) => (
                                                    <span key={wi}>
                                                        {wi > 0 && " "}
                                                        {w.length > 9 ? <>{w.slice(0, 10)}<br />{w.slice(10)}</> : w}
                                                    </span>
                                                ))}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Método de pago */}
                                <div>
                                    <p className={labelBase}><CreditCard className="h-3.5 w-3.5" /> Método de Pago</p>
                                    <div className="flex flex-wrap gap-2">
                                        {METODOS_PAGO.map(mp => (
                                            <button
                                                key={mp}
                                                onClick={() => setMetodoPago(mp)}
                                                className={`px-3 py-1.5 border-2 rounded-lg text-sm font-medium transition-all break-words whitespace-normal ${
                                                    metodoPago === mp 
                                                        ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                                                        : "border-blue-300 text-slate-600 hover:border-blue-400 hover:bg-blue-50"
                                                }`}
                                            >
                                                {mp}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Restaurar borrador */}
                                {borradorGuardado && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Save className="h-4 w-4 text-blue-600 shrink-0" />
                                            <p className="text-sm text-blue-700 font-medium">Borrador guardado</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => { cargarBorrador(); setToastMessage({ show: true, message: "Borrador restaurado", type: "success" }) }}
                                                className="text-xs text-blue-600 hover:text-blue-800 underline font-medium"
                                            >
                                                Restaurar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={limpiarBorrador}
                                                className="text-xs text-slate-400 hover:text-slate-600 underline"
                                            >
                                                Descartar
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Divider */}
                                <div className="border-t border-slate-100" />

                                {/* Buscar cliente */}
                                <div className="bg-slate-200 p-4 rounded-xl">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <p className={labelBase}><User className="h-3.5 w-3.5" /> Buscar Cliente</p>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`/api/cliente-buscar?q=${encodeURIComponent("CLIENTE GENERAL")}`, { credentials: "include" })
                                                    const json = await res.json()
                                                    if (json.success && json.clientes?.length > 0) {
                                                        seleccionarCliente(json.clientes[0])
                                                    }
                                                } catch (e) {
                                                    console.error("Error buscando CLIENTE GENERAL:", e)
                                                }
                                                setClienteBusqueda("")
                                                setClientesEncontrados([])
                                                setMostrarDropdown(false)
                                            }}
                                            className="px-2 py-1 text-xs font-bold border-2 rounded-lg uppercase bg-amber-300 border-amber-400 text-black hover:bg-amber-400 transition-all whitespace-nowrap"
                                        >
                                            CLIENTE GENERAL
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                        <input
                                            type="text"
                                            data-cliente-input
                                            value={clienteBusqueda}
                                            onChange={(e) => {
                                                const val = e.target.value
                                                setClienteBusqueda(val)
                                                if (val.length < 2) {
                                                    setClientesEncontrados([])
                                                    setMostrarDropdown(false)
                                                }
                                            }}
                                            onFocus={() => {
                                                if (clientesEncontrados.length > 0 || clienteBusqueda.length >= 2) {
                                                    setMostrarDropdown(true)
                                                }
                                            }}
                                            placeholder="Nombre, RUC o DNI..."
                                            className={`${inputStep1} pl-10 pr-10`}
                                        />
                                        {buscandoCliente && (
                                            <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-slate-400" />
                                        )}
                                        {clienteBusqueda && !buscandoCliente && (
                                            <button
                                                onClick={() => {
                                                    setClienteBusqueda("")
                                                    setClientesEncontrados([])
                                                    setMostrarDropdown(false)
                                                }}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                        {mostrarDropdown && (
                                            <div data-cliente-dropdown className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                                                {clientesEncontrados.length > 0 ? (
                                                    clientesEncontrados.map(c => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            onClick={() => seleccionarCliente(c)}
                                                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors"
                                                        >
                                                            <p className="font-medium text-slate-900 text-sm">{c.nombre}</p>
                                                            <p className="text-xs text-slate-400">{c.numeroDoc}{c.telefono ? ` • ${c.telefono}` : ""}</p>
                                                        </button>
                                                    ))
                                                ) : !buscandoCliente && clienteBusqueda.length >= 2 ? (
                                                    <div className="px-4 py-3 text-sm text-slate-400 text-center">
                                                        No se encontraron clientes
                                                    </div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                    {(clienteBusqueda || cliente.nombre || cliente.numeroDoc) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setClienteBusqueda("")
                                                setClientesEncontrados([])
                                                setMostrarDropdown(false)
                                                setCliente({ nombre: "", tipoDoc: "dni", numeroDoc: "", direccion: "", telefono: "", departamento: "", provincia: "", distrito: "" })
                                                setErrorDoc("")
                                                setErrorTel("")
                                                setAgencia("")
                                                setAgenciaOtro("")
                                                setGuiaRemision(false)
                                                setEnvioComprobante("Imprimir")
                                                setClientePedidoId("")
                                                setSaldoCartera(null)
                                                setAdjuntarDeuda(false)
                                            }}
                                            className="mt-2 text-xs text-slate-500 hover:text-slate-700 underline flex items-center gap-1"
                                        >
                                            Limpiar todo
                                        </button>
                                    )}

                                    {saldoCartera !== null && saldoCartera < 0 && (
                                        <div className="mt-3 px-4 py-3 bg-amber-50 border border-amber-300 rounded-lg flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                                                <input
                                                    type="checkbox"
                                                    checked={adjuntarDeuda}
                                                    onChange={(e) => setAdjuntarDeuda(e.target.checked)}
                                                    className="rounded border-amber-400 text-amber-700 focus:ring-amber-500 h-4 w-4"
                                                />
                                                <span className="text-sm text-amber-900 font-medium">
                                                    Deuda S/ {Math.abs(saldoCartera).toFixed(2)} — adjuntar cargo al pedido
                                                </span>
                                            </label>
                                        </div>
                                    )}
                                </div>

                                {/* Datos del cliente */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="flex gap-2">
                                        <div className="w-20 shrink-0">
                                            <label className={labelBase}>Tipo</label>
                                            <select
                                                value={cliente.tipoDoc}
                                                onChange={(e) => {
                                                    setCliente({ ...cliente, tipoDoc: e.target.value, numeroDoc: "" })
                                                    setErrorDoc("")
                                                }}
                                                className={inputStep1}
                                            >
                                                <option value="dni">DNI</option>
                                                <option value="ruc">RUC</option>
                                                <option value="ce">CE</option>
                                            </select>
                                        </div>
                                        <div className="flex-1">
                                            <label className={labelBase}>Número</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={cliente.numeroDoc}
                                                onChange={(e) => {
                                                    const val = e.target.value
                                                    if (val === "" || /^\d+$/.test(val)) {
                                                        setCliente({ ...cliente, numeroDoc: val })
                                                        setErrorDoc("")
                                                    }
                                                }}
                                                    maxLength={cliente.tipoDoc === "dni" ? 8 : cliente.tipoDoc === "ruc" ? 11 : 20}
                                                    className={`${inputStep1} w-[30%]`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={buscarPorDocumento}
                                                    disabled={buscandoDoc || !cliente.numeroDoc}
                                                    className="flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                                >
                                                    {buscandoDoc ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Search className="h-3.5 w-3.5" />
                                                    )}
                                                    Buscar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                            <label className={labelBase}>Nombre / Razón Social</label>
                                            <input
                                                type="text"
                                                value={cliente.nombre}
                                                onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                                                className={inputStep1}
                                            />
                                        </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <label className={labelBase}>Dirección</label>
                                        <input
                                            type="text"
                                            value={cliente.direccion}
                                            onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                                            className={inputStep1}
                                        />
                                    </div>
                                    <div className="col-span-1 sm:col-span-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className={labelBase}>Departamento</label>
                                                <select
                                                    className={inputStep1}
                                                    value={cliente.departamento}
                                                    onChange={(e) => setCliente({ ...cliente, departamento: e.target.value, provincia: "", distrito: "" })}
                                                >
                                                    <option value="">Seleccionar</option>
                                                    {DEPARTAMENTOS.map(d => (
                                                        <option key={d.nombre} value={d.nombre}>{d.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelBase}>Provincia</label>
                                                <select
                                                    className={inputStep1}
                                                    value={cliente.provincia}
                                                    onChange={(e) => setCliente({ ...cliente, provincia: e.target.value, distrito: "" })}
                                                    disabled={!cliente.departamento}
                                                >
                                                    <option value="">Seleccionar</option>
                                                    {provincias.map(p => (
                                                        <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelBase}>Distrito</label>
                                                <select
                                                    className={inputStep1}
                                                    value={cliente.distrito}
                                                    onChange={(e) => setCliente({ ...cliente, distrito: e.target.value })}
                                                    disabled={!cliente.provincia}
                                                >
                                                    <option value="">Seleccionar</option>
                                                    {distritos.map(d => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelBase}><Phone className="h-3.5 w-3.5" /> Teléfono</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-[40%]">
                                                <button
                                                    type="button"
                                                    data-empleados-toggle
                                                    onClick={() => {
                                                        if (!mostrarDropdownEmpleados) cargarTelefonosEmpleados()
                                                        setMostrarDropdownEmpleados(!mostrarDropdownEmpleados)
                                                    }}
                                                    className="w-full h-full px-3 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap flex items-center justify-center gap-1.5"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    VER TELEFONOS
                                                </button>
                                                {mostrarDropdownEmpleados && (
                                                    <div data-empleados-dropdown className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg min-w-[220px] max-h-48 overflow-y-auto z-50">
                                                        {cargandoEmpleados ? (
                                                            <div className="px-4 py-3 text-sm text-slate-400">Cargando...</div>
                                                        ) : empleadosTelefonos.length === 0 ? (
                                                            <div className="px-4 py-3 text-sm text-slate-400">Sin teléfonos registrados</div>
                                                        ) : (
                                                            empleadosTelefonos.map(emp => (
                                                                <button
                                                                    key={emp.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setCliente({ ...cliente, telefono: emp.celular || "" })
                                                                        setMostrarDropdownEmpleados(false)
                                                                    }}
                                                                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors"
                                                                >
                                                                    <p className="font-medium text-slate-900 text-sm">{emp.nombre}</p>
                                                                    <p className="text-xs text-slate-400">{emp.celular}</p>
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-[60%]">
                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={cliente.telefono}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        if (val === "" || /^\d+$/.test(val)) {
                                                            setCliente({ ...cliente, telefono: val })
                                                            setErrorTel("")
                                                        }
                                                    }}
                                                    maxLength={9}
                                                    className={inputStep1}
                                                />
                                            </div>
                                        </div>
                                        {errorTel && <p className="text-xs text-red-500 mt-1">{errorTel}</p>}
                                    </div>
                                    <div className="bg-slate-200 p-4 rounded-xl space-y-3">
                                        <div>
                                            <label className={labelBase}>Agencia</label>
                                            <div className="relative">
                                                <button
                                                    type="button"
                                                    ref={agenciaToggleRef}
                                                    data-agencia-toggle
                                                    onClick={() => {
                                                        if (!mostrarDropdownAgencia && agenciaToggleRef.current) {
                                                            const rect = agenciaToggleRef.current.getBoundingClientRect()
                                                            setAgenciaDropdownPos({ top: rect.top - 4, left: rect.left, width: rect.width })
                                                        }
                                                        setMostrarDropdownAgencia(!mostrarDropdownAgencia)
                                                    }}
                                                    className={`w-full px-3 py-2.5 border-2 rounded-lg text-sm text-left transition-all bg-white ${agencia ? "text-slate-900 border-blue-300" : "text-slate-900 border-blue-300"}`}
                                                >
                                                    {agencia ? AGENCIAS.find(a => a.value === agencia)?.label : "SELECCIONAR AGENCIA"}
                                                </button>
                                            </div>
                                        </div>
                                        {agencia === "otros" && (
                                            <div>
                                                <label className={labelBase}>Nombre de la agencia</label>
                                                <input
                                                    type="text"
                                                    value={agenciaOtro}
                                                    onChange={(e) => setAgenciaOtro(e.target.value)}
                                                    className={inputStep1}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2 sm:col-span-2">
                                        <button
                                            type="button"
                                            onClick={() => setGuiaRemision(!guiaRemision)}
                                            className={`w-18 h-8 rounded-full transition-colors relative shrink-0 ${guiaRemision ? "bg-blue-600" : "bg-slate-300"}`}
                                        >
                                            <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform shadow-sm ${guiaRemision ? "translate-x-10" : "translate-x-1"}`} />
                                        </button>
                                        <span className="text-sm text-slate-600">GUÍA DE REMISIÓN</span>
                                        <div className="flex-1" />
                                        <button
                                            type="button"
                                            onClick={() => setMostrarRecibe(!mostrarRecibe)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border-2 ${
                                                mostrarRecibe
                                                    ? "bg-amber-300 text-black shadow-sm"
                                                    : "bg-amber-300 text-black shadow-sm"
                                            }`}
                                        >
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            RECIBE OTRA PERSONA
                                        </button>
                                    </div>
                                    {mostrarRecibe && (
                                        <div className="flex-1 sm:col-span-2 space-y-3">
                                            <label className={labelBase}>DNI</label>
                                            <div className="flex gap-2 ">
                                                <div className="w-full">
                                                    <input
                                                        type="text"
                                                        placeholder="DNI (8 dígitos)"
                                                        value={dniRecibe}
                                                        onChange={(e) => setDniRecibe(e.target.value.replace(/\D/g, "").slice(0, 8))}
                                                        maxLength={8}
                                                        className={inputStep1}
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={buscarDocRecibe}
                                                    disabled={buscandoDocRecibe || dniRecibe.length < 8}
                                                    className="flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                                                >
                                                    {buscandoDocRecibe ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <Search className="h-3.5 w-3.5" />
                                                    )}
                                                    Buscar
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className={labelBase}>Nombre completo</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Nombre de quien recibe"
                                                        value={nombreRecibe}
                                                        onChange={(e) => setNombreRecibe(e.target.value)}
                                                        className={inputStep1}
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelBase}>Celular</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Celular (opcional)"
                                                        value={celularRecibe}
                                                        onChange={(e) => setCelularRecibe(e.target.value.replace(/\D/g, "").slice(0, 9))}
                                                        maxLength={9}
                                                        className={inputStep1}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="sm:col-span-2">
                                        <p className={labelBase}><Printer className="h-3.5 w-3.5" /> Envío de comprobante</p>
                                        <div className="flex gap-3">
                                            {[
                                                { value: "Imprimir", label: "Imprimir", icon: Printer },
                                                { value: "PDF", label: "PDF", icon: FileText },
                                                { value: "No imprimir", label: "No imprimir", icon: Ban }
                                            ].map(op => {
                                                const Icon = op.icon
                                                return (
                                                    <button
                                                        key={op.value}
                                                        type="button"
                                                        onClick={() => setEnvioComprobante(op.value)}
                                                        className={`flex-1 flex flex-col items-center gap-1.5 px-4 py-3 border-2 rounded-xl text-xs font-semibold transition-all ${
                                                            envioComprobante === op.value
                                                                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                                                : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        <Icon className="h-6 w-6" />
                                                        {op.label}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                            {errorDoc && <p className="text-xs text-red-500 mt-1">{errorDoc}</p>}
                                        </div>
                                    </div>
                        ) : (
                            <div className="space-y-5">
                                {/* Agregar producto */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setBusquedaProducto("")
                                        setProductosEncontrados([])
                                        setMostrarDropdownProducto(false)
                                        setProductoSeleccionado(null)
                                        setItemCantidad("1")
                                        setItemTipo("metros")
                                        setItemIndicaciones("")
                                        setShowAgregarArticulo(true)
                                    }}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <Plus className="h-5 w-5" />
                                    Agregar Artículo
                                </button>

                                {/* Lista de items */}
                                {items.length > 0 ? (
                                    <div>
                                        <p className={labelBase}><ClipboardList className="h-3.5 w-3.5" /> Artículos ({items.length})</p>
                                        {/* Desktop table */}
                                        <div className="hidden sm:block border border-slate-100 rounded-xl overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50/80">
                                                    <tr>
                                                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Artículo</th>
                                                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Cant.</th>
                                                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                                                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">P.Unit.</th>
                                                        <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>
                                                        <th className="px-4 py-2.5 w-10"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map((item, idx) => {
                                                        const metros = item.tipo === "pieza" ? 50 : 1
                                                        const subtotal = item.productoPrecio * item.cantidad * metros
                                                        return (
                                                            <tr key={item.id} className={`border-t border-slate-50 hover:bg-slate-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center gap-2 mb-0.5">
                                                                        <span className="inline-flex px-1.5 py-0.5 bg-slate-600 text-white rounded text-[10px] font-bold shrink-0">{item.productoCategoria}</span>
                                                                        <p className="font-bold text-slate-900 text-sm truncate">{item.productoNombre}</p>
                                                                    </div>
                                                                    {item.indicacionesCorte && (
                                                                        <p className="text-xs text-amber-600 mt-0.5 truncate max-w-[200px]" title={item.indicacionesCorte}>{item.indicacionesCorte}</p>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className="text-lg font-bold text-slate-900">{item.cantidad}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${item.tipo === "pieza" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                                                                        {item.tipo === "pieza" ? "Pieza" : "Metros"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <span className="text-lg font-bold text-slate-900">S/ {item.productoPrecio.toFixed(2)} /mts</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right font-semibold text-slate-900">S/ {subtotal.toFixed(2)}</td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button onClick={() => duplicarItem(item)} className="p-1.5 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Duplicar">
                                                                            <Copy className="h-4 w-4" />
                                                                        </button>
                                                                        <button onClick={() => editarArticulo(item)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                                                            <Pencil className="h-4 w-4" />
                                                                        </button>
                                                                        <button onClick={() => eliminarItem(item.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        {/* Mobile cards */}
                                        <div className="sm:hidden space-y-2">
                                            {items.map(item => {
                                                const metros = item.tipo === "pieza" ? 50 : 1
                                                const subtotal = item.productoPrecio * item.cantidad * metros
                                                return (
                                                    <div key={item.id} className="bg-white border border-slate-100 rounded-lg p-3">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-0.5">
                                                                    <span className="inline-flex px-1.5 py-0.5 bg-slate-600 text-white rounded text-[10px] font-bold shrink-0">{item.productoCategoria}</span>
                                                                    <p className="font-bold text-slate-900 text-sm truncate">{item.productoNombre}</p>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-sm font-bold text-slate-900">{item.cantidad} {item.tipo === "pieza" ? "pieza(s)" : "metro(s)"}</span>
                                                                    <span className="text-xs text-slate-300">•</span>
                                                                    <span className="text-sm font-bold text-slate-900">S/ {item.productoPrecio.toFixed(2)} /mts</span>
                                                                </div>
                                                                {item.indicacionesCorte && (
                                                                    <p className="text-xs text-amber-600 mt-1 truncate">{item.indicacionesCorte}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col items-end gap-1">
                                                                <p className="font-semibold text-slate-900 text-sm">S/ {subtotal.toFixed(2)}</p>
                                                                <div className="flex gap-1">
                                                                    <button onClick={() => duplicarItem(item)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors" title="Duplicar">
                                                                        <Copy className="h-4 w-4" />
                                                                    </button>
                                                                    <button onClick={() => editarArticulo(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                                                        <Pencil className="h-4 w-4" />
                                                                    </button>
                                                                    <button onClick={() => eliminarItem(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-slate-400">
                                        <Package className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                                        <p className="text-sm">Sin artículos agregados</p>
                                    </div>
                                )}

                                {/* Totales */}
                                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Subtotal</span>
                                            <span className="font-medium text-slate-900">S/ {calcularSubtotal().toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-end text-sm items-center gap-2">
                                            <span className="font-semibold text-amber-500">COSTO DE ENVIO</span>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-slate-400">S/</span>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={costoEnvio}
                                                    onChange={(e) => {
                                                        const val = e.target.value
                                                        if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                                            setCostoEnvio(val)
                                                        }
                                                    }}
                                                    placeholder="0.00"
                                                    className="w-20 px-2 py-1.5 border border-slate-200 rounded text-right text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                            <span className="text-base font-bold text-slate-900">Total</span>
                                            <span className="text-xl font-bold text-slate-900">S/ {calcularTotal().toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Agregar por Monto */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setMontoValue("")
                                        setShowMontoModal(true)
                                    }}
                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    <DollarSign className="h-4 w-4" />
                                    Agregar por Monto
                                </button>

                                {/* Observaciones */}
                                <div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className={labelBase}><FileText className="h-3.5 w-3.5" /> Observaciones</p>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const texto = "DIVIDIR ENTRE 18"
                                                setObservaciones(prev => prev ? `${prev}\n${texto}` : texto)
                                            }}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                                        >
                                            <Ruler className="h-3 w-3" />
                                            DIVIDIR ENTRE 18
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const texto = "ENVIO: A DOMICILIO"
                                                setObservaciones(prev => prev ? `${prev}\n${texto}` : texto)
                                            }}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
                                        >
                                            <Truck className="h-3 w-3" />
                                            ENVIO: A DOMICILIO
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const texto = "EN VARIAS FACTURAS"
                                                setObservaciones(prev => prev ? `${prev}\n${texto}` : texto)
                                            }}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                                        >
                                            <FileText className="h-3 w-3" />
                                            EN VARIAS FACTURAS
                                        </button>
                                    </div>
                                    <textarea
                                        value={observaciones}
                                        onChange={(e) => setObservaciones(e.target.value)}
                                        rows={2}
                                        className={`${inputBase} resize-none`}
                                        placeholder="Notas adicionales..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sticky Footer */}
                <div className="border-t border-slate-600 bg-slate-700 px-4 sm:px-6 py-3 pb-4 sm:pb-3 shrink-0">
                    <div className="flex items-center justify-between gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => step === 1 ? handleClose() : setStep(1)} 
                            className="text-slate-200 border-slate-500 hover:bg-slate-600 text-sm h-9 px-3"
                        >
                            {step === 1 ? (
                                "Cancelar"
                            ) : (
                                <><ArrowLeft className="h-4 w-4 mr-1" /> Atrás</>
                            )}
                        </Button>
                        {step === 2 && (
                            <div className="flex items-center gap-2">
                                <Button 
                                    onClick={crearPedido} 
                                    disabled={loading || items.length === 0} 
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-9 px-4 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : pedidoEditar ? (
                                        <><Check className="h-4 w-4 mr-1" /> Actualizar Pedido</>
                                    ) : (
                                        <><Check className="h-4 w-4 mr-1" /> Crear Pedido</>
                                    )}
                                </Button>
                            </div>
                        )}
                        {step === 1 && (
                            <Button
                                onClick={() => setStep(2)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-9 px-4 font-medium transition-all"
                            >
                                Siguiente <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {mostrarDropdownAgencia && agenciaDropdownPos && (
                <div
                    data-agencia-dropdown
                    className="bg-white border border-slate-200 rounded-lg shadow-lg z-[10001] min-w-[200px]"
                    style={{ position: "fixed", top: agenciaDropdownPos.top, left: agenciaDropdownPos.left, width: agenciaDropdownPos.width, transform: "translateY(-100%)" }}
                >
                    <div className="p-2 border-b border-slate-100">
                        <input
                            type="text"
                            value={agenciaBusqueda}
                            onChange={(e) => setAgenciaBusqueda(e.target.value)}
                            placeholder="Buscar agencia..."
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-[280px] overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => { setAgencia(""); setMostrarDropdownAgencia(false); setAgenciaBusqueda("") }}
                            className="w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors text-sm text-slate-900 font-medium"
                        >
                            SELECCIONAR AGENCIA
                        </button>
                        {AGENCIAS.filter(a => a.label.toLowerCase().includes(agenciaBusqueda.toLowerCase())).map(a => (
                            <button
                                key={a.value}
                                type="button"
                                    onClick={() => { setAgencia(a.value); setGuiaRemision(true); setMostrarDropdownAgencia(false); setAgenciaBusqueda("") }}
                                className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors text-sm ${agencia === a.value ? "bg-slate-50 font-medium text-slate-900" : "text-slate-700"}`}
                            >
                                {a.label}
                            </button>
                        ))}
                        {AGENCIAS.filter(a => a.label.toLowerCase().includes(agenciaBusqueda.toLowerCase())).length === 0 && (
                            <p className="px-4 py-3 text-sm text-slate-400 text-center">Sin resultados</p>
                        )}
                    </div>
                </div>
            )}

            {/* Confirmación de cierre */}
            {showConfirmClose && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60" onClick={() => setShowConfirmClose(false)} />
                    <div className="relative bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 text-lg">¿Estás seguro de salir?</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-6">
                            <Button onClick={async () => { await limpiarBorrador(); resetForm(); setShowConfirmClose(false); onClose() }} className="w-full bg-amber-300 hover:bg-amber-400 text-black text-sm h-9">
                                Salir
                            </Button>
                            <Button onClick={() => setShowConfirmClose(false)} className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm h-9">
                                Conitnuar Editando
                            </Button>
                            <Button onClick={async () => { await guardarBorrador(); resetForm(); setShowConfirmClose(false); onClose() }} className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-sm h-9">
                                <Save className="h-4 w-4 mr-1" /> Guardar Borrador
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-modal agregar artículo */}
            {showAgregarArticulo && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40" onClick={() => resetArticuloForm()} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
                            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                {editandoArticuloId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />} {editandoArticuloId ? "Editar Artículo" : "Agregar Artículo"}
                            </p>
                            <button onClick={() => resetArticuloForm()} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {productoSeleccionado && (
                                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    <span className="inline-flex px-2 py-0.5 bg-slate-700 text-white rounded text-xs font-bold shrink-0">{productoSeleccionado.categoria}</span>
                                    <p className="font-bold text-slate-900 text-sm truncate">{productoSeleccionado.nombre}</p>
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative w-full sm:w-auto">
                                    <button
                                        type="button"
                                        data-categoria-toggle
                                        ref={categoriaToggleRef}
                                        onClick={() => setMostrarDropdownCategoria(!mostrarDropdownCategoria)}
                                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-1 px-2.5 py-2.5 border-1 rounded-lg text-xs font-semibold transition-all bg-slate-100 ${categoriaFiltro ? "border-blue-500 text-blue-500 bg-blue-50" : "border-blue-500 text-blue-500 hover:bg-blue-50"}`}
                                        title={categoriaFiltro || "Filtrar por Categoria"}
                                    >
                                        <Filter className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{categoriaFiltro || "Filtrar por Categoria"}</span>
                                    </button>
                                    {mostrarDropdownCategoria && (
                                        <div data-categoria-dropdown className="absolute top-full left-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg w-56 max-h-60 overflow-y-auto z-50">
                                            <button
                                                type="button"
                                                onClick={() => { setCategoriaFiltro(""); setMostrarDropdownCategoria(false) }}
                                                className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 transition-colors text-sm ${!categoriaFiltro ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700"}`}
                                            >
                                                Todas
                                            </button>
                                            {categoriasDisponibles.map(cat => (
                                                <button
                                                    key={cat}
                                                    type="button"
                                                    onClick={() => { setCategoriaFiltro(cat); setMostrarDropdownCategoria(false) }}
                                                    className={`w-full px-4 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 transition-colors text-sm ${categoriaFiltro === cat ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700"}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    <input
                                        type="text"
                                        data-producto-input
                                        value={busquedaProducto}
                                        onChange={(e) => setBusquedaProducto(e.target.value)}
                                        onFocus={() => {
                                            if (productosEncontrados.length > 0 || busquedaProducto.length >= 2) {
                                                setMostrarDropdownProducto(true)
                                            }
                                        }}
                                        placeholder="Buscar producto..."
                                        className="w-full pl-10 pr-10 px-3 py-2.5 border-2 border-blue-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                    />
                                    {busquedaProducto && (
                                        <button
                                            onClick={() => {
                                                setBusquedaProducto("")
                                                setProductosEncontrados([])
                                                setMostrarDropdownProducto(false)
                                                setProductoSeleccionado(null)
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                    {mostrarDropdownProducto && (
                                        <div data-producto-dropdown className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-52 overflow-y-auto z-50">
                                            {(() => {
                                                const filtrados = categoriaFiltro
                                                    ? productosEncontrados.filter(p => p.categoria === categoriaFiltro)
                                                    : productosEncontrados
                                                return filtrados.length > 0 ? (
                                                    [...filtrados].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")).map(p => (
                                                        <button
                                                            key={p.id}
                                                            type="button"
                                                            onClick={() => {
                                                                productoSeleccionadoRef.current = true
                                                                setProductoSeleccionado(p)
                                                                setBusquedaProducto(p.nombre)
                                                                setMostrarDropdownProducto(false)
                                                            }}
                                                            className="w-full px-3 py-2.5 text-left hover:bg-slate-50 border-b border-slate-50 last:border-b-0 transition-colors"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span className="inline-flex px-1.5 py-0.5 bg-slate-600 text-white rounded text-[10px] font-bold shrink-0">{p.categoria}</span>
                                                                <p className="font-medium text-slate-900 text-sm truncate">{p.nombre}</p>
                                                            </div>
                                                            <p className="text-xs text-slate-400">S/ {Number(p.precio).toFixed(2)}</p>
                                                        </button>
                                                    ))
                                                ) : busquedaProducto.length >= 2 ? (
                                                    <div className="px-3 py-3 text-sm text-slate-400 text-center">
                                                        {categoriaFiltro ? `Sin resultados en "${categoriaFiltro}"` : "No se encontraron productos"}
                                                    </div>
                                                ) : null
                                            })()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelBase}>Tipo</label>
                                    <div className="flex gap-1.5">
                                        <button
                                            type="button"
                                            onClick={() => setItemTipo("metros")}
                                            className={`flex-1 px-3 py-2 border rounded-lg text-xs font-semibold transition-all ${
                                                itemTipo === "metros"
                                                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                                            }`}
                                        >
                                            METROS
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setItemTipo("pieza")
                                                if (itemCantidad.includes(".")) {
                                                    setItemCantidad(Math.ceil(Number(itemCantidad) || 1).toString())
                                                }
                                            }}
                                            className={`flex-1 px-3 py-2 border rounded-lg text-xs font-semibold transition-all ${
                                                itemTipo === "pieza"
                                                    ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                                            }`}
                                        >
                                            PIEZAS
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelBase}>Cantidad</label>
                                    <input
                                        type="text"
                                        inputMode={itemTipo === "pieza" ? "numeric" : "decimal"}
                                        value={itemCantidad}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            const regex = itemTipo === "pieza" ? /^\d+$/ : /^\d*\.?\d*$/
                                            if (val === "" || regex.test(val)) {
                                                setItemCantidad(val)
                                            }
                                        }}
                                        className="w-full px-3 py-2.5 border-2 border-blue-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={labelBase}>Precio Unitario</label>
                                <input
                                    type="text"
                                    value={productoSeleccionado ? `S/ ${Number(productoSeleccionado.precio).toFixed(2)}` : "—"}
                                    disabled
                                    className="w-full px-3 py-2.5 border border-slate-100 rounded-lg text-sm text-slate-500 bg-slate-100/50"
                                />
                                <label className={labelBase}>SubTotal {itemTipo === "pieza" && <span className="text-amber-600 font-normal">(precio aprox.)</span>}</label>
                                <input
                                    type="text"
                                    value={productoSeleccionado && itemCantidad ? `S/ ${(Number(itemCantidad) * (itemTipo === "pieza" ? 50 : 1) * Number(productoSeleccionado.precio)).toFixed(2)}` : "—"}
                                    disabled
                                    className="w-full px-3 py-2.5 border border-slate-100 rounded-lg text-sm text-slate-500 bg-slate-100/50"
                                />
                            </div>
                            <div>
                                <label className={labelBase}>Indicaciones de corte</label>
                                <input
                                    type="text"
                                    value={itemIndicaciones}
                                    onChange={(e) => setItemIndicaciones(e.target.value)}
                                    placeholder="Ej: Cortar a 1.50m"
                                    className="w-full px-3 py-2.5 border-2 border-blue-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                onClick={() => resetArticuloForm()}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <Button
                                onClick={() => agregarItem()}
                                disabled={!productoSeleccionado || Number(itemCantidad) <= 0}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-sm h-9 px-4 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {editandoArticuloId ? <Check className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />} {editandoArticuloId ? "Guardar cambios" : "Agregar artículo"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-modal agregar por monto */}
            {showMontoModal && (
                <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40" onClick={() => { setShowMontoModal(false); setMontoValue("") }} />
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
                            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> Agregar por Monto
                            </p>
                            <button onClick={() => { setShowMontoModal(false); setMontoValue("") }} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className={labelBase}>Monto (S/)</label>
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={montoValue}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        if (val === "" || /^\d*\.?\d{0,2}$/.test(val)) {
                                            setMontoValue(val)
                                        }
                                    }}
                                    placeholder="0.00"
                                    className="w-full px-3 py-2.5 border-2 border-emerald-300 rounded-lg text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white text-center font-bold"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 shrink-0">
                            <button
                                type="button"
                                onClick={() => { setShowMontoModal(false); setMontoValue("") }}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <Button
                                onClick={agregarPorMonto}
                                disabled={!montoValue || isNaN(parseFloat(montoValue)) || parseFloat(montoValue) <= 0}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm h-9 px-4 rounded-lg font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Agregar
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success overlay */}
            {successOverlay.show && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                            Pedido {successOverlay.action === "creado" ? "creado" : "actualizado"} exitosamente
                        </h3>
                        <p className="text-2xl font-black text-blue-600 mb-6">{successOverlay.numeroOrden}</p>
                        <div className="flex flex-col gap-2.5">
                            <Button
                                onClick={() => {
                                    window.location.href = "/dashboard/nota-pedido"
                                }}
                                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Ver pedido
                            </Button>
                            <Button
                                onClick={() => {
                                    setSuccessOverlay({ show: false, numeroOrden: "", action: "creado" })
                                    resetForm()
                                    setStep(1)
                                }}
                                className="w-full h-11 bg-white border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl transition-all duration-200"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Crear otro pedido
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )

    return isMounted ? createPortal(modalContent, document.body) : null
}
