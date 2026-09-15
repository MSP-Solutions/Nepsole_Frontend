"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import { CART_CHANGE_EVENT, getUserCookie } from "@/utils/cookies";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CheckoutDialog from "@/components/CheckoutDialog";
import toast from "react-hot-toast";

export interface BackendBookAuthor {
  id: number | string;
  name: string;
  imageUrl?: string;
}

export interface BackendBookGenre {
  id: number | string;
  name: string;
  icon?: string;
}

export interface BackendBookLanguage {
  id: number | string;
  name: string;
  code?: string;
}

export interface BackendBookImage {
  id: number | string;
  bookId?: number | string;
  url: string;
  type?: "COVER" | "OTHER" | string;
}

export interface BackendBookPublisher {
  id: number | string;
  name: string;
  publicationLogoUrl?: string;
}

export interface BackendBook {
  id: number | string;
  title: string;
  price: number;
  unitPrice?: number;
  discountPercent?: number;
  stock?: number;
  publicationDate?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number;
  description?: string;
  publisher?: BackendBookPublisher;
  authors?: BackendBookAuthor[];
  genres?: BackendBookGenre[];
  languages?: BackendBookLanguage[];
  images?: BackendBookImage[];
  [key: string]: any;
}

export interface BackendCartItem {
  id: number | string;
  cartId?: number | string;
  bookId: number | string;
  quantity: number;
  unitPrice: number;
  originalPrice: number;
  discountPercent: number;
  itemTotal: number;
  originalTotal: number;
  discountTotal: number;
  book: BackendBook;
}

export interface CartSummary {
  distinctItems: number;
  totalQuantity: number;
  subtotal: number;
  totalDiscount: number;
  grandTotal: number;
}

export default function CartPage() {
  const [items, setItems] = useState<BackendCartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [removingId, setRemovingId] = useState<string | number | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const fetchCart = async () => {
    setIsLoading(true);

    try {
      const user = await getUserCookie();
      if (!user?.accessToken) {
        setItems([]);
        setSummary(null);
        return;
      }

      const res = await axiosAuthInstance.get("/v1/cart");
      const data = res?.data?.data || res?.data;

      const rawItems: BackendCartItem[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
          ? data
          : [];

      setItems(rawItems);

      if (data?.summary) {
        setSummary({
          distinctItems: Number(data.summary.distinctItems) || rawItems.length,
          totalQuantity:
            Number(data.summary.totalQuantity) ||
            rawItems.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0),
          subtotal: Number(data.summary.subtotal) || 0,
          totalDiscount: Number(data.summary.totalDiscount) || 0,
          grandTotal: Number(data.summary.grandTotal) || 0,
        });
      } else {
        // Compute fallback summary
        const sub = rawItems.reduce(
          (sum, it) =>
            sum +
            (Number(it.originalTotal) ||
              Number(it.originalPrice) * it.quantity ||
              0),
          0,
        );
        const disc = rawItems.reduce(
          (sum, it) => sum + (Number(it.discountTotal) || 0),
          0,
        );
        const gTot = rawItems.reduce(
          (sum, it) =>
            sum +
            (Number(it.itemTotal) || Number(it.unitPrice) * it.quantity || 0),
          0,
        );
        const totQty = rawItems.reduce(
          (sum, it) => sum + (Number(it.quantity) || 1),
          0,
        );

        setSummary({
          distinctItems: rawItems.length,
          totalQuantity: totQty,
          subtotal: sub,
          totalDiscount: disc,
          grandTotal: gTot,
        });
      }
    } catch (error: any) {
      console.error("Failed to load cart from /v1/cart:", error);
      setItems([]);
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Cover image helper from book.images
  const getBookCoverUrl = (book: BackendBook): string | null => {
    if (
      !book?.images ||
      !Array.isArray(book.images) ||
      book.images.length === 0
    ) {
      return null;
    }

    const cover = book.images.find(
      (img) => img.type === "COVER" || (img as any).imageType === "COVER",
    );
    if (cover?.url) return cover.url;

    return book.images[0]?.url || null;
  };

  // Primary author helper
  const getBookAuthorName = (book: BackendBook): string => {
    if (
      book?.authors &&
      Array.isArray(book.authors) &&
      book.authors.length > 0
    ) {
      return book.authors[0]?.name || "Nepsole Author";
    }
    return (book as any)?.author || "Nepsole Author";
  };

  // Primary genre helper
  const getBookGenreName = (book: BackendBook): string => {
    if (book?.genres && Array.isArray(book.genres) && book.genres.length > 0) {
      return book.genres[0]?.name || "";
    }
    return (book as any)?.genre || "";
  };

  const debounceTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    return () => {
      Object.values(debounceTimersRef.current).forEach((timer) =>
        clearTimeout(timer),
      );
    };
  }, []);

  // Update quantity handler using /v1/cart/quantity with debounce and final quantity
  const handleUpdateQuantity = (item: BackendCartItem, delta: number) => {
    // Get latest quantity in state to allow rapid clicks to accumulate to final quantity
    const currentItem = items.find((it) => it.id === item.id) || item;
    const currentQty = Number(currentItem.quantity) || 1;
    const maxStock = Number(item.book?.stock) || 500;
    const finalQty = currentQty + delta;
    if (finalQty < 1 || finalQty > maxStock) return;

    // Optimistic update
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === item.id) {
          const unitPrice = Number(it.unitPrice) || 0;
          const originalPrice = Number(it.originalPrice) || unitPrice;
          const itemTotal = unitPrice * finalQty;
          const originalTotal = originalPrice * finalQty;
          const discountTotal = originalTotal - itemTotal;

          return {
            ...it,
            quantity: finalQty,
            itemTotal,
            originalTotal,
            discountTotal,
          };
        }
        return it;
      }),
    );

    // Clear any existing pending timer for this item
    const timerKey = String(item.id);
    if (debounceTimersRef.current[timerKey]) {
      clearTimeout(debounceTimersRef.current[timerKey]);
    }

    debounceTimersRef.current[timerKey] = setTimeout(async () => {
      setUpdatingId(item.id);

      try {
        await axiosAuthInstance.patch("/v1/cart/quantity", {
          bookId: Number(item.bookId) || item.bookId,
          quantity: finalQty,
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event(CART_CHANGE_EVENT));
        }
        const cartRes = await axiosAuthInstance.get("/v1/cart");
        const data = cartRes?.data?.data || cartRes?.data;
        if (data?.items && Array.isArray(data.items)) {
          setItems(data.items);
        }
        if (data?.summary) {
          setSummary(data.summary);
        }
      } catch (error: any) {
        console.error("Failed to update cart quantity:", error);
        toast.error(
          error?.response?.data?.message || "Failed to update quantity.",
        );
        await fetchCart();
      } finally {
        setUpdatingId(null);
      }
    }, 400);
  };

  const handleRemoveItem = async (item: BackendCartItem) => {
    const bookId = item.bookId ?? item.book?.id ?? item.id;
    setRemovingId(item.id);

    try {
      // Optimistic removal
      setItems((prev) => prev.filter((it) => it.id !== item.id));

      await axiosAuthInstance.delete(`/v1/cart/${bookId}`);

      toast.success(`Removed "${item.book?.title || "Book"}" from cart`);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CART_CHANGE_EVENT));
      }

      await fetchCart();
    } catch (error: any) {
      console.error("Failed to remove item from cart:", error);
      toast.error(
        error?.response?.data?.message || "Failed to remove item from cart.",
      );
      await fetchCart();
    } finally {
      setRemovingId(null);
    }
  };
  const totalItemsCount = summary?.distinctItems ?? items.length;
  const totalQuantityCount =
    summary?.totalQuantity ??
    items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  const subtotalOriginal =
    summary?.subtotal ??
    items.reduce(
      (sum, item) =>
        sum +
        (Number(item.originalTotal) ||
          (Number(item.originalPrice) || Number(item.unitPrice)) *
            item.quantity),
      0,
    );

  const totalCatalogDiscount =
    summary?.totalDiscount ??
    items.reduce(
      (sum, item) =>
        sum +
        (Number(item.discountTotal) ||
          Math.max(
            0,
            (Number(item.originalPrice) || Number(item.unitPrice)) *
              item.quantity -
              Number(item.unitPrice) * item.quantity,
          )),
      0,
    );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-800">
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* Page Title & Count Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-5 border-b border-slate-200 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F2557] text-white shadow-xs">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Shopping Cart
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your selected books, review quantities, and proceed to
                checkout
              </p>
            </div>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-[#1749A0] bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100/80">
                {totalItemsCount} {totalItemsCount === 1 ? "Book" : "Books"} (
                {totalQuantityCount}{" "}
                {totalQuantityCount === 1 ? "Item" : "Items"})
              </span>
            </div>
          )}
        </div>

        {/* Main Cart Body */}
        {isLoading ? (
          <div className="mt-8 flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#1749A0] mb-3" />
            <p className="text-xs font-semibold text-slate-500">
              Loading your cart items...
            </p>
          </div>
        ) : items.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-8 space-y-3.5">
              {items.map((item) => {
                const book = item.book || {};
                const coverUrl = getBookCoverUrl(book);
                const authorName = getBookAuthorName(book);
                const genreName = getBookGenreName(book);
                const publisherName = book.publisher?.name;
                const languageName = book.languages?.[0]?.name;

                const unitPrice =
                  Number(item.unitPrice) || Number(book.price) || 0;
                const originalPrice =
                  Number(item.originalPrice) || Number(book.price) || unitPrice;
                const discountPercent =
                  Number(item.discountPercent) ||
                  Number(book.discountPercent) ||
                  0;
                const itemTotal =
                  Number(item.itemTotal) || unitPrice * item.quantity;
                const originalTotal =
                  Number(item.originalTotal) || originalPrice * item.quantity;

                const isUpdating = updatingId === item.id;
                const isRemoving = removingId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-shadow flex flex-col sm:flex-row gap-4 relative"
                  >
                    {/* Book Cover Container */}
                    <div className="relative w-20 h-28 sm:w-24 sm:h-32 shrink-0 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center p-1 self-center sm:self-start">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={book.title || "Book"}
                          className="max-h-full max-w-full object-contain rounded drop-shadow-xs"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-300">
                          <BookOpen className="w-8 h-8 mb-1" />
                          <span className="text-[8px] font-bold uppercase text-slate-400">
                            Book
                          </span>
                        </div>
                      )}

                      {discountPercent > 0 && (
                        <span className="absolute top-1 left-1 bg-rose-600 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>

                    {/* Book Info & Details */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            {/* Badges: Genre & Language */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {genreName && (
                                <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-[#1749A0] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/60">
                                  {genreName}
                                </span>
                              )}
                              {languageName && (
                                <span className="inline-block text-[9px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                  {languageName}
                                </span>
                              )}
                            </div>

                            {/* Book Title */}
                            <Link href={`/books/${item.bookId}`}>
                              <h3 className="text-sm sm:text-base font-bold text-slate-900 hover:text-[#1749A0] transition-colors leading-snug line-clamp-2">
                                {book.title || "Untitled Book"}
                              </h3>
                            </Link>

                            {/* Author & Publisher */}
                            <p className="text-xs text-slate-500">
                              by{" "}
                              <span className="text-slate-800 font-medium">
                                {authorName}
                              </span>
                              {publisherName && (
                                <span className="text-slate-400">
                                  {" "}
                                  • {publisherName}
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Item Price Breakdown (Right Side) */}
                          <div className="text-right shrink-0">
                            <p className="text-sm sm:text-base font-extrabold text-slate-900">
                              Rs. {itemTotal.toLocaleString()}
                            </p>
                            {originalTotal > itemTotal && (
                              <p className="text-[11px] text-slate-400 line-through">
                                Rs. {originalTotal.toLocaleString()}
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Rs. {unitPrice.toLocaleString()} / item
                            </p>
                          </div>
                        </div>

                        {/* Stock status */}
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>
                            In Stock • {Number(book.stock || 500)} available in
                            warehouse
                          </span>
                        </div>
                      </div>

                      {/* Bottom Controls: Quantity Stepper & Remove */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
                        {/* Quantity Counter */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                            Quantity:
                          </span>
                          <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item, -1)}
                              disabled={item.quantity <= 1 || isUpdating}
                              className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-bold text-slate-900 min-w-[24px] text-center select-none flex items-center justify-center">
                              {isUpdating ? (
                                <Loader2 className="w-3 h-3 animate-spin text-[#1749A0]" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item, 1)}
                              disabled={
                                item.quantity >= (Number(book.stock) || 500) ||
                                isUpdating
                              }
                              className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Remove Action */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item)}
                            disabled={isRemoving}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition cursor-pointer disabled:opacity-50"
                          >
                            {isRemoving ? (
                              <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Order Summary Card (4 Cols) */}
            <div className="lg:col-span-4 space-y-4 sticky top-20">
              {/* Order Summary Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-normal text-slate-500 lowercase">
                    ({totalQuantityCount}{" "}
                    {totalQuantityCount === 1 ? "item" : "items"})
                  </span>
                </h2>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">
                      Rs. {Math.round(subtotalOriginal).toLocaleString()}
                    </span>
                  </div>

                  {totalCatalogDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Total Savings</span>
                      <span className="font-bold">
                        - Rs.{" "}
                        {Math.round(totalCatalogDiscount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      Delivery Fee
                      <span
                        className="text-[10px] text-slate-400"
                        title="Delivery across Nepal"
                      >
                        (Nepal)
                      </span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      Grand Total
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Inclusive of all taxes
                    </p>
                  </div>
                  <p className="text-xl font-black text-[#0F2557]">
                    Rs. {Math.round(summary?.grandTotal ?? 0).toLocaleString()}
                  </p>
                </div>

                {/* Checkout Button */}
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full py-3.5 px-4 bg-[#1749A0] hover:bg-[#0F2557] active:scale-[0.99] text-white text-xs sm:text-sm font-extrabold rounded-xl transition shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Cart State */
          <div className="mt-8 bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-14 text-center flex flex-col items-center justify-center min-h-[450px] shadow-xs max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 text-[#1749A0] flex items-center justify-center mb-5 border border-blue-100 shadow-xs">
              <ShoppingCart className="w-10 h-10" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Your Shopping Cart is Empty
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md leading-relaxed">
              Explore our curated catalog of Nepali novels, international
              bestsellers, and academic books to start reading!
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/books"
                className="px-6 py-3 rounded-xl bg-[#1749A0] hover:bg-[#0F2557] text-white text-xs font-bold transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Explore Books Catalog</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Dialog Modal */}
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={items}
        summary={summary}
        onOrderSuccess={fetchCart}
      />
    </div>
  );
}
