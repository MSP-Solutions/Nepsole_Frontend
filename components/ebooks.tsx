"use client";

import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import { getUserCookie } from "@/utils/cookies";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { BookItem } from "@/types";

const Ebooks = () => {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistedMap, setWishlistedMap] = useState<Record<string, boolean>>(
    {},
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Fetch E-Books from /v1/ebook
  useEffect(() => {
    const fetchEBooks = async () => {
      setIsLoading(true);
      try {
        let res;
        try {
          res = await axiosInstance.get("/v1/ebook?limit=12");
        } catch (err: any) {
          if (err?.response?.status === 404) {
            res = await axiosInstance.get("/api/v1/ebook");
          } else {
            throw err;
          }
        }

        const data = res.data?.data || res.data;
        const list: BookItem[] = Array.isArray(data)
          ? data
          : data?.books || data?.items || [];

        setBooks(list);
      } catch (error) {
        console.error("Failed to fetch e-books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEBooks();
  }, []);

  // Update scroll buttons state when books load/change
  useEffect(() => {
    if (books.length > 6) {
      const timer = setTimeout(() => {
        checkScrollButtons();
      }, 100);
      const handleResize = () => checkScrollButtons();
      window.addEventListener("resize", handleResize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [books]);

  // Fetch user's wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const user = await getUserCookie();
        if (!user?.accessToken) return;

        const res = await axiosAuthInstance.get("/v1/wishlist");
        const data =
          res.data?.data ||
          res.data?.wishlist ||
          res.data?.items ||
          res.data ||
          [];
        if (Array.isArray(data)) {
          const map: Record<string, boolean> = {};
          data.forEach((item: any) => {
            const bId = item?.bookId || item?.book?.id || item?.id;
            if (bId) map[String(bId)] = true;
          });
          setWishlistedMap(map);
        }
      } catch {}
    };

    fetchWishlist();
  }, []);

  // Cover image helper
  const getCoverImage = (book: any): string | null => {
    if (book.coverImageUrl) return book.coverImageUrl;
    if (book.coverImage) return book.coverImage;
    if (book.image) return book.image;
    if (book.imageUrl) return book.imageUrl;
    const imgs = book.images || book.bookImages || [];
    if (imgs.length === 0) return null;
    const coverObj: any = imgs.find((img: any) =>
      typeof img === "object"
        ? img?.type === "COVER" || img?.imageType === "COVER"
        : false,
    );
    if (coverObj && typeof coverObj === "object") {
      return coverObj.url || coverObj.imageUrl || null;
    }
    const first: any = imgs[0];
    if (typeof first === "string") return first;
    return first?.url || first?.imageUrl || null;
  };

  // Author name helper
  const getAuthorName = (book: any): string => {
    if (book.authors && book.authors.length > 0) {
      const names = book.authors
        .map((a: any) => a.name || a.englishName || a.author?.name)
        .filter(Boolean);
      if (names.length > 0) return names.join(", ");
    }
    if (book.authorBooks && book.authorBooks.length > 0) {
      const names = book.authorBooks
        .map((ab: any) => ab.name || ab.englishName || ab.author?.name)
        .filter(Boolean);
      if (names.length > 0) return names.join(", ");
    }
    if (book.author?.name) return book.author.name;
    return "Nepsole Author";
  };

  // Add to Wishlist
  const handleToggleWishlist = async (e: React.MouseEvent, book: BookItem) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const user = await getUserCookie();
      if (!user?.accessToken) {
        toast.error("Please login first to manage your wishlist");
        return;
      }

      const strId = String(book.id);
      const isCurrentlyWishlisted = Boolean(wishlistedMap[strId]);

      // Optimistic update
      setWishlistedMap((prev) => ({
        ...prev,
        [strId]: !isCurrentlyWishlisted,
      }));

      const numId = Number(book.id);
      let response;
      try {
        response = await axiosAuthInstance.post("/v1/wishlist/toggle", {
          bookId: !isNaN(numId) ? numId : book.id,
        });
      } catch {
        response = await axiosAuthInstance.post("/v1/wishlist", {
          bookId: !isNaN(numId) ? numId : book.id,
        });
      }

      const msg = response?.data?.message;
      if (msg) {
        toast.success(msg);
      } else if (!isCurrentlyWishlisted) {
        toast.success("Added to wishlist!");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (err: any) {
      // Revert optimistic update
      setWishlistedMap((prev) => ({
        ...prev,
        [String(book.id)]: !prev[String(book.id)],
      }));
      toast.error(err?.response?.data?.message || "Failed to update wishlist.");
    }
  };

  const renderBookCard = (book: any, isCarousel: boolean = false) => {
    const cover = getCoverImage(book);
    const authorName = getAuthorName(book);
    const priceNum = Number(book.price) || 0;
    const discountNum = Number(book.discountPercent) || 0;
    const finalPrice =
      discountNum > 0 ? priceNum - (priceNum * discountNum) / 100 : priceNum;
    const isFree =
      (book.plan && String(book.plan).toUpperCase() === "FREE") ||
      priceNum === 0;
    const isWishlisted = Boolean(wishlistedMap[String(book.id)]);

    return (
      <Link
        key={book.id}
        href={`/eBooks/${book.id}`}
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md ${
          isCarousel
            ? "w-[170px] sm:w-[190px] md:w-[205px] lg:w-[215px] shrink-0 snap-start"
            : ""
        }`}
      >
        {/* Badges */}
        <div className="absolute left-2.5 top-2.5 z-10 flex flex-col gap-1">
          {isFree ? (
            <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
              FREE
            </span>
          ) : (
            discountNum > 0 && (
              <span className="rounded-lg bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                -{discountNum}%
              </span>
            )
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => handleToggleWishlist(e, book)}
          aria-label="Add to wishlist"
          className={`absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-xs transition shadow-2xs cursor-pointer ${
            isWishlisted
              ? "bg-rose-50 text-rose-600"
              : "bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white"
          }`}
        >
          <Heart
            size={14}
            className={isWishlisted ? "fill-rose-500 text-rose-500" : ""}
          />
        </button>

        {/* Book Image */}
        <div className="flex h-[175px] sm:h-[195px] items-center justify-center overflow-hidden bg-slate-50/70 p-3 relative">
          {cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cover}
              alt={book.title}
              className="h-full w-auto max-w-full object-contain transition duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300">
              <BookOpen size={36} />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col justify-between border-t border-slate-100 p-3">
          <div>
            {/* Title */}
            <h3 className="line-clamp-1 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {book.title}
            </h3>

            {/* Author */}
            <p className="mt-0.5 truncate text-[11px] text-slate-400">
              {authorName}
            </p>

            {/* Price */}
            <div className="mt-2 flex items-baseline gap-1.5">
              {isFree ? (
                <span className="text-xs sm:text-sm font-black text-emerald-600">
                  Free
                </span>
              ) : (
                <>
                  <span className="text-xs sm:text-sm font-black text-indigo-600">
                    Rs. {Math.round(finalPrice).toLocaleString()}
                  </span>

                  {discountNum > 0 && (
                    <span className="text-[11px] text-slate-400 line-through">
                      Rs. {Math.round(priceNum).toLocaleString()}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-3">
            <div className="w-full h-8 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-2xs">
              <BookOpen size={12} />
              <span>{isFree ? "Read Now" : "View E-Book"}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const isCarousel = books.length > 6;

  return (
    <section className="w-full bg-white py-8 border-t border-slate-100">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            <span>Trending E-Books</span>
          </h2>

          <div className="flex items-center gap-3">
            {/* Carousel navigation buttons when more than 6 books */}
            {isCarousel && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous e-books"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  disabled={!canScrollRight}
                  aria-label="Next e-books"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <Link
              href="/eBooks"
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 hover:underline"
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Books Content */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-3 space-y-3"
              >
                <div className="h-44 w-full rounded-xl bg-slate-100" />
                <div className="h-3 w-3/4 rounded bg-slate-100" />
                <div className="h-2.5 w-1/2 rounded bg-slate-100" />
                <div className="h-4 w-1/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No trending e-books available right now.
          </div>
        ) : isCarousel ? (
          /* Carousel scrollable container for > 6 books */
          <div className="relative">
            <div
              ref={scrollContainerRef}
              onScroll={checkScrollButtons}
              className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth py-1 px-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory"
            >
              {books.map((book) => renderBookCard(book, true))}
            </div>
          </div>
        ) : (
          /* Grid view for <= 6 books */
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {books.map((book) => renderBookCard(book, false))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Ebooks;
