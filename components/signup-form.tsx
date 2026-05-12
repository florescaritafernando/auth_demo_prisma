"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle } from "lucide-react"
import { registerEmail } from "@/server/auth-actions"
import Link from "next/link"

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

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
    } catch (err: any) {
      setError(err.message || "Error al registrar")
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <Link href="/" className="flex flex-col items-center gap-2 font-medium mb-6">
          <div className="w-10 h-10 bg-slate-900 flex items-center justify-center rounded-md">
            <span className="text-white text-xl font-bold">M</span>
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
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">
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
            <label htmlFor="email" className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">
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
            <label htmlFor="password" className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">
              Contraseña
            </label>
            <Input 
              name="password"
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0 transition-colors duration-200"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="text-xs text-slate-500 uppercase tracking-wide mb-1 block">
              Confirmar contraseña
            </label>
            <Input 
              name="confirmPassword"
              id="confirmPassword"
              type="password"
              placeholder="Repite tu contraseña"
              required
              minLength={6}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0 transition-colors duration-200"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
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
          variant="ghost" 
          onClick={() => window.location.href = "/login"}
          className="w-full py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
        >
          Volver al inicio de sesión
        </Button>
      </div>
    </div>
  )
}