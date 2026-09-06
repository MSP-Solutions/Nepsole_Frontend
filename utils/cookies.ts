import Cookies from "js-cookie";

const USER_COOKIE = "nepsole";
export const AUTH_CHANGE_EVENT = "nepsole-auth-change";
export const CART_CHANGE_EVENT = "nepsole-cart-change";
export const WISHLIST_CHANGE_EVENT = "nepsole-wishlist-change";

export interface UserCookie {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
  id?: number | string;
  email?: string;
  name?: string;
  fullName?: string;
  username?: string;
  role: "USER" | "ADMIN" | string;
  [key: string]: any;
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

export const isTokenExpiringSoon = (
  token?: string | null,
  thresholdSeconds = 180
): boolean => {
  if (!token) return true;
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return false;
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp - currentTime <= thresholdSeconds;
};

export const getUserDisplayName = (user: any): string => {
  if (!user) return "";
  const name =
    user.name ||
    user.fullName ||
    user.fullname ||
    user.username ||
    user.userName ||
    (user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "") ||
    (user.email ? user.email.split("@")[0] : "") ||
    "User";
  return name;
};

export const getUserInitials = (name: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export const setUserCookie = async (
  data: Partial<UserCookie> & Record<string, any>,
  expires = 7
) => {
  const existing = await getUserCookie();
  const token = data?.accessToken || data?.jwtToken || data?.token || existing?.accessToken;
  const decoded = token ? decodeJwt(token) : null;

  const role = (
    data?.role ||
    decoded?.role ||
    decoded?.roles?.[0] ||
    decoded?.authorities?.[0] ||
    existing?.role ||
    ""
  )
    .toString()
    .toUpperCase();

  const merged = {
    ...(existing ?? {}),
    ...decoded,
    ...data,
    accessToken: token,
    role,
  };

  const isHttps =
    typeof window !== "undefined"
      ? window.location.protocol === "https:"
      : process.env.NODE_ENV === "production";

  Cookies.set(USER_COOKIE, JSON.stringify(merged), {
    expires,
    path: "/",
    secure: isHttps,
    sameSite: "lax",
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
};

export const getUserCookie = async (): Promise<UserCookie | null> => {
  const cookie = Cookies.get(USER_COOKIE);

  if (!cookie) return null;

  try {
    return JSON.parse(decodeURIComponent(cookie));
  } catch {
    try {
      return JSON.parse(cookie);
    } catch {
      return null;
    }
  }
};

export const getTokenFromCookies = async () => {
  const user = await getUserCookie();

  if (!user) return null;

  const accessToken =
    user.accessToken ||
    user.token ||
    user.jwtToken ||
    user.user?.accessToken;

  const refreshToken =
    user.refreshToken ||
    user.refresh_token ||
    user.user?.refreshToken;

  return {
    jwtToken: accessToken,
    refreshToken: refreshToken,
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

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  }
};