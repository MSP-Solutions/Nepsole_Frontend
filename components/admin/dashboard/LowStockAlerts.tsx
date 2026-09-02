"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  PackageX,
  ArrowRight,
  Plus,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { axiosAuthInstance } from "@/utils/axiosInstances";

export interface LowStockBook {
  id: number | string;
  title: string;
  stock: number | string;
  price?: number | string;
  publisher?: any;
  images?: any[];
  bookImages?: any[];
  [key: string]: any;
}

export default function LowStockAlerts() {
  const [books, setBooks] = useState<LowStockBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLowStock = async () => {
      setLoading(true);
      try {
        const res = await axiosAuthInstance.get(
          "/v1/dashboard/admin/low-stock-books"
        );
        const data = res.data?.data || res.data || [];
        const list = Array.isArray(data)
          ? data
          : data?.books || data?.items || [];
        setBooks(list);
      } catch (err) {
        console.error("Failed to load low stock books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLowStock();
  }, []);

  const outOfStockCount = books.filter((b) => Number(b.stock) <= 0).length;
  const lowStockCount = books.filter(
    (b) => Number(b.stock) > 0 && Number(b.stock) <= 10
  ).length;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Inventory Alerts
              </h2>
              <p className="text-xs text-slate-400">
                Out of stock & low inventory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {outOfStockCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 text-[10px] font-bold">
                {outOfStockCount} critical
              </span>
            )}
            {lowStockCount > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
                {lowStockCount} low
              </span>
            )}
          </div>
        </div>

        {/* List of items */}
        <div className="mt-4 space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 animate-pulse flex items-center justify-between"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="w-3/4 h-3.5 bg-slate-200/70 rounded" />
                  <div className="w-1/3 h-3 bg-slate-200/70 rounded" />
                </div>
                <div className="w-14 h-5 bg-slate-200/70 rounded-full" />
              </div>
            ))
          ) : books.length > 0 ? (
            books.slice(0, 6).map((book, idx) => {
              const stockNum = Number(book.stock) || 0;
              const isZero = stockNum <= 0;

              return (
                <div
                  key={book.id || idx}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isZero
                      ? "bg-rose-50/60 border-rose-200/80 hover:bg-rose-50"
                      : "bg-amber-50/50 border-amber-200/80 hover:bg-amber-50/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg shrink-0 ${
                        isZero
                          ? "bg-rose-100 text-rose-600"
                          : "bg-amber-100 text-amber-600"
                      }`}
                    >
                      {isZero ? (
                        <PackageX className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/books`}
                        className="text-xs font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1 block"
                        title={book.title}
                      >
                        {book.title}
                      </Link>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {isZero
                          ? "0 units left · Immediately restock"
                          : `Only ${stockNum} unit${
                              stockNum === 1 ? "" : "s"
                            } left in warehouse`}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xs ${
                      isZero
                        ? "bg-rose-600 text-white"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {isZero ? "0 left" : `${stockNum} left`}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto mb-1.5" />
              <p className="font-semibold text-slate-700">Inventory Healthy</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No low stock or out-of-stock items detected
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-3 border-t border-slate-100 mt-3">
        <Link
          href="/admin/books"
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 rounded-xl transition-colors border border-rose-200/70"
        >
          <span>Review All Stock in Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
