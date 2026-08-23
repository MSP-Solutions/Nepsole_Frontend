import Cookies from "js-cookie";

const USER_COOKIE = "nepsole";

export interface UserCookie {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  id: number | string;
  email: string;
  role: "USER" | "ADMIN" | string;
}

export const decodeJwt = (token: string): Record<string, any> | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload =
      typeof atob === "function"
        ? atob(base64)
        : Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const setUserCookie = async (
  data: Partial<UserCookie> & Record<string, any>,
  expires = 7
) => {
  const existing = await getUserCookie();
  const token = data?.accessToken || data?.jwtToken || data?.token || existing?.accessToken;
  const decoded = token ? decodeJwt(token) : null;

  const merged = {
    ...(existing ?? {}),
    ...decoded,
    ...data,
    accessToken: token,
    role: (data?.role || decoded?.role || existing?.role || "").toString().toUpperCase(),
  };

  Cookies.set(USER_COOKIE, JSON.stringify(merged), {
    expires,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const getUserCookie = async (): Promise<UserCookie | null> => {
  const cookie = Cookies.get(USER_COOKIE);

  if (!cookie) return null;

  try {
    return JSON.parse(cookie);
  } catch {
    return null;
  }
};

export const getTokenFromCookies = async () => {
  const user = await getUserCookie();

  if (!user) return null;

  return {
    jwtToken: user.accessToken,
    refreshToken: user.refreshToken,
  };
};

export const clearCookies = async () => {
  Cookies.remove(USER_COOKIE);
  Cookies.remove(USER_COOKIE, { path: "/" });
  
  // Clear any additional browser cookies
  if (typeof document !== "undefined") {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach((cookieName) => {
      Cookies.remove(cookieName);
      Cookies.remove(cookieName, { path: "/" });
    });
  }
};