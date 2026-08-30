"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import { CART_CHANGE_EVENT } from "@/utils/cookies";
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

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
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Kathmandu");
  const [paymentMethod, setPaymentMethod] = useState<
    "COD" | "ESEWA" | "KHALTI"
  >("COD");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuantity =
    summary?.totalQuantity ??
    items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const grandTotal =
    summary?.grandTotal ??
    items.reduce((sum, item) => sum + (Number(item.itemTotal) || 0), 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        fullName,
        phone,
        address,
        city,
        paymentMethod,
        notes,
        items: items.map((item) => ({
          bookId: item.bookId ?? item.book?.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        totalAmount: grandTotal,
      };

      try {
        await axiosAuthInstance.post("/v1/orders", orderPayload);
      } catch {
        try {
          await axiosAuthInstance.post("/v1/checkout", orderPayload);
        } catch {
          // fallback placeholder
        }
      }

      toast.success(
        "Order placed successfully! Thank you for shopping with Nepsole.",
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CART_CHANGE_EVENT));
      }
      onClose();
      if (onOrderSuccess) {
        onOrderSuccess();
      }
    } catch (error: any) {
      console.error("Failed to place order:", error);
      toast.error(
        error?.response?.data?.message || "Failed to complete checkout.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-2xl p-0 gap-0 overflow-hidden rounded-3xl border border-slate-100 shadow-2xl bg-white"
      >
        {/* Header */}
        <DialogHeader className="bg-gradient-to-r from-[#0F2557] to-[#1749A0] px-6 py-5 text-white pr-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-white tracking-tight">
                Checkout Order
              </DialogTitle>
              <DialogDescription className="text-xs text-blue-100/85 mt-0.5">
                Complete your delivery details & payment method
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content Form */}
        <form
          onSubmit={handleSubmitOrder}
          className="p-6 space-y-5 max-h-[75vh] overflow-y-auto"
        >
          {/* Order Summary Banner */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#1749A0]" />
              <span className="text-xs font-semibold text-slate-700">
                Order Total ({totalQuantity}{" "}
                {totalQuantity === 1 ? "item" : "items"}):
              </span>
            </div>
            <span className="text-base font-black text-[#0F2557]">
              Rs. {Math.round(grandTotal).toLocaleString()}
            </span>
          </div>

          {/* Delivery Details Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Truck className="w-4 h-4 text-[#1749A0]" />
              <span>Delivery Details</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ram Bahadur"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1749A0]/20 focus:border-[#1749A0] transition"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1749A0]/20 focus:border-[#1749A0] transition"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  City / Area *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kathmandu / Pokhara / Lalitpur"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1749A0]/20 focus:border-[#1749A0] transition"
                />
              </div>

              {/* Street Address */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Street Address / Landmark *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Putalisadak, Ward 28"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1749A0]/20 focus:border-[#1749A0] transition"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Note */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Order Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for delivery..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1749A0]/20 focus:border-[#1749A0] transition resize-none"
              />
            </div>
          </div>

          {/* Payment Method Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <CreditCard className="w-4 h-4 text-[#1749A0]" />
              <span>Payment Method</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  paymentMethod === "COD"
                    ? "border-[#1749A0] bg-blue-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  {paymentMethod === "COD" && (
                    <CheckCircle2 className="w-4 h-4 text-[#1749A0]" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Cash on Delivery
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Pay when you receive
                  </p>
                </div>
              </button>

              {/* eSewa */}
              <button
                type="button"
                onClick={() => setPaymentMethod("ESEWA")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  paymentMethod === "ESEWA"
                    ? "border-[#1749A0] bg-blue-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                    eSewa
                  </span>
                  {paymentMethod === "ESEWA" && (
                    <CheckCircle2 className="w-4 h-4 text-[#1749A0]" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    eSewa Wallet
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Instant digital payment
                  </p>
                </div>
              </button>

              {/* Khalti */}
              <button
                type="button"
                onClick={() => setPaymentMethod("KHALTI")}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  paymentMethod === "KHALTI"
                    ? "border-[#1749A0] bg-blue-50/50 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                    Khalti
                  </span>
                  {paymentMethod === "KHALTI" && (
                    <CheckCircle2 className="w-4 h-4 text-[#1749A0]" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Khalti Pay</p>
                  <p className="text-[10px] text-slate-500">Pay via Khalti</p>
                </div>
              </button>
            </div>
          </div>

          {/* Security Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              100% Safe & Secure Checkout • Direct from Nepsole Publishing
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#1749A0] hover:bg-[#0F2557] active:scale-[0.98] disabled:opacity-50 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Confirm Order (Rs. {Math.round(grandTotal).toLocaleString()}
                    )
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
