'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  ArrowRight,
  Lock,
  Clock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { PublicHeader } from '@/components/public/PublicHeader';
import { AuthInquiryModal } from '@/components/auth/AuthInquiryModal';
import { getClientSession, UserProfile } from '@/lib/user-auth';
import { BlogItem } from '@/components/public/HomepageSearchablePortal';

export default function BlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [session, setSession] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [targetBlogForAuth, setTargetBlogForAuth] = useState<BlogItem | null>(null);

  useEffect(() => {
    setSession(getClientSession());
    const onAuth = () => setSession(getClientSession());
    window.addEventListener('anv_auth_change', onAuth);
    return () => window.removeEventListener('anv_auth_change', onAuth);
  }, []);

  useEffect(() => {
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.blogs)) {
          setBlogs(data.blogs);
        }
      })
      .catch((err) => console.log('Error fetching blogs:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenBlog = (article: BlogItem) => {
    if (!session) {
      setTargetBlogForAuth(article);
      setAuthModalOpen(true);
      return;
    }
    router.push(`/blogs/${encodeURIComponent(article.id)}`);
  };

  const filteredBlogs = blogs.filter((b) => {
    const matchCategory =
      selectedCategory === 'All' ||
      b.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      !search.trim() ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase()) ||
      (b.locality && b.locality.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900">
      <PublicHeader />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition mb-4"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Real Estate Insights & Blogs
            </h1>
            <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
              Research reports, micro-market trends, legal RERA advisories, and Pune investment intelligence.
            </p>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="bg-white rounded-2xl border border-zinc-200/90 p-4 mb-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles by title, locality or topic..."
                className="w-full bg-zinc-50 border border-zinc-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-zinc-800 outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['All', 'Market Report', 'Buying Guide', 'Legal & RERA', 'Investment', 'Commercial'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-zinc-950 text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-600 hover:text-zinc-950'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="py-20 text-center text-zinc-400 font-semibold text-sm">
              Loading market intelligence articles...
            </div>
          ) : filteredBlogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredBlogs.map((article) => (
                <div
                  key={article.id}
                  onClick={() => handleOpenBlog(article)}
                  className="bg-white rounded-2xl shadow-xs border border-zinc-200 overflow-hidden group cursor-pointer hover:shadow-lg hover:-translate-y-1 transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 w-full overflow-hidden bg-zinc-900">
                      <Image
                        src={article.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                        alt={article.title}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-zinc-950/90 backdrop-blur-md text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm border border-amber-500/30">
                        {article.category}
                      </div>
                    </div>

                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                          <FileText className="w-3 h-3 text-amber-600" />
                          <span>
                            {article.connectedProperty
                              ? `Connected Product: ${article.connectedProperty}`
                              : `Connected: ${article.locality || 'Pune'} Market`}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>By {article.author || 'ANV Research'}</span>
                        <span>{article.readTime || '6 min read'}</span>
                      </div>

                      <h3 className="font-bold text-base text-zinc-950 group-hover:text-amber-800 transition leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                        {article.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-3 flex items-center justify-between gap-2 border-t border-zinc-100">
                    <span className="text-amber-800 group-hover:text-amber-950 text-xs font-bold flex items-center gap-1.5 group-hover:gap-2.5 transition-all uppercase tracking-wider">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>Read Full Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-200/80 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Patron Login
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-3xl border border-zinc-200 p-8">
              <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-zinc-900">No Articles Found</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Try searching with different terms or selecting another category.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Auth Modal for protected reading */}
      <AuthInquiryModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
        featureNotice={targetBlogForAuth ? `Sign in to access: ${targetBlogForAuth.title}` : 'Sign in to access market intelligence reports.'}
        onSuccess={() => {
          setAuthModalOpen(false);
          if (targetBlogForAuth) {
            router.push(`/blogs/${encodeURIComponent(targetBlogForAuth.id)}`);
          }
        }}
      />
    </div>
  );
}
