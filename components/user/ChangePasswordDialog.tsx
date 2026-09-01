"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { axiosAuthInstance } from "@/utils/axiosInstances";
import { clearCookies } from "@/utils/cookies";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const router = useRouter();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Password Requirements Validation
  const requirements = useMemo(() => {
    const pwd = form.newPassword;
    return [
      {
        id: "length",
        label: "At least 8 characters",
        met: pwd.length >= 8,
      },
      {
        id: "uppercase",
        label: "One uppercase letter (A-Z)",
        met: /[A-Z]/.test(pwd),
      },
      {
        id: "lowercase",
        label: "One lowercase letter (a-z)",
        met: /[a-z]/.test(pwd),
      },
      {
        id: "number",
        label: "One number (0-9)",
        met: /[0-9]/.test(pwd),
      },
      {
        id: "special",
        label: "One special character (!@#$)",
        met: /[^A-Za-z0-9]/.test(pwd),
      },
    ];
  }, [form.newPassword]);

  // Password Strength Calculation (0 - 100%)
  const strengthScore = useMemo(() => {
    if (!form.newPassword) return 0;
    const passedCount = requirements.filter((r) => r.met).length;
    return (passedCount / requirements.length) * 100;
  }, [form.newPassword, requirements]);

  const strengthMeta = useMemo(() => {
    if (strengthScore === 0)
      return { label: "", color: "bg-slate-200", text: "" };
    if (strengthScore <= 40)
      return { label: "Weak", color: "bg-rose-500", text: "text-rose-600" };
    if (strengthScore <= 80)
      return { label: "Medium", color: "bg-amber-500", text: "text-amber-600" };
    return {
      label: "Strong",
      color: "bg-emerald-500",
      text: "text-emerald-600",
    };
  }, [strengthScore]);

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.newPassword === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 &&
    form.newPassword !== form.confirmPassword;

  const handleReset = () => {
    setForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handleClose = (isOpen: boolean) => {
    if (!isSubmitting) {
      if (!isOpen) handleReset();
      onOpenChange(isOpen);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }

    if (!form.newPassword) {
      toast.error("Please enter a new password.");
      return;
    }

    if (form.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      toast.error("New password cannot be the same as your current password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      };

      const res = await axiosAuthInstance.post(
        "/v1/auth/change-password",
        payload
      );

      const successMsg =
        res?.data?.message || "Password updated successfully!";
      toast.success(`${successMsg} Logging out...`);
      handleReset();
      onOpenChange(false);

      // Clear session cookies and cache, then redirect to login page
      setTimeout(async () => {
        try {
          await clearCookies();
          if (typeof window !== "undefined") {
            localStorage.removeItem("nepsole_user_profile");
            localStorage.removeItem("nepsole_user_addresses");
          }
        } catch (err) {
          console.error("Failed to clear session cookies:", err);
        } finally {
          router.push("/login");
        }
      }, 1000);
    } catch (error: any) {
      console.error("Change Password Error:", error);
      const errorData = error?.response?.data;
      const errorMsg =
        errorData?.error?.details?.[0]?.message ||
        errorData?.error?.message ||
        errorData?.message ||
        (typeof errorData?.error === "string" ? errorData.error : null) ||
        "Failed to change password. Please verify your current password and try again.";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-600/10 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-white p-6 rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-900">
                Change Password
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Update your account password. You will need to log in again with your new password.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Current Password Field */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Current Password <span className="text-rose-500">*</span>
            </label>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className={`${inputClass} pl-10 pr-11`}
                disabled={isSubmitting}
                required
              />

              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                disabled={isSubmitting}
                aria-label={
                  showCurrent ? "Hide current password" : "Show current password"
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="newPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                New Password <span className="text-rose-500">*</span>
              </label>

              {strengthMeta.label && (
                <span
                  className={`text-xs font-semibold ${strengthMeta.text}`}
                >
                  {strengthMeta.label}
                </span>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="newPassword"
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Enter new strong password"
                className={`${inputClass} pl-10 pr-11`}
                disabled={isSubmitting}
                required
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                disabled={isSubmitting}
                aria-label={
                  showNew ? "Hide new password" : "Show new password"
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Password Strength Meter Bar */}
            {form.newPassword && (
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-300 ${strengthMeta.color}`}
                    style={{ width: `${strengthScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password Field */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
              >
                Confirm New Password <span className="text-rose-500">*</span>
              </label>

              {passwordsMatch && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Match
                </span>
              )}
              {passwordsMismatch && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500">
                  <XCircle className="h-3.5 w-3.5" /> Do not match
                </span>
              )}
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat new password"
                className={`${inputClass} pl-10 pr-11 ${
                  passwordsMismatch
                    ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                    : ""
                }`}
                disabled={isSubmitting}
                required
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                disabled={isSubmitting}
                aria-label={
                  showConfirm
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Live Checklist Requirements */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                Password Requirements
              </span>
              <span className="text-[11px] text-slate-500">
                {requirements.filter((r) => r.met).length} of {requirements.length} met
              </span>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2">
              {requirements.map((req) => (
                <div
                  key={req.id}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    req.met ? "text-emerald-700 font-medium" : "text-slate-500"
                  }`}
                >
                  {req.met ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  ) : (
                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300 bg-white" />
                  )}
                  <span className="text-[11px]">{req.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleClose(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !form.currentPassword ||
                !form.newPassword ||
                !form.confirmPassword
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer transition active:scale-[0.99]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Change Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
