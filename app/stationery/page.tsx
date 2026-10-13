"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Package,
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Tag,
  Sparkles,
  ShoppingBag,
  Coins,
  Check,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Heart,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import TopHeader from "@/components/topHeader";
import Header from "@/components/header";
import Footer from "@/components/footer";
import AddToCartButton from "@/components/AddToCartButton";
import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import {
  CART_CHANGE_EVENT,
  getUserCookie,
  WISHLIST_CHANGE_EVENT,
} from "@/utils/cookies";
import { StationeryItem, PaginationMeta, getStationeryImageUrl } from "@/types";

interface CategoryOption {
  id: number | string;
  name: string;
  slug?: string;
  [key: string]: any;
}

const PRICE_PRESETS = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under Rs. 300", min: "", max: "300" },
  { label: "Rs. 300 - Rs. 700", min: "300", max: "700" },
  { label: "Rs. 700 - Rs. 1,500", min: "700", max: "1500" },
  { label: "Rs. 1,500 & Above", min: "1500", max: "" },
];

function StationeryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get("categoryId") || "";
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";
  const urlMinPrice = searchParams.get("minPrice") || "";
  const urlMaxPrice = searchParams.get("maxPrice") || "";
  const urlSortBy = searchParams.get("sortBy") || "newest";
  const urlPage = Number(searchParams.get("page")) || 1;
  const urlLimit = Number(searchParams.get("limit")) || 10;

  // Filter States
  const [stationeryList, setStationeryList] = useState<StationeryItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(urlSearch);
  const [minPriceInput, setMinPriceInput] = useState<string>(urlMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState<string>(urlMaxPrice);
  const [appliedMinPrice, setAppliedMinPrice] = useState<string>(urlMinPrice);
  const [appliedMaxPrice, setAppliedMaxPrice] = useState<string>(urlMaxPrice);
  const [sortBy, setSortBy] = useState<string>(urlSortBy);

  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(urlPage);
  const [pageSize] = useState<number>(urlLimit);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: urlLimit,
    totalPages: 1,
  });

  // Wishlist State
  const [wishlistedMap, setWishlistedMap] = useState<Record<string, boolean>>(
    {},
  );

  // Fetch Wishlist for authenticated user
  const fetchWishlist = useCallback(async () => {
    try {
      const user = await getUserCookie();
      if (!user?.accessToken) {
        setWishlistedMap({});
        return;
      }

      let res;
      try {
        res = await axiosAuthInstance.get("/v1/wishlist");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          res = await axiosAuthInstance.get("/api/v1/wishlist");
        } else {
          return;
        }
      }

      const data =
        res?.data?.data ||
        res?.data?.wishlist ||
        res?.data?.items ||
        (Array.isArray(res?.data) ? res.data : []);

      if (Array.isArray(data)) {
        const map: Record<string, boolean> = {};
        data.forEach((item: any) => {
          const isStat =
            item.itemType === "STATIONERY" ||
            Boolean(item.stationery) ||
            Boolean(item.stationeryId);
          if (isStat) {
            const statId = item.stationeryId ?? item.stationery?.id ?? item.id;
            if (statId) map[String(statId)] = true;
          }
        });
        setWishlistedMap(map);
      }
    } catch {
      // Ignore if failed or unauthenticated
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
    const handleWishlistChange = () => fetchWishlist();
    window.addEventListener(WISHLIST_CHANGE_EVENT, handleWishlistChange);
    return () => {
      window.removeEventListener(WISHLIST_CHANGE_EVENT, handleWishlistChange);
    };
  }, [fetchWishlist]);

  // Wishlist Toggle
  const handleToggleWishlist = async (
    e: React.MouseEvent,
    item: StationeryItem,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const user = await getUserCookie();
      toast.dismiss();
      if (!user?.accessToken) {
        toast.error("Please login first to manage your wishlist");
        return;
      }

      const strId = String(item.id);
      const isCurrentlyWishlisted = Boolean(wishlistedMap[strId]);

      // Optimistic update
      setWishlistedMap((prev) => ({
        ...prev,
        [strId]: !isCurrentlyWishlisted,
      }));

      const numId = Number(item.id);
      const targetId = !isNaN(numId) ? numId : item.id;
      const payload = { stationeryId: targetId };

      let response;
      try {
        response = await axiosAuthInstance.post("/v1/wishlist/toggle", payload);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          response = await axiosAuthInstance.post(
            "/api/v1/wishlist/toggle",
            payload,
          );
        } else {
          throw err;
        }
      }

      const msg = response?.data?.message;
      if (msg) {
        toast.success(msg);
      } else if (!isCurrentlyWishlisted) {
        toast.success("Added to wishlist!");
      } else {
        toast.success("Removed from wishlist");
      }

      window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
    } catch (err: any) {
      setWishlistedMap((prev) => ({
        ...prev,
        [String(item.id)]: !prev[String(item.id)],
      }));
      toast.error(
        err?.response?.data?.message || "Failed to update wishlist.",
      );
    }
  };



  // Debounce search query (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch stationery categories
  useEffect(() => {
    const fetchCategoryOptions = async () => {
      setIsLoadingCategories(true);
      try {
        let res;
        try {
          res = await axiosInstance.get("/v1/category?limit=100");
        } catch (err: any) {
          if (err?.response?.status === 404) {
            res = await axiosInstance.get("/api/v1/category?limit=100");
          } else {
            throw err;
          }
        }
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : data?.data || data?.categories || [];
        setCategories(list);
      } catch (error) {
        console.error("Failed to load stationery categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategoryOptions();
  }, []);

  // Fetch stationery catalog using requested API:
  // v1/stationery?search=Pencils&categoryId=1&minPrice=100&maxPrice=1000&sortBy=price_asc&page=1&limit=10
  const fetchStationeryData = useCallback(
    async (
      page = currentPage,
      limit = pageSize,
      search = debouncedSearch,
      catId = selectedCategory,
      minP = appliedMinPrice,
      maxP = appliedMaxPrice,
      sort = sortBy,
    ) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));

        if (search.trim()) {
          params.set("search", search.trim());
        }
        if (catId && catId !== "all") {
          params.set("categoryId", String(catId));
        }
        if (minP && !isNaN(Number(minP))) {
          params.set("minPrice", String(minP));
        }
        if (maxP && !isNaN(Number(maxP))) {
          params.set("maxPrice", String(maxP));
        }
        if (sort) {
          params.set("sortBy", sort);
        }

        const primaryUrl = `/v1/stationery?${params.toString()}`;
        const fallbackUrl = `/api/v1/stationery?${params.toString()}`;

        let response;
        try {
          response = await axiosInstance.get(primaryUrl);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            response = await axiosInstance.get(fallbackUrl);
          } else {
            throw err;
          }
        }

        const data = response.data?.data || response.data;
        const list: StationeryItem[] = Array.isArray(data)
          ? data
          : data?.stationery || data?.items || data?.products || [];
        setStationeryList(list);

        const rawPagination =
          response.data?.pagination ||
          data?.pagination ||
          response.data?.meta ||
          data?.meta;

        if (rawPagination) {
          const totalCount =
            rawPagination.total ??
            rawPagination.totalCount ??
            rawPagination.count ??
            list.length;
          const limitCount = rawPagination.limit ?? limit;
          const totalPages =
            rawPagination.totalPages ??
            rawPagination.lastPage ??
            Math.max(1, Math.ceil(totalCount / limitCount));

          setPagination({
            total: totalCount,
            page: rawPagination.page ?? page,
            limit: limitCount,
            totalPages,
          });
        } else {
          const totalCount =
            response.data?.total ??
            response.data?.totalCount ??
            data?.total ??
            list.length;

          const totalPages =
            response.data?.totalPages ??
            data?.totalPages ??
            Math.max(1, Math.ceil(totalCount / limit));

          setPagination({
            total: totalCount,
            page,
            limit,
            totalPages,
          });
        }
      } catch (error) {
        console.error("Failed to load stationery catalog:", error);
        toast.error("Failed to load stationery products.");
      } finally {
        setIsLoading(false);
      }
    },
    [
      currentPage,
      pageSize,
      debouncedSearch,
      selectedCategory,
      appliedMinPrice,
      appliedMaxPrice,
      sortBy,
    ],
  );

  // Trigger fetch when any filter changes
  useEffect(() => {
    fetchStationeryData(
      currentPage,
      pageSize,
      debouncedSearch,
      selectedCategory,
      appliedMinPrice,
      appliedMaxPrice,
      sortBy,
    );
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    selectedCategory,
    appliedMinPrice,
    appliedMaxPrice,
    sortBy,
    fetchStationeryData,
  ]);

  // Handle Price Filter Submit
  const handleApplyPrice = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedMinPrice(minPriceInput);
    setAppliedMaxPrice(maxPriceInput);
    setCurrentPage(1);
  };

  const handlePricePreset = (min: string, max: string) => {
    setMinPriceInput(min);
    setMaxPriceInput(max);
    setAppliedMinPrice(min);
    setAppliedMaxPrice(max);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSearchQuery("");
    setDebouncedSearch("");
    setMinPriceInput("");
    setMaxPriceInput("");
    setAppliedMinPrice("");
    setAppliedMaxPrice("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory && selectedCategory !== "all") count++;
    if (appliedMinPrice || appliedMaxPrice) count++;
    if (debouncedSearch.trim()) count++;
    return count;
  }, [selectedCategory, appliedMinPrice, appliedMaxPrice, debouncedSearch]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory || selectedCategory === "all") return "";
    const found = categories.find(
      (c) => String(c.id) === String(selectedCategory),
    );
    return found ? found.name : `Category #${selectedCategory}`;
  }, [selectedCategory, categories]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <TopHeader />
      <Header />

      <main className="flex-1 pb-16">
        {/* Hero Banner & Breadcrumbs */}
        <section className="bg-gradient-to-r from-[#0F2557] to-[#1749A0] text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-xs font-medium text-blue-200">
              <Link href="/" className="hover:text-white transition">
                Home
              </Link>
              <span>/</span>
              <span className="text-white font-semibold">Stationery</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  Stationery & Art Supplies
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
                  Explore our curated collection of fine art materials, craft
                  tools, premium notebooks, writing instruments, and office
                  essentials.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Body */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* ===================== DESKTOP SIDEBAR ===================== */}
            <aside className="hidden lg:block lg:col-span-1 space-y-6 sticky top-24">
              {/* Filter Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-6">
                {/* Header & Reset */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Filter className="w-4 h-4 text-[#1749A0]" />
                    <span>Filter Products</span>
                    {activeFiltersCount > 0 && (
                      <span className="rounded-full bg-[#1749A0] text-white text-[10px] px-1.5 py-0.2 font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </div>
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Categories Filter */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                    Categories
                  </h3>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("");
                        setCurrentPage(1);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                        !selectedCategory || selectedCategory === "all"
                          ? "bg-[#1749A0] text-white font-bold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span>All Categories</span>
                      {(!selectedCategory || selectedCategory === "all") && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {categories.map((cat) => {
                      const isSelected =
                        String(cat.id) === String(selectedCategory);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(String(cat.id));
                            setCurrentPage(1);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer text-left ${
                            isSelected
                              ? "bg-[#1749A0] text-white font-bold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Price Range (Rs.)
                  </h3>

                  {/* Price inputs */}
                  <form onSubmit={handleApplyPrice} className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Min"
                          min="0"
                          value={minPriceInput}
                          onChange={(e) => setMinPriceInput(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0]/20"
                        />
                      </div>
                      <span className="text-slate-400 text-xs">—</span>
                      <div className="flex-1">
                        <input
                          type="number"
                          placeholder="Max"
                          min="0"
                          value={maxPriceInput}
                          onChange={(e) => setMaxPriceInput(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0]/20"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-slate-900 hover:bg-[#1749A0] text-white py-2 text-xs font-semibold transition cursor-pointer"
                    >
                      Apply Price
                    </button>
                  </form>

                  {/* Quick presets */}
                  <div className="space-y-1 pt-1">
                    {PRICE_PRESETS.map((preset, idx) => {
                      const isActive =
                        appliedMinPrice === preset.min &&
                        appliedMaxPrice === preset.max;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() =>
                            handlePricePreset(preset.min, preset.max)
                          }
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] transition cursor-pointer ${
                            isActive
                              ? "text-[#1749A0] font-bold bg-blue-50/70"
                              : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                          }`}
                        >
                          {preset.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            {/* ===================== MAIN CATALOG ===================== */}
            <div className="lg:col-span-3 space-y-5">
              {/* Controls Bar: Search, Mobile Filter Trigger, Sorter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                {/* Search input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name (e.g. Pencils, Notebooks)..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-9 text-xs sm:text-sm outline-none transition placeholder:text-slate-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sorter & Mobile Filter Button */}
                <div className="flex items-center gap-2.5 self-end sm:self-auto">
                  {/* Mobile Filter Button */}
                  <button
                    type="button"
                    onClick={() => setShowMobileFilter(true)}
                    className="lg:hidden inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#1749A0]" />
                    <span>Filter</span>
                    {activeFiltersCount > 0 && (
                      <span className="rounded-full bg-[#1749A0] text-white text-[10px] px-1.5 py-0.2 font-bold">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* Sort By Dropdown */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                      Sort:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10 cursor-pointer"
                    >
                      <option value="newest">Newest Arrivals</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="discount">Highest Discount</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filter Badges */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-400">
                    Active Filters:
                  </span>

                  {selectedCategory && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200/80 px-2.5 py-1 text-xs font-semibold text-blue-800">
                      <span>Category: {selectedCategoryName}</span>
                      <X
                        className="w-3.5 h-3.5 cursor-pointer hover:text-blue-950"
                        onClick={() => setSelectedCategory("")}
                      />
                    </span>
                  )}

                  {(appliedMinPrice || appliedMaxPrice) && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      <span>
                        Price: Rs. {appliedMinPrice || 0} - Rs.{" "}
                        {appliedMaxPrice || "Any"}
                      </span>
                      <X
                        className="w-3.5 h-3.5 cursor-pointer hover:text-amber-950"
                        onClick={() => {
                          setMinPriceInput("");
                          setMaxPriceInput("");
                          setAppliedMinPrice("");
                          setAppliedMaxPrice("");
                        }}
                      />
                    </span>
                  )}

                  {debouncedSearch && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      <span>&quot;{debouncedSearch}&quot;</span>
                      <X
                        className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900"
                        onClick={() => setSearchQuery("")}
                      />
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 ml-1 hover:underline cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-slate-200/80 bg-white p-3 space-y-3 animate-pulse flex flex-col justify-between"
                    >
                      <div className="h-[175px] sm:h-[200px] w-full rounded-xl bg-slate-100" />
                      <div className="space-y-2">
                        <div className="h-3 w-1/3 bg-slate-200 rounded" />
                        <div className="h-3.5 w-4/5 bg-slate-200 rounded" />
                        <div className="h-3 w-1/2 bg-slate-100 rounded" />
                      </div>
                      <div className="h-8 w-full bg-slate-200 rounded-xl mt-2" />
                    </div>
                  ))}
                </div>
              ) : stationeryList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {stationeryList.map((item) => {
                    const imgUrl = getStationeryImageUrl(item);
                    const priceNum = Number(item.price) || 0;
                    const discountNum = Number(item.discountPercent) || 0;
                    const effectivePrice =
                      discountNum > 0
                        ? Math.max(0, priceNum - (priceNum * discountNum) / 100)
                        : priceNum;
                    const isOutOfStock =
                      item.stock !== undefined &&
                      item.stock !== null &&
                      Number(item.stock) <= 0;

                    const catName =
                      item.category?.name ||
                      item.Category?.name ||
                      "Stationery";
                    const subCatName =
                      item.subCategory?.name ||
                      item.SubCategory?.name ||
                      "";

                    const productSlug = item.slug || item.id;
                    const isWishlisted = Boolean(wishlistedMap[String(item.id)]);

                    return (
                      <Link
                        key={item.id}
                        href={`/stationery/${productSlug}`}
                        className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                      >
                        {/* Discount Badge */}
                        {discountNum > 0 && (
                          <div className="absolute left-2.5 top-2.5 z-10 rounded-lg bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            -{discountNum}%
                          </div>
                        )}

                        {/* Wishlist Button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleWishlist(e, item)}
                          aria-label="Add to wishlist"
                          className={`absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full backdrop-blur-xs transition shadow-2xs cursor-pointer ${
                            isWishlisted
                              ? "bg-rose-50 text-rose-600"
                              : "bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white"
                          }`}
                        >
                          <Heart
                            size={14}
                            className={
                              isWishlisted ? "fill-rose-500 text-rose-500" : ""
                            }
                          />
                        </button>

                        {/* Cover Image */}
                        <div className="flex h-[175px] sm:h-[200px] items-center justify-center overflow-hidden bg-slate-50/70 p-3 relative">
                          {imgUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={imgUrl}
                              alt={item.name}
                              className="h-full w-auto max-w-full object-contain transition duration-300 group-hover:scale-105"
                              onError={(e) => {
                                (e.currentTarget as HTMLElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-slate-300">
                              <Package size={36} />
                            </div>
                          )}

                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center">
                              <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col justify-between border-t border-slate-100 p-3">
                          <div className="space-y-1.5">
                            {/* Category Badges */}
                            <div className="flex items-center gap-1">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 border border-amber-100/80 text-[9px] font-semibold text-amber-700 uppercase tracking-wider truncate max-w-[120px]">
                                {catName}
                              </span>
                              {subCatName && (
                                <span className="text-[10px] text-slate-400 truncate">
                                  • {subCatName}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="line-clamp-1 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1749A0] transition-colors">
                              {item.name}
                            </h3>

                            {/* Subtitle / Subcategory */}
                            <p className="truncate text-[11px] text-slate-400">
                              {subCatName || catName}
                            </p>

                            {/* Price */}
                            <div className="flex items-baseline justify-between gap-1.5 pt-0.5">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs sm:text-sm font-black text-[#1749A0]">
                                  Rs. {Math.round(effectivePrice).toLocaleString()}
                                </span>
                                {discountNum > 0 && (
                                  <span className="text-[10px] text-slate-400 line-through">
                                    Rs. {Math.round(priceNum).toLocaleString()}
                                  </span>
                                )}
                              </div>
                              {item.stock !== undefined &&
                                item.stock !== null &&
                                Number(item.stock) > 0 && (
                                  <span className="text-[9px] text-emerald-600 font-medium whitespace-nowrap">
                                    In Stock
                                  </span>
                                )}
                            </div>
                          </div>

                          {/* Bottom Actions */}
                          <div className="mt-3">
                            <AddToCartButton
                              book={{
                                ...item,
                                id: item.id,
                                stationeryId: item.id,
                                itemType: "STATIONERY",
                                isStationery: true,
                                format: "Stationery",
                                title: item.name,
                                name: item.name,
                                category: item.category,
                                stock: item.stock,
                                images:
                                  item.images ||
                                  (imgUrl ? [{ url: imgUrl }] : []),
                              }}
                              isOutOfStock={isOutOfStock}
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                /* Empty state */
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1749A0]">
                    <Package size={28} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No Stationery Items Found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {debouncedSearch
                      ? `We couldn't find any stationery matching "${debouncedSearch}".`
                      : "No products matched your selected filters."}
                  </p>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1749A0] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#0F2557] transition cursor-pointer"
                  >
                    <RotateCcw size={14} />
                    Reset Filters
                  </button>
                </div>
              )}

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">
                    Showing page{" "}
                    <span className="font-bold text-slate-900">
                      {pagination.page}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-slate-900">
                      {pagination.totalPages}
                    </span>{" "}
                    ({pagination.total} total items)
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || isLoading}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex items-center gap-1 text-xs">
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1,
                      )
                        .filter((p) => {
                          if (pagination.totalPages <= 5) return true;
                          return (
                            Math.abs(p - currentPage) <= 1 ||
                            p === 1 ||
                            p === pagination.totalPages
                          );
                        })
                        .map((pageNum, idx, arr) => {
                          const showEllipsis =
                            idx > 0 && pageNum - arr[idx - 1] > 1;
                          return (
                            <React.Fragment key={pageNum}>
                              {showEllipsis && (
                                <span className="px-1 text-slate-400 font-bold">
                                  ...
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => setCurrentPage(pageNum)}
                                className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold transition cursor-pointer text-xs ${
                                  currentPage === pageNum
                                    ? "bg-[#1749A0] text-white shadow-xs"
                                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    <button
                      type="button"
                      disabled={
                        currentPage >= pagination.totalPages || isLoading
                      }
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, pagination.totalPages),
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ===================== MOBILE FILTER DRAWER ===================== */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setShowMobileFilter(false)}
          />

          <div className="relative ml-auto h-full w-[85%] max-w-sm bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <SlidersHorizontal className="w-4 h-4 text-[#1749A0]" />
                  <span>Filter Products</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMobileFilter(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Mobile Categories */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5">
                  Categories
                </h3>
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory("");
                      setCurrentPage(1);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left ${
                      !selectedCategory || selectedCategory === "all"
                        ? "bg-[#1749A0] text-white font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>All Categories</span>
                    {(!selectedCategory || selectedCategory === "all") && (
                      <Check className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {categories.map((cat) => {
                    const isSelected =
                      String(cat.id) === String(selectedCategory);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(String(cat.id));
                          setCurrentPage(1);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-left ${
                          isSelected
                            ? "bg-[#1749A0] text-white font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Price */}
              <div className="border-t border-slate-100 pt-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Price Range (Rs.)
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPriceInput}
                    onChange={(e) => setMinPriceInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs outline-none"
                  />
                  <span className="text-slate-400 text-xs">—</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPriceInput}
                    onChange={(e) => setMaxPriceInput(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="pt-6 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => {
                  handleApplyPrice();
                  setShowMobileFilter(false);
                }}
                className="flex-1 rounded-xl bg-[#1749A0] py-2.5 text-xs font-semibold text-white shadow-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function StationeryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1749A0]" />
        </div>
      }
    >
      <StationeryContent />
    </Suspense>
  );
}
