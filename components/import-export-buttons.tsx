"use client"

import { useState, useRef } from "react"
import { Download, Upload, Printer, FileDown, X, Check, AlertCircle, FileText, RotateCcw } from "lucide-react"

interface ParsedRow {
    data: Record<string, string>
    errors: string[]
    valid: boolean
}

export function BotonesImportExport() {
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [step, setStep] = useState<"select" | "preview">("select")
    const [parsedData, setParsedData] = useState<ParsedRow[]>([])
    const [fileName, setFileName] = useState("")
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const [successMessage, setSuccessMessage] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const parseCSV = (text: string): Record<string, string>[] => {
        const lines = text.split(/\r?\n/).filter(l => l.trim())
        if (lines.length < 2) return []

        const parseRow = (row: string): string[] => {
            const result: string[] = []
            let current = ""
            let inQuotes = false
            
            for (let i = 0; i < row.length; i++) {
                const char = row[i]
                if (char === '"') {
                    if (inQuotes && row[i + 1] === '"') {
                        current += '"'
                        i++
                    } else {
                        inQuotes = !inQuotes
                    }
                } else if (char === ',' && !inQuotes) {
                    result.push(current.trim())
                    current = ""
                } else {
                    current += char
                }
            }
            result.push(current.trim())
            return result
        }

        const headers = parseRow(lines[0]).map(h => h.toLowerCase().trim())
        
        if (!headers[0] || !headers[0].includes('nombre')) return []
        
        return lines.slice(1).filter(line => line.trim()).map(line => {
            const values = parseRow(line)
            const obj: Record<string, string> = {}
            headers.forEach((h, i) => {
                obj[h] = values[i] || ""
            })
            return obj
        })
    }

    const validateRow = (row: Record<string, string>): ParsedRow => {
        const errors: string[] = []
        
        const nombre = row.nombre || ""
        const categoria = row.categoria || ""
        const precio = parseFloat(row.precio) || 0
        const descripcion = row.descripcion || ""
        const activo = row.activo || "SI"

        if (!nombre) errors.push("Falta nombre")
        if (!categoria) errors.push("Falta categoría")
        if (!precio || precio <= 0) errors.push("Precio inválido")

        const stockKeys = Object.keys(row).filter(k => k.startsWith('stock_'))
        
        return {
            data: {
                nombre,
                categoria,
                descripcion,
                precio: precio.toString(),
                activo,
                ...Object.fromEntries(stockKeys.map(k => [k, row[k] || "0"]))
            },
            errors,
            valid: errors.length === 0
        }
    }

    const getStockColumns = () => {
        const seen = new Set<string>()
        parsedData.forEach(p => {
            Object.keys(p.data).forEach(k => {
                const lower = k.toLowerCase()
                if (lower.startsWith('stock_') || lower === 'lima' || lower === 'cusco' || lower === 'arequipa' || lower === 'trujillo') {
                    seen.add(k)
                }
            })
        })
        return Array.from(seen).sort()
    }

    const handleOpenModal = () => {
        setShowModal(true)
        setStep("select")
        setParsedData([])
        setFileName("")
        setTimeout(() => fileInputRef.current?.click(), 100)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setFileName(file.name)

        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target?.result as string || ""
            const rawData = parseCSV(text)
            
            if (rawData.length === 0) {
                alert("No se encontraron datos. Asegúrate que el CSV tenga la cabecera 'nombre'")
                return
            }

            const validated = rawData.map(validateRow)
            setParsedData(validated)
            setStep("preview")
        }
        reader.readAsText(file)
        e.target.value = ""
    }

    const handleChangeFile = () => {
        setParsedData([])
        setStep("select")
        setTimeout(() => fileInputRef.current?.click(), 100)
    }

    const handleRemoveFile = () => {
        setParsedData([])
        setFileName("")
        setStep("select")
    }

    const handleConfirmImport = async () => {
        setLoading(true)
        try {
            const data = parsedData.map(p => p.data)
            const importPayload = { data, mode: "create" as const }
            console.log("Sending import:", { mode: "create", dataCount: data.length, sample: data[0], payload: importPayload }) // Debug
            const res = await fetch("/api/productos/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(importPayload),
                credentials: "include"
            })
            const result = await res.json()
            console.log("Import result:", result) // Debug
            
            if (result.success) {
                setSuccessMessage(result.message || "Importación exitosa!")
                setShowSuccessModal(true)
            } else {
                alert(`Error: ${result.error}`)
            }
        } catch (err) {
            console.error("Error importing:", err)
            alert("Error al importar")
        } finally {
            setLoading(false)
        }
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setParsedData([])
        setFileName("")
    }

    const handleExportCsv = () => {
        setLoading(true)
        window.location.href = "/api/productos/export?format=csv"
        setTimeout(() => setLoading(false), 2000)
    }

    const handleExportPdf = () => {
        setLoading(true)
        window.location.href = "/api/productos/export?format=pdf"
        setTimeout(() => setLoading(false), 2000)
    }

    const validCount = parsedData.filter(p => p.valid).length
    const errorCount = parsedData.filter(p => !p.valid).length
    const hasErrors = errorCount > 0

    const renderSelectStep = () => (
        <div className="p-8 text-center">
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-12 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
                <FileText className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                <p className="text-lg font-medium text-slate-700 mb-2">Seleccionar archivo</p>
                <p className="text-sm text-slate-500">Arrastra o haz clic para buscar</p>
                <p className="text-xs text-slate-400 mt-4">Formatos: .csv, .xlsx, .xls</p>
            </div>
            <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv,.xlsx,.xls" 
                onChange={handleFileSelect}
                className="hidden" 
            />
        </div>
    )

    const renderPreviewStep = () => (
        <>
            <div className="p-3 border-b bg-slate-100 flex justify-between items-center">
                <div className="flex gap-4 text-sm">
                    <span className="font-medium text-slate-700">Archivo: <span className="font-bold">{fileName}</span></span>
                    <span className="text-green-600 font-medium">{validCount} válidos</span>
                    {hasErrors && <span className="text-red-600 font-medium">{errorCount} errores</span>}
                </div>
                <button onClick={handleChangeFile} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                    <RotateCcw className="h-3 w-3" /> Cambiar
                </button>
            </div>

            <div className="p-3 border-b bg-yellow-50">
                <div className="text-xs text-yellow-700">
                    <span className="font-medium">Campos esperados: </span>
                    <span className="text-green-600">nombre</span>
                    <span className="text-yellow-700">, </span>
                    <span className="text-green-600">categoria</span>
                    <span className="text-yellow-700">, </span>
                    <span className="text-green-600">descripcion</span>
                    <span className="text-yellow-700">, </span>
                    <span className="text-green-600">precio</span>
                    <span className="text-yellow-700">, </span>
                    <span className="text-green-600">activo</span>
                    <span className="text-yellow-700">, </span>
                    <span className="text-green-600">almacenes</span>
                </div>
            </div>

            <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-200 sticky top-0">
                        <tr>
                            <th className="px-2 py-2 text-left font-medium text-slate-800 w-10">Estado</th>
                            <th className="px-2 py-2 text-left font-medium text-slate-800">Nombre</th>
                            {getStockColumns().map(col => (
                                <th key={col} className="px-2 py-2 text-left font-medium text-slate-800 w-20">
                                    {col.replace('stock_', 'Stock ').toUpperCase()}
                                </th>
                            ))}
                            {hasErrors && <th className="px-2 py-2 text-left font-medium text-slate-800 w-32">Errores</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {parsedData.map((row, i) => (
                            <tr key={i} className={`border-t ${row.valid ? 'bg-white' : 'bg-red-50'}`}>
                                <td className="px-2 py-2">
                                    {row.valid ? <Check className="h-4 w-4 text-green-600" /> : <AlertCircle className="h-4 w-4 text-red-600" />}
                                </td>
                                <td className="px-2 py-2 text-slate-800">{row.data.nombre || '-'}</td>
                                {getStockColumns().map(col => (
                                    <td key={col} className="px-2 py-2 text-slate-600">{row.data[col] || '0'}</td>
                                ))}
                                {hasErrors && (
                                    <td className="px-2 py-2 text-red-600 text-xs">{row.errors.join(', ')}</td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="px-4 py-3 border-t bg-slate-100 text-sm text-slate-700">
                Registros: {parsedData.length} correctamente evaluado
            </div>

            <div className="px-4 py-3 border-t bg-slate-100 flex justify-between">
                <button onClick={handleRemoveFile} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                    <X className="h-4 w-4" />
                    Quitar archivo
                </button>
                <div className="flex gap-3">
                    <button onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                        Cancelar
                    </button>
                    <button onClick={handleConfirmImport} disabled={loading || validCount === 0} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? 'Importando...' : `Importar (${validCount})`}
                    </button>
                </div>
            </div>
        </>
    )

    return (
        <>
            <div className="flex flex-wrap gap-2 items-center">
                <button
                    onClick={() => window.location.href = "/api/productos/plantilla"}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200"
                >
                    <FileDown className="h-4 w-4" />
                    Plantilla CSV
                </button>

                <button onClick={handleOpenModal} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
                    <Upload className="h-4 w-4" />
                    Importar .csv
                </button>

                <button onClick={handleExportPdf} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50">
                    <Printer className="h-4 w-4" />
                    Imprimir PDF
                </button>

                <button onClick={handleExportCsv} disabled={loading} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                    <Download className="h-4 w-4" />
                    Exportar .csv
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                        <div className="bg-slate-800 text-white px-6 py-4 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6" />
                                <div>
                                    <h2 className="text-lg font-bold">Importar Productos</h2>
                                    <p className="text-sm text-slate-300">
                                        {step === "select" ? "Selecciona un archivo" : `${fileName} (${parsedData.length} registros)`}
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleCloseModal} className="p-1 hover:bg-slate-700 rounded">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {step === "select" ? renderSelectStep() : renderPreviewStep()}
                    </div>
                </div>
            )}

            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
                        <div className="p-8 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800 mb-2">Importación Exitosa!</h2>
                            <p className="text-slate-600 mb-6">{successMessage}</p>
                            <button 
                                onClick={() => {
                                    setShowSuccessModal(false)
                                    setShowModal(false)
                                    window.location.reload()
                                }}
                                className="px-6 py-2 w-full text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}