"use client";

import AddBookDialog, { BookData } from "@/components/admin/AddBookDialog";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";

interface Book {
  id: string;
  title: string;
  isbn: string;
  author: string;
  publisher: string;
  category: string;
  price: string;
  stock: number;
  sales: number;
  status: "Active" | "Low Stock" | "Out of Stock";
  coverColor: string;
  coverAccent: string;
}

const initialBooks: Book[] = [
  {
    id: "1",
    title: "Atomic Habits",
    isbn: "978-0735211292",
    author: "James Clear",
    publisher: "Penguin Books",
    category: "Self Help",
    price: "Rs. 855",
    stock: 142,
    sales: 312,
    status: "Active",
    coverColor: "bg-[#0b1739]",
    coverAccent: "border-l-4 border-l-rose-500",
  },
  {
    id: "2",
    title: "अच्युत कृष्ण खरेल",
    isbn: "978-9937-0000-01-1",
    author: "Dr. Laxmanprasad Uprety",
    publisher: "Sajha Prakashan",
    category: "Biography",
    price: "Rs. 595",
    stock: 38,
    sales: 128,
    status: "Active",
    coverColor: "bg-[#0c193c]",
    coverAccent: "border-l-4 border-l-blue-500",
  },
  {
    id: "3",
    title: "The Psychology of Money",
    isbn: "978-0857197689",
    author: "Morgan Housel",
    publisher: "Penguin Books",
    category: "Finance",
    price: "Rs. 765",
    stock: 0,
    sales: 287,
    status: "Out of Stock",
    coverColor: "bg-[#0f172a]",
    coverAccent: "border-l-4 border-l-indigo-500",
  },
  {
    id: "4",
    title: "मालिका",
    isbn: "978-9937-0000-04-2",
    author: "Parag Sharma",
    publisher: "Fine Print",
    category: "Fiction",
    price: "Rs. 315",
    stock: 74,
    sales: 201,
    status: "Active",
    coverColor: "bg-[#d97706]",
    coverAccent: "border-l-4 border-l-amber-600",
  },
  {
    id: "5",
    title: "Rich Dad Poor Dad",
    isbn: "978-1612680194",
    author: "Robert Kiyosaki",
    publisher: "Penguin Books",
    category: "Finance",
    price: "Rs. 550",
    stock: 5,
    sales: 445,
    status: "Low Stock",
    coverColor: "bg-[#fef3c7]",
    coverAccent: "border-l-4 border-l-amber-400",
  },
  {
    id: "6",
    title: "मुनामदन",
    isbn: "978-9937-0000-08-6",
    author: "Laxmi Prasad Devkota",
    publisher: "Sajha Prakashan",
    category: "Poetry",
    price: "Rs. 180",
    stock: 220,
    sales: 832,
    status: "Active",
    coverColor: "bg-[#0284c7]",
    coverAccent: "border-l-4 border-l-sky-500",
  },
  {
    id: "7",
    title: "Think Like a Monk",
    isbn: "978-1982134488",
    author: "Jay Shetty",
    publisher: "HarperCollins",
    category: "Self Help",
    price: "Rs. 450",
    stock: 63,
    sales: 176,
    status: "Active",
    coverColor: "bg-[#0f172a]",
    coverAccent: "border-l-4 border-l-violet-500",
  },
  {
    id: "8",
    title: "Deep Work",
    isbn: "978-1455586691",
    author: "Cal Newport",
    publisher: "HarperCollins",
    category: "Productivity",
    price: "Rs. 620",
    stock: 3,
    sales: 98,
    status: "Low Stock",
    coverColor: "bg-[#0f172a]",
    coverAccent: "border-l-4 border-l-blue-600",
  },
  {
    id: "9",
    title: "7 बानीहरू",
    isbn: "978-0743269513",
    author: "Stephen R. Covey",
    publisher: "Penguin Books",
    category: "Self Help",
    price: "Rs. 675",
    stock: 48,
    sales: 156,
    status: "Active",
    coverColor: "bg-[#0b1739]",
    coverAccent: "border-l-4 border-l-indigo-600",
  },
  {
    id: "10",
    title: "तिमीलाई बिर्सेको छैन",
    isbn: "978-9937-0000-10-7",
    author: "Ishwor Poudel",
    publisher: "Fine Print",
    category: "Poetry",
    price: "Rs. 270",
    stock: 91,
    sales: 76,
    status: "Active",
    coverColor: "bg-[#d97706]",
    coverAccent: "border-l-4 border-l-amber-500",
  },
  {
    id: "11",
    title: "Palpasa Café",
    isbn: "978-9937-0000-11-4",
    author: "Narayan Wagle",
    publisher: "Fine Print",
    category: "Fiction",
    price: "Rs. 420",
    stock: 55,
    sales: 143,
    status: "Active",
    coverColor: "bg-[#fef3c7]",
    coverAccent: "border-l-4 border-l-amber-300",
  },
  {
    id: "12",
    title: "Sapiens",
    isbn: "978-0062316097",
    author: "Yuval Noah Harari",
    publisher: "HarperCollins",
    category: "History",
    price: "Rs. 890",
    stock: 27,
    sales: 521,
    status: "Active",
    coverColor: "bg-[#0284c7]",
    coverAccent: "border-l-4 border-l-sky-600",
  },
];

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredBooks = books.filter((book) => {
    const term = searchTerm.toLowerCase();
    return (
      book.title.toLowerCase().includes(term) ||
      book.author.toLowerCase().includes(term) ||
      book.publisher.toLowerCase().includes(term) ||
      book.isbn.includes(term)
    );
  });

  const handleAddBook = (bookData: BookData) => {
    const stockNum = Number(bookData.stock) || 0;
    let status: Book["status"] = "Active";
    if (stockNum === 0) status = "Out of Stock";
    else if (stockNum < 10) status = "Low Stock";

    const priceStr =
      typeof bookData.price === "number"
        ? `Rs. ${bookData.price}`
        : bookData.price?.startsWith("Rs.")
          ? bookData.price
          : `Rs. ${bookData.price || "0"}`;

    const newBook: Book = {
      id: String(books.length + 1),
      title: bookData.title,
      isbn: bookData.isbn13 || bookData.isbn10 || "978-0000000000",
      author: bookData.authors || "Unknown Author",
      publisher: bookData.publisherName || "Nepsole Publishing",
      category: bookData.genres || "General",
      price: priceStr,
      stock: stockNum,
      sales: Number(bookData.soldCount) || 0,
      status,
      coverColor: "bg-[#0b1739]",
      coverAccent: "border-l-4 border-l-indigo-500",
    };

    setBooks([newBook, ...books]);
  };

  const handleDeleteBook = (id: string) => {
    setBooks(books.filter((b) => b.id !== id));
  };

  return (
    <div className="-m-6 lg:-m-8 p-6 lg:p-8 bg-[#f4f6fa] min-h-screen space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Books
          </h1>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            {books.length} books in catalog
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer select-none"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100/80 shadow-sm space-y-5">
        {/* Search Bar & Results Count */}
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-100/80 border border-transparent text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-indigo-300 transition-all"
            />
          </div>
          <span className="text-xs text-gray-400 font-medium select-none">
            {filteredBooks.length} results
          </span>
        </div>

        {/* Books Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-medium text-gray-400 tracking-normal">
                <th className="py-3 px-4 font-normal">Title</th>
                <th className="py-3 px-4 font-normal">Author</th>
                <th className="py-3 px-4 font-normal">Publisher</th>
                <th className="py-3 px-4 font-normal">Cat</th>
                <th className="py-3 px-4 font-normal">Price</th>
                <th className="py-3 px-4 font-normal">Stock</th>
                <th className="py-3 px-4 font-normal">Sales</th>
                <th className="py-3 px-4 font-normal">Status</th>
                <th className="py-3 px-4 font-normal text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/80 text-xs">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-gray-50/60 transition-colors group"
                  >
                    {/* Title + Cover + ISBN */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-7 h-10 rounded-md shrink-0 shadow-xs ${book.coverColor} ${book.coverAccent}`}
                        />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {book.title}
                          </span>
                          <span className="text-[11px] text-gray-300 font-normal mt-0.5">
                            {book.isbn}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td className="py-3.5 px-4 text-gray-500 font-normal">
                      {book.author}
                    </td>

                    {/* Publisher */}
                    <td className="py-3.5 px-4 text-gray-400 font-normal">
                      {book.publisher}
                    </td>

                    {/* Category Pill */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-gray-100/90 text-gray-600 text-[11px] font-medium">
                        {book.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-gray-900">
                      {book.price}
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4 font-normal">
                      <span
                        className={
                          book.stock === 0
                            ? "text-red-500 font-semibold"
                            : book.stock < 10
                              ? "text-amber-500 font-semibold"
                              : "text-gray-500"
                        }
                      >
                        {book.stock}
                      </span>
                    </td>

                    {/* Sales */}
                    <td className="py-3.5 px-4 text-gray-400 font-normal">
                      {book.sales}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          book.status === "Active"
                            ? "bg-emerald-50 text-emerald-600"
                            : book.status === "Low Stock"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-rose-50 text-rose-500"
                        }`}
                      >
                        {book.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          className="p-1 text-gray-400 hover:text-indigo-600 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-1 text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-gray-400 text-xs"
                  >
                    No books found matching &quot;{searchTerm}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Book Dialog */}
      <AddBookDialog
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddBook={handleAddBook}
      />
    </div>
  );
}
