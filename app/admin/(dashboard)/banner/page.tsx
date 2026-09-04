"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import AddBannerDialog, {
  BannerItem,
} from "@/components/admin/AddBannerDialog";
import DeleteBannerDialog from "@/components/admin/DeleteBannerDialog";

export default function BannerPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dialog States
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] =
    useState<boolean>(false);
  const [bannerToEdit, setBannerToEdit] = useState<BannerItem | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [bannerToDelete, setBannerToDelete] = useState<BannerItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

  const fetchBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axiosAuthInstance.get("/v1/banner");
      const data = response.data;
      const bannerList = Array.isArray(data)
        ? data
        : data?.data || data?.banners || [];

      setBanners(bannerList);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      toast.error("Failed to load banners.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleOpenAddDialog = () => {
    setBannerToEdit(null);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenEditDialog = (banner: BannerItem) => {
    setBannerToEdit(banner);
    setIsAddEditDialogOpen(true);
  };

  const handleOpenDeleteDialog = (banner: BannerItem) => {
    setBannerToDelete(banner);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bannerToDelete) return;
    setIsDeleting(true);

    try {
      await axiosAuthInstance.delete(`/v1/banner/${bannerToDelete.id}`);
      toast.success("Banner deleted successfully.");
      setIsDeleteDialogOpen(false);
      setBannerToDelete(null);
      await fetchBanners();
    } catch (error: any) {
      console.error("Delete Banner Error:", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to delete banner.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Homepage Banners
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Upload and manage promotional slides, banners, and featured
              campaign banners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleOpenAddDialog}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-[#123b83] cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Banner</span>
            </button>
          </div>
        </div>

        {/* Banner List / Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">
              Active Banners ({banners.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <Loader2 className="h-8 w-8 animate-spin text-[#1749A0] mb-3" />
              <p className="text-sm font-medium text-gray-600">
                Loading banners...
              </p>
            </div>
          ) : banners.length === 0 ? (
            /* Empty State */
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1749A0]/10 text-[#1749A0]">
                <ImageIcon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No Banners Found
              </h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                You haven&apos;t added any homepage banners yet. Upload your
                first promotional banner to showcase special offers.
              </p>
              <button
                type="button"
                onClick={handleOpenAddDialog}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#1749A0] px-5 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-[#123b83] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add Banner</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {banners.map((banner) => {
                const img = getBannerImage(banner);
                return (
                  <div
                    key={banner.id}
                    className="group overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs transition hover:border-[#1749A0]/30 hover:shadow-md flex flex-col justify-between"
                  >
                    {/* Banner Image Container */}
                    <div className="relative aspect-[16/7] w-full overflow-hidden bg-slate-900">
                      {img ? (
                        <img
                          src={img}
                          alt={banner.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500 text-xs">
                          No Image Available
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex items-end">
                        <p className="text-sm font-bold text-white line-clamp-1">
                          {banner.title}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Details & Actions */}
                    <div className="p-4 flex items-center justify-between border-t border-gray-100 bg-white">
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {banner.title}
                        </p>
                        {banner.createdAt && (
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(banner.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenEditDialog(banner)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 hover:bg-[#1749A0]/10 hover:text-[#1749A0] hover:border-[#1749A0]/30 transition cursor-pointer"
                          title="Edit banner"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenDeleteDialog(banner)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
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

        {/* Add/Edit Banner Dialog */}
        <AddBannerDialog
          open={isAddEditDialogOpen}
          onOpenChange={setIsAddEditDialogOpen}
          bannerToEdit={bannerToEdit}
          onSuccess={fetchBanners}
        />

        {/* Delete Banner Confirmation Dialog */}
        <DeleteBannerDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          banner={bannerToDelete}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
}
