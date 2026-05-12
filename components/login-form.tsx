"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, AlertCircle, ArrowLeft, LogIn, Eye, EyeOff } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function LoginForm({
  registeredEmail = null,
  emailVerified = false,
}: {
  registeredEmail?: string | null
  emailVerified?: boolean
}) {
  const [emailDisplay, setEmailDisplay] = useState(registeredEmail)
  const [showVerifiedAlert, setShowVerifiedAlert] = useState(emailVerified)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (registeredEmail) {
      setEmailDisplay(registeredEmail)
      document.cookie = "registration_success=; path=/; max-age=0"
    }
  }, [registeredEmail])

  useEffect(() => {
    if (emailVerified) {
      setShowVerifiedAlert(true)
      document.cookie = "email_verified=; path=/; max-age=0"
    }
  }, [emailVerified])

  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg("")

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message || "Error al iniciar sesión")
      setIsLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <Link href="/" className="flex flex-col items-center gap-2 font-medium mb-6">
          <div className="w-12 h-12 bg-slate-900 flex items-center justify-center rounded-xl shadow-lg shadow-slate-900/20">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <span className="sr-only">Manchester Collection Perú</span>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
          Bienvenido
        </h1>
        <p className="text-sm text-slate-600">
          ¿No tienes una cuenta?{" "}
          <Link href="/signup" className="text-slate-900 font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>

      {showVerifiedAlert && (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            Email verificado exitosamente. Ya puedes iniciar sesión.
          </span>
        </div>
      )}

      {!showVerifiedAlert && emailDisplay && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">
            Cuenta creada. Verifica tu correo {emailDisplay ? `(${emailDisplay})` : ""} para activar tu cuenta.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleLogin}>
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

          <div>
            <label htmlFor="password" className="text-xs text-slate-500 uppercase tracking-wide mb-2 block">
              Contraseña
            </label>
            <div className="relative">
              <Input
                name="password"
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-0 transition-colors duration-200 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
                Iniciando...
              </span>
            ) : "Iniciar sesión"}
          </Button>
        </div>
      </form>

      <div className="mt-5 flex justify-center">
        <Link href="/forgot-password" className="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-500">O</span>
          </div>
        </div>

        <Button
          variant="outline"
          type="button"
          disabled={isLoading}
          onClick={async () => {
            try {
              const appUrl = window.location.origin
              await authClient.signIn.social({
                provider: "google",
                callbackURL: `${appUrl}/dashboard`,
              })
            } catch (error) {
              console.error("Google sign in error:", error)
            }
          }}
          className="w-full mt-4 py-2.5 border border-slate-400 shadow-sm text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-700 hover:shadow-md hover:text-slate-900 font-medium rounded-lg transition-all duration-200"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuar con Google
        </Button>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500">
          Al continuar, aceptas nuestros{" "}
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