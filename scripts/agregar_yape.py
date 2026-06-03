import os
import sys
import json
import argparse
from datetime import datetime
from zoneinfo import ZoneInfo

from app import YAPES_SHEETS_URL  # type: ignore


def main():
    parser = argparse.ArgumentParser(description="Agregar nuevo registro YAPE")
    parser.add_argument("--nombre", required=True, help="Nombre del yapero")
    parser.add_argument("--monto", required=True, help="Monto del YAPE")
    parser.add_argument("--fecha", required=True, help="Fecha (YYYY-MM-DD)")

    args = parser.parse_args()

    try:
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

        # Extraer key de la URL
        if "/d/" in YAPES_SHEETS_URL:
            key = YAPES_SHEETS_URL.split("/d/")[1].split("/")[0]
        else:
            key = YAPES_SHEETS_URL

        sh = gc.open_by_key(key)
        ws = sh.sheet1

        monto = float(args.monto)
        # Formato: coma como separador decimal, sin ceros innecesarios
        if monto == int(monto):
            monto_str = str(int(monto)).replace(".", ",")
        else:
            monto_str = f"{monto:.2f}".rstrip("0").rstrip(".").replace(".", ",")

        # Fecha: DD/MM/YYYY HH:MM:SS con hora de Lima
        fecha_dt = datetime.strptime(args.fecha, '%Y-%m-%d')
        ahora = datetime.now(ZoneInfo("America/Lima"))
        fecha_formateada = f"{fecha_dt.day:02d}/{fecha_dt.month:02d}/{fecha_dt.year} {ahora.strftime('%H:%M:%S')}"

        ws.append_row([args.nombre, monto_str, fecha_formateada])

        result = {"success": True, "nombre": args.nombre, "monto": monto_str, "fecha": fecha_formateada}
        print(json.dumps(result))
    except Exception as e:
        result = {"success": False, "error": str(e)}
        print(json.dumps(result))
        sys.exit(1)


if __name__ == "__main__":
    main()
