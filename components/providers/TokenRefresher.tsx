"use client";

import { useEffect, useRef } from "react";
import { refreshAuthToken } from "@/utils/axiosInstances";
import {
  AUTH_CHANGE_EVENT,
  getTokenFromCookies,
  isTokenExpiringSoon,
} from "@/utils/cookies";

// Check every 1 minute to detect tokens approaching expiry
const CHECK_INTERVAL_MS = 60 * 1000;

export default function TokenRefresher() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const checkAndRefreshToken = async () => {
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
    // Initial check on mount
    checkAndRefreshToken();

    // Setup periodic 1-minute checker
    timerRef.current = setInterval(() => {
      checkAndRefreshToken();
    }, CHECK_INTERVAL_MS);

    // Re-check when auth state changes (login, logout, cookie update)
    const handleAuthChange = () => {
      checkAndRefreshToken();
    };

    // Re-check immediately when user returns to tab after idle
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkAndRefreshToken();
      }
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return null;
}
