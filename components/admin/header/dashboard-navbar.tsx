"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, Bell, ChevronRight } from "lucide-react";
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
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200/80 bg-white/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      {/* Left section: Admin > Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-400 font-normal">Admin</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
        <span className="font-semibold text-gray-900">{currentTitle}</span>
      </div>

      {/* Right section: View Store, Notifications & User Pill */}
      <div className="flex items-center gap-4">
        {/* View Store Button */}
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-xl bg-gray-100/90 px-3.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-200/80 transition-colors select-none"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-gray-500" />
          <span>View Store</span>
        </Link>

        {/* Notifications Bell with Red Indicator */}
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