"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Eye } from "lucide-react"

interface StockDetail {
    almacen: { nombre: string; ciudad: string }
    stock: number
}

export function BotonVerStock({ stocks }: { stocks: StockDetail[] }) {
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <button className="p-2 hover:bg-slate-100 rounded-lg">
                <Eye className="h-4 w-4 text-slate-400" />
            </button>
        )
    }

    if (!open) {
        return (
            <button 
                onClick={() => setOpen(true)}
                className="p-2 hover:bg-blue-50 rounded-lg"
            >
                <Eye className="h-4 w-4 text-blue-600" />
            </button>
        )
    }

    return (
        <>
            <button 
                onClick={() => setOpen(true)}
                className="p-2 hover:bg-blue-50 rounded-lg"
            >
                <Eye className="h-4 w-4 text-blue-600" />
            </button>
            
            {open && createPortal(
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" role="dialog">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
                        <div className="flex justify-between items-center p-4 border-b border-slate-200">
                            <h2 className="text-lg font-bold text-slate-900">Detalle de Stock</h2>
                            <button onClick={() => setOpen(false)} className="p-1 hover:bg-slate-100 rounded text-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 6 6 18M6 6l12 12"/>
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-4">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="text-left px-3 py-2 text-xs font-bold text-slate-500 uppercase">Almacen</th>
                                        <th className="text-left px-3 py-2 text-xs font-bold text-slate-500 uppercase">Ciudad</th>
                                        <th className="text-right px-3 py-2 text-xs font-bold text-slate-500 uppercase">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {stocks.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-3 py-4 text-center text-slate-500">
                                                Sin stock registrado
                                            </td>
                                        </tr>
                                    ) : (
                                        stocks.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-3 py-2 text-sm text-slate-900">{item.almacen?.nombre || "-"}</td>
                                                <td className="px-3 py-2 text-sm text-slate-600">{item.almacen?.ciudad || "-"}</td>
                                                <td className="px-3 py-2 text-sm text-right font-medium text-slate-900">
                                                    <span className={item.stock > 0 ? "text-green-600" : "text-red-500"}>
                                                        {item.stock} unidades
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                <tfoot className="bg-slate-50">
                                    <tr>
                                        <td colSpan={2} className="px-3 py-2 text-sm font-bold text-slate-700 text-right">TOTAL:</td>
                                        <td className="px-3 py-2 text-sm font-bold text-slate-900 text-right">
                                            {stocks.reduce((sum, item) => sum + item.stock, 0)} unidades
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}