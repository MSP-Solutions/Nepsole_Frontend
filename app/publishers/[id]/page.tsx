"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
    MapPin,
    CalendarDays,
    BookOpen,
    Users,
    Globe,
    Mail,
    Phone,
    ArrowRight,
    ShoppingCart,
    Star,
} from "lucide-react";
import TopHeader from "@/components/topHeader";
import Header from "@/components/header";
import Footer from "@/components/footer";

const publisher = {
    name: "FinePrint Publications",
    logo: "/publishers/fineprint.png",
    cover: "/publishers/fineprint-cover.jpg",
    tagline: "Quality Books. Impactful Ideas.",
    established: 2012,
    location: "Kathmandu, Nepal",
    books: 248,
    authors: 32,
    booksSold: "1M+",
    years: "12+",
    description:
        "FinePrint Publications is one of Nepal's leading publishing houses committed to bringing quality books that inspire, educate and empower readers. From bestselling novels and biographies to self-help and children's books, our mission is to promote reading and knowledge in every home.",
    website: "www.fineprint.com.np",
    email: "info@fineprint.com.np",
    phone: "01-4567890",
    address: "Putalisadak, Kathmandu, Nepal",
};

const categories = [
    {
        name: "Self Help",
        books: 68,
        icon: "📖",
    },
    {
        name: "Biography",
        books: 42,
        icon: "👤",
    },
    {
        name: "Novels",
        books: 54,
        icon: "📚",
    },
    {
        name: "Children's Books",
        books: 36,
        icon: "🧸",
    },
    {
        name: "Business",
        books: 24,
        icon: "📊",
    },
];

const books = [
    {
        title: "The Power of Habit",
        author: "Charles Duhigg",
        image: "/books/habit.jpg",
        price: "Rs. 680",
        oldPrice: "Rs. 800",
        discount: "-15%",
        rating: 4.8,
        reviews: 1256,
    },
    {
        title: "सोच्ने बानी बदलौँ",
        author: "सञ्जय केसी",
        image: "/books/nepali-book.jpg",
        price: "Rs. 315",
        oldPrice: "Rs. 350",
        discount: "-10%",
        rating: 4.7,
        reviews: 982,
    },
    {
        title: "The 5 AM Club",
        author: "Robin Sharma",
        image: "/books/5am.jpg",
        price: "Rs. 650",
        oldPrice: "Rs. 740",
        discount: "-12%",
        rating: 4.8,
        reviews: 1105,
    },
    {
        title: "जीवनलाई सरल बनाउने कला",
        author: "अमित के. मल्ल",
        image: "/books/simple-life.jpg",
        price: "Rs. 280",
        oldPrice: "Rs. 340",
        discount: "-15%",
        rating: 4.6,
        reviews: 875,
    },
    {
        title: "Rich Dad Poor Dad",
        author: "Robert T. Kiyosaki",
        image: "/books/rich-dad.jpg",
        price: "Rs. 750",
        oldPrice: "Rs. 840",
        discount: "-10%",
        rating: 4.9,
        reviews: 2145,
    },
];

const authors = [
    {
        name: "Robin Sharma",
        books: 12,
        image: "/authors/robin-sharma.jpg",
    },
    {
        name: "Saurabh Subedi",
        books: 8,
        image: "/authors/saurabh.jpg",
    },
    {
        name: "Anil K. Mandal",
        books: 6,
        image: "/authors/anil.jpg",
    },
    {
        name: "Bijay Kumar Sigdel",
        books: 5,
        image: "/authors/bijay.jpg",
    },
    {
        name: "Ramesh Nepal",
        books: 7,
        image: "/authors/ramesh.jpg",
    },
    {
        name: "Sachin Regmi",
        books: 9,
        image: "/authors/sachin.jpg",
    },
];

const page = () => {
    return (
        <div>
            <TopHeader />
            <Header />
            <div className="min-h-screen bg-[#f7f9fc]">
                {/* Breadcrumb */}
                <section className="border-b bg-white">
                    <div className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-4">
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                            <Link href="/" className="text-gray-500 hover:text-[#0b234f]">
                                Home
                            </Link>

                            <span className="text-gray-300">›</span>

                            <Link
                                href="/publishers"
                                className="text-gray-500 hover:text-[#0b234f]"
                            >
                                Publishers
                            </Link>

                            <span className="text-gray-300">›</span>

                            <span className="font-medium text-[#0b234f]">
                                {publisher.name}
                            </span>
                        </div>
                    </div>
                </section>

                <main className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-6 space-y-6">
                    {/* Publisher Hero + About */}
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[2fr_0.9fr]">
                        {/* Hero */}
                        <div className="relative min-h-[360px] overflow-hidden rounded-xl bg-[#071d46]">
                            {/* Background image */}
                            <div className="absolute inset-0">
                                <Image
                                    src={publisher.cover}
                                    alt=""
                                    fill
                                    className="object-cover opacity-35"
                                />

                                <div className="absolute inset-0 bg-[#071d46]/80" />
                            </div>

                            <div className="relative flex h-full flex-col justify-between p-7 sm:p-9">
                                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                                    {/* Logo */}
                                    <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                                        <Image
                                            src={publisher.logo}
                                            alt={publisher.name}
                                            width={128}
                                            height={128}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>

                                    <div>
                                        <h1 className="text-3xl font-bold text-white sm:text-4xl">
                                            {publisher.name}
                                        </h1>

                                        <p className="mt-2 text-lg text-blue-100">
                                            {publisher.tagline}
                                        </p>

                                        <div className="mt-5 flex flex-col gap-2 text-sm text-blue-100 sm:flex-row sm:gap-6">
                                            <span className="flex items-center gap-2">
                                                <CalendarDays size={16} />
                                                Established: {publisher.established}
                                            </span>

                                            <span className="flex items-center gap-2">
                                                <MapPin size={16} />
                                                {publisher.location}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div>
                                        <BookOpen className="mb-2 text-[#e8ac19]" size={22} />

                                        <p className="text-2xl font-bold text-white">
                                            {publisher.books}
                                        </p>

                                        <p className="text-xs text-blue-100">
                                            Books Published
                                        </p>
                                    </div>

                                    <div>
                                        <Users className="mb-2 text-[#e8ac19]" size={22} />

                                        <p className="text-2xl font-bold text-white">
                                            {publisher.authors}
                                        </p>

                                        <p className="text-xs text-blue-100">
                                            Active Authors
                                        </p>
                                    </div>

                                    <div>
                                        <ShoppingCart
                                            className="mb-2 text-[#e8ac19]"
                                            size={22}
                                        />

                                        <p className="text-2xl font-bold text-white">
                                            {publisher.booksSold}
                                        </p>

                                        <p className="text-xs text-blue-100">
                                            Books Sold
                                        </p>
                                    </div>

                                    <div>
                                        <CalendarDays
                                            className="mb-2 text-[#e8ac19]"
                                            size={22}
                                        />

                                        <p className="text-2xl font-bold text-white">
                                            {publisher.years}
                                        </p>

                                        <p className="text-xs text-blue-100">
                                            Years Publishing
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        <div className="rounded-xl border border-gray-200 bg-white p-6">
                            <h2 className="text-lg font-bold text-[#0b234f]">
                                About {publisher.name}
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-gray-600">
                                {publisher.description}
                            </p>

                            <div className="mt-5 space-y-3 border-t pt-5">
                                <div className="flex items-start gap-3 text-sm">
                                    <Globe
                                        size={17}
                                        className="mt-0.5 shrink-0 text-[#0b234f]"
                                    />

                                    <div>
                                        <p className="font-semibold text-gray-700">
                                            Website
                                        </p>
                                        <p className="text-gray-500">
                                            {publisher.website}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-sm">
                                    <Mail
                                        size={17}
                                        className="mt-0.5 shrink-0 text-[#0b234f]"
                                    />

                                    <div>
                                        <p className="font-semibold text-gray-700">
                                            Email
                                        </p>
                                        <p className="text-gray-500">
                                            {publisher.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-sm">
                                    <Phone
                                        size={17}
                                        className="mt-0.5 shrink-0 text-[#0b234f]"
                                    />

                                    <div>
                                        <p className="font-semibold text-gray-700">
                                            Phone
                                        </p>
                                        <p className="text-gray-500">
                                            {publisher.phone}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 text-sm">
                                    <MapPin
                                        size={17}
                                        className="mt-0.5 shrink-0 text-[#0b234f]"
                                    />

                                    <div>
                                        <p className="font-semibold text-gray-700">
                                            Address
                                        </p>
                                        <p className="text-gray-500">
                                            {publisher.address}
                                        </p>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* Categories */}
                    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#0b234f]">
                                Top Categories by {publisher.name.replace(
                                    " Publications",
                                    ""
                                )}
                            </h2>

                            <Link
                                href="#"
                                className="flex items-center gap-1 text-sm font-semibold text-[#0b234f] hover:underline"
                            >
                                View All Categories
                                <ArrowRight size={15} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                            {categories.map((category) => (
                                <div
                                    key={category.name}
                                    className="rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:border-[#0b234f]/20 hover:bg-blue-50"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                                        {category.icon}
                                    </div>

                                    <h3 className="mt-3 text-sm font-semibold text-gray-800">
                                        {category.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {category.books} Books
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Books */}
                    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-[#0b234f]">
                                    Books by {publisher.name}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    {publisher.books} Books Found
                                </p>
                            </div>

                            <select className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 outline-none">
                                <option>Newest First</option>
                                <option>Best Selling</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                            {books.map((book) => (
                                <div key={book.title} className="group">
                                    {/* Book */}
                                    <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                                        <span className="absolute left-2 top-2 z-10 rounded bg-red-500 px-2 py-1 text-[10px] font-bold text-white">
                                            {book.discount}
                                        </span>

                                        <Image
                                            src={book.image}
                                            alt={book.title}
                                            fill
                                            className="object-cover transition duration-300 group-hover:scale-105"
                                        />
                                    </div>

                                    <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-gray-800">
                                        {book.title}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {book.author}
                                    </p>

                                    <div className="mt-2 flex items-center gap-1">
                                        <Star
                                            size={13}
                                            fill="currentColor"
                                            className="text-yellow-500"
                                        />

                                        <span className="text-xs font-medium text-gray-600">
                                            {book.rating}
                                        </span>

                                        <span className="text-[11px] text-gray-400">
                                            ({book.reviews})
                                        </span>
                                    </div>

                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-sm font-bold text-red-600">
                                            {book.price}
                                        </span>

                                        <span className="text-xs text-gray-400 line-through">
                                            {book.oldPrice}
                                        </span>
                                    </div>

                                    <button className="mt-3 flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#0b234f] text-xs font-semibold text-[#0b234f] transition hover:bg-[#0b234f] hover:text-white">
                                        <ShoppingCart size={14} />
                                        Add to Cart
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 flex justify-center">
                            <Link
                                href="#"
                                className="flex items-center gap-2 rounded-lg bg-[#0b234f] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#132f65]"
                            >
                                View All Books
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </section>

                    {/* Authors */}
                    <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-[#0b234f]">
                                Featured Authors from {publisher.name}
                            </h2>

                            <Link
                                href="#"
                                className="flex items-center gap-1 text-sm font-semibold text-[#0b234f]"
                            >
                                View All Authors
                                <ArrowRight size={15} />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-6">
                            {authors.map((author) => (
                                <Link
                                    href="#"
                                    key={author.name}
                                    className="text-center"
                                >
                                    <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border-4 border-gray-100 bg-gray-100 transition group-hover:border-[#0b234f]/20">
                                        <Image
                                            src={author.image}
                                            alt={author.name}
                                            width={80}
                                            height={80}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <h3 className="mt-3 text-sm font-semibold text-gray-800">
                                        {author.name}
                                    </h3>

                                    <p className="mt-1 text-xs text-gray-500">
                                        {author.books} Books
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>

                    {/* Benefits */}
                    <section className="mt-6 rounded-xl border border-gray-200 bg-white">
                        <div className="grid grid-cols-2 divide-x divide-y md:grid-cols-5 md:divide-y-0">
                            {[
                                ["✓", "100% Original Books", "Genuine & Authentic"],
                                ["🚚", "Fast Delivery", "Across Nepal"],
                                ["↩", "Easy Returns", "7 Days Return Policy"],
                                ["▣", "Secure Payment", "100% Safe & Secure"],
                                ["$", "Best Price Guarantee", "Unbeatable Prices"],
                            ].map(([icon, title, subtitle]) => (
                                <div
                                    key={title}
                                    className="flex items-center gap-3 p-5"
                                >
                                    <div className="text-xl text-[#0b234f]">
                                        {icon}
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-[#0b234f]">
                                            {title}
                                        </p>

                                        <p className="mt-1 text-[11px] text-gray-500">
                                            {subtitle}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default page;