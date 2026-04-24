import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { BotonNuevoAlmacen, BotonEliminarAlmacen } from "@/components/nuevo-almacen-button";
import { BotonEditarAlmacen } from "@/components/editar-almacen-button";

export const dynamic = "force-dynamic";

async function getAlmacenes() {
    try {
        const almacenes = await prisma.almacen.findMany({
            orderBy: { createdAt: "desc" },
            include: { stocks: { select: { id: true } } }
        });
        return almacenes;
    } catch {
        return [];
    }
}

export default async function AlmacenesPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) redirect("/login");
    
    const role = (session.user as any)?.role || "cliente"
    if (role !== "admin") redirect("/dashboard");

    const almacenes = await getAlmacenes();

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Gestion de Almacenes</h1>
                        <p className="text-slate-500 mt-1">Administra tus almacenes</p>
                    </div>
                    <BotonNuevoAlmacen />
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Nombre</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Direccion</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Telefono</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Responsable</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Ciudad</th>
                                <th className="text-left px-6 py-3 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="text-right px-6 py-3 text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {almacenes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        No hay almacenes. Agrega el primero.
                                    </td>
                                </tr>
                            ) : (
                                almacenes.map((alm) => (
                                    <tr key={alm.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{alm.nombre}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{alm.direccion}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{alm.telefono || "-"}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{alm.responsable || "-"}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{alm.ciudad || "-"}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${alm.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                                {alm.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <BotonEditarAlmacen almacen={alm} />
                                                <BotonEliminarAlmacen id={alm.id} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-sm text-slate-500 text-center">
                    Mostrando {almacenes.length} almacenes
                </div>
            </div>
        </div>
    );
}