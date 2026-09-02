"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock3,
  RefreshCw,
  XCircle,
  ChevronRight,
  ArrowRight,
  FileText,
  BookOpen,
} from "lucide-react";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import toast from "react-hot-toast";

export interface UserOrderItem {
  id?: number | string;
  bookId?: number | string;
  quantity?: number;
  price?: number | string;
  book?: {
    id?: number | string;
    title?: string;
    images?: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

export interface UserOrder {
  id: number | string;
  totalAmount?: number | string;
  total?: number | string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string;
  createdAt: string;
  updatedAt?: string;
  items?: UserOrderItem[];
  orderItems?: UserOrderItem[];
  trackingNumber?: string;
  courier?: string;
  [key: string]: any;
}

export default function UserRecentOrders() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRecentOrders = async () => {
    setIsLoading(true);
    try {
      let res;
      try {
        res = await axiosAuthInstance.get("/v1/dashboard/user/recent-orders");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          try {
            res = await axiosAuthInstance.get("/v1/orders/history");
          } catch {
            res = await axiosAuthInstance.get("/v1/orders");
          }
        } else {
          throw err;
        }
      }

      const raw = res?.data?.data || res?.data?.orders || res?.data || [];
      const list: UserOrder[] = Array.isArray(raw) ? raw : [];
      setOrders(list.slice(0, 5));
    } catch (error) {
      console.error("Failed to load user recent orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "CONFIRMED":
        return {
          bg: "bg-sky-50 text-sky-700 border-sky-200/80",
          icon: CheckCircle2,
          label: "Confirmed",
        };
      case "PROCESSING":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200/80",
          icon: RefreshCw,
          label: "Processing",
        };
      case "SHIPPED":
      case "IN_TRANSIT":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200/80 animate-pulse",
          icon: Truck,
          label: "In Transit",
        };
      case "DELIVERED":
      case "COMPLETED":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
          icon: CheckCircle2,
          label: "Delivered",
        };
      case "CANCELLED":
      case "FAILED":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200/80",
          icon: XCircle,
          label: "Cancelled",
        };
      case "PENDING":
      default:
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200/80",
          icon: Clock3,
          label: status || "Pending",
        };
    }
  };

  const copyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Tracking code ${code} copied to clipboard!`);
  };

  // Find active in-transit or processing order for quick tracker banner
  const activeOrder = orders.find((o) => {
    const s = (o.status || "").toUpperCase();
    return (
      s === "SHIPPED" ||
      s === "IN_TRANSIT" ||
      s === "PROCESSING" ||
      s === "CONFIRMED"
    );
  });

  return (
    <div className="space-y-4">
      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>Recent Orders</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Summary of your recent book purchases & shipments
            </p>
          </div>

          <Link
            href="/user/orders"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-slate-50 rounded-xl animate-pulse border border-slate-100"
              />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto -mx-5 sm:mx-0 px-5 sm:px-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 rounded-l-lg">Order ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {orders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const Icon = badge.icon;
                  const itemsList = order.items || order.orderItems || [];
                  const itemsCount =
                    itemsList.reduce(
                      (acc, item) => acc + (item.quantity || 1),
                      0,
                    ) ||
                    itemsList.length ||
                    1;
                  const totalFormatted =
                    order.totalAmount !== undefined
                      ? `Rs. ${Number(order.totalAmount).toLocaleString()}`
                      : order.total !== undefined
                        ? `Rs. ${Number(order.total).toLocaleString()}`
                        : "Rs. 0";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="py-3 px-3 font-bold text-indigo-600 font-mono">
                        #{order.id}
                      </td>
                      <td className="py-3 px-3 text-slate-500 font-medium">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "Recently"}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {itemsCount} {itemsCount === 1 ? "Book" : "Books"}
                      </td>
                      <td className="py-3 px-3 font-black text-slate-900">
                        {totalFormatted}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          <Icon className="w-3 h-3 shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/user/orders/${order.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold text-[11px] transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              No orders placed yet
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Explore our catalog and find your next favorite read.
            </p>
            <Link
              href="/books"
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Browse Books</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
