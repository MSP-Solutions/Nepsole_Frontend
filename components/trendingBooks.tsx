'use client'

import Image from 'next/image'
import { Heart, Star, ArrowRight } from 'lucide-react'

const books = [
    {
        title: 'अभ्युत्कृष्ण सूर्य',
        author: 'प्रज्ञा शर्मा',
        price: 315,
        oldPrice: 860,
        discount: '-10%',
        rating: 4,
        reviews: 128,
        image: '/books/book-1.jpg',
    },
    {
        title: 'अभ्युत्कृष्ण सूर्य',
        author: 'प्रज्ञा शर्मा',
        price: 315,
        oldPrice: 860,
        discount: '-10%',
        rating: 4,
        reviews: 128,
        image: '/books/book-1.jpg',
    },
    {
        title: 'अभ्युत्कृष्ण सूर्य',
        author: 'प्रज्ञा शर्मा',
        price: 315,
        oldPrice: 860,
        discount: '-10%',
        rating: 4,
        reviews: 128,
        image: '/books/book-1.jpg',
    },
    {
        title: 'अभ्युत्कृष्ण सूर्य',
        author: 'प्रज्ञा शर्मा',
        price: 315,
        oldPrice: 860,
        discount: '-10%',
        rating: 4,
        reviews: 128,
        image: '/books/book-1.jpg',
    },
    {
        title: 'अभ्युत्कृष्ण सूर्य',
        author: 'प्रज्ञा शर्मा',
        price: 315,
        oldPrice: 860,
        discount: '-10%',
        rating: 4,
        reviews: 128,
        image: '/books/book-1.jpg',
    },
    {
        title: 'अभ्युत्कृष्ण सूर्य',
        author: 'प्रज्ञा शर्मा',
        price: 315,
        oldPrice: 860,
        discount: '-10%',
        rating: 4,
        reviews: 128,
        image: '/books/book-1.jpg',
    },
]

const TrendingBooks = () => {
    return (
        <section className="w-full bg-white py-6">
            <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <span className="text-xl">🔥</span>
                        Trending Books
                    </h2>

                    <button className="flex items-center gap-1 text-xs font-medium text-indigo-500 transition hover:text-indigo-700">
                        View All
                        <ArrowRight size={13} />
                    </button>
                </div>

                {/* Books */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {books.map((book, index) => (
                        <div
                            key={index}
                            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            {/* Discount */}
                            <div className="absolute left-0 top-2 z-10 bg-red-500 px-2 py-1 text-[11px] font-medium text-white">
                                {book.discount}
                            </div>

                            {/* Book Image */}
                            <div className="flex h-[155px] items-center justify-center overflow-hidden bg-gray-50 p-2 sm:h-[165px]">
                                <Image
                                    src={book.image}
                                    alt={book.title}
                                    width={130}
                                    height={155}
                                    className="h-full w-auto object-contain transition duration-300 group-hover:scale-105"
                                />
                            </div>

                            {/* Details */}
                            <div className="border-t border-gray-100 px-2.5 py-2.5">

                                {/* Title */}
                                <h3 className="truncate text-sm font-semibold text-gray-800">
                                    {book.title}
                                </h3>

                                {/* Author */}
                                <p className="mt-0.5 truncate text-[11px] text-gray-400">
                                    {book.author}
                                </p>

                                {/* Rating */}
                                <div className="mt-1 flex items-center gap-1">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                size={10}
                                                className={
                                                    star <= book.rating
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-gray-300'
                                                }
                                            />
                                        ))}
                                    </div>

                                    <span className="text-[10px] text-gray-400">
                                        ({book.reviews})
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="mt-1 flex items-center gap-1.5">
                                    <span className="text-xs font-semibold text-red-500">
                                        Rs. {book.price}
                                    </span>

                                    <span className="text-[10px] text-gray-400 line-through">
                                        Rs. {book.oldPrice}
                                    </span>
                                </div>

                                {/* Bottom Actions */}
                                <div className="mt-2 flex items-center gap-2">
                                    <button className="h-7 flex-1 rounded-full border border-indigo-500 text-[10px] font-medium text-indigo-500 transition hover:bg-indigo-500 hover:text-white">
                                        Add to Cart
                                    </button>

                                    <button
                                        aria-label="Add to wishlist"
                                        className="flex h-7 w-7 shrink-0 items-center justify-center text-gray-600 transition hover:text-red-500"
                                    >
                                        <Heart size={14} />
                                    </button>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    )
}

export default TrendingBooks