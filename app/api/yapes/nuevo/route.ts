import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import crypto from "crypto"

const SCRIPTS_DIR = path.join(process.cwd(), "scripts")
const PYTHON_PATH = process.env.PYTHON_PATH || "python"

interface BatchEntry {
    nombre: string
    monto: string
    fecha: string
}

interface BatchResult {
    nombre: string
    monto: string
    fecha: string
}

interface PendingBatch {
    status: "processing" | "success" | "error"
    results?: BatchResult[]
    error?: string
    timestamp: number
}

const pendingBatches = new Map<string, PendingBatch>()

setInterval(() => {
    const now = Date.now()
    for (const [key, value] of pendingBatches) {
        if (now - value.timestamp > 5 * 60 * 1000) {
            pendingBatches.delete(key)
        }
    }
}, 60_000)

function runBatchPython(entries: BatchEntry[]) {
    return new Promise<{ success: boolean; count?: number; results?: BatchResult[]; error?: string }>((resolve) => {
        const proc = spawn(PYTHON_PATH, [
            path.join(SCRIPTS_DIR, "agregar_yapes_batch.py"),
            "--json", JSON.stringify(entries),
        ], { cwd: SCRIPTS_DIR, timeout: 60000 })

        let stdout = ""
        let stderr = ""

        proc.stdout.on("data", (data: Buffer) => { stdout += data.toString() })
        proc.stderr.on("data", (data: Buffer) => { stderr += data.toString() })

        proc.on("close", (code) => {
            if (code === 0) {
                try {
                    const parsed = JSON.parse(stdout.trim())
                    resolve(parsed)
                } catch {
                    resolve({ success: true, count: entries.length })
                }
            } else {
                resolve({ success: false, error: stderr || stdout || "Error desconocido" })
            }
        })

        proc.on("error", (err) => {
            resolve({ success: false, error: err.message })
        })
    })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        let entries: BatchEntry[]

        if (Array.isArray(body)) {
            entries = body
        } else if (body.entries && Array.isArray(body.entries)) {
            entries = body.entries
        } else {
            entries = [{ nombre: body.nombre, monto: body.monto, fecha: body.fecha }]
        }

        for (const e of entries) {
            if (!e.nombre || e.monto === undefined || !e.fecha) {
                return NextResponse.json(
                    { error: "Cada entrada requiere: nombre, monto, fecha" },
                    { status: 400 }
                )
            }
        }

        if (entries.length === 0) {
            return NextResponse.json({ error: "No hay entradas para procesar" }, { status: 400 })
        }

        const batchId = crypto.randomUUID()

        const result = await Promise.race([
            runBatchPython(entries),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 30_000))
        ])

        if (result === null) {
            pendingBatches.set(batchId, { status: "processing", timestamp: Date.now() })

            runBatchPython(entries).then((r) => {
                if (r.success) {
                    pendingBatches.set(batchId, { status: "success", results: r.results, timestamp: Date.now() })
                } else {
                    pendingBatches.set(batchId, { status: "error", error: r.error, timestamp: Date.now() })
                }
            })

            return NextResponse.json({ batchId, status: "pending", count: entries.length }, { status: 202 })
        }

        if (result.success) {
            return NextResponse.json({
                batchId,
                status: "success",
                count: result.count ?? entries.length,
                results: result.results,
            })
        }

        return NextResponse.json(
            { error: result.error || "Error al agregar registros YAPE" },
            { status: 500 }
        )
    } catch (error) {
        console.error("Error adding YAPE records:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error interno del servidor" },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    const batchId = request.nextUrl.searchParams.get("batchId")

    if (!batchId) {
        return NextResponse.json({ error: "Falta el parámetro batchId" }, { status: 400 })
    }

    const entry = pendingBatches.get(batchId)

    if (!entry) {
        return NextResponse.json({ status: "not_found" })
    }

    return NextResponse.json(entry)
}
