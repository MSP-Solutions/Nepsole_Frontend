"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Heart, LogOut, Settings, User } from "lucide-react";
import {
  clearCookies,
  getUserCookie,
  getUserDisplayName,
  getUserInitials,
  UserCookie,
} from "@/utils/cookies";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<UserCookie | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getUserCookie();
      setUser(u);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await clearCookies();
    router.push("/login");
  };

  const displayName = user ? getUserDisplayName(user) : "User";
  const initials = user ? getUserInitials(displayName) : "US";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-2xl bg-gray-100/90 px-3 py-1.5 hover:bg-gray-200/80 transition-colors cursor-pointer select-none"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
            {initials}
          </div>
          <span className="text-xs font-semibold text-gray-800 max-w-[120px] truncate">
            {displayName}
          </span>
        </button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
