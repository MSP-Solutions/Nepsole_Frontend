"use client";

import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
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
import HeaderCart from "@/components/HeaderCart";

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
    fetchWishlistCount();

    const handleAuthChange = () => {
      loadUser();
      fetchWishlistCount();
    };

    const handleWishlistChange = () => {
      fetchWishlistCount();
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    window.addEventListener(CART_CHANGE_EVENT, handleWishlistChange);
    window.addEventListener("focus", handleWishlistChange);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      window.removeEventListener(CART_CHANGE_EVENT, handleWishlistChange);
      window.removeEventListener("focus", handleWishlistChange);
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
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-[1440px] items-center gap-2 px-3 sm:px-5 md:px-6 lg:min-h-[82px] lg:gap-5 lg:px-8 xl:px-10">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden sm:h-[68px] sm:w-[68px] lg:h-[76px] lg:w-[76px] xl:h-[82px] xl:w-[82px]">
            <Image
              src="/logobg.jpg"
              alt="Logo"
              width={600}
              height={600}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </Link>

        {/* Desktop Search */}
        <div className="hidden min-w-0 max-w-[760px] flex-1 sm:flex mx-auto px-2 lg:px-10">
          <HeaderSearch />
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 lg:gap-2 xl:gap-3">
          {/* Wishlist */}
          <Link
            href="/user/wishlist"
            title="My Wishlist"
            className="group relative flex h-10 items-center justify-center rounded-xl px-2 text-gray-700 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 sm:px-2.5 lg:h-11 lg:gap-2 lg:px-3"
          >
            <div className="relative flex items-center justify-center">
              <Heart
                size={20}
                strokeWidth={1.7}
                className="transition-transform duration-200 group-hover:scale-105"
              />

              {wishlistCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-sm">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </div>

            <span className="hidden text-xs font-semibold lg:block">
              Wishlist
            </span>
          </Link>

          {/* Cart */}
          <div className="flex items-center">
            <HeaderCart />
          </div>

          {/* Account */}
          {isLoaded && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 items-center rounded-xl p-1.5 text-left transition-all duration-200 hover:bg-gray-100 focus:outline-none sm:h-11 lg:gap-2 lg:px-1.5"
                >
                  {/* Avatar */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1749A0] text-[10px] font-bold text-white shadow-sm sm:h-9 sm:w-9">
                    {userInitials}
                  </div>

                  {/* User Info */}
                  <div className="hidden max-w-[130px] leading-tight lg:block xl:max-w-[160px]">
                    <p className="truncate text-[10px] text-gray-500">
                      Welcome back,
                    </p>

                    <p className="truncate text-xs font-bold text-gray-900">
                      {userName}
                    </p>
                  </div>

                  <ChevronDown
                    size={13}
                    className="hidden text-gray-400 lg:block"
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="z-50 w-60 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl"
              >
                {/* User Info */}
                <div className="mb-1 border-b border-gray-100 px-3 py-2.5">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {userName}
                  </p>

                  {user.email && (
                    <p className="mt-0.5 truncate text-[11px] text-gray-500">
                      {user.email}
                    </p>
                  )}

                  {isAdmin && (
                    <span className="mt-1.5 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                      Admin
                    </span>
                  )}
                </div>

                <DropdownMenuItem asChild>
                  <Link
                    href={dashboardLink}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    <LayoutDashboard className="h-4 w-4 text-gray-500" />
                    <span>{isAdmin ? "Admin Dashboard" : "Dashboard"}</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="flex h-10 items-center gap-2 rounded-xl px-2 transition-colors hover:bg-gray-100 hover:text-[#1749A0] sm:px-2.5 lg:h-11 lg:px-3"
            >
              <UserRound
                size={19}
                strokeWidth={1.6}
                className="text-gray-600"
              />

              <div className="hidden leading-tight lg:block">
                <p className="text-[10px] text-gray-500">Login / Register</p>

                <p className="text-xs font-semibold text-gray-900">
                  My Account
                </p>
              </div>
            </Link>
          )}

          {/* Mobile / Tablet Menu */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-700 transition-colors hover:bg-gray-100 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
      <div className="border-t border-gray-100 px-3 py-2.5 sm:px-5 md:px-6 lg:hidden">
        <HeaderSearch isMobile />
      </div>
      <div className="hidden border-t border-gray-100 bg-gray-50/80 lg:block">
        <div className="mx-auto flex h-11 max-w-[1440px] items-center gap-4 px-8 xl:px-10">
          {/* Browse Genre */}
          <button
            type="button"
            className="flex h-8 w-[200px] shrink-0 items-center gap-2 rounded-lg bg-[#0F2557] px-3.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#1749A0]"
          >
            <Menu size={14} />

            <span>Browse Genre</span>

            <ChevronDown className="ml-auto" size={12} />
          </button>

          {/* Navigation */}
          <nav className="flex h-full items-center">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative flex h-full items-center px-4 text-xs font-medium transition-colors ${
                    active
                      ? "font-semibold text-[#1749A0]"
                      : "text-gray-700 hover:text-[#1749A0]"
                  }`}
                >
                  {link.name}

                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-[#1749A0]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-3 py-3 shadow-lg sm:px-5 md:px-6 lg:hidden">
          {/* Logged In User */}
          {user ? (
            <div className="mb-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1749A0] text-xs font-bold text-white">
                  {userInitials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {userName}
                  </p>

                  {user.email && (
                    <p className="truncate text-[11px] text-gray-500">
                      {user.email}
                    </p>
                  )}

                  {isAdmin && (
                    <span className="mt-1 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-800">
                      Admin
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-200 pt-3">
                <Link
                  href={dashboardLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>

                <Link
                  href={ordersLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-[11px] font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <ShoppingBag size={14} />
                  Orders
                </Link>

                <Link
                  href="/user/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-[11px] font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <Heart size={14} />
                  Wishlist
                </Link>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-[11px] font-semibold text-rose-600 transition-colors hover:bg-rose-50"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-[#0F2557]"
            >
              <UserRound size={15} />
              Login / Register
            </Link>
          )}
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl bg-[#0F2557] px-3.5 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#1749A0]"
          >
            <span className="flex items-center gap-2">
              <Menu size={15} />
              Browse Genre
            </span>

            <ChevronDown size={14} />
          </button>
          <nav className="mt-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center border-b border-gray-100 py-3.5 text-sm font-medium transition-colors last:border-0 ${
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
