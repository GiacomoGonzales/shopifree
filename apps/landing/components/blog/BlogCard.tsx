import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/lib/blog'

interface BlogCardProps {
  post: BlogPost
  locale: string
}

export default function BlogCard({ post, locale }: BlogCardProps) {
  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className="group block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
            {post.category}
          </span>
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span>·</span>
          <span>{post.readingTime}</span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
          {post.title}
        </h3>
        <p className="text-gray-600 mb-4 line-clamp-2">
          {post.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {post.author}
          </span>
          <span className="text-emerald-600 font-medium group-hover:gap-2 flex items-center transition-all">
            {locale === 'es' ? 'Leer más' : 'Read more'}
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
