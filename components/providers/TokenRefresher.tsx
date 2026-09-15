"use client";

import { useEffect, useRef } from "react";
import { refreshAuthToken } from "@/utils/axiosInstances";
import { getTokenFromCookies, isTokenExpiringSoon } from "@/utils/cookies";

// Check every 1 minute to detect tokens approaching expiry
const CHECK_INTERVAL_MS = 60 * 1000;

export default function TokenRefresher() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstCheckRef = useRef(true);

  const checkAndRefreshToken = async () => {
    // Skip the very first check after mount — the user just logged in,
    // so the token is fresh. We only want to refresh once it's actually
    // close to expiring.
    if (isFirstCheckRef.current) {
      isFirstCheckRef.current = false;
      return;
    }

    try {
      const tokenData = await getTokenFromCookies();
      if (!tokenData?.refreshToken) return;

      // If token is missing, expired, or expiring in less than 3 minutes (180s), refresh proactively
      if (!tokenData.jwtToken || isTokenExpiringSoon(tokenData.jwtToken, 180)) {
        await refreshAuthToken();
      }
    } catch (err) {
      console.error("Token refresh check error:", err);
    }
  };

  useEffect(() => {
    // DO NOT call refresh immediately on mount.
    // Setup periodic 1-minute checker — the first tick is skipped via isFirstCheckRef.
    timerRef.current = setInterval(() => {
      checkAndRefreshToken();
    }, CHECK_INTERVAL_MS);

    // Re-check when user returns to tab after being idle for a while
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Reset the skip flag — if the user comes back to the tab,
        // we should check if the token is still valid
        isFirstCheckRef.current = false;
        checkAndRefreshToken();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
