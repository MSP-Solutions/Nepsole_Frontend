"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Layers, X, Save, Loader2, Sparkles, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface StationaryCategoryOption {
  id: number | string;
  name: string;
  slug?: string;
  [key: string]: any;
}

export interface StationarySubCategoryData {
  id?: number | string;
  categoryId: number | string;
  name: string;
  slug: string;
  category?: {
    id: number | string;
    name: string;
    slug?: string;
    [key: string]: any;
  };
  Category?: {
    id: number | string;
    name: string;
    slug?: string;
    [key: string]: any;
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface AddStationarySubCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  subCategoryToEdit?: StationarySubCategoryData | null;
  categories?: StationaryCategoryOption[];
}

export const formatSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const AddStationarySubCategoryDialog: React.FC<
  AddStationarySubCategoryDialogProps
> = ({
  open,
  onOpenChange,
  onSuccess,
  subCategoryToEdit,
  categories: initialCategories,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<string | number>("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [categoriesList, setCategoriesList] = useState<
    StationaryCategoryOption[]
  >(initialCategories || []);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync or fetch categories when dialog opens
  useEffect(() => {
    if (initialCategories && initialCategories.length > 0) {
      setCategoriesList(initialCategories);
    } else if (open) {
      const fetchCategories = async () => {
        setIsLoadingCategories(true);
        try {
          let res;
          try {
            res = await axiosAuthInstance.get("/v1/category?limit=100");
          } catch (err: any) {
            if (err?.response?.status === 404) {
              res = await axiosAuthInstance.get("/api/v1/category?limit=100");
            } else {
              throw err;
            }
          }
          const list = Array.isArray(res.data)
            ? res.data
            : res.data?.data || res.data?.categories || [];
          setCategoriesList(list);
        } catch (error) {
          console.error("Failed to fetch stationery categories:", error);
        } finally {
          setIsLoadingCategories(false);
        }
      };
      fetchCategories();
    }
  }, [open, initialCategories]);

  // Sync form state when dialog opens or subCategoryToEdit changes
  useEffect(() => {
    if (open) {
      if (subCategoryToEdit) {
        setName(subCategoryToEdit.name || "");
        setSlug(subCategoryToEdit.slug || "");
        const rawCategoryId =
          subCategoryToEdit.categoryId ??
          subCategoryToEdit.category?.id ??
          subCategoryToEdit.Category?.id ??
          "";
        setCategoryId(rawCategoryId);
        setIsSlugManuallyEdited(true);
      } else {
        setName("");
        setSlug("");
        setCategoryId("");
        setIsSlugManuallyEdited(false);
      }
    }
  }, [open, subCategoryToEdit]);

  const handleClose = () => {
    setName("");
    setSlug("");
    setCategoryId("");
    setIsSlugManuallyEdited(false);
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
      toast.error("Please enter a sub-category name.");
      return;
    }

    if (!categoryId && categoryId !== 0) {
      toast.error("Please select a parent stationery category.");
      return;
    }

    if (!trimmedSlug) {
      toast.error("Please provide a valid slug.");
      return;
    }

    const numericCategoryId = Number(categoryId);
    const resolvedCategoryId = !isNaN(numericCategoryId)
      ? numericCategoryId
      : categoryId;

    const payload = {
      categoryId: resolvedCategoryId,
      name: trimmedName,
      slug: trimmedSlug,
    };

    setIsSubmitting(true);

    try {
      if (subCategoryToEdit?.id) {
        // Update endpoint: PATCH /v1/category/subcategories/:id
        const updatePrimary = `/v1/category/subcategories/${subCategoryToEdit.id}`;
        const updateFallback = `/api/v1/category/subcategories/${subCategoryToEdit.id}`;

        try {
          await axiosAuthInstance.patch(updatePrimary, payload);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            await axiosAuthInstance.patch(updateFallback, payload);
          } else {
            throw err;
          }
        }

        toast.success("Stationery sub-category updated successfully!");
      } else {
        // Create endpoint: POST /v1/category/subcategories
        const createPrimary = "/v1/category/subcategories";
        const createFallback = "/api/v1/category/subcategories";

        try {
          await axiosAuthInstance.post(createPrimary, payload);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            await axiosAuthInstance.post(createFallback, payload);
          } else {
            throw err;
          }
        }

        toast.success("Stationery sub-category created successfully!");
      }

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to save stationery sub-category:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save stationery sub-category.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryItems = useMemo(() => {
    return categoriesList.map((c) => ({
      label: c.name,
      value: String(c.id),
    }));
  }, [categoriesList]);

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
              <Layers size={18} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                {subCategoryToEdit
                  ? "Edit Stationery Sub-Category"
                  : "Add Stationery Sub-Category"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {subCategoryToEdit
                  ? "Update category assignment, name, or slug."
                  : "Create a sub-category under a parent stationery category."}
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
            {/* Parent Stationery Category Select */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Stationery Category <span className="text-rose-500">*</span>
              </label>

              <Select
                items={categoryItems}
                value={categoryId !== "" ? String(categoryId) : ""}
                onValueChange={(val) => {
                  if (val) {
                    const num = Number(val);
                    setCategoryId(!isNaN(num) ? num : val);
                  } else {
                    setCategoryId("");
                  }
                }}
                disabled={isLoadingCategories}
              >
                <SelectTrigger className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm h-11 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10 cursor-pointer">
                  <SelectValue
                    placeholder={
                      isLoadingCategories
                        ? "Loading categories..."
                        : "Select stationery category"
                    }
                  >
                    {(val: string | null) => {
                      if (!val) return null;
                      const matched = categoriesList.find(
                        (c) => String(c.id) === String(val),
                      );
                      return matched ? matched.name : val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-60 rounded-xl border border-gray-200 bg-white shadow-xl z-[100]">
                  {categoriesList.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={String(cat.id)}
                      className="text-xs sm:text-sm py-2 cursor-pointer font-medium"
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub-Category Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Sub-Category Name <span className="text-rose-500">*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Pencils & Erasers"
                required
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
              />
            </div>

            {/* Sub-Category Slug */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700">
                  Sub-Category Slug <span className="text-rose-500">*</span>
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

              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. pencils-and-erasers"
                required
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 font-mono text-xs outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
              />

              <p className="mt-1 text-[11px] text-gray-400">
                URL identifier for this sub-category (e.g.,
                pencils-and-erasers).
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
                ? subCategoryToEdit
                  ? "Updating..."
                  : "Creating..."
                : subCategoryToEdit
                  ? "Update Sub-Category"
                  : "Create Sub-Category"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStationarySubCategoryDialog;
