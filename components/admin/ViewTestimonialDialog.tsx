"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Quote, User, X, CheckCircle2, XCircle, Briefcase, Calendar } from "lucide-react";
import { TestimonialItem } from "./AddTestimonialDialog";

interface ViewTestimonialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testimonial: TestimonialItem | null;
}

export const ViewTestimonialDialog: React.FC<ViewTestimonialDialogProps> = ({
  open,
  onOpenChange,
  testimonial,
}) => {
  if (!testimonial) return null;

  const getImage = (t: any) => {
    const img = t?.imageUrl || t?.image || "";
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

  const imageUrl = getImage(testimonial);
  const isPublished =
    testimonial.isPublished === true ||
    testimonial.isPublished === "true" ||
    testimonial.isPublished === 1 ||
    testimonial.isPublished === "1";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-lg p-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1749A0]">
              <Quote className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Testimonial Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Full review information
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
            {imageUrl ? (
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-white shadow-xs">
                <img
                  src={imageUrl}
                  alt={testimonial.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold text-xl border border-indigo-200">
                {testimonial.name?.[0]?.toUpperCase() || "T"}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-slate-900 truncate">
                {testimonial.name}
              </h4>
              {testimonial.designation && (
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Briefcase size={12} className="text-slate-400 shrink-0" />
                  <span>{testimonial.designation}</span>
                </p>
              )}
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {isPublished ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={12} /> Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <XCircle size={12} /> Draft / Unpublished
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Review Message
            </label>
            <div className="relative p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-slate-700 text-sm italic leading-relaxed">
              <Quote className="h-4 w-4 text-[#1749A0]/30 absolute top-3 left-3" />
              <p className="pl-5">&ldquo;{testimonial.message}&rdquo;</p>
            </div>
          </div>

          {testimonial.createdAt && (
            <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-100 pt-3">
              <Calendar size={13} />
              <span>Created on: {new Date(testimonial.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/50 px-6 py-3.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewTestimonialDialog;
