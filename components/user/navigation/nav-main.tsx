"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface NavMainProps {
  items: NavItem[];
}

export default function NavMain({ items }: NavMainProps) {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1.5">
          {items.map((item) => {
            const isActive =
              pathname === item.url ||
              (item.url !== "/admin/dashboard" && pathname.startsWith(item.url));

            return (
              <SidebarMenuItem key={item.title}>
                <Link
                  href={item.url}
                  title={!open ? item.title : undefined}
                  className={cn(
                    "flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-150 select-none group/item",
                    isActive
                      ? "bg-[#1d2d5a] text-white font-semibold shadow-sm"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-white" : "text-slate-300 group-hover/item:text-white"
                    )}
                  />
                  {open && <span className="truncate flex-1">{item.title}</span>}
                  {open && item.badge !== undefined && (
                    <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}