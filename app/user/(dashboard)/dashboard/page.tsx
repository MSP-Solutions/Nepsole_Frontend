"use client";

import React, { useState } from "react";
import UserStatsOverview from "@/components/user/dashboard/UserStatsOverview";
import UserRecentOrders from "@/components/user/dashboard/UserRecentOrders";
import UserRecentWishlist from "@/components/user/dashboard/UserRecentWishlist";
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8">
          <UserRecentOrders />
        </div>
        <div className="lg:col-span-4">
          <UserRecentWishlist />
        </div>
      </div>

      {/* 3. Bottom Row: Recommended Books from /v1/dashboard/user/recommended-books */}
      <UserRecommendedBooks />
    </div>
  );
}
