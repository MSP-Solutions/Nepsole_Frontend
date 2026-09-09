"use client";

import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import {
  CART_CHANGE_EVENT,
  getUserCookie,
  openAuthModal,
  WISHLIST_CHANGE_EVENT,
} from "@/utils/cookies";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Heart,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

import { BookItem } from "@/types";

const TrendingBooks = () => {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistedMap, setWishlistedMap] = useState<Record<string, boolean>>(
    {},
  );
  const [addingCartId, setAddingCartId] = useState<string | number | null>(
    null,
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

  // Fetch trending books from /v1/book
  useEffect(() => {
    const fetchTrendingBooks = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get("/v1/book/trending?limit=20");

        const data = res.data?.data || res.data;
        const list: BookItem[] = Array.isArray(data)
          ? data
          : data?.books || data?.items || [];

        setBooks(list);
      } catch (error) {
        console.error("Failed to fetch trending books:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingBooks();
  }, []);

  // Update scroll buttons state when books load/change
  useEffect(() => {
    if (books.length > 6) {
      // Small timeout to allow DOM to render and measure dimensions
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
            const ebId = item?.ebookId || item?.eBookId || item?.ebook?.id;
            const bId = item?.bookId || item?.book?.id;
            if (ebId) map[String(ebId)] = true;
            if (bId) map[String(bId)] = true;
            if (!ebId && !bId && item?.id) map[String(item.id)] = true;
          });
          setWishlistedMap(map);
        }
      } catch {}
    };

    fetchWishlist();
  }, []);

  // Cover image helper
  const getCoverImage = (book: BookItem): string | null => {
    const imgs = book.images || book.bookImages || [];
    if (imgs.length === 0) return null;
    const coverObj: any = imgs.find(
      (img: any) => img?.type === "COVER" || img?.imageType === "COVER",
    );
    if (coverObj) return coverObj.url || coverObj.imageUrl || null;
    const first: any = imgs[0];
    if (typeof first === "string") return first;
    return first?.url || first?.imageUrl || null;
  };

  // Author name helper
  const getAuthorName = (book: BookItem): string => {
    if (book.authors && book.authors.length > 0 && book.authors[0].name) {
      return book.authors.map((a) => a.name).join(", ");
    }
    if (book.authorBooks && book.authorBooks.length > 0) {
      const names = book.authorBooks
        .map((ab) => ab.name || ab.author?.name)
        .filter(Boolean);
      if (names.length > 0) return names.join(", ");
    }
    return "Nepsole Author";
  };

  // Add to Wishlist
  const handleToggleWishlist = async (e: React.MouseEvent, book: BookItem) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const user = await getUserCookie();
      toast.dismiss();
      if (!user?.accessToken) {
        toast.error("Please login first to manage your wishlist");
        openAuthModal("login");
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
      const targetId = !isNaN(numId) ? numId : book.id;
      const isEBook = Boolean(
        book.isEBook || book.isEbook || book.ebookId || book.type === "EBOOK",
      );
      const typeParam = isEBook ? "type=EBOOK" : "type=BOOK";
      const payload = isEBook ? { ebookId: targetId } : { bookId: targetId };

      let response;
      try {
        response = await axiosAuthInstance.post(
          `/v1/wishlist/toggle?${typeParam}`,
          payload,
        );
      } catch {
        response = await axiosAuthInstance.post(
          `/v1/wishlist?${typeParam}`,
          payload,
        );
      }

      const msg = response?.data?.message;
      if (msg) {
        toast.success(msg, { position: "top-center" });
      } else if (!isCurrentlyWishlisted) {
        toast.success("Added to wishlist!", { position: "top-center" });
      } else {
        toast.success("Removed from wishlist", { position: "top-center" });
      }

      window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
    } catch (err: any) {
      // Revert optimistic update
      setWishlistedMap((prev) => ({
        ...prev,
        [String(book.id)]: !prev[String(book.id)],
      }));
      toast.error(
        err?.response?.data?.message || "Failed to update wishlist.",
        {
          position: "top-center",
        },
      );
    }
  };

  // Add to Cart
  const handleAddToCart = async (e: React.MouseEvent, book: BookItem) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const user = await getUserCookie();
      if (!user?.accessToken) {
        toast.dismiss();
        toast.error("Please login first to add books to your cart");
        openAuthModal("login");
        return;
      }

      setAddingCartId(book.id);
      const priceNum = Number(book.price) || 0;
      const discountNum = Number(book.discountPercent) || 0;
      const finalPrice =
        discountNum > 0 ? priceNum - (priceNum * discountNum) / 100 : priceNum;
      const numId = Number(book.id);

      try {
        await axiosAuthInstance.post("/v1/cart", {
          bookId: !isNaN(numId) ? numId : book.id,
          quantity: 1,
        });
      } catch (err: any) {
        if (err?.response?.status === 404) {
          await axiosAuthInstance.post("/api/v1/cart", {
            bookId: !isNaN(numId) ? numId : book.id,
            quantity: 1,
          });
        } else {
          throw err;
        }
      }

      // Sync local storage
      try {
        const coverImg = getCoverImage(book);
        const authorName = getAuthorName(book);
        const saved = localStorage.getItem("nepsole_cart");
        let currentCart: any[] = [];
        if (saved) {
          try {
            currentCart = JSON.parse(saved);
          } catch {}
        }
        if (!Array.isArray(currentCart)) currentCart = [];

        const existingIdx = currentCart.findIndex(
          (c: any) =>
            String(c.bookId) === String(book.id) ||
            String(c.id) === String(book.id),
        );

        if (existingIdx >= 0) {
          currentCart[existingIdx].quantity =
            (currentCart[existingIdx].quantity || 1) + 1;
        } else {
          currentCart.push({
            id: `item-${book.id}-${Date.now()}`,
            bookId: book.id,
            title: book.title,
            author: authorName,
            price: finalPrice,
            originalPrice: priceNum,
            discountPercent: discountNum,
            quantity: 1,
            coverImage: coverImg,
            format: "Paperback",
            stock: Number(book.stock) || 10,
          });
        }

        localStorage.setItem("nepsole_cart", JSON.stringify(currentCart));
      } catch {}

      // Dispatch event to notify cart counters
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CART_CHANGE_EVENT));
      }

      toast.success(`"${book.title}" added to cart!`, {
        position: "top-center",
      });
    } catch (error: any) {
      console.error("Cart error:", error);
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to add book to cart.",
        { position: "top-center" },
      );
    } finally {
      setAddingCartId(null);
    }
  };

  const renderBookCard = (book: BookItem, isCarousel: boolean = false) => {
    const cover = getCoverImage(book);
    const authorName = getAuthorName(book);
    const priceNum = Number(book.price) || 0;
    const discountNum = Number(book.discountPercent) || 0;
    const finalPrice =
      discountNum > 0 ? priceNum - (priceNum * discountNum) / 100 : priceNum;
    const isWishlisted = Boolean(wishlistedMap[String(book.id)]);
    const isAdding = addingCartId === book.id;

    return (
      <Link
        key={book.id}
        href={`/books/${book.id}`}
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md ${
          isCarousel
            ? "w-[170px] sm:w-[190px] md:w-[205px] lg:w-[215px] shrink-0 snap-start"
            : ""
        }`}
      >
        {/* Discount Badge */}
        {discountNum > 0 && (
          <div className="absolute left-2.5 top-2.5 z-10 rounded-lg bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
            -{discountNum}%
          </div>
        )}

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
            <h3 className="line-clamp-1 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1749A0] transition-colors">
              {book.title}
            </h3>

            {/* Author */}
            <p className="mt-0.5 truncate text-[11px] text-slate-400">
              {authorName}
            </p>

            {/* Price */}
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-black text-[#1749A0]">
                Rs. {Math.round(finalPrice).toLocaleString()}
              </span>

              {discountNum > 0 && (
                <span className="text-[11px] text-slate-400 line-through">
                  Rs. {Math.round(priceNum).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-3">
            <button
              type="button"
              onClick={(e) => handleAddToCart(e, book)}
              disabled={isAdding}
              className="w-full h-8 rounded-xl bg-slate-900 hover:bg-[#1749A0] active:scale-[0.98] text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              {isAdding ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={12} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Link>
    );
  };

  const isCarousel = books.length > 6;

  return (
    <section className="w-full bg-white py-8">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            <span>Trending Books</span>
          </h2>

          <div className="flex items-center gap-3">
            {/* Carousel navigation buttons when more than 6 books */}
            {isCarousel && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous books"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  disabled={!canScrollRight}
                  aria-label="Next books"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <Link
              href="/books"
              className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#1749A0] transition hover:text-[#0F2557] hover:underline"
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
            No trending books available right now.
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

export default TrendingBooks;
