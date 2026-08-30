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

      <DropdownMenuContent
        align="end"
        className="w-52 bg-white border border-gray-200 shadow-lg rounded-xl p-1 z-50"
      >
        <div className="px-3 py-2 border-b border-gray-100 mb-1">
          <p className="text-xs font-bold text-gray-900 truncate">
            {displayName}
          </p>
          {user?.email && (
            <p className="text-[11px] text-gray-500 truncate mt-0.5">
              {user.email}
            </p>
          )}
        </div>

        <DropdownMenuItem asChild>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-indigo-500" />
            <span>Browse Bookstore</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/user/wishlist"
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <Heart className="h-4 w-4 text-rose-500" />
            <span>My Wishlist</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/user/settings"
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <User className="h-4 w-4 text-gray-500" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            href="/user/settings"
            className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer"
          >
            <Settings className="h-4 w-4 text-gray-500" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-gray-100" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
        >
          <LogOut className="h-4 w-4 text-rose-500" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
