"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Eye,
  Mail,
  PackageCheck,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import React, { useState } from "react";

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  bookName: string;
  bookQuantity: number;
  price: string;
  totalPriceNumber: number;
  orderDate: string;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  paymentMethod: "eSewa" | "Khalti" | "Cash on Delivery" | "Card";
  paymentStatus: "Paid" | "Pending" | "Failed";
  shippingAddress: string;
}

const initialOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-8941",
    customerName: "Laxmi Sharma",
    customerEmail: "laxmi.sharma@gmail.com",
    customerPhone: "+977 9841234567",
    bookName: "Atomic Habits",
    bookQuantity: 2,
    price: "Rs. 1,710",
    totalPriceNumber: 1710,
    orderDate: "2026-08-21 14:30",
    status: "Delivered",
    paymentMethod: "eSewa",
    paymentStatus: "Paid",
    shippingAddress: "New Road, Ward 22, Kathmandu",
  },
  {
    id: "2",
    orderNumber: "ORD-8942",
    customerName: "Rohan Karki",
    customerEmail: "rohan.karki@outlook.com",
    customerPhone: "+977 9801987654",
    bookName: "मुनामदन",
    bookQuantity: 1,
    price: "Rs. 180",
    totalPriceNumber: 180,
    orderDate: "2026-08-21 12:15",
    status: "Pending",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Pending",
    shippingAddress: "Patan Dhoka, Lalitpur",
  },
  {
    id: "3",
    orderNumber: "ORD-8943",
    customerName: "Anita Thapa",
    customerEmail: "anita.thapa@yahoo.com",
    customerPhone: "+977 9812345678",
    bookName: "The Psychology of Money",
    bookQuantity: 1,
    price: "Rs. 765",
    totalPriceNumber: 765,
    orderDate: "2026-08-20 16:45",
    status: "Processing",
    paymentMethod: "Khalti",
    paymentStatus: "Paid",
    shippingAddress: "Lakeside, Ward 6, Pokhara",
  },
  {
    id: "4",
    orderNumber: "ORD-8944",
    customerName: "Bishal Shrestha",
    customerEmail: "bishal.s@gmail.com",
    customerPhone: "+977 9860112233",
    bookName: "अच्युत कृष्ण खरेल",
    bookQuantity: 1,
    price: "Rs. 595",
    totalPriceNumber: 595,
    orderDate: "2026-08-20 09:20",
    status: "Shipped",
    paymentMethod: "eSewa",
    paymentStatus: "Paid",
    shippingAddress: "Naya Baneshwor, Kathmandu",
  },
  {
    id: "5",
    orderNumber: "ORD-8945",
    customerName: "Sunita Adhikari",
    customerEmail: "sunita.a@gmail.com",
    customerPhone: "+977 9849887766",
    bookName: "Palpasa Café",
    bookQuantity: 3,
    price: "Rs. 1,260",
    totalPriceNumber: 1260,
    orderDate: "2026-08-19 18:10",
    status: "Delivered",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    shippingAddress: "Bharatpur Heights, Chitwan",
  },
  {
    id: "6",
    orderNumber: "ORD-8946",
    customerName: "Dipesh Bhattarai",
    customerEmail: "dipesh.b@gmail.com",
    customerPhone: "+977 9803445566",
    bookName: "Sapiens: A Brief History of Humankind",
    bookQuantity: 1,
    price: "Rs. 890",
    totalPriceNumber: 890,
    orderDate: "2026-08-19 11:05",
    status: "Cancelled",
    paymentMethod: "Cash on Delivery",
    paymentStatus: "Failed",
    shippingAddress: "Bhanu Chowk, Dharan",
  },
];

const statusStyles: Record<
  Order["status"],
  { bg: string; text: string; icon: React.ReactNode }
> = {
  Pending: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  Processing: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    icon: <PackageCheck className="w-3.5 h-3.5" />,
  },
  Shipped: {
    bg: "bg-indigo-50 border-indigo-200",
    text: "text-indigo-700",
    icon: <Truck className="w-3.5 h-3.5" />,
  },
  Delivered: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  Cancelled: {
    bg: "bg-rose-50 border-rose-200",
    text: "text-rose-700",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Filter orders by search & status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm) ||
      order.bookName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === "All" || order.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalOrdersCount = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((sum, o) => sum + o.totalPriceNumber, 0);
  const pendingOrdersCount = orders.filter(
    (o) => o.status === "Pending",
  ).length;
  const deliveredOrdersCount = orders.filter(
    (o) => o.status === "Delivered",
  ).length;

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-8 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">
              Orders Management
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Track customer orders, manage shipments, and inspect order
              details.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm w-fit">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{totalOrdersCount} Total Orders</span>
          </div>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Total Orders
              </span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {totalOrdersCount}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              All time orders
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Total Revenue
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">
              Rs. {totalRevenue.toLocaleString()}
            </p>
            <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
              Excluding cancelled
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Pending Orders
              </span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {pendingOrdersCount}
            </p>
            <span className="text-[11px] text-amber-600 font-medium mt-0.5 block">
              Needs processing
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Delivered
              </span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {deliveredOrdersCount}
            </p>
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Completed deliveries
            </span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, email, phone, book title, or order #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/60 pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Tabs Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              "All",
              "Pending",
              "Processing",
              "Shipped",
              "Delivered",
              "Cancelled",
            ].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                  selectedStatusFilter === status
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop / Tablet Data Table */}
        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3.5">Order Info</th>
                <th className="px-5 py-3.5">Customer Details</th>
                <th className="px-5 py-3.5">Book Ordered</th>
                <th className="px-5 py-3.5">Total Price</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const statusConfig = statusStyles[order.status];

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order Info */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          #{order.orderNumber}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{order.orderDate}</span>
                        </div>
                      </td>

                      {/* Customer Details (Name, Email, Phone Number) */}
                      <td className="px-5 py-4 min-w-[220px]">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {order.customerEmail}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{order.customerPhone}</span>
                        </div>
                      </td>

                      {/* Book Name */}
                      <td className="px-5 py-4 min-w-[200px]">
                        <div className="flex items-start gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                            <BookOpen className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 line-clamp-1">
                              {order.bookName}
                            </p>
                            <p className="text-xs text-slate-400">
                              Qty: {order.bookQuantity}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Price & Payment */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {order.price}
                        </div>
                        <span className="inline-block mt-0.5 text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Status */}
                      <td
                        className="px-5 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(
                              order.id,
                              e.target.value as Order["status"],
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-5 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-400 text-xs sm:text-sm"
                  >
                    No orders found matching your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View: Cards Layout for Small Screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 md:hidden">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => {
              const statusConfig = statusStyles[order.status];

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition space-y-3 cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  {/* Top Bar: Order ID & Status */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-600">
                        #{order.orderNumber}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        {order.orderDate}
                      </p>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.bg} ${statusConfig.text}`}
                    >
                      {statusConfig.icon}
                      {order.status}
                    </span>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Customer Information (Name, Email, Phone) */}
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{order.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  {/* Book & Price */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {order.bookName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Qty: {order.bookQuantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900">{order.price}</p>
                      <p className="text-[9px] text-slate-500">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div
                    className="pt-2 flex items-center justify-between border-t border-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </button>

                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          e.target.value as Order["status"],
                        )
                      }
                      className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-slate-50 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-10 text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
              No orders found matching your search criteria.
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Dialog
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
        >
          <DialogContent
            showCloseButton={false}
            className="w-[95vw] sm:w-full max-w-xl p-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  Order Details #{selectedOrder.orderNumber}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Placed on {selectedOrder.orderDate}
                </DialogDescription>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs sm:text-sm">
              {/* Order Status Bar */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    Order Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-1 ${
                      statusStyles[selectedOrder.status].bg
                    } ${statusStyles[selectedOrder.status].text}`}
                  >
                    {statusStyles[selectedOrder.status].icon}
                    {selectedOrder.status}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block font-medium">
                    Update Status
                  </span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(
                        selectedOrder.id,
                        e.target.value as Order["status"],
                      )
                    }
                    className="mt-1 text-xs border border-slate-300 rounded-lg px-2.5 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer Information (Email, Phone, Name) */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Customer Information
                </h4>
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/50 space-y-2 text-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">
                      Full Name:
                    </span>
                    <span className="font-semibold text-slate-900">
                      {selectedOrder.customerName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">
                      Email Address:
                    </span>
                    <span className="font-semibold text-indigo-600">
                      {selectedOrder.customerEmail}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">
                      Phone Number:
                    </span>
                    <span className="font-semibold text-slate-900">
                      {selectedOrder.customerPhone}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3 pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium shrink-0">
                      Shipping Address:
                    </span>
                    <span className="font-medium text-slate-800 text-right">
                      {selectedOrder.shippingAddress}
                    </span>
                  </div>
                </div>
              </div>

              {/* Book Item Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Items Ordered
                </h4>
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {selectedOrder.bookName}
                      </p>
                      <p className="text-xs text-slate-500">
                        Quantity: {selectedOrder.bookQuantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">
                      {selectedOrder.price}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Payment Summary
                </h4>
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-slate-50/50 space-y-2 text-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-semibold text-slate-900">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Payment Status:</span>
                    <span
                      className={`font-semibold ${
                        selectedOrder.paymentStatus === "Paid"
                          ? "text-emerald-600"
                          : selectedOrder.paymentStatus === "Pending"
                            ? "text-amber-600"
                            : "text-rose-600"
                      }`}
                    >
                      {selectedOrder.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 font-bold text-sm text-slate-900">
                    <span>Total Amount Paid:</span>
                    <span className="text-indigo-600">
                      {selectedOrder.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition"
              >
                Close
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
