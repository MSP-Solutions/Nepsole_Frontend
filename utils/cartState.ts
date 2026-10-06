import { axiosAuthInstance } from "@/utils/axiosInstances";
import { CART_CHANGE_EVENT, getUserCookie, openAuthModal } from "@/utils/cookies";
import toast from "react-hot-toast";

export interface StoredCartItem {
  id?: string | number;
  bookId: string | number;
  title?: string;
  author?: string;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  quantity: number;
  coverImage?: string | null;
  format?: string;
  stock?: number;
  [key: string]: any;
}

/**
 * Read the current cart map from localStorage
 * Returns a dictionary mapping String(bookId) -> quantity
 */
export const getLocalCartMap = (): Record<string, number> => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("nepsole_cart");
    if (!raw) return {};
    const items: StoredCartItem[] = JSON.parse(raw);
    if (!Array.isArray(items)) return {};

    const map: Record<string, number> = {};
    items.forEach((it) => {
      const bId = String(it.bookId ?? it.id ?? "");
      if (bId) {
        map[bId] = Number(it.quantity) || 1;
      }
    });
    return map;
  } catch {
    return {};
  }
};

/**
 * Fetch the latest cart from the server (/v1/cart) and update localStorage.
 * Dispatches CART_CHANGE_EVENT once updated.
 */
let lastSyncTime = 0;
let isFetchingServerCart = false;

export const syncServerCart = async (force = false): Promise<Record<string, number>> => {
  if (typeof window === "undefined") return {};
  const now = Date.now();
  // Throttle: don't sync more than once every 5 seconds unless force is true
  if (!force && now - lastSyncTime < 5000) {
    return getLocalCartMap();
  }
  if (isFetchingServerCart) return getLocalCartMap();

  try {
    const user = await getUserCookie();
    if (!user?.accessToken) {
      return getLocalCartMap();
    }

    isFetchingServerCart = true;
    lastSyncTime = Date.now();
    let res;
    try {
      res = await axiosAuthInstance.get("/v1/cart");
    } catch (e: any) {
      if (e?.response?.status === 404) {
        res = await axiosAuthInstance.get("/api/v1/cart");
      } else {
        throw e;
      }
    }

    const data = res?.data?.data || res?.data;
    const rawItems: any[] = Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data)
        ? data
        : [];

    const serverCart: StoredCartItem[] = [];
    const map: Record<string, number> = {};

    rawItems.forEach((it) => {
      const bId = it.bookId ?? it.book?.id ?? it.id;
      if (bId !== undefined && bId !== null) {
        const qty = Number(it.quantity) || 1;
        map[String(bId)] = qty;

        serverCart.push({
          id: it.id || `item-${bId}`,
          bookId: bId,
          title: it.book?.title || it.title || "Book",
          author:
            it.book?.authors?.[0]?.name ||
            it.book?.author?.name ||
            it.author ||
            "",
          price: Number(it.unitPrice || it.price || 0),
          originalPrice: Number(it.originalPrice || it.unitPrice || 0),
          discountPercent: Number(it.discountPercent || 0),
          quantity: qty,
          coverImage:
            it.book?.coverImageUrl ||
            it.book?.images?.[0]?.url ||
            it.coverImage ||
            null,
          format: it.format || "Paperback",
          stock: Number(it.book?.stock || 10),
        });
      }
    });

    const oldSaved = localStorage.getItem("nepsole_cart") || "";
    const newSaved = JSON.stringify(serverCart);
    if (oldSaved !== newSaved) {
      localStorage.setItem("nepsole_cart", newSaved);
    }
    return map;
  } catch (error) {
    console.error("Failed to sync server cart:", error);
    return getLocalCartMap();
  } finally {
    isFetchingServerCart = false;
  }
};

/**
 * Call the quantity update API:
 * Endpoint: /api/v1/cart/quantity (with /v1/cart/quantity fallback)
 * Body: { bookId: 14, quantity: 2 }
 */
export const updateCartQuantityApi = async (
  bookId: number | string,
  quantity: number,
) => {
  const numId = Number(bookId);
  const payload = {
    bookId: !isNaN(numId) ? numId : bookId,
    quantity,
  };

  try {
    return await axiosAuthInstance.patch("/v1/cart/quantity", payload);
  } catch (err: any) {
    if (err?.response?.status === 404 || err?.response?.status === 405) {
      try {
        return await axiosAuthInstance.patch("/api/v1/cart/quantity", payload);
      } catch {
        try {
          return await axiosAuthInstance.post("/v1/cart/quantity", payload);
        } catch {
          return await axiosAuthInstance.put("/v1/cart/quantity", payload);
        }
      }
    }
    throw err;
  }
};

/**
 * Remove an item from the cart
 */
export const removeCartItemApi = async (bookId: number | string) => {
  const numId = Number(bookId);
  const targetId = !isNaN(numId) ? numId : bookId;
  try {
    return await axiosAuthInstance.delete(`/v1/cart/${targetId}`);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return await axiosAuthInstance.delete(`/api/v1/cart/${targetId}`);
    }
    throw err;
  }
};

/**
 * Add a book to cart initially (/v1/cart)
 */
export const addToCartInitialApi = async (
  bookId: number | string,
  quantity: number = 1,
) => {
  const numId = Number(bookId);
  const payload = {
    bookId: !isNaN(numId) ? numId : bookId,
    quantity,
  };

  try {
    return await axiosAuthInstance.post("/v1/cart", payload);
  } catch (err: any) {
    if (err?.response?.status === 404) {
      return await axiosAuthInstance.post("/api/v1/cart", payload);
    }
    throw err;
  }
};

/**
 * Extract book cover image safely
 */
export const extractCoverImage = (book: any): string | null => {
  if (typeof book?.coverImage === "string") return book.coverImage;
  if (typeof book?.coverImageUrl === "string") return book.coverImageUrl;
  if (typeof book?.imageUrl === "string") return book.imageUrl;
  if (Array.isArray(book?.images) && book.images.length > 0) {
    const first = book.images[0];
    return typeof first === "string" ? first : first?.url || null;
  }
  return null;
};

/**
 * Extract author name safely
 */
export const extractAuthorName = (book: any): string => {
  const authors = book?.authors || book?.authorBooks || [];
  if (Array.isArray(authors) && authors.length > 0) {
    const a = authors[0];
    return a.name || a.englishName || a.author?.name || "";
  }
  return typeof book?.author === "string" ? book.author : "";
};

/**
 * Update the local storage array of items
 */
export const updateLocalStorageItem = (
  book: any,
  newQuantity: number,
) => {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("nepsole_cart");
    let currentCart: StoredCartItem[] = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(currentCart)) currentCart = [];

    const bId = String(book.id ?? book.bookId ?? "");
    const existingIdx = currentCart.findIndex(
      (c) => String(c.bookId ?? c.id ?? "") === bId,
    );

    if (newQuantity <= 0) {
      if (existingIdx >= 0) {
        currentCart.splice(existingIdx, 1);
      }
    } else {
      const priceNum = Number(book.price) || 0;
      const discountNum = Number(book.discountPercent) || 0;
      const finalPrice =
        discountNum > 0 ? priceNum - (priceNum * discountNum) / 100 : priceNum;

      if (existingIdx >= 0) {
        currentCart[existingIdx].quantity = newQuantity;
      } else {
        currentCart.push({
          id: `item-${bId}-${Date.now()}`,
          bookId: !isNaN(Number(bId)) ? Number(bId) : bId,
          title: book.title || "Book",
          author: extractAuthorName(book),
          price: finalPrice,
          originalPrice: priceNum,
          discountPercent: discountNum,
          quantity: newQuantity,
          coverImage: extractCoverImage(book),
          format: book.format || "Paperback",
          stock: Number(book.stock) || 10,
        });
      }
    }

    if (currentCart.length === 0) {
      localStorage.removeItem("nepsole_cart");
      localStorage.removeItem("nepsole_cart_count");
    } else {
      localStorage.setItem("nepsole_cart", JSON.stringify(currentCart));
    }
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  } catch (err) {
    console.error("Error updating local cart:", err);
  }
};

/**
 * Completely clears local cart and notifies components
 */
export const clearLocalCart = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("nepsole_cart");
    localStorage.removeItem("nepsole_cart_count");
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
  }
};

