"use client"

import { Eye } from "lucide-react"

interface Props {
    onClick: () => void
}

export function VerClienteButton({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="p-2 hover:bg-blue-50 rounded-lg"
            title="Ver detalle"
        >
            <Eye className="h-4 w-4 text-slate-600" />
        </button>
    )
}
