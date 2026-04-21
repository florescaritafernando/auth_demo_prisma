import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"


export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div>
                <div className="flex flex-col items-center py-4 text-2xl font-bold w-full">Welcome to the dashboard of Manchester Collection Peru</div>

            </div>
            <SidebarProvider>
                <AppSidebar />
                <main>
                    <SidebarTrigger />
                    {children}
                </main>
            </SidebarProvider>

        </>
    )
}