"use client";

import {
  AlertTriangle,
  BookOpen,
  Building2,
  ChevronLeft,
  Feather,
  LayoutGrid,
  Loader2,
  LogOut,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import NavMain, { NavItem } from "./nav-main";
import SidebarLogo from "./sidebar-logo";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { clearCookies } from "@/utils/cookies";

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutGrid,
  },
  {
    title: "Books",
    url: "/admin/books",
    icon: BookOpen,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "Authors",
    url: "/admin/authors",
    icon: Feather,
  },
  {
    title: "Publishers",
    url: "/admin/publishers",
    icon: Building2,
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

function SidebarFooterActions({ onLogout }: { onLogout: () => void }) {
  const { open, toggleSidebar } = useSidebar();

  return (
    <div className="flex flex-col gap-1 px-1 py-1">
      <button
        type="button"
        onClick={toggleSidebar}
        title={!open ? "Expand" : "Collapse"}
        className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer select-none"
      >
        <ChevronLeft
          className={`h-4 w-4 shrink-0 transition-transform duration-200 ${!open ? "rotate-180" : ""}`}
        />
        {open && <span>Collapse</span>}
      </button>

      <button
        type="button"
        onClick={onLogout}
        title={!open ? "Sign Out" : undefined}
        className="flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-all cursor-pointer select-none"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {open && <span>Sign Out</span>}
      </button>
    </div>
  );
}

export default function AppSidebar() {
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await clearCookies();
      setShowLogoutDialog(false);
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        variant="sidebar"
        className="bg-[#0b1739] text-slate-200 border-r border-slate-800/40 shadow-xl"
      >
        <SidebarHeader className="border-b border-slate-800/40 px-3 py-3">
          <SidebarLogo />
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <NavMain items={navigation} />
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-800/40 px-2 py-2">
          <SidebarFooterActions onLogout={() => setShowLogoutDialog(true)} />
        </SidebarFooter>
      </Sidebar>

      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent className="sm:max-w-md bg-[#0c193c] text-white border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <AlertTriangle className="h-6 w-6 stroke-[2]" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-white">
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-400 leading-relaxed">
              Are you sure you want to log out? Logging out will clear all
              stored session cookies and redirect you to the login page.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-slate-800/60 mt-4">
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => setShowLogoutDialog(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleConfirmLogout}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Yes, Log out</span>
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
