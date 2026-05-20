"use client"

import { useState, useEffect } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Home, ShoppingBag, ShoppingCart, User, Package, BarChart3, AlertTriangle, Tag, Warehouse, BellRing, X, Settings, Users } from "lucide-react"
import { SignOutButton } from "@/components/signout-button"
import Image from "next/image"
import { usePathname } from "next/navigation"

const clienteItems = [
    { title: "Catalogo", url: "/dashboard", icon: Home },
    { title: "Mis Pedidos", url: "/dashboard/pedidos", icon: ShoppingBag },
    { title: "Mi Carrito", url: "/dashboard/carrito", icon: ShoppingCart },
    { title: "Mi Perfil", url: "/dashboard/perfil", icon: User },
    { title: "Mis Reclamos", url: "/dashboard/reclamos", icon: AlertTriangle },
    { title: "Mis Notificaciones", url: "/dashboard/notificaciones", icon: BellRing, isNotificaciones: true },

]

const adminItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Gestion Articulos", url: "/dashboard/articulos", icon: Tag },
    { title: "Gestion Tiendas", url: "/dashboard/tiendas", icon: Warehouse },
    { title: "Gestion Almacenes", url: "/dashboard/almacenes", icon: Warehouse },
    { title: "Gestion Pedidos", url: "/dashboard/pedidos-admin", icon: ShoppingBag },
    { title: "Gestion Clientes", url: "/dashboard/clientes-pedido", icon: Users },
    { title: "Gestion Reclamos", url: "/dashboard/reclamos", icon: AlertTriangle },
    { title: "Estadisticas", url: "/dashboard/estadisticas", icon: BarChart3 },
    { title: "Notificaciones", url: "/dashboard/notificaciones", icon: BellRing, isNotificaciones: true },
]

const empleadoItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Gestion Articulos", url: "/dashboard/articulos", icon: Tag },
    { title: "Ver Tiendas", url: "/dashboard/tiendas", icon: Warehouse },
    { title: "Ver Almacenes", url: "/dashboard/almacenes", icon: Warehouse },
    { title: "Atender Pedidos", url: "/dashboard/pedidos-admin", icon: ShoppingBag },
    { title: "Reclamos de Clientes", url: "/dashboard/reclamos", icon: AlertTriangle },
    { title: "Notificaciones", url: "/dashboard/notificaciones", icon: BellRing, isNotificaciones: true },
]

interface AppSidebarProps {
    role?: string
    userName?: string
    userImage?: string | null
}

export function AppSidebar({ role = "cliente", userName = "Usuario", userImage = null }: AppSidebarProps) {
    const pathname = usePathname()
    const items = role === "admin" ? adminItems : role === "empleado" ? empleadoItems : clienteItems
    const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0)
    const [notificacionActual, setNotificacionActual] = useState<any>(null)
    const [notificacionesQueue, setNotificacionesQueue] = useState<any[]>([])
    const [showPopup, setShowPopup] = useState(false)
    const [notificacionesRecientes, setNotificacionesRecientes] = useState<any[]>([])
    const [fadeOut, setFadeOut] = useState(false)
    const [popupMostrado, setPopupMostrado] = useState(false)
    const [sonidoActivo, setSonidoActivo] = useState(true)

    // Función para reproducir sonido de notificación
    const playNotificationSound = () => {
        if (!sonidoActivo) return
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.value = 800
            oscillator.type = "sine"
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
            
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.3)
        } catch (e) {
            console.error("Error playing sound:", e)
        }
    }

    // Cargar preferencia de sonido
    useEffect(() => {
        const fetchPreferencias = async () => {
            try {
                const res = await fetch("/api/usuarios?propio=true", { credentials: "include" })
                const json = await res.json()
                if (json.success && json.usuario?.preferencias) {
                    const prefs = json.usuario.preferencias as Record<string, boolean>
                    setSonidoActivo(prefs.sonidoNotificaciones !== false)
                }
            } catch (e) {
                console.error("Error fetching preferencias:", e)
            }
        }
        fetchPreferencias()
    }, [])

    // Reproducir sonido cuando aparece el popup
    useEffect(() => {
        if (showPopup && notificacionActual) {
            playNotificationSound()
        }
    }, [showPopup])

    // Cerrar popup si navega a la página de notificaciones
    useEffect(() => {
        if (pathname === "/dashboard/notificaciones" && showPopup) {
            setFadeOut(true)
            setTimeout(() => {
                setShowPopup(false)
                setFadeOut(false)
                setNotificacionActual(null)
                setNotificacionesQueue([])
            }, 500)
        }
    }, [pathname, showPopup])

    // Fetch notificaciones - solo cargar si el queue está vacío y popup no mostrado
    useEffect(() => {
        const fetchNotificaciones = async () => {
            // No recargar si ya hay notificaciones enqueue o mostrando o popup ya mostrado (para clientes)
            if (notificacionesQueue.length > 0 || notificacionActual || (role === "cliente" && popupMostrado)) {
                return
            }

            try {
                const res = await fetch("/api/notificaciones", { credentials: "include" })
                const json = await res.json()
                if (json.success) {
                    const noLeidas = json.notificaciones?.filter((n: any) => !n.leida).length || 0
                    setNotificacionesNoLeidas(noLeidas)

                    // Obtener las no leídas para el popup
                    const noLeidasList = json.notificaciones?.filter((n: any) => !n.leida) || []
                    setNotificacionesRecientes(noLeidasList)

                    // Configurar queue de notificaciones para empleado/admin
                    if (noLeidasList.length > 0 && role !== "cliente" && pathname !== "/dashboard/notificaciones" && pathname !== "/dashboard/pedidos-admin") {
                        setNotificacionesQueue(noLeidasList)
                        setNotificacionActual(noLeidasList[0])
                        setShowPopup(true)
                    }

                    // Para clientes: mostrar popup si hay notificación de metraje_confirmado, rechazo o pago confirmado no leída
                    if (role === "cliente" && pathname !== "/dashboard/notificaciones" && pathname !== "/dashboard/pedidos" && !popupMostrado) {
                        const notifMetrajeConfirmado = json.notificaciones?.find((n: any) =>
                            n.tipo === "metraje_confirmado" && !n.leida
                        )
                        const notifRechazado = json.notificaciones?.find((n: any) =>
                            n.tipo === "rechazado" && !n.leida
                        )
                        const notifPagoConfirmado = json.notificaciones?.find((n: any) =>
                            n.tipo === "pedido_estado" && !n.leida && n.mensaje?.includes("confirmado")
                        )

                        if (notifMetrajeConfirmado) {
                            setNotificacionActual(notifMetrajeConfirmado)
                            setShowPopup(true)
                            setPopupMostrado(true)
                        } else if (notifRechazado) {
                            setNotificacionActual(notifRechazado)
                            setShowPopup(true)
                            setPopupMostrado(true)
                        } else if (notifPagoConfirmado) {
                            setNotificacionActual(notifPagoConfirmado)
                            setShowPopup(true)
                            setPopupMostrado(true)
                        }
                    }
                }
            } catch (e) {
                console.error("Error fetching notificaciones:", e)
            }
        }

        fetchNotificaciones()

        // Actualizar cada 30 segundos solo si no hay queue activo
        const interval = setInterval(() => {
            if (notificacionesQueue.length === 0 && !notificacionActual) {
                fetchNotificaciones()
            }
        }, 30000)
        return () => clearInterval(interval)
    }, [role, pathname, notificacionesQueue.length, notificacionActual])

    // Manejar desvanecimiento de notificaciones
    useEffect(() => {
        if (!showPopup || !notificacionActual) return

        const timer = setTimeout(() => {
            setFadeOut(true)
            setTimeout(() => {
                setShowPopup(false)
                setFadeOut(false)
                // Remover la primera del queue
                const restantes = notificacionesQueue.slice(1)
                setNotificacionesQueue(restantes)
                // Mostrar siguiente si existe
                if (restantes.length > 0) {
                    setNotificacionActual(restantes[0])
                    setShowPopup(true)
                } else {
                    setNotificacionActual(null)
                }
            }, 500)
        }, 10000)

        return () => clearTimeout(timer)
    }, [showPopup, notificacionActual, notificacionesQueue])

    return (
        <TooltipProvider>
            <Sidebar className="bg-slate-900 border-r border-slate-800">
                <SidebarHeader>
                    <div className="flex items-center gap-3 p-4 border-b border-slate-700">
                        <div className="relative h-8 w-8">
                            <Image
                                src="/favicon.ico"
                                alt="Logo"
                                fill
                                className="object-contain rounded-lg"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-sm text-[#F2EBE3] tracking-tight">Manchester</span>
                            <span className="font-bold text-sm text-[#F2EBE3] tracking-wide">Collection Perú</span>
                        </div>
                    </div>
                </SidebarHeader>
                <SidebarContent className="pt-4">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-[#D4AF37] font-bold tracking-widest text-xs uppercase mb-2">
                            {role === "admin" ? "Administracion" : "Menu Principal"}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-2">
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title} className="h-10 text-[#F2EBE3] hover:text-[#D4AF37] hover:bg-slate-800 font-medium transition-colors">
                                            <a href={item.url} className="flex items-center gap-3 w-full relative">
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.title}</span>
                                                {item.isNotificaciones && notificacionesNoLeidas > 0 && (
                                                    <span className="absolute -right-1 -top-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                        {notificacionesNoLeidas > 9 ? "9+" : notificacionesNoLeidas}
                                                    </span>
                                                )}
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="border-t border-slate-700 p-4">
                    <div className="flex items-center justify-between mb-4 p-2 bg-slate-800 rounded-lg">
                        <div className="flex items-center gap-3">
                            {userImage ? (
                                <Image 
                                    src={userImage} 
                                    alt={userName} 
                                    width={36} 
                                    height={36} 
                                    className="rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <p className="text-white text-sm font-medium truncate max-w-[120px]">{userName}</p>
                                <p className="text-slate-400 text-xs capitalize">{role === "cliente" ? "Cliente" : role === "empleado" ? "Colaborador" : "Admin"}</p>
                            </div>
                        </div>
                        <a href="/dashboard/perfil" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Configuración">
                            <Settings className="h-4 w-4" />
                        </a>
                    </div>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SignOutButton />
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                {showPopup && notificacionActual && (
                    <div className={`fixed bottom-4 right-4 z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
                        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BellRing className="h-4 w-4 text-yellow-400 animate-pulse" />
                                <span className="font-bold text-sm">Nueva Notificación</span>
                            </div>
                            <button onClick={() => {
                                setFadeOut(true)
                                setTimeout(() => {
                                    const restantes = notificacionesQueue.slice(1)
                                    setNotificacionesQueue(restantes)
                                    if (restantes.length > 0) {
                                        setNotificacionActual(restantes[0])
                                        setFadeOut(false)
                                        setShowPopup(true)
                                    } else {
                                        setShowPopup(false)
                                        setFadeOut(false)
                                        setNotificacionActual(null)
                                    }
                                }, 500)
                            }} className="text-slate-400 hover:text-white">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-sm font-bold text-slate-800">{notificacionActual.titulo}</p>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-3">{notificacionActual.mensaje}</p>
                            <p className="text-xs text-slate-400 mt-2">
                                {new Date(notificacionActual.createdAt).toLocaleString("es-PE", {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                })}
                            </p>
                        </div>
                        <div className="px-4 py-3 bg-slate-50 flex justify-between items-center">
                            <a href="/dashboard/notificaciones" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Ver detalle →
                            </a>
                            <span className="text-xs text-amber-600 font-medium">Cerrando en 10s...</span>
                        </div>
                    </div>
                )}
            </Sidebar>
        </TooltipProvider>
    )
}