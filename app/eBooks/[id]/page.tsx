"use client";

import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import { getUserCookie, WISHLIST_CHANGE_EVENT } from "@/utils/cookies";
import { parseQuillContent } from "@/utils/quillDecoder";
import {
  BookOpen,
  Building2,
  ChevronRight,
  Cloud,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  Gift,
  Heart,
  Loader2,
  Lock,
  MapPin,
  Phone,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface BookAuthor {
  id: number | string;
  name?: string;
  englishName?: string;
  imageUrl?: string;
  image?: string;
  profileImage?: string;
  author?: {
    id: number | string;
    name?: string;
    englishName?: string;
    imageUrl?: string;
  };
  [key: string]: any;
}

export interface BookGenre {
  id: number | string;
  name?: string;
  englishName?: string;
  icon?: string;
  genre?: {
    id: number | string;
    name?: string;
    icon?: string;
  };
  [key: string]: any;
}

export interface BookPublisher {
  id: number | string;
  name?: string;
  englishName?: string;
  publicationLogoUrl?: string;
  address?: string;
  phoneNumbers?: string[];
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

export interface EBookDetail {
  id: number | string;
  title: string;
  plan?: "FREE" | "PAID" | string;
  price: number | string;
  discountPercent?: number | string;
  stock?: number;
  soldCount?: number;
  downloadCount?: number;
  publicationDate?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number | string;
  description?: string;
  pdfUrl?: string | null;
  pdfPublicId?: string | null;
  previewUrl?: string | null;
  coverImageUrl?: string | null;
  coverPublicId?: string | null;
  fileSizeBytes?: number | null;
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
  rating?: number | null;
  [key: string]: any;
}

export default function EBookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const ebookId = resolvedParams?.id;

  const [ebook, setEbook] = useState<EBookDetail | null>(null);
  const [recommendedEBooks, setRecommendedEBooks] = useState<EBookDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("Overview");
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

  // Modals state
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);

  // Fetch E-Book Details
  useEffect(() => {
    const fetchEBookData = async () => {
      setIsLoading(true);
      try {
        let response;
        try {
          response = await axiosInstance.get(`/v1/ebook/${ebookId}`);
        } catch {
          // Fallback to /v1/book/:id
          response = await axiosInstance.get(`/v1/book/${ebookId}`);
        }
        const data = response.data?.data || response.data;
        setEbook(data);
      } catch (err) {
        console.error("Failed to load eBook details:", err);
        toast.error("Failed to load e-book details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (ebookId) {
      fetchEBookData();
    }
  }, [ebookId]);

  // Fetch Recommended E-Books
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        let response;
        try {
          response = await axiosInstance.get("/v1/ebook?limit=6");
        } catch {
          response = await axiosInstance.get("/v1/book?limit=6");
        }
        const data = response.data?.data || response.data;
        const list = Array.isArray(data)
          ? data
          : data?.books || data?.items || [];
        setRecommendedEBooks(
          list.filter((b: EBookDetail) => String(b.id) !== String(ebookId)),
        );
      } catch (err) {
        console.error("Failed to load recommendations:", err);
      }
    };

    fetchRecommended();
  }, [ebookId]);

  // Fetch wishlist state for current user
  useEffect(() => {
    const fetchWishlistState = async () => {
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
          const isInWishlist = data.some((item: any) => {
            const ebId = item?.ebookId || item?.eBookId || item?.ebook?.id;
            const bId = item?.bookId || item?.book?.id;
            return (
              (ebId && String(ebId) === String(ebookId)) ||
              (bId && String(bId) === String(ebookId))
            );
          });
          setIsWishlisted(isInWishlist);
        }
      } catch {
        // Silently ignore if not logged in
      }
    };

    if (ebookId) fetchWishlistState();
  }, [ebookId]);

  // Helpers
  const getCoverImage = (item: EBookDetail): string | null => {
    if (item.coverImageUrl) return item.coverImageUrl;
    const imagesList = item.images || item.bookImages || [];
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

  const getAuthorsList = (item: EBookDetail): BookAuthor[] => {
    const list = item.authors || item.authorBooks || [];
    return list;
  };

  const getGenresList = (item: EBookDetail): BookGenre[] => {
    return item.genres || item.genreBooks || [];
  };

  const getLanguagesList = (item: EBookDetail): BookLanguage[] => {
    return item.languages || item.languageBooks || [];
  };

  const formatFileSize = (bytes?: number | null): string => {
    if (!bytes || bytes <= 0) return "~5.2 MB";
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = ebook?.title || "E-Book";

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out "${title}" on NepSole!`,
          url,
        });
      } catch (err: any) {
        // User cancelled or share failed — fall back to clipboard
        if (err?.name !== "AbortError") {
          navigator.clipboard.writeText(url);
          toast.success("E-Book link copied to clipboard!");
        }
      }
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(url);
      toast.success("E-Book link copied to clipboard!");
    }
  };

  const toggleWishlist = async () => {
    try {
      const user = await getUserCookie();
      if (!user?.accessToken) {
        toast.error("Please login to save e-books to your wishlist");
        return;
      }

      const previousState = isWishlisted;
      // Optimistic update
      setIsWishlisted(!previousState);

      const numId = Number(ebookId);
      const targetId = isNaN(numId) ? ebookId : numId;

      const response = await axiosAuthInstance.post(
        "/v1/wishlist/toggle?type=EBOOK",
        {
          ebookId: targetId,
        },
      );

      const resMsg = response?.data?.message;
      if (resMsg && typeof resMsg === "string") {
        toast.success(resMsg);
      } else if (!previousState) {
        toast.success("Added to your eBook Wishlist!");
      } else {
        toast.success("Removed from your Wishlist.");
      }

      window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
    } catch (error: any) {
      // Revert optimistic update
      setIsWishlisted((prev) => !prev);
      console.error("Wishlist toggle error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update wishlist.",
      );
    }
  };

  // Check if eBook is free
  const isFreePlan =
    (ebook?.plan && ebook.plan.toUpperCase() === "FREE") ||
    Number(ebook?.price || 0) === 0;

  // Handle Action based on plan
  const handleReadClick = () => {
    if (isFreePlan) {
      if (ebook?.pdfUrl) {
        setIsPdfViewerOpen(true);
      } else {
        toast.error("PDF file is not available for this e-book yet.");
      }
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  const handleDownloadClick = () => {
    if (isFreePlan) {
      if (ebook?.pdfUrl) {
        window.open(ebook.pdfUrl, "_blank");
        toast.success("Opening PDF download link...");
      } else {
        toast.error("Download file is not available yet.");
      }
    } else {
      setIsPaymentModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopHeader />
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-xs font-semibold text-slate-500">
            Loading digital e-book...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!ebook) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <TopHeader />
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-center px-4">
          <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">E-Book Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            The digital e-book you requested could not be found or has been
            removed.
          </p>
          <Link
            href="/eBooks"
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Back to E-Books
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const coverUrl = getCoverImage(ebook);
  const authorsList = getAuthorsList(ebook);
  const genresList = getGenresList(ebook);
  const languagesList = getLanguagesList(ebook);
  const decodedDescription = parseQuillContent(ebook.description);

  const priceNum = Number(ebook.price) || 0;
  const discountNum = Number(ebook.discountPercent) || 0;
  const discountedPrice =
    discountNum > 0 ? priceNum - (priceNum * discountNum) / 100 : priceNum;

  const totalPages = ebook.pages || 120;
  const fileSizeString = formatFileSize(ebook.fileSizeBytes);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 antialiased">
      <TopHeader />
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium select-none">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <Link
            href="/eBooks"
            className="hover:text-indigo-600 transition-colors"
          >
            E-Books
          </Link>
          <ChevronRight className="w-3 h-3 text-slate-300" />
          <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-md">
            {ebook.title}
          </span>
        </nav>

        {/* E-Book Main Product Showcase */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Device & E-Book Cover (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center space-y-5">
              {/* E-Book Digital Frame */}
              <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-slate-900 border-4 border-slate-900 shadow-2xl p-2.5">
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
                  {coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverUrl}
                      alt={ebook.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="p-6 text-center text-white space-y-3">
                      <BookOpen className="w-12 h-12 mx-auto text-indigo-400" />
                      <h3 className="text-sm font-bold">{ebook.title}</h3>
                      <p className="text-xs text-slate-400">
                        {authorsList.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                  )}

                  {/* Top Left Badges: Plan + Formats */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                    {isFreePlan ? (
                      <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        FREE E-BOOK
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[10px] font-bold shadow-md flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        PREMIUM E-BOOK
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-medium shadow-md self-start">
                      PDF Document
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Details, Author/Publisher info & Dynamic Action Buttons (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Header Info & Genre Badges */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  {genresList.map((g) => (
                    <span
                      key={g.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100"
                    >
                      {g.icon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={g.icon}
                          alt={g.name || ""}
                          className="w-3.5 h-3.5 object-contain"
                        />
                      )}
                      <span>{g.name || g.englishName || "Genre"}</span>
                    </span>
                  ))}

                  {isFreePlan ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Free Access
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-600" />
                      Premium Edition
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {ebook.title}
                </h1>

                {/* Author(s) Profile Box with Images */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  {authorsList.map((author) => {
                    const authorImg =
                      author.imageUrl || author.image || author.profileImage;
                    const authorName =
                      author.name || author.englishName || "Author";

                    return (
                      <Link
                        key={author.id}
                        href={`/authors/${author.id}`}
                        className="group inline-flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-indigo-50 hover:border-indigo-200 transition"
                      >
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {authorImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={authorImg}
                              alt={authorName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{authorName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="text-xs">
                          <span className="text-[10px] text-slate-400 block -mb-0.5">
                            Author
                          </span>
                          <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                            {authorName}
                          </span>
                        </div>
                      </Link>
                    );
                  })}

                  {/* Publisher Profile Box with Logo */}
                  {ebook.publisher && (
                    <Link
                      href={`/publishers/${ebook.publisher.id}`}
                      className="group inline-flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-50 border border-slate-200/80 hover:bg-indigo-50 hover:border-indigo-200 transition"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-0.5 shrink-0 shadow-xs">
                        {ebook.publisher.publicationLogoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ebook.publisher.publicationLogoUrl}
                            alt={ebook.publisher.name || ""}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <div className="text-xs">
                        <span className="text-[10px] text-slate-400 block -mb-0.5">
                          Publisher
                        </span>
                        <span className="font-semibold text-slate-800 group-hover:text-indigo-600 transition">
                          {ebook.publisher.name || ebook.publisher.englishName}
                        </span>
                      </div>
                    </Link>
                  )}
                </div>

                {/* Rating & Stats */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-slate-800">
                      {ebook.rating ? `${ebook.rating}` : "5.0"}
                    </span>
                  </div>

                  <span className="text-slate-300">•</span>

                  <div className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{ebook.downloadCount || 0} Downloads</span>
                  </div>

                  <span className="text-slate-300">•</span>

                  <div className="flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{ebook.soldCount || 0} Copies Sold</span>
                  </div>
                </div>
              </div>

              {/* Price & Plan Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Access Plan
                  </span>
                  <div className="flex items-baseline gap-2.5 mt-0.5">
                    {isFreePlan ? (
                      <span className="text-2xl sm:text-3xl font-black text-emerald-600 flex items-center gap-1.5">
                        <span>Free</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          100% Free Access
                        </span>
                      </span>
                    ) : (
                      <>
                        <span className="text-2xl sm:text-3xl font-black text-slate-900">
                          Rs. {discountedPrice.toLocaleString()}
                        </span>
                        {discountNum > 0 && (
                          <span className="text-sm text-slate-400 line-through font-medium">
                            Rs. {priceNum.toLocaleString()} (-{discountNum}%)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Wishlist & Share */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={toggleWishlist}
                    className={`p-2.5 rounded-xl border transition cursor-pointer ${
                      isWishlisted
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                    title="Add to Wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? "fill-rose-600" : ""
                      }`}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={handleShare}
                    className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition cursor-pointer"
                    title="Share E-Book"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dynamic Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {isFreePlan ? (
                  <>
                    {/* Read Free PDF Online */}
                    <button
                      type="button"
                      onClick={handleReadClick}
                      className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Read Free Online</span>
                    </button>

                    {/* Download Free PDF */}
                    <button
                      type="button"
                      onClick={handleDownloadClick}
                      className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF ({fileSizeString})</span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Paid E-Book: Buy Button opens Payment Modal */}
                    <button
                      type="button"
                      onClick={() => setIsPaymentModalOpen(true)}
                      className="w-full sm:flex-1 py-3.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Buy E-Book (Rs. {discountedPrice})</span>
                    </button>
                  </>
                )}
              </div>

              {/* Quick E-Book Specs Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Format
                  </span>
                  <span className="font-semibold text-slate-800">
                    PDF Document
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Total Pages
                  </span>
                  <span className="font-semibold text-slate-800">
                    {totalPages} Pages
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    File Size
                  </span>
                  <span className="font-semibold text-slate-800">
                    {fileSizeString}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Language
                  </span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {languagesList.map((l) => l.name).join(", ") || "Nepali"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200">
          <div className="flex items-center gap-6">
            {["Overview", "Specifications", "Author & Publisher"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                  activeTab === tab
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          {/* Tab 1: Overview */}
          {activeTab === "Overview" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                About this Digital Edition
              </h3>
              {decodedDescription ? (
                <div
                  className="text-xs sm:text-sm text-slate-600 leading-relaxed prose prose-sm max-w-none break-words"
                  dangerouslySetInnerHTML={{ __html: decodedDescription }}
                />
              ) : (
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Experience {ebook.title} in seamless digital format. Enjoy
                  crisp typography, night mode, seamless bookmarking, and
                  highlights on all your devices.
                </p>
              )}
            </div>
          )}

          {/* Tab 2: Specifications */}
          {activeTab === "Specifications" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Book Metadata & Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Full Title
                  </span>
                  <p className="font-semibold text-slate-800">{ebook.title}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Plan
                  </span>
                  <p className="font-semibold text-slate-800">
                    {ebook.plan || "FREE"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Total Pages
                  </span>
                  <p className="font-semibold text-slate-800">
                    {totalPages} Pages
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    File Size
                  </span>
                  <p className="font-semibold text-slate-800">
                    {fileSizeString}
                  </p>
                </div>

                {ebook.isbn10 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      ISBN-10
                    </span>
                    <p className="font-semibold text-slate-800">
                      {ebook.isbn10}
                    </p>
                  </div>
                )}

                {ebook.isbn13 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      ISBN-13
                    </span>
                    <p className="font-semibold text-slate-800">
                      {ebook.isbn13}
                    </p>
                  </div>
                )}

                {ebook.publicationDate && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Publication Date
                    </span>
                    <p className="font-semibold text-slate-800">
                      {new Date(ebook.publicationDate).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Available Languages
                  </span>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {languagesList.map((lang) => (
                      <span
                        key={lang.id}
                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold"
                      >
                        {lang.name} {lang.code ? `(${lang.code})` : ""}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Cloud ID
                  </span>
                  <p className="font-mono text-[11px] text-slate-600 truncate">
                    {ebook.pdfPublicId || "nepsole/ebooks/pdf"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Author & Publisher */}
          {activeTab === "Author & Publisher" && (
            <div className="space-y-6">
              {/* Author(s) Full Profile */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  About the Author(s)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {authorsList.map((author) => {
                    const aImg =
                      author.imageUrl || author.image || author.profileImage;
                    const aName = author.name || author.englishName || "Author";

                    return (
                      <div
                        key={author.id}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100"
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-indigo-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-sm">
                          {aImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={aImg}
                              alt={aName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{aName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-bold text-slate-900 truncate">
                            {aName}
                          </h5>
                          <p className="text-xs text-slate-500">
                            Registered Writer on Nepsole
                          </p>
                          <Link
                            href={`/authors/${author.id}`}
                            className="text-[11px] font-semibold text-indigo-600 hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            <span>View Author Profile</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Publisher Profile */}
              {ebook.publisher && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Publisher Details
                  </h4>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-1 shrink-0 shadow-sm">
                        {ebook.publisher.publicationLogoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={ebook.publisher.publicationLogoUrl}
                            alt={ebook.publisher.name || ""}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>

                      <div className="space-y-1 text-xs">
                        <h5 className="text-sm font-bold text-slate-900">
                          {ebook.publisher.name || ebook.publisher.englishName}
                        </h5>

                        {ebook.publisher.address && (
                          <p className="text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span>{ebook.publisher.address}</span>
                          </p>
                        )}

                        {ebook.publisher.phoneNumbers &&
                          ebook.publisher.phoneNumbers.length > 0 && (
                            <p className="text-slate-500 flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>
                                {ebook.publisher.phoneNumbers.join(", ")}
                              </span>
                            </p>
                          )}
                      </div>
                    </div>

                    <Link
                      href={`/publishers/${ebook.publisher.id}`}
                      className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 text-xs font-semibold shadow-2xs transition shrink-0"
                    >
                      View Publisher
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recommended E-Books */}
        {recommendedEBooks.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Readers Also Explored
              </h3>
              <Link
                href="/eBooks"
                className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendedEBooks.map((item) => {
                const rCover = getCoverImage(item);
                const rPrice = Number(item.price) || 0;
                const rDiscount = Number(item.discountPercent) || 0;
                const rFinalPrice =
                  rDiscount > 0 ? rPrice - (rPrice * rDiscount) / 100 : rPrice;
                const rIsFree =
                  (item.plan && item.plan.toUpperCase() === "FREE") ||
                  rPrice === 0;

                return (
                  <Link
                    key={item.id}
                    href={`/eBooks/${item.id}`}
                    className="group bg-white rounded-2xl border border-slate-200/80 p-3 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                        {rCover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={rCover}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white bg-indigo-950 font-bold text-xs p-2 text-center">
                            {item.title}
                          </div>
                        )}
                        <span
                          className={`absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            rIsFree
                              ? "bg-emerald-600 text-white"
                              : "bg-indigo-600 text-white"
                          }`}
                        >
                          {rIsFree ? "FREE" : "PAID"}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {getAuthorsList(item)
                          .map((a) => a.name)
                          .join(", ") || "Author"}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>
                        {rIsFree
                          ? "Free"
                          : `Rs. ${rFinalPrice.toLocaleString()}`}
                      </span>
                      <span className="text-[11px] text-indigo-600 font-semibold">
                        Read
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* 1. Fullscreen / High-Fidelity PDF Reader Modal */}
      {isPdfViewerOpen && ebook?.pdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-6 animate-in fade-in-50">
          <div className="w-full max-w-5xl h-[92vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            {/* Header toolbar */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 text-white border-b border-slate-800">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <div>
                  <h4 className="text-xs font-bold text-white truncate max-w-xs sm:max-w-md">
                    {ebook.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    PDF Reader • {fileSizeString}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={ebook.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
                  title="Open in new window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Full Screen</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsPdfViewerOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                  title="Close Reader"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded PDF iframe */}
            <div className="flex-1 w-full bg-slate-950">
              <iframe
                src={`${ebook.pdfUrl}#toolbar=1`}
                title={ebook.title}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. Paid E-Book "Payment Coming Soon" Dialog */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] max-w-md p-0 bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0c1f4d] to-[#122e6b] p-6 text-white text-center">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-3 text-amber-400 shadow-inner">
              <CreditCard className="w-7 h-7" />
            </div>

            <DialogTitle className="text-lg font-black tracking-tight text-white">
              Online Payment
            </DialogTitle>
            <DialogDescription className="text-xs text-indigo-200 mt-1">
              Purchase & Unlock Full Digital Edition
            </DialogDescription>
          </div>

          {/* Body */}
          <div className="p-6 space-y-5 text-center">
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider">
                Coming Soon 🚀
              </span>
              <h3 className="text-base font-bold text-slate-900 pt-2">
                Digital Payments are on the way!
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                We are currently integrating automated payment gateways
                including <strong>eSewa</strong>, <strong>Khalti</strong>, and{" "}
                <strong>Fonepay</strong> to allow instant digital checkouts.
              </p>
            </div>

            {/* Price Preview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  E-Book Title
                </span>
                <span className="text-xs font-bold text-slate-800 truncate block max-w-[200px]">
                  {ebook.title}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Price
                </span>
                <span className="text-sm font-black text-slate-900">
                  Rs. {discountedPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Options Preview */}
            <div className="space-y-2 pt-1 text-left">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
                Supported Gateways (Launching Soon)
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-slate-700">
                <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-800">
                  eSewa
                </div>
                <div className="p-2.5 rounded-xl border border-purple-100 bg-purple-50 text-purple-800">
                  Khalti
                </div>
                <div className="p-2.5 rounded-xl border border-blue-100 bg-blue-50 text-blue-800">
                  Fonepay
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  toast.success(
                    "You will be notified when online payments launch!",
                  );
                  setIsPaymentModalOpen(false);
                }}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Notify Me When Available
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
