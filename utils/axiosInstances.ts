import axios, { AxiosError, AxiosRequestConfig } from "axios";

import {
  getTokenFromCookies,
  getUserCookie,
  setUserCookie,
  isTokenExpiringSoon,
} from "./cookies";

let refreshPromise: Promise<string | null> | null = null;

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

      let response;
      try {
        response = await axiosInstance.post("/v1/auth/refresh", {
          refreshToken: tokenData.refreshToken,
        });
      } catch (err: any) {
        if (err?.response?.status === 404) {
          response = await axios.post(
            `${process.env.NEXT_PUBLIC_BASE_URL}/v1/auth/refresh`,
            {
              refreshToken: tokenData.refreshToken,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        } else {
          throw err;
        }
      }

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

      return newAccessToken;
    } catch (error) {
      console.error("Refresh Token Failed:", error);
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

  // Proactively refresh if token has expired or is expiring in less than 60s
  if (
    accessToken &&
    isTokenExpiringSoon(accessToken, 60) &&
    tokenData?.refreshToken
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

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosMultipartInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
});

export const axiosAuthInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
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
