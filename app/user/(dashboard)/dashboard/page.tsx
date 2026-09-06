"use client";

import React, { useState } from "react";
import UserStatsOverview from "@/components/user/dashboard/UserStatsOverview";
import UserRecentOrders from "@/components/user/dashboard/UserRecentOrders";
import UserRecommendedBooks from "@/components/user/dashboard/UserRecommendedBooks";

export default function UserDashboardPage() {
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleRefreshAll = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div
      key={refreshKey}
      className="-m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 bg-[#f4f6fa] min-h-screen space-y-6 animate-in fade-in-50 duration-300"
    >
      {/* 1. Header & Quick Stat Cards from /v1/dashboard/user */}
      <UserStatsOverview onRefresh={handleRefreshAll} />

      {/* 2. Middle Row: Recent Orders (8 cols) + Recent Wishlist (4 cols) */}
      <div>
        <div className="lg:col-span-8">
          <UserRecentOrders />
        </div>
      </div>

      {/* 3. Bottom Row: Recommended Books from /v1/dashboard/user/recommended-books */}
      <UserRecommendedBooks />
    </div>
  );
}
