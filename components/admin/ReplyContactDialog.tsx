"use client";

import { ContactItem } from "@/app/admin/(dashboard)/contact/page";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosAuthInstance, axiosInstance } from "@/utils/axiosInstances";
import {
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  Send,
  User,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface ReplyContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact: ContactItem | null;
  onSuccess?: () => void;
}

export const ReplyContactDialog: React.FC<ReplyContactDialogProps> = ({
  open,
  onOpenChange,
  contact,
  onSuccess,
}) => {
  const [subject, setSubject] = useState<string>("");
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    if (contact) {
      if (contact.isReplied) {
        setSubject(contact.replySubject || "Re: Inquiry on Nepsole");
        setReplyMessage(contact.replyMessage || "");
      } else {
        const origSubject = contact.subject?.trim();
        setSubject(
          origSubject
            ? origSubject.startsWith("Re:")
              ? origSubject
              : `Re: ${origSubject}`
            : "Re: Inquiry on Nepsole",
        );
        setReplyMessage("");
      }
    }
  }, [contact, open]);

  if (!contact) return null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();

    if (contact.isReplied) {
      toast.error("This inquiry has already been replied to.");
      return;
    }

    if (!replyMessage.trim()) {
      toast.error("Please enter a reply message.");
      return;
    }

    setIsSending(true);
    try {
      const payload = {
        contactId: contact.id,
        id: contact.id,
        email: contact.email,
        name: contact.name,
        subject: subject.trim() || "Re: Inquiry on Nepsole",
        message: replyMessage.trim(),
        reply: replyMessage.trim(),
      };

      let response;
      try {
        response = await axiosAuthInstance.post("/v1/contact/reply", payload);
      } catch (authErr: any) {
        if (authErr?.response?.status === 404 || authErr?.response?.status === 401) {
          response = await axiosInstance.post("/v1/contact/reply", payload);
        } else {
          throw authErr;
        }
      }

      const successMsg =
        response?.data?.message ||
        `Reply sent successfully to ${contact.email}`;

      toast.success(successMsg);
      onOpenChange(false);
      setReplyMessage("");
      onSuccess?.();
    } catch (error: any) {
      console.error("Send Contact Reply Error:", error);
      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to send reply. Please verify recipient email or try again.";
      toast.error(errMsg);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[95vw] max-w-lg p-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                contact.isReplied
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-indigo-50 text-indigo-600 border-indigo-100"
              }`}
            >
              {contact.isReplied ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {contact.isReplied ? "Sent Reply" : "Reply to Inquiry"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {contact.isReplied
                  ? `Replied on ${formatDate(contact.repliedAt || contact.updatedAt)}`
                  : "Send an official email response to the customer"}
              </DialogDescription>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSending}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Form / View Body */}
        <form onSubmit={handleSendReply}>
          <div className="p-5 space-y-4 text-xs">
            {/* Already Replied Banner */}
            {contact.isReplied && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  This inquiry was already replied to on{" "}
                  {formatDate(contact.repliedAt || contact.updatedAt)}.
                </span>
              </div>
            )}

            {/* Recipient Overview Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Recipient
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Direct Email
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800">
                <div className="flex items-center gap-1.5 font-bold">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{contact.name || "Customer"}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-indigo-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{contact.email}</span>
                </div>
              </div>

              {/* Original Message Quote */}
              <div className="pt-2 border-t border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                  Original Inquiry:
                </span>
                <p className="text-[11px] text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200/70 line-clamp-2">
                  &quot;{contact.message}&quot;
                </p>
              </div>
            </div>

            {/* Reply Subject */}
            <div className="space-y-1.5">
              <label
                htmlFor="reply-subject"
                className="block text-xs font-bold text-slate-700"
              >
                Subject
              </label>
              <input
                id="reply-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Re: Inquiry on Nepsole"
                required
                readOnly={contact.isReplied}
                disabled={isSending || contact.isReplied}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 disabled:bg-slate-100 disabled:text-slate-700"
              />
            </div>

            {/* Reply Message */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="reply-message"
                  className="block text-xs font-bold text-slate-700"
                >
                  {contact.isReplied ? "Sent Response" : "Response Message"}{" "}
                  {!contact.isReplied && <span className="text-rose-500">*</span>}
                </label>
                {contact.repliedAt && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(contact.repliedAt)}
                  </span>
                )}
              </div>
              <textarea
                id="reply-message"
                rows={5}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder={`Dear ${contact.name || "Customer"},\n\nThank you for reaching out to Nepsole. Regarding your inquiry...`}
                required
                readOnly={contact.isReplied}
                disabled={isSending || contact.isReplied}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3.5 text-xs sm:text-sm leading-relaxed text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 disabled:bg-slate-50 disabled:text-slate-800"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3.5">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Close
            </button>

            {!contact.isReplied && (
              <button
                type="submit"
                disabled={isSending || !replyMessage.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Sending Reply...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Response</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyContactDialog;
