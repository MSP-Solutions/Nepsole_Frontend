"use client";

import Link from "next/link";
import {
  TrendingUp,
  PackageX,
  AlertTriangle,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

const stats = [
  {
    title: "Catalog Revenue",
    value: "Rs. 1810K+",
    trend: "+18.4%",
    dotColor: "bg-indigo-500",
  },
  {
    title: "Total Orders",
    value: "8,821",
    trend: "+12.1%",
    dotColor: "bg-sky-400",
  },
  {
    title: "Books Listed",
    value: "12",
    trend: "+2 new",
    dotColor: "bg-emerald-500",
  },
  {
    title: "Active Authors",
    value: "13",
    trend: "8 publishers",
    dotColor: "bg-amber-400",
  },
];

const revenueData = [
  { month: "Mar", value: "182k", height: "h-24", isHighlighted: false },
  { month: "Apr", value: "241k", height: "h-36", isHighlighted: false },
  { month: "May", value: "198k", height: "h-28", isHighlighted: false },
  { month: "Jun", value: "289k", height: "h-44", isHighlighted: false },
  { month: "Jul", value: "312k", height: "h-48", isHighlighted: false },
  { month: "Aug", value: "267k", height: "h-40", isHighlighted: true },
];

const recentOrders = [
  {
    id: "ORD-8821",
    customer: "Priya Sharma",
    items: 3,
    total: "Rs. 2,265",
    date: "2026-08-12",
    status: "Delivered",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: "ORD-8820",
    customer: "Bikash Thapa",
    items: 1,
    total: "Rs. 855",
    date: "2026-08-12",
    status: "Shipped",
    statusStyle: "bg-blue-50 text-blue-600 border border-blue-100",
  },
  {
    id: "ORD-8819",
    customer: "Anita Gurung",
    items: 2,
    total: "Rs. 1,140",
    date: "2026-08-11",
    status: "Processing",
    statusStyle: "bg-amber-50 text-amber-600 border border-amber-100",
  },
  {
    id: "ORD-8818",
    customer: "Rohan Karki",
    items: 4,
    total: "Rs. 3,210",
    date: "2026-08-11",
    status: "Delivered",
    statusStyle: "bg-emerald-50 text-emerald-600 border border-emerald-100",
  },
  {
    id: "ORD-8817",
    customer: "Sita Paudel",
    items: 1,
    total: "Rs. 315",
    date: "2026-08-10",
    status: "Cancelled",
    statusStyle: "bg-rose-50 text-rose-600 border border-rose-100",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="-m-6 lg:-m-8 p-6 lg:p-8 bg-[#f4f6fa] min-h-screen space-y-6">
      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className={`w-2.5 h-2.5 rounded-full ${stat.dotColor}`} />
              <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                <TrendingUp className="h-3 w-3" />
                <span>{stat.trend}</span>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {stat.value}
              </h3>
              <p className="text-xs font-medium text-gray-400 mt-1">
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Middle Grid: Monthly Revenue Chart + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm flex flex-col justify-between">
          <h2 className="text-sm font-bold text-gray-900 mb-6">
            Monthly Revenue
          </h2>

          <div className="flex items-end justify-between gap-3 pt-8 pb-2 px-2 h-64 border-b border-gray-100">
            {revenueData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[11px] font-semibold text-gray-400 group-hover:text-gray-700 transition-colors">
                  {data.value}
                </span>

                <div className="w-full flex items-end justify-center h-48">
                  <div
                    className={`w-full max-w-[64px] ${data.height} transition-all duration-300 ${
                      data.isHighlighted
                        ? "bg-blue-600 shadow-md shadow-blue-500/20"
                        : "bg-indigo-100/70 hover:bg-indigo-200/80"
                    } rounded-xl`}
                  />
                </div>

                <span className="text-xs font-medium text-gray-400 mt-2">
                  {data.month}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 mb-4">Alerts</h2>

            <div className="space-y-3">
              {/* Out of Stock Alert */}
              <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600 shrink-0">
                  <PackageX className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-gray-900">
                    Out of Stock (1)
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    The Psychology of Money
                  </p>
                </div>
              </div>

              {/* Low Stock Alert */}
              <div className="bg-amber-50/70 border border-amber-100/80 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600 shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-gray-900">
                    Low Stock (2 books)
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Below 10 units remaining
                  </p>
                </div>
              </div>

              {/* Pending Orders Alert */}
              <div className="bg-indigo-50/70 border border-indigo-100/80 rounded-2xl p-3.5 flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600 shrink-0">
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-gray-900">
                    12 Pending Orders
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Need processing today
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/admin/orders"
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-indigo-200/80 text-xs font-semibold text-indigo-600 hover:bg-indigo-50/50 transition-colors mt-2"
          >
            <span>View All Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Bottom Table: Recent Orders */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] uppercase font-semibold text-gray-400 tracking-wider">
                <th className="pb-3 pr-4 font-semibold">Order ID</th>
                <th className="pb-3 px-4 font-semibold">Customer</th>
                <th className="pb-3 px-4 font-semibold">Items</th>
                <th className="pb-3 px-4 font-semibold">Total</th>
                <th className="pb-3 px-4 font-semibold">Date</th>
                <th className="pb-3 pl-4 font-semibold text-right sm:text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 pr-4 font-semibold text-indigo-600">
                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                      {order.id}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-gray-800">
                    {order.customer}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500">{order.items}</td>
                  <td className="py-3.5 px-4 font-bold text-gray-900">
                    {order.total}
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">{order.date}</td>
                  <td className="py-3.5 pl-4 text-right sm:text-left">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${order.statusStyle}`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}