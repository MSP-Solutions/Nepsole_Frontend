"use client";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import { WISHLIST_CHANGE_EVENT } from "@/utils/cookies";
import {
  BookOpen,
  Heart,
  HeartIcon,
  Loader2,
  LucideMove,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";
import { Lovers_Quarrel } from "next/font/google";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export interface WishlistBook {
  id: number | string;
  title: string;
  price: number | string;
  discountPercent?: number | string;
  stock?: number;
  images?: any[];
  bookImages?: any[];
  coverImage?: string;
  image?: string;
  authors?: any[];
  authorBooks?: any[];
  genres?: any[];
  genreBooks?: any[];
  [key: string]: any;
}

export interface WishlistItem {
  id?: number | string;
  bookId?: number | string;
  book?: WishlistBook;
  [key: string]: any;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [removingId, setRemovingId] = useState<string | number | null>(null);
  const [wishlistedMap, setWishlistedMap] = useState<Record<string, boolean>>(
    {},
  );

  const fetchWishlist = async () => {
    setIsLoading(true);

    try {
      let res;
      try {
        res = await axiosAuthInstance.get("/v1/wishlist");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          res = await axiosAuthInstance.get("/api/v1/wishlist");
        } else {
          throw err;
        }
      }

      const data = res?.data;
      const wishlist =
        data?.data ||
        data?.wishlist ||
        data?.items ||
        (Array.isArray(data) ? data : []);

      setItems(Array.isArray(wishlist) ? wishlist : []);
    } catch (error: any) {
      console.error("Failed to load wishlist:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to load wishlist. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const extractBook = (item: WishlistItem): WishlistBook => {
    const isEBook = item.itemType === "EBOOK" || Boolean(item.ebook);
    const content = isEBook ? item.ebook || item : item.book || item;
    const realId = isEBook
      ? item.ebookId || item.ebook?.id || content.id
      : item.bookId || item.book?.id || content.id;

    return {
      ...content,
      id: realId,
      wishlistRecordId: item.id,
      itemType: isEBook ? "EBOOK" : "BOOK",
      isEBook,
      ebookId: item.ebookId || (isEBook ? realId : undefined),
      bookId: item.bookId || (!isEBook ? realId : undefined),
    };
  };

  const getCoverImage = (book: WishlistBook) => {
    if (typeof book.coverImageUrl === "string" && book.coverImageUrl)
      return book.coverImageUrl;
    if (typeof book.coverImage === "string" && book.coverImage)
      return book.coverImage;
    if (typeof book.image === "string" && book.image) return book.image;
    if (typeof book.imageUrl === "string" && book.imageUrl)
      return book.imageUrl;

    const images = book.images || book.bookImages || [];
    if (!images.length) return null;

    const cover = images.find(
      (img: any) =>
        typeof img === "object" &&
        (img.imageType === "COVER" || img.type === "COVER"),
    );

    if (cover) {
      return cover.url || cover.imageUrl || null;
    }

    const first = images[0];
    if (typeof first === "string") return first;
    if (typeof first === "object") {
      return first.url || first.imageUrl || null;
    }

    return null;
  };

  const getAuthorName = (book: WishlistBook) => {
    const authors = book.authors || book.authorBooks || [];
    if (!authors.length) return "Nepsole Author";

    const author = authors[0];
    return (
      author.name ||
      author.englishName ||
      author.author?.name ||
      author.author?.englishName ||
      "Nepsole Author"
    );
  };

  const getGenreName = (book: WishlistBook) => {
    const list = book.genres || book.genreBooks || [];
    if (!list.length) return "";
    const first = list[0];
    return (
      first.name ||
      first.englishName ||
      first.genre?.name ||
      first.genre?.englishName ||
      ""
    );
  };

  const processedBooks = useMemo(() => {
    return items
      .map(extractBook)
      .filter((book) => {
        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return (
          book.title?.toLowerCase().includes(query) ||
          getAuthorName(book).toLowerCase().includes(query) ||
          getGenreName(book).toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const priceA = Number(a.price) || 0;
        const priceB = Number(b.price) || 0;

        const discountA = Number(a.discountPercent) || 0;
        const discountB = Number(b.discountPercent) || 0;

        const finalA =
          discountA > 0 ? priceA - (priceA * discountA) / 100 : priceA;
        const finalB =
          discountB > 0 ? priceB - (priceB * discountB) / 100 : priceB;

        if (sortBy === "price-low") return finalA - finalB;
        if (sortBy === "price-high") return finalB - finalA;
        if (sortBy === "discount") return discountB - discountA;
        if (sortBy === "title") {
          return (a.title || "").localeCompare(b.title || "");
        }

        return 0;
      });
  }, [items, searchQuery, sortBy]);

  const handleRemove = async (bookId: number | string) => {
    setRemovingId(bookId);

    try {
      const itemObj = items.find((i) => {
        const b = extractBook(i);
        const bId = b.id || i.bookId || i.id;
        return String(bId) === String(bookId);
      });

      const isEBook = Boolean(
        itemObj?.ebookId ||
        itemObj?.eBookId ||
        itemObj?.isEbook ||
        itemObj?.type === "EBOOK" ||
        itemObj?.book?.ebookId ||
        itemObj?.book?.type === "EBOOK",
      );

      const typeParam = isEBook ? "type=EBOOK" : "type=BOOK";
      const id = Number(bookId);
      const targetId = Number.isNaN(id) ? bookId : id;
      const payload = isEBook ? { ebookId: targetId } : { bookId: targetId };

      try {
        await axiosAuthInstance.post(
          `/v1/wishlist/toggle?${typeParam}`,
          payload,
        );
      } catch {
        try {
          await axiosAuthInstance.delete(
            `/v1/wishlist/remove/${targetId}?${typeParam}`,
          );
        } catch {
          await axiosAuthInstance.delete(
            `/v1/wishlist/${targetId}?${typeParam}`,
          );
        }
      }

      setItems((prev) =>
        prev.filter((item) => {
          const book = extractBook(item);
          const currentId = book.id || item.bookId || item.id;
          return String(currentId) !== String(bookId);
        }),
      );

      toast.success("Item removed from wishlist");
      window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to remove item. Please try again.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="-m-6 min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:-m-8 lg:p-8 space-y-5">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
              <span>My Wishlist</span>
            </h1>
            <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-200/80">
              {items.length} {items.length === 1 ? "Book" : "Books"}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Your saved reading list • Tap any book to view details or order
          </p>
        </div>
      </div>

      {/* Book Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-2 animate-pulse"
            >
              <div className="h-36 sm:h-40 w-full rounded-lg bg-slate-200" />
              <div className="h-3 w-3/4 rounded bg-slate-200" />
              <div className="h-2.5 w-1/2 rounded bg-slate-200" />
              <div className="h-7 w-full rounded-lg bg-slate-200 mt-2" />
            </div>
          ))}
        </div>
      ) : processedBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {processedBooks.map((book) => {
            const coverUrl = getCoverImage(book);
            const authorName = getAuthorName(book);
            const genreName = getGenreName(book);

            const price = Number(book.price) || 0;
            const discount = Number(book.discountPercent) || 0;
            const finalPrice =
              discount > 0 ? price - (price * discount) / 100 : price;

            const bookId = book.id || book.bookId || book.ebookId;
            const isRemoving = removingId === bookId;
            const isWishlisted = true;
            const isEBook = Boolean(book.isEBook || book.itemType === "EBOOK");
            const isFree =
              isEBook &&
              ((book.plan && String(book.plan).toUpperCase() === "FREE") ||
                price === 0);
            const isOutOfStock = !isEBook && Number(book.stock) <= 0;
            const itemUrl = isEBook ? `/eBooks/${bookId}` : `/books/${bookId}`;

            return (
              <div
                key={bookId}
                className="group bg-white rounded-xl border border-slate-200/90 hover:border-[#1749A0]/50 hover:shadow-md transition-all duration-200 p-2.5 flex flex-col justify-between relative"
              >
                <div>
                  <div className="relative h-36 sm:h-40 w-full rounded-lg bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-1.5 mb-2 group-hover:bg-slate-100/60 transition-colors">
                    {coverUrl ? (
                      <img
                        src={coverUrl}
                        alt={book.title}
                        className="max-h-full max-w-full object-contain rounded drop-shadow-xs transition-transform duration-200 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300">
                        <BookOpen className="w-8 h-8 mb-1" />
                        <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                          {isEBook ? "E-Book" : "Book"}
                        </span>
                      </div>
                    )}

                    {/* Badges */}
                    {isEBook ? (
                      <span className="absolute left-1.5 top-1.5 rounded-md bg-indigo-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow-2xs">
                        {isFree ? "FREE" : "E-BOOK"}
                      </span>
                    ) : (
                      discount > 0 && (
                        <span className="absolute left-1.5 top-1.5 rounded-md bg-rose-600 px-1.5 py-0.5 text-[9px] font-extrabold text-white shadow-2xs">
                          -{discount}%
                        </span>
                      )
                    )}

                    {/* Quick Remove Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(bookId)}
                      aria-label="Add to wishlist"
                      className={`absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-xs transition shadow-2xs cursor-pointer ${
                        isWishlisted
                          ? "bg-rose-50 text-rose-600"
                          : "bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white"
                      }`}
                    >
                      <Heart
                        size={14}
                        className={
                          isWishlisted ? "fill-rose-500 text-rose-500" : ""
                        }
                      />
                    </button>

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-2xs rounded-lg">
                        <span className="rounded bg-rose-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Genre Tag */}
                  {genreName && (
                    <span className="inline-block text-[9px] font-semibold text-[#1749A0] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/80 truncate max-w-full mb-1">
                      {genreName}
                    </span>
                  )}

                  {/* Title & Author */}
                  <Link href={itemUrl} className="block">
                    <h2
                      className="text-xs font-bold text-slate-900 group-hover:text-[#1749A0] transition-colors line-clamp-1 leading-snug"
                      title={book.title}
                    >
                      {book.title}
                    </h2>
                  </Link>

                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {authorName}
                  </p>

                  {/* Price */}
                  <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                    {isFree ? (
                      <span className="text-xs sm:text-sm font-extrabold text-emerald-600">
                        Free Reading
                      </span>
                    ) : (
                      <>
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          Rs. {Math.round(finalPrice).toLocaleString()}
                        </span>

                        {discount > 0 && (
                          <span className="text-[10px] text-slate-400 line-through">
                            Rs. {Math.round(price).toLocaleString()}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5">
                  <Link
                    href={itemUrl}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                  >
                    <span>Details</span>
                  </Link>

                  <Link
                    href={itemUrl}
                    className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-[#1749A0] hover:bg-[#0F2557] text-white text-[11px] font-bold transition shadow-2xs cursor-pointer"
                  >
                    {isEBook ? (
                      <BookOpen className="w-3 h-3" />
                    ) : (
                      <ShoppingCart className="w-3 h-3" />
                    )}
                    <span>{isEBook ? "Read" : "Order"}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-3 border border-rose-100">
            <Heart className="w-6 h-6 fill-rose-500/20" />
          </div>

          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {searchQuery ? "No matching books found" : "Your Wishlist is Empty"}
          </h2>

          <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
            {searchQuery
              ? `No saved books match "${searchQuery}". Try clearing the search query.`
              : "Discover bestsellers, trending titles, and tap the heart icon on any book to save it for later."}
          </p>

          <div className="mt-4 flex items-center gap-2">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                Clear Search
              </button>
            ) : (
              <Link
                href="/books"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1749A0] hover:bg-[#0F2557] px-4 py-2 text-xs font-bold text-white transition shadow-sm cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Explore Books Catalog</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
