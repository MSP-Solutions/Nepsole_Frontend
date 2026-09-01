"use client";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Order as ApiOrder, OrderItem as ApiOrderItem } from "@/types";

const money = (value = 0) => `Rs. ${Number(value).toLocaleString()}`;

function getStatus(status: string) {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
      return {
        label: "Confirmed",
        icon: CheckCircle2,
        className: "bg-sky-50 text-sky-700 border-sky-200",
      };

    case "PROCESSING":
      return {
        label: "Processing",
        icon: Clock3,
        className: "bg-indigo-50 text-indigo-700 border-indigo-200",
      };

    case "SHIPPED":
    case "IN_TRANSIT":
      return {
        label: "Shipped",
        icon: Truck,
        className: "bg-blue-50 text-blue-700 border-blue-200",
      };

    case "DELIVERED":
    case "COMPLETED":
      return {
        label: "Delivered",
        icon: CheckCircle2,
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };

    case "CANCELLED":
    case "FAILED":
      return {
        label: "Cancelled",
        icon: XCircle,
        className: "bg-rose-50 text-rose-700 border-rose-200",
      };

    case "PENDING":
    default:
      return {
        label: "Pending",
        icon: Clock3,
        className: "bg-amber-50 text-amber-700 border-amber-200",
      };
  }
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);

      try {
        const res = await axiosAuthInstance.get(`/v1/orders/${orderId}`);
        setOrder(res.data?.data || res.data);
      } catch (error) {
        const res = await axiosAuthInstance.get("/v1/orders/history");

        const orders: ApiOrder[] = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];

        const found = orders.find(
          (item) => String(item.id) === String(orderId),
        );

        if (!found) throw error;

        setOrder(found);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to load order.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#1749A0]" />
        <p className="text-sm text-slate-500">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <ShoppingBag className="h-6 w-6 text-slate-400" />
          </div>

          <h2 className="text-lg font-bold text-slate-900">Order not found</h2>

          <p className="mt-1 text-sm text-slate-500">
            We couldn't find order #{orderId}.
          </p>

          <Link
            href="/user/orders"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0F2557]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatus(order.status);
  const StatusIcon = status.icon;

  const paymentStatus = (order.payment?.status || "PENDING").toUpperCase();

  const paymentMethod = order.payment?.method || "COD";

  const date = new Date(order.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/user/orders")}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
          aria-label="Back to orders"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Order Details
          </h1>
          <p className="text-xs text-slate-500">Order #{order.id}</p>
        </div>
      </div>

      {/* Order Hero */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0F2557] to-[#1749A0] p-5 text-white shadow-lg sm:rounded-3xl sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-medium text-blue-200">
              Order #{order.id}
            </p>

            <h2 className="mt-1 text-2xl font-black sm:text-3xl">
              {money(order.total)}
            </h2>

            <p className="mt-2 flex items-center gap-1.5 text-xs text-blue-100">
              <Calendar className="h-3.5 w-3.5" />
              Placed on {date}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${status.className}`}
            >
              <StatusIcon className="h-4 w-4" />
              {status.label}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold text-white">
              <CreditCard className="h-4 w-4" />
              {paymentMethod} · {paymentStatus}
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left */}
        <div className="space-y-5 lg:col-span-2">
          {/* Items */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-[#1749A0]">
                <BookOpen className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Purchased Items
                </h3>
                <p className="text-xs text-slate-500">
                  {order.items?.length || 0}{" "}
                  {order.items?.length === 1 ? "book" : "books"}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {order.items?.map((item) => {
                const cover =
                  item.book?.images?.find((image) => image.type === "COVER")
                    ?.url || item.book?.images?.[0]?.url;

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                      {cover ? (
                        <img
                          src={cover}
                          alt={item.book?.title || "Book"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <BookOpen className="h-5 w-5 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-900">
                        {item.book?.title || "Book"}
                      </h4>

                      {item.book?.authors?.length ? (
                        <p className="mt-1 text-xs text-slate-500">
                          by{" "}
                          {item.book.authors
                            .map((author) => author.name)
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      ) : null}

                      {item.book?.publisher?.name ? (
                        <p className="mt-1 text-[11px] text-slate-400">
                          {item.book.publisher.name}
                        </p>
                      ) : null}

                      <p className="mt-2 text-xs font-medium text-slate-500">
                        {money(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold text-slate-900">
                        {money(item.subtotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Address + Delivery */}
          <div className="grid gap-5 sm:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <MapPin className="h-4 w-4" />
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  Delivery Address
                </h3>
              </div>

              {order.deliveryAddress ? (
                <div className="space-y-1.5 text-sm">
                  <p className="font-semibold text-slate-900">
                    {order.deliveryAddress.streetAddress}
                  </p>

                  {order.deliveryAddress.landmark && (
                    <p className="text-xs text-slate-500">
                      {order.deliveryAddress.landmark}
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
                    <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {order.deliveryAddress.phoneNumber}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Address information is unavailable.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#1749A0]">
                  <Truck className="h-4 w-4" />
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  Delivery Method
                </h3>
              </div>

              <p className="font-semibold text-slate-900">
                {order.deliveryOption?.name || "Standard Delivery"}
              </p>

              {order.deliveryOption?.description && (
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {order.deliveryOption.description}
                </p>
              )}

              {order.deliveryOption?.estimatedDays && (
                <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-xs font-medium text-slate-600">
                  <Clock3 className="h-3.5 w-3.5 text-slate-400" />
                  {order.deliveryOption.estimatedDays}
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Right */}
        <div>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-5">
            <h3 className="border-b border-slate-100 pb-4 text-sm font-bold text-slate-900">
              Order Summary
            </h3>

            {/* Payment */}
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">Payment</span>

                <span className="text-xs font-bold text-slate-900">
                  {paymentMethod === "COD" ? "Cash on Delivery" : paymentMethod}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-xs text-slate-500">Status</span>

                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold ${
                    paymentStatus === "PAID"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
            </div>

            {/* Prices */}
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">
                  {money(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between text-slate-500">
                <span>Shipping</span>
                <span className="font-medium text-slate-900">
                  {order.shippingCost ? money(order.shippingCost) : "Free"}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span className="font-semibold">
                    - {money(order.discount)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="font-bold text-slate-900">Total</span>

                <span className="text-xl font-black text-[#1749A0]">
                  {money(order.total)}
                </span>
              </div>
            </div>

            {/* Trust */}
            <div className="mt-5 flex gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <div>
                <p className="text-xs font-bold text-slate-900">Secure Order</p>

                <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                  Your order is securely processed and fulfilled through our
                  trusted book network.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
