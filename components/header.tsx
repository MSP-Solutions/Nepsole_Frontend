"use client";

import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  AUTH_CHANGE_EVENT,
  CART_CHANGE_EVENT,
  clearCookies,
  getUserCookie,
  getUserDisplayName,
  getUserInitials,
  UserCookie,
} from "@/utils/cookies";
import HeaderSearch from "@/components/HeaderSearch";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Books", href: "/books" },
  { name: "Authors", href: "/authors" },
  { name: "Publishers", href: "/publishers" },
  { name: "E-Books", href: "/eBooks" },
];

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserCookie | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const pathname = usePathname();
  const router = useRouter();

  const loadUser = async () => {
    try {
      const cookieUser = await getUserCookie();
      setUser(cookieUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  };

  const fetchCartCount = async () => {
    try {
      const cookieUser = await getUserCookie();

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
  };

  const fetchWishlistCount = async () => {
    try {
      const cookieUser = await getUserCookie();

      if (!cookieUser?.accessToken) {
        setWishlistCount(0);
        return;
      }

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

      const data = res?.data?.data || res?.data || [];
      const count = Array.isArray(data)
        ? data.length
        : data?.count || data?.total || 0;

      setWishlistCount(Number(count) || 0);
    } catch {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    loadUser();
    fetchCartCount();
    fetchWishlistCount();

    const handleAuthChange = () => {
      loadUser();
      fetchCartCount();
      fetchWishlistCount();
    };

    const handleCartChange = () => {
      fetchCartCount();
      fetchWishlistCount();
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener(CART_CHANGE_EVENT, handleCartChange);
    window.addEventListener("focus", handleCartChange);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener(CART_CHANGE_EVENT, handleCartChange);
      window.removeEventListener("focus", handleCartChange);
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await clearCookies();
      setUser(null);
      setIsMobileMenuOpen(false);

      toast.success("Logged out successfully");

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isLinkActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const userName = user ? getUserDisplayName(user) : "";
  const userInitials = user ? getUserInitials(userName) : "";

  const isAdmin = user?.role === "ADMIN" || user?.role === "ROLE_ADMIN";

  const dashboardLink = isAdmin ? "/admin/dashboard" : "/user/dashboard";

  const ordersLink = isAdmin ? "/admin/orders" : "/user/orders";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
      {/* Main Header */}
      <div className="mx-auto flex min-h-[60px] max-w-[1440px] items-center justify-between gap-3 sm:gap-4 lg:gap-6 px-3 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Link href="/" className="shrink-0 transition-opacity hover:opacity-90">
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 lg:h-15 lg:w-15">
            <Image
              src="/logo.jpg"
              alt="Logo"
              fill
              priority
              sizes="64px"
              className="object-contain"
            />
          </div>
        </Link>

        {/* Center: Desktop Search (Centered with responsive max width) */}
        <div className="hidden min-w-0 max-w-[620px] flex-1 sm:flex mx-auto px-2 lg:px-6">
          <HeaderSearch />
        </div>

        {/* Right Actions */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-2.5 lg:gap-3.5">
          {/* Wishlist */}
          <Link
            href="/user/wishlist"
            className="relative flex items-center gap-1.5 rounded-xl p-2 text-gray-700 transition-colors hover:bg-rose-50/80 hover:text-rose-600"
            title="My Wishlist"
          >
            <div className="relative flex items-center justify-center">
              <Heart size={19} strokeWidth={1.7} />

              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-bold text-white shadow-2xs">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </div>

            <span className="hidden text-xs font-semibold md:inline">
              Wishlist
            </span>
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 rounded-xl p-2 text-gray-700 transition-colors hover:bg-indigo-50/80 hover:text-[#1749A0]"
            title="Shopping Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart size={19} strokeWidth={1.7} />

              <span className="absolute -right-2 -top-2 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#1749A0] px-1 text-[8px] font-bold text-white shadow-2xs">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </div>

            <span className="hidden text-xs font-semibold md:inline">Cart</span>
          </Link>

          {/* Account */}
          {isLoaded && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl p-1.5 text-left transition-colors hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1749A0] text-xs font-bold text-white shadow-2xs">
                    {userInitials}
                  </div>

                  <div className="hidden max-w-[120px] leading-tight md:block">
                    <p className="truncate text-[10px] text-gray-500">
                      Welcome back,
                    </p>
                    <p className="truncate text-xs font-bold text-gray-900">
                      {userName}
                    </p>
                  </div>

                  <ChevronDown
                    size={12}
                    className="hidden text-gray-500 md:block"
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="z-50 w-56 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl"
              >
                {/* User Info */}
                <div className="mb-1 border-b border-gray-100 px-3 py-2">
                  <p className="truncate text-xs font-bold text-gray-900">
                    {userName}
                  </p>

                  {user.email && (
                    <p className="mt-0.5 truncate text-[11px] text-gray-500">
                      {user.email}
                    </p>
                  )}

                  {isAdmin && (
                    <span className="mt-1 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                      Admin
                    </span>
                  )}
                </div>

                <DropdownMenuItem asChild>
                  <Link
                    href={dashboardLink}
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <LayoutDashboard className="h-4 w-4 text-gray-500" />
                    <span>{isAdmin ? "Admin Dashboard" : "Dashboard"}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-xl p-2 transition-colors hover:bg-gray-50 hover:text-[#1749A0]"
            >
              <UserRound
                size={18}
                strokeWidth={1.6}
                className="text-gray-600"
              />

              <div className="hidden leading-tight md:block">
                <p className="text-[10px] text-gray-500">Login / Register</p>
                <p className="text-xs font-semibold text-gray-900">
                  My Account
                </p>
              </div>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="border-t border-gray-100 px-3 py-2 sm:hidden">
        <HeaderSearch isMobile />
      </div>

      {/* Desktop Navigation */}
      <div className="hidden border-t border-gray-100 bg-gray-50/70 md:block">
        <div className="mx-auto flex h-9 max-w-[1400px] items-center gap-3 px-4 lg:px-6">
          {/* Browse Genre */}
          <button
            type="button"
            className="flex h-7 w-[190px] shrink-0 items-center gap-2 rounded bg-[#0F2557] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#1749A0]"
          >
            <Menu size={13} />
            <span>Browse Genre</span>
            <ChevronDown className="ml-auto" size={11} />
          </button>

          {/* Navigation */}
          <nav className="flex h-full items-center">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex h-full items-center px-3 text-xs font-medium transition-colors ${
                    active
                      ? "border-b-2 border-[#1749A0] font-semibold text-[#1749A0]"
                      : "text-gray-700 hover:text-[#1749A0]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-3 py-3 shadow-lg md:hidden">
          {/* User */}
          {user ? (
            <div className="mb-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1749A0] text-xs font-bold text-white">
                  {userInitials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-gray-900">
                    {userName}
                  </p>

                  {user.email && (
                    <p className="truncate text-[11px] text-gray-500">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-200 pt-3">
                <Link
                  href={dashboardLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <LayoutDashboard size={13} />
                  Dashboard
                </Link>

                <Link
                  href={ordersLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <ShoppingBag size={13} />
                  Orders
                </Link>

                <Link
                  href="/user/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Heart size={13} />
                  Wishlist
                </Link>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
              >
                <LogOut size={13} />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2.5 text-xs font-bold text-white"
            >
              <UserRound size={15} />
              Login / Register
            </Link>
          )}

          {/* Browse Genre */}
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg bg-[#0F2557] px-3 py-2.5 text-xs font-semibold text-white"
          >
            <span className="flex items-center gap-2">
              <Menu size={14} />
              Browse Genre
            </span>

            <ChevronDown size={14} />
          </button>

          {/* Mobile Links */}
          <nav className="mt-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center border-b border-gray-100 py-3 text-xs font-medium transition-colors last:border-0 ${
                    active
                      ? "font-semibold text-[#1749A0]"
                      : "text-gray-700 hover:text-[#1749A0]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
