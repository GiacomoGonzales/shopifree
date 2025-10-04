import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const baseUrl = 'https://shopifree.app'

  const titles = {
    es: 'Blog de Shopifree - Tips para tu Tienda Online',
    en: 'Shopifree Blog - Tips for Your Online Store'
  }

  const descriptions = {
    es: 'Aprende cómo crear, gestionar y hacer crecer tu tienda online con nuestros tutoriales, guías y consejos de expertos.',
    en: 'Learn how to create, manage and grow your online store with our tutorials, guides and expert advice.'
  }

  return {
    title: titles[locale as keyof typeof titles] || titles.es,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.es,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
      type: 'website',
      url: `${baseUrl}/${locale}/blog`,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
      languages: {
        'es': `${baseUrl}/es/blog`,
        'en': `${baseUrl}/en/blog`,
      },
    },
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
