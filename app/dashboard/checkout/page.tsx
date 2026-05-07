import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import CheckoutFlow from "@/components/checkout-flow"

export const dynamicExport = "force-dynamic"

export default async function CheckoutPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/login")
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Proceso de compra</h1>
                        <p className="text-slate-500">Completa los datos para tu pedido</p>
                    </div>
                </div>

                <CheckoutFlow />
            </div>
        </div>
    )
}