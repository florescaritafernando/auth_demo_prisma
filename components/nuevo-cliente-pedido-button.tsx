"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { DEPARTAMENTOS } from "@/lib/ubigeo"

const AGENCIAS = [
    { value: "antezana", label: "ANTEZANA" },
    { value: "shalom", label: "SHALOM" },
    { value: "flores", label: "FLORES" },
    { value: "marvisur", label: "MARVISUR" },
    { value: "grael", label: "GRAEL" },
    { value: "raza", label: "RAZA" },
    { value: "rana_express", label: "RANA EXPRESS" },
    { value: "carhuamayo", label: "CARHUAMAYO" },
    { value: "otros", label: "Escribir otra agencia" }
]

export function BotonNuevoClientePedido() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [buscandoDoc, setBuscandoDoc] = useState(false)
    const [form, setForm] = useState({
        nombre: "",
        tipoDoc: "",
        numeroDoc: "",
        direccion: "",
        telefono: "",
        agencia: "",
        agenciaOtro: "",
        guiaRemision: false,
        departamento: "",
        provincia: "",
        distrito: "",
    })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const buscarPorDocumento = async () => {
        if (!form.numeroDoc || form.numeroDoc.length < 2) return
        setBuscandoDoc(true)
        setError("")
        try {
            const res = await fetch("/api/buscar-documento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: form.tipoDoc, numero: form.numeroDoc })
            })
            const json = await res.json()
            if (json.success) {
                const dept = DEPARTAMENTOS.find(d => d.nombre.toLowerCase() === (json.departamento || "").toLowerCase())
                const prov = dept?.provincias.find(p => p.nombre.toLowerCase() === (json.provincia || "").toLowerCase())
                const distNormalized = prov?.distritos.find(d => d.toLowerCase() === (json.distrito || "").toLowerCase())
                if (form.tipoDoc === "ruc") {
                    setForm(prev => ({
                        ...prev,
                        nombre: json.razonSocial || prev.nombre,
                        direccion: json.direccion || prev.direccion,
                        departamento: dept?.nombre || json.departamento || prev.departamento,
                        provincia: prov?.nombre || json.provincia || prev.provincia,
                        distrito: distNormalized || json.distrito || prev.distrito,
                    }))
                } else {
                    setForm(prev => ({ ...prev, nombre: json.nombre || prev.nombre, direccion: json.direccion || prev.direccion, departamento: dept?.nombre || json.departamento || prev.departamento, provincia: prov?.nombre || json.provincia || prev.provincia, distrito: distNormalized || json.distrito || prev.distrito }))
                }
            } else {
                setError("Documento no encontrado")
            }
        } catch {
            setError("Error al buscar documento")
        } finally {
            setBuscandoDoc(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/clientes-pedido", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
                credentials: "include",
            })
            const data = await res.json()

            if (data.success) {
                setOpen(false)
                setBuscandoDoc(false)
                setForm({
                    nombre: "",
                    tipoDoc: "",
                    numeroDoc: "",
                    direccion: "",
                    telefono: "",
                    agencia: "",
                    agenciaOtro: "",
                    guiaRemision: false,
                    departamento: "",
                    provincia: "",
                    distrito: "",
                })
                router.refresh()
            } else {
                setError(data.error || "Error al crear cliente")
            }
        } catch {
            setError("Error de conexion")
        }
        setLoading(false)
    }

    const provincias = DEPARTAMENTOS.find(d => d.nombre === form.departamento)?.provincias || []
    const distritos = provincias.find(p => p.nombre === form.provincia)?.distritos || []

    if (!mounted) {
        return (
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                Nuevo Cliente
            </button>
        )
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                </svg>
                Nuevo Cliente
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white">
                    <h2 className="text-lg font-bold text-slate-900">Nuevo Cliente</h2>
                    <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4 text-slate-900">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                            <label className="sm:w-32 shrink-0 sm:mt-2.5 text-sm font-medium text-slate-700">Tipo Documento *</label>
                            <div className="flex-1">
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    value={form.tipoDoc}
                                    onChange={(e) => setForm({ ...form, tipoDoc: e.target.value })}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="dni">DNI</option>
                                    <option value="ruc">RUC</option>
                                    <option value="ce">Carnet Extranjeria</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                            <label className="sm:w-32 shrink-0 sm:mt-2.5 text-sm font-medium text-slate-700">Nombre *</label>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    value={form.nombre}
                                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                    placeholder="Nombre completo"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                            <label className="sm:w-32 shrink-0 sm:mt-2.5 text-sm font-medium text-slate-700">Nro Documento *</label>
                            <div className="flex-1">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        required
                                        disabled={!form.tipoDoc}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 disabled:bg-slate-100 disabled:cursor-not-allowed"
                                        value={form.numeroDoc}
                                        onChange={(e) => setForm({ ...form, numeroDoc: e.target.value })}
                                        placeholder={!form.tipoDoc ? "Primero seleccione tipo de documento" : form.tipoDoc === "ruc" ? "20XXXXXXXXX" : "XXXXXXXX"}
                                    />
                                    <button
                                        type="button"
                                        onClick={buscarPorDocumento}
                                        disabled={buscandoDoc || !form.numeroDoc}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                                    >
                                        {buscandoDoc ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                        Buscar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                            <label className="sm:w-32 shrink-0 sm:mt-2.5 text-sm font-medium text-slate-700">Direccion</label>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    value={form.direccion}
                                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                                    placeholder="Direccion del cliente"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                            <label className="sm:w-32 shrink-0 sm:mt-2.5 text-sm font-medium text-slate-700">Telefono</label>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                    value={form.telefono}
                                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                                    placeholder="+51 987 654 321"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                            <label className="sm:w-32 shrink-0 sm:mt-2.5 text-sm font-medium text-slate-700">Agencia Envio</label>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start gap-4">
                                    <select
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                        value={form.agencia}
                                        onChange={(e) => { const val = e.target.value; setForm({ ...form, agencia: val, guiaRemision: val ? true : form.guiaRemision }) }}
                                    >
                                        <option value="">Seleccionar agencia</option>
                                        {AGENCIAS.map(a => (
                                            <option key={a.value} value={a.value}>{a.label}</option>
                                        ))}
                                    </select>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 shrink-0 mt-1">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ ...form, guiaRemision: !form.guiaRemision })}
                                            className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${form.guiaRemision ? "bg-blue-600" : "bg-slate-300"}`}
                                        >
                                            <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${form.guiaRemision ? "translate-x-[18px]" : "translate-x-[2px]"}`} />
                                        </button>
                                        Guia de Remision
                                    </label>
                                </div>
                                {form.agencia === "otros" && (
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                        value={form.agenciaOtro}
                                        onChange={(e) => setForm({ ...form, agenciaOtro: e.target.value })}
                                        placeholder="Nombre de la agencia"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3">
                            <label className="sm:w-32 shrink-0 sm:mt-2.5 text-sm font-medium text-slate-700">Ubicacion</label>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-slate-500">Departamento</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                        value={form.departamento}
                                        onChange={(e) => setForm({ ...form, departamento: e.target.value, provincia: "", distrito: "" })}
                                    >
                                        <option value="">Seleccionar</option>
                                        {DEPARTAMENTOS.map(d => (
                                            <option key={d.nombre} value={d.nombre}>{d.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-slate-500">Provincia</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                        value={form.provincia}
                                        onChange={(e) => setForm({ ...form, provincia: e.target.value, distrito: "" })}
                                        disabled={!form.departamento}
                                    >
                                        <option value="">Seleccionar</option>
                                        {provincias.map(p => (
                                            <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-slate-500">Distrito</label>
                                    <select
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900"
                                        value={form.distrito}
                                        onChange={(e) => setForm({ ...form, distrito: e.target.value })}
                                        disabled={!form.provincia}
                                    >
                                        <option value="">Seleccionar</option>
                                        {distritos.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                        >
                            {loading ? "Guardando..." : "Guardar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function BotonEliminarClientePedido({ id }: { id: string }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Estas seguro de eliminar este cliente?")) return

        setLoading(true)
        try {
            const res = await fetch(`/api/clientes-pedido/${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            const data = await res.json()
            if (data.success) {
                router.refresh()
            } else {
                alert(data.error || "Error al eliminar")
            }
        } catch {
            alert("Error al eliminar")
        }
        setLoading(false)
    }

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 hover:bg-red-50 rounded-lg disabled:opacity-50"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
        </button>
    )
}
