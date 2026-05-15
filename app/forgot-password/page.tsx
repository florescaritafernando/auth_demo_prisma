"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle, ArrowLeft, KeyRound } from "lucide-react"
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="flex flex-col items-center gap-2 font-medium mb-6">
              <div className="w-12 h-12 bg-slate-900 flex items-center justify-center rounded-xl shadow-lg shadow-slate-900/20">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <span className="sr-only">Manchester Collection Peru</span>
            </Link>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 flex items-center justify-center rounded-2xl mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                Correo Enviado
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                Se envió un enlace de recuperación a
              </p>
              <p className="text-base font-medium text-slate-900 mb-6">
                {email}
              </p>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Revisa tu bandeja de entrada y haz clic en el enlace para crear una nueva contraseña.
              </p>
              <div className="pt-6 border-t border-slate-100">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="email" className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
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
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : "Enviar enlace de recuperación"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center">
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}