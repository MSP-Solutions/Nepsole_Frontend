"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  MapPin,
  Phone,
  Truck,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface OrderSuccessData {
  id: number | string;
  userId?: number;
  deliveryOptionId?: number;
  deliveryOption?: {
    id: number;
    name: string;
    description?: string;
    cost: number;
    estimatedDays?: string;
    isActive?: boolean;
  };
  deliveryAddressId?: number;
  deliveryAddress?: {
    id: number;
    district?: string;
    phoneNumber?: string;
    province?: string;
    city?: string;
    streetAddress?: string;
    landmark?: string;
    isDefault?: boolean;
  };
  status?: string;
  subtotal?: number;
  discount?: number;
  shippingCost?: number;
  total?: number;
  createdAt?: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
    phoneNumber?: string;
  };
  payment?: {
    id?: number;
    method?: string;
    status?: string;
    amount?: number;
    transactionId?: string | null;
  };
  items?: Array<{
    id?: number;
    quantity?: number;
    unitPrice?: number;
    subtotal?: number;
    book?: {
      id?: number;
      title?: string;
      price?: number;
      images?: Array<{ url: string; type?: string }>;
      publisher?: { name?: string };
      authors?: Array<{ name?: string }>;
    };
  }>;
}

interface OrderSuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderSuccessData | null;
}

export default function OrderSuccessDialog({
  open,
  onOpenChange,
  order,
}: OrderSuccessDialogProps) {
  const router = useRouter();

  if (!order) return null;

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleViewOrders = () => {
    onOpenChange(false);
    router.push("/user/orders");
  };

  const status = order.status || "PENDING";
  const paymentStatus = order.payment?.status || "PENDING";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="
          w-[96vw]
          sm:w-[94vw]
          md:w-[90vw]
          max-w-3xl
          lg:max-w-4xl
          p-0
          gap-0
          overflow-hidden
          rounded-2xl
          sm:rounded-3xl
          border border-slate-200/90
          bg-white
          shadow-[0_24px_80px_rgba(15,37,87,0.2)]
          max-h-[92vh]
          sm:max-h-[88vh]
          flex flex-col
        "
      >
        {/* Header */}
        <div className="relative bg-[#0F2557] px-5 sm:px-8 py-5 sm:py-6 text-white shrink-0">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 shadow-md">
              <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-white stroke-[2.5]" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Order Placed Successfully!
              </h2>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-blue-100 font-medium">Order #{order.id}</span>

                <span className="h-1 w-1 rounded-full bg-blue-300/50" />

                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-100 border border-white/10">
                  {status}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close dialog"
              className="
                flex h-8 w-8 shrink-0 items-center justify-center
                rounded-lg text-white/70
                transition hover:bg-white/10 hover:text-white
                cursor-pointer
              "
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-7">
          <div className="space-y-4">
            {/* Ordered Items */}
            {order.items && order.items.length > 0 && (
              <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                      <BookOpen className="h-3.5 w-3.5 text-[#1749A0]" />
                    </div>

                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Order items ({order.items.length})
                      </h3>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-slate-500">
                    Direct Fulfillment
                  </span>
                </div>

                <div className="max-h-52 overflow-y-auto pr-1 divide-y divide-slate-100">
                  {order.items.map((item, idx) => {
                    const coverImg =
                      item.book?.images?.find((img) => img.type === "COVER")
                        ?.url || item.book?.images?.[0]?.url;

                    const itemTotal =
                      item.subtotal ||
                      (item.unitPrice || 0) * (item.quantity || 1);

                    return (
                      <div
                        key={item.id || idx}
                        className="
                          flex items-center gap-3.5
                          py-3 first:pt-0 last:pb-0
                        "
                      >
                        {/* Book Cover */}
                        <div className="flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {coverImg ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={coverImg}
                              alt={item.book?.title || "Book cover"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <BookOpen className="h-4 w-4 text-slate-400" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-xs font-bold text-slate-900">
                            {item.book?.title || "Book"}
                          </h4>

                          <p className="mt-0.5 text-[11px] text-slate-500">
                            Qty: {item.quantity || 1} × Rs.{" "}
                            {Number(item.unitPrice || 0).toLocaleString()}
                          </p>
                        </div>

                        {/* Price */}
                        <p className="shrink-0 text-xs font-bold text-slate-900">
                          Rs. {Number(itemTotal).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Delivery + Payment Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Address */}
              <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs">
                <div className="mb-3 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  </div>

                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Delivery address
                  </h3>
                </div>

                {order.deliveryAddress ? (
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="font-bold text-slate-900 leading-tight">
                      {order.deliveryAddress.streetAddress}
                    </p>

                    {order.deliveryAddress.landmark && (
                      <p className="text-[11px] text-slate-500">
                        Near: {order.deliveryAddress.landmark}
                      </p>
                    )}

                    <p className="text-[11px] text-slate-500">
                      {[
                        order.deliveryAddress.city,
                        order.deliveryAddress.district,
                        order.deliveryAddress.province,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    {order.deliveryAddress.phoneNumber && (
                      <div className="mt-2.5 flex items-center gap-1.5 border-t border-slate-100 pt-2 text-[11px] font-medium text-slate-700">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {order.deliveryAddress.phoneNumber}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Address recorded</p>
                )}
              </section>

              {/* Delivery + Payment */}
              <section className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-2xs">
                <div className="mb-3 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                    <Truck className="h-3.5 w-3.5 text-[#1749A0]" />
                  </div>

                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Delivery & payment
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Delivery */}
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Delivery method
                      </p>

                      <p className="mt-0.5 truncate font-bold text-slate-900">
                        {order.deliveryOption?.name || "Standard Delivery"}
                      </p>

                      {order.deliveryOption?.estimatedDays && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500">
                          <Clock3 className="h-3 w-3 text-slate-400" />
                          {order.deliveryOption.estimatedDays}
                        </div>
                      )}
                    </div>

                    <span className="shrink-0 font-bold text-slate-900">
                      {Number(order.shippingCost || 0) === 0
                        ? "Free"
                        : `Rs. ${Number(order.shippingCost).toLocaleString()}`}
                    </span>
                  </div>

                  <div className="border-t border-slate-100" />

                  {/* Payment */}
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Payment Mode
                      </p>

                      <p className="mt-0.5 font-bold text-slate-900">
                        {order.payment?.method === "COD"
                          ? "Cash on Delivery"
                          : order.payment?.method || "Cash on Delivery"}
                      </p>
                    </div>

                    <span
                      className={`
                        rounded-full px-2.5 py-0.5
                        text-[9px] font-bold uppercase tracking-wide
                        ${
                          paymentStatus === "PAID"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }
                      `}
                    >
                      {paymentStatus}
                    </span>
                  </div>
                </div>
              </section>
            </div>

            {/* Price Summary */}
            <section className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
              <div className="px-4 sm:px-5 py-3 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Order summary
                </h3>
              </div>

              <div className="space-y-2 px-4 sm:px-5 py-3.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">
                    Rs. {Number(order.subtotal || 0).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600">
                  <span>Delivery</span>
                  <span className="font-semibold text-slate-900">
                    {Number(order.shippingCost || 0) === 0
                      ? "Free"
                      : `Rs. ${Number(order.shippingCost).toLocaleString()}`}
                  </span>
                </div>

                {Number(order.discount || 0) > 0 && (
                  <div className="flex items-center justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-bold">
                      - Rs. {Number(order.discount).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
                  <span className="text-sm font-bold text-slate-900">
                    Total
                  </span>

                  <span className="text-base sm:text-lg font-black tracking-tight text-[#1749A0]">
                    Rs. {Number(order.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200/80 bg-white px-5 sm:px-8 py-3.5 sm:py-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="
              w-full rounded-xl px-4 py-2.5
              text-xs sm:text-sm font-semibold text-slate-600
              transition hover:bg-slate-100 hover:text-slate-900
              sm:w-auto
              cursor-pointer
            "
          >
            Continue shopping
          </button>

          <button
            type="button"
            onClick={handleViewOrders}
            className="
              inline-flex w-full items-center justify-center gap-2
              rounded-xl bg-[#1749A0]
              px-6 py-2.5 sm:py-3
              text-xs sm:text-sm font-bold text-white
              shadow-sm hover:shadow-md
              transition
              hover:bg-[#0F2557]
              active:scale-[0.98]
              sm:w-auto
              cursor-pointer
            "
          >
            View my orders
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
