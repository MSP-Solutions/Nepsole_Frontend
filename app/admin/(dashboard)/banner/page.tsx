"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  X,
  Save,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosAuthInstance, axiosMultipartInstance } from "@/utils/axiosInstances";

interface Banner {
  id: string | number;
  title: string;
  image?: string;
  imageUrl?: string;
  url?: string;
  imagePath?: string;
  createdAt?: string;
}

export default function BannerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

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

  // 1. Fetch Banners from API GET /v1/banner
  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      let res;
      try {
        res = await axiosAuthInstance.get("/v1/banner");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          res = await axiosAuthInstance.get("/api/v1/banner");
        } else {
          throw err;
        }
      }

      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : data?.data || data?.banners || [];
      setBanners(list);
    } catch (err: any) {
      console.error("Fetch Banners Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle File Selection
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

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    removeImage();
  };

  // 2. Create / Edit Banner (POST / PUT /v1/banner)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a banner title.");
      return;
    }

    if (!editingId && !selectedFile && !imagePreview) {
      toast.error("Please upload a banner image.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      if (selectedFile) {
        formData.append("image", selectedFile);
        formData.append("file", selectedFile);
      }

      if (editingId) {
        // Edit Existing Banner
        try {
          await axiosMultipartInstance.put(`/v1/banner/${editingId}`, formData);
        } catch (err: any) {
          if (err?.response?.status === 404 || err?.response?.status === 405) {
            try {
              await axiosMultipartInstance.patch(
                `/v1/banner/${editingId}`,
                formData
              );
            } catch (err2: any) {
              await axiosMultipartInstance.put(
                `/api/v1/banner/${editingId}`,
                formData
              );
            }
          } else {
            throw err;
          }
        }
        toast.success("Banner updated successfully!");
      } else {
        // Create New Banner
        try {
          await axiosMultipartInstance.post("/v1/banner", formData);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            await axiosMultipartInstance.post("/api/v1/banner", formData);
          } else {
            throw err;
          }
        }
        toast.success("Banner uploaded successfully!");
      }

      resetForm();
      await fetchBanners();
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

  // 3. Start Editing
  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setTitle(banner.title || "");
    const img = getBannerImage(banner);
    setImagePreview(img);
    setSelectedFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 4. Delete Banner (DELETE /v1/banner/{id})
  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      try {
        await axiosAuthInstance.delete(`/v1/banner/${id}`);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          await axiosAuthInstance.delete(`/api/v1/banner/${id}`);
        } else {
          throw err;
        }
      }
      toast.success("Banner deleted successfully.");
      await fetchBanners();
    } catch (error: any) {
      console.error("Delete Banner Error:", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete banner.";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {editingId ? "Edit Banner" : "Banner Setup"}
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Upload and manage your store hero banners via API (/v1/banner).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchBanners}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh banners"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Banner</span>
              </button>
            )}
          </div>
        </div>

        {/* Main Card: Form + Live Preview */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs"
        >
          <div className="grid gap-0 lg:grid-cols-12">
            
            {/* Form Section */}
            <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId ? "Edit Banner Details" : "Upload & Title"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter banner title and upload your image below.
                </p>
              </div>

              {/* Banner Title Input */}
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Banner Title <span className="text-rose-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter banner title (e.g. Summer Special Offer)"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              {/* Banner Image Upload Area */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Banner Image {!editingId && <span className="text-rose-500">*</span>}
                </label>

                {!imagePreview ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                      isDragOver
                        ? "border-indigo-600 bg-indigo-50/50"
                        : "border-slate-300/80 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/20"
                    }`}
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-400 shadow-xs border border-slate-100 transition-transform group-hover:scale-105 group-hover:text-indigo-600">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      Click to upload banner image
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      PNG, JPG or WEBP (Drag and drop supported)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleInputChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900 group">
                    <img
                      src={imagePreview}
                      alt="Banner preview"
                      className="aspect-[16/7] w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black transition cursor-pointer"
                      title="Remove / Change image"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{editingId ? "Updating..." : "Uploading..."}</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>{editingId ? "Update Banner" : "Save Banner"}</span>
                    </>
                  )}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="lg:col-span-5 bg-slate-50/70 p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Live Preview
                  </h2>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                  {/* Image Display */}
                  <div className="relative aspect-[16/8] w-full overflow-hidden bg-slate-100 flex items-center justify-center text-slate-400">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <ImageIcon className="h-8 w-8 opacity-40" />
                        <span className="text-xs">No image uploaded</span>
                      </div>
                    )}

                    {imagePreview && title && (
                      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4">
                        <h3 className="text-base font-bold text-white line-clamp-2">
                          {title}
                        </h3>
                      </div>
                    )}
                  </div>

                  {/* Title Display */}
                  <div className="p-4 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Title
                    </p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900 break-words">
                      {title || "Your Banner Title"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-900">
                <p className="font-semibold">API Endpoint:</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-indigo-700 font-mono">
                  /v1/banner (GET, POST, PUT, DELETE)
                </p>
              </div>
            </div>

          </div>
        </form>

        {/* Banners List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Uploaded Banners ({banners.length})
            </h2>

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                <span>Loading banners...</span>
              </div>
            )}
          </div>

          {!isLoading && banners.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
              <ImageIcon className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-700">No banners found</p>
              <p className="text-xs text-slate-400 mt-1">
                Upload your first banner using the form above.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {banners.map((banner) => {
                const img = getBannerImage(banner);
                return (
                  <div
                    key={banner.id}
                    className={`overflow-hidden rounded-xl border bg-white shadow-xs flex flex-col justify-between transition-all ${
                      editingId === banner.id
                        ? "border-indigo-600 ring-2 ring-indigo-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="relative aspect-[16/7] w-full overflow-hidden bg-slate-900">
                      {img ? (
                        <img
                          src={img}
                          alt={banner.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                          No Image
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-3 flex items-end">
                        <p className="text-xs font-bold text-white line-clamp-1">
                          {banner.title}
                        </p>
                      </div>
                    </div>

                    <div className="p-3 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[150px]">
                        {banner.title}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(banner)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition cursor-pointer"
                          title="Edit banner"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(banner.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                          title="Delete banner"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
