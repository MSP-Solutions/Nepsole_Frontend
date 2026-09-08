"use client";

import {
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";

interface Banner {
  id: string | number;
  title: string;
  image?: string;
  imageUrl?: string;
  url?: string;
  imagePath?: string;
}

export interface GenreItem {
  id: string | number;
  name: string;
  englishName?: string;
  icon?: string;
  [key: string]: any;
}

const features = [
  {
    icon: ShieldCheck,
    title: "100% Original",
    subtitle: "Genuine Books",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    subtitle: "All Over Nepal",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    subtitle: "100% Safe & Secure",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    subtitle: "7 Days Easy Return",
  },
];

const getBannerImage = (banner: Banner) => {
  const image =
    banner.imageUrl || banner.image || banner.url || banner.imagePath || "";

  if (!image) return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  return `${baseUrl}${image.startsWith("/") ? "" : "/"}${image}`;
};

export default function Hero() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [isLoadingBanners, setIsLoadingBanners] = useState(true);
  const [isLoadingGenres, setIsLoadingGenres] = useState(true);
  const [displayIndex, setDisplayIndex] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch Banners
  useEffect(() => {
    const fetchBanners = async () => {
      setIsLoadingBanners(true);
      try {
        const response = await axiosAuthInstance.get("/v1/banner");
        const data = response.data;
        const bannerList = Array.isArray(data)
          ? data
          : data?.data || data?.banners || [];
        setBanners(bannerList);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      } finally {
        setIsLoadingBanners(false);
      }
    };

    fetchBanners();
  }, []);

  // Fetch Genres via /v1/genre
  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoadingGenres(true);
      try {
        const response = await axiosInstance.get("/v1/genre");
        const data = response.data;
        const genreList = Array.isArray(data)
          ? data
          : data?.data || data?.genres || [];
        if (genreList.length > 0) {
          setGenres(genreList);
        }
      } catch (error) {
        console.error("Failed to fetch genres:", error);
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  const slides =
    banners.length > 0
      ? banners.map((banner) => ({
          id: banner.id,
          title: banner.title,
          subtitle: "Explore Special Collections & Deals on Nepsole",
          image: getBannerImage(banner),
        }))
      : [];

  // Extended slides with clones for seamless forward infinite looping
  const extendedSlides =
    slides.length > 1
      ? [slides[slides.length - 1], ...slides, slides[0]]
      : slides;

  // Auto loop timer (slides continuously forward in clockwise direction)
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setWithTransition(true);
      setDisplayIndex((prev) => prev + 1);
    }, 4500);

    return () => clearInterval(interval);
  }, [slides.length, isHovered]);

  const handleTransitionEnd = () => {
    if (displayIndex >= extendedSlides.length - 1) {
      setWithTransition(false);
      setDisplayIndex(1);
    } else if (displayIndex <= 0) {
      setWithTransition(false);
      setDisplayIndex(slides.length);
    }
  };

  const handlePrev = () => {
    setWithTransition(true);
    setDisplayIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    setWithTransition(true);
    setDisplayIndex((prev) => prev + 1);
  };

  const handleDotClick = (index: number) => {
    setWithTransition(true);
    setDisplayIndex(index + 1);
  };

  const activeDotIndex =
    slides.length > 1 ? (displayIndex - 1 + slides.length) % slides.length : 0;

  const currentTranslateIndex = slides.length > 1 ? displayIndex : 0;

  return (
    <section className="mx-auto w-full max-w-[1400px] px-3 py-3">
      <div className="flex gap-3">
        {/* Categories / Genres Sidebar */}
        <aside className="hidden w-[210px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white lg:block shadow-2xs">
          <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#1749A0]" />
              <span>Shop by Genre</span>
            </h2>
          </div>

          <div className="divide-y divide-gray-100 max-h-[385px] overflow-y-auto">
            {isLoadingGenres ? (
              <div className="p-2 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between px-2 py-1.5 animate-pulse">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="h-4 w-4 rounded bg-gray-200 shrink-0" />
                      <div
                        className="h-3.5 bg-gray-200 rounded"
                        style={{ width: `${55 + (i % 4) * 12}%` }}
                      />
                    </div>
                    <div className="h-3 w-3 rounded bg-gray-100 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                {genres.slice(0, 13).map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/books?genre=${encodeURIComponent(genre.name || genre.englishName || genre.id)}`}
                    className="group flex w-full items-center justify-between px-2.5 py-[7px] text-left transition hover:bg-gray-50"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      {genre.icon ? (
                        <div className="relative h-5 w-5 shrink-0">
                          <Image
                            src={genre.icon}
                            alt={genre.name || ""}
                            fill
                            sizes="20px"
                            className="object-contain rounded-sm"
                            unoptimized={
                              typeof genre.icon === "string" &&
                              (genre.icon.startsWith("data:") ||
                                genre.icon.endsWith(".svg"))
                            }
                          />
                        </div>
                      ) : (
                        <Bookmark
                          size={12}
                          strokeWidth={1.5}
                          className="shrink-0 text-gray-500 transition group-hover:text-[#1749A0]"
                        />
                      )}

                      <span className="truncate text-xs font-medium text-gray-700 transition group-hover:text-[#1749A0]">
                        {genre.name || genre.englishName}
                      </span>
                    </span>

                    <ChevronRight
                      size={11}
                      className="shrink-0 text-gray-300 transition group-hover:text-[#1749A0]"
                    />
                  </Link>
                ))}

                <Link
                  href="/books"
                  className="flex w-full items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-[#1749A0] transition hover:bg-blue-50"
                >
                  <BookOpen size={12} />
                  <span>View All Genres</span>
                  <ChevronRight size={11} className="ml-auto" />
                </Link>
              </>
            )}
          </div>
        </aside>

        {/* Hero Banner Carousel */}
        <div
          className={`group relative flex min-h-[360px] flex-1 flex-col overflow-hidden rounded-lg ${
            isLoadingBanners
              ? "border border-gray-200 bg-white shadow-2xs"
              : "bg-[#071020]"
          }`}
          onMouseEnter={() => !isLoadingBanners && setIsHovered(true)}
          onMouseLeave={() => !isLoadingBanners && setIsHovered(false)}
        >
          {/* Slides */}
          <div className="relative min-h-[350px] flex-1 overflow-hidden">
            {isLoadingBanners ? (
              <div className="relative flex h-full min-h-[350px] w-full animate-pulse flex-col justify-between p-6 sm:p-10 bg-white">
                {/* Content Skeleton */}
                <div className="relative z-10 max-w-lg space-y-4 pt-4">
                  <div className="h-5 w-28 rounded-full bg-slate-200" />
                  <div className="space-y-2.5">
                    <div className="h-8 w-4/5 rounded-lg bg-slate-200 sm:h-10" />
                    <div className="h-8 w-3/5 rounded-lg bg-slate-200 sm:h-10" />
                  </div>
                  <div className="space-y-2 pt-2">
                    <div className="h-3.5 w-full max-w-sm rounded bg-slate-100" />
                    <div className="h-3.5 w-3/4 max-w-xs rounded bg-slate-100" />
                  </div>
                  <div className="pt-2">
                    <div className="h-9 w-32 rounded-lg bg-slate-200" />
                  </div>
                </div>

                {/* Bottom Skeleton Dots */}
                <div className="relative z-10 flex items-center justify-center gap-2 pb-2">
                  <div className="h-1.5 w-6 rounded-full bg-slate-300" />
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                </div>
              </div>
            ) : slides.length === 0 ? (
              <div className="flex h-full min-h-[350px] w-full items-center justify-center bg-gradient-to-br from-[#071020] to-[#1749A0]/40 p-8 text-center text-white">
                <div className="max-w-md space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold">
                    Welcome to Nepsole
                  </h2>
                  <p className="text-xs sm:text-sm text-blue-200">
                    Explore Thousands of Books, E-books & Audiobooks
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="flex h-full"
                  style={{
                    transform: `translateX(-${currentTranslateIndex * 100}%)`,
                    transition: withTransition
                      ? "transform 700ms cubic-bezier(0.4, 0, 0.2, 1)"
                      : "none",
                  }}
                  onTransitionEnd={handleTransitionEnd}
                >
                  {extendedSlides.map((slide, index) => (
                    <div
                      key={`${slide.id}-${index}`}
                      className="relative flex h-full min-w-full shrink-0 items-center justify-between overflow-hidden"
                    >
                      {slide.image ? (
                        <Image
                          src={slide.image}
                          alt={slide.title || "Hero Banner"}
                          fill
                          priority={index === 1 || index === 0}
                          className="object-fill"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#071020] to-[#1749A0]/40 p-8 text-center text-white">
                          <div className="max-w-md space-y-2">
                            <h2 className="text-xl sm:text-2xl font-bold">
                              {slide.title || "Welcome to Nepsole"}
                            </h2>
                            <p className="text-xs sm:text-sm text-blue-200">
                              {slide.subtitle ||
                                "Explore Thousands of Books, E-books & Audiobooks"}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Arrows */}
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/60 cursor-pointer z-10"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/60 cursor-pointer z-10"
                      aria-label="Next Slide"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {/* Dots */}
                {slides.length > 1 && (
                  <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 z-10">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDotClick(index)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                          activeDotIndex === index
                            ? "w-6 bg-white"
                            : "w-1.5 bg-white/40 hover:bg-white/70"
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Features Strip */}
          <div
            className={`relative z-10 border-t backdrop-blur-sm ${
              isLoadingBanners
                ? "border-gray-100 bg-gray-50/80"
                : "border-white/10 bg-white/5"
            }`}
          >
            <div
              className={`grid grid-cols-2 divide-x py-2 sm:grid-cols-4 ${
                isLoadingBanners ? "divide-gray-200" : "divide-white/10"
              }`}
            >
              {features.map(({ icon: Icon, title, subtitle }) => (
                <div
                  key={title}
                  className={`flex items-center gap-2 px-3 py-1 sm:px-4 ${
                    isLoadingBanners ? "text-slate-700" : "text-white"
                  }`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                      isLoadingBanners
                        ? "bg-slate-200 text-slate-500"
                        : "bg-white/10 text-blue-300"
                    }`}
                  >
                    <Icon size={14} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{title}</p>
                    <p
                      className={`truncate text-[10px] ${
                        isLoadingBanners ? "text-slate-400" : "text-blue-200"
                      }`}
                    >
                      {subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
