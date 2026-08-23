"use client";

import {
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Filter,
  LayoutGrid,
  List,
  Mail,
  Pencil,
  Phone,
  Search,
  ShieldCheck,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

export interface UserData {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: "Admin" | "Customer" | "Manager" | "Vendor" | "Support";
  status: "Active" | "Inactive" | "Pending" | "Suspended";
  avatarBg?: string;
  joinedDate?: string;
}

// Initial user mock data with name, email, phone number, role, status
const initialUsers: UserData[] = [
  {
    id: "USR-1001",
    name: "Aarav Sharma",
    email: "aarav.sharma@nepsole.com",
    phone: "+977 9841-234567",
    role: "Admin",
    status: "Active",
    avatarBg: "bg-indigo-600 text-white",
    joinedDate: "2026-01-15",
  },
  {
    id: "USR-1002",
    name: "Sita Gurung",
    email: "sita.gurung@gmail.com",
    phone: "+977 9803-456789",
    role: "Customer",
    status: "Active",
    avatarBg: "bg-emerald-600 text-white",
    joinedDate: "2026-02-04",
  },
  {
    id: "USR-1003",
    name: "Bikash Thapa",
    email: "bikash.thapa@outlook.com",
    phone: "+977 9812-345678",
    role: "Manager",
    status: "Active",
    avatarBg: "bg-purple-600 text-white",
    joinedDate: "2026-02-18",
  },
  {
    id: "USR-1004",
    name: "Priya Karki",
    email: "priya.karki@yahoo.com",
    phone: "+977 9860-112233",
    role: "Vendor",
    status: "Pending",
    avatarBg: "bg-amber-600 text-white",
    joinedDate: "2026-03-01",
  },
  {
    id: "USR-1005",
    name: "Rohan Shrestha",
    email: "rohan.shrestha@nepsole.com",
    phone: "+977 9849-887766",
    role: "Customer",
    status: "Active",
    avatarBg: "bg-blue-600 text-white",
    joinedDate: "2026-03-12",
  },
  {
    id: "USR-1006",
    name: "Anjali Rayamajhi",
    email: "anjali.r@gmail.com",
    phone: "+977 9808-554433",
    role: "Support",
    status: "Inactive",
    avatarBg: "bg-rose-600 text-white",
    joinedDate: "2026-04-05",
  },
  {
    id: "USR-1007",
    name: "Deepak Adhikari",
    email: "deepak.adhikari@domain.np",
    phone: "+977 9851-998877",
    role: "Customer",
    status: "Active",
    avatarBg: "bg-slate-700 text-white",
    joinedDate: "2026-04-20",
  },
  {
    id: "USR-1008",
    name: "Manita Paudel",
    email: "manita.paudel@hotmail.com",
    phone: "+977 9813-776655",
    role: "Customer",
    status: "Suspended",
    avatarBg: "bg-amber-700 text-white",
    joinedDate: "2026-05-11",
  },
  {
    id: "USR-1009",
    name: "Sunil Joshi",
    email: "sunil.joshi@nepsole.com",
    phone: "+977 9843-221100",
    role: "Vendor",
    status: "Active",
    avatarBg: "bg-teal-600 text-white",
    joinedDate: "2026-06-02",
  },
  {
    id: "USR-1010",
    name: "Kabita Maharjan",
    email: "kabita.m@gmail.com",
    phone: "+977 9861-443322",
    role: "Customer",
    status: "Active",
    avatarBg: "bg-indigo-500 text-white",
    joinedDate: "2026-06-25",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);

  // Copy Feedback Toast
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Handle Copy to Clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(`${label}: ${text}`);
    setTimeout(() => {
      setCopiedText(null);
    }, 2500);
  };

  // Add / Edit User submit
  const handleSaveUser = (userData: UserData) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userData.id ? { ...u, ...userData } : u)),
      );
    } else {
      setUsers((prev) => [userData, ...prev]);
    }
  };

  // Delete User
  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to remove this user?")) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        user.phone.toLowerCase().includes(search.toLowerCase()) ||
        user.id?.toLowerCase().includes(search.toLowerCase());

      const matchRole = roleFilter === "All" || user.role === roleFilter;
      const matchStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  // Pagination Math
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const verified = users.filter((u) => u.email.includes("@")).length;
    const phoneCount = users.filter(
      (u) => u.phone && u.phone.length > 5,
    ).length;
    return { total, active, verified, phoneCount };
  }, [users]);

  // Helper for Role Badges
  const getRoleBadge = (role: UserData["role"]) => {
    switch (role) {
      case "Admin":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/70";
      case "Manager":
        return "bg-purple-50 text-purple-700 border-purple-200/70";
      case "Vendor":
        return "bg-amber-50 text-amber-700 border-amber-200/70";
      case "Support":
        return "bg-sky-50 text-sky-700 border-sky-200/70";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200/70";
    }
  };

  // Helper for Status Badges
  const getStatusBadge = (status: UserData["status"]) => {
    switch (status) {
      case "Active":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
          dot: "bg-emerald-500",
          icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
        };
      case "Inactive":
        return {
          bg: "bg-slate-100 text-slate-600 border-slate-200/70",
          dot: "bg-slate-400",
          icon: <Clock className="w-3 h-3 text-slate-500" />,
        };
      case "Pending":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200/70",
          dot: "bg-amber-500",
          icon: <AlertTriangle className="w-3 h-3 text-amber-600" />,
        };
      case "Suspended":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200/70",
          dot: "bg-rose-500",
          icon: <XCircle className="w-3 h-3 text-rose-600" />,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] p-4 sm:p-6 lg:p-8 font-sans text-slate-700 space-y-6">
      {/* Toast Notification */}
      {copiedText && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium">
            {copiedText} copied to clipboard!
          </span>
        </div>
      )}

      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage user accounts, email addresses, phone contacts, and security
            permissions.
          </p>
        </div>
      </div>
      {/* Filter and Search Controls Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone number..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#f8fafc] border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns & View Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Role Filter */}
            <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Customer">Customer</option>
                <option value="Manager">Manager</option>
                <option value="Vendor">Vendor</option>
                <option value="Support">Support</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-slate-200 rounded-xl px-3 py-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Layout Toggle (Table vs Grid) */}
            <div className="flex items-center bg-[#f8fafc] border border-slate-200 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white text-indigo-600 shadow-xs font-bold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {(search || roleFilter !== "All" || statusFilter !== "All") && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400">
              Filtered by:
            </span>
            {search && (
              <span className="bg-indigo-50 text-indigo-700 text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                Search: &quot;{search}&quot;
                <button
                  onClick={() => setSearch("")}
                  className="hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            )}
            {roleFilter !== "All" && (
              <span className="bg-purple-50 text-purple-700 text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                Role: {roleFilter}
                <button
                  onClick={() => setRoleFilter("All")}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter !== "All" && (
              <span className="bg-emerald-50 text-emerald-700 text-[11px] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("All")}
                  className="hover:text-emerald-900"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("All");
                setStatusFilter("All");
              }}
              className="text-[11px] text-rose-600 font-semibold hover:underline ml-auto"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area: Responsive Table or Grid */}
      {paginatedUsers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No users found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            We couldn&apos;t find any user matching your current filter
            parameters or search query.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setRoleFilter("All");
              setStatusFilter("All");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          {/* Table View (Desktop & Tablet optimized) */}
          {viewMode === "table" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-5">User Details</th>
                      <th className="py-4 px-5">Email Address</th>
                      <th className="py-4 px-5">Phone Number</th>
                      <th className="py-4 px-5">Role</th>
                      <th className="py-4 px-5">Status</th>
                      <th className="py-4 px-5">Joined Date</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {paginatedUsers.map((user) => {
                      const statusInfo = getStatusBadge(user.status);
                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-indigo-50/30 transition-colors group"
                        >
                          {/* Name & Avatar */}
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-2xl ${
                                  user.avatarBg || "bg-indigo-600 text-white"
                                } flex items-center justify-center text-sm font-bold shadow-xs shrink-0`}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                                  {user.name}
                                </h4>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {user.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Email Address */}
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 shrink-0">
                                <Mail className="w-3.5 h-3.5" />
                              </div>
                              <a
                                href={`mailto:${user.email}`}
                                className="font-medium text-slate-800 hover:text-indigo-600 hover:underline transition"
                              >
                                {user.email}
                              </a>
                              <button
                                onClick={() => handleCopy(user.email, "Email")}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition"
                                title="Copy Email"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Phone Number */}
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 shrink-0">
                                <Phone className="w-3.5 h-3.5" />
                              </div>
                              <a
                                href={`tel:${user.phone.replace(/[^0-9+]/g, "")}`}
                                className="font-semibold text-slate-800 hover:text-indigo-600 hover:underline transition font-mono text-xs"
                              >
                                {user.phone}
                              </a>
                              <button
                                onClick={() => handleCopy(user.phone, "Phone")}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-slate-700 rounded transition"
                                title="Copy Phone Number"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getRoleBadge(
                                user.role,
                              )}`}
                            >
                              {user.role}
                            </span>
                          </td>

                          {/* Status Pill */}
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.bg}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}
                              />
                              {user.status}
                            </span>
                          </td>

                          {/* Joined Date */}
                          <td className="py-4 px-5 whitespace-nowrap text-slate-400 text-xs">
                            {user.joinedDate}
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-5 whitespace-nowrap text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingUser(user);
                                  setIsDialogOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition cursor-pointer"
                                title="Edit User"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id!)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Grid / Mobile Card View (Always responsive, used on mobile or grid mode) */}
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${
              viewMode === "table" ? "md:hidden" : ""
            }`}
          >
            {paginatedUsers.map((user) => {
              const statusInfo = getStatusBadge(user.status);
              return (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4 group"
                >
                  {/* Card Header: Avatar, Name, Role, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl ${
                          user.avatarBg || "bg-indigo-600 text-white"
                        } flex items-center justify-center text-lg font-bold shadow-xs shrink-0`}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-indigo-600 transition-colors">
                          {user.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {user.id}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${getRoleBadge(
                        user.role,
                      )}`}
                    >
                      {user.role}
                    </span>
                  </div>

                  {/* Contact Info Box: Email & Phone emphasized */}
                  <div className="bg-[#f8fafc] rounded-xl p-3.5 border border-slate-100/80 space-y-2.5">
                    {/* Email Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1 rounded-md bg-sky-100 text-sky-700 shrink-0">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <a
                          href={`mailto:${user.email}`}
                          className="text-xs font-semibold text-slate-800 hover:text-indigo-600 truncate"
                        >
                          {user.email}
                        </a>
                      </div>
                      <button
                        onClick={() => handleCopy(user.email, "Email")}
                        className="p-1 text-slate-400 hover:text-slate-700 transition shrink-0"
                        title="Copy Email"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Phone Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1 rounded-md bg-purple-100 text-purple-700 shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <a
                          href={`tel:${user.phone.replace(/[^0-9+]/g, "")}`}
                          className="text-xs font-semibold text-slate-800 hover:text-indigo-600 font-mono truncate"
                        >
                          {user.phone}
                        </a>
                      </div>
                      <button
                        onClick={() => handleCopy(user.phone, "Phone")}
                        className="p-1 text-slate-400 hover:text-slate-700 transition shrink-0"
                        title="Copy Phone"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Footer: Status, Date & Action buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.bg}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}
                      />
                      {user.status}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setIsDialogOpen(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-medium transition cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id!)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls Footer */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500 font-medium">
              Showing{" "}
              <span className="font-bold text-slate-900">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-900">
                {Math.min(currentPage * itemsPerPage, filteredUsers.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900">
                {filteredUsers.length}
              </span>{" "}
              users
            </p>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 text-xs">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-xl font-bold transition cursor-pointer ${
                        currentPage === pageNum
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ),
                )}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
