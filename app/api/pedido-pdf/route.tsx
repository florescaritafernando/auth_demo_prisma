import { NextRequest, NextResponse } from "next/server"
import { renderToBuffer } from "@react-pdf/renderer"
import { PedidoPDF } from "@/components/pdf/PedidoPDF"

export async function POST(request: NextRequest) {
    try {
        const { formato, ...pedido } = await request.json()

        const pdfBuffer = await renderToBuffer(
            <PedidoPDF pedido={pedido} formato={formato} />
        )

        const pdfBytes = new Uint8Array(pdfBuffer)
        return new NextResponse(new Blob([pdfBytes], { type: "application/pdf" }), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Pedido_${pedido.numeroOrden}.pdf"`,
            },
        })
    } catch (error) {
        console.error("Error generating PDF:", error)
        return NextResponse.json(
            { error: "Error generating PDF" },
            { status: 500 }
        )
    }
}
