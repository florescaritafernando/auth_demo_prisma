import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ArticulosClient } from "@/components/articulos-client";

export const dynamic = "force-dynamic";

async function getProductos() {
    try {
        const productos = await prisma.producto.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                stocks: {
                    include: { almacen: { select: { id: true, nombre: true, ciudad: true } } }
                }
            }
        });
        return productos;
    } catch {
        return [];
    }
}

export default async function ArticulosPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) redirect("/login");
    
    const role = (session.user as any)?.role || "cliente"
    if (role !== "admin") redirect("/dashboard");

    const productos = await getProductos();

    return <ArticulosClient initialProductos={productos as any} />;
}