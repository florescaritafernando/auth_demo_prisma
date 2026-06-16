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
import { Home, ShoppingBag, ShoppingCart, User, Package, BarChart3, AlertTriangle, Tag, Warehouse, BellRing, Settings, Users } from "lucide-react"
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
    { title: "Inicio", url: "/dashboard", icon: Home },
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
    { title: "Inicio", url: "/dashboard", icon: Home },
    /* 
    { title: "Ver Tiendas", url: "/dashboard/tiendas", icon: Warehouse },
    { title: "Ver Almacenes", url: "/dashboard/almacenes", icon: Warehouse },
    { title: "Atender Pedidos", url: "/dashboard/pedidos-admin", icon: ShoppingBag },
    { title: "Gestion Clientes", url: "/dashboard/clientes-pedido", icon: Users },
    { title: "Reclamos de Clientes", url: "/dashboard/reclamos", icon: AlertTriangle },
     */
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

    // Fetch notifications count — only on mount and when tab becomes visible
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch("/api/notificaciones", { credentials: "include" })
                const json = await res.json()
                if (json.success) {
                    const noLeidas = json.notificaciones?.filter((n: any) => !n.leida).length || 0
                    setNotificacionesNoLeidas(noLeidas)
                }
            } catch (e) {
                console.error("Error fetching notificaciones:", e)
            }
        }

        fetchCount()

        const onVisible = () => { if (document.visibilityState === "visible") fetchCount() }
        document.addEventListener("visibilitychange", onVisible)

        const channel = new BroadcastChannel("notificaciones")
        channel.onmessage = () => fetchCount()

        return () => {
            document.removeEventListener("visibilitychange", onVisible)
            channel.close()
        }
    }, [])

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
                                sizes="32px"
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
            </Sidebar>
        </TooltipProvider>
    )
}