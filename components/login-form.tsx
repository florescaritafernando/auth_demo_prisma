"use client"

import { useState, useEffect } from "react"
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
import { GalleryVerticalEndIcon, CheckCircle } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

export function LoginForm({
  className,
  registeredEmail = null,
  emailVerified = false,
  ...props
}: React.ComponentProps<"div"> & {
  registeredEmail?: string | null
  emailVerified?: boolean
}) {
  const [emailDisplay, setEmailDisplay] = useState(registeredEmail)
  const [showVerifiedAlert, setShowVerifiedAlert] = useState(emailVerified)

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

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message || "Error al iniciar sesión");
      setIsLoading(false);
      return;
    }

    // Redirect to dashboard explicitly 
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLogin}>
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
            <h1 className="text-xl font-bold">Bienvenido a Manchester Colletion Peru</h1>
            <FieldDescription>
              ¿No tienes una cuenta? <a href="/signup">Registrate</a>
            </FieldDescription>
          </div>

          {showVerifiedAlert && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">
                Email verificado exitosamente. Ya puedes iniciar sesión.
              </span>
            </div>
          )}

          {!showVerifiedAlert && emailDisplay && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-medium">
                Cuenta creada. Verifica tu correo {emailDisplay ? `(${emailDisplay})` : ""} para activar tu cuenta.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-md">
              {errorMsg}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              name="email"
              id="email"
              type="email"
              placeholder="Ingrese su correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              name="password"
              id="password"
              type="password"
              placeholder="ingrese su clave"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Iniciando..." : "Login"}
            </Button>
          </Field>
          <div className="flex items-center justify-center">
            <a href="/forgot-password" className="text-sm text-slate-600 hover:text-slate-900 hover:underline">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <FieldSeparator>O</FieldSeparator>
          <Field className="grid gap-4 sm:grid-cols-1">
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
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continuar con Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
      <Button onClick={() => window.location.href = "/"}>
        Volver a la página principal
      </Button>
    </div>
  )
}
