"use client";

import EBookActiveFilters from "@/components/ebooks/EBookActiveFilters";
import EBookCard, { EBookItem } from "@/components/ebooks/EBookCard";
import EBookMobileFilterDrawer from "@/components/ebooks/EBookMobileFilterDrawer";
import EBookPagination from "@/components/ebooks/EBookPagination";
import EBookSidebarFilter, {
  OptionItem,
} from "@/components/ebooks/EBookSidebarFilter";
import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import { PaginationMeta } from "@/types/book";
import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import { getUserCookie, WISHLIST_CHANGE_EVENT } from "@/utils/cookies";
import {
  ArrowUpDown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tablet,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function EBooksPage() {
  const [eBooks, setEBooks] = useState<EBookItem[]>([]);
  const [genres, setGenres] = useState<OptionItem[]>([]);
  const [publishers, setPublishers] = useState<OptionItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState<boolean>(true);

  // Filter & Search States
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedPublisher, setSelectedPublisher] = useState<string>("all");
  const [selectedPlan, setSelectedPlan] = useState<string>("all"); // 'all' | 'FREE' | 'PAID'
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);
  const [wishlistedIds, setWishlistedIds] = useState<Record<string, boolean>>(
    {},
  );

  // Pagination States (default limit: 10, page: 1)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Fetch Filter Options (Genres & Publishers)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setIsLoadingFilters(true);
      try {
        const [genRes, pubRes] = await Promise.allSettled([
          axiosInstance.get("/v1/genre"),
          axiosInstance.get("/v1/publisher"),
        ]);

        if (genRes.status === "fulfilled") {
          const d = genRes.value.data;
          const list = Array.isArray(d) ? d : d?.data || d?.genres || [];
          setGenres(list);
        }

        if (pubRes.status === "fulfilled") {
          const d = pubRes.value.data;
          const list = Array.isArray(d) ? d : d?.data || d?.publishers || [];
          setPublishers(list);
        }
      } catch (err) {
        console.error("Failed to load eBook filter options:", err);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch E-Books with pagination & backend search query params
  const fetchEBooks = useCallback(
    async (
      page = 1,
      limit = 10,
      search = searchQuery,
      genre = selectedGenre,
      publisher = selectedPublisher,
      sort = sortBy,
    ) => {
      setIsLoading(true);
      try {
        let url = `/v1/ebook?page=${page}&limit=${limit}`;

        if (search && search.trim()) {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }
        if (genre && genre !== "all") {
          url += `&genre=${encodeURIComponent(genre)}`;
        }
        if (publisher && publisher !== "all") {
          url += `&publisher=${encodeURIComponent(publisher)}`;
        }
        if (sort && sort !== "featured") {
          url += `&sortBy=${encodeURIComponent(sort)}`;
        }

        let response;
        try {
          response = await axiosInstance.get(url);
        } catch (e: any) {
          if (e?.response?.status === 404) {
            // Fallback for case sensitivity
            const fallbackUrl = url.replace("/v1/ebook", "/v1/eBook");
            response = await axiosInstance.get(fallbackUrl);
          } else {
            throw e;
          }
        }

        const data = response?.data?.data || response?.data;
        const list: EBookItem[] = Array.isArray(data)
          ? data
          : data?.eBooks || data?.ebooks || data?.books || data?.items || [];
        setEBooks(list);

        // Parse pagination metadata
        const rawPagination =
          response?.data?.pagination ||
          data?.pagination ||
          response?.data?.meta ||
          data?.meta;

        if (rawPagination) {
          const totalCount =
            rawPagination.total ??
            rawPagination.totalCount ??
            rawPagination.count ??
            list.length;
          const limitCount = rawPagination.limit ?? limit;
          const totalPages =
            (rawPagination.totalPages ??
              rawPagination.lastPage ??
              Math.ceil(totalCount / limitCount)) ||
            1;

          setPagination({
            total: totalCount,
            page: rawPagination.page ?? page,
            limit: limitCount,
            totalPages,
          });
        } else {
          const totalCount =
            response?.data?.total ??
            response?.data?.totalCount ??
            response?.data?.count ??
            data?.total ??
            data?.totalCount ??
            data?.count ??
            list.length;

          const totalPages =
            (response?.data?.totalPages ??
              data?.totalPages ??
              Math.ceil(totalCount / limit)) ||
            1;

          setPagination({
            total: totalCount,
            page,
            limit,
            totalPages,
          });
        }
      } catch (err) {
        console.error("Failed to fetch eBooks:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery, selectedGenre, selectedPublisher, sortBy],
  );

  // Debounced search & filter effect
  useEffect(() => {
    setCurrentPage(1);
    const handler = setTimeout(() => {
      fetchEBooks(
        1,
        pageSize,
        searchQuery,
        selectedGenre,
        selectedPublisher,
        sortBy,
      );
    }, 300);

    return () => clearTimeout(handler);
  }, [
    fetchEBooks,
    pageSize,
    searchQuery,
    selectedGenre,
    selectedPublisher,
    sortBy,
  ]);

  // Handle Page Navigation
  const handlePageChange = (newPage: number) => {
    if (
      newPage < 1 ||
      newPage > effectiveTotalPages ||
      newPage === currentPage ||
      isLoading
    ) {
      return;
    }
    setCurrentPage(newPage);
    if (!isClientSidePaging) {
      fetchEBooks(
        newPage,
        pageSize,
        searchQuery,
        selectedGenre,
        selectedPublisher,
        sortBy,
      );
    }
    document
      .getElementById("ebooks-top")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch existing wishlist for authenticated user
  useEffect(() => {
    const fetchUserWishlist = async () => {
      try {
        const user = await getUserCookie();
        if (!user?.accessToken) return;

        const res = await axiosAuthInstance.get("/v1/wishlist");
        const data =
          res.data?.data ||
          res.data?.wishlist ||
          res.data?.items ||
          res.data ||
          [];
        if (Array.isArray(data)) {
          const map: Record<string, boolean> = {};
          data.forEach((item: any) => {
            const ebId = item?.ebookId || item?.eBookId || item?.ebook?.id;
            const bId = item?.bookId || item?.book?.id;
            if (ebId) map[String(ebId)] = true;
            if (bId) map[String(bId)] = true;
            if (!ebId && !bId && item?.id) map[String(item.id)] = true;
          });
          setWishlistedIds(map);
        }
      } catch {
        // Silently ignore
      }
    };

    fetchUserWishlist();
  }, []);

  const toggleWishlist = async (id: number | string) => {
    try {
      const user = await getUserCookie();
      if (!user?.accessToken) {
        toast.error("Please login to save e-books to your wishlist");
        return;
      }

      const strId = String(id);
      const isCurrentlyWishlisted = Boolean(wishlistedIds[strId]);

      // Optimistic update
      setWishlistedIds((prev) => ({
        ...prev,
        [strId]: !isCurrentlyWishlisted,
      }));

      const numId = Number(id);
      const targetId = isNaN(numId) ? id : numId;

      const response = await axiosAuthInstance.post(
        "/v1/wishlist/toggle?type=EBOOK",
        {
          ebookId: targetId,
        },
      );

      const resMsg = response?.data?.message;
      if (resMsg) {
        toast.success(resMsg);
      } else if (!isCurrentlyWishlisted) {
        toast.success("Added to wishlist!");
      } else {
        toast.success("Removed from wishlist");
      }

      window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
    } catch (error: any) {
      console.error("Wishlist Toggle Error:", error);
      // Revert optimistic update
      setWishlistedIds((prev) => ({
        ...prev,
        [String(id)]: !prev[String(id)],
      }));
      toast.error(
        error?.response?.data?.message || "Failed to update wishlist.",
      );
    }
  };

  // Client-side Filter & Sort Fallback
  const filteredEBooks = useMemo(() => {
    return eBooks
      .filter((book) => {
        if (selectedGenre !== "all") {
          const normGenre = selectedGenre.toLowerCase().trim();
          const hasGenre = (book.genres || book.genreBooks || []).some(
            (g: any) => {
              const gName = (
                g.name ||
                g.englishName ||
                g.genre?.name ||
                g.genre?.englishName ||
                ""
              )
                .toLowerCase()
                .trim();
              return gName === normGenre;
            },
          );
          if (!hasGenre) return false;
        }

        if (selectedPublisher !== "all") {
          const normPub = selectedPublisher.toLowerCase().trim();
          const pName = (
            book.publisher?.name ||
            book.publisher?.englishName ||
            book.publisherName ||
            ""
          )
            .toLowerCase()
            .trim();
          if (pName !== normPub) return false;
        }

        if (selectedPlan !== "all") {
          const isFree =
            (book.plan && book.plan.toUpperCase() === "FREE") ||
            Number(book.price || 0) === 0;
          if (selectedPlan === "FREE" && !isFree) return false;
          if (selectedPlan === "PAID" && isFree) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const titleMatch = book.title?.toLowerCase().includes(q);
          const authorMatch = (book.authors || book.authorBooks || []).some(
            (a) =>
              (a.name || a.englishName || a.author?.name || "")
                .toLowerCase()
                .includes(q),
          );
          const publisherMatch = (
            book.publisher?.name ||
            book.publisher?.englishName ||
            ""
          )
            .toLowerCase()
            .includes(q);
          const isbnMatch =
            book.isbn13?.includes(q) || book.isbn10?.includes(q);

          if (!titleMatch && !authorMatch && !publisherMatch && !isbnMatch) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = Number(a.price) || 0;
        const discountA = Number(a.discountPercent) || 0;
        const netA =
          discountA > 0 ? priceA - (priceA * discountA) / 100 : priceA;

        const priceB = Number(b.price) || 0;
        const discountB = Number(b.discountPercent) || 0;
        const netB =
          discountB > 0 ? priceB - (priceB * discountB) / 100 : priceB;

        if (sortBy === "price_asc" || sortBy === "price-asc")
          return netA - netB;
        if (sortBy === "price_desc" || sortBy === "price-desc")
          return netB - netA;
        if (sortBy === "discount") return discountB - discountA;
        if (sortBy === "newest") {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        }
        if (sortBy === "rating") {
          const rA = Number(a.rating || a.avgRating || a.averageRating || 0);
          const rB = Number(b.rating || b.avgRating || b.averageRating || 0);
          return rB - rA;
        }
        if (sortBy === "title") {
          return (a.title || "").localeCompare(b.title || "");
        }
        return 0;
      });
  }, [
    eBooks,
    selectedGenre,
    selectedPublisher,
    selectedPlan,
    searchQuery,
    sortBy,
  ]);

  const isClientSidePaging = eBooks.length > pageSize;
  const effectiveTotal = isClientSidePaging
    ? filteredEBooks.length
    : pagination.total || filteredEBooks.length;
  const effectiveTotalPages = isClientSidePaging
    ? Math.ceil(filteredEBooks.length / pageSize) || 1
    : pagination.totalPages || Math.ceil(effectiveTotal / pageSize) || 1;

  const displayedEBooks = isClientSidePaging
    ? filteredEBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredEBooks;

  const activeFiltersCount =
    (selectedGenre !== "all" ? 1 : 0) +
    (selectedPublisher !== "all" ? 1 : 0) +
    (selectedPlan !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedGenre("all");
    setSelectedPublisher("all");
    setSelectedPlan("all");
    setSearchQuery("");
    setSortBy("featured");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-800 antialiased">
      <TopHeader />
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Header Title, Breadcrumb & Top Search Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-5 border-b border-slate-200 gap-3.5">
          <div className="space-y-1">
            <nav className="text-[11px] text-slate-400 flex items-center gap-1">
              <Link
                href="/"
                className="hover:text-indigo-600 transition-colors font-medium"
              >
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-700 font-semibold">E-Books</span>
            </nav>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Tablet className="w-5 h-5 text-indigo-600" />
              E-Books Catalog
            </h1>
            <p className="text-xs text-slate-500">
              Read instant digital books, audio-ready editions, and publications
            </p>
          </div>

          {/* Search bar & Mobile Filters trigger */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search eBooks, authors, ISBN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilter(true)}
              className="lg:hidden shrink-0 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters Badges */}
        <EBookActiveFilters
          selectedGenre={selectedGenre}
          onClearGenre={() => setSelectedGenre("all")}
          selectedPublisher={selectedPublisher}
          onClearPublisher={() => setSelectedPublisher("all")}
          selectedPlan={selectedPlan}
          onClearPlan={() => setSelectedPlan("all")}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery("")}
          activeFiltersCount={activeFiltersCount}
          onResetAll={handleResetFilters}
        />

        {/* Catalog Main Layout: Sidebar + E-Books Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-start mt-4">
          {/* Desktop Sidebar Filters */}
          <EBookSidebarFilter
            selectedPlan={selectedPlan}
            onSelectPlan={setSelectedPlan}
            selectedGenre={selectedGenre}
            onSelectGenre={setSelectedGenre}
            genres={genres}
            selectedPublisher={selectedPublisher}
            onSelectPublisher={setSelectedPublisher}
            publishers={publishers}
            totalEBooks={eBooks.length}
            isLoadingFilters={isLoadingFilters}
            activeFiltersCount={activeFiltersCount}
            onResetFilters={handleResetFilters}
          />

          {/* Right Column (Catalog Grid + Pagination) */}
          <section
            id="ebooks-top"
            className="lg:col-span-3 xl:col-span-4 space-y-3.5 scroll-mt-24"
          >
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs text-xs gap-2">
              <div className="text-slate-500">
                Showing{" "}
                <strong className="text-slate-900 font-bold">
                  {effectiveTotal > 0
                    ? `${(currentPage - 1) * pageSize + 1}–${Math.min(
                        currentPage * pageSize,
                        effectiveTotal,
                      )}`
                    : 0}
                </strong>{" "}
                of{" "}
                <span className="text-slate-700 font-semibold">
                  {effectiveTotal}
                </span>{" "}
                e-books
              </div>

              <div className="flex items-center gap-3">
                {/* Sort selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500/20 focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest Releases</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="discount">Biggest Discount</option>
                    <option value="rating">Top Rated</option>
                    <option value="title">Title (A to Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-slate-200 p-2.5 flex flex-col justify-between animate-pulse"
                  >
                    <div className="aspect-[4/5] max-h-48 w-full bg-slate-200 rounded-lg mb-2.5" />
                    <div className="space-y-1.5">
                      <div className="h-2.5 bg-slate-200 rounded w-1/3" />
                      <div className="h-3.5 bg-slate-200 rounded w-4/5" />
                      <div className="h-2.5 bg-slate-200 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 rounded w-2/5 pt-1" />
                    </div>
                    <div className="h-7 bg-slate-200 rounded-lg mt-3" />
                  </div>
                ))}
              </div>
            ) : displayedEBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {displayedEBooks.map((book) => (
                  <EBookCard
                    key={book.id}
                    book={book}
                    isWishlisted={Boolean(wishlistedIds[String(book.id)])}
                    onToggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 border border-indigo-100">
                  <Tablet className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  No e-books found
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                  We couldn&apos;t find any e-books matching your selected
                  filters or search query.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg font-semibold transition cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            <EBookPagination
              currentPage={currentPage}
              pageSize={pageSize}
              effectiveTotal={effectiveTotal}
              effectiveTotalPages={effectiveTotalPages}
              isLoading={isLoading}
              onPageChange={handlePageChange}
            />
          </section>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      <EBookMobileFilterDrawer
        isOpen={showMobileFilter}
        onClose={() => setShowMobileFilter(false)}
        selectedPlan={selectedPlan}
        onSelectPlan={setSelectedPlan}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        genres={genres}
        selectedPublisher={selectedPublisher}
        onSelectPublisher={setSelectedPublisher}
        publishers={publishers}
        totalEBooks={eBooks.length}
        onResetFilters={handleResetFilters}
      />

      <Footer />
    </div>
  );
}
