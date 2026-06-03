import os
import json
import argparse

from app import FacturaXMLtoPDF  # type: ignore

def main():
    parser = argparse.ArgumentParser(description="Convertir XML a PDF (Ticket o Etiqueta)")
    parser.add_argument("--xml", required=True, help="Ruta del archivo XML")
    parser.add_argument("--output", required=True, help="Ruta de salida del PDF")
    parser.add_argument("--formato", required=True, choices=["ticket", "shipping_label"], help="Formato de salida")
    parser.add_argument("--agencia", default="", help="Nombre de agencia")
    parser.add_argument("--otra-agencia", default="", help="Nombre de agencia personalizado")
    parser.add_argument("--notas", default="", help="Notas adicionales")
    parser.add_argument("--recoje-dni", default="", help="DNI de quien recoge")
    parser.add_argument("--recoje-nombre", default="", help="Nombre de quien recoge")
    parser.add_argument("--recoje-direccion", default="", help="Dirección de quien recoge")

    args = parser.parse_args()

    if not os.path.exists(args.xml):
        result = {"success": False, "error": f"Archivo no encontrado: {args.xml}"}
        print(json.dumps(result))
        sys.exit(1)

    extra_data = {}

    agency_name = args.otra_agencia.strip() if args.otra_agencia.strip() else args.agencia.strip()
    if agency_name:
        extra_data["agency_name"] = agency_name.upper()

    if args.notas.strip():
        extra_data["other_notes"] = args.notas.strip()

    if args.recoje_dni.strip() or args.recoje_nombre.strip():
        extra_data["recoje_otra_persona"] = True
        if args.recoje_dni.strip():
            extra_data["recoje_dni"] = args.recoje_dni.strip()
        if args.recoje_nombre.strip():
            extra_data["recoje_nombre"] = args.recoje_nombre.strip()
        if args.recoje_direccion.strip():
            extra_data["recoje_direccion"] = args.recoje_direccion.strip()

    try:
        converter = FacturaXMLtoPDF(args.xml, args.output, extra_data)
        if not converter.parse_xml():
            result = {"success": False, "error": "; ".join(converter.errors)}
            print(json.dumps(result))
            sys.exit(1)

        converter.generate_pdf(args.formato)

        numero = converter.data.get('numero_factura', '').replace('/', '-')
        cliente = converter.data.get('cliente_nombre', '').strip().upper()[:30]
        formato_label = "TICKET" if args.formato == "ticket" else "ETIQUETA"
        nombre_archivo = f"{numero}-{cliente}-{formato_label}"

        result = {"success": True, "output_path": args.output, "nombre_archivo": nombre_archivo}
        print(json.dumps(result))
    except Exception as e:
        result = {"success": False, "error": str(e)}
        print(json.dumps(result))
        sys.exit(1)


if __name__ == "__main__":
    main()
