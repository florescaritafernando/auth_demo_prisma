import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=no-token", request.url))
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const response = await fetch(`${baseUrl}/api/auth/verify-email?token=${token}`, {
      method: "GET",
      redirect: "manual",
    })

    // Solo establecer cookie cuando la verificación fue exitosa (200 o 307)
    if (response.status === 200) {
      const redirectResponse = NextResponse.redirect(new URL("/verify-success", baseUrl))
      redirectResponse.cookies.set("email_verified", "true", {
        httpOnly: true,
        maxAge: 300,
        path: "/",
      })
      return redirectResponse
    }

    // Si es 307, better-auth hace el redirect internamente - verificar éxito
    if (response.status === 307) {
      const location = response.headers.get("location")
      // Siredirect a la página de verificación de better-auth, significa éxito
      if (location?.includes("verify-email") || location === "/") {
        const redirectResponse = NextResponse.redirect(new URL("/verify-success", baseUrl))
        redirectResponse.cookies.set("email_verified", "true", {
          httpOnly: true,
          maxAge: 300,
          path: "/",
        })
        return redirectResponse
      }
    }

    // Otros errores - redirigir a login con error
    console.log("Verification failed with status:", response.status)
    return NextResponse.redirect(new URL("/login?error=verification-failed", baseUrl))

  } catch (error) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    console.error("Verify email error:", error)
    return NextResponse.redirect(new URL("/login?error=verification-failed", baseUrl))
  }
}