"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Upload,
  X,
  Loader2,
  Save,
  Tag,
  Layers,
  Sparkles,
  ImagePlus,
  Coins,
  Package,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  axiosAuthInstance,
  axiosMultipartInstance,
} from "@/utils/axiosInstances";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StationeryItem } from "@/types";

export interface CategoryOption {
  id: number | string;
  name: string;
  slug?: string;
  [key: string]: any;
}

export interface SubCategoryOption {
  id: number | string;
  categoryId?: number | string;
  name: string;
  slug?: string;
  [key: string]: any;
}

export interface UploadedImageFile {
  file: File;
  preview: string;
}

interface AddStationeryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  stationeryToEdit?: StationeryItem | null;
}

export const AddStationeryDialog: React.FC<AddStationeryDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  stationeryToEdit,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<string | number>("");
  const [discountPercent, setDiscountPercent] = useState<string | number>("0");
  const [stock, setStock] = useState<string | number>("");
  const [categoryId, setCategoryId] = useState<string | number>("");
  const [subCategoryId, setSubCategoryId] = useState<string | number>("");

  // Categories & SubCategories options
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategoryOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

  // Images state
  const [uploadedImages, setUploadedImages] = useState<UploadedImageFile[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch stationery categories & subcategories
  useEffect(() => {
    if (open) {
      const fetchDropdowns = async () => {
        setIsLoadingOptions(true);
        try {
          const [catRes, subCatRes] = await Promise.allSettled([
            (async () => {
              try {
                return await axiosAuthInstance.get("/v1/category?limit=100");
              } catch (e: any) {
                if (e?.response?.status === 404) {
                  return await axiosAuthInstance.get("/api/v1/category?limit=100");
                }
                throw e;
              }
            })(),
            (async () => {
              try {
                return await axiosAuthInstance.get("/v1/category/subcategories?limit=100");
              } catch (e: any) {
                if (e?.response?.status === 404) {
                  return await axiosAuthInstance.get("/api/v1/category/subcategories?limit=100");
                }
                throw e;
              }
            })(),
          ]);

          if (catRes.status === "fulfilled") {
            const data = catRes.value.data;
            const list: CategoryOption[] = Array.isArray(data)
              ? data
              : data?.data || data?.categories || [];
            setCategories(list);
          }

          if (subCatRes.status === "fulfilled") {
            const data = subCatRes.value.data;
            const list: SubCategoryOption[] = Array.isArray(data)
              ? data
              : data?.data || data?.subcategories || data?.subCategories || [];
            setSubCategories(list);
          }
        } catch (err) {
          console.error("Failed to fetch stationery categories or subcategories:", err);
        } finally {
          setIsLoadingOptions(false);
        }
      };

      fetchDropdowns();
    }
  }, [open]);

  // Reset form or populate from stationeryToEdit
  useEffect(() => {
    if (open) {
      if (stationeryToEdit) {
        setName(stationeryToEdit.name || "");
        setDescription(stationeryToEdit.description || "");
        setPrice(stationeryToEdit.price ?? "");
        setDiscountPercent(stationeryToEdit.discountPercent ?? "0");
        setStock(stationeryToEdit.stock ?? "");

        const rawCatId =
          stationeryToEdit.categoryId ??
          stationeryToEdit.category?.id ??
          stationeryToEdit.Category?.id ??
          "";
        setCategoryId(rawCatId !== "" ? String(rawCatId) : "");

        const rawSubCatId =
          stationeryToEdit.subCategoryId ??
          stationeryToEdit.subCategory?.id ??
          stationeryToEdit.SubCategory?.id ??
          "";
        setSubCategoryId(rawSubCatId !== "" ? String(rawSubCatId) : "");

        // Existing images
        const imgs = stationeryToEdit.images || stationeryToEdit.image || stationeryToEdit.imageUrl;
        if (Array.isArray(imgs)) {
          setExistingImages(
            imgs.map((im) => (typeof im === "string" ? im : im.url || im.imageUrl || "")).filter(Boolean)
          );
        } else if (typeof imgs === "string") {
          setExistingImages([imgs]);
        } else {
          setExistingImages([]);
        }

        setUploadedImages([]);
      } else {
        setName("");
        setDescription("");
        setPrice("");
        setDiscountPercent("0");
        setStock("");
        setCategoryId("");
        setSubCategoryId("");
        setUploadedImages([]);
        setExistingImages([]);
      }
    }
  }, [open, stationeryToEdit]);

  const handleClose = () => {
    uploadedImages.forEach((img) => URL.revokeObjectURL(img.preview));
    setUploadedImages([]);
    setExistingImages([]);
    onOpenChange(false);
  };

  // Filter subcategories based on selected category
  const filteredSubCategories = useMemo(() => {
    if (!categoryId) return subCategories;
    return subCategories.filter((sc) => {
      if (sc.categoryId === undefined || sc.categoryId === null) return true;
      return String(sc.categoryId) === String(categoryId);
    });
  }, [subCategories, categoryId]);

  // Mapped options for Select components
  const categorySelectItems = useMemo(() => {
    return categories.map((c) => ({
      label: c.name,
      value: String(c.id),
    }));
  }, [categories]);

  const subCategorySelectItems = useMemo(() => {
    return filteredSubCategories.map((sc) => ({
      label: sc.name,
      value: String(sc.id),
    }));
  }, [filteredSubCategories]);

  // Image Upload Handlers
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newUploaded: UploadedImageFile[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file.`);
        return;
      }
      newUploaded.push({
        file,
        preview: URL.createObjectURL(file),
      });
    });

    setUploadedImages((prev) => [...prev, ...newUploaded]);
  };

  const handleRemoveUploadedImage = (index: number) => {
    setUploadedImages((prev) => {
      const target = prev[index];
      if (target?.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculated selling price
  const calculatedSellingPrice = useMemo(() => {
    const p = Number(price) || 0;
    const d = Number(discountPercent) || 0;
    if (d <= 0) return p;
    return Math.max(0, p - (p * d) / 100);
  }, [price, discountPercent]);

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a stationery name.");
      return;
    }

    if (price === "" || isNaN(Number(price)) || Number(price) < 0) {
      toast.error("Please provide a valid price.");
      return;
    }

    if (stock === "" || isNaN(Number(stock)) || Number(stock) < 0) {
      toast.error("Please provide a valid stock quantity.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select a stationery category.");
      return;
    }

    if (!subCategoryId) {
      toast.error("Please select a stationery sub-category.");
      return;
    }

    if (!stationeryToEdit && uploadedImages.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("price", String(Number(price)));
      formData.append("discountPercent", String(Number(discountPercent) || 0));
      formData.append("stock", String(Number(stock)));
      formData.append("categoryId", String(Number(categoryId)));
      formData.append("subCategoryId", String(Number(subCategoryId)));

      // Append image files
      uploadedImages.forEach((imgObj) => {
        formData.append("images", imgObj.file);
      });

      if (stationeryToEdit?.id) {
        // Update via PATCH /v1/stationery/:id
        const updatePrimary = `/v1/stationery/${stationeryToEdit.id}`;
        const updateFallback = `/api/v1/stationery/${stationeryToEdit.id}`;

        try {
          await axiosMultipartInstance.patch(updatePrimary, formData);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            await axiosMultipartInstance.patch(updateFallback, formData);
          } else {
            throw err;
          }
        }

        toast.success("Stationery item updated successfully!");
      } else {
        // Create via POST /v1/stationery
        const createPrimary = "/v1/stationery";
        const createFallback = "/api/v1/stationery";

        try {
          await axiosMultipartInstance.post(createPrimary, formData);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            await axiosMultipartInstance.post(createFallback, formData);
          } else {
            throw err;
          }
        }

        toast.success("Stationery item created successfully!");
      }

      handleClose();
      onSuccess?.();
    } catch (error: any) {
      console.error("Failed to save stationery item:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save stationery item.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4.5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0]">
              <Package size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900">
                {stationeryToEdit ? "Edit Stationery Product" : "Add New Stationery Product"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {stationeryToEdit
                  ? "Update product information, pricing, stock, or images."
                  : "Fill out the product details and upload product images."}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-5">
            {/* Name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Faber-Castell 24 Classic Colour Pencils"
                required
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
              />
            </div>

            {/* Category & SubCategory Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Category <span className="text-rose-500">*</span>
                </label>
                <Select
                  items={categorySelectItems}
                  value={categoryId !== "" ? String(categoryId) : ""}
                  onValueChange={(val) => {
                    const nextVal = val || "";
                    setCategoryId(nextVal);
                    // Reset subcategory if category changes
                    setSubCategoryId("");
                  }}
                  disabled={isLoadingOptions}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10 cursor-pointer">
                    <SelectValue
                      placeholder={
                        isLoadingOptions ? "Loading..." : "Select Category"
                      }
                    >
                      {(val: string | null) => {
                        if (!val) return null;
                        const match = categories.find((c) => String(c.id) === String(val));
                        return match ? match.name : val;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60 rounded-xl border border-gray-200 bg-white shadow-xl z-[100]">
                    {categories.map((c) => (
                      <SelectItem
                        key={c.id}
                        value={String(c.id)}
                        className="text-xs sm:text-sm py-2 cursor-pointer font-medium"
                      >
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* SubCategory */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Sub-Category <span className="text-rose-500">*</span>
                </label>
                <Select
                  items={subCategorySelectItems}
                  value={subCategoryId !== "" ? String(subCategoryId) : ""}
                  onValueChange={(val) => setSubCategoryId(val || "")}
                  disabled={isLoadingOptions || filteredSubCategories.length === 0}
                >
                  <SelectTrigger className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10 cursor-pointer">
                    <SelectValue
                      placeholder={
                        isLoadingOptions
                          ? "Loading..."
                          : filteredSubCategories.length === 0
                            ? "No sub-categories available"
                            : "Select Sub-Category"
                      }
                    >
                      {(val: string | null) => {
                        if (!val) return null;
                        const match = subCategories.find((sc) => String(sc.id) === String(val));
                        return match ? match.name : val;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="max-h-60 rounded-xl border border-gray-200 bg-white shadow-xl z-[100]">
                    {filteredSubCategories.map((sc) => (
                      <SelectItem
                        key={sc.id}
                        value={String(sc.id)}
                        className="text-xs sm:text-sm py-2 cursor-pointer font-medium"
                      >
                        {sc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Pricing & Stock Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Price */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Price (Rs.) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 650"
                  required
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
                />
              </div>

              {/* Discount Percent */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Discount (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                  Stock Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="e.g. 5"
                  required
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
                />
              </div>
            </div>

            {/* Price Preview Callout */}
            {Number(price) > 0 && (
              <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900">
                <span className="font-medium text-slate-600">Effective Selling Price:</span>
                <span className="font-bold text-sm text-[#1749A0]">
                  Rs. {calculatedSellingPrice.toLocaleString()}
                  {Number(discountPercent) > 0 && (
                    <span className="ml-2 text-xs font-normal text-slate-400 line-through">
                      Rs. {Number(price).toLocaleString()}
                    </span>
                  )}
                </span>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High quality classic colored pencils in a tin box with soft break-resistant leads..."
                className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
              />
            </div>

            {/* Images Upload */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                Product Images <span className="text-rose-500">*</span>
              </label>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  handleFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`group flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition ${
                  isDragOver
                    ? "border-[#1749A0] bg-[#1749A0]/5"
                    : "border-gray-200 bg-gray-50/60 hover:border-[#1749A0]/40 hover:bg-[#1749A0]/5"
                }`}
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-400 shadow-xs transition group-hover:scale-105 group-hover:text-[#1749A0]">
                  <ImagePlus size={20} />
                </div>
                <p className="text-xs font-semibold text-gray-700">
                  Click to select images or drag and drop
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  PNG, JPG, JPEG, WEBP (Supports multiple images)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </div>

              {/* Image Previews */}
              {(existingImages.length > 0 || uploadedImages.length > 0) && (
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {/* Existing Images */}
                  {existingImages.map((img, i) => (
                    <div
                      key={`existing-${i}`}
                      className="group relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-xs"
                    >
                      <img
                        src={resolveImageUrl(img)}
                        alt={`Existing ${i}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(i)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-rose-600"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 py-0.5 text-center text-[9px] text-white">
                        Existing
                      </div>
                    </div>
                  ))}

                  {/* Uploaded Images */}
                  {uploadedImages.map((imgObj, i) => (
                    <div
                      key={`uploaded-${i}`}
                      className="group relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-xs"
                    >
                      <img
                        src={imgObj.preview}
                        alt={`Upload ${i}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveUploadedImage(i)}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-rose-600"
                        title="Remove image"
                      >
                        <X size={12} />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-[#1749A0]/70 py-0.5 text-center text-[9px] text-white">
                        New
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50/90 backdrop-blur-xs px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#123b83] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Save size={15} />
              )}
              {isSubmitting
                ? stationeryToEdit
                  ? "Updating..."
                  : "Creating..."
                : stationeryToEdit
                  ? "Update Stationery"
                  : "Create Stationery"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStationeryDialog;
