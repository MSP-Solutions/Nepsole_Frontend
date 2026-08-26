"use client";

import AddBookDialog, { BookData } from "@/components/admin/AddBookDialog";
import ViewBookDialog from "@/components/admin/ViewBookDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface BookAuthor {
  id: number | string;
  name?: string;
  englishName?: string;
  author?: {
    id: number | string;
    name?: string;
    englishName?: string;
  };
  [key: string]: any;
}

export interface BookGenre {
  id: number | string;
  name?: string;
  englishName?: string;
  genre?: {
    id: number | string;
    name?: string;
  };
  [key: string]: any;
}

export interface BookPublisher {
  id: number | string;
  name?: string;
  englishName?: string;
  publicationLogoUrl?: string;
  [key: string]: any;
}

export interface BookLanguage {
  id: number | string;
  name?: string;
  code?: string;
  language?: {
    id: number | string;
    name?: string;
    code?: string;
  };
  [key: string]: any;
}

export interface BookImage {
  id?: number | string;
  url?: string;
  imageUrl?: string;
  imageType?: string;
  type?: string;
  [key: string]: any;
}

export interface BookItem {
  id: number | string;
  title: string;
  price: number | string;
  discountPercent?: number | string;
  stock: number;
  soldCount?: number;
  publicationDate?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number | string;
  description?: string;
  widthCm?: number | string;
  heightCm?: number | string;
  depthCm?: number | string;
  publisherId?: number | string;
  publisher?: BookPublisher;
  authors?: BookAuthor[];
  authorBooks?: BookAuthor[];
  authorIds?: (number | string)[];
  genres?: BookGenre[];
  genreBooks?: BookGenre[];
  genreIds?: (number | string)[];
  languages?: BookLanguage[];
  languageBooks?: BookLanguage[];
  languageIds?: (number | string)[];
  images?: (BookImage | string)[];
  bookImages?: BookImage[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function BooksPage() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [bookToEdit, setBookToEdit] = useState<BookData | null>(null);

  // View Details State
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [viewingBook, setViewingBook] = useState<BookItem | null>(null);

  // Delete State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [bookToDelete, setBookToDelete] = useState<BookItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Fetch Books from /v1/book
  const fetchBooks = useCallback(
    async (page = currentPage, limit = pageSize, search = searchTerm) => {
      setIsLoading(true);
      try {
        let url = `/v1/book?page=${page}&limit=${limit}`;
        if (search.trim()) {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }
        const response = await axiosAuthInstance.get(url);
        const data = response.data?.data || response.data;
        const list = Array.isArray(data)
          ? data
          : data?.books || data?.items || [];
        setBooks(list);

        if (response.data?.pagination) {
          setPagination(response.data.pagination);
        } else if (data?.pagination) {
          setPagination(data.pagination);
        } else {
          setPagination({
            total: list.length,
            page,
            limit,
            totalPages: Math.ceil(list.length / limit) || 1,
          });
        }
      } catch (err: any) {
        console.error("Failed to fetch books:", err);
        toast.error(
          err?.response?.data?.message || "Failed to load books catalog.",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, searchTerm],
  );

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Client-side filtering fallback for instant responsiveness
  const filteredBooks = books.filter((book) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = book.title?.toLowerCase().includes(term);
    const isbnMatch =
      book.isbn13?.includes(term) || book.isbn10?.includes(term);
    const publisherMatch = (book.publisher?.name || "")
      .toLowerCase()
      .includes(term);
    const authorMatch = (book.authors || book.authorBooks || []).some((a) =>
      (a.name || a.englishName || a.author?.name || "")
        .toLowerCase()
        .includes(term),
    );
    const genreMatch = (book.genres || book.genreBooks || []).some((g) =>
      (g.name || g.englishName || g.genre?.name || "")
        .toLowerCase()
        .includes(term),
    );

    return (
      titleMatch || isbnMatch || publisherMatch || authorMatch || genreMatch
    );
  });

  // Handle View Book
  const handleViewClick = (book: BookItem) => {
    setViewingBook(book);
    setIsViewModalOpen(true);
  };

  // Handle Edit Book
  const handleEditClick = (book: BookItem) => {
    // Extract author IDs
    const extractedAuthorIds = (book.authors || book.authorBooks || []).map(
      (a) => a.author?.id || a.id,
    );
    // Extract genre IDs
    const extractedGenreIds = (book.genres || book.genreBooks || []).map(
      (g) => g.genre?.id || g.id,
    );
    // Extract language IDs
    const extractedLanguageIds = (
      book.languages ||
      book.languageBooks ||
      []
    ).map((l) => l.language?.id || l.id);

    const editData: BookData = {
      id: book.id,
      title: book.title || "",
      price: book.price ?? "",
      discountPercent: book.discountPercent ?? 0,
      stock: book.stock ?? 0,
      soldCount: book.soldCount ?? 0,
      publicationDate: book.publicationDate || "",
      isbn10: book.isbn10 || "",
      isbn13: book.isbn13 || "",
      pages: book.pages ?? "",
      description: book.description || "",
      widthCm: book.widthCm ?? "",
      heightCm: book.heightCm ?? "",
      depthCm: book.depthCm ?? "",
      publisherId: book.publisherId || book.publisher?.id || "",
      authorIds: extractedAuthorIds,
      genreIds: extractedGenreIds,
      languageIds: extractedLanguageIds,
      images: book.images || book.bookImages || [],
    };

    setBookToEdit(editData);
    setIsAddModalOpen(true);
  };

  // Handle Delete Confirmation
  const handleDeleteClick = (book: BookItem) => {
    setBookToDelete(book);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!bookToDelete) return;
    setIsDeleting(true);
    try {
      await axiosAuthInstance.delete(`/v1/book/${bookToDelete.id}`);
      toast.success(`"${bookToDelete.title}" deleted successfully!`);
      setIsDeleteDialogOpen(false);
      setBookToDelete(null);
      fetchBooks();
    } catch (err: any) {
      console.error("Delete book failed:", err);
      toast.error(err?.response?.data?.message || "Failed to delete book.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Helpers to extract cover image and names
  const getCoverImageUrl = (book: BookItem): string | null => {
    const imagesList = book.images || book.bookImages || [];
    if (imagesList.length === 0) return null;

    // Look for cover image
    const coverObj = imagesList.find((img: any) =>
      typeof img === "object"
        ? img.imageType === "COVER" || img.type === "COVER"
        : false,
    );
    if (coverObj && typeof coverObj === "object") {
      return coverObj.url || coverObj.imageUrl || null;
    }

    // Fallback to first image
    const first = imagesList[0];
    if (typeof first === "string") return first;
    if (typeof first === "object") return first.url || first.imageUrl || null;
    return null;
  };

  const getAuthorsString = (book: BookItem): string => {
    const list = book.authors || book.authorBooks || [];
    if (list.length === 0) return "—";
    return list
      .map((a) => a.name || a.englishName || a.author?.name || "Author")
      .join(", ");
  };

  const getGenresList = (book: BookItem): string[] => {
    const list = book.genres || book.genreBooks || [];
    return list
      .map((g) => g.name || g.englishName || g.genre?.name || "")
      .filter(Boolean);
  };

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
    <div className="-m-6 lg:-m-8 p-6 lg:p-8 bg-[#f4f6fa] min-h-screen space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            Books Catalog
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            {pagination.total > 0
              ? `${pagination.total} books registered in the system`
              : `${books.length} books in current view`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => fetchBooks()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-indigo-600" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setBookToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer select-none"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm space-y-5">
        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, author, publisher, ISBN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100/80 border border-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-indigo-300 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium select-none">
            <span>
              Showing {filteredBooks.length} of{" "}
              {pagination.total || books.length} books
            </span>
          </div>
        </div>

        {/* Books Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Book</th>
                <th className="py-3.5 px-4">Author(s)</th>
                <th className="py-3.5 px-4">Publisher</th>
                <th className="py-3.5 px-4">Genre(s)</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Sold</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/80 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                      <p className="text-xs font-medium">
                        Loading books from database...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredBooks.length > 0 ? (
                filteredBooks.map((book) => {
                  const coverUrl = getCoverImageUrl(book);
                  const priceNum = Number(book.price) || 0;
                  const discountNum = Number(book.discountPercent) || 0;
                  const discountedPrice =
                    discountNum > 0
                      ? priceNum - (priceNum * discountNum) / 100
                      : priceNum;
                  const genresList = getGenresList(book);

                  return (
                    <tr
                      key={book.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* Title + Cover + ISBN */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-12 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden shadow-xs flex items-center justify-center">
                            {coverUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={coverUrl}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div className="flex flex-col max-w-[220px]">
                            <span
                              onClick={() => handleViewClick(book)}
                              className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate cursor-pointer hover:underline"
                            >
                              {book.title}
                            </span>
                            <span className="text-[11px] text-gray-400 font-normal mt-0.5 truncate">
                              {book.isbn13 || book.isbn10 || "No ISBN"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="py-3.5 px-4 text-gray-600 font-medium max-w-[150px] truncate">
                        {getAuthorsString(book)}
                      </td>

                      {/* Publisher */}
                      <td className="py-3.5 px-4 text-gray-500 font-normal max-w-[140px] truncate">
                        {book.publisher?.name ||
                          book.publisher?.englishName ||
                          "—"}
                      </td>

                      {/* Category / Genre Pills */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {genresList.length > 0 ? (
                            genresList.slice(0, 2).map((g, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-100"
                              >
                                {g}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                          {genresList.length > 2 && (
                            <span className="text-[10px] text-gray-400 self-center">
                              +{genresList.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">
                            Rs. {discountedPrice.toLocaleString()}
                          </span>
                          {discountNum > 0 && (
                            <span className="text-[10px] text-gray-400 line-through">
                              Rs. {priceNum.toLocaleString()} ({discountNum}%
                              off)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="py-3.5 px-4 font-semibold text-gray-700">
                        {book.stock}
                      </td>

                      {/* Sold Count */}
                      <td className="py-3.5 px-4 text-gray-500 font-normal">
                        {book.soldCount || 0}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStockBadge(Number(book.stock) || 0)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 opacity-70 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleViewClick(book)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="View Book Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEditClick(book)}
                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Book"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(book)}
                            className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Book"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-16 text-center text-gray-400 text-xs"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <BookOpen className="w-8 h-8 text-gray-300 mb-1" />
                      <p className="font-semibold text-gray-600">
                        No books found
                      </p>
                      <p className="text-gray-400">
                        {searchTerm
                          ? `No books match "${searchTerm}".`
                          : "Start by clicking 'Add New Book' above."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              Page{" "}
              <span className="font-semibold text-gray-800">{currentPage}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-800">
                {pagination.totalPages}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => {
                  const newPage = currentPage - 1;
                  setCurrentPage(newPage);
                  fetchBooks(newPage);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <button
                type="button"
                disabled={currentPage >= pagination.totalPages || isLoading}
                onClick={() => {
                  const newPage = currentPage + 1;
                  setCurrentPage(newPage);
                  fetchBooks(newPage);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Book Details Dialog */}
      <ViewBookDialog
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        book={viewingBook}
        onEdit={(book) => {
          setIsViewModalOpen(false);
          handleEditClick(book);
        }}
      />

      {/* Add / Edit Book Dialog */}
      <AddBookDialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        bookToEdit={bookToEdit}
        onSuccess={() => {
          fetchBooks();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] max-w-md p-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Delete Book
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Confirm book deletion
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

          <div className="p-5 text-xs text-slate-600 space-y-3">
            <p>
              Are you sure you want to permanently delete{" "}
              <strong className="text-slate-900 font-semibold">
                &quot;{bookToDelete?.title}&quot;
              </strong>
              ?
            </p>
            <p className="text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
              This action cannot be undone and will remove the book and its
              associated images from the catalog.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
            <button
              type="button"
              disabled={isDeleting}
              onClick={() => setIsDeleteDialogOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Book
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
