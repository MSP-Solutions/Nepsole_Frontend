"use client";

import {
  ChevronDown,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  UserRound,
  X,
  BookOpen,
  Sparkles,
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
  DropdownMenuSeparator,
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
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/95 shadow-xs backdrop-blur-md transition-all">
      {/* Primary Header Row */}
      <div className="mx-auto flex h-16 sm:h-[72px] lg:h-[76px] w-full max-w-[1440px] items-center justify-between gap-3 px-3 sm:px-5 md:px-6 lg:px-8 xl:px-10">
        {/* Left: Brand Logo */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
        >
          <div className="relative flex h-11 w-11 sm:h-14 sm:w-16 lg:h-16 lg:w-26 items-center justify-center overflow-hidden">
            <Image
              src="/logobg.jpg"
              alt="Nepsole Logo"
              width={500}
              height={500}
              priority
              className="h-full w-full object-contain"
            />
          </div>
        </Link>

        {/* Center: Desktop & Tablet Search Bar */}
        <div className="hidden min-w-0 max-w-2xl flex-1 md:flex mx-auto px-4 lg:px-8">
          <HeaderSearch />
        </div>

        {/* Right: Actions (Wishlist, Cart, User Account, Mobile Toggle) */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-2.5">
          {/* Wishlist Button */}
          <Link
            href="/user/wishlist"
            title="My Wishlist"
            className="group relative flex h-10 items-center justify-center rounded-xl px-2.5 text-slate-700 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600 sm:px-3 lg:gap-2"
          >
            <div className="relative flex items-center justify-center">
              <Heart
                size={20}
                strokeWidth={1.8}
                className="transition-transform duration-200 group-hover:scale-110"
              />

              {wishlistCount > 0 && (
                <span className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs animate-in zoom-in-50 duration-150">
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </div>

            <span className="hidden text-xs font-semibold lg:block">
              Wishlist
            </span>
          </Link>

          {/* Cart Popover / Link */}
          <div className="flex items-center">
            <HeaderCart />
          </div>

          {/* Vertical Divider on Desktop */}
          <div className="hidden h-6 w-px bg-slate-200 lg:block mx-1" />

          {/* User Account / Login */}
          {isLoaded && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-10 items-center rounded-xl p-1 text-left transition-all duration-200 hover:bg-slate-100 focus:outline-none sm:h-11 lg:gap-2 lg:px-2 cursor-pointer"
                >
                  {/* User Avatar */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#0F2557] to-[#1749A0] text-[11px] font-bold text-white shadow-xs sm:h-9 sm:w-9 ring-2 ring-indigo-50">
                    {userInitials}
                  </div>

                  {/* User Details */}
                  <div className="hidden max-w-[120px] leading-tight lg:block xl:max-w-[150px]">
                    <p className="truncate text-[10px] text-slate-400 font-medium">
                      Welcome,
                    </p>
                    <p className="truncate text-xs font-bold text-slate-900">
                      {userName}
                    </p>
                  </div>

                  <ChevronDown
                    size={14}
                    className="hidden text-slate-400 lg:block transition-transform duration-200"
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="z-50 w-64 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl animate-in fade-in-50 zoom-in-95 duration-150"
              >
                {/* User Info Header */}
                <div className="mb-1 rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1749A0] text-xs font-bold text-white shadow-xs">
                      {userInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {userName}
                      </p>
                      {user.email && (
                        <p className="truncate text-[11px] text-slate-500">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md w-fit">
                      <Sparkles size={11} />
                      <span>Administrator</span>
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <DropdownMenuItem asChild>
                    <Link
                      href={dashboardLink}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-500" />
                      <span>
                        {isAdmin ? "Admin Dashboard" : "My Dashboard"}
                      </span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href={ordersLink}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <ShoppingBag className="h-4 w-4 text-slate-500" />
                      <span>Order History</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/user/wishlist"
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span>Saved Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-1 bg-slate-100" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4 text-rose-500" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="flex h-9 sm:h-10 items-center gap-2 rounded-xl bg-[#0F2557] px-3.5 sm:px-4 text-xs font-semibold text-white transition-all duration-200 hover:bg-[#1749A0] shadow-xs active:scale-[0.98]"
            >
              <UserRound size={15} />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          {/* Mobile / Tablet Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Row (visible below md) */}
      <div className="border-t border-slate-100 px-3 py-2.5 sm:px-5 md:hidden bg-slate-50/50">
        <HeaderSearch isMobile />
      </div>

      {/* Desktop Secondary Navigation Bar (visible on lg+) */}
      <div className="hidden border-t border-slate-100 bg-slate-50/80 lg:block">
        <div className="mx-auto flex h-11 max-w-[1440px] items-center justify-between px-8 xl:px-6">
          <nav className="flex h-full items-center gap-1">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative flex h-full items-center px-4 text-xs font-semibold transition-colors duration-150 ${
                    active
                      ? "text-[#1749A0]"
                      : "text-slate-600 hover:text-[#1749A0]"
                  }`}
                >
                  <span>{link.name}</span>

                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#1749A0]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Drawer (Slide-down with backdrop shadow) */}
      {isMobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden animate-in slide-in-from-top-3 duration-200">
          {/* User Section */}
          {user ? (
            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1749A0] text-sm font-bold text-white shadow-xs">
                  {userInitials}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {userName}
                  </p>

                  {user.email && (
                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  )}

                  {isAdmin && (
                    <span className="mt-1 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      Admin
                    </span>
                  )}
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="mt-3.5 grid grid-cols-3 gap-2 border-t border-slate-200/80 pt-3">
                <Link
                  href={dashboardLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 px-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:bg-slate-100"
                >
                  <LayoutDashboard size={15} className="text-indigo-600" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href={ordersLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 px-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 active:bg-slate-100"
                >
                  <ShoppingBag size={15} className="text-amber-600" />
                  <span>Orders</span>
                </Link>

                <Link
                  href="/user/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2 px-1 text-[11px] font-semibold text-rose-600 shadow-2xs hover:bg-rose-50 active:bg-rose-100"
                >
                  <Heart size={15} className="text-rose-500" />
                  <span>Wishlist</span>
                </Link>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0F2557] px-4 py-3 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#1749A0]"
            >
              <UserRound size={16} />
              <span>Login / Register Account</span>
            </Link>
          )}

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation
            </p>
            <nav className="space-y-0.5">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-indigo-50 text-[#1749A0]"
                        : "text-slate-700 hover:bg-slate-50 hover:text-[#1749A0]"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight
                      size={14}
                      className={active ? "text-[#1749A0]" : "text-slate-300"}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
