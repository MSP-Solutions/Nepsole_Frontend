"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Heart,
  Star,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import { getUserCookie, WISHLIST_CHANGE_EVENT } from "@/utils/cookies";
import toast from "react-hot-toast";

export interface RecommendedBook {
  id: number | string;
  title: string;
  price: number | string;
  discountPercent?: number | string;
  stock?: number;
  rating?: number;
  reviews?: number;
  genres?: any[];
  genreBooks?: any[];
  authors?: any[];
  authorBooks?: any[];
  images?: any[];
  bookImages?: any[];
  coverImage?: string;
  image?: string;
  publisher?: any;
  [key: string]: any;
}

export default function UserRecommendedBooks() {
  const [books, setBooks] = useState<RecommendedBook[]>([]);
  const [wishlistedMap, setWishlistedMap] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchRecommendedBooks = async () => {
    setIsLoading(true);
    try {
      let res;
      try {
        res = await axiosAuthInstance.get("/v1/dashboard/user/recommended-books");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          try {
            res = await axiosAuthInstance.get("/api/v1/dashboard/user/recommended-books");
          } catch {
            res = await axiosInstance.get("/v1/book?limit=6");
          }
        } else {
          // Fallback to general books catalog
          res = await axiosInstance.get("/v1/book?limit=6");
        }
      }

      const raw =
        res?.data?.data ||
        res?.data?.books ||
        res?.data?.items ||
        (Array.isArray(res?.data) ? res?.data : []);
      const list: RecommendedBook[] = Array.isArray(raw) ? raw : [];
      setBooks(list.slice(0, 6));
    } catch (error) {
      console.error("Failed to load recommended books:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWishlistStatus = async () => {
    try {
      const user = await getUserCookie();
      if (!user?.accessToken) return;

      const res = await axiosAuthInstance.get("/v1/wishlist");
      const data = res?.data?.data || res?.data?.wishlist || res?.data?.items || res?.data || [];
      if (Array.isArray(data)) {
        const map: Record<string, boolean> = {};
        data.forEach((item: any) => {
          const ebId = item?.ebookId || item?.eBookId || item?.ebook?.id;
          const bId = item?.bookId || item?.book?.id;
          if (ebId) map[String(ebId)] = true;
          if (bId) map[String(bId)] = true;
          if (!ebId && !bId && item?.id) map[String(item.id)] = true;
        });
        setWishlistedMap(map);
      }
    } catch {
      // Silently ignore
    }
  };

  useEffect(() => {
    fetchRecommendedBooks();
    fetchWishlistStatus();
  }, []);

  const getCoverImage = (book: RecommendedBook): string | null => {
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

  const getGenreName = (book: RecommendedBook): string => {
    const list = book.genres || book.genreBooks || [];
    if (list.length === 0) return "General";
    return list[0].name || list[0].englishName || list[0].genre?.name || "Book";
  };

  const toggleWishlist = async (id: number | string, title: string) => {
    try {
      const strId = String(id);
      const isCurrently = Boolean(wishlistedMap[strId]);

      // Optimistic update
      setWishlistedMap((prev) => ({
        ...prev,
        [strId]: !isCurrently,
      }));

      const numId = Number(id);
      const targetId = isNaN(numId) ? id : numId;

      await axiosAuthInstance.post("/v1/wishlist/toggle?type=BOOK", {
        bookId: targetId,
      });

      if (!isCurrently) {
        toast.success(`Added "${title}" to your wishlist!`);
      } else {
        toast.success(`Removed "${title}" from wishlist`);
      }

      window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
    } catch (err) {
      // Revert optimistic
      setWishlistedMap((prev) => ({
        ...prev,
        [String(id)]: !prev[String(id)],
      }));
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Recommended For You</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Curated book suggestions based on your reading preferences and top catalog picks
          </p>
        </div>

        <Link
          href="/books"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Explore All Books</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 bg-slate-50 rounded-2xl animate-pulse border border-slate-100"
            />
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {books.map((book) => {
            const coverUrl = getCoverImage(book);
            const priceNum = Number(book.price) || 0;
            const discountNum = Number(book.discountPercent) || 0;
            const discountedPrice =
              discountNum > 0
                ? priceNum - (priceNum * discountNum) / 100
                : priceNum;
            const genreName = getGenreName(book);
            const authorName = (book.authors || book.authorBooks || [])
              .map((a: any) => a.name || a.englishName || a.author?.name || "")
              .filter(Boolean)
              .join(", ") || "Renowned Author";
            const isWishlisted = Boolean(wishlistedMap[String(book.id)]);

            return (
              <div
                key={book.id}
                className="bg-slate-50/70 hover:bg-slate-100/90 transition-all duration-200 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/books/${book.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <div className="w-14 h-18 bg-white rounded-xl border border-slate-200/80 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70 truncate inline-block max-w-full">
                        {genreName}
                      </span>
                      <h3
                        className="font-bold text-slate-900 text-xs sm:text-sm mt-1 group-hover:text-indigo-600 transition truncate"
                        title={book.title}
                      >
                        {book.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">
                        by {authorName}
                      </p>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => toggleWishlist(book.id, book.title)}
                    className={`p-2 rounded-xl transition cursor-pointer shrink-0 shadow-2xs ${
                      isWishlisted
                        ? "bg-rose-50 text-rose-600 border border-rose-200"
                        : "bg-white text-slate-400 hover:text-rose-500 border border-slate-200/80 hover:bg-rose-50"
                    }`}
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? "fill-rose-500 text-rose-500" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                  <div>
                    {book.rating ? (
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{book.rating}</span>
                        {book.reviews && (
                          <span className="text-slate-400 font-normal text-[10px]">
                            ({book.reviews})
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>Popular Pick</span>
                      </div>
                    )}
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        Rs. {discountedPrice.toLocaleString()}
                      </span>
                      {discountNum > 0 && (
                        <span className="text-[10px] text-slate-400 line-through">
                          Rs. {priceNum.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/books/${book.id}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingCart className="w-3 h-3" />
                    <span>View Book</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 px-4 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700">No recommendations available</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Browse our full catalog to discover great titles.
          </p>
          <Link
            href="/books"
            className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <span>Browse Books Catalog</span>
          </Link>
        </div>
      )}
    </div>
  );
}
