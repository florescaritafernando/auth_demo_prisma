import { LoginForm } from "@/components/login-form"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function LoginPage() {
  const cookieStore = await cookies()

  // Leer los valores pero también limpiar las cookies inmediatamente
  const registeredEmail = cookieStore.get("registration_success")?.value || null
  const emailVerified = cookieStore.get("email_verified")?.value || null


  // Limpiar cookies leyéndolas y luego eliminándolas
  // Las cookies se pasarán al componente y se limpiarán allí también

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-md">
        <LoginForm
          registeredEmail={registeredEmail}
          emailVerified={emailVerified === "true"}
        />
      </div>
    </div>
  )
}