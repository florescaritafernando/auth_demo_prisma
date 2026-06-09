"""
Batch version: recibe múltiples entradas y las escribe secuencialmente
en Google Sheets en un solo proceso.
Uso: python agregar_yapes_batch.py --json '[{"nombre":"X","monto":"50","fecha":"2026-06-09"},...]'
"""
import os
import sys
import json
import argparse
from datetime import datetime
from zoneinfo import ZoneInfo

from app import YAPES_SHEETS_URL


def main():
    parser = argparse.ArgumentParser(description="Agregar múltiples registros YAPE en batch")
    parser.add_argument("--json", required=True, help="JSON array de entradas")
    args = parser.parse_args()

    try:
        entries = json.loads(args.json)
        if not isinstance(entries, list):
            raise ValueError("Se esperaba un array JSON")

        import gspread
        from google.oauth2.service_account import Credentials

        scopes = ["https://www.googleapis.com/auth/spreadsheets"]
        creds_path = os.path.join(os.path.dirname(__file__), "..", "credentials", "google-service-account.json")
        creds_path = os.path.normpath(creds_path)

        if not os.path.exists(creds_path):
            result = {"success": False, "error": f"Archivo de credenciales no encontrado: {creds_path}"}
            print(json.dumps(result))
            sys.exit(1)

        creds = Credentials.from_service_account_file(creds_path, scopes=scopes)
        gc = gspread.authorize(creds)

        if "/d/" in YAPES_SHEETS_URL:
            key = YAPES_SHEETS_URL.split("/d/")[1].split("/")[0]
        else:
            key = YAPES_SHEETS_URL

        sh = gc.open_by_key(key)
        ws = sh.sheet1

        results = []
        for entry in entries:
            nombre = entry.get("nombre", "")
            monto_raw = entry.get("monto", "0")
            fecha_raw = entry.get("fecha", "")

            monto = float(monto_raw)
            if monto == int(monto):
                monto_str = str(int(monto)).replace(".", ",")
            else:
                monto_str = f"{monto:.2f}".rstrip("0").rstrip(".").replace(".", ",")

            fecha_dt = datetime.strptime(fecha_raw, '%Y-%m-%d')
            ahora = datetime.now(ZoneInfo("America/Lima"))
            fecha_formateada = f"{fecha_dt.day:02d}/{fecha_dt.month:02d}/{fecha_dt.year} {ahora.strftime('%H:%M:%S')}"

            ws.append_row([nombre, monto_str, fecha_formateada])
            results.append({"nombre": nombre, "monto": monto_str, "fecha": fecha_formateada})

        output = {"success": True, "count": len(results), "results": results}
        print(json.dumps(output))
    except Exception as e:
        result = {"success": False, "error": str(e)}
        print(json.dumps(result))
        sys.exit(1)


if __name__ == "__main__":
    main()
