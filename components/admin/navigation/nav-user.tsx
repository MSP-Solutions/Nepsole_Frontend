"use client";

import {
  User,
  ChevronsUpDown,
  LogOut,
  Settings,
} from "lucide-react";
import Link from "next/link";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavUserProps {
  user?: {
    name: string;
    role: string;
  };
  company?: {
    name: string;
    role: string;
  };
  onLogout?: () => void;
}

export default function NavUser({
  user,
  company,
  onLogout,
}: NavUserProps) {
  const profile = user || company || {
    name: "Admin User",
    role: "Super Admin",
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-700">
                <AvatarFallback>
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {profile.name}
                </span>

                <span className="truncate text-xs text-muted-foreground">
                  {profile.role}
                </span>
              </div>

              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="top"
            align="start"
            className="w-56"
          >
            <DropdownMenuItem asChild>
              <Link href="/admin/profile" className="flex items-center gap-2 cursor-pointer">
                <Settings className="size-4 text-gray-500" />
                <span>Account Settings</span>
              </Link>
            </DropdownMenuItem>

            {onLogout && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onLogout}
                  className="flex items-center gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                >
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}