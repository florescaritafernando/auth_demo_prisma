import Link from "next/link"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";

const ESTADO_ICONS: Record<string, any> = {
    pendiente: Clock,
    confirmado: Package,
    enviado: Package,
    entregado: CheckCircle,
    cancelado: XCircle,
};

const ESTADO_COLORS: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-800",
    confirmado: "bg-blue-100 text-blue-800",
    enviado: "bg-purple-100 text-purple-800",
    entregado: "bg-green-100 text-green-800",
    cancelado: "bg-red-100 text-red-800",
};

export default async function PedidosPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">Mis Pedidos</h1>
                    <p className="text-slate-500 mt-2">Historial de pedidos realizados</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700 mb-2">No tienes pedidos aún</h2>
                    <p className="text-slate-500 mb-6">Una vez que realices tu primer pedido, podrás ver el historial aquí.</p>
<Button asChild className="bg-slate-900 text-white">
                        <Link href="/dashboard">Ver Catálogo</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}