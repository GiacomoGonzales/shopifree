import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'

const locales = ['en', 'es']

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  let messages
  try {
    messages = (await import(`../../messages/${locale}.json`)).default
  } catch {
    notFound()
  }

  const seo = messages.seo
  const baseUrl = 'https://shopifree.app'

  return {
    title: {
      default: seo.title,
      template: `%s | ${seo.siteName}`
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: 'Shopifree' }],
    creator: 'Shopifree',
    publisher: 'Shopifree',

    // Open Graph
    openGraph: {
      type: 'website',
      locale: locale,
      alternateLocale: locale === 'es' ? ['en'] : ['es'],
      url: `${baseUrl}/${locale}`,
      title: seo.title,
      description: seo.description,
      siteName: seo.siteName,
      images: [{
        url: `${baseUrl}${seo.ogImage}`,
        width: 1200,
        height: 630,
        alt: seo.siteName,
      }],
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [`${baseUrl}${seo.ogImage}`],
      creator: seo.twitterHandle,
    },

    // Alternates
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'es': `${baseUrl}/es`,
        'en': `${baseUrl}/en`,
        'x-default': `${baseUrl}/es`,
      },
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound()

  // Enable static rendering
  setRequestLocale(locale)

  let messages
  try {
    messages = (await import(`../../messages/${locale}.json`)).default
  } catch {
    messages = {}
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
} 