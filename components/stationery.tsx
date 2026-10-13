"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

import { getStationeryImageUrl, StationeryItem } from "@/types";
import AddToCartButton from "@/components/AddToCartButton";
import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import {
  getUserCookie,
  openAuthModal,
  WISHLIST_CHANGE_EVENT,
} from "@/utils/cookies";

const Stationery = () => {
  const [stationeryItems, setStationeryItems] = useState<StationeryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [wishlistedMap, setWishlistedMap] = useState<Record<string, boolean>>(
    {},
  );
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(false);

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Fetch stationery items from /v1/stationery
  useEffect(() => {
    const fetchStationery = async () => {
      setIsLoading(true);
      try {
        let res;
        try {
          res = await axiosInstance.get("/v1/stationery?limit=20");
        } catch (err: any) {
          if (err?.response?.status === 404) {
            res = await axiosInstance.get("/api/v1/stationery?limit=20");
          } else {
            throw err;
          }
        }

        const data = res.data?.data || res.data;
        const list: StationeryItem[] = Array.isArray(data)
          ? data
          : data?.stationery || data?.items || data?.products || [];

        setStationeryItems(list);
      } catch (error) {
        console.error("Failed to fetch stationery items for landing page:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStationery();
  }, []);

  // Update scroll buttons state when items load or window resizes
  useEffect(() => {
    if (stationeryItems.length > 6) {
      const timer = setTimeout(() => {
        checkScrollButtons();
      }, 100);
      const handleResize = () => checkScrollButtons();
      window.addEventListener("resize", handleResize);
      return () => {
        clearTimeout(timer);
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [stationeryItems]);

  // Fetch user's wishlist
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const user = await getUserCookie();
        if (!user?.accessToken) return;

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
          res.data?.data ||
          res.data?.wishlist ||
          res.data?.items ||
          res.data ||
          [];

        if (Array.isArray(data)) {
          const map: Record<string, boolean> = {};
          data.forEach((item: any) => {
            const isStat =
              item.itemType === "STATIONERY" ||
              Boolean(item.stationery) ||
              Boolean(item.stationeryId);
            if (isStat) {
              const statId =
                item.stationeryId ?? item.stationery?.id ?? item.id;
              if (statId) map[String(statId)] = true;
            }
          });
          setWishlistedMap(map);
        }
      } catch {
        // Ignore if unauthenticated
      }
    };

    fetchWishlist();
    const handleWishlistChange = () => fetchWishlist();
    window.addEventListener(WISHLIST_CHANGE_EVENT, handleWishlistChange);
    return () => {
      window.removeEventListener(WISHLIST_CHANGE_EVENT, handleWishlistChange);
    };
  }, []);

  // Toggle Wishlist
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
        openAuthModal("login");
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

      let response;
      try {
        response = await axiosAuthInstance.post("/v1/wishlist/toggle", {
          stationeryId: targetId,
        });
      } catch {
        response = await axiosAuthInstance.post("/v1/wishlist", {
          stationeryId: targetId,
        });
      }

      const msg = response?.data?.message;
      if (msg) {
        toast.success(msg, { position: "top-center" });
      } else if (!isCurrentlyWishlisted) {
        toast.success("Added to wishlist!", { position: "top-center" });
      } else {
        toast.success("Removed from wishlist", { position: "top-center" });
      }

      window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT));
    } catch (err: any) {
      // Revert optimistic update
      setWishlistedMap((prev) => ({
        ...prev,
        [String(item.id)]: !prev[String(item.id)],
      }));
      toast.error(
        err?.response?.data?.message || "Failed to update wishlist.",
        { position: "top-center" },
      );
    }
  };

  const renderStationeryCard = (
    item: StationeryItem,
    isCarousel: boolean = false,
  ) => {
    const cover = getStationeryImageUrl(item);
    const categoryName =
      item.category?.name || item.Category?.name || "Stationery";
    const priceNum = Number(item.price) || 0;
    const discountNum = Number(item.discountPercent) || 0;
    const finalPrice =
      discountNum > 0 ? priceNum - (priceNum * discountNum) / 100 : priceNum;
    const isWishlisted = Boolean(wishlistedMap[String(item.id)]);
    const isOutOfStock = Number(item.stock) <= 0;

    return (
      <Link
        key={item.id}
        href={`/stationery/${item.slug || item.id}`}
        className={`group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md ${
          isCarousel
            ? "w-[170px] sm:w-[190px] md:w-[205px] lg:w-[215px] shrink-0 snap-start"
            : ""
        }`}
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
            className={isWishlisted ? "fill-rose-500 text-rose-500" : ""}
          />
        </button>

        {/* Product Image */}
        <div className="flex h-[175px] sm:h-[195px] items-center justify-center overflow-hidden bg-slate-50/70 p-3 relative">
          {cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={cover}
              alt={item.name}
              className="h-full w-auto max-w-full object-contain transition duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-300">
              <Package size={36} />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-1 flex-col justify-between border-t border-slate-100 p-3">
          <div>
            {/* Title */}
            <h3 className="line-clamp-1 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#1749A0] transition-colors">
              {item.name}
            </h3>

            {/* Category */}
            <p className="mt-0.5 truncate text-[11px] text-slate-400">
              {categoryName}
            </p>

            {/* Price */}
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-xs sm:text-sm font-black text-[#1749A0]">
                Rs. {Math.round(finalPrice).toLocaleString()}
              </span>

              {discountNum > 0 && (
                <span className="text-[11px] text-slate-400 line-through">
                  Rs. {Math.round(priceNum).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-3">
            <AddToCartButton
              book={{
                ...item,
                title: item.name,
                stationeryId: item.id,
                itemType: "STATIONERY",
                isStationery: true,
                format: "Stationery",
              }}
              isOutOfStock={isOutOfStock}
            />
          </div>
        </div>
      </Link>
    );
  };

  const isCarousel = stationeryItems.length > 6;

  if (!isLoading && stationeryItems.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-8">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            <span>Stationery & Supplies</span>
          </h2>

          <div className="flex items-center gap-3">
            {/* Carousel Navigation Buttons */}
            {isCarousel && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleScroll("left")}
                  disabled={!canScrollLeft}
                  aria-label="Previous stationery"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll("right")}
                  disabled={!canScrollRight}
                  aria-label="Next stationery"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <Link
              href="/stationery"
              className="group inline-flex items-center gap-1 text-xs font-semibold text-[#1749A0] hover:underline"
            >
              <span>View All</span>
              <ArrowRight
                size={14}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex gap-4 overflow-hidden py-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-[170px] sm:w-[190px] md:w-[205px] lg:w-[215px] shrink-0 rounded-2xl border border-slate-200/80 bg-white p-3 space-y-3 animate-pulse"
              >
                <div className="h-[175px] sm:h-[195px] w-full bg-slate-100 rounded-xl" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
                <div className="h-8 bg-slate-100 rounded-xl w-full mt-2" />
              </div>
            ))}
          </div>
        ) : isCarousel ? (
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollButtons}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
          >
            {stationeryItems.map((item) => renderStationeryCard(item, true))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {stationeryItems.map((item) => renderStationeryCard(item, false))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Stationery;
