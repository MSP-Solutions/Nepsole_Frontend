export interface BookImage {
  id?: number | string;
  url?: string;
  imageUrl?: string;
  imageType?: string;
  type?: string;
  [key: string]: any;
}

export interface BookAuthor {
  id: number | string;
  name?: string;
  englishName?: string;
  nepaliName?: string;
  imageUrl?: string;
  author?: {
    id?: number | string;
    name?: string;
    englishName?: string;
    nepaliName?: string;
  };
  [key: string]: any;
}

export type Author = BookAuthor;

export interface BookGenre {
  id: number | string;
  name?: string;
  englishName?: string;
  nepaliName?: string;
  icon?: string;
  genre?: {
    id?: number | string;
    name?: string;
  };
  [key: string]: any;
}

export type Genre = BookGenre;

export interface BookPublisher {
  id: number | string;
  name?: string;
  englishName?: string;
  publicationLogoUrl?: string;
  [key: string]: any;
}

export type Publisher = BookPublisher;

export interface BookLanguage {
  id: number | string;
  name?: string;
  code?: string;
  language?: {
    id: number | string;
    name?: string;
    code?: string;
  };
  [key: string]: any;
}

export type Language = BookLanguage;

export interface BookItem {
  id: number | string;
  title: string;
  nepaliTitle?: string;
  englishTitle?: string;
  price: number | string;
  discountPercent?: number | string;
  stock?: number;
  soldCount?: number;
  rating?: number;
  reviews?: number;
  publicationDate?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number | string;
  description?: string;
  widthCm?: number | string;
  heightCm?: number | string;
  depthCm?: number | string;
  publisherId?: number | string;
  publisher?: BookPublisher;
  authors?: BookAuthor[];
  authorBooks?: BookAuthor[];
  authorIds?: (number | string)[];
  genres?: BookGenre[];
  genreBooks?: BookGenre[];
  genreIds?: (number | string)[];
  languages?: BookLanguage[] | any[];
  languageBooks?: BookLanguage[] | any[];
  languageIds?: (number | string)[];
  formats?: any[];
  bookFormats?: any[];
  images?: BookImage[];
  bookImages?: BookImage[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
