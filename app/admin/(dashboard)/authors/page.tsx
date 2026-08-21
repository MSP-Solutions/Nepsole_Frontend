"use client"
import React, { useState } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import AddAuthorDialog, { AuthorData } from '@/components/admin/AddAuthorDialog';

export interface Author {
    id: number;
    initials: string;
    avatarBg: string;
    name: string;
    englishName: string;
    genre: string;
    nationality: string;
    books: number | string;
    followers: string;
    awards: string[];
    status: string;
    profileImage?: string | null;
}

const authorsData: Author[] = [
    {
        id: 1,
        initials: 'LP',
        avatarBg: 'bg-slate-900 text-white',
        name: 'लक्ष्मीप्रसाद देवकोटा',
        englishName: 'Laxmi Prasad Devkota',
        genre: 'Poetry',
        nationality: 'Nepali',
        books: 24,
        followers: '12.4K',
        awards: ['Maha Kavi', 'Tribhuvan Pragya'],
        status: 'Active',
    },
    {
        id: 2,
        initials: 'BS',
        avatarBg: 'bg-slate-900 text-white',
        name: 'बालकृष्ण सम',
        englishName: 'Balkrishna Sama',
        genre: 'Drama',
        nationality: 'Nepali',
        books: 18,
        followers: '8.2K',
        awards: ['Tribhuvan Pragya'],
        status: 'Active',
    },
    {
        id: 3,
        initials: 'JC',
        avatarBg: 'bg-amber-500 text-white',
        name: 'James Clear',
        englishName: 'James Clear',
        genre: 'Self Help',
        nationality: 'American',
        books: 3,
        followers: '32.1K',
        awards: ['NYT Bestseller'],
        status: 'Active',
    },
    {
        id: 4,
        initials: 'PS',
        avatarBg: 'bg-amber-50 text-amber-600',
        name: 'पराग शर्मा',
        englishName: 'Parag Sharma',
        genre: 'Fiction',
        nationality: 'Nepali',
        books: 12,
        followers: '6.8K',
        awards: [],
        status: 'Active',
    },
    {
        id: 5,
        initials: 'MH',
        avatarBg: 'bg-slate-100 text-slate-400',
        name: 'Morgan Housel',
        englishName: 'Morgan Housel',
        genre: 'Finance',
        nationality: 'American',
        books: 2,
        followers: '28.5K',
        awards: ['NYT Bestseller'],
        status: 'Active',
    },
    {
        id: 6,
        initials: 'IP',
        avatarBg: 'bg-slate-900 text-white',
        name: 'Ishwor Poudel',
        englishName: 'Ishwor Poudel',
        genre: 'Poetry',
        nationality: 'Nepali',
        books: 9,
        followers: '4.1K',
        awards: [],
        status: 'Active',
    },
    {
        id: 7,
        initials: 'RK',
        avatarBg: 'bg-slate-900 text-white',
        name: 'Robert Kiyosaki',
        englishName: 'Robert Kiyosaki',
        genre: 'Finance',
        nationality: 'American',
        books: 15,
        followers: '55.2K',
        awards: ['NYT Bestseller'],
        status: 'Active',
    },
    {
        id: 8,
        initials: 'JS',
        avatarBg: 'bg-slate-900 text-white',
        name: 'Jay Shetty',
        englishName: 'Jay Shetty',
        genre: 'Self Help',
        nationality: 'British',
        books: 4,
        followers: '41.7K',
        awards: [],
        status: 'Active',
    },
    {
        id: 9,
        initials: 'CN',
        avatarBg: 'bg-amber-500 text-white',
        name: 'Cal Newport',
        englishName: 'Cal Newport',
        genre: 'Productivity',
        nationality: 'American',
        books: 7,
        followers: '19.3K',
        awards: [],
        status: 'Active',
    },
    {
        id: 10,
        initials: 'DL',
        avatarBg: 'bg-amber-50 text-amber-600',
        name: 'डा. लक्ष्मणप्रसाद उपाध्याय',
        englishName: 'Dr. Laxmanprasad Upadhyaya',
        genre: 'Biography',
        nationality: 'Nepali',
        books: 6,
        followers: '3.2K',
        awards: [],
        status: 'Active',
    },
    {
        id: 11,
        initials: 'SR',
        avatarBg: 'bg-slate-100 text-slate-400',
        name: 'Stephen R. Covey',
        englishName: 'Stephen R. Covey',
        genre: 'Self Help',
        nationality: 'American',
        books: 8,
        followers: '62.8K',
        awards: ['NYT Bestseller'],
        status: 'Active',
    },
    {
        id: 12,
        initials: 'NW',
        avatarBg: 'bg-slate-900 text-white',
        name: 'Narayan Wagle',
        englishName: 'Narayan Wagle',
        genre: 'Fiction',
        nationality: 'Nepali',
        books: 5,
        followers: '7.4K',
        awards: ['Madan Puraskar'],
        status: 'Active',
    },
    {
        id: 13,
        initials: 'YN',
        avatarBg: 'bg-slate-900 text-white',
        name: 'Yuval Noah Harari',
        englishName: 'Yuval Noah Harari',
        genre: 'History',
        nationality: 'Israeli',
        books: 4,
        followers: '88.3K',
        awards: ['NYT Bestseller'],
        status: 'Active',
    },
];

const Page = () => {
    const [authors, setAuthors] = useState<Author[]>(authorsData);
    const [search, setSearch] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const handleAddAuthor = (newAuthorData: AuthorData) => {
        const authorToAdd: Author = {
            id: newAuthorData.id || Date.now(),
            initials: newAuthorData.initials || 'AU',
            avatarBg: newAuthorData.avatarBg || 'bg-indigo-600 text-white',
            name: newAuthorData.name,
            englishName: newAuthorData.englishName || newAuthorData.name,
            genre: newAuthorData.genre || 'General',
            nationality: newAuthorData.nationality || 'Nepali',
            books: newAuthorData.books ?? 0,
            followers: newAuthorData.followers || '0',
            awards: newAuthorData.awards || [],
            status: newAuthorData.status || 'Active',
            profileImage: newAuthorData.profileImage || null,
        };
        setAuthors((prev) => [authorToAdd, ...prev]);
    };

    const filteredAuthors = authors.filter(
        (author) =>
            (author.name && author.name.toLowerCase().includes(search.toLowerCase())) ||
            (author.englishName && author.englishName.toLowerCase().includes(search.toLowerCase())) ||
            (author.genre && author.genre.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-[#f3f6fb] p-6 lg:p-10 font-sans text-slate-700">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Top Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Authors</h1>
                        <p className="text-sm text-slate-400 mt-0.5">
                            {authors.length} authors registered
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAddDialogOpen(true)}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        Add Author
                    </button>
                </div>

                <AddAuthorDialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                    onAddAuthor={handleAddAuthor}
                />

                {/* Table Container Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-6">
                    {/* Search Bar */}
                    <div className="relative max-w-sm">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search authors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#f8fafc] border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-500 border-collapse">
                            <thead>
                                <tr className="text-slate-400 font-medium">
                                    <th className="pb-4 font-normal">Name</th>
                                    <th className="pb-4 font-normal">English Name</th>
                                    <th className="pb-4 font-normal">Genre</th>
                                    <th className="pb-4 font-normal">Nationality</th>
                                    <th className="pb-4 font-normal">Books</th>
                                    <th className="pb-4 font-normal">Followers</th>
                                    <th className="pb-4 font-normal">Awards</th>
                                    <th className="pb-4 font-normal">Status</th>
                                    <th className="pb-4 font-normal text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAuthors.map((author) => (
                                    <tr key={author.id} className="hover:bg-slate-50/60 transition">
                                        {/* Name & Avatar */}
                                        <td className="py-3.5 pr-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {author.profileImage ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={author.profileImage}
                                                        alt={author.name}
                                                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                                                    />
                                                ) : (
                                                    <div
                                                        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${author.avatarBg || "bg-indigo-600 text-white"}`}
                                                    >
                                                        {author.initials}
                                                    </div>
                                                )}
                                                <span className="font-semibold text-slate-800 text-xs">
                                                    {author.name}
                                                </span>
                                            </div>
                                        </td>

                                        {/* English Name */}
                                        <td className="py-3.5 pr-4 text-slate-600 whitespace-nowrap">
                                            {author.englishName}
                                        </td>

                                        {/* Genre */}
                                        <td className="py-3.5 pr-4 whitespace-nowrap">
                                            <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-1 rounded-full font-medium">
                                                {author.genre}
                                            </span>
                                        </td>

                                        {/* Nationality */}
                                        <td className="py-3.5 pr-4 text-slate-600 whitespace-nowrap">
                                            {author.nationality}
                                        </td>

                                        {/* Books */}
                                        <td className="py-3.5 pr-4 font-bold text-indigo-600 whitespace-nowrap">
                                            {author.books}
                                        </td>

                                        {/* Followers */}
                                        <td className="py-3.5 pr-4 text-slate-600 whitespace-nowrap">
                                            {author.followers}
                                        </td>

                                        {/* Awards */}
                                        <td className="py-3.5 pr-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                {author.awards.map((award, index) => (
                                                    <span
                                                        key={index}
                                                        className="bg-amber-50 text-amber-700 border border-amber-200/60 text-[10px] px-2 py-0.5 rounded font-medium"
                                                    >
                                                        {award}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-3.5 pr-4 whitespace-nowrap">
                                            <span className="bg-emerald-50 text-emerald-600 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                                                {author.status}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 text-right whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2.5 text-slate-400">
                                                <button className="hover:text-slate-600 transition">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button className="hover:text-red-500 transition text-red-300">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page;