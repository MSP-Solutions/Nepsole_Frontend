import { axiosAuthInstance } from "@/utils/axiosInstances";
import { CART_CHANGE_EVENT, getUserCookie, openAuthModal } from "@/utils/cookies";
import toast from "react-hot-toast";

export interface StoredCartItem {
  id?: string | number;
  bookId?: string | number;
  stationeryId?: string | number;
  itemType?: "BOOK" | "STATIONERY" | string;
  title?: string;
  name?: string;
  author?: string;
  category?: string;
  price?: number;
  originalPrice?: number;
  discountPercent?: number;
  quantity: number;
  coverImage?: string | null;
  imageUrl?: string | null;
  format?: string;
  stock?: number;
  [key: string]: any;
}

/**
 * Read the current cart map from localStorage
 * Returns a dictionary mapping String(bookId/stationeryId) -> quantity
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
      const bId = String(it.stationeryId ?? it.bookId ?? it.id ?? "");
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
      const isStat =
        it.itemType === "STATIONERY" ||
        Boolean(it.stationeryId) ||
        Boolean(it.stationery);
      const bId = isStat
        ? (it.stationeryId ?? it.stationery?.id ?? it.id)
        : (it.bookId ?? it.book?.id ?? it.id);

      if (bId !== undefined && bId !== null) {
        const qty = Number(it.quantity) || 1;
        map[String(bId)] = qty;

        const statObj = it.stationery || {};
        const bookObj = it.book || {};

        serverCart.push({
          id: it.id || `item-${bId}`,
          bookId: bId,
          stationeryId: isStat ? bId : undefined,
          itemType: isStat ? "STATIONERY" : "BOOK",
          title: isStat
            ? statObj.name || it.title || "Stationery Item"
            : bookObj.title || it.title || "Book",
          author: isStat
            ? statObj.category?.name || "Stationery"
            : bookObj.authors?.[0]?.name ||
              bookObj.author?.name ||
              it.author ||
              "",
          category: isStat ? statObj.category?.name || "Stationery" : undefined,
          price: Number(it.unitPrice || it.price || (isStat ? statObj.price : bookObj.price) || 0),
          originalPrice: Number(it.originalPrice || it.unitPrice || (isStat ? statObj.price : bookObj.price) || 0),
          discountPercent: Number(it.discountPercent || (isStat ? statObj.discountPercent : bookObj.discountPercent) || 0),
          quantity: qty,
          coverImage: isStat
            ? statObj.images?.[0]?.imageUrl ||
              statObj.images?.[0]?.url ||
              statObj.imageUrl ||
              it.coverImage ||
              null
            : bookObj.coverImageUrl ||
              bookObj.images?.[0]?.url ||
              it.coverImage ||
              null,
          format: isStat ? "Stationery" : it.format || "Paperback",
          stock: Number((isStat ? statObj.stock : bookObj.stock) || 10),
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
 * Body: { bookId: 14, quantity: 2 } or { stationeryId: 2, quantity: 2 }
 */
export const updateCartQuantityApi = async (
  itemId: number | string,
  quantity: number,
  isStationery: boolean = false,
) => {
  const numId = Number(itemId);
  const targetId = !isNaN(numId) ? numId : itemId;
  const payload = isStationery
    ? { stationeryId: targetId, quantity }
    : { bookId: targetId, quantity };

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
export const removeCartItemApi = async (itemId: number | string) => {
  const numId = Number(itemId);
  const targetId = !isNaN(numId) ? numId : itemId;
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
 * Add a book/stationery to cart initially (/v1/cart)
 */
export const addToCartInitialApi = async (
  itemId: number | string,
  quantity: number = 1,
  isStationery: boolean = false,
) => {
  const numId = Number(itemId);
  const targetId = !isNaN(numId) ? numId : itemId;
  const payload = isStationery
    ? { stationeryId: targetId, quantity }
    : { bookId: targetId, quantity };

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
 * Extract book/stationery cover image safely
 */
export const extractCoverImage = (book: any): string | null => {
  if (typeof book?.coverImage === "string") return book.coverImage;
  if (typeof book?.coverImageUrl === "string") return book.coverImageUrl;
  if (typeof book?.imageUrl === "string") return book.imageUrl;
  if (typeof book?.image === "string") return book.image;
  if (Array.isArray(book?.images) && book.images.length > 0) {
    const first = book.images[0];
    return typeof first === "string" ? first : first?.imageUrl || first?.url || null;
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

    const isStat = Boolean(
      book.itemType === "STATIONERY" ||
      book.format === "Stationery" ||
      book.stationeryId ||
      book.isStationery ||
      book.stationery,
    );

    const bId = String(book.stationeryId ?? book.id ?? book.bookId ?? "");
    const existingIdx = currentCart.findIndex(
      (c) => String(c.stationeryId ?? c.bookId ?? c.id ?? "") === bId,
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
          id: `${isStat ? "stationery" : "item"}-${bId}-${Date.now()}`,
          bookId: !isNaN(Number(bId)) ? Number(bId) : bId,
          stationeryId: isStat ? (!isNaN(Number(bId)) ? Number(bId) : bId) : undefined,
          itemType: isStat ? "STATIONERY" : "BOOK",
          title: book.name || book.title || (isStat ? "Stationery Item" : "Book"),
          name: book.name || book.title || (isStat ? "Stationery Item" : "Book"),
          author: isStat
            ? book.category?.name || book.Category?.name || book.author || "Stationery"
            : extractAuthorName(book),
          category: isStat ? book.category?.name || book.Category?.name || "Stationery" : undefined,
          price: finalPrice,
          originalPrice: priceNum,
          discountPercent: discountNum,
          quantity: newQuantity,
          coverImage: extractCoverImage(book),
          imageUrl: extractCoverImage(book),
          format: isStat ? "Stationery" : (book.format || "Paperback"),
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

