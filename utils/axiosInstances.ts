import axios, { AxiosError, AxiosRequestConfig } from "axios";

import {
  getTokenFromCookies,
  getUserCookie,
  setUserCookie,
  clearCookies,
} from "./cookies";

let cachedToken: string | null = null;
let fetchingTokenPromise: Promise<string | null> | null = null;

const fetchToken = async (): Promise<string | null> => {
  if (cachedToken) return cachedToken;

  if (!fetchingTokenPromise) {
    fetchingTokenPromise = (async () => {
      const tokenData = await getTokenFromCookies();

      fetchingTokenPromise = null;

      const accessToken = tokenData?.jwtToken ?? null;

      cachedToken = accessToken;

      return accessToken;
    })();
  }

  return fetchingTokenPromise;
};

export const refreshAuthToken = async () => {
  try {
    const tokenData = await getTokenFromCookies();

    if (!tokenData) return null;

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/v1/auth/refresh`,
      {
        refreshToken: tokenData.refreshToken,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    /**
     * Backend returns a refreshed user payload.
     */

    const responseData = response.data;
    const newAccessToken =
      typeof responseData === "string"
        ? responseData
        : responseData?.accessToken ?? null;

    if (!newAccessToken) return null;

    cachedToken = newAccessToken;

    if (responseData && typeof responseData === "object") {
      await setUserCookie(responseData);
    } else {
      const user = await getUserCookie();

      if (user) {
        await setUserCookie({
          ...user,
          accessToken: newAccessToken,
        });
      }
    }

    return newAccessToken;
  } catch (error) {
    console.error("Refresh Token Failed", error);

    cachedToken = null;

    await clearCookies();

    return null;
  }
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
     * Your backend returns 401 when token expires.
     */

    const status = error.response?.status;
    const message = (error.response?.data as { message?: string })?.message;

    const shouldRefresh =
      (status === 417 ||
        (status === 401 && message === "Authentication required.")) &&
      !originalRequest._retry;

    if (shouldRefresh) {
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
