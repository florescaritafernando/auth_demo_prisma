"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, UserPlus, ArrowLeft, CheckCircle } from "lucide-react"
import { registerEmail } from "@/server/auth-actions"
import Link from "next/link"

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [emailValue, setEmailValue] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      await registerEmail(formData as any)
      setEmailValue(formData.get("email") as string)
      setSuccess(true)
      setIsLoading(false)
    } catch (err: any) {
      setError(err.message || "Error al registrar")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 flex items-center justify-center rounded-2xl mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
            ¡Cuenta Creada!
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-2">
            Se ha enviado un enlace de verificación a
          </p>
          <p className="text-base font-medium text-slate-900 mb-6">
            {emailValue}
          </p>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
          <div className="pt-6 border-t border-slate-100 w-full">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Ir al inicio de sesión
            </Link>
            <div className="mt-6">
              <Button
                variant="outline"
                type="button"
                onClick={() => window.location.href = "/"}
                className="w-full mt-4 py-2.5 border border-slate-400 shadow-sm text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-700 hover:shadow-md hover:text-slate-900 font-medium rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a la página principal
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <Link href="/" className="flex flex-col items-center gap-2 font-medium mb-6">
          <div className="w-12 h-12 bg-slate-900 flex items-center justify-center rounded-xl shadow-lg shadow-slate-900/20">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <span className="sr-only">Manchester Collection Peru</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Crear Cuenta
        </h1>
        <p className="text-sm text-slate-600">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-slate-900 font-medium hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label htmlFor="name" className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
              Nombre completo
            </label>
            <Input
              name="name"
              id="name"
              type="text"
              placeholder="Juan Pérez"
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0 transition-colors duration-200"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
              Correo electrónico
            </label>
            <Input
              name="email"
              id="email"
              type="email"
              placeholder="tu@correo.com"
              required
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0 transition-colors duration-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
              Contraseña
            </label>
            <div className="relative">
              <Input
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0 transition-colors duration-200 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
              Confirmar contraseña
            </label>
            <div className="relative">
              <Input
                name="confirmPassword"
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Repite tu contraseña"
                required
                minLength={6}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0 transition-colors duration-200 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
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
                Creando cuenta...
              </span>
            ) : "Crear Cuenta"}
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Al registrarte, aceptas nuestros{" "}
          <a href="#" className="text-slate-600 hover:underline">Términos de Servicio</a>{" "}
          y{" "}
          <a href="#" className="text-slate-600 hover:underline">Política de Privacidad</a>.
        </p>
      </div>

      <div className="mt-6">
        <Button
          variant="outline"
          type="button"
          onClick={() => window.location.href = "/"}
          className="w-full mt-4 py-2.5 border border-slate-400 shadow-sm text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-700 hover:shadow-md hover:text-slate-900 font-medium rounded-lg transition-all duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la página principal
        </Button>

      </div>
    </div>
  )
}