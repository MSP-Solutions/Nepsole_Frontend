"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import { axiosInstance } from "@/utils/axiosInstances";
import {
  ArrowUpDown,
  Bookmark,
  BookOpen,
  Building2,
  Check,
  ChevronRight,
  Cloud,
  FileText,
  Filter,
  Heart,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tablet,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export interface BookAuthor {
  id: number | string;
  name?: string;
  englishName?: string;
  author?: {
    id: number | string;
    name?: string;
    englishName?: string;
  };
  [key: string]: any;
}

export interface BookGenre {
  id: number | string;
  name?: string;
  englishName?: string;
  genre?: {
    id: number | string;
    name?: string;
  };
  [key: string]: any;
}

export interface BookPublisher {
  id: number | string;
  name?: string;
  englishName?: string;
  publicationLogoUrl?: string;
  [key: string]: any;
}

export interface BookImage {
  id?: number | string;
  url?: string;
  imageUrl?: string;
  imageType?: string;
  type?: string;
  [key: string]: any;
}

export interface EBookItem {
  id: number | string;
  title: string;
  price: number | string;
  discountPercent?: number | string;
  stock?: number;
  soldCount?: number;
  publicationDate?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number | string;
  description?: string;
  publisherId?: number | string;
  publisher?: BookPublisher;
  authors?: BookAuthor[];
  authorBooks?: BookAuthor[];
  genres?: BookGenre[];
  genreBooks?: BookGenre[];
  images?: (BookImage | string)[];
  bookImages?: BookImage[];
  createdAt?: string;
  updatedAt?: string;
  formats?: string[];
  fileSizeMb?: number | string;
  [key: string]: any;
}

export interface OptionItem {
  id: number | string;
  name: string;
  englishName?: string;
  publicationLogoUrl?: string;
  [key: string]: any;
}

export default function EBooksPage() {
  const [eBooks, setEBooks] = useState<EBookItem[]>([]);
  const [genres, setGenres] = useState<OptionItem[]>([]);
  const [publishers, setPublishers] = useState<OptionItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingFilters, setIsLoadingFilters] = useState<boolean>(true);

  // Filter States
  const [selectedGenreId, setSelectedGenreId] = useState<string>("all");
  const [selectedPublisherId, setSelectedPublisherId] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [showMobileFilter, setShowMobileFilter] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});

  // Fetch Filter Options
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
        console.error("Failed to load eBook filters:", err);
      } finally {
        setIsLoadingFilters(false);
      }
    };

    fetchFilterOptions();
  }, []);

  // Fetch E-Books
  const fetchEBooks = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get("/v1/ebook");
      const data = response.data?.data || response.data;
      const list = Array.isArray(data)
        ? data
        : data?.books || data?.items || [];
      setEBooks(list);
    } catch (err) {
      console.error("Failed to fetch eBooks:", err);
      toast.error("Failed to load e-books.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEBooks();
  }, []);

  // Helpers
  const getCoverImage = (book: EBookItem): string | null => {
    if (book.coverImageUrl) return book.coverImageUrl;
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

  const getAuthorsString = (book: EBookItem): string => {
    const list = book.authors || book.authorBooks || [];
    if (list.length === 0) return "Renowned Author";
    return list
      .map((a) => a.name || a.englishName || a.author?.name || "Author")
      .join(", ");
  };

  const getPrimaryGenreName = (book: EBookItem): string => {
    const list = book.genres || book.genreBooks || [];
    if (list.length === 0) return "Digital Edition";
    return (
      list[0].name || list[0].englishName || list[0].genre?.name || "E-Book"
    );
  };

  const toggleWishlist = (id: number | string) => {
    setWishlist((prev) => ({
      ...prev,
      [String(id)]: !prev[String(id)],
    }));
    toast.success(
      wishlist[String(id)]
        ? "Removed from your eBook wishlist"
        : "Added to your eBook wishlist!",
    );
  };

  // Filter & Sort Logic
  const filteredEBooks = useMemo(() => {
    return eBooks
      .filter((book) => {
        if (selectedGenreId !== "all") {
          const hasGenre = (book.genres || book.genreBooks || []).some((g) => {
            const gId = String(g.id || g.genre?.id || "");
            return gId === selectedGenreId;
          });
          if (!hasGenre) return false;
        }

        if (selectedPublisherId !== "all") {
          const pubId = String(book.publisherId || book.publisher?.id || "");
          if (pubId !== selectedPublisherId) return false;
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

        if (sortBy === "price-asc") return netA - netB;
        if (sortBy === "price-desc") return netB - netA;
        if (sortBy === "discount") return discountB - discountA;
        if (sortBy === "newest") {
          return (
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
          );
        }
        return 0;
      });
  }, [eBooks, selectedGenreId, selectedPublisherId, searchQuery, sortBy]);

  const activeFiltersCount =
    (selectedGenreId !== "all" ? 1 : 0) +
    (selectedPublisherId !== "all" ? 1 : 0) +
    (selectedFormat !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedGenreId("all");
    setSelectedPublisherId("all");
    setSelectedFormat("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  const selectedGenreObj = genres.find((g) => String(g.id) === selectedGenreId);
  const selectedPublisherObj = publishers.find(
    (p) => String(p.id) === selectedPublisherId,
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      <TopHeader />
      <Header />

      <main className="flex-1 w-full">
        <section className="relative overflow-hidden bg-gradient-to-br from-[#07132e] via-[#0c1f4d] to-[#122e6b] text-white py-12 md:py-16 border-b border-indigo-950">
          <div className="absolute top-0 right-1/4 -mt-12 h-80 w-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs text-indigo-300/80 font-medium">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-white">E-Books</span>
            </nav>

            <div className="mt-4 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  Discover & Read <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-200 to-indigo-200">
                    Premium E-Books
                  </span>
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* Main Catalog Content */}
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 py-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowMobileFilter(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="h-4 w-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {filteredEBooks.length}
                </span>{" "}
                of {eBooks.length} E-Books
              </span>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
                  Sort by:
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="featured">Featured First</option>
                    <option value="newest">Newest Releases</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="discount">Biggest Discount</option>
                  </select>
                  <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Badges */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-indigo-500" /> Active Filters:
              </span>

              {selectedGenreId !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-medium">
                  <span>
                    Genre:{" "}
                    {selectedGenreObj?.name || selectedGenreObj?.englishName}
                  </span>
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-950 ml-0.5"
                    onClick={() => setSelectedGenreId("all")}
                  />
                </span>
              )}

              {selectedPublisherId !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                  <span>
                    Publisher:{" "}
                    {selectedPublisherObj?.name ||
                      selectedPublisherObj?.englishName}
                  </span>
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-emerald-950 ml-0.5"
                    onClick={() => setSelectedPublisherId("all")}
                  />
                </span>
              )}

              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                  <span>&quot;{searchQuery}&quot;</span>
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-slate-950 ml-0.5"
                    onClick={() => setSearchQuery("")}
                  />
                </span>
              )}

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold ml-2 cursor-pointer hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Catalog Layout: Sidebar + Products */}
          <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-6 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-600" />
                  E-Book Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Genres Filter */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                  Categories
                </h3>
                <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedGenreId("all")}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                      selectedGenreId === "all"
                        ? "bg-indigo-600 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>All Categories</span>
                    <span
                      className={`text-[10px] ${
                        selectedGenreId === "all"
                          ? "text-indigo-100 font-bold"
                          : "text-slate-400"
                      }`}
                    >
                      {eBooks.length}
                    </span>
                  </button>

                  {genres.map((genre) => {
                    const isSelected = String(genre.id) === selectedGenreId;
                    return (
                      <button
                        key={genre.id}
                        type="button"
                        onClick={() => setSelectedGenreId(String(genre.id))}
                        className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white font-semibold shadow-xs"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">
                          {genre.name || genre.englishName}
                        </span>
                        {isSelected && <Check className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Publishers Filter */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                  Publishers
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedPublisherId("all")}
                    className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                      selectedPublisherId === "all"
                        ? "bg-indigo-600 text-white font-semibold shadow-xs"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>All Publishers</span>
                  </button>

                  {publishers.map((pub) => {
                    const isSelected = String(pub.id) === selectedPublisherId;
                    return (
                      <button
                        key={pub.id}
                        type="button"
                        onClick={() => setSelectedPublisherId(String(pub.id))}
                        className={`w-full text-left px-3 py-2 rounded-xl transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white font-semibold shadow-xs"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className="truncate">
                          {pub.name || pub.englishName}
                        </span>
                        {isSelected && <Check className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Product Grid Area */}
            <div className="lg:col-span-3 xl:col-span-4">
              {isLoading ? (
                /* Loading Skeleton Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm animate-pulse flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="aspect-[3/4] bg-slate-200 rounded-xl" />
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
                        <div className="h-4 bg-slate-200 rounded w-16" />
                        <div className="h-4 bg-slate-200 rounded w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredEBooks.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center p-8 shadow-sm space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <BookOpen className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">
                      No E-Books Found
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      {searchQuery
                        ? `No digital books match "${searchQuery}". Try searching for another title or clear filters.`
                        : "There are currently no e-books matching the selected criteria."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                /* Grid View */
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {filteredEBooks.map((book) => {
                    const coverUrl = getCoverImage(book);
                    const authors = getAuthorsString(book);
                    const genreName = getPrimaryGenreName(book);
                    const priceNum = Number(book.price) || 0;
                    const discountNum = Number(book.discountPercent) || 0;
                    const discountedPrice =
                      discountNum > 0
                        ? priceNum - (priceNum * discountNum) / 100
                        : priceNum;
                    const isWish = !!wishlist[String(book.id)];

                    return (
                      <div
                        key={book.id}
                        className="group flex flex-col justify-between bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 relative overflow-hidden"
                      >
                        {/* Top Area */}
                        <div>
                          {/* Book Cover Image Container */}
                          <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 mb-3 shadow-inner">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={book.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
                                <BookOpen className="w-8 h-8 text-indigo-400 mb-2" />
                                <span className="text-xs font-bold line-clamp-2">
                                  {book.title}
                                </span>
                              </div>
                            )}

                            {/* Format & Plan Badge (Top Left) */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                              <span
                                className={`px-2 py-0.5 rounded-md text-white text-[10px] font-bold shadow-sm flex items-center gap-1 ${
                                  (book.plan && book.plan.toUpperCase() === "FREE") || Number(book.price || 0) === 0
                                    ? "bg-emerald-600"
                                    : "bg-indigo-600"
                                }`}
                              >
                                {(book.plan && book.plan.toUpperCase() === "FREE") || Number(book.price || 0) === 0
                                  ? "FREE"
                                  : "PAID"}
                              </span>
                              {discountNum > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold shadow-sm self-start">
                                  -{discountNum}%
                                </span>
                              )}
                            </div>

                            {/* Wishlist Heart Button (Top Right) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist(book.id);
                              }}
                              className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-colors z-10 cursor-pointer shadow-sm ${
                                isWish
                                  ? "bg-rose-50 text-rose-600"
                                  : "bg-black/30 text-white hover:bg-black/50"
                              }`}
                              title={
                                isWish
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              <Heart
                                className={`w-3.5 h-3.5 ${
                                  isWish ? "fill-rose-600" : ""
                                }`}
                              />
                            </button>
                          </div>

                          {/* Details */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                              {genreName}
                            </span>

                            <Link href={`/eBooks/${book.id}`}>
                              <h3
                                className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer"
                                title={book.title}
                              >
                                {book.title}
                              </h3>
                            </Link>

                            <p className="text-[11px] text-slate-500 truncate">
                              {authors}
                            </p>
                          </div>
                        </div>

                        {/* Bottom Action */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                          <Link
                            href={`/eBooks/${book.id}`}
                            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                          >
                            <span>Read</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Drawer Filter Modal */}
      {showMobileFilter && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs lg:hidden">
          <div className="w-full max-w-xs bg-white h-full p-5 overflow-y-auto flex flex-col justify-between space-y-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-600" /> Filter E-Books
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMobileFilter(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Categories */}
              <div className="mt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Categories
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedGenreId("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      selectedGenreId === "all"
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-700 bg-slate-50"
                    }`}
                  >
                    All Categories
                  </button>
                  {genres.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedGenreId(String(g.id))}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                        selectedGenreId === String(g.id)
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-700 bg-slate-50"
                      }`}
                    >
                      {g.name || g.englishName}
                    </button>
                  ))}
                </div>
              </div>

              {/* Publishers */}
              <div className="mt-5 space-y-2 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Publishers
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPublisherId("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                      selectedPublisherId === "all"
                        ? "bg-indigo-600 text-white font-bold"
                        : "text-slate-700 bg-slate-50"
                    }`}
                  >
                    All Publishers
                  </button>
                  {publishers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPublisherId(String(p.id))}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${
                        selectedPublisherId === String(p.id)
                          ? "bg-indigo-600 text-white font-bold"
                          : "text-slate-700 bg-slate-50"
                      }`}
                    >
                      {p.name || p.englishName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowMobileFilter(false)}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
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
