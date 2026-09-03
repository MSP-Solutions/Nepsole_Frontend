"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import { CART_CHANGE_EVENT, getUserCookie } from "@/utils/cookies";
import { parseQuillContent } from "@/utils/quillDecoder";
import {
  Award,
  Barcode,
  BookOpen,
  Building2,
  Calendar,
  ChevronRight,
  Eye,
  Heart,
  Languages,
  Layers,
  Loader2,
  Maximize2,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Truck,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import BookReviews from "@/components/books/BookReviews";

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

export interface BookLanguage {
  id: number | string;
  name?: string;
  code?: string;
  language?: {
    id: number | string;
    name?: string;
    code?: string;
  };
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

export interface BookDetail {
  id: number | string;
  title: string;
  price: number | string;
  discountPercent?: number | string;
  stock: number;
  soldCount?: number;
  publicationDate?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number | string;
  description?: string;
  widthCm?: number | string;
  heightCm?: number | string;
  depthCm?: number | string;
  publisherId?: number | string;
  publisher?: BookPublisher;
  authors?: BookAuthor[];
  authorBooks?: BookAuthor[];
  genres?: BookGenre[];
  genreBooks?: BookGenre[];
  languages?: BookLanguage[];
  languageBooks?: BookLanguage[];
  images?: (BookImage | string)[];
  bookImages?: BookImage[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<BookDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("Description");
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(0);

  // Fetch Book Details from /v1/book/:id
  useEffect(() => {
    const fetchBookData = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(`/v1/book/${id}`);
        const data = response.data?.data || response.data;
        setBook(data);
        setSelectedImageIndex(0);
      } catch (err) {
        console.error("Failed to load book details:", err);
        toast.error("Failed to load book details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBookData();
    }
  }, [id]);

  // Fetch Recommended / Related Books
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const response = await axiosInstance.get("/v1/book");
        const data = response.data?.data || response.data;
        const list = Array.isArray(data)
          ? data
          : data?.books || data?.items || [];
        setRecommendedBooks(
          list.filter((b: BookDetail) => String(b.id) !== id),
        );
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      }
    };

    const fetchReviewsSummary = async () => {
      try {
        let res;
        try {
          res = await axiosInstance.get(`/v1/reviews/book/${id}`);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            res = await axiosInstance.get(`/api/v1/reviews/book/${id}`);
          } else {
            throw err;
          }
        }

        const data = res?.data?.data || res?.data?.reviews || res?.data || [];
        const list = Array.isArray(data) ? data : [];
        const total = list.length;
        const sum = list.reduce(
          (acc: number, r: any) => acc + (Number(r.rating) || 0),
          0,
        );
        setReviewsCount(total);
        setAvgRating(total > 0 ? Number((sum / total).toFixed(1)) : 0);
      } catch {
        // reviews might be empty
      }
    };

    if (id) {
      fetchRecommended();
      fetchReviewsSummary();
    }
  }, [id]);

  // Image helpers
  const allImages = React.useMemo(() => {
    if (!book) return [];
    const imgs = book.images || book.bookImages || [];
    return imgs
      .map((img: any, idx: number) => {
        if (typeof img === "string") {
          return { url: img, type: idx === 0 ? "COVER" : "INSIDE" };
        }
        return {
          url: img.url || img.imageUrl || "",
          type: img.imageType || img.type || (idx === 0 ? "COVER" : "INSIDE"),
        };
      })
      .filter((img) => Boolean(img.url));
  }, [book]);

  const currentImageUrl =
    allImages.length > 0
      ? allImages[selectedImageIndex]?.url || allImages[0]?.url
      : null;

  const currentImageType =
    allImages.length > 0
      ? allImages[selectedImageIndex]?.type || "COVER"
      : "COVER";

  // Authors & Genres strings
  const authorsList = React.useMemo(() => {
    if (!book) return [];
    return (book.authors || book.authorBooks || []).map((a: any) => ({
      id: a.id || a.author?.id,
      name:
        a.name ||
        a.englishName ||
        a.author?.name ||
        a.author?.englishName ||
        "Unknown Author",
    }));
  }, [book]);

  const genresList = React.useMemo(() => {
    if (!book) return [];
    return (book.genres || book.genreBooks || []).map((g: any) => ({
      id: g.id || g.genre?.id,
      name: g.name || g.englishName || g.genre?.name || "General",
    }));
  }, [book]);

  const languagesList = React.useMemo(() => {
    if (!book) return [];
    return (book.languages || book.languageBooks || []).map((l: any) => ({
      id: l.id || l.language?.id,
      name: l.name || l.englishName || l.language?.name || "Language",
      code: l.code || l.language?.code || "",
    }));
  }, [book]);

  // Price calculations
  const priceNum = Number(book?.price) || 0;
  const discountNum = Number(book?.discountPercent) || 0;
  const discountedPrice =
    discountNum > 0 ? priceNum - (priceNum * discountNum) / 100 : priceNum;
  const savingsAmount = priceNum - discountedPrice;
  const isOutOfStock = Number(book?.stock) <= 0;

  const featureBadges = [
    {
      icon: ShieldCheck,
      title: "100% Original Books",
      sub: "Genuine & Authentic",
    },
    {
      icon: Truck,
      title: "Fast Delivery in Nepal",
      sub: "2-4 business days",
    },
    {
      icon: RotateCcw,
      title: "7 Days Easy Return",
      sub: "No Questions Asked",
    },
    {
      icon: Package,
      title: "Secure Packaging",
      sub: "Safe & Tamper Proof",
    },
    {
      icon: Award,
      title: "Best Price Guarantee",
      sub: "Unbeatable Prices",
    },
  ];

  // Helper for cover image
  const getCoverImageForCart = (b: BookDetail): string | undefined => {
    const list = b.images || b.bookImages || [];
    if (!list.length) return undefined;
    const cover: any = list.find((img: any) =>
      typeof img === "object" && (img?.imageType === "COVER" || img?.type === "COVER")
    );
    if (cover && typeof cover === "object") return cover.url || cover.imageUrl;
    const first: any = list[0];
    if (typeof first === "string") return first;
    if (typeof first === "object") return first?.url || first?.imageUrl;
    return undefined;
  };

  // Add to Cart handler (/v1/cart)
  const handleAddToCart = async (showToast = true): Promise<boolean> => {
    if (!book) return false;
    setIsAddingToCart(true);

    try {
      const user = await getUserCookie();
      const numId = Number(book.id) || Number(id);

      if (user?.accessToken) {
        // User is logged in: Call POST /v1/cart
        try {
          await axiosAuthInstance.post("/v1/cart", {
            bookId: !isNaN(numId) ? numId : id,
            quantity: quantity,
          });
        } catch (err: any) {
          if (err?.response?.status === 404) {
            await axiosAuthInstance.post("/api/v1/cart", {
              bookId: !isNaN(numId) ? numId : id,
              quantity: quantity,
            });
          } else {
            throw err;
          }
        }
      }

      // Sync local cart for fallback/guest support
      try {
        const coverImg = getCoverImageForCart(book);
        const primaryAuthor = authorsList[0]?.name || "Nepsole Author";
        const primaryGenre = genresList[0]?.name || "General";

        const saved = localStorage.getItem("nepsole_cart");
        let currentCart: any[] = [];
        if (saved) {
          try {
            currentCart = JSON.parse(saved);
          } catch {}
        }
        if (!Array.isArray(currentCart)) currentCart = [];

        const existingIdx = currentCart.findIndex(
          (c: any) => String(c.bookId) === String(book.id) || String(c.id) === String(book.id)
        );

        if (existingIdx >= 0) {
          currentCart[existingIdx].quantity = (currentCart[existingIdx].quantity || 1) + quantity;
        } else {
          currentCart.push({
            id: `item-${book.id}-${Date.now()}`,
            bookId: book.id,
            title: book.title,
            author: primaryAuthor,
            price: discountedPrice,
            originalPrice: priceNum,
            discountPercent: discountNum,
            quantity: quantity,
            coverImage: coverImg,
            format: "Paperback",
            stock: Number(book.stock) || 10,
            genre: primaryGenre,
          });
        }

        localStorage.setItem("nepsole_cart", JSON.stringify(currentCart));
      } catch {}

      // Notify header and other components
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CART_CHANGE_EVENT));
      }

      if (showToast) {
        toast.success(`Added ${quantity} copy(ies) to cart!`);
      }
      return true;
    } catch (error: any) {
      console.error("Add to Cart Error:", error);
      toast.error(error?.response?.data?.message || "Failed to add book to cart.");
      return false;
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const success = await handleAddToCart(false);
    if (success) {
      router.push("/cart");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <TopHeader />
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-3" />
          <p className="text-sm font-semibold text-slate-700">
            Loading book details...
          </p>
          <p className="text-xs text-slate-400 mt-1">Please wait a moment</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        <TopHeader />
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Book Not Found</h1>
          <p className="text-xs text-slate-500 mt-1">
            The book you are looking for does not exist or has been removed.
          </p>
          <Link
            href="/books"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-semibold rounded-xl transition"
          >
            <BookOpen className="w-4 h-4" />
            Back to Books Catalog
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 text-sm">
      <TopHeader />
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
          <Link href="/" className="hover:text-amber-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link
            href="/books"
            className="hover:text-amber-600 transition-colors"
          >
            Books
          </Link>
          {genresList.length > 0 && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <Link
                href={`/books?genre=${genresList[0].id}`}
                className="hover:text-amber-600 transition-colors text-slate-600"
              >
                {genresList[0].name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-sm">
            {book.title}
          </span>
        </nav>

        {/* Top Product Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          {/* Left: Gallery (Thumbnails + Main Image) */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4">
            {/* Thumbnails list */}
            {allImages.length > 1 && (
              <div className="flex sm:flex-col gap-2.5 order-2 sm:order-1 overflow-x-auto sm:overflow-y-auto max-h-[380px] pr-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-20 rounded-lg border-2 overflow-hidden transition-all shrink-0 cursor-pointer ${
                      selectedImageIndex === idx
                        ? "border-amber-500 ring-2 ring-amber-500/20"
                        : "border-slate-200 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Preview Container */}
            <div className="flex-1 order-1 sm:order-2 flex flex-col items-center">
              <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-50 p-2 flex items-center justify-center">
                {currentImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentImageUrl}
                    alt={book.title}
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-300">
                    <BookOpen className="w-16 h-16 mb-2" />
                    <span className="text-xs text-slate-400 font-semibold uppercase">
                      No Image
                    </span>
                  </div>
                )}

                {discountNum > 0 && (
                  <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
                    -{discountNum}% OFF
                  </span>
                )}

                <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold uppercase tracking-wider backdrop-blur-xs">
                  {currentImageType}
                </span>
              </div>

              <div className="flex items-center justify-center gap-3 mt-4 w-full">
                <button
                  type="button"
                  onClick={() => {
                    if (currentImageUrl) window.open(currentImageUrl, "_blank");
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Full Image
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Link copied to clipboard!");
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Book
                </button>
              </div>
            </div>
          </div>

          {/* Middle: Details & Meta */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {genresList.map((g) => (
                  <span
                    key={g.id}
                    className="inline-block bg-amber-50 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-md border border-amber-200"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                {book.title}
              </h1>

              {/* Rating & Review quick anchor */}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("Customer Reviews");
                    const el = document.getElementById("book-tabs-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-1.5 text-xs text-amber-600 hover:underline cursor-pointer group"
                >
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(avgRating)
                            ? "fill-amber-400 text-amber-400 drop-shadow-2xs"
                            : "fill-slate-100 text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-900">
                    {avgRating > 0 ? avgRating : "0.0"}
                  </span>
                  <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                    ({reviewsCount} {reviewsCount === 1 ? "review" : "reviews"})
                  </span>
                </button>
              </div>
            </div>

            {/* Author */}
            {authorsList.length > 0 && (
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="text-slate-500">By</span>
                {authorsList.map((auth, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-100"
                  >
                    <User className="w-3 h-3 text-indigo-500" />
                    {auth.name}
                  </span>
                ))}
              </div>
            )}

            {/* Publisher & Specs */}
            <div className="grid grid-cols-2 gap-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
              {book.publisher && (
                <>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />{" "}
                    Publisher:
                  </span>
                  <span className="font-semibold text-slate-800 truncate">
                    {book.publisher.name || book.publisher.englishName}
                  </span>
                </>
              )}

              {book.publicationDate && (
                <>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />{" "}
                    Published:
                  </span>
                  <span className="font-medium text-slate-800">
                    {new Date(book.publicationDate).toLocaleDateString()}
                  </span>
                </>
              )}

              {languagesList.length > 0 && (
                <>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Languages className="w-3.5 h-3.5 text-slate-400" />{" "}
                    Language:
                  </span>
                  <span className="font-medium text-slate-800">
                    {languagesList.map((l) => l.name).join(", ")}
                  </span>
                </>
              )}

              {book.pages && (
                <>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" /> Pages:
                  </span>
                  <span className="font-medium text-slate-800">
                    {book.pages} pages
                  </span>
                </>
              )}

              {book.isbn13 && (
                <>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Barcode className="w-3.5 h-3.5 text-slate-400" /> ISBN-13:
                  </span>
                  <span className="font-mono text-slate-800">
                    {book.isbn13}
                  </span>
                </>
              )}

              {book.isbn10 && (
                <>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Barcode className="w-3.5 h-3.5 text-slate-400" /> ISBN-10:
                  </span>
                  <span className="font-mono text-slate-800">
                    {book.isbn10}
                  </span>
                </>
              )}

              {(book.widthCm || book.heightCm || book.depthCm) && (
                <>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Maximize2 className="w-3.5 h-3.5 text-slate-400" />{" "}
                    Dimensions:
                  </span>
                  <span className="font-medium text-slate-800">
                    {book.widthCm || "—"} × {book.heightCm || "—"} ×{" "}
                    {book.depthCm || "—"} cm
                  </span>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-4 pt-3 text-xs text-slate-600 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  toast.success(
                    isWishlisted
                      ? "Removed from wishlist"
                      : "Added to wishlist!",
                  );
                }}
                className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isWishlisted
                    ? "text-rose-600 font-bold"
                    : "hover:text-rose-600"
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isWishlisted ? "fill-rose-600 text-rose-600" : ""
                  }`}
                />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard!");
                  }
                }}
                className="flex items-center gap-1.5 hover:text-indigo-600 transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>
          </div>

          {/* Right: Pricing, Purchase Actions & Highlights */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3.5">
              <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                Price & Availability
              </div>

              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-extrabold text-slate-900">
                  Rs. {discountedPrice.toLocaleString()}
                </span>
                {discountNum > 0 && (
                  <span className="text-xs text-slate-400 line-through font-medium">
                    Rs. {priceNum.toLocaleString()}
                  </span>
                )}
              </div>

              {discountNum > 0 && (
                <p className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                  Save Rs. {savingsAmount.toLocaleString()} ({discountNum}% OFF)
                </p>
              )}

              <div className="text-xs flex items-center gap-2 text-slate-600 pt-1">
                {!isOutOfStock ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    In Stock ({book.stock} available)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-rose-600 font-bold">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Out of Stock
                  </span>
                )}
                <span>• Nepal Delivery</span>
              </div>

              {/* Quantity Stepper */}
              {!isOutOfStock && (
                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-medium">
                    Quantity:
                  </span>
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white text-xs">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-2.5 py-1.5 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3.5 font-bold text-slate-900 select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= Number(book.stock)}
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-2.5 py-1.5 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={isOutOfStock || isAddingToCart}
                  onClick={() => handleAddToCart(true)}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 font-bold text-slate-950 rounded-xl transition-all shadow-xs text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingToCart ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Adding to Cart...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isOutOfStock || isAddingToCart}
                  onClick={handleBuyNow}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 font-bold text-white rounded-xl transition-all shadow-xs text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Verified Authentic | 7 Days Return
              </p>
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-5 px-6 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          {featureBadges.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    {badge.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">{badge.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Description Tabs */}
        <div id="book-tabs-section" className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex border-b border-slate-200 gap-6 text-xs font-bold text-slate-600 overflow-x-auto">
            {["Description", "Product Details", "Customer Reviews", "Shipping & Returns"].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    activeTab === tab
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent hover:text-slate-900"
                  }`}
                >
                  <span>{tab}</span>
                  {tab === "Customer Reviews" && reviewsCount > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-extrabold">
                      {reviewsCount}
                    </span>
                  )}
                </button>
              ),
            )}
          </div>

          {activeTab === "Description" && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed font-sans">
              {book.description ? (
                <div
                  className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: parseQuillContent(book.description),
                  }}
                />
              ) : (
                <p className="text-slate-400 italic">
                  No description provided for this book.
                </p>
              )}
            </div>
          )}

          {activeTab === "Product Details" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Title:</span>
                  <span className="font-bold text-slate-900">{book.title}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Author(s):</span>
                  <span className="font-bold text-slate-900">
                    {authorsList.map((a) => a.name).join(", ") || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Publisher:</span>
                  <span className="font-bold text-slate-900">
                    {book.publisher?.name || book.publisher?.englishName || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">
                    Genre / Category:
                  </span>
                  <span className="font-bold text-slate-900">
                    {genresList.map((g) => g.name).join(", ") || "—"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">ISBN-13:</span>
                  <span className="font-mono text-slate-900">
                    {book.isbn13 || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">ISBN-10:</span>
                  <span className="font-mono text-slate-900">
                    {book.isbn10 || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">
                    Total Pages:
                  </span>
                  <span className="font-bold text-slate-900">
                    {book.pages || "—"}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">
                    Dimensions:
                  </span>
                  <span className="font-bold text-slate-900">
                    {book.widthCm || "—"} × {book.heightCm || "—"} ×{" "}
                    {book.depthCm || "—"} cm
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Customer Reviews" && (
            <BookReviews
              bookId={id}
              bookTitle={book.title}
              onReviewsLoaded={(count, avg) => {
                setReviewsCount(count);
                setAvgRating(avg);
              }}
            />
          )}

          {activeTab === "Shipping & Returns" && (
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                <strong>Delivery in Nepal:</strong> Orders within Kathmandu
                Valley are delivered within 24-48 hours. Orders outside the
                valley take 2-4 business days.
              </p>
              <p>
                <strong>7 Days Return Policy:</strong> If the book has any
                defect or missing pages, you can request a replacement or full
                refund within 7 days of receiving the order.
              </p>
            </div>
          )}
        </div>

        {/* You May Also Like / Recommended Books */}
        {recommendedBooks.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                You May Also Like
              </h3>
              <Link
                href="/books"
                className="text-xs text-amber-600 hover:underline font-semibold"
              >
                View All Books →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {recommendedBooks.map((item) => {
                const recCover =
                  (item.images && item.images[0]
                    ? typeof item.images[0] === "string"
                      ? item.images[0]
                      : item.images[0].url || item.images[0].imageUrl
                    : null) || null;
                const recPrice = Number(item.price) || 0;
                const recDiscount = Number(item.discountPercent) || 0;
                const recNetPrice =
                  recDiscount > 0
                    ? recPrice - (recPrice * recDiscount) / 100
                    : recPrice;

                return (
                  <Link
                    key={item.id}
                    href={`/books/${item.id}`}
                    className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2 relative group hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {recDiscount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs z-10">
                          -{recDiscount}%
                        </span>
                      )}
                      <div className="aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 mb-2 border border-slate-100 flex items-center justify-center">
                        {recCover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={recCover}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <BookOpen className="w-8 h-8 text-slate-300" />
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-600 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {(item.authors || item.authorBooks || [])
                          .map(
                            (a: any) =>
                              a.name || a.englishName || a.author?.name,
                          )
                          .filter(Boolean)
                          .join(", ") || "Nepsole"}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-baseline gap-1.5 text-xs">
                        <span className="font-bold text-slate-900">
                          Rs. {recNetPrice.toLocaleString()}
                        </span>
                        {recDiscount > 0 && (
                          <span className="text-[10px] text-slate-400 line-through">
                            Rs. {recPrice.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Newsletter Subscription */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-5 shadow-sm">
          <div>
            <h4 className="font-bold text-sm sm:text-base">
              Stay Updated with New Books & Offers
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Subscribe to our newsletter and get updates on new arrivals and
              discounts.
            </p>
          </div>
          <div className="flex w-full md:w-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-3.5 py-2.5 text-xs rounded-l-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none w-full md:w-64"
            />
            <button
              type="button"
              onClick={() => toast.success("Subscribed successfully!")}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-r-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              Subscribe
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
