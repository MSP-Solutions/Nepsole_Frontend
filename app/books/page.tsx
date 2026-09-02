"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import { BookItem, PaginationMeta } from "@/types";
import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import { getUserCookie } from "@/utils/cookies";
import {
  ArrowUpDown,
  Bookmark,
  BookOpen,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Heart,
  Loader2,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export interface OptionItem {
  id: number | string;
  name: string;
  englishName?: string;
  publicationLogoUrl?: string;
  [key: string]: any;
}

export default function BooksPage() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [genres, setGenres] = useState<OptionItem[]>([]);
  const [publishers, setPublishers] = useState<OptionItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState<boolean>(true);

  // Filter & Search States
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedPublisher, setSelectedPublisher] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);
  const [wishlistedBookIds, setWishlistedBookIds] = useState<
    Record<string, boolean>
  >({});

  // Pagination States (default limit: 10, page: 1)
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Fetch Filters (Genres & Publishers)
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
        console.error("Failed to load filter options:", err);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch Books with pagination & search
  const fetchBooks = useCallback(
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
        let url = `/v1/book?page=${page}&limit=${limit}`;

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

        const response = await axiosInstance.get(url);
        const data = response.data?.data || response.data;
        const list: BookItem[] = Array.isArray(data)
          ? data
          : data?.books || data?.items || [];
        setBooks(list);

        // Parse pagination metadata
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
            response.data?.total ??
            response.data?.totalCount ??
            response.data?.count ??
            data?.total ??
            data?.totalCount ??
            data?.count ??
            list.length;

          const totalPages =
            (response.data?.totalPages ??
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
        console.error("Failed to fetch books:", err);
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
      fetchBooks(
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
    fetchBooks,
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
      fetchBooks(
        newPage,
        pageSize,
        searchQuery,
        selectedGenre,
        selectedPublisher,
        sortBy,
      );
    }
    document
      .getElementById("books-top")
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
            const bId = item?.bookId || item?.book?.id || item?.id;
            if (bId) map[String(bId)] = true;
          });
          setWishlistedBookIds(map);
        }
      } catch (err) {
        // Silently ignore if not logged in or endpoint format differs
      }
    };

    fetchUserWishlist();
  }, []);

  // Helpers
  const getCoverImage = (book: BookItem): string | null => {
    const imagesList = book.images || book.bookImages || [];
    if (imagesList.length === 0) return null;

    const coverObj = imagesList.find((img: any) =>
      typeof img === "object"
        ? img.imageType === "COVER" || img.type === "COVER"
        : false,
    );
    if (coverObj && typeof coverObj === "object") {
      return coverObj.url || coverObj.imageUrl || null;
    }

    const first = imagesList[0];
    if (typeof first === "string") return first;
    if (typeof first === "object") return first.url || first.imageUrl || null;
    return null;
  };

  const getPrimaryGenreName = (book: BookItem): string => {
    const list = book.genres || book.genreBooks || [];
    if (list.length === 0) return "";
    return list[0].name || list[0].englishName || list[0].genre?.name || "";
  };

  const toggleWishlist = async (id: number | string) => {
    try {
      const user = await getUserCookie();
      if (!user?.accessToken) {
        toast.error("Please login to save books to your wishlist");
        return;
      }

      const strId = String(id);
      const isCurrentlyWishlisted = Boolean(wishlistedBookIds[strId]);

      // Optimistic UI toggle
      setWishlistedBookIds((prev) => ({
        ...prev,
        [strId]: !isCurrentlyWishlisted,
      }));

      const numId = Number(id);
      let response;

      response = await axiosAuthInstance.post("/v1/wishlist/toggle", {
        bookId: isNaN(numId) ? id : numId,
      });

      const resMsg = response?.data?.message;
      if (resMsg) {
        toast.success(resMsg);
      } else if (!isCurrentlyWishlisted) {
        toast.success("Added to wishlist!");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch (error: any) {
      console.error("Wishlist Toggle Error:", error);
      // Revert optimistic update
      setWishlistedBookIds((prev) => ({
        ...prev,
        [String(id)]: !prev[String(id)],
      }));
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update wishlist. Please try again.";
      toast.error(msg);
    }
  };

  // Filter & Sort Logic
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        if (selectedGenre !== "all") {
          const normSelectedGenre = selectedGenre.toLowerCase().trim();
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
              return gName === normSelectedGenre;
            },
          );
          if (!hasGenre) return false;
        }

        if (selectedPublisher !== "all") {
          const normSelectedPub = selectedPublisher.toLowerCase().trim();
          const pName = (
            book.publisher?.name ||
            book.publisher?.englishName ||
            book.publisherName ||
            ""
          )
            .toLowerCase()
            .trim();
          if (pName !== normSelectedPub) return false;
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
        if (sortBy === "sold") {
          const sA = Number(a.sold || a.soldCount || a.salesCount || 0);
          const sB = Number(b.sold || b.soldCount || b.salesCount || 0);
          return sB - sA;
        }
        if (sortBy === "title") {
          return (a.title || "").localeCompare(b.title || "");
        }
        return 0;
      });
  }, [books, selectedGenre, selectedPublisher, searchQuery, sortBy]);

  const isClientSidePaging = books.length > pageSize;
  const effectiveTotal = isClientSidePaging
    ? filteredBooks.length
    : pagination.total || filteredBooks.length;
  const effectiveTotalPages = isClientSidePaging
    ? Math.ceil(filteredBooks.length / pageSize) || 1
    : pagination.totalPages || Math.ceil(effectiveTotal / pageSize) || 1;

  const displayedBooks = isClientSidePaging
    ? filteredBooks.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredBooks;

  const activeFiltersCount =
    (selectedGenre !== "all" ? 1 : 0) +
    (selectedPublisher !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedGenre("all");
    setSelectedPublisher("all");
    setSearchQuery("");
    setSortBy("featured");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 text-slate-800">
      <TopHeader />
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-6">
        {/* Header Title & Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 sm:pb-5 border-b border-slate-200 gap-3.5">
          <div className="space-y-1">
            <nav className="text-[11px] text-slate-400 flex items-center gap-1">
              <Link
                href="/"
                className="hover:text-amber-600 transition-colors font-medium"
              >
                Home
              </Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-700 font-semibold">Books</span>
            </nav>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              Books Catalog
            </h1>
            <p className="text-xs text-slate-500">
              Browse Nepali & International books, bestsellers, and publications
            </p>
          </div>

          {/* Search bar & Mobile Filters trigger */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search books, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
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
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              <span>Filter</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-3">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-2.5 h-2.5" /> Active:
            </span>

            {selectedGenre !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-[11px] font-medium">
                <span>{selectedGenre}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-amber-950"
                  onClick={() => setSelectedGenre("all")}
                />
              </span>
            )}

            {selectedPublisher !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200/80 text-indigo-800 text-[11px] font-medium">
                <span>{selectedPublisher}</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-indigo-950"
                  onClick={() => setSelectedPublisher("all")}
                />
              </span>
            )}

            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-medium">
                <span>&quot;{searchQuery}&quot;</span>
                <X
                  className="w-3 h-3 cursor-pointer hover:text-slate-950"
                  onClick={() => setSearchQuery("")}
                />
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold ml-1 cursor-pointer hover:underline"
            >
              Reset
            </button>
          </div>
        )}

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-5 items-start mt-4">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-5 sticky top-20">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-amber-500" />
                Refine Books
              </h2>
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Categories */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-amber-500" /> Genres
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedGenre("all")}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                    selectedGenre === "all"
                      ? "bg-amber-500 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>All Genres</span>
                  <span
                    className={`text-[10px] ${
                      selectedGenre === "all"
                        ? "text-amber-100"
                        : "text-slate-400"
                    }`}
                  >
                    {books.length}
                  </span>
                </button>

                {isLoadingFilters ? (
                  <div className="py-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-amber-500" />
                    Loading...
                  </div>
                ) : (
                  genres.map((gen) => {
                    const genName = gen.name || gen.englishName || "";
                    const isSelected = selectedGenre === genName;
                    return (
                      <button
                        key={gen.id || genName}
                        type="button"
                        onClick={() => setSelectedGenre(genName)}
                        className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-amber-500 text-white font-semibold shadow-2xs"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">
                          {gen.name || gen.englishName}
                        </span>
                        {isSelected && <Check className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Publishers */}
            <div className="space-y-1.5">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-indigo-500" /> Publishers
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1">
                <button
                  type="button"
                  onClick={() => setSelectedPublisher("all")}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                    selectedPublisher === "all"
                      ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>All Publishers</span>
                </button>

                {isLoadingFilters ? (
                  <div className="py-3 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
                    Loading...
                  </div>
                ) : (
                  publishers.map((pub) => {
                    const pubName = pub.name || pub.englishName || "";
                    const isSelected = selectedPublisher === pubName;
                    return (
                      <button
                        key={pub.id || pubName}
                        type="button"
                        onClick={() => setSelectedPublisher(pubName)}
                        className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white font-semibold shadow-2xs"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">
                          {pub.name || pub.englishName}
                        </span>
                        {isSelected && <Check className="w-3 h-3 shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>

          {/* Right Column (Catalog) */}
          <section
            id="books-top"
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
                books
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium flex items-center gap-1 text-[11px]">
                  <ArrowUpDown className="w-3 h-3" /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                  <option value="sold">Best Selling</option>
                  <option value="title">Title (A to Z)</option>
                </select>
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
                    <div className="aspect-[4/5] w-full bg-slate-200 rounded-lg mb-2.5" />
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
            ) : displayedBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {displayedBooks.map((book) => {
                  const coverUrl = getCoverImage(book);
                  const priceNum = Number(book.price) || 0;
                  const discountNum = Number(book.discountPercent) || 0;
                  const discountedPrice =
                    discountNum > 0
                      ? priceNum - (priceNum * discountNum) / 100
                      : priceNum;
                  const genreName = getPrimaryGenreName(book);
                  const authorName = (book.authors || book.authorBooks || [])
                    .map(
                      (a: any) =>
                        a.name || a.englishName || a.author?.name || "",
                    )
                    .filter(Boolean)
                    .join(", ");
                  const isWishlisted = Boolean(
                    wishlistedBookIds[String(book.id)],
                  );
                  const isOutOfStock =
                    book.stock !== undefined &&
                    book.stock !== null &&
                    Number(book.stock) <= 0;

                  return (
                    <div
                      key={book.id}
                      className="bg-white rounded-xl border border-slate-200/90 p-2.5 sm:p-3 flex flex-col justify-between relative group hover:shadow-md hover:border-amber-400/70 transition-all duration-200"
                    >
                      {/* Discount and Wishlist overlay */}
                      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-10 pointer-events-none">
                        {discountNum > 0 ? (
                          <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs pointer-events-auto">
                            -{discountNum}%
                          </span>
                        ) : (
                          <span />
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleWishlist(book.id);
                          }}
                          className={`p-1.5 rounded-full shadow-2xs transition-colors cursor-pointer pointer-events-auto ${
                            isWishlisted
                              ? "bg-rose-50 text-rose-600 border border-rose-200"
                              : "bg-white/90 text-slate-400 hover:text-rose-500 border border-slate-200/60 hover:bg-white"
                          }`}
                          title={
                            isWishlisted
                              ? "Remove from wishlist"
                              : "Add to wishlist"
                          }
                        >
                          <Heart
                            className={`w-3 h-3 ${
                              isWishlisted ? "fill-rose-500 text-rose-500" : ""
                            }`}
                          />
                        </button>
                      </div>

                      <div>
                        {/* Responsive Aspect Cover */}
                        <Link href={`/books/${book.id}`} className="block">
                          <div className="relative aspect-[3/4] w-full bg-slate-50 rounded-lg overflow-hidden flex items-center justify-center mb-2 group-hover:scale-[1.01] transition-transform duration-200 border border-slate-100">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-slate-300">
                                <BookOpen className="w-7 h-7 mb-0.5" />
                                <span className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase">
                                  Book
                                </span>
                              </div>
                            )}

                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center p-1.5">
                                <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider">
                                  Out of Stock
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                        {genreName && (
                          <span className="inline-block text-[9px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mb-1 border border-amber-100/80 truncate max-w-full">
                            {genreName}
                          </span>
                        )}
                        <Link href={`/books/${book.id}`}>
                          <h2
                            className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1 leading-snug"
                            title={book.title}
                          >
                            {book.title}
                          </h2>
                        </Link>
                        {authorName && (
                          <p
                            className="text-[11px] text-slate-500 truncate mt-0.5"
                            title={authorName}
                          >
                            {authorName}
                          </p>
                        )}
                        <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            Rs. {discountedPrice.toLocaleString()}
                          </span>
                          {discountNum > 0 && (
                            <span className="text-[10px] text-slate-400 line-through">
                              Rs. {priceNum.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <Link
                          href={`/books/${book.id}`}
                          className="w-full bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-[11px] font-medium py-1.5 px-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-center"
                        >
                          <ShoppingCart className="w-3 h-3" />
                          <span>View Details</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 border border-amber-100">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  No books found
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-sm mx-auto">
                  We couldn&apos;t find any books matching your selected filters
                  or search keyword.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg font-semibold transition cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && (effectiveTotalPages > 1 || effectiveTotal > 10) && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-200">
                <div className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-semibold text-slate-800">
                    {(currentPage - 1) * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-slate-800">
                    {Math.min(currentPage * pageSize, effectiveTotal)}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {effectiveTotal}
                  </span>{" "}
                  books
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || isLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: effectiveTotalPages },
                      (_, i) => i + 1,
                    )
                      .filter((p) => {
                        if (effectiveTotalPages <= 7) return true;
                        if (p === 1 || p === effectiveTotalPages) return true;
                        if (Math.abs(p - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && p - prev > 1;

                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && (
                              <span className="px-1.5 text-slate-400 text-xs font-semibold">
                                ...
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handlePageChange(p)}
                              disabled={isLoading}
                              className={`min-w-[32px] h-8 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center justify-center ${
                                currentPage === p
                                  ? "bg-amber-500 text-white shadow-2xs font-bold"
                                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= effectiveTotalPages || isLoading}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Drawer */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileFilter(false)}
          />

          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto z-10 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-amber-500" />
                Filter Books
              </h3>
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 py-3 space-y-4">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2">
                  Genres & Categories
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedGenre("all")}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                      selectedGenre === "all"
                        ? "bg-amber-500 text-white font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>All Genres</span>
                    <span>{books.length}</span>
                  </button>
                  {genres.map((gen) => {
                    const genName = gen.name || gen.englishName || "";
                    const isSelected = selectedGenre === genName;
                    return (
                      <button
                        key={gen.id || genName}
                        type="button"
                        onClick={() => setSelectedGenre(genName)}
                        className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                          isSelected
                            ? "bg-amber-500 text-white font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">
                          {gen.name || gen.englishName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 mb-2">
                  Publishers
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPublisher("all")}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                      selectedPublisher === "all"
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>All Publishers</span>
                  </button>
                  {publishers.map((pub) => {
                    const pubName = pub.name || pub.englishName || "";
                    const isSelected = selectedPublisher === pubName;
                    return (
                      <button
                        key={pub.id || pubName}
                        type="button"
                        onClick={() => setSelectedPublisher(pubName)}
                        className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
                          isSelected
                            ? "bg-indigo-600 text-white font-bold"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">
                          {pub.name || pub.englishName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition"
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
