"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-2xl bg-gray-100/90 px-3 py-1.5 hover:bg-gray-200/80 transition-colors cursor-pointer select-none"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
            AD
          </div>
          <span className="text-xs font-semibold text-gray-800">Admin</span>
        </button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  );
}
