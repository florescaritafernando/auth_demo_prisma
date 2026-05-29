"use client"

import { Wallet } from "lucide-react"

interface Props {
    onClick: () => void
}

export function VerClienteButton({ onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Ver cartera"
        >
            <Wallet className="h-4 w-4 text-emerald-600" />
        </button>
    )
}
