"use client";

import { useState, useEffect } from "react";
import { Plus, Search, BookOpen, Loader2, RefreshCw, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AddGenreDialog, { GenreData } from "@/components/admin/AddGenreDailog";
import { axiosAuthInstance } from "@/utils/axiosInstances";

export default function Page() {
  const [genres, setGenres] = useState<GenreData[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [genreToEdit, setGenreToEdit] = useState<GenreData | null>(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const fetchGenres = async () => {
    setIsLoading(true);
    try {
      const response = await axiosAuthInstance.get("/v1/genre");
      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data?.data || data?.genres || [];
      setGenres(list);
    } catch (error) {
      console.error("Failed to fetch genres:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleOpenAddModal = () => {
    setGenreToEdit(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (genre: GenreData) => {
    setGenreToEdit(genre);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this genre?")) return;

    setDeletingId(id);
    try {
      await axiosAuthInstance.delete(`/v1/genre/${id}`);
      toast.success("Genre deleted successfully.");
      fetchGenres();
    } catch (error: any) {
      console.error("Delete genre error:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete genre.";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const getGenreIcon = (g: GenreData) => {
    const img = g?.icon || g?.image || g?.imageUrl || "";
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

  const filteredGenres = genres.filter((g) =>
    g.name?.toLowerCase().includes(search.toLowerCase().trim()),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Genres
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your book genres and categories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchGenres}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
              title="Refresh genres"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1749A0] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#123b83]"
            >
              <Plus size={18} />
              Add Genre
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search genres..."
              className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#1749A0] focus:ring-2 focus:ring-[#1749A0]/10"
            />
          </div>
        </div>

        {/* Genres Grid / Loading / Empty State */}
        {isLoading ? (
          <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-gray-200 bg-white p-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#1749A0]" />
          </div>
        ) : filteredGenres.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredGenres.map((genre, index) => {
              const iconUrl = getGenreIcon(genre);

              return (
                <div
                  key={genre.id || index}
                  className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-[#1749A0]/40 hover:shadow-md"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#1749A0]/10 text-[#1749A0]">
                      {iconUrl ? (
                        <img
                          src={iconUrl}
                          alt={genre.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen size={20} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900 group-hover:text-[#1749A0]">
                        {genre.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleEdit(genre)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-[#1749A0]"
                      title="Edit genre"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => genre.id && handleDelete(genre.id)}
                      disabled={deletingId === genre.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      title="Delete genre"
                    >
                      {deletingId === genre.id ? (
                        <Loader2 size={16} className="animate-spin text-rose-600" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <BookOpen size={32} className="mx-auto mb-3 text-gray-300" />

            <h3 className="font-semibold text-gray-800">No genres found</h3>

            <p className="mt-1 text-sm text-gray-500">
              Try searching for another genre or add a new one.
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Genre Dialog Component */}
      <AddGenreDialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setGenreToEdit(null);
        }}
        genreToEdit={genreToEdit}
        onAddGenre={() => fetchGenres()}
      />
    </div>
  );
}
