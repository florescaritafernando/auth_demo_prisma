import Link from "next/link"
import { auth } from "@/lib/auth"
import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Package, Clock, CheckCircle, XCircle, MapPin, User, CreditCard, Phone, FileText, PlayCircle } from "lucide-react"

const ESTADO_CONFIG: Record<string, { label: string; color: string; colorTexto: string; icon: any }> = {
    metraje_en_proceso: { label: "Metraje en proceso", color: "bg-yellow-100", colorTexto: "text-yellow-800", icon: Clock },
    metraje_confirmado: { label: "Metraje confirmado", color: "bg-green-100", colorTexto: "text-green-800", icon: CheckCircle },
    pendiente: { label: "Pendiente", color: "bg-blue-100", colorTexto: "text-blue-800", icon: Package },
    confirmado: { label: "Confirmado", color: "bg-blue-200", colorTexto: "text-blue-900", icon: CheckCircle },
    rechazado: { label: "Rechazado", color: "bg-red-100", colorTexto: "text-red-800", icon: XCircle },
    completado: { label: "Completado", color: "bg-green-100", colorTexto: "text-green-800", icon: CheckCircle },
}

const AGENCIA_LABELS: Record<string, string> = {
    shalom: "SHALOM",
    flores: "FLORES",
    marvisur: "MARVISUR",
    otros: "OTROS"
}

async function getPedidos() {
    try {
        const cookieStore = await cookies()
        const allCookies = cookieStore.toString()
        
        console.log("Getting pedidos, cookies:", allCookies?.substring(0, 100) || "empty")

        const res = await fetch(`${process.env.NEXT_PUBLIC_URL || "http://localhost:3000"}/api/pedidos`, {
            headers: {
                Cookie: allCookies || ""
            }
        })
        
        console.log("Pedidos API response:", res.status)
        
        if (!res.ok) return []
        
        const json = await res.json()
        console.log("Pedidos data:", json.success ? `${json.pedidos?.length || 0} pedidos` : json.error)
        return json.pedidos || []
    } catch (e: any) {
        console.error("getPedidos error:", e)
        return []
    }
}

export default async function PedidosPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        redirect("/login")
    }

    const userRole = (session.user as any)?.role || "cliente"
    const pedidos = await getPedidos()

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Mis Pedidos</h1>
                        <p className="text-slate-500 mt-2">Historial de pedidos realizados</p>
                    </div>
                    {userRole === "admin" && (
                        <Link href="/dashboard/pedidos-admin">
                            <Button variant="outline">Administrar Pedidos</Button>
                        </Link>
                    )}
                </div>

                {pedidos.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">No tienes pedidos aún</h2>
                        <p className="text-slate-500 mb-6">Una vez que realices tu primer pedido, podrás ver el historial aquí.</p>
                        <Button asChild className="bg-slate-900 text-white">
                            <Link href="/dashboard">Ver Catálogo</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pedidos.map((pedido: any) => {
                            const config = ESTADO_CONFIG[pedido.estado] || ESTADO_CONFIG.metraje_en_proceso
                            const IconComponent = config.icon
                            const agenciaLabel = pedido.agencia ? (AGENCIA_LABELS[pedido.agencia] || pedido.agenciaOtro) : null
                            
                            // Hide price for metraje states
                            const ocultarPrecio = ["metraje_en_proceso", "metraje_confirmado"].includes(pedido.estado)
                            const mostrarContinuar = pedido.estado === "metraje_confirmado"
                            
                            return (
                                <div key={pedido.id} className="bg-white rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                                                <FileText className="h-6 w-6 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-lg">{pedido.numeroOrden}</p>
                                                <p className="text-sm text-slate-500">
                                                    {new Date(pedido.createdAt).toLocaleDateString("es-PE", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric"
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                {ocultarPrecio ? (
                                                    <p className="text-sm text-slate-500 font-italic">Precio en revisión</p>
                                                ) : (
                                                    <p className="font-bold text-slate-900 text-lg">S/ {Number(pedido.total).toFixed(2)}</p>
                                                )}
                                                <p className="text-sm text-slate-500">
                                                    {pedido.pedidoDetalle?.length || 0} items
                                                </p>
                                            </div>
                                            
                                            <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${config.color} ${config.colorTexto} flex items-center gap-1`}>
                                                <IconComponent className="h-4 w-4" />
                                                {config.label}
                                            </span>
                                            
                                            {mostrarContinuar && (
                                                <Link href={`/dashboard/checkout?pedido=${pedido.id}`}>
                                                    <Button className="bg-green-600 hover:bg-green-700 text-sm">
                                                        <PlayCircle className="h-4 w-4 mr-1" />
                                                        Continuar compra
                                                    </Button>
                                                </Link>
                                            )}
                                            
                                            {userRole === "admin" && (
                                                <form action={`/api/pedidos/${pedido.id}`} method="POST">
                                                    <select 
                                                        name="estado"
                                                        defaultValue={pedido.estado}
                                                        onChange={(e) => e.target.form?.submit()}
                                                        className="appearance-none bg-white border border-slate-300 rounded px-3 py-1.5 text-sm cursor-pointer hover:border-slate-400"
                                                    >
                                                        {Object.keys(ESTADO_CONFIG).map(s => (
                                                            <option key={s} value={s}>{ESTADO_CONFIG[s].label}</option>
                                                        ))}
                                                    </select>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-start gap-2">
                                                <CreditCard className="h-4 w-4 text-slate-400 mt-0.5" />
                                                <div>
                                                    <p className="text-slate-500">Facturación:</p>
                                                    <p className="font-medium text-slate-800">
                                                        {pedido.nombreFactura} ({pedido.tipoDocumento?.toUpperCase()} {pedido.numeroDoc})
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-2">
                                                <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                                                <div>
                                                    <p className="text-slate-500">Envío:</p>
                                                    <p className="font-medium text-slate-800">
                                                        {pedido.metodoEnvio === "retiro" ? "Retiro en persona" : 
                                                         pedido.metodoEnvio === "agencia" ? `Agencia: ${agenciaLabel || pedido.agenciaOtro || "No especificada"}` : 
                                                         `Recoge: ${pedido.nombreRecibe} (DNI: ${pedido.dniRecibe})`}
                                                    </p>
                                                    {pedido.direccion && <p className="text-slate-500">{pedido.direccion}</p>}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-2">
                                                <Phone className="h-4 w-4 text-slate-400 mt-0.5" />
                                                <div>
                                                    <p className="text-slate-500">Pago:</p>
                                                    <p className="font-medium text-slate-800">
                                                        Nro. Operación: {pedido.numeroOperacion || "No registrado"}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-start gap-2">
                                                <Package className="h-4 w-4 text-slate-400 mt-0.5" />
                                                <div>
                                                    <p className="text-slate-500">Costo envío:</p>
                                                    <p className="font-medium text-slate-800">S/ {Number(pedido.costoEnvio || 0).toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}