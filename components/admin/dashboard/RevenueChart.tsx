"use client";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import { BarChart3, ChevronDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export interface MonthlyRevenueItem {
  month: string;
  monthNumber?: number;
  amount: number;
  revenue?: number;
  ordersCount?: number;
  formattedValue?: string;
  isHighlighted?: boolean;
}

interface RevenueChartProps {
  initialYear?: number;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function RevenueChart({ initialYear }: RevenueChartProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(
    initialYear ?? currentYear,
  );
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenueItem[]>([]);
  const [totalYearRevenue, setTotalYearRevenue] = useState<number>(0);
  const [totalYearOrders, setTotalYearOrders] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const availableYears = [
    currentYear + 2,
    currentYear + 1,
    currentYear,
    2025,
    2024,
  ].filter((y, i, arr) => arr.indexOf(y) === i);

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      setIsLoading(true);
      try {
        const res = await axiosAuthInstance.get(
          `/v1/dashboard/admin/monthly-revenue?year=${selectedYear}`,
        );
        const payload = res.data?.data || res.data || {};
        const breakdown =
          payload.monthlyBreakdown || (Array.isArray(payload) ? payload : []);

        // Initialize 12 months array
        const monthsList: MonthlyRevenueItem[] = MONTH_NAMES.map(
          (name, idx) => ({
            month: name,
            monthNumber: idx + 1,
            amount: 0,
            ordersCount: 0,
          }),
        );

        let calculatedTotal = 0;
        let calculatedOrders = 0;

        if (Array.isArray(breakdown)) {
          breakdown.forEach((item: any) => {
            let mIndex = -1;

            if (typeof item.monthNumber === "number") {
              mIndex = item.monthNumber - 1;
            } else if (typeof item.month === "number") {
              mIndex = item.month - 1;
            } else if (typeof item.month === "string") {
              const mStr = item.month.trim().slice(0, 3).toLowerCase();
              mIndex = MONTH_NAMES.findIndex((mn) => mn.toLowerCase() === mStr);
            }

            const rev =
              Number(
                item.revenue ??
                  item.amount ??
                  item.totalRevenue ??
                  item.total ??
                  0,
              ) || 0;

            const orders = Number(item.ordersCount ?? item.orders ?? 0) || 0;

            if (mIndex >= 0 && mIndex < 12) {
              monthsList[mIndex].amount = rev;
              monthsList[mIndex].revenue = rev;
              monthsList[mIndex].ordersCount = orders;
            }
          });
        }

        calculatedTotal = monthsList.reduce(
          (acc, curr) => acc + curr.amount,
          0,
        );
        calculatedOrders = monthsList.reduce(
          (acc, curr) => acc + (curr.ordersCount || 0),
          0,
        );

        // Find peak month
        const maxVal = Math.max(...monthsList.map((m) => m.amount), 0);
        if (maxVal > 0) {
          monthsList.forEach((m) => {
            if (m.amount === maxVal) {
              m.isHighlighted = true;
            }
          });
        }

        setMonthlyData(monthsList);
        setTotalYearRevenue(
          payload.totalRevenue !== undefined
            ? Number(payload.totalRevenue)
            : calculatedTotal,
        );
        setTotalYearOrders(
          payload.totalOrders !== undefined
            ? Number(payload.totalOrders)
            : calculatedOrders,
        );
      } catch (err) {
        console.error("Failed to load monthly revenue data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyRevenue();
  }, [selectedYear]);

  const maxRevenue = Math.max(...monthlyData.map((d) => d.amount), 1);

  const formatCurrency = (val: number): string => {
    if (val >= 1_000_000) return `Rs. ${(val / 1_000_000).toFixed(2)}M`;
    if (val >= 1_000) return `Rs. ${(val / 1_000).toFixed(1)}k`;
    return `Rs. ${val.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Chart Header & Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Monthly Revenue Performance
              </h2>
              <p className="text-xs text-slate-400">
                Gross sales distribution across 12 months
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Total Year Pill */}
          <div className="text-right hidden sm:block">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              {selectedYear} Summary
            </span>
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="text-xs sm:text-sm font-black text-indigo-600">
                {formatCurrency(totalYearRevenue)}
              </span>
              {totalYearOrders > 0 && (
                <span className="text-[11px] font-semibold text-slate-400">
                  · {totalYearOrders} orders
                </span>
              )}
            </div>
          </div>

          {/* Year Picker Dropdown */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl pl-3 pr-8 py-1.5 text-xs font-bold text-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Bar Chart Canvas with Responsive Horizontal Scroll Wrapper */}
      <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="min-w-[480px] sm:min-w-0 relative pt-8 pb-2 px-1">
          {isLoading ? (
            <div className="flex items-end justify-between gap-2 sm:gap-3 h-56 border-b border-slate-100">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2 animate-pulse"
                >
                  <div
                    className="w-full max-w-[36px] bg-slate-100 rounded-xl"
                    style={{ height: `${Math.random() * 100 + 40}px` }}
                  />
                  <div className="w-5 h-3 bg-slate-100 rounded mt-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-end justify-between gap-1.5 sm:gap-3 h-56 border-b border-slate-100">
              {monthlyData.map((data, idx) => {
                const heightPercent =
                  maxRevenue > 0
                    ? Math.min(
                        Math.max((data.amount / maxRevenue) * 100, 6),
                        100,
                      )
                    : 6;

                const isHovered = activeBar === idx;
                const isPeak = data.isHighlighted && data.amount > 0;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveBar(idx)}
                    onMouseLeave={() => setActiveBar(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative"
                  >
                    {/* Dynamic Value Tooltip */}
                    <div
                      className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-lg text-[10px] font-extrabold whitespace-nowrap transition-all duration-200 pointer-events-none z-10 flex flex-col items-center shadow-lg ${
                        isHovered
                          ? "bg-slate-900 text-white opacity-100 -translate-y-1 scale-105"
                          : isPeak
                            ? "bg-indigo-50 border border-indigo-200 text-indigo-700 opacity-100"
                            : "bg-slate-900 text-white opacity-0 group-hover:opacity-100"
                      }`}
                    >
                      <span>
                        {data.amount > 0
                          ? formatCurrency(data.amount)
                          : "Rs. 0"}
                      </span>
                      {data.ordersCount !== undefined &&
                        data.ordersCount > 0 && (
                          <span className="text-[9px] font-medium text-slate-300">
                            {data.ordersCount}{" "}
                            {data.ordersCount === 1 ? "order" : "orders"}
                          </span>
                        )}
                    </div>

                    {/* Vertical Bar */}
                    <div className="w-full flex items-end justify-center h-44">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[34px] rounded-t-lg sm:rounded-t-xl transition-all duration-300 ${
                          isHovered
                            ? "bg-indigo-600 shadow-lg shadow-indigo-500/30 scale-x-105"
                            : isPeak
                              ? "bg-gradient-to-t from-blue-600 to-indigo-600 shadow-md shadow-indigo-500/20"
                              : data.amount > 0
                                ? "bg-indigo-100/90 hover:bg-indigo-200"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                      />
                    </div>

                    {/* Month Text */}
                    <span
                      className={`text-[10px] sm:text-xs font-semibold mt-2 transition-colors ${
                        isHovered
                          ? "text-indigo-600 font-bold"
                          : isPeak
                            ? "text-slate-900 font-bold"
                            : "text-slate-400"
                      }`}
                    >
                      {data.month}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chart Footer Stats */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span className="text-[11px] text-slate-600">Peak Performance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-200" />
            <span className="text-[11px] text-slate-600">Monthly Revenue</span>
          </div>
        </div>

        <div className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span>
            {selectedYear} Annual Revenue:{" "}
            <strong className="text-slate-900">
              {formatCurrency(totalYearRevenue)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
