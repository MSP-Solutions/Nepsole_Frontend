"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Package,
  X,
  Tag,
  Layers,
  Calendar,
  Coins,
  CheckCircle2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { StationeryItem } from "@/types";

interface ViewStationeryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  stationery: StationeryItem | null;
}

export const ViewStationeryDialog: React.FC<ViewStationeryDialogProps> = ({
  open,
  onOpenChange,
  stationery,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!stationery) return null;

  // Extract images
  const rawImages = stationery.images || stationery.image || stationery.imageUrl;
  const imagesList: string[] = Array.isArray(rawImages)
    ? rawImages
        .map((img) => (typeof img === "string" ? img : img.url || img.imageUrl || ""))
        .filter(Boolean)
    : typeof rawImages === "string"
      ? [rawImages]
      : [];

  const resolveImageUrl = (img: string) => {
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

  const priceNum = Number(stationery.price) || 0;
  const discountNum = Number(stationery.discountPercent) || 0;
  const effectivePrice =
    discountNum > 0 ? Math.max(0, priceNum - (priceNum * discountNum) / 100) : priceNum;
  const stockNum = Number(stationery.stock) || 0;

  const categoryName =
    stationery.category?.name ||
    stationery.Category?.name ||
    (stationery.categoryId ? `Category #${stationery.categoryId}` : "N/A");

  const subCategoryName =
    stationery.subCategory?.name ||
    stationery.SubCategory?.name ||
    (stationery.subCategoryId ? `Sub-Category #${stationery.subCategoryId}` : "N/A");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0]">
              <Package size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                Stationery Details
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                View full specifications and inventory
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 px-6 py-5">
          {/* Main Grid: Images & Quick Specs */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                {imagesList.length > 0 ? (
                  <img
                    src={resolveImageUrl(imagesList[selectedImageIndex] || imagesList[0])}
                    alt={stationery.name}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <Package size={36} />
                    <span className="text-xs">No image available</span>
                  </div>
                )}
              </div>

              {imagesList.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {imagesList.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        selectedImageIndex === i
                          ? "border-[#1749A0] shadow-xs"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={resolveImageUrl(img)}
                        alt={`Thumb ${i}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta & Pricing */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1749A0]">
                  Stationery Product
                </span>
                <h2 className="mt-1 text-lg font-bold text-gray-900 leading-snug">
                  {stationery.name}
                </h2>
              </div>

              {/* Price card */}
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 space-y-1">
                <span className="text-xs text-gray-500 font-medium">Selling Price</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#1749A0]">
                    Rs. {effectivePrice.toLocaleString()}
                  </span>
                  {discountNum > 0 && (
                    <span className="text-sm text-gray-400 line-through">
                      Rs. {priceNum.toLocaleString()}
                    </span>
                  )}
                  {discountNum > 0 && (
                    <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      {discountNum}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Badges / Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Stock Status:</span>
                  {stockNum > 10 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                      <CheckCircle2 size={12} /> In Stock ({stockNum})
                    </span>
                  ) : stockNum > 0 ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full text-[11px]">
                      <AlertCircle size={12} /> Low Stock ({stockNum})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full text-[11px]">
                      <AlertCircle size={12} /> Out of Stock
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Category:</span>
                  <span className="font-semibold text-gray-900 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md">
                    {categoryName}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Sub-Category:</span>
                  <span className="font-semibold text-gray-900 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                    {subCategoryName}
                  </span>
                </div>

                {stationery.createdAt && (
                  <div className="flex items-center justify-between text-xs py-1">
                    <span className="text-gray-500 font-medium">Added On:</span>
                    <span className="text-gray-700">
                      {new Date(stationery.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {stationery.description && (
            <div className="space-y-1.5 border-t border-gray-100 pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Description
              </h4>
              <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                {stationery.description}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-100 bg-gray-50/50 px-6 py-3.5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewStationeryDialog;
