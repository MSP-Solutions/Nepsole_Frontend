"use client";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import { Check, Copy, Loader2, Mail, Phone, User } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface UserData {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  role: string;
  joinedDate?: string;
  [key: string]: any;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);

    try {
      const res = await axiosAuthInstance.get("/v1/users");
      const data = res?.data?.data || res?.data?.users || res?.data || [];
      const list = Array.isArray(data) ? data : [];

      const mappedUsers: UserData[] = list.map((user: any, index: number) => {
        const rawRole = String(
          user.role || user.userRole || "USER",
        ).toUpperCase();

        const role = rawRole.includes("ADMIN") ? "Admin" : "User";

        return {
          ...user,
          id: user.id || `USR-${index + 1001}`,
          name:
            user.name ||
            [user.firstName, user.lastName].filter(Boolean).join(" ") ||
            user.username ||
            `User #${user.id || index + 1}`,
          email: user.email || "No email provided",
          phone: user.phoneNumber || user.phone || "-",
          role,
          joinedDate: user.createdAt || user.joinedDate,
        };
      });

      setUsers(mappedUsers);
    } catch (error: any) {
      console.error("Failed to load users:", error);
      toast.error(error?.response?.data?.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCopy = async (text: string, label: string) => {
    if (!text || text === "-") return;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(`${label}: ${text}`);

      setTimeout(() => {
        setCopiedText(null);
      }, 2500);
    } catch {
      toast.error("Failed to copy.");
    }
  };

  const getRoleBadge = (role: string) => {
    return role.toLowerCase() === "admin"
      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
      : "bg-slate-100 text-slate-700 border-slate-200";
  };

  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "U"
    );
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] p-4 sm:p-6 lg:p-8 font-sans text-slate-700 space-y-6">
      {/* Copy Toast */}
      {copiedText && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">
            {copiedText} copied to clipboard!
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Users
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Registered user accounts and contact details.
          </p>
        </div>
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 flex flex-col items-center justify-center gap-3 shadow-2xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#1749A0]" />
          <p className="text-xs text-slate-500 font-medium">
            Fetching user accounts...
          </p>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center shadow-2xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No users found</h3>
          <p className="text-xs text-slate-400 mt-1">
            There are currently no registered users available.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                  <th className="py-3.5 px-4 sm:px-6">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/70 transition">
                    {/* User Profile */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-10 h-10 rounded-full bg-[#1749A0] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {getInitials(user.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 truncate">
                            {user.name}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono truncate">
                            ID: #{user.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="py-4 px-4">
                      <div className="space-y-1.5 min-w-[220px]">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="text-xs text-slate-800 truncate max-w-[200px]">
                            {user.email}
                          </span>
                          {user.email !== "No email provided" && (
                            <button
                              type="button"
                              onClick={() => handleCopy(user.email, "Email")}
                              className="text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                              title="Copy email"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="text-xs text-slate-700 font-mono">
                            {user.phone}
                          </span>
                          {user.phone !== "-" && (
                            <button
                              type="button"
                              onClick={() => handleCopy(user.phone, "Phone")}
                              className="text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                              title="Copy phone"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold border ${getRoleBadge(
                          user.role,
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                      {user.joinedDate
                        ? new Date(user.joinedDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "Registered User"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
