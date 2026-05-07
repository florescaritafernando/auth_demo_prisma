import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const DATOS_VENTAS = {
    semanal: [
        { dia: "Lun", ventas: 1200, pedidos: 5 },
        { dia: "Mar", ventas: 1800, pedidos: 8 },
        { dia: "Mie", ventas: 900, pedidos: 3 },
        { dia: "Jue", ventas: 2100, pedidos: 9 },
        { dia: "Vie", ventas: 3200, pedidos: 15 },
        { dia: "Sab", ventas: 4500, pedidos: 22 },
        { dia: "Dom", ventas: 2800, pedidos: 12 },
    ],
    mensual: [
        { semana: "Sem 1", ventas: 8500 },
        { semana: "Sem 2", ventas: 12300 },
        { semana: "Sem 3", ventas: 9800 },
        { semana: "Sem 4", ventas: 15600 },
    ],
    productos: [
        { nombre: "D-10-001", ventas: 45, revenue: 2025 },
        { nombre: "D-10-005", ventas: 32, revenue: 2720 },
        { nombre: "D-27-310", ventas: 28, revenue: 980 },
        { nombre: "D-27-315", ventas: 25, revenue: 1000 },
        { nombre: "D-27-500", ventas: 18, revenue: 990 },
    ],
}

const ESTADISTICAS = {
    ventasTotal: 46200,
    pedidosTotal: 74,
    promedioPedido: 624.32,
    clientesNuevos: 12,
    productosVendidos: 148,
    tasaConversion: 4.2,
}

function GraficoBarras({ data, maxValue }: { data: { label: string; value: number }[]; maxValue: number }) {
    return (
        <div className="flex items-end gap-2 h-40">
            {data.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                        className="w-full bg-slate-800 rounded-t-md transition-all hover:bg-slate-700"
                        style={{ height: `${(item.value / maxValue) * 100}%` }}
                    />
                    <span className="text-xs text-slate-500">{item.label}</span>
                </div>
            ))}
        </div>
    )
}

function GraficoCircular({ data }: { data: { label: string; value: number; color: string }[] }) {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    let acumulador = 0
    
    return (
        <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {data.map((item, idx) => {
                    const radio = 40
                    const circunferencia = 2 * Math.PI * radio
                    const porcentaje = item.value / total
                    const offset = acumulador
                    acumulador += porcentaje
                    
                    return (
                        <circle
                            key={idx}
                            cx="50"
                            cy="50"
                            r={radio}
                            fill="transparent"
                            stroke={item.color}
                            strokeWidth="20"
                            strokeDasharray={`${circunferencia * porcentaje} ${circunferencia * (1 - porcentaje)}`}
                            strokeDashoffset={-offset * circunferencia}
                        />
                    )
                })}
            </svg>
        </div>
    )
}

export default async function EstadisticasPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) redirect("/login");
    
    const role = (session.user as any)?.role || "cliente"
    if (role !== "admin") redirect("/dashboard");

    const maxVentasSemana = Math.max(...DATOS_VENTAS.semanal.map(d => d.ventas))

    return (
        <div className="p-6 md:p-10 font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-slate-900">Estadisticas</h1>
                    <p className="text-slate-500 mt-1">Resumen de ventas y rendimiento</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Ventas Total</p>
                        <p className="text-xl font-bold text-slate-900">S/ {ESTADISTICAS.ventasTotal.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Pedidos</p>
                        <p className="text-xl font-bold text-slate-900">{ESTADISTICAS.pedidosTotal}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Promedio</p>
                        <p className="text-xl font-bold text-slate-900">S/ {ESTADISTICAS.promedioPedido.toFixed(2)}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Nuevos Clientes</p>
                        <p className="text-xl font-bold text-green-600">+{ESTADISTICAS.clientesNuevos}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Productos Vendidos</p>
                        <p className="text-xl font-bold text-slate-900">{ESTADISTICAS.productosVendidos}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4">
                        <p className="text-sm text-slate-500">Conversion</p>
                        <p className="text-xl font-bold text-blue-600">{ESTADISTICAS.tasaConversion}%</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Ventas Semanales</h2>
                        <GraficoBarras 
                            data={DATOS_VENTAS.semanal.map(d => ({ label: d.dia, value: d.ventas }))}
                            maxValue={maxVentasSemana}
                        />
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Ventas Mensuales</h2>
                        <GraficoBarras 
                            data={DATOS_VENTAS.mensual.map(d => ({ label: d.semana, value: d.ventas }))}
                            maxValue={Math.max(...DATOS_VENTAS.mensual.map(d => d.ventas))}
                        />
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Top Productos Vendidos</h2>
                        <div className="space-y-3">
                            {DATOS_VENTAS.productos.map((prod, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                                        {idx + 1}
                                    </span>
                                    <div className="flex-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="font-medium text-slate-900">{prod.nombre}</span>
                                            <span className="text-slate-500">{prod.ventas} und</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-slate-800 rounded-full"
                                                style={{ width: `${(prod.ventas / DATOS_VENTAS.productos[0].ventas) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Resumen por Dia</h2>
                        <div className="space-y-4">
                            {DATOS_VENTAS.semanal.slice(0, 5).map((dia, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-900">{dia.dia}</p>
                                        <p className="text-xs text-slate-500">{dia.pedidos} pedidos</p>
                                    </div>
                                    <p className="font-bold text-slate-900">S/ {dia.ventas.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}