"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Heart,
  BookOpen,
  ArrowRight,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import toast from "react-hot-toast";

export interface WishlistBookData {
  id: number | string;
  title: string;
  price: number | string;
  discountPercent?: number | string;
  stock?: number;
  coverImage?: string;
  image?: string;
  images?: any[];
  bookImages?: any[];
  authors?: any[];
  authorBooks?: any[];
  genres?: any[];
  [key: string]: any;
}

export interface WishlistItemData {
  id?: number | string;
  bookId?: number | string;
  book?: WishlistBookData;
  [key: string]: any;
}

export default function UserRecentWishlist() {
  const [items, setItems] = useState<WishlistItemData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRecentWishlist = async () => {
    setIsLoading(true);
    try {
      let res;
      try {
        res = await axiosAuthInstance.get("/v1/dashboard/user/recent-wishlist");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          try {
            res = await axiosAuthInstance.get("/v1/wishlist");
          } catch {
            res = await axiosAuthInstance.get("/api/v1/wishlist");
          }
        } else {
          throw err;
        }
      }

      const raw =
        res?.data?.data ||
        res?.data?.wishlist ||
        res?.data?.items ||
        (Array.isArray(res?.data) ? res?.data : []);
      const list: WishlistItemData[] = Array.isArray(raw) ? raw : [];
      setItems(list.slice(0, 4));
    } catch (error) {
      console.error("Failed to load user recent wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentWishlist();
  }, []);

  const extractBook = (item: WishlistItemData): WishlistBookData => {
    if (item.book && typeof item.book === "object") {
      return {
        ...item.book,
        wishlistId: item.id,
      };
    }
    return item as WishlistBookData;
  };

  const getCoverImage = (book: WishlistBookData): string | null => {
    if (typeof book.coverImage === "string" && book.coverImage) return book.coverImage;
    if (typeof book.image === "string" && book.image) return book.image;

    const list = book.images || book.bookImages || [];
    if (list.length === 0) return null;

    const coverObj = list.find((img: any) =>
      typeof img === "object"
        ? img.type === "COVER" || img.imageType === "COVER"
        : false
    );
    if (coverObj && typeof coverObj === "object") {
      return coverObj.url || coverObj.imageUrl || null;
    }

    const first = list[0];
    if (typeof first === "string") return first;
    if (typeof first === "object") return first.url || first.imageUrl || null;
    return null;
  };

  const handleRemove = async (bookId: number | string) => {
    try {
      setItems((prev) =>
        prev.filter((i) => {
          const b = extractBook(i);
          return String(b.id) !== String(bookId);
        })
      );

      const numId = Number(bookId);
      await axiosAuthInstance.post("/v1/wishlist/toggle", {
        bookId: isNaN(numId) ? bookId : numId,
      });
      toast.success("Removed from wishlist");
    } catch (err) {
      console.error("Failed to remove item from wishlist:", err);
      fetchRecentWishlist();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
            <span>Wishlist Picks</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Recently saved books for later reading
          </p>
        </div>

        <Link
          href="/user/wishlist"
          className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 shrink-0"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-slate-50 rounded-xl animate-pulse border border-slate-100"
            />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const book = extractBook(item);
            const coverUrl = getCoverImage(book);
            const priceNum = Number(book.price) || 0;
            const discountNum = Number(book.discountPercent) || 0;
            const discountedPrice =
              discountNum > 0
                ? priceNum - (priceNum * discountNum) / 100
                : priceNum;
            const authorName = (book.authors || book.authorBooks || [])
              .map((a: any) => a.name || a.englishName || a.author?.name || "")
              .filter(Boolean)
              .join(", ");

            return (
              <div
                key={book.id || idx}
                className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-100 transition-colors group"
              >
                <Link
                  href={`/books/${book.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <div className="w-11 h-14 bg-white rounded-lg border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-4 h-4 text-slate-300" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate"
                      title={book.title}
                    >
                      {book.title}
                    </h3>
                    {authorName && (
                      <p className="text-[10px] text-slate-400 truncate">
                        {authorName}
                      </p>
                    )}
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xs font-black text-slate-900">
                        Rs. {discountedPrice.toLocaleString()}
                      </span>
                      {discountNum > 0 && (
                        <span className="text-[9px] text-slate-400 line-through">
                          Rs. {priceNum.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-1 shrink-0">
                  <Link
                    href={`/books/${book.id}`}
                    className="p-1.5 rounded-lg bg-white hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200/60 transition shadow-2xs"
                    title="View Book"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleRemove(book.id)}
                    className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 transition shadow-2xs cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 px-3 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
          <Heart className="w-7 h-7 text-slate-300 mx-auto mb-1.5" />
          <p className="text-xs font-bold text-slate-700">Wishlist is empty</p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Save books you love to view them anytime.
          </p>
          <Link
            href="/books"
            className="mt-2.5 inline-block text-[11px] font-bold text-indigo-600 hover:underline"
          >
            Discover Books →
          </Link>
        </div>
      )}
    </div>
  );
}
