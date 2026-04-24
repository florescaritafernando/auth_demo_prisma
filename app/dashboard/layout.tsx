import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session) {
        redirect("/login");
    }

    const role = (session.user as any)?.role || "cliente"
    const titulo = role === "admin" ? "Panel de Administracion" : "Panel de Control"

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
