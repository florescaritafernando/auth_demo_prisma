import { CheckCircle } from "lucide-react"

export default function VerifySuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ¡Correo verificado exitosamente!
        </h1>
        <p className="text-gray-600 mb-4">
          Tu correo electrónico ha sido confirmado. Ahora puedes iniciar sesión.
        </p>
        <p className="text-sm text-gray-500">
          Redirigiendo al login...
        </p>
        <meta httpEquiv="refresh" content="5;url=/login" />
      </div>
    </div>
  )
}