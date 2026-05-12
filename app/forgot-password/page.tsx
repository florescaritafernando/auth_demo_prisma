"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const { data, error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message || "Error al enviar el correo de recuperación")
        setIsLoading(false)
        return
      }

      setSuccess(true)
      setIsLoading(false)
    } catch (err: any) {
      setError(err.message || "Error al procesar la solicitud")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="flex flex-col items-center gap-2 font-medium mb-8">
              <div className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-md">
                <span className="text-white text-xl font-bold">M</span>
              </div>
              <span className="sr-only">Manchester Collection Peru</span>
            </Link>
            
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              Recuperar Contraseña
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">
                Se envió un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada.
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">
                  Correo electrónico
                </label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0 transition-colors duration-200"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
              </Button>
            </div>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}