"use client";

import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  Heart,
  Layers,
  Loader2,
  Maximize2,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Footer from "@/components/footer";
import Header from "@/components/header";
import TopHeader from "@/components/topHeader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  StationeryItem,
  getAllStationeryImages,
  getStationeryImageUrl,
} from "@/types";
import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import {
  CART_CHANGE_EVENT,
  WISHLIST_CHANGE_EVENT,
  getUserCookie,
  openAuthModal,
  openCartDrawer,
} from "@/utils/cookies";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function StationeryDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  // Product state
  const [product, setProduct] = useState<StationeryItem | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<StationeryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isZoomOpen, setIsZoomOpen] = useState<boolean>(false);

  // Cart & Order state
  const [quantity, setQuantity] = useState<number>(1);
  const [isAddingToCart, setIsAddingToCart] = useState<boolean>(false);
  const [isBuyingNow, setIsBuyingNow] = useState<boolean>(false);
  const [inCartQuantity, setInCartQuantity] = useState<number>(0);

  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState<boolean>(false);

  // Active tab
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "shipping"
  >("description");

  // 1. Fetch Product Details
  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      if (!slug) return;
      setIsLoading(true);
      setError(null);

      try {
        const encodedSlug = encodeURIComponent(slug);
        let res;

        // Try primary endpoint: /v1/stationery/slug/:slug-or-id
        try {
          res = await axiosInstance.get(`/v1/stationery/slug/${encodedSlug}`);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            // Fallback 1: /api/v1/stationery/slug/:slug-or-id
            try {
              res = await axiosInstance.get(
                `/api/v1/stationery/slug/${encodedSlug}`,
              );
            } catch (err2: any) {
              if (err2?.response?.status === 404) {
                // Fallback 2: /v1/stationery/:id
                try {
                  res = await axiosInstance.get(
                    `/v1/stationery/${encodedSlug}`,
                  );
                } catch (err3: any) {
                  // Fallback 3: /api/v1/stationery/:id
                  res = await axiosInstance.get(
                    `/api/v1/stationery/${encodedSlug}`,
                  );
                }
              } else {
                throw err2;
              }
            }
          } else {
            throw err;
          }
        }

        const data = res?.data?.data || res?.data;
        if (!isMounted) return;

        if (data && (data.id || data.name)) {
          setProduct(data);
          setSelectedImageIndex(0);
          setQuantity(1);
        } else {
          setError("Product not found");
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Failed to load stationery details:", err);
        setError(
          "Unable to find this stationery product. It may have been moved or removed.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // 2. Fetch Related Products once product is loaded
  useEffect(() => {
    if (!product) return;

    const fetchRelated = async () => {
      try {
        const catId =
          product.categoryId || product.category?.id || product.Category?.id;
        const query = catId ? `categoryId=${catId}&limit=5` : "limit=5";

        let res;
        try {
          res = await axiosInstance.get(`/v1/stationery?${query}`);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            res = await axiosInstance.get(`/api/v1/stationery?${query}`);
          } else {
            throw err;
          }
        }

        const data = res?.data?.data || res?.data;
        const list: StationeryItem[] = Array.isArray(data)
          ? data
          : data?.stationery || data?.items || [];

        // Exclude current product
        const filtered = list.filter(
          (item) =>
            String(item.id) !== String(product.id) &&
            item.slug !== product.slug,
        );
        setRelatedProducts(filtered.slice(0, 4));
      } catch (err) {
        console.error("Failed to load related stationery:", err);
      }
    };

    fetchRelated();
  }, [product]);

  // 3. Sync Cart Quantity for this item
  useEffect(() => {
    if (!product) return;

    const syncCart = () => {
      try {
        const raw = localStorage.getItem("nepsole_cart");
        if (!raw) {
          setInCartQuantity(0);
          return;
        }
        const cartItems = JSON.parse(raw);
        if (Array.isArray(cartItems)) {
          const found = cartItems.find(
            (it: any) =>
              String(it.stationeryId ?? it.bookId ?? it.id) ===
              String(product.id),
          );
          setInCartQuantity(found ? Number(found.quantity) || 0 : 0);
        }
      } catch {
        setInCartQuantity(0);
      }
    };

    syncCart();

    const handleCartChange = () => syncCart();
    window.addEventListener(CART_CHANGE_EVENT, handleCartChange);
    return () => {
      window.removeEventListener(CART_CHANGE_EVENT, handleCartChange);
    };
  }, [product]);

  // 4. Check Wishlist
  useEffect(() => {
    if (!product) return;

    const checkWishlist = async () => {
      try {
        const user = await getUserCookie();
        if (!user?.accessToken) {
          setIsWishlisted(false);
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

        const data = res?.data?.data || res?.data?.wishlist || res?.data || [];
        if (Array.isArray(data)) {
          const match = data.some((item: any) => {
            const pid =
              item.stationeryId ||
              item.stationery?.id ||
              item.bookId ||
              item.id;
            return String(pid) === String(product.id);
          });
          setIsWishlisted(match);
        }
      } catch {
        // Silently ignore if not logged in
      }
    };

    checkWishlist();

    const handleWishlistChange = () => checkWishlist();
    window.addEventListener(WISHLIST_CHANGE_EVENT, handleWishlistChange);
    return () => {
      window.removeEventListener(WISHLIST_CHANGE_EVENT, handleWishlistChange);
    };
  }, [product]);

  // Price calculations
  const priceNum = Number(product?.price) || 0;
  const discountNum = Number(product?.discountPercent) || 0;
  const effectivePrice =
    discountNum > 0
      ? Math.max(0, priceNum - (priceNum * discountNum) / 100)
      : priceNum;
  const savingsAmount = priceNum - effectivePrice;
  const stockCount =
    product?.stock !== undefined && product?.stock !== null
      ? Number(product.stock)
      : 10;
  const isOutOfStock = stockCount <= 0;

  // Extract images
  const images = useMemo(() => {
    if (!product) return [];
    const list = getAllStationeryImages(product);
    if (list.length === 0) {
      const single = getStationeryImageUrl(product);
      if (single) list.push(single);
    }
    return list;
  }, [product]);

  const activeImageUrl = images[selectedImageIndex] || images[0] || null;

  // Category and SubCategory details
  const categoryName =
    product?.category?.name || product?.Category?.name || "Stationery";
  const subCategoryName =
    product?.subCategory?.name || product?.SubCategory?.name;

  // Add to cart handler
  const handleAddToCart = async (showToast = true): Promise<boolean> => {
    if (!product || isOutOfStock) return false;

    setIsAddingToCart(true);

    try {
      const user = await getUserCookie();
      const primaryImage = activeImageUrl || getStationeryImageUrl(product);
      const numId = Number(product.id);
      const targetStationeryId = !isNaN(numId) ? numId : product.id;

      // 1. Update localStorage cart
      try {
        const raw = localStorage.getItem("nepsole_cart");
        let cartItems: any[] = [];
        if (raw) {
          try {
            cartItems = JSON.parse(raw);
          } catch {}
        }
        if (!Array.isArray(cartItems)) cartItems = [];

        const existingIdx = cartItems.findIndex(
          (c: any) =>
            String(c.stationeryId ?? c.bookId ?? c.id) === String(product.id),
        );

        if (existingIdx >= 0) {
          cartItems[existingIdx].quantity =
            (Number(cartItems[existingIdx].quantity) || 1) + quantity;
        } else {
          cartItems.push({
            id: `stationery-${targetStationeryId}-${Date.now()}`,
            stationeryId: targetStationeryId,
            bookId: targetStationeryId,
            title: product.name,
            author: categoryName,
            price: effectivePrice,
            originalPrice: priceNum,
            discountPercent: discountNum,
            quantity: quantity,
            coverImage: primaryImage,
            format: "Stationery",
            stock: stockCount,
            category: categoryName,
          });
        }

        localStorage.setItem("nepsole_cart", JSON.stringify(cartItems));
      } catch (storageErr) {
        console.error("Local cart error:", storageErr);
      }

      // 2. Dispatch cart event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(CART_CHANGE_EVENT));
      }

      // 3. Sync with server if logged in
      if (user?.accessToken) {
        const payload = {
          stationeryId: targetStationeryId,
          quantity: quantity,
        };

        try {
          await axiosAuthInstance.post("/v1/cart", payload);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            try {
              await axiosAuthInstance.post("/api/v1/cart", payload);
            } catch {
              // Non-blocking fallback
            }
          }
        }
      }

      if (showToast) {
        toast.dismiss();
        toast.success(
          quantity > 1
            ? `Added ${quantity} units of "${product.name}" to cart!`
            : `Added "${product.name}" to your cart!`,
        );
      }

      return true;
    } catch (err: any) {
      console.error("Add to cart failed:", err);
      toast.dismiss();
      toast.error("Failed to add product to cart. Please try again.");
      return false;
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Buy Now handler
  const handleBuyNow = async () => {
    if (!product || isOutOfStock) return;

    setIsBuyingNow(true);
    try {
      const user = await getUserCookie();
      const isUserLoggedIn = Boolean(user?.accessToken);

      const added = await handleAddToCart(false);
      if (added) {
        if (isUserLoggedIn) {
          router.push("/user/cart");
        } else {
          openCartDrawer();
        }
      }
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Wishlist Toggle
  const handleToggleWishlist = async () => {
    if (!product) return;

    try {
      const user = await getUserCookie();
      if (!user?.accessToken) {
        openAuthModal("login");
        toast("Please log in to manage your wishlist.", { icon: "🔒" });
        return;
      }

      setIsWishlistLoading(true);

      const numId = Number(product.id);
      const targetStationeryId = !isNaN(numId) ? numId : product.id;
      const prevWishlisted = isWishlisted;

      // Optimistic update
      setIsWishlisted(!prevWishlisted);

      const payload = {
        stationeryId: targetStationeryId,
      };

      let res;
      try {
        res = await axiosAuthInstance.post("/v1/wishlist/toggle", payload);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          try {
            res = await axiosAuthInstance.post(
              "/api/v1/wishlist/toggle",
              payload,
            );
          } catch (err2) {
            throw err2;
          }
        } else {
          throw err;
        }
      }

      const msg = res?.data?.message;
      if (typeof res?.data?.isWishlisted === "boolean") {
        setIsWishlisted(res.data.isWishlisted);
      } else if (typeof res?.data?.data?.isWishlisted === "boolean") {
        setIsWishlisted(res.data.data.isWishlisted);
      }

      toast.dismiss();
      if (msg && typeof msg === "string") {
        toast.success(msg);
      } else if (!prevWishlisted) {
        toast.success("Saved to your wishlist!");
      } else {
        toast.success("Removed from wishlist.");
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
      }
    } catch (err: any) {
      console.error("Wishlist action error:", err);
      // Revert optimistic update
      setIsWishlisted((prev) => !prev);
      toast.dismiss();
      toast.error(
        err?.response?.data?.message || "Could not update wishlist.",
      );
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Share handler
  const handleShare = async () => {
    if (typeof window === "undefined") return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.name || "Stationery Item",
          text: `Check out ${product?.name} on Nepsole!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Product link copied to clipboard!");
      }
    } catch {
      // User cancelled share
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <TopHeader />
      <Header />

      <main className="flex-1 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-slate-200/80 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
              <Link
                href="/"
                className="hover:text-[#1749A0] transition flex items-center gap-1 font-medium"
              >
                Home
              </Link>
              <ChevronRight size={13} className="text-slate-400" />
              <Link
                href="/stationery"
                className="hover:text-[#1749A0] transition font-medium"
              >
                Stationery
              </Link>

              {categoryName && (
                <>
                  <ChevronRight size={13} className="text-slate-400" />
                  <Link
                    href={`/stationery?categoryId=${product?.categoryId || ""}`}
                    className="hover:text-[#1749A0] transition font-medium"
                  >
                    {categoryName}
                  </Link>
                </>
              )}

              {product?.name && (
                <>
                  <ChevronRight size={13} className="text-slate-400" />
                  <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-xs">
                    {product.name}
                  </span>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 animate-pulse">
              <div className="lg:col-span-5 space-y-4">
                <div className="aspect-square w-full rounded-3xl bg-slate-200" />
                <div className="grid grid-cols-4 gap-3">
                  <div className="aspect-square rounded-xl bg-slate-200" />
                  <div className="aspect-square rounded-xl bg-slate-200" />
                  <div className="aspect-square rounded-xl bg-slate-200" />
                  <div className="aspect-square rounded-xl bg-slate-200" />
                </div>
              </div>
              <div className="lg:col-span-7 space-y-5">
                <div className="h-6 w-32 bg-slate-200 rounded-lg" />
                <div className="h-10 w-4/5 bg-slate-200 rounded-xl" />
                <div className="h-8 w-44 bg-slate-200 rounded-lg" />
                <div className="h-24 w-full bg-slate-200 rounded-2xl" />
                <div className="h-12 w-full bg-slate-200 rounded-xl" />
              </div>
            </div>
          </div>
        )}

        {/* Error / Not Found State */}
        {!isLoading && (error || !product) && (
          <div className="max-w-2xl mx-auto px-4 py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 mb-4 border border-rose-200">
              <AlertCircle size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
              Stationery Product Not Found
            </h1>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              {error ||
                "The stationery item you are looking for does not exist or may have been unlisted."}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/stationery"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1749A0] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#0F2557] transition"
              >
                <ArrowLeft size={16} />
                Explore All Stationery
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {/* Product Details Main Content */}
        {!isLoading && product && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column: Image Gallery */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative aspect-square w-full rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm flex items-center justify-center overflow-hidden group">
                  {/* Discount Badge */}
                  {discountNum > 0 && (
                    <div className="absolute top-4 left-4 z-10 rounded-xl bg-rose-600 px-3 py-1 text-xs font-black text-white shadow-md tracking-wider">
                      SAVE {discountNum}%
                    </div>
                  )}

                  {/* Quick Zoom Trigger */}
                  {activeImageUrl && (
                    <button
                      type="button"
                      onClick={() => setIsZoomOpen(true)}
                      className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-slate-700 shadow-sm backdrop-blur-xs border border-slate-200 hover:bg-white hover:text-[#1749A0] transition cursor-pointer"
                      title="Enlarge image"
                    >
                      <Maximize2 size={16} />
                    </button>
                  )}

                  {/* Main Product Image */}
                  {activeImageUrl ? (
                    <img
                      src={activeImageUrl}
                      alt={product.name}
                      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-300">
                      <Package size={64} />
                      <span className="text-xs text-slate-400 font-medium">
                        No image available
                      </span>
                    </div>
                  )}

                  {/* Out of Stock Overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <span className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-1.5 text-xs font-extrabold text-rose-700 shadow-sm">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails strip */}
                {images.length > 1 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
                    {images.map((imgUrl, idx) => {
                      const isSelected = idx === selectedImageIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative h-20 w-20 flex-shrink-0 rounded-2xl border-2 bg-white p-2 transition overflow-hidden cursor-pointer ${
                            isSelected
                              ? "border-[#1749A0] shadow-sm ring-2 ring-[#1749A0]/20"
                              : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`${product.name} thumbnail ${idx + 1}`}
                            className="h-full w-full object-contain"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Product Info & Actions */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Category & Subcategory tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/stationery?categoryId=${product.categoryId || ""}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-[#1749A0] border border-blue-200/60 hover:bg-blue-100 transition"
                    >
                      <Tag size={12} />
                      {categoryName}
                    </Link>

                    {subCategoryName && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200">
                        <Layers size={12} />
                        {subCategoryName}
                      </span>
                    )}

                    {/* Stock badge */}
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Out of Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        In Stock ({stockCount} units available)
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                    {product.name}
                  </h1>

                  {/* Price Block */}
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-2">
                    <div className="flex flex-wrap items-baseline gap-3">
                      <span className="text-3xl font-black text-slate-900">
                        Rs. {effectivePrice.toLocaleString()}
                      </span>

                      {discountNum > 0 && (
                        <>
                          <span className="text-base font-semibold text-slate-400 line-through">
                            Rs. {priceNum.toLocaleString()}
                          </span>
                          <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            Save Rs. {savingsAmount.toLocaleString()} (
                            {discountNum}% OFF)
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Inclusive of all taxes • Guaranteed original stationery
                      item
                    </p>
                  </div>

                  {/* Short description preview if present */}
                  {product.description && (
                    <div className="text-xs sm:text-sm text-slate-600 leading-relaxed border-l-2 border-[#1749A0] pl-3.5 py-0.5 bg-slate-50/50 rounded-r-xl">
                      <p className="line-clamp-3">{product.description}</p>
                    </div>
                  )}

                  {/* Quantity & In-Cart Status */}
                  <div className="pt-2 space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Quantity:
                      </span>

                      <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white shadow-2xs">
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((prev) => Math.max(1, prev - 1))
                          }
                          disabled={quantity <= 1 || isOutOfStock}
                          className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-l-xl transition cursor-pointer"
                        >
                          <Minus size={15} />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={Math.max(1, stockCount)}
                          value={quantity}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1) {
                              setQuantity(
                                Math.min(val, Math.max(1, stockCount)),
                              );
                            }
                          }}
                          disabled={isOutOfStock}
                          className="w-14 text-center text-sm font-bold text-slate-900 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setQuantity((prev) =>
                              Math.min(
                                stockCount > 0 ? stockCount : 999,
                                prev + 1,
                              ),
                            )
                          }
                          disabled={quantity >= stockCount || isOutOfStock}
                          className="flex h-10 w-10 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent rounded-r-xl transition cursor-pointer"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      {inCartQuantity > 0 && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                          <Check size={13} />
                          {inCartQuantity} already in cart
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: Add to Cart & Buy Now */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => handleAddToCart(true)}
                        disabled={isOutOfStock || isAddingToCart}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1749A0] px-6 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#0F2557] disabled:bg-slate-300 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        {isAddingToCart ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Adding to Cart...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={18} />
                            <span>
                              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                            </span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleBuyNow}
                        disabled={isOutOfStock || isBuyingNow}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#1749A0] bg-white px-6 py-3.5 text-sm font-bold text-[#1749A0] shadow-sm hover:bg-blue-50/50 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-white disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        {isBuyingNow ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={18} />
                            <span>Buy Now</span>
                          </>
                        )}
                      </button>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={handleToggleWishlist}
                        disabled={isWishlistLoading}
                        className={`flex h-12 w-12 sm:w-12 items-center justify-center rounded-2xl border transition shadow-2xs cursor-pointer ${
                          isWishlisted
                            ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-rose-600"
                        }`}
                        title={
                          isWishlisted ? "In Wishlist" : "Save to Wishlist"
                        }
                      >
                        <Heart
                          size={20}
                          className={isWishlisted ? "fill-rose-600" : ""}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Tabs: Description, Specs, Shipping */}
            <div className="rounded-3xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
              <div className="flex border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("description")}
                  className={`py-4 px-4 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                    activeTab === "description"
                      ? "border-[#1749A0] text-[#1749A0]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Product Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("specs")}
                  className={`py-4 px-4 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                    activeTab === "specs"
                      ? "border-[#1749A0] text-[#1749A0]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("shipping")}
                  className={`py-4 px-4 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                    activeTab === "shipping"
                      ? "border-[#1749A0] text-[#1749A0]"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Delivery & Returns
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {activeTab === "description" && (
                  <div className="space-y-4 max-w-3xl">
                    <h3 className="text-base font-bold text-slate-900">
                      About {product.name}
                    </h3>
                    {product.description ? (
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                        {product.description}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">
                        No additional description provided for this product.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "specs" && (
                  <div className="max-w-2xl">
                    <table className="w-full text-xs sm:text-sm">
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-3 font-semibold text-slate-500 w-1/3">
                            Product Name
                          </td>
                          <td className="py-3 font-bold text-slate-900">
                            {product.name}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 font-semibold text-slate-500">
                            Category
                          </td>
                          <td className="py-3 text-slate-800 font-medium">
                            {categoryName}
                          </td>
                        </tr>
                        {subCategoryName && (
                          <tr>
                            <td className="py-3 font-semibold text-slate-500">
                              Sub-Category
                            </td>
                            <td className="py-3 text-slate-800 font-medium">
                              {subCategoryName}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-3 font-semibold text-slate-500">
                            Availability
                          </td>
                          <td className="py-3 text-slate-800 font-medium">
                            {isOutOfStock
                              ? "Out of Stock"
                              : `${stockCount} units in stock`}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 font-semibold text-slate-500">
                            Price
                          </td>
                          <td className="py-3 text-slate-800 font-medium">
                            Rs. {effectivePrice.toLocaleString()}{" "}
                            {discountNum > 0 && `(was Rs. ${priceNum})`}
                          </td>
                        </tr>
                        {product.slug && (
                          <tr>
                            <td className="py-3 font-semibold text-slate-500">
                              Slug / Code
                            </td>
                            <td className="py-3 font-mono text-xs text-slate-600">
                              {product.slug}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === "shipping" && (
                  <div className="space-y-4 max-w-3xl text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <h3 className="text-base font-bold text-slate-900">
                      Shipping & Delivery Information
                    </h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>
                        <strong>Inside Kathmandu Valley:</strong> Delivered
                        within 24 to 48 hours.
                      </li>
                      <li>
                        <strong>Outside Valley (Major Cities):</strong>{" "}
                        Delivered within 2 to 4 business days.
                      </li>
                      <li>
                        <strong>Cash on Delivery (COD):</strong> Supported
                        nationwide across Nepal.
                      </li>
                      <li>
                        <strong>Return Policy:</strong> 7-day hassle-free
                        returns or replacements in case of damaged or defective
                        stationery goods.
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Related Stationery Section */}
            {relatedProducts.length > 0 && (
              <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      Related Stationery Items
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customers also viewed these items in {categoryName}
                    </p>
                  </div>

                  <Link
                    href={`/stationery?categoryId=${product.categoryId || ""}`}
                    className="text-xs font-bold text-[#1749A0] hover:underline flex items-center gap-1"
                  >
                    View All
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {relatedProducts.map((rel) => {
                    const rImg = getStationeryImageUrl(rel);
                    const rPrice = Number(rel.price) || 0;
                    const rDisc = Number(rel.discountPercent) || 0;
                    const rEff =
                      rDisc > 0
                        ? Math.max(0, rPrice - (rPrice * rDisc) / 100)
                        : rPrice;

                    return (
                      <Link
                        key={rel.id}
                        href={`/stationery/${rel.slug || rel.id}`}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
                      >
                        {rDisc > 0 && (
                          <div className="absolute left-2.5 top-2.5 z-10 rounded-lg bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                            -{rDisc}%
                          </div>
                        )}

                        <div className="relative aspect-square w-full overflow-hidden bg-slate-50 p-4 flex items-center justify-center">
                          {rImg ? (
                            <img
                              src={rImg}
                              alt={rel.name}
                              className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <Package size={36} className="text-slate-300" />
                          )}
                        </div>

                        <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                          <h3 className="line-clamp-2 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1749A0] transition leading-snug">
                            {rel.name}
                          </h3>

                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              <div className="text-sm font-extrabold text-slate-900">
                                Rs. {rEff.toLocaleString()}
                              </div>
                              {rDisc > 0 && (
                                <div className="text-[11px] text-slate-400 line-through">
                                  Rs. {rPrice.toLocaleString()}
                                </div>
                              )}
                            </div>

                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-[#1749A0] group-hover:text-white">
                              <Eye size={14} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Zoom Dialog */}
        <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
          <DialogContent className="max-w-3xl p-6 bg-white rounded-3xl border-0 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-bold text-slate-700 truncate pr-6">
                {product?.name}
              </DialogTitle>
            </DialogHeader>
            <div className="relative aspect-square w-full max-h-[70vh] flex items-center justify-center p-4 bg-slate-50 rounded-2xl overflow-hidden">
              {activeImageUrl && (
                <img
                  src={activeImageUrl}
                  alt={product?.name || "Product image"}
                  className="max-h-full max-w-full object-contain"
                />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2 pt-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedImageIndex(i)}
                    className={`h-12 w-12 rounded-xl border p-1 bg-white overflow-hidden cursor-pointer ${
                      i === selectedImageIndex
                        ? "border-[#1749A0] ring-2 ring-[#1749A0]/20"
                        : "border-slate-200 opacity-60"
                    }`}
                  >
                    <img
                      src={img}
                      alt="thumbnail"
                      className="h-full w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}
