"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { axiosInstance, markTokenFresh } from "@/utils/axiosInstances";
import ForgotPasswordDialog from "@/components/ForgotPasswordDialog";
import {
  decodeJwt,
  getUserCookie,
  isTokenExpiringSoon,
  setUserCookie,
} from "@/utils/cookies";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onSwitchToForgotPassword?: () => void;
  redirectOnSuccess?: boolean;
  isDialog?: boolean;
}

export interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToSignup?: () => void;
  onSwitchToForgotPassword?: () => void;
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
}

type FormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export function LoginForm({
  onSuccess,
  onSwitchToSignup,
  onSwitchToForgotPassword,
  redirectOnSuccess = true,
  isDialog = false,
}: LoginFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [showInternalForgotPassword, setShowInternalForgotPassword] =
    useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getErrorMessage = (error: any) => {
    const errorData = error?.response?.data;
    return (
      errorData?.error?.details?.[0]?.message ||
      errorData?.error?.message ||
      errorData?.message ||
      (typeof errorData?.error === "string" ? errorData.error : null) ||
      error?.message ||
      "Invalid email or password. Please try again."
    );
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    setIsResending(true);

    try {
      let response;
      try {
        response = await axiosInstance.post("/v1/auth/resend-verification", {
          email: unverifiedEmail,
        });
      } catch (err: any) {
        if (err?.response?.status === 404) {
          response = await axiosInstance.post(
            "/api/v1/auth/resend-verification",
            {
              email: unverifiedEmail,
            },
          );
        } else {
          throw err;
        }
      }

      toast.dismiss();
      toast.success(
        response?.data?.message || "Verification email sent successfully!",
      );
      setShowVerificationDialog(false);
    } catch (error: any) {
      console.error("Resend Verification Error:", error);
      const message = getErrorMessage(error);
      toast.dismiss();
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email) {
      toast.error("Email address is required.");
      return;
    }

    if (!password) {
      toast.error("Password is required.");
      return;
    }

    setIsLoading(true);

    try {
      let response;
      try {
        response = await axiosInstance.post("/v1/auth/login", {
          identifier: email,
          password,
        });
      } catch (err: any) {
        if (err?.response?.status === 404) {
          response = await axiosInstance.post("/api/v1/auth/login", {
            identifier: email,
            password,
          });
        } else {
          throw err;
        }
      }

      const responseData = response?.data;
      const rawData = responseData?.data || responseData;

      const nestedUser = rawData?.user || responseData?.user || {};

      const token =
        rawData?.accessToken ||
        rawData?.token ||
        nestedUser?.accessToken ||
        responseData?.accessToken;

      if (!token) {
        throw new Error("Login successful, but no access token was returned.");
      }

      const decodedToken = decodeJwt(token);

      const role = (
        rawData?.role ||
        nestedUser?.role ||
        decodedToken?.role ||
        decodedToken?.roles?.[0] ||
        decodedToken?.authorities?.[0] ||
        responseData?.role ||
        ""
      )
        .toString()
        .toUpperCase();

      const userPayload = {
        ...decodedToken,
        ...nestedUser,
        ...rawData,
        accessToken: token,
        role,
      };

      await setUserCookie(userPayload);
      markTokenFresh();

      toast.success("Login successfully");
      onSuccess?.();

      const isAdmin =
        role === "ADMIN" || role === "ROLE_ADMIN" || role === "ADMINISTRATOR";

      // Check callback URL if any
      const searchParams = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      const callbackUrl = searchParams.get("callbackUrl");

      const destination =
        callbackUrl && callbackUrl.startsWith("/")
          ? callbackUrl
          : isAdmin
            ? "/admin/dashboard"
            : "/user/dashboard";

      setTimeout(() => {
        router.push(destination);
        router.refresh();
      }, 300);
    } catch (error: any) {
      console.error("Login Error:", error);

      const errCode =
        error?.response?.data?.error?.code ||
        error?.response?.data?.code ||
        error?.response?.data?.status;

      const message = getErrorMessage(error);

      if (
        errCode === "FORBIDDEN" ||
        message.toLowerCase().includes("verify your email") ||
        message.toLowerCase().includes("email verification") ||
        message.toLowerCase().includes("not verified")
      ) {
        setUnverifiedEmail(email);
        setShowVerificationDialog(true);
      }

      toast.error(message);
      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotClick = () => {
    if (onSwitchToForgotPassword) {
      onSwitchToForgotPassword();
    } else {
      setShowInternalForgotPassword(true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="youremail@gmail.com"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="block text-xs font-semibold text-slate-700"
            >
              Password
            </label>
            <button
              type="button"
              onClick={handleForgotClick}
              className="text-xs font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <div className="relative flex items-center">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={isLoading}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3.5 text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Switch to Signup */}
        <p className="pt-2 text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          {onSwitchToSignup ? (
            <button
              type="button"
              onClick={onSwitchToSignup}
              className="font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline cursor-pointer"
            >
              Sign up
            </button>
          ) : (
            <Link
              href="/signup"
              className="font-semibold text-indigo-600 transition hover:text-indigo-700 hover:underline"
            >
              Sign up
            </Link>
          )}
        </p>
      </form>

      {/* Verification Dialog */}
      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-2xl p-6 shadow-xl z-[70]">
          <DialogHeader className="space-y-3 text-center sm:text-left">
            <div className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 border border-amber-200">
              <Mail className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Email Verification Required
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600 leading-relaxed">
              Your account for{" "}
              <strong className="text-slate-900">{unverifiedEmail}</strong> is
              not verified yet. Please check your email inbox or click below to
              resend the verification email.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
            <button
              type="button"
              disabled={isResending}
              onClick={() => setShowVerificationDialog(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isResending}
              onClick={handleResendVerification}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shadow-xs disabled:opacity-60 cursor-pointer"
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" />
                  <span>Resend Verification Email</span>
                </>
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Internal Forgot Password Dialog fallback */}
      <ForgotPasswordDialog
        open={showInternalForgotPassword}
        onOpenChange={setShowInternalForgotPassword}
        defaultEmail={formData.email}
      />
    </>
  );
}

export function LoginDialog({
  open,
  onOpenChange,
  onSwitchToSignup,
  onSwitchToForgotPassword,
  onSuccess,
  redirectOnSuccess = false,
}: LoginDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl z-[60]">
        <DialogHeader className="space-y-1.5 text-center pb-2">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm mb-1">
            <BookOpen className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
            Welcome back to Nepsole
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Sign in to your account to continue
          </DialogDescription>
        </DialogHeader>

        <LoginForm
          onSuccess={() => {
            onOpenChange(false);
            onSuccess?.();
          }}
          onSwitchToSignup={onSwitchToSignup}
          onSwitchToForgotPassword={onSwitchToForgotPassword}
          redirectOnSuccess={redirectOnSuccess}
          isDialog={true}
        />
      </DialogContent>
    </Dialog>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] =
    useState(false);

  useEffect(() => {
    if (
      searchParams.get("forgot") === "true" ||
      searchParams.get("forgotPassword") === "true"
    ) {
      setShowForgotPasswordDialog(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const existingUser = await getUserCookie();
        const token = existingUser?.accessToken;

        if (token && !isTokenExpiringSoon(token, 0)) {
          const rawRole = (existingUser?.role || existingUser?.user?.role || "")
            .toString()
            .toUpperCase();

          const isAdmin =
            rawRole === "ADMIN" ||
            rawRole === "ROLE_ADMIN" ||
            rawRole === "ADMINISTRATOR";

          if (isAdmin) {
            router.replace("/admin/dashboard");
          } else {
            router.replace("/user/dashboard");
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
      }
    };

    checkSession();
  }, [router]);

  return (
    <>
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <Link
              href="/"
              className="group mb-5 inline-flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm transition group-hover:bg-indigo-700">
                <BookOpen className="h-5 w-5" />
              </div>

              <span className="text-xl font-bold tracking-tight text-slate-900">
                Nepsole
              </span>
            </Link>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to your account to continue
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <LoginForm
              onSwitchToForgotPassword={() => setShowForgotPasswordDialog(true)}
              redirectOnSuccess={true}
            />
          </div>
        </div>
      </main>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={showForgotPasswordDialog}
        onOpenChange={setShowForgotPasswordDialog}
      />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
