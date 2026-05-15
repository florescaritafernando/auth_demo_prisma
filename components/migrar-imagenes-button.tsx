"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Cloud, Loader2 } from "lucide-react"

export function MigrarImagenesButton() {
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleMigrar = async () => {
        if (!confirm("¿Migrar todas las imágenes locales a Cloudinary?")) return
        
        setLoading(true)
        setResult(null)
        
        try {
            const res = await fetch("/api/productos/migrar", {
                method: "POST",
                credentials: "include"
            })
            const data = await res.json()
            setResult(data)
        } catch (error) {
            setResult({ success: false, error: "Error de conexión" })
        }
        
        setLoading(false)
    }

    return (
        <div className="flex flex-col gap-2">
            <Button 
                onClick={handleMigrar} 
                disabled={loading}
                variant="outline"
                className="gap-2"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Cloud className="h-4 w-4" />
                )}
                Migrar imágenes a Cloudinary
            </Button>
            
            {result && (
                <div className={`p-3 rounded-lg text-sm ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {result.success ? (
                        <>
                            <p className="font-medium">✓ Migración completada</p>
                            <p className="text-xs mt-1">{result.message}</p>
                        </>
                    ) : (
                        <p>✗ Error: {result.error}</p>
                    )}
                </div>
            )}
        </div>
    )
}