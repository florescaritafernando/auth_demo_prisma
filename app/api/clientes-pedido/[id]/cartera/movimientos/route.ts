import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession({
        headers: request.headers
    })

    if (!session?.user) {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 })
    }

    const role = (session.user as any)?.role
    if (role !== "admin" && role !== "empleado") {
        return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const { id: clientePedidoId } = await params
    const body = await request.json()
    const { tipo, monto, concepto, referencia, metodoPago, empresa, comprobante } = body

    if (!tipo || !monto || monto <= 0) {
        return NextResponse.json({ success: false, error: "Tipo y monto requeridos" }, { status: 400 })
    }

    if (tipo !== "abono" && tipo !== "cargo") {
        return NextResponse.json({ success: false, error: "Tipo debe ser abono o cargo" }, { status: 400 })
    }

    const movimiento = await prisma.$transaction(async (tx) => {
        let cartera = await tx.cartera.findUnique({
            where: { clientePedidoId }
        })

        if (!cartera) {
            cartera = await tx.cartera.create({
                data: { clientePedidoId, saldo: 0 }
            })
        }

        const montoReal = tipo === "cargo" ? -Math.abs(monto) : Math.abs(monto)
        const nuevoSaldo = cartera.saldo + montoReal

        const mov = await tx.carteraMovimiento.create({
            data: {
                carteraId: cartera.id,
                tipo,
                monto: Math.abs(monto),
                saldoAnterior: cartera.saldo,
                saldoNuevo: nuevoSaldo,
                concepto: concepto || null,
                referencia: referencia || null,
                metodoPago: metodoPago || null,
                empresa: empresa || null,
                comprobante: comprobante || null,
                creadoPorId: session.user.id
            }
        })

        await tx.cartera.update({
            where: { id: cartera.id },
            data: { saldo: nuevoSaldo }
        })

        return mov
    })

    return NextResponse.json({ success: true, movimiento })
}
