"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  AUTH_CHANGE_EVENT,
  CART_CHANGE_EVENT,
  getUserCookie,
  UserCookie,
} from "@/utils/cookies";

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
  const [cartCount, setCartCount] = useState<number>(0);
  const [user, setUser] = useState<UserCookie | null>(initialUser || null);
  const pathname = usePathname();
  const router = useRouter();

  const fetchCartCount = useCallback(async () => {
    try {
      const cookieUser = await getUserCookie();
      setUser(cookieUser);

      if (!cookieUser?.accessToken) {
        setCartCount(0);
        return;
      }

      const res = await axiosAuthInstance.get("/v1/cart/count");
      const data = res?.data;

      const count =
        data?.data?.distinctItems ??
        data?.distinctItems ??
        data?.data?.count ??
        data?.count ??
        0;

      setCartCount(Number(count) || 0);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleCartUpdate);
    window.addEventListener(CART_CHANGE_EVENT, handleCartUpdate);
    window.addEventListener("focus", handleCartUpdate);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleCartUpdate);
      window.removeEventListener(CART_CHANGE_EVENT, handleCartUpdate);
      window.removeEventListener("focus", handleCartUpdate);
    };
  }, [fetchCartCount, pathname]);

  const handleCartClick = async (e: React.MouseEvent) => {
    const cookieUser = user || (await getUserCookie());
    if (!cookieUser?.accessToken) {
      e.preventDefault();
      toast.dismiss();
      toast.error("Please log in to view your cart");
      router.push("/login");
    }
  };

  return (
    <Link
      href={user ? "/cart" : "/login"}
      onClick={handleCartClick}
      className={`relative flex items-center gap-1.5 rounded-xl p-2 sm:px-2.5 sm:py-2 text-gray-700 transition-colors hover:bg-indigo-50/80 hover:text-[#1749A0] ${className}`}
      title="Shopping Cart"
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
    </Link>
  );
};

export default HeaderCart;
