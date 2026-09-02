"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { axiosInstance } from "@/utils/axiosInstances";
import {
  ArrowRight,
  BookOpen,
  Layers,
  Loader2,
  Search,
  Tablet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";

export type SearchType = "book" | "ebook" | "all";

export interface SearchResultItem {
  id: number | string;
  title: string;
  price?: number | string;
  discountPercent?: number | string;
  type: "book" | "ebook";
  authors?: any[];
  authorBooks?: any[];
  genres?: any[];
  genreBooks?: any[];
  images?: any[];
  bookImages?: any[];
  coverImage?: string;
  image?: string;
  imageUrl?: string;
  [key: string]: any;
}

interface HeaderSearchProps {
  className?: string;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export default function HeaderSearch({
  className = "",
  isMobile = false,
  onNavigate,
}: HeaderSearchProps) {
  const [searchType, setSearchType] = useState<SearchType>("all");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Perform search based on the chosen book type
  const performSearch = useCallback(
    async (searchTerm: string, type: SearchType) => {
      const trimmed = searchTerm.trim();
      if (!trimmed) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        if (type === "book") {
          // 1. Search ONLY Physical Books: /v1/book?search=...
          const res = await axiosInstance.get(
            `/v1/book?search=${encodeURIComponent(trimmed)}&limit=8`,
          );
          const data = res.data?.data || res.data?.books || res.data || [];
          const list: any[] = Array.isArray(data) ? data : [];
          setResults(
            list.map((item) => ({
              ...item,
              type: "book" as const,
            })),
          );
        } else if (type === "ebook") {
          // 2. Search ONLY E-Books: /v1/ebook?search=...
          let res;
          try {
            res = await axiosInstance.get(
              `/v1/ebook?search=${encodeURIComponent(trimmed)}&limit=8`,
            );
          } catch {
            res = await axiosInstance.get(
              `/v1/eBook?search=${encodeURIComponent(trimmed)}&limit=8`,
            );
          }
          const data =
            res?.data?.data ||
            res?.data?.eBooks ||
            res?.data?.ebooks ||
            res?.data ||
            [];
          const list: any[] = Array.isArray(data) ? data : [];
          setResults(
            list.map((item) => ({
              ...item,
              type: "ebook" as const,
            })),
          );
        } else {
          // 3. Search Both
          const [booksRes, ebooksRes] = await Promise.allSettled([
            axiosInstance.get(
              `/v1/book?search=${encodeURIComponent(trimmed)}&limit=5`,
            ),
            axiosInstance
              .get(`/v1/ebook?search=${encodeURIComponent(trimmed)}&limit=5`)
              .catch(() =>
                axiosInstance.get(
                  `/v1/eBook?search=${encodeURIComponent(trimmed)}&limit=5`,
                ),
              ),
          ]);

          const combined: SearchResultItem[] = [];

          if (booksRes.status === "fulfilled") {
            const d = booksRes.value.data;
            const list = Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : d?.books || [];
            list.forEach((item: any) =>
              combined.push({ ...item, type: "book" }),
            );
          }

          if (ebooksRes.status === "fulfilled") {
            const d = ebooksRes.value.data;
            const list = Array.isArray(d?.data)
              ? d.data
              : Array.isArray(d)
                ? d
                : d?.eBooks || d?.ebooks || [];
            list.forEach((item: any) =>
              combined.push({ ...item, type: "ebook" }),
            );
          }

          setResults(combined);
        }
      } catch (error) {
        console.error("Search API error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Debounce search when query or searchType changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsOpen(true);
    const timeoutId = setTimeout(() => {
      performSearch(query, searchType);
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [query, searchType, performSearch]);

  const handleTypeSelect = (type: SearchType) => {
    setSearchType(type);
    if (query.trim()) {
      performSearch(query, type);
    }
    inputRef.current?.focus();
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setIsOpen(false);
    if (onNavigate) onNavigate();

    if (searchType === "ebook") {
      router.push(`/eBooks?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push(`/books?search=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleItemClick = () => {
    setIsOpen(false);
    setQuery("");
    if (onNavigate) onNavigate();
  };

  const getCoverImage = (item: SearchResultItem): string | null => {
    if (typeof item.coverImage === "string" && item.coverImage)
      return item.coverImage;
    if (typeof item.image === "string" && item.image) return item.image;
    if (typeof item.imageUrl === "string" && item.imageUrl)
      return item.imageUrl;

    const list = item.images || item.bookImages || [];
    if (list.length === 0) return null;

    const cover = list.find(
      (img: any) =>
        typeof img === "object" &&
        (img.type === "COVER" || img.imageType === "COVER"),
    );
    if (cover && typeof cover === "object") {
      return cover.url || cover.imageUrl || null;
    }

    const first = list[0];
    if (typeof first === "string") return first;
    if (typeof first === "object") return first.url || first.imageUrl || null;
    return null;
  };

  const getAuthorName = (item: SearchResultItem): string => {
    const authors = item.authors || item.authorBooks || [];
    if (authors.length === 0) return "";
    return authors
      .map((a: any) => a.name || a.englishName || a.author?.name || "")
      .filter(Boolean)
      .join(", ");
  };

  const getGenreName = (item: SearchResultItem): string => {
    const genres = item.genres || item.genreBooks || [];
    if (genres.length === 0) return "";
    return (
      genres[0].name || genres[0].englishName || genres[0].genre?.name || ""
    );
  };

  const getPlaceholderText = () => {
    if (searchType === "ebook") {
      return isMobile
        ? "Search E-Books, authors..."
        : "Search digital e-books, authors, formats...";
    }
    if (searchType === "all") {
      return isMobile
        ? "Search all books & e-books..."
        : "Search all books, e-books, authors, ISBN...";
    }
    return isMobile
      ? "Search books, authors, ISBN..."
      : "Search physical books, authors, ISBN...";
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Bar Input Container */}
      <form
        onSubmit={handleSubmit}
        className={`flex h-9 w-full overflow-hidden rounded-lg border border-[#0F2557] bg-white transition-all ${
          isOpen ? "ring-2 ring-indigo-500/20 shadow-md border-indigo-600" : ""
        }`}
      >
        {/* 1. LEFT: Shadcn Select for Book Type */}
        <div className="relative shrink-0 flex items-center">
          <Select
            value={searchType}
            onValueChange={(val) => {
              if (val) handleTypeSelect(val as SearchType);
            }}
          >
            <SelectTrigger className="h-full w-auto min-w-[80px] sm:min-w-[95px] rounded-none rounded-l-lg border-0 border-r border-gray-200 bg-gray-50/90 px-2 sm:px-2.5 text-[11px] sm:text-xs font-bold text-gray-800 shadow-none hover:bg-gray-100 focus:ring-0 focus:border-gray-200 transition-colors">
              <SelectValue placeholder="Books" />
            </SelectTrigger>
            <SelectContent className="z-50 bg-white border border-gray-200 shadow-xl rounded-xl p-1 min-w-[140px]">
              <SelectItem
                value="all"
                className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50 py-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <Layers size={13} className="text-indigo-600" />
                  <span>All Types</span>
                </div>
              </SelectItem>
              <SelectItem
                value="book"
                className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50 py-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <BookOpen size={13} className="text-amber-600" />
                  <span>Books</span>
                </div>
              </SelectItem>
              <SelectItem
                value="ebook"
                className="text-xs font-medium cursor-pointer rounded-lg hover:bg-gray-50 py-1.5"
              >
                <div className="flex items-center gap-1.5">
                  <Tablet size={13} className="text-purple-600" />
                  <span>E-Books</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 2. MIDDLE: Search Text Input */}
        <div className="relative flex min-w-0 flex-1 items-center">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim()) setIsOpen(true);
            }}
            placeholder={getPlaceholderText()}
            className="w-full min-w-0 pl-3 pr-8 text-xs text-gray-800 outline-none placeholder:text-gray-400"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute right-2 text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* 3. RIGHT: Search Button */}
        <button
          type="submit"
          className="flex w-9 sm:w-10 shrink-0 items-center justify-center bg-[#1749A0] text-white transition-colors hover:bg-[#0F2557] cursor-pointer"
          aria-label="Search"
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Search size={14} strokeWidth={2} />
          )}
        </button>
      </form>

      {/* 4. Live Search Dropdown Popover */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header Bar showing current search type */}
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-3 py-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-gray-500">
                Searching in:
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                  searchType === "ebook"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : searchType === "all"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {searchType === "ebook" ? (
                  <>
                    <Tablet size={11} /> E-Books
                  </>
                ) : searchType === "all" ? (
                  <>
                    <Layers size={11} /> All Categories
                  </>
                ) : (
                  <>
                    <BookOpen size={11} /> Physical Books
                  </>
                )}
              </span>
            </div>

            {isLoading ? (
              <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                <Loader2 size={11} className="animate-spin text-indigo-600" />
                <span>Searching...</span>
              </span>
            ) : (
              <span className="text-[11px] text-gray-400 font-medium">
                {results.length} results
              </span>
            )}
          </div>

          {/* Results List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-50 p-1.5">
            {isLoading && results.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin text-indigo-600" />
                <span>
                  Searching {searchType === "ebook" ? "e-books" : "books"}...
                </span>
              </div>
            ) : results.length > 0 ? (
              results.map((item) => {
                const cover = getCoverImage(item);
                const author = getAuthorName(item);
                const genre = getGenreName(item);
                const isEbook = item.type === "ebook";
                const targetUrl = isEbook
                  ? `/eBooks/${item.id}`
                  : `/books/${item.id}`;
                const priceNum = Number(item.price) || 0;
                const discountNum = Number(item.discountPercent) || 0;
                const netPrice =
                  discountNum > 0
                    ? priceNum - (priceNum * discountNum) / 100
                    : priceNum;

                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={targetUrl}
                    onClick={handleItemClick}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Thumbnail */}
                      <div className="relative h-12 w-9 rounded-md bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                        {cover ? (
                          <img
                            src={cover}
                            alt={item.title}
                            className="h-full w-full object-cover"
                          />
                        ) : isEbook ? (
                          <Tablet size={16} className="text-gray-400" />
                        ) : (
                          <BookOpen size={16} className="text-gray-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              isEbook
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {isEbook ? "E-Book" : "Book"}
                          </span>
                          {genre && (
                            <span className="text-[9px] text-gray-500 font-medium truncate max-w-[120px]">
                              {genre}
                            </span>
                          )}
                        </div>

                        <h4
                          className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition truncate mt-0.5"
                          title={item.title}
                        >
                          {item.title}
                        </h4>

                        {author && (
                          <p className="text-[10px] text-gray-400 truncate">
                            by {author}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0 pl-2">
                      <p className="text-xs font-black text-gray-900">
                        Rs. {netPrice.toLocaleString()}
                      </p>
                      {discountNum > 0 && (
                        <p className="text-[10px] text-rose-500 font-bold">
                          -{discountNum}%
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="py-8 px-4 text-center">
                <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-2">
                  <Search size={15} />
                </div>
                <p className="text-xs font-bold text-gray-700">
                  No {searchType === "ebook" ? "e-books" : "books"} found for
                  &quot;{query}&quot;
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Try checking for typos or switch the search type to &quot;
                  {searchType === "book" ? "E-Books" : "Books"}&quot;.
                </p>
              </div>
            )}
          </div>

          {/* Footer View All Link */}
          {results.length > 0 && (
            <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 text-center">
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
              >
                <span>
                  View all {searchType === "ebook" ? "e-book" : "book"} results
                  for &quot;{query}&quot;
                </span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
