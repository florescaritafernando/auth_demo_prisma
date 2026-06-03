import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs"
import crypto from "crypto"

const TEMP_DIR = path.join(process.cwd(), "temp")
const SCRIPTS_DIR = path.join(process.cwd(), "scripts")

export async function POST(request: NextRequest) {
    let outputPath: string | null = null

    try {
        const { fechaInicio, fechaFin } = await request.json()

        const id = crypto.randomUUID()
        outputPath = path.join(TEMP_DIR, `${id}.pdf`)
        const args: string[] = [
            path.join(SCRIPTS_DIR, "generar_yapes.py"),
            "--output", outputPath,
        ]

        if (fechaInicio) args.push("--fecha-inicio", fechaInicio)
        if (fechaFin) args.push("--fecha-fin", fechaFin)

        const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
            const proc = spawn("python", args, {
                cwd: SCRIPTS_DIR,
                timeout: 60000,
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

        if (!result.success || !outputPath) {
            return NextResponse.json(
                { error: result.error || "Error al generar PDF de YAPES" },
                { status: 500 }
            )
        }

        if (!fs.existsSync(outputPath)) {
            return NextResponse.json(
                { error: "No se generó el PDF" },
                { status: 500 }
            )
        }

        const pdfBuffer = fs.readFileSync(outputPath)
        const filename = `yapes-${id}.pdf`

        return new NextResponse(new Blob([pdfBuffer], { type: "application/pdf" }), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error("Error generating YAPES PDF:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error interno del servidor" },
            { status: 500 }
        )
    } finally {
        if (outputPath && fs.existsSync(outputPath)) {
            try { fs.unlinkSync(outputPath) } catch { /* ignore */ }
        }
    }
}
