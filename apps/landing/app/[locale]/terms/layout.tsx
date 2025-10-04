import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const baseUrl = 'https://shopifree.app'

  const titles = {
    es: 'Términos y Condiciones - Shopifree',
    en: 'Terms and Conditions - Shopifree'
  }

  const descriptions = {
    es: 'Lee nuestros términos y condiciones de uso de la plataforma Shopifree.',
    en: 'Read our terms and conditions of use of the Shopifree platform.'
  }

  return {
    title: titles[locale as keyof typeof titles] || titles.es,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.es,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
      type: 'website',
      url: `${baseUrl}/${locale}/terms`,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/terms`,
      languages: {
        'es': `${baseUrl}/es/terms`,
        'en': `${baseUrl}/en/terms`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
