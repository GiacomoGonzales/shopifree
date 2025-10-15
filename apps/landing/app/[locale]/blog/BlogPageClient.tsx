'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@shopifree/ui'
import LanguageSelector from '../../../components/LanguageSelector'
import BlogCard from '../../../components/blog/BlogCard'
import { BlogPost } from '@/lib/blog'
import { getCategories, filterPostsByCategory, searchPosts } from '@/lib/blog-utils'

interface BlogPageClientProps {
  posts: BlogPost[]
  locale: string
  searchParams: { category?: string; search?: string }
}

export default function BlogPageClient({ posts, locale, searchParams }: BlogPageClientProps) {
  const t = useTranslations('home')
  const tBlog = useTranslations('home.blog')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.search || '')

  const categories = useMemo(() => getCategories(posts), [posts])

  const filteredPosts = useMemo(() => {
    let result = posts
    if (selectedCategory) {
      result = filterPostsByCategory(result, selectedCategory)
    }
    if (searchQuery) {
      result = searchPosts(result, searchQuery)
    }
    return result
  }, [posts, selectedCategory, searchQuery])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href={`/${locale}`} className="transition-all duration-200 hover:scale-105">
                <Image
                  src="/logo-primary.png"
                  alt="Shopifree Logo"
                  width={224}
                  height={64}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href={`/${locale}#features`} className="text-gray-300 hover:text-emerald-400 transition-colors">
                {t('nav.features')}
              </Link>
              <Link href={`/${locale}#pricing`} className="text-gray-300 hover:text-emerald-400 transition-colors">
                {t('nav.pricing')}
              </Link>
              <Link href={`/${locale}/blog`} className="text-emerald-400 font-medium">
                {t('nav.blog')}
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Desktop Navigation & Login */}
              <a href={`https://dashboard.shopifree.app/${locale}/login`} className="hidden md:block">
                <Button variant="secondary" size="sm" className="bg-white hover:bg-gray-100 text-gray-900">
                  {t('login')}
                </Button>
              </a>
              <div className="hidden md:block">
                <LanguageSelector />
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-800 focus:outline-none transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-6 w-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                      className="animate-pulse"
                    />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden bg-gray-800 border-t border-gray-700 shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 py-4 space-y-4">
            <Link
              href={`/${locale}#features`}
              className="block text-gray-300 hover:text-emerald-400 py-2 transition-colors duration-200 transform hover:translate-x-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.features')}
            </Link>
            <Link
              href={`/${locale}#pricing`}
              className="block text-gray-300 hover:text-emerald-400 py-2 transition-colors duration-200 transform hover:translate-x-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.pricing')}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="block text-emerald-400 font-medium py-2 transition-colors duration-200 transform hover:translate-x-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t('nav.blog')}
            </Link>

            <div className="border-t border-gray-700 pt-4 space-y-4">
              <a href={`https://dashboard.shopifree.app/${locale}/login`} className="block">
                <Button variant="secondary" size="sm" className="w-full bg-white hover:bg-gray-100 text-gray-900 transition-all duration-200 hover:scale-105">
                  {t('login')}
                </Button>
              </a>
              <div className="flex justify-center">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Blog Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {tBlog('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {tBlog('subtitle')}
          </p>
        </div>

        {posts.length === 0 ? (
          /* Coming Soon Message */
          <div className="text-center bg-white rounded-lg shadow-sm p-12">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {tBlog('comingSoon')}
              </h3>
              <p className="text-gray-600 mb-8">
                {tBlog('comingSoonDescription')}
              </p>
              <Link href={`/${locale}`}>
                <Button>
                  {tBlog('backToHome')}
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === ''
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {locale === 'es' ? 'Todos' : 'All'}
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder={locale === 'es' ? 'Buscar...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Posts Grid */}
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  {locale === 'es' ? 'No se encontraron artículos.' : 'No articles found.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.slug} post={post} locale={locale} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
