import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { NotificationWrapper } from "@/components/notifications/NotificationWrapper"

import prisma from "@/lib/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const headersList = await headers();
    let session = await auth.api.getSession({
        headers: headersList
    });

    console.log("=== Dashboard Layout Debug ===");
    console.log("Session from getSession:", session ? "exists" : "null");

    if (!session) {
        const cookieHeader = headersList.get("cookie") || "";
        
        // Buscar todas las cookies better-auth.session_token
        const tokenMatches = cookieHeader.matchAll(/better-auth\.session_token=([^;]+)/g);
        const tokens = Array.from(tokenMatches).map(m => m[1]);
        
        console.log("Found tokens:", tokens.length);

        for (const token of tokens) {
            console.log("Trying token:", token.substring(0, 30) + "...");
            
            const dbSession = await prisma.session.findUnique({
                where: { token: token },
                include: { user: true }
            });

            console.log("DB Session for token:", dbSession ? `found (expires: ${dbSession.expiresAt})` : "not found");

            if (dbSession && dbSession.expiresAt > new Date()) {
                session = { user: dbSession.user } as any;
                console.log("Session restored from DB!");
                break;
            }
        }
    }

    if (!session) {
        console.log("No session found, redirecting to login");
        redirect("/login");
    }

    console.log("Session authenticated:", session.user?.email);

    const role = (session.user as any)?.role || "cliente"
    const titulo = role === "admin" ? "Panel de Administracion" : role === "empleado" ? "Panel de Colaboradores" : role === "cliente" ? "Panel de Cliente" : "Panel de Control"

    return (
        <SidebarProvider>
            <AppSidebar role={role} />
            <main className="w-full flex-1 bg-slate-50">
                <div className="p-4 border-b bg-white flex items-center shadow-sm sticky top-0 z-10">
                    <SidebarTrigger />
                    <span className="ml-4 font-semibold text-slate-800">{titulo}</span>
                    {role === "admin" && (
                        <span className="ml-4 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase">Admin</span>
                    )}
                </div>
                {children}
            </main>
        </SidebarProvider>
    )
}
