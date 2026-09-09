"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { openAuthModal } from "@/utils/cookies";
import { Loader2 } from "lucide-react";

function SignupRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl");
    const params = new URLSearchParams();
    params.set("auth", "signup");
    if (callbackUrl) {
      params.set("callbackUrl", callbackUrl);
    }

    const targetUrl = `/?${params.toString()}`;
    router.replace(targetUrl);

    setTimeout(() => {
      openAuthModal("signup");
    }, 50);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      }
    >
      <SignupRedirect />
    </Suspense>
  );
}
