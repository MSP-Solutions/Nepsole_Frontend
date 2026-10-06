"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  CART_CHANGE_EVENT,
  getUserCookie,
  openCartDrawer,
  UserCookie,
} from "@/utils/cookies";
import { getLocalCartMap } from "@/utils/cartState";

interface HeaderCartProps {
  className?: string;
  showLabel?: boolean;
  iconSize?: number;
  user?: UserCookie | null;
}

const HeaderCart = ({
  className = "",
  showLabel = true,
  iconSize = 19,
  user: initialUser,
}: HeaderCartProps) => {
  const router = useRouter();
  const [cartCount, setCartCount] = useState<number>(0);
  const [user, setUser] = useState<UserCookie | null>(initialUser || null);
  const hasMountedRef = useRef(false);

  // Sync count from local storage without any API call
  const updateCountFromStorage = useCallback(() => {
    const map = getLocalCartMap();
    const count = Object.values(map).filter((q) => q > 0).length;
    setCartCount(count);
  }, []);

  const fetchServerCartCount = useCallback(async () => {
    try {
      const cookieUser = await getUserCookie();
      setUser(cookieUser);

      if (!cookieUser?.accessToken) {
        updateCountFromStorage();
        return;
      }

      const res = await axiosAuthInstance.get("/v1/cart/count");
      const data = res?.data;

      const count =
        data?.data?.distinctItems ??
        data?.distinctItems ??
        data?.data?.count ??
        data?.count;

      if (count !== undefined && count !== null) {
        setCartCount(Number(count) || 0);
      } else {
        updateCountFromStorage();
      }
    } catch {
      updateCountFromStorage();
    }
  }, [updateCountFromStorage]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      fetchServerCartCount();
    }

    const handleCartChange = () => {
      // Instantly update badge count from local storage (NO API call!)
      updateCountFromStorage();
    };

    window.addEventListener(CART_CHANGE_EVENT, handleCartChange);

    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, handleCartChange);
    };
  }, [fetchServerCartCount, updateCountFromStorage]);

  const handleCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const cookieUser = await getUserCookie();
    if (cookieUser?.accessToken) {
      router.push("/user/cart");
    } else {
      openCartDrawer();
    }
  };

  return (
    <button
      type="button"
      onClick={handleCartClick}
      className={`relative flex items-center gap-1.5 rounded-xl p-2 sm:px-2.5 sm:py-2 text-gray-700 transition-colors hover:bg-indigo-50/80 hover:text-[#1749A0] cursor-pointer ${className}`}
      title="Shopping Cart"
      aria-label="Open Shopping Cart"
    >
      <div className="relative flex items-center justify-center">
        <ShoppingCart size={iconSize} strokeWidth={1.7} />

        {cartCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#1749A0] px-1 text-[8px] font-bold text-white shadow-2xs">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </div>

      {showLabel && (
        <span className="hidden text-xs font-semibold md:inline">Cart</span>
      )}
    </button>
  );
};

export default HeaderCart;
