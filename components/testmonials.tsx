"use client";

import React from "react";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Verified Customer",
    review:
      "An amazing experience from start to finish. The service was excellent and everything felt very professional.",
    rating: 5,
    avatar: "SM",
  },
  {
    name: "Daniel Carter",
    role: "Verified Customer",
    review:
      "Really impressed with the quality and attention to detail. I would definitely recommend this to others.",
    rating: 5,
    avatar: "DC",
  },
  {
    name: "Emma Wilson",
    role: "Verified Customer",
    review:
      "Everything was smooth, easy, and exactly as described. The team was helpful and very responsive.",
    rating: 5,
    avatar: "EW",
  },
];

const Testimonials = () => {
  return (
    <section className="w-full bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-500">
            Testimonials
          </span>

          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Loved by our customers
          </h2>

          <p className="mt-4 text-sm leading-6 text-gray-500 sm:text-base">
            See what our customers have to say about their experience with us.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="group rounded-2xl border border-gray-100 bg-gray-50/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gray-200 hover:bg-white hover:shadow-lg"
            >
              {/* Top */}
              <div className="flex items-start justify-between">
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-current text-yellow-500"
                    />
                  ))}
                </div>

                <Quote size={28} strokeWidth={1.5} className="text-gray-200" />
              </div>

              {/* Review */}
              <p className="mt-6 min-h-[100px] text-sm leading-7 text-gray-600">
                “{testimonial.review}”
              </p>

              {/* Customer */}
              <div className="mt-6 flex items-center gap-3 border-t border-gray-200 pt-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                  {testimonial.avatar}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {testimonial.name}
                  </h3>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
