"use client";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Loader2,
  Mail,
  PackageCheck,
  Phone,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Order as AdminOrder, OrderItem as AdminOrderItem } from "@/types";

const statusStyles: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode; label: string }
> = {
  PENDING: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    icon: <Clock className="w-3.5 h-3.5" />,
    label: "Pending",
  },
  CONFIRMED: {
    bg: "bg-teal-50 border-teal-200",
    text: "text-teal-700",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: "Confirmed",
  },
  PROCESSING: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    icon: <PackageCheck className="w-3.5 h-3.5" />,
    label: "Processing",
  },
  SHIPPED: {
    bg: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-700",
    icon: <Truck className="w-3.5 h-3.5" />,
    label: "Shipped",
  },
  IN_TRANSIT: {
    bg: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-700",
    icon: <Truck className="w-3.5 h-3.5" />,
    label: "In Transit",
  },
  DELIVERED: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: "Delivered",
  },
  COMPLETED: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: "Completed",
  },
  CANCELLED: {
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: "Cancelled",
  },
  FAILED: {
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
    icon: <XCircle className="w-3.5 h-3.5" />,
    label: "Failed",
  },
};

const getStatusConfig = (status: string) => {
  const s = (status || "").toUpperCase();
  return (
    statusStyles[s] || {
      bg: "bg-slate-100 border-slate-200",
      text: "text-slate-700",
      icon: <Clock className="w-3.5 h-3.5" />,
      label: status || "Pending",
    }
  );
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("All");

  // Fetch Orders from API
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      let res;
      try {
        res = await axiosAuthInstance.get("/v1/orders/admin/all");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          res = await axiosAuthInstance.get("/v1/orders");
        } else {
          throw err;
        }
      }

      const dataList: AdminOrder[] = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
          ? res.data
          : [];

      // Sort newest first
      dataList.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setOrders(dataList);
    } catch (error: any) {
      console.error("Failed to load admin orders:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load orders history.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders by search & status
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status Filter
      if (selectedStatusFilter !== "All") {
        const orderStatus = (order.status || "").toUpperCase();
        const filter = selectedStatusFilter.toUpperCase();

        if (filter === "PENDING" && orderStatus !== "PENDING") return false;
        if (filter === "CONFIRMED" && orderStatus !== "CONFIRMED") return false;
        if (filter === "PROCESSING" && orderStatus !== "PROCESSING")
          return false;
        if (
          (filter === "IN_TRANSIT" || filter === "SHIPPED") &&
          orderStatus !== "IN_TRANSIT" &&
          orderStatus !== "SHIPPED"
        )
          return false;
        if (
          (filter === "DELIVERED" || filter === "COMPLETED") &&
          orderStatus !== "DELIVERED" &&
          orderStatus !== "COMPLETED"
        )
          return false;
        if (
          (filter === "CANCELLED" || filter === "FAILED") &&
          orderStatus !== "CANCELLED" &&
          orderStatus !== "FAILED"
        )
          return false;
      }

      // Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const customerName = order.user?.name?.toLowerCase() || "";
        const customerEmail = order.user?.email?.toLowerCase() || "";
        const customerPhone =
          order.user?.phoneNumber || order.deliveryAddress?.phoneNumber || "";
        const orderIdStr = String(order.id);
        const hasMatchingBook = order.items?.some((it) =>
          it.book?.title?.toLowerCase().includes(query),
        );
        const hasMatchingCity =
          order.deliveryAddress?.city?.toLowerCase().includes(query) ||
          order.deliveryAddress?.streetAddress?.toLowerCase().includes(query);

        return (
          customerName.includes(query) ||
          customerEmail.includes(query) ||
          customerPhone.includes(query) ||
          orderIdStr.includes(query) ||
          `ord-${orderIdStr}`.includes(query) ||
          hasMatchingBook ||
          hasMatchingCity
        );
      }

      return true;
    });
  }, [orders, searchTerm, selectedStatusFilter]);

  // Calculate Metrics
  const totalOrdersCount = orders.length;
  const totalRevenue = orders
    .filter(
      (o) => !["CANCELLED", "FAILED"].includes((o.status || "").toUpperCase()),
    )
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingOrdersCount = orders.filter(
    (o) => (o.status || "").toUpperCase() === "PENDING",
  ).length;
  const deliveredOrdersCount = orders.filter((o) =>
    ["DELIVERED", "COMPLETED"].includes((o.status || "").toUpperCase()),
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              Orders Management
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Track customer orders, review details, and inspect fulfillment
              statuses.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-600 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>{totalOrdersCount} Total Orders</span>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer, book title, or order #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#1749A0] focus:outline-none focus:ring-1 focus:ring-[#1749A0] transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Tabs Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: "All", label: "All Orders" },
              { id: "Pending", label: "Pending" },
              { id: "Confirmed", label: "Confirmed" },
              { id: "Processing", label: "Processing" },
              { id: "Shipped", label: "Shipped" },
              { id: "Delivered", label: "Delivered" },
              { id: "Cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                  selectedStatusFilter === tab.id
                    ? "bg-[#1749A0] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="py-24 bg-white rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 shadow-2xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#1749A0] mb-2.5" />
            <p className="text-xs font-medium text-slate-600">
              Loading orders history...
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Data Table */}
            <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-3.5">Order Info</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Items Ordered</th>
                    <th className="px-5 py-3.5">Total & Payment</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const statusConfig = getStatusConfig(order.status);
                      const totalQty =
                        order.items?.reduce(
                          (sum, it) => sum + (Number(it.quantity) || 1),
                          0,
                        ) || 1;

                      const formattedDate = order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )
                        : "Recently";

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/60 transition-colors group"
                        >
                          {/* Order Info */}
                          <td className="px-5 py-4">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="font-bold text-slate-900 group-hover:text-[#1749A0] transition-colors"
                            >
                              #{order.id}
                            </Link>
                            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{formattedDate}</span>
                            </div>
                          </td>

                          {/* Customer Details */}
                          <td className="px-5 py-4 min-w-[200px]">
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{order.user?.name || "Customer"}</span>
                            </div>
                            {order.user?.email && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[160px]">
                                  {order.user.email}
                                </span>
                              </div>
                            )}
                            {(order.user?.phoneNumber ||
                              order.deliveryAddress?.phoneNumber) && (
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>
                                  {order.user?.phoneNumber ||
                                    order.deliveryAddress?.phoneNumber}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Items Ordered */}
                          <td className="px-5 py-4 min-w-[220px]">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-10 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {order.items?.[0]?.book?.images?.[0]?.url ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={
                                      order.items[0].book.images.find(
                                        (i) => i.type === "COVER",
                                      )?.url ||
                                      order.items[0].book.images[0].url
                                    }
                                    alt="Book cover"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900 truncate max-w-[180px]">
                                  {order.items?.[0]?.book?.title ||
                                    "Book Package"}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {totalQty} {totalQty === 1 ? "item" : "items"}{" "}
                                  {order.items && order.items.length > 1 && (
                                    <span>({order.items.length} titles)</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Price & Payment */}
                          <td className="px-5 py-4">
                            <div className="font-bold text-slate-900">
                              Rs. {Number(order.total || 0).toLocaleString()}
                            </div>
                            <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                              {order.payment?.method === "COD"
                                ? "COD"
                                : order.payment?.method || "COD"}
                            </span>
                          </td>

                          {/* Read-Only Status Badge */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} ${statusConfig.text}`}
                            >
                              {statusConfig.icon}
                              <span>{statusConfig.label}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <Link
                              href={`/admin/orders/${order.id}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-[#1749A0] text-white text-xs font-semibold shadow-2xs transition active:scale-[0.98]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Details</span>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-14 text-center text-slate-400 text-xs sm:text-sm"
                      >
                        No orders found matching your search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View: Cards Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const statusConfig = getStatusConfig(order.status);
                  const totalQty =
                    order.items?.reduce(
                      (sum, it) => sum + (Number(it.quantity) || 1),
                      0,
                    ) || 1;

                  const formattedDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recently";

                  return (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-sm transition space-y-3"
                    >
                      {/* Top Bar */}
                      <div className="flex items-center justify-between">
                        <div>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="text-xs font-bold text-[#1749A0]"
                          >
                            #{order.id}
                          </Link>
                          <p className="text-[10px] text-slate-400">
                            {formattedDate}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.text}`}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </div>

                      <hr className="border-slate-100" />

                      {/* Customer Info */}
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.user?.name || "Customer"}</span>
                        </div>
                        {order.user?.email && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{order.user.email}</span>
                          </div>
                        )}
                        {(order.user?.phoneNumber ||
                          order.deliveryAddress?.phoneNumber) && (
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>
                              {order.user?.phoneNumber ||
                                order.deliveryAddress?.phoneNumber}
                            </span>
                          </div>
                        )}
                      </div>

                      <hr className="border-slate-100" />

                      {/* Book & Price */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="font-semibold text-slate-900 truncate">
                            {order.items?.[0]?.book?.title || "Book Package"}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Qty: {totalQty}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-slate-900">
                            Rs. {Number(order.total || 0).toLocaleString()}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase">
                            {order.payment?.method || "COD"}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Action */}
                      <div className="pt-2 flex items-center justify-end border-t border-slate-100">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-xs font-bold text-[#1749A0] hover:text-[#0F2557] flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
                  No orders found matching your search filter.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
