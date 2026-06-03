import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

const SCRIPTS_DIR = path.join(process.cwd(), "scripts")
const PYTHON_PATH = process.env.PYTHON_PATH || "python"

export async function POST(request: NextRequest) {
    try {
        const { nombre, monto, fecha } = await request.json()

        if (!nombre || monto === undefined || !fecha) {
            return NextResponse.json(
                { error: "Faltan campos requeridos: nombre, monto, fecha" },
                { status: 400 }
            )
        }

        const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
            const proc = spawn(PYTHON_PATH, [
                path.join(SCRIPTS_DIR, "agregar_yape.py"),
                "--nombre", nombre,
                "--monto", String(monto),
                "--fecha", fecha,
            ], {
                cwd: SCRIPTS_DIR,
                timeout: 30000,
            })

            let stdout = ""
            let stderr = ""

            proc.stdout.on("data", (data: Buffer) => {
                stdout += data.toString()
            })

            proc.stderr.on("data", (data: Buffer) => {
                stderr += data.toString()
            })

            proc.on("close", (code) => {
                if (code === 0) {
                    try {
                        const parsed = JSON.parse(stdout.trim())
                        resolve(parsed)
                    } catch {
                        resolve({ success: true })
                    }
                } else {
                    resolve({ success: false, error: stderr || stdout || "Error desconocido" })
                }
            })

            proc.on("error", (err) => {
                resolve({ success: false, error: err.message })
            })
        })

        if (!result.success) {
            return NextResponse.json(
                { error: result.error || "Error al agregar registro YAPE" },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error adding YAPE record:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error interno del servidor" },
            { status: 500 }
        )
    }
}
