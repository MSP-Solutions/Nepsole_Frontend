"use client";

import ReplyContactDialog from "@/components/admin/ReplyContactDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Reply,
  Search,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export interface ContactItem {
  id: number | string;
  name: string;
  phone?: string;
  email: string;
  subject?: string;
  message: string;
  isReplied?: boolean;
  replySubject?: string | null;
  replyMessage?: string | null;
  repliedAt?: string | null;
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

export default function AdminContactPage() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Dialog States
  const [viewingContact, setViewingContact] = useState<ContactItem | null>(
    null,
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);

  const [replyingContact, setReplyingContact] = useState<ContactItem | null>(
    null,
  );
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState<boolean>(false);

  const [deletingContact, setDeletingContact] = useState<ContactItem | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch Contacts API
  const fetchContacts = useCallback(
    async (page = currentPage, limit = pageSize, search = debouncedSearch) => {
      setIsLoading(true);
      try {
        let url = `/v1/contact?page=${page}&limit=${limit}`;
        if (search && search.trim()) {
          url += `&search=${encodeURIComponent(search.trim())}`;
        }

        let response;
        try {
          response = await axiosAuthInstance.get(url);
        } catch {
          response = await axiosInstance.get(url);
        }

        const data = response?.data?.data || response?.data;
        const list: ContactItem[] = Array.isArray(data)
          ? data
          : data?.contacts ||
            data?.messages ||
            data?.inquiries ||
            data?.items ||
            [];
        setContacts(list);

        // Parse pagination metadata
        const rawPagination =
          response?.data?.pagination ||
          data?.pagination ||
          response?.data?.meta ||
          data?.meta;

        if (rawPagination) {
          const totalCount =
            rawPagination.total ??
            rawPagination.totalCount ??
            rawPagination.count ??
            list.length;
          const limitCount = rawPagination.limit ?? limit;
          const totalPages =
            (rawPagination.totalPages ??
              rawPagination.lastPage ??
              Math.ceil(totalCount / limitCount)) ||
            1;

          setPagination({
            total: totalCount,
            page: rawPagination.page ?? page,
            limit: limitCount,
            totalPages,
          });
        } else {
          const totalCount =
            response?.data?.total ??
            response?.data?.totalCount ??
            response?.data?.count ??
            data?.total ??
            data?.totalCount ??
            data?.count ??
            list.length;

          const totalPages =
            (response?.data?.totalPages ??
              data?.totalPages ??
              Math.ceil(totalCount / limit)) ||
            1;

          setPagination({
            total: totalCount,
            page,
            limit,
            totalPages,
          });
        }
      } catch (error) {
        console.error("Failed to fetch contact inquiries:", error);
        toast.dismiss();
        toast.error("Failed to load contact messages.");
      } finally {
        setIsLoading(false);
      }
    },
    [currentPage, pageSize, debouncedSearch],
  );

  useEffect(() => {
    fetchContacts(currentPage, pageSize, debouncedSearch);
  }, [fetchContacts, currentPage, pageSize, debouncedSearch]);

  const handlePageChange = (newPage: number) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === currentPage ||
      isLoading
    ) {
      return;
    }
    setCurrentPage(newPage);
  };

  const handleOpenReply = (contact: ContactItem) => {
    setReplyingContact(contact);
    setIsReplyDialogOpen(true);
  };

  // Delete Action
  const handleDeleteContact = async () => {
    if (!deletingContact) return;

    setIsDeleting(true);
    try {
      let response;
      try {
        response = await axiosAuthInstance.delete(
          `/v1/contact/${deletingContact.id}`,
        );
      } catch {
        response = await axiosInstance.delete(
          `/v1/contact/${deletingContact.id}`,
        );
      }

      toast.success(response?.data?.message || "Inquiry deleted successfully.");

      setIsDeleteDialogOpen(false);
      setDeletingContact(null);

      // Refresh list
      fetchContacts(currentPage, pageSize, debouncedSearch);
    } catch (error: any) {
      console.error("Delete Contact Error:", error);
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to delete contact inquiry.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Contact Inquiries
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            View, reply, and manage customer messages and book inquiries
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-[11px] text-slate-400 font-medium">
                Show:
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Sender / Contact</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Message Preview</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {isLoading ? (
                /* Loading Skeletons */
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="space-y-1.5">
                        <div className="h-3.5 bg-slate-200 rounded w-28" />
                        <div className="h-2.5 bg-slate-200 rounded w-36" />
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 bg-slate-200 rounded w-24" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-4 bg-slate-200 rounded w-16" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 rounded w-48" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3 bg-slate-200 rounded w-24" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="h-7 bg-slate-200 rounded-lg w-20 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : contacts.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">
                        No Inquiries Found
                      </h3>
                      <p className="text-xs text-slate-500">
                        {searchQuery
                          ? `No contact messages matching "${searchQuery}".`
                          : "There are no customer inquiries submitted yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Rows */
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* Sender Info */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{contact.name || "Anonymous"}</span>
                        </div>
                        <div className="flex flex-col text-[11px] text-slate-500 gap-0.5">
                          {contact.email && (
                            <a
                              href={`mailto:${contact.email}`}
                              className="hover:text-indigo-600 hover:underline flex items-center gap-1 truncate max-w-[200px]"
                              title={contact.email}
                            >
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{contact.email}</span>
                            </a>
                          )}
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="hover:text-emerald-600 flex items-center gap-1 text-[10px]"
                            >
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{contact.phone}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Subject */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100/80 text-indigo-700 font-semibold text-[11px]">
                        {contact.subject || "Book Inquiry"}
                      </span>
                    </td>
                    {/* Message Preview */}
                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <p
                        className="text-slate-600 line-clamp-2 leading-relaxed"
                        title={contact.message}
                      >
                        {contact.message}
                      </p>
                    </td>
                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {formatDate(contact.createdAt || contact.updatedAt)}
                    </td>
                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Reply / View Reply Action */}
                        {contact.isReplied ? (
                          <button
                            type="button"
                            onClick={() => handleOpenReply(contact)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-[11px] transition shadow-2xs cursor-pointer"
                            title="View sent reply"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>View Reply</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenReply(contact)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] transition shadow-2xs cursor-pointer"
                            title="Send reply"
                          >
                            <Reply className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>
                        )}

                        {/* View Full Message */}
                        <button
                          type="button"
                          onClick={() => {
                            setViewingContact(contact);
                            setIsViewDialogOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Message */}
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingContact(contact);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && pagination.total > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500">
              Showing{" "}
              <strong className="text-slate-900 font-bold">
                {(currentPage - 1) * pageSize + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-900 font-bold">
                {Math.min(currentPage * pageSize, pagination.total)}
              </strong>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {pagination.total}
              </span>{" "}
              inquiries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs font-semibold"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (pagination.totalPages <= 5) return true;
                    if (p === 1 || p === pagination.totalPages) return true;
                    if (Math.abs(p - currentPage) <= 1) return true;
                    return false;
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="px-1 text-slate-400">...</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePageChange(p)}
                          className={`min-w-[28px] h-7 text-xs rounded-lg font-semibold transition cursor-pointer flex items-center justify-center ${
                            currentPage === p
                              ? "bg-indigo-600 text-white shadow-2xs"
                              : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages || isLoading}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reply Message Dialog Component */}
      <ReplyContactDialog
        open={isReplyDialogOpen}
        onOpenChange={setIsReplyDialogOpen}
        contact={replyingContact}
        onSuccess={() => fetchContacts(currentPage, pageSize, debouncedSearch)}
      />

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <DialogHeader className="space-y-1 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                {viewingContact?.subject || "Book Inquiry"}
              </span>
              {viewingContact?.isReplied ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Replied</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold">
                  <Clock className="w-3 h-3 text-amber-600" />
                  <span>Pending</span>
                </span>
              )}
            </div>
            <DialogTitle className="text-lg font-black text-slate-900">
              Inquiry Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Received on{" "}
              {formatDate(
                viewingContact?.createdAt || viewingContact?.updatedAt,
              )}
            </DialogDescription>
          </DialogHeader>

          {viewingContact && (
            <div className="py-4 space-y-4 text-xs max-h-[65vh] overflow-y-auto pr-1">
              {/* Sender Details Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Sender Information
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                  <div className="flex items-center gap-1.5 font-bold">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{viewingContact.name || "N/A"}</span>
                  </div>
                  {viewingContact.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <a
                        href={`tel:${viewingContact.phone}`}
                        className="hover:underline text-emerald-700 font-semibold"
                      >
                        {viewingContact.phone}
                      </a>
                    </div>
                  )}
                  {viewingContact.email && (
                    <div className="sm:col-span-2 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-indigo-600" />
                      <a
                        href={`mailto:${viewingContact.email}`}
                        className="hover:underline text-indigo-700 font-semibold"
                      >
                        {viewingContact.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Inquiry Message Body */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Inquiry Message
                </span>
                <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {viewingContact.message}
                </div>
              </div>

              {/* Sent Reply Section (If already replied) */}
              {viewingContact.isReplied && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Sent Response
                    </span>
                    {viewingContact.repliedAt && (
                      <span className="text-[10px] text-emerald-700 font-medium">
                        {formatDate(viewingContact.repliedAt)}
                      </span>
                    )}
                  </div>
                  {viewingContact.replySubject && (
                    <div className="text-xs font-bold text-slate-900">
                      Subject: {viewingContact.replySubject}
                    </div>
                  )}
                  <div className="p-3 bg-white rounded-lg border border-emerald-200 text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                    {viewingContact.replyMessage ||
                      "No reply message recorded."}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-slate-100 flex flex-row items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsViewDialogOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Close
            </button>

            {viewingContact &&
              (viewingContact.isReplied ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleOpenReply(viewingContact);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Full Reply</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleOpenReply(viewingContact);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply to Customer</span>
                </button>
              ))}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-white p-6 shadow-xl">
          <DialogHeader className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
              <AlertCircle className="w-5 h-5" />
            </div>
            <DialogTitle className="text-base font-black text-slate-900">
              Delete Contact Inquiry?
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              Are you sure you want to delete this message from{" "}
              <strong className="text-slate-800">
                {deletingContact?.name || "this user"}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingContact(null);
              }}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteContact}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
