"use client"
import type { ReactNode } from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

import AppSidebar from "@/components/admin/navigation/app-sidebar";
import DashboardNavbar from "@/components/admin/header/dashboard-navbar";

interface AdminDashboardLayoutProps {
    children: ReactNode;
}

export default function AdminDashboardLayout({
    children,
}: AdminDashboardLayoutProps) {
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
