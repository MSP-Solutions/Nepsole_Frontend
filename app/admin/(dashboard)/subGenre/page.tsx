"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus,
  Search,
  BookOpen,
  Loader2,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Tag,
  Filter,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import AddSubGenreDialog, {
  SubGenreData,
  GenreOption,
} from "@/components/admin/AddSubGenreDialog";
import DeleteSubGenreDialog from "@/components/admin/DeleteSubGenreDialog";
import AddStationarySubCategoryDialog, {
  StationarySubCategoryData,
  StationaryCategoryOption,
} from "@/components/admin/AddStationarySubCategoryDialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function SubGenrePage() {
  const [activeTab, setActiveTab] = useState<"books" | "stationery">("books");

  // ===================== Book SubGenres State =====================
  const [subGenres, setSubGenres] = useState<SubGenreData[]>([]);
  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [subGenreToEdit, setSubGenreToEdit] = useState<SubGenreData | null>(
    null,
  );
  const [subGenreToDelete, setSubGenreToDelete] = useState<SubGenreData | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State for Book SubGenres
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Debounce search input for Book SubGenres (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch parent book genres for mapping names and filter dropdown
  const fetchGenres = useCallback(async () => {
    try {
      let response;
      try {
        response = await axiosAuthInstance.get("/v1/genre?limit=100");
      } catch (err: any) {
        if (err?.response?.status === 404) {
          response = await axiosAuthInstance.get("/api/v1/genre?limit=100");
        } else {
          throw err;
        }
      }
      const data = response.data;
      const list: GenreOption[] = Array.isArray(data)
        ? data
        : data?.data || data?.genres || [];
      setGenres(list);
    } catch (error) {
      console.error("Failed to fetch genres:", error);
    }
  }, []);

  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  // Lookup map for parent book genre name by id
  const genresMap = useMemo(() => {
    const map = new Map<string | number, string>();
    genres.forEach((g) => {
      if (g.id !== undefined && g.id !== null) {
        map.set(g.id, g.name);
        map.set(String(g.id), g.name);
      }
    });
    return map;
  }, [genres]);

  // Items for Parent Book Genre Filter Select
  const genreFilterItems = useMemo(() => {
    return [
      { label: "All Genres", value: "all" },
      ...genres.map((g) => ({ label: g.name, value: String(g.id) })),
    ];
  }, [genres]);

  // Fetch SubGenres via /api/v1/subgenre?limit=10&search=Fiction&page=1
  const fetchSubGenres = useCallback(
    async (
      page = currentPage,
      limit = pageSize,
      searchParam = debouncedSearch,
    ) => {
      setIsLoading(true);
      try {
        const trimmedSearch = searchParam.trim();
        const primaryQuery = trimmedSearch
          ? `/v1/subgenre?page=${page}&limit=${limit}&search=${encodeURIComponent(trimmedSearch)}`
          : `/v1/subgenre?page=${page}&limit=${limit}`;
        const fallbackQuery = trimmedSearch
          ? `/api/v1/subgenre?page=${page}&limit=${limit}&search=${encodeURIComponent(trimmedSearch)}`
          : `/api/v1/subgenre?page=${page}&limit=${limit}`;

        let response;
        try {
          response = await axiosAuthInstance.get(primaryQuery);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            response = await axiosAuthInstance.get(fallbackQuery);
          } else {
            throw err;
          }
        }

        const data = response.data;
        const list: SubGenreData[] = Array.isArray(data)
          ? data
          : data?.data ||
            data?.subgenres ||
            data?.subGenres ||
            data?.items ||
            [];
        setSubGenres(list);

        // Parse pagination metadata
        if (data?.pagination) {
          setPagination({
            total: data.pagination.total ?? list.length,
            page: data.pagination.page ?? page,
            limit: data.pagination.limit ?? limit,
            totalPages:
              data.pagination.totalPages ??
              Math.max(
                1,
                Math.ceil((data.pagination.total ?? list.length) / limit),
              ),
          });
        } else if (data?.total !== undefined) {
          setPagination({
            total: data.total,
            page: data.page || page,
            limit: data.limit || limit,
            totalPages:
              data.totalPages || Math.max(1, Math.ceil(data.total / limit)),
          });
        } else if (data?.meta) {
          setPagination({
            total: data.meta.total ?? list.length,
            page: data.meta.page ?? page,
            limit: data.meta.limit ?? limit,
            totalPages:
              data.meta.totalPages ??
              Math.max(1, Math.ceil((data.meta.total ?? list.length) / limit)),
          });
        } else {
          setPagination({
            total: list.length,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(list.length / limit)),
          });
        }
      } catch (error) {
        console.error("Failed to fetch sub genres:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, debouncedSearch],
  );

  useEffect(() => {
    fetchSubGenres(currentPage, pageSize, debouncedSearch);
  }, [currentPage, pageSize, debouncedSearch, fetchSubGenres]);

  const handleOpenAddModal = () => {
    setSubGenreToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (subGenre: SubGenreData) => {
    setSubGenreToEdit(subGenre);
    setIsDialogOpen(true);
  };

  const handleOpenDeleteModal = (subGenre: SubGenreData) => {
    setSubGenreToDelete(subGenre);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!subGenreToDelete?.id) return;

    setIsDeleting(true);
    const deleteId = subGenreToDelete.id;
    try {
      try {
        await axiosAuthInstance.delete(`/v1/subgenre/${deleteId}`);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          await axiosAuthInstance.delete(`/api/v1/subgenre/${deleteId}`);
        } else {
          throw err;
        }
      }

      toast.success("Sub genre deleted successfully.");
      setIsDeleteDialogOpen(false);
      setSubGenreToDelete(null);
      fetchSubGenres(currentPage, pageSize, debouncedSearch);
    } catch (error: any) {
      console.error("Delete sub genre error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete sub genre.";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to extract parent genre name
  const getParentGenreName = (sg: SubGenreData): string => {
    if (sg.genre?.name) return sg.genre.name;
    if (sg.Genre?.name) return sg.Genre.name;
    const rawGid = sg.genreId ?? sg.genre?.id ?? sg.Genre?.id;
    if (rawGid !== undefined && rawGid !== null && genresMap.has(rawGid)) {
      return genresMap.get(rawGid) || "";
    }
    return "";
  };

  const displayedSubGenres = useMemo(() => {
    if (selectedGenreFilter === "all") return subGenres;
    return subGenres.filter((sg) => {
      const gid = String(sg.genreId ?? sg.genre?.id ?? sg.Genre?.id ?? "");
      return gid === selectedGenreFilter;
    });
  }, [subGenres, selectedGenreFilter]);

  // ===================== Stationery Sub-Categories State =====================
  const [stationarySubGenres, setStationarySubGenres] = useState<
    StationarySubCategoryData[]
  >([]);
  const [stationaryCategories, setStationaryCategories] = useState<
    StationaryCategoryOption[]
  >([]);
  const [isStationaryDialogOpen, setIsStationaryDialogOpen] = useState(false);
  const [stationarySubGenreToEdit, setStationarySubGenreToEdit] =
    useState<StationarySubCategoryData | null>(null);
  const [stationarySubGenreToDelete, setStationarySubGenreToDelete] =
    useState<StationarySubCategoryData | null>(null);
  const [isStationaryDeleteDialogOpen, setIsStationaryDeleteDialogOpen] =
    useState(false);
  const [isDeletingStationary, setIsDeletingStationary] = useState(false);

  const [stationarySearch, setStationarySearch] = useState("");
  const [debouncedStationarySearch, setDebouncedStationarySearch] = useState("");
  const [
    selectedStationaryCategoryFilter,
    setSelectedStationaryCategoryFilter,
  ] = useState<string>("all");
  const [isLoadingStationary, setIsLoadingStationary] = useState(true);

  // Pagination for Stationery Sub-Categories
  const [stationaryCurrentPage, setStationaryCurrentPage] = useState(1);
  const [stationaryPageSize, setStationaryPageSize] = useState(10);
  const [stationaryPagination, setStationaryPagination] =
    useState<PaginationMeta>({
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

  // Debounce search input for Stationery Sub-Categories (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedStationarySearch(stationarySearch);
      setStationaryCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [stationarySearch]);

  // Fetch parent stationery categories for mapping and filter dropdown
  const fetchStationaryCategories = useCallback(async () => {
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
      const data = res.data;
      const list: StationaryCategoryOption[] = Array.isArray(data)
        ? data
        : data?.data || data?.categories || [];
      setStationaryCategories(list);
    } catch (error) {
      console.error("Failed to fetch stationery categories:", error);
    }
  }, []);

  useEffect(() => {
    fetchStationaryCategories();
  }, [fetchStationaryCategories]);

  // Lookup map for parent stationery category name by id
  const stationaryCategoriesMap = useMemo(() => {
    const map = new Map<string | number, string>();
    stationaryCategories.forEach((cat) => {
      if (cat.id !== undefined && cat.id !== null) {
        map.set(cat.id, cat.name);
        map.set(String(cat.id), cat.name);
      }
    });
    return map;
  }, [stationaryCategories]);

  // Items for Parent Stationery Category Filter Select
  const stationaryCategoryFilterItems = useMemo(() => {
    return [
      { label: "All Categories", value: "all" },
      ...stationaryCategories.map((c) => ({
        label: c.name,
        value: String(c.id),
      })),
    ];
  }, [stationaryCategories]);

  // Fetch Stationery Sub-Categories via v1/category/subcategories?page=1&limit=10
  const fetchStationarySubGenres = useCallback(
    async (
      page = stationaryCurrentPage,
      limit = stationaryPageSize,
      searchParam = debouncedStationarySearch,
    ) => {
      setIsLoadingStationary(true);
      try {
        const trimmedSearch = searchParam.trim();
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (trimmedSearch) {
          params.set("search", trimmedSearch);
        }

        const primaryQuery = `/v1/category/subcategories?${params.toString()}`;
        const fallbackQuery = `/api/v1/category/subcategories?${params.toString()}`;

        let response;
        try {
          response = await axiosAuthInstance.get(primaryQuery);
        } catch (err: any) {
          if (err?.response?.status === 404) {
            response = await axiosAuthInstance.get(fallbackQuery);
          } else {
            throw err;
          }
        }

        const data = response.data;
        const list: StationarySubCategoryData[] = Array.isArray(data)
          ? data
          : data?.data ||
            data?.subcategories ||
            data?.subCategories ||
            data?.items ||
            [];
        setStationarySubGenres(list);

        // Parse pagination metadata
        if (data?.pagination) {
          setStationaryPagination({
            total: data.pagination.total ?? list.length,
            page: data.pagination.page ?? page,
            limit: data.pagination.limit ?? limit,
            totalPages:
              data.pagination.totalPages ??
              Math.max(
                1,
                Math.ceil((data.pagination.total ?? list.length) / limit),
              ),
          });
        } else if (data?.total !== undefined) {
          setStationaryPagination({
            total: data.total,
            page: data.page || page,
            limit: data.limit || limit,
            totalPages:
              data.totalPages || Math.max(1, Math.ceil(data.total / limit)),
          });
        } else if (data?.meta) {
          setStationaryPagination({
            total: data.meta.total ?? list.length,
            page: data.meta.page ?? page,
            limit: data.meta.limit ?? limit,
            totalPages:
              data.meta.totalPages ??
              Math.max(
                1,
                Math.ceil((data.meta.total ?? list.length) / limit),
              ),
          });
        } else {
          setStationaryPagination({
            total: list.length,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(list.length / limit)),
          });
        }
      } catch (error) {
        console.error("Failed to fetch stationery sub-categories:", error);
      } finally {
        setIsLoadingStationary(false);
      }
    },
    [stationaryCurrentPage, stationaryPageSize, debouncedStationarySearch],
  );

  useEffect(() => {
    fetchStationarySubGenres(
      stationaryCurrentPage,
      stationaryPageSize,
      debouncedStationarySearch,
    );
  }, [
    stationaryCurrentPage,
    stationaryPageSize,
    debouncedStationarySearch,
    fetchStationarySubGenres,
  ]);

  const handleOpenAddStationaryModal = () => {
    setStationarySubGenreToEdit(null);
    setIsStationaryDialogOpen(true);
  };

  const handleEditStationary = (subCat: StationarySubCategoryData) => {
    setStationarySubGenreToEdit(subCat);
    setIsStationaryDialogOpen(true);
  };

  const handleOpenDeleteStationaryModal = (
    subCat: StationarySubCategoryData,
  ) => {
    setStationarySubGenreToDelete(subCat);
    setIsStationaryDeleteDialogOpen(true);
  };

  const handleDeleteStationaryConfirm = async () => {
    if (!stationarySubGenreToDelete?.id) return;

    setIsDeletingStationary(true);
    const deleteId = stationarySubGenreToDelete.id;
    try {
      try {
        await axiosAuthInstance.delete(
          `/v1/category/subcategories/${deleteId}`,
        );
      } catch (err: any) {
        if (err?.response?.status === 404) {
          await axiosAuthInstance.delete(
            `/api/v1/category/subcategories/${deleteId}`,
          );
        } else {
          throw err;
        }
      }

      toast.success("Stationery sub-category deleted successfully.");
      setIsStationaryDeleteDialogOpen(false);
      setStationarySubGenreToDelete(null);
      fetchStationarySubGenres(
        stationaryCurrentPage,
        stationaryPageSize,
        debouncedStationarySearch,
      );
    } catch (error: any) {
      console.error("Delete stationery sub-category error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete stationery sub-category.";
      toast.error(message);
    } finally {
      setIsDeletingStationary(false);
    }
  };

  // Helper to extract parent stationery category name
  const getParentStationaryCategoryName = (
    subCat: StationarySubCategoryData,
  ): string => {
    if (subCat.category?.name) return subCat.category.name;
    if (subCat.Category?.name) return subCat.Category.name;
    const rawCid = subCat.categoryId ?? subCat.category?.id ?? subCat.Category?.id;
    if (
      rawCid !== undefined &&
      rawCid !== null &&
      stationaryCategoriesMap.has(rawCid)
    ) {
      return stationaryCategoriesMap.get(rawCid) || "";
    }
    return "";
  };

  const displayedStationarySubGenres = useMemo(() => {
    if (selectedStationaryCategoryFilter === "all")
      return stationarySubGenres;
    return stationarySubGenres.filter((subCat) => {
      const cid = String(
        subCat.categoryId ?? subCat.category?.id ?? subCat.Category?.id ?? "",
      );
      return cid === selectedStationaryCategoryFilter;
    });
  }, [stationarySubGenres, selectedStationaryCategoryFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0]">
                <Layers className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Sub Categories
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {activeTab === "books"
                ? "Manage your book Sub Categories and their parent categories."
                : "Manage your stationery Sub Categories and their parent categories."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "books" ? (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123b83] cursor-pointer"
              >
                <Plus size={18} />
                Add Book Sub Category
              </button>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddStationaryModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123b83] cursor-pointer"
              >
                <Plus size={18} />
                Add Stationery Sub Category
              </button>
            )}
          </div>
        </div>

        {/* Sub-Category Tabs */}
        <div className="mb-6 flex items-center gap-2 border-b border-gray-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("books")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === "books"
                ? "bg-[#1749A0] text-white shadow-xs"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <BookOpen size={16} />
            <span>Book Sub-Categories</span>
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "books"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {pagination.total}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stationery")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition cursor-pointer ${
              activeTab === "stationery"
                ? "bg-[#1749A0] text-white shadow-xs"
                : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Tag size={16} />
            <span>Stationery Sub-Categories</span>
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                activeTab === "stationery"
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {stationaryPagination.total}
            </span>
          </button>
        </div>

        {/* ===================== TAB 1: BOOK SUB-CATEGORIES ===================== */}
        {activeTab === "books" && (
          <div>
            {/* Filters & Search Row */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative w-full max-w-md">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search book sub categories..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Parent Genre Filter */}
              {genres.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400 shrink-0" />
                  <Select
                    items={genreFilterItems}
                    value={selectedGenreFilter}
                    onValueChange={(val) => val && setSelectedGenreFilter(val)}
                  >
                    <SelectTrigger className="w-[180px] h-10 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-none outline-none focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10 cursor-pointer">
                      <SelectValue placeholder="All Genres">
                        {(val: string | null) => {
                          if (!val || val === "all") return "All Genres";
                          const match = genres.find(
                            (g) => String(g.id) === String(val),
                          );
                          return match ? match.name : val;
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white border border-gray-200 shadow-xl rounded-xl">
                      <SelectItem
                        value="all"
                        className="cursor-pointer text-xs py-2"
                      >
                        All Categories
                      </SelectItem>
                      {genres.map((g) => (
                        <SelectItem
                          key={g.id}
                          value={String(g.id)}
                          className="cursor-pointer text-xs py-2"
                        >
                          {g.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* SubGenres Grid / Loading / Empty State */}
            {isLoading ? (
              <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1749A0]" />
                  <p className="text-xs font-medium text-gray-500">
                    Loading book sub categories...
                  </p>
                </div>
              </div>
            ) : displayedSubGenres.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {displayedSubGenres.map((subGenre, index) => {
                    const parentGenreName = getParentGenreName(subGenre);

                    return (
                      <div
                        key={subGenre.id || index}
                        className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs transition hover:border-[#1749A0]/40 hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0] transition group-hover:bg-[#1749A0] group-hover:text-white">
                              <Layers size={20} />
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleEdit(subGenre)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-[#1749A0] cursor-pointer"
                                title="Edit sub genre"
                              >
                                <Edit2 size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(subGenre)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                title="Delete sub genre"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3.5">
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#1749A0] transition">
                              {subGenre.name}
                            </h3>

                            {/* Parent Genre Tag */}
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              {parentGenreName ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  <BookOpen size={12} />
                                  {parentGenreName}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                  <Tag size={12} />
                                  Genre #{subGenre.genreId ?? "N/A"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls Footer */}
                {(pagination.total > 0 || subGenres.length > 0) && (
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
                            pagination.total || subGenres.length,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-gray-900">
                          {pagination.total || subGenres.length}
                        </span>{" "}
                        book sub categories
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
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-xs">
                <Layers size={36} className="mx-auto mb-3 text-gray-300" />
                <h3 className="font-semibold text-gray-800">
                  No book sub categories found
                </h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                  {debouncedSearch
                    ? `No sub genres matched "${debouncedSearch}". Try clearing the search.`
                    : selectedGenreFilter !== "all"
                      ? "No sub genres found for the selected genre."
                      : "Get started by adding your first sub genre linked to a genre."}
                </p>

                <div className="mt-5 flex items-center justify-center gap-3">
                  {(debouncedSearch || selectedGenreFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setSelectedGenreFilter("all");
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
                    Add Book Sub Category
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== TAB 2: STATIONERY SUB-CATEGORIES ===================== */}
        {activeTab === "stationery" && (
          <div>
            {/* Filters & Search Row */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              {/* Search */}
              <div className="relative w-full max-w-md">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={stationarySearch}
                  onChange={(e) => setStationarySearch(e.target.value)}
                  placeholder="Search stationery sub categories (e.g. Pencils)..."
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
                />
                {stationarySearch && (
                  <button
                    type="button"
                    onClick={() => setStationarySearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Parent Stationery Category Filter */}
              {stationaryCategories.length > 0 && (
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-400 shrink-0" />
                  <Select
                    items={stationaryCategoryFilterItems}
                    value={selectedStationaryCategoryFilter}
                    onValueChange={(val) =>
                      val && setSelectedStationaryCategoryFilter(val)
                    }
                  >
                    <SelectTrigger className="w-[190px] h-10 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-none outline-none focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10 cursor-pointer">
                      <SelectValue placeholder="All Categories">
                        {(val: string | null) => {
                          if (!val || val === "all") return "All Categories";
                          const match = stationaryCategories.find(
                            (c) => String(c.id) === String(val),
                          );
                          return match ? match.name : val;
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-white border border-gray-200 shadow-xl rounded-xl">
                      <SelectItem
                        value="all"
                        className="cursor-pointer text-xs py-2"
                      >
                        All Categories
                      </SelectItem>
                      {stationaryCategories.map((c) => (
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

            {/* Stationery SubGenres Grid / Loading / Empty State */}
            {isLoadingStationary ? (
              <div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#1749A0]" />
                  <p className="text-xs font-medium text-gray-500">
                    Loading stationery sub categories...
                  </p>
                </div>
              </div>
            ) : displayedStationarySubGenres.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {displayedStationarySubGenres.map((subCat, index) => {
                    const parentCategoryName =
                      getParentStationaryCategoryName(subCat);

                    return (
                      <div
                        key={subCat.id || index}
                        className="group relative flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-xs transition hover:border-[#1749A0]/40 hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0] transition group-hover:bg-[#1749A0] group-hover:text-white">
                              <Layers size={20} />
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                onClick={() => handleEditStationary(subCat)}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-[#1749A0] cursor-pointer"
                                title="Edit sub category"
                              >
                                <Edit2 size={15} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenDeleteStationaryModal(subCat)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                                title="Delete sub category"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          <div className="mt-3.5">
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#1749A0] transition">
                              {subCat.name}
                            </h3>

                            {/* Slug badge */}
                            {subCat.slug && (
                              <div className="mt-1">
                                <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md truncate max-w-[180px] inline-block">
                                  /{subCat.slug}
                                </span>
                              </div>
                            )}

                            {/* Parent Stationery Category Tag */}
                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                              {parentCategoryName ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  <Tag size={12} />
                                  {parentCategoryName}
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                  <Tag size={12} />
                                  Category #{subCat.categoryId ?? "N/A"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls Footer */}
                {(stationaryPagination.total > 0 ||
                  stationarySubGenres.length > 0) && (
                  <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                      <p>
                        Showing{" "}
                        <span className="font-bold text-gray-900">
                          {stationaryPagination.total === 0
                            ? 0
                            : (stationaryCurrentPage - 1) *
                                stationaryPageSize +
                              1}
                        </span>{" "}
                        to{" "}
                        <span className="font-bold text-gray-900">
                          {Math.min(
                            stationaryCurrentPage * stationaryPageSize,
                            stationaryPagination.total ||
                              stationarySubGenres.length,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-bold text-gray-900">
                          {stationaryPagination.total ||
                            stationarySubGenres.length}
                        </span>{" "}
                        stationery sub categories
                      </p>

                      <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3">
                        <span className="text-gray-400 text-xs">Per page:</span>
                        <select
                          value={stationaryPageSize}
                          onChange={(e) => {
                            setStationaryPageSize(Number(e.target.value));
                            setStationaryCurrentPage(1);
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
                        disabled={
                          stationaryCurrentPage <= 1 || isLoadingStationary
                        }
                        onClick={() =>
                          setStationaryCurrentPage((prev) =>
                            Math.max(prev - 1, 1),
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer shadow-2xs"
                        title="Previous Page"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-1 text-xs">
                        {Array.from(
                          {
                            length: Math.max(
                              1,
                              stationaryPagination.totalPages,
                            ),
                          },
                          (_, i) => i + 1,
                        )
                          .filter((p) => {
                            if (stationaryPagination.totalPages <= 5)
                              return true;
                            return (
                              Math.abs(p - stationaryCurrentPage) <= 1 ||
                              p === 1 ||
                              p === stationaryPagination.totalPages
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
                                  onClick={() =>
                                    setStationaryCurrentPage(pageNum)
                                  }
                                  className={`flex h-8 w-8 items-center justify-center rounded-xl font-bold transition cursor-pointer text-xs ${
                                    stationaryCurrentPage === pageNum
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
                          stationaryCurrentPage >=
                            stationaryPagination.totalPages ||
                          isLoadingStationary
                        }
                        onClick={() =>
                          setStationaryCurrentPage((prev) =>
                            Math.min(
                              prev + 1,
                              stationaryPagination.totalPages,
                            ),
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
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-xs">
                <Layers size={36} className="mx-auto mb-3 text-gray-300" />
                <h3 className="font-semibold text-gray-800">
                  No stationery sub categories found
                </h3>
                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                  {debouncedStationarySearch
                    ? `No sub categories matched "${debouncedStationarySearch}". Try clearing the search.`
                    : selectedStationaryCategoryFilter !== "all"
                      ? "No sub categories found for the selected category."
                      : "Get started by adding your first stationery sub category."}
                </p>

                <div className="mt-5 flex items-center justify-center gap-3">
                  {(debouncedStationarySearch ||
                    selectedStationaryCategoryFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setStationarySearch("");
                        setSelectedStationaryCategoryFilter("all");
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleOpenAddStationaryModal}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#1749A0] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#123b83] transition cursor-pointer"
                  >
                    <Plus size={15} />
                    Add Stationery Sub Category
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Book Sub Genre Dialog */}
      <AddSubGenreDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSubGenreToEdit(null);
        }}
        subGenreToEdit={subGenreToEdit}
        genres={genres}
        onSuccess={() => fetchSubGenres(currentPage, pageSize, debouncedSearch)}
      />

      {/* Delete Book Sub Genre Confirmation Dialog */}
      <DeleteSubGenreDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setSubGenreToDelete(null);
        }}
        subGenre={subGenreToDelete}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      {/* Add / Edit Stationery Sub Category Dialog */}
      <AddStationarySubCategoryDialog
        open={isStationaryDialogOpen}
        onOpenChange={(open) => {
          setIsStationaryDialogOpen(open);
          if (!open) setStationarySubGenreToEdit(null);
        }}
        subCategoryToEdit={stationarySubGenreToEdit}
        categories={stationaryCategories}
        onSuccess={() =>
          fetchStationarySubGenres(
            stationaryCurrentPage,
            stationaryPageSize,
            debouncedStationarySearch,
          )
        }
      />

      {/* Delete Stationery Sub Category Confirmation Dialog */}
      <Dialog
        open={isStationaryDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsStationaryDeleteDialogOpen(open);
          if (!open) setStationarySubGenreToDelete(null);
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
                  Delete Stationery Sub-Category
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Confirm sub-category deletion
                </DialogDescription>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsStationaryDeleteDialogOpen(false)}
              disabled={isDeletingStationary}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 py-4 text-xs text-slate-600">
            Are you sure you want to delete{" "}
            <strong className="text-slate-900 font-semibold">
              {stationarySubGenreToDelete?.name}
            </strong>
            ? This action cannot be undone.
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3">
            <button
              type="button"
              onClick={() => setIsStationaryDeleteDialogOpen(false)}
              disabled={isDeletingStationary}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteStationaryConfirm}
              disabled={isDeletingStationary}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
            >
              {isDeletingStationary && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              {isDeletingStationary ? "Deleting..." : "Delete Sub-Category"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
