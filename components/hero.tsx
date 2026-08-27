"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookMarked,
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileText,
  GraduationCap,
  Heart,
  Mountain,
  PenTool,
  Plane,
  RotateCcw,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";

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

const defaultSlides = [
  {
    id: "default-1",
    title: "पढ्ने बानी, सफलताको पहिलो पाइला ।",
    subtitle:
      "Explore Thousands of Books, E-books & Audiobooks All in One Place.",
    image: "",
  },
  {
    id: "default-2",
    title: "नेपाली तथा विदेशी पुस्तकहरूको विशाल भण्डार",
    subtitle:
      "Discover Best Sellers, New Releases & Academic Books at Best Prices.",
    image: "",
  },
  {
    id: "default-3",
    title: "नेपालभरि द्रुत तथा सुरक्षित डेलिभरी",
    subtitle: "100% Genuine Books Delivered Straight to Your Doorstep.",
    image: "",
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
  const [displayIndex, setDisplayIndex] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch Banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axiosAuthInstance.get("/v1/banner");
        const data = response.data;
        const bannerList = Array.isArray(data)
          ? data
          : data?.data || data?.banners || [];
        setBanners(bannerList);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      }
    };

    fetchBanners();
  }, []);

  // Fetch Genres via /v1/genre
  useEffect(() => {
    const fetchGenres = async () => {
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
      : defaultSlides;

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
            {genres.slice(0, 13).map((genre) => (
              <Link
                key={genre.id}
                href={`/books?genre=${genre.id}`}
                className="group flex w-full items-center justify-between px-2.5 py-[7px] text-left transition hover:bg-gray-50"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {genre.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={genre.icon}
                      alt={genre.name || ""}
                      className="w-3.5 h-3.5 object-contain shrink-0"
                    />
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
          </div>
        </aside>

        {/* Hero Banner Carousel */}
        <div
          className="group relative flex min-h-[360px] flex-1 flex-col overflow-hidden rounded-lg bg-[#071020]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Slides */}
          <div className="relative min-h-[250px] flex-1 overflow-hidden">
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
                  className="relative flex h-full min-w-full shrink-0 items-center justify-between overflow-hidden px-5 py-6 sm:px-10"
                >
                  {slide.image && (
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url("${slide.image}")` }}
                    />
                  )}

                  {slide.image && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#030914]/90 via-[#071020]/75 to-transparent" />
                  )}

                  <div className="relative z-10 max-w-[500px]">
                    <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-blue-200 backdrop-blur-sm">
                      <BookOpen size={11} />
                      Welcome to Nepsole
                    </span>

                    <h1 className="text-xl font-bold leading-snug text-white sm:text-2xl md:text-3xl">
                      {slide.title}
                    </h1>

                    <p className="mt-2 text-xs leading-relaxed text-blue-100 sm:text-sm">
                      {slide.subtitle}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-2.5">
                      <Link
                        href="/books"
                        className="rounded-md bg-[#1749A0] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123980]"
                      >
                        Explore Books
                      </Link>

                      <Link
                        href="/eBooks"
                        className="rounded-md border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                      >
                        Browse E-Books
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Arrows */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/60 cursor-pointer"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/60 cursor-pointer"
                  aria-label="Next Slide"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}

            {/* Dots */}
            {slides.length > 1 && (
              <div className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
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
          </div>

          {/* Features Strip */}
          <div className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="grid grid-cols-2 divide-x divide-white/10 py-2 sm:grid-cols-4">
              {features.map(({ icon: Icon, title, subtitle }) => (
                <div
                  key={title}
                  className="flex items-center gap-2 px-3 py-1 text-white sm:px-4"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-blue-300">
                    <Icon size={14} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{title}</p>
                    <p className="truncate text-[10px] text-blue-200">
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
