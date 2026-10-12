export interface StationeryImage {
  id?: number | string;
  url: string;
  type?: string;
  [key: string]: any;
}

export interface StationeryItem {
  id: number | string;
  name: string;
  slug?: string;
  description?: string;
  price: number | string;
  discountPercent?: number | string;
  stock: number | string;
  categoryId?: number | string;
  subCategoryId?: number | string;
  category?: {
    id: number | string;
    name: string;
    slug?: string;
    [key: string]: any;
  };
  subCategory?: {
    id: number | string;
    name: string;
    slug?: string;
    [key: string]: any;
  };
  Category?: {
    id: number | string;
    name: string;
    slug?: string;
    [key: string]: any;
  };
  SubCategory?: {
    id: number | string;
    name: string;
    slug?: string;
    [key: string]: any;
  };
  images?: any[];
  image?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const getStationeryImageUrl = (item: any): string | null => {
  if (!item) return null;
  const rawImages =
    item.images || item.image || item.imageUrl || item.stationeryImages;
  if (!rawImages) return null;

  let imgUrl: string | null = null;
  if (Array.isArray(rawImages)) {
    if (rawImages.length === 0) return null;
    const first = rawImages[0];
    if (typeof first === "string") imgUrl = first;
    else if (typeof first === "object" && first !== null) {
      imgUrl = first.url || first.imageUrl || first.image || null;
    }
  } else if (typeof rawImages === "string") {
    imgUrl = rawImages;
  } else if (typeof rawImages === "object") {
    imgUrl = (rawImages as any).url || (rawImages as any).imageUrl || null;
  }

  if (!imgUrl) return null;
  if (
    imgUrl.startsWith("http://") ||
    imgUrl.startsWith("https://") ||
    imgUrl.startsWith("data:") ||
    imgUrl.startsWith("blob:")
  ) {
    return imgUrl;
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  return `${baseUrl}${imgUrl.startsWith("/") ? "" : "/"}${imgUrl}`;
};

export const getAllStationeryImages = (item: any): string[] => {
  if (!item) return [];
  const list: string[] = [];
  const rawImages =
    item.images || item.stationeryImages || item.image || item.imageUrl;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const normalize = (url: string | null | undefined): string | null => {
    if (!url || typeof url !== "string") return null;
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:") ||
      url.startsWith("blob:")
    ) {
      return url;
    }
    return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  if (Array.isArray(rawImages)) {
    rawImages.forEach((img) => {
      let u: string | null = null;
      if (typeof img === "string") u = img;
      else if (typeof img === "object" && img !== null) {
        u = img.url || img.imageUrl || img.image || null;
      }
      if (u) {
        const full = normalize(u);
        if (full && !list.includes(full)) list.push(full);
      }
    });
  } else if (typeof rawImages === "string") {
    const full = normalize(rawImages);
    if (full) list.push(full);
  }

  // Also check separate image/imageUrl attributes
  if (item.imageUrl && typeof item.imageUrl === "string") {
    const full = normalize(item.imageUrl);
    if (full && !list.includes(full)) list.push(full);
  }
  if (item.image && typeof item.image === "string") {
    const full = normalize(item.image);
    if (full && !list.includes(full)) list.push(full);
  }

  return list;
};
