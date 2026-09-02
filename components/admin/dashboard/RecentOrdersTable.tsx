"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  PackageCheck,
  Eye,
} from "lucide-react";
import { axiosAuthInstance } from "@/utils/axiosInstances";

export interface RecentOrder {
  id: number | string;
  orderNumber?: string;
  code?: string;
  customerName?: string;
  user?: {
    id?: number | string;
    name?: string;
    fullName?: string;
    email?: string;
  };
  shippingAddress?: {
    fullName?: string;
    name?: string;
    phone?: string;
    city?: string;
  };
  totalAmount?: number | string;
  totalPrice?: number | string;
  total?: number | string;
  orderStatus?: string;
  status?: string;
  paymentStatus?: string;
  createdAt?: string;
  orderItems?: any[];
  items?: any[];
  [key: string]: any;
}

export default function RecentOrdersTable() {
  const [orders, setOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      setLoading(true);
      try {
        const res = await axiosAuthInstance.get(
          "/v1/dashboard/admin/recent-orders"
        );
        const data = res.data?.data || res.data || [];
        const list = Array.isArray(data)
          ? data
          : data?.orders || data?.items || [];
        setOrders(list);
      } catch (err) {
        console.error("Failed to load recent orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const getStatusBadge = (status?: string) => {
    const s = String(status || "").toUpperCase();
    if (s.includes("DELIVERED") || s.includes("COMPLETED")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle className="w-3 h-3" />
          <span>Delivered</span>
        </span>
      );
    }
    if (s.includes("SHIPPED") || s.includes("DISPATCHED")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Truck className="w-3 h-3" />
          <span>Shipped</span>
        </span>
      );
    }
    if (s.includes("CANCEL") || s.includes("REJECT")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3 h-3" />
          <span>Cancelled</span>
        </span>
      );
    }
    if (s.includes("CONFIRMED") || s.includes("PROCESSING")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Clock className="w-3 h-3" />
          <span>Processing</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <PackageCheck className="w-3 h-3" />
        <span>{status || "Pending"}</span>
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      {/* Table Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Recent Customer Orders
            </h2>
            <p className="text-xs text-slate-400">
              Latest transactions placed on platform
            </p>
          </div>
        </div>

        <Link
          href="/admin/orders"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
        >
          <span>View All Orders</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto mt-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[620px] text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-3 pr-4 font-bold">Order Code</th>
              <th className="py-3 px-4 font-bold">Customer</th>
              <th className="py-3 px-4 font-bold">Items</th>
              <th className="py-3 px-4 font-bold">Total Amount</th>
              <th className="py-3 px-4 font-bold">Placed On</th>
              <th className="py-3 px-4 font-bold">Status</th>
              <th className="py-3 pl-4 font-bold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-3.5 pr-4">
                    <div className="w-20 h-4 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-28 h-4 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-12 h-4 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-16 h-4 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-20 h-4 bg-slate-100 rounded" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-20 h-6 bg-slate-100 rounded-full" />
                  </td>
                  <td className="py-3.5 pl-4 text-right">
                    <div className="w-6 h-6 bg-slate-100 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : orders.length > 0 ? (
              orders.slice(0, 7).map((order) => {
                const code =
                  order.orderNumber || order.code || `ORD-${order.id}`;
                const customer =
                  order.customerName ||
                  order.shippingAddress?.fullName ||
                  order.shippingAddress?.name ||
                  order.user?.fullName ||
                  order.user?.name ||
                  order.user?.email ||
                  "Guest Customer";
                const itemsCount =
                  order.orderItems?.length || order.items?.length || 1;
                const total =
                  order.totalAmount ?? order.totalPrice ?? order.total ?? 0;
                const date = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent";
                const status = order.orderStatus || order.status || "Pending";

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3.5 pr-4 font-bold text-indigo-600">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>{code}</span>
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <div className="truncate max-w-[160px]">{customer}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {itemsCount} {itemsCount === 1 ? "item" : "items"}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      Rs. {Number(total).toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {date}
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(status)}</td>

                    <td className="py-3.5 pl-4 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="View order"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400">
                  <ShoppingBag className="w-8 h-8 text-slate-200 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-700">No orders placed yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Orders will show up here as customers check out.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
