"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Plus, X, FilePlus, ClipboardList, Pencil, FileText, File, Users, ShoppingCart, Heart } from "lucide-react"

interface Props {
    userName: string
    userRole: string
    onOpenCrearPedido?: () => void
    onOpenBorradores?: () => void
    onOpenModificarPedido?: () => void
}

export function MobileNav({ userName, userRole, onOpenCrearPedido, onOpenBorradores, onOpenModificarPedido }: Props) {
    const pathname = usePathname()
    const [showAcciones, setShowAcciones] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [animating, setAnimating] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (showAcciones) {
            setAnimating(true)
        }
    }, [showAcciones])

    const handleClose = () => {
        setAnimating(false)
        setTimeout(() => setShowAcciones(false), 300)
    }

    const triggerAction = (action: "crear-pedido" | "borradores" | "modificar-pedido", localCallback?: () => void) => {
        setAnimating(false)
        setTimeout(() => {
            setShowAcciones(false)
            if (localCallback) {
                localCallback()
            } else {
                window.dispatchEvent(new CustomEvent(`mobile-nav:${action}`))
            }
        }, 250)
    }

    if (!isMounted) return null

    const esStaff = userRole === "empleado" || userRole === "admin"

    const acciones = esStaff ? [
        { icon: FilePlus, label: "Crear Pedido", desc: "Nuevo pedido para cliente", gradient: "from-slate-100 to-slate-200", border: "border-slate-200/50", iconBg: "bg-slate-900/10", iconHover: "group-hover:bg-slate-900/20", circle: "bg-slate-300/30", text: "text-slate-800", subtext: "text-slate-500", iconColor: "text-slate-700", action: () => triggerAction("crear-pedido", onOpenCrearPedido) },
        { icon: ClipboardList, label: "Atender Pedidos", desc: "Gestionar pedidos pendientes", gradient: "from-blue-100 to-blue-200", border: "border-blue-200/50", iconBg: "bg-blue-900/10", iconHover: "group-hover:bg-blue-900/20", circle: "bg-blue-300/30", text: "text-blue-800", subtext: "text-blue-600/70", iconColor: "text-blue-700", href: "/dashboard/pedidos-admin" },
        { icon: Pencil, label: "Modificar Pedido", desc: "Editar pedidos que creaste", gradient: "from-indigo-100 to-indigo-200", border: "border-indigo-200/50", iconBg: "bg-indigo-900/10", iconHover: "group-hover:bg-indigo-900/20", circle: "bg-indigo-300/30", text: "text-indigo-800", subtext: "text-indigo-600/70", iconColor: "text-indigo-700", action: () => triggerAction("modificar-pedido", onOpenModificarPedido) },
        { icon: FileText, label: "Ver Pedidos", desc: "Detalle completo de pedidos", gradient: "from-emerald-100 to-emerald-200", border: "border-emerald-200/50", iconBg: "bg-emerald-900/10", iconHover: "group-hover:bg-emerald-900/20", circle: "bg-emerald-300/30", text: "text-emerald-800", subtext: "text-emerald-600/70", iconColor: "text-emerald-700", href: "/dashboard/nota-pedido" },
        { icon: File, label: "Mis Borradores", desc: "Continuar pedidos guardados", gradient: "from-amber-100 to-amber-200", border: "border-amber-200/50", iconBg: "bg-amber-900/10", iconHover: "group-hover:bg-amber-900/20", circle: "bg-amber-300/30", text: "text-amber-800", subtext: "text-amber-600/70", iconColor: "text-amber-700", action: () => triggerAction("borradores", onOpenBorradores) },
        ...(userRole === "admin" ? [{ icon: Users, label: "Gestion Clientes", desc: "Administrar clientes", gradient: "from-purple-100 to-purple-200", border: "border-purple-200/50", iconBg: "bg-purple-900/10", iconHover: "group-hover:bg-purple-900/20", circle: "bg-purple-300/30", text: "text-purple-800", subtext: "text-purple-600/70", iconColor: "text-purple-700", href: "/dashboard/clientes-pedido" }] : []),
    ] : [
        { icon: ShoppingCart, label: "Mi Carrito", desc: "Ver productos agregados", gradient: "from-slate-100 to-slate-200", border: "border-slate-200/50", iconBg: "bg-slate-900/10", iconHover: "group-hover:bg-slate-900/20", circle: "bg-slate-300/30", text: "text-slate-800", subtext: "text-slate-500", iconColor: "text-slate-700", href: "/dashboard/carrito" },
        { icon: Heart, label: "Favoritos", desc: "Productos que te gustan", gradient: "from-red-100 to-red-200", border: "border-red-200/50", iconBg: "bg-red-900/10", iconHover: "group-hover:bg-red-900/20", circle: "bg-red-300/30", text: "text-red-800", subtext: "text-red-600/70", iconColor: "text-red-700", href: "/dashboard?favoritos=1" },
        { icon: FileText, label: "Mis Pedidos", desc: "Historial de pedidos", gradient: "from-emerald-100 to-emerald-200", border: "border-emerald-200/50", iconBg: "bg-emerald-900/10", iconHover: "group-hover:bg-emerald-900/20", circle: "bg-emerald-300/30", text: "text-emerald-800", subtext: "text-emerald-600/70", iconColor: "text-emerald-700", href: "/dashboard/pedidos" },
    ]

    return (
        <>
            <style>{`
                @keyframes macos-pop-in {
                    0% { opacity: 0; transform: scale(0.3) translateY(20px); }
                    50% { opacity: 1; transform: scale(1.08) translateY(-2px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes macos-pop-out {
                    0% { opacity: 1; transform: scale(1) translateY(0); }
                    100% { opacity: 0; transform: scale(0.3) translateY(20px); }
                }
                @keyframes backdrop-fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes backdrop-fade-out { from { opacity: 1; } to { opacity: 0; } }
                @keyframes panel-slide-up {
                    0% { opacity: 0; transform: translateY(30px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes panel-slide-down {
                    0% { opacity: 1; transform: translateY(0) scale(1); }
                    100% { opacity: 0; transform: translateY(30px) scale(0.95); }
                }
            `}</style>

            <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-200 safe-area-bottom">
                <div className="flex items-center justify-around h-16">
                    <Link
                        href="/dashboard"
                        className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                            pathname === "/dashboard" ? "text-slate-900" : "text-slate-400"
                        }`}
                    >
                        <Home className="h-6 w-6" />
                        <span className="text-[10px] font-medium">Inicio</span>
                    </Link>

                    <button
                        onClick={() => setShowAcciones(true)}
                        className="flex flex-col items-center justify-center -mt-4"
                    >
                        <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/30 active:scale-95 transition-transform">
                            <Plus className="h-7 w-7 text-white" />
                        </div>
                    </button>

                    <div className="flex-1" />
                </div>
            </nav>

            {showAcciones && (
                <div className="fixed inset-0 z-[45] md:hidden">
                    <div
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={handleClose}
                        style={{
                            animation: animating ? 'backdrop-fade-in 0.25s ease-out forwards' : 'backdrop-fade-out 0.25s ease-in forwards'
                        }}
                    />
                    <div
                        className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200"
                        style={{
                            animation: animating ? 'panel-slide-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' : 'panel-slide-down 0.25s ease-in forwards'
                        }}
                    >
                        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                            <p className="text-sm font-semibold text-slate-900">Acciones Rápidas</p>
                            <button onClick={handleClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>
                        <div className="p-3 grid grid-cols-2 gap-2">
                            {acciones.map((acc, idx) => {
                                const Icon = acc.icon
                                const content = (
                                    <div
                                        className={`group relative overflow-hidden bg-gradient-to-br ${acc.gradient} rounded-2xl p-3 text-left border ${acc.border} active:scale-95 transition-transform duration-200`}
                                        style={{
                                            animation: animating
                                                ? `macos-pop-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) ${idx * 0.06}s both`
                                                : `macos-pop-out 0.2s ease-in ${idx * 0.03}s both`
                                        }}
                                    >
                                        <div className={`absolute top-0 right-0 w-10 h-10 ${acc.circle} rounded-full -translate-y-3 translate-x-3 group-hover:scale-150 transition-transform duration-500`} />
                                        <div className="relative">
                                            <div className={`w-9 h-9 ${acc.iconBg} rounded-xl flex items-center justify-center mb-2 ${acc.iconHover} transition-colors`}>
                                                <Icon className={`h-4 w-4 ${acc.iconColor}`} />
                                            </div>
                                            <p className={`font-semibold text-xs ${acc.text} leading-tight`}>{acc.label}</p>
                                            <p className={`text-[10px] ${acc.subtext} mt-0.5 line-clamp-2`}>{acc.desc}</p>
                                        </div>
                                    </div>
                                )

                                if ('href' in acc && acc.href) {
                                    return (
                                        <Link key={idx} href={acc.href} onClick={handleClose}>
                                            {content}
                                        </Link>
                                    )
                                }

                                return <button key={idx} onClick={acc.action} className="w-full text-left">{content}</button>
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
