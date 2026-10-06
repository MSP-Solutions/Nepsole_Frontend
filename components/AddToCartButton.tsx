"use client";

import {
  addToCartInitialApi,
  getLocalCartMap,
  removeCartItemApi,
  updateCartQuantityApi,
  updateLocalStorageItem,
} from "@/utils/cartState";
import {
  AUTH_CHANGE_EVENT,
  CART_CHANGE_EVENT,
  getUserCookie,
  openAuthModal,
} from "@/utils/cookies";
import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export interface AddToCartButtonProps {
  book: any;
  className?: string;
  variant?: "card" | "detail";
  isOutOfStock?: boolean;
  initialAddQuantity?: number;
  onQuantityChange?: (newQuantity: number) => void;
}

export default function AddToCartButton({
  book,
  className = "",
  variant = "card",
  isOutOfStock = false,
  initialAddQuantity = 1,
  onQuantityChange,
}: AddToCartButtonProps) {
  const bookId = book?.id ?? book?.bookId;
  const [quantity, setQuantity] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingQtyRef = useRef<number | null>(null);

  // Sync quantity from local cart storage & server
  const checkCurrentQuantity = useCallback(() => {
    if (!bookId) return;
    const map = getLocalCartMap();
    const currentQty = map[String(bookId)] || 0;
    setQuantity(currentQty);
    onQuantityChange?.(currentQty);
  }, [bookId, onQuantityChange]);

  useEffect(() => {
    checkCurrentQuantity();

    const handleCartOrAuthChange = () => {
      checkCurrentQuantity();
    };

    if (typeof window !== "undefined") {
      window.addEventListener(CART_CHANGE_EVENT, handleCartOrAuthChange);
      window.addEventListener(AUTH_CHANGE_EVENT, handleCartOrAuthChange);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(CART_CHANGE_EVENT, handleCartOrAuthChange);
        window.removeEventListener(AUTH_CHANGE_EVENT, handleCartOrAuthChange);
      }
    };
  }, [checkCurrentQuantity]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Initial Add to Cart
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isUpdating) return;

    try {
      setIsUpdating(true);
      const addQty = Math.max(1, initialAddQuantity || 1);
      
      const user = await getUserCookie();
      if (!user?.accessToken) {
        // Guest mode: Save locally in localStorage
        setQuantity(addQty);
        updateLocalStorageItem(book, addQty);
        onQuantityChange?.(addQty);
        toast.dismiss();
        toast.success(
          addQty > 1
            ? `Added ${addQty} copies of "${book.title || "Book"}" to cart!`
            : `"${book.title || "Book"}" added to cart!`,
        );
        return;
      }

      // Logged-in mode
      setQuantity(addQty);
      updateLocalStorageItem(book, addQty);
      onQuantityChange?.(addQty);

      await addToCartInitialApi(bookId, addQty);
      toast.dismiss();
      toast.success(
        addQty > 1
          ? `Added ${addQty} copies of "${book.title || "Book"}" to cart!`
          : `"${book.title || "Book"}" added to cart!`,
      );
    } catch (err: any) {
      console.error("Add to cart error:", err);
      // Revert
      setQuantity(0);
      updateLocalStorageItem(book, 0);
      onQuantityChange?.(0);
      toast.dismiss();
      toast.error(
        err?.response?.data?.message || "Failed to add book to cart.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Debounced quantity changer for + and -
  const sendQuantityUpdate = (finalQty: number) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    pendingQtyRef.current = finalQty;

    debounceTimerRef.current = setTimeout(async () => {
      const targetQty = pendingQtyRef.current ?? finalQty;

      try {
        const user = await getUserCookie();
        if (!user?.accessToken) {
          // Guest mode: localStorage is already updated in handleIncrement / handleDecrement
          if (targetQty <= 0) {
            toast.dismiss();
            toast.success(`Removed "${book.title || "Book"}" from cart`);
          }
          return;
        }

        if (targetQty <= 0) {
          await removeCartItemApi(bookId);
          toast.dismiss();
          toast.success(`Removed "${book.title || "Book"}" from cart`);
        } else {
          // Send { bookId: 14, quantity: 2 } to /api/v1/cart/quantity
          await updateCartQuantityApi(bookId, targetQty);
        }
      } catch (err: any) {
        console.error("Failed to update cart quantity:", err);
        toast.dismiss();
        toast.error(
          err?.response?.data?.message || "Failed to update quantity.",
        );
      } finally {
        setIsUpdating(false);
        pendingQtyRef.current = null;
      }
    }, 300);
  };

  const handleIncrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const maxStock = Number(book.stock) || 500;
    if (quantity >= maxStock) {
      toast.error(`Only ${maxStock} copies available in stock`);
      return;
    }

    const nextQty = quantity + 1;
    setQuantity(nextQty);
    updateLocalStorageItem(book, nextQty);
    onQuantityChange?.(nextQty);
    sendQuantityUpdate(nextQty);
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextQty = quantity - 1;
    setQuantity(Math.max(0, nextQty));
    updateLocalStorageItem(book, Math.max(0, nextQty));
    onQuantityChange?.(Math.max(0, nextQty));
    sendQuantityUpdate(nextQty);
  };

  // ─── Variant: Book Detail Page ───────────────────────────────────────────────
  if (variant === "detail") {
    if (quantity > 0) {
      return (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`w-full h-10 px-2 rounded-xl bg-white border-2 border-slate-900 text-slate-900 font-bold flex items-center justify-between shadow-xs select-none transition-all duration-150 ${className}`}
        >
          <button
            type="button"
            title="Decrease quantity"
            aria-label="Decrease quantity"
            onClick={handleDecrement}
            disabled={isUpdating}
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 hover:text-slate-950 flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Minus size={15} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-slate-900">
            <ShoppingCart className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{quantity} in Cart</span>
          </div>

          <button
            type="button"
            title="Increase quantity"
            aria-label="Increase quantity"
            onClick={handleIncrement}
            disabled={
              isUpdating ||
              (Boolean(book.stock) && quantity >= Number(book.stock))
            }
            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 hover:text-slate-950 flex items-center justify-center transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus size={15} strokeWidth={2.5} />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        disabled={isOutOfStock || isUpdating}
        onClick={handleAddToCart}
        className={`w-full h-10 bg-slate-900 hover:bg-[#1749A0] active:scale-[0.98] font-bold text-white rounded-xl transition-all duration-150 shadow-xs text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {isUpdating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Adding to Cart...</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </>
        )}
      </button>
    );
  }

  // ─── Variant: Compact Card Button ──────────────────────────────────────────
  if (quantity > 0) {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className={`w-full h-8 sm:h-8.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-slate-900 text-xs font-bold flex items-center justify-between p-1 shadow-2xs select-none transition-all duration-150 ${className}`}
      >
        <button
          type="button"
          title="Decrease quantity"
          aria-label="Decrease quantity"
          onClick={handleDecrement}
          disabled={isUpdating}
          className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-700 hover:text-slate-950 flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus size={13} strokeWidth={2.5} />
        </button>

        <div className="flex items-center justify-center gap-1.5 px-1 min-w-0 flex-1 text-center font-bold">
          <span className="font-black text-xs sm:text-[13px] text-slate-950 leading-none">
            {quantity}
          </span>
          <span className="text-[10px] font-medium text-slate-500 leading-none hidden min-[400px]:inline truncate">
            in cart
          </span>
          <ShoppingCart size={11} className="text-slate-400 shrink-0 min-[400px]:hidden" />
        </div>

        <button
          type="button"
          title="Increase quantity"
          aria-label="Increase quantity"
          onClick={handleIncrement}
          disabled={
            isUpdating || (Boolean(book.stock) && quantity >= Number(book.stock))
          }
          className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:scale-90 text-slate-700 hover:text-slate-950 flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={13} strokeWidth={2.5} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isOutOfStock || isUpdating}
      className={`w-full h-8 sm:h-8.5 rounded-xl bg-slate-900 hover:bg-[#1749A0] active:scale-[0.98] text-white text-[11px] font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isUpdating ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <>
          <ShoppingCart size={12} className="shrink-0" />
          <span className="truncate">Add to Cart</span>
        </>
      )}
    </button>
  );
}
