import { Metadata } from 'next'

export async function generateMetadata({
  params: { locale }
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const baseUrl = 'https://shopifree.app'

  const titles = {
    es: 'Política de Privacidad - Shopifree',
    en: 'Privacy Policy - Shopifree'
  }

  const descriptions = {
    es: 'Lee nuestra política de privacidad para entender cómo protegemos tus datos en Shopifree.',
    en: 'Read our privacy policy to understand how we protect your data at Shopifree.'
  }

  return {
    title: titles[locale as keyof typeof titles] || titles.es,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.es,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.es,
      type: 'website',
      url: `${baseUrl}/${locale}/privacy`,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}/privacy`,
      languages: {
        'es': `${baseUrl}/es/privacy`,
        'en': `${baseUrl}/en/privacy`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
