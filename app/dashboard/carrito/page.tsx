import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { CheckoutButton } from "@/components/checkout-button";

export default async function CarritoPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
        redirect("/login");
    }

    const items = await prisma.carrito.findMany({
        where: { userId: session.user.id },
        include: { producto: true },
        orderBy: { createdAt: "desc" }
    });

    const total = items.reduce((sum, item) => sum + (Number(item.producto.precio) * item.cantidad), 0);

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex items-center gap-4">
                    <ShoppingCart className="h-8 w-8 text-slate-700" />
                    <h1 className="text-3xl font-extrabold text-slate-900">Mi Carrito de Compras</h1>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <ShoppingCart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-700 mb-2">Tu carrito esta vacio</h2>
                        <p className="text-slate-500 mb-6">Explora nuestro catalogo y agrega los productos que te interesen.</p>
                        <Button asChild className="bg-slate-900 text-white">
                            <Link href="/dashboard">Ver Catalogo</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-4 flex gap-4">
                                    <div className="w-24 h-24 relative rounded-lg bg-slate-100 shrink-0">
                                        <Image
                                            src={item.producto.imagen || "/images/D-10-001.PNG"}
                                            alt={item.producto.nombre}
                                            fill
                                            className="object-contain p-2"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900">{item.producto.nombre}</h3>
                                        <p className="text-sm text-slate-500">{item.producto.categoria}</p>
                                        <p className="font-bold text-slate-900 mt-2">S/ {Number(item.producto.precio).toFixed(2)}</p>
                                        <div className="flex items-center gap-4 mt-3">
                                            <span className="text-sm text-slate-500">Cantidad: {item.cantidad}</span>
                                            <span className="font-semibold text-slate-900">
                                                Subtotal: S/ {(Number(item.producto.precio) * item.cantidad).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-24">
                                <h2 className="text-xl font-bold text-slate-900 mb-4">Resumen del Pedido</h2>
                                
                                <div className="space-y-2 mb-4 pb-4 border-b border-slate-100">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between text-sm">
                                            <span className="text-slate-600">{item.producto.nombre} x{item.cantidad}</span>
                                            <span className="font-medium">S/ {(Number(item.producto.precio) * item.cantidad).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between text-lg font-bold mb-6">
                                    <span>Total</span>
                                    <span>S/ {total.toFixed(2)}</span>
                                </div>

                                <CheckoutButton />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}