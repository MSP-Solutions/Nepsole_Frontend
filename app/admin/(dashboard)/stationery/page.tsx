"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Loader2,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Filter,
  AlertTriangle,
  Tag,
  Layers,
  Coins,
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StationeryItem, PaginationMeta } from "@/types";
import AddStationeryDialog from "@/components/admin/AddStationeryDialog";
import ViewStationeryDialog from "@/components/admin/ViewStationeryDialog";

export default function StationeryPage() {
  const [stationeryList, setStationeryList] = useState<StationeryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [stationeryToEdit, setStationeryToEdit] =
    useState<StationeryItem | null>(null);

  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewingStationery, setViewingStationery] =
    useState<StationeryItem | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] =
    useState<boolean>(false);
  const [stationeryToDelete, setStationeryToDelete] =
    useState<StationeryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Category filter state
  const [categories, setCategories] = useState<{ id: any; name: string }[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch stationery categories for filter dropdown
  const fetchCategories = useCallback(async () => {
    try {
      let res;
      try {
        res = await axiosAuthInstance.get("/v1/category?limit=100");
      } catch (e: any) {
        if (e?.response?.status === 404) {
          res = await axiosAuthInstance.get("/api/v1/category?limit=100");
        } else {
          throw e;
        }
      }
      const data = res.data;
      const list = Array.isArray(data)
        ? data
        : data?.data || data?.categories || [];
      setCategories(list);
    } catch (err) {
      console.error("Failed to fetch stationery categories:", err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch stationery list: /v1/stationery?page=1&limit=10
  const fetchStationery = useCallback(
    async (
      page = currentPage,
      limit = pageSize,
      searchParam = debouncedSearch,
    ) => {
      setIsLoading(true);
      try {
        const trimmedSearch = searchParam.trim();
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (trimmedSearch) {
          params.set("search", trimmedSearch);
        }

        const primaryUrl = `/v1/stationery?${params.toString()}`;
        const fallbackUrl = `/api/v1/stationery?${params.toString()}`;

        let response;
        try {
          response = await axiosAuthInstance.get(primaryUrl);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            response = await axiosAuthInstance.get(fallbackUrl);
          } else {
            throw err;
          }
        }

        const data = response.data?.data || response.data;
        const list: StationeryItem[] = Array.isArray(data)
          ? data
          : data?.stationery ||
            data?.items ||
            data?.products ||
            [];
        setStationeryList(list);

        const rawPagination =
          response.data?.pagination ||
          data?.pagination ||
          response.data?.meta ||
          data?.meta;

        if (rawPagination) {
          const totalCount =
            rawPagination.total ??
            rawPagination.totalCount ??
            rawPagination.count ??
            list.length;
          const limitCount = rawPagination.limit ?? limit;
          const totalPages =
            rawPagination.totalPages ??
            rawPagination.lastPage ??
            Math.max(1, Math.ceil(totalCount / limitCount));

          setPagination({
            total: totalCount,
            page: rawPagination.page ?? page,
            limit: limitCount,
            totalPages,
          });
        } else {
          const totalCount =
            response.data?.total ??
            response.data?.totalCount ??
            data?.total ??
            list.length;

          const totalPages =
            response.data?.totalPages ??
            data?.totalPages ??
            Math.max(1, Math.ceil(totalCount / limit));

          setPagination({
            total: totalCount,
            page,
            limit,
            totalPages,
          });
        }
      } catch (error: any) {
        console.error("Failed to fetch stationery catalog:", error);
        toast.dismiss();
        toast.error(
          error?.response?.data?.message || "Failed to load stationery catalog.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, debouncedSearch],
  );

  useEffect(() => {
    fetchStationery(currentPage, pageSize, debouncedSearch);
  }, [currentPage, pageSize, debouncedSearch, fetchStationery]);

  // Client-side filtering by category if selected
  const displayedItems = useMemo(() => {
    if (selectedCategoryFilter === "all") return stationeryList;
    return stationeryList.filter((item) => {
      const catId = String(
        item.categoryId ?? item.category?.id ?? item.Category?.id ?? "",
      );
      return catId === selectedCategoryFilter;
    });
  }, [stationeryList, selectedCategoryFilter]);

  // Category filter select items
  const categoryFilterItems = useMemo(() => {
    return [
      { label: "All Categories", value: "all" },
      ...categories.map((c) => ({
        label: c.name,
        value: String(c.id),
      })),
    ];
  }, [categories]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setStationeryToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (item: StationeryItem) => {
    setStationeryToEdit(item);
    setIsAddModalOpen(true);
  };

  const handleView = (item: StationeryItem) => {
    setViewingStationery(item);
    setIsViewModalOpen(true);
  };

  const handleOpenDelete = (item: StationeryItem) => {
    setStationeryToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!stationeryToDelete?.id) return;
    setIsDeleting(true);

    try {
      const deletePrimary = `/v1/stationery/${stationeryToDelete.id}`;
      const deleteFallback = `/api/v1/stationery/${stationeryToDelete.id}`;

      try {
        await axiosAuthInstance.delete(deletePrimary);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          await axiosAuthInstance.delete(deleteFallback);
        } else {
          throw err;
        }
      }

      toast.success(`"${stationeryToDelete.name}" deleted successfully!`);
      setIsDeleteDialogOpen(false);
      setStationeryToDelete(null);
      fetchStationery(currentPage, pageSize, debouncedSearch);
    } catch (err: any) {
      console.error("Delete stationery error:", err);
      toast.error(
        err?.response?.data?.message || "Failed to delete stationery item.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to extract image URL
  const getItemImageUrl = (item: StationeryItem): string | null => {
    const rawImages = item.images || item.image || item.imageUrl;
    if (!rawImages) return null;

    let imgUrl: string | null = null;
    if (Array.isArray(rawImages)) {
      if (rawImages.length === 0) return null;
      const first = rawImages[0];
      if (typeof first === "string") imgUrl = first;
      else if (typeof first === "object" && first !== null) {
        imgUrl = first.url || first.imageUrl || first.image || null;
      }
    } else if (typeof rawImages === "string") {
      imgUrl = rawImages;
    } else if (typeof rawImages === "object") {
      imgUrl = (rawImages as any).url || (rawImages as any).imageUrl || null;
    }

    if (!imgUrl) return null;
    if (
      imgUrl.startsWith("http://") ||
      imgUrl.startsWith("https://") ||
      imgUrl.startsWith("data:") ||
      imgUrl.startsWith("blob:")
    ) {
      return imgUrl;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
    return `${baseUrl}${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;
  };

  // Stock status badge helper
  const getStockBadge = (stockNum: number) => {
    if (stockNum <= 0) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-600 border border-rose-100">
          Out of Stock
        </span>
      );
    }
    if (stockNum < 10) {
      return (
        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-100">
          Low Stock ({stockNum})
        </span>
      );
    }
    return (
      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
        In Stock ({stockNum})
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0]">
                <Package className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Stationery
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {pagination.total > 0
                ? `${pagination.total} product${pagination.total > 1 ? "s" : ""} registered in stationery catalog`
                : "Manage stationery items, art craft supplies, and inventory."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fetchStationery(currentPage, pageSize, debouncedSearch)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123b83] cursor-pointer"
            >
              <Plus size={18} />
              Add Stationery
            </button>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative w-full max-w-md">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, description..."
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400 shrink-0" />
              <Select
                items={categoryFilterItems}
                value={selectedCategoryFilter}
                onValueChange={(val) => val && setSelectedCategoryFilter(val)}
              >
                <SelectTrigger className="w-[190px] h-10 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-none outline-none focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10 cursor-pointer">
                  <SelectValue placeholder="All Categories">
                    {(val: string | null) => {
                      if (!val || val === "all") return "All Categories";
                      const match = categories.find((c) => String(c.id) === String(val));
                      return match ? match.name : val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="z-50 bg-white border border-gray-200 shadow-xl rounded-xl">
                  <SelectItem value="all" className="cursor-pointer text-xs py-2">
                    All Categories
                  </SelectItem>
                  {categories.map((c) => (
                    <SelectItem
                      key={c.id}
                      value={String(c.id)}
                      className="cursor-pointer text-xs py-2"
                    >
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Content: Loading / Table / Empty */}
        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[#1749A0]" />
              <p className="text-xs font-medium text-gray-500">
                Loading stationery catalog...
              </p>
            </div>
          </div>
        ) : displayedItems.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="py-3.5 pl-5 pr-3">Product</th>
                      <th className="py-3.5 px-3">Category</th>
                      <th className="py-3.5 px-3">Sub-Category</th>
                      <th className="py-3.5 px-3">Price</th>
                      <th className="py-3.5 px-3">Stock</th>
                      <th className="py-3.5 pl-3 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayedItems.map((item, idx) => {
                      const imgUrl = getItemImageUrl(item);
                      const priceNum = Number(item.price) || 0;
                      const discountNum = Number(item.discountPercent) || 0;
                      const effectivePrice =
                        discountNum > 0
                          ? Math.max(0, priceNum - (priceNum * discountNum) / 100)
                          : priceNum;
                      const stockNum = Number(item.stock) || 0;
                      const catName =
                        item.category?.name ||
                        item.Category?.name ||
                        (item.categoryId ? `#${item.categoryId}` : "—");
                      const subCatName =
                        item.subCategory?.name ||
                        item.SubCategory?.name ||
                        (item.subCategoryId ? `#${item.subCategoryId}` : "—");

                      return (
                        <tr
                          key={item.id || idx}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          {/* Product Info */}
                          <td className="py-3.5 pl-5 pr-3">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                                {imgUrl ? (
                                  <img
                                    src={imgUrl}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-gray-300" />
                                )}
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <p className="font-semibold text-gray-900 truncate text-sm">
                                  {item.name}
                                </p>
                                {item.description && (
                                  <p className="text-xs text-gray-400 truncate mt-0.5 max-w-xs">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                              <Tag size={11} />
                              {catName}
                            </span>
                          </td>

                          {/* SubCategory */}
                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                              <Layers size={11} />
                              {subCatName}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="py-3.5 px-3">
                            <div>
                              <div className="font-bold text-gray-900 text-sm">
                                Rs. {effectivePrice.toLocaleString()}
                              </div>
                              {discountNum > 0 && (
                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                  <span className="line-through">
                                    Rs. {priceNum.toLocaleString()}
                                  </span>
                                  <span className="font-semibold text-emerald-600">
                                    {discountNum}% off
                                  </span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Stock */}
                          <td className="py-3.5 px-3">{getStockBadge(stockNum)}</td>

                          {/* Actions */}
                          <td className="py-3.5 pl-3 pr-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleView(item)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
                                title="View details"
                              >
                                <Eye size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEdit(item)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#1749A0] transition cursor-pointer"
                                title="Edit item"
                              >
                                <Pencil size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDelete(item)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                title="Delete item"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile / Tablet Cards View */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
              {displayedItems.map((item, idx) => {
                const imgUrl = getItemImageUrl(item);
                const priceNum = Number(item.price) || 0;
                const discountNum = Number(item.discountPercent) || 0;
                const effectivePrice =
                  discountNum > 0
                    ? Math.max(0, priceNum - (priceNum * discountNum) / 100)
                    : priceNum;
                const stockNum = Number(item.stock) || 0;
                const catName =
                  item.category?.name ||
                  item.Category?.name ||
                  (item.categoryId ? `#${item.categoryId}` : "—");
                const subCatName =
                  item.subCategory?.name ||
                  item.SubCategory?.name ||
                  (item.subCategoryId ? `#${item.subCategoryId}` : "—");

                return (
                  <div
                    key={item.id || idx}
                    className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs hover:border-[#1749A0]/30 transition"
                  >
                    <div>
                      <div className="flex items-start gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-7 w-7 text-gray-300" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {item.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              {catName}
                            </span>
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                              {subCatName}
                            </span>
                          </div>
                          <div className="mt-2 flex items-baseline gap-2">
                            <span className="font-bold text-gray-900 text-sm">
                              Rs. {effectivePrice.toLocaleString()}
                            </span>
                            {discountNum > 0 && (
                              <span className="text-xs text-gray-400 line-through">
                                Rs. {priceNum.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                        <div>{getStockBadge(stockNum)}</div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleView(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-[#1749A0] cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(item)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {(pagination.total > 0 || stationeryList.length > 0) && (
              <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                  <p>
                    Showing{" "}
                    <span className="font-bold text-gray-900">
                      {pagination.total === 0
                        ? 0
                        : (currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-gray-900">
                      {Math.min(
                        currentPage * pageSize,
                        pagination.total || stationeryList.length,
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-gray-900">
                      {pagination.total || stationeryList.length}
                    </span>{" "}
                    stationery items
                  </p>

                  <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                    <span className="text-gray-400 text-xs">Per page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700 outline-none focus:border-[#1749A0] focus:ring-1 focus:ring-[#1749A0] cursor-pointer"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1 || isLoading}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs"
                    title="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-1 text-xs">
                    {Array.from(
                      { length: Math.max(1, pagination.totalPages) },
                      (_, i) => i + 1,
                    )
                      .filter((p) => {
                        if (pagination.totalPages <= 5) return true;
                        return (
                          Math.abs(p - currentPage) <= 1 ||
                          p === 1 ||
                          p === pagination.totalPages
                        );
                      })
                      .map((pageNum, idx, arr) => {
                        const showEllipsisBefore =
                          idx > 0 && pageNum - arr[idx - 1] > 1;
                        return (
                          <React.Fragment key={pageNum}>
                            {showEllipsisBefore && (
                              <span className="px-1 text-gray-400 font-bold">
                                ...
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setCurrentPage(pageNum)}
                              className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold transition cursor-pointer text-xs ${
                                currentPage === pageNum
                                  ? "bg-[#1749A0] text-white shadow-xs"
                                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    disabled={
                      currentPage >= pagination.totalPages || isLoading
                    }
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, pagination.totalPages),
                      )
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs"
                    title="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-xs">
            <Package size={36} className="mx-auto mb-3 text-gray-300" />
            <h3 className="font-semibold text-gray-800">
              No stationery products found
            </h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              {debouncedSearch
                ? `No products matched "${debouncedSearch}". Try clearing the search.`
                : selectedCategoryFilter !== "all"
                  ? "No stationery items found for the selected category."
                  : "Start creating your stationery inventory with the Add Stationery button above."}
            </p>

            <div className="mt-5 flex items-center justify-center gap-3">
              {(debouncedSearch || selectedCategoryFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategoryFilter("all");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  Clear Filters
                </button>
              )}

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1749A0] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#123b83] transition cursor-pointer"
              >
                <Plus size={15} />
                Add Stationery
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Stationery Dialog */}
      <AddStationeryDialog
        open={isAddModalOpen}
        onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) setStationeryToEdit(null);
        }}
        stationeryToEdit={stationeryToEdit}
        onSuccess={() => fetchStationery(currentPage, pageSize, debouncedSearch)}
      />

      {/* View Stationery Details Dialog */}
      <ViewStationeryDialog
        open={isViewModalOpen}
        onOpenChange={(open) => {
          setIsViewModalOpen(open);
          if (!open) setViewingStationery(null);
        }}
        stationery={viewingStationery}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setStationeryToDelete(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Delete Stationery Product
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Confirm product deletion
                </DialogDescription>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-4 text-xs text-slate-600">
            Are you sure you want to delete{" "}
            <strong className="text-slate-900 font-semibold">
              {stationeryToDelete?.name}
            </strong>
            ? This action cannot be undone.
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
            >
              {isDeleting && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              {isDeleting ? "Deleting..." : "Delete Product"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
