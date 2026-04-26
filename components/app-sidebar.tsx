"use client"

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
import { Home, ShoppingBag, ShoppingCart, User, Package, BarChart3, AlertTriangle, Tag, Warehouse, BellRing } from "lucide-react"
import { SignOutButton } from "@/components/signout-button"

const clienteItems = [
    { title: "Catalogo", url: "/dashboard", icon: Home },
    { title: "Mis Pedidos", url: "/dashboard/pedidos", icon: ShoppingBag },
    { title: "Mi Carrito", url: "/dashboard/carrito", icon: ShoppingCart },
    { title: "Mi Perfil", url: "/dashboard/perfil", icon: User },
    { title: "Mis Reclamos", url: "/dashboard/reclamos", icon: AlertTriangle },
    { title: "Mis Notificaciones", url: "/dashboard/notificaciones", icon: BellRing },

]

const adminItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Gestion Articulos", url: "/dashboard/articulos", icon: Tag },
    { title: "Gestion Tiendas", url: "/dashboard/tiendas", icon: Warehouse },
    { title: "Gestion Almacenes", url: "/dashboard/almacenes", icon: Warehouse },
    { title: "Gestion Pedidos", url: "/dashboard/pedidos-admin", icon: ShoppingBag },
    { title: "Gestion Reclamos", url: "/dashboard/reclamos", icon: AlertTriangle },
    { title: "Estadisticas", url: "/dashboard/estadisticas", icon: BarChart3 },
    { title: "Notificaciones", url: "/dashboard/notificaciones", icon: BellRing },
]

const empleadoItems = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Gestion Articulos", url: "/dashboard/articulos", icon: Tag },
    { title: "Ver Tiendas", url: "/dashboard/tiendas", icon: Warehouse },
    { title: "Ver Almacenes", url: "/dashboard/almacenes", icon: Warehouse },
    { title: "Atender Pedidos", url: "/dashboard/pedidos-admin", icon: ShoppingBag },
    { title: "Reclamos de Clientes", url: "/dashboard/reclamos", icon: AlertTriangle },
    { title: "Notificaciones", url: "/dashboard/notificaciones", icon: BellRing },
]

interface AppSidebarProps {
    role?: string
}

export function AppSidebar({ role = "cliente" }: AppSidebarProps) {
    const items = role === "admin" ? adminItems : role === "empleado" ? empleadoItems : clienteItems

    return (
        <TooltipProvider>
            <Sidebar className="bg-slate-50 border-r border-slate-200">
                <SidebarHeader>
                    <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm shadow-md">
                            M
                        </div>
                        <span className="font-extrabold whitespace-nowrap text-lg text-slate-900 tracking-tight">Manchester</span>
                    </div>
                </SidebarHeader>
                <SidebarContent className="pt-4">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-slate-400 font-bold tracking-widest text-xs uppercase mb-2">
                            {role === "admin" ? "Administracion" : "Menu Principal"}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu className="gap-2">
                                {items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild tooltip={item.title} className="h-10 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium transition-colors">
                                            <a href={item.url} className="flex items-center gap-3 w-full">
                                                <item.icon className="h-5 w-5" />
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className="border-t border-slate-100 p-4">
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