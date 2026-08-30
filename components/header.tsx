"use client";

import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
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
  const [cartCount, setCartCount] = useState<number>(0);
  const pathname = usePathname();
  const router = useRouter();

  // Load user session from cookie
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

  // Fetch cart count via /v1/cart/count
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

  useEffect(() => {
    loadUser();
    fetchCartCount();

    // Listen to global auth & cart changes
    const handleAuthChange = () => {
      loadUser();
      fetchCartCount();
    };

    const handleCartChange = () => {
      fetchCartCount();
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
  const settingsLink = isAdmin ? "/admin/settings" : "/user/settings";

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-xs">
      {/* Main Header */}
      <div className="mx-auto flex min-h-[50px] md:h-[52px] max-w-[1400px] items-center justify-between gap-2 md:gap-4 px-3 md:px-4 py-2 md:py-0">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md overflow-hidden">
            <Image
              src="/logo.jpg"
              alt="Logo"
              width={60}
              height={60}
              className="object-contain"
            />
          </div>
        </Link>

        {/* Search Bar - Desktop & Tablet */}
        <div className="hidden sm:flex h-8 min-w-0 flex-1 overflow-hidden rounded-md border border-[#0F2557]">
          <input
            type="text"
            placeholder="Search by title, author, ISBN, publisher..."
            className="min-w-0 flex-1 px-3 text-xs text-gray-700 outline-none placeholder:text-gray-400"
          />

          <button className="hidden lg:flex w-[110px] items-center justify-between border-l border-gray-200 bg-gray-50 px-3 text-xs text-gray-600">
            <span>All Categories</span>
            <ChevronDown size={11} />
          </button>

          <button className="flex w-9 items-center justify-center bg-[#1749A0] text-white hover:bg-[#0F2557] transition-colors">
            <Search size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Cart */}
        <div className="relative flex shrink-0 items-center gap-1 cursor-pointer">
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 p-1 sm:px-2 rounded-lg hover:bg-gray-50 text-gray-700 hover:text-[#1749A0] transition-colors"
            title="Shopping Cart"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart
                size={19}
                strokeWidth={1.5}
                className="text-gray-700 hover:text-[#1749A0]"
              />
              <span className="absolute -right-2 -top-2 flex min-w-[17px] h-[17px] px-1 items-center justify-center rounded-full bg-[#1749A0] text-[9px] font-bold text-white shadow-2xs">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </div>
            <span className="text-xs font-semibold text-gray-800 hidden md:inline">
              Cart
            </span>
          </Link>
        </div>
        {/* Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Account: Authenticated vs Guest */}
          {isLoaded && user ? (
            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex shrink-0 items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1749A0] text-white text-xs font-bold shadow-xs">
                      {userInitials}
                    </div>
                    <div className="leading-tight hidden md:block max-w-[130px]">
                      <p className="text-gray-500 text-[10px] truncate">
                        Welcome back,
                      </p>
                      <p className="text-xs font-bold text-[#111827] truncate">
                        {userName}
                      </p>
                    </div>
                    <ChevronDown
                      size={12}
                      className="text-gray-500 hidden md:block"
                    />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border border-gray-200 shadow-xl rounded-xl p-1.5 z-50"
                >
                  {/* User Overview */}
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {userName}
                    </p>
                    {user.email && (
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    )}
                    {isAdmin && (
                      <span className="inline-block mt-1 bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>

                  <DropdownMenuItem asChild>
                    <Link
                      href={dashboardLink}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg cursor-pointer transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-500" />
                      <span>{isAdmin ? "Admin Dashboard" : "Dashboard"}</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/user/wishlist"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg cursor-pointer transition-colors"
                    >
                      <Heart className="h-4 w-4 text-rose-500" />
                      <span>My Wishlist</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex shrink-0 items-center gap-1.5 cursor-pointer hover:text-[#1749A0] transition-colors"
            >
              <UserRound
                size={18}
                strokeWidth={1.5}
                className="text-gray-600"
              />
              <div className="leading-none hidden md:block">
                <p className="text-gray-500 text-[11px]">Login / Register</p>
                <p className="mt-0.5 text-xs font-semibold text-[#111827]">
                  My Account
                </p>
              </div>
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-1 text-gray-700 hover:text-[#0F2557]"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="sm:hidden px-3 pb-2 pt-1">
        <div className="flex h-8 w-full overflow-hidden rounded-md border border-[#0F2557]">
          <input
            type="text"
            placeholder="Search by title, author, ISBN..."
            className="min-w-0 flex-1 px-3 text-xs text-gray-700 outline-none placeholder:text-gray-400"
          />
          <button className="flex w-9 items-center justify-center bg-[#1749A0] text-white">
            <Search size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block border-t border-gray-100 bg-gray-50/50">
        <div className="mx-auto flex h-[36px] max-w-[1400px] items-center justify-between px-4">
          {/* Left Navigation */}
          <div className="flex h-full items-center gap-2">
            {/* Browse Categories */}
            <button className="flex h-[30px] w-[210px] items-center gap-2 rounded bg-[#0F2557] px-3 text-sm font-semibold text-white hover:bg-[#1749A0] transition-colors">
              <Menu size={13} />
              <span>Browse Genre</span>
              <ChevronDown size={11} />
            </button>

            {/* Links */}
            <nav className="flex items-center space-x-1">
              {navLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`flex items-center gap-1 px-3 h-[36px] text-sm font-medium transition-colors ${
                      active
                        ? "border-b-2 border-[#1749A0] font-semibold text-[#1749A0]"
                        : "text-gray-700 hover:text-[#1749A0]"
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-2">
          {/* Mobile User Profile Section */}
          {user ? (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1749A0] text-white text-xs font-bold shadow-xs">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {userName}
                  </p>
                  {user.email && (
                    <p className="text-[11px] text-slate-500 truncate">
                      {user.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 text-xs">
                <Link
                  href={dashboardLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold"
                >
                  <LayoutDashboard size={13} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href={ordersLink}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold"
                >
                  <ShoppingBag size={13} />
                  <span>Orders</span>
                </Link>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#1749A0] text-white text-xs font-bold shadow-sm"
            >
              <UserRound size={15} />
              <span>Login / Register</span>
            </Link>
          )}

          <button className="flex w-full items-center justify-between rounded bg-[#0F2557] px-3 py-2 text-xs font-semibold text-white">
            <div className="flex items-center gap-2">
              <Menu size={14} />
              <span>Browse Categories</span>
            </div>
            <ChevronDown size={14} />
          </button>

          <nav className="flex flex-col space-y-2 text-xs text-gray-700 font-medium">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between py-1 border-b border-gray-100 ${
                    active
                      ? "text-[#1749A0] font-semibold"
                      : "hover:text-[#1749A0]"
                  }`}
                >
                  <span>{link.name}</span>
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
