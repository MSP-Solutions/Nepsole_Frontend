"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Save, Loader2, Tag, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { axiosAuthInstance } from "@/utils/axiosInstances";

export interface StationaryCategory {
  id?: number | string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface AddStationaryCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  categoryToEdit?: StationaryCategory | null;
}

export const formatSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const AddStationaryCategoryDialog: React.FC<
  AddStationaryCategoryDialogProps
> = ({ open, onOpenChange, onSuccess, categoryToEdit }) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setSlug("");
    setIsSlugManuallyEdited(false);
  };

  useEffect(() => {
    if (open) {
      if (categoryToEdit) {
        setName(categoryToEdit.name || "");
        setSlug(categoryToEdit.slug || "");
        setIsSlugManuallyEdited(true);
      } else {
        resetForm();
      }
    }
  }, [open, categoryToEdit]);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited) {
      setSlug(formatSlug(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(val.toLowerCase().replace(/\s+/g, "-"));
  };

  const handleAutoGenerateSlug = () => {
    setSlug(formatSlug(name));
    setIsSlugManuallyEdited(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedSlug = (slug.trim() || formatSlug(trimmedName)).trim();

    if (!trimmedName) {
      toast.error("Please enter a category name.");
      return;
    }

    if (!trimmedSlug) {
      toast.error("Please provide a valid slug.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      name: trimmedName,
      slug: trimmedSlug,
    };

    try {
      if (categoryToEdit?.id) {
        // Update endpoint: /v1/category/:id (with fallback to /api/v1/category/:id, and PUT/PATCH fallbacks)
        const updatePrimary = `/v1/category/${categoryToEdit.id}`;

        await axiosAuthInstance.patch(updatePrimary, payload);

        toast.success("Stationery category updated successfully!");
      } else {
        // Create endpoint: /v1/category (with fallback to /api/v1/category)
        const createPrimary = "/v1/category";

        await axiosAuthInstance.post(createPrimary, payload);

        toast.success("Stationery category created successfully!");
      }

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to save stationery category:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save stationery category.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0]">
              <Tag size={18} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                {categoryToEdit
                  ? "Edit Stationery Category"
                  : "Add Stationery Category"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {categoryToEdit
                  ? "Update name and slug for this stationery category."
                  : "Create a new stationery category with name and slug."}
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-5">
            {/* Category Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Category Name <span className="text-rose-500">*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Art & Craft Supplies"
                required
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
              />
            </div>

            {/* Category Slug */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">
                  Category Slug <span className="text-rose-500">*</span>
                </label>
                {name && (
                  <button
                    type="button"
                    onClick={handleAutoGenerateSlug}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1749A0] hover:underline cursor-pointer"
                  >
                    <Sparkles size={12} />
                    Auto-generate
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="e.g. art-and-craft-supplies"
                  required
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-mono text-xs outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
                />
              </div>

              <p className="mt-1 text-[11px] text-gray-400">
                Used in URL identifiers and filtering (URL-friendly string).
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/50 px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#123b83] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {isSubmitting
                ? categoryToEdit
                  ? "Updating..."
                  : "Creating..."
                : categoryToEdit
                  ? "Update Category"
                  : "Create Category"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStationaryCategoryDialog;
