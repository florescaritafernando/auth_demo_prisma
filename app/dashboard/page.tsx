import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart } from "lucide-react";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { BotonAgregarCarrito } from "@/components/agregar-carrito-button";

export const dynamic = "force-dynamic";

async function getProductos() {
    try {
        const productos = await prisma.producto.findMany({
            where: { activo: true },
            orderBy: { createdAt: "desc" },
            include: {
                stocks: {
                    include: { almacen: { select: { id: true, nombre: true, ciudad: true } } }
                }
            },
            take: 12,
        });
        return productos;
    } catch {
        return [];
    }
}

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) redirect("/login");

    const role = (session.user as any)?.role || "cliente"
    const productos = await getProductos();

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="mb-10 max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Mi Catalogo Exclusivo
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Bienvenido(a), <span className="font-semibold text-slate-700">{session?.user?.name || "Cliente"}</span>.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-slate-300 text-slate-700 font-semibold">Filtrar</Button>
                    <Link href="/dashboard/carrito">
                        <Button className="bg-slate-900 text-white hover:bg-slate-800 font-semibold shadow-md">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Ver Mi Carrito
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {productos.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                        <p className="text-slate-500 mb-4">No hay productos disponibles.</p>
                        {role === "admin" && (
                            <Link href="/dashboard/articulos">
                                <Button className="bg-slate-900 text-white">
                                    Agregar Productos
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {productos.map((prod) => {
                            const totalStock = prod.stocks.reduce((sum, s) => sum + s.stock, 0);

                            return (
                                <div key={prod.id} className="group relative rounded-[2rem] bg-white border border-slate-200 p-5 transition-all hover:shadow-xl hover:shadow-slate-200 hover:-translate-y-1 duration-300 flex flex-col h-full">
                                    <div className="relative aspect-[4/3] w-full rounded-[1.5rem] bg-slate-100/50 mb-6 shrink-0 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                        <Badge className={`absolute top-4 left-4 z-10 border-none px-3 py-1 text-xs uppercase tracking-wider font-semibold shadow-sm
                                            ${totalStock > 10 ? 'bg-emerald-500 text-white' : totalStock > 0 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'}`}>
                                            {totalStock > 10 ? "En stock" : totalStock > 0 ? `${totalStock} und` : "Agotado"}
                                        </Badge>
                                        <button className="absolute top-4 right-4 z-10 h-10 w-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-red-500 hover:scale-110 transition-all">
                                            <Heart className="h-5 w-5" />
                                        </button>
                                        <Image
                                            src={prod.imagen || "/images/D-10-001.PNG"}
                                            alt={prod.nombre}
                                            fill
                                            className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </div>
                                    <div className="px-2 flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-xl font-bold text-slate-900 tracking-tight line-clamp-1" title={prod.nombre}>{prod.nombre}</h3>
                                            </div>
                                            <span className="text-lg font-extrabold text-slate-900 mb-2 block">S/ {Number(prod.precio).toFixed(2)}</span>
                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">{prod.categoria}</p>
                                            <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">{prod.descripcion || "Sin descripcion"}</p>
                                        </div>
                                        <div className="pt-6 mt-auto">
                                            <BotonAgregarCarrito producto={prod as any} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}