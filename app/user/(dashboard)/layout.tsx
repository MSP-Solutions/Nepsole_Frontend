"use client";
import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import AppSidebar from "@/components/user/navigation/app-sidebar";
import DashboardNavbar from "@/components/user/header/dashboard-navbar";

interface UDashboardLayoutProps {
  children: ReactNode;
}

export default function UDashboardLayout({ children }: UDashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />

      <SidebarInset>
        <DashboardNavbar />

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
