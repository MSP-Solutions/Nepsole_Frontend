"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, ArrowRight, BookOpen, Crown } from "lucide-react";
import { axiosAuthInstance } from "@/utils/axiosInstances";

export interface TopSellingBook {
  id: number | string;
  title: string;
  price?: number | string;
  discountPercent?: number | string;
  soldCount?: number | string;
  totalSold?: number | string;
  quantitySold?: number | string;
  stock?: number | string;
  images?: any[];
  bookImages?: any[];
  authors?: any[];
  authorBooks?: any[];
  [key: string]: any;
}

export default function TopSellingBooks() {
  const [books, setBooks] = useState<TopSellingBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTopSelling = async () => {
      setLoading(true);
      try {
        const res = await axiosAuthInstance.get(
          "/v1/dashboard/admin/top-selling-books"
        );
        const data = res.data?.data || res.data || [];
        const list = Array.isArray(data)
          ? data
          : data?.books || data?.items || [];
        setBooks(list);
      } catch (err) {
        console.error("Failed to load top selling books:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSelling();
  }, []);

  const getCoverImage = (book: TopSellingBook): string | null => {
    const imgs = book.images || book.bookImages || [];
    if (imgs.length === 0) return null;
    const cover = imgs.find((img: any) =>
      typeof img === "object"
        ? img.imageType === "COVER" || img.type === "COVER"
        : false
    );
    if (cover && typeof cover === "object") return cover.url || cover.imageUrl || null;
    const first = imgs[0];
    if (typeof first === "string") return first;
    if (typeof first === "object") return first.url || first.imageUrl || null;
    return null;
  };

  const getAuthorName = (book: TopSellingBook): string => {
    const authors = book.authors || book.authorBooks || [];
    if (authors.length === 0) return "Unknown Author";
    const a = authors[0];
    return a?.name || a?.englishName || a?.author?.name || a?.author?.englishName || "Author";
  };

  const rankBadges = [
    "bg-amber-500 text-white shadow-amber-500/20",
    "bg-slate-400 text-white shadow-slate-400/20",
    "bg-amber-700 text-white shadow-amber-700/20",
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Top Selling Titles
              </h2>
              <p className="text-xs text-slate-400">
                Highest volume books in store
              </p>
            </div>
          </div>

          <Link
            href="/admin/books"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group"
          >
            <span>View Catalog</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* List Content */}
        <div className="mt-4 divide-y divide-slate-100">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="py-3 flex items-center gap-3 animate-pulse">
                <div className="w-10 h-14 bg-slate-100 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="w-3/4 h-3.5 bg-slate-100 rounded" />
                  <div className="w-1/2 h-3 bg-slate-100 rounded" />
                </div>
                <div className="w-12 h-6 bg-slate-100 rounded-full" />
              </div>
            ))
          ) : books.length > 0 ? (
            books.slice(0, 5).map((book, idx) => {
              const coverUrl = getCoverImage(book);
              const author = getAuthorName(book);
              const sold =
                book.soldCount ?? book.totalSold ?? book.quantitySold ?? 0;
              const price = Number(book.price) || 0;

              return (
                <div
                  key={book.id || idx}
                  className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/70 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        idx < 3 ? rankBadges[idx] : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {idx === 0 ? <Crown className="w-3 h-3" /> : idx + 1}
                    </div>

                    {/* Book Thumbnail */}
                    <div className="w-10 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200/60 shadow-2xs flex items-center justify-center">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <BookOpen className="w-4 h-4 text-slate-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0">
                      <Link
                        href={`/admin/books`}
                        className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 block"
                        title={book.title}
                      >
                        {book.title}
                      </Link>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {author}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-900 mt-0.5">
                        Rs. {price.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Sold Metric Pill */}
                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 text-xs font-bold shadow-2xs">
                      <span>{Number(sold).toLocaleString()}</span>
                      <span className="text-[10px] font-medium text-amber-600/80">
                        sold
                      </span>
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              <BookOpen className="w-8 h-8 text-slate-200 mx-auto mb-1" />
              <p>No sales data recorded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-slate-100 mt-2">
        <Link
          href="/admin/books"
          className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl transition-colors border border-indigo-100/60"
        >
          <span>Manage Books Inventory</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
