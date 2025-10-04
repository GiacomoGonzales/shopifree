import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const baseUrl = 'https://shopifree.app'

  const titles = {
    es: 'Contacto - Shopifree | Soporte para tu Tienda Online',
    en: 'Contact - Shopifree | Support for Your Online Store'
  }

  const descriptions = {
    es: 'Contáctanos para resolver tus dudas sobre Shopifree. Equipo de soporte disponible para ayudarte con tu tienda online.',
    en: 'Contact us to resolve your questions about Shopifree. Support team available to help you with your online store.'
  }

  return {
    title: titles[locale as keyof typeof titles] || titles.es,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.es,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
      type: 'website',
      url: `${baseUrl}/${locale}/contact`,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/contact`,
      languages: {
        'es': `${baseUrl}/es/contact`,
        'en': `${baseUrl}/en/contact`,
      },
    },
  }
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
