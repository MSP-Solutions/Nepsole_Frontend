"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosMultipartInstance } from "@/utils/axiosInstances";
import {
  Upload,
  Image as ImageIcon,
  X,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

export interface BannerItem {
  id: string | number;
  title: string;
  image?: string;
  imageUrl?: string;
  url?: string;
  imagePath?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface AddBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  bannerToEdit?: BannerItem | null;
}

export const AddBannerDialog: React.FC<AddBannerDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
  bannerToEdit,
}) => {
  const [title, setTitle] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to extract displayable image URL
  const getBannerImage = (b: any) => {
    const img = b?.imageUrl || b?.image || b?.url || b?.imagePath || "";
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

  const resetForm = () => {
    setTitle("");
    setImagePreview(null);
    setSelectedFile(null);
    setIsDragOver(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (open) {
      if (bannerToEdit) {
        setTitle(bannerToEdit.title || "");
        const img = getBannerImage(bannerToEdit);
        setImagePreview(img || null);
        setSelectedFile(null);
      } else {
        resetForm();
      }
    }
  }, [open, bannerToEdit]);

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a banner title.");
      return;
    }

    if (!bannerToEdit && !selectedFile) {
      toast.error("Please upload a banner image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());

      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      if (bannerToEdit?.id) {
        try {
          await axiosMultipartInstance.put(
            `/v1/banner/${bannerToEdit.id}`,
            formData,
          );
        } catch {
          await axiosMultipartInstance.patch(
            `/v1/banner/${bannerToEdit.id}`,
            formData,
          );
        }
        toast.success("Banner updated successfully!");
      } else {
        await axiosMultipartInstance.post("/v1/banner", formData);
        toast.success("Banner uploaded successfully!");
      }

      onSuccess?.();
      handleClose();
    } catch (error: any) {
      console.error("Save Banner Error:", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save banner. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0]">
              <ImageIcon size={20} />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">
                {bannerToEdit ? "Edit Banner" : "Add New Banner"}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                {bannerToEdit
                  ? "Update banner title and image."
                  : "Upload promotional or homepage banner image with title."}
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
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Banner Title */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Banner Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Summer Book Fair - Up to 40% Off"
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
            />
          </div>

          {/* Banner Image Upload */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Banner Image{" "}
              {!bannerToEdit && <span className="text-rose-500">*</span>}
            </label>

            {!imagePreview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition ${
                  isDragOver
                    ? "border-[#1749A0] bg-[#1749A0]/5"
                    : "border-gray-200 bg-gray-50/60 hover:border-[#1749A0]/50 hover:bg-[#1749A0]/5"
                }`}
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-gray-100 bg-white text-gray-400 shadow-xs transition group-hover:scale-105 group-hover:text-[#1749A0]">
                  <Upload size={22} />
                </div>

                <p className="text-sm font-semibold text-gray-700">
                  Click to upload banner image
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  or drag and drop your image here
                </p>
                <p className="mt-2 text-[11px] font-medium text-gray-400">
                  Recommended: 1920x800 or 16:7 aspect ratio (PNG, JPG, WEBP)
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gray-900 group">
                <img
                  src={imagePreview}
                  alt="Banner preview"
                  className="aspect-[16/7] w-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-4">
                  <p className="text-xs font-semibold text-white truncate max-w-full">
                    {title || "Banner Preview"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black cursor-pointer"
                  title="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col-reverse gap-2 border-t border-gray-100 bg-white px-6 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#123b83] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{bannerToEdit ? "Updating..." : "Saving..."}</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>
                    {bannerToEdit ? "Update Banner" : "Save Banner"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddBannerDialog;
