"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  CART_CHANGE_EVENT,
  getUserCookie,
  OPEN_CART_DRAWER_EVENT,
} from "@/utils/cookies";
import { updateLocalStorageItem } from "@/utils/cartState";
import CheckoutDialog from "@/components/CheckoutDialog";
import toast from "react-hot-toast";

export interface DrawerCartItem {
  id: string | number;
  bookId: string | number;
  title: string;
  author: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  quantity: number;
  coverImage?: string | null;
  stock?: number;
  itemTotal: number;
  originalTotal: number;
  book?: any;
}

export interface DrawerSummary {
  distinctItems: number;
  totalQuantity: number;
  subtotal: number;
  totalDiscount: number;
  grandTotal: number;
}

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<DrawerCartItem[]>([]);
  const [summary, setSummary] = useState<DrawerSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [removingId, setRemovingId] = useState<string | number | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const debounceTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const calculateSummary = (cartItems: DrawerCartItem[]): DrawerSummary => {
    const sub = cartItems.reduce(
      (sum, it) => sum + (Number(it.originalTotal) || 0),
      0
    );
    const disc = cartItems.reduce(
      (sum, it) =>
        sum +
        Math.max(
          0,
          (Number(it.originalTotal) || 0) - (Number(it.itemTotal) || 0)
        ),
      0
    );
    const gTot = cartItems.reduce(
      (sum, it) => sum + (Number(it.itemTotal) || 0),
      0
    );
    const totQty = cartItems.reduce(
      (sum, it) => sum + (Number(it.quantity) || 1),
      0
    );

    return {
      distinctItems: cartItems.length,
      totalQuantity: totQty,
      subtotal: sub,
      totalDiscount: disc,
      grandTotal: gTot,
    };
  };

  const fetchDrawerCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const user = await getUserCookie();
      const loggedIn = Boolean(user?.accessToken);
      setIsAuthenticated(loggedIn);

      if (!loggedIn) {
        // Guest mode: Read from localStorage
        const raw =
          typeof window !== "undefined"
            ? localStorage.getItem("nepsole_cart")
            : null;
        let localCart: any[] = [];
        if (raw) {
          try {
            localCart = JSON.parse(raw);
          } catch {}
        }
        if (!Array.isArray(localCart)) localCart = [];

        const mappedItems: DrawerCartItem[] = localCart.map((it: any) => {
          const qty = Number(it.quantity) || 1;
          const uPrice = Number(it.price) || 0;
          const oPrice = Number(it.originalPrice) || uPrice;
          const dPercent = Number(it.discountPercent) || 0;
          const iTotal = uPrice * qty;
          const oTotal = oPrice * qty;

          return {
            id: it.id || `local-${it.bookId}`,
            bookId: it.bookId ?? it.id,
            title: it.title || "Book",
            author: it.author || "",
            price: uPrice,
            originalPrice: oPrice,
            discountPercent: dPercent,
            quantity: qty,
            coverImage: it.coverImage || null,
            stock: Number(it.stock) || 500,
            itemTotal: iTotal,
            originalTotal: oTotal,
            book: {
              id: it.bookId ?? it.id,
              title: it.title || "Book",
              price: oPrice,
              stock: Number(it.stock) || 500,
              images: it.coverImage
                ? [{ id: 1, url: it.coverImage, type: "COVER" }]
                : [],
            },
          };
        });

        setItems(mappedItems);
        setSummary(calculateSummary(mappedItems));
        return;
      }

      // Logged-in mode: Read from server
      let res;
      try {
        res = await axiosAuthInstance.get("/v1/cart");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          res = await axiosAuthInstance.get("/api/v1/cart");
        } else {
          throw err;
        }
      }

      const data = res?.data?.data || res?.data;
      const rawList: any[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];

      const mappedList: DrawerCartItem[] = rawList.map((it: any) => {
        const book = it.book || {};
        const bId = it.bookId ?? book.id ?? it.id;
        const qty = Number(it.quantity) || 1;
        const uPrice = Number(it.unitPrice || it.price || book.price || 0);
        const oPrice = Number(it.originalPrice || book.price || uPrice);
        const dPercent = Number(it.discountPercent || book.discountPercent || 0);
        const iTotal = Number(it.itemTotal) || uPrice * qty;
        const oTotal = Number(it.originalTotal) || oPrice * qty;

        const coverImg =
          book.images?.find((img: any) => img.type === "COVER")?.url ||
          book.images?.[0]?.url ||
          it.coverImage ||
          null;

        const authorName =
          book.authors?.[0]?.name ||
          book.author?.name ||
          it.author ||
          "";

        return {
          id: it.id || `item-${bId}`,
          bookId: bId,
          title: book.title || it.title || "Book",
          author: authorName,
          price: uPrice,
          originalPrice: oPrice,
          discountPercent: dPercent,
          quantity: qty,
          coverImage: coverImg,
          stock: Number(book.stock || 500),
          itemTotal: iTotal,
          originalTotal: oTotal,
          book: {
            id: bId,
            title: book.title || it.title || "Book",
            stock: Number(book.stock || 500),
            images: coverImg ? [{ url: coverImg, type: "COVER" }] : [],
          },
        };
      });

      setItems(mappedList);
      setSummary(calculateSummary(mappedList));
      if (mappedList.length === 0 && typeof window !== "undefined") {
        localStorage.removeItem("nepsole_cart");
        localStorage.removeItem("nepsole_cart_count");
        window.dispatchEvent(new Event(CART_CHANGE_EVENT));
      }
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleOpenDrawer = () => {
      setIsOpen(true);
      fetchDrawerCart();
    };

    const handleCartChanged = () => {
      if (isOpen) {
        fetchDrawerCart();
      }
    };

    window.addEventListener(OPEN_CART_DRAWER_EVENT, handleOpenDrawer);
    window.addEventListener(CART_CHANGE_EVENT, handleCartChanged);

    return () => {
      window.removeEventListener(OPEN_CART_DRAWER_EVENT, handleOpenDrawer);
      window.removeEventListener(CART_CHANGE_EVENT, handleCartChanged);
    };
  }, [isOpen, fetchDrawerCart]);

  const updateGuestStorage = (updatedItems: DrawerCartItem[]) => {
    if (typeof window === "undefined") return;
    const localCart = updatedItems.map((it) => ({
      id: it.id,
      bookId: it.bookId,
      title: it.title,
      author: it.author,
      price: it.price,
      originalPrice: it.originalPrice,
      discountPercent: it.discountPercent,
      quantity: it.quantity,
      coverImage: it.coverImage,
      format: "Paperback",
      stock: it.stock || 500,
    }));
    localStorage.setItem("nepsole_cart", JSON.stringify(localCart));
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  };

  const handleUpdateQuantity = async (item: DrawerCartItem, delta: number) => {
    const currentQty = Number(item.quantity) || 1;
    const maxStock = Number(item.stock || 500);
    const finalQty = currentQty + delta;
    if (finalQty < 1 || finalQty > maxStock) return;

    const user = await getUserCookie();
    const isGuest = !user?.accessToken;

    if (isGuest) {
      const updated = items.map((it) => {
        if (it.id === item.id) {
          const itemTotal = it.price * finalQty;
          const originalTotal = it.originalPrice * finalQty;
          return {
            ...it,
            quantity: finalQty,
            itemTotal,
            originalTotal,
          };
        }
        return it;
      });
      setItems(updated);
      setSummary(calculateSummary(updated));
      updateGuestStorage(updated);
      return;
    }

    // Optimistic update for logged in user
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === item.id) {
          const itemTotal = it.price * finalQty;
          const originalTotal = it.originalPrice * finalQty;
          return {
            ...it,
            quantity: finalQty,
            itemTotal,
            originalTotal,
          };
        }
        return it;
      })
    );

    const timerKey = String(item.id);
    if (debounceTimersRef.current[timerKey]) {
      clearTimeout(debounceTimersRef.current[timerKey]);
    }

    debounceTimersRef.current[timerKey] = setTimeout(async () => {
      setUpdatingId(item.id);
      try {
        try {
          await axiosAuthInstance.patch("/v1/cart/quantity", {
            bookId: Number(item.bookId) || item.bookId,
            quantity: finalQty,
          });
        } catch (err: any) {
          if (err?.response?.status === 404) {
            await axiosAuthInstance.patch("/api/v1/cart/quantity", {
              bookId: Number(item.bookId) || item.bookId,
              quantity: finalQty,
            });
          } else {
            throw err;
          }
        }
        window.dispatchEvent(new Event(CART_CHANGE_EVENT));
        await fetchDrawerCart();
      } catch (err: any) {
        console.error("Failed to update cart quantity:", err);
        toast.error("Failed to update quantity.");
        await fetchDrawerCart();
      } finally {
        setUpdatingId(null);
      }
    }, 350);
  };

  const handleRemoveItem = async (item: DrawerCartItem) => {
    setRemovingId(item.id);
    try {
      const user = await getUserCookie();
      const isGuest = !user?.accessToken;

      if (isGuest) {
        const updated = items.filter((it) => it.id !== item.id);
        setItems(updated);
        setSummary(calculateSummary(updated));
        updateGuestStorage(updated);
        toast.success(`Removed "${item.title}" from cart`);
        return;
      }

      setItems((prev) => prev.filter((it) => it.id !== item.id));
      if (item.book) {
        updateLocalStorageItem(item.book, 0);
      }

      try {
        await axiosAuthInstance.delete(`/v1/cart/${item.bookId}`);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          await axiosAuthInstance.delete(`/api/v1/cart/${item.bookId}`);
        } else {
          throw err;
        }
      }

      toast.success(`Removed "${item.title}" from cart`);
      window.dispatchEvent(new Event(CART_CHANGE_EVENT));
      await fetchDrawerCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
      toast.error("Failed to remove item.");
      await fetchDrawerCart();
    } finally {
      setRemovingId(null);
    }
  };

  const totalCount =
    summary?.totalQuantity ??
    items.reduce((acc, it) => acc + (it.quantity || 1), 0);

  const handleProceedToCheckout = () => {
    setIsOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && setIsOpen(false)}>
        <DialogContent
          showCloseButton={false}
          className="
            w-[96vw]
            sm:w-[94vw]
            md:w-[90vw]
            max-w-2xl
            lg:max-w-3xl
            p-0
            gap-0
            overflow-hidden
            rounded-2xl
            sm:rounded-3xl
            border border-slate-200/90
            bg-white
            shadow-[0_24px_80px_rgba(15,37,87,0.2)]
            max-h-[92vh]
            sm:max-h-[88vh]
            flex flex-col
          "
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0F2557] via-[#153e8a] to-[#1749A0] px-5 sm:px-7 py-4 text-white flex items-center justify-between shrink-0 shadow-sm relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-base sm:text-lg font-bold text-white tracking-tight">
                    Shopping Cart
                  </DialogTitle>
                  {totalCount > 0 && (
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/20 text-white">
                      {totalCount} {totalCount === 1 ? "Book" : "Books"}
                    </span>
                  )}
                </div>
                <DialogDescription className="text-xs text-blue-100/85 mt-0.5">
                  Review selected books and proceed to order
                </DialogDescription>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              aria-label="Close cart dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
            {isLoading && items.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-7 h-7 animate-spin text-[#1749A0] mb-2" />
                <p className="text-xs font-medium text-slate-500">
                  Loading cart items...
                </p>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 sm:py-20 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#1749A0] flex items-center justify-center mb-4 border border-blue-100">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Your Cart is Empty
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Browse our curated books collection to add items to your cart.
                </p>
                <Link
                  href="/books"
                  onClick={() => setIsOpen(false)}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1749A0] hover:bg-[#0F2557] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Explore Catalog</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => {
                  const isUpdating = updatingId === item.id;
                  const isRemoving = removingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-shadow flex gap-3.5 relative"
                    >
                      {/* Book Cover Thumbnail */}
                      <div className="w-16 h-22 sm:w-20 sm:h-26 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100 flex items-center justify-center p-0.5 relative">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt={item.title}
                            className="max-h-full max-w-full object-contain rounded"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <BookOpen className="w-6 h-6" />
                            <span className="text-[7px] font-bold uppercase mt-0.5">
                              Book
                            </span>
                          </div>
                        )}

                        {item.discountPercent > 0 && (
                          <span className="absolute top-1 left-1 bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-2xs">
                            -{item.discountPercent}%
                          </span>
                        )}
                      </div>

                      {/* Info & Quantity */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                                {item.title}
                              </h4>
                              {item.author && (
                                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                                  by <span className="font-medium text-slate-700">{item.author}</span>
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item)}
                              disabled={isRemoving}
                              className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer shrink-0 disabled:opacity-40"
                              title="Remove item"
                            >
                              {isRemoving ? (
                                <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 mt-2">
                          {/* Stepper */}
                          <div className="inline-flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item, -1)}
                              disabled={item.quantity <= 1 || isUpdating}
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition cursor-pointer"
                              title="Decrease"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-bold text-slate-900 min-w-[22px] text-center select-none">
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
                                item.quantity >= Number(item.stock || 500) ||
                                isUpdating
                              }
                              className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition cursor-pointer"
                              title="Increase"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Total Price for this item */}
                          <div className="text-right">
                            <p className="text-sm font-extrabold text-slate-900">
                              Rs. {item.itemTotal.toLocaleString()}
                            </p>
                            {item.originalTotal > item.itemTotal && (
                              <p className="text-[11px] text-slate-400 line-through">
                                Rs. {item.originalTotal.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Summary & Action */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t border-slate-200/90 space-y-3 shrink-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-4 text-slate-600">
                  <div>
                    <span>Subtotal: </span>
                    <span className="font-semibold text-slate-900">
                      Rs. {Math.round(summary?.subtotal || 0).toLocaleString()}
                    </span>
                  </div>
                  {Number(summary?.totalDiscount || 0) > 0 && (
                    <div className="text-emerald-600 font-bold">
                      Savings: -Rs.{" "}
                      {Math.round(summary?.totalDiscount || 0).toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Total:
                  </span>
                  <span className="text-lg sm:text-xl font-black text-[#0F2557]">
                    Rs. {Math.round(summary?.grandTotal || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Continue Shopping
                </button>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="px-6 py-2.5 sm:py-3 bg-[#1749A0] hover:bg-[#0F2557] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-md shadow-blue-900/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order Now & Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog Modal */}
      <CheckoutDialog
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={items.map((it) => ({
          id: it.id,
          bookId: it.bookId,
          quantity: it.quantity,
          unitPrice: it.price,
          originalPrice: it.originalPrice,
          itemTotal: it.itemTotal,
          book: it.book,
        }))}
        summary={summary}
        onOrderSuccess={() => {
          fetchDrawerCart();
          setIsCheckoutOpen(false);
        }}
      />
    </>
  );
}
export { CartDrawer as CartDialog };
