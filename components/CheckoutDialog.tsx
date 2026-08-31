"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import AddressDialog, {
  DeliveryAddress,
} from "@/components/user/AddressDialog";
import OrderSuccessDialog, {
  OrderSuccessData,
} from "@/components/OrderSuccessDialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import { CART_CHANGE_EVENT } from "@/utils/cookies";
import {
  Banknote,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  MapPin,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export interface DeliveryOption {
  id: number | string;
  name: string;
  description?: string;
  cost: number;
  estimatedDays: string;
  isActive?: boolean;
}

export interface CheckoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    id: string | number;
    bookId: string | number;
    quantity: number;
    unitPrice: number;
    originalPrice?: number;
    itemTotal: number;
    book?: {
      id: string | number;
      title: string;
      stock?: number;
      images?: Array<{ url: string; type?: string }>;
    };
  }>;
  summary: {
    distinctItems: number;
    totalQuantity: number;
    subtotal: number;
    totalDiscount: number;
    grandTotal: number;
  } | null;
  onOrderSuccess?: () => void;
}

export default function CheckoutDialog({
  isOpen,
  onClose,
  items,
  summary,
  onOrderSuccess,
}: CheckoutDialogProps) {
  // Data lists
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Selected values
  const [selectedAddressId, setSelectedAddressId] = useState<
    number | string | null
  >(null);
  const [selectedDeliveryOptionId, setSelectedDeliveryOptionId] = useState<
    number | string | null
  >(null);
  const [paymentMethod, setPaymentMethod] = useState<
    "COD" | "ESEWA" | "KHALTI"
  >("COD");

  // Success dialog state
  const [createdOrder, setCreatedOrder] = useState<OrderSuccessData | null>(
    null
  );
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  // Add Address Modal state
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals
  const totalQuantity =
    summary?.totalQuantity ??
    items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const subtotal =
    summary?.grandTotal ??
    items.reduce((sum, item) => sum + (Number(item.itemTotal) || 0), 0);

  const selectedOption = deliveryOptions.find(
    (opt) => String(opt.id) === String(selectedDeliveryOptionId)
  );
  const deliveryCost = Number(selectedOption?.cost || 0);
  const grandTotal = subtotal + deliveryCost;

  // Fetch Delivery Addresses & Options
  const fetchCheckoutData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [addressRes, optionRes] = await Promise.all([
        axiosAuthInstance.get("/v1/delivery-addresses").catch((err) => {
          console.error("Failed to fetch delivery addresses:", err);
          return { data: [] };
        }),
        axiosAuthInstance.get("/v1/delivery-options").catch((err) => {
          console.error("Failed to fetch delivery options:", err);
          return { data: [] };
        }),
      ]);

      // Process addresses
      const addrList: DeliveryAddress[] = Array.isArray(addressRes.data?.data)
        ? addressRes.data.data
        : Array.isArray(addressRes.data)
        ? addressRes.data
        : [];
      setAddresses(addrList);

      if (addrList.length > 0) {
        const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0];
        setSelectedAddressId((prev) =>
          prev ? prev : (defaultAddr.id ?? null)
        );
      }

      // Process delivery options
      const optList: DeliveryOption[] = Array.isArray(optionRes.data?.data)
        ? optionRes.data.data
        : Array.isArray(optionRes.data)
        ? optionRes.data
        : [];
      const activeOptions = optList.filter((opt) => opt.isActive !== false);
      setDeliveryOptions(activeOptions);

      if (activeOptions.length > 0) {
        setSelectedDeliveryOptionId((prev) =>
          prev ? prev : activeOptions[0].id
        );
      }
    } catch (error) {
      console.error("Error loading checkout data:", error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchCheckoutData();
    }
  }, [isOpen, fetchCheckoutData]);

  // Handle Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddressId) {
      toast.error("Please select or add a delivery address.");
      return;
    }

    if (!selectedDeliveryOptionId) {
      toast.error("Please select a delivery option.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        paymentMethod,
        deliveryOptionId: Number(selectedDeliveryOptionId),
        deliveryAddressId: Number(selectedAddressId),
      };

      let res;
      try {
        res = await axiosAuthInstance.post("/v1/orders", orderPayload);
      } catch (postErr: any) {
        if (postErr?.response?.status === 404) {
          res = await axiosAuthInstance.post("/v1/checkout", orderPayload);
        } else {
          throw postErr;
        }
      }

      const orderData: OrderSuccessData = res?.data?.data || res?.data;

      toast.success(
        res?.data?.message ||
          "Order placed successfully! Thank you for shopping with Nepsole."
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CART_CHANGE_EVENT));
      }

      // Close checkout dialog and open dedicated success dialog
      onClose();
      if (orderData) {
        setCreatedOrder(orderData);
        setIsSuccessOpen(true);
      }

      if (onOrderSuccess) {
        onOrderSuccess();
      }
    } catch (error: any) {
      console.error("Failed to place order:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="
            w-[96vw]
            sm:w-[94vw]
            md:w-[90vw]
            max-w-4xl
            xl:max-w-5xl
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
          <div className="bg-gradient-to-r from-[#0F2557] via-[#153e8a] to-[#1749A0] px-5 sm:px-8 py-4 sm:py-5 text-white relative shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20 shrink-0">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Checkout Order
                  </DialogTitle>
                  <DialogDescription className="text-xs text-blue-100/85 mt-0.5">
                    Select delivery address, shipping method & confirm your purchase
                  </DialogDescription>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content Form */}
          <form
            onSubmit={handleSubmitOrder}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="p-4 sm:p-6 lg:p-7 overflow-y-auto flex-1 bg-slate-50/50">
              {isLoadingData ? (
                <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#1749A0] mb-2.5" />
                  <span className="text-xs font-medium text-slate-600">
                    Loading delivery addresses & options...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                  {/* Left Column: Form Steps (col-span-7) */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* 1. Delivery Address Selection */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            1. Delivery Address
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsAddAddressOpen(true)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#1749A0] hover:text-[#0F2557] transition cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add New Address</span>
                        </button>
                      </div>

                      {addresses.length === 0 ? (
                        <div className="p-5 border border-dashed border-slate-300 rounded-xl text-center bg-slate-50/60">
                          <MapPin className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs font-medium text-slate-700">
                            No saved delivery addresses found
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Please add an address to complete your order.
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsAddAddressOpen(true)}
                            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1749A0] text-white text-xs font-semibold rounded-xl hover:bg-[#0F2557] transition cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Address</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {addresses.map((addr) => {
                            const isSelected =
                              String(addr.id) === String(selectedAddressId);
                            return (
                              <div
                                key={addr.id || addr.streetAddress}
                                onClick={() =>
                                  setSelectedAddressId(addr.id ?? null)
                                }
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                                  isSelected
                                    ? "border-[#1749A0] bg-blue-50/50 shadow-xs ring-1.5 ring-[#1749A0]"
                                    : "border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/60"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-slate-900">
                                      {addr.city || addr.district}
                                    </span>
                                    {addr.isDefault && (
                                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 border ${
                                      isSelected
                                        ? "bg-[#1749A0] border-[#1749A0] text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && (
                                      <CheckCircle2 className="w-4.5 h-4.5" />
                                    )}
                                  </div>
                                </div>

                                <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                                  {addr.streetAddress}
                                  {addr.landmark
                                    ? ` (Near ${addr.landmark})`
                                    : ""}
                                </p>

                                <p className="text-[11px] text-slate-500 mt-1">
                                  {addr.district}, {addr.province}
                                </p>

                                {addr.phoneNumber && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-2 pt-2 border-t border-slate-100/90 font-medium">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{addr.phoneNumber}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 2. Delivery Option Selection */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1749A0] flex items-center justify-center">
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          2. Delivery Option
                        </span>
                      </div>

                      {deliveryOptions.length === 0 ? (
                        <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center bg-white text-xs text-slate-500">
                          Standard shipping option will be applied.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {deliveryOptions.map((opt) => {
                            const isSelected =
                              String(opt.id) ===
                              String(selectedDeliveryOptionId);
                            return (
                              <div
                                key={opt.id}
                                onClick={() =>
                                  setSelectedDeliveryOptionId(opt.id)
                                }
                                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between select-none ${
                                  isSelected
                                    ? "border-[#1749A0] bg-blue-50/50 shadow-xs ring-1.5 ring-[#1749A0]"
                                    : "border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/60"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                                        isSelected
                                          ? "bg-[#1749A0]/10 text-[#1749A0]"
                                          : "bg-slate-100 text-slate-600"
                                      }`}
                                    >
                                      <Package className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-bold text-slate-900 capitalize">
                                      {opt.name}
                                    </span>
                                  </div>
                                  <div
                                    className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 border ${
                                      isSelected
                                        ? "bg-[#1749A0] border-[#1749A0] text-white"
                                        : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && (
                                      <CheckCircle2 className="w-4.5 h-4.5" />
                                    )}
                                  </div>
                                </div>

                                {opt.description && (
                                  <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                                    {opt.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between text-xs mt-auto pt-2 border-t border-slate-100/90">
                                  <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                                    <Clock3 className="w-3 h-3 text-slate-400" />
                                    <span>{opt.estimatedDays}</span>
                                  </div>

                                  <span className="font-bold text-[#0F2557]">
                                    {Number(opt.cost) === 0
                                      ? "FREE"
                                      : `Rs. ${Number(opt.cost).toLocaleString()}`}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 3. Payment Method Section */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          3. Payment Method
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {/* Cash on Delivery */}
                        <div
                          onClick={() => setPaymentMethod("COD")}
                          className="p-3.5 rounded-xl border border-[#1749A0] bg-blue-50/50 shadow-xs ring-1.5 ring-[#1749A0] transition cursor-pointer flex items-center justify-between select-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                              <Banknote className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">
                                Cash on Delivery (COD)
                              </p>
                              <p className="text-[11px] text-slate-500">
                                Pay with cash or Fonepay QR upon parcel arrival
                              </p>
                            </div>
                          </div>

                          <div className="w-5 h-5 rounded-full bg-[#1749A0] text-white flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Order Summary & Review (col-span-5) */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Order Summary Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 pb-3 border-b border-slate-100">
                        <Sparkles className="w-4 h-4 text-[#1749A0]" />
                        <span>Order Summary</span>
                      </div>

                      {/* Items Mini-Preview */}
                      {items && items.length > 0 && (
                        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 divide-y divide-slate-100">
                          {items.map((item, idx) => (
                            <div
                              key={item.id || idx}
                              className="flex items-center justify-between gap-3 pt-2 first:pt-0 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-slate-900 truncate">
                                  {item.book?.title || `Item ${idx + 1}`}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Qty: {item.quantity} × Rs.{" "}
                                  {Number(item.unitPrice || 0).toLocaleString()}
                                </p>
                              </div>
                              <span className="font-bold text-slate-900 shrink-0">
                                Rs.{" "}
                                {Number(
                                  item.itemTotal ||
                                    item.unitPrice * item.quantity
                                ).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Cost Breakdown */}
                      <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-slate-600">
                          <span>Items Subtotal</span>
                          <span className="font-semibold text-slate-900">
                            Rs. {Math.round(subtotal).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-slate-600">
                          <span>Estimated Delivery</span>
                          <span className="font-semibold text-slate-900">
                            {deliveryCost > 0
                              ? `Rs. ${deliveryCost}`
                              : "Free Delivery"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-sm">
                          <span className="font-bold text-slate-900">
                            Grand Total
                          </span>
                          <span className="text-base sm:text-lg font-black text-[#1749A0]">
                            Rs. {Math.round(grandTotal).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trust & Guarantee Box */}
                    <div className="bg-blue-50/70 border border-blue-100/90 rounded-2xl p-4 flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-900 block">
                          100% Genuine Books
                        </span>
                        <p className="text-slate-500 mt-0.5 leading-relaxed text-[11px]">
                          All books are dispatched directly by Nepsole Publishing and trusted partners.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-5 sm:px-8 py-3.5 sm:py-4 bg-white border-t border-slate-200/80 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isLoadingData ||
                  !selectedAddressId ||
                  !selectedDeliveryOptionId
                }
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#1749A0] hover:bg-[#0F2557] active:scale-[0.98] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Confirm Order (Rs.{" "}
                      {Math.round(grandTotal).toLocaleString()})
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Address Dialog Modal */}
      <AddressDialog
        open={isAddAddressOpen}
        onOpenChange={setIsAddAddressOpen}
        onSuccess={fetchCheckoutData}
      />

      {/* Dedicated Order Success Dialog Modal */}
      <OrderSuccessDialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
        order={createdOrder}
      />
    </>
  );
}
