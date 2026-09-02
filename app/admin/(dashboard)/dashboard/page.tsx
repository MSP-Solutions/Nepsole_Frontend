"use client";

import LowStockAlerts from "@/components/admin/dashboard/LowStockAlerts";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrdersTable";
import RecentUsersList from "@/components/admin/dashboard/RecentUsersList";
import RevenueChart from "@/components/admin/dashboard/RevenueChart";
import StatsOverview from "@/components/admin/dashboard/StatsOverview";
import TopSellingBooks from "@/components/admin/dashboard/TopSellingBooks";
import { LayoutDashboard, Plus, RefreshCw, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function AdminDashboardPage() {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefreshAll = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div
      key={refreshKey}
      className="-m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 bg-[#f4f6fa] min-h-screen space-y-4 sm:space-y-6 animate-in fade-in-50 duration-300"
    >
      {/* Page Header with Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-1 sm:pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 sm:w-9 h-8 sm:h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <LayoutDashboard className="w-4 sm:w-5 h-4 sm:h-5" />
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              Executive Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-500 max-w-xl">
            Real-time catalog performance, revenue tracking, inventory alerts,
            and recent customer activity.
          </p>
        </div>
      </div>

      {/* 1. Stat Cards Overview */}
      <StatsOverview />

      {/* 2. Middle Row: Monthly Revenue Velocity + Inventory Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <RevenueChart />
        </div>
        <div className="lg:col-span-4">
          <LowStockAlerts />
        </div>
      </div>

      {/* 3. Third Row: Top Selling Books + Recent User Signups */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <TopSellingBooks />
        </div>
        <div className="lg:col-span-5">
          <RecentUsersList />
        </div>
      </div>

      {/* 4. Bottom Row: Full Recent Orders Data Table */}
      <RecentOrdersTable />
    </div>
  );
}
