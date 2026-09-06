"use client";

import React, { useEffect, useState } from "react";
import AddTestimonialDialog, {
  TestimonialItem,
} from "@/components/admin/AddTestimonialDialog";
import DeleteTestimonialDialog from "@/components/admin/DeleteTestimonialDialog";
import ViewTestimonialDialog from "@/components/admin/ViewTestimonialDialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import {
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2Icon,
  EyeIcon,
  Loader2,
  Plus,
  Quote,
  Search,
  Trash2Icon,
  User,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dialog States
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<TestimonialItem | null>(null);

  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [viewingTestimonial, setViewingTestimonial] =
    useState<TestimonialItem | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [deletingTestimonial, setDeletingTestimonial] =
    useState<TestimonialItem | null>(null);
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

  const fetchTestimonials = async (
    page = currentPage,
    limit = pageSize,
    search = searchQuery
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search.trim()) {
        params.append("search", search.trim());
      }
      const queryString = params.toString();

      let response;
      try {
        response = await axiosAuthInstance.get(
          `/v1/testimonial?${queryString}`
        );
      } catch {
        response = await axiosAuthInstance.get(
          `/v1/testimonials?${queryString}`
        );
      }
      const rawData = response.data;
      const list =
        rawData?.data ||
        rawData?.testimonials ||
        rawData?.testimonial ||
        (Array.isArray(rawData) ? rawData : []);
      setTestimonials(list);

      if (rawData?.pagination) {
        setPagination(rawData.pagination);
      } else {
        setPagination({
          total: rawData?.total ?? list.length,
          page: page,
          limit: limit,
          totalPages:
            rawData?.totalPages ?? Math.max(1, Math.ceil(list.length / limit)),
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch testimonials:", error);
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to load testimonials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials(currentPage, pageSize, searchQuery);
  }, [currentPage, pageSize, searchQuery]);

  // Image Helper
  const getTestimonialImage = (t: any) => {
    const img = t?.imageUrl || t?.image || "";
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

  // Filtered Testimonials
  const filteredTestimonials = testimonials.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.name?.toLowerCase().includes(q) ||
      item.designation?.toLowerCase().includes(q) ||
      item.message?.toLowerCase().includes(q)
    );
  });

  // Delete Handler
  const handleDeleteConfirm = async () => {
    if (!deletingTestimonial?.id) return;
    setIsDeleting(true);
    try {
      try {
        await axiosAuthInstance.delete(
          `/v1/testimonial/${deletingTestimonial.id}`
        );
      } catch {
        await axiosAuthInstance.delete(
          `/v1/testimonials/${deletingTestimonial.id}`
        );
      }
      toast.success("Testimonial deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeletingTestimonial(null);
      fetchTestimonials();
    } catch (error: any) {
      console.error("Delete Testimonial Error:", error);
      toast.error(
        error?.response?.data?.message || "Failed to delete testimonial."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1749A0]/10 text-[#1749A0]">
              <Quote className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
                Testimonials
              </h1>
              <p className="text-xs text-slate-500">
                Manage customer reviews, feedback and testimonials
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingTestimonial(null);
            setIsAddDialogOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123b83] cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, designation or feedback message..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-[#1749A0] focus:bg-white focus:ring-2 focus:ring-[#1749A0]/10"
          />
        </div>

        <div className="text-xs font-medium text-slate-500">
          Total Testimonials:{" "}
          <span className="font-bold text-slate-900">
            {filteredTestimonials.length}
          </span>
        </div>
      </div>

      {/* Main Table / List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#1749A0]" />
            <p className="mt-3 text-xs font-medium">Loading testimonials...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
              <Quote className="h-7 w-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No Testimonials Found
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              {searchQuery
                ? "No testimonial matching your search criteria."
                : "Add your first testimonial to showcase client reviews on the homepage."}
            </p>
            {!searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setEditingTestimonial(null);
                  setIsAddDialogOpen(true);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1749A0] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#123b83] transition cursor-pointer"
              >
                <Plus size={15} />
                <span>Add Testimonial</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Reviewer</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Message Snippet</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTestimonials.map((item) => {
                  const imgUrl = getTestimonialImage(item);
                  const isPublished =
                    item.isPublished === true ||
                    item.isPublished === "true" ||
                    item.isPublished === 1 ||
                    item.isPublished === "1";

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Name & Photo */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={item.name}
                              className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1749A0] font-bold text-sm border border-blue-200">
                              {item.name?.[0]?.toUpperCase() || "T"}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400 sm:hidden">
                              {item.designation || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {item.designation ? (
                          <span className="inline-flex items-center gap-1">
                            <Briefcase size={12} className="text-slate-400" />
                            {item.designation}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Not set</span>
                        )}
                      </td>

                      {/* Message */}
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        <p className="truncate line-clamp-1 italic">
                          &ldquo;{item.message}&rdquo;
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isPublished ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={12} /> Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <XCircle size={12} /> Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setViewingTestimonial(item);
                              setIsViewDialogOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-[#1749A0] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="View details"
                          >
                            <EyeIcon size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingTestimonial(item);
                              setIsAddDialogOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="Edit testimonial"
                          >
                            <Edit2Icon size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeletingTestimonial(item);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete testimonial"
                          >
                            <Trash2Icon size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      <AddTestimonialDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        testimonialToEdit={editingTestimonial}
        onSuccess={() => fetchTestimonials()}
      />

      {/* View Dialog */}
      <ViewTestimonialDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        testimonial={viewingTestimonial}
      />

      {/* Delete Dialog */}
      <DeleteTestimonialDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        testimonial={deletingTestimonial}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
