import TopHeader from '@/components/topHeader'
import React from 'react'
import Headers from '@/components/header'
import Footer from '@/components/footer'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, BookOpen, FileText, ArrowRight } from 'lucide-react'

const authors = [
    {
        id: 1,
        name: 'Sangam Thapa',
        role: 'Frontend Developer',
        location: 'Kathmandu, Nepal',
        joined: 'Est. 2021',
        bio: '"Passionate developer sharing insights about technology, web development, and digital design."',
        image: '/images/authors/sangam.jpg',
        initials: 'ST',
        articles: 24,
        books: 5,
    },
    {
        id: 2,
        name: 'John Doe',
        role: 'Travel Writer',
        location: 'Lalitpur, Nepal',
        joined: 'Est. 2019',
        bio: '"Travel enthusiast sharing stories, guides, and cultural experiences from around the world."',
        image: '/images/authors/author-2.jpg',
        initials: 'JD',
        articles: 18,
        books: 3,
    },
    {
        id: 3,
        name: 'Sarah Wilson',
        role: 'Technology Writer',
        location: 'Kathmandu, Nepal',
        joined: 'Est. 2018',
        bio: '"Writing about emerging technologies, software architecture, and the future of digital tools."',
        image: '/images/authors/author-3.jpg',
        initials: 'SW',
        articles: 32,
        books: 8,
    },
    {
        id: 4,
        name: 'Michael Brown',
        role: 'Business Writer',
        location: 'Pokhara, Nepal',
        joined: 'Est. 2020',
        bio: '"Helping readers understand modern business, entrepreneurship, and productivity."',
        image: '/images/authors/author-4.jpg',
        initials: 'MB',
        articles: 15,
        books: 2,
    },
]

const Page = () => {
    return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 antialiased">
            <TopHeader />
            <Headers />

            <main className="flex-1 w-full">
                {/* Dark Hero Section matching the banner */}
                <section className="bg-[#0b1329] text-white py-12 md:py-16">
                    <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
                        {/* Breadcrumbs */}
                        <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                            <Link href="/" className="hover:text-white transition-colors">
                                Home
                            </Link>
                            <span>/</span>
                            <span className="text-white">Authors</span>
                        </div>

                        {/* Title & Subtitle */}
                        <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white flex items-center gap-3">
                            Featured Authors <span className="text-3xl sm:text-4xl">✍️</span>
                        </h1>
                        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl">
                            Explore insights and written works from our community of writers and industry specialists.
                        </p>
                    </div>
                </section>

                {/* Author Cards Grid */}
                <section className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8 py-10 sm:py-14">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {authors.map((author) => (
                            <div
                                key={author.id}
                                className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                            >
                                <div>
                                    {/* Header: Avatar/Badge + Info */}
                                    <div className="flex items-start gap-4">
                                        {/* Avatar / Initials badge */}
                                        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0f172a] text-lg font-bold text-white shadow-inner">
                                            {author.image ? (
                                                <Image
                                                    src={author.image}
                                                    alt={author.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                author.initials
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h2 className="truncate text-base font-bold text-slate-900 group-hover:text-primary transition-colors">
                                                {author.name}
                                            </h2>
                                            <div className="mt-0.5 flex items-center gap-1 text-xs text-rose-500 font-medium">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate text-slate-600">{author.location}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                                                {author.joined}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quote / Bio */}
                                    <p className="mt-4 text-xs italic leading-relaxed text-slate-600 line-clamp-2">
                                        {author.bio}
                                    </p>

                                    {/* Stats Grid */}
                                    <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-center border border-slate-100">
                                        <div className="border-r border-slate-200/80 pr-2">
                                            <div className="text-base font-bold text-slate-900">
                                                {author.articles}
                                            </div>
                                            <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                                                Articles
                                            </div>
                                        </div>
                                        <div className="pl-2">
                                            <div className="text-base font-bold text-slate-900">
                                                {author.books}
                                            </div>
                                            <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                                                Books
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Link */}
                                <div className="mt-5 pt-3">
                                    <Link
                                        href={`/authors/${author.id}`}
                                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-primary hover:border-slate-300"
                                    >
                                        View Details
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}

export default Page