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
        <div className="p-4 md:p-6 pb-24 md:pb-10">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4 md:mb-8">
                    <div>
                        <h1 className="text-xl md:text-3xl font-bold text-slate-900">Proceso de compra</h1>
                        <p className="text-sm md:text-base text-slate-500">Completa los datos para tu pedido</p>
                    </div>
                </div>

                <CheckoutFlow />
            </div>
        </div>
    )
}