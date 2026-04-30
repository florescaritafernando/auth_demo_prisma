"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { GalleryVerticalEndIcon } from "lucide-react"
import { registerEmail } from "@/server/auth-actions"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
      setError(err.message || "Error al registering")
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEndIcon className="size-6" />
              </div>
              <span className="sr-only">Manchester Colletion Peru</span>
            </a>
            <h1 className="text-xl font-bold">Crear Cuenta</h1>
            <FieldDescription>
              ¿Ya tienes una cuenta? <a href="/login" className="text-blue-600 hover:underline">Iniciar sesión</a>
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Nombre completo</FieldLabel>
            <Input name="name"
              id="name"
              type="text"
              placeholder="Ingrese su nombre"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <Input name="email"
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Input name="password"
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirmar contraseña</FieldLabel>
            <Input name="confirmPassword"
              id="confirmPassword"
              type="password"
              placeholder="Repita su contraseña"
              required
              minLength={6}
            />
          </Field>
          {error && (
            <p className="text-red-600 text-sm px-2">{error}</p>
          )}
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <Button onClick={() => window.history.back()}>
        Volver al Inicio
      </Button>
    </div>
  )
}
