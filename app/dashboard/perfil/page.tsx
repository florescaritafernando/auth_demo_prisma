"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Camera, Save, Loader2, Bell, BellOff } from "lucide-react"

interface Usuario {
    id: string
    name: string
    email: string
    image: string | null
    role: string
    celular: string | null
    preferencias: { sonidoNotificaciones?: boolean } | null
}

export default function PerfilPage() {
    const [usuario, setUsuario] = useState<Usuario | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [editando, setEditando] = useState(false)
    const [name, setName] = useState("")
    const [celular, setCelular] = useState("")
    const [previewImage, setPreviewImage] = useState<string | null>(null)
    const [sonidoNotificaciones, setSonidoNotificaciones] = useState(true)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
    const [facturacionTemplates, setFacturacionTemplates] = useState<any[]>([])
    const [direccionTemplates, setDireccionTemplates] = useState<any[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchUsuario()
        loadTemplates()
    }, [])

    const loadTemplates = async () => {
        try {
            const [factRes, dirRes] = await Promise.all([
                fetch("/api/datos-facturacion", { credentials: "include" }),
                fetch("/api/datos-direccion", { credentials: "include" })
            ])
            const factJson = await factRes.json()
            const dirJson = await dirRes.json()
            if (factJson.success) setFacturacionTemplates(factJson.templates || [])
            if (dirJson.success) setDireccionTemplates(dirJson.templates || [])
        } catch (e) {
            console.error("Error loading templates:", e)
        }
    }

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    const showToast = (message: string, type: "success" | "error") => {
        setToast({ message, type })
    }

    const fetchUsuario = async () => {
        try {
            console.log("Iniciando fetch para obtener usuario...")
            const res = await fetch("/api/usuarios?propio=true", { 
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            const json = await res.json()
            console.log("Fetch usuario response:", JSON.stringify(json), "status:", res.status)
            console.log("Usuario received:", json.usuario)
            
            if (json.success && json.usuario) {
                setUsuario(json.usuario)
                setName(json.usuario.name || "")
                setCelular(json.usuario.celular || "")
                setPreviewImage(json.usuario.image)
                const prefs = json.usuario.preferencias as Record<string, boolean> | null
                setSonidoNotificaciones(prefs?.sonidoNotificaciones !== false)
                console.log("Usuario cargado:", json.usuario.name, json.usuario.email)
            } else {
                setError(json.error || "Error al cargar datos")
                console.log("Error en respuesta:", json.error || "Sin éxito")
            }
        } catch (e) {
            console.error("Error fetching usuario:", e)
        } finally {
            setLoading(false)
        }
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (ev) => {
            setPreviewImage(ev.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleUpload = async (): Promise<string | null> => {
        const file = fileInputRef.current?.files?.[0]
        if (!file) return previewImage

        setSaving(true)
        try {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("tipo", "perfil")

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const json = await res.json()
            
            if (json.success) {
                return json.url
            }
            return null
        } catch (e) {
            console.error("Error uploading:", e)
            return null
        } finally {
            setSaving(false)
        }
    }

    const handleSave = async () => {
        setSaving(true)

        try {
            let imageUrl = previewImage
            
            // Si hay archivo nuevo, subirlo
            if (fileInputRef.current?.files?.[0]) {
                const url = await handleUpload()
                if (url) imageUrl = url
            }

            const prefs = { sonidoNotificaciones }

            const res = await fetch("/api/usuarios", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    name, 
                    image: imageUrl,
                    celular,
                    preferencias: prefs
                }),
                credentials: "include"
            })
            const json = await res.json()

            if (json.success) {
                setUsuario(json.usuario)
                showToast("Cambios guardados correctamente", "success")
                setEditando(false)
                if (fileInputRef.current) fileInputRef.current.value = ""
            } else {
                showToast(json.error || "Error al guardar", "error")
            }
        } catch (e) {
            showToast("Error de conexión", "error")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    <p className="font-medium">Error: {error}</p>
                    <button 
                        onClick={() => {
                            setError(null)
                            setLoading(true)
                            fetchUsuario()
                        }}
                        className="mt-2 text-sm underline"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            {toast && (
                <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-in fade-in slide-in-from-top-2 ${
                    toast.type === "success" ? "bg-green-600" : "bg-red-600"
                }`}>
                    {toast.message}
                </div>
            )}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Configuración de Perfil</h1>
                <button
                    onClick={() => {
                        if (editando) {
                            // Cancelar: restaurar valores originales
                            setName(usuario?.name || "")
                            setCelular(usuario?.celular || "")
                            setPreviewImage(usuario?.image || null)
                            if (fileInputRef.current) fileInputRef.current.value = ""
                        }
                        setEditando(!editando)
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        editando 
                            ? "bg-slate-200 text-slate-700 hover:bg-slate-300" 
                            : "bg-slate-800 text-white hover:bg-slate-700"
                    }`}
                >
                    {editando ? "Cancelar" : "Editar"}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
                {/* Foto de perfil */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        {previewImage ? (
                            <Image 
                                src={previewImage} 
                                alt="Foto de perfil" 
                                width={120} 
                                height={120} 
                                className="rounded-full object-cover border-4 border-slate-100"
                            />
                        ) : (
                            <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-slate-100">
                                {name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        {editando && (
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-slate-800 text-white p-2 rounded-full hover:bg-slate-700 transition-colors"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Haz clic en el ícono para cambiar tu foto</p>
                </div>

                {/* Nombre */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Nombre completo</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "").slice(0, 100)
                            setName(val)
                        }}
                        disabled={!editando}
                        readOnly={!editando}
                        className={`w-full px-4 py-2 border rounded-lg outline-none transition-colors ${
                            editando 
                                ? "bg-white text-black border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                : "bg-slate-50 text-black border-slate-200 cursor-not-allowed"
                        }`}
                        placeholder="Solo letras, máximo 100 caracteres"
                    />
                    <p className="text-xs text-slate-400 mt-1">{name.length}/100 caracteres</p>
                </div>

                {/* Celular */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Celular</label>
                    <input
                        type="tel"
                        value={celular}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 9)
                            setCelular(val)
                        }}
                        disabled={!editando}
                        readOnly={!editando}
                        className={`w-full px-4 py-2 border rounded-lg outline-none transition-colors ${
                            editando 
                                ? "bg-white text-black border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                                : "bg-slate-50 text-black border-slate-200 cursor-not-allowed"
                        }`}
                        placeholder="9 dígitos"
                        maxLength={9}
                    />
                    <p className="text-xs text-slate-400 mt-1">{celular.length}/9 dígitos</p>
                </div>

                {/* Email (solo lectura) */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Correo electrónico</label>
                    <input
                        type="email"
                        value={usuario?.email || ""}
                        disabled
                        readOnly
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-black cursor-not-allowed"
                    />
                </div>

                {/* Preferencias */}
                <div className="border-t border-slate-200 pt-4">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Preferencias</h2>
                    
                    <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                        <div className="flex items-center gap-3">
                            {sonidoNotificaciones ? (
                                <Bell className="h-5 w-5 text-blue-600" />
                            ) : (
                                <BellOff className="h-5 w-5 text-slate-400" />
                            )}
                            <div>
                                <p className="font-medium text-slate-800">Sonido de notificaciones</p>
                                <p className="text-sm text-slate-500">Reproducir un sonido al recibir notificaciones</p>
                            </div>
                        </div>
                        <div 
                            className={`relative w-12 h-6 rounded-full transition-colors ${sonidoNotificaciones ? "bg-blue-600" : "bg-slate-300"}`}
                            onClick={() => setSonidoNotificaciones(!sonidoNotificaciones)}
                        >
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${sonidoNotificaciones ? "translate-x-7" : "translate-x-1"}`} />
                        </div>
                    </label>
                </div>

                {/* Plantillas de Facturación */}
                <div className="border-t border-slate-200 pt-4">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Plantillas de Facturación</h2>
                    {facturacionTemplates.length === 0 ? (
                        <p className="text-slate-500 text-sm">No tienes plantillas guardadas.</p>
                    ) : (
                        <div className="space-y-2">
                            {facturacionTemplates.map(t => (
                                <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-black">{t.nombre}</p>
                                        <p className="text-xs text-slate-500">{t.tipoDocumento.toUpperCase()}: {t.numeroDoc} - {t.nombreFactura}</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (confirm("¿Eliminar esta plantilla?")) {
                                                try {
                                                    await fetch(`/api/datos-facturacion?id=${t.id}`, { 
                                                        method: "DELETE",
                                                        credentials: "include" 
                                                    })
                                                    setFacturacionTemplates(facturacionTemplates.filter(x => x.id !== t.id))
                                                    showToast("Plantilla eliminada", "success")
                                                } catch (e) {
                                                    showToast("Error al eliminar", "error")
                                                }
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Direcciones de Envío */}
                <div className="border-t border-slate-200 pt-4">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Direcciones de Envío</h2>
                    {direccionTemplates.length === 0 ? (
                        <p className="text-slate-500 text-sm">No tienes direcciones guardadas.</p>
                    ) : (
                        <div className="space-y-2">
                            {direccionTemplates.map(t => (
                                <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-black">{t.nombre}</p>
                                        <p className="text-xs text-slate-500 capitalize">{t.metodoEnvio} - {t.agencia || t.delivery || "-"}</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (confirm("¿Eliminar esta dirección?")) {
                                                try {
                                                    await fetch(`/api/datos-direccion?id=${t.id}`, { 
                                                        method: "DELETE",
                                                        credentials: "include" 
                                                    })
                                                    setDireccionTemplates(direccionTemplates.filter(x => x.id !== t.id))
                                                    showToast("Dirección eliminada", "success")
                                                } catch (e) {
                                                    showToast("Error al eliminar", "error")
                                                }
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-700 text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Botón guardar - solo cuando editando */}
                {editando && (
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Save className="h-5 w-5" />
                        )}
                        <span>{saving ? "Guardando..." : "Guardar cambios"}</span>
                    </button>
                )}
            </div>
        </div>
    )
}