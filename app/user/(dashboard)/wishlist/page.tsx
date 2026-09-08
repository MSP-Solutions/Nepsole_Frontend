"use client";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  CART_CHANGE_EVENT,
  getUserCookie,
  WISHLIST_CHANGE_EVENT,
} from "@/utils/cookies";
import {
  BookOpen,
  Heart,
  Loader2,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
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
  const [addingCartId, setAddingCartId] = useState<string | number | null>(
    null,
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

  const getCoverImage = (book: WishlistBook): string | null => {
    const imgs = book.images || book.bookImages || [];
    if (imgs.length === 0) {
      if (typeof book.coverImageUrl === "string" && book.coverImageUrl)
        return book.coverImageUrl;
      if (typeof book.coverImage === "string" && book.coverImage)
        return book.coverImage;
      if (typeof book.image === "string" && book.image) return book.image;
      if (typeof book.imageUrl === "string" && book.imageUrl)
        return book.imageUrl;
      return null;
    }
    const coverObj: any = imgs.find(
      (img: any) => img?.type === "COVER" || img?.imageType === "COVER",
    );
    if (coverObj) return coverObj.url || coverObj.imageUrl || null;
    const first: any = imgs[0];
    if (typeof first === "string") return first;
    return first?.url || first?.imageUrl || null;
  };

  const getAuthorName = (book: WishlistBook): string => {
    if (book.authors && book.authors.length > 0) {
      const names = book.authors
        .map((a: any) =>
          typeof a === "string" ? a : a.name || a.englishName || a.author?.name,
        )
        .filter(Boolean);
      if (names.length > 0) return names.join(", ");
    }
    if (book.authorBooks && book.authorBooks.length > 0) {
      const names = book.authorBooks
        .map((ab: any) =>
          typeof ab === "string"
            ? ab
            : ab.name || ab.englishName || ab.author?.name,
        )
        .filter(Boolean);
      if (names.length > 0) return names.join(", ");
    }
    return "Nepsole Author";
  };

  const getGenreName = (book: WishlistBook): string => {
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

  const handleRemove = async (e: React.MouseEvent, bookId: number | string) => {
    e.preventDefault();
    e.stopPropagation();

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

      toast.success("Removed from wishlist", { position: "top-center" });
      window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to remove item. Please try again.",
        { position: "top-center" },
      );
    } finally {
      setRemovingId(null);
    }
  };

  // Add to Cart
  const handleAddToCart = async (e: React.MouseEvent, book: WishlistBook) => {
    e.preventDefault();
    e.stopPropagation();

    const isEBook = Boolean(book.isEBook || book.itemType === "EBOOK");
    if (isEBook) {
      window.location.href = `/eBooks/${book.id}`;
      return;
    }

    try {
      const user = await getUserCookie();
      if (!user?.accessToken) {
        toast.error("Please login first to add books to your cart", {
          position: "top-center",
        });
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

      {/* Book Grid matching components/books.tsx */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-white p-3 space-y-3 animate-pulse flex flex-col justify-between"
            >
              <div className="h-[175px] sm:h-[195px] w-full rounded-xl bg-slate-100" />
              <div className="space-y-2">
                <div className="h-3.5 w-4/5 rounded bg-slate-200" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
                <div className="h-4 w-1/3 rounded bg-slate-200 mt-2" />
              </div>
              <div className="h-8 w-full rounded-xl bg-slate-200" />
            </div>
          ))}
        </div>
      ) : processedBooks.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {processedBooks.map((book) => {
            const cover = getCoverImage(book);
            const authorName = getAuthorName(book);
            const priceNum = Number(book.price) || 0;
            const discountNum = Number(book.discountPercent) || 0;
            const finalPrice =
              discountNum > 0
                ? priceNum - (priceNum * discountNum) / 100
                : priceNum;

            const bookId = book.id || book.bookId || book.ebookId;
            const isRemoving = removingId === bookId;
            const isAdding = addingCartId === book.id;
            const isEBook = Boolean(book.isEBook || book.itemType === "EBOOK");
            const isFree =
              isEBook &&
              ((book.plan && String(book.plan).toUpperCase() === "FREE") ||
                priceNum === 0);
            const itemUrl = isEBook ? `/eBooks/${bookId}` : `/books/${bookId}`;

            return (
              <Link
                key={bookId}
                href={itemUrl}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
              >
                {/* Badges */}
                {isEBook ? (
                  <div className="absolute left-2.5 top-2.5 z-10 rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    {isFree ? "FREE" : "E-BOOK"}
                  </div>
                ) : (
                  discountNum > 0 && (
                    <div className="absolute left-2.5 top-2.5 z-10 rounded-lg bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      -{discountNum}%
                    </div>
                  )
                )}

                {/* Wishlist Button (Heart active state) */}
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, bookId)}
                  disabled={isRemoving}
                  aria-label="Remove from wishlist"
                  className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-xs transition shadow-2xs cursor-pointer bg-rose-50 text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                >
                  {isRemoving ? (
                    <Loader2 size={13} className="animate-spin text-rose-500" />
                  ) : (
                    <Heart size={14} className="fill-rose-500 text-rose-500" />
                  )}
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
                      {isFree ? (
                        <span className="text-xs sm:text-sm font-black text-emerald-600">
                          FREE
                        </span>
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm font-black text-[#1749A0]">
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
                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, book)}
                      disabled={isAdding}
                      className="w-full h-8 rounded-xl bg-slate-900 hover:bg-[#1749A0] active:scale-[0.98] text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      {isAdding ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : isEBook ? (
                        <>
                          <BookOpen size={12} />
                          <span>Read E-Book</span>
                        </>
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
