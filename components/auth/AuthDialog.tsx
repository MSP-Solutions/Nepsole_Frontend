"use client";

import ForgotPasswordDialog from "@/components/ForgotPasswordDialog";
import { LoginForm } from "@/components/login";
import { SignupForm } from "@/components/signup";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OPEN_AUTH_MODAL_EVENT } from "@/utils/cookies";
import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

export interface AuthDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMode?: "login" | "signup" | "forgot";
  onSuccess?: () => void;
  redirectOnSuccess?: boolean;
}

export default function AuthDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  defaultMode = "login",
  onSuccess,
  redirectOnSuccess = false,
}: AuthDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup" | "forgot">(defaultMode);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (val: boolean) => {
    if (!val) {
      setForgotPasswordOpen(false);
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (
          url.searchParams.has("auth") ||
          url.searchParams.has("login") ||
          url.searchParams.has("signup")
        ) {
          url.searchParams.delete("auth");
          url.searchParams.delete("login");
          url.searchParams.delete("signup");
          window.history.replaceState(
            {},
            "",
            url.pathname + (url.search ? url.search : ""),
          );
        }
      }
    }
    if (controlledOnOpenChange) {
      controlledOnOpenChange(val);
    } else {
      setInternalOpen(val);
    }
  };

  // Check URL params on mount (e.g. ?auth=login or ?auth=signup)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const authParam = params.get("auth");
      const loginParam = params.get("login");
      const signupParam = params.get("signup");
      const forgotParam = params.get("forgot") || params.get("forgotPassword");

      if (authParam === "login" || loginParam === "true") {
        setMode("login");
        if (controlledOnOpenChange) {
          controlledOnOpenChange(true);
        } else {
          setInternalOpen(true);
        }
      } else if (authParam === "signup" || signupParam === "true") {
        setMode("signup");
        if (controlledOnOpenChange) {
          controlledOnOpenChange(true);
        } else {
          setInternalOpen(true);
        }
      } else if (forgotParam === "true") {
        setForgotPasswordOpen(true);
      }
    }
  }, [controlledOnOpenChange]);

  // Global event listener to trigger modal from anywhere
  useEffect(() => {
    const handleGlobalOpen = (e: any) => {
      const targetMode = e?.detail?.mode || "login";
      setMode(targetMode);
      if (controlledOnOpenChange) {
        controlledOnOpenChange(true);
      } else {
        setInternalOpen(true);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener(OPEN_AUTH_MODAL_EVENT, handleGlobalOpen);
      return () => {
        window.removeEventListener(OPEN_AUTH_MODAL_EVENT, handleGlobalOpen);
      };
    }
  }, [controlledOnOpenChange]);

  useEffect(() => {
    if (isOpen) {
      setMode(defaultMode);
    }
  }, [isOpen, defaultMode]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl z-[60] max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <DialogHeader className="space-y-1 text-center pb-2">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-sm mb-1">
              <BookOpen className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">
              {mode === "login"
                ? "Welcome back to Nepsole"
                : "Create your account"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {mode === "login"
                ? "Sign in to access your wishlist, orders & personalized reading"
                : "Join thousands of book readers and explore our digital collection"}
            </DialogDescription>
          </DialogHeader>

          {/* Form Content */}
          {mode === "login" ? (
            <LoginForm
              onSuccess={() => {
                handleOpenChange(false);
                onSuccess?.();
              }}
              onSwitchToSignup={() => setMode("signup")}
              onSwitchToForgotPassword={() => {
                handleOpenChange(false);
                setForgotPasswordOpen(true);
              }}
              redirectOnSuccess={redirectOnSuccess}
              isDialog={true}
            />
          ) : (
            <SignupForm
              onSuccess={() => {
                handleOpenChange(false);
                onSuccess?.();
              }}
              onSwitchToLogin={() => setMode("login")}
              redirectOnSuccess={redirectOnSuccess}
              isDialog={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={(val) => {
          setForgotPasswordOpen(val);
          if (!val && !isOpen) {
            // closed
          }
        }}
      />
    </>
  );
}
