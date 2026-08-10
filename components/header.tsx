"use client";

import React, { useState } from "react";
import {
  Search,
  UserRound,
  Heart,
  ShoppingCart,
  Menu,
  ChevronDown,
  BookOpen,
  X,
} from "lucide-react";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Main Header */}
      <div className="mx-auto flex min-h-[50px] md:h-[52px] max-w-[1400px] items-center justify-between gap-2 md:gap-4 px-3 md:px-4 py-2 md:py-0">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-md bg-[#0F2557]">
            <div className="flex h-5 w-4 items-center justify-center rounded-sm bg-white">
              <BookOpen
                size={13}
                className="text-[#0F2557]"
                strokeWidth={2}
              />
            </div>
          </div>

          <div className="leading-none">
            <h1 className="text-sm sm:text-[16px] font-bold text-[#0F2557]">
              Nepsole
            </h1>
            <p className="mt-[2px] text-[6px] sm:text-[7px] text-gray-500 hidden xs:block">
              Books, Knowledge & Beyond
            </p>
          </div>
        </div>

        {/* Search Bar - Desktop & Tablet */}
        <div className="hidden sm:flex h-8 min-w-0 flex-1 overflow-hidden rounded-md border border-[#0F2557]">
          <input
            type="text"
            placeholder="Search by title, author, ISBN, publisher..."
            className="min-w-0 flex-1 px-3 text-xs text-gray-700 outline-none placeholder:text-gray-400"
          />

          <button className="hidden lg:flex w-[110px] items-center justify-between border-l border-gray-200 bg-gray-50 px-3 text-[10px] text-gray-600">
            <span>All Categories</span>
            <ChevronDown size={11} />
          </button>

          <button className="flex w-9 items-center justify-center bg-[#1749A0] text-white hover:bg-[#0F2557] transition-colors">
            <Search size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Account */}
          <div className="flex shrink-0 items-center gap-1.5 cursor-pointer hover:text-[#1749A0]">
            <UserRound size={18} strokeWidth={1.5} className="text-gray-600" />
            <div className="leading-none hidden md:block">
              <p className="text-[7px] text-gray-500">Login / Register</p>
              <p className="mt-0.5 text-[10px] font-semibold text-[#111827]">
                My Account
              </p>
            </div>
          </div>

          {/* Wishlist */}
          <div className="flex shrink-0 items-center gap-1 cursor-pointer hover:text-[#1749A0]">
            <Heart
              size={18}
              strokeWidth={1.5}
              className="text-gray-700"
            />
            <span className="text-[10px] font-semibold text-gray-800 hidden lg:inline">
              Wishlist
            </span>
          </div>

          {/* Cart */}
          <div className="relative flex shrink-0 items-center gap-1 cursor-pointer hover:text-[#1749A0]">
            <div className="relative">
              <ShoppingCart
                size={18}
                strokeWidth={1.5}
                className="text-gray-700"
              />
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#1749A0] text-[8px] font-bold text-white">
                3
              </span>
            </div>
            <span className="text-[10px] font-semibold text-gray-800 hidden lg:inline">
              Cart
            </span>
          </div>

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
            <button className="flex h-[30px] items-center gap-2 rounded bg-[#0F2557] px-3 text-[10px] font-semibold text-white hover:bg-[#1749A0] transition-colors">
              <Menu size={13} />
              <span>Browse Categories</span>
              <ChevronDown size={11} />
            </button>

            {/* Links */}
            <nav className="flex items-center space-x-1">
              <a
                href="#"
                className="flex h-[36px] items-center border-b-2 border-[#1749A0] px-3 text-[10px] font-semibold text-[#1749A0]"
              >
                Home
              </a>
              <a
                href="#"
                className="px-3 text-[10px] font-medium text-gray-700 hover:text-[#1749A0] transition-colors"
              >
                Books
              </a>
              <a
                href="#"
                className="px-3 text-[10px] font-medium text-gray-700 hover:text-[#1749A0] transition-colors"
              >
                Audiobooks
              </a>
              <a
                href="#"
                className="px-3 text-[10px] font-medium text-gray-700 hover:text-[#1749A0] transition-colors"
              >
                Authors
              </a>
              <a
                href="#"
                className="px-3 text-[10px] font-medium text-gray-700 hover:text-[#1749A0] transition-colors"
              >
                Publishers
              </a>
              <a
                href="#"
                className="flex items-center gap-1 px-3 text-[10px] font-medium text-gray-700 hover:text-[#1749A0] transition-colors"
              >
                Deals
                <span className="rounded-[2px] bg-red-500 px-1 py-[1px] text-[7px] font-bold text-white leading-none">
                  Hot
                </span>
              </a>
            </nav>
          </div>

          {/* Bulk Order */}
          <button className="rounded bg-[#F59E0B] px-3.5 py-1.5 text-[10px] font-bold text-white hover:bg-[#D97706] transition-colors shadow-sm">
            Bulk Order
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 shadow-lg space-y-3">
          <button className="flex w-full items-center justify-between rounded bg-[#0F2557] px-3 py-2 text-xs font-semibold text-white">
            <div className="flex items-center gap-2">
              <Menu size={14} />
              <span>Browse Categories</span>
            </div>
            <ChevronDown size={14} />
          </button>

          <nav className="flex flex-col space-y-2 text-xs text-gray-700 font-medium">
            <a href="#" className="py-1 text-[#1749A0] font-semibold border-b border-gray-100">
              Home
            </a>
            <a href="#" className="py-1 hover:text-[#1749A0] border-b border-gray-100">
              Books
            </a>
            <a href="#" className="py-1 hover:text-[#1749A0] border-b border-gray-100">
              Audiobooks
            </a>
            <a href="#" className="py-1 hover:text-[#1749A0] border-b border-gray-100">
              Authors
            </a>
            <a href="#" className="py-1 hover:text-[#1749A0] border-b border-gray-100">
              Publishers
            </a>
            <a href="#" className="flex items-center justify-between py-1 hover:text-[#1749A0]">
              <span>Deals</span>
              <span className="rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                Hot
              </span>
            </a>
          </nav>

          <button className="w-full rounded bg-[#F59E0B] py-2 text-xs font-bold text-white hover:bg-[#D97706] transition-colors">
            Bulk Order
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;