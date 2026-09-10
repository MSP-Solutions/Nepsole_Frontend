"use client";

import { axiosAuthInstance } from "@/utils/axiosInstances";
import { clearCookies, getUserCookie, getTokenFromCookies } from "@/utils/cookies";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  AlertTriangle,
  Shield,
  ShieldCheck,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLogoutAllDialog, setShowLogoutAllDialog] = useState(false);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adminUser, setAdminUser] = useState<{
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load admin details from cookies or profile on mount
  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const user = await getUserCookie();
        if (user) {
          setAdminUser({
            name: user.name || user.fullName || "Administrator",
            email: user.email || "admin@gmail.com",
            role: user.role || "ADMIN",
          });
        }
      } catch (err) {
        console.error("Failed to read user cookie:", err);
      }
    };

    loadAdminData();
  }, []);

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
        label: "At least 8 characters long",
        met: pwd.length >= 8,
      },
      {
        id: "uppercase",
        label: "At least one uppercase letter (A-Z)",
        met: /[A-Z]/.test(pwd),
      },
      {
        id: "lowercase",
        label: "At least one lowercase letter (a-z)",
        met: /[a-z]/.test(pwd),
      },
      {
        id: "number",
        label: "At least one number (0-9)",
        met: /[0-9]/.test(pwd),
      },
      {
        id: "special",
        label: "At least one special character (!@#$%^&*)",
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

  const handleConfirmLogoutAll = async () => {
    try {
      setIsLoggingOutAll(true);
      const tokens = await getTokenFromCookies();
      if (tokens?.refreshToken) {
        try {
          await axiosAuthInstance.post("/v1/auth/logout-all", {
            refreshToken: tokens.refreshToken,
          });
        } catch (err) {
          console.error("API logout-all error:", err);
        }
      }
      await clearCookies();
      setShowLogoutAllDialog(false);
      toast.dismiss();
      toast.success("Successfully logged out from all devices");
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out from all devices:", error);
      toast.dismiss();
      toast.error("Failed to log out from all devices");
    } finally {
      setIsLoggingOutAll(false);
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

    setIsLoading(true);

    try {
      const payload = {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      };

      const res = await axiosAuthInstance.post(
        "/v1/auth/change-password",
        payload,
      );

      const successMsg =
        res?.data?.message || "Password has been updated successfully!";
      toast.success(successMsg);
      toast.success(`${successMsg} Logging out...`);
      handleReset();
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
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-600/10 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <main className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
                <Shield className="h-3.5 w-3.5" />
                Security & Authentication
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Account Security Settings
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your administrator credentials and safeguard your access to
              the control panel.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Column: Password Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Admin Overview Header Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
                    <UserCheck className="h-6 w-6" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-slate-900">
                        {adminUser?.name || "Administrator Account"}
                      </h2>
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                        {adminUser?.role || "ADMIN"}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {adminUser?.email || "Primary administrative login"}
                    </p>
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
                  Full Privileges
                </span>
              </div>
            </div>

            {/* Change Password Card */}
            <form
              onSubmit={handleSubmit}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs"
            >
              {/* Form Title */}
              <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <KeyRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Change Password
                    </h3>
                    <p className="text-xs text-slate-500">
                      Enter your current password and choose a strong new one.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6">
                {/* Current Password Field */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="currentPassword"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      name="currentPassword"
                      value={form.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter your current password"
                      className={`${inputClass} pl-10 pr-11`}
                      disabled={isLoading}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      disabled={isLoading}
                      aria-label={
                        showCurrent
                          ? "Hide current password"
                          : "Show current password"
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showCurrent ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="border-t border-dashed border-slate-200 my-2" />

                {/* New Password Field */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
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
                      disabled={isLoading}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      disabled={isLoading}
                      aria-label={
                        showNew ? "Hide new password" : "Show new password"
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
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
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-700"
                    >
                      Confirm New Password{" "}
                      <span className="text-rose-500">*</span>
                    </label>

                    {passwordsMatch && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match
                      </span>
                    )}
                    {passwordsMismatch && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500">
                        <XCircle className="h-3.5 w-3.5" /> Passwords do not
                        match
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
                      disabled={isLoading}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      disabled={isLoading}
                      aria-label={
                        showConfirm
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showConfirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={
                    isLoading ||
                    (!form.currentPassword &&
                      !form.newPassword &&
                      !form.confirmPassword)
                  }
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Clear Fields
                </button>

                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    !form.currentPassword ||
                    !form.newPassword ||
                    !form.confirmPassword
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-xs shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Logout from all devices Card */}
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/30 p-5 shadow-xs sm:p-6 mt-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Device Management
                    </h3>
                    <p className="text-xs text-slate-500">
                      Log out from all devices where your account is currently active.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-rose-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowLogoutAllDialog(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 transition active:scale-[0.98] cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout from all devices</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout All Devices Confirmation Dialog */}
      <Dialog open={showLogoutAllDialog} onOpenChange={setShowLogoutAllDialog}>
        <DialogContent className="sm:max-w-md bg-[#0c193c] text-white border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <AlertTriangle className="h-6 w-6 stroke-[2]" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-white">
              Confirm Logout All Devices
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-400 leading-relaxed">
              Are you sure you want to log out from all devices? This will invalidate all your active sessions everywhere.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-slate-800/60 mt-4">
            <button
              type="button"
              disabled={isLoggingOutAll}
              onClick={() => setShowLogoutAllDialog(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isLoggingOutAll}
              onClick={handleConfirmLogoutAll}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoggingOutAll ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Yes, Log out everywhere</span>
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
