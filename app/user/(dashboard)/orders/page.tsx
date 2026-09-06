"use client";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  ShoppingBag,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Order as ApiOrder, PaginationMeta } from "@/types";

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Fetch Orders from API with page, limit=10, status params
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {
        page: currentPage,
        limit: pageSize,
      };

      if (statusFilter !== "ALL") {
        params.status = statusFilter;
      }

      let res;
      try {
        res = await axiosAuthInstance.get("/v1/orders/history", { params });
      } catch (err: any) {
        throw err;
      }

      const resData = res.data;
      const dataList: ApiOrder[] = Array.isArray(resData?.data?.orders)
        ? resData.data.orders
        : Array.isArray(resData?.data)
          ? resData.data
          : Array.isArray(resData)
            ? resData
            : [];

      // Parse pagination metadata
      const meta = resData?.pagination || resData?.data?.pagination;
      if (meta) {
        setPagination({
          page: meta.page || currentPage,
          limit: meta.limit || pageSize,
          total: meta.total ?? dataList.length,
          totalPages:
            meta.totalPages ||
            Math.ceil((meta.total ?? dataList.length) / pageSize) ||
            1,
        });
      } else {
        setPagination({
          page: currentPage,
          limit: pageSize,
          total: dataList.length,
          totalPages: Math.ceil(dataList.length / pageSize) || 1,
        });
      }

      // Sort newest first
      dataList.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setOrders(dataList);
    } catch (error: any) {
      console.error("Failed to fetch order history:", error);
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to load order history.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleTabChange = (tabId: string) => {
    setStatusFilter(tabId);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Status Badge Formatter
  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "CONFIRMED":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          icon: CheckCircle2,
          label: "Confirmed",
        };
      case "PROCESSING":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          icon: RefreshCw,
          label: "Processing",
        };
      case "SHIPPED":
      case "IN_TRANSIT":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          icon: Truck,
          label: "Shipped",
        };
      case "DELIVERED":
      case "COMPLETED":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle2,
          label: "Delivered",
        };
      case "CANCELLED":
      case "FAILED":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          icon: XCircle,
          label: "Cancelled",
        };
      case "PENDING":
      default:
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          icon: Clock3,
          label: "Pending",
        };
    }
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status Filter
      if (statusFilter !== "ALL") {
        const orderStatus = (order.status || "").toUpperCase();
        if (statusFilter === "PENDING" && orderStatus !== "PENDING") {
          return false;
        }
        if (statusFilter === "CONFIRMED" && orderStatus !== "CONFIRMED") {
          return false;
        }
        if (statusFilter === "PROCESSING" && orderStatus !== "PROCESSING") {
          return false;
        }
        if (
          statusFilter === "SHIPPED" &&
          orderStatus !== "SHIPPED" &&
          orderStatus !== "IN_TRANSIT"
        ) {
          return false;
        }
        if (
          statusFilter === "DELIVERED" &&
          orderStatus !== "DELIVERED" &&
          orderStatus !== "COMPLETED"
        ) {
          return false;
        }
        if (
          statusFilter === "CANCELLED" &&
          orderStatus !== "CANCELLED" &&
          orderStatus !== "FAILED"
        ) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesId =
          String(order.id).toLowerCase().includes(query) ||
          `ord-${order.id}`.includes(query);
        const matchesItems = order.items?.some((item) =>
          item.book?.title?.toLowerCase().includes(query),
        );
        const matchesAddress =
          order.deliveryAddress?.city?.toLowerCase().includes(query) ||
          order.deliveryAddress?.streetAddress?.toLowerCase().includes(query);

        return matchesId || matchesItems || matchesAddress;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  const isClientSideSearch = searchQuery.trim().length > 0;
  const isServerPaged = pagination.total > 0 && !isClientSideSearch;

  const totalItems = isServerPaged ? pagination.total : filteredOrders.length;
  const totalPages = isServerPaged
    ? pagination.totalPages
    : Math.ceil(filteredOrders.length / pageSize) || 1;

  const displayedOrders = useMemo(() => {
    if (isServerPaged && orders.length <= pageSize) {
      return filteredOrders;
    }
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, isServerPaged, orders.length, currentPage, pageSize]);

  // Status counts for tab badges
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: pagination.total || orders.length,
      PENDING: 0,
      CONFIRMED: 0,
      PROCESSING: 0,
      SHIPPED: 0,
      DELIVERED: 0,
      CANCELLED: 0,
    };

    if (statusFilter !== "ALL" && pagination.total > 0) {
      counts[statusFilter] = pagination.total;
    }

    orders.forEach((o) => {
      const s = (o.status || "").toUpperCase();
      if (s === "PENDING") counts.PENDING = Math.max(counts.PENDING, 1);
      else if (s === "CONFIRMED")
        counts.CONFIRMED = Math.max(counts.CONFIRMED, 1);
      else if (s === "PROCESSING")
        counts.PROCESSING = Math.max(counts.PROCESSING, 1);
      else if (s === "SHIPPED" || s === "IN_TRANSIT")
        counts.SHIPPED = Math.max(counts.SHIPPED, 1);
      else if (s === "DELIVERED" || s === "COMPLETED")
        counts.DELIVERED = Math.max(counts.DELIVERED, 1);
      else if (s === "CANCELLED" || s === "FAILED")
        counts.CANCELLED = Math.max(counts.CANCELLED, 1);
    });

    return counts;
  }, [orders, pagination.total, statusFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-[#1749A0]" />
            <span>My Orders</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track, view receipts, and manage your book orders.
          </p>
        </div>
      </div>

      {/* Filters & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "PENDING", label: "Pending" },
            { id: "CONFIRMED", label: "Confirmed" },
            { id: "PROCESSING", label: "Processing" },
            { id: "SHIPPED", label: "Shipped" },
            { id: "DELIVERED", label: "Delivered" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => {
            const count = statusCounts[tab.id] ?? 0;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-[#1749A0] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                      statusFilter === tab.id
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by Order # or Title..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#1749A0] focus:border-[#1749A0] transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Orders List Content */}
      {isLoading ? (
        <div className="py-24 bg-white rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center text-slate-400 shadow-2xs">
          <Loader2 className="w-8 h-8 animate-spin text-[#1749A0] mb-2.5" />
          <p className="text-xs font-medium text-slate-600">
            Loading your order history...
          </p>
        </div>
      ) : displayedOrders.length === 0 ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-200/80 p-6 text-center shadow-2xs flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1749A0] flex items-center justify-center mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            No orders found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {searchQuery || statusFilter !== "ALL"
              ? "No orders match your filter criteria. Try adjusting your search."
              : "You have not placed any orders yet. Explore our books to get started!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedOrders.map((order) => {
            const statusConfig = getStatusBadge(order.status);
            const StatusIcon = statusConfig.icon;
            const itemsCount =
              order.items?.reduce(
                (sum, it) => sum + (Number(it.quantity) || 1),
                0,
              ) ||
              order.items?.length ||
              1;

            const orderDateStr = order.createdAt
              ? new Date(order.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Recently";

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="p-4 sm:px-5 sm:py-3.5 bg-slate-50/70 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
                    <span className="text-slate-500 text-[11px] sm:text-xs flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{orderDateStr}</span>
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConfig.bg}`}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span>{statusConfig.label}</span>
                  </div>
                </div>

                {/* Order Body Content */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Book Items Strip */}
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className="flex -space-x-3 overflow-hidden shrink-0">
                      {order.items?.slice(0, 3).map((item, i) => {
                        const cover =
                          item.book?.images?.find((img) => img.type === "COVER")
                            ?.url || item.book?.images?.[0]?.url;
                        return (
                          <div
                            key={item.id || i}
                            className="w-12 h-16 rounded-lg bg-slate-100 border-2 border-white shadow-2xs overflow-hidden relative flex items-center justify-center shrink-0"
                          >
                            {cover ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={cover}
                                alt={item.book?.title || "Book"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <BookOpen className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {order.items?.[0]?.book?.title || "Book Package"}
                        {order.items && order.items.length > 1 && (
                          <span className="text-slate-500 font-normal ml-1">
                            +{order.items.length - 1} more
                          </span>
                        )}
                      </h4>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span>
                          {itemsCount} {itemsCount === 1 ? "item" : "items"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-slate-400" />
                          <span>
                            {order.deliveryOption?.name || "Standard Delivery"}
                          </span>
                        </span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">
                          {order.payment?.method === "COD"
                            ? "Cash on Delivery"
                            : order.payment?.method || "Cash on Delivery"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Total Price & View Details Action */}
                  <div className="flex items-center justify-between md:justify-end gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Total Amount
                      </span>
                      <span className="text-sm sm:text-base font-black text-[#1749A0]">
                        Rs. {Number(order.total || 0).toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/user/orders/${order.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-[#1749A0] text-white text-xs font-semibold rounded-xl shadow-2xs transition active:scale-[0.98]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-6 border-t border-slate-200/80 bg-white p-4 rounded-2xl border shadow-2xs">
              <div className="text-xs text-slate-500 font-medium">
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
                </span>{" "}
                to{" "}
                <span className="font-bold text-slate-800">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">{totalItems}</span>{" "}
                orders
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Previous Button */}
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage <= 1 || isLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      if (totalPages <= 7) return true;
                      if (p === 1 || p === totalPages) return true;
                      if (Math.abs(p - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && p - prev > 1;

                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && (
                            <span className="px-1.5 text-slate-400 text-xs font-semibold">
                              ...
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(p)}
                            disabled={isLoading}
                            className={`min-w-[32px] h-8 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center ${
                              currentPage === p
                                ? "bg-[#1749A0] text-white shadow-2xs font-bold"
                                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage >= totalPages || isLoading}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
