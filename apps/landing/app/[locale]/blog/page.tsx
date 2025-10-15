import { setRequestLocale } from 'next-intl/server'
import { getBlogPosts } from '@/lib/blog'
import BlogPageClient from './BlogPageClient'

interface PageProps {
  params: { locale: string }
  searchParams: { category?: string; search?: string }
}

export default async function BlogPage({ params: { locale }, searchParams }: PageProps) {
  setRequestLocale(locale)

  const posts = await getBlogPosts(locale)

  return <BlogPageClient posts={posts} locale={locale} searchParams={searchParams} />
}