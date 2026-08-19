"use client"
import React, { useState } from 'react';
import Link from 'next/link'; // or use 'react-router-dom' depending on your routing setup
import TopHeader from '@/components/topHeader';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Search } from 'lucide-react';

// Sample publisher data matching your Nepsole store structure
const publishersData = [
    {
        id: 'fineprint',
        name: 'FinePrint Publications',
        tagline: 'Quality Books. Impactful Ideas.',
        location: 'Kathmandu, Nepal',
        estYear: 2012,
        booksCount: 248,
        authorsCount: 32,
        logo: 'https://placehold.co/100x100/0f172a/ffffff?text=fp',
        categories: ['Self Help', 'Biography', 'Novels'],
    },
    {
        id: 'nepal-ayaam',
        name: 'Nepal Book Depot',
        tagline: 'Preserving Literature & Heritage.',
        location: 'Lalitpur, Nepal',
        estYear: 2005,
        booksCount: 180,
        authorsCount: 24,
        logo: 'https://placehold.co/100x100/0f172a/ffffff?text=NBD',
        categories: ['History', 'Culture', 'Poetry'],
    },
    {
        id: 'sangrila-books',
        name: 'Sangrila Books',
        tagline: 'Stories that matter across generations.',
        location: 'Kathmandu, Nepal',
        estYear: 2015,
        booksCount: 135,
        authorsCount: 19,
        logo: 'https://placehold.co/100x100/0f172a/ffffff?text=SB',
        categories: ['Fiction', 'Essays', 'Drama'],
    },
    {
        id: 'ratna-pustak',
        name: 'Ratna Pustak Bhandar',
        tagline: 'Pioneering book publishing in Nepal.',
        location: 'Kathmandu, Nepal',
        estYear: 1946,
        booksCount: 420,
        authorsCount: 65,
        logo: 'https://placehold.co/100x100/0f172a/ffffff?text=RPB',
        categories: ['Textbooks', 'Academic', 'Literature'],
    },
];

const PublishersPage = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLetter, setSelectedLetter] = useState('All');

    // Filter publishers based on search and A-Z filter
    const filteredPublishers = publishersData.filter((pub) => {
        const matchesSearch = pub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pub.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLetter = selectedLetter === 'All' || pub.name.startsWith(selectedLetter);
        return matchesSearch && matchesLetter;
    });

    return (
        <div>
            <TopHeader />
            <Header />
            <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">

                {/* 🧭 Breadcrumb & Hero Banner */}
                <div className="bg-slate-900 text-white py-10 px-4 sm:px-8 border-b border-slate-800">
                    <div className="max-w-7xl mx-auto">
                        <nav className="text-xs text-slate-400 mb-3 flex items-center gap-2">
                            <span className="hover:text-amber-400 cursor-pointer">Home</span>
                            <span>/</span>
                            <span className="text-white font-medium">Publishers</span>
                        </nav>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                    Partner Book Publishers 📚
                                </h1>
                                <p className="text-sm text-slate-300 mt-1">
                                    Explore books from {publishersData.length} renowned local and international publishing houses.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPublishers.map((publisher) => (
                            <div
                                key={publisher.id}
                                className="bg-white rounded-xl border border-slate-200 hover:border-amber-400/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
                            >
                                <div className="p-5">
                                    {/* Top: Logo & Basic Info */}
                                    <div className="flex items-start gap-4">
                                        <img
                                            src={publisher.logo}
                                            alt={publisher.name}
                                            className="w-14 h-14 rounded-full border border-slate-200 object-cover shadow-sm bg-slate-50"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-base font-bold text-slate-900 truncate group-hover:text-amber-600 transition-colors">
                                                {publisher.name}
                                            </h2>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                📍 {publisher.location}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                Est. {publisher.estYear}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-600 italic mt-3 line-clamp-2">
                                        "{publisher.tagline}"
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-50 rounded-lg p-2.5 mt-4 border border-slate-100 text-center">
                                        <div>
                                            <span className="block text-xs font-bold text-slate-900">
                                                {publisher.booksCount}
                                            </span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                                                Books
                                            </span>
                                        </div>
                                        <div className="border-l border-slate-200">
                                            <span className="block text-xs font-bold text-slate-900">
                                                {publisher.authorsCount}
                                            </span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                                                Authors
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {publisher.categories.map((cat, idx) => (
                                            <span
                                                key={idx}
                                                className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full border border-slate-200"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="px-5 py-3 bg-slate-50/75 border-t border-slate-100 flex items-center justify-between">
                                    <Link href={`/publishers/${publisher.id}`}>
                                        <button className="text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-900 text-white w-full">
                                            Explore
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default PublishersPage;