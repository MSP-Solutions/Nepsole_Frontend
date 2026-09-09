"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { openAuthModal } from "@/utils/cookies";
import { Loader2 } from "lucide-react";

function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl");
    const isForgot =
      searchParams.get("forgot") === "true" ||
      searchParams.get("forgotPassword") === "true";

    const params = new URLSearchParams();
    if (isForgot) {
      params.set("forgot", "true");
    } else {
      params.set("auth", "login");
    }

    if (callbackUrl) {
      params.set("callbackUrl", callbackUrl);
    }

    const targetUrl = `/?${params.toString()}`;
    router.replace(targetUrl);

    setTimeout(() => {
      openAuthModal("login");
    }, 50);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
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
      <LoginRedirect />
    </Suspense>
  );
}
