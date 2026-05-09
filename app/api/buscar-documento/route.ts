import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    try {
        const { tipo, numero } = await request.json()

        if (!tipo || !numero) {
            return NextResponse.json({ error: "Faltan parametros" }, { status: 400 })
        }

        const token = process.env.NEXT_PUBLIC_API_DNI_TOKEN

        if (!token) {
            return NextResponse.json({ error: "Token no configurado" }, { status: 500 })
        }

        const baseUrl = "https://dniruc.apisperu.com/api/v1"
        const url = tipo === "ruc" 
            ? `${baseUrl}/ruc/${numero}?token=${token}`
            : `${baseUrl}/dni/${numero}?token=${token}`

        const response = await fetch(url)
        const status = response.status
        const statusText = response.statusText

        if (!response.ok) {
            console.error(`Error API RUC/DNI - Status: ${status}, StatusText: ${statusText}, URL: ${url}`)
            return NextResponse.json({ error: "Error al consultar documento" }, { status })
        }

        const data = await response.json()
        console.log(`Respuesta API ${tipo}:`, data)

        if (tipo === "dni") {
            const nombres = data.nombres || ""
            const apellidoPaterno = data.apellidoPaterno || ""
            const apellidoMaterno = data.apellidoMaterno || ""
            const nombreCompleto = [nombres, apellidoPaterno, apellidoMaterno].filter(Boolean).join(" ")

            return NextResponse.json({
                success: true,
                nombre: nombreCompleto
            })
        } else if (tipo === "ruc") {
            // Verificar si la respuesta tiene error
            if (data.error || data.message) {
                console.error("Error en respuesta RUC:", data)
                return NextResponse.json({ error: data.error || data.message || "Datos no encontrados" }, { status: 400 })
            }
            return NextResponse.json({
                success: true,
                razonSocial: data.razonSocial || "",
                direccion: data.direccion || "",
                departamento: data.departamento || "",
                provincia: data.provincia || "",
                distrito: data.distrito || ""
            })
        }

        return NextResponse.json({ error: "Tipo invalido" }, { status: 400 })

    } catch (error) {
        console.error("Error en buscar-documento:", error)
        return NextResponse.json({ error: "Error interno" }, { status: 500 })
    }
}