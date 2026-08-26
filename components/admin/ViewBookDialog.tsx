"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  X,
  BookOpen,
  User,
  Building2,
  Bookmark,
  Languages,
  Calendar,
  Layers,
  Barcode,
  Maximize2,
  DollarSign,
  Package,
  TrendingUp,
  Image as ImageIcon,
  Edit2,
  Tag,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { BookItem } from "@/app/admin/(dashboard)/books/page";
import { parseQuillContent } from "@/utils/quillDecoder";

interface ViewBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book: BookItem | null;
  onEdit?: (book: BookItem) => void;
}

export const ViewBookDialog: React.FC<ViewBookDialogProps> = ({
  open,
  onOpenChange,
  book,
  onEdit,
}) => {
  const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

  if (!book) return null;

  const priceNum = Number(book.price) || 0;
  const discountNum = Number(book.discountPercent) || 0;
  const discountedPrice =
    discountNum > 0 ? priceNum - (priceNum * discountNum) / 100 : priceNum;

  // Extract Authors
  const authorsList = (book.authors || book.authorBooks || []).map((a: any) => ({
    id: a.id || a.author?.id,
    name: a.name || a.englishName || a.author?.name || a.author?.englishName || "Unknown Author",
  }));

  // Extract Genres
  const genresList = (book.genres || book.genreBooks || []).map((g: any) => ({
    id: g.id || g.genre?.id,
    name: g.name || g.englishName || g.genre?.name || "Genre",
  }));

  // Extract Languages
  const languagesList = (book.languages || book.languageBooks || []).map((l: any) => ({
    id: l.id || l.language?.id,
    name: l.name || l.englishName || l.language?.name || "Language",
    code: l.code || l.language?.code || "",
  }));

  // Extract Images
  const allImages = (book.images || book.bookImages || []).map((img: any, idx: number) => {
    if (typeof img === "string") {
      return { url: img, type: idx === 0 ? "COVER" : "INSIDE" };
    }
    return {
      url: img.url || img.imageUrl || "",
      type: img.imageType || img.type || (idx === 0 ? "COVER" : "INSIDE"),
    };
  }).filter((img) => Boolean(img.url));

  const coverImage =
    allImages.find((img) => img.type === "COVER")?.url ||
    allImages[0]?.url ||
    null;

  const renderDescription = (desc?: string) => {
    if (!desc || desc.trim() === "" || desc === `[{"insert":"\\n"}]`) {
      return <p className="text-xs text-slate-400 italic">No description provided for this book.</p>;
    }
    const htmlContent = parseQuillContent(desc);
    return (
      <div
        className="prose prose-sm max-w-none text-xs text-slate-700 leading-relaxed font-sans"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) {
      return {
        label: "Out of Stock",
        color: "bg-rose-50 text-rose-600 border-rose-200",
        icon: <XCircle className="w-3.5 h-3.5 text-rose-500" />,
      };
    }
    if (stock < 10) {
      return {
        label: `Low Stock (${stock} left)`,
        color: "bg-amber-50 text-amber-700 border-amber-200",
        icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />,
      };
    }
    return {
      label: `In Stock (${stock} available)`,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
    };
  };

  const stockStatus = getStockStatus(Number(book.stock) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[98vw] md:max-w-4xl max-h-[92vh] flex flex-col p-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-xs">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900 sm:text-lg">
                Book Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400">
                Detailed information and specifications
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onEdit(book);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition cursor-pointer border border-indigo-100"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6 text-slate-800">
          {/* 1. Main Hero Card */}
          <div className="flex flex-col sm:flex-row gap-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
            {/* Book Cover */}
            <div className="w-32 h-44 shrink-0 rounded-xl bg-slate-200 border border-slate-200 shadow-sm overflow-hidden flex items-center justify-center relative mx-auto sm:mx-0">
              {coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <span className="text-[10px]">No Cover</span>
                </div>
              )}
              <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-semibold uppercase backdrop-blur-xs">
                Cover
              </span>
            </div>

            {/* Book Meta Info */}
            <div className="flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${stockStatus.color}`}
                  >
                    {stockStatus.icon}
                    {stockStatus.label}
                  </span>
                  {discountNum > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                      <Tag className="w-3 h-3" />
                      {discountNum}% OFF
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                  {book.title}
                </h2>

                <div className="mt-2 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500">
                  {/* Publisher */}
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-medium text-slate-700">
                      {book.publisher?.name || book.publisher?.englishName || "Publisher Not Set"}
                    </span>
                  </div>

                  {/* Publication Date */}
                  {book.publicationDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(book.publicationDate).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* Pages */}
                  {book.pages && (
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{book.pages} Pages</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Authors & Genres Pills */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                {/* Authors */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase w-16 shrink-0">
                    Author(s):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {authorsList.length > 0 ? (
                      authorsList.map((a, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100 shadow-2xs"
                        >
                          <User className="w-3 h-3 text-indigo-500" />
                          {a.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No author assigned</span>
                    )}
                  </div>
                </div>

                {/* Genres */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase w-16 shrink-0">
                    Genres:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {genresList.length > 0 ? (
                      genresList.map((g, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100 shadow-2xs"
                        >
                          <Bookmark className="w-3 h-3 text-emerald-500" />
                          {g.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No genres assigned</span>
                    )}
                  </div>
                </div>

                {/* Languages */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase w-16 shrink-0">
                    Languages:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {languagesList.length > 0 ? (
                      languagesList.map((l, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-sky-50 text-sky-700 text-xs font-medium border border-sky-100 shadow-2xs"
                        >
                          <Languages className="w-3 h-3 text-sky-500" />
                          {l.name} {l.code ? `(${l.code})` : ""}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No language specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Price Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Selling Price</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base font-bold text-slate-900">
                Rs. {discountedPrice.toLocaleString()}
              </div>
              {discountNum > 0 && (
                <div className="text-[10px] text-slate-400 line-through">
                  Original: Rs. {priceNum.toLocaleString()}
                </div>
              )}
            </div>

            {/* Inventory Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Stock Available</span>
                <Package className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-base font-bold text-slate-900">
                {book.stock || 0} units
              </div>
              <div className="text-[10px] text-slate-400">
                In physical inventory
              </div>
            </div>

            {/* Sold Count Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Total Sales</span>
                <TrendingUp className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-base font-bold text-slate-900">
                {book.soldCount || 0} copies
              </div>
              <div className="text-[10px] text-slate-400">
                Units delivered to readers
              </div>
            </div>

            {/* Dimensions Card */}
            <div className="rounded-xl border border-slate-100 bg-white p-3.5 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Dimensions</span>
                <Maximize2 className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-xs font-bold text-slate-800 truncate">
                {book.widthCm || "—"} × {book.heightCm || "—"} × {book.depthCm || "—"} cm
              </div>
              <div className="text-[10px] text-slate-400">
                Width × Height × Spine
              </div>
            </div>
          </div>

          {/* 3. ISBNs & Identifiers Bar */}
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <Barcode className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-700">ISBN-13:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                {book.isbn13 || "Not Specified"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Barcode className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="font-semibold text-slate-700">ISBN-10:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                {book.isbn10 || "Not Specified"}
              </span>
            </div>

            {book.id && (
              <div className="text-slate-400 text-[11px]">
                Internal ID: <span className="font-mono text-slate-600">#{book.id}</span>
              </div>
            )}
          </div>

          {/* 4. Images Gallery */}
          {allImages.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                Book Gallery ({allImages.length} images)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPreviewImage(img.url)}
                    className="group relative aspect-[3/4] rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs cursor-pointer hover:border-indigo-400 transition"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/65 text-white text-[9px] font-semibold uppercase backdrop-blur-xs">
                      {img.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Description Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Description & Summary
            </h3>
            <div className="rounded-xl border border-slate-100 bg-white p-4.5 shadow-2xs">
              {renderDescription(book.description)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </DialogContent>

      {/* Enlarged Image Preview Modal */}
      {selectedPreviewImage && (
        <Dialog open={Boolean(selectedPreviewImage)} onOpenChange={() => setSelectedPreviewImage(null)}>
          <DialogContent
            showCloseButton={false}
            className="w-auto max-w-[90vw] max-h-[90vh] p-2 bg-black/90 rounded-2xl border-0 overflow-hidden flex items-center justify-center"
          >
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedPreviewImage}
                alt="Enlarged Preview"
                className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
              />
              <button
                type="button"
                onClick={() => setSelectedPreviewImage(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default ViewBookDialog;
