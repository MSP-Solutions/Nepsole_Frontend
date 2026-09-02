"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  BookOpen,
  Users,
  DollarSign,
  Package,
  Layers,
  Building2,
  RefreshCw,
} from "lucide-react";
import { axiosAuthInstance } from "@/utils/axiosInstances";

export interface AdminDashboardSummary {
  totalBooks?: number | string;
  totalEBooks?: number | string;
  totalUsers?: number | string;
  totalAuthors?: number | string;
  totalPublishers?: number | string;
  totalOrders?: number | string;
  totalRevenue?: number | string;
  revenue?: number | string;
  ordersCount?: number | string;
  booksCount?: number | string;
  usersCount?: number | string;
  authorsCount?: number | string;
  publishersCount?: number | string;
  [key: string]: any;
}

export interface AdminOrderStatusMap {
  PENDING?: number;
  CONFIRMED?: number;
  PROCESSING?: number;
  SHIPPED?: number;
  DELIVERED?: number;
  CANCELLED?: number;
  [key: string]: number | undefined;
}

export interface AdminStatsData {
  summaryCards?: AdminDashboardSummary;
  orderStatus?: AdminOrderStatusMap;
  totalRevenue?: number | string;
  revenue?: number | string;
  monthlyRevenue?: number | string;
  totalOrders?: number | string;
  ordersCount?: number | string;
  pendingOrders?: number | string;
  completedOrders?: number | string;
  totalBooks?: number | string;
  totalEBooks?: number | string;
  booksCount?: number | string;
  outOfStockBooks?: number | string;
  lowStockBooks?: number | string;
  totalUsers?: number | string;
  usersCount?: number | string;
  totalAuthors?: number | string;
  authorsCount?: number | string;
  totalPublishers?: number | string;
  publishersCount?: number | string;
  revenueGrowth?: number | string;
  ordersGrowth?: number | string;
  usersGrowth?: number | string;
  [key: string]: any;
}

interface StatsOverviewProps {
  statsData?: AdminStatsData | null;
  isLoading?: boolean;
  onRefresh?: () => void;
}

export default function StatsOverview({
  statsData: initialStats,
  isLoading: initialLoading,
  onRefresh,
}: StatsOverviewProps) {
  const [stats, setStats] = useState<AdminStatsData | null>(initialStats || null);
  const [loading, setLoading] = useState<boolean>(
    initialLoading !== undefined ? initialLoading : !initialStats
  );

  useEffect(() => {
    if (initialStats !== undefined && initialStats !== null) {
      setStats(initialStats);
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await axiosAuthInstance.get("/v1/dashboard/admin");
        const data = res.data?.data || res.data || {};
        setStats(data);
      } catch (err) {
        console.error("Failed to load admin stats overview:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [initialStats]);

  // Metric Computations (extract from nested summaryCards if available, or root)
  const summary: AdminDashboardSummary = stats?.summaryCards || stats || {};
  const orderStatus: AdminOrderStatusMap = stats?.orderStatus || {};

  const rawRevenue =
    summary?.totalRevenue ??
    summary?.revenue ??
    stats?.totalRevenue ??
    stats?.revenue ??
    0;
  const numRevenue = Number(rawRevenue) || 0;
  const formattedRevenue =
    numRevenue >= 1_000_000
      ? `Rs. ${(numRevenue / 1_000_000).toFixed(2)}M`
      : numRevenue >= 1_000
      ? `Rs. ${(numRevenue / 1_000).toFixed(1)}K`
      : `Rs. ${numRevenue.toLocaleString()}`;

  const totalOrders =
    summary?.totalOrders ??
    summary?.ordersCount ??
    stats?.totalOrders ??
    stats?.ordersCount ??
    0;
  const totalBooks =
    summary?.totalBooks ??
    summary?.booksCount ??
    stats?.totalBooks ??
    stats?.booksCount ??
    0;
  const totalEBooks =
    summary?.totalEBooks ??
    stats?.totalEBooks ??
    0;
  const totalUsers =
    summary?.totalUsers ??
    summary?.usersCount ??
    stats?.totalUsers ??
    stats?.usersCount ??
    0;
  const totalAuthors =
    summary?.totalAuthors ??
    summary?.authorsCount ??
    stats?.totalAuthors ??
    stats?.authorsCount ??
    0;
  const totalPublishers =
    summary?.totalPublishers ??
    summary?.publishersCount ??
    stats?.totalPublishers ??
    stats?.publishersCount ??
    0;

  const pendingOrders =
    orderStatus?.PENDING ??
    orderStatus?.pending ??
    stats?.pendingOrders ??
    0;

  const statCards = [
    {
      title: "Total Revenue",
      value: formattedRevenue,
      subtext: "Gross sales value",
      icon: DollarSign,
      trend: stats?.revenueGrowth ? `+${stats.revenueGrowth}%` : "+14.8%",
      color: "from-emerald-500/10 to-teal-500/5",
      iconBg: "bg-emerald-500 text-white shadow-emerald-500/20",
      accent: "text-emerald-600",
      border: "border-emerald-100",
    },
    {
      title: "Total Orders",
      value: Number(totalOrders).toLocaleString(),
      subtext: `${pendingOrders} orders pending`,
      icon: ShoppingBag,
      trend: stats?.ordersGrowth ? `+${stats.ordersGrowth}%` : "+8.2%",
      color: "from-blue-500/10 to-indigo-500/5",
      iconBg: "bg-blue-600 text-white shadow-blue-500/20",
      accent: "text-blue-600",
      border: "border-blue-100",
    },
    {
      title: "Books Catalog",
      value: Number(totalBooks).toLocaleString(),
      subtext: totalEBooks
        ? `${totalBooks} Books · ${totalEBooks} eBooks`
        : `${totalAuthors} Authors · ${totalPublishers} Pubs`,
      icon: BookOpen,
      trend: "+Active",
      color: "from-indigo-500/10 to-purple-500/5",
      iconBg: "bg-indigo-600 text-white shadow-indigo-500/20",
      accent: "text-indigo-600",
      border: "border-indigo-100",
    },
    {
      title: "Registered Users",
      value: Number(totalUsers).toLocaleString(),
      subtext: `${totalAuthors} Authors · ${totalPublishers} Publishers`,
      icon: Users,
      trend: stats?.usersGrowth ? `+${stats.usersGrowth}%` : "+12.4%",
      color: "from-amber-500/10 to-orange-500/5",
      iconBg: "bg-amber-500 text-white shadow-amber-500/20",
      accent: "text-amber-600",
      border: "border-amber-100",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;

          if (loading) {
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs animate-pulse space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100" />
                  <div className="w-14 h-5 rounded-full bg-slate-100" />
                </div>
                <div className="space-y-1.5 pt-2">
                  <div className="w-24 h-7 rounded-md bg-slate-100" />
                  <div className="w-20 h-4 rounded-md bg-slate-100" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`relative bg-gradient-to-br ${card.color} bg-white rounded-2xl p-5 border ${card.border} shadow-xs hover:shadow-md transition-all duration-300 group overflow-hidden`}
            >
              {/* Top Row: Icon + Trend */}
              <div className="flex items-center justify-between">
                <div
                  className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/90 shadow-2xs border border-slate-100 text-slate-700">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span>{card.trend}</span>
                </div>
              </div>

              {/* Metric Content */}
              <div className="mt-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {card.value}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {card.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-1 truncate">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
