"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  BookOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "@/utils/axiosInstances";
import { decodeJwt, setUserCookie } from "@/utils/cookies";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  redirectOnSuccess?: boolean;
  isDialog?: boolean;
}

export interface SignupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin?: () => void;
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
}

type SignupFormData = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  agreeToTerms: boolean;
};

export function SignupForm({
  onSuccess,
  onSwitchToLogin,
  redirectOnSuccess = true,
  isDialog = false,
}: SignupFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errorMessage) setErrorMessage("");
  };

  const getErrorMessage = (error: any) => {
    const errorData = error?.response?.data;
    return (
      errorData?.error?.details?.[0]?.message ||
      errorData?.error?.message ||
      errorData?.message ||
      (typeof errorData?.error === "string" ? errorData.error : null) ||
      error?.message ||
      "Failed to create account. Please try again."
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();
    const phoneNumber = formData.phoneNumber.trim();
    const password = formData.password;

    if (!name) {
      const msg = "Please enter your full name.";
      setErrorMessage(msg);
      toast.dismiss();
      toast.error(msg);
      return;
    }
    if (!email) {
      const msg = "Please enter your email address.";
      setErrorMessage(msg);
      toast.dismiss();
      toast.error(msg);
      return;
    }
    if (!phoneNumber) {
      const msg = "Please enter your phone number.";
      setErrorMessage(msg);
      toast.dismiss();
      toast.error(msg);
      return;
    }
    if (password.length < 6) {
      const msg = "Password must be at least 6 characters long.";
      setErrorMessage(msg);
      toast.dismiss();
      toast.error(msg);
      return;
    }
    if (!formData.agreeToTerms) {
      const msg = "Please agree to the Terms of Service & Privacy Policy.";
      setErrorMessage(msg);
      toast.dismiss();
      toast.error(msg);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        name,
        email,
        phoneNumber,
        password,
        agreeToTerms: formData.agreeToTerms,
      };

      let response;
      try {
        response = await axiosInstance.post("/v1/auth/signup", payload);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          try {
            response = await axiosInstance.post("/v1/auth/register", payload);
          } catch (err2: any) {
            if (err2?.response?.status === 404) {
              response = await axiosInstance.post("/auth/signup", payload);
            } else {
              throw err2;
            }
          }
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

      toast.dismiss();
      toast.success("Account created successfully!");

      onSuccess?.();

      if (token) {
        const decodedToken = decodeJwt(token);
        const role = (
          rawData?.role ||
          nestedUser?.role ||
          decodedToken?.role ||
          decodedToken?.roles?.[0] ||
          decodedToken?.authorities?.[0] ||
          responseData?.role ||
          "USER"
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

        if (redirectOnSuccess) {
          const isAdmin =
            role === "ADMIN" ||
            role === "ROLE_ADMIN" ||
            role === "ADMINISTRATOR";

          setTimeout(() => {
            if (isAdmin) {
              router.push("/admin/dashboard");
            } else {
              router.push("/user/dashboard");
            }
            router.refresh();
          }, 400);
        }
      } else if (redirectOnSuccess) {
        setTimeout(() => {
          if (onSwitchToLogin) {
            onSwitchToLogin();
          } else {
            router.push("/login");
          }
        }, 800);
      }
    } catch (error: any) {
      console.error("Signup Error:", error);
      const message = getErrorMessage(error);
      setErrorMessage(message);
      toast.dismiss();
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      {/* Error Banner */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-medium text-rose-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Full Name */}
        <div>
          <label
            htmlFor="signup-name"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition disabled:opacity-60"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="signup-email"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="youremail@gmail.com"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition disabled:opacity-60"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="signup-phone"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-phone"
              name="phoneNumber"
              type="tel"
              required
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="9801234567"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition disabled:opacity-60"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="flex items-start gap-2 pt-0.5">
          <input
            id="signup-terms"
            name="agreeToTerms"
            type="checkbox"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            disabled={isLoading}
            className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
          />
          <label
            htmlFor="signup-terms"
            className="text-[11px] text-slate-600 leading-normal cursor-pointer select-none"
          >
            I agree to the Terms of Service & Privacy Policy.
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 active:scale-[0.99] transition disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <p className="text-center text-xs text-slate-500 pt-1">
        Already have an account?{" "}
        {onSwitchToLogin ? (
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-indigo-600 hover:underline cursor-pointer"
          >
            Sign in
          </button>
        ) : (
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Sign in
          </Link>
        )}
      </p>
    </div>
  );
}

export function SignupDialog({
  open,
  onOpenChange,
  onSwitchToLogin,
  onSuccess,
  redirectOnSuccess = false,
}: SignupDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl z-[60] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1 text-center pb-1">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm mb-1">
            <BookOpen className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
            Create an account
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Join Nepsole to read, review, and buy books
          </DialogDescription>
        </DialogHeader>

        <SignupForm
          onSuccess={() => {
            onOpenChange(false);
            onSuccess?.();
          }}
          onSwitchToLogin={onSwitchToLogin}
          redirectOnSuccess={redirectOnSuccess}
          isDialog={true}
        />
      </DialogContent>
    </Dialog>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header & Logo */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-sm group-hover:bg-indigo-700 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Nepsole
            </span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Create an account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter your details below to create your account
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <SignupForm redirectOnSuccess={true} />
        </div>
      </div>
    </div>
  );
}
