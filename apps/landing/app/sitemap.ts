import { MetadataRoute } from 'next'

const locales = ['es', 'en']
const baseUrl = 'https://shopifree.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/blog', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.5, changeFrequency: 'yearly' as const },
  ]

  const sitemap: MetadataRoute.Sitemap = []
  const currentDate = new Date()

  locales.forEach(locale => {
    pages.forEach(page => {
      sitemap.push({
        url: `${baseUrl}/${locale}${page.path}`,
        lastModified: currentDate,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            es: `${baseUrl}/es${page.path}`,
            en: `${baseUrl}/en${page.path}`,
          },
        },
      })
    })
  })

  return sitemap
}
