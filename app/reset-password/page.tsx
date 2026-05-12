"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GalleryVerticalEndIcon, AlertCircle, CheckCircle } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Suspense } from "react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: password,
        token: token || undefined,
      })

      if (error) {
        setError(error.message || "Error al restablecer la contraseña")
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

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEndIcon className="size-6" />
            </div>
            <h1 className="text-xl font-bold">Enlace Inválido</h1>
            <FieldDescription>
              El enlace de recuperación ha expirado o es inválido. Solicita uno nuevo.
            </FieldDescription>
          </div>

          <div className="flex items-center justify-center">
            <a
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Solicitar nuevo enlace
            </a>
          </div>
        </FieldGroup>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6")}>
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
            <h1 className="text-xl font-bold">Nueva Contraseña</h1>
            <FieldDescription>
              Ingresa tu nueva contraseña.
            </FieldDescription>
          </div>

          {success && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">
                ¡Contraseña actualizada exitosamente!
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
            <>
              <Field>
                <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
                <Input
                  name="password"
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
                <Input
                  name="confirmPassword"
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite tu nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Field>

              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Guardando..." : "Guardar nueva contraseña"}
                </Button>
              </Field>
            </>
          )}

          {success && (
            <div className="flex items-center justify-center">
              <a
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Ir al inicio de sesión
              </a>
            </div>
          )}
        </FieldGroup>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-slate-50 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
