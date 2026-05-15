import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function VerifySuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
          ¡Correo verificado exitosamente!
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Tu correo electrónico ha sido confirmado. Ahora puedes iniciar sesión.
        </p>
        <p className="text-xs text-slate-500 mb-6">
          Redirigiendo al login...
        </p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors duration-200"
        >
          Ir al inicio de sesión
        </Link>
        <meta httpEquiv="refresh" content="5;url=/login" />
      </div>
    </div>
  )
}