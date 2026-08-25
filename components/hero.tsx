"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  BookMarked,
  BookOpen,
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

import { axiosAuthInstance } from "@/utils/axiosInstances";

interface Banner {
  id: string | number;
  title: string;
  image?: string;
  imageUrl?: string;
  url?: string;
  imagePath?: string;
}

const categories = [
  { name: "Fiction", icon: BookOpen },
  { name: "Non-Fiction", icon: FileText },
  { name: "Biography", icon: UserRound },
  { name: "Self Help", icon: CircleHelp },
  { name: "Business & Economics", icon: BarChart3 },
  { name: "Children's Books", icon: UserRound },
  { name: "Science & Technology", icon: BookOpen },
  { name: "Education", icon: GraduationCap },
  { name: "Health & Fitness", icon: Heart },
  { name: "Nepali Literature", icon: Mountain },
  { name: "Religious & Spirituality", icon: BookMarked },
  { name: "Travel & Maps", icon: Plane },
  { name: "Poetry & Drama", icon: PenTool },
];

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
  const [displayIndex, setDisplayIndex] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

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
    if (slides.length <= 1) return;

    if (displayIndex === extendedSlides.length - 1) {
      // Reached clone of the first slide -> jump back to real first slide invisibly
      setWithTransition(false);
      setDisplayIndex(1);
    } else if (displayIndex === 0) {
      // Reached clone of the last slide -> jump forward to real last slide invisibly
      setWithTransition(false);
      setDisplayIndex(slides.length);
    }
  };

  const handlePrevious = () => {
    if (slides.length <= 1) return;
    setWithTransition(true);
    setDisplayIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (slides.length <= 1) return;
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
        {/* Categories */}
        <aside className="hidden w-[195px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white lg:block">
          <div className="border-b border-gray-200 bg-gray-50 px-3 py-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-800">
              Shop by Category
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {categories.map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                className="group flex w-full items-center justify-between px-2.5 py-[6px] text-left transition hover:bg-gray-50"
              >
                <span className="flex min-w-0 items-center gap-1.5">
                  <Icon
                    size={12}
                    strokeWidth={1.5}
                    className="shrink-0 text-gray-500 transition group-hover:text-[#1749A0]"
                  />

                  <span className="truncate text-sm font-medium text-gray-600 transition group-hover:text-[#1749A0]">
                    {name}
                  </span>
                </span>

                <ChevronRight
                  size={11}
                  className="shrink-0 text-gray-300 transition group-hover:text-[#1749A0]"
                />
              </button>
            ))}

            <button
              type="button"
              className="flex w-full items-center gap-1.5 px-2.5 py-2 text-sm font-semibold text-[#1749A0] transition hover:bg-blue-50"
            >
              <BookOpen size={12} />

              <span>View All Categories</span>

              <ChevronRight size={11} className="ml-auto" />
            </button>
          </div>
        </aside>

        {/* Hero */}
        <div
          className="group relative flex min-h-[360px] flex-1 flex-col overflow-hidden rounded-lg bg-[#071020]"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Slides */}
          <div className="relative min-h-[250px] flex-1 overflow-hidden">
            <div
              onTransitionEnd={handleTransitionEnd}
              className={`flex h-full ${
                withTransition
                  ? "transition-transform duration-700 ease-in-out"
                  : ""
              }`}
              style={{
                transform: `translateX(-${currentTranslateIndex * 100}%)`,
              }}
            >
              {extendedSlides.map((slide, index) => (
                <div
                  key={`${slide.id}-${index}`}
                  className="relative flex h-full min-w-full items-center"
                >
                  {slide.image ? (
                    <>
                      <img
                        src={slide.image}
                        alt={slide.title}
                        loading="lazy"
                        draggable={false}
                        className="absolute inset-0 h-full w-full object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

                      <div className="relative z-10 max-w-[500px] px-5 py-8 sm:px-8">
                        <h1 className="text-xl font-extrabold leading-tight text-white sm:text-2xl md:text-[28px]">
                          {slide.title}
                        </h1>

                        <p className="mt-2 text-xs text-gray-200 sm:text-sm">
                          {slide.subtitle}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="relative flex h-full w-full items-center px-5 py-8 sm:px-8">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#071020] via-[#071020]/90 to-[#071020]/40" />

                      <div className="relative z-10 max-w-[420px]">
                        <h1 className="text-xl font-extrabold leading-tight tracking-tight text-white sm:text-2xl md:text-[29px]">
                          {slide.title.includes("पढ्ने बानी") ? (
                            <>
                              पढ्ने बानी, सफलताको
                              <br />
                              <span className="text-[#F59E0B]">
                                पहिलो पाइला ।
                              </span>
                            </>
                          ) : (
                            slide.title
                          )}
                        </h1>

                        <p className="mt-3 max-w-[350px] text-xs leading-relaxed text-gray-300 sm:text-sm">
                          {slide.subtitle}
                        </p>
                      </div>

                      <div className="relative z-10 ml-auto mr-4 hidden h-[118px] w-[80px] shrink-0 border-l-[3px] border-[#2774E8] bg-[#06101F] shadow-lg md:block">
                        <div className="flex h-full flex-col items-center justify-center p-1">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#082969] p-1 text-center">
                            <span className="text-[7px] font-bold leading-tight text-white">
                              किताबलाई
                              <br />
                              घरमै लैजानुहोस्
                            </span>
                          </div>

                          <span className="mt-2 text-[6px] font-medium text-gray-400">
                            Nepsole
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Navigation */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevious}
                  aria-label="Previous slide"
                  className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/70 group-hover:opacity-100"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next slide"
                  className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/70 group-hover:opacity-100"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {/* Features */}
          <div className="border-t border-gray-800/60 bg-[#061020]/95 px-4 py-3 sm:px-8 sm:py-4">
            <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-4 sm:gap-6">
              {features.map(({ icon: Icon, title, subtitle }) => (
                <div
                  key={title}
                  className="flex min-w-0 items-center gap-2 sm:gap-3"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-gray-500/60 bg-[#172235] sm:h-8 sm:w-8">
                    <Icon size={13} strokeWidth={1.5} className="text-white" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white sm:text-sm">
                      {title}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-gray-400">
                      {subtitle}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dots */}
            {slides.length > 1 && (
              <div className="mt-3 flex justify-center gap-1.5">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id || index}
                    type="button"
                    onClick={() => handleDotClick(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      activeDotIndex === index
                        ? "w-6 bg-[#2879F0]"
                        : "w-1.5 bg-gray-500 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
