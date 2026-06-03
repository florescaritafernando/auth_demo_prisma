import { NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs"
import crypto from "crypto"

const TEMP_DIR = path.join(process.cwd(), "temp")
const SCRIPTS_DIR = path.join(process.cwd(), "scripts")

export async function POST(request: NextRequest) {
    let xmlPath: string | null = null
    let outputPath: string | null = null

    try {
        const formData = await request.formData()
        const xmlFile = formData.get("xml") as File | null
        const formato = (formData.get("formato") as string) || "ticket"

        if (!xmlFile) {
            return NextResponse.json({ error: "No se ha subido el archivo XML" }, { status: 400 })
        }

        if (!xmlFile.name.toLowerCase().endsWith(".xml")) {
            return NextResponse.json({ error: "El archivo debe ser un XML" }, { status: 400 })
        }

        const id = crypto.randomUUID()
        xmlPath = path.join(TEMP_DIR, `${id}.xml`)
        outputPath = path.join(TEMP_DIR, `${id}.pdf`)

        const bytes = await xmlFile.arrayBuffer()
        fs.writeFileSync(xmlPath, Buffer.from(bytes))

        const args: string[] = [
            path.join(SCRIPTS_DIR, "convertir_xml.py"),
            "--xml", xmlPath,
            "--output", outputPath,
            "--formato", formato,
        ]

        const agencia = formData.get("agencia") as string | null
        const otraAgencia = formData.get("otraAgencia") as string | null
        const notas = formData.get("notas") as string | null
        const recojeOtraPersona = formData.get("recojeOtraPersona") as string | null
        const recojeDni = formData.get("recojeDni") as string | null
        const recojeNombre = formData.get("recojeNombre") as string | null
        const recojeDireccion = formData.get("recojeDireccion") as string | null

        if (agencia) {
            args.push("--agencia", agencia)
        }
        if (otraAgencia) {
            args.push("--otra-agencia", otraAgencia)
        }
        if (notas) {
            args.push("--notas", notas)
        }
        if (recojeOtraPersona === "true") {
            if (recojeDni) args.push("--recoje-dni", recojeDni)
            if (recojeNombre) args.push("--recoje-nombre", recojeNombre)
            if (recojeDireccion) args.push("--recoje-direccion", recojeDireccion)
        }

        const result = await new Promise<{ success: boolean; error?: string }>((resolve) => {
            const proc = spawn("python", args, {
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

        if (!result.success || !outputPath) {
            return NextResponse.json(
                { error: result.error || "Error al convertir el XML" },
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
        const filename = `documento-${id}.pdf`

        return new NextResponse(new Blob([pdfBuffer], { type: "application/pdf" }), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error("Error converting XML:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Error interno del servidor" },
            { status: 500 }
        )
    } finally {
        if (xmlPath && fs.existsSync(xmlPath)) {
            try { fs.unlinkSync(xmlPath) } catch { /* ignore */ }
        }
        if (outputPath && fs.existsSync(outputPath)) {
            try { fs.unlinkSync(outputPath) } catch { /* ignore */ }
        }
    }
}
