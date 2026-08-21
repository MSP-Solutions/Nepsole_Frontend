"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Upload, X } from "lucide-react";
import React, { useState } from "react";

export interface BookData {
  id?: number | string;
  title: string;
  price: number | string;
  discountPercent?: number | string;
  stock: number | string;
  publicationDate?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number | string;
  description: string;
  widthCm?: number | string;
  depthCm?: number | string;
  heightCm?: number | string;
  publisherId?: number | string;
  publisherName?: string;
  authors?: string;
  genres?: string;
  languages?: string;
  coverImage?: string | null;
  rating?: number | string;
  soldCount?: number | string;
}

interface AddBookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBook?: (book: BookData) => void;
}

export const AddBookDialog: React.FC<AddBookDialogProps> = ({
  open,
  onOpenChange,
  onAddBook,
}) => {
  const initialFormData: BookData = {
    title: "",
    price: "",
    discountPercent: "",
    stock: "",
    publicationDate: "",
    isbn10: "",
    isbn13: "",
    pages: "",
    description: "",
    widthCm: "",
    depthCm: "",
    heightCm: "",
    publisherName: "",
    authors: "",
    genres: "",
    languages: "English",
    coverImage: null,
    rating: "",
    soldCount: "",
  };

  const [formData, setFormData] = useState<BookData>(initialFormData);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCoverPreview(result);
        setFormData((prev) => ({ ...prev, coverImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newBook: BookData = {
      ...formData,
      id: Date.now().toString(),
      price: Number(formData.price) || 0,
      discountPercent: formData.discountPercent
        ? Number(formData.discountPercent)
        : 0,
      stock: Number(formData.stock) || 0,
      pages: formData.pages ? Number(formData.pages) : 0,
      soldCount: formData.soldCount ? Number(formData.soldCount) : 0,
      rating: formData.rating ? Number(formData.rating) : undefined,
    };

    if (onAddBook) {
      onAddBook(newBook);
    }

    setFormData(initialFormData);
    setCoverPreview(null);
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setCoverPreview(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[100vw] md:max-w-4xl max-h-[90vh] flex flex-col p-0 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
          <div>
            <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900">
              Add New Book
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-0.5">
              Enter complete details to add a new book to the catalog.
            </DialogDescription>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          id="add-book-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800"
        >
          {/* Section 1: General & Cover */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              General & Info
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {/* Cover Image Uploader */}
              <div className="md:col-span-1 flex flex-col items-center justify-center p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition relative group cursor-pointer text-center min-h-[160px]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  id="bookCoverInput"
                />
                {coverPreview ? (
                  <div className="relative w-24 h-32 rounded-md overflow-hidden border border-slate-200 bg-white shadow-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverPreview}
                      alt="Book Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-[10px] font-medium">
                      Change
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
                      <Upload className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-medium text-slate-700">
                      Upload Cover
                    </p>
                    <p className="text-[10px] text-slate-400">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
              </div>

              {/* Basic Fields */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Book Title */}
                <div className="sm:col-span-2 space-y-1">
                  <label
                    htmlFor="book-title"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Book Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="book-title"
                    type="text"
                    name="title"
                    required
                    placeholder="e.g. Atomic Habits"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Author(s) */}
                <div className="space-y-1">
                  <label
                    htmlFor="book-authors"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Author(s) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="book-authors"
                    type="text"
                    name="authors"
                    required
                    placeholder="e.g. James Clear"
                    value={formData.authors}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Publisher */}
                <div className="space-y-1">
                  <label
                    htmlFor="book-publisher"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Publisher <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="book-publisher"
                    type="text"
                    name="publisherName"
                    required
                    placeholder="e.g. Penguin Books"
                    value={formData.publisherName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Genres / Category */}
                <div className="space-y-1">
                  <label
                    htmlFor="book-genres"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Genres / Categories
                  </label>
                  <input
                    id="book-genres"
                    type="text"
                    name="genres"
                    placeholder="e.g. Self Help, Productivity"
                    value={formData.genres}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                {/* Languages */}
                <div className="space-y-1">
                  <label
                    htmlFor="book-languages"
                    className="block text-xs font-medium text-slate-700"
                  >
                    Languages
                  </label>
                  <input
                    id="book-languages"
                    type="text"
                    name="languages"
                    placeholder="e.g. English, Nepali"
                    value={formData.languages}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 2: Pricing & Inventory */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Pricing & Inventory
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Price */}
              <div className="space-y-1">
                <label
                  htmlFor="book-price"
                  className="block text-xs font-medium text-slate-700"
                >
                  Price (Rs.) <span className="text-red-500">*</span>
                </label>
                <input
                  id="book-price"
                  type="number"
                  name="price"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g. 855"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Discount Percent */}
              <div className="space-y-1">
                <label
                  htmlFor="book-discount"
                  className="block text-xs font-medium text-slate-700"
                >
                  Discount (%)
                </label>
                <input
                  id="book-discount"
                  type="number"
                  name="discountPercent"
                  step="0.01"
                  min="0"
                  max="100"
                  placeholder="e.g. 10"
                  value={formData.discountPercent}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Stock */}
              <div className="space-y-1">
                <label
                  htmlFor="book-stock"
                  className="block text-xs font-medium text-slate-700"
                >
                  Stock Units <span className="text-red-500">*</span>
                </label>
                <input
                  id="book-stock"
                  type="number"
                  name="stock"
                  min="0"
                  required
                  placeholder="e.g. 50"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Sold Count */}
              <div className="space-y-1">
                <label
                  htmlFor="book-sold-count"
                  className="block text-xs font-medium text-slate-700"
                >
                  Sold Count
                </label>
                <input
                  id="book-sold-count"
                  type="number"
                  name="soldCount"
                  min="0"
                  placeholder="e.g. 120"
                  value={formData.soldCount}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 3: Book Details & Identifiers */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Book Details & Identifiers
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Publication Date */}
              <div className="space-y-1">
                <label
                  htmlFor="book-publication-date"
                  className="block text-xs font-medium text-slate-700"
                >
                  Publication Date
                </label>
                <input
                  id="book-publication-date"
                  type="date"
                  name="publicationDate"
                  value={formData.publicationDate}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* ISBN 10 */}
              <div className="space-y-1">
                <label
                  htmlFor="book-isbn10"
                  className="block text-xs font-medium text-slate-700"
                >
                  ISBN-10
                </label>
                <input
                  id="book-isbn10"
                  type="text"
                  name="isbn10"
                  placeholder="e.g. 0735211299"
                  value={formData.isbn10}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* ISBN 13 */}
              <div className="space-y-1">
                <label
                  htmlFor="book-isbn13"
                  className="block text-xs font-medium text-slate-700"
                >
                  ISBN-13
                </label>
                <input
                  id="book-isbn13"
                  type="text"
                  name="isbn13"
                  placeholder="e.g. 978-0735211292"
                  value={formData.isbn13}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Pages */}
              <div className="space-y-1">
                <label
                  htmlFor="book-pages"
                  className="block text-xs font-medium text-slate-700"
                >
                  Total Pages
                </label>
                <input
                  id="book-pages"
                  type="number"
                  name="pages"
                  min="1"
                  placeholder="e.g. 320"
                  value={formData.pages}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Rating */}
              <div className="space-y-1">
                <label
                  htmlFor="book-rating"
                  className="block text-xs font-medium text-slate-700"
                >
                  Initial Rating (0 - 5.0)
                </label>
                <input
                  id="book-rating"
                  type="number"
                  name="rating"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="e.g. 4.8"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 4: Physical Dimensions */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Dimensions (cm)
            </h3>

            <div className="grid grid-cols-3 gap-3.5">
              {/* Width */}
              <div className="space-y-1">
                <label
                  htmlFor="book-width-cm"
                  className="block text-xs font-medium text-slate-700"
                >
                  Width (cm)
                </label>
                <input
                  id="book-width-cm"
                  type="number"
                  name="widthCm"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 14.0"
                  value={formData.widthCm}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Height */}
              <div className="space-y-1">
                <label
                  htmlFor="book-height-cm"
                  className="block text-xs font-medium text-slate-700"
                >
                  Height (cm)
                </label>
                <input
                  id="book-height-cm"
                  type="number"
                  name="heightCm"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 21.5"
                  value={formData.heightCm}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Depth */}
              <div className="space-y-1">
                <label
                  htmlFor="book-depth-cm"
                  className="block text-xs font-medium text-slate-700"
                >
                  Depth / Thickness (cm)
                </label>
                <input
                  id="book-depth-cm"
                  type="number"
                  name="depthCm"
                  step="0.1"
                  min="0"
                  placeholder="e.g. 2.5"
                  value={formData.depthCm}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Section 5: Description */}
          <div className="space-y-1">
            <label
              htmlFor="book-description"
              className="block text-xs font-medium text-slate-700"
            >
              Description / Summary
            </label>
            <textarea
              id="book-description"
              name="description"
              rows={4}
              placeholder="Write a comprehensive description of the book..."
              value={formData.description}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
            />
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-book-form"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition"
          >
            Save Book
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddBookDialog;
