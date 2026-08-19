'use client'

import React, { useState } from 'react'
import Header from '@/components/header'
import TopHeader from '@/components/topHeader'
import Footer from '@/components/footer'
import {
    Star,
    Heart,
    Share2,
    GitCompare,
    ShieldCheck,
    Truck,
    RotateCcw,
    Package,
    Award,
    ChevronRight,
    Eye,
    BookOpen,
    Plus,
    Minus,
    Check,
    ExternalLink,
    Info
} from 'lucide-react'

export default function BookDetailPage() {
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('Description')

    const thumbnails = [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80'
    ]

    const affiliateStores = [
        { name: 'Amazon', price: 'Rs. 1,120', logo: 'amazon' },
        { name: 'Barnes & Noble', price: 'Rs. 1,180', logo: 'barnes' },
        { name: 'Book Depository', price: 'Rs. 1,050', logo: 'bookdepo' },
        { name: 'ThriftBooks', price: 'Rs. 980', logo: 'thrift' },
        { name: 'Walmart', price: 'Rs. 1,150', logo: 'walmart' },
        { name: 'Indigo', price: 'Rs. 1,200', logo: 'indigo' }
    ]

    const featureBadges = [
        { icon: ShieldCheck, title: '100% Original Books', sub: 'Genuine & Authentic' },
        { icon: Truck, title: 'Fast Delivery in Nepal', sub: '2-4 business days' },
        { icon: RotateCcw, title: '7 Days Easy Return', sub: 'No Questions Asked' },
        { icon: Package, title: 'Secure Packaging', sub: 'Safe & Tamper Proof' },
        { icon: Award, title: 'Best Price Guarantee', sub: 'Unbeatable Prices' }
    ]

    const recommendedBooks = [
        { title: 'The Psychology of Money', author: 'Morgan Housel', price: 'Rs. 765', oldPrice: 'Rs. 850', discount: '-10%', rating: 4.7, reviews: '1,876', image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?auto=format&fit=crop&w=400&q=80' },
        { title: 'The Power of Habit', author: 'Charles Duhigg', price: 'Rs. 680', oldPrice: 'Rs. 800', discount: '-15%', rating: 4.6, reviews: '1,542', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80' },
        { title: 'How to Win Friends & Influence People', author: 'Dale Carnegie', price: 'Rs. 585', oldPrice: 'Rs. 650', discount: '-10%', rating: 4.8, reviews: '3,234', image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=400&q=80' },
        { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', price: 'Rs. 810', oldPrice: 'Rs. 900', discount: '-10%', rating: 4.7, reviews: '2,001', image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=400&q=80' },
        { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', price: 'Rs. 510', oldPrice: 'Rs. 600', discount: '-15%', rating: 4.6, reviews: '1,876', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80' },
        { title: 'Make Your Bed', author: 'Admiral William H. McRaven', price: 'Rs. 495', oldPrice: 'Rs. 550', discount: '-10%', rating: 4.8, reviews: '556', image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=400&q=80' }
    ]

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 text-sm">
            <TopHeader />
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-4 space-y-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs text-slate-500">
                    <a href="#" className="hover:text-blue-600">Home</a>
                    <ChevronRight className="w-3 h-3" />
                    <a href="#" className="hover:text-blue-600">Books</a>
                    <ChevronRight className="w-3 h-3" />
                    <a href="#" className="hover:text-blue-600">Self Help</a>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-800 font-medium">Atomic Habits</span>
                </nav>

                {/* Top Product Hero */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    {/* Left: Gallery */}
                    <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4">
                        <div className="flex sm:flex-col gap-2 order-2 sm:order-1">
                            {thumbnails.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-14 h-18 rounded border-2 overflow-hidden transition-all ${selectedImage === idx ? 'border-amber-500' : 'border-slate-200 opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 order-1 sm:order-2 flex flex-col items-center">
                            <div className="relative w-full max-w-[340px] aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-amber-50/20 p-2">
                                <img
                                    src={thumbnails[selectedImage]}
                                    alt="Atomic Habits"
                                    className="w-full h-full object-contain rounded"
                                />
                            </div>

                            <div className="flex items-center justify-center gap-3 mt-4 w-full">
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700">
                                    <Eye className="w-3.5 h-3.5" /> Quick Preview
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-700">
                                    <BookOpen className="w-3.5 h-3.5" /> Sample Pages
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="lg:col-span-4 space-y-4">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Atomic Habits</h1>
                            <p className="text-xs text-slate-500 mt-0.5">Tiny Changes, Remarkable Results</p>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                            <span>By <a href="#" className="text-blue-600 font-medium hover:underline">James Clear</a></span>
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium text-[11px]">Author</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <span className="font-semibold text-xs text-slate-800">4.8</span>
                            <span className="text-xs text-slate-500">(2,145 Reviews)</span>
                        </div>

                        <div>
                            <span className="inline-block bg-amber-100 text-amber-800 text-[11px] font-semibold px-2 py-0.5 rounded">
                                #1 Best Seller <span className="font-normal text-amber-700">in Self Help</span>
                            </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            The international bestseller that has helped millions of people build good habits and break bad ones. Learn how tiny changes can lead to remarkable results.
                            <button className="text-blue-600 font-medium ml-1 hover:underline">Read More ▾</button>
                        </p>

                        <div className="grid grid-cols-2 gap-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                            <span className="text-slate-400">Publisher:</span>
                            <span className="font-medium text-slate-800">Avery</span>
                            <span className="text-slate-400">Publication Date:</span>
                            <span className="font-medium text-slate-800">October 16, 2018</span>
                            <span className="text-slate-400">Language:</span>
                            <span className="font-medium text-slate-800">English</span>
                            <span className="text-slate-400">Paperback:</span>
                            <span className="font-medium text-slate-800">320 pages</span>
                            <span className="text-slate-400">ISBN-10:</span>
                            <span className="font-medium text-slate-800">0735211299</span>
                            <span className="text-slate-400">ISBN-13:</span>
                            <span className="font-medium text-slate-800">978-0735211292</span>
                            <span className="text-slate-400">Dimensions:</span>
                            <span className="font-medium text-slate-800">13.97 x 2.03 x 21.08 cm</span>
                            <span className="text-slate-400">Weight:</span>
                            <span className="font-medium text-slate-800">0.35 kg</span>
                        </div>

                        <div className="flex items-center gap-4 pt-3 text-xs text-slate-600 border-t border-slate-100">
                            <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                                <Heart className="w-3.5 h-3.5" /> Add to Wishlist
                            </button>
                            <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                <GitCompare className="w-3.5 h-3.5" /> Compare
                            </button>
                            <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                                <Share2 className="w-3.5 h-3.5" /> Share
                            </button>
                        </div>
                    </div>

                    {/* Right: Pricing, Actions & Sellers */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                            <div className="text-xs text-slate-500 font-medium">Hardcover</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-red-600">Rs. 855</span>
                                <span className="text-xs text-slate-400 line-through">Rs. 1,250</span>
                            </div>
                            <p className="text-[11px] text-green-700 font-medium">You Save: Rs. 395 (32%)</p>

                            <div className="text-xs flex items-center gap-2 text-slate-600">
                                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> In Stock
                                </span>
                                <span>• Ships from Nepal</span>
                            </div>

                            {/* Quantity Stepper */}
                            <div className="flex items-center border border-slate-300 rounded w-fit text-xs">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-2.5 py-1 hover:bg-slate-100"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-3 font-semibold">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-2.5 py-1 hover:bg-slate-100"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>

                            <div className="space-y-2 pt-1">
                                <button className="w-full py-2 bg-amber-400 hover:bg-amber-500 font-semibold text-slate-900 rounded-md transition-colors text-xs">
                                    🛒 Add to Cart
                                </button>
                                <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 font-semibold text-white rounded-md transition-colors text-xs">
                                    Buy Now
                                </button>
                            </div>

                            <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1 pt-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Secure Payment | 7 Days Easy Return
                            </p>
                        </div>

                        {/* Other Sellers */}
                        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-800">Other Sellers <span className="font-normal text-slate-500">(Nepal)</span></span>
                                <a href="#" className="text-blue-600 hover:underline text-[11px]">View all (4)</a>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                {[
                                    { name: 'Book Paradise', rating: '4.7', price: 'Rs. 860' },
                                    { name: 'Readers Hub', rating: '4.6', price: 'Rs. 875' },
                                    { name: 'Nepal Books Store', rating: '4.5', price: 'Rs. 880' }
                                ].map((seller, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                                        <div>
                                            <p className="font-medium text-slate-800">{seller.name}</p>
                                            <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                                <Star className="w-3 h-3 text-amber-400 fill-current" />
                                                <span>{seller.rating}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-red-600">{seller.price}</p>
                                            <button className="text-[10px] text-blue-600 hover:underline border border-blue-200 px-2 py-0.5 rounded mt-0.5">
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Affiliate Banner */}
                        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs space-y-2">
                            <div className="flex items-center gap-1.5 font-semibold text-blue-900">
                                <span>Earn with Affiliate</span>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-tight">
                                Promote this book & earn commission on every sale.
                            </p>
                            <button className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline">
                                Get Affiliate Link <ExternalLink className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Worldwide Stores */}
                <section className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                            <span>🌎 Buy from Worldwide</span>
                            <span className="text-slate-400 font-normal">(Affiliate Links)</span>
                        </div>
                        <a href="#" className="text-slate-400 hover:text-slate-600 flex items-center gap-1 text-[11px]">
                            Why Affiliate Links? <Info className="w-3 h-3" />
                        </a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {affiliateStores.map((store, idx) => (
                            <div key={idx} className="p-3 rounded-lg border border-slate-200 text-center hover:border-slate-300 transition-colors flex flex-col justify-between items-center space-y-2">
                                <span className="font-bold text-slate-800 text-xs tracking-tight">{store.name}</span>
                                <span className="font-semibold text-slate-900 text-xs">{store.price}</span>
                                <button className="w-full py-1 text-[11px] bg-slate-50 hover:bg-blue-50 text-blue-600 font-medium rounded border border-slate-200">
                                    Buy on {store.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Feature Badges */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 px-6 bg-white rounded-xl border border-slate-200">
                    {featureBadges.map((badge, idx) => {
                        const Icon = badge.icon
                        return (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-xs text-slate-800">{badge.title}</h4>
                                    <p className="text-[11px] text-slate-500">{badge.sub}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Description Tabs & Frequently Bought Together */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Tabbed Description */}
                    <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 space-y-6">
                        <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold text-slate-600 overflow-x-auto">
                            {['Description', 'Product Details', 'Reviews (2,145)', 'Q&A', 'Shipping & Returns'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent hover:text-slate-900'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
                            <p>
                                No matter your goals, Atomic Habits offers a proven framework for getting 1% better every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.
                            </p>
                            <ul className="space-y-2 pt-2">
                                {[
                                    'Build better habits and break bad ones',
                                    'Make small changes that deliver big results',
                                    'Practical strategies backed by science',
                                    'A step-by-step system that works',
                                    'For everyone who wants to improve'
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                        <Check className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right: Frequently Bought Together */}
                    <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                        <h3 className="font-bold text-xs text-slate-900">Frequently Bought Together</h3>
                        <div className="flex items-center justify-between gap-1">
                            {[
                                { title: 'The 5 AM Club', price: 'Rs. 650', img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=200&q=80' },
                                { title: 'Deep Work', price: 'Rs. 720', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=200&q=80' },
                                { title: 'The Power of Habit', price: 'Rs. 680', img: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=200&q=80' }
                            ].map((book, idx, arr) => (
                                <React.Fragment key={idx}>
                                    <div className="text-center w-1/3">
                                        <div className="h-20 w-16 mx-auto rounded border border-slate-200 overflow-hidden mb-1">
                                            <img src={book.img} alt={book.title} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-800 line-clamp-1">{book.title}</p>
                                        <p className="text-[10px] text-red-600 font-semibold">{book.price}</p>
                                    </div>
                                    {idx < arr.length - 1 && <span className="text-slate-400 font-bold">+</span>}
                                </React.Fragment>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                            <div>
                                <span className="text-slate-500">Total Price: </span>
                                <span className="font-bold text-red-600 text-sm">Rs. 2,050</span>
                            </div>
                            <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded transition-colors">
                                Add All to Cart
                            </button>
                        </div>
                    </div>
                </div>

                {/* You May Also Like */}
                <section className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-base text-slate-900">You May Also Like</h3>
                        <a href="#" className="text-xs text-blue-600 hover:underline">View All →</a>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                        {recommendedBooks.map((item, idx) => (
                            <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 relative group hover:shadow-md transition-shadow">
                                <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                    {item.discount}
                                </span>
                                <div className="h-40 rounded overflow-hidden bg-slate-100">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                </div>
                                <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{item.title}</h4>
                                <p className="text-[11px] text-slate-500 line-clamp-1">{item.author}</p>
                                <div className="flex items-center gap-1 text-[11px]">
                                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                                    <span className="font-medium">{item.rating}</span>
                                    <span className="text-slate-400">({item.reviews})</span>
                                </div>
                                <div className="flex items-baseline gap-1.5 text-xs">
                                    <span className="font-bold text-red-600">{item.price}</span>
                                    <span className="text-[10px] text-slate-400 line-through">{item.oldPrice}</span>
                                </div>
                                <button className="w-full py-1 text-xs border border-slate-300 rounded hover:bg-slate-900 hover:text-white transition-colors">
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Newsletter Subscription */}
                <div className="bg-slate-900 text-white rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h4 className="font-bold text-sm">Stay Updated with New Books & Offers</h4>
                        <p className="text-xs text-slate-400">Subscribe to our newsletter and get 10% OFF on your first order.</p>
                    </div>
                    <div className="flex w-full md:w-auto">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            className="px-3 py-2 text-xs rounded-l-md bg-white text-slate-800 focus:outline-none w-full md:w-64"
                        />
                        <button className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-semibold text-xs rounded-r-md transition-colors whitespace-nowrap">
                            Subscribe
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}