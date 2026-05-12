"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GalleryVerticalEndIcon, CheckCircle, AlertCircle } from "lucide-react"
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
      const { data, error } = await authClient.forgetPassword({
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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-slate-50 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <a
                  href="/"
                  className="flex flex-col items-center gap-2 font-medium"
                >
                  <div className="flex size-8 items-center justify-center rounded-md">
                    <GalleryVerticalEndIcon className="size-6" />
                  </div>
                  <span className="sr-only">Manchester Collection Peru</span>
                </a>
                <h1 className="text-xl font-bold">Recuperar Contraseña</h1>
                <FieldDescription>
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </FieldDescription>
              </div>

              {success && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium">
                    Se envió un enlace de recuperación a {email}. Revisa tu bandeja de entrada.
                  </span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {!success && (
                <Field>
                  <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
                  <Input
                    name="email"
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Field>
              )}

              {!success && (
                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                  </Button>
                </Field>
              )}

              <div className="flex items-center justify-center">
                <a
                  href="/login"
                  className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
                >
                  Volver al inicio de sesión
                </a>
              </div>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  )
}
