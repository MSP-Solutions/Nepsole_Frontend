"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import { CART_CHANGE_EVENT, getUserCookie } from "@/utils/cookies";
import { provinces } from "@/lib/data/data";
import {
  Banknote,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
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
  // Guest vs Logged-in state
  const [isGuest, setIsGuest] = useState(false);

  // Guest inputs
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestProvince, setGuestProvince] = useState("Bagmati Province");
  const [guestDistrict, setGuestDistrict] = useState("Kathmandu");
  const [guestCity, setGuestCity] = useState("");
  const [guestStreetAddress, setGuestStreetAddress] = useState("");
  const [guestLandmark, setGuestLandmark] = useState("");

  // Authenticated user lists
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

  // Add Address Modal state for logged in user
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate districts for selected province in Guest Form
  const currentProvinceObj = useMemo(() => {
    return (
      provinces.find(
        (p) =>
          p.name.toLowerCase() === guestProvince.toLowerCase() ||
          p.name
            .replace(/\s+Province$/i, "")
            .toLowerCase() ===
            guestProvince
              .replace(/\s+Province$/i, "")
              .toLowerCase()
      ) || provinces[2] // Default to Bagmati
    );
  }, [guestProvince]);

  const availableDistricts = currentProvinceObj?.districts || [];

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provName = e.target.value;
    setGuestProvince(provName);
    const targetP = provinces.find((p) => p.name === provName);
    if (targetP && targetP.districts.length > 0) {
      setGuestDistrict(targetP.districts[0].name);
    }
  };

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
      const user = await getUserCookie();
      const guest = !user?.accessToken;
      setIsGuest(guest);

      // Fetch delivery options using public axiosInstance
      let optData: any[] = [];
      try {
        const optionRes = await axiosInstance.get("/v1/delivery-options");
        optData = optionRes?.data?.data || optionRes?.data || [];
      } catch {
        try {
          const optRes2 = await axiosInstance.get("/api/v1/delivery-options");
          optData = optRes2?.data?.data || optRes2?.data || [];
        } catch {
          // Fallback will be used below
        }
      }

      let optList: DeliveryOption[] = Array.isArray(optData) ? optData : [];
      if (optList.length === 0) {
        optList = [
          {
            id: 4,
            name: "Standard Delivery (Nepal)",
            description: "Standard delivery across all provinces and cities in Nepal",
            cost: 100,
            estimatedDays: "2-4 Business Days",
            isActive: true,
          },
          {
            id: 1,
            name: "Inside Kathmandu Valley",
            description: "Express same-day or next-day delivery inside valley",
            cost: 50,
            estimatedDays: "1-2 Business Days",
            isActive: true,
          },
        ];
      }

      const activeOptions = optList.filter((opt) => opt.isActive !== false);
      setDeliveryOptions(activeOptions);

      if (activeOptions.length > 0) {
        const hasOption4 = activeOptions.find((o) => Number(o.id) === 4);
        setSelectedDeliveryOptionId((prev) =>
          prev ? prev : (hasOption4 ? hasOption4.id : activeOptions[0].id)
        );
      }

      // If user is authenticated, fetch their saved delivery addresses
      if (!guest) {
        try {
          const addressRes = await axiosAuthInstance.get("/v1/delivery-addresses");
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
        } catch (addrErr) {
          console.error("Failed to fetch saved delivery addresses:", addrErr);
        }
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

    // ─── Guest Order Flow ────────────────────────────────────────────────────────
    if (isGuest) {
      if (!guestName.trim()) {
        toast.error("Please enter your full name.");
        return;
      }
      if (!guestEmail.trim() || !guestEmail.includes("@")) {
        toast.error("Please enter a valid email address.");
        return;
      }
      if (!guestPhone.trim() || guestPhone.trim().length < 7) {
        toast.error("Please enter a valid phone number.");
        return;
      }
      if (!guestProvince.trim()) {
        toast.error("Please select a province.");
        return;
      }
      if (!guestDistrict.trim()) {
        toast.error("Please select a district.");
        return;
      }
      if (!guestCity.trim()) {
        toast.error("Please enter your city / town.");
        return;
      }
      if (!guestStreetAddress.trim()) {
        toast.error("Please enter your street address.");
        return;
      }
      if (!selectedDeliveryOptionId) {
        toast.error("Please select a delivery option.");
        return;
      }

      setIsSubmitting(true);

      try {
        const cleanProvince = guestProvince
          .replace(/\s+Province$/i, "")
          .trim();

        const guestPayload = {
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
          guestAddress: {
            district: guestDistrict.trim(),
            city: guestCity.trim(),
            streetAddress: guestStreetAddress.trim(),
            province: cleanProvince,
            landmark: guestLandmark.trim(),
          },
          items: items.map((it) => ({
            bookId: Number(it.bookId ?? it.book?.id ?? it.id),
            quantity: Number(it.quantity) || 1,
          })),
          paymentMethod,
          deliveryOptionId: Number(selectedDeliveryOptionId),
        };

        let res;
        try {
          res = await axiosInstance.post("/api/v1/orders/guest", guestPayload);
        } catch (postErr: any) {
          if (postErr?.response?.status === 404) {
            res = await axiosInstance.post("/v1/orders/guest", guestPayload);
          } else {
            throw postErr;
          }
        }

        // Clear local cart
        if (typeof window !== "undefined") {
          localStorage.removeItem("nepsole_cart");
          window.dispatchEvent(new Event(CART_CHANGE_EVENT));
        }

        const orderData: any = res?.data?.data || res?.data;
        const successOrder: OrderSuccessData = {
          id:
            orderData?.id ||
            orderData?.orderId ||
            `GST-${Date.now().toString().slice(-6)}`,
          status: orderData?.status || "CONFIRMED",
          total: grandTotal,
          subtotal: subtotal,
          shippingCost: deliveryCost,
          deliveryAddress: {
            id: 0,
            district: guestDistrict,
            city: guestCity,
            streetAddress: guestStreetAddress,
            province: guestProvince,
            landmark: guestLandmark,
            phoneNumber: guestPhone,
          },
          deliveryOption: selectedOption || {
            id: Number(selectedDeliveryOptionId),
            name: "Standard Delivery",
            cost: deliveryCost,
          },
          payment: {
            method: paymentMethod,
            status: "PENDING",
            amount: grandTotal,
          },
          items: items.map((it) => ({
            id: Number(it.id),
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            subtotal: it.itemTotal,
            book: it.book,
          })),
          user: {
            name: guestName,
            email: guestEmail,
            phoneNumber: guestPhone,
          },
          ...orderData,
        };

        toast.success(
          res?.data?.message ||
            "Order placed successfully as guest! Thank you for shopping with Nepsole."
        );

        onClose();
        if (successOrder) {
          setCreatedOrder(successOrder);
          setIsSuccessOpen(true);
        }

        if (onOrderSuccess) {
          onOrderSuccess();
        }
      } catch (error: any) {
        console.error("Failed to place guest order:", error);
        toast.error(
          error?.response?.data?.message ||
            "Failed to place order. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // ─── Authenticated User Order Flow ───────────────────────────────────────────
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

      // Clear local cart
      if (typeof window !== "undefined") {
        localStorage.removeItem("nepsole_cart");
        localStorage.removeItem("nepsole_cart_count");
        window.dispatchEvent(new Event(CART_CHANGE_EVENT));
      }

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
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {isGuest ? "Guest Checkout" : "Checkout Order"}
                    </DialogTitle>
                    {isGuest && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/25">
                        Guest Mode
                      </span>
                    )}
                  </div>
                  <DialogDescription className="text-xs text-blue-100/85 mt-0.5">
                    {isGuest
                      ? "Complete your purchase directly without creating an account"
                      : "Select delivery address, shipping method & confirm your purchase"}
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
                    Loading checkout details & options...
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                  {/* Left Column: Form Steps (col-span-7) */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* GUEST CHECKOUT FORM */}
                    {isGuest ? (
                      <div className="space-y-4">
                        {/* 1. Guest Personal Information */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1749A0] flex items-center justify-center">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                              1. Guest Information
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Full Name <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Ram Bahadur Thapa"
                                  value={guestName}
                                  onChange={(e) => setGuestName(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] bg-white transition"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Email Address <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="email"
                                  required
                                  placeholder="e.g. ram@gmail.com"
                                  value={guestEmail}
                                  onChange={(e) => setGuestEmail(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] bg-white transition"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Phone Number <span className="text-rose-500">*</span>
                              </label>
                              <div className="relative">
                                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                  type="tel"
                                  required
                                  placeholder="e.g. 9841000000"
                                  value={guestPhone}
                                  onChange={(e) => setGuestPhone(e.target.value)}
                                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] bg-white transition"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 2. Guest Delivery Address */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3.5">
                          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                              <MapPin className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                              2. Delivery Address
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Province <span className="text-rose-500">*</span>
                              </label>
                              <select
                                value={guestProvince}
                                onChange={handleProvinceChange}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] bg-white transition cursor-pointer"
                              >
                                {provinces.map((prov) => (
                                  <option key={prov.id} value={prov.name}>
                                    {prov.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                District <span className="text-rose-500">*</span>
                              </label>
                              <select
                                value={guestDistrict}
                                onChange={(e) => setGuestDistrict(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] bg-white transition cursor-pointer"
                              >
                                {availableDistricts.map((dist) => (
                                  <option key={dist.id} value={dist.name}>
                                    {dist.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                City / Area <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Thamel"
                                value={guestCity}
                                onChange={(e) => setGuestCity(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] bg-white transition"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Landmark <span className="text-slate-400 font-normal">(Optional)</span>
                              </label>
                              <input
                                type="text"
                                placeholder="e.g. Near Thamel Chowk"
                                value={guestLandmark}
                                onChange={(e) => setGuestLandmark(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] bg-white transition"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                Street Address / House No. <span className="text-rose-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                placeholder="e.g. Jyatha Marg, House 12"
                                value={guestStreetAddress}
                                onChange={(e) => setGuestStreetAddress(e.target.value)}
                                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] bg-white transition"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* AUTHENTICATED USER ADDRESS SELECTION */
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
                    )}

                    {/* Delivery Option Selection */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1749A0] flex items-center justify-center">
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          {isGuest ? "3. Delivery Option" : "2. Delivery Option"}
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

                    {/* Payment Method Section */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-2xs space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                          <CreditCard className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          {isGuest ? "4. Payment Method" : "3. Payment Method"}
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
                  !selectedDeliveryOptionId ||
                  (isGuest
                    ? !guestName || !guestEmail || !guestPhone || !guestCity || !guestStreetAddress
                    : !selectedAddressId)
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

      {/* Add Address Dialog Modal for Authenticated Users */}
      {!isGuest && (
        <AddressDialog
          open={isAddAddressOpen}
          onOpenChange={setIsAddAddressOpen}
          onSuccess={fetchCheckoutData}
        />
      )}

      {/* Dedicated Order Success Dialog Modal */}
      <OrderSuccessDialog
        open={isSuccessOpen}
        onOpenChange={setIsSuccessOpen}
        order={createdOrder}
      />
    </>
  );
}
