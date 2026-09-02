"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowRight, ShieldCheck, UserCheck, Mail } from "lucide-react";
import { axiosAuthInstance } from "@/utils/axiosInstances";

export interface RecentUser {
  id: number | string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
  avatarUrl?: string;
  imageUrl?: string;
  createdAt?: string;
  joinedAt?: string;
  [key: string]: any;
}

export default function RecentUsersList() {
  const [users, setUsers] = useState<RecentUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentUsers = async () => {
      setLoading(true);
      try {
        const res = await axiosAuthInstance.get(
          "/v1/dashboard/admin/recent-users"
        );
        const data = res.data?.data || res.data || [];
        const list = Array.isArray(data)
          ? data
          : data?.users || data?.items || [];
        setUsers(list);
      } catch (err) {
        console.error("Failed to load recent users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(" ");
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email && email.trim()) {
      return email.slice(0, 2).toUpperCase();
    }
    return "US";
  };

  const colors = [
    "bg-indigo-500 text-white",
    "bg-emerald-500 text-white",
    "bg-blue-500 text-white",
    "bg-amber-500 text-white",
    "bg-purple-500 text-white",
    "bg-rose-500 text-white",
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                New User Signups
              </h2>
              <p className="text-xs text-slate-400">
                Recently registered accounts
              </p>
            </div>
          </div>

          <Link
            href="/admin/users"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>All Users</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* User items */}
        <div className="mt-4 divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="py-3 flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-32 h-3.5 bg-slate-100 rounded" />
                  <div className="w-40 h-3 bg-slate-100 rounded" />
                </div>
                <div className="w-14 h-5 bg-slate-100 rounded-full" />
              </div>
            ))
          ) : users.length > 0 ? (
            users.slice(0, 5).map((user, idx) => {
              const name =
                user.fullName ||
                user.name ||
                (user.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : null) ||
                "Customer";
              const initials = getInitials(name, user.email);
              const avatar = user.avatar || user.avatarUrl || user.imageUrl;
              const role = String(user.role || "USER").toUpperCase();
              const isAdmin = role === "ADMIN" || role === "SUPERADMIN";
              const date = user.createdAt || user.joinedAt;
              const formattedDate = date
                ? new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "Recent";

              return (
                <div
                  key={user.id || idx}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs ${
                          colors[idx % colors.length]
                        }`}
                      >
                        {initials}
                      </div>
                    )}

                    {/* Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {name}
                        </span>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-bold">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </p>
                    </div>
                  </div>

                  {/* Joined Date */}
                  <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                    {formattedDate}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              <Users className="w-8 h-8 text-slate-200 mx-auto mb-1" />
              <p>No user registrations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-100 mt-2">
        <Link
          href="/admin/users"
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50/50 hover:bg-purple-50 rounded-xl transition-colors border border-purple-100/60"
        >
          <span>Manage User Accounts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
