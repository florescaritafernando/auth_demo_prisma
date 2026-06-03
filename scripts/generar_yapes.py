import os
import sys
import json
import argparse

from app import YapesPDF, YAPES_SHEETS_URL  # type: ignore


def main():
    parser = argparse.ArgumentParser(description="Generar PDF de YAPES")
    parser.add_argument("--output", required=True, help="Ruta de salida del PDF")
    parser.add_argument("--fecha-inicio", default="", help="Fecha inicio (YYYY-MM-DD)")
    parser.add_argument("--fecha-fin", default="", help="Fecha fin (YYYY-MM-DD)")

    args = parser.parse_args()

    try:
        pdf = YapesPDF(
            output_path=args.output,
            fecha_inicio=args.fecha_inicio,
            fecha_fin=args.fecha_fin,
            sheets_url=YAPES_SHEETS_URL,
        )

        if not pdf.parse():
            result = {"success": False, "error": "No se pudieron obtener los datos de YAPES"}
            print(json.dumps(result))
            sys.exit(1)

        pdf.generate_pdf()

        result = {"success": True, "output_path": args.output, "total_registros": len(pdf.data)}
        print(json.dumps(result))
    except Exception as e:
        result = {"success": False, "error": str(e)}
        print(json.dumps(result))
        sys.exit(1)


if __name__ == "__main__":
    main()
