"use client";

import { axiosInstance } from "@/utils/axiosInstances";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Quote,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export interface TestimonialItem {
  id?: number | string;
  name: string;
  designation?: string;
  message?: string;
  image?: string | null;
  imageUrl?: string | null;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(3);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [enableTransition, setEnableTransition] = useState<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      setIsLoading(true);
      try {
        let response;
        try {
          response = await axiosInstance.get("/v1/testimonial");
        } catch {
          response = await axiosInstance.get("/v1/testimonials");
        }
        const rawData = response.data;
        const list =
          rawData?.data ||
          rawData?.testimonials ||
          rawData?.testimonial ||
          (Array.isArray(rawData) ? rawData : []);

        const published = list.filter((t: any) => {
          if (t.isPublished === undefined || t.isPublished === null)
            return true;
          return (
            t.isPublished === true ||
            t.isPublished === "true" ||
            t.isPublished === 1 ||
            t.isPublished === "1"
          );
        });

        if (published.length > 0) {
          setTestimonials(published);
        }
      } catch (error) {
        console.error("Failed to fetch testimonials:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const total = testimonials.length;
  const isCarousel = total > 3;

  // Extended list to support seamless infinite loop scrolling
  const extendedList = isCarousel
    ? [...testimonials, ...testimonials, ...testimonials, ...testimonials]
    : testimonials;

  // Auto-advance loop clockwise continuously
  useEffect(() => {
    if (!isCarousel || isHovered) return;

    const interval = setInterval(() => {
      handleNext();
    }, 3500);

    return () => clearInterval(interval);
  }, [isCarousel, isHovered, total, currentIndex]);

  const handleNext = () => {
    if (!enableTransition) return;
    setEnableTransition(true);
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= total) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setEnableTransition(false);
          setCurrentIndex(0);
          setTimeout(() => setEnableTransition(true), 50);
        }, 600);
      }
      return next;
    });
  };

  const handlePrev = () => {
    if (!enableTransition) return;
    setEnableTransition(true);
    setCurrentIndex((prev) => {
      if (prev <= 0) {
        setEnableTransition(false);
        const resetPos = total;
        setCurrentIndex(resetPos);
        setTimeout(() => {
          setEnableTransition(true);
          setCurrentIndex(resetPos - 1);
        }, 50);
        return resetPos;
      }
      return prev - 1;
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getImageUrl = (t: TestimonialItem) => {
    const img = t.imageUrl || t.image || "";
    if (!img) return "";
    if (
      img.startsWith("http://") ||
      img.startsWith("https://") ||
      img.startsWith("data:") ||
      img.startsWith("blob:")
    ) {
      return img;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    return `${baseUrl}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  if (!isLoading && testimonials.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full bg-slate-50/50 py-20 sm:py-28 overflow-hidden">
      {/* Decorative Background Glows */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#1749A0]/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#1749A0]/8 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Loved By Our Customers
          </h2>

          <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-600">
            Hear directly from the people and teams who trust us every day for
            top quality and service.
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-9 w-9 animate-spin text-[#1749A0]" />
            <p className="mt-3 text-xs font-medium text-slate-500">
              Loading testimonials...
            </p>
          </div>
        ) : !isCarousel ? (
          /* Grid View for <= 3 items */
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <TestimonialCard
                key={testimonial.id || idx}
                testimonial={testimonial}
                getImageUrl={getImageUrl}
                getInitials={getInitials}
              />
            ))}
          </div>
        ) : (
          /* Clockwise Infinite Loop Carousel for > 3 items */
          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="overflow-hidden py-4 -mx-2">
              <div
                className={`flex ${
                  enableTransition
                    ? "transition-transform duration-600 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    : "transition-none"
                }`}
                style={{
                  transform: `translateX(-${
                    currentIndex * (100 / visibleCount)
                  }%)`,
                }}
              >
                {extendedList.map((testimonial, idx) => (
                  <div
                    key={`${testimonial.id || idx}-${idx}`}
                    className="shrink-0 px-3"
                    style={{ width: `${100 / visibleCount}%` }}
                  >
                    <TestimonialCard
                      testimonial={testimonial}
                      getImageUrl={getImageUrl}
                      getInitials={getInitials}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation & Controls */}
            <div className="mt-10 flex items-center justify-center gap-5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition-all duration-200 hover:bg-[#1749A0] hover:text-white hover:border-[#1749A0] active:scale-95 cursor-pointer"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Indicator Dots */}
              <div className="flex items-center gap-2 px-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setEnableTransition(true);
                      setCurrentIndex(i);
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === currentIndex % total
                        ? "w-8 bg-[#1749A0] shadow-sm shadow-[#1749A0]/30"
                        : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next testimonial"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-[#1749A0] text-white shadow-md transition-all duration-200 hover:bg-[#123b83] active:scale-95 cursor-pointer"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

/* Reusable Testimonial Card Component */
const TestimonialCard: React.FC<{
  testimonial: TestimonialItem;
  getImageUrl: (t: TestimonialItem) => string;
  getInitials: (name?: string) => string;
}> = ({ testimonial, getImageUrl, getInitials }) => {
  const imageUrl = getImageUrl(testimonial);

  return (
    <div className="group relative h-full flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#1749A0]/10 hover:border-[#1749A0]/30">
      {/* Decorative Card Top Border Highlight */}
      <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#1749A0]/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-t-3xl" />

      <div>
        {/* Quote Icon */}
        <div className="flex items-center justify-end">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0] transition-colors group-hover:bg-[#1749A0] group-hover:text-white">
            <Quote size={18} strokeWidth={2} />
          </div>
        </div>

        {/* Message */}
        <p className="mt-5 min-h-[96px] text-sm leading-relaxed text-slate-600 font-medium">
          “{testimonial.message}”
        </p>
      </div>

      {/* Customer Info Footer */}
      <div className="mt-6 flex items-center gap-3.5 border-t border-slate-100 pt-5">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={testimonial.name || "Customer"}
            className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-[#1749A0]/20"
          />
        ) : (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1749A0] to-[#0f3273] text-xs font-bold text-white shadow-sm ring-2 ring-[#1749A0]/20">
            {getInitials(testimonial.name)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {testimonial.name}
            </h3>
            <CheckCircle2 size={14} className="text-[#1749A0] shrink-0" />
          </div>

          <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
            {testimonial.designation || "Verified Customer"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
