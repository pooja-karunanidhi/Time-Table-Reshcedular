
import Link from "next/link";
import { BarChart3, Database, FileCheck2, LayoutGrid, Wand2, CircleAlert } from "lucide-react";
import Logo from "@/components/Logo";
import { UserNav } from "@/components/UserNav";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Suspense } from "react";
import { DashboardSidebar } from "./sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <Suspense fallback={<div>Loading...</div>}>
            <DashboardSidebar />
          </Suspense>
        </SidebarContent>
        <SidebarFooter>
          <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1">
            {/* Can add search or other header items here */}
          </div>
          <div className="md:hidden">
            <UserNav />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
