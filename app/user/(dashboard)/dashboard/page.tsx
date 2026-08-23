"use client";

import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileText,
  Heart,
  MapPin,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock User Data & Stats
const userProfile = {
  name: "Aarav Sharma",
  email: "aarav.sharma@nepsole.com",
  phone: "+977 9841-234567",
  membership: "Nepsole Prime Reader",
  joinedDate: "Jan 2026",
  address: "Maharajgunj - 4, Kathmandu, Nepal",
  paymentMethod: "Cash on Delivery (COD)",
};

const userStats = [
  {
    title: "Total Orders",
    value: "14",
    subtext: "Rs. 14,850 total spent",
    icon: ShoppingBag,
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    badgeBg: "bg-indigo-100 text-indigo-700",
  },
  {
    title: "Active Deliveries",
    value: "1 Order",
    subtext: "In Transit • Arriving Tomorrow",
    icon: Truck,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    badgeBg: "bg-blue-100 text-blue-700",
  },
  {
    title: "Saved Wishlist",
    value: "8 Books",
    subtext: "2 on special discount",
    icon: Heart,
    color: "bg-rose-50 text-rose-600 border-rose-100",
    badgeBg: "bg-rose-100 text-rose-700",
  },
  {
    title: "Reading Goal 2026",
    value: "9 / 12 Books",
    subtext: "75% of annual goal met",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    badgeBg: "bg-emerald-100 text-emerald-700",
  },
];

// Active Tracking Order Mock
const activeOrder = {
  id: "ORD-9942",
  date: "Aug 22, 2026",
  estimatedDelivery: "Tomorrow, Aug 24 by 5:00 PM",
  courier: "Pathao Express (Tracking: #PE-88421)",
  items: [
    {
      title: "Palpasa Cafe",
      author: "Narayan Wagle",
      price: "Rs. 550",
      qty: 1,
    },
    { title: "Seto Dharti", author: "Amar Neupane", price: "Rs. 620", qty: 1 },
  ],
  total: "Rs. 1,170",
  statusStep: 3, // 1: Placed, 2: Packed, 3: In Transit, 4: Delivered
  statusText: "In Transit across Kathmandu",
};

// Recent User Orders Mock
const recentOrders = [
  {
    id: "ORD-9942",
    date: "2026-08-22",
    itemsCount: 2,
    total: "Rs. 1,170",
    payment: "Cash on Delivery",
    status: "In Transit",
    statusStyle: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "ORD-9881",
    date: "2026-08-10",
    itemsCount: 3,
    total: "Rs. 2,150",
    payment: "Cash on Delivery",
    status: "Delivered",
    statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "ORD-9750",
    date: "2026-07-28",
    itemsCount: 1,
    total: "Rs. 850",
    payment: "Cash on Delivery",
    status: "Delivered",
    statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "ORD-9610",
    date: "2026-07-14",
    itemsCount: 4,
    total: "Rs. 3,400",
    payment: "Cash on Delivery",
    status: "Delivered",
    statusStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
];

// Recommended Books Mock
const recommendedBooks = [
  {
    id: "B-101",
    title: "Karnali Blues",
    author: "Buddhisagar",
    category: "Nepali Fiction",
    price: "Rs. 650",
    originalPrice: "Rs. 750",
    rating: 4.9,
    reviews: 128,
    badge: "Bestseller",
  },
  {
    id: "B-102",
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Help",
    price: "Rs. 850",
    originalPrice: "Rs. 990",
    rating: 4.8,
    reviews: 340,
    badge: "Top Rated",
  },
  {
    id: "B-103",
    title: "Summer Love",
    author: "Subin Bhattarai",
    category: "Romance",
    price: "Rs. 520",
    originalPrice: "Rs. 600",
    rating: 4.7,
    reviews: 95,
    badge: "Popular",
  },
];

export default function UserDashboardPage() {
  const [copiedToast, setCopiedToast] = useState<string | null>(null);

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedToast(`Tracking code ${code} copied!`);
    setTimeout(() => setCopiedToast(null), 3000);
  };

  return (
    <div className="-m-6 lg:-m-8 p-6 lg:p-8 bg-[#f4f6fa] min-h-screen space-y-6">
      {/* Copied Toast Alert */}
      {copiedToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{copiedToast}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{userProfile.membership}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {userProfile.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100/80 leading-relaxed">
              Track your active deliveries, manage past orders, explore your
              wishlist, and achieve your 2026 reading challenge goals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/user/orders"
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 transition shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span>View My Orders</span>
            </Link>
            <Link
              href="/user/settings"
              className="px-4 py-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 text-xs font-semibold transition backdrop-blur-md border border-white/10 flex items-center gap-2 cursor-pointer"
            >
              <span>Account Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top 4 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {userStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stat.badgeBg}`}
                >
                  Active
                </span>
              </div>

              <div className="mt-4">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {stat.value}
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-1">
                  {stat.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {stat.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Order Live Tracking Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Truck className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Active Order #{activeOrder.id}
                </h2>
                <span className="bg-blue-50 text-blue-700 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-blue-200">
                  {activeOrder.statusText}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Placed on {activeOrder.date} • Courier: {activeOrder.courier}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopyTracking("#PE-88421")}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Copy Tracking Code</span>
            </button>
            <Link
              href="/user/orders"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer flex items-center gap-1"
            >
              <span>Order Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Visual Delivery Steps Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
          {/* Step 1 */}
          <div className="flex md:flex-col items-center md:items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                1. Order Placed
              </p>
              <p className="text-[11px] text-slate-500">Aug 22, 10:30 AM</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex md:flex-col items-center md:items-start gap-3 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/60">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                2. Packed & Ready
              </p>
              <p className="text-[11px] text-slate-500">Aug 22, 02:15 PM</p>
            </div>
          </div>

          {/* Step 3 (Active) */}
          <div className="flex md:flex-col items-center md:items-start gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 ring-2 ring-blue-500/20">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              <Truck className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <p className="text-xs font-bold text-blue-900">
                3. Out for Delivery
              </p>
              <p className="text-[11px] text-blue-600 font-medium">
                Aug 23 (In Transit)
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex md:flex-col items-center md:items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60 opacity-60">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs shrink-0">
              4
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700">4. Delivered</p>
              <p className="text-[11px] text-slate-400">Est. Aug 24</p>
            </div>
          </div>
        </div>

        {/* Order Items Preview */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Palpasa Cafe + 1 other book
              </p>
              <p className="text-[11px] text-slate-500">
                Delivering to: {userProfile.address}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total Amount</p>
            <p className="text-sm font-extrabold text-slate-900">
              {activeOrder.total}
            </p>
          </div>
        </div>
      </div>

      {/* Middle Section: Recent Orders + Reading Challenge Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table (Col 8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Recent Purchase History
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Overview of your recent book orders & invoice status
              </p>
            </div>
            <Link
              href="/user/orders"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-indigo-600 font-mono">
                      {order.id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {order.date}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {order.itemsCount}{" "}
                      {order.itemsCount === 1 ? "Book" : "Books"}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {order.total}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {order.payment}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${order.statusStyle}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleCopyTracking(order.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 font-semibold text-[11px] transition cursor-pointer"
                      >
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Reading Goals & Account Summary Widget (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Reading Challenge Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Award className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
                75% Completed
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold">2026 Reading Challenge</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target: 12 books • Completed: 9 books
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700">
                <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full w-[75%] transition-all duration-500" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>9 Read</span>
                <span>3 Left to Goal</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Current Reading Streak:</span>
              <span className="font-bold text-amber-400">🔥 5 Days</span>
            </div>
          </div>

          {/* Shipping Address Quick Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Primary Delivery Address</span>
              </div>
              <Link
                href="/user/settings"
                className="text-[11px] font-bold text-indigo-600 hover:underline"
              >
                Edit
              </Link>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
              {userProfile.address}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>
                Default Payment: <strong>{userProfile.paymentMethod}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Books Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Recommended Books for You</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Handpicked based on your previous reading history and favorite
              Nepalese authors
            </p>
          </div>
          <Link
            href="/books"
            className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>Explore full bookstore catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recommendedBooks.map((book) => (
            <div
              key={book.id}
              className="bg-slate-50 hover:bg-slate-100/80 transition rounded-2xl p-4 border border-slate-100 flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-md group-hover:scale-105 transition transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {book.category}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1 group-hover:text-indigo-600 transition">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      by {book.author}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setCopiedToast(`Added "${book.title}" to Wishlist!`)
                  }
                  className="p-2 rounded-xl bg-white text-slate-400 hover:text-rose-600 shadow-xs hover:bg-rose-50 transition cursor-pointer"
                  title="Add to Wishlist"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div>
                  <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{book.rating}</span>
                    <span className="text-slate-400 font-normal">
                      ({book.reviews})
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-sm font-extrabold text-slate-900">
                      {book.price}
                    </span>
                    <span className="text-xs text-slate-400 line-through">
                      {book.originalPrice}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setCopiedToast(`Added "${book.title}" to cart!`)
                  }
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Order Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
