export interface BookImage {
  id?: number;
  url: string;
  type?: string;
  imageType?: string;
  imageUrl?: string;
}

export interface Author {
  id?: number;
  name?: string;
  imageUrl?: string;
  englishName?: string;
  nepaliName?: string;
  author?: {
    id?: number;
    name?: string;
    englishName?: string;
  };
}

export interface Genre {
  id?: number;
  name?: string;
  englishName?: string;
  nepaliName?: string;
  icon?: string;
  genre?: {
    id?: number;
    name?: string;
  };
}

export interface Publisher {
  id?: number;
  name?: string;
  publicationLogoUrl?: string;
}

export interface BookItem {
  id: number | string;
  title: string;
  nepaliTitle?: string;
  englishTitle?: string;
  price: number | string;
  discountPercent?: number;
  stock?: number;
  rating?: number;
  reviews?: number;
  description?: string;
  isbn10?: string;
  isbn13?: string;
  pages?: number;
  publicationDate?: string;
  publisherId?: number;
  publisher?: Publisher;
  images?: BookImage[];
  bookImages?: BookImage[];
  authors?: Author[];
  authorBooks?: Author[];
  genres?: Genre[];
  genreBooks?: Genre[];
  languages?: any[];
  languageBooks?: any[];
  formats?: any[];
  bookFormats?: any[];
}
