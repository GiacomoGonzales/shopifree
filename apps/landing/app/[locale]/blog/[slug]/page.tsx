import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { getBlogPost, getBlogPosts } from '@/lib/blog'
import MDXContent from '@/components/blog/MDXContent'
import ShareButtons from '@/components/blog/ShareButtons'

interface PageProps {
  params: { locale: string; slug: string }
}

export async function generateStaticParams() {
  const locales = ['es', 'en']
  const paths = []

  for (const locale of locales) {
    const posts = await getBlogPosts(locale)
    for (const post of posts) {
      paths.push({ locale, slug: post.slug })
    }
  }

  return paths
}

export async function generateMetadata({ params: { locale, slug } }: PageProps): Promise<Metadata> {
  const post = await getBlogPost(slug, locale)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const baseUrl = 'https://shopifree.app'
  const url = `${baseUrl}/${locale}/blog/${slug}`

  return {
    title: post.title,
    description: post.description,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      images: [{
        url: `${baseUrl}${post.image}`,
        width: 1200,
        height: 630,
        alt: post.title,
      }],
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [`${baseUrl}${post.image}`],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function BlogPostPage({ params: { locale, slug } }: PageProps) {
  setRequestLocale(locale)

  const post = await getBlogPost(slug, locale)

  if (!post) {
    notFound()
  }

  const baseUrl = 'https://shopifree.app'
  const postUrl = `${baseUrl}/${locale}/blog/${slug}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href={`/${locale}`} className="transition-all duration-200 hover:scale-105">
              <Image
                src="/logo-primary.png"
                alt="Shopifree Logo"
                width={224}
                height={64}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="text-gray-300 hover:text-emerald-400 font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {locale === 'es' ? 'Volver al Blog' : 'Back to Blog'}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Link
              href={`/${locale}/blog?category=${encodeURIComponent(post.category)}`}
              className="inline-block bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium hover:bg-primary-200 transition-colors"
            >
              {post.category}
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <p className="text-xl text-gray-600 mb-8">
            {post.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">{post.author}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>

            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{post.readingTime}</span>
            </div>
          </div>

          <ShareButtons title={post.title} url={postUrl} locale={locale} />
        </div>
      </div>

      {/* Featured Image */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="relative h-96 w-full rounded-xl overflow-hidden shadow-2xl">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <MDXContent content={post.content} />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                {locale === 'es' ? 'Etiquetas:' : 'Tags:'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Again */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <ShareButtons title={post.title} url={postUrl} locale={locale} />
          </div>
        </div>
      </article>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.description,
            image: `${baseUrl}${post.image}`,
            datePublished: post.date,
            author: {
              '@type': 'Person',
              name: post.author,
            },
            publisher: {
              '@type': 'Organization',
              name: 'Shopifree',
              logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/logo-primary.png`,
              },
            },
          }),
        }}
      />
    </div>
  )
}
