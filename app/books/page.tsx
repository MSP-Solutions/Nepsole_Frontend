'use client'
import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import TopHeader from '@/components/topHeader'
import Header from '@/components/header'
import Footer from '@/components/footer'

// 📚 Sample Book Data
const allBooks = [
    {
        id: 'atomic-habits',
        title: 'Atomic Habits',
        subtitle: 'Tiny Changes, Remarkable Results',
        author: 'James Clear',
        category: 'Self Help',
        publisher: 'Avery',
        price: 855,
        originalPrice: 1250,
        discount: '-32%',
        rating: 4.8,
        reviewsCount: 2145,
        image: '/images/books/atomic-habits.jpg',
        inStock: true,
    },
    {
        id: 'psychology-of-money',
        title: 'The Psychology of Money',
        subtitle: 'Timeless lessons on wealth, greed, and happiness',
        author: 'Morgan Housel',
        category: 'Finance & Business',
        publisher: 'Harriman House',
        price: 765,
        originalPrice: 900,
        discount: '-15%',
        rating: 4.7,
        reviewsCount: 1876,
        image: '/images/books/psychology-of-money.jpg',
        inStock: true,
    },
    {
        id: 'the-power-of-habit',
        title: 'The Power of Habit',
        subtitle: 'Why We Do What We Do in Life and Business',
        author: 'Charles Duhigg',
        category: 'Self Help',
        publisher: 'Random House',
        price: 680,
        originalPrice: 800,
        discount: '-15%',
        rating: 4.6,
        reviewsCount: 1542,
        image: '/images/books/power-of-habit.jpg',
        inStock: true,
    },
    {
        id: 'how-to-win-friends',
        title: 'How to Win Friends and Influence People',
        subtitle: 'The only book you need to lead you to success',
        author: 'Dale Carnegie',
        category: 'Self Help',
        publisher: 'Simon & Schuster',
        price: 585,
        originalPrice: 650,
        discount: '-10%',
        rating: 4.8,
        reviewsCount: 1234,
        image: '/images/books/how-to-win-friends.jpg',
        inStock: true,
    },
    {
        id: 'thinking-fast-and-slow',
        title: 'Thinking, Fast and Slow',
        subtitle: 'The groundbreaking international bestseller',
        author: 'Daniel Kahneman',
        category: 'Psychology',
        publisher: 'Farrar, Straus and Giroux',
        price: 810,
        originalPrice: 900,
        discount: '-10%',
        rating: 4.7,
        reviewsCount: 2001,
        image: '/images/books/thinking-fast-slow.jpg',
        inStock: true,
    },
    {
        id: 'the-subtle-art',
        title: 'The Subtle Art of Not Giving a F*ck',
        subtitle: 'A Counterintuitive Approach to Living a Good Life',
        author: 'Mark Manson',
        category: 'Self Help',
        publisher: 'HarperOne',
        price: 510,
        originalPrice: 600,
        discount: '-15%',
        rating: 4.6,
        reviewsCount: 1876,
        image: '/images/books/subtle-art.jpg',
        inStock: true,
    },
    {
        id: 'make-your-bed',
        title: 'Make Your Bed',
        subtitle: 'Little things that can change your life',
        author: 'William H. McRaven',
        category: 'Self Help',
        publisher: 'Grand Central Publishing',
        price: 495,
        originalPrice: 550,
        discount: '-10%',
        rating: 4.8,
        reviewsCount: 956,
        image: '/images/books/make-your-bed.jpg',
        inStock: true,
    },
    {
        id: 'the-5-am-club',
        title: 'The 5 AM Club',
        subtitle: 'Own Your Morning. Elevate Your Life.',
        author: 'Robin Sharma',
        category: 'Self Help',
        publisher: 'HarperCollins',
        price: 650,
        originalPrice: 740,
        discount: '-12%',
        rating: 4.9,
        reviewsCount: 1105,
        image: '/images/books/5am-club.jpg',
        inStock: true,
    },
]

const categories = [
    'All Categories',
    'Self Help',
    'Finance & Business',
    'Psychology',
    'Biography & Memoir',
    'Novels & Fiction',
    'Nepali Literature',
]

const publishers = [
    'All Publishers',
    'Avery',
    'HarperCollins',
    'Random House',
    'Simon & Schuster',
    'FinePrint Publications',
]

const BooksPage = () => {
    const [selectedCategory, setSelectedCategory] = useState('All Categories')
    const [selectedPublisher, setSelectedPublisher] = useState('All Publishers')
    const [sortBy, setSortBy] = useState('Featured')
    const [searchQuery, setSearchQuery] = useState('')
    const [showMobileFilter, setShowMobileFilter] = useState(false)

    // 🔍 Filter logic
    const filteredBooks = allBooks.filter((book) => {
        const matchesCategory =
            selectedCategory === 'All Categories' || book.category === selectedCategory
        const matchesPublisher =
            selectedPublisher === 'All Publishers' || book.publisher === selectedPublisher
        const matchesSearch =
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesCategory && matchesPublisher && matchesSearch
    })

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            <TopHeader />
            <Header />

            <main className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-4 md:px-6 py-6">
                {/* 🧭 Breadcrumb & Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
                    <div>
                        <nav className="text-xs text-slate-400 flex items-center gap-2 mb-2">
                            <Link href="/" className="hover:text-primary transition-colors">
                                Home
                            </Link>
                            <span>/</span>
                            <span className="text-slate-700 font-medium">Books</span>
                        </nav>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                            Explore Books 📚
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            Showing {filteredBooks.length} books found
                        </p>
                    </div>

                    {/* 🔍 Search and Mobile Filter Toggle */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 sm:w-64">
                            <input
                                type="text"
                                placeholder="Search by title or author..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                            />
                            <span className="absolute right-2.5 top-2 text-slate-400 text-xs">
                                🔍
                            </span>
                        </div>

                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowMobileFilter(!showMobileFilter)}
                            className="lg:hidden px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg flex items-center gap-1.5 shadow-sm"
                        >
                            <span>⚡</span> Filters
                        </button>
                    </div>
                </div>

                {/* 📄 Main Content: Sidebar + Books Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start mt-6">
                    {/* 🎛️ Left Column: Filters Sidebar */}
                    <aside
                        className={`${showMobileFilter ? 'block' : 'hidden'
                            } lg:block lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6`}
                    >
                        {/* Category Filter */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                                Categories
                            </h3>
                            <div className="space-y-1.5">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${selectedCategory === cat
                                            ? 'bg-amber-50 text-amber-700 font-semibold border-l-2 border-amber-500'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Publisher Filter */}
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                                Publisher
                            </h3>
                            <div className="space-y-1.5">
                                {publishers.map((pub) => (
                                    <button
                                        key={pub}
                                        onClick={() => setSelectedPublisher(pub)}
                                        className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors ${selectedPublisher === pub
                                            ? 'bg-amber-50 text-amber-700 font-semibold border-l-2 border-amber-500'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        {pub}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        {/* Reset Button */}
                        <button
                            onClick={() => {
                                setSelectedCategory('All Categories')
                                setSelectedPublisher('All Publishers')
                                setSearchQuery('')
                            }}
                            className="w-full py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                            Reset All Filters
                        </button>
                    </aside>

                    {/* 📖 Right Column: Catalog Grid & Sorting */}
                    <section className="lg:col-span-3 space-y-6">
                        {/* Top Toolbar */}
                        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm text-xs">
                            <span className="text-slate-500">
                                Showing{' '}
                                <strong className="text-slate-800">{filteredBooks.length}</strong>{' '}
                                results
                            </span>

                            <div className="flex items-center gap-2">
                                <span className="text-slate-500">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-slate-50 border border-slate-300 rounded-md px-2.5 py-1 text-slate-700 font-medium focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                >
                                    <option>Featured</option>
                                    <option>Price: Low to High</option>
                                    <option>Price: High to Low</option>
                                    <option>Highest Rated</option>
                                    <option>Newest Arrivals</option>
                                </select>
                            </div>
                        </div>

                        {/* Books Grid */}
                        {filteredBooks.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredBooks.map((book) => (
                                    <div
                                        key={book.id}
                                        className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col justify-between relative group hover:shadow-lg hover:border-amber-400 transition-all duration-200"
                                    >
                                        {/* Discount Badge */}
                                        <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md z-10 shadow-sm">
                                            {book.discount}
                                        </span>

                                        <div>
                                            {/* Clickable Image Container */}
                                            <Link href={`/books/${book.id}`}>
                                                <div className="relative h-48 sm:h-56 w-full bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center mb-3 group-hover:scale-[1.02] transition-transform duration-300">
                                                    <span className="text-4xl">📖</span>
                                                </div>
                                            </Link>

                                            {/* Book Info */}
                                            <Link href={`/books/${book.id}`}>
                                                <h2
                                                    className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1"
                                                    title={book.title}
                                                >
                                                    {book.title}
                                                </h2>
                                            </Link>

                                            <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                {book.author}
                                            </p>

                                            {/* Star Rating */}
                                            <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500">
                                                <span>★</span>
                                                <span className="font-semibold text-slate-800">
                                                    {book.rating}
                                                </span>
                                                <span className="text-slate-400 text-[10px]">
                                                    ({book.reviewsCount})
                                                </span>
                                            </div>

                                            {/* Pricing */}
                                            <div className="mt-2.5 flex items-baseline gap-2">
                                                <span className="text-sm font-bold text-red-600">
                                                    Rs. {book.price}
                                                </span>
                                                <span className="text-[11px] text-slate-400 line-through">
                                                    Rs. {book.originalPrice}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions: Add to Cart & Wishlist */}
                                        <div className="flex items-center gap-2 mt-4 pt-2 border-t border-slate-100">
                                            <button className="flex-1 bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-semibold py-2 rounded-lg transition-colors shadow-xs">
                                                Add to Cart
                                            </button>
                                            <button
                                                title="Add to Wishlist"
                                                className="p-2 border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-600 text-xs transition-colors"
                                            >
                                                ♡
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                                <p className="text-sm text-slate-500">
                                    No books found matching your selected filters.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedCategory('All Categories')
                                        setSelectedPublisher('All Publishers')
                                        setSearchQuery('')
                                    }}
                                    className="mt-3 text-xs text-amber-600 font-semibold hover:underline"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    )
}

export default BooksPage