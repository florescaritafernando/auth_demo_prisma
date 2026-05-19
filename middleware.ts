import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    return NextResponse.next();
  }

  const allowedOrigins = [
    "https://manchestercollectionperu.tech",
    "https://www.manchestercollectionperu.com",
    "https://manchestercollectionperu.com",
    "https://landing-page-y-control-panel.onrender.com",
    "http://localhost:3000",
  ];

  const origin = request.headers.get("origin");

  // 1. Manejo estricto para peticiones Preflight (OPTIONS) que hace Brave
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 });

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie"); // Añadido Cookie por seguridad de Better Auth
    response.headers.set("Access-Control-Allow-Credentials", "true");

    return response;
  }

  // 2. Para el resto de peticiones normales (GET, POST, etc.)
  const response = NextResponse.next();

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Cookie");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

// 3. QUITAMOS 'api/auth' de la exclusión para que el middleware sí proteja esas rutas
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};