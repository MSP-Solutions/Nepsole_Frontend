"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import UserMenu from "./user-menu";

const routeTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/books": "Books",
  "/admin/orders": "Orders",
  "/admin/authors": "Authors",
  "/admin/publishers": "Publishers",
  "/admin/users": "Users",
  "/admin/settings": "Settings",
};

export default function DashboardNavbar() {
  const pathname = usePathname();

  // Get current page title dynamically from route
  const currentTitle =
    routeTitles[pathname] ||
    pathname
      .split("/")
      .filter(Boolean)
      .pop()
      ?.replace(/-/g, " ")
      ?.replace(/\b\w/g, (c) => c.toUpperCase()) ||
    "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex items-center gap-2.5 text-sm">
        <SidebarTrigger className="text-gray-600 hover:bg-gray-100" />
        <span className="font-semibold text-gray-900">{currentTitle}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* User Pill Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
