"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Mail,
  Loader2,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Send,
} from "lucide-react";
import { axiosInstance } from "@/utils/axiosInstances";
import toast from "react-hot-toast";

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEmail?: string;
}

export default function ForgotPasswordDialog({
  open,
  onOpenChange,
  defaultEmail = "",
}: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(defaultEmail);
      setIsSubmitted(false);
    }
  }, [open, defaultEmail]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);

    try {
      let response;
      try {
        response = await axiosInstance.post("/v1/auth/forgot-password", {
          email: trimmedEmail,
        });
      } catch (err: any) {
        if (err?.response?.status === 404) {
          response = await axiosInstance.post("/api/v1/auth/forgot-password", {
            email: trimmedEmail,
          });
        } else {
          throw err;
        }
      }
      toast.dismiss();
      toast.success(
        response?.data?.message ||
          "Password reset link sent to your email successfully!",
      );
      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Forgot Password Error:", error);
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to send reset link. Please check your email and try again.";
      toast.dismiss();
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[420px] bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-2xl transition-all">
        {/* Top Decorative Graphic Accent */}
        <div className="flex justify-center -mt-1 mb-2">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-50 via-blue-50 to-indigo-100/60 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
            {isSubmitted ? (
              <CheckCircle2 className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 animate-in zoom-in-75 duration-300" />
            ) : (
              <KeyRound className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-600" />
            )}
          </div>
        </div>

        <DialogHeader className="text-center space-y-1.5">
          <DialogTitle className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {isSubmitted ? "Check Your Email" : "Forgot Password?"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed px-1">
            {isSubmitted ? (
              <>
                We have dispatched a password reset link to your email address.
              </>
            ) : (
              <>
                Enter your registered email address and we&apos;ll send you a
                link to reset your password.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="pt-3 pb-1 space-y-4 text-center">
            {/* Email Pill Badge */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 truncate max-w-full flex items-center justify-center gap-1.5 shadow-2xs">
              <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">{email}</span>
            </div>

            <p className="text-[11px] text-slate-400">
              Didn&apos;t receive the email? Check your spam folder or resend
              the link below.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="w-full sm:flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer active:scale-[0.98]"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label
                htmlFor="reset-email"
                className="block text-xs font-semibold text-slate-700"
              >
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="reset-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="youremail@gmail.com"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition duration-200 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md hover:shadow-indigo-500/20 disabled:opacity-60 cursor-pointer active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Link...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Resend Link</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
