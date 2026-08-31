"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  ShoppingBag,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  ORDER_STATUS_ENUM,
  Order as AdminOrder,
  OrderItem as AdminOrderItem,
  OrderStatus,
} from "@/types";

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

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch Order Details
  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    try {
      let res;
      try {
        res = await axiosAuthInstance.get(`/v1/orders/${orderId}`);
      } catch (err: any) {
        const allRes = await axiosAuthInstance.get("/v1/orders/admin/all");
        const list: AdminOrder[] = Array.isArray(allRes.data?.data)
          ? allRes.data.data
          : Array.isArray(allRes.data)
            ? allRes.data
            : [];
        const found = list.find((o) => String(o.id) === String(orderId));
        if (found) {
          setOrder(found);
          return;
        }
        throw err;
      }

      const data: AdminOrder = res.data?.data || res.data;
      setOrder(data);
    } catch (error: any) {
      console.error("Failed to load admin order details:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load order details.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Handle Save / Update Status via direct Shadcn Select change
  const handleStatusChange = async (newStatus: string) => {
    if (!order || !newStatus || newStatus === order.status?.toUpperCase())
      return;
    setIsUpdating(true);

    const payload = {
      status: newStatus,
      paymentStatus: "PAID",
    };

    try {
      // Single PATCH call to /v1/orders/:orderId/status with paymentStatus by default PAID
      try {
        await axiosAuthInstance.patch(`/v1/orders/${order.id}/status`, payload);
      } catch (err: any) {
        throw err;
      }

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              payment: prev.payment
                ? { ...prev.payment, status: "PAID" }
                : {
                    id: 0,
                    orderId: prev.id,
                    method: "COD",
                    status: "PAID",
                    amount: prev.total,
                  },
            }
          : null,
      );

      toast.success(`Order #${order.id} status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Failed to update status:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update order status.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#1749A0]" />
        <p className="text-sm text-slate-500 font-medium">
          Loading order details...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <ShoppingBag className="h-6 w-6 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Order Not Found</h2>
          <p className="text-sm text-slate-500">
            Could not find order with reference #{orderId}.
          </p>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#0F2557]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusConfig = getStatusConfig(order.status);
  const StatusIcon = currentStatusConfig.icon;
  const paymentStatus = (order.payment?.status || "PENDING").toUpperCase();

  const formattedDate = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recently";

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin/orders")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs"
            aria-label="Back to orders"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Link
                href="/admin/orders"
                className="hover:text-slate-900 transition"
              >
                Admin Orders
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">#{order.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
              Order #{order.id} Details
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchOrderDetails}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Banner */}
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#0F2557] to-[#1749A0] p-5 sm:p-7 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
            Total Order Amount
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Rs. {Number(order.total || 0).toLocaleString()}
          </h2>
          <p className="flex items-center gap-1.5 text-xs text-blue-100/90 pt-1">
            <Calendar className="h-3.5 w-3.5 text-blue-200" />
            <span>Placed on {formattedDate}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold ${currentStatusConfig.bg} ${currentStatusConfig.text}`}
          >
            {StatusIcon}
            <span>Status: {currentStatusConfig.label}</span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold text-white">
            <CreditCard className="h-4 w-4 text-blue-200" />
            <span>
              {order.payment?.method === "COD"
                ? "COD"
                : order.payment?.method || "COD"}{" "}
              • {paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Items & Customer Details (col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Purchased Items Card */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1749A0]">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Items Ordered ({order.items?.length || 0})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Publisher Fulfillment Package
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item) => {
                const cover =
                  item.book?.images?.find((img) => img.type === "COVER")?.url ||
                  item.book?.images?.[0]?.url;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center">
                        {cover ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={cover}
                            alt={item.book?.title || "Book"}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <BookOpen className="h-5 w-5 text-slate-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-slate-900 truncate">
                          {item.book?.title || "Book"}
                        </h4>

                        {item.book?.authors?.length ? (
                          <p className="mt-0.5 text-xs text-slate-500">
                            by {item.book.authors.map((a) => a.name).join(", ")}
                          </p>
                        ) : null}

                        {item.book?.publisher?.name ? (
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            Publisher: {item.book.publisher.name}
                          </p>
                        ) : null}

                        <p className="mt-1 text-xs font-medium text-slate-600">
                          Rs. {Number(item.unitPrice || 0).toLocaleString()} ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right self-end sm:self-center">
                      <p className="text-sm font-bold text-slate-900">
                        Rs.{" "}
                        {Number(
                          item.subtotal ||
                            (item.unitPrice || 0) * (item.quantity || 1),
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Customer Profile & Delivery Address Grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Customer Profile Card */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <User className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Customer Profile
                </h3>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <p className="font-bold text-slate-900 text-sm">
                  {order.user?.name || "Registered Customer"}
                </p>
                {order.user?.email && (
                  <p className="text-slate-500 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{order.user.email}</span>
                  </p>
                )}
                {(order.user?.phoneNumber ||
                  order.deliveryAddress?.phoneNumber) && (
                  <p className="text-slate-700 font-medium flex items-center gap-1.5 pt-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>
                      {order.user?.phoneNumber ||
                        order.deliveryAddress?.phoneNumber}
                    </span>
                  </p>
                )}
                {order.user?.id && (
                  <p className="text-[11px] text-slate-400 pt-1">
                    User Account ID: #{order.user.id}
                  </p>
                )}
              </div>
            </section>

            {/* Delivery Address Card */}
            <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Delivery Address
                </h3>
              </div>

              {order.deliveryAddress ? (
                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <p className="font-bold text-slate-900 text-sm leading-tight">
                    {order.deliveryAddress.streetAddress}
                  </p>
                  {order.deliveryAddress.landmark && (
                    <p className="text-[11px] text-slate-500">
                      Near: {order.deliveryAddress.landmark}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    {[
                      order.deliveryAddress.city,
                      order.deliveryAddress.district,
                      order.deliveryAddress.province,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                  {order.deliveryAddress.phoneNumber && (
                    <p className="text-slate-700 font-medium flex items-center gap-1.5 pt-1.5 border-t border-slate-100">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{order.deliveryAddress.phoneNumber}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Address recorded on order.
                </p>
              )}
            </section>
          </div>
        </div>

        {/* Right Column: Status Updater with Shadcn Select & Receipt (col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Order Status & Direct Shadcn Select Card */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Manage Fulfillment Status
              </h3>
              {isUpdating && (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1749A0]" />
              )}
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Select Order Status:
                </label>

                {/* Shadcn Select Component */}
                <Select
                  value={order.status?.toUpperCase() || "PENDING"}
                  onValueChange={(val: any) => handleStatusChange(String(val))}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-full bg-slate-50 font-bold text-xs sm:text-sm h-11 border-slate-200 rounded-xl">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    {ORDER_STATUS_ENUM.map((status) => (
                      <SelectItem
                        key={status}
                        value={status}
                        className="font-semibold text-xs sm:text-sm py-2"
                      >
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="text-slate-500 font-medium">
                  Payment Status:
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed bg-blue-50/60 p-2.5 rounded-xl border border-blue-100/80">
                Selecting a status sends an update and automatically marks the
                payment status as <strong>PAID</strong>.
              </p>
            </div>
          </section>

          {/* Payment & Receipt Summary */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
              Payment & Receipt
            </h3>

            {/* Payment Method Block */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Payment Mode</span>
                <span className="font-bold text-slate-900">
                  {order.payment?.method === "COD"
                    ? "Cash on Delivery (COD)"
                    : order.payment?.method || "Cash on Delivery"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200/60">
                <span className="text-slate-500 font-medium">
                  Payment Status
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900">
                  Rs. {Number(order.subtotal || 0).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>
                  Shipping ({order.deliveryOption?.name || "Standard"})
                </span>
                <span className="font-semibold text-slate-900">
                  {Number(order.shippingCost || 0) === 0
                    ? "Free"
                    : `Rs. ${Number(order.shippingCost).toLocaleString()}`}
                </span>
              </div>

              {Number(order.discount || 0) > 0 && (
                <div className="flex items-center justify-between text-emerald-600 font-medium">
                  <span>Discount Applied</span>
                  <span className="font-bold">
                    - Rs. {Number(order.discount).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm">
                <span className="font-bold text-slate-900">Grand Total</span>
                <span className="text-base sm:text-lg font-black tracking-tight text-[#1749A0]">
                  Rs. {Number(order.total || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
