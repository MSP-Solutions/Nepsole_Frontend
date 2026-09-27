"use client";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import { getUserCookie } from "@/utils/cookies";
import { ArrowRight, BookOpen, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export interface UserSummaryCards {
  totalOrders?: number | string;
  purchasedBooks?: number | string;
  totalWishlist?: number | string;
  wishlistCount?: number | string;
  totalBooksRead?: number | string;
  [key: string]: any;
}

export interface UserDashboardSummary {
  summaryCards?: UserSummaryCards;
  totalOrders?: number | string;
  purchasedBooks?: number | string;
  totalWishlist?: number | string;
  totalSpent?: number | string;
  activeOrders?: number | string;
  pendingOrders?: number | string;
  wishlistCount?: number | string;
  totalBooksRead?: number | string;
  readingGoal?: number | string;
  membership?: string;
  user?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    membership?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface UserStatsOverviewProps {
  onRefresh?: () => void;
}

export default function UserStatsOverview({
  onRefresh,
}: UserStatsOverviewProps) {
  const [stats, setStats] = useState<UserDashboardSummary | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboardStats = async (isManual = false) => {
    if (!isManual) setIsLoading(true);

    try {
      // Get stored user cookie info as baseline
      const cookieUser = await getUserCookie();
      if (cookieUser) {
        setUserInfo(cookieUser);
      }

      let res;
      try {
        res = await axiosAuthInstance.get("/v1/dashboard/user");
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }

      const data = res?.data?.data || res?.data || {};
      setStats(data);

      if (data.user) {
        setUserInfo((prev: any) => ({ ...prev, ...data.user }));
      }
    } catch (error) {
      console.error("Failed to load user dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Metrics resolution from summaryCards or root
  const summary: UserSummaryCards = stats?.summaryCards || stats || {};

  const totalOrders = summary?.totalOrders ?? stats?.totalOrders ?? 0;
  const purchasedBooks =
    summary?.purchasedBooks ??
    stats?.purchasedBooks ??
    summary?.totalBooksRead ??
    0;
  const wishlistItems =
    summary?.totalWishlist ??
    summary?.wishlistCount ??
    stats?.totalWishlist ??
    stats?.wishlistCount ??
    0;

  const statCards = [
    {
      title: "Total Orders",
      value: String(totalOrders),
      subtext: "Lifetime orders placed",
      icon: ShoppingBag,
      color: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      iconBg: "bg-indigo-600 text-white shadow-indigo-500/25",
      accent: "text-indigo-600",
      badge: "Orders",
      badgeStyle: "bg-indigo-50 text-indigo-700 border-indigo-200/70",
      link: "/user/orders",
    },
    {
      title: "Purchased Books",
      value: `${purchasedBooks} ${Number(purchasedBooks) === 1 ? "Book" : "Books"}`,
      subtext: "Books delivered to your library",
      icon: BookOpen,
      color: "from-blue-500/10 via-blue-500/5 to-transparent",
      iconBg: "bg-blue-600 text-white shadow-blue-500/25",
      accent: "text-blue-600",
      badge: "Library",
      badgeStyle: "bg-blue-50 text-blue-700 border-blue-200/70",
      link: "/user/orders",
    },
    {
      title: "Saved Wishlist",
      value: `${wishlistItems} ${Number(wishlistItems) === 1 ? "Item" : "Items"}`,
      subtext: "Saved to your reading list",
      icon: Heart,
      color: "from-rose-500/10 via-rose-500/5 to-transparent",
      iconBg: "bg-rose-600 text-white shadow-rose-500/25",
      accent: "text-rose-600",
      badge: "Wishlist",
      badgeStyle: "bg-rose-50 text-rose-700 border-rose-200/70",
      link: "/user/wishlist",
    },
  ];

  return (
    <div className="space-y-5">
      {/* 3 Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;

          if (isLoading) {
            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs animate-pulse space-y-3 ${
                  idx === 2 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-slate-100" />
                  <div className="w-16 h-5 rounded-full bg-slate-100" />
                </div>
                <div className="space-y-2 pt-2">
                  <div className="w-24 h-8 rounded-lg bg-slate-100" />
                  <div className="w-28 h-4 rounded-md bg-slate-100" />
                  <div className="w-40 h-3.5 rounded-md bg-slate-100/70" />
                </div>
              </div>
            );
          }

          return (
            <Link
              key={idx}
              href={stat.link}
              className={`relative bg-gradient-to-br ${stat.color} bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group overflow-hidden ${
                idx === 2 ? "sm:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-11 h-11 rounded-xl ${stat.iconBg} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-wide ${stat.badgeStyle}`}
                  >
                    {stat.badge}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-slate-100/80 flex items-center justify-center text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-200/70 transition-colors">
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {stat.value}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
                  {stat.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {stat.subtext}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
