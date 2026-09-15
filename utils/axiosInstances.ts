import axios, { AxiosError, AxiosRequestConfig } from "axios";

import {
  getTokenFromCookies,
  getUserCookie,
  setUserCookie,
  isTokenExpiringSoon,
  clearCookies,
  openAuthModal,
} from "./cookies";
import toast from "react-hot-toast";

let refreshPromise: Promise<string | null> | null = null;
// Track the last time a refresh was performed to avoid refreshing too soon
let lastRefreshTime: number = 0;
// Minimum cooldown between refresh attempts (14 minutes in ms)
const REFRESH_COOLDOWN_MS = 14 * 60 * 1000;

/** Call this after login to prevent immediate token refresh attempts */
export const markTokenFresh = () => {
  lastRefreshTime = Date.now();
};

export const refreshAuthToken = async (): Promise<string | null> => {
  // If a refresh is already in progress, share the existing promise
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const tokenData = await getTokenFromCookies();

      if (!tokenData?.refreshToken) {
        return null;
      }

      const response = await axiosInstance.post("/v1/auth/refresh", {
        refreshToken: tokenData.refreshToken,
      });

      /**
       * Backend returns refreshed token or user payload.
       */
      const responseData = response?.data;
      const rawData = responseData?.data || responseData;
      const newAccessToken =
        typeof rawData === "string"
          ? rawData
          : rawData?.accessToken ||
            rawData?.token ||
            rawData?.jwtToken ||
            responseData?.accessToken ||
            null;

      const newRefreshToken =
        rawData?.refreshToken ||
        responseData?.refreshToken ||
        tokenData.refreshToken;

      if (!newAccessToken) {
        return null;
      }

      const user = await getUserCookie();
      if (user) {
        await setUserCookie({
          ...user,
          ...(typeof rawData === "object" ? rawData : {}),
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        });
      }

      // Record the refresh time so we don't refresh again too soon
      lastRefreshTime = Date.now();
      return newAccessToken;
    } catch (error: any) {
      console.error("Refresh Token Failed:", error);

      // Logout if refresh token is rejected due to expiration (401)
      if (error?.response?.status === 401) {
        if (typeof window !== "undefined") {
          toast.error("Your session has expired. Please log in again.", {
            duration: 3000,
          });
          await clearCookies();
          // openAuthModal("login");
          // Small delay so the user can read the toast before redirect
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        }
      }

      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const fetchToken = async (): Promise<string | null> => {
  const tokenData = await getTokenFromCookies();
  let accessToken = tokenData?.jwtToken ?? null;

  // Only proactively refresh if:
  // 1. Token is expiring in less than 60s
  // 2. Enough time has passed since the last refresh (cooldown)
  const timeSinceLastRefresh = Date.now() - lastRefreshTime;
  if (
    accessToken &&
    isTokenExpiringSoon(accessToken, 60) &&
    tokenData?.refreshToken &&
    timeSinceLastRefresh > REFRESH_COOLDOWN_MS
  ) {
    const refreshed = await refreshAuthToken();
    if (refreshed) {
      accessToken = refreshed;
    }
  }

  return accessToken;
};

/* ---------------------------------------------------------- */
/* Axios Instances */
/* ---------------------------------------------------------- */

const getBaseURL = () => {
  const url = process.env.NEXT_PUBLIC_BASE_URL || "";
  return url ? url.replace(/\/+$/, "") : "";
};

export const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosMultipartInstance = axios.create({
  baseURL: getBaseURL(),
});

export const axiosAuthInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------------------------------------------------- */
/* Request Interceptors */
/* ---------------------------------------------------------- */

const attachToken = async (config: any) => {
  const token = await fetchToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

axiosAuthInstance.interceptors.request.use(attachToken, (error) =>
  Promise.reject(error),
);

axiosMultipartInstance.interceptors.request.use(attachToken, (error) =>
  Promise.reject(error),
);

/* ---------------------------------------------------------- */
/* Response Interceptor */
/* ---------------------------------------------------------- */

axiosAuthInstance.interceptors.response.use(
  (response) => response,

  async (
    error: AxiosError & {
      config?: AxiosRequestConfig & {
        _retry?: boolean;
      };
    },
  ) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    /**
     * Intercept 401 Unauthorized, 417, or token expiration errors
     */
    const status = error.response?.status;
    const errorData = error.response?.data as any;
    const message =
      typeof errorData === "string"
        ? errorData
        : errorData?.message || errorData?.error || "";

    const isAuthError =
      status === 401 ||
      status === 417 ||
      (status === 403 &&
        typeof message === "string" &&
        (message.toLowerCase().includes("token") ||
          message.toLowerCase().includes("jwt") ||
          message.toLowerCase().includes("expired") ||
          message.toLowerCase().includes("unauthorized") ||
          message.toLowerCase().includes("invalid")));

    if (isAuthError && !originalRequest._retry) {
      originalRequest._retry = true;

      const token = await refreshAuthToken();

      if (token) {
        if (originalRequest.headers) {
          originalRequest.headers.set?.("Authorization", `Bearer ${token}`);

          if (!originalRequest.headers.set) {
            (originalRequest.headers as Record<string, string>).Authorization =
              `Bearer ${token}`;
          }
        }

        return axiosAuthInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  },
);
