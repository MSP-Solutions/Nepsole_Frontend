"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
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
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer select-none"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User Pill Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
